import { useState, useEffect, useCallback } from 'react';
import { vehicleService } from '../services';
import type { VehicleStatus } from '../types';

export function useVehicles() {
  const [vehicles, setVehicles] = useState<VehicleStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vehicleService.getAll();
      setVehicles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching vehicles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return { vehicles, loading, error, refetch: fetchVehicles };
}
