import cat1 from "./assets/cat1.jpg";
import cat2 from "./assets/cat2.jpg";
import cat3 from "./assets/cat3.jpg";
import cat4 from "./assets/cat4.jpg";
import cat5 from "./assets/cat5.jpg";
import { useEffect, useState } from 'react';
import { useTelegram } from './hooks/useTelegram';
import useTaps from './hooks/useTaps';

const API = 'https://wb-v2-api.corterbs.dpdns.org';

const catImages = { 1: cat1, 2: cat2, 3: cat3, 4: cat4, 5: cat5 };
const rankNames = { 1: "PROXY HACKER", 2: "Tunnel Master", 3: "Firewall Breaker", 4: "Root Operator", 5: "Cyber Legend" };

function App() {
  const { tg, initData } = useTelegram();
  const [score, setScore] = useState(0);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Пакетный сборщик кликов
  const { handleTap } = useTaps(initData);

  // Первичная авторизация юзера
  useEffect(() => {
    if (!initData) return;
    fetch(`${API}/api/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.error) throw new Error(data.error);
        setUser(data);
        setScore(data.live_score ?? 0);
      })
      .catch(e => setError(e.message));
  }, [initData]);

  // Клик по коту
  const onTapClick = () => {
    setScore(prev => prev + 1);
    handleTap();
  };

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-6 text-red-500 font-mono">
        <div className="border border-red-500 p-4 bg-black/40 rounded-lg">
          [CRITICAL ERROR]: {error}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-950 text-cyan-400 font-mono text-xl animate-pulse">
        CONNECTING TO CORE...
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-slate-950 flex flex-col justify-between p-4 overflow-hidden select-none">
      
      {/* ВЕРХНЯЯ ПАНЕЛЬ: Опущена ниже (pt-16), чтобы уйти из-под кнопки Закрыть в Телеграм Fullscreen */}
      <div className="w-full flex items-center justify-between pt-16 px-2 z-50">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-12 h-12 bg-slate-900 border border-cyan-400 rounded-xl flex flex-col justify-center items-center gap-1.5 active:scale-90 transition-transform shadow-[0_0_10px_rgba(34,211,238,0.2)]"
        >
          <span className="w-6 h-0.5 bg-cyan-400"></span>
          <span className="w-6 h-0.5 bg-cyan-400"></span>
          <span className="w-6 h-0.5 bg-cyan-400"></span>
        </button>

        {/* Статус раунда */}
        <div className="bg-black/50 border border-slate-800 rounded-xl px-4 py-2 text-right">
          <div className="text-xs text-cyan-400 font-bold tracking-wider">TUNNEL MASTER</div>
          <div className="text-[10px] text-slate-400">R{user.current_round || 1} • ACTIVE</div>
        </div>
      </div>

      {/* ГЛАВНЫЙ ЭКРАН */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 z-10">
        {/* SCORE */}
        <div className="text-4xl font-extrabold tracking-tight text-slate-200 drop-shadow-[0_0_15px_rgba(226,232,240,0.3)] font-mono">
          {score.toLocaleString()} $WBC
        </div>

        {/* БОНУС-ВИДЖЕТ */}
        <div className="bg-slate-900/80 border border-pink-500/20 px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(244,114,182,0.15)] animate-pulse">
          <span className="text-xs font-bold text-pink-400">+435.51 CORE TAP</span>
        </div>

        {/* ЦЕНТРАЛЬНЫЙ КОТ: Путь исправлен на рабочий /assets/ */}
        <div
          onClick={onTapClick}
          onTouchStart={(e) => { e.preventDefault(); onTapClick(); }}
          className="w-72 h-72 rounded-3xl border-2 border-cyan-400 overflow-hidden bg-black/20 shadow-[0_0_30px_rgba(34,211,238,0.2)] active:scale-95 transition-transform duration-75 cursor-pointer"
        >
          <img src={catImages[user.rank_id] || cat1} alt="Cyber Cat" className="w-full h-full object-cover pointer-events-none" />
        </div>

        {/* ШКАЛА CPU: Строго без русского перевода */}
        <div className="w-full max-w-xs flex flex-col items-center gap-1">
          <div className="text-xs text-slate-400 font-bold font-mono">CPU: {user.energy || 100} / 100</div>
          <div className="w-full h-3 bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${user.energy || 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* НИЖНЯЯ ПАНЕЛЬ: Приподнята (pb-8), чтобы не накладываться на системный таб-бар устройства */}
      <div className="w-full flex items-center justify-between gap-2 pb-8 px-1 z-10">
        {/* Иконка VPN-бота: Путь исправлен на /assets/ */}
        <a
          href="https://t.me/Hiddify_Proxy_Bot_Example"
          target="_blank"
          rel="noreferrer"
          className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center active:scale-90 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.1)]"
        >
          <img src={catImages[user.rank_id] || cat1} alt="Cyber Cat" className="w-full h-full object-cover pointer-events-none" />
        </a>

        {/* ТАБ-БАР: Кнопки увеличены по высоте (py-3.5) для удобства тапа */}
        <div className="flex-1 flex bg-slate-900/90 border border-slate-800 rounded-xl p-1 justify-between text-[11px] font-bold font-mono shadow-lg">
          <button className="flex-1 py-4 rounded-lg bg-cyan-400 text-slate-950 font-extrabold text-center">ГЛАВНАЯ</button>
          <button className="flex-1 py-3.5 text-slate-400 text-center active:text-cyan-400">TASKS</button>
          <button className="flex-1 py-4 text-slate-400 text-center active:text-cyan-400">DarkNet Market</button>
          <button className="flex-1 py-4 text-slate-400 text-center active:text-cyan-400">КОНТРАКТ</button>
          <button className="flex-1 py-4 text-slate-400 text-center active:text-cyan-400">АККАУНТ</button>
        </div>
      </div>

      {/* ВЫЕЗЖАЮЩИЙ ГАМБУРГЕР */}
      {isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-md z-40 flex justify-start transition-all"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-2/3 h-full bg-slate-900 border-r border-slate-800 p-6 pt-24 flex flex-col gap-4 text-slate-200 font-mono"
          >
            <div className="text-cyan-400 font-bold text-lg border-b border-slate-800 pb-2">MENU PROTOCOL</div>
            <button className="text-left py-2 hover:text-cyan-400">Profile Settings</button>
            <button className="text-left py-2 hover:text-cyan-400">Security Keys</button>
            <button className="text-left py-2 hover:text-cyan-400">Disconnect</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
