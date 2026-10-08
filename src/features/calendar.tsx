import { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EventRow } from '@/components/event-row';
import { Group, Muted, StateView } from '@/components/ui';
import { EVENTS } from '@/data/events';
import type { TzMode } from '@/lib/time';
import { usePersistentState } from '@/lib/storage';
import { sp } from '@/theme';

const endOf = (e: { d: string; e?: string }) => Date.parse(`${e.e ?? e.d}T23:59:59-12:00`);

/** Las carreras que quedan de una categoría. */
export function CalendarSection({ serie }: { serie: string }) {
  const insets = useSafeAreaInsets();
  const [tz] = usePersistentState<TzMode>('agenda.tz', 'art');
  const [now] = useState(() => Date.now());
  const events = useMemo(() => EVENTS.filter((e) => e.s === serie && endOf(e) >= now).sort((a, b) => a.d.localeCompare(b.d)), [serie, now]);
  if (!events.length) return <StateView empty="Esta categoría no tiene más carreras en la agenda de la temporada." />;
  return (
    <ScrollView contentContainerStyle={{ padding: sp.lg, paddingBottom: insets.bottom + sp.xxl }}>
      <Group>
        {events.map((e) => (
          <EventRow key={`${e.n}-${e.d}`} e={e} tz={tz} showSeries={false} />
        ))}
      </Group>
      <Muted v="caption" style={{ marginTop: sp.md }}>Tocá una carrera para ver dónde verla y agregarla a tu calendario.</Muted>
    </ScrollView>
  );
}
