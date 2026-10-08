import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import * as of1 from '@/api/openf1';
import { LineChart } from '@/components/chart';
import { Chip, ChipRow, FactList, Group, Muted, SectionLabel, Stat, StatGrid, StateView, T } from '@/components/ui';
import { actualPlan, enumerate, fit, prepare, type Dry, type Fit, type Plan } from '@/lib/strategy';
import { fmtLap } from '@/lib/telemetry';
import { circuitEs } from '@/lib/text';
import { useAsync } from '@/lib/use-async';
import { radius, sp, usePalette } from '@/theme';

const YEAR = 2026;
const COMPOUND: Record<Dry, { name: string; color: string; letter: string }> = {
  SOFT: { name: 'Blando', color: '#E5484D', letter: 'B' },
  MEDIUM: { name: 'Medio', color: '#F2C230', letter: 'M' },
  HARD: { name: 'Duro', color: '#C9CED6', letter: 'D' },
};
const mmss = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;
const long = (s: number) => `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${(s % 60).toFixed(1).padStart(4, '0')}`;

export default function StrategyScreen() {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const [raceSel, setRace] = useState<number>();
  const [driverSel, setDriver] = useState<number>();

  const races = useAsync(() => of1.raceSessions(YEAR), []);
  const list = races.data ?? [];

  const data = useAsync(async () => {
    if (!list.length) return null;
    // Si el usuario no eligió, se prueba desde la carrera más reciente hasta encontrar una seca.
    const order = raceSel != null ? [raceSel] : [...list].reverse().slice(0, 6).map((r) => r.session_key);
    let skipped = 0;
    for (const key of order) {
      const [laps, stints, drivers, result] = await Promise.all([of1.raceLaps(key), of1.raceStints(key), of1.sessionDrivers(key), of1.sessionResult(key).catch(() => [])]);
      const prep = prepare(laps, stints);
      if (prep.wet) {
        if (raceSel != null || key === order[order.length - 1]) return { wet: true as const, share: prep.share, sessionKey: key, skipped };
        skipped++;
        continue;
      }
      // Deja pintar el indicador de carga antes del cálculo.
      await new Promise((r) => setTimeout(r, 30));
      const order2 = result.filter((x) => x.position).sort((a, b) => a.position! - b.position!).map((x) => x.driver_number);
      return { wet: false as const, model: fit(prep), stints, drivers, order: order2, sessionKey: key, skipped };
    }
    return null;
  }, [raceSel, list.length]);
  const sessionKey = data.data?.sessionKey;

  const ready = data.data && !data.data.wet ? data.data : null;
  const model: Fit | null | undefined = ready?.model;
  const candidates = useMemo(() => (ready?.order.length ? ready.order : (ready?.drivers ?? []).map((d) => d.driver_number)).filter((n) => model?.base[n] != null), [ready, model]);
  const driver = driverSel != null && candidates.includes(driverSel) ? driverSel : candidates[0];
  const byNumber = useMemo(() => Object.fromEntries((ready?.drivers ?? []).map((d) => [d.driver_number, d])), [ready]);

  const plans = useMemo(() => (model && driver != null ? enumerate(model, driver, 6) : []), [model, driver]);
  const actual = useMemo(() => (model && driver != null && ready ? actualPlan(model, ready.stints, driver) : null), [model, driver, ready]);
  const race = list.find((r) => r.session_key === sessionKey);

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <Stack.Screen options={{ title: 'Simulador de estrategia' }} />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + sp.xxl }}>
        <Muted style={{ paddingHorizontal: sp.lg }}>
          Con los tiempos reales de una carrera calcula cuánto se desgasta cada neumático, cuánto cuesta parar en boxes y compara estrategias de una y dos paradas.
        </Muted>

        {races.data ? (
          <ChipRow>
            {[...list].reverse().map((r) => (
              <Chip key={r.session_key} label={circuitEs(r.circuit_short_name)} active={r.session_key === sessionKey} onPress={() => setRace(r.session_key)} />
            ))}
          </ChipRow>
        ) : (
          <StateView loading={races.loading} error={races.error} onRetry={races.refresh} />
        )}

        <View style={{ paddingHorizontal: sp.lg }}>
          {data.data && data.data.skipped ? (
            <Muted v="caption" style={{ marginBottom: sp.sm }}>
              Se salteó {data.data.skipped === 1 ? 'la carrera más reciente, que tuvo' : `las ${data.data.skipped} carreras más recientes, que tuvieron`} lluvia o pista mixta: el modelo solo trabaja con neumáticos secos.
            </Muted>
          ) : null}
          {!data.data ? (
            <StateView loading={data.loading} error={data.error} onRetry={data.refresh} />
          ) : data.data.wet ? (
            <StateView empty="Esta carrera tuvo lluvia o pista mixta. El modelo solo trabaja con neumáticos secos: elegí otra carrera." />
          ) : !model ? (
            <StateView empty="Esta carrera no tiene vueltas suficientes con al menos dos compuestos secos para ajustar el modelo." />
          ) : (
            <>
              <SectionLabel style={{ marginTop: sp.sm }}>GP de {race ? circuitEs(race.circuit_short_name) : ''} · lo que dicen los datos</SectionLabel>
              <StatGrid>
                <Stat label={model.pitMeasured ? 'segundos por parada' : 'segundos por parada (típico)'} value={model.pitLoss.toFixed(1)} strong />
                <Stat label="s/vuelta que mejora el auto" value={(-model.fuel).toFixed(3)} />
                <Stat label="vueltas analizadas" value={model.samples} />
              </StatGrid>
              <Muted v="caption" style={{ marginTop: sp.sm }}>
                {model.pitMeasured
                  ? `El costo de parada se midió en ${model.pitStops} paradas reales, comparando las vueltas de entrada y salida con el ritmo esperado.`
                  : 'En esta carrera hubo muy pocas paradas medibles: se usa el costo típico de la F1 (≈ 22 s).'}{' '}
                La mejora por vuelta junta la carga de combustible que se quema y la evolución de la pista. Error típico del modelo por vuelta: {model.residual.toFixed(2)} s.
              </Muted>

              <SectionLabel>Neumáticos</SectionLabel>
              <Group>
                {model.compounds.map((c) => (
                  <View key={c.compound} style={st.compound}>
                    <View style={[st.dot, { backgroundColor: COMPOUND[c.compound].color }]} />
                    <View style={{ flex: 1 }}>
                      <T v="bodyMedium">{COMPOUND[c.compound].name}</T>
                      <Muted v="caption">
                        {c.laps} vueltas · hasta {c.maxAge} de edad
                        {c.tied ? ' · no se distingue del vecino en esta carrera' : ''}
                      </Muted>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <T v="num">+{c.deg.toFixed(3)} s</T>
                      <Muted v="caption">por vuelta de uso</Muted>
                    </View>
                  </View>
                ))}
              </Group>
              <LineChart
                title="Pérdida por desgaste"
                unit="s respecto de un neumático nuevo"
                height={150}
                xLabel={(x) => `${Math.round(x)}`}
                yLabel={(y) => y.toFixed(1)}
                series={model.compounds.map((c) => ({
                  id: c.compound,
                  color: COMPOUND[c.compound].color,
                  points: Array.from({ length: c.maxAge + 1 }, (_, age) => [age, c.deg * age] as [number, number]),
                }))}
              />
              <Muted v="caption" style={{ marginTop: sp.xs }}>Eje horizontal: vueltas de uso del neumático.</Muted>

              <SectionLabel>Estrategias para</SectionLabel>
              <ChipRow style={{ paddingHorizontal: 0 }}>
                {candidates.slice(0, 22).map((n) => (
                  <Chip key={n} label={byNumber[n]?.name_acronym ?? String(n)} active={n === driver} onPress={() => setDriver(n)} dot={byNumber[n]?.team_colour ? `#${byNumber[n].team_colour}` : undefined} />
                ))}
              </ChipRow>
              <Muted v="caption" style={{ marginBottom: sp.sm }}>
                Cada piloto tiene su ritmo base ({driver != null ? fmtLap(model.base[driver]) : ''} a la salida con neumático nuevo), así que el ranking de estrategias cambia un poco entre ellos.
              </Muted>

              <Group>
                {plans.map((plan, i) => (
                  <PlanRow key={plan.stints.map((s) => `${s.compound}${s.laps}`).join('-')} plan={plan} best={plans[0].total} rank={i + 1} />
                ))}
              </Group>
              {actual ? (
                <>
                  <SectionLabel>Lo que hizo en la carrera</SectionLabel>
                  <Group>
                    <PlanRow plan={actual} best={plans[0].total} />
                  </Group>
                  <Muted v="caption" style={{ marginTop: sp.sm }}>
                    Según el modelo, su estrategia real costó {Math.max(0, actual.total - plans[0].total).toFixed(1)} s más que la mejor de la lista. Es una estimación de ritmo: no incluye safety cars, tráfico ni qué neumáticos le quedaban.
                  </Muted>
                </>
              ) : null}
              {plans.length > 1 && plans[2] && plans[2].total - plans[0].total < 3 ? (
                <Muted v="caption" style={{ marginTop: sp.sm }}>Las primeras opciones están a menos de 3 s entre sí: con este nivel de ruido son un empate técnico.</Muted>
              ) : null}

              <SectionLabel>Cómo funciona</SectionLabel>
              <Group>
                <View style={{ paddingHorizontal: sp.lg }}>
                  <FactList
                    facts={[
                      ['Datos', 'Tiempos por vuelta, neumáticos y boxes de OpenF1 (live timing oficial)'],
                      ['Limpieza', 'Sin la primera vuelta, entradas y salidas de boxes ni vueltas más de 4,5 % más lentas que el ritmo del piloto'],
                      ['Modelo', 'Mínimos cuadrados con un efecto por piloto, uno por vuelta de carrera, y un desgaste por compuesto'],
                      ['Límite', 'Un stint no puede pasar de la edad máxima vista en la carrera más 3 vueltas'],
                    ]}
                  />
                </View>
              </Group>
              <Muted v="caption" style={{ marginTop: sp.sm }}>
                Inspirado en el trabajo de Ark07Yad/pitwall y camiloclarke/F1-Tyre-Degradation (reescrito, sin copiar código).
              </Muted>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function PlanRow({ plan, best, rank }: { plan: Plan; best: number; rank?: number }) {
  const p = usePalette();
  const delta = plan.total - best;
  const total = plan.stints.reduce((a, s) => a + s.laps, 0);
  return (
    <View style={{ padding: sp.lg, gap: sp.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <T v="bodyMedium">
          {rank ? `${rank}. ` : ''}
          {plan.stints.length - 1} {plan.stints.length === 2 ? 'parada' : 'paradas'}
        </T>
        <View style={{ alignItems: 'flex-end' }}>
          <T v="num">{long(plan.total)}</T>
          <Muted v="caption">{delta < 0.05 ? 'la mejor' : `+${delta.toFixed(1)} s`}</Muted>
        </View>
      </View>
      <View style={st.bar}>
        {plan.stints.map((s, i) => (
          <View key={i} style={[st.seg, { flex: s.laps / total, backgroundColor: COMPOUND[s.compound].color, borderLeftColor: p.surface }]}>
            <T v="caption" color="#15181D" style={{ fontFamily: 'IBMPlexSans_500Medium' }}>
              {COMPOUND[s.compound].letter} {s.laps}
            </T>
          </View>
        ))}
      </View>
      <Muted v="caption">
        Paradas en la vuelta {plan.pitLaps.join(' y ')} · {mmss(plan.total / total)} por vuelta de promedio
      </Muted>
    </View>
  );
}

const st = StyleSheet.create({
  compound: { flexDirection: 'row', alignItems: 'center', gap: sp.md, paddingHorizontal: sp.lg, paddingVertical: sp.md },
  dot: { width: 12, height: 12, borderRadius: 6 },
  bar: { flexDirection: 'row', height: 28, borderRadius: radius.sm, overflow: 'hidden' },
  seg: { alignItems: 'center', justifyContent: 'center', borderLeftWidth: 2 },
});
