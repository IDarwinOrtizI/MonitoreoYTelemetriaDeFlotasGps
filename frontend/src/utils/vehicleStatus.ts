/**
 * Configuración central de estados de vehículos.
 *
 * Esta es la única fuente de verdad para el mapeo de estados
 * (label en español, color hex para Leaflet, nombre de clase CSS
 * usada por los badges). Los colores soft y los border siguen
 * viviendo en `styles/variables.css` y son consumidos vía CSS
 * Modules por los componentes visuales.
 */

import type { VehicleStatus } from '../types';

export type VehicleStatusKey = VehicleStatus['status'];

export interface StatusConfig {
  /** Etiqueta legible en español. */
  label: string;
  /** Color sólido (hex) usado por Leaflet para los markers. */
  color: string;
  /** Color de fondo (hex) para casos donde se necesite un fondo plano. */
  bgColor: string;
  /** Nombre lógico de la clase CSS Module (resuelto por el componente). */
  cssClass: 'moving' | 'stopped' | 'noSignal';
  /** Si el dot del badge debe animar el pulso. */
  pulse: boolean;
}

export const STATUS_CONFIG: Record<VehicleStatusKey, StatusConfig> = {
  EN_MOVIMIENTO: {
    label: 'En Movimiento',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    cssClass: 'moving',
    pulse: true,
  },
  DETENIDO: {
    label: 'Detenido',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    cssClass: 'stopped',
    pulse: false,
  },
  SIN_SENAL: {
    label: 'Sin Señal',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    cssClass: 'noSignal',
    pulse: true,
  },
};

/** Hex colors para uso directo en Leaflet (markers, polylines, etc). */
export const STATUS_COLORS: Record<VehicleStatusKey, string> = {
  EN_MOVIMIENTO: STATUS_CONFIG.EN_MOVIMIENTO.color,
  DETENIDO: STATUS_CONFIG.DETENIDO.color,
  SIN_SENAL: STATUS_CONFIG.SIN_SENAL.color,
};

/** Devuelve el color hex correspondiente a un estado. */
export function getStatusColor(status: VehicleStatusKey): string {
  return STATUS_CONFIG[status].color;
}

/** Devuelve la etiqueta legible en español para un estado. */
export function getStatusLabel(status: VehicleStatusKey): string {
  return STATUS_CONFIG[status].label;
}
