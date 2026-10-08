import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { driverCareer, driverInfo, driverSeason, driverStandings, openF1Drivers } from '@/api/f1';
import { Hero } from '@/components/hero';
import { SourceBadge } from '@/components/source-badge';
import { TechSheetView, VariantList } from '@/components/tech-sheet';
import { FactList, Group, Muted, PressLink, Row, SectionLabel, Stat, StatGrid, StateView, T, Tabs } from '@/components/ui';
import { findDriver, standingsFor, teamOfDriver } from '@/data/catalog';
import { F1_TEAMS, NATIONALITY_ES } from '@/data/f1';
import { SERIES } from '@/data/series';
import { useSeriesStandings } from '@/data/standings-store';
import { SERIES_TECH, variantsFor } from '@/data/tech';
import type { Facts } from '@/data/types';
import { formatPoints, slugify } from '@/lib/text';
import { age, dayParts } from '@/lib/time';
import { useAsync } from '@/lib/use-async';
import { sp, usePalette } from '@/theme';

/** Estado final de la carrera, traducido. */
function statusEs(status?: string): string {
  if (!status) return '';
  if (status === 'Finished') return 'terminó';
  if (status === 'Lapped') return 'a una vuelta o más';
  const laps = status.match(/^\+(\d+) Laps?$/);
  if (laps) return `a ${laps[1]} ${laps[1] === '1' ? 'vuelta' : 'vueltas'}`;
  const map: Record<string, string> = {
    Retired: 'abandonó',
    Accident: 'accidente',
    Collision: 'choque',
    Disqualified: 'descalificado',
    'Did not start': 'no largó',
    Withdrew: 'se retiró',
    Engine: 'falla de motor',
    Gearbox: 'falla de caja',
    Hydraulics: 'falla hidráulica',
    Brakes: 'falla de frenos',
    'Power Unit': 'falla de la unidad de potencia',
  };
  return map[status] ?? status.toLowerCase();
}

export default function DriverScreen() {
  const { serie, id } = useLocalSearchParams<{ serie: string; id: string }>();
  return serie === 'f1' ? <F1Driver id={id} /> : <SeriesDriver serie={serie} id={id} />;
}

function F1Driver({ id }: { id: string }) {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<'summary' | 'results' | 'team'>('summary');
  const main = useAsync(async () => {
    const [info, standings, season] = await Promise.all([driverInfo(id), driverStandings(), driverSeason(id)]);
    return { info, standings, season };
  }, [id]);
  const career = useAsync(() => driverCareer(id), [id]);
  // Las fotos son opcionales: si OpenF1 no responde, la pantalla igual se muestra.
  const photos = useAsync(() => openF1Drivers(), []);

  if (!main.data) {
    return (
      <>
        <Stack.Screen options={{ title: '' }} />
        <StateView loading={main.loading} error={main.error} onRetry={main.refresh} />
      </>
    );
  }

  const { info, standings, season } = main.data;
  const row = standings.data.rows.find((r) => r.Driver.driverId === id);
  const team = row?.Constructors[row.Constructors.length - 1] ?? season[season.length - 1]?.Results[0]?.Constructor;
  const teamInfo = team ? F1_TEAMS[team.constructorId] : undefined;
  const name = info ? `${info.givenName} ${info.familyName}` : id;
  const photo = info?.code ? photos.data?.[info.code]?.headshot_url : undefined;
  const podiums = season.filter((r) => Number(r.Results[0]?.position) <= 3).length;
  const best = season.reduce((b, r) => Math.min(b, Number(r.Results[0]?.position) || 99), 99);
  const engineer = teamInfo?.raceEngineers[id];

  const personal: Facts = [];
  if (info) {
    personal.push(['Nacionalidad', NATIONALITY_ES[info.nationality] ?? info.nationality]);
    const b = dayParts(info.dateOfBirth);
    personal.push(['Nacimiento', `${b.day} de ${b.month} de ${info.dateOfBirth.slice(0, 4)} (${age(info.dateOfBirth)} años)`]);
    if (info.code) personal.push(['Código', info.code]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <Stack.Screen options={{ title: '' }} />
      <Hero name={name} number={info?.permanentNumber} photo={photo} color={teamInfo?.color} eyebrow={teamInfo?.fullName ?? team?.name} lines={[`F1 · temporada 2026${row ? ` · P${row.position}` : ''}`]} />
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: 'summary', label: 'Resumen' },
          { value: 'results', label: 'Resultados', badge: String(season.length) },
          { value: 'team', label: 'Equipo y datos' },
        ]}
      />
      <ScrollView contentContainerStyle={{ padding: sp.lg, paddingBottom: insets.bottom + sp.xxl }}>
        {tab === 'summary' ? (
          <>
            <SectionLabel style={{ marginTop: 0 }}>Temporada 2026</SectionLabel>
            <StatGrid>
              <Stat label="Posición" value={row ? `P${row.position}` : '—'} strong />
              <Stat label="Puntos" value={row?.points ?? '—'} />
              <Stat label="Victorias" value={row?.wins ?? '0'} />
              <Stat label="Podios" value={podiums} />
              <Stat label="Mejor resultado" value={best < 99 ? `P${best}` : '—'} />
              <Stat label="Carreras" value={season.length} />
            </StatGrid>

            <SectionLabel>Carrera en F1</SectionLabel>
            {career.data ? (
              <>
                <StatGrid>
                  <Stat label="Títulos" value={career.data.titles.split(' ')[0]} strong={career.data.titles !== '0'} />
                  <Stat label="Carreras" value={career.data.starts} />
                  <Stat label="Victorias" value={career.data.wins} />
                  <Stat label="Podios" value={career.data.podiums} />
                  <Stat label="Poles" value={career.data.poles} />
                  <Stat label="Temporadas" value={career.data.seasons} />
                </StatGrid>
                {career.data.debut || career.data.titles !== '0' ? (
                  <Group style={{ marginTop: sp.sm }}>
                    <View style={{ paddingHorizontal: sp.lg }}>
                      <FactList facts={[...(career.data.debut ? ([['Debut', career.data.debut]] as Facts) : []), ...(career.data.titles !== '0' ? ([['Campeonatos', career.data.titles]] as Facts) : [])]} />
                    </View>
                  </Group>
                ) : null}
                <Muted v="caption" style={{ marginTop: sp.sm }}>Poles = largadas desde el primer puesto.</Muted>
              </>
            ) : (
              <StateView loading={career.loading} error={career.error} onRetry={career.refresh} />
            )}
            {info?.url ? (
              <Pressable onPress={() => Linking.openURL(info.url!)} style={{ marginTop: sp.lg }} accessibilityRole="link">
                <T v="smallMedium" color={p.accent}>Biografía en Wikipedia ›</T>
              </Pressable>
            ) : null}
          </>
        ) : null}

        {tab === 'results' ? (
          season.length ? (
            <Group>
              {season.map((r) => {
                const res = r.Results[0];
                const pos = Number(res?.position);
                const finished = /^\d+$/.test(res?.positionText ?? '');
                return (
                  <Row
                    key={r.round}
                    title={r.raceName.replace('Grand Prix', 'GP')}
                    subtitle={`Largó ${res?.grid === '0' ? 'desde boxes' : `P${res?.grid}`} · ${statusEs(res?.status)}`}
                    chevron={false}
                    leading={<Muted v="caption" style={{ width: 26 }}>R{r.round}</Muted>}
                    trailing={
                      <View style={{ alignItems: 'flex-end', minWidth: 44 }}>
                        <T v="num" color={finished && pos <= 3 ? p.ink : finished ? p.ink2 : p.muted}>{finished ? `P${pos}` : 'Ab.'}</T>
                        {res?.points && res.points !== '0' ? <Muted v="caption">+{formatPoints(Number(res.points))}</Muted> : null}
                      </View>
                    }
                  />
                );
              })}
            </Group>
          ) : (
            <Muted>Sin carreras en 2026.</Muted>
          )
        ) : null}

        {tab === 'team' ? (
          <>
            {teamInfo ? (
              <>
                <SectionLabel style={{ marginTop: 0 }}>Equipo de trabajo</SectionLabel>
                <Group>
                  <View style={{ paddingHorizontal: sp.lg }}>
                    <FactList facts={[...(engineer ? ([['Ingeniero de pista', engineer]] as Facts) : []), ...teamInfo.staff.slice(0, 3)]} />
                  </View>
                  <Row title={`Ver ${teamInfo.name}`} subtitle="Staff, auto y motor" href={`/equipo/f1/${team!.constructorId}`} />
                </Group>
              </>
            ) : null}
            <SectionLabel style={teamInfo ? undefined : { marginTop: 0 }}>Datos personales</SectionLabel>
            <Group>
              <View style={{ paddingHorizontal: sp.lg }}>
                <FactList facts={personal} />
              </View>
            </Group>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function SeriesDriver({ serie, id }: { serie: string; id: string }) {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<'summary' | 'car'>('summary');
  const standings = useSeriesStandings(serie);
  const driver = findDriver(serie, id);
  const s = SERIES[serie];
  if (!driver || !s) return <StateView empty="No encontré a este piloto." />;

  const team = teamOfDriver(serie, driver);
  const hits = standingsFor(serie, driver.name, 'drivers');
  const main = hits[0]?.row;
  const carName = driver.car ?? team?.car;
  const variants = variantsFor(serie, [carName, team?.engine, team?.name, driver.team]);
  const sheet = SERIES_TECH[serie];
  const facts: Facts = [
    ['Categoría', s.name],
    ...(driver.team || team ? ([['Equipo', driver.team ?? team!.name]] as Facts) : []),
    ...(carName ? ([['Auto', carName]] as Facts) : []),
    ...(team?.engine ? ([['Motor', team.engine]] as Facts) : []),
    ...(main?.ballast ? ([['Lastre actual', main.ballast]] as Facts) : []),
    ...(driver.nationality ? ([['Nacionalidad', driver.nationality]] as Facts) : []),
    ...(driver.facts ?? []),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <Stack.Screen options={{ title: '' }} />
      <Hero name={driver.name} number={driver.number} photo={driver.photo} eyebrow={s.name} lines={[[driver.team, carName].filter(Boolean).join(' · ')].filter(Boolean)} />
      <Tabs value={tab} onChange={setTab} items={[{ value: 'summary', label: 'Resumen' }, ...(variants.length || sheet ? [{ value: 'car' as const, label: 'Su auto' }] : [])]} />
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
                  {main?.wins ? <Stat label="Victorias" value={main.wins} /> : null}
                  {main?.poles ? <Stat label="Poles" value={main.poles} /> : null}
                  {main?.top5 ? <Stat label="Top 5" value={main.top5} /> : null}
                  {main?.top10 ? <Stat label="Top 10" value={main.top10} /> : null}
                  {main?.lapsLed ? <Stat label="Vueltas lideradas" value={main.lapsLed} /> : null}
                  {main?.starts ? <Stat label="Carreras" value={main.starts} /> : null}
                  {main?.dnf ? <Stat label="Abandonos" value={main.dnf} /> : null}
                </StatGrid>
                {standings ? <SourceBadge data={standings} /> : null}
              </>
            ) : null}
            <SectionLabel style={hits.length ? undefined : { marginTop: 0 }}>Ficha</SectionLabel>
            <Group>
              <View style={{ paddingHorizontal: sp.lg }}>
                <FactList facts={facts} />
              </View>
              {team ? <Row title={`Ver ${team.name}`} href={`/equipo/${serie}/${slugify(team.name)}`} /> : null}
            </Group>
            <PressLink href={`/categoria/${serie}`} style={{ marginTop: sp.lg }}>
              <T v="smallMedium" color={p.accent}>Ver todo {s.name} ›</T>
            </PressLink>
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
