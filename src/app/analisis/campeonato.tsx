import { Stack } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { schedule, seasonResults } from '@/api/f1';
import { Group, Muted, SectionLabel, Segmented, StateView, T } from '@/components/ui';
import { F1_TEAMS } from '@/data/f1';
import { simulate, type DriverSeason, type Projection, type TeamProjection } from '@/lib/championship';
import { useAsync } from '@/lib/use-async';
import { radius, sp, usePalette } from '@/theme';

const RUNS = 10000;

async function run() {
  const [races, calendar] = await Promise.all([seasonResults(), schedule()]);
  const done = races.filter((r) => r.results.length);
  const last = done.length ? Number(done[done.length - 1].round) : 0;

  const by = new Map<string, DriverSeason>();
  for (const race of done) {
    for (const res of race.results) {
      const id = res.Driver.driverId;
      const d = by.get(id) ?? { id, name: `${res.Driver.givenName} ${res.Driver.familyName}`, team: res.Constructor.constructorId, points: 0, finishes: [] };
      d.team = res.Constructor.constructorId;
      d.points += Number(res.points);
      d.finishes.push(/^\d+$/.test(res.positionText) ? Number(res.position) : null);
      by.set(id, d);
    }
    for (const res of race.sprint) {
      const d = by.get(res.Driver.driverId);
      if (d) d.points += Number(res.points);
    }
  }
  const remaining = calendar.filter((c) => Number(c.round) > last).map((c) => ({ sprint: !!c.Sprint }));
  // Deja respirar a la interfaz antes de calcular (el cálculo ocupa el hilo un momento).
  await new Promise((r) => setTimeout(r, 40));
  return { sim: simulate([...by.values()], remaining, RUNS), remaining, last, drivers: by.size };
}

const pct = (x: number) => (x >= 0.995 ? '>99 %' : x < 0.005 && x > 0 ? '<1 %' : `${Math.round(x * 100)} %`);

export default function ChampionshipScreen() {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'drivers' | 'teams'>('drivers');
  const { data, loading, error, refreshing, refresh } = useAsync(() => run(), []);

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <Stack.Screen options={{ title: 'Probabilidades de título' }} />
      <ScrollView
        contentContainerStyle={{ padding: sp.lg, paddingBottom: insets.bottom + sp.xxl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={p.muted} colors={[p.accent]} />}>
        <Muted>
          Simula {RUNS.toLocaleString('es-AR')} veces lo que queda de la temporada, a partir del rendimiento de cada piloto en las carreras que ya se corrieron.
        </Muted>

        {!data ? (
          <StateView loading={loading} error={error} onRetry={refresh} />
        ) : (
          <>
            <View style={{ marginTop: sp.lg }}>
              <Segmented
                value={mode}
                onChange={setMode}
                options={[
                  { value: 'drivers', label: 'Pilotos' },
                  { value: 'teams', label: 'Constructores' },
                ]}
              />
            </View>
            <Muted v="caption" style={{ marginTop: sp.md }}>
              Tras la ronda {data.last} · quedan {data.remaining.length} {data.remaining.length === 1 ? 'carrera' : 'carreras'}
              {data.remaining.some((r) => r.sprint) ? ` (${data.remaining.filter((r) => r.sprint).length} con sprint)` : ''}.
            </Muted>

            {mode === 'drivers' ? <DriverList rows={data.sim.drivers} /> : <TeamList rows={data.sim.teams} />}

            <SectionLabel>Cómo funciona</SectionLabel>
            <Group>
              <View style={{ padding: sp.lg, gap: sp.sm }}>
                <Muted>1. Del resultado de cada piloto este año se saca su nivel y qué tan regular es, y con qué frecuencia abandona.</Muted>
                <Muted>2. En cada carrera que falta se sortea un rendimiento por piloto, se ordena la llegada y se reparten los puntos del reglamento (también los del sprint).</Muted>
                <Muted>3. Se repite {RUNS.toLocaleString('es-AR')} veces, dejando que el nivel de cada uno cambie un poco de un futuro posible a otro. Gana el título quien más puntos suma en cada repetición.</Muted>
                <Muted>Probado de forma retroactiva con esta temporada, el rango mostrado contuvo el resultado real del 82 al 91 % de los pilotos, y el modelo ubicó al campeón actual primero desde el principio.</Muted>
                <Muted>No sabe de mejoras del auto, penalizaciones ni clima: es una estimación, no un pronóstico.</Muted>
              </View>
            </Group>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Bar({ value }: { value: number }) {
  const p = usePalette();
  return (
    <View style={[st.bar, { backgroundColor: p.raised }]}>
      <View style={{ width: `${Math.max(value > 0 ? 1.5 : 0, value * 100)}%`, height: 4, borderRadius: 2, backgroundColor: p.accent }} />
    </View>
  );
}

function DriverList({ rows }: { rows: Projection[] }) {
  const live = rows.filter((r) => !r.eliminated);
  const out = rows.filter((r) => r.eliminated);
  return (
    <>
      <SectionLabel>Pilotos con chances</SectionLabel>
      <Group>
        {live.map((r) => (
          <View key={r.id} style={st.row}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: sp.sm }}>
              <View style={{ width: 4, height: 18, borderRadius: 2, backgroundColor: F1_TEAMS[r.team]?.color ?? '#888' }} />
              <T v="bodyMedium" style={{ flex: 1 }} numberOfLines={1}>{r.name}</T>
              <T v="num">{pct(r.titleProb)}</T>
            </View>
            <Bar value={r.titleProb} />
            <Muted v="caption">
              Hoy {r.points} pts · final esperado {Math.round(r.expected)} (rango {Math.round(r.low)}–{Math.round(r.high)})
            </Muted>
          </View>
        ))}
      </Group>
      {out.length ? (
        <>
          <SectionLabel>Sin chances matemáticas</SectionLabel>
          <Group>
            {out.map((r) => (
              <View key={r.id} style={[st.row, { flexDirection: 'row', justifyContent: 'space-between' }]}>
                <T v="small" numberOfLines={1} style={{ flex: 1 }}>{r.name}</T>
                <Muted v="caption">{r.points} pts</Muted>
              </View>
            ))}
          </Group>
        </>
      ) : null}
    </>
  );
}

function TeamList({ rows }: { rows: TeamProjection[] }) {
  return (
    <>
      <SectionLabel>Constructores</SectionLabel>
      <Group>
        {rows.map((r) => (
          <View key={r.team} style={st.row}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: sp.sm }}>
              <View style={{ width: 4, height: 18, borderRadius: 2, backgroundColor: F1_TEAMS[r.team]?.color ?? '#888' }} />
              <T v="bodyMedium" style={{ flex: 1 }} numberOfLines={1}>{F1_TEAMS[r.team]?.name ?? r.team}</T>
              <T v="num">{pct(r.titleProb)}</T>
            </View>
            <Bar value={r.titleProb} />
            <Muted v="caption">Hoy {r.points} pts · final esperado {Math.round(r.expected)}</Muted>
          </View>
        ))}
      </Group>
    </>
  );
}

const st = StyleSheet.create({
  row: { paddingHorizontal: sp.lg, paddingVertical: sp.md, gap: 6 },
  bar: { height: 4, borderRadius: radius.sm - 4 },
});
