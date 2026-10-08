import { StyleSheet, View } from 'react-native';

import type { StandingRow } from '@/data/types';
import { formatPoints } from '@/lib/text';
import { sp, usePalette } from '@/theme';

import { Muted, PressLink, T } from './ui';

/** Línea secundaria de una fila: número, equipo, auto y las estadísticas que traiga la fuente. */
export function rowDetail(r: StandingRow): string | undefined {
  const parts = [
    r.number ? `#${r.number}` : '',
    r.team ?? '',
    r.car ?? '',
    r.ballast ? `lastre ${r.ballast}` : '',
    r.poles ? `${r.poles} poles` : '',
    r.top5 ? `${r.top5} top 5` : '',
    r.lapsLed ? `${r.lapsLed} v. lideradas` : '',
    r.grid ? `largó P${r.grid}` : '',
    r.status && r.status !== 'Running' ? r.status : '',
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : undefined;
}

interface Props {
  pos: number;
  name: string;
  sub?: string;
  points: number | null;
  wins?: number;
  /** color del equipo (solo F1): una línea fina a la izquierda */
  color?: string;
  href?: string;
}

/** Una línea de tabla de posiciones. */
export function StandingRowView({ pos, name, sub, points, wins, color, href }: Props) {
  const p = usePalette();
  const body = (
    <View style={st.row}>
      <T v="num" color={pos <= 3 ? p.ink : p.muted} style={st.pos}>
        {pos}
      </T>
      {color ? <View style={[st.bar, { backgroundColor: color }]} /> : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <T v="bodyMedium" numberOfLines={2}>
          {name}
        </T>
        {sub ? <Muted v="caption" numberOfLines={1} style={{ marginTop: 1 }}>{sub}</Muted> : null}
      </View>
      {wins ? <Muted v="caption" style={st.wins}>{wins} V</Muted> : null}
      <T v="num" style={st.pts}>
        {formatPoints(points)}
      </T>
      {href ? <T color={p.subtle}>›</T> : null}
    </View>
  );
  return href ? <PressLink href={href}>{body}</PressLink> : body;
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: sp.md, paddingHorizontal: sp.lg, paddingVertical: 11 },
  pos: { width: 24, textAlign: 'right' },
  bar: { width: 3, alignSelf: 'stretch', borderRadius: 2 },
  wins: { minWidth: 28, textAlign: 'right' },
  pts: { minWidth: 44, textAlign: 'right' },
});
