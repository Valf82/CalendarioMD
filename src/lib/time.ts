/**
 * Manejo de fechas sin depender de Intl con zonas horarias (Hermes en Android no lo garantiza).
 * Argentina no tiene horario de verano: es UTC-3 todo el año.
 */
export type TzMode = 'art' | 'local' | 'utc';

export const TZ_LABEL: Record<TzMode, string> = { art: 'hora ARG', local: 'tu hora', utc: 'UTC' };

const WEEKDAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const WEEKDAYS_LONG = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
export const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** Devuelve un Date cuyos campos UTC (getUTC*) son la hora de pared en la zona pedida. */
export function wall(date: Date, mode: TzMode): Date {
  const offsetMin = mode === 'utc' ? 0 : mode === 'art' ? -180 : -date.getTimezoneOffset();
  return new Date(date.getTime() + offsetMin * 60_000);
}

const pad = (n: number) => String(n).padStart(2, '0');

export function hhmm(iso: string, mode: TzMode): string {
  const w = wall(new Date(iso), mode);
  return `${pad(w.getUTCHours())}:${pad(w.getUTCMinutes())}`;
}

/** YYYY-MM-DD en la zona pedida. */
export function dayKey(date: Date, mode: TzMode): string {
  const w = wall(date, mode);
  return `${w.getUTCFullYear()}-${pad(w.getUTCMonth() + 1)}-${pad(w.getUTCDate())}`;
}

/** Partes de un YYYY-MM-DD para mostrar. */
export function dayParts(key: string) {
  const d = new Date(`${key}T12:00:00Z`);
  return {
    weekday: WEEKDAYS[d.getUTCDay()],
    weekdayLong: WEEKDAYS_LONG[d.getUTCDay()],
    day: d.getUTCDate(),
    month: MONTHS[d.getUTCMonth()],
    monthIndex: d.getUTCMonth(),
  };
}

export function longDate(iso: string, mode: TzMode): string {
  const p = dayParts(dayKey(new Date(iso), mode));
  return `${p.weekdayLong} ${p.day} de ${p.month}`;
}

export function countdown(ms: number): string {
  if (ms <= 0) return 'En pista ahora';
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${d ? `${d}d ` : ''}${pad(h)}h ${pad(m)}m`;
}

export function age(dateOfBirth: string): number {
  const b = new Date(`${dateOfBirth}T00:00:00Z`);
  const now = new Date();
  let a = now.getUTCFullYear() - b.getUTCFullYear();
  if (now.getUTCMonth() < b.getUTCMonth() || (now.getUTCMonth() === b.getUTCMonth() && now.getUTCDate() < b.getUTCDate())) a--;
  return a;
}

export function shortDate(key: string): string {
  const p = dayParts(key);
  return `${p.day}/${p.monthIndex + 1}`;
}
