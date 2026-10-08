import { DATA_BASE_URL } from '@/config';
import { cachedJson } from '@/lib/storage';

/**
 * Vueltas de la última carrera que procesa el pipeline (cronometraje oficial Al Kamel para WEC e IMSA,
 * raceindycar para IndyCar). Una copia viene en la app; si hay repositorio de datos, se usa la más nueva.
 */
export type LapTuple = [
  number, // vuelta
  number, // tiempo (s)
  number | null, // S1
  number | null, // S2
  number | null, // S3
  number | null, // km/h promedio
  number | null, // velocidad punta
  number, // índice del piloto en `drivers`
  0 | 1, // pasó por boxes
  string | number | null, // bandera (WEC/IMSA) o posición (IndyCar)
  (number | null)[]?, // tiempos por tramo (IndyCar)
];

export interface TimingCar {
  number: string;
  team: string | null;
  manufacturer: string | null;
  class: string | null;
  drivers: string[];
  laps: LapTuple[];
}

export interface TimingData {
  event: string;
  generatedAt?: string;
  segments?: string[];
  cars: TimingCar[];
}

const BUNDLED: Record<string, () => TimingData> = {
  wec: () => require('./generated/telemetry-wec.json'),
  imsa: () => require('./generated/telemetry-imsa.json'),
  indycar: () => require('./generated/telemetry-indycar.json'),
};

export const TIMING_SERIES = Object.keys(BUNDLED);

export async function loadTiming(serie: string): Promise<TimingData> {
  const local = BUNDLED[serie]?.();
  if (DATA_BASE_URL) {
    try {
      const r = await cachedJson<TimingData>(`${DATA_BASE_URL}/telemetry/${serie}.json`, 6 * 3_600_000);
      if (!local || (r.data.generatedAt ?? '') > (local.generatedAt ?? '')) return r.data;
    } catch {
      // sin datos remotos: queda la copia de la app
    }
  }
  if (!local) throw new Error('Sin datos de telemetría para esta categoría');
  return local;
}
