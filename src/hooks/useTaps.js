import { useCallback, useRef } from 'react';

export default function useTaps(initData) {
  const tapBuffer = useRef(0);
  const syncTimer = useRef(null);

  const sendBatch = useCallback(async () => {
    const count = tapBuffer.current;
    if (count === 0) return;
    tapBuffer.current = 0;

    try {
      const res = await fetch('/api/tap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData, count }),
      });
      const data = await res.json();
      console.log('Taps sent:', data);
      return data;
    } catch (e) {
      console.error('Batch tap failed:', e);
      return null;
    }
  }, [initData]);

  const handleTap = useCallback(() => {
    tapBuffer.current += 1;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(sendBatch, 300);
  }, [sendBatch]);

  return { handleTap };
}
