import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TechSheetView, VariantList } from '@/components/tech-sheet';
import { Segmented, StateView } from '@/components/ui';
import { SERIES_TECH, TECH_VARIANTS } from '@/data/tech';
import { sp } from '@/theme';

/** Ficha técnica de una categoría: el reglamento general y, si existen, las fichas de cada auto o motor. */
export function TechSection({ serie }: { serie: string }) {
  const insets = useSafeAreaInsets();
  const sheet = SERIES_TECH[serie];
  const variants = TECH_VARIANTS[serie] ?? [];
  const [view, setView] = useState<'rules' | 'cars'>('rules');
  if (!sheet) return <StateView empty="Todavía no hay ficha técnica de esta categoría." />;
  return (
    <ScrollView contentContainerStyle={{ padding: sp.lg, paddingBottom: insets.bottom + sp.xxl }}>
      {variants.length ? (
        <View style={{ marginBottom: sp.lg }}>
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: 'rules', label: 'Reglamento' },
              { value: 'cars', label: `Autos (${variants.length})` },
            ]}
          />
        </View>
      ) : null}
      {view === 'cars' && variants.length ? <VariantList variants={variants} /> : <TechSheetView sheet={sheet} />}
    </ScrollView>
  );
}
