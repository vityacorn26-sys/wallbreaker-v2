import { useEffect, useState } from 'react';

export const useTelegram = () => {
  const [initData, setInitData] = useState('');
  const [tg, setTg] = useState(null);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tgWebApp = window.Telegram.WebApp;
      tgWebApp.ready();
      tgWebApp.expand();

      if (tgWebApp.initData) {
        setInitData(tgWebApp.initData);
        setTg(tgWebApp);
      } else {
        const checkInitData = setInterval(() => {
          if (tgWebApp.initData) {
            clearInterval(checkInitData);
            setInitData(tgWebApp.initData);
            setTg(tgWebApp);
          }
        }, 100);
        return () => clearInterval(checkInitData);
      }
    } else {
      setInitData('');
      setTg(null);
    }
  }, []);

  return { tg, initData };
};
