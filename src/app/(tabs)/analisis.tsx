import { Linking, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Group, Muted, ScreenHeader, SectionLabel, T } from '@/components/ui';
import { ANALYSIS_TOOLS } from '@/data/analysis';
import { ToolRows } from '@/features/analysis';
import { sp, usePalette } from '@/theme';

const REPOS: { name: string; url: string; use: string }[] = [
  { name: 'br-g/openf1', url: 'https://github.com/br-g/openf1', use: 'API abierta con la telemetría del live timing de F1.' },
  { name: 'theOehrly/Fast-F1', url: 'https://github.com/theOehrly/Fast-F1', use: 'Método de cálculo de distancia, delta y alineación; fuente del trazado de los circuitos.' },
  { name: 'parkermerritt05/raceindycar', url: 'https://github.com/parkermerritt05/raceindycar', use: 'Lee los PDF oficiales de vueltas y tramos de IndyCar.' },
  { name: 'jolpica/jolpica-f1', url: 'https://github.com/jolpica/jolpica-f1', use: 'Resultados e historia de la F1.' },
  { name: 'Ark07Yad/pitwall', url: 'https://github.com/Ark07Yad/pitwall', use: 'Modelo de degradación y Monte Carlo de estrategia: base de nuestro simulador.' },
  { name: 'Malek1414/f1-predictions', url: 'https://github.com/Malek1414/f1-predictions', use: 'Idea de simular la temporada completa miles de veces para estimar el campeón.' },
];

export default function AnalysisHome() {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const tel = ANALYSIS_TOOLS.filter((t) => t.group === 'telemetry');
  const sim = ANALYSIS_TOOLS.filter((t) => t.group === 'simulation');
  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <ScreenHeader title="Análisis" subtitle="Telemetría, cronometraje y simulaciones" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: sp.lg, paddingBottom: insets.bottom + sp.xxl }}>
        <SectionLabel>Simulaciones</SectionLabel>
        <ToolRows tools={sim} />
        <SectionLabel>Telemetría y cronometraje</SectionLabel>
        <ToolRows tools={tel} />
        <Muted v="caption" style={{ marginTop: sp.md }}>
          Solo la F1 publica la telemetría del auto (acelerador, freno, RPM). En las demás categorías lo más detallado es el cronometraje oficial por vuelta, sector y tramo.
        </Muted>

        <SectionLabel>Repositorios que se usan</SectionLabel>
        <Group>
          {REPOS.map((r) => (
            <Pressable key={r.name} onPress={() => Linking.openURL(r.url)} accessibilityRole="link" style={{ paddingHorizontal: sp.lg, paddingVertical: sp.md }}>
              <T v="num" color={p.accent} style={{ fontSize: 13 }}>{r.name} ›</T>
              <Muted v="caption" style={{ marginTop: 2 }}>{r.use}</Muted>
            </Pressable>
          ))}
        </Group>
      </ScrollView>
    </View>
  );
}
