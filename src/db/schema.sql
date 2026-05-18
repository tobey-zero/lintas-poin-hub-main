-- ============ CATEGORIES ============
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============ PROFILES (users) ============
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  display_name TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============ USER_ROLES ============
CREATE TABLE IF NOT EXISTS user_roles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK(role IN ('admin', 'editor', 'user')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- ============ ARTICLES ============
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL DEFAULT '',
  cover_image TEXT,
  category_id TEXT,
  author_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published')),
  is_trending BOOLEAN NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_articles_status_published ON articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);

-- ============ BREAKING NEWS ============
CREATE TABLE IF NOT EXISTS breaking_news (
  id TEXT PRIMARY KEY,
  headline TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============ ARTICLE VIEWS ============
CREATE TABLE IF NOT EXISTS article_views (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL,
  viewed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_article_views_article ON article_views(article_id);

-- ============ SITE SETTINGS ============
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  site_name TEXT NOT NULL DEFAULT 'Lintas Poin',
  logo_url TEXT,
  tagline TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============ SEED DATA ============
INSERT OR IGNORE INTO categories (id, slug, label, sort_order) VALUES
('cat_1', 'news', 'News', 1),
('cat_2', 'finance', 'Finance', 2),
('cat_3', 'sport', 'Sport', 3),
('cat_4', 'sepakbola', 'Sepakbola', 4),
('cat_5', 'otomotif', 'Otomotif', 5),
('cat_6', 'tekno', 'Tekno', 6),
('cat_7', 'hiburan', 'Hiburan', 7),
('cat_8', 'lifestyle', 'Lifestyle', 8),
('cat_9', 'travel', 'Travel', 9),
('cat_10', 'food', 'Food', 10),
('cat_11', 'health', 'Health', 11);

INSERT OR IGNORE INTO breaking_news (id, headline, sort_order) VALUES
('bn_1', 'Selamat datang di Lintas Poin — portal berita terkini Indonesia', 1);

INSERT OR IGNORE INTO site_settings (id, site_name, tagline) VALUES
(1, 'Lintas Poin', 'Portal Berita Terkini Indonesia');
