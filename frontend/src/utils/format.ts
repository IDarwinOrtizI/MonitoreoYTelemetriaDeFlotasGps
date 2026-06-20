const LOCALE = 'es-CO';
const TIMEZONE = 'America/Bogota';

const DATETIME_OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

const TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

export function formatDateTime(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '—';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(LOCALE, { ...DATETIME_OPTIONS, timeZone: TIMEZONE });
}

export function formatTime(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '—';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString(LOCALE, { ...TIME_OPTIONS, timeZone: TIMEZONE });
}

export function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '—';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(LOCALE, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: TIMEZONE,
  });
}

export function formatSpeed(speed: number | null | undefined): string {
  if (speed === null || speed === undefined) return '—';
  return `${speed.toFixed(1)} km/h`;
}

export function formatCoordinates(lat: number | null, lng: number | null): string {
  if (lat === null || lng === null) return 'Sin datos';
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}
