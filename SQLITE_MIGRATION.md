# SQLite Migration Guide - Lintas Poin

Dokumentasi lengkap untuk migrasi dari Supabase ke SQLite.

## 📋 Status Migrasi

✅ Database schema dibuat untuk SQLite
✅ Semua Supabase imports diupdate ke SQLite
✅ SQLite queries dan client dibuat
✅ Server actions dibuat untuk mutations
❌ **SETUP MASIH DIPERLUKAN** - ikuti langkah di bawah

## ⚡ Quick Start (Development)

### 1. Install Dependencies

```bash
# Install better-sqlite3 (untuk Node.js/local development)
npm install better-sqlite3

# Atau dengan bun jika menggunakan bun
bun install better-sqlite3
```

### 2. Setup Environment Variables

Buat file `.env.local` di root project:

```env
# Database path untuk local development
DATABASE_PATH=./data/app.db

# Optional: untuk production dengan Cloudflare D1
# CLOUDFLARE_D1_DATABASE_ID=your_d1_database_id
```

### 3. Initialize Database

Database akan otomatis diinisialisasi pada app startup. Untuk manual init, jalankan:

```bash
node -e "require('./src/db/init').default()" 
```

Atau dari TypeScript:

```bash
npx ts-node -e "import('./src/db/init').then(m => m.default())"
```

### 4. Seeding Data (Optional)

Data default sudah ada di `src/db/schema.sql`:
- 11 categories (News, Finance, Sport, Tekno, dll)
- 1 breaking news entry
- Site settings default

## 📁 Struktur Files

```
src/
├── db/
│   ├── schema.sql              # Database schema
│   └── init.ts                 # Database initialization
├── integrations/
│   ├── sqlite/
│   │   ├── client.ts           # SQLite client & connection
│   │   ├── queries.ts          # Semua database queries
│   │   └── index.ts            # Exports
│   ├── supabase/               # (deprecated) - bisa dihapus nanti
└── server/
    ├── articles.ts             # Server actions untuk articles
    ├── categories.ts           # Server actions untuk categories
    └── settings.ts             # Server actions untuk settings
```

## 📸 File Upload / Media Handling

⚠️ **TODO**: File uploads masih reference Supabase storage di admin routes.

Opsi untuk file handling:

**Option 1: External URL (Recommended untuk dev)**
```typescript
// User input cover image URL langsung
setCoverImage('https://example.com/image.jpg');
```

**Option 2: Keep Supabase Storage**
Update admin routes untuk gunakan Supabase storage bucket (tetap gunakan Supabase hanya untuk file storage, SQLite untuk data).

**Option 3: Local File Storage**
Implement server-side file storage dengan multipart form uploads.

For now: To quickly test, use external image URLs. Update file uploads later sesuai requirements Anda.

## 🔧 Konfigurasi

### Development (Local SQLite)

File `src/integrations/sqlite/client.ts` sudah configured untuk:
- File-based SQLite database di `./data/app.db`
- Foreign key constraints enabled
- Row level security patterns (tidak native SQLite tapi pattern-based)

### Production (Cloudflare D1)

Untuk production dengan Cloudflare Workers, gunakan Cloudflare D1:

1. Setup D1 database:
   ```bash
   wrangler d1 create lintas-poin
   ```

2. Update `src/integrations/sqlite/client.ts` untuk gunakan D1 client

3. Deploy:
   ```bash
   npm run build
   bun run build
   ```

## 🚀 Untuk Admin Operations

Admin mutations sekarang menggunakan server actions:

```typescript
import { createArticleAction, updateArticleAction } from '@/server/articles';

// Create article
const article = await createArticleAction({
  slug: 'my-article',
  title: 'Article Title',
  content: 'Content here',
  // ... other fields
});

// Update article
const updated = await updateArticleAction(articleId, {
  title: 'Updated Title'
});
```

## 📊 Database Operations

### Reading Data

```typescript
import { 
  fetchPublishedArticles, 
  fetchActiveCategories,
  fetchArticleBySlug 
} from '@/integrations/sqlite';

// Semua query functions sudah available dan work dengan SQLite
const articles = fetchPublishedArticles(60);
const categories = fetchActiveCategories();
```

### Writing Data (Server-side)

```typescript
import { createArticle, updateArticle, deleteArticle } from '@/integrations/sqlite';

// Create
const article = createArticle({
  slug: 'article-slug',
  title: 'Article Title',
  content: 'Article content',
  // ...
});

// Update
const updated = updateArticle(articleId, {
  title: 'New Title'
});

// Delete
deleteArticle(articleId);
```

## 🔐 Authentication & Authorization

⚠️ **TODO**: SQLite migration belum include authentication/authorization logic dari Supabase.

Current status:
- `useAuth` hook masih reference Supabase
- User roles/ permissions belum dimigrasi
- Recommend untuk handle authentication terpisah (contoh: JWT tokens, session management)

Untuk production, consider:
1. Keep Supabase Auth, gunakan SQLite untuk data
2. Atau migrate ke auth solution lain (AuthJS, Clerk, etc)

## 📝 TODO Checklist

- [ ] Install better-sqlite3
- [ ] Setup .env.local dengan DATABASE_PATH
- [ ] Test database initialization
- [ ] Update useAuth hook untuk non-Supabase (optional)
- [ ] Test admin mutations
- [ ] Setup production D1 database jika deploy ke Cloudflare
- [ ] Remove old Supabase files (optional cleanup):
  - `src/integrations/supabase/` (after confirming no dependencies)
  - `supabase/` folder (migration files no longer needed)

## 🐛 Troubleshooting

### Error: "Database not initialized"
- Pastikan `initializeDatabase()` dipanggil sebelum queries
- Check apakah DATABASE_PATH environment variable set

### Error: "better-sqlite3 not installed"
```bash
npm install better-sqlite3
```

### Database file tidak tercreate
- Check `data/` folder exists atau create manually
- Check file permissions di working directory

### Foreign key constraint errors
- Foreign keys sudah enabled di client.ts
- Pastikan referensi data ada sebelum insert (contoh: category_id valid)

## 🔄 Migration dari Supabase ke SQLite

Jika ada existing data di Supabase:

1. Export data dari Supabase (CSV, JSON)
2. Create script untuk import ke SQLite
3. Run seed script sebelum production

Contoh export query:
```sql
-- Dari Supabase
SELECT * FROM articles;
SELECT * FROM categories;
SELECT * FROM breaking_news;
```

## 📚 Resources

- SQLite Docs: https://www.sqlite.org/docs.html
- better-sqlite3: https://github.com/WiseLibs/better-sqlite3
- Cloudflare D1: https://developers.cloudflare.com/d1/
- TanStack Start: https://tanstack.com/router/latest

## ❓ Pertanyaan?

Lihat file-file di `src/integrations/sqlite/` untuk detail implementasi.
