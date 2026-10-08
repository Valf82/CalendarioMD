import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { type ReactElement } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Muted, StateView, T } from '@/components/ui';
import { SERIES } from '@/data/series';
import type { NewsItem } from '@/data/types';
import { refreshNews, useNews } from '@/data/news-store';
import { radius, sp, usePalette } from '@/theme';

export function timeAgo(iso: string, now = Date.now()): string {
  const min = Math.max(0, Math.round((now - Date.parse(iso)) / 60_000));
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return d === 1 ? 'ayer' : `hace ${d} días`;
}

const open = (url: string) => WebBrowser.openBrowserAsync(url).catch(() => {});

/** Etiqueta de categoría de una noticia: la primera que tenga. */
const seriesLabel = (it: NewsItem) => (it.series[0] ? SERIES[it.series[0]]?.name : undefined);

function Meta({ item, showSeries }: { item: NewsItem; showSeries: boolean }) {
  const label = showSeries ? seriesLabel(item) : undefined;
  return (
    <Muted v="caption" numberOfLines={1}>
      {[label, item.source, item.lang === 'en' ? 'EN' : '', timeAgo(item.published)].filter(Boolean).join(' · ')}
    </Muted>
  );
}

function HeroItem({ item, showSeries }: { item: NewsItem; showSeries: boolean }) {
  const p = usePalette();
  return (
    <Pressable onPress={() => open(item.url)} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, marginBottom: sp.md }]} accessibilityRole="link">
      {item.image ? <Image source={item.image} style={[st.heroImg, { backgroundColor: p.raised }]} contentFit="cover" transition={150} /> : null}
      <T v="h1" style={{ marginTop: sp.md }} numberOfLines={3}>
        {item.title}
      </T>
      {item.summary ? <Muted style={{ marginTop: 4 }} numberOfLines={2}>{item.summary}</Muted> : null}
      <View style={{ marginTop: sp.sm }}>
        <Meta item={item} showSeries={showSeries} />
      </View>
    </Pressable>
  );
}

function NewsRow({ item, showSeries }: { item: NewsItem; showSeries: boolean }) {
  const p = usePalette();
  return (
    <Pressable onPress={() => open(item.url)} style={({ pressed }) => [st.row, { borderTopColor: p.line, opacity: pressed ? 0.6 : 1 }]} accessibilityRole="link">
      <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
        <T v="bodyMedium" numberOfLines={3}>
          {item.title}
        </T>
        <Meta item={item} showSeries={showSeries} />
      </View>
      {item.image ? <Image source={item.image} style={[st.thumb, { backgroundColor: p.raised }]} contentFit="cover" transition={150} /> : null}
    </Pressable>
  );
}

/** Lista de noticias con la primera destacada y actualización al deslizar. */
export function NewsList({ items, header, showSeries = true, empty = 'No hay noticias recientes.' }: { items: NewsItem[]; header?: ReactElement; showSeries?: boolean; empty?: string }) {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const { loading } = useNews();
  const [first, ...rest] = items;
  return (
    <FlatList
      data={rest}
      keyExtractor={(i) => i.id}
      contentContainerStyle={{ paddingBottom: insets.bottom + sp.xxl }}
      ListHeaderComponent={
        <View>
          {header}
          <View style={{ paddingHorizontal: sp.lg, paddingTop: sp.lg }}>{first ? <HeroItem item={first} showSeries={showSeries} /> : null}</View>
        </View>
      }
      ListEmptyComponent={first ? null : <StateView empty={empty} />}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refreshNews(true)} tintColor={p.muted} colors={[p.accent]} />}
      renderItem={({ item }) => <NewsRow item={item} showSeries={showSeries} />}
    />
  );
}

/** Noticias de una sola categoría (para la pantalla de categoría). */
export function NewsSection({ serie }: { serie: string }) {
  const { items } = useNews();
  return <NewsList items={items.filter((i) => i.series.includes(serie))} showSeries={false} empty="Todavía no hay noticias de esta categoría en las últimas semanas." />;
}

const st = StyleSheet.create({
  heroImg: { width: '100%', aspectRatio: 16 / 9, borderRadius: radius.lg },
  row: { flexDirection: 'row', gap: sp.md, marginHorizontal: sp.lg, paddingVertical: sp.md, borderTopWidth: StyleSheet.hairlineWidth },
  thumb: { width: 88, height: 66, borderRadius: radius.md },
});
