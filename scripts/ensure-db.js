#!/usr/bin/env node

/**
 * Ensure Database Exists
 * This script checks if database file exists, and initializes if needed
 * Runs automatically before dev/build to prevent "no such table" errors
 * 
 * Usage: node scripts/ensure-db.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const dbPath = path.join(projectRoot, 'data', 'app.db');

try {
  if (fs.existsSync(dbPath)) {
    console.log('✅ Database already exists at', dbPath);
    process.exit(0);
  }

  console.log('🚀 Database not found, initializing...');
  console.log('📍 Location:', dbPath);
  console.log('');

  // Run npm run db:init
  execSync('npm run db:init', {
    cwd: projectRoot,
    stdio: 'inherit'
  });

  console.log('\n✨ Database auto-initialized successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Error during database initialization:', error.message);
  process.exit(1);
}
