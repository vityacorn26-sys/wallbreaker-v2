import React, { useEffect, useState, useCallback } from 'react';
import { useTelegram } from './hooks/useTelegram';
import useTaps from './hooks/useTaps';

const App = () => {
  const { initData } = useTelegram();
  const [userData, setUserData] = useState(null);
  const { handleTap } = useTaps(initData);

  useEffect(() => {
    if (initData) {
      fetch('/api/user')
        .then(response => response.json())
        .then(data => setUserData(data));
    }
  }, [initData]);

  if (!userData) {
    return <div className="flex items-center justify-center h-screen bg-black text-green-400 font-mono">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-black text-green-400 font-mono">
      <div className="text-2xl mb-4">Live Score: {userData.live_score}</div>
      <div className="text-2xl mb-4">Balance: {userData.wbc_balance} WBC</div>
      <button
        className="w-44 h-44 rounded-full border-4 border-green-400 bg-gray-900 
                   flex items-center justify-center
                   active:scale-95 transition-transform duration-100
                   shadow-[0_0_15px_#00ff41] animate-pulse"
        onClick={handleTap}
        onTouchStart={handleTap}
      >
        <span className="text-2xl font-bold">TAP</span>
      </button>
    </div>
  );
};

export default App;
