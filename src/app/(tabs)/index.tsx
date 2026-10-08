import { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EventRow } from '@/components/event-row';
import { Card, Group, Muted, ScreenHeader, SectionLabel, StatusDot, T, Tabs, TextButton } from '@/components/ui';
import { EVENTS, SEASON_STATUS } from '@/data/events';
import { LEVELS, SERIES, SERIES_LIST } from '@/data/series';
import type { Level, RaceEvent } from '@/data/types';
import { useFavorites } from '@/lib/favorites';
import { usePersistentState } from '@/lib/storage';
import { countdown, dayKey, dayParts, hhmm, longDate, TZ_LABEL, type TzMode } from '@/lib/time';
import { radius, sp, usePalette } from '@/theme';

type Filter = 'all' | 'favs' | Level;
type Row = { type: 'month'; key: string; label: string; count: number } | { type: 'day'; key: string; day: string; events: RaceEvent[] };

const TZ_ORDER: TzMode[] = ['art', 'local', 'utc'];
const TZ_NAME: Record<TzMode, string> = { art: 'Argentina', local: 'Teléfono', utc: 'UTC' };

const startKey = (e: RaceEvent) => (e.u ? Date.parse(e.u) : Date.parse(`${e.d}T15:00:00Z`));
/** Último momento en que el evento puede seguir en curso en algún lugar del mundo. */
const endOf = (e: RaceEvent) => Date.parse(`${e.e ?? e.d}T23:59:59-12:00`);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function AgendaScreen() {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const favs = useFavorites();
  const [filter, setFilter] = usePersistentState<Filter>('agenda.filter', 'all');
  const [serie, setSerie] = usePersistentState<string>('agenda.serie', '');
  const [tz, setTz] = usePersistentState<TzMode>('agenda.tz', 'art');
  const [q, setQ] = useState('');
  const [picker, setPicker] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return EVENTS.filter((e) => {
      const s = SERIES[e.s];
      if (endOf(e) < now) return false;
      if (filter === 'favs' && !favs.includes(e.s)) return false;
      if (filter !== 'all' && filter !== 'favs' && s.level !== filter) return false;
      if (serie && e.s !== serie) return false;
      if (query && !`${s.name} ${e.n} ${e.p} ${e.c} ${e.r}`.toLowerCase().includes(query)) return false;
      return true;
    }).sort((a, b) => startKey(a) - startKey(b));
  }, [filter, serie, q, now, favs]);

  const rows = useMemo<Row[]>(() => {
    const byDay = new Map<string, RaceEvent[]>();
    for (const e of filtered) {
      const d = e.u ? dayKey(new Date(e.u), tz) : e.d;
      byDay.set(d, [...(byDay.get(d) ?? []), e]);
    }
    const days = [...byDay.keys()].sort();
    const out: Row[] = [];
    let month = '';
    for (const d of days) {
      const m = d.slice(0, 7);
      if (m !== month) {
        month = m;
        const count = days.filter((x) => x.startsWith(m)).reduce((n, x) => n + byDay.get(x)!.length, 0);
        out.push({ type: 'month', key: `m-${m}`, label: dayParts(d).month, count });
      }
      out.push({ type: 'day', key: d, day: d, events: byDay.get(d)! });
    }
    return out;
  }, [filtered, tz]);

  const next = useMemo(() => EVENTS.filter((e) => e.u && Date.parse(e.u) > now - 2 * 3_600_000).sort((a, b) => Date.parse(a.u!) - Date.parse(b.u!))[0], [now]);
  const today = dayKey(new Date(now), tz);
  const todayParts = dayParts(today);

  const header = (
    <View>
      <ScreenHeader title="Agenda" subtitle={`${cap(todayParts.weekdayLong)} ${todayParts.day} de ${todayParts.month}`} />

      {next ? (
        <View style={{ paddingHorizontal: sp.lg, marginTop: sp.sm }}>
          <Card style={{ padding: sp.lg }}>
            <Muted v="label">Próxima largada</Muted>
            <T v="h1" style={{ marginTop: sp.xs }} numberOfLines={2}>
              {next.n}
            </T>
            <Muted style={{ marginTop: 2 }}>
              {SERIES[next.s].name} · {[next.c, next.r].filter(Boolean).join(', ')}
            </Muted>
            <View style={st.nextBottom}>
              <T v="numLarge">{countdown(Date.parse(next.u!) - now)}</T>
              <View style={{ alignItems: 'flex-end' }}>
                <T v="smallMedium">{cap(longDate(next.u!, tz))}</T>
                <Muted v="caption">
                  {hhmm(next.u!, tz)} · {TZ_LABEL[tz]}
                </Muted>
              </View>
            </View>
          </Card>
        </View>
      ) : null}

      <View style={{ marginTop: sp.lg }}>
        <Tabs
          value={filter}
          onChange={setFilter}
          items={[
            { value: 'all', label: 'Todas' },
            { value: 'favs', label: 'Favoritas', badge: favs.length ? String(favs.length) : undefined },
            ...(Object.keys(LEVELS) as Level[]).map((l) => ({ value: l, label: LEVELS[l] })),
          ]}
        />
      </View>

      <View style={st.controls}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Buscar circuito, ciudad, categoría"
          placeholderTextColor={p.subtle}
          style={[st.search, { backgroundColor: p.raised, color: p.ink }]}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        <View style={{ flexDirection: 'row', gap: sp.lg, marginTop: sp.md }}>
          <StatusDot label="confirmada" tone="ok" />
          <StatusDot label="a confirmar" tone="warn" />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: sp.md }}>
          <TextButton label={serie ? `Categoría: ${SERIES[serie].name}  ✕` : 'Categoría: todas'} active={!!serie} onPress={() => (serie ? setSerie('') : setPicker(true))} />
          <TextButton label={`Hora: ${TZ_NAME[tz]}`} onPress={() => setTz(TZ_ORDER[(TZ_ORDER.indexOf(tz) + 1) % TZ_ORDER.length])} />
        </View>
      </View>
    </View>
  );

  const footer = (
    <View style={{ paddingHorizontal: sp.lg, paddingBottom: insets.bottom + sp.xxl }}>
      <SectionLabel>Estado de las temporadas</SectionLabel>
      <Group>
        {SEASON_STATUS.map(([t, d]) => (
          <View key={t} style={{ paddingHorizontal: sp.lg, paddingVertical: sp.md }}>
            <T v="smallMedium">{t}</T>
            <Muted v="caption" style={{ marginTop: 2 }}>{d}</Muted>
          </View>
        ))}
      </Group>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <FlatList
        data={rows}
        keyExtractor={(r) => r.key}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        ListEmptyComponent={
          <Muted style={{ textAlign: 'center', padding: sp.xxl }}>
            {filter === 'favs' && !favs.length ? 'Todavía no marcaste categorías favoritas. Hacelo desde la pestaña Categorías.' : 'No hay carreras con estos filtros.'}
          </Muted>
        }
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) =>
          item.type === 'month' ? (
            <View style={st.monthRow}>
              <T v="h1">{cap(item.label)}</T>
              <Muted>{item.count} {item.count === 1 ? 'carrera' : 'carreras'}</Muted>
            </View>
          ) : (
            <DayBlock day={item.day} events={item.events} tz={tz} isToday={item.day === today} />
          )
        }
      />

      <Modal visible={picker} animationType="slide" transparent onRequestClose={() => setPicker(false)}>
        <Pressable style={st.backdrop} onPress={() => setPicker(false)} />
        <View style={[st.sheet, { backgroundColor: p.surface, paddingBottom: insets.bottom + sp.lg }]}>
          <View style={[st.handle, { backgroundColor: p.line }]} />
          <T v="h2" style={{ marginBottom: sp.sm }}>Elegí una categoría</T>
          <ScrollView>
            {(Object.keys(LEVELS) as Level[]).map((l) => (
              <View key={l}>
                <SectionLabel>{LEVELS[l]}</SectionLabel>
                {SERIES_LIST.filter((s) => s.level === l && EVENTS.some((e) => e.s === s.id && endOf(e) >= now)).map((s) => (
                  <Pressable
                    key={s.id}
                    onPress={() => {
                      setSerie(s.id);
                      setPicker(false);
                    }}
                    style={[st.option, { borderBottomColor: p.line }]}>
                    <T>{s.name}</T>
                  </Pressable>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function DayBlock({ day, events, tz, isToday }: { day: string; events: RaceEvent[]; tz: TzMode; isToday: boolean }) {
  const p = usePalette();
  const parts = dayParts(day);
  return (
    <View style={{ paddingHorizontal: sp.lg, marginTop: sp.md }}>
      <View style={st.dayHead}>
        <T v="smallMedium" color={isToday ? p.accent : p.ink}>
          {cap(parts.weekdayLong)} {parts.day}
        </T>
        {isToday ? <T v="caption" color={p.accent}>Hoy</T> : null}
      </View>
      <Group>
        {events.map((e) => (
          <EventRow key={`${e.s}-${e.n}-${e.d}`} e={e} tz={tz} />
        ))}
      </Group>
    </View>
  );
}

const st = StyleSheet.create({
  nextBottom: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: sp.lg },
  controls: { paddingHorizontal: sp.lg, paddingTop: sp.md },
  search: { borderRadius: radius.md, paddingHorizontal: sp.md, paddingVertical: 10, fontSize: 15 },
  monthRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: sp.lg, marginTop: sp.xl },
  dayHead: { flexDirection: 'row', alignItems: 'baseline', gap: sp.sm, marginBottom: sp.xs, paddingHorizontal: 2 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { maxHeight: '75%', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: sp.lg, paddingTop: sp.sm },
  handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, marginBottom: sp.md },
  option: { paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth },
});
