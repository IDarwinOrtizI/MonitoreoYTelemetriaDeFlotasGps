import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
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
    className: 'vehicle-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function FitBounds({ vehicles }: { vehicles: VehicleStatus[] }) {
  const map = useMap();

  useEffect(() => {
    const validVehicles = vehicles.filter(
      (v) => v.lastLatitude !== null && v.lastLongitude !== null
    );

    if (validVehicles.length === 0) return;

    if (validVehicles.length === 1) {
      const v = validVehicles[0];
      map.setView([v.lastLatitude!, v.lastLongitude!], 15);
      return;
    }

    const bounds = L.latLngBounds(
      validVehicles.map((v) => [v.lastLatitude!, v.lastLongitude!] as L.LatLngTuple)
    );
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [vehicles, map]);

  return null;
}

export function VehicleMap() {
  const { vehicles, lastUpdated } = useVehicles();

  const validVehicles = vehicles.filter(
    (v) => v.lastLatitude !== null && v.lastLongitude !== null
  );

  const defaultCenter: L.LatLngTuple = [-12.0464, -77.0428];

  return (
    <div className="relative">
      {lastUpdated && (
        <div className="absolute top-2 right-2 z-[1000] bg-white px-3 py-1.5 rounded-lg shadow-md text-xs text-gray-600">
          Actualizado: {lastUpdated.toLocaleTimeString('es-PE')}
        </div>
      )}

      <MapContainer
        center={defaultCenter}
        zoom={12}
        className="w-full h-[500px] rounded-lg border border-gray-200"
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
              <div className="text-center p-1">
                <div className="font-bold text-gray-900 mb-1">
                  Vehiculo #{vehicle.id}
                </div>
                <div className="mb-1">
                  <VehicleStatusBadge status={vehicle.status} />
                </div>
                {vehicle.lastSpeed !== null && (
                  <div className="text-xs text-gray-500">
                    Velocidad: {vehicle.lastSpeed.toFixed(1)} km/h
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {validVehicles.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-[999] pointer-events-none">
          <span className="text-gray-500">Sin vehiculos con posicion GPS</span>
        </div>
      )}
    </div>
  );
}
