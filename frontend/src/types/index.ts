export interface VehicleStatus {
  id: number;
  plateNumber: string;
  lastLatitude: number | null;
  lastLongitude: number | null;
  lastSpeed: number | null;
  lastHeading: number | null;
  lastRecordedAt: string | null;
  status: 'EN_MOVIMIENTO' | 'DETENIDO' | 'SIN_SENAL';
}

export interface GpsRequest {
  vehicleId: string;
  lat: number;
  lng: number;
  timestamp: string;
  speed?: number;
  heading?: number;
  altitude?: number;
  ignition?: boolean;
}

export interface GpsResponse {
  status: string;
  message: string;
  readingId: number;
}

export interface ApiError {
  status: number;
  title: string;
  detail: string;
  type: string;
  timestamp: string;
  errors?: Array<{
    field: string;
    message: string;
    rejectedValue: string;
  }>;
}
