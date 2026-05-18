import * as dotenv from 'dotenv';
dotenv.config();
import * as express from 'express';
import * as path from 'path';
import * as cors from 'cors';
import db, { initDb } from './server/db';
import { getRewardForRank } from './server/services/ranks';
import { recalcDrawScore, getActiveDrawId } from './server/services/draw';

initDb();
const app = express.default();
const PORT = parseInt(process.env.PORT || '3000');

app.use(cors.default({
  origin: [
    'http://localhost:5173',
    'http://75.119.147.2:5173',
    'https://vityacorn26-sys.github.io',
    'https://vityacorn26-sys.github.io/wallbreaker-v2'
  ],
  credentials: true
}));
app.use(express.json());

function regenEnergy(user: any) {
  const now = Date.now();
  const lastUpdate = user.lastEnergyUpdate || now;
  const diffSec = Math.floor((now - lastUpdate) / 1000);
  const regen = Math.floor(diffSec / 30);
  if (regen > 0) {
    user.energy = Math.min(100, user.energy + regen);
    user.lastEnergyUpdate = lastUpdate + regen * 30 * 1000;
  }
  return user;
}

app.post('/api/user', (req, res) => {
  try {
    const initData = req.body?.initData || '';
    const telegramId = '7614360974';
    let user = db.prepare('SELECT * FROM users WHERE telegramId = ?').get(telegramId) as any;
    if (!user) {
      const now = Date.now();
      db.prepare(`INSERT INTO users (telegramId, username, wbc_balance, energy, lastEnergyUpdate, createdAt, updatedAt)
                  VALUES (?, ?, 0, ?, ?, ?, ?)`).run(telegramId, 'dev_user', 100, now, now, now);
      user = db.prepare('SELECT * FROM users WHERE telegramId = ?').get(telegramId);
    }
    user = regenEnergy(user);
    db.prepare('UPDATE users SET energy = ?, lastEnergyUpdate = ? WHERE telegramId = ?')
      .run(user.energy, user.lastEnergyUpdate, telegramId);
    const liveScore = recalcDrawScore(telegramId);
    res.json({ ...user, live_score: liveScore });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

app.post('/api/tap', (req, res) => {
  try {
    const telegramId = '7614360974';
    const count = Math.min(req.body?.count || 1, 100);
    let user = db.prepare('SELECT * FROM users WHERE telegramId = ?').get(telegramId) as any;
    if (!user) return res.status(404).json({ error: 'user not found' });
    user = regenEnergy(user);
    db.prepare('UPDATE users SET energy = ?, lastEnergyUpdate = ? WHERE telegramId = ?')
      .run(user.energy, user.lastEnergyUpdate, telegramId);
    if (user.energy < count) return res.status(400).json({ error: 'insufficient energy' });
    const rewardPerTap = getRewardForRank(user.rank_id);
    const totalReward = rewardPerTap * count;
    const newEnergy = user.energy - count;
    const now = Date.now();
    const drawId = getActiveDrawId();
    db.prepare(`UPDATE users SET wbc_balance = wbc_balance + ?, energy = ?, lastTap = ?, updatedAt = ? WHERE telegramId = ?`)
      .run(totalReward, newEnergy, now, now, telegramId);
    if (drawId) {
      const stats = db.prepare(`SELECT 1 FROM draw_user_stats WHERE draw_id = ? AND telegramId = ?`).get(drawId, telegramId);
      if (stats) {
        db.prepare(`UPDATE draw_user_stats SET taps_round = taps_round + ?, updatedAt = ? WHERE draw_id = ? AND telegramId = ?`)
          .run(count, now, drawId, telegramId);
      } else {
        db.prepare(`INSERT INTO draw_user_stats (draw_id, telegramId, taps_round, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`)
          .run(drawId, telegramId, count, now, now);
      }
    }
    const liveScore = recalcDrawScore(telegramId);
    const updatedUser = db.prepare('SELECT wbc_balance, energy FROM users WHERE telegramId = ?').get(telegramId);
    res.json({ success: true, balance: updatedUser.wbc_balance, energy: updatedUser.energy, live_score: liveScore });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'tap failed' });
  }
});

const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
