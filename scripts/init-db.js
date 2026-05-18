#!/usr/bin/env node

/**
 * Database Initialization Script
 * Run this once to setup SQLite database
 * 
 * Usage: node scripts/init-db.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

async function initDb() {
  try {
    console.log('🚀 Initializing SQLite database...\n');

    // Check if better-sqlite3 is installed
    let Database;
    try {
      const sqlite3 = await import('better-sqlite3');
      Database = sqlite3.default;
    } catch (error) {
      console.error('❌ Error: better-sqlite3 is not installed.');
      console.log('\n   Install it with:');
      console.log('   yarn add better-sqlite3');
      console.log('   npm install better-sqlite3');
      console.log('   bun add better-sqlite3\n');
      process.exit(1);
    }

    // Create data directory if it doesn't exist
    const dataDir = path.join(projectRoot, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('📁 Created data directory:', dataDir);
    }

    // Open/create database
    const dbPath = path.join(dataDir, 'app.db');
    const db = new Database(dbPath);
    console.log('📦 Database file:', dbPath);

    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    console.log('🔑 Foreign keys enabled');

    // Read and execute schema
    const schemaPath = path.join(projectRoot, 'src', 'db', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }

    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Parse statements more carefully
    const statements = [];
    let currentStatement = '';
    
    for (const line of schema.split('\n')) {
      const trimmed = line.trim();
      
      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith('--')) {
        continue;
      }
      
      currentStatement += ' ' + line;
      
      // If line ends with semicolon, we have a complete statement
      if (trimmed.endsWith(';')) {
        const stmt = currentStatement.trim();
        if (stmt.length > 0) {
          statements.push(stmt.slice(0, -1)); // Remove trailing semicolon
        }
        currentStatement = '';
      }
    }

    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

    let count = 0;
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      try {
        db.exec(statement);
        count++;
      } catch (error) {
        console.warn(`⚠️  Warning on statement ${i + 1}:`, error.message);
      }
    }

    console.log(`\n✅ Database initialized successfully!`);
    console.log(`📊 Executed ${count}/${statements.length} SQL statements`);
    console.log(`\n📋 Default data seeded:`);
    
    // Show stats
    const categories = db.prepare('SELECT COUNT(*) as count FROM categories').get();
    const articles = db.prepare('SELECT COUNT(*) as count FROM articles').get();
    const breakingNews = db.prepare('SELECT COUNT(*) as count FROM breaking_news').get();

    console.log(`   • ${categories.count} categories`);
    console.log(`   • ${articles.count} articles`);
    console.log(`   • ${breakingNews.count} breaking news`);

    db.close();
    console.log('\n✨ Ready to use!\n');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    console.error(error);
    process.exit(1);
  }
}

initDb();
