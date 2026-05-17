import { useEffect, useState, useCallback } from 'react';
import { useTelegram } from './hooks/useTelegram';

function App() {
  const { tg, initData } = useTelegram();
  const [score, setScore] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!initData) return;

    fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setScore(data.live_score);
      });
  }, [initData]);

  const handleTap = useCallback(() => {
    fetch('/api/tap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData, count: 1 }),
    })
      .then(res => res.json())
      .then(data => setScore(data.live_score));
  }, [initData]);

  if (!user) return <div className="flex items-center justify-center h-full bg-black text-green-400 font-mono">Loading...</div>;

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
