import { useEffect, useState } from 'react';
import { useTelegram } from './hooks/useTelegram';
import useTaps from './hooks/useTaps';

// Намертво привязываем фронтенд к Cloudflare-туннелю нового стека
const API = 'https://wb-v2-api.corterbs.dpdns.org';

function App() {
  const { tg, initData } = useTelegram();
  const [score, setScore] = useState(0);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Подключаем наш оптимизированный хук пакетной отправки кликов
  const { handleTap } = useTaps(initData);

  // Первичная авторизация юзера при входе по реальной initData
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

  // Локальный клик (визуально крутит баланс для юзера мгновенно)
  const onTapClick = () => {
    setScore(prev => prev + 1); // Live score растёт на фронте сразу
    handleTap(); // Пакет копится в буфере хука
  };

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-6 text-cyber-red font-mono">
        <div className="border border-cyber-red p-4 bg-black/40 rounded-lg">
          [CRITICAL ERROR]: {error}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-950 text-cyber-cyan font-mono text-xl animate-pulse">
        CONNECTING TO CORE...
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-slate-950 flex flex-col justify-between p-4 overflow-hidden select-none select-none">
      
      {/* ВЕРХНЯЯ ПАНЕЛЬ: Смещённый вниз гамбургер под Fullscreen кнопку Телеграма */}
      <div className="w-full flex items-center justify-between pt-10 px-2 z-50">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-12 h-12 bg-slate-900 border border-cyber-cyan rounded-xl flex flex-col justify-center items-center gap-1.5 active:scale-90 transition-transform"
        >
          <span className="w-6 h-0.5 bg-cyber-cyan"></span>
          <span className="w-6 h-0.5 bg-cyber-cyan"></span>
          <span className="w-6 h-0.5 bg-cyber-cyan"></span>
        </button>

        {/* Индикатор статуса раунда (Верхний виджет) */}
        <div className="bg-black/50 border border-slate-800 rounded-xl px-4 py-2 text-right">
          <div className="text-xs text-cyber-cyan font-bold tracking-wider">TUNNEL MASTER</div>
          <div className="text-[10px] text-slate-400">R{user.current_round || 4} • ACTIVE</div>
        </div>
      </div>

      {/* ГЛАВНЫЙ ЭКРАН (БЕЗ РАЗМЫТИЯ) */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 z-10">
        
        {/* LIVE SCORE: Текст в цвете Блестящий Металлик */}
        <div className="text-4xl font-extrabold tracking-tight text-metallic drop-shadow-[0_0_15px_rgba(226,232,240,0.3)]">
          {score.toLocaleString()} $WBC
        </div>

        {/* ТУЧКА (Индикатор бонуса) с плавной анимацией дыхания */}
        <div className="bg-slate-900/80 border border-pink-900/30 px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(244,114,182,0.15)] animate-pulse-live">
          <span className="text-xs font-bold text-neon-pink">+435.51 CORE TAP</span>
        </div>

        {/* ЦЕНТРАЛЬНЫЙ КОТ: Интерактивная зона тапа */}
        <div 
          onClick={onTapClick}
          onTouchStart={(e) => { e.preventDefault(); onTapClick(); }}
          className="w-72 h-72 rounded-3xl border-2 border-cyber-cyan overflow-hidden bg-black/20 shadow-[0_0_30px_rgba(6,182,212,0.2)] active:scale-95 transition-transform duration-75 cursor-pointer"
        >
          <img 
            src="/wallbreaker-v2/public/assets/hero.png" 
            alt="Cyber Cat" 
            className="w-full h-full object-cover pointer-events-none"
            onError={(e) => { e.target.src = 'https://placekitten.com/300/300' }} 
          />
        </div>

        {/* ЭНЕРГИЯ / CPU */}
        <div className="w-full max-w-xs flex flex-col items-center gap-1">
          <div className="text-xs text-slate-400 font-bold">CPU: {user.energy || 79} / 100</div>
          <div className="w-full h-3 bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-pink-500 to-cyber-cyan rounded-full transition-all duration-300"
              style={{ width: `${user.energy || 79}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* НИЖНЯЯ ПАНЕЛЬ: Иконка сервера (слева) и ТАБ-БАР (центр) */}
      <div className="w-full flex items-center justify-between gap-2 pb-2 z-10">
        
        {/* Иконка Server.jpg со ссылкой на твоего бота продаж подписок VPN */}
        <a 
          href="https://t.me/Hiddify_Proxy_Bot_Example" 
          target="_blank" 
          rel="noreferrer"
          className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center active:scale-90 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.1)]"
        >
          <img src="/wallbreaker-v2/public/assets/server.jpg" alt="VPN" className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://placekitten.com/50/50' }} />
        </a>

        {/* ТАБ-БАР: Главные разделы */}
        <div className="flex-1 flex bg-slate-950/90 border border-slate-800 rounded-xl p-1 justify-between text-[11px] font-bold">
          <button className="flex-1 py-2.5 rounded-lg bg-cyber-cyan text-slate-950 font-extrabold text-center">HOME</button>
          <button className="flex-1 py-2.5 text-slate-400 text-center">TASKS</button>
          <button className="flex-1 py-2.5 text-slate-400 text-center">MARKET</button>
          <button className="flex-1 py-2.5 text-slate-400 text-center">CONTRACT</button>
          <button className="flex-1 py-2.5 text-slate-400 text-center">ACCOUNT</button>
        </div>
      </div>

      {/* ВЫЕЗЖАЮЩИЙ ГАМБУРГЕР (ЕДИНСТВЕННОЕ МЕСТО С РАЗМЫТИЕМ) */}
      {isMenuOpen && (
        <div 
          onClick={() => setIsMenuOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-md z-40 flex justify-start transition-all animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="w-2/3 h-full bg-slate-900 border-r border-slate-800 p-6 pt-20 flex flex-col gap-4 text-metallic"
          >
            <div className="text-cyber-cyan font-bold text-lg border-b border-slate-800 pb-2">MENU PROTOCOL</div>
            <button className="text-left py-2 hover:text-cyber-cyan">Profile Settings</button>
            <button className="text-left py-2 hover:text-cyber-cyan">Security Keys</button>
            <button className="text-left py-2 hover:text-cyber-cyan">Disconnect</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
