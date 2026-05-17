import { useEffect, useState } from 'react';

export const useTelegram = () => {
  const [initData, setInitData] = useState('');
  const [tg, setTg] = useState(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    tg.ready();
    tg.expand();

    if (tg.initData) {
      setInitData(tg.initData);
      setTg(tg);
    } else {
      const checkInitData = setInterval(() => {
        if (tg.initData) {
          clearInterval(checkInitData);
          setInitData(tg.initData);
          setTg(tg);
        }
      }, 100);
      return () => clearInterval(checkInitData);
    }
  }, []);

  return { tg, initData };
};
