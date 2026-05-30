import { useState, useEffect } from 'react';

export function useCountdown(approvedAt: string | null, deliveryMinutes: number) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!approvedAt) { setRemaining(0); return; }
    const deadline = new Date(approvedAt).getTime() + deliveryMinutes * 60 * 1000;

    const tick = () => setRemaining(Math.max(0, Math.floor((deadline - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [approvedAt, deliveryMinutes]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  return {
    remaining,
    isExpired: remaining === 0 && !!approvedAt,
    formatted: `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
  };
}
