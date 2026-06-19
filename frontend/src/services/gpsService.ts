import api from '../config/api';
import type { GpsRequest, GpsResponse } from '../types';

export const gpsService = {
  sendCoordinates: async (request: GpsRequest): Promise<GpsResponse> => {
    const { data } = await api.post<GpsResponse>('/gps', request);
    return data;
  },
};
