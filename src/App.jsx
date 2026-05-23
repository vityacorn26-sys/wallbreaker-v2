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
  const [user, setUser] = useState({ energy: 100, rank_id: 1, rank_name: "Proxy Hacker", rank_expires_at: null });
  const [wbcBalance, setWbcBalance] = useState(0);
  const [liveScore, setLiveScore] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isTapping, setIsTapping] = useState(false);
  
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [timeLeft, setTimeLeft] = useState('');
  
  const clicksBufferRef = useRef(0);
  const debounceTimeoutRef = useRef(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.disableVerticalSwipes();

      fetch(`${API}/api/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: tg.initData || '' })
      })
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setUser({ 
              energy: data.energy ?? 100, 
              rank_id: data.rank_id || 1, 
              rank_name: data.rank_name || "Proxy Hacker",
              rank_expires_at: data.rank_expires_at
            });
            setWbcBalance(data.wbc_balance || 0);
            setLiveScore(data.draw_score_cached || 0);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Таймер ранга (7 дней)
  useEffect(() => {
    if (!user.rank_expires_at) {
      setTimeLeft('PERMANENT');
      return;
    }
    const interval = setInterval(() => {
      const diff = new Date(user.rank_expires_at).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('EXPIRED');
        clearInterval(interval);
      } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [user.rank_expires_at]);

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
      .then(data => { 
        if (!data.error) {
          setUser(prev => ({ ...prev, energy: data.energy }));
          setWbcBalance(data.wbc_balance);
          setLiveScore(data.draw_score_cached);
        } 
      });
  };

  const handleTap = (e) => {
    if (user.energy <= 0) return;
    setIsTapping(true);
    setTimeout(() => setIsTapping(false), 80);
    
    const reward = RANK_REWARDS[user.rank_id] || 10;
    setWbcBalance(prev => prev + reward);
    setUser(prev => ({ ...prev, energy: Math.max(0, prev.energy - 1) }));
    
    // Анимация тапа (Бирюзовый цвет)
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newId = Date.now() + Math.random();
    
    setFloatingTexts(prev => [...prev, { id: newId, x, y, val: `+${reward}` }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== newId));
    }, 1500); // 1.5 секунды для тапа

    clicksBufferRef.current += 1;
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(sendPackToServer, 850);
  };

  if (loading) return <div className="fixed inset-0 bg-slate-950 z-50"></div>;

  return (
    <div className="relative min-h-screen bg-slate-950 text-white font-mono select-none overflow-hidden flex flex-col">
      <div className="absolute inset-0 pointer-events-none">
        <img src={RANK_IMAGES[user.rank_id] || cat1} className="w-full h-full object-cover opacity-40" alt="Bg" />
      </div>

      {/* ХЕДЕР */}
      <div className="relative z-10 w-full flex justify-between items-start px-4 pt-12">
        <button onClick={() => setMenuOpen(true)} className="w-12 h-12 rounded-xl bg-slate-900/90 border border-cyan-500/50 flex flex-col justify-center items-center gap-1.5 active:scale-95 transition-transform backdrop-blur-md">
          <div className="w-6 h-0.5 bg-cyan-400"></div>
          <div className="w-6 h-0.5 bg-cyan-400"></div>
          <div className="w-6 h-0.5 bg-cyan-400"></div>
        </button>

        {/* Плашка Ранга + Таймер */}
        <div className="flex flex-col items-center transform -translate-y-1">
          <div className="bg-slate-900/90 border border-cyan-500/50 px-6 py-2 rounded-xl backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            <h2 className="text-sm md:text-base font-black tracking-[0.15em] text-cyan-400 uppercase drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
              {user.rank_name}
            </h2>
          </div>
          <div className="mt-1.5 bg-slate-950/80 px-3 py-0.5 rounded-full border border-slate-700/50">
            <span className="text-[9px] text-slate-300 tracking-widest font-bold">{timeLeft}</span>
          </div>
        </div>

        <div className="bg-cyan-950/90 border border-cyan-500/50 px-2.5 py-2 rounded-lg text-[10px] text-cyan-300 font-black tracking-widest uppercase">
          R{user.rank_id}
        </div>
      </div>

      {/* ТУЧКА LIVE SCORE */}
      <div className="absolute top-28 right-4 z-20">
        <div className="p-[2px] rounded-full bg-gradient-to-r from-slate-300 via-slate-100 to-pink-300 shadow-[0_0_20px_rgba(244,114,182,0.3)]">
          <div className="bg-slate-950/90 backdrop-blur-md rounded-full px-4 py-1.5 flex flex-col items-center justify-center min-w-[90px]">
            <span className="text-pink-300 font-black text-base drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]">
              {Number(liveScore).toFixed(3)}
            </span>
            <span className="text-[7px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">Live Score</span>
          </div>
        </div>
      </div>

      {/* ЦЕНТР */}
      <div className="relative z-10 flex flex-col items-center justify-start flex-grow pt-16">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black tracking-tight drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
            {wbcBalance.toLocaleString()} <span className="text-cyan-400 text-2xl font-black">$WBC</span>
          </h1>
        </div>

        {/* Кнопка тапа с анимацией */}
        <button
          onClick={handleTap}
          style={{ transform: isTapping ? 'scale(0.96)' : 'scale(1)' }}
          className="relative w-[260px] h-[260px] rounded-3xl overflow-hidden border-2 border-cyan-400/50 shadow-[0_0_40px_rgba(34,211,238,0.3)] transition-transform duration-75 outline-none"
        >
          <img src={RANK_IMAGES[user.rank_id] || cat1} className="w-full h-full object-cover" alt="Core Tap" />
          
          {floatingTexts.map(t => (
            <div 
              key={t.id} 
              className="absolute text-cyan-400 font-black text-2xl pointer-events-none animate-float-up drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
              style={{ left: t.x, top: t.y }}
            >
              {t.val}
            </div>
          ))}
        </button>

        {/* Шкала CPU */}
        <div className="w-full max-w-[260px] flex flex-col gap-1.5 mt-8 bg-slate-950/80 p-2.5 rounded-xl backdrop-blur-md border border-slate-800/80 shadow-lg">
          <div className="flex justify-between text-[11px] tracking-wider text-slate-300 px-1 font-bold">
            <span>CPU</span>
            <span className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">{user.energy} / 100</span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-cyan-400 transition-all duration-300 shadow-[0_0_12px_rgba(34,211,238,1)]"
              style={{ width: `${(user.energy / 100) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* ТАБ-БАР (5 кнопок) */}
      <div className="fixed bottom-10 left-4 right-4 z-20 bg-gradient-to-b from-slate-200 to-slate-400 border border-slate-400 shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-2 rounded-2xl flex justify-between px-2 items-center min-h-[70px]">
        <button className="flex-1 flex flex-col items-center justify-center py-3 rounded-xl bg-slate-300/60 shadow-inner">
          <span className="text-[10px] font-black text-cyan-700 tracking-wide uppercase drop-shadow-sm">Главная</span>
        </button>
        <button className="flex-1 flex flex-col items-center justify-center py-3 rounded-xl active:bg-slate-300/30 transition-colors">
          <span className="text-[10px] font-black text-cyan-800 tracking-wide uppercase opacity-70">Tasks</span>
        </button>
        <button className="flex-1 flex flex-col items-center justify-center py-3 rounded-xl active:bg-slate-300/30 transition-colors">
          <span className="text-[10px] font-black text-cyan-800 tracking-wide uppercase opacity-70">DarkNet Market</span>
        </button>
        <button className="flex-1 flex flex-col items-center justify-center py-3 rounded-xl active:bg-slate-300/30 transition-colors">
          <span className="text-[10px] font-black text-cyan-800 tracking-wide uppercase opacity-70">Контракт</span>
        </button>
        <button className="flex-1 flex flex-col items-center justify-center py-3 rounded-xl active:bg-slate-300/30 transition-colors">
          <span className="text-[10px] font-black text-cyan-800 tracking-wide uppercase opacity-70">Аккаунт</span>
        </button>
      </div>

      {/* ГАМБУРГЕР МЕНЮ */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-gradient-to-b from-slate-200 to-slate-400 border-r border-slate-400 shadow-2xl z-50 transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-out p-6 flex flex-col justify-between`}>
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-slate-400/50 pb-4 pt-8">
            <h2 className="text-slate-800 font-black tracking-widest text-sm uppercase">⚡ Protocol Core</h2>
            <button onClick={() => setMenuOpen(false)} className="text-slate-600 hover:text-slate-900 transition-colors text-2xl font-bold">✕</button>
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
          </nav>
        </div>
      </div>

      {menuOpen && (
        <div onClick={() => setMenuOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"></div>
      )}
    </div>
  );
}
