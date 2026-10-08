import { router, type Href } from 'expo-router';
import { Children, Fragment, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Facts } from '@/data/types';
import { F, radius, sp, ty, usePalette } from '@/theme';

type Variant = keyof typeof ty;

/** Texto con la escala tipográfica del proyecto. */
export function T({ v = 'body', style, children, numberOfLines, color, fit }: { v?: Variant; style?: StyleProp<TextStyle>; children?: ReactNode; numberOfLines?: number; color?: string; fit?: boolean }) {
  const p = usePalette();
  return (
    <Text numberOfLines={fit ? 1 : numberOfLines} adjustsFontSizeToFit={fit} minimumFontScale={fit ? 0.55 : undefined} style={[ty[v], { color: color ?? p.ink }, style]}>
      {children}
    </Text>
  );
}

export const Muted = ({ children, v = 'small', style, numberOfLines }: { children?: ReactNode; v?: Variant; style?: StyleProp<TextStyle>; numberOfLines?: number }) => {
  const p = usePalette();
  return (
    <T v={v} color={p.muted} style={style} numberOfLines={numberOfLines}>
      {children}
    </T>
  );
};

/** Navega a otra pantalla. Reemplaza a <Link asChild>, que no acepta estilos en lista. */
export function PressLink({ href, style, children }: { href: string; style?: StyleProp<ViewStyle>; children: ReactNode }) {
  return (
    <Pressable onPress={() => router.push(href as Href)} accessibilityRole="link" style={({ pressed }) => [style, { opacity: pressed ? 0.6 : 1 }]}>
      {children}
    </Pressable>
  );
}

/** Título grande de pestaña. */
export function ScreenHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[st.header, { paddingTop: insets.top + sp.lg }]}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <T v="title">{title}</T>
        {subtitle ? <Muted style={{ marginTop: 2 }}>{subtitle}</Muted> : null}
      </View>
      {right}
    </View>
  );
}

/** Rótulo de sección en mayúsculas pequeñas. */
export function SectionLabel({ children, right, style }: { children: ReactNode; right?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[st.sectionLabel, style]}>
      <Muted v="label">{children}</Muted>
      {right}
    </View>
  );
}

/** Pestañas de texto con subrayado; el estilo de navegación secundaria de toda la app. */
export function Tabs<V extends string>({ items, value, onChange, padded = true }: { items: { value: V; label: string; badge?: string }[]; value: V; onChange: (v: V) => void; padded?: boolean }) {
  const p = usePalette();
  return (
    <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: p.line }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[st.tabs, padded && { paddingHorizontal: sp.lg }]}>
        {items.map((it) => {
          const on = it.value === value;
          return (
            <Pressable key={it.value} onPress={() => onChange(it.value)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={st.tab}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <T v="smallMedium" color={on ? p.ink : p.muted}>
                  {it.label}
                </T>
                {it.badge ? <T v="caption" color={p.subtle}>{it.badge}</T> : null}
              </View>
              <View style={[st.underline, { backgroundColor: on ? p.accent : 'transparent' }]} />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

/** Selector compacto de dos o tres opciones. */
export function Segmented<V extends string>({ options, value, onChange }: { options: { value: V; label: string }[]; value: V; onChange: (v: V) => void }) {
  const p = usePalette();
  return (
    <View style={[st.seg, { backgroundColor: p.raised }]}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={o.value} onPress={() => onChange(o.value)} style={[st.segItem, on && { backgroundColor: p.surface }]} accessibilityRole="button" accessibilityState={{ selected: on }}>
            <T v="smallMedium" color={on ? p.ink : p.muted}>
              {o.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Botón de texto, para filtros y acciones secundarias. */
export function TextButton({ label, onPress, active }: { label: string; onPress: () => void; active?: boolean }) {
  const p = usePalette();
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button">
      <T v="smallMedium" color={active ? p.accent : p.ink2}>
        {label}
      </T>
    </Pressable>
  );
}

export function Chip({ label, active, onPress, dot }: { label: string; active?: boolean; onPress?: () => void; dot?: string }) {
  const p = usePalette();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={({ pressed }) => [st.chip, { backgroundColor: active ? p.ink : p.raised, opacity: pressed ? 0.7 : 1 }]}>
      {dot ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot, marginRight: 6 }} /> : null}
      <T v="smallMedium" color={active ? p.bg : p.ink2}>
        {label}
      </T>
    </Pressable>
  );
}

export function ChipRow({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[st.chipRow, style]}>
      {children}
    </ScrollView>
  );
}

/** Etiqueta neutra pequeña. */
export function Tag({ label, tone = 'muted' }: { label: string; tone?: 'muted' | 'ok' | 'warn' | 'accent' }) {
  const p = usePalette();
  const color = tone === 'ok' ? p.ok : tone === 'warn' ? p.warn : tone === 'accent' ? p.accent : p.muted;
  return (
    <View style={[st.tag, { borderColor: tone === 'muted' ? p.line : color }]}>
      <T v="caption" color={color} style={{ fontFamily: F.medium }}>
        {label}
      </T>
    </View>
  );
}

/** Punto de estado con texto. */
export function StatusDot({ label, tone }: { label: string; tone: 'ok' | 'warn' | 'muted' }) {
  const p = usePalette();
  const color = tone === 'ok' ? p.ok : tone === 'warn' ? p.warn : p.subtle;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
      <T v="caption" color={p.muted}>
        {label}
      </T>
    </View>
  );
}

/** Superficie con borde fino. */
export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const p = usePalette();
  return <View style={[st.card, { backgroundColor: p.surface, borderColor: p.line }, style]}>{children}</View>;
}

/** Grupo de filas dentro de una sola superficie, separadas por líneas finas. */
export function Group({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const p = usePalette();
  const rows = Children.toArray(children).filter(Boolean);
  return (
    <View style={[st.group, { backgroundColor: p.surface, borderColor: p.line }, style]}>
      {rows.map((c, i) => (
        <Fragment key={i}>
          {i > 0 ? <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: p.line, marginLeft: sp.lg }} /> : null}
          {c}
        </Fragment>
      ))}
    </View>
  );
}

/** Fila de lista: título, subtítulo opcional, contenido a la derecha y flecha si navega. */
export function Row({ title, subtitle, leading, trailing, href, onPress, chevron = true, numberOfLines = 1, subtitleLines = 2 }: { title: ReactNode; subtitle?: ReactNode; leading?: ReactNode; trailing?: ReactNode; href?: string; onPress?: () => void; chevron?: boolean; numberOfLines?: number; subtitleLines?: number }) {
  const p = usePalette();
  const body = (
    <View style={st.row}>
      {leading}
      <View style={{ flex: 1, minWidth: 0 }}>
        <T v="bodyMedium" numberOfLines={numberOfLines}>
          {title}
        </T>
        {subtitle ? (
          <Muted numberOfLines={subtitleLines} style={{ marginTop: 1 }}>
            {subtitle}
          </Muted>
        ) : null}
      </View>
      {trailing}
      {(href || onPress) && chevron ? <T v="body" color={p.subtle}>›</T> : null}
    </View>
  );
  if (href) return <PressLink href={href}>{body}</PressLink>;
  if (onPress) return <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>{body}</Pressable>;
  return body;
}

/** Ficha de pares etiqueta / valor. */
export function FactList({ facts }: { facts: Facts }) {
  const p = usePalette();
  return (
    <View>
      {facts.map(([k, v], i) => (
        <View key={k + i} style={[st.fact, i > 0 && { borderTopColor: p.line, borderTopWidth: StyleSheet.hairlineWidth }]}>
          <Muted style={st.factKey}>{k}</Muted>
          <T v="smallMedium" style={st.factVal}>
            {v}
          </T>
        </View>
      ))}
    </View>
  );
}

/** Cifra con etiqueta, para estadísticas. */
export function Stat({ label, value, strong }: { label: string; value: string | number; strong?: boolean }) {
  const p = usePalette();
  return (
    <View style={[st.stat, { backgroundColor: p.surface, borderColor: p.line }]}>
      <T v="numLarge" color={strong ? p.accent : p.ink} fit>
        {value}
      </T>
      <Muted v="caption" style={{ marginTop: 2 }}>
        {label}
      </Muted>
    </View>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <View style={st.statGrid}>{children}</View>;
}

export function StateView({ loading, error, empty, onRetry }: { loading?: boolean; error?: string; empty?: string; onRetry?: () => void }) {
  const p = usePalette();
  if (loading) {
    return (
      <View style={st.state}>
        <ActivityIndicator color={p.muted} />
      </View>
    );
  }
  if (error) {
    return (
      <View style={st.state}>
        <T v="bodyMedium" style={{ textAlign: 'center' }}>No se pudieron cargar los datos</T>
        <Muted style={{ textAlign: 'center', marginTop: 4 }}>Revisá la conexión a internet y probá de nuevo.</Muted>
        {onRetry ? (
          <Pressable onPress={onRetry} style={{ marginTop: sp.md }}>
            <T v="smallMedium" color={p.accent}>Reintentar</T>
          </Pressable>
        ) : null}
      </View>
    );
  }
  if (empty) {
    return (
      <View style={st.state}>
        <Muted style={{ textAlign: 'center' }}>{empty}</Muted>
      </View>
    );
  }
  return null;
}

const st = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-end', gap: sp.md, paddingHorizontal: sp.lg, paddingBottom: sp.md },
  sectionLabel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: sp.xl, marginBottom: sp.sm },
  tabs: { gap: sp.xl },
  tab: { paddingTop: sp.md },
  underline: { height: 2, marginTop: sp.sm, borderRadius: 1 },
  seg: { flexDirection: 'row', borderRadius: radius.md, padding: 3, gap: 2 },
  segItem: { flex: 1, alignItems: 'center', paddingVertical: 7, borderRadius: radius.sm + 1 },
  chip: { flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingHorizontal: sp.md, paddingVertical: 6 },
  chipRow: { gap: sp.sm, paddingHorizontal: sp.lg, paddingVertical: sp.sm },
  tag: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1, alignSelf: 'flex-start' },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.lg, padding: sp.lg },
  group: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: sp.md, paddingHorizontal: sp.lg, paddingVertical: sp.md },
  fact: { flexDirection: 'row', gap: sp.md, paddingVertical: 9 },
  factKey: { width: 124 },
  factVal: { flex: 1 },
  stat: { flexGrow: 1, flexBasis: '30%', borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.md, paddingVertical: sp.md, paddingHorizontal: sp.md },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: sp.sm },
  state: { alignItems: 'center', justifyContent: 'center', padding: sp.xxl },
});
