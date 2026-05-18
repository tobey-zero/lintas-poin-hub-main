
create table public.site_settings (
  id int primary key default 1,
  site_name text not null default 'Lintas Poin',
  logo_url text,
  tagline text,
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1)
);
alter table public.site_settings enable row level security;

create policy "Site settings public read" on public.site_settings for select using (true);
create policy "Staff update site settings" on public.site_settings for update
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "Staff insert site settings" on public.site_settings for insert
  with check (public.is_staff(auth.uid()));

insert into public.site_settings (id, site_name, tagline) values (1, 'Lintas Poin', 'Portal Berita Terkini Indonesia');

insert into storage.buckets (id, name, public) values ('site-assets','site-assets', true);
create policy "Public read site assets" on storage.objects for select using (bucket_id = 'site-assets');
create policy "Staff upload site assets" on storage.objects for insert
  with check (bucket_id = 'site-assets' and public.is_staff(auth.uid()));
create policy "Staff update site assets" on storage.objects for update
  using (bucket_id = 'site-assets' and public.is_staff(auth.uid()));
create policy "Staff delete site assets" on storage.objects for delete
  using (bucket_id = 'site-assets' and public.is_staff(auth.uid()));
