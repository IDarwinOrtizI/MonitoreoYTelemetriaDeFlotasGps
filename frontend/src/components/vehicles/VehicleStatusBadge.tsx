interface VehicleStatusBadgeProps {
  status: 'EN_MOVIMIENTO' | 'DETENIDO' | 'SIN_SENAL';
}

const statusConfig = {
  EN_MOVIMIENTO: {
    label: 'En Movimiento',
    className: 'bg-green-100 text-green-800',
  },
  DETENIDO: {
    label: 'Detenido',
    className: 'bg-yellow-100 text-yellow-800',
  },
  SIN_SENAL: {
    label: 'Sin Senal',
    className: 'bg-red-100 text-red-800',
  },
} as const;

export function VehicleStatusBadge({ status }: VehicleStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
