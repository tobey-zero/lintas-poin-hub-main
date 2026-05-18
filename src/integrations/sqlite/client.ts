import type Database from 'better-sqlite3';

// Singleton instance untuk SQLite database
let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

export function setDb(database: Database.Database): void {
  db = database;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Initialize SQLite database from schema file
 * Should be called once on app startup (server-side)
 */
export async function initializeDatabase(): Promise<Database.Database> {
  if (db) return db;

  try {
    // Dynamic import untuk better-sqlite3 (hanya di Node.js)
    const sqlite3 = await import('better-sqlite3').catch(() => null);
    
    if (!sqlite3) {
      throw new Error(
        'better-sqlite3 not installed. Run: npm install better-sqlite3'
      );
    }

    const Database = sqlite3.default;
    
    // Buat/buka database file
    const dbPath = process.env.DATABASE_PATH || './data/app.db';
    db = new Database(dbPath);

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Read dan execute schema
    const fs = await import('fs').then(m => m.promises);
    const path = await import('path').then(m => m.default);
    
    const schemaPath = path.join(process.cwd(), 'src', 'db', 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf-8');
    
    // Split dan execute SQL statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      db.exec(statement);
    }

    console.log('✓ SQLite database initialized:', dbPath);
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Prepare statement untuk reusable queries
 */
export function prepare(sql: string) {
  return getDb().prepare(sql);
}

/**
 * Execute single query
 */
export function exec(sql: string) {
  return getDb().exec(sql);
}

/**
 * Run transaction
 */
export function transaction<T>(fn: () => T): T {
  return getDb().transaction(fn)();
}
