import * as dotenv from 'dotenv';
dotenv.config();
import * as express from 'express';
import * as cors from 'cors';
import db, { initDb } from './server/db';
import { getRewardForRank } from './server/services/ranks';

initDb();
const app = express.default();
const PORT = parseInt(process.env.PORT || '3000');

app.use(cors.default());
app.use(express.json());

// Простейший /api/user для теста
app.post('/api/user', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE telegramId = ?').get('7614360974') || { wbc_balance: 0 };
  res.json({ ...user, live_score: 100 });
});

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
