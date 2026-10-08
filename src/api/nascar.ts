import { cachedJson } from '@/lib/storage';

/** Feeds oficiales de nascar.com (los mismos que usa su app): carreras, tiempos por vuelta y loop data. */
const CDN = 'https://cf.nascar.com';
const HOUR = 3_600_000;

export const NASCAR_SERIES: { id: number; seriesId: string; name: string }[] = [
  { id: 1, seriesId: 'cup', name: 'Cup Series' },
  { id: 2, seriesId: 'xfin', name: "O'Reilly Series" },
  { id: 3, seriesId: 'truckus', name: 'Craftsman Trucks' },
];

export interface NascarRace {
  race_id: number;
  race_name: string;
  track_name: string;
  race_date: string;
  race_type_id: number;
  actual_laps: number;
  average_speed: number;
  number_of_lead_changes: number;
  number_of_cautions: number;
}

export interface LapTimesFeed {
  laps: {
    Number: string;
    FullName: string;
    Manufacturer: string;
    RunningPos: number;
    NASCARDriverID: number;
    Laps: { Lap: number; LapTime: number | null; LapSpeed: string | null; RunningPos: number }[];
  }[];
  /** FlagState por vuelta: 1 = verde, 2 = amarilla */
  flags: { LapsCompleted: number; FlagState: number }[];
}

export interface LoopDriver {
  driver_id: number;
  start_ps: number;
  mid_ps: number;
  ps: number;
  closing_ps: number;
  best_ps: number;
  worst_ps: number;
  avg_ps: number;
  passes_gf: number;
  passed_gf: number;
  quality_passes: number;
  fast_laps: number;
  top15_laps: number;
  lead_laps: number;
  laps: number;
  rating: number;
}

export async function races(series: number, year: number): Promise<NascarRace[]> {
  const r = await cachedJson<NascarRace[]>(`${CDN}/cacher/${year}/${series}/race_list_basic.json`, 6 * HOUR);
  return r.data.filter((x) => x.race_type_id === 1 && x.average_speed > 0).sort((a, b) => a.race_date.localeCompare(b.race_date));
}

export async function lapTimes(series: number, year: number, raceId: number): Promise<LapTimesFeed> {
  return (await cachedJson<LapTimesFeed>(`${CDN}/cacher/${year}/${series}/${raceId}/lap-times.json`, 24 * HOUR)).data;
}

export async function loopData(series: number, year: number, raceId: number): Promise<LoopDriver[]> {
  const r = await cachedJson<{ drivers: LoopDriver[] }[]>(`${CDN}/loopstats/prod/${year}/${series}/${raceId}.json`, 24 * HOUR);
  return r.data[0]?.drivers ?? [];
}

export const MAKE: Record<string, string> = { Chv: 'Chevrolet', Frd: 'Ford', Tyt: 'Toyota', Ram: 'Ram' };
