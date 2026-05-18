import Database from 'better-sqlite3';
const db = new Database('server/database.db');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      telegramId TEXT PRIMARY KEY,
      username TEXT,
      wbc_balance INTEGER DEFAULT 0,
      balance INTEGER DEFAULT 0,
      ton_balance REAL DEFAULT 0,
      energy INTEGER DEFAULT 100,
      lastTap INTEGER DEFAULT 0,
      lastEnergyUpdate INTEGER DEFAULT 0,
      rank_id INTEGER DEFAULT 1,
      rank_expires_at INTEGER DEFAULT 0,
      taps_total INTEGER DEFAULT 0,
      ads_total INTEGER DEFAULT 0,
      draw_score_cached REAL DEFAULT 0,
      public_nickname TEXT,
      last_fragment_date INTEGER DEFAULT 0,
      photo_url TEXT,
      createdAt INTEGER DEFAULT 0,
      updatedAt INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS draw_rounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      status TEXT DEFAULT 'active',
      createdAt INTEGER,
      closedAt INTEGER,
      prize_pool_ton REAL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS draw_user_stats (
      draw_id INTEGER,
      telegramId TEXT,
      taps_round INTEGER DEFAULT 0,
      ads_round INTEGER DEFAULT 0,
      refs_round INTEGER DEFAULT 0,
      donation_ton_round REAL DEFAULT 0,
      stars_round INTEGER DEFAULT 0,
      entries INTEGER DEFAULT 0,
      eligible INTEGER DEFAULT 0,
      score_cached REAL DEFAULT 0,
      createdAt INTEGER DEFAULT 0,
      updatedAt INTEGER DEFAULT 0,
      PRIMARY KEY (draw_id, telegramId)
    );
    CREATE TABLE IF NOT EXISTS draw_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      draw_id INTEGER,
      telegramId TEXT,
      entries INTEGER DEFAULT 0,
      createdAt INTEGER
    );
    CREATE TABLE IF NOT EXISTS contracts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegramId TEXT NOT NULL,
      layer INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      reward INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      result_type TEXT,
      startedAt INTEGER NOT NULL,
      endsAt INTEGER NOT NULL,
      adBoost INTEGER DEFAULT 0,
      fragments_earned INTEGER DEFAULT 0,
      last_boost_at INTEGER DEFAULT 0,
      createdAt INTEGER,
      updatedAt INTEGER
    );
  `);
  const active = db.prepare("SELECT id FROM draw_rounds WHERE status = 'active' LIMIT 1").get();
  if (!active) {
    db.prepare("INSERT INTO draw_rounds (status, createdAt) VALUES ('active', ?)").run(Date.now());
  }
}

export default db;
