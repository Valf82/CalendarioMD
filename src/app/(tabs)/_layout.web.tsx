import Tabs from 'expo-router/js-tabs';

import { F, usePalette } from '@/theme';

/** Las pestañas nativas no existen en web: esta versión solo sirve para previsualizar en el navegador. */
export default function TabsLayoutWeb() {
  const p = usePalette();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: p.accent,
        tabBarInactiveTintColor: p.muted,
        tabBarStyle: { backgroundColor: p.surface, borderTopColor: p.line },
        tabBarLabelStyle: { fontFamily: F.medium, fontSize: 12 },
        tabBarIconStyle: { display: 'none' },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Agenda' }} />
      <Tabs.Screen name="noticias" options={{ title: 'Noticias' }} />
      <Tabs.Screen name="categorias" options={{ title: 'Categorías' }} />
      <Tabs.Screen name="analisis" options={{ title: 'Análisis' }} />
    </Tabs>
  );
}
