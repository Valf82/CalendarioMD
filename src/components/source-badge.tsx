import { Linking, Pressable, View } from 'react-native';

import type { SeriesStandings } from '@/data/types';
import { sp, usePalette } from '@/theme';

import { Muted, StatusDot, T } from './ui';

/** De dónde sale el dato: oficial o de respaldo, cuándo se actualizó y el enlace a la fuente. */
export function SourceBadge({ data }: { data: Pick<SeriesStandings, 'official' | 'source' | 'sourceUrl' | 'updated' | 'note' | 'stale'> }) {
  const p = usePalette();
  return (
    <View style={{ gap: 3, marginTop: sp.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: sp.sm, flexWrap: 'wrap' }}>
        <StatusDot label={data.official ? 'Fuente oficial' : 'Fuente de respaldo'} tone={data.official ? 'ok' : 'warn'} />
        {data.updated ? <Muted v="caption">· {data.updated}</Muted> : null}
        {data.stale ? <Muted v="caption">· sin actualizar</Muted> : null}
      </View>
      <Pressable onPress={() => Linking.openURL(data.sourceUrl)} accessibilityRole="link" hitSlop={6}>
        <T v="caption" color={p.accent}>
          {data.source} ›
        </T>
      </Pressable>
      {data.note ? <Muted v="caption">{data.note}</Muted> : null}
    </View>
  );
}
