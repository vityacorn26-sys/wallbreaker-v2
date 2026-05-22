import React, { useState, useEffect, useRef } from 'react';
import './index.css';

// Импортируем продовые ассеты
import cat1 from './assets/cat1-PIsrTzOT.jpg';
import cat2 from './assets/cat2-D6Et6OfU.jpg';
import cat3 from './assets/cat3-BMcFTwCD.jpg';
import cat4 from './assets/cat4-C4-mAWUO.jpg';
import cat5 from './assets/cat5-BBIkAUHa.jpg';
import loadingImg from './assets/loading.jpg'; 
import serverImg from './assets/server.jpg';   

const API = 'https://wb-v2-api.corterbs.dpdns.org';
const PROXY_BOT_URL = 'https://t.me/hiddifyProxySale_bot'; // Твой бот продаж подписок прокси

const RANK_IMAGES = {
  1: cat1,
  2: cat2,
  3: cat3,
  4: cat4,
  5: cat5
};

const RANK_REWARDS = { 1: 10, 2: 25, 3: 60, 4: 150, 5: 400 };

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tgInitData, setTgInitData] = useState('');
  
  // Состояния для анимации клика
  const [isTapping, setIsTapping] = useState(false);

  // Рефы для батчинга тапов (Пакетная система)
  const clicksBufferRef = useRef(0);
  const debounceTimeoutRef = useRef(null);
  const userStateRef = useRef(null);

  // Синхронизируем реф состояния пользователя для батчинга
  useEffect(() => {
    userStateRef.current = user;
  }, [user]);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      const initDataStr = tg.initData || '';
      setTgInitData(initDataStr);

      fetch(`${API}/api/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: initDataStr })
      })
        .then(res => res.json())
        .then(data => {
          if (!data.error) setUser(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("API Init Error:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Функция отправки накопленных тапов пакетом на сервер
  const sendPackToServer = () => {
    const totalTaps = clicksBufferRef.current;
    if (totalTaps <= 0) return;

    // Сбрасываем буфер перед запросом
    clicksBufferRef.current = 0;

    fetch(`${API}/api/tap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: tgInitData, count: totalTaps })
    })
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          // Мягко синхронизируем баланс и энергию с ответом сервера
          setUser(data);
        }
      })
      .catch(err => {
        console.error("Batch send error:", err);
      });
  };

  const handleTap = () => {
    if (!user || user.energy <= 0) return;

    const currentRankId = user.rank_id || 1;
    const rewardPerTap = RANK_REWARDS[currentRankId] || 10;

    // Визуальный триггер перелива и усадки кнопки
    setIsTapping(true);
    setTimeout(() => setIsTapping(false), 85);

    // 1. Мгновенное обновление UI (Оптимистичный апдейт)
    setUser(prev => ({
      ...prev,
      wbc_balance: prev.wbc_balance + rewardPerTap,
      energy: Math.max(0, prev.energy - 1)
    }));

    // 2. Копим тап в буфер для батчинга
    clicksBufferRef.current += 1;

    // 3. Сбрасываем и взводим таймаут дебаунса (850мс, как в старом проде)
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(sendPackToServer, 850);
  };

  // ЭКРАН ЗАГРУЗКИ (Строго loading.jpg на весь экран)
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

  const currentRankId = user?.rank_id || 1;
  const currentRankImage = RANK_IMAGES[currentRankId] || cat1;
  const currentRankName = user?.rank_name || "Proxy Hacker";

  return (
    <div className="relative min-h-screen bg-slate-950 text-white font-mono select-none overflow-hidden flex flex-col justify-between p-4">
      
      {/* ДЫШАЩИЙ ФОН КОТА (Без размытия, плавно пульсирует масштаб и прозрачность) */}
      <div className="absolute inset-0 opacity-[0.12] pointer-events-none animate-[pulse_6s_ease-in-out_infinite] scale-102">
        <img src={currentRankImage} alt="Background Node" className="w-full h-full object-cover" />
      </div>

      {/* ВЕРХНЯЯ ПАНЕЛЬ */}
      <div className="relative z-10 flex justify-between items-center w-full">
        <button 
          onClick={() => setMenuOpen(true)}
          className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-center items-center gap-1.5 active:scale-95 transition-transform"
        >
          <div className="w-5 h-0.5 bg-cyan-400"></div>
          <div className="w-5 h-0.5 bg-cyan-400"></div>
          <div className="w-5 h-0.5 bg-cyan-400"></div>
        </button>

        <div className="bg-slate-900/90 border border-cyan-500/20 px-4 py-1.5 rounded-xl flex flex-col items-end backdrop-blur-xs">
          <span className="text-[9px] text-cyan-400 tracking-widest font-black uppercase">R{currentRankId} NODE</span>
          <span className="text-xs font-black tracking-wide text-white">{currentRankName}</span>
        </div>
      </div>

      {/* ЦЕНТР: БАЛАНС И КНОПКА-КОТ */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto gap-6 w-full">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            {user?.wbc_balance?.toLocaleString() || 0} <span className="text-cyan-400 text-2xl font-black">$WBC</span>
          </h1>
        </div>

        {/* КНОПКА-КОТ (Усадка при тапе + неоновое переливающееся свечение границ) */}
        <button 
          onClick={handleTap}
          style={{ transform: isTapping ? 'scale(0.985)' : 'scale(1)' }}
          className={`relative w-68 h-68 rounded-[2.5rem] overflow-hidden border-4 transition-all duration-75 outline-none
            ${isTapping 
              ? 'border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.5)]' 
              : 'border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.25)]'
            }`}
        >
          {/* Слой переливающегося неонового оттенка поверх кота при тапе */}
          <div className={`absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-indigo-500/10 to-purple-500/20 pointer-events-none transition-opacity duration-100 ${isTapping ? 'opacity-100' : 'opacity-0'}`}></div>
          <img src={currentRankImage} alt="Core Matrix" className="w-full h-full object-cover" />
        </button>

        {/* CPU ИНДИКАТОР */}
        <div className="w-full max-w-xs flex flex-col gap-2">
          <div className="flex justify-between text-[10px] tracking-wider text-slate-400 px-1">
            <span>CORE CPU LOAD</span>
            <span className="text-cyan-400 font-black">{user?.energy || 0}%</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full border border-slate-800/60 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 transition-all duration-300"
              style={{ width: `${user?.energy || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* НИЖНИЙ ТАБ-БАР */}
      <div className="relative z-10 grid grid-cols-5 gap-1 bg-slate-900/95 border border-slate-800/80 p-2 rounded-2xl backdrop-blur-lg w-full max-w-md mx-auto">
        {/* ИКОНКА SERVER.JPG (Прямой переход на бота подписок) */}
        <a 
          href={PROXY_BOT_URL} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-slate-400 hover:text-cyan-400 transition-all active:scale-95"
        >
          <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-700/60 flex items-center justify-center">
            <img src={serverImg} alt="Proxy Sales Bot" className="w-full h-full object-cover" />
          </div>
          <span className="text-[9px] mt-1 font-bold tracking-wide">Proxy</span>
        </a>

        <button className="flex flex-col items-center justify-center p-1.5 rounded-xl text-cyan-400 font-black bg-slate-800/40 border border-cyan-500/10">
          <span className="text-[10px]">ГЛАВНАЯ</span>
        </button>
        <button className="flex flex-col items-center justify-center p-1.5 rounded-xl text-slate-400">
          <span className="text-[10px]">TASKS</span>
        </button>
        <button className="flex flex-col items-center justify-center p-1.5 rounded-xl text-slate-400">
          <span className="text-[10px]">МАРКЕТ</span>
        </button>
        <button className="flex flex-col items-center justify-center p-1.5 rounded-xl text-slate-400">
          <span className="text-[10px]">АККАУНТ</span>
        </button>
      </div>

      {/* БОКОВОЕ ГАМБУРГЕР-МЕНЮ (КАНОНИЧНЫЕ КНОПКИ) */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-slate-950/98 border-r border-slate-900 z-50 transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-out p-6 flex flex-col justify-between backdrop-blur-md`}>
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-slate-900 pb-4">
            <h2 className="text-cyan-400 font-black tracking-widest text-xs uppercase">⚡ PROTOCOL CORE</h2>
            <button onClick={() => setMenuOpen(false)} className="text-slate-500 hover:text-white transition-colors text-lg">✕</button>
          </div>

          <nav className="flex flex-col gap-2.5">
            <button className="w-full text-left p-3 rounded-xl bg-gradient-to-r from-cyan-950/30 to-slate-900 border border-cyan-500/20 hover:border-cyan-400 transition-all group active:scale-[0.98]">
              <div className="text-xs font-black text-white group-hover:text-cyan-400 transition-colors">Code Injection</div>
              <div className="text-[10px] text-cyan-500/80 font-mono mt-0.5">+1,500 WBC & Full CPU</div>
            </button>

            <button className="w-full text-left p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all active:scale-[0.98]">
              <div className="text-xs font-bold text-slate-300">Referral Node</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Grid network mapping</div>
            </button>

            <button className="w-full text-left p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all active:scale-[0.98]">
              <div className="text-xs font-bold text-slate-300">Breach Board</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Global cyber leaderboard</div>
            </button>

            <button className="w-full text-left p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all active:scale-[0.98]">
              <div className="text-xs font-bold text-slate-300">Promocode</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Decrypt operational vouchers</div>
            </button>
          </nav>
        </div>

        <div className="text-[10px] text-slate-700 text-center border-t border-slate-900 pt-4 font-mono uppercase tracking-widest">
          WallBreaker OS v2.0.0
        </div>
      </div>

      {menuOpen && (
        <div onClick={() => setMenuOpen(false)} className="fixed inset-0 bg-black/60 z-40 transition-opacity"></div>
      )}

    </div>
  );
}
