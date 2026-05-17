import { useEffect, useState, useCallback } from 'react';
import { useTelegram } from './hooks/useTelegram';

function App() {
  const { tg, initData } = useTelegram();
  const [score, setScore] = useState(0);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!initData) return;

    fetch('/api/user', {
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
        setScore(data.live_score);
      })
      .catch(e => setError(e.message));
  }, [initData]);

  const handleTap = useCallback(() => {
    fetch('/api/tap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData, count: 1 }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setScore(data.live_score);
      })
      .catch(e => setError(e.message));
  }, [initData]);

  if (error) return <div style={{color:'red', background:'#0a0a0a', height:'100vh', padding:20}}>Ошибка: {error}</div>;
  if (!user) return <div style={{color:'lime', background:'#0a0a0a', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>Loading...</div>;

  return (
    <div className="w-full h-full flex flex-col justify-center items-center bg-black text-green-400 font-mono">
      <div className="text-6xl font-bold mb-8">{score}</div>
      <button
        onClick={handleTap}
        onTouchStart={handleTap}
        className="bg-green-400 text-black py-3 px-6 rounded"
      >
        TAP
      </button>
      <p className="text-xl mt-8">Баланс: {user.wbc_balance} WBC</p>
    </div>
  );
}

export default App;
