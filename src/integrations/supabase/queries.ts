import { supabase } from "@/integrations/supabase/client";

export type Category = {
  id: string;
  slug: string;
  label: string;
  sort_order: number;
  is_active: boolean;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  category_id: string | null;
  author_id: string | null;
  status: "draft" | "published";
  is_trending: boolean;
  views_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  categories?: { slug: string; label: string } | null;
  profiles?: { display_name: string | null } | null;
};

export type BreakingNews = {
  id: string;
  headline: string;
  is_active: boolean;
  sort_order: number;
};

export type SiteSettings = {
  id: number;
  site_name: string;
  logo_url: string | null;
  tagline: string | null;
};

const ARTICLE_SELECT =
  "id,slug,title,excerpt,content,cover_image,category_id,author_id,status,is_trending,views_count,published_at,created_at,updated_at,categories(slug,label),profiles(display_name)";

export async function fetchActiveCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function fetchAllCategories() {
  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function fetchPublishedArticles(limit = 60) {
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as Article[];
}

export async function fetchArticlesByCategory(slug: string) {
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as Article[]).filter((a) => a.categories?.slug === slug);
}

export async function fetchArticleBySlug(slug: string) {
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as Article | null;
}

export async function fetchActiveBreakingNews() {
  const { data, error } = await supabase
    .from("breaking_news")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as BreakingNews[];
}

export async function fetchAllBreakingNews() {
  const { data, error } = await supabase.from("breaking_news").select("*").order("sort_order");
  if (error) throw error;
  return (data ?? []) as BreakingNews[];
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  return (
    (data as SiteSettings | null) ?? {
      id: 1,
      site_name: "Lintas Poin",
      logo_url: null,
      tagline: "Portal Berita Terkini Indonesia",
    }
  );
}

export async function incrementArticleView(articleId: string) {
  await supabase.rpc("increment_article_view", { _article_id: articleId });
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}
