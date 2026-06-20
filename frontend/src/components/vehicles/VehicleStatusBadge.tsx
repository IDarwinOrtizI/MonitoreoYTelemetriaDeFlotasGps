import styles from './VehicleStatusBadge.module.css';

type Status = 'EN_MOVIMIENTO' | 'DETENIDO' | 'SIN_SENAL';

interface VehicleStatusBadgeProps {
  status: Status;
  pulse?: boolean;
}

const CONFIG: Record<Status, { label: string; className: string; pulse: boolean }> = {
  EN_MOVIMIENTO: { label: 'En Movimiento', className: styles.moving, pulse: true },
  DETENIDO:     { label: 'Detenido',      className: styles.stopped, pulse: false },
  SIN_SENAL:    { label: 'Sin Señal',     className: styles.noSignal, pulse: true },
};

export function VehicleStatusBadge({ status, pulse }: VehicleStatusBadgeProps) {
  const config = CONFIG[status];
  const showPulse = pulse ?? config.pulse;

  return (
    <span className={`${styles.badge} ${config.className}`}>
      <span className={`${styles.dot} ${showPulse ? styles.pulse : ''}`} />
      {config.label}
    </span>
  );
}
