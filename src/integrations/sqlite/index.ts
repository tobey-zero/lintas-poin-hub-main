// Re-export dari sqlite integration
export { 
  getDb, 
  setDb, 
  closeDb, 
  initializeDatabase,
  prepare,
  exec,
  transaction,
  type Database
} from './client';

export * from './queries';
