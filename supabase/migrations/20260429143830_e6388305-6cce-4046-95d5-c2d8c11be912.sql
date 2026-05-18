
-- ============ ROLES ============
create type public.app_role as enum ('admin', 'editor', 'user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role in ('admin','editor')
  )
$$;

-- Trigger: create profile + first user becomes admin, others 'user'
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_count int;
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));

  select count(*) into user_count from auth.users;
  if user_count <= 1 then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'user');
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============ CATEGORIES ============
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.categories enable row level security;
create trigger categories_updated before update on public.categories
  for each row execute function public.set_updated_at();

-- ============ ARTICLES ============
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null default '',
  cover_image text,
  category_id uuid references public.categories(id) on delete set null,
  author_id uuid references auth.users(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','published')),
  is_trending boolean not null default false,
  views_count int not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.articles enable row level security;
create index articles_status_published_idx on public.articles(status, published_at desc);
create index articles_category_idx on public.articles(category_id);
create trigger articles_updated before update on public.articles
  for each row execute function public.set_updated_at();

-- ============ BREAKING NEWS ============
create table public.breaking_news (
  id uuid primary key default gen_random_uuid(),
  headline text not null,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.breaking_news enable row level security;

-- ============ ARTICLE VIEWS ============
create table public.article_views (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  viewed_at timestamptz not null default now()
);
alter table public.article_views enable row level security;
create index article_views_article_idx on public.article_views(article_id);

-- Atomic increment RPC (public; counts views on published articles)
create or replace function public.increment_article_view(_article_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.article_views(article_id) values (_article_id);
  update public.articles set views_count = views_count + 1 where id = _article_id and status = 'published';
end;
$$;

-- ============ RLS POLICIES ============

-- profiles
create policy "Profiles viewable by all" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- user_roles
create policy "Roles readable by self or admin" on public.user_roles for select
  using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "Admins manage roles" on public.user_roles for all
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- categories
create policy "Active categories public" on public.categories for select using (is_active or public.is_staff(auth.uid()));
create policy "Staff manage categories" on public.categories for all
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- articles
create policy "Published articles public" on public.articles for select
  using (status = 'published' or public.is_staff(auth.uid()));
create policy "Staff insert articles" on public.articles for insert
  with check (public.is_staff(auth.uid()));
create policy "Staff update articles" on public.articles for update
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "Staff delete articles" on public.articles for delete
  using (public.is_staff(auth.uid()));

-- breaking_news
create policy "Active breaking news public" on public.breaking_news for select
  using (is_active or public.is_staff(auth.uid()));
create policy "Staff manage breaking news" on public.breaking_news for all
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- article_views
create policy "Anyone can insert view" on public.article_views for insert with check (true);
create policy "Staff read views" on public.article_views for select using (public.is_staff(auth.uid()));

-- ============ STORAGE ============
insert into storage.buckets (id, name, public) values ('article-images','article-images', true);

create policy "Public read article images" on storage.objects for select using (bucket_id = 'article-images');
create policy "Staff upload article images" on storage.objects for insert
  with check (bucket_id = 'article-images' and public.is_staff(auth.uid()));
create policy "Staff update article images" on storage.objects for update
  using (bucket_id = 'article-images' and public.is_staff(auth.uid()));
create policy "Staff delete article images" on storage.objects for delete
  using (bucket_id = 'article-images' and public.is_staff(auth.uid()));

-- ============ SEED ============
insert into public.categories (slug, label, sort_order) values
  ('news','News',1),('finance','Finance',2),('sport','Sport',3),('sepakbola','Sepakbola',4),
  ('otomotif','Otomotif',5),('tekno','Tekno',6),('hiburan','Hiburan',7),('lifestyle','Lifestyle',8),
  ('travel','Travel',9),('food','Food',10),('health','Health',11);

insert into public.breaking_news (headline, sort_order) values
  ('Selamat datang di Lintas Poin — portal berita terkini Indonesia', 1);
