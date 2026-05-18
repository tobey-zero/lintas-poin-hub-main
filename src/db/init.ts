import { initializeDatabase } from '@/integrations/sqlite';

/**
 * Initialize SQLite database on app startup
 * Call this in your root route or server entry point
 */
export async function initDB() {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export default initDB;
