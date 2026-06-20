import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useMemo } from 'react';
import { useVehicles } from '../../hooks';
import { VehicleStatusBadge } from './VehicleStatusBadge';
import { formatDateTime, formatSpeed } from '../../utils/format';
import type { VehicleStatus } from '../../types';
import 'leaflet/dist/leaflet.css';
import styles from './VehicleMap.module.css';

const STATUS_COLORS: Record<VehicleStatus['status'], string> = {
  EN_MOVIMIENTO: '#10b981',
  DETENIDO: '#f59e0b',
  SIN_SENAL: '#ef4444',
};

const DEFAULT_CENTER: L.LatLngTuple = [4.6090, -74.0810];
const DEFAULT_ZOOM = 12;

function createMarkerIcon(status: VehicleStatus['status']): L.DivIcon {
  const color = STATUS_COLORS[status];
  return L.divIcon({
    html: `
      <div style="
        width:18px;height:18px;
        background:${color};
        border:3px solid #0b1220;
        border-radius:50%;
        box-shadow:0 0 0 2px ${color}55, 0 4px 8px rgba(0,0,0,0.5);
      "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    className: 'vehicle-marker',
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
    map.fitBounds(bounds, { padding: [60, 60] });
  }, [vehicles, map]);

  return null;
}

const ICON_PIN = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

export function VehicleMap() {
  const { vehicles, lastUpdated } = useVehicles();

  const validVehicles = useMemo(
    () => vehicles.filter((v) => v.lastLatitude !== null && v.lastLongitude !== null),
    [vehicles]
  );

  return (
    <section className={styles.wrapper} aria-label="Mapa de vehículos">
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.titleIcon} aria-hidden="true">{ICON_PIN}</div>
          <div className={styles.titleText}>
            <h2 className={styles.title}>Ubicación en tiempo real</h2>
            <span className={styles.subtitle}>{validVehicles.length} vehículos en mapa</span>
          </div>
        </div>

        {lastUpdated && (
          <div className={styles.lastUpdate}>
            <span className={styles.liveDot} />
            <span>Actualizado {lastUpdated.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
        )}
      </header>

      <div className={styles.mapContainer}>
        <div className={styles.map}>
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            scrollWheelZoom
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            <FitBounds vehicles={vehicles} />

            {validVehicles.map((vehicle) => (
              <Marker
                key={vehicle.id}
                position={[vehicle.lastLatitude!, vehicle.lastLongitude!]}
                icon={createMarkerIcon(vehicle.status)}
              >
                <Popup>
                  <div style={{ minWidth: 180 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: '#94a3b8' }}>
                      Vehículo #{vehicle.id}
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <VehicleStatusBadge status={vehicle.status} />
                    </div>
                    {vehicle.lastSpeed !== null && (
                      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>
                        Velocidad: <strong style={{ color: '#94a3b8' }}>{formatSpeed(vehicle.lastSpeed)}</strong>
                      </div>
                    )}
                    {vehicle.lastLatitude !== null && vehicle.lastLongitude !== null && (
                      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, fontFamily: 'var(--font-mono)' }}>
                        {vehicle.lastLatitude.toFixed(5)}, {vehicle.lastLongitude.toFixed(5)}
                      </div>
                    )}
                    {vehicle.lastRecordedAt && (
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
                        {formatDateTime(vehicle.lastRecordedAt)}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {validVehicles.length === 0 && (
          <div className={styles.empty}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            <span>Sin vehículos con posición GPS</span>
          </div>
        )}
      </div>
    </section>
  );
}
