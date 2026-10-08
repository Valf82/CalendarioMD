import type { CarSample, LocationSample } from '@/api/openf1';

/**
 * Cálculos de telemetría sobre una vuelta, con el mismo enfoque que FastF1:
 * distancia por integración de la velocidad, alineación por distancia y delta de tiempo.
 */

export interface LapTrace {
  /** duración oficial de la vuelta (s) */
  lapTime: number;
  /** segundos desde el inicio de la vuelta */
  t: number[];
  /** metros recorridos */
  d: number[];
  speed: number[];
  rpm: number[];
  gear: number[];
  throttle: number[];
  brake: number[];
  /** fecha absoluta de cada muestra (ms) para cruzar con la posición en pista */
  at: number[];
}

/** Integra la velocidad (km/h) para obtener la distancia de cada muestra. */
export function buildTrace(samples: CarSample[], lapStart: string, lapSeconds: number): LapTrace {
  const t0 = Date.parse(lapStart);
  const rows = samples
    .map((s) => ({ ...s, ms: Date.parse(s.date) }))
    .filter((s) => s.ms >= t0 - 300 && s.ms <= t0 + lapSeconds * 1000 + 300)
    .sort((a, b) => a.ms - b.ms);
  const trace: LapTrace = { lapTime: lapSeconds, t: [], d: [], speed: [], rpm: [], gear: [], throttle: [], brake: [], at: [] };
  let dist = 0;
  rows.forEach((r, i) => {
    if (i > 0) {
      const dt = (r.ms - rows[i - 1].ms) / 1000;
      // regla del trapecio con velocidades en m/s
      dist += ((r.speed + rows[i - 1].speed) / 2 / 3.6) * dt;
    }
    trace.t.push((r.ms - t0) / 1000);
    trace.d.push(dist);
    trace.speed.push(r.speed);
    trace.rpm.push(r.rpm);
    trace.gear.push(r.n_gear);
    trace.throttle.push(Math.min(100, Math.max(0, r.throttle)));
    trace.brake.push(r.brake > 0 ? 100 : 0);
    trace.at.push(r.ms);
  });
  // La distancia 0 tiene que ser el cruce de la línea (t = 0), no la primera muestra:
  // las muestras llegan cada ~0,27 s y a veces la primera aparece casi un segundo después.
  if (trace.t.length) {
    const d0 =
      trace.t[0] > 0
        ? -(trace.speed[0] / 3.6) * trace.t[0] // extrapolo hacia atrás con la primera velocidad
        : interp(trace.t, trace.d, 0);
    trace.d = trace.d.map((x) => x - d0);
    if (trace.t[0] > 0) {
      // Punto sintético en el cruce de la línea: distancia 0 en el segundo 0.
      trace.t.unshift(0);
      trace.d.unshift(0);
      trace.at.unshift(Date.parse(lapStart));
      for (const k of ['speed', 'rpm', 'gear', 'throttle', 'brake'] as const) trace[k].unshift(trace[k][0]);
    }
  }
  return trace;
}

/** Distancia recorrida al completar la vuelta (según el tiempo oficial). */
export const lapLength = (tr: LapTrace) => interp(tr.t, tr.d, tr.lapTime);

/** Interpolación lineal de ys en x (xs creciente). */
export function interp(xs: number[], ys: number[], x: number): number {
  if (!xs.length) return NaN;
  if (x <= xs[0]) return ys[0];
  if (x >= xs[xs.length - 1]) return ys[ys.length - 1];
  let lo = 0;
  let hi = xs.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (xs[mid] <= x) lo = mid;
    else hi = mid;
  }
  const f = (x - xs[lo]) / (xs[hi] - xs[lo] || 1);
  return ys[lo] + (ys[hi] - ys[lo]) * f;
}

/**
 * Delta de tiempo de B respecto de A a lo largo de la vuelta (positivo = B pierde tiempo).
 * Las distancias se escalan a la vuelta de A para compensar el error de integración.
 */
export function deltaTrace(a: LapTrace, b: LapTrace, step = 10): { d: number[]; delta: number[] } {
  const lenA = lapLength(a);
  const lenB = lapLength(b);
  if (!lenA || !lenB) return { d: [], delta: [] };
  const scale = lenA / lenB;
  const bd = b.d.map((x) => x * scale);
  const out: { d: number[]; delta: number[] } = { d: [], delta: [] };
  for (let x = 0; x <= lenA; x += step) {
    out.d.push(x);
    out.delta.push(interp(bd, b.t, x) - interp(a.d, a.t, x));
  }
  return out;
}

/** Quién es más rápido en cada uno de n mini-sectores (índice 0 = A, 1 = B). */
export function miniSectors(a: LapTrace, b: LapTrace, n = 25): { from: number; to: number; faster: 0 | 1; gap: number }[] {
  const len = lapLength(a);
  const lenB = lapLength(b) || 1;
  const bd = b.d.map((x) => (x * len) / lenB);
  const out: { from: number; to: number; faster: 0 | 1; gap: number }[] = [];
  for (let i = 0; i < n; i++) {
    const from = (len * i) / n;
    const to = (len * (i + 1)) / n;
    const ta = interp(a.d, a.t, to) - interp(a.d, a.t, from);
    const tb = interp(bd, b.t, to) - interp(bd, b.t, from);
    out.push({ from, to, faster: ta <= tb ? 0 : 1, gap: Math.abs(ta - tb) });
  }
  return out;
}

export interface LapStats {
  topSpeed: number;
  minSpeed: number;
  avgSpeed: number;
  fullThrottle: number;
  braking: number;
  maxRpm: number;
  gearShifts: number;
  distance: number;
}

/** Porcentajes ponderados por tiempo, no por cantidad de muestras. */
export function lapStats(tr: LapTrace): LapStats {
  let full = 0;
  let brake = 0;
  let total = 0;
  let shifts = 0;
  for (let i = 1; i < tr.t.length; i++) {
    const dt = tr.t[i] - tr.t[i - 1];
    total += dt;
    if (tr.throttle[i] >= 98) full += dt;
    if (tr.brake[i] > 0) brake += dt;
    if (tr.gear[i] !== tr.gear[i - 1]) shifts++;
  }
  const distance = lapLength(tr);
  const time = tr.lapTime;
  return {
    topSpeed: Math.max(...tr.speed),
    minSpeed: Math.min(...tr.speed.filter((s) => s > 0)),
    avgSpeed: time > 0 ? (distance / time) * 3.6 : 0,
    fullThrottle: total ? (full / total) * 100 : 0,
    braking: total ? (brake / total) * 100 : 0,
    maxRpm: Math.max(...tr.rpm),
    gearShifts: shifts,
    distance,
  };
}

/** Distancia (según A) de cada punto de posición, para pintar el mapa por mini-sectores. */
export function locateOnLap(loc: LocationSample[], tr: LapTrace): { x: number; y: number; d: number }[] {
  return loc
    .map((p) => ({ x: p.x, y: p.y, ms: Date.parse(p.date) }))
    .filter((p) => p.ms >= tr.at[0] && p.ms <= tr.at[tr.at.length - 1] && (p.x !== 0 || p.y !== 0))
    .map((p) => ({ x: p.x, y: p.y, d: interp(tr.at, tr.d, p.ms) }));
}

/** Rota puntos del trazado (grados) como lo hace FastF1 con circuit_info.rotation. */
export function rotate(x: number, y: number, deg: number): [number, number] {
  const r = (deg * Math.PI) / 180;
  return [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)];
}

export function fmtLap(s?: number | null): string {
  if (s == null || !isFinite(s)) return '—';
  const m = Math.floor(s / 60);
  const rest = s - m * 60;
  return m ? `${m}:${rest.toFixed(3).padStart(6, '0')}` : rest.toFixed(3);
}

/** Versión corta para ejes: 1:36.1 */
export function fmtLapShort(s: number): string {
  const m = Math.floor(s / 60);
  const rest = s - m * 60;
  return m ? `${m}:${rest.toFixed(1).padStart(4, '0')}` : rest.toFixed(1);
}

/** Reduce una serie a como mucho `max` puntos para dibujarla rápido. */
export function downsample<T>(arr: T[], max: number): T[] {
  if (arr.length <= max) return arr;
  const step = arr.length / max;
  const out: T[] = [];
  for (let i = 0; i < max; i++) out.push(arr[Math.floor(i * step)]);
  out.push(arr[arr.length - 1]);
  return out;
}
