import * as crypto from 'crypto';
import db from '../db.js';

export const NICK_FIRST_PARTS = `
Alex Adrian Aiden Arin Axel Blaze Cairo Dante Devin Elias Felix Gage Hugo Ivar Jax Kai Leon Luca Milan Nico Orion Pax Quentin Rafael Roman Theo Viktor Zane
Aria Astra Ayla Bella Cora Elara Freya Iris Kaia Kara Luna Lyra Maia Mira Nadia Nika Nova Rhea Talia Vera Yuna Zara Selene Skye Nyra Vika Kira
Neon Cipher Matrix Proxy Byte Glitch Void Synapse Vector Static Protocol Zero Phantom Daemon Sector Quantum Nero Flux Jax Vandal Echo Rogue Apex Link
`.trim().split(/\s+/);

export const NICK_LAST_PARTS = `
Mercer Novak Volkov Voss Drake Frost Cross Vale Stone Mercer Thorn Vega Orion Blackwood Sterling Ward Kane Ryker Sable Arden Crow Fox Hale Knox Lynch
Morrow North Quinn Reeve Slade Stark Vega Vance Wolfe York Zorin Ashford Calder Dorian Falcon Grayson Hayes Irons Jett Kestrel Locke Maddox Nash Pryce
Vane Kross Creed Wire Haze Thorne Briggs Malek Sterling Vektor Slate Vance Ridge Razor Jax Vance Kaelen Hawke Winter Sinclair Sterling Jett
`.trim().split(/\s+/);

export function normalizeNickname(value: string): string {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N}_. -]/gu, '')
    .trim();
}

export function isNicknameValid(value: string): boolean {
  const nick = normalizeNickname(value);
  return nick.length >= 3 && nick.length <= 24;
}

export function nicknameExists(nickname: string, exceptTelegramId = ''): boolean {
  const row = db.prepare(`
    SELECT telegramId FROM users
    WHERE LOWER(COALESCE(public_nickname, '')) = LOWER(?)
      AND (? = '' OR telegramId <> ?)
    LIMIT 1
  `).get(nickname.trim(), exceptTelegramId, exceptTelegramId) as any;
  return Boolean(row);
}

function buildAutoNicknameSeed(telegramId: string, salt = 0): Buffer {
  return crypto
    .createHash('sha256')
    .update(`${telegramId}:${salt}:wallbreaker-nickname`)
    .digest();
}

function buildAutoNickname(telegramId: string, salt = 0): string {
  const seed = buildAutoNicknameSeed(telegramId, salt);
  const first = NICK_FIRST_PARTS[seed[0] % NICK_FIRST_PARTS.length];
  const last = NICK_LAST_PARTS[seed[1] % NICK_LAST_PARTS.length];
  return `${first} ${last}`;
}

export function generateUniqueAutoNickname(telegramId: string): string {
  for (let salt = 0; salt < 2048; salt += 1) {
    const base = buildAutoNickname(telegramId, salt);
    if (!nicknameExists(base, telegramId)) {
      return base;
    }
    const seed = buildAutoNicknameSeed(telegramId, salt);
    const suffix = String((((seed[2] << 8) | seed[3]) % 999) + 1);
    const candidate = normalizeNickname(`${base} ${suffix}`);
    if (candidate.length <= 24 && !nicknameExists(candidate, telegramId)) {
      return candidate;
    }
  }
  return `Agent ${String(telegramId).slice(-6)}`;
}
