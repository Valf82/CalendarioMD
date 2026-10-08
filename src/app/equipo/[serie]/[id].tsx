import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { constructorStandings, driverStandings } from '@/api/f1';
import { Hero } from '@/components/hero';
import { TechSheetView, VariantList } from '@/components/tech-sheet';
import { FactList, Group, Muted, Row, SectionLabel, Stat, StatGrid, StateView, T, Tabs } from '@/components/ui';
import { driversOf, findTeam, standingsFor } from '@/data/catalog';
import { F1_TEAMS } from '@/data/f1';
import { SERIES } from '@/data/series';
import { SERIES_TECH, variantsFor } from '@/data/tech';
import type { Facts } from '@/data/types';
import { formatPoints, slugify } from '@/lib/text';
import { useAsync } from '@/lib/use-async';
import { sp, usePalette } from '@/theme';

export default function TeamScreen() {
  const { serie, id } = useLocalSearchParams<{ serie: string; id: string }>();
  return serie === 'f1' ? <F1Team id={id} /> : <SeriesTeam serie={serie} id={id} />;
}

type F1Tab = 'summary' | 'staff' | 'car';

function F1Team({ id }: { id: string }) {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<F1Tab>('summary');
  const info = F1_TEAMS[id];
  const { data, loading, error, refresh } = useAsync(async () => {
    const [c, d] = await Promise.all([constructorStandings(), driverStandings()]);
    return { c, d };
  }, []);

  const row = data?.c.data.rows.find((r) => r.Constructor.constructorId === id);
  const drivers = data?.d.data.rows.filter((d) => d.Constructors[d.Constructors.length - 1]?.constructorId === id) ?? [];
  const variants = variantsFor('f1', [id]);

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <Stack.Screen options={{ title: '' }} />
      <Hero name={info?.fullName ?? row?.Constructor.name ?? id} color={info?.color} eyebrow="Fórmula 1 · 2026" lines={info ? [info.base] : []} />
      <Tabs value={tab} onChange={setTab} items={[{ value: 'summary', label: 'Resumen' }, { value: 'staff', label: 'Staff' }, { value: 'car', label: 'Auto y motor' }]} />
      <ScrollView contentContainerStyle={{ padding: sp.lg, paddingBottom: insets.bottom + sp.xxl }}>
        {tab === 'summary' ? (
          <>
            <SectionLabel style={{ marginTop: 0 }}>Temporada 2026</SectionLabel>
            {data ? (
              <StatGrid>
                <Stat label="Posición" value={row ? `P${row.position}` : '—'} strong />
                <Stat label="Puntos" value={row?.points ?? '—'} />
                <Stat label="Victorias" value={row?.wins ?? '0'} />
              </StatGrid>
            ) : (
              <StateView loading={loading} error={error} onRetry={refresh} />
            )}
            <SectionLabel>Pilotos</SectionLabel>
            <Group>
              {drivers.map((d) => (
                <Row
                  key={d.Driver.driverId}
                  title={`${d.Driver.givenName} ${d.Driver.familyName}`}
                  subtitle={`#${d.Driver.permanentNumber ?? '—'}${info?.raceEngineers[d.Driver.driverId] ? ` · ingeniero: ${info.raceEngineers[d.Driver.driverId]}` : ''}`}
                  href={`/piloto/f1/${d.Driver.driverId}`}
                  trailing={
                    <View style={{ alignItems: 'flex-end' }}>
                      <T v="num">P{d.position}</T>
                      <Muted v="caption">{formatPoints(Number(d.points))} pts</Muted>
                    </View>
                  }
                />
              ))}
            </Group>
            {info ? (
              <>
                <SectionLabel>Historia</SectionLabel>
                <Group>
                  <View style={{ paddingHorizontal: sp.lg }}>
                    <FactList facts={[['Títulos de constructores', info.titles], ['Sede', info.base]]} />
                  </View>
                </Group>
              </>
            ) : null}
          </>
        ) : null}

        {tab === 'staff' && info ? (
          <>
            <SectionLabel style={{ marginTop: 0 }}>Dirección</SectionLabel>
            <Group>
              <View style={{ paddingHorizontal: sp.lg }}>
                <FactList facts={info.staff} />
              </View>
            </Group>
            <SectionLabel>Ingenieros de pista</SectionLabel>
            <Group>
              <View style={{ paddingHorizontal: sp.lg }}>
                <FactList
                  facts={Object.entries(info.raceEngineers).map(([driverId, eng]) => {
                    const d = data?.d.data.rows.find((r) => r.Driver.driverId === driverId)?.Driver;
                    return [d ? d.familyName : driverId.replace(/_/g, ' '), eng];
                  })}
                />
              </View>
            </Group>
            <Muted v="caption" style={{ marginTop: sp.sm }}>Datos del inicio de la temporada 2026; puede haber cambios.</Muted>
          </>
        ) : null}

        {tab === 'car' && info ? (
          <>
            <SectionLabel style={{ marginTop: 0 }}>{info.car}</SectionLabel>
            <Group>
              <View style={{ paddingHorizontal: sp.lg }}>
                <FactList facts={[['Chasis', info.car], ['Unidad de potencia', info.powerUnit]]} />
              </View>
            </Group>
            {variants.length ? (
              <View style={{ marginTop: sp.lg }}>
                <VariantList variants={variants} initiallyOpen={variants[0].name} />
              </View>
            ) : null}
            <SectionLabel>Reglamento 2026</SectionLabel>
            <TechSheetView sheet={{ ...SERIES_TECH.f1, sections: SERIES_TECH.f1.sections.slice(0, 3) }} compact />
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function SeriesTeam({ serie, id }: { serie: string; id: string }) {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<'summary' | 'car'>('summary');
  const team = findTeam(serie, id);
  const s = SERIES[serie];
  if (!team || !s) return <StateView empty="No encontré a este equipo." />;

  const hits = standingsFor(serie, team.name, 'teams');
  const known = new Set(driversOf(serie).map((d) => slugify(d.name)));
  const sheet = SERIES_TECH[serie];
  const variants = variantsFor(serie, [team.name, team.car, team.engine]);
  const facts: Facts = [...(team.car ? ([['Auto', team.car]] as Facts) : []), ...(team.engine ? ([['Motor', team.engine]] as Facts) : []), ...(team.facts ?? [])];

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <Stack.Screen options={{ title: '' }} />
      <Hero name={team.name} eyebrow={s.name} lines={[[team.car, team.engine].filter(Boolean).join(' · ')].filter(Boolean)} />
      <Tabs value={tab} onChange={setTab} items={[{ value: 'summary', label: 'Resumen' }, ...(variants.length || sheet ? [{ value: 'car' as const, label: 'Auto y técnica' }] : [])]} />
      <ScrollView contentContainerStyle={{ padding: sp.lg, paddingBottom: insets.bottom + sp.xxl }}>
        {tab === 'summary' ? (
          <>
            {hits.length ? (
              <>
                <SectionLabel style={{ marginTop: 0 }}>Campeonato</SectionLabel>
                <StatGrid>
                  {hits.map((h, i) => (
                    <Stat key={h.table} label={`${h.table} · ${formatPoints(h.row.points)} pts`} value={`P${h.row.pos}`} strong={i === 0} />
                  ))}
                </StatGrid>
              </>
            ) : null}
            {team.drivers.length ? (
              <>
                <SectionLabel style={hits.length ? undefined : { marginTop: 0 }}>Pilotos</SectionLabel>
                <Group>
                  {team.drivers.map((d) => {
                    const did = slugify(d);
                    const hit = standingsFor(serie, d, 'drivers')[0];
                    return <Row key={d} title={d} subtitle={hit ? `P${hit.row.pos} · ${formatPoints(hit.row.points)} pts` : undefined} href={known.has(did) ? `/piloto/${serie}/${did}` : undefined} />;
                  })}
                </Group>
              </>
            ) : null}
            {team.staff?.length ? (
              <>
                <SectionLabel>Staff</SectionLabel>
                <Group>
                  <View style={{ paddingHorizontal: sp.lg }}>
                    <FactList facts={team.staff} />
                  </View>
                </Group>
              </>
            ) : null}
            {facts.length ? (
              <>
                <SectionLabel>Auto</SectionLabel>
                <Group>
                  <View style={{ paddingHorizontal: sp.lg }}>
                    <FactList facts={facts} />
                  </View>
                </Group>
              </>
            ) : null}
          </>
        ) : (
          <>
            {variants.length ? <VariantList variants={variants} initiallyOpen={variants[0].name} /> : null}
            {sheet ? (
              <>
                <SectionLabel style={variants.length ? undefined : { marginTop: 0 }}>Reglamento de la categoría</SectionLabel>
                <TechSheetView sheet={sheet} compact />
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}
