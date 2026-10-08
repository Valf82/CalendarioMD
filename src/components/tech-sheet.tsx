import { useState } from 'react';
import { Linking, Pressable, View } from 'react-native';

import type { TechSheet, TechVariant } from '@/data/types';
import { sp, usePalette } from '@/theme';

import { FactList, Group, Muted, SectionLabel, T } from './ui';

/** Ficha técnica completa: secciones con datos, notas y fuentes. */
export function TechSheetView({ sheet, compact }: { sheet: TechSheet; compact?: boolean }) {
  return (
    <View>
      {!compact ? <T v="h1">{sheet.model}</T> : null}
      {sheet.summary ? <Muted style={{ marginTop: 4 }}>{sheet.summary}</Muted> : null}
      {sheet.sections.map((sec) => (
        <View key={sec.title}>
          <SectionLabel>{sec.title}</SectionLabel>
          <Group>
            <View style={{ paddingHorizontal: sp.lg }}>
              <FactList facts={sec.facts} />
            </View>
          </Group>
        </View>
      ))}
      {sheet.notes ? <Muted v="caption" style={{ marginTop: sp.md }}>{sheet.notes}</Muted> : null}
      <Sources sources={sheet.sources} />
    </View>
  );
}

function Sources({ sources }: { sources: TechSheet['sources'] }) {
  const p = usePalette();
  if (!sources.length) return null;
  return (
    <View style={{ gap: 2, marginTop: sp.lg }}>
      <SectionLabel style={{ marginTop: 0, marginBottom: 2 }}>Fuentes</SectionLabel>
      {sources.map((s) =>
        s.url ? (
          <Pressable key={s.label} onPress={() => Linking.openURL(s.url!)} accessibilityRole="link" hitSlop={4}>
            <T v="caption" color={p.accent}>{s.label} ›</T>
          </Pressable>
        ) : (
          <Muted key={s.label} v="caption">
            {s.label}
          </Muted>
        ),
      )}
    </View>
  );
}

/** Autos o motores de una categoría; cada uno se despliega con su ficha. */
export function VariantList({ variants, initiallyOpen }: { variants: TechVariant[]; initiallyOpen?: string }) {
  const p = usePalette();
  const [open, setOpen] = useState<string | undefined>(initiallyOpen);
  if (!variants.length) return null;
  return (
    <View style={{ gap: sp.sm }}>
      {variants.map((v) => {
        const isOpen = open === v.name;
        return (
          <View key={v.name} style={{ borderWidth: 0.5, borderColor: p.line, backgroundColor: p.surface, borderRadius: 14, overflow: 'hidden' }}>
            <Pressable onPress={() => setOpen(isOpen ? undefined : v.name)} accessibilityRole="button" accessibilityState={{ expanded: isOpen }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: sp.lg }}>
              <View style={{ flex: 1 }}>
                <T v="h2">{v.name}</T>
                <Muted v="caption">{v.sheet.model}</Muted>
              </View>
              <T v="h2" color={p.subtle}>{isOpen ? '−' : '+'}</T>
            </Pressable>
            {isOpen ? (
              <View style={{ paddingHorizontal: sp.lg, paddingBottom: sp.lg }}>
                <TechSheetView sheet={v.sheet} compact />
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
