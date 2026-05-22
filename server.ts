import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { GAME_CONFIG } from "./server/config/game.js";
import * as path from 'path';
import cors from 'cors';
import crypto from 'crypto';
import db, { initDb } from './server/db.js';
import { getRewardForRank } from './server/services/ranks.js';
import { recalcDrawScore, getActiveDrawId } from './server/services/draw.js';
import {
  generateUniqueAutoNickname,
  isNicknameValid,
  nicknameExists,
  normalizeNickname
} from './server/services/nickname.js';

// Инициализируем базу данных
initDb();

const app = express();
const PORT = 3001;

const NICKNAME_RENAME_PRICE_WBC = 250000;
const NICKNAME_RENAME_PRICE_STARS = 50;

// Полностью открываем CORS для стабильной работы внутри Telegram WebApp
app.use(cors({
  origin: '*',
  credentials: false
}));

app.use(express.json());

// Железная валидация Telegram initData через BOT_TOKEN
function parseTgInitData(initDataStr: string) {
  if (!initDataStr) return null;
  try {
    const params = new URLSearchParams(initDataStr);
    const hash = params.get('hash');
    const userRaw = params.get('user');
    const startParam = params.get('start_param') || null;

    if (!hash || !userRaw) return null;

    const token = process.env.BOT_TOKEN;
    if (!token) {
      console.error("⚠️ КРИТИЧЕСКАЯ ОШИБКА: BOT_TOKEN не задан в .env");
      return null;
    }

    const arr: string[] = [];
    params.forEach((val, key) => {
      if (key !== 'hash') {
        arr.push(`${key}=${val}`);
      }
    });
    arr.sort();
    const dataCheckString = arr.join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (calculatedHash !== hash) {
      console.warn("🚨 Попытка авторизации с неверным Hash!");
      return null;
    }

    const user = JSON.parse(userRaw);
    return {
      id: String(user.id),
      username: user.username || "anon_hacker",
      referrerId: startParam ? String(startParam) : null
    };
  } catch (e) {
    console.error("InitData parse error:", e);
    return null;
  }
}

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

// 1. РОУТ АВТОРИЗАЦИИ
app.post('/api/user', (req: any, res: any) => {
  try {
    const { initData, photo_url } = req.body;
    const tgUser = parseTgInitData(initData);
    if (!tgUser) {
      return res.status(400).json({ error: "Invalid or missing initData" });
    }
    
    const telegramId = tgUser.id;
    const username = tgUser.username;
    const referrerId = tgUser.referrerId;
    const now = Date.now();
    const drawId = getActiveDrawId();

    let drawStats = db.prepare("SELECT * FROM draw_user_stats WHERE draw_id = ? AND telegramId = ?").get(drawId, telegramId);
    if (!drawStats) {
      db.prepare(`INSERT INTO draw_user_stats (draw_id, telegramId, taps_round, createdAt, updatedAt)
                  VALUES (?, ?, 0, ?, ?)`).run(drawId, telegramId, now, now);
    }

    let user = db.prepare('SELECT * FROM users WHERE telegramId = ?').get(telegramId) as any;
    if (!user) {
      const generatedNickname = generateUniqueAutoNickname(telegramId);
      db.prepare(`
        INSERT INTO users (
          telegramId, username, public_nickname, photo_url, wbc_balance,
          energy, lastEnergyUpdate, referrer_id, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, 0, 100, ?, ?, ?, ?)
      `).run(telegramId, username, generatedNickname, photo_url || null, now, referrerId, now, now);
      user = db.prepare('SELECT * FROM users WHERE telegramId = ?').get(telegramId);
    } else {
      if (photo_url && photo_url !== user.photo_url) {
        db.prepare('UPDATE users SET photo_url = ?, updatedAt = ? WHERE telegramId = ?')
          .run(photo_url, now, telegramId);
        user.photo_url = photo_url;
      }
    }

    user = regenEnergy(user);
    db.prepare('UPDATE users SET energy = ?, lastEnergyUpdate = ? WHERE telegramId = ?')
      .run(user.energy, user.lastEnergyUpdate, telegramId);

    const liveScore = recalcDrawScore(telegramId);
    res.json({ ...user, live_score: liveScore, current_round: drawId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

// 2. РОУТ ТАПОВ
app.post('/api/tap', (req: any, res: any) => {
  try {
    const { initData, count } = req.body;
    const tgUser = parseTgInitData(initData);
    if (!tgUser) {
      return res.status(400).json({ error: "Invalid initData" });
    }
    const telegramId = tgUser.id;
    const tapCount = Math.min(count || 1, 100);

    let user = db.prepare('SELECT * FROM users WHERE telegramId = ?').get(telegramId) as any;
    if (!user) return res.status(404).json({ error: 'user not found' });

    user = regenEnergy(user);
    if (user.energy < tapCount) return res.status(400).json({ error: 'insufficient energy' });

    const now = Date.now();
    const drawId = getActiveDrawId();
    const newEnergy = user.energy - tapCount;
    const newTapsTotal = (user.taps_total || 0) + tapCount;
    const coinsPerTap = GAME_CONFIG.RANK_REWARDS[user.rank_id as keyof typeof GAME_CONFIG.RANK_REWARDS] || 10;
    const wbcEarned = tapCount * coinsPerTap;
    const newWbcBalance = (user.wbc_balance || 0) + wbcEarned;

    db.prepare("UPDATE users SET energy = ?, taps_total = ?, lastEnergyUpdate = ?, updatedAt = ? WHERE telegramId = ?")
      .run(newEnergy, newTapsTotal, user.lastEnergyUpdate, now, telegramId);

    db.prepare("UPDATE draw_user_stats SET taps_round = taps_round + ?, updatedAt = ? WHERE draw_id = ? AND telegramId = ?")
      .run(tapCount, now, drawId, telegramId);

    const liveScore = recalcDrawScore(telegramId);

    res.json({ 
      ...user, 
      energy: newEnergy, 
      taps_total: newTapsTotal, 
      live_score: liveScore 
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

// 3. РОУТ СМЕНЫ НИКНЕЙМА
app.post('/api/user/nickname', (req: any, res: any) => {
  try {
    const { initData, requested, requestedMode } = req.body;
    const tgUser = parseTgInitData(initData);
    if (!tgUser) {
      return res.status(400).json({ success: false, error: 'invalid_auth' });
    }
    const telegramId = tgUser.id;
    const normalized = normalizeNickname(requested);

    if (!isNicknameValid(normalized)) {
      return res.status(400).json({ success: false, error: 'nickname_invalid' });
    }
    if (nicknameExists(normalized, telegramId)) {
      return res.status(400).json({ success: false, error: 'nickname_taken' });
    }

    let user = db.prepare('SELECT * FROM users WHERE telegramId = ?').get(telegramId) as any;
    if (!user) return res.status(404).json({ success: false, error: 'user_not_found' });

    const currentNickname = normalizeNickname(user.public_nickname || '');
    if (normalized === currentNickname) {
      return res.status(400).json({ success: false, error: 'nickname_same' });
    }

    const freeUsedAlready = Number(user.nickname_free_used || 0) === 1;
    const now = Date.now();

    if (!freeUsedAlready) {
      db.prepare(`
        UPDATE users
        SET public_nickname = ?, nickname_manual = 1, nickname_free_used = 1, nickname_updatedAt = ?, updatedAt = ?
        WHERE telegramId = ?
      `).run(normalized, now, now, telegramId);
      return res.json({
        success: true,
        public_nickname: normalized,
        nickname_free_used: 1,
        mode: 'free'
      });
    }

    if (requestedMode === 'stars') {
      return res.json({
        success: true,
        requires_payment: true,
        payment_type: 'stars',
        amount: NICKNAME_RENAME_PRICE_STARS,
        pending_nickname: normalized
      });
    } else {
      let currentBalance = Number(user.wbc_balance || 0);
      if (currentBalance < NICKNAME_RENAME_PRICE_WBC) {
        return res.status(400).json({ success: false, error: 'nickname_no_wbc' });
      }
      const nextBalance = currentBalance - NICKNAME_RENAME_PRICE_WBC;
      db.prepare(`
        UPDATE users
        SET public_nickname = ?, nickname_manual = 1, nickname_updatedAt = ?, wbc_balance = ?, updatedAt = ?
        WHERE telegramId = ?
      `).run(normalized, now, nextBalance, now, telegramId);
      return res.json({
        success: true,
        public_nickname: normalized,
        nickname_free_used: 1,
        mode: 'wbc',
        wbc_balance: nextBalance
      });
    }
  } catch (e) {
    console.error('Nickname change error:', e);
    return res.status(500).json({ success: false, error: 'server_error' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
