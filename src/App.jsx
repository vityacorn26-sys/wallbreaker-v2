import React, { useState, useEffect, useRef } from 'react';
import './index.css';
​// Импортируем оригинальные ассеты
import cat1 from './assets/cat1.jpg';
import cat2 from './assets/cat2.jpg';
import cat3 from './assets/cat3.jpg';
import cat4 from './assets/cat4.jpg';
import cat5 from './assets/cat5.jpg';
import loadingImg from './assets/loading.jpg';
import serverImg from './assets/server.jpg';
​const API = 'https://wb-v2-api.corterbs.dpdns.org';
const PROXY_BOT_URL = 'https://t.me/hiddifyProxySale_bot';
​const RANK_IMAGES = {
1: cat1,
2: cat2,
3: cat3,
4: cat4,
5: cat5
};
​const RANK_REWARDS = { 1: 10, 2: 25, 3: 60, 4: 150, 5: 400 };
​export default function App() {
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
const [menuOpen, setMenuOpen] = useState(false);
const [tgInitData, setTgInitData] = useState('');
const [isTapping, setIsTapping] = useState(false);
​const clicksBufferRef = useRef(0);
const debounceTimeoutRef = useRef(null);
const userStateRef = useRef(null);
​// Синхронизируем реф состояния пользователя для батчинга
useEffect(() => {
userStateRef.current = user;
}, [user]);
​useEffect(() => {
if (window.Telegram?.WebApp) {
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();
const initDataStr = tg.initData || '';
setTgInitData(initDataStr);
​fetch(${API}/api/user, {
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
​// Пакетная отправка накопленных тапов
const sendPackToServer = () => {
const totalTaps = clicksBufferRef.current;
if (totalTaps <= 0) return;
​// Сбрасываем буфер до запроса во избежание гонки данных
clicksBufferRef.current = 0;
​fetch(${API}/api/tap, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ initData: tgInitData, count: totalTaps })
})
.then(res => res.json())
.then(data => {
if (!data.error) {
// Железно синхронизируем актуальное состояние с БД бэкенда
setUser(data);
}
})
.catch(err => {
console.error("Batch send error:", err);
});
};
​const handleTap = () => {
if (!user || user.energy <= 0) return;
​const currentRankId = user.rank_id || 1;
const rewardPerTap = RANK_REWARDS[currentRankId] || 10;
​setIsTapping(true);
setTimeout(() => setIsTapping(false), 80);
​// Локальное мгновенное обновление UI
setUser(prev => ({
...prev,
wbc_balance: prev.wbc_balance + rewardPerTap,
energy: Math.max(0, prev.energy - 1)
}));
​clicksBufferRef.current += 1;
​// Сброс и запуск таймаута пакетной отправки (850 мс)
if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
debounceTimeoutRef.current = setTimeout(sendPackToServer, 850);
};
​// Кнопка Proxy сворачивает/закрывает WebApp и открывает бота продаж
const handleProxyClick = (e) => {
e.preventDefault();
if (window.Telegram?.WebApp) {
// Сначала инициируем открытие внешней ссылки бота
window.Telegram.WebApp.openTelegramLink(PROXY_BOT_URL);
// Следом принудительно закрываем текущий клиент игры
setTimeout(() => {
window.Telegram.WebApp.close();
}, 100);
} else {
window.open(PROXY_BOT_URL, '_blank');
}
};
​if (loading) {
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
​const currentRankId = user?.rank_id || 1;
const currentRankImage = RANK_IMAGES[currentRankId] || cat1;
const currentRankName = user?.rank_name || "Proxy Hacker";
​return (
<div className="relative min-h-screen bg-slate-950 text-white font-mono select-none overflow-hidden flex flex-col justify-between p-4 pb-20">
​{/* ПУЛЬСИРУЮЩИЙ ДЫШАЩИЙ ФОН (Без размытия, без сильного затемнения) */}
<div className="absolute inset-0 opacity-25 pointer-events-none animate-[breathe_8s_ease-in-out_infinite]">
<img src={currentRankImage} alt="Background Node" className="w-full h-full object-cover" />
</div>
​{/* ВЕРХНЯЯ ПАНЕЛЬ С КНОПКОЙ МЕНЮ, ОПУЩЕННОЙ НИЖЕ СИСТЕМНОЙ ЗОНЫ */}
<div className="relative z-10 w-full flex justify-between items-center pt-12">
<button
onClick={() => setMenuOpen(true)}
className="w-11 h-11 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-center items-center gap-1.5 active:scale-95 transition-transform"
>
<div className="w-5 h-0.5 bg-cyan-400"></div>
<div className="w-5 h-0.5 bg-cyan-400"></div>
<div className="w-5 h-0.5 bg-cyan-400"></div>
</button>
​{/* Индикатор текущей ноды в углу */}
<div className="bg-slate-900/80 border border-cyan-500/20 px-3 py-1 rounded-lg text-[9px] text-cyan-400 font-black tracking-widest uppercase">
R{currentRankId} NODE ACTIVE
</div>
</div>
​{/* ЦЕНТР: РАНГ, БАЛАНС И ПОДНЯТАЯ КНОПКА ТАПА */}
<div className="relative z-10 flex flex-col items-center justify-center my-auto gap-4 w-full -mt-4">
​{/* КРУПНОЕ НАЗВАНИЕ РАНГА ПО ЦЕНТРУ */}
<div className="text-center mb-1">
<h2 className="text-lg font-black tracking-widest text-cyan-400 uppercase drop-shadow-[0_2px_8px_rgba(34,211,238,0.3)]">
{currentRankName}
</h2>
</div>
​{/* БАЛАНС */}
<div className="text-center mb-2">
<h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
{user?.wbc_balance?.toLocaleString() || 0} <span className="text-cyan-400 text-2xl font-black">$WBC</span>
</h1>
</div>
​{/* КНОПКА-КОТ (Дыхание + переливающийся градиент) /}
<button
onClick={handleTap}
style={{ transform: isTapping ? 'scale(0.975)' : 'scale(1)' }}
className={relative w-64 h-64 rounded-[2.5rem] overflow-hidden border-4 transition-all duration-75 outline-none animate-[breathe_4s_ease-in-out_infinite] ${isTapping  ? 'border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.6)]'  : 'border-cyan-400 shadow-[0_0_35px_rgba(34,211,238,0.35)]' }}
>
{/ Слой переливающегося кибер-градиента */}
<div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-purple-500/30 animate-[pulse_3s_infinite] pointer-events-none"></div>
<img src={currentRankImage} alt="Core Matrix" className="w-full h-full object-cover" />
</button>
​{/* CPU ИНДИКАТОР */}
<div className="w-full max-w-xs flex flex-col gap-1.5 mt-2">
<div className="flex justify-between text-[10px] tracking-wider text-slate-400 px-1">
<span>CORE CPU LOAD</span>
<span className="text-cyan-400 font-black">{user?.energy || 0}%</span>
</div>
<div className="w-full h-2 bg-slate-900 rounded-full border border-slate-800/60 overflow-hidden">
<div
className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 transition-all duration-300"
style={{ width: ${user?.energy || 0}% }}
></div>
</div>
</div>
</div>
​{/* НИЖНИЙ ЛЕВЫЙ УГОЛ: ФИКСИРОВАННАЯ КНОПКА КЛИЕНТА ДЛЯ СВОРАЧИВАНИЯ И ПЕРЕХОДА НА БОТА ПРОКСИ */}
<div className="fixed bottom-6 left-6 z-20">
<button 
onClick={handleProxyClick}
className="flex flex-col items-center justify-center p-1.5 bg-slate-900/90 border border-slate-800 rounded-xl active:scale-90 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.15)]"
>
<div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-700/60 flex items-center justify-center">
<img src={serverImg} alt="Proxy Sales Bot" className="w-full h-full object-cover" />
</div>
<span className="text-[8px] mt-1 font-bold text-cyan-400 tracking-wider">SRV bot</span>
</button>
</div>
​{/* НИЖНИЙ ТАБ-БАР (ПРОФЕССИОНАЛЬНАЯ СТРУКТУРА) /}
<div className="relative z-10 bg-slate-900/95 border border-slate-800/80 p-2 rounded-2xl backdrop-blur-lg w-full max-w-xs mx-auto mb-2">
<div className="grid grid-cols-4 gap-1">
<button className="flex flex-col items-center justify-center p-1.5 rounded-xl text-cyan-400 font-black bg-slate-800/40 border border-cyan-500/10">
<span className="text-[10px]">ГЛАВНАЯ</span>
</button>
<button className="flex flex-col items-center justify-center p-1.5 rounded-xl text-slate-400">
<span className="text-[10px]">TASKS</span>
</button>
{/ Вернули каноничное название DarkNet Market */}
<button className="flex flex-col items-center justify-center p-1.5 rounded-xl text-slate-400 text-center leading-tight">
<span className="text-[9px] block">DARKNET</span>
<span className="text-[8px] block opacity-80">MARKET</span>
</button>
<button className="flex flex-col items-center justify-center p-1.5 rounded-xl text-slate-400">
<span className="text-[10px]">АККАУНТ</span>
</button>
</div>
</div>
​{/* БОКОВОЕ ГАМБУРГЕР-МЕНЮ */}
<div className={fixed inset-y-0 left-0 w-72 bg-slate-950/98 border-r border-slate-900 z-50 transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-out p-6 flex flex-col justify-between backdrop-blur-md}>
<div className="flex flex-col gap-6">
<div className="flex justify-between items-center border-b border-slate-900 pb-4 pt-8">
<h2 className="text-cyan-400 font-black tracking-widest text-xs uppercase">⚡ PROTOCOL CORE</h2>
<button onClick={() => setMenuOpen(false)} className="text-slate-500 hover:text-white transition-colors text-lg">✕</button>
</div>
​<nav className="flex flex-col gap-2.5">
<button className="w-full text-left p-3 rounded-xl bg-gradient-to-r from-cyan-950/30 to-slate-900 border border-cyan-500/20 hover:border-cyan-400 transition-all group active:scale-[0.98]">
<div className="text-xs font-black text-white group-hover:text-cyan-400 transition-colors">Code Injection</div>
<div className="text-[10px] text-cyan-500/80 font-mono mt-0.5">+1,500 WBC & Full CPU</div>
</button>
​<button className="w-full text-left p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all active:scale-[0.98]">
<div className="text-xs font-bold text-slate-300">Referral Node</div>
<div className="text-[10px] text-slate-500 font-mono mt-0.5">Grid network mapping</div>
</button>
​<button className="w-full text-left p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all active:scale-[0.98]">
<div className="text-xs font-bold text-slate-300">Breach Board</div>
<div className="text-[10px] text-slate-500 font-mono mt-0.5">Global cyber leaderboard</div>
</button>
​<button className="w-full text-left p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all active:scale-[0.98]">
<div className="text-xs font-bold text-slate-300">Promocode</div>
<div className="text-[10px] text-slate-500 font-mono mt-0.5">Decrypt operational vouchers</div>
</button>
</nav>
</div>
​<div className="text-[10px] text-slate-700 text-center border-t border-slate-900 pt-4 font-mono uppercase tracking-widest">
WallBreaker OS v2.0.0
</div>
</div>
​{/* ОВЕРЛЕЙ ЗАКРЫТИЯ */}
{menuOpen && (
<div onClick={() => setMenuOpen(false)} className="fixed inset-0 bg-black/60 z-40 transition-opacity"></div>
)}
​{/* КАСТОМНЫЕ СТИЛИ ДЛЯ ДЫХАНИЯ И ПУЛЬСАЦИИ */}
<style>{@keyframes breathe { 0%, 100% { transform: scale(1); opacity: 0.25; } 50% { transform: scale(1.03); opacity: 0.32; } } button animate-[breathe_4s_ease-in-out_infinite] { @keyframes breathe-btn { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.015); } } animation: breathe-btn 4s ease-in-out infinite; }}</style>
​</div>
);
}
EOF
