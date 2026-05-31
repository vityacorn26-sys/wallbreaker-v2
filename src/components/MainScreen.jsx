import React, { useState, useRef } from 'react';
import { CloudWidget } from './CloudWidget';
import cat1 from '../assets/cat1.jpg';
import cat2 from '../assets/cat2.jpg';
import cat3 from '../assets/cat3.jpg';
import cat4 from '../assets/cat4.jpg';
import cat5 from '../assets/cat5.jpg';

const API = 'https://wb-v2-api.corterbs.dpdns.org';
const RANK_IMAGES = { 1: cat1, 2: cat2, 3: cat3, 4: cat4, 5: cat5 };
const REWARDS_BY_RANK = { 1: 10, 2: 25, 3: 60, 4: 150, 5: 400 };

export function MainScreen({ user, wbc, setWbc, cpu, setCpu, liveScore, setLiveScore, rank }) {
  const [buffer, setBuffer] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [scoreAnimations, setScoreAnimations] = useState([]);
  const debounceTimeoutRef = useRef(null);

  const sendPackToServer = (currentBuffer) => {
    if (currentBuffer <= 0) return;
    setIsSyncing(true);

    fetch(`${API}/api/tap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: window.Telegram?.WebApp?.initData || '', count: currentBuffer })
    })
    .then(res => res.json())
    .then(data => {
      setIsSyncing(false);
      if (!data.error) {
        setWbc(data.wbc_balance);
        setCpu(data.energy);
        setLiveScore(data.draw_score_cached);
        
        if (data.scoreDelta > 0) {
          const newAnim = {
            id: Date.now(),
            val: `+${data.scoreDelta.toFixed(3)}`,
            type: data.activityType
          };
          setScoreAnimations(prev => [...prev, newAnim]);
          setTimeout(() => {
            setScoreAnimations(prev => prev.filter(a => a.id !== newAnim.id));
          }, 2000);
        }
      }
    })
    .catch(() => setIsSyncing(false));
  };

  const handleTap = () => {
    if (cpu <= 0) return;
    
    const tapReward = REWARDS_BY_RANK[rank] || 10;
    setWbc(prev => prev + tapReward);
    setCpu(prev => Math.max(0, prev - 1));
    
    setBuffer(prev => {
      const newBuffer = prev + 1;
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = setTimeout(() => {
        sendPackToServer(newBuffer);
        setBuffer(0);
      }, 850);
      return newBuffer;
    });
  };

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-between p-4 pt-8 pb-24 select-none overflow-hidden">
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <img src={RANK_IMAGES[rank] || cat1} alt="" className="w-full h-full object-cover opacity-95 animate-breathe transform scale-105" />
      </div>

      <div className="w-full flex justify-between items-start z-10 pt-10">
        <div className="bg-[#0b1219]/90 border border-cyan-500/30 px-4 py-2 rounded-2xl backdrop-blur-md shadow-[0_0_15px_rgba(12,243,199,0.15)]">
          <div className="text-[11px] font-black font-mono tracking-widest text-[#0cf3c7] uppercase">
            {user.rank_name || "Proxy Hacker"}
          </div>
          <div className="text-[8px] text-[#86929d] font-mono tracking-wider font-semibold uppercase mt-1">
            R{rank} IS LIVE
          </div>
        </div>
        <CloudWidget liveScore={liveScore} animations={scoreAnimations} />
      </div>

      <div className="my-4 text-center z-10">
        <div className="text-[10px] font-mono text-[#86929d] tracking-widest uppercase mb-1">BALANCE</div>
        <div className="text-4xl font-black font-mono tracking-wider text-slate-100 flex items-center justify-center gap-2 drop-shadow-lg">
          {Math.floor(wbc).toLocaleString()}
          <span className="text-[#0cf3c7] font-bold text-xl">WBC</span>
        </div>
      </div>

      <div className="relative w-full max-w-[280px] aspect-square flex flex-col items-center justify-center my-auto z-10">
        <button
          onPointerDown={handleTap}
          className={`w-full h-full relative rounded-[2.5rem] overflow-hidden border-2 border-cyan-500/30 shadow-[0_0_35px_rgba(12,243,199,0.2)] active:scale-[0.96] transition-transform duration-75 ease-out select-none touch-none animate-breathe flex items-center justify-center ${cpu <= 0 ? 'opacity-50 grayscale' : ''}`}
        >
          <img src={RANK_IMAGES[rank] || cat1} alt="Cat" className="w-full h-full object-cover absolute inset-0 opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 via-pink-500 to-amber-400 opacity-20 mix-blend-overlay pointer-events-none animate-gradient" />
        </button>

        <div className="h-6 mt-6 w-full flex items-center justify-center font-mono text-[10px]">
          {isSyncing ? (
            <span className="text-pink-400 font-bold tracking-widest animate-pulse">⚡ SYNCING PACKETS...</span>
          ) : buffer > 0 ? (
            <span className="text-[#0cf3c7] font-semibold tracking-wider">BUFFER: {buffer} TAPS</span>
          ) : (
            <span className="text-gray-500 tracking-wider">CONNECTION SECURE</span>
          )}
        </div>
      </div>

      <div className="w-full max-w-[280px] z-10 mt-4">
        <div className="bg-[#0a1017] rounded-2xl h-6 border-2 border-[#14232c] overflow-hidden relative shadow-inner">
          <div className="h-full bg-gradient-to-r from-pink-500 via-pink-400 to-[#0cf3c7] transition-all duration-300 shadow-[0_0_12px_rgba(255,105,180,0.5)]" style={{ width: `${cpu}%` }} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[10px] font-mono text-white font-black tracking-widest uppercase drop-shadow-md">
              CPU {cpu}/100
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
