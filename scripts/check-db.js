#!/usr/bin/env node

/**
 * Database Schema Verification
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const dbPath = path.join(projectRoot, 'data', 'app.db');

try {
  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');

  console.log('📊 Database Tables & Structure:\n');

  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `).all();

  for (const table of tables) {
    const info = db.prepare(`PRAGMA table_info(${table.name})`).all();
    const count = db.prepare(`SELECT COUNT(*) as cnt FROM ${table.name}`).get();
    
    console.log(`\n🗂️  ${table.name} [${count.cnt} rows]`);
    console.log('   Columns:');
    
    for (const col of info) {
      const pk = col.pk ? ' [PK]' : '';
      const notnull = col.notnull ? ' NOT NULL' : '';
      console.log(`     • ${col.name}: ${col.type}${notnull}${pk}`);
    }
  }

  console.log('\n✅ Database verification complete!\n');
  db.close();
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
