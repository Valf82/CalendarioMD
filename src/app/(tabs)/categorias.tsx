import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FavoriteButton } from '@/components/favorite-button';
import { Group, Row, ScreenHeader, SectionLabel, StateView, Tag } from '@/components/ui';
import { EVENTS } from '@/data/events';
import { LEVELS, SERIES_LIST } from '@/data/series';
import type { Level, Series } from '@/data/types';
import { useFavorites } from '@/lib/favorites';
import { dayParts } from '@/lib/time';
import { radius, sp, usePalette } from '@/theme';

const endOf = (e: { d: string; e?: string }) => Date.parse(`${e.e ?? e.d}T23:59:59-12:00`);

/** Texto de la próxima carrera de una categoría, o "Temporada terminada". */
function nextRace(id: string, now: number): string {
  const e = EVENTS.filter((x) => x.s === id && endOf(x) >= now).sort((a, b) => a.d.localeCompare(b.d))[0];
  if (!e) return 'Temporada finalizada';
  const d = dayParts(e.d);
  return `${d.weekday.charAt(0).toUpperCase()}${d.weekday.slice(1)} ${d.day} ${d.month.slice(0, 3)} · ${e.c || e.n}`;
}

export default function CategoriesScreen() {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const favs = useFavorites();
  const [q, setQ] = useState('');
  const [now] = useState(() => Date.now());

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return SERIES_LIST.filter((s) => !query || `${s.name} ${s.type}`.toLowerCase().includes(query));
  }, [q]);

  const row = (s: Series) => (
    <Row key={s.id} title={s.name} subtitle={nextRace(s.id, now)} href={`/categoria/${s.id}`} trailing={<><Tag label={s.type} /><FavoriteButton id={s.id} /></>} />
  );

  const favList = list.filter((s) => favs.includes(s.id));

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <ScreenHeader title="Categorías" subtitle={`${SERIES_LIST.length} categorías`} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: sp.lg, paddingBottom: insets.bottom + sp.xxl }} keyboardShouldPersistTaps="handled">
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Buscar categoría"
          placeholderTextColor={p.subtle}
          style={[st.search, { backgroundColor: p.raised, color: p.ink }]}
          clearButtonMode="while-editing"
        />
        {favList.length ? (
          <>
            <SectionLabel>Favoritas</SectionLabel>
            <Group>{favList.map(row)}</Group>
          </>
        ) : null}
        {(Object.keys(LEVELS) as Level[]).map((l) => {
          const group = list.filter((s) => s.level === l);
          return group.length ? (
            <View key={l}>
              <SectionLabel>{LEVELS[l]}</SectionLabel>
              <Group>{group.map(row)}</Group>
            </View>
          ) : null;
        })}
        {!list.length ? <StateView empty="Ninguna categoría coincide con la búsqueda." /> : null}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  search: { borderRadius: radius.md, paddingHorizontal: sp.md, paddingVertical: 10, fontSize: 15, marginTop: sp.sm },
});
