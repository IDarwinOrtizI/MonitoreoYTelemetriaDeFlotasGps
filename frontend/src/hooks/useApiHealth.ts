import { useEffect, useState, useRef } from 'react';
import api from '../config/api';

type Status = 'checking' | 'online' | 'offline';

export function useApiHealth(pollMs = 10000) {
  const [status, setStatus] = useState<Status>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    stoppedRef.current = false;

    const check = async () => {
      try {
        await api.get('/vehicles', { timeout: 4000 });
        if (!stoppedRef.current) {
          setStatus('online');
          setLastChecked(new Date());
        }
      } catch {
        if (!stoppedRef.current) {
          setStatus('offline');
          setLastChecked(new Date());
        }
      }
    };

    check();
    const id = setInterval(check, pollMs);

    return () => {
      stoppedRef.current = true;
      clearInterval(id);
    };
  }, [pollMs]);

  return { status, lastChecked };
}
