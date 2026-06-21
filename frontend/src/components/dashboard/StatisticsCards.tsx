import { useMemo } from 'react';
import styles from './StatisticsCards.module.css';
import { useVehicles } from '../../hooks';
import type { VehicleStatus } from '../../types';

interface StatisticsCardsProps {
  /** Override de loading. Si no se provee, se usa el del hook `useVehicles`. */
  loading?: boolean;
  /** Override de error. Si no se provee, se usa el del hook `useVehicles`. */
  error?: string | null;
}

interface StatItem {
  key: string;
  label: string;
  value: number;
  variant: 'total' | 'moving' | 'stopped' | 'noSignal';
  icon: React.ReactNode;
}

const ICON_CAR = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2.7-3.6c-.4-.5-.9-.4-1.3-.4H7.4c-.4 0-.9-.1-1.3.4L3.4 10l-2.5 1.1C.1 11.3 0 12.1 0 13v3c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

const ICON_MOVING = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
  </svg>
);

const ICON_STOPPED = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="6" width="12" height="12" rx="1" />
  </svg>
);

const ICON_NO_SIGNAL = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 2l20 20" />
    <path d="M8.5 16.5a5 5 0 0 1 7 0" />
    <path d="M2 8.8a15 15 0 0 1 4.2-3.2" />
    <path d="M14.5 7.5a8 8 0 0 1 5 1.7" />
    <path d="M22 8.8a15 15 0 0 0-11.3-3.8" />
    <path d="M5 12.5a10 10 0 0 1 3-1.7" />
    <line x1="12" y1="20" x2="12" y2="20" />
  </svg>
);

const ICON_ERROR = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

function countByStatus(vehicles: VehicleStatus[]) {
  return vehicles.reduce(
    (acc, v) => {
      if (v.status === 'EN_MOVIMIENTO') acc.moving++;
      else if (v.status === 'DETENIDO') acc.stopped++;
      else if (v.status === 'SIN_SENAL') acc.noSignal++;
      return acc;
    },
    { moving: 0, stopped: 0, noSignal: 0 }
  );
}

export function StatisticsCards({ loading: loadingProp, error: errorProp }: StatisticsCardsProps = {}) {
  const { vehicles, loading: loadingHook, error: errorHook } = useVehicles();
  const loading = loadingProp ?? loadingHook;
  const error = errorProp ?? errorHook;

  const stats = useMemo<StatItem[]>(() => {
    const counts = countByStatus(vehicles);
    return [
      { key: 'total',    label: 'Total Vehículos', value: vehicles.length, variant: 'total',    icon: ICON_CAR },
      { key: 'moving',   label: 'En Movimiento',   value: counts.moving,    variant: 'moving',   icon: ICON_MOVING },
      { key: 'stopped',  label: 'Detenidos',        value: counts.stopped,   variant: 'stopped',  icon: ICON_STOPPED },
      { key: 'noSignal', label: 'Sin Señal',        value: counts.noSignal,  variant: 'noSignal', icon: ICON_NO_SIGNAL },
    ];
  }, [vehicles]);

  const showSkeleton = loading && vehicles.length === 0;

  if (error) {
    return (
      <section className={styles.grid} aria-label="Estadísticas de la flota">
        <div className={`${styles.card} ${styles.errorCard}`} role="alert">
          <div className={styles.iconWrap} aria-hidden="true">
            {ICON_ERROR}
          </div>
          <div className={styles.body}>
            <span className={styles.label}>Sin conexión</span>
            <span className={styles.errorText}>{error}</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.grid} aria-label="Estadísticas de la flota">
      {stats.map((s) => (
        <article
          key={s.key}
          className={`${styles.card} ${styles[s.variant]}`}
          aria-label={`${s.label}: ${s.value}`}
        >
          <div className={styles.iconWrap} aria-hidden="true">
            {s.icon}
          </div>
          <div className={styles.body}>
            <span className={styles.label}>{s.label}</span>
            {showSkeleton ? (
              <span className={styles.skeleton} aria-hidden="true" />
            ) : (
              <span className={styles.value}>{s.value}</span>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
