import { useSyncExternalStore } from 'react';

import { DATA_BASE_URL } from '@/config';
import { cachedJson } from '@/lib/storage';

import bundled from './generated/standings.json';
import type { SeriesStandings, StandingsFile } from './types';

/**
 * Posiciones de todas las categorías (menos la F1, que va en vivo desde su API).
 * Arranca con la copia empaquetada y se actualiza con:
 *  - el JSON que publica el pipeline en GitHub (si DATA_BASE_URL está configurada),
 *  - los feeds oficiales de NASCAR, consultados en vivo.
 */
interface State {
  generatedAt: string;
  origin: 'app' | 'remote';
  series: Record<string, SeriesStandings>;
}

let state: State = {
  generatedAt: (bundled as StandingsFile).generatedAt,
  origin: 'app',
  series: (bundled as StandingsFile).series,
};
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function getStandings(seriesId: string): SeriesStandings | undefined {
  return state.series[seriesId];
}

export function useStandingsState(): State {
  return useSyncExternalStore(subscribe, () => state);
}

export function useSeriesStandings(seriesId: string): SeriesStandings | undefined {
  return useStandingsState().series[seriesId];
}

const HOUR = 3_600_000;

interface NascarPoints {
  position: number;
  driver_name: string;
  points: number;
  car_no: string;
  manufacturer: string;
  wins: number;
  poles: number;
  top_5: number;
  top_10: number;
  laps_led: number;
  starts: number;
  dnf: number;
  playoff_rank: number;
}

const NASCAR: Record<string, number> = { cup: 1, xfin: 2, truckus: 3 };

async function liveNascar(force: boolean): Promise<Record<string, SeriesStandings>> {
  const out: Record<string, SeriesStandings> = {};
  const year = new Date().getUTCFullYear();
  await Promise.all(
    Object.entries(NASCAR).map(async ([id, n]) => {
      const url = `https://cf.nascar.com/cacher/${year}/${n}/final/${n}-drivers-points.json`;
      try {
        const r = await cachedJson<NascarPoints[]>(url, HOUR, force);
        const prev = state.series[id];
        out[id] = {
          source: 'nascar.com (feed oficial, en vivo)',
          sourceUrl: url,
          official: true,
          updated: r.stale ? 'Sin conexión: última copia guardada' : 'Puntos oficiales en vivo',
          tables: [
            {
              title: 'Pilotos',
              kind: 'drivers',
              rows: r.data.slice(0, 45).map((d) => ({
                pos: d.position,
                name: d.driver_name,
                points: d.points,
                number: d.car_no,
                car: d.manufacturer,
                wins: d.wins || undefined,
                poles: d.poles || undefined,
                top5: d.top_5 || undefined,
                top10: d.top_10 || undefined,
                lapsLed: d.laps_led || undefined,
                starts: d.starts || undefined,
                dnf: d.dnf || undefined,
                playoffRank: d.playoff_rank || undefined,
              })),
            },
            // La tabla de marcas viene del pipeline.
            ...(prev?.tables.filter((t) => t.title !== 'Pilotos') ?? []),
          ],
        };
      } catch {
        // Sin red: queda lo que ya había.
      }
    }),
  );
  return out;
}

/** Actualiza desde el repositorio de datos y los feeds en vivo. Nunca tira error: si algo falla, queda lo anterior. */
export async function refreshStandings(force = false): Promise<void> {
  let series = { ...state.series };
  let generatedAt = state.generatedAt;
  let origin = state.origin;

  if (DATA_BASE_URL) {
    try {
      const r = await cachedJson<StandingsFile>(`${DATA_BASE_URL}/standings.json`, 3 * HOUR, force);
      if (r.data.generatedAt > generatedAt || origin === 'app') {
        series = { ...series, ...r.data.series };
        generatedAt = r.data.generatedAt;
        origin = 'remote';
      }
    } catch {
      // sin datos remotos
    }
  }
  series = { ...series, ...(await liveNascar(force)) };
  set({ series, generatedAt, origin });
}
