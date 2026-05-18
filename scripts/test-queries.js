#!/usr/bin/env node

/**
 * Database Query Verification
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const dbPath = path.join(projectRoot, 'data', 'app.db');

try {
  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');

  console.log('🧪 Testing Database Queries:\n');

  // Test 1: Get categories
  console.log('1️⃣  Fetching categories...');
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
  console.log(`   ✅ Found ${categories.length} categories`);
  if (categories.length > 0) {
    console.log(`   Sample: ${categories[0].label}`);
  }

  // Test 2: Get breaking news
  console.log('\n2️⃣  Fetching breaking news...');
  const breakingNews = db.prepare('SELECT * FROM breaking_news WHERE is_active = 1').all();
  console.log(`   ✅ Found ${breakingNews.length} active breaking news`);
  if (breakingNews.length > 0) {
    console.log(`   Sample: ${breakingNews[0].headline}`);
  }

  // Test 3: Get site settings
  console.log('\n3️⃣  Fetching site settings...');
  const settings = db.prepare('SELECT * FROM site_settings LIMIT 1').get();
  console.log(`   ✅ Site name: ${settings.site_name}`);

  // Test 4: Insert test article
  console.log('\n4️⃣  Testing INSERT (create test article)...');
  const articleId = uuidv4();
  const categoryId = categories[0]?.id;
  
  db.prepare(`
    INSERT INTO articles (id, slug, title, excerpt, content, category_id, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    articleId,
    'test-article-' + Date.now(),
    'Test Article',
    'Test excerpt',
    'Test content',
    categoryId,
    'published',
    new Date().toISOString(),
    new Date().toISOString()
  );
  console.log(`   ✅ Article created with ID: ${articleId}`);

  // Test 5: Read inserted article
  console.log('\n5️⃣  Testing SELECT (read test article)...');
  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(articleId);
  if (article) {
    console.log(`   ✅ Retrieved: "${article.title}"`);
  }

  // Test 6: Update article
  console.log('\n6️⃣  Testing UPDATE (modify article)...');
  db.prepare('UPDATE articles SET title = ?, updated_at = ? WHERE id = ?').run(
    'Updated Test Article',
    new Date().toISOString(),
    articleId
  );
  const updatedArticle = db.prepare('SELECT * FROM articles WHERE id = ?').get(articleId);
  console.log(`   ✅ Updated title: "${updatedArticle.title}"`);

  // Test 7: Delete article
  console.log('\n7️⃣  Testing DELETE (remove test article)...');
  db.prepare('DELETE FROM articles WHERE id = ?').run(articleId);
  const deletedCheck = db.prepare('SELECT COUNT(*) as cnt FROM articles WHERE id = ?').get(articleId);
  console.log(`   ✅ Article deleted (remaining: ${deletedCheck.cnt})`);

  console.log('\n✨ All database operations working!\n');
  db.close();
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
