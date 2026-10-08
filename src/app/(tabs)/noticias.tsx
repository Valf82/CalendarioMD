import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { ScreenHeader, Tabs } from '@/components/ui';
import { SERIES_LIST } from '@/data/series';
import { startNews, useNews } from '@/data/news-store';
import { NewsList } from '@/features/news';
import { useFavorites } from '@/lib/favorites';
import { usePalette } from '@/theme';

export default function NewsScreen() {
  const p = usePalette();
  const { items } = useNews();
  const favs = useFavorites();
  const [tab, setTab] = useState<string>('all');

  useEffect(() => startNews(), []);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const i of items) for (const s of i.series) c[s] = (c[s] ?? 0) + 1;
    return c;
  }, [items]);

  const tabs = useMemo(
    () => [
      { value: 'all', label: 'Todas' },
      ...(favs.length ? [{ value: 'favs', label: 'Favoritas' }] : []),
      ...SERIES_LIST.filter((s) => counts[s.id]).map((s) => ({ value: s.id, label: s.name, badge: String(counts[s.id]) })),
      ...(items.some((i) => !i.series.length) ? [{ value: 'other', label: 'Otras' }] : []),
    ],
    [counts, favs.length, items],
  );
  const current = tabs.some((t) => t.value === tab) ? tab : 'all';

  const shown = items.filter((i) => {
    if (current === 'all') return true;
    if (current === 'favs') return i.series.some((s) => favs.includes(s));
    if (current === 'other') return !i.series.length;
    return i.series.includes(current);
  });

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <ScreenHeader title="Noticias" subtitle={`${shown.length} ${shown.length === 1 ? 'nota' : 'notas'}`} />
      <Tabs items={tabs} value={current} onChange={setTab} />
      <NewsList items={shown} showSeries={current === 'all' || current === 'favs' || current === 'other'} empty={current === 'favs' ? 'Ninguna de tus categorías favoritas tiene noticias recientes.' : undefined} />
    </View>
  );
}
