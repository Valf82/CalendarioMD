/**
 * Simulación Monte Carlo del campeonato de F1.
 *
 * Idea (inspirada en los predictores de temporada de f1-predictions y similares, reescrita desde cero):
 *  1. De cada piloto sacamos su nivel y su variabilidad con los resultados que ya tuvo este año.
 *  2. Para cada carrera que falta se sortea un "rendimiento" por piloto (nivel + ruido); se ordena y se reparten
 *     los puntos reales del reglamento. Así siempre sale un orden de llegada válido.
 *  3. Cada piloto puede abandonar con la frecuencia que tuvo en la temporada.
 *  4. Se repite miles de veces y se cuenta quién termina primero.
 *
 * Es una estimación con los datos de este año, no una predicción: no sabe de mejoras, penalizaciones ni clima.
 * Sin dependencias para poder probarse con Node.
 */

export interface DriverSeason {
  id: string;
  name: string;
  team: string;
  points: number;
  /** resultados de carrera: posición final (null = no clasificó) */
  finishes: (number | null)[];
}

export interface Weekend {
  sprint: boolean;
}

export interface Projection {
  id: string;
  name: string;
  team: string;
  points: number;
  titleProb: number;
  expected: number;
  /** percentil 10 y 90 de los puntos finales */
  low: number;
  high: number;
  podiumProb: number;
  /** ya no puede alcanzar al líder ni con todos los puntos que quedan */
  eliminated: boolean;
}

export interface TeamProjection {
  team: string;
  points: number;
  titleProb: number;
  expected: number;
}

export const RACE_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
export const SPRINT_POINTS = [8, 7, 6, 5, 4, 3, 2, 1];

/** Generador pseudoaleatorio con semilla: mismos datos, mismo resultado. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normal(rand: () => number): number {
  // Box-Muller
  const u = Math.max(rand(), 1e-12);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}

interface Skill {
  mu: number;
  sigma: number;
  dnf: number;
}

/** Nivel de cada piloto en [0, 1]: 1 = ganar siempre, 0 = terminar último. Se achica hacia el promedio si hay pocos datos. */
export function estimateSkills(drivers: DriverSeason[]): Skill[] {
  const field = Math.max(drivers.length, ...drivers.flatMap((d) => d.finishes.filter((f): f is number => f != null)));
  const score = (pos: number) => 1 - (pos - 1) / (field - 1);
  const classified = drivers.map((d) => d.finishes.filter((f): f is number => f != null).map(score));
  const all = classified.flat();
  const poolMean = all.reduce((a, b) => a + b, 0) / (all.length || 1);
  const poolVar = all.reduce((a, b) => a + (b - poolMean) ** 2, 0) / (all.length || 1);
  const poolSigma = Math.sqrt(poolVar) * 0.55;
  const totalRaces = drivers.reduce((a, d) => a + d.finishes.length, 0);
  const poolDnf = drivers.reduce((a, d) => a + d.finishes.filter((f) => f == null).length, 0) / (totalRaces || 1);
  const K = 3; // cuántas carreras "de crédito" tiene el promedio general
  return drivers.map((d, i) => {
    const xs = classified[i];
    const n = xs.length;
    const mean = n ? xs.reduce((a, b) => a + b, 0) / n : poolMean;
    const sd = n > 1 ? Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1)) : poolSigma;
    const races = d.finishes.length;
    const dnfRaw = races ? d.finishes.filter((f) => f == null).length / races : poolDnf;
    return {
      mu: (n * mean + K * poolMean) / (n + K),
      sigma: Math.max(0.05, (n * sd + K * poolSigma) / (n + K)),
      dnf: Math.min(0.35, (races * dnfRaw + K * poolDnf) / (races + K)),
    };
  });
}

/** Cuánto puede cambiar el nivel real de un piloto durante lo que queda del año (desarrollo del auto, forma). */
export const LEVEL_DRIFT = 0.1;

export function simulate(drivers: DriverSeason[], remaining: Weekend[], runs = 8000, seed = 2026, drift = LEVEL_DRIFT): { drivers: Projection[]; teams: TeamProjection[] } {
  const n = drivers.length;
  const skills = estimateSkills(drivers);
  const rand = mulberry32(seed);
  const wins = new Array<number>(n).fill(0);
  const podiums = new Array<number>(n).fill(0);
  const sums = new Array<number>(n).fill(0);
  const finals: number[][] = drivers.map(() => []);
  const teamNames = [...new Set(drivers.map((d) => d.team))];
  const teamIdx = drivers.map((d) => teamNames.indexOf(d.team));
  const teamBase = teamNames.map((t) => drivers.filter((d) => d.team === t).reduce((a, d) => a + d.points, 0));
  const teamWins = new Array<number>(teamNames.length).fill(0);
  const teamSums = new Array<number>(teamNames.length).fill(0);
  const perf = new Array<number>(n);
  const order = new Array<number>(n);
  const total = new Array<number>(n);
  const level = new Array<number>(n);

  const rank = (table: number[]) => {
    for (let i = 0; i < n; i++) perf[i] = rand() < skills[i].dnf ? -Infinity : level[i] + skills[i].sigma * normal(rand);
    for (let i = 0; i < n; i++) order[i] = i;
    order.sort((a, b) => perf[b] - perf[a]);
    for (let k = 0; k < table.length && k < n; k++) {
      if (perf[order[k]] === -Infinity) break;
      total[order[k]] += table[k];
    }
  };

  for (let r = 0; r < runs; r++) {
    // Nivel "verdadero" de cada piloto en este futuro posible: se mantiene durante todas las carreras que faltan.
    for (let i = 0; i < n; i++) {
      level[i] = skills[i].mu + drift * normal(rand);
      total[i] = drivers[i].points;
    }
    for (const wk of remaining) {
      if (wk.sprint) rank(SPRINT_POINTS);
      rank(RACE_POINTS);
    }
    let best = 0;
    for (let i = 0; i < n; i++) {
      if (total[i] > total[best]) best = i;
      sums[i] += total[i];
      finals[i].push(total[i]);
    }
    wins[best]++;
    const sorted = [...total.keys()].sort((a, b) => total[b] - total[a]);
    for (let k = 0; k < 3; k++) podiums[sorted[k]]++;
    const tt = teamBase.slice(0);
    for (let i = 0; i < n; i++) tt[teamIdx[i]] += total[i] - drivers[i].points;
    let tb = 0;
    for (let t = 0; t < tt.length; t++) {
      teamSums[t] += tt[t];
      if (tt[t] > tt[tb]) tb = t;
    }
    teamWins[tb]++;
  }

  const maxPerWeekend = remaining.reduce((a, w) => a + 25 + (w.sprint ? 8 : 0), 0);
  const leader = Math.max(...drivers.map((d) => d.points));
  const out: Projection[] = drivers.map((d, i) => {
    const f = finals[i].sort((a, b) => a - b);
    return {
      id: d.id,
      name: d.name,
      team: d.team,
      points: d.points,
      titleProb: wins[i] / runs,
      expected: sums[i] / runs,
      low: f[Math.floor(runs * 0.1)],
      high: f[Math.floor(runs * 0.9)],
      podiumProb: podiums[i] / runs,
      eliminated: d.points + maxPerWeekend < leader,
    };
  });
  out.sort((a, b) => b.titleProb - a.titleProb || b.expected - a.expected);
  const teams: TeamProjection[] = teamNames
    .map((t, i) => ({ team: t, points: teamBase[i], titleProb: teamWins[i] / runs, expected: teamSums[i] / runs }))
    .sort((a, b) => b.titleProb - a.titleProb || b.expected - a.expected);
  return { drivers: out, teams };
}
