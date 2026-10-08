import { cachedJson } from '@/lib/storage';

/** API gratuita de F1 (sucesora de Ergast). Límite: 4 consultas por segundo, 500 por hora. */
const BASE = 'https://api.jolpi.ca/ergast/f1';
const SEASON = 2026;

const MIN = 60_000;
const HOUR = 60 * MIN;

export interface ApiDriver {
  driverId: string;
  permanentNumber?: string;
  code?: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
  url?: string;
}

export interface ApiConstructor {
  constructorId: string;
  name: string;
  nationality: string;
}

export interface DriverStanding {
  position: string;
  points: string;
  wins: string;
  Driver: ApiDriver;
  Constructors: ApiConstructor[];
}

export interface ConstructorStanding {
  position: string;
  points: string;
  wins: string;
  Constructor: ApiConstructor;
}

export interface RaceResult {
  round: string;
  raceName: string;
  date: string;
  Circuit: { circuitName: string; Location: { locality: string; country: string } };
  Results: { position: string; positionText: string; grid: string; points: string; status: string; Constructor: ApiConstructor }[];
}

interface MR<T> {
  MRData: T & { total: string };
}

export interface Loaded<T> {
  data: T;
  at: number;
  stale: boolean;
}

export async function driverStandings(force = false): Promise<Loaded<{ round: string; rows: DriverStanding[] }>> {
  const r = await cachedJson<MR<{ StandingsTable: { round: string; StandingsLists: { round: string; DriverStandings: DriverStanding[] }[] } }>>(
    `${BASE}/${SEASON}/driverstandings.json?limit=40`, 30 * MIN, force,
  );
  const list = r.data.MRData.StandingsTable.StandingsLists[0];
  return { ...r, data: { round: list?.round ?? '0', rows: list?.DriverStandings ?? [] } };
}

export async function constructorStandings(force = false): Promise<Loaded<{ round: string; rows: ConstructorStanding[] }>> {
  const r = await cachedJson<MR<{ StandingsTable: { StandingsLists: { round: string; ConstructorStandings: ConstructorStanding[] }[] } }>>(
    `${BASE}/${SEASON}/constructorstandings.json?limit=20`, 30 * MIN, force,
  );
  const list = r.data.MRData.StandingsTable.StandingsLists[0];
  return { ...r, data: { round: list?.round ?? '0', rows: list?.ConstructorStandings ?? [] } };
}

export async function driverSeason(driverId: string): Promise<RaceResult[]> {
  const r = await cachedJson<MR<{ RaceTable: { Races: RaceResult[] } }>>(`${BASE}/${SEASON}/drivers/${driverId}/results.json?limit=40`, HOUR);
  return r.data.MRData.RaceTable.Races;
}

export async function driverInfo(driverId: string): Promise<ApiDriver | undefined> {
  const r = await cachedJson<MR<{ DriverTable: { Drivers: ApiDriver[] } }>>(`${BASE}/drivers/${driverId}.json`, 24 * HOUR);
  return r.data.MRData.DriverTable.Drivers[0];
}

/** Títulos mundiales de pilotos de la grilla actual (la API no permite consultarlos por piloto). */
const TITLES: Record<string, string> = {
  hamilton: '7 (2008, 2014, 2015, 2017, 2018, 2019, 2020)',
  max_verstappen: '4 (2021, 2022, 2023, 2024)',
  alonso: '2 (2005, 2006)',
  norris: '1 (2025)',
};

export interface Career {
  starts: number;
  wins: number;
  podiums: number;
  poles: number;
  seasons: number;
  debut?: string;
  titles: string;
}

async function total(path: string): Promise<{ total: number; first?: RaceResult }> {
  const r = await cachedJson<MR<{ RaceTable?: { Races: RaceResult[] } }>>(`${BASE}/${path}`, 24 * HOUR);
  return { total: Number(r.data.MRData.total), first: r.data.MRData.RaceTable?.Races?.[0] };
}

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

/** Estadísticas de toda la carrera. Consultas en serie para no pasar el límite de la API. */
export async function driverCareer(driverId: string): Promise<Career> {
  const paths = [
    `drivers/${driverId}/results.json?limit=1`,
    `drivers/${driverId}/results/1.json?limit=1`,
    `drivers/${driverId}/results/2.json?limit=1`,
    `drivers/${driverId}/results/3.json?limit=1`,
    `drivers/${driverId}/grid/1/results.json?limit=1`,
    `drivers/${driverId}/seasons.json?limit=1`,
  ];
  const out: { total: number; first?: RaceResult }[] = [];
  for (const p of paths) {
    out.push(await total(p));
    await wait(120);
  }
  const [starts, wins, p2, p3, poles, seasons] = out;
  return {
    starts: starts.total,
    wins: wins.total,
    podiums: wins.total + p2.total + p3.total,
    poles: poles.total,
    seasons: seasons.total,
    debut: starts.first ? `${starts.first.raceName} ${starts.first.date.slice(0, 4)}` : undefined,
    titles: TITLES[driverId] ?? '0',
  };
}

/** Fotos y colores oficiales desde OpenF1 (por número de auto). */
export interface OpenF1Driver {
  driver_number: number;
  name_acronym: string;
  team_name: string;
  team_colour: string | null;
  headshot_url: string | null;
}

export async function openF1Drivers(): Promise<Record<string, OpenF1Driver>> {
  const r = await cachedJson<OpenF1Driver[]>('https://api.openf1.org/v1/drivers?session_key=latest', 12 * HOUR);
  return Object.fromEntries(r.data.map((d) => [d.name_acronym, d]));
}

// ---------- Temporada completa (para simulaciones) ----------

export interface SeasonResult {
  position: string;
  positionText: string;
  points: string;
  Driver: ApiDriver;
  Constructor: ApiConstructor;
}

export interface SeasonRace {
  round: string;
  raceName: string;
  results: SeasonResult[];
  sprint: SeasonResult[];
}

/** La API devuelve como máximo 100 resultados por consulta: se pagina. */
async function paged<T>(path: string, pick: (d: unknown) => { rows: T[]; total: number }): Promise<T[]> {
  const out: T[] = [];
  for (let offset = 0; ; offset += 100) {
    const r = await cachedJson<unknown>(`${BASE}/${path}${path.includes('?') ? '&' : '?'}limit=100&offset=${offset}`, HOUR);
    const { rows, total } = pick(r.data);
    out.push(...rows);
    if (offset + 100 >= total) return out;
  }
}

export async function seasonResults(): Promise<SeasonRace[]> {
  type Races = { MRData: { total: string; RaceTable: { Races: (Omit<SeasonRace, 'results' | 'sprint'> & { Results?: SeasonResult[]; SprintResults?: SeasonResult[] })[] } } };
  const grab = (path: string) =>
    paged<Races['MRData']['RaceTable']['Races'][number]>(path, (d) => ({ rows: (d as Races).MRData.RaceTable.Races, total: Number((d as Races).MRData.total) }));
  const [races, sprints] = await Promise.all([grab(`${SEASON}/results.json`), grab(`${SEASON}/sprint.json`)]);
  const byRound = new Map<string, SeasonRace>();
  for (const r of races) {
    const cur = byRound.get(r.round) ?? { round: r.round, raceName: r.raceName, results: [], sprint: [] };
    cur.results.push(...(r.Results ?? []));
    byRound.set(r.round, cur);
  }
  for (const r of sprints) {
    const cur = byRound.get(r.round) ?? { round: r.round, raceName: r.raceName, results: [], sprint: [] };
    cur.sprint.push(...(r.SprintResults ?? []));
    byRound.set(r.round, cur);
  }
  return [...byRound.values()].sort((a, b) => Number(a.round) - Number(b.round));
}

export interface ScheduleRace {
  round: string;
  raceName: string;
  date: string;
  Sprint?: unknown;
}

export async function schedule(): Promise<ScheduleRace[]> {
  const r = await cachedJson<MR<{ RaceTable: { Races: ScheduleRace[] } }>>(`${BASE}/${SEASON}.json`, 6 * HOUR);
  return r.data.MRData.RaceTable.Races;
}
