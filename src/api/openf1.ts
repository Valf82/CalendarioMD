import { cachedJson } from '@/lib/storage';

/**
 * Telemetría de F1 desde OpenF1 (github.com/br-g/openf1), que expone los datos del live timing oficial:
 * velocidad, RPM, marcha, acelerador y freno (~3,7 muestras por segundo) y posición en pista.
 * El trazado y las curvas vienen de MultiViewer, la misma fuente que usa FastF1 (github.com/theOehrly/Fast-F1).
 */
const BASE = 'https://api.openf1.org/v1';
const DAY = 86_400_000;
const HOUR = 3_600_000;

export interface Meeting {
  meeting_key: number;
  meeting_name: string;
  circuit_key: number;
  circuit_short_name: string;
  country_name: string;
  date_start: string;
  year: number;
}

export interface Session {
  session_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end: string;
  circuit_key: number;
  meeting_key: number;
  year: number;
}

export interface SessionDriver {
  driver_number: number;
  name_acronym: string;
  full_name: string;
  team_name: string;
  team_colour: string | null;
  headshot_url: string | null;
}

export interface Lap {
  driver_number: number;
  lap_number: number;
  date_start: string | null;
  lap_duration: number | null;
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
  i1_speed: number | null;
  i2_speed: number | null;
  st_speed: number | null;
  is_pit_out_lap: boolean;
}

export interface CarSample {
  date: string;
  speed: number;
  rpm: number;
  n_gear: number;
  throttle: number;
  brake: number;
}

export interface LocationSample {
  date: string;
  x: number;
  y: number;
}

export interface Stint {
  driver_number: number;
  stint_number: number;
  lap_start: number;
  lap_end: number;
  compound: string;
  tyre_age_at_start: number;
}

export interface Circuit {
  x: number[];
  y: number[];
  rotation: number;
  corners: { number: number; letter?: string; angle: number; trackPosition: { x: number; y: number } }[];
}

const q = (params: Record<string, string | number>) =>
  Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&');

/** Filtro de rango de fechas de OpenF1 (date>=…&date<=…), codificado. */
const range = (from: string, to: string) => `date%3E%3D${encodeURIComponent(from)}&date%3C%3D${encodeURIComponent(to)}`;

async function json<T>(url: string, maxAge: number): Promise<T> {
  return (await cachedJson<T>(url, maxAge)).data;
}

export async function meetings(year: number): Promise<Meeting[]> {
  const all = await json<Meeting[]>(`${BASE}/meetings?${q({ year })}`, 6 * HOUR);
  return all.filter((m) => Date.parse(m.date_start) < Date.now() && !/testing/i.test(m.meeting_name));
}

export async function sessions(meetingKey: number): Promise<Session[]> {
  const all = await json<Session[]>(`${BASE}/sessions?${q({ meeting_key: meetingKey })}`, HOUR);
  return all.filter((s) => Date.parse(s.date_end) < Date.now());
}

export function sessionDrivers(sessionKey: number) {
  return json<SessionDriver[]>(`${BASE}/drivers?${q({ session_key: sessionKey })}`, DAY);
}

export interface SessionResult {
  position: number | null;
  driver_number: number;
}

export function sessionResult(sessionKey: number) {
  return json<SessionResult[]>(`${BASE}/session_result?${q({ session_key: sessionKey })}`, DAY);
}

export function laps(sessionKey: number, driver: number) {
  return json<Lap[]>(`${BASE}/laps?${q({ session_key: sessionKey, driver_number: driver })}`, DAY);
}

export function stints(sessionKey: number, driver: number) {
  return json<Stint[]>(`${BASE}/stints?${q({ session_key: sessionKey, driver_number: driver })}`, DAY);
}

export function carData(sessionKey: number, driver: number, from: string, to: string) {
  return json<CarSample[]>(`${BASE}/car_data?${q({ session_key: sessionKey, driver_number: driver })}&${range(from, to)}`, 7 * DAY);
}

export function location(sessionKey: number, driver: number, from: string, to: string) {
  return json<LocationSample[]>(`${BASE}/location?${q({ session_key: sessionKey, driver_number: driver })}&${range(from, to)}`, 7 * DAY);
}

export function circuit(circuitKey: number, year: number) {
  return json<Circuit>(`https://api.multiviewer.app/api/v1/circuits/${circuitKey}/${year}`, 30 * DAY);
}

/** Vuelta más rápida válida (sin vueltas de salida de boxes). */
export function fastestLap(list: Lap[]): Lap | undefined {
  return list
    .filter((l) => l.lap_duration && l.date_start && !l.is_pit_out_lap)
    .sort((a, b) => a.lap_duration! - b.lap_duration!)[0];
}

/** Ventana de tiempo de una vuelta, con un margen para no perder la primera y la última muestra. */
export function lapWindow(lap: Lap): [string, string] {
  const start = Date.parse(lap.date_start!);
  const end = start + lap.lap_duration! * 1000;
  return [new Date(start - 400).toISOString(), new Date(end + 400).toISOString()];
}

// ---------- Carrera completa (todos los pilotos), para la simulación de estrategia ----------

export function raceLaps(sessionKey: number) {
  return json<Lap[]>(`${BASE}/laps?${q({ session_key: sessionKey })}`, 7 * DAY);
}

export function raceStints(sessionKey: number) {
  return json<Stint[]>(`${BASE}/stints?${q({ session_key: sessionKey })}`, 7 * DAY);
}

/** Carreras (no sprints) ya disputadas en una temporada. */
export async function raceSessions(year: number): Promise<(Session & { circuit_short_name: string; country_name: string })[]> {
  const all = await json<(Session & { circuit_short_name: string; country_name: string })[]>(`${BASE}/sessions?${q({ year, session_name: 'Race' })}`, 6 * HOUR);
  return all.filter((s) => Date.parse(s.date_end) < Date.now());
}
