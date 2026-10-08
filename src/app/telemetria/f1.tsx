import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import * as of1 from '@/api/openf1';
import { CompareBars, LineChart } from '@/components/chart';
import { TrackMap } from '@/components/track-map';
import { Card, Chip, ChipRow, SectionLabel, StateView, T } from '@/components/ui';
import { buildTrace, deltaTrace, fmtLap, fmtLapShort, lapLength, lapStats, locateOnLap, miniSectors } from '@/lib/telemetry';
import { circuitEs } from '@/lib/text';
import { useAsync } from '@/lib/use-async';
import { F, usePalette } from '@/theme';

const YEAR = 2026;
const ALT_COLOR = '#3B82F6';
const TYRE: Record<string, string> = { SOFT: '#e8352e', MEDIUM: '#f2c230', HARD: '#e9e9e9', INTERMEDIATE: '#3fae49', WET: '#2f6fd6' };

const SESSION_ES: Record<string, string> = { Qualifying: 'Clasificación', Race: 'Carrera', Sprint: 'Sprint', 'Sprint Qualifying': 'Clasif. sprint', 'Sprint Shootout': 'Clasif. sprint' };
const sessionEs = (n: string) => SESSION_ES[n] ?? n.replace('Practice', 'Libres');

const color = (d?: of1.SessionDriver, fallback = '#888') => (d?.team_colour ? `#${d.team_colour}` : fallback);

export default function F1TelemetryScreen() {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  // Lo que eligió el usuario; si no eligió (o ya no aplica), se usa el valor por defecto.
  const [meetingSel, setMeetingKey] = useState<number>();
  const [sessionSel, setSessionKey] = useState<number>();
  const [aSel, setA] = useState<number>();
  const [bSel, setB] = useState<number>();

  const meetings = useAsync(() => of1.meetings(YEAR), []);
  const meetingKey = meetingSel ?? meetings.data?.[meetings.data.length - 1]?.meeting_key;

  const sessions = useAsync(async () => (meetingKey ? of1.sessions(meetingKey) : []), [meetingKey]);
  const sessionList = sessions.data ?? [];
  const sessionKey = sessionList.some((s) => s.session_key === sessionSel)
    ? sessionSel
    : (sessionList.find((s) => s.session_name === 'Qualifying') ?? sessionList[sessionList.length - 1])?.session_key;

  const drivers = useAsync(async () => {
    if (!sessionKey) return { list: [] as of1.SessionDriver[], order: [] as number[] };
    const [list, result] = await Promise.all([of1.sessionDrivers(sessionKey), of1.sessionResult(sessionKey).catch(() => [])]);
    const order = result.filter((r) => r.position).sort((x, y) => x.position! - y.position!).map((r) => r.driver_number);
    return { list, order };
  }, [sessionKey]);
  const inSession = (n?: number) => !!n && !!drivers.data?.list.some((x) => x.driver_number === n);
  const ranking = drivers.data?.order.length ? drivers.data.order : (drivers.data?.list ?? []).map((x) => x.driver_number);
  const a = inSession(aSel) ? aSel : ranking.find((n) => n !== bSel);
  const b = inSession(bSel) ? bSel : ranking.find((n) => n !== a);

  const session = sessions.data?.find((s) => s.session_key === sessionKey);
  const byNumber = useMemo(() => Object.fromEntries((drivers.data?.list ?? []).map((d) => [d.driver_number, d])), [drivers.data]);
  const dA = a ? byNumber[a] : undefined;
  const dB = b ? byNumber[b] : undefined;
  // Si los dos son del mismo equipo, el segundo va en otro color.
  const colors: [string, string] = [color(dA, p.accent), color(dB, ALT_COLOR) === color(dA, p.accent) ? ALT_COLOR : color(dB, ALT_COLOR)];

  const tel = useAsync(async () => {
    if (!sessionKey || !a || !b || a === b || !session) return null;
    const [lapsA, lapsB, stA, stB] = await Promise.all([of1.laps(sessionKey, a), of1.laps(sessionKey, b), of1.stints(sessionKey, a), of1.stints(sessionKey, b)]);
    const fa = of1.fastestLap(lapsA);
    const fb = of1.fastestLap(lapsB);
    if (!fa || !fb) return { lapsA, lapsB, stA, stB, fa, fb };
    const [wa, wb] = [of1.lapWindow(fa), of1.lapWindow(fb)];
    const [carA, carB, locA, circ] = await Promise.all([
      of1.carData(sessionKey, a, ...wa),
      of1.carData(sessionKey, b, ...wb),
      of1.location(sessionKey, a, ...wa),
      of1.circuit(session.circuit_key, YEAR).catch(() => undefined),
    ]);
    const tA = buildTrace(carA, fa.date_start!, fa.lap_duration!);
    const tB = buildTrace(carB, fb.date_start!, fb.lap_duration!);
    return {
      lapsA, lapsB, stA, stB, fa, fb, tA, tB, circ,
      delta: deltaTrace(tA, tB),
      sectors: miniSectors(tA, tB),
      path: locateOnLap(locA, tA),
      statsA: lapStats(tA),
      statsB: lapStats(tB),
    };
  }, [sessionKey, a, b, session?.circuit_key]);

  const t = tel.data;
  const nameA = dA?.name_acronym ?? '';
  const nameB = dB?.name_acronym ?? '';

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
      <Stack.Screen options={{ title: 'Telemetría F1' }} />
      <T style={[st.lead, { color: p.muted }]}>Vuelta más rápida de cada piloto, alineada por distancia. Datos del live timing oficial vía OpenF1.</T>

      {meetings.data ? (
        <ChipRow>
          {[...meetings.data].reverse().map((m) => (
            <Chip key={m.meeting_key} label={circuitEs(m.circuit_short_name)} active={m.meeting_key === meetingKey} onPress={() => setMeetingKey(m.meeting_key)} />
          ))}
        </ChipRow>
      ) : (
        <StateView loading={meetings.loading} error={meetings.error} onRetry={meetings.refresh} />
      )}
      {sessions.data?.length ? (
        <ChipRow style={{ paddingTop: 0 }}>
          {sessions.data.map((s) => (
            <Chip key={s.session_key} label={sessionEs(s.session_name)} active={s.session_key === sessionKey} onPress={() => setSessionKey(s.session_key)} />
          ))}
        </ChipRow>
      ) : null}
      {drivers.data?.list.length ? (
        <>
          <DriverPicker label="Piloto A" drivers={drivers.data.list} order={drivers.data.order} value={a} other={b} onChange={setA} />
          <DriverPicker label="Piloto B" drivers={drivers.data.list} order={drivers.data.order} value={b} other={a} onChange={setB} />
        </>
      ) : null}

      <View style={{ paddingHorizontal: 16 }}>
        {!t ? (
          <StateView loading={tel.loading || drivers.loading} error={tel.error} onRetry={tel.refresh} empty={a === b ? 'Elegí dos pilotos distintos.' : undefined} />
        ) : !t.fa || !t.fb || !t.tA || !t.tB ? (
          <StateView empty="Alguno de los dos no tiene una vuelta válida en esta sesión." />
        ) : (
          <>
            <Card style={{ marginTop: 6 }}>
              <View style={st.lapRow}>
                <LapCell name={nameA} color={colors[0]} lap={t.fa} />
                <LapCell name={nameB} color={colors[1]} lap={t.fb} />
              </View>
              <T style={{ color: p.muted, fontSize: 13, marginTop: 6 }}>
                Diferencia: {nameB} {t.fb.lap_duration! >= t.fa.lap_duration! ? '+' : '−'}
                {Math.abs(t.fb.lap_duration! - t.fa.lap_duration!).toFixed(3)} s
              </T>
              <SectorTable a={t.fa} b={t.fb} nameA={nameA} nameB={nameB} colors={colors} />
            </Card>

            <SectionLabel>Mapa: quién fue más rápido</SectionLabel>
            <View style={st.legend}>
              <Legend color={colors[0]} label={`${nameA} (${t.sectors.filter((s) => s.faster === 0).length} mini-sectores)`} />
              <Legend color={colors[1]} label={`${nameB} (${t.sectors.filter((s) => s.faster === 1).length})`} />
            </View>
            <TrackMap circuit={t.circ} path={t.path} sectors={t.sectors} colors={colors} />

            <SectionLabel>Trazas de la vuelta</SectionLabel>
            <LineChart
              title="Velocidad"
              unit="km/h"
              height={170}
              xLabel={(x) => `${(x / 1000).toFixed(1)}k`}
              series={[
                { id: 'a', color: colors[0], points: t.tA.d.map((d, i) => [d, t.tA!.speed[i]]) },
                { id: 'b', color: colors[1], points: t.tB.d.map((d, i) => [(d * lapLength(t.tA!)) / lapLength(t.tB!), t.tB!.speed[i]]) },
              ]}
            />
            <LineChart
              title={`Delta de ${nameB} respecto de ${nameA}`}
              unit="s"
              height={110}
              zeroLine={0}
              xLabel={(x) => `${(x / 1000).toFixed(1)}k`}
              yLabel={(y) => y.toFixed(2)}
              series={[{ id: 'delta', color: colors[1], points: t.delta.d.map((d, i) => [d, t.delta.delta[i]]) }]}
            />
            <T style={{ color: p.muted, fontSize: 11 }}>Por encima de 0: {nameB} va perdiendo tiempo. Por debajo: lo va ganando.</T>
            {(['throttle', 'brake', 'gear', 'rpm'] as const).map((k) => (
              <LineChart
                key={k}
                title={{ throttle: 'Acelerador', brake: 'Freno', gear: 'Marcha', rpm: 'RPM' }[k]}
                unit={{ throttle: '%', brake: 'on/off', gear: '', rpm: 'rpm' }[k] || undefined}
                height={k === 'rpm' ? 120 : 90}
                xLabel={(x) => `${(x / 1000).toFixed(1)}k`}
                yDomain={k === 'throttle' || k === 'brake' ? [0, 100] : k === 'gear' ? [0, 8] : undefined}
                series={[
                  { id: 'a', color: colors[0], step: k === 'gear' || k === 'brake', points: t.tA!.d.map((d, i) => [d, t.tA![k === 'gear' ? 'gear' : k][i]]) },
                  { id: 'b', color: colors[1], step: k === 'gear' || k === 'brake', points: t.tB!.d.map((d, i) => [(d * lapLength(t.tA!)) / lapLength(t.tB!), t.tB![k === 'gear' ? 'gear' : k][i]]) },
                ]}
              />
            ))}

            <SectionLabel>Números de la vuelta</SectionLabel>
            <StatsTable
              names={[nameA, nameB]}
              colors={colors}
              rows={[
                ['Velocidad máxima', `${t.statsA.topSpeed} km/h`, `${t.statsB.topSpeed} km/h`],
                ['Velocidad mínima', `${t.statsA.minSpeed} km/h`, `${t.statsB.minSpeed} km/h`],
                ['Velocidad promedio', `${t.statsA.avgSpeed.toFixed(1)} km/h`, `${t.statsB.avgSpeed.toFixed(1)} km/h`],
                ['Tiempo a fondo', `${t.statsA.fullThrottle.toFixed(0)} %`, `${t.statsB.fullThrottle.toFixed(0)} %`],
                ['Tiempo frenando', `${t.statsA.braking.toFixed(0)} %`, `${t.statsB.braking.toFixed(0)} %`],
                ['RPM máximas', String(t.statsA.maxRpm), String(t.statsB.maxRpm)],
                ['Cambios de marcha', String(t.statsA.gearShifts), String(t.statsB.gearShifts)],
                ['Trampa de velocidad', `${t.fa.st_speed ?? '—'} km/h`, `${t.fb.st_speed ?? '—'} km/h`],
              ]}
            />
            <T style={{ color: p.muted, fontSize: 11, marginTop: 4 }}>
              Calculado sobre las muestras del live timing (≈ 4 por segundo): picos muy breves pueden no aparecer.
            </T>

            <SectionLabel>Ritmo en la sesión</SectionLabel>
            <LineChart
              title="Tiempo por vuelta"
              unit="s"
              height={170}
              yLabel={(y) => fmtLapShort(y)}
              series={[
                pace('a', t.lapsA, t.stA, colors[0]),
                pace('b', t.lapsB, t.stB, colors[1]),
              ]}
            />
            <View style={st.legend}>
              {Object.entries(TYRE).map(([k, c]) => (
                <Legend key={k} color={c} label={{ SOFT: 'Blando', MEDIUM: 'Medio', HARD: 'Duro', INTERMEDIATE: 'Intermedio', WET: 'Lluvia' }[k]!} dot />
              ))}
            </View>
            <T style={{ color: p.muted, fontSize: 11 }}>Sin vueltas de salida de boxes ni vueltas lentas (más de 7 % sobre la mejor).</T>
          </>
        )}
      </View>
    </ScrollView>
  );
}

/** Serie de ritmo: cada vuelta como punto, coloreado por compuesto. */
function pace(id: string, laps: of1.Lap[], stints: of1.Stint[], color: string) {
  const valid = laps.filter((l) => l.lap_duration && !l.is_pit_out_lap);
  const best = Math.min(...valid.map((l) => l.lap_duration!));
  const kept = valid.filter((l) => l.lap_duration! <= best * 1.07);
  const compound = (n: number) => stints.find((s) => n >= s.lap_start && n <= s.lap_end)?.compound ?? '';
  return {
    id,
    color,
    dots: true,
    points: kept.map((l) => [l.lap_number, l.lap_duration!] as [number, number]),
    pointColors: kept.map((l) => TYRE[compound(l.lap_number)] ?? color),
  };
}

function DriverPicker({ label, drivers, order, value, other, onChange }: { label: string; drivers: of1.SessionDriver[]; order: number[]; value?: number; other?: number; onChange: (n: number) => void }) {
  const p = usePalette();
  const sorted = [...drivers].sort((x, y) => {
    const ix = order.indexOf(x.driver_number);
    const iy = order.indexOf(y.driver_number);
    return (ix < 0 ? 99 : ix) - (iy < 0 ? 99 : iy);
  });
  return (
    <View>
      <T style={[st.pickLabel, { color: p.muted }]}>{label}</T>
      <ChipRow style={{ paddingTop: 2 }}>
        {sorted.map((d) => (
          <Chip key={d.driver_number} label={d.name_acronym} dot={color(d)} active={d.driver_number === value} onPress={() => d.driver_number !== other && onChange(d.driver_number)} />
        ))}
      </ChipRow>
    </View>
  );
}

function LapCell({ name, color, lap }: { name: string; color: string; lap: of1.Lap }) {
  return (
    <View style={{ flex: 1 }}>
      <T style={{ fontFamily: F.semi, fontSize: 16, color }}>{name}</T>
      <T style={{ fontFamily: F.mono, fontSize: 22 }}>{fmtLap(lap.lap_duration)}</T>
      <T style={{ fontSize: 12 }}>Vuelta {lap.lap_number}</T>
    </View>
  );
}

function SectorTable({ a, b, nameA, nameB, colors }: { a: of1.Lap; b: of1.Lap; nameA: string; nameB: string; colors: [string, string] }) {
  const keys = ['duration_sector_1', 'duration_sector_2', 'duration_sector_3'] as const;
  return (
    <>
      {keys.map((k, i) => (
        <CompareBars
          key={k}
          title={`Sector ${i + 1}`}
          format={(v) => v.toFixed(3)}
          rows={[
            { label: nameA, color: colors[0], value: a[k] ?? NaN },
            { label: nameB, color: colors[1], value: b[k] ?? NaN },
          ]}
        />
      ))}
    </>
  );
}

function StatsTable({ names, colors, rows }: { names: [string, string]; colors: [string, string]; rows: [string, string, string][] }) {
  const p = usePalette();
  return (
    <Card>
      <View style={[st.statRow, { borderBottomColor: p.line }]}>
        <View style={{ flex: 1.4 }} />
        <T style={[st.statHead, { color: colors[0] }]}>{names[0]}</T>
        <T style={[st.statHead, { color: colors[1] }]}>{names[1]}</T>
      </View>
      {rows.map(([k, va, vb]) => (
        <View key={k} style={[st.statRow, { borderBottomColor: p.line }]}>
          <T style={{ flex: 1.4, color: p.muted, fontSize: 13 }}>{k}</T>
          <T style={st.statVal}>{va}</T>
          <T style={st.statVal}>{vb}</T>
        </View>
      ))}
    </Card>
  );
}

function Legend({ color, label, dot }: { color: string; label: string; dot?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: dot ? 9 : 16, height: dot ? 9 : 4, borderRadius: dot ? 5 : 2, backgroundColor: color, borderWidth: dot ? 0.5 : 0, borderColor: '#888' }} />
      <T style={{ fontSize: 12 }}>{label}</T>
    </View>
  );
}

const st = StyleSheet.create({
  lead: { fontSize: 13, paddingHorizontal: 16, paddingTop: 8 },
  pickLabel: { fontFamily: F.semi, fontSize: 12, paddingHorizontal: 16, marginTop: 4 },
  lapRow: { flexDirection: 'row', gap: 12 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 },
  statRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, borderBottomWidth: StyleSheet.hairlineWidth },
  statHead: { flex: 1, textAlign: 'right', fontFamily: F.semi, fontSize: 15 },
  statVal: { flex: 1, textAlign: 'right', fontFamily: F.mono, fontSize: 13 },
});
