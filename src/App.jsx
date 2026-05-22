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
  const [user, setUser] = useState({ wbc_balance: 0, energy: 0, rank_id: 1, rank_name: "Proxy Hacker" });
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isTapping, setIsTapping] = useState(false);

  const clicksBufferRef = useRef(0);
  const debounceTimeoutRef = useRef(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      fetch(`${API}/api/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: tg.initData || '' })
      })
        .then(res => res.json())
        .then(data => {
          if (!data.error) setUser(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const sendPackToServer = () => {
    const totalTaps = clicksBufferRef.current;
    if (totalTaps <= 0) return;
    clicksBufferRef.current = 0;

    fetch(`${API}/api/tap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: window.Telegram?.WebApp?.initData, count: totalTaps })
    })
      .then(res => res.json())
      .then(data => { if (!data.error) setUser(data); });
  };

  const handleTap = () => {
    if (user.energy <= 0) return;

    setIsTapping(true);
    setTimeout(() => setIsTapping(false), 80);

    setUser(prev => ({
      ...prev,
      wbc_balance: prev.wbc_balance + (RANK_REWARDS[prev.rank_id] || 10),
      energy: Math.max(0, prev.energy - 1)
    }));

    clicksBufferRef.current += 1;
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(sendPackToServer, 850);
  };

  const handleProxyClick = () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(PROXY_BOT_URL);
      setTimeout(() => window.Telegram.WebApp.close(), 100);
    } else {
      window.open(PROXY_BOT_URL, '_blank');
    }
  };

  // ЭКРАН ЗАГРУЗКИ
  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center text-white z-50">
        <div className="w-full h-full absolute inset-0">
          <img src={loadingImg} alt="Booting OS..." className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 bg-slate-950/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-cyan-500/30 flex flex-col items-center gap-1 mt-auto mb-16">
          <p className="text-cyan-400 font-mono text-xs tracking-[0.3em] uppercase animate-pulse">BOOTING SYSTEM OS...</p>
          <span className="text-[9px] text-slate-500 font-mono">WALLBREAKER PROTOCOL V2</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-white font-mono select-none overflow-hidden flex flex-col">
      
      {/* ЧИСТЫЙ ФОН */}
      <div className="absolute inset-0 pointer-events-none">
        <img src={RANK_IMAGES[user.rank_id] || cat1} className="w-full h-full object-cover" alt="Background Node" />
      </div>

      {/* ВЕРХНИЙ БЛОК (ХЕДЕР) */}
      <div className="relative z-10 w-full flex justify-between items-start px-4 pt-8">
        {/* Кнопка меню */}
        <button 
          onClick={() => setMenuOpen(true)}
          className="w-11 h-11 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex flex-col justify-center items-center gap-1.5 active:scale-95 transition-transform backdrop-blur-sm shadow-[0_0_10px_rgba(34,211,238,0.2)]"
        >
          <div className="w-5 h-0.5 bg-cyan-400"></div>
          <div className="w-5 h-0.5 bg-cyan-400"></div>
          <div className="w-5 h-0.5 bg-cyan-400"></div>
        </button>

        {/* Киберпанк Карточка Ранга по центру */}
        <div className="bg-slate-950/70 border-t-2 border-cyan-400 px-6 py-2 rounded-b-xl backdrop-blur-md shadow-[0_5px_20px_rgba(34,211,238,0.15)] flex flex-col items-center">
          <h2 className="text-sm font-black tracking-widest text-cyan-400 uppercase drop-shadow-md">
            {user.rank_name}
          </h2>
        </div>

        {/* Плашка активной ноды справа */}
        <div className="bg-cyan-950/80 border border-cyan-500/50 px-2 py-1.5 rounded-lg text-[9px] text-cyan-300 font-black tracking-widest uppercase shadow-[0_0_15px_rgba(6,182,212,0.3)] backdrop-blur-sm">
          R{user.rank_id} NODE ACTIVE
        </div>
      </div>

      {/* ЦЕНТРАЛЬНЫЙ БЛОК */}
      <div className="relative z-10 flex flex-col items-center justify-start flex-grow pt-6">
        
        {/* Баланс */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {user.wbc_balance.toLocaleString()} <span className="text-cyan-400 text-3xl font-black">$WBC</span>
          </h1>
        </div>

        {/* Кнопка тапа (Круглая, опущена вниз) */}
        <button 
          onClick={handleTap}
          style={{ transform: isTapping ? 'scale(0.96)' : 'scale(1)' }}
          className="relative w-[280px] h-[280px] rounded-full overflow-hidden border-4 border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.4)] transition-transform duration-75 outline-none mt-12"
        >
          <div className="absolute inset-0 bg-cyan-500/10 animate-[pulse_2s_infinite] pointer-events-none"></div>
          <img src={RANK_IMAGES[user.rank_id] || cat1} className="w-full h-full object-cover" alt="Core Tap" />
        </button>

        {/* Шкала CPU под кнопкой */}
        <div className="w-full max-w-[280px] flex flex-col gap-1.5 mt-6 bg-slate-950/60 p-2 rounded-xl backdrop-blur-sm border border-slate-800/50">
          <div className="flex justify-between text-[10px] tracking-wider text-slate-300 px-1 font-bold">
            <span>CORE CPU LOAD</span>
            <span className="text-cyan-400">{user.energy}%</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-400 transition-all duration-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
              style={{ width: `${user.energy}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* ИКОНКА ПРОКСИ БОТА (Слева внизу, над таб-баром) */}
      <div className="fixed bottom-28 left-4 z-20">
        <button 
          onClick={handleProxyClick}
          className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-cyan-400 active:scale-90 transition-transform shadow-[0_0_20px_rgba(34,211,238,0.3)]"
        >
          <img src={serverImg} alt="Proxy Bot" className="w-full h-full object-cover" />
        </button>
      </div>

      {/* ТАБ-БАР (Поднят выше, цвет металлик, текст бирюзовый) */}
      <div className="fixed bottom-8 left-4 right-4 z-20 bg-gradient-to-b from-slate-200 to-slate-400 border border-slate-400 shadow-2xl p-2 rounded-2xl flex justify-between px-2">
        <button className="flex-1 flex flex-col items-center justify-center py-2 rounded-xl bg-slate-300/50 shadow-inner">
          <span className="text-[11px] font-black text-cyan-700 tracking-wide uppercase drop-shadow-sm">Главная</span>
        </button>
        <button className="flex-1 flex flex-col items-center justify-center py-2 rounded-xl">
          <span className="text-[11px] font-black text-cyan-800 tracking-wide uppercase opacity-70">Tasks</span>
        </button>
        <button className="flex-1 flex flex-col items-center justify-center py-2 rounded-xl text-center leading-tight">
          <span className="text-[10px] font-black text-cyan-800 tracking-wide uppercase block opacity-70">Darknet</span>
          <span className="text-[9px] font-black text-cyan-800 block opacity-50">Market</span>
        </button>
        <button className="flex-1 flex flex-col items-center justify-center py-2 rounded-xl">
          <span className="text-[11px] font-black text-cyan-800 tracking-wide uppercase opacity-70">Аккаунт</span>
        </button>
      </div>

      {/* ГАМБУРГЕР МЕНЮ */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-gradient-to-b from-slate-200 to-slate-400 border-r border-slate-400 shadow-2xl z-50 transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-out p-6 flex flex-col justify-between`}>
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-slate-400/50 pb-4 pt-8">
            <h2 className="text-slate-800 font-black tracking-widest text-sm uppercase">⚡ Protocol Core</h2>
            <button onClick={() => setMenuOpen(false)} className="text-slate-600 hover:text-slate-900 transition-colors text-2xl font-bold">✕</button>
          </div>

          <div className="flex gap-4 border-b border-slate-400/50 pb-4">
            <button className="text-sm font-black text-slate-800 border-b-2 border-slate-800">RU</button>
            <span className="text-slate-400">|</span>
            <button className="text-sm font-bold text-slate-500">EN</button>
          </div>

          <nav className="flex flex-col gap-3">
            <button className="w-full text-left p-4 rounded-xl bg-cyan-400 border border-cyan-500 shadow-md active:scale-[0.98] transition-transform">
              <div className="text-sm font-black text-slate-900 uppercase">Code Injection</div>
              <div className="text-[11px] text-slate-800 font-bold mt-1">+1,500 WBC & Full CPU</div>
            </button>

            <button className="w-full text-left p-4 rounded-xl bg-slate-300 border border-slate-400 shadow-sm hover:bg-slate-200 active:scale-[0.98] transition-all">
              <div className="text-sm font-black text-slate-800 uppercase">Referral Node</div>
              <div className="text-[11px] text-slate-600 font-bold mt-1">Grid network mapping</div>
            </button>

            <button className="w-full text-left p-4 rounded-xl bg-slate-300 border border-slate-400 shadow-sm hover:bg-slate-200 active:scale-[0.98] transition-all">
              <div className="text-sm font-black text-slate-800 uppercase">Breach Board</div>
              <div className="text-[11px] text-slate-600 font-bold mt-1">Global cyber leaderboard</div>
            </button>

            <button className="w-full text-left p-4 rounded-xl bg-slate-300 border border-slate-400 shadow-sm hover:bg-slate-200 active:scale-[0.98] transition-all">
              <div className="text-sm font-black text-slate-800 uppercase">Promocode</div>
              <div className="text-[11px] text-slate-600 font-bold mt-1">Decrypt operational vouchers</div>
            </button>
          </nav>
        </div>
      </div>

      {menuOpen && (
        <div onClick={() => setMenuOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"></div>
      )}

    </div>
  );
}
