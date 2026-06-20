import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useMemo } from 'react';
import { useVehicles } from '../../hooks';
import { VehicleStatusBadge } from './VehicleStatusBadge';
import type { VehicleStatus } from '../../types';
import 'leaflet/dist/leaflet.css';

const STATUS_COLORS: Record<VehicleStatus['status'], string> = {
  EN_MOVIMIENTO: '#22c55e',
  DETENIDO: '#eab308',
  SIN_SENAL: '#ef4444',
};

function createMarkerIcon(status: VehicleStatus['status']): L.DivIcon {
  const color = STATUS_COLORS[status];
  return L.divIcon({
    html: `<div style="width:20px;height:20px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function FitBounds({ vehicles }: { vehicles: VehicleStatus[] }) {
  const map = useMap();

  useEffect(() => {
    const valid = vehicles.filter(
      (v) => v.lastLatitude !== null && v.lastLongitude !== null
    );

    if (valid.length === 0) return;

    if (valid.length === 1) {
      map.setView([valid[0].lastLatitude!, valid[0].lastLongitude!], 15);
      return;
    }

    const bounds = L.latLngBounds(
      valid.map((v) => [v.lastLatitude!, v.lastLongitude!] as L.LatLngTuple)
    );
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [vehicles, map]);

  return null;
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function VehicleMap() {
  const { vehicles, lastUpdated } = useVehicles();

  const validVehicles = useMemo(
    () =>
      vehicles.filter(
        (v) => v.lastLatitude !== null && v.lastLongitude !== null
      ),
    [vehicles]
  );

  const defaultCenter: L.LatLngTuple = [-12.0464, -77.0428];

  const mapKey = useMemo(() => `map-${Date.now()}`, [vehicles.length > 0]);

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200">
      {lastUpdated && (
        <div className="absolute top-2 right-2 z-[1000] bg-white/90 px-3 py-1.5 rounded-lg shadow-md text-xs text-gray-600 backdrop-blur-sm">
          Actualizado: {lastUpdated.toLocaleTimeString('es-PE')}
        </div>
      )}

      <MapContainer
        key={mapKey}
        center={defaultCenter}
        zoom={13}
        style={{ height: '500px', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds vehicles={vehicles} />

        {validVehicles.map((vehicle) => (
          <Marker
            key={vehicle.id}
            position={[vehicle.lastLatitude!, vehicle.lastLongitude!]}
            icon={createMarkerIcon(vehicle.status)}
          >
            <Popup>
              <div style={{ textAlign: 'center', padding: '4px', minWidth: '140px' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>
                  Vehiculo #{vehicle.id}
                </div>
                <div style={{ marginBottom: '6px' }}>
                  <VehicleStatusBadge status={vehicle.status} />
                </div>
                {vehicle.lastSpeed !== null && (
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>
                    Velocidad: {vehicle.lastSpeed.toFixed(1)} km/h
                  </div>
                )}
                {vehicle.lastRecordedAt && (
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                    {formatDateTime(vehicle.lastRecordedAt)}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {validVehicles.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-[999] pointer-events-none">
          <span className="text-gray-400 text-sm">Sin vehiculos con posicion GPS</span>
        </div>
      )}
    </div>
  );
}
