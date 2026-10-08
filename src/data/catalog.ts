import { norm, slugify } from '@/lib/text';

import { SERIES, SERIES_LIST } from './series';
import { SERIES_INFO } from './series-info';
import { getStandings } from './standings-store';
import { SERIES_TECH } from './tech';
import type { ManualDriver, ManualTeam, Series, StandingRow } from './types';

const tablesOf = (seriesId: string) => getStandings(seriesId)?.tables ?? [];

/** Categorías con tabla de posiciones. La F1 primero: viene en vivo. */
export function standingsSeries(): Series[] {
  return [SERIES.f1, ...SERIES_LIST.filter((s) => s.id !== 'f1' && tablesOf(s.id).length)];
}

/** Categorías con pilotos o equipos que mostrar. */
export function rosterSeries(): Series[] {
  return [
    SERIES.f1,
    ...SERIES_LIST.filter((s) => {
      const i = SERIES_INFO[s.id];
      return s.id !== 'f1' && (i?.drivers?.length || i?.teams?.length || tablesOf(s.id).length);
    }),
  ];
}

/** Categorías con ficha técnica. */
export const CAR_SERIES: Series[] = SERIES_LIST.filter((s) => SERIES_TECH[s.id]);

export const sameName = (a: string, b: string) => {
  const nb = norm(b);
  return norm(a) === nb || a.split(' / ').some((part) => norm(part) === nb);
};

export interface StandingHit {
  table: string;
  row: StandingRow;
}

/** Busca a un piloto o equipo en todas las tablas de su categoría. */
export function standingsFor(seriesId: string, name: string, kind: 'drivers' | 'teams'): StandingHit[] {
  const hits: StandingHit[] = [];
  for (const t of tablesOf(seriesId)) {
    if (t.kind !== kind) continue;
    const row = t.rows.find((r) => sameName(r.name, name));
    if (row) hits.push({ table: t.title, row });
  }
  return hits;
}

/**
 * Pilotos de una categoría (no F1): los de las tablas oficiales, completados con lo cargado a mano
 * (número, equipo, auto, datos extra).
 */
export function driversOf(seriesId: string): (ManualDriver & { photo?: string })[] {
  const manual = SERIES_INFO[seriesId]?.drivers ?? [];
  const out: (ManualDriver & { photo?: string })[] = [];
  const seen = new Set<string>();
  const add = (d: ManualDriver & { photo?: string }) => {
    const key = norm(d.name);
    if (seen.has(key)) {
      const prev = out.find((x) => norm(x.name) === key)!;
      const current = prev as unknown as Record<string, unknown>;
      Object.assign(prev, Object.fromEntries(Object.entries(d).filter(([k, v]) => v && !current[k])));
      return;
    }
    seen.add(key);
    out.push({ ...d });
  };
  for (const t of tablesOf(seriesId)) {
    if (t.kind !== 'drivers' || t.title.startsWith('Última carrera')) continue;
    for (const r of t.rows) {
      for (const name of r.name.split(' / ')) add({ name, team: r.team, car: r.car, number: r.number, photo: r.photo });
    }
  }
  for (const d of manual) add(d);
  return out;
}

/** Equipos de una categoría (no F1): los cargados a mano o los de la tabla oficial de equipos. */
export function teamsOf(seriesId: string): ManualTeam[] {
  const manual = SERIES_INFO[seriesId]?.teams;
  if (manual?.length) return manual;
  const table = tablesOf(seriesId).find((t) => t.kind === 'teams' && !/marca|motor|constructor/i.test(t.title));
  if (!table) return [];
  const drivers = driversOf(seriesId);
  return table.rows.map((r) => ({
    name: r.name,
    car: SERIES_TECH[seriesId]?.model,
    drivers: drivers.filter((d) => d.team && sameName(d.team, r.name)).map((d) => d.name),
  }));
}

export function findDriver(seriesId: string, id: string) {
  return driversOf(seriesId).find((d) => slugify(d.name) === id);
}

export function findTeam(seriesId: string, id: string): ManualTeam | undefined {
  return teamsOf(seriesId).find((t) => slugify(t.name) === id);
}

export function teamOfDriver(seriesId: string, driver: ManualDriver): ManualTeam | undefined {
  const teams = teamsOf(seriesId);
  return (
    teams.find((t) => t.drivers.some((d) => sameName(d, driver.name))) ??
    (driver.team ? teams.find((t) => sameName(t.name, driver.team!)) : undefined)
  );
}
