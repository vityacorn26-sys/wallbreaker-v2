import db from '../db.js';

export function getActiveDrawId(): number {
  const row = db.prepare("SELECT id FROM draw_rounds WHERE status = 'active' ORDER BY id DESC LIMIT 1").get() as any;
  if (!row) {
    const now = Date.now();
    const result = db.prepare("INSERT INTO draw_rounds (status, createdAt) VALUES ('active', ?)").run(now);
    return Number(result.lastInsertRowid);
  }
  return row.id;
}

export function recalcDrawScore(telegramId: string): number {
  const drawId = getActiveDrawId();
  let stats = db.prepare("SELECT * FROM draw_user_stats WHERE draw_id = ? AND telegramId = ?").get(drawId, telegramId) as any;
  if (!stats) {
    const now = Date.now();
    db.prepare(`INSERT INTO draw_user_stats (draw_id, telegramId, taps_round, ads_round, refs_round, donation_ton_round, stars_round, entries, eligible, createdAt, updatedAt)
                VALUES (?, ?, 0, 0, 0, 0, 0, 0, 0, ?, ?)`).run(drawId, telegramId, now, now);
    stats = db.prepare("SELECT * FROM draw_user_stats WHERE draw_id = ? AND telegramId = ?").get(drawId, telegramId);
  }
  const entry = db.prepare("SELECT entries FROM draw_entries WHERE draw_id = ? AND telegramId = ?").get(drawId, telegramId) as any;
  const keyCount = entry?.entries || 0;
  const K = keyCount >= 2 ? 1.3636 : 1.0;
  const score = 100 * K;
  db.prepare("UPDATE draw_user_stats SET score_cached = ?, updatedAt = ? WHERE draw_id = ? AND telegramId = ?")
    .run(score, Date.now(), drawId, telegramId);
  db.prepare("UPDATE users SET draw_score_cached = ?, updatedAt = ? WHERE telegramId = ?")
    .run(score, Date.now(), telegramId);
  return score;
}

export function getTopCandidates(limit: number) {
  const drawId = getActiveDrawId();
  return db.prepare(`
    SELECT u.username, u.public_nickname, u.draw_score_cached as score,
           (SELECT entries FROM draw_entries WHERE draw_id = ? AND telegramId = u.telegramId) as key_count
    FROM users u
    JOIN draw_user_stats s ON u.telegramId = s.telegramId
    WHERE s.draw_id = ?
    ORDER BY u.draw_score_cached DESC
    LIMIT ?
  `).all(drawId, drawId, limit);
}
