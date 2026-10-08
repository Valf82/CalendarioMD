import { useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { constructorStandings, driverStandings } from '@/api/f1';
import { SourceBadge } from '@/components/source-badge';
import { rowDetail, StandingRowView } from '@/components/standing-row';
import { Chip, ChipRow, Group, Muted, Segmented, StateView } from '@/components/ui';
import { driversOf, teamsOf } from '@/data/catalog';
import { F1_TEAMS } from '@/data/f1';
import { refreshStandings, useSeriesStandings } from '@/data/standings-store';
import { slugify } from '@/lib/text';
import { useAsync } from '@/lib/use-async';
import { sp, usePalette } from '@/theme';

export function StandingsSection({ serie }: { serie: string }) {
  return serie === 'f1' ? <F1Standings /> : <OfficialStandings serie={serie} />;
}

function F1Standings() {
  const insets = useSafeAreaInsets();
  const p = usePalette();
  const [mode, setMode] = useState<'drivers' | 'teams'>('drivers');
  const { data, loading, error, refreshing, refresh } = useAsync(async (force) => {
    const [d, c] = await Promise.all([driverStandings(force), constructorStandings(force)]);
    return { d, c };
  }, []);

  return (
    <ScrollView
      contentContainerStyle={{ padding: sp.lg, paddingBottom: insets.bottom + sp.xxl }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={p.muted} colors={[p.accent]} />}>
      <Segmented
        value={mode}
        onChange={setMode}
        options={[
          { value: 'drivers', label: 'Pilotos' },
          { value: 'teams', label: 'Constructores' },
        ]}
      />
      {!data ? (
        <StateView loading={loading} error={error} onRetry={refresh} />
      ) : (
        <>
          <SourceBadge
            data={{
              official: true,
              source: 'Jolpica F1 API · resultados oficiales de la FIA',
              sourceUrl: 'https://api.jolpi.ca/ergast/f1/2026/driverstandings.json',
              updated: `En vivo, tras la ronda ${data.d.data.round}`,
              note: data.d.stale ? 'Sin conexión: se muestra la última copia guardada.' : undefined,
            }}
          />
          <Group style={{ marginTop: sp.md }}>
            {mode === 'drivers'
              ? data.d.data.rows.map((r) => {
                  const team = r.Constructors[r.Constructors.length - 1];
                  return (
                    <StandingRowView
                      key={r.Driver.driverId}
                      pos={Number(r.position)}
                      name={`${r.Driver.givenName} ${r.Driver.familyName}`}
                      sub={`#${r.Driver.permanentNumber ?? '—'} · ${F1_TEAMS[team?.constructorId]?.name ?? team?.name ?? ''}`}
                      points={Number(r.points)}
                      wins={Number(r.wins)}
                      color={F1_TEAMS[team?.constructorId]?.color}
                      href={`/piloto/f1/${r.Driver.driverId}`}
                    />
                  );
                })
              : data.c.data.rows.map((r) => {
                  const info = F1_TEAMS[r.Constructor.constructorId];
                  return (
                    <StandingRowView
                      key={r.Constructor.constructorId}
                      pos={Number(r.position)}
                      name={info?.name ?? r.Constructor.name}
                      sub={info ? `${info.car} · motor ${info.powerUnit.split(' (')[0]}` : undefined}
                      points={Number(r.points)}
                      wins={Number(r.wins)}
                      color={info?.color}
                      href={`/equipo/f1/${r.Constructor.constructorId}`}
                    />
                  );
                })}
          </Group>
          <Muted v="caption" style={{ marginTop: sp.md }}>V = victorias en la temporada. Deslizá hacia abajo para actualizar.</Muted>
        </>
      )}
    </ScrollView>
  );
}

function OfficialStandings({ serie }: { serie: string }) {
  const insets = useSafeAreaInsets();
  const p = usePalette();
  const data = useSeriesStandings(serie);
  const [refreshing, setRefreshing] = useState(false);
  const [tableSel, setTable] = useState(0);
  if (!data?.tables.length) return <StateView empty="Todavía no hay posiciones cargadas para esta categoría." />;

  const table = data.tables[Math.min(tableSel, data.tables.length - 1)];
  const driverIds = new Set(driversOf(serie).map((d) => slugify(d.name)));
  const teamIds = new Set(teamsOf(serie).map((t) => slugify(t.name)));

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: insets.bottom + sp.xxl }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await refreshStandings(true);
            setRefreshing(false);
          }}
          tintColor={p.muted}
          colors={[p.accent]}
        />
      }>
      {data.tables.length > 1 ? (
        <ChipRow>
          {data.tables.map((t, i) => (
            <Chip key={t.title} label={t.title} active={t === table} onPress={() => setTable(i)} />
          ))}
        </ChipRow>
      ) : null}
      <View style={{ paddingHorizontal: sp.lg }}>
        <SourceBadge data={data} />
        <Group style={{ marginTop: sp.md }}>
          {table.rows.map((r, i) => {
            const first = r.name.split(' / ')[0];
            const id = slugify(table.kind === 'drivers' ? first : r.name);
            const linkable = table.kind === 'drivers' ? driverIds.has(id) : teamIds.has(id);
            return (
              <StandingRowView
                key={`${r.pos}-${r.name}-${i}`}
                pos={r.pos}
                name={r.name}
                sub={rowDetail(r)}
                points={r.points}
                wins={r.wins}
                href={linkable ? (table.kind === 'drivers' ? `/piloto/${serie}/${id}` : `/equipo/${serie}/${id}`) : undefined}
              />
            );
          })}
        </Group>
        <Muted v="caption" style={{ marginTop: sp.md }}>V = victorias en la temporada. Deslizá hacia abajo para actualizar.</Muted>
      </View>
    </ScrollView>
  );
}
