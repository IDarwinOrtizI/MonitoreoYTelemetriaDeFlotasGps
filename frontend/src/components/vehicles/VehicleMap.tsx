import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useVehicles } from '../../hooks';
import { VehicleStatusBadge } from './VehicleStatusBadge';
import { formatDateTime, formatSpeed, formatTimeOnly } from '../../utils/format';
import { getStatusColor } from '../../utils/vehicleStatus';
import type { VehicleStatus } from '../../types';
import 'leaflet/dist/leaflet.css';
import styles from './VehicleMap.module.css';

interface VehicleMapProps {
  /** Override de loading. Si no se provee, se usa el del hook `useVehicles`. */
  loading?: boolean;
  /** Override de error. Si no se provee, se usa el del hook `useVehicles`. */
  error?: string | null;
}

const DEFAULT_CENTER: L.LatLngTuple = [4.6090, -74.0810];
const DEFAULT_ZOOM = 12;

function createMarkerIcon(status: VehicleStatus['status']): L.DivIcon {
  const color = getStatusColor(status);
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

/**
 * Auto-fit SOLO en el primer render con vehículos válidos o cuando el usuario
 * hace clic en "Recentrar". Evita que el mapa salte cada 5s con el polling.
 */
function FitBounds({
  vehicles,
  fitTrigger,
  onFitDone,
}: {
  vehicles: VehicleStatus[];
  fitTrigger: number;
  onFitDone: () => void;
}) {
  const map = useMap();
  const hasFittedRef = useRef(false);

  useEffect(() => {
    const valid = vehicles.filter(
      (v) => v.lastLatitude !== null && v.lastLongitude !== null
    );
    if (valid.length === 0) return;

    // Solo ajustar en el primer render válido, o cuando el usuario pidió re-fit
    if (hasFittedRef.current && fitTrigger === 0) return;
    hasFittedRef.current = true;
    onFitDone();

    if (valid.length === 1) {
      map.setView([valid[0].lastLatitude!, valid[0].lastLongitude!], 15);
      return;
    }

    const bounds = L.latLngBounds(
      valid.map((v) => [v.lastLatitude!, v.lastLongitude!] as L.LatLngTuple)
    );
    map.fitBounds(bounds, { padding: [60, 60] });
  }, [vehicles, map, fitTrigger, onFitDone]);

  return null;
}

const ICON_PIN = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

const ICON_RECENTER = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
  </svg>
);

export function VehicleMap({ loading: loadingProp, error: errorProp }: VehicleMapProps = {}) {
  const {
    vehicles,
    lastUpdated,
    loading: loadingHook,
    error: errorHook,
  } = useVehicles();
  const loading = loadingProp ?? loadingHook;
  const error = errorProp ?? errorHook;

  const validVehicles = useMemo(
    () =>
      vehicles.filter(
        (v) => v.lastLatitude !== null && v.lastLongitude !== null
      ),
    [vehicles]
  );

  const [fitTrigger, setFitTrigger] = useState(0);

  function handleRefit() {
    setFitTrigger((k) => k + 1);
  }

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

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.recenterButton}
            onClick={handleRefit}
            disabled={validVehicles.length === 0}
            aria-label="Recentrar mapa"
            title="Recentrar mapa"
          >
            {ICON_RECENTER}
            <span>Recentrar</span>
          </button>

          {lastUpdated && (
            <div className={styles.lastUpdate}>
              <span className={styles.liveDot} />
              <span>Actualizado {formatTimeOnly(lastUpdated)}</span>
            </div>
          )}
        </div>
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

            <FitBounds
              vehicles={validVehicles}
              fitTrigger={fitTrigger}
              onFitDone={() => {
                /* El ref interno evita repetir el fit; este callback queda
                   como hook para futura lógica de UX (p.ej. analytics). */
              }}
            />

            {validVehicles.map((vehicle) => (
              <Marker
                key={vehicle.id}
                position={[vehicle.lastLatitude!, vehicle.lastLongitude!]}
                icon={createMarkerIcon(vehicle.status)}
              >
                <Popup>
                  <div className={styles.popup}>
                    <div className={styles.popupTitle}>
                      Vehículo #{vehicle.id}
                    </div>
                    <div className={styles.popupBadge}>
                      <VehicleStatusBadge status={vehicle.status} />
                    </div>
                    {vehicle.lastSpeed !== null && (
                      <div className={styles.popupRow}>
                        Velocidad: <strong>{formatSpeed(vehicle.lastSpeed)}</strong>
                      </div>
                    )}
                    {vehicle.lastLatitude !== null && vehicle.lastLongitude !== null && (
                      <div className={styles.popupCoords}>
                        {vehicle.lastLatitude.toFixed(5)}, {vehicle.lastLongitude.toFixed(5)}
                      </div>
                    )}
                    {vehicle.lastRecordedAt && (
                      <div className={styles.popupTime}>
                        {formatDateTime(vehicle.lastRecordedAt)}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {error && (
          <div className={styles.error} role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {!error && loading && validVehicles.length === 0 && (
          <div className={styles.loading}>
            <div className={styles.spinner} aria-hidden="true" />
            <span>Cargando mapa…</span>
          </div>
        )}

        {!error && !loading && validVehicles.length === 0 && (
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
