import styles from './VehicleStatusBadge.module.css';
import { STATUS_CONFIG, getStatusLabel } from '../../utils/vehicleStatus';
import type { VehicleStatus } from '../../types';

interface VehicleStatusBadgeProps {
  status: VehicleStatus['status'];
  pulse?: boolean;
}

const CSS_CLASS_BY_KEY: Record<VehicleStatus['status'], string> = {
  EN_MOVIMIENTO: styles.moving,
  DETENIDO: styles.stopped,
  SIN_SENAL: styles.noSignal,
};

export function VehicleStatusBadge({ status, pulse }: VehicleStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const cssClass = CSS_CLASS_BY_KEY[status];
  const showPulse = pulse ?? config.pulse;

  return (
    <span className={`${styles.badge} ${cssClass}`}>
      <span className={`${styles.dot} ${showPulse ? styles.pulse : ''}`} />
      {getStatusLabel(status)}
    </span>
  );
}
