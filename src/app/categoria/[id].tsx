import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { FavoriteButton } from '@/components/favorite-button';
import { Muted, StateView, T, Tabs, Tag } from '@/components/ui';
import { driversOf, teamsOf } from '@/data/catalog';
import { EVENTS } from '@/data/events';
import { toolsFor } from '@/data/analysis';
import { LEVELS, SERIES } from '@/data/series';
import { useNews } from '@/data/news-store';
import { useSeriesStandings } from '@/data/standings-store';
import { SERIES_TECH } from '@/data/tech';
import { AnalysisSection } from '@/features/analysis';
import { CalendarSection } from '@/features/calendar';
import { NewsSection } from '@/features/news';
import { DriversSection, TeamsSection } from '@/features/roster';
import { StandingsSection } from '@/features/standings';
import { TechSection } from '@/features/tech';
import { dayParts } from '@/lib/time';
import { sp, usePalette } from '@/theme';

type Section = 'standings' | 'drivers' | 'teams' | 'tech' | 'calendar' | 'news' | 'analysis';
const LABEL: Record<Section, string> = { standings: 'Posiciones', drivers: 'Pilotos', teams: 'Equipos', tech: 'Técnica', calendar: 'Calendario', news: 'Noticias', analysis: 'Análisis' };

const endOf = (e: { d: string; e?: string }) => Date.parse(`${e.e ?? e.d}T23:59:59-12:00`);

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = usePalette();
  const series = SERIES[id];
  const standings = useSeriesStandings(id);
  const { items: news } = useNews();
  const [sel, setSel] = useState<Section>();
  const [now] = useState(() => Date.now());

  const upcoming = useMemo(() => EVENTS.filter((e) => e.s === id && endOf(e) >= now).sort((a, b) => a.d.localeCompare(b.d)), [id, now]);

  const available = useMemo<Section[]>(() => {
    const list: Section[] = [];
    if (id === 'f1' || standings?.tables.length) list.push('standings');
    if (id === 'f1' || driversOf(id).length) list.push('drivers');
    if (id === 'f1' || teamsOf(id).length) list.push('teams');
    if (SERIES_TECH[id]) list.push('tech');
    if (upcoming.length) list.push('calendar');
    list.push('news');
    if (toolsFor(id).length) list.push('analysis');
    return list;
  }, [id, standings, upcoming.length]);

  if (!series) return <StateView empty="No encontré esta categoría." />;

  const current = sel && available.includes(sel) ? sel : available[0];
  const newsCount = news.filter((n) => n.series.includes(id)).length;
  const next = upcoming[0];
  const nextText = next ? (() => { const d = dayParts(next.d); return `${d.weekday} ${d.day} de ${d.month} · ${next.c || next.n}`; })() : 'Sin carreras próximas';

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <Stack.Screen options={{ title: '', headerRight: () => <FavoriteButton id={id} size={22} /> }} />
      <View style={{ paddingHorizontal: sp.lg, paddingBottom: sp.md }}>
        <T v="title">{series.name}</T>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: sp.sm, marginTop: sp.sm }}>
          <Tag label={LEVELS[series.level]} />
          <Tag label={series.type} />
        </View>
        <Muted style={{ marginTop: sp.sm }}>Próxima carrera: {nextText}</Muted>
      </View>
      <Tabs items={available.map((s) => ({ value: s, label: LABEL[s], badge: s === 'news' && newsCount ? String(newsCount) : undefined }))} value={current} onChange={setSel} />
      <View style={{ flex: 1 }}>
        {current === 'standings' ? <StandingsSection serie={id} /> : null}
        {current === 'drivers' ? <DriversSection serie={id} /> : null}
        {current === 'teams' ? <TeamsSection serie={id} /> : null}
        {current === 'tech' ? <TechSection serie={id} /> : null}
        {current === 'calendar' ? <CalendarSection serie={id} /> : null}
        {current === 'news' ? <NewsSection serie={id} /> : null}
        {current === 'analysis' ? <AnalysisSection serie={id} /> : null}
      </View>
    </View>
  );
}
