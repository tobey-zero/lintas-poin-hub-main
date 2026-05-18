# SQLite Integration Guide

## Quick Start

### 1. Initialize Database
```bash
npm run db:init
```

This creates `data/app.db` with:
- 7 tables (schema)
- 11 default categories
- 1 breaking news item
- 1 site settings entry

### 2. Start Development Server
```bash
npm run dev
```

Server runs on **http://localhost:3002** (or next available port)

## Using Database Queries

### In Route Files

```typescript
// Example: src/routes/index.tsx
import { getPublishedArticles, getBreakingNews } from '@/integrations/sqlite/queries'

export const Route = createFileRoute('/')({
  async component() {
    const articles = await getPublishedArticles()
    const breaking = await getBreakingNews()
    
    return (
      <SiteLayout>
        <BreakingNewsBanner news={breaking} />
        <ArticleGrid articles={articles} />
      </SiteLayout>
    )
  }
})
```

### Available Query Functions

**Articles:**
```typescript
fetchPublishedArticles()              // All published articles
fetchArticleBySlug(slug)              // Single article by slug
fetchArticleById(id)                  // Single article by ID
createArticle(data)                   // Create new article
updateArticle(id, data)               // Update article
deleteArticle(id)                     // Delete article
incrementArticleView(articleId)       // Track views
```

**Categories:**
```typescript
getAllCategories()                    // All categories
getCategoriesByIds(ids)               // Filter by ID list
createCategory(data)                  // Create category
updateCategory(id, data)              // Update category
deleteCategory(id)                    // Delete category
```

**Breaking News:**
```typescript
getBreakingNews()                     // Active breaking news
getAllBreakingNews()                  // All breaking news (including inactive)
createBreakingNews(data)              // Create breaking news
updateBreakingNews(id, data)          // Update breaking news
deleteBreakingNews(id)                // Delete breaking news
```

**Site Settings:**
```typescript
getSiteSettings()                     // Get site name, logo, tagline
updateSiteSettings(data)              // Update site branding
```

## Database Structure

### Categories Table
```typescript
interface Category {
  id: string                          // UUID
  slug: string                        // URL-safe slug ('tech', 'sports', etc.)
  label: string                       // Display name ('Technology', 'Sports', etc.)
  sort_order: number                  // Order in navigation (0, 1, 2, ...)
  is_active: boolean                  // Show in UI?
  created_at: string                  // ISO timestamp
  updated_at: string                  // ISO timestamp
}
```

### Articles Table
```typescript
interface Article {
  id: string                          // UUID
  slug: string                        // URL-safe slug
  title: string                       // Article title
  excerpt: string | null              // Summary/preview text
  content: string                     // Full article HTML/markdown
  cover_image: string | null          // Image URL
  category_id: string | null          // Links to categories
  author_id: string | null            // Links to profiles (Supabase user)
  status: 'draft' | 'published'       // Publish status
  is_trending: boolean                // Show as trending?
  views_count: number                 // View counter
  published_at: string | null         // Publication timestamp
  created_at: string                  // ISO timestamp
  updated_at: string                  // ISO timestamp
}
```

### Breaking News Table
```typescript
interface BreakingNews {
  id: string                          // UUID
  headline: string                    // Breaking news text
  is_active: boolean                  // Currently showing?
  sort_order: number                  // Display priority
  created_at: string                  // ISO timestamp
}
```

### Site Settings Table
```typescript
interface SiteSettings {
  id: number                          // Always 1 (single row)
  site_name: string                   // "Lintas Poin"
  logo_url: string | null             // Logo image URL
  tagline: string | null              // Site tagline
  updated_at: string                  // ISO timestamp
}
```

## Creating Articles

### Via Admin Dashboard
1. Go to `/admin/articles`
2. Click "Create Article"
3. Fill form:
   - Title
   - Category (dropdown from categories table)
   - Excerpt
   - Content (rich editor)
   - Cover image (upload to Supabase)
4. Save as Draft or Publish

### Programmatically
```typescript
import { createArticle } from '@/integrations/sqlite/queries'

const article = await createArticle({
  title: 'Breaking News Title',
  slug: 'breaking-news-title',
  excerpt: 'Short summary...',
  content: 'Full article content...',
  category_id: 'tech-id',
  author_id: 'user-uuid-from-supabase',
  status: 'published',
  cover_image: 'https://images.unsplash.com/...',
  is_trending: true
})
```

## API Structure

### Server Actions
Query functions are in `src/integrations/sqlite/queries.ts` and can be called from:
- Route loaders (async)
- Server actions
- API endpoints

### Example Server Action
```typescript
// src/server/articles.ts
'use server'

import { createArticle } from '@/integrations/sqlite/queries'

export async function createArticleAction(formData: FormData) {
  try {
    const article = await createArticle({
      title: formData.get('title'),
      slug: formData.get('slug'),
      content: formData.get('content'),
      // ... more fields
    })
    return { success: true, article }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

## Debugging

### View Database Content
```bash
# Check database structure
node scripts/check-db.js

# Test all queries
node scripts/test-queries.js

# Direct SQL query (if sqlite3 CLI installed)
sqlite3 data/app.db ".tables"
sqlite3 data/app.db "SELECT COUNT(*) FROM articles"
```

### Common Issues

**"no such table: articles"**
- Database not initialized
- Run: `npm run db:init`

**Query returns empty results**
- Check data exists: `node scripts/check-db.js`
- Verify schema: `sqlite3 data/app.db ".schema articles"`

**UUID errors**
- Ensure uuid package installed: `npm install uuid`
- Check imports use `uuid.v4()` not `crypto.randomUUID()`

## Performance Notes

- Queries use prepared statements (safe from SQL injection)
- Indexes on commonly filtered columns (status, category, published_at)
- Foreign keys enabled for data integrity
- All timestamps stored as ISO 8601 strings

## Next: Migrate to Production

When ready for production (Cloudflare D1):

1. Export SQLite database as SQL dump
2. Import to Cloudflare D1
3. Update connection string in `src/integrations/sqlite/client.ts`
4. Test with D1 database

```bash
# Export local database
sqlite3 data/app.db ".dump" > backup.sql

# Deploy to D1
wrangler d1 execute [database-id] --remote < backup.sql
```

---

**Database Layer: Production Ready** ✅
