import React, { useState, useEffect, useRef } from 'react';
import './index.css';

import cat1 from './assets/cat1.jpg';
import cat2 from './assets/cat2.jpg';
import cat3 from './assets/cat3.jpg';
import cat4 from './assets/cat4.jpg';
import cat5 from './assets/cat5.jpg';
import loadingImg from './assets/loading.jpg';
import serverImg from './assets/server.jpg';

const API = 'https://wb-v2-api.corterbs.dpdns.org';
const PROXY_BOT_URL = 'https://t.me/hiddifyProxySale_bot';

const RANK_IMAGES = { 1: cat1, 2: cat2, 3: cat3, 4: cat4, 5: cat5 };
const RANK_REWARDS = { 1: 10, 2: 25, 3: 60, 4: 150, 5: 400 };

export default function App() {
  const [user, setUser] = useState({ wbc_balance: 0, energy: 100, rank_id: 1, rank_name: "Proxy Hacker" });
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isTapping, setIsTapping] = useState(false);
  const clicksBufferRef = useRef(0);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      
      fetch(`${API}/api/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: window.Telegram.WebApp.initData })
      })
      .then(res => res.json())
      .then(data => { if (!data.error) setUser(data); setLoading(false); })
      .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleTap = () => {
    if (user.energy <= 0) return;
    setIsTapping(true);
    setTimeout(() => setIsTapping(false), 80);
    setUser(prev => ({ ...prev, wbc_balance: prev.wbc_balance + RANK_REWARDS[prev.rank_id], energy: Math.max(0, prev.energy - 1) }));
    clicksBufferRef.current += 1;
    fetch(`${API}/api/tap`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ initData: window.Telegram?.WebApp?.initData, count: 1 }) });
  };

  const handleProxyClick = () => {
    window.Telegram?.WebApp?.openTelegramLink(PROXY_BOT_URL);
  };

  if (loading) return <div className="fixed inset-0 bg-slate-950 flex items-center justify-center text-cyan-400">LOADING...</div>;

  return (
    <div className="relative min-h-screen bg-slate-950 text-white font-mono flex flex-col justify-between p-4 pb-24">
      <img src={RANK_IMAGES[user.rank_id]} className="absolute inset-0 w-full h-full object-cover" alt="bg" />
      
      <div className="relative z-10 pt-12 flex justify-between items-center">
        <button onClick={() => setMenuOpen(true)} className="p-3 bg-slate-800/50 rounded-lg">☰</button>
        <div className="bg-slate-900/50 px-4 py-1 rounded-full text-cyan-400 text-xs uppercase border border-cyan-500/30">R{user.rank_id} Node Active</div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center flex-grow">
        <div className="bg-slate-900/60 backdrop-blur-sm p-4 rounded-2xl border border-white/10 mb-6">
          <h2 className="text-2xl font-black text-cyan-400 tracking-widest">{user.rank_name}</h2>
        </div>
        <h1 className="text-5xl font-black mb-8">{user.wbc_balance.toLocaleString()} $WBC</h1>
        <button onClick={handleTap} className={`w-64 h-64 rounded-full transition-transform ${isTapping ? 'scale-95' : 'scale-100'}`}>
          <img src={RANK_IMAGES[user.rank_id]} className="w-full h-full rounded-full border-4 border-cyan-400 shadow-2xl" />
        </button>
      </div>

      <button onClick={handleProxyClick} className="fixed bottom-32 left-6 z-20 w-16 h-16 rounded-2xl overflow-hidden border-2 border-cyan-400">
        <img src={serverImg} className="w-full h-full object-cover" />
      </button>

      <div className="fixed bottom-4 left-4 right-4 z-20 bg-slate-300 p-2 rounded-2xl flex justify-around border border-slate-400">
        {['ГЛАВНАЯ', 'TASKS', 'MARKET', 'АККАУНТ'].map(label => (
          <button key={label} className="text-cyan-400 font-bold text-xs py-2">{label}</button>
        ))}
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-300 w-3/4 p-6 shadow-2xl border-r border-slate-400">
          <div className="flex justify-between mb-8">
            <span className="text-slate-900 font-bold">⚡ CORE</span>
            <button onClick={() => setMenuOpen(false)} className="text-slate-900">✕</button>
          </div>
          <button className="w-full bg-cyan-400 text-slate-900 py-4 rounded-xl font-bold mb-4">CODE INJECTION (+1500)</button>
          <div className="flex gap-2 text-slate-900 text-sm"><button>RU</button>|<button>EN</button></div>
        </div>
      )}
    </div>
  );
}
