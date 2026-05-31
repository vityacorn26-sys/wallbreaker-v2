import React, { useState, useEffect } from 'react';
import { MainScreen } from './components/MainScreen';
import './index.css';

const API = 'https://wb-v2-api.corterbs.dpdns.org';

export default function App() {
  const [user, setUser] = useState({});
  const [wbc, setWbc] = useState(0);
  const [cpu, setCpu] = useState(100);
  const [liveScore, setLiveScore] = useState(0);
  const [rank, setRank] = useState(1);
  const [loading, setLoading] = useState(true);

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
          setUser(data);
          setWbc(data.wbc_balance || 0);
          setCpu(data.energy ?? 100);
          setLiveScore(data.draw_score_cached || 0);
          setRank(data.rank_id || 1);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <div className="fixed inset-0 bg-slate-950 z-50"></div>;

  return (
    <div className="w-full h-screen bg-black/95 flex justify-center items-center overflow-hidden">
      <div className="w-full h-full max-w-md bg-[#05080c] text-slate-200 font-sans overflow-hidden relative flex flex-col">
        <main className="flex-1 overflow-y-auto relative z-0">
          <MainScreen 
            user={user} wbc={wbc} setWbc={setWbc}
            cpu={cpu} setCpu={setCpu}
            liveScore={liveScore} setLiveScore={setLiveScore}
            rank={rank}
          />
        </main>
        
        <nav className="p-4 bg-[#0a1017] border-t border-[#14232c] z-20 flex justify-between px-6">
          <button className="text-[#0cf3c7] font-black text-[10px] uppercase">Главная</button>
          <button className="text-slate-500 font-bold text-[10px] uppercase">Tasks</button>
          <button className="text-slate-500 font-bold text-[10px] uppercase">DarkNet</button>
          <button className="text-slate-500 font-bold text-[10px] uppercase">Контракт</button>
          <button className="text-slate-500 font-bold text-[10px] uppercase">Аккаунт</button>
        </nav>
      </div>
    </div>
  );
}
