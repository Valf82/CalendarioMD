import { Image } from 'expo-image';
import { View } from 'react-native';

import { sp, usePalette } from '@/theme';

import { Muted, T } from './ui';

/** Cabecera de una ficha de piloto o equipo: foto o número, nombre y líneas de contexto. */
export function Hero({ name, eyebrow, number, photo, color, lines = [] }: { name: string; eyebrow?: string; number?: string; photo?: string | null; color?: string; lines?: string[] }) {
  const p = usePalette();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: sp.lg, paddingHorizontal: sp.lg, paddingBottom: sp.lg }}>
      {photo || number ? (
        <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: p.raised, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {number ? <T v="numLarge" style={{ fontSize: number.length > 2 ? 20 : 26 }}>{number}</T> : null}
          {photo ? <Image source={photo} style={{ position: 'absolute', width: 76, height: 76 }} contentFit="cover" contentPosition="top" transition={150} /> : null}
        </View>
      ) : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        {eyebrow ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {color ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} /> : null}
            <Muted v="caption">{eyebrow}</Muted>
          </View>
        ) : null}
        <T v="h1" style={{ marginTop: 2 }} numberOfLines={2}>
          {name}
        </T>
        {lines.map((l) => (
          <Muted key={l} numberOfLines={2}>
            {l}
          </Muted>
        ))}
      </View>
    </View>
  );
}
