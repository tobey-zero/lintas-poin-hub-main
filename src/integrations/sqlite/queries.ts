import { getDb } from './client';
import { v4 as uuidv4 } from 'uuid';

// ============ Types ============
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
  status: 'draft' | 'published';
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

// ============ Categories ============
export function fetchActiveCategories(): Category[] {
  const db = getDb();
  const stmt = db.prepare(
    'SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order'
  );
  return stmt.all() as Category[];
}

export function fetchAllCategories(): Category[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM categories ORDER BY sort_order');
  return stmt.all() as Category[];
}

export function fetchCategoryBySlug(slug: string): Category | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM categories WHERE slug = ?');
  return (stmt.get(slug) as Category) || null;
}

export function createCategory(data: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Category {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(
    'INSERT INTO categories (id, slug, label, sort_order, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  
  stmt.run(id, data.slug, data.label, data.sort_order, data.is_active ? 1 : 0, now, now);
  return { id, ...data, created_at: now, updated_at: now };
}

export function updateCategory(id: string, data: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>): Category | null {
  const db = getDb();
  const now = new Date().toISOString();
  
  const updates: string[] = [];
  const values: any[] = [];
  
  if (data.slug !== undefined) {
    updates.push('slug = ?');
    values.push(data.slug);
  }
  if (data.label !== undefined) {
    updates.push('label = ?');
    values.push(data.label);
  }
  if (data.sort_order !== undefined) {
    updates.push('sort_order = ?');
    values.push(data.sort_order);
  }
  if (data.is_active !== undefined) {
    updates.push('is_active = ?');
    values.push(data.is_active ? 1 : 0);
  }
  
  updates.push('updated_at = ?');
  values.push(now);
  values.push(id);
  
  const stmt = db.prepare(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`);
  stmt.run(...values);
  
  return fetchCategoryById(id);
}

export function fetchCategoryById(id: string): Category | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM categories WHERE id = ?');
  return (stmt.get(id) as Category) || null;
}

export function deleteCategory(id: string): boolean {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
  const info = stmt.run(id);
  return info.changes > 0;
}

// ============ Articles ============
export function fetchPublishedArticles(limit = 60): Article[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT 
      a.*,
      c.slug as 'categories.slug',
      c.label as 'categories.label',
      p.display_name as 'profiles.display_name'
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN profiles p ON a.author_id = p.id
    WHERE a.status = 'published'
    ORDER BY a.published_at DESC
    LIMIT ?
  `);
  
  return formatArticles(stmt.all(limit) as any[]);
}

export function fetchArticlesByCategory(slug: string): Article[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT 
      a.*,
      c.slug as 'categories.slug',
      c.label as 'categories.label',
      p.display_name as 'profiles.display_name'
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN profiles p ON a.author_id = p.id
    WHERE a.status = 'published' AND c.slug = ?
    ORDER BY a.published_at DESC
  `);
  
  return formatArticles(stmt.all(slug) as any[]);
}

export function fetchArticleBySlug(slug: string): Article | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT 
      a.*,
      c.slug as 'categories.slug',
      c.label as 'categories.label',
      p.display_name as 'profiles.display_name'
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN profiles p ON a.author_id = p.id
    WHERE a.slug = ?
    LIMIT 1
  `);
  
  const row = stmt.get(slug) as any;
  if (!row) return null;
  
  return formatArticles([row])[0] || null;
}

export function fetchArticleById(id: string): Article | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT 
      a.*,
      c.slug as 'categories.slug',
      c.label as 'categories.label',
      p.display_name as 'profiles.display_name'
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN profiles p ON a.author_id = p.id
    WHERE a.id = ?
    LIMIT 1
  `);
  
  const row = stmt.get(id) as any;
  if (!row) return null;
  
  return formatArticles([row])[0] || null;
}

export function createArticle(data: Omit<Article, 'id' | 'views_count' | 'created_at' | 'updated_at'>): Article {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO articles (
      id, slug, title, excerpt, content, cover_image, category_id, author_id,
      status, is_trending, views_count, published_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id, data.slug, data.title, data.excerpt, data.content, data.cover_image,
    data.category_id, data.author_id, data.status, data.is_trending ? 1 : 0,
    0, data.published_at, now, now
  );
  
  return fetchArticleById(id)!;
}

export function updateArticle(id: string, data: Partial<Omit<Article, 'id' | 'views_count' | 'created_at' | 'updated_at'>>): Article | null {
  const db = getDb();
  const now = new Date().toISOString();
  
  const updates: string[] = [];
  const values: any[] = [];
  
  const fields: (keyof typeof data)[] = ['slug', 'title', 'excerpt', 'content', 'cover_image', 'category_id', 'author_id', 'status', 'is_trending', 'published_at'];
  
  for (const field of fields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = ?`);
      if (field === 'is_trending') {
        values.push((data[field] as boolean) ? 1 : 0);
      } else {
        values.push(data[field]);
      }
    }
  }
  
  updates.push('updated_at = ?');
  values.push(now);
  values.push(id);
  
  const stmt = db.prepare(`UPDATE articles SET ${updates.join(', ')} WHERE id = ?`);
  stmt.run(...values);
  
  return fetchArticleById(id);
}

export function deleteArticle(id: string): boolean {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM articles WHERE id = ?');
  const info = stmt.run(id);
  return info.changes > 0;
}

export function fetchAllArticles(limit = 100): Article[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT 
      a.*,
      c.slug as 'categories.slug',
      c.label as 'categories.label',
      p.display_name as 'profiles.display_name'
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN profiles p ON a.author_id = p.id
    ORDER BY a.created_at DESC
    LIMIT ?
  `);
  
  return formatArticles(stmt.all(limit) as any[]);
}

// ============ Breaking News ============
export function fetchActiveBreakingNews(): BreakingNews[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM breaking_news 
    WHERE is_active = 1 
    ORDER BY sort_order
  `);
  return stmt.all() as BreakingNews[];
}

export function fetchAllBreakingNews(): BreakingNews[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM breaking_news ORDER BY sort_order');
  return stmt.all() as BreakingNews[];
}

export function createBreakingNews(data: Omit<BreakingNews, 'id'>): BreakingNews {
  const db = getDb();
  const id = uuidv4();
  
  const stmt = db.prepare(`
    INSERT INTO breaking_news (id, headline, is_active, sort_order)
    VALUES (?, ?, ?, ?)
  `);
  
  stmt.run(id, data.headline, data.is_active ? 1 : 0, data.sort_order);
  
  return { id, ...data };
}

export function updateBreakingNews(id: string, data: Partial<Omit<BreakingNews, 'id'>>): BreakingNews | null {
  const db = getDb();
  
  const updates: string[] = [];
  const values: any[] = [];
  
  if (data.headline !== undefined) {
    updates.push('headline = ?');
    values.push(data.headline);
  }
  if (data.is_active !== undefined) {
    updates.push('is_active = ?');
    values.push(data.is_active ? 1 : 0);
  }
  if (data.sort_order !== undefined) {
    updates.push('sort_order = ?');
    values.push(data.sort_order);
  }
  
  values.push(id);
  
  const stmt = db.prepare(`UPDATE breaking_news SET ${updates.join(', ')} WHERE id = ?`);
  stmt.run(...values);
  
  const getStmt = db.prepare('SELECT * FROM breaking_news WHERE id = ?');
  return (getStmt.get(id) as BreakingNews) || null;
}

export function deleteBreakingNews(id: string): boolean {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM breaking_news WHERE id = ?');
  const info = stmt.run(id);
  return info.changes > 0;
}

// ============ Site Settings ============
export function fetchSiteSettings(): SiteSettings {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM site_settings WHERE id = 1');
  
  const settings = stmt.get() as SiteSettings | undefined;
  
  return settings || {
    id: 1,
    site_name: 'Lintas Poin',
    logo_url: null,
    tagline: 'Portal Berita Terkini Indonesia',
  };
}

export function updateSiteSettings(data: Partial<Omit<SiteSettings, 'id'>>): SiteSettings {
  const db = getDb();
  const now = new Date().toISOString();
  
  const updates: string[] = [];
  const values: any[] = [];
  
  if (data.site_name !== undefined) {
    updates.push('site_name = ?');
    values.push(data.site_name);
  }
  if (data.logo_url !== undefined) {
    updates.push('logo_url = ?');
    values.push(data.logo_url);
  }
  if (data.tagline !== undefined) {
    updates.push('tagline = ?');
    values.push(data.tagline);
  }
  
  updates.push('updated_at = ?');
  values.push(now);
  
  const stmt = db.prepare(`UPDATE site_settings SET ${updates.join(', ')} WHERE id = 1`);
  stmt.run(...values);
  
  return fetchSiteSettings();
}

// ============ Article Views ============
export function incrementArticleView(articleId: string): void {
  const db = getDb();
  const id = uuidv4();
  
  // Insert view record
  const insertStmt = db.prepare(`
    INSERT INTO article_views (id, article_id, viewed_at)
    VALUES (?, ?, ?)
  `);
  insertStmt.run(id, articleId, new Date().toISOString());
  
  // Update article views count
  const updateStmt = db.prepare(`
    UPDATE articles 
    SET views_count = views_count + 1 
    WHERE id = ? AND status = 'published'
  `);
  updateStmt.run(articleId);
}

// ============ Utilities ============
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

// ============ Helper Functions ============
function formatArticles(rows: any[]): Article[] {
  return rows.map(row => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    cover_image: row.cover_image,
    category_id: row.category_id,
    author_id: row.author_id,
    status: row.status as 'draft' | 'published',
    is_trending: Boolean(row.is_trending),
    views_count: row.views_count,
    published_at: row.published_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    categories: row['categories.slug'] ? {
      slug: row['categories.slug'],
      label: row['categories.label'],
    } : null,
    profiles: row['profiles.display_name'] ? {
      display_name: row['profiles.display_name'],
    } : null,
  }));
}
