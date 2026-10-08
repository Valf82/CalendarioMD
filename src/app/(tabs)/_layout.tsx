import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { usePalette } from '@/theme';

export default function TabsLayout() {
  const p = usePalette();
  return (
    <NativeTabs backgroundColor={p.surface} indicatorColor={p.raised} tintColor={p.accent} labelStyle={{ selected: { color: p.ink } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Agenda</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_month" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="noticias">
        <NativeTabs.Trigger.Label>Noticias</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="newspaper" md="newspaper" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="categorias">
        <NativeTabs.Trigger.Label>Categorías</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="flag.checkered" md="flag" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="analisis">
        <NativeTabs.Trigger.Label>Análisis</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="chart.xyaxis.line" md="monitoring" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
