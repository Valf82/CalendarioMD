import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { SERIES } from '@/data/series';
import type { RaceEvent } from '@/data/types';
import { hhmm, shortDate, TZ_LABEL, type TzMode } from '@/lib/time';
import { sp, usePalette } from '@/theme';

import { Muted, PressLink, StatusDot, T } from './ui';

/** Link a Google Calendar con la carrera ya cargada (funciona sin permisos y en Expo Go). */
export function calendarUrl(e: RaceEvent): string {
  const s = SERIES[e.s];
  const text = encodeURIComponent(`${s.name} · ${e.n}`);
  let dates: string;
  if (e.u) {
    const a = new Date(e.u);
    const b = new Date(a.getTime() + 2 * 3_600_000);
    const z = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    dates = `${z(a)}/${z(b)}`;
  } else {
    const last = new Date(`${e.e ?? e.d}T00:00:00Z`);
    last.setUTCDate(last.getUTCDate() + 1);
    dates = `${e.d.replace(/-/g, '')}/${last.toISOString().slice(0, 10).replace(/-/g, '')}`;
  }
  const loc = encodeURIComponent([e.p, e.c, e.r].filter(Boolean).join(', '));
  const det = encodeURIComponent(`Dónde verla: ${s.tv.join(', ')}`);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&location=${loc}&details=${det}`;
}

/** Una carrera en la agenda: lo esencial a la vista y el detalle al tocar. */
export function EventRow({ e, tz, showSeries = true }: { e: RaceEvent; tz: TzMode; showSeries?: boolean }) {
  const p = usePalette();
  const [open, setOpen] = useState(false);
  const s = SERIES[e.s];
  const place = [e.p, e.c].filter(Boolean).join(' · ');

  return (
    <Pressable onPress={() => setOpen(!open)} accessibilityRole="button" accessibilityState={{ expanded: open }} style={st.row}>
      <View style={st.time}>
        {e.u ? (
          <>
            <T v="num">{hhmm(e.u, tz)}</T>
            <Muted v="caption">{e.ap ? '≈ ' : ''}{TZ_LABEL[tz]}</Muted>
          </>
        ) : (
          <Muted v="caption">Hora a{'\n'}confirmar</Muted>
        )}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        {showSeries ? <Muted v="caption">{s.name}</Muted> : null}
        <T v="bodyMedium" numberOfLines={open ? 3 : 2}>
          {e.n}
          {e.e ? <Muted> · hasta el {shortDate(e.e)}</Muted> : null}
        </T>
        <Muted v="caption" numberOfLines={open ? 3 : 1} style={{ marginTop: 1 }}>{place}</Muted>
        {open ? (
          <View style={{ marginTop: sp.md, gap: sp.sm }}>
            <View>
              <Muted v="label">Dónde verla</Muted>
              <T v="small">{s.tv.join(' · ')}{s.verifyTv ? '  (verificar señal)' : ''}</T>
            </View>
            {e.x ? <Muted>{e.x}</Muted> : null}
            <View style={{ flexDirection: 'row', gap: sp.xl, marginTop: 2 }}>
              <Pressable onPress={() => Linking.openURL(calendarUrl(e))} hitSlop={8} accessibilityRole="link">
                <T v="smallMedium" color={p.accent}>Agregar al calendario</T>
              </Pressable>
              {showSeries ? (
                <PressLink href={`/categoria/${e.s}`}>
                  <T v="smallMedium" color={p.accent}>Ver categoría ›</T>
                </PressLink>
              ) : null}
            </View>
          </View>
        ) : null}
      </View>
      <StatusDot label={e.st === 'ok' ? '' : 'a confirmar'} tone={e.st === 'ok' ? 'ok' : 'warn'} />
    </Pressable>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: sp.md, paddingHorizontal: sp.lg, paddingVertical: sp.md },
  time: { width: 54, paddingTop: 1 },
});
