import Database from 'better-sqlite3';
const db = new Database('server/database.db');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      telegramId TEXT PRIMARY KEY,
      username TEXT,
      wbc_balance INTEGER DEFAULT 0,
      energy INTEGER DEFAULT 100,
      lastEnergyUpdate INTEGER DEFAULT 0
    )
  `);
}

export default db;
