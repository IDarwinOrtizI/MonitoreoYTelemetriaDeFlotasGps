interface VehicleStatusBadgeProps {
  status: 'EN_MOVIMIENTO' | 'DETENIDO' | 'SIN_SENAL';
}

const statusConfig = {
  EN_MOVIMIENTO: {
    label: 'En Movimiento',
    dotClass: 'bg-green-500',
    bgClass: 'bg-green-50 border-green-200',
    textClass: 'text-green-700',
    pulse: true,
  },
  DETENIDO: {
    label: 'Detenido',
    dotClass: 'bg-yellow-500',
    bgClass: 'bg-yellow-50 border-yellow-200',
    textClass: 'text-yellow-700',
    pulse: false,
  },
  SIN_SENAL: {
    label: 'Sin Senal',
    dotClass: 'bg-red-500',
    bgClass: 'bg-red-50 border-red-200',
    textClass: 'text-red-700',
    pulse: true,
  },
} as const;

export function VehicleStatusBadge({ status }: VehicleStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${config.bgClass} ${config.textClass}`}
    >
      <span className="relative flex h-2.5 w-2.5">
        {config.pulse && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${config.dotClass}`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full h-2.5 w-2.5 ${config.dotClass}`}
        />
      </span>
      {config.label}
    </span>
  );
}
