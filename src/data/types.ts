export type Level = 'mundial' | 'inter' | 'nacional';

/** Pares etiqueta/valor que se muestran como ficha (staff, datos técnicos, datos del piloto). */
export type Facts = [string, string][];

export interface Series {
  id: string;
  name: string;
  level: Level;
  type: 'Monoplaza' | 'Resistencia' | 'GT' | 'Rally' | 'Turismo' | 'Stock' | 'Tierra';
  tv: string[];
  /** La señal puede variar según país o proveedor. */
  verifyTv?: boolean;
  url?: string;
}

export interface RaceEvent {
  /** id de la categoría (ver SERIES) */
  s: string;
  /** nombre de la carrera */
  n: string;
  /** día de carrera, fecha local del evento (YYYY-MM-DD) */
  d: string;
  /** último día, para eventos de varios días */
  e?: string;
  /** largada en UTC (ISO), si se conoce */
  u?: string;
  /** horario aproximado (el habitual de la categoría) */
  ap?: boolean;
  /** autódromo */
  p: string;
  /** ciudad */
  c: string;
  /** país */
  r: string;
  st: 'ok' | 'tbc';
  /** nota extra */
  x?: string;
}

export interface StandingRow {
  pos: number;
  name: string;
  points: number | null;
  wins?: number;
  team?: string;
  car?: string;
  number?: string;
  /** foto oficial del piloto (ACTC) */
  photo?: string;
  /** lastre por éxito (Turismo Nacional) */
  ballast?: string;
  poles?: number;
  lapsLed?: number;
  top5?: number;
  top10?: number;
  starts?: number;
  dnf?: number;
  playoffRank?: number;
  grid?: number;
  status?: string;
  bestLap?: string;
  pitStops?: number;
}

export interface StandingsTable {
  title: string;
  kind: 'drivers' | 'teams';
  rows: StandingRow[];
}

/** Lo que genera el pipeline para cada categoría. */
export interface SeriesStandings {
  source: string;
  sourceUrl: string;
  /** true = sitio o cronometraje oficial; false = respaldo (Wikipedia) */
  official: boolean;
  updated: string;
  note?: string;
  /** la fuente falló en la última corrida y estos datos son de antes */
  stale?: boolean;
  tables: StandingsTable[];
}

export interface StandingsFile {
  generatedAt: string;
  series: Record<string, SeriesStandings>;
}

/** Ficha técnica: secciones (motor, chasis, etc.) con pares dato / valor. */
export interface TechSection {
  title: string;
  facts: Facts;
}

export interface TechSheet {
  model: string;
  summary?: string;
  sections: TechSection[];
  /** de dónde salen los datos */
  sources: { label: string; url?: string }[];
  notes?: string;
}

/** Variante de una categoría: un auto, una marca o un motor puntual. */
export interface TechVariant {
  name: string;
  /** nombres de equipos o marcas a los que aplica, para enlazarla desde la ficha del equipo */
  match?: string[];
  sheet: TechSheet;
}

/** Ficha técnica común de los autos de una categoría. */
export interface CarSpec {
  model: string;
  facts: Facts;
  notes?: string;
}

export interface ManualDriver {
  name: string;
  number?: string;
  team?: string;
  car?: string;
  nationality?: string;
  facts?: Facts;
}

export interface ManualTeam {
  name: string;
  car?: string;
  engine?: string;
  drivers: string[];
  staff?: Facts;
  facts?: Facts;
}

/** Todo lo que sabemos de una categoría fuera de la agenda. */
export interface SeriesInfo {
  /** fecha del dato, para mostrar "Actualizado al…" */
  updated?: string;
  source?: string;
  note?: string;
  standings?: StandingsTable[];
  drivers?: ManualDriver[];
  teams?: ManualTeam[];
  car?: CarSpec;
}

/** Una noticia ya clasificada (la genera el pipeline o la app leyendo los feeds RSS). */
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  lang: string;
  /** ISO 8601 en UTC */
  published: string;
  image: string | null;
  /** ids de categorías; vacío = sin categoría */
  series: string[];
}

export interface NewsFile {
  generatedAt: string;
  items: NewsItem[];
}
