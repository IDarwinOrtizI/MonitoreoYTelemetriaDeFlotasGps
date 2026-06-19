import { useState, useEffect, useCallback, useRef } from 'react';
import { vehicleService } from '../services';
import type { VehicleStatus } from '../types';

const POLL_INTERVAL = 5000;

export function useVehicles(poll = true) {
  const [vehicles, setVehicles] = useState<VehicleStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vehicleService.getAll();
      setVehicles(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener vehiculos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    if (!poll) return;

    intervalRef.current = setInterval(fetchVehicles, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [poll, fetchVehicles]);

  return { vehicles, loading, error, lastUpdated, refetch: fetchVehicles };
}
