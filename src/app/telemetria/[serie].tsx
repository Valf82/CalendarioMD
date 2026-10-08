import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompareBars, LineChart } from '@/components/chart';
import { Card, Chip, ChipRow, SectionLabel, StateView, T } from '@/components/ui';
import { SERIES } from '@/data/series';
import { loadTiming, type LapTuple, type TimingCar } from '@/data/telemetry-store';
import { fmtLap, fmtLapShort } from '@/lib/telemetry';
import { useAsync } from '@/lib/use-async';
import { F, usePalette } from '@/theme';

const PALETTE = ['#e8352e', '#2a7de1', '#f2a900', '#18a558'];
const CLASS_LABEL: Record<string, string> = { HYPERCAR: 'Hypercar', LMGT3: 'LMGT3', GTP: 'GTP', LMP2: 'LMP2', GTDPRO: 'GTD Pro', GTD: 'GTD', IndyCar: 'IndyCar' };
const PRIMARY = ['HYPERCAR', 'GTP', 'IndyCar'];

const median = (xs: number[]) => {
  if (!xs.length) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

export default function TimingTelemetryScreen() {
  const { serie } = useLocalSearchParams<{ serie: string }>();
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const data = useAsync(() => loadTiming(serie), [serie]);
  const [clsSel, setCls] = useState<string>();
  const [pickedSel, setPicked] = useState<string[] | null>(null);
  const [greenOnly, setGreenOnly] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const classes = useMemo(() => [...new Set((data.data?.cars ?? []).map((c) => c.class ?? ''))].filter(Boolean), [data.data]);
  const cls = clsSel && classes.includes(clsSel) ? clsSel : (classes.find((c) => PRIMARY.includes(c)) ?? classes[0]);

  // Orden de llegada: la posición de la última vuelta si la fuente la trae (IndyCar);
  // si no, más vueltas primero y, a igualdad, el que tardó menos en total.
  const inClass = useMemo(() => {
    const cars = (data.data?.cars ?? []).filter((c) => c.class === cls && c.laps.length);
    const finalPos = (c: TimingCar) => {
      const v = c.laps[c.laps.length - 1][9];
      return typeof v === 'number' ? v : null;
    };
    const total = (c: TimingCar) => c.laps.reduce((s, l) => s + l[1], 0);
    return cars.sort((a, b) => {
      const pa = finalPos(a);
      const pb = finalPos(b);
      if (pa != null && pb != null) return pa - pb;
      return b.laps.length - a.laps.length || total(a) - total(b);
    });
  }, [data.data, cls]);

  const picked = pickedSel?.some((n) => inClass.some((c) => c.number === n)) ? pickedSel : inClass.slice(0, 3).map((c) => c.number);

  const selected = picked.map((n, i) => ({ car: inClass.find((c) => c.number === n)!, color: PALETTE[i % PALETTE.length] })).filter((x) => x.car);
  const hasFlags = data.data?.cars.some((c) => typeof c.laps[0]?.[9] === 'string');
  const isGreen = (l: LapTuple) => !l[8] && (!hasFlags || l[9] === 'GF');
  const racing = (car: TimingCar) => {
    const laps = car.laps.filter((l) => l[0] > 1 && (!greenOnly || isGreen(l)));
    const best = Math.min(...laps.map((l) => l[1]));
    return greenOnly ? laps.filter((l) => l[1] <= best * 1.07) : laps;
  };
  const toggle = (n: string) => setPicked(picked.includes(n) ? picked.filter((x) => x !== n) : picked.length >= 4 ? [...picked.slice(1), n] : [...picked, n]);
  const title = `Telemetría ${SERIES[serie]?.name ?? serie}`;

  if (!data.data) {
    return (
      <>
        <Stack.Screen options={{ title }} />
        <StateView loading={data.loading} error={data.error} onRetry={data.refresh} />
      </>
    );
  }
  const segments = data.data.segments ?? [];

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
      <Stack.Screen options={{ title }} />
      <T style={[st.lead, { color: p.muted }]}>
        {data.data.event}: cada vuelta de cada auto, del cronometraje oficial
        {serie === 'indycar' ? ' (PDF de vueltas y tramos leídos con raceindycar)' : ' (Al Kamel Systems)'}.
      </T>
      {classes.length > 1 ? (
        <ChipRow>
          {classes.map((c) => (
            <Chip key={c} label={CLASS_LABEL[c] ?? c} active={c === cls} onPress={() => { setCls(c); setPicked(null); }} />
          ))}
        </ChipRow>
      ) : null}

      <View style={{ paddingHorizontal: 16 }}>
        <SectionLabel>Autos (hasta 4)</SectionLabel>
        <View style={st.grid}>
          {inClass.map((c, i) => {
            if (!showAll && i >= 12 && !picked.includes(c.number)) return null;
            const idx = picked.indexOf(c.number);
            return (
              <Chip key={c.number} label={`${i + 1}. #${c.number} ${(c.manufacturer ?? c.drivers[0] ?? '').split(' ').slice(-1)[0]}`} active={idx >= 0} dot={idx >= 0 ? PALETTE[idx] : undefined} onPress={() => toggle(c.number)} />
            );
          })}
          {inClass.length > 12 ? <Chip label={showAll ? 'Ver menos' : `Ver los ${inClass.length}`} onPress={() => setShowAll(!showAll)} /> : null}
        </View>
        <ChipRow style={{ paddingHorizontal: 0 }}>
          <Chip label="Solo vueltas de ritmo (en verde, sin boxes)" active={greenOnly} onPress={() => setGreenOnly(!greenOnly)} />
        </ChipRow>

        <LineChart
          title="Tiempo por vuelta"
          unit="s"
          height={180}
          yLabel={(y) => fmtLapShort(y)}
          series={selected.map(({ car, color }) => ({ id: car.number, color, dots: true, points: racing(car).map((l) => [l[0], l[1]] as [number, number]) }))}
        />
        {serie === 'indycar' ? (
          <LineChart
            title="Posición en carrera"
            height={160}
            invertY
            yLabel={(y) => `P${Math.round(y)}`}
            series={selected.map(({ car, color }) => ({ id: car.number, color, step: true, points: car.laps.filter((l) => typeof l[9] === 'number').map((l) => [l[0], l[9] as number] as [number, number]) }))}
          />
        ) : (
          <LineChart
            title="Velocidad punta por vuelta"
            unit="km/h"
            height={150}
            series={selected.map(({ car, color }) => ({ id: car.number, color, dots: true, points: racing(car).filter((l) => l[6]).map((l) => [l[0], l[6]!] as [number, number]) }))}
          />
        )}

        <CompareBars title="Mejor vuelta" format={fmtLap} rows={selected.map(({ car, color }) => ({ label: `#${car.number}`, color, value: Math.min(...car.laps.filter((l) => l[0] > 1).map((l) => l[1])) }))} />
        <CompareBars title="Ritmo típico (mediana de vueltas de ritmo)" format={fmtLap} rows={selected.map(({ car, color }) => ({ label: `#${car.number}`, color, value: median(racing(car).map((l) => l[1])) }))} />
        {!segments.length ? (
          <>
            {[2, 3, 4].map((k) => (
              <CompareBars key={k} title={`Mejor sector ${k - 1}`} format={(v) => v.toFixed(3)} rows={selected.map(({ car, color }) => ({ label: `#${car.number}`, color, value: Math.min(...car.laps.map((l) => l[k] as number | null).filter((v): v is number => typeof v === 'number' && v > 0)) }))} />
            ))}
            <CompareBars title="Velocidad punta máxima" format={(v) => `${v.toFixed(1)} km/h`} lowerIsBetter={false} rows={selected.map(({ car, color }) => ({ label: `#${car.number}`, color, value: Math.max(...car.laps.map((l) => l[6] ?? 0)) }))} />
          </>
        ) : (
          <SegmentTable cars={selected} segments={segments} />
        )}

        <SectionLabel>Pilotos y tandas</SectionLabel>
        {selected.map(({ car, color }) => (
          <DriverBreakdown key={car.number} car={car} color={color} isGreen={isGreen} />
        ))}
      </View>
    </ScrollView>
  );
}

/** IndyCar: mejor tiempo de cada tramo del circuito (curvas y rectas) por auto. */
function SegmentTable({ cars, segments }: { cars: { car: TimingCar; color: string }[]; segments: string[] }) {
  const p = usePalette();
  const best = (car: TimingCar, i: number) => Math.min(...car.laps.map((l) => l[10]?.[i] ?? Infinity));
  return (
    <>
      <SectionLabel>Tramo por tramo</SectionLabel>
      <T style={{ color: p.muted, fontSize: 12, marginBottom: 6 }}>Mejor tiempo de cada auto en cada tramo medido por los lazos del circuito. En verde, el más rápido.</T>
      <Card>
        <View style={[st.row, { borderBottomColor: p.line }]}>
          <View style={{ flex: 1.4 }} />
          {cars.map(({ car, color }) => (
            <T key={car.number} style={[st.head, { color }]}>
              #{car.number}
            </T>
          ))}
        </View>
        {segments.map((name, i) => {
          const vals = cars.map(({ car }) => best(car, i));
          const min = Math.min(...vals);
          return (
            <View key={name} style={[st.row, { borderBottomColor: p.line }]}>
              <T style={{ flex: 1.4, color: p.muted, fontSize: 12 }}>{name}</T>
              {vals.map((v, j) => (
                <T key={j} style={[st.val, { color: v === min ? p.ok : p.ink }]}>
                  {isFinite(v) ? v.toFixed(3) : '—'}
                </T>
              ))}
            </View>
          );
        })}
      </Card>
    </>
  );
}

function DriverBreakdown({ car, color, isGreen }: { car: TimingCar; color: string; isGreen: (l: LapTuple) => boolean }) {
  const p = usePalette();
  const rows = car.drivers.map((name, idx) => {
    const laps = car.laps.filter((l) => l[7] === idx);
    const green = laps.filter(isGreen).map((l) => l[1]);
    return { name, laps: laps.length, best: Math.min(...laps.map((l) => l[1])), pace: median(green) };
  });
  const pits = car.laps.filter((l) => l[8]).length;
  return (
    <Card style={{ marginBottom: 8 }}>
      <T style={{ fontFamily: F.semi, fontSize: 17 }}>
        #{car.number} {car.team ?? ''}
      </T>
      <T style={{ color: p.muted, fontSize: 12 }}>
        {[car.manufacturer, `${car.laps.length} vueltas`, pits ? `${pits} pasadas por boxes` : ''].filter(Boolean).join(' · ')}
      </T>
      {rows.length > 1 || car.class !== 'IndyCar' ? (
        <View style={{ marginTop: 6 }}>
          <View style={[st.row, { borderBottomColor: p.line }]}>
            <T style={{ flex: 1.6, color: p.muted, fontSize: 11 }}>Piloto</T>
            <T style={[st.val, { color: p.muted, fontSize: 11 }]}>Vueltas</T>
            <T style={[st.val, { color: p.muted, fontSize: 11 }]}>Mejor</T>
            <T style={[st.val, { color: p.muted, fontSize: 11 }]}>Ritmo</T>
          </View>
          {rows.map((r) => (
            <View key={r.name} style={[st.row, { borderBottomColor: p.line }]}>
              <T style={{ flex: 1.6, fontSize: 13 }} numberOfLines={1}>
                {r.name}
              </T>
              <T style={st.val}>{r.laps}</T>
              <T style={st.val}>{fmtLap(r.best)}</T>
              <T style={st.val}>{fmtLap(r.pace)}</T>
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

const st = StyleSheet.create({
  lead: { fontSize: 13, paddingHorizontal: 16, paddingTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth },
  head: { flex: 1, textAlign: 'right', fontFamily: F.semi, fontSize: 15 },
  val: { flex: 1, textAlign: 'right', fontFamily: F.mono, fontSize: 12 },
});
