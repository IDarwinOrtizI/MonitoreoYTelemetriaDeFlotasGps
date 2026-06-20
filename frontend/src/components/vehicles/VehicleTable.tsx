import { useMemo } from 'react';
import { useVehicles } from '../../hooks';
import { VehicleStatusBadge } from './VehicleStatusBadge';
import { formatDateTime, formatCoordinates } from '../../utils/format';
import type { VehicleStatus } from '../../types';
import styles from './VehicleTable.module.css';

const ICON_TABLE = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="3" x2="15" y2="21" />
  </svg>
);

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const sec = Math.max(0, Math.floor(diffMs / 1000));
  if (sec < 60) return `hace ${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `hace ${min} min`;
  const hr = Math.floor(min / 60);
  return `hace ${hr} h`;
}

function VehicleRow({ vehicle }: { vehicle: VehicleStatus }) {
  return (
    <tr className={styles.row}>
      <td>
        <div className={styles.idCell}>
          <div className={styles.idBadge}>#{vehicle.id}</div>
          <div>
            <div className={styles.idText}>{vehicle.plateNumber}</div>
            <div className={styles.idSub}>ID {vehicle.id}</div>
          </div>
        </div>
      </td>
      <td>
        <VehicleStatusBadge status={vehicle.status} />
      </td>
      <td>
        <span className={styles.coords}>
          {formatCoordinates(vehicle.lastLatitude, vehicle.lastLongitude)}
        </span>
      </td>
      <td>
        {vehicle.lastSpeed !== null ? (
          <span className={styles.speed}>
            {vehicle.lastSpeed.toFixed(1)} <span className={styles.speedUnit}>km/h</span>
          </span>
        ) : (
          <span className={styles.muted}>—</span>
        )}
      </td>
      <td>
        {vehicle.lastRecordedAt ? (
          <div>
            <div className={styles.time}>{formatDateTime(vehicle.lastRecordedAt)}</div>
            <div className={styles.timeAgo}>{timeAgo(vehicle.lastRecordedAt)}</div>
          </div>
        ) : (
          <span className={styles.muted}>Sin datos</span>
        )}
      </td>
    </tr>
  );
}

export function VehicleTable() {
  const { vehicles, loading, error, lastUpdated } = useVehicles();

  const subtitle = useMemo(() => {
    if (loading && vehicles.length === 0) return 'Cargando…';
    if (error) return 'Error de conexión';
    return `${vehicles.length} vehículos registrados`;
  }, [loading, error, vehicles.length]);

  if (loading && vehicles.length === 0) {
    return (
      <section className={styles.wrapper} aria-label="Lista de vehículos">
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.titleIcon}>{ICON_TABLE}</div>
            <div className={styles.titleText}>
              <h2 className={styles.title}>Flota de vehículos</h2>
              <span className={styles.subtitle}>{subtitle}</span>
            </div>
          </div>
        </header>
        <div className={styles.loading}>
          <div className={styles.spinner} aria-hidden="true" />
          <span>Cargando vehículos…</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.wrapper}>
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.titleIcon}>{ICON_TABLE}</div>
            <div className={styles.titleText}>
              <h2 className={styles.title}>Flota de vehículos</h2>
              <span className={styles.subtitle}>{subtitle}</span>
            </div>
          </div>
        </header>
        <div className={styles.error}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.wrapper} aria-label="Lista de vehículos">
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.titleIcon}>{ICON_TABLE}</div>
          <div className={styles.titleText}>
            <h2 className={styles.title}>Flota de vehículos</h2>
            <span className={styles.subtitle}>{subtitle}</span>
          </div>
        </div>
        {lastUpdated && (
          <span className={styles.meta}>
            Actualizado {lastUpdated.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        )}
      </header>

      {vehicles.length === 0 ? (
        <div className={styles.empty}>
          <span>No hay vehículos registrados</span>
        </div>
      ) : (
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Vehículo</th>
                <th>Estado</th>
                <th>Posición</th>
                <th>Velocidad</th>
                <th>Última transmisión</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <VehicleRow key={vehicle.id} vehicle={vehicle} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
