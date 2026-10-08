import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { constructorStandings, driverStandings, openF1Drivers } from '@/api/f1';
import { SourceBadge } from '@/components/source-badge';
import { Group, Muted, Row, StateView, T } from '@/components/ui';
import { driversOf, standingsFor, teamsOf } from '@/data/catalog';
import { F1_TEAMS, NATIONALITY_ES } from '@/data/f1';
import { useSeriesStandings } from '@/data/standings-store';
import { formatPoints, norm, slugify } from '@/lib/text';
import { useAsync } from '@/lib/use-async';
import { radius, sp, usePalette } from '@/theme';

interface Item {
  id: string;
  name: string;
  number?: string;
  sub: string;
  photo?: string | null;
  pos?: number;
  points?: number | null;
}

function Avatar({ photo, number }: { photo?: string | null; number?: string }) {
  const p = usePalette();
  // El número queda detrás: si la foto tarda o no carga, igual se identifica al piloto.
  return (
    <View style={[st.avatar, { backgroundColor: p.raised, alignItems: 'center', justifyContent: 'center' }]}>
      <T v="num" color={p.ink2} style={{ fontSize: number && number.length > 2 ? 12 : 15 }}>
        {number ?? '—'}
      </T>
      {photo ? <Image source={photo} style={{ position: 'absolute', width: 40, height: 40 }} contentFit="cover" contentPosition="top" transition={150} /> : null}
    </View>
  );
}

function Search({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const p = usePalette();
  return <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={p.subtle} style={[st.search, { backgroundColor: p.raised, color: p.ink }]} clearButtonMode="while-editing" />;
}

const matches = (it: Item, q: string) => !q.trim() || norm(`${it.name} ${it.sub}`).includes(norm(q));

// ---------- Pilotos ----------

export function DriversSection({ serie }: { serie: string }) {
  return serie === 'f1' ? <F1Drivers /> : <SeriesDrivers serie={serie} />;
}

function DriverRows({ items, serie }: { items: Item[]; serie: string }) {
  return (
    <Group>
      {items.map((it) => (
        <Row
          key={it.id}
          title={it.name}
          subtitle={it.sub}
          href={`/piloto/${serie}/${it.id}`}
          leading={<Avatar photo={it.photo} number={it.number} />}
          trailing={
            it.pos ? (
              <View style={{ alignItems: 'flex-end' }}>
                <T v="num">P{it.pos}</T>
                <Muted v="caption">{formatPoints(it.points)} pts</Muted>
              </View>
            ) : undefined
          }
        />
      ))}
    </Group>
  );
}

function F1Drivers() {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const { data, loading, error, refreshing, refresh } = useAsync((force) => driverStandings(force), []);
  // Las fotos son opcionales: si OpenF1 no responde, igual se ven los números.
  const photos = useAsync(() => openF1Drivers(), []).data;

  const items = useMemo<Item[]>(() => {
    if (!data) return [];
    return data.data.rows.map((r) => {
      const team = r.Constructors[r.Constructors.length - 1];
      return {
        id: r.Driver.driverId,
        name: `${r.Driver.givenName} ${r.Driver.familyName}`,
        number: r.Driver.permanentNumber,
        sub: `${F1_TEAMS[team?.constructorId]?.name ?? team?.name ?? ''} · ${NATIONALITY_ES[r.Driver.nationality] ?? r.Driver.nationality}`,
        photo: r.Driver.code ? photos?.[r.Driver.code]?.headshot_url : undefined,
        pos: Number(r.position),
        points: Number(r.points),
      };
    });
  }, [data, photos]);

  if (!data) return <StateView loading={loading} error={error} onRetry={refresh} />;
  return (
    <ScrollView
      contentContainerStyle={{ padding: sp.lg, paddingBottom: insets.bottom + sp.xxl }}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={p.muted} colors={[p.accent]} />}>
      <Search value={q} onChange={setQ} placeholder="Buscar piloto o equipo" />
      <View style={{ marginTop: sp.md }}>
        <DriverRows items={items.filter((i) => matches(i, q))} serie="f1" />
      </View>
      <Muted v="caption" style={{ marginTop: sp.md }}>Fotos de OpenF1 · puntos en vivo de Jolpica.</Muted>
    </ScrollView>
  );
}

function SeriesDrivers({ serie }: { serie: string }) {
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const standings = useSeriesStandings(serie);
  const items = useMemo<Item[]>(
    () =>
      driversOf(serie).map((d) => {
        const hit = standingsFor(serie, d.name, 'drivers')[0];
        return { id: slugify(d.name), name: d.name, number: d.number, sub: [d.team, d.car].filter(Boolean).join(' · '), photo: d.photo, pos: hit?.row.pos, points: hit?.row.points };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [serie, standings],
  );
  if (!items.length) return <StateView empty="Todavía no hay pilotos cargados para esta categoría." />;
  const shown = items.filter((i) => matches(i, q));
  return (
    <ScrollView contentContainerStyle={{ padding: sp.lg, paddingBottom: insets.bottom + sp.xxl }} keyboardShouldPersistTaps="handled">
      {items.length > 12 ? <Search value={q} onChange={setQ} placeholder="Buscar piloto, equipo o marca" /> : null}
      <View style={{ marginTop: items.length > 12 ? sp.md : 0 }}>
        {shown.length ? <DriverRows items={shown} serie={serie} /> : <Muted style={{ textAlign: 'center', padding: sp.xl }}>Ningún piloto coincide.</Muted>}
      </View>
      {standings ? <SourceBadge data={standings} /> : null}
    </ScrollView>
  );
}

// ---------- Equipos ----------

export function TeamsSection({ serie }: { serie: string }) {
  return serie === 'f1' ? <F1Teams /> : <SeriesTeams serie={serie} />;
}

function Dot({ color }: { color: string }) {
  return <View style={{ width: 4, alignSelf: 'stretch', borderRadius: 2, backgroundColor: color }} />;
}

function F1Teams() {
  const insets = useSafeAreaInsets();
  const p = usePalette();
  const { data, loading, error, refreshing, refresh } = useAsync(async (force) => {
    const [c, d] = await Promise.all([constructorStandings(force), driverStandings(force)]);
    return { c, d };
  }, []);
  if (!data) return <StateView loading={loading} error={error} onRetry={refresh} />;
  return (
    <ScrollView
      contentContainerStyle={{ padding: sp.lg, paddingBottom: insets.bottom + sp.xxl }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={p.muted} colors={[p.accent]} />}>
      <Group>
        {data.c.data.rows.map((r) => {
          const id = r.Constructor.constructorId;
          const info = F1_TEAMS[id];
          const drivers = data.d.data.rows.filter((d) => d.Constructors[d.Constructors.length - 1]?.constructorId === id).map((d) => d.Driver.familyName);
          return (
            <Row
              key={id}
              title={info?.fullName ?? r.Constructor.name}
              subtitle={`${drivers.join(' · ')}${info ? ` · ${info.car}` : ''}`}
              href={`/equipo/f1/${id}`}
              leading={<Dot color={info?.color ?? p.subtle} />}
              trailing={
                <View style={{ alignItems: 'flex-end' }}>
                  <T v="num">P{r.position}</T>
                  <Muted v="caption">{formatPoints(Number(r.points))} pts</Muted>
                </View>
              }
            />
          );
        })}
      </Group>
    </ScrollView>
  );
}

function SeriesTeams({ serie }: { serie: string }) {
  const insets = useSafeAreaInsets();
  const standings = useSeriesStandings(serie);
  const teams = teamsOf(serie);
  if (!teams.length) return <StateView empty="Esta categoría todavía no tiene equipos cargados. Los pilotos y la ficha técnica están en las otras secciones." />;
  return (
    <ScrollView contentContainerStyle={{ padding: sp.lg, paddingBottom: insets.bottom + sp.xxl }}>
      <Group>
        {teams.map((t) => {
          const hit = standingsFor(serie, t.name, 'teams')[0];
          return (
            <Row
              key={t.name}
              title={t.name}
              subtitle={[t.drivers.join(' · '), [t.car, t.engine].filter(Boolean).join(' · ')].filter(Boolean).join('\n')}
              href={`/equipo/${serie}/${slugify(t.name)}`}
              trailing={
                hit ? (
                  <View style={{ alignItems: 'flex-end' }}>
                    <T v="num">P{hit.row.pos}</T>
                    <Muted v="caption">{formatPoints(hit.row.points)} pts</Muted>
                  </View>
                ) : undefined
              }
            />
          );
        })}
      </Group>
      {standings ? <SourceBadge data={standings} /> : null}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  avatar: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden' },
  search: { borderRadius: radius.md, paddingHorizontal: sp.md, paddingVertical: 10, fontSize: 15 },
});
