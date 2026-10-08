import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import * as nascar from '@/api/nascar';
import { CompareBars, LineChart } from '@/components/chart';
import { Card, Chip, ChipRow, SectionLabel, StateView, T } from '@/components/ui';
import { useAsync } from '@/lib/use-async';
import { F, usePalette } from '@/theme';

const YEAR = 2026;
const PALETTE = ['#e8352e', '#2a7de1', '#f2a900', '#18a558'];

export default function NascarTelemetryScreen() {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const [series, setSeries] = useState(1);
  const [raceSel, setRaceId] = useState<number>();
  const [pickedSel, setPicked] = useState<string[] | null>(null);
  const [greenOnly, setGreenOnly] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const races = useAsync(() => nascar.races(series, YEAR), [series]);
  const raceList = races.data ?? [];
  const raceId = raceList.some((r) => r.race_id === raceSel) ? raceSel : raceList[raceList.length - 1]?.race_id;

  const data = useAsync(async () => {
    if (!raceId) return null;
    const [laps, loop] = await Promise.all([nascar.lapTimes(series, YEAR, raceId), nascar.loopData(series, YEAR, raceId).catch(() => [])]);
    return { laps, loop };
  }, [series, raceId]);

  // Por defecto, los tres primeros del resultado.
  const field = data.data?.laps.laps ?? [];
  const picked = pickedSel?.some((n) => field.some((x) => x.Number === n))
    ? pickedSel
    : [...field].sort((x, y) => x.RunningPos - y.RunningPos).slice(0, 3).map((x) => x.Number);

  const race = races.data?.find((r) => r.race_id === raceId);
  const green = useMemo(() => {
    const set = new Set<number>();
    data.data?.laps.flags.forEach((f) => f.FlagState === 1 && set.add(f.LapsCompleted));
    return set;
  }, [data.data]);

  const cars = useMemo(() => {
    const all = data.data?.laps.laps ?? [];
    return picked.map((n, i) => ({ car: all.find((c) => c.Number === n)!, color: PALETTE[i % PALETTE.length] })).filter((c) => c.car);
  }, [data.data, picked]);

  const toggle = (n: string) =>
    setPicked(picked.includes(n) ? picked.filter((x) => x !== n) : picked.length >= 4 ? [...picked.slice(1), n] : [...picked, n]);

  const loopById = useMemo(() => Object.fromEntries((data.data?.loop ?? []).map((d) => [d.driver_id, d])), [data.data]);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
      <Stack.Screen options={{ title: 'Telemetría NASCAR' }} />
      <T style={[st.lead, { color: p.muted }]}>Tiempo de cada vuelta, posición en carrera y loop data oficiales de nascar.com.</T>
      <ChipRow>
        {nascar.NASCAR_SERIES.map((s) => (
          <Chip key={s.id} label={s.name} active={s.id === series} onPress={() => { setSeries(s.id); setRaceId(undefined); setPicked(null); }} />
        ))}
      </ChipRow>
      {races.data ? (
        <ChipRow style={{ paddingTop: 0 }}>
          {[...races.data].reverse().map((r) => (
            <Chip key={r.race_id} label={`${r.track_name.replace(/ (Motor )?Speedway| Raceway| International/g, '')}`} active={r.race_id === raceId} onPress={() => { setRaceId(r.race_id); setPicked(null); }} />
          ))}
        </ChipRow>
      ) : (
        <StateView loading={races.loading} error={races.error} onRetry={races.refresh} />
      )}

      <View style={{ paddingHorizontal: 16 }}>
        {race ? (
          <Card>
            <T style={{ fontFamily: F.semi, fontSize: 18 }}>{race.race_name}</T>
            <T style={{ color: p.muted, fontSize: 13 }}>
              {race.track_name} · {race.actual_laps} vueltas · promedio {race.average_speed.toFixed(1)} mph · {race.number_of_lead_changes} cambios de líder · {race.number_of_cautions} banderas amarillas
            </T>
          </Card>
        ) : null}

        {!data.data ? (
          <StateView loading={data.loading} error={data.error} onRetry={data.refresh} />
        ) : (
          <>
            <SectionLabel>Pilotos (hasta 4)</SectionLabel>
            <View style={st.grid}>
              {[...data.data.laps.laps]
                .sort((a, b) => a.RunningPos - b.RunningPos)
                .filter((c, i) => showAll || i < 10 || picked.includes(c.Number))
                .map((c) => {
                const idx = picked.indexOf(c.Number);
                return (
                  <Chip key={c.Number} label={`P${c.RunningPos} #${c.Number} ${c.FullName.replace(/\s*\(.*\)$/, '').split(' ').slice(-1)[0]}`} active={idx >= 0} dot={idx >= 0 ? PALETTE[idx] : undefined} onPress={() => toggle(c.Number)} />
                );
              })}
              <Chip label={showAll ? 'Ver menos' : `Ver los ${data.data.laps.laps.length}`} onPress={() => setShowAll(!showAll)} />
            </View>

            <ChipRow style={{ paddingHorizontal: 0 }}>
              <Chip label="Solo vueltas en verde" active={greenOnly} onPress={() => setGreenOnly(!greenOnly)} />
            </ChipRow>

            <LineChart
              title="Tiempo por vuelta"
              unit="s"
              height={180}
              yLabel={(y) => y.toFixed(1)}
              series={cars.map(({ car, color }) => {
                const laps = car.Laps.filter((l) => l.LapTime && (!greenOnly || green.has(l.Lap)));
                const best = Math.min(...laps.map((l) => l.LapTime!));
                return { id: car.Number, color, points: laps.filter((l) => !greenOnly || l.LapTime! < best * 1.15).map((l) => [l.Lap, l.LapTime!] as [number, number]) };
              })}
            />
            <LineChart
              title="Posición en carrera"
              height={170}
              invertY
              yLabel={(y) => `P${Math.round(y)}`}
              series={cars.map(({ car, color }) => ({ id: car.Number, color, step: true, points: car.Laps.map((l) => [l.Lap, l.RunningPos] as [number, number]) }))}
            />
            <CompareBars
              title="Mejor vuelta"
              format={(v) => `${v.toFixed(3)} s`}
              rows={cars.map(({ car, color }) => ({ label: `#${car.Number}`, color, value: Math.min(...car.Laps.filter((l) => l.LapTime).map((l) => l.LapTime!)) }))}
            />

            {cars.some(({ car }) => loopById[car.NASCARDriverID]) ? (
              <>
                <SectionLabel>Loop data</SectionLabel>
                <T style={{ color: p.muted, fontSize: 12, marginBottom: 6 }}>
                  Estadísticas de los lazos de cronometraje de la pista. El rating va de 0 a 150.
                </T>
                <LoopTable cars={cars} loop={loopById} />
              </>
            ) : null}
          </>
        )}
      </View>
    </ScrollView>
  );
}

function LoopTable({ cars, loop }: { cars: { car: nascar.LapTimesFeed['laps'][number]; color: string }[]; loop: Record<number, nascar.LoopDriver> }) {
  const p = usePalette();
  const rows: [string, (d: nascar.LoopDriver) => string][] = [
    ['Rating', (d) => d.rating.toFixed(1)],
    ['Largó / terminó', (d) => `P${d.start_ps} → P${d.ps}`],
    ['Posición promedio', (d) => d.avg_ps.toFixed(1)],
    ['Mejor / peor posición', (d) => `P${d.best_ps} / P${d.worst_ps}`],
    ['Vueltas lideradas', (d) => String(d.lead_laps)],
    ['Vueltas más rápidas', (d) => String(d.fast_laps)],
    ['Vueltas en el top 15', (d) => `${d.top15_laps} de ${d.laps}`],
    ['Sobrepasos en verde', (d) => String(d.passes_gf)],
    ['Sobrepasos de calidad', (d) => String(d.quality_passes)],
    ['Lo pasaron', (d) => String(d.passed_gf)],
  ];
  return (
    <Card>
      <View style={[st.row, { borderBottomColor: p.line }]}>
        <View style={{ flex: 1.5 }} />
        {cars.map(({ car, color }) => (
          <T key={car.Number} style={[st.head, { color }]}>
            #{car.Number}
          </T>
        ))}
      </View>
      {rows.map(([label, fn]) => (
        <View key={label} style={[st.row, { borderBottomColor: p.line }]}>
          <T style={{ flex: 1.5, color: p.muted, fontSize: 12 }}>{label}</T>
          {cars.map(({ car }) => (
            <T key={car.Number} style={st.val}>
              {loop[car.NASCARDriverID] ? fn(loop[car.NASCARDriverID]) : '—'}
            </T>
          ))}
        </View>
      ))}
    </Card>
  );
}

const st = StyleSheet.create({
  lead: { fontSize: 13, paddingHorizontal: 16, paddingTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, borderBottomWidth: StyleSheet.hairlineWidth },
  head: { flex: 1, textAlign: 'right', fontFamily: F.semi, fontSize: 15 },
  val: { flex: 1, textAlign: 'right', fontFamily: F.mono, fontSize: 12 },
});
