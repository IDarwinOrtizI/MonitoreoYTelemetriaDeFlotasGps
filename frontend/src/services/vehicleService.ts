import api from '../config/api';
import type { VehicleStatus } from '../types';

export const vehicleService = {
  getAll: async (): Promise<VehicleStatus[]> => {
    const { data } = await api.get<VehicleStatus[]>('/vehicles');
    return data;
  },

  getById: async (id: number): Promise<VehicleStatus> => {
    const { data } = await api.get<VehicleStatus>(`/vehicles/${id}`);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/vehicles/${id}`);
  },
};
