import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Group, Muted, Row, SectionLabel, StateView, Tag } from '@/components/ui';
import { ANALYSIS_TOOLS, toolsFor, type AnalysisTool } from '@/data/analysis';
import { sp } from '@/theme';

export function ToolRows({ tools }: { tools: AnalysisTool[] }) {
  return (
    <Group>
      {tools.map((t) => (
        <Row key={t.id} title={t.title} subtitle={t.description} href={t.href} subtitleLines={5} trailing={<Tag label={t.live ? 'En vivo' : 'Última carrera'} tone={t.live ? 'ok' : 'muted'} />} />
      ))}
    </Group>
  );
}

/** Herramientas de análisis de una categoría. */
export function AnalysisSection({ serie }: { serie: string }) {
  const insets = useSafeAreaInsets();
  const tools = toolsFor(serie);
  if (!tools.length) return <StateView empty="Esta categoría no publica datos suficientes para análisis." />;
  const telemetry = tools.filter((t) => t.group === 'telemetry');
  const sims = tools.filter((t) => t.group === 'simulation');
  return (
    <ScrollView contentContainerStyle={{ padding: sp.lg, paddingBottom: insets.bottom + sp.xxl }}>
      {telemetry.length ? (
        <>
          <SectionLabel style={{ marginTop: 0 }}>Telemetría y cronometraje</SectionLabel>
          <ToolRows tools={telemetry} />
        </>
      ) : null}
      {sims.length ? (
        <>
          <SectionLabel>Simulaciones</SectionLabel>
          <ToolRows tools={sims} />
        </>
      ) : null}
      <Muted v="caption" style={{ marginTop: sp.md }}>{ANALYSIS_TOOLS.length} herramientas en total; ver la pestaña Análisis.</Muted>
    </ScrollView>
  );
}
