/**
 * Simulador de estrategia de F1 a partir de los datos reales de una carrera (OpenF1).
 *
 * 1. Limpia las vueltas: sin la primera, sin entrada/salida de boxes, sin vueltas lentas (safety car, tráfico).
 * 2. Ajusta por mínimos cuadrados   tiempo = base_del_piloto + diferencia_del_compuesto + desgaste_del_compuesto × edad + combustible × nº_de_vuelta
 *    (el efecto del combustible se separa del desgaste; es la misma idea que usan los modelos de degradación
 *    de pitwall y camiloclarke/F1-Tyre-Degradation, reescrita sin copiar código).
 * 3. Mide cuánto cuesta realmente una parada comparando las vueltas de entrada y salida con lo que predice el modelo.
 * 4. Prueba todas las estrategias de una y dos paradas con compuestos secos y las ordena por tiempo de carrera.
 *
 * No modela safety cars, tráfico, clima ni cuántos juegos de neumáticos quedaban: es una comparación de ritmo puro.
 * Sin dependencias para poder probarse con Node.
 */

export type Dry = 'SOFT' | 'MEDIUM' | 'HARD';
export const DRY: Dry[] = ['SOFT', 'MEDIUM', 'HARD'];

export interface RawLap {
  driver_number: number;
  lap_number: number;
  lap_duration: number | null;
  is_pit_out_lap: boolean;
}
export interface RawStint {
  driver_number: number;
  stint_number: number;
  lap_start: number;
  lap_end: number;
  compound: string;
  tyre_age_at_start: number;
}

interface Sample {
  d: number;
  lap: number;
  age: number;
  c: Dry;
  t: number;
}

export interface CompoundFit {
  compound: Dry;
  laps: number;
  /** segundos por vuelta respecto del compuesto de referencia (negativo = más rápido) */
  offset: number;
  /** segundos que pierde por cada vuelta de uso */
  deg: number;
  /** edad máxima vista en la carrera */
  maxAge: number;
  /** los datos no permiten separarlo del compuesto vecino: se le asignó el mismo valor */
  tied?: boolean;
}

export interface Fit {
  drivers: number[];
  base: Record<number, number>;
  compounds: CompoundFit[];
  reference: Dry;
  /** segundos por vuelta que se gana por quemar combustible (negativo = el auto mejora) */
  fuel: number;
  /** término cuadrático del número de vuelta (evolución de pista y combustible no lineales) */
  curve: number;
  totalLaps: number;
  pitLoss: number;
  /** paradas reales con las que se midió el costo; con menos de 4 se usa un valor típico */
  pitStops: number;
  pitMeasured: boolean;
  residual: number;
  samples: number;
}

export interface Plan {
  stints: { compound: Dry; laps: number }[];
  total: number;
  pitLaps: number[];
}

export type Prepared = { wet: true; share: number } | { wet: false; samples: Sample[]; totalLaps: number; stints: RawStint[]; laps: RawLap[] };

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : NaN;
};

export function prepare(laps: RawLap[], stints: RawStint[]): Prepared {
  const totalLaps = Math.max(...laps.map((l) => l.lap_number));
  const stintOf = (d: number, lap: number) => stints.find((s) => s.driver_number === d && lap >= s.lap_start && lap <= s.lap_end);

  const wetLaps = laps.filter((l) => {
    const s = stintOf(l.driver_number, l.lap_number);
    return s && (s.compound === 'INTERMEDIATE' || s.compound === 'WET');
  }).length;
  const share = wetLaps / laps.length;
  // Si tres o más pilotos usaron neumáticos de lluvia (aunque sea una vuelta de salida) o más de un 5 % de las vueltas fue
  // mojado, la pista cambió demasiado: el modelo de neumáticos secos no aplica.
  const wetDrivers = new Set(stints.filter((s) => s.compound === 'INTERMEDIATE' || s.compound === 'WET').map((s) => s.driver_number)).size;
  if (share > 0.05 || wetDrivers >= 3) return { wet: true, share };

  const lastStint = new Map<number, number>();
  for (const s of stints) lastStint.set(s.driver_number, Math.max(lastStint.get(s.driver_number) ?? 0, s.stint_number));

  const candidates: Sample[] = [];
  for (const l of laps) {
    if (!l.lap_duration || l.is_pit_out_lap || l.lap_number < 2) continue;
    const s = stintOf(l.driver_number, l.lap_number);
    if (!s || !DRY.includes(s.compound as Dry)) continue;
    // vuelta de entrada a boxes: la última del stint, si el piloto sigue con otro
    if (l.lap_number === s.lap_end && s.stint_number < (lastStint.get(l.driver_number) ?? 0)) continue;
    candidates.push({ d: l.driver_number, lap: l.lap_number, age: s.tyre_age_at_start + (l.lap_number - s.lap_start), c: s.compound as Dry, t: l.lap_duration });
  }

  // Descarta vueltas lentas respecto del ritmo propio de cada piloto (safety car, bandera amarilla, tráfico).
  const byDriver = new Map<number, Sample[]>();
  for (const c of candidates) byDriver.set(c.d, [...(byDriver.get(c.d) ?? []), c]);
  const samples: Sample[] = [];
  for (const [, list] of byDriver) {
    const sorted = list.map((x) => x.t).sort((a, b) => a - b);
    const ref = median(sorted.slice(0, Math.max(5, Math.floor(sorted.length * 0.4))));
    for (const x of list) if (x.t <= ref * 1.045) samples.push(x);
  }
  return { wet: false, samples, totalLaps, stints, laps };
}

/** Resuelve A·x = b por eliminación gaussiana con pivoteo. */
function solve(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
    [M[c], M[piv]] = [M[piv], M[c]];
    const d = M[c][c] || 1e-12;
    for (let r = c + 1; r < n; r++) {
      const f = M[r][c] / d;
      if (f) for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  const x = new Array<number>(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r][n];
    for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k];
    x[r] = s / (M[r][r] || 1e-12);
  }
  return x;
}

export function fit(prep: Extract<Prepared, { wet: false }>, minLaps = 40): Fit | null {
  const { samples, totalLaps, laps, stints } = prep;
  const count: Record<string, number> = {};
  for (const s of samples) count[s.c] = (count[s.c] ?? 0) + 1;
  const compounds = DRY.filter((c) => (count[c] ?? 0) >= minLaps);
  if (compounds.length < 2) return null;
  const used = samples.filter((s) => compounds.includes(s.c));
  const drivers = [...new Set(used.map((s) => s.d))].sort((a, b) => a - b);
  const reference = [...compounds].sort((a, b) => count[b] - count[a])[0];
  const others = compounds.filter((c) => c !== reference);

  // Columnas: pilotos | diferencia por compuesto (menos la referencia) | desgaste por compuesto | un efecto fijo por vuelta de carrera.
  // El efecto por vuelta absorbe el combustible, la evolución de la pista y las banderas: así los compuestos se comparan
  // entre pilotos que corren la MISMA vuelta, en lugar de suponer una curva de combustible.
  const nD = drivers.length;
  const nO = others.length;
  const nC = compounds.length;
  const lapNums = [...new Set(used.map((s) => s.lap))].sort((a, b) => a - b);
  const nL = lapNums.length - 1; // la primera vuelta es la referencia
  const P = nD + nO + nC + nL;
  const row = (s: Sample) => {
    const x = new Array<number>(P).fill(0);
    x[drivers.indexOf(s.d)] = 1;
    const o = others.indexOf(s.c);
    if (o >= 0) x[nD + o] = 1;
    x[nD + nO + compounds.indexOf(s.c)] = s.age;
    const li = lapNums.indexOf(s.lap);
    if (li > 0) x[nD + nO + nC + li - 1] = 1;
    return x;
  };
  const AtA = Array.from({ length: P }, () => new Array<number>(P).fill(0));
  const Atb = new Array<number>(P).fill(0);
  for (const s of used) {
    const x = row(s);
    const nz: number[] = [];
    for (let i = 0; i < P; i++) if (x[i]) nz.push(i);
    for (const i of nz) {
      Atb[i] += x[i] * s.t;
      for (const j of nz) AtA[i][j] += x[i] * x[j];
    }
  }
  for (let i = 0; i < P; i++) AtA[i][i] += 1e-6; // regularización mínima
  const beta = solve(AtA, Atb);

  let sse = 0;
  for (const s of used) {
    const x = row(s);
    const pred = x.reduce((a, v, i) => a + v * beta[i], 0);
    sse += (s.t - pred) ** 2;
  }
  const base: Record<number, number> = {};
  drivers.forEach((d, i) => (base[d] = beta[i]));
  const comp: CompoundFit[] = compounds.map((c, i) => ({
    compound: c,
    laps: count[c],
    offset: c === reference ? 0 : beta[nD + others.indexOf(c)],
    deg: Math.max(0.002, beta[nD + nO + i]),
    maxAge: Math.max(...used.filter((s) => s.c === c).map((s) => s.age)),
  }));
  // Tendencia de los efectos por vuelta (cuánto mejora el auto a medida que avanza la carrera): recta + curva suave.
  const lapEffect = lapNums.map((lap, i) => ({ lap, e: i === 0 ? 0 : beta[nD + nO + nC + i - 1], w: used.filter((u) => u.lap === lap).length }));
  const trend = (() => {
    const X = (l: number) => [1, l, (l * l) / 100];
    const A = Array.from({ length: 3 }, () => new Array<number>(3).fill(0));
    const b = new Array<number>(3).fill(0);
    for (const { lap, e, w } of lapEffect) {
      if (w < 4) continue;
      const x = X(lap);
      for (let i = 0; i < 3; i++) {
        b[i] += w * x[i] * e;
        for (let j = 0; j < 3; j++) A[i][j] += w * x[i] * x[j];
      }
    }
    for (let i = 0; i < 3; i++) A[i][i] += 1e-9;
    return solve(A, b);
  })();
  monotone(comp);
  const fuel = trend[1];
  const curve = trend[2] / 100;

  // Costo de una parada: vueltas de entrada y salida contra lo que predice el modelo.
  const losses: number[] = [];
  const predict = (d: number, lap: number, c: Dry, age: number) => base[d] + (comp.find((x) => x.compound === c)?.offset ?? 0) + (comp.find((x) => x.compound === c)?.deg ?? 0) * age + fuel * lap + curve * lap * lap;
  const lapMap = new Map(laps.map((l) => [`${l.driver_number}-${l.lap_number}`, l]));
  for (const s of stints) {
    const prev = stints.find((p) => p.driver_number === s.driver_number && p.stint_number === s.stint_number - 1);
    if (!prev || base[s.driver_number] == null) continue;
    const inLap = lapMap.get(`${s.driver_number}-${prev.lap_end}`);
    const outLap = lapMap.get(`${s.driver_number}-${s.lap_start}`);
    const cIn = prev.compound as Dry;
    const cOut = s.compound as Dry;
    if (!inLap?.lap_duration || !outLap?.lap_duration || !compounds.includes(cIn) || !compounds.includes(cOut)) continue;
    const loss =
      inLap.lap_duration + outLap.lap_duration - predict(s.driver_number, prev.lap_end, cIn, prev.tyre_age_at_start + (prev.lap_end - prev.lap_start)) - predict(s.driver_number, s.lap_start, cOut, s.tyre_age_at_start);
    if (loss > 12 && loss < 45) losses.push(loss);
  }
  const pitLoss = losses.length >= 4 ? median(losses) : 22;

  return { drivers, base, compounds: comp, reference, fuel, curve, totalLaps, pitLoss, pitStops: losses.length, pitMeasured: losses.length >= 4, residual: Math.sqrt(sse / used.length), samples: used.length };
}

/**
 * Un neumático más blando no puede ser más lento que uno más duro (a igual edad). Con el ruido de una sola carrera el
 * ajuste a veces lo contradice: se corrige promediando los vecinos que violan el orden (regresión isotónica).
 */
function monotone(comp: CompoundFit[]) {
  const ordered = DRY.map((c) => comp.find((x) => x.compound === c)).filter((x): x is CompoundFit => !!x);
  const blocks = ordered.map((c) => ({ sum: c.offset * c.laps, w: c.laps, items: [c] }));
  for (let i = 0; i < blocks.length - 1; ) {
    if (blocks[i].sum / blocks[i].w > blocks[i + 1].sum / blocks[i + 1].w) {
      blocks[i] = { sum: blocks[i].sum + blocks[i + 1].sum, w: blocks[i].w + blocks[i + 1].w, items: [...blocks[i].items, ...blocks[i + 1].items] };
      blocks.splice(i + 1, 1);
      i = Math.max(0, i - 1);
    } else i++;
  }
  for (const b of blocks) for (const c of b.items) {
    c.offset = b.sum / b.w;
    if (b.items.length > 1) c.tied = true;
  }
}

/** Tiempo de un stint de `n` vueltas desde la vuelta `from`, con neumáticos nuevos. */
function stintTime(f: Fit, base: number, c: CompoundFit, from: number, n: number): number {
  const tri = (n * (n - 1)) / 2;
  const sq = ((n - 1) * n * (2 * n - 1)) / 6;
  return n * (base + c.offset) + c.deg * tri + f.fuel * (n * from + tri) + f.curve * (n * from * from + 2 * from * tri + sq);
}

export function planTime(f: Fit, driver: number, plan: { compound: Dry; laps: number }[]): number {
  let lap = 1;
  let total = 0;
  for (const s of plan) {
    total += stintTime(f, f.base[driver], f.compounds.find((c) => c.compound === s.compound)!, lap, s.laps);
    lap += s.laps;
  }
  return total + f.pitLoss * (plan.length - 1);
}

const MIN_STINT = 6;

/** Todas las estrategias de una y dos paradas, de mejor a peor. */
export function enumerate(f: Fit, driver: number, top = 6): Plan[] {
  const N = f.totalLaps;
  const cs = f.compounds;
  const maxLen = (c: CompoundFit) => c.maxAge + 3;
  const results: Plan[] = [];
  const valid = (seq: CompoundFit[]) => new Set(seq.map((c) => c.compound)).size >= 2;

  for (const a of cs) {
    for (const b of cs) {
      if (!valid([a, b])) continue;
      for (let l1 = MIN_STINT; l1 <= N - MIN_STINT; l1++) {
        const l2 = N - l1;
        if (l1 > maxLen(a) || l2 > maxLen(b)) continue;
        const plan = [{ compound: a.compound, laps: l1 }, { compound: b.compound, laps: l2 }];
        results.push({ stints: plan, total: planTime(f, driver, plan), pitLaps: [l1] });
      }
      for (const c of cs) {
        if (!valid([a, b, c])) continue;
        for (let l1 = MIN_STINT; l1 <= maxLen(a); l1++) {
          for (let l2 = MIN_STINT; l2 <= maxLen(b); l2++) {
            const l3 = N - l1 - l2;
            if (l3 < MIN_STINT || l3 > maxLen(c)) continue;
            const plan = [{ compound: a.compound, laps: l1 }, { compound: b.compound, laps: l2 }, { compound: c.compound, laps: l3 }];
            results.push({ stints: plan, total: planTime(f, driver, plan), pitLaps: [l1, l1 + l2] });
          }
        }
      }
    }
  }
  results.sort((x, y) => x.total - y.total);
  // De cada combinación de compuestos nos quedamos con su mejor versión, para que la lista no repita lo mismo.
  const seen = new Set<string>();
  const out: Plan[] = [];
  for (const r of results) {
    const key = r.stints.map((s) => s.compound).sort().join('-');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
    if (out.length >= top) break;
  }
  return out;
}

/** La estrategia que hizo realmente un piloto, con sus tiempos según el modelo. */
export function actualPlan(f: Fit, stints: RawStint[], driver: number): Plan | null {
  const list = stints.filter((s) => s.driver_number === driver).sort((a, b) => a.stint_number - b.stint_number);
  if (!list.length || list.some((s) => !f.compounds.some((c) => c.compound === s.compound))) return null;
  const plan = list.map((s) => ({ compound: s.compound as Dry, laps: s.lap_end - s.lap_start + 1 }));
  const covered = plan.reduce((a, s) => a + s.laps, 0);
  if (covered < f.totalLaps - 2) return null; // no terminó la carrera
  let lap = 0;
  const pitLaps = plan.slice(0, -1).map((s) => (lap += s.laps));
  // Si el último stint se pasa de la bandera a cuadros (vueltas de más), se recorta.
  plan[plan.length - 1].laps -= covered - f.totalLaps;
  return { stints: plan, total: planTime(f, driver, plan), pitLaps };
}
