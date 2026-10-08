import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { startNews } from '@/data/news-store';
import { refreshStandings } from '@/data/standings-store';
import { F, fontAssets, usePalette } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const scheme = useColorScheme();
  const p = usePalette();
  const [loaded, error] = useFonts(fontAssets);

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  // Posiciones y noticias: datos del repositorio (si está configurado) y feeds en vivo.
  useEffect(() => {
    refreshStandings();
    startNews();
  }, []);

  if (!loaded && !error) return null;

  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = {
    ...base,
    colors: { ...base.colors, background: p.bg, card: p.bg, text: p.ink, border: p.line, primary: p.accent },
  };

  return (
    <ThemeProvider value={theme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: p.bg },
          headerTintColor: p.ink,
          headerTitleStyle: { fontFamily: F.semi, fontSize: 17 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: p.bg },
          headerBackTitle: 'Volver',
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="categoria/[id]" options={{ title: '' }} />
        <Stack.Screen name="piloto/[serie]/[id]" options={{ title: 'Piloto' }} />
        <Stack.Screen name="equipo/[serie]/[id]" options={{ title: 'Equipo' }} />
        <Stack.Screen name="telemetria/f1" options={{ title: 'Telemetría F1' }} />
        <Stack.Screen name="telemetria/nascar" options={{ title: 'Telemetría NASCAR' }} />
        <Stack.Screen name="telemetria/[serie]" options={{ title: 'Cronometraje' }} />
        <Stack.Screen name="analisis/campeonato" options={{ title: 'Probabilidades de título' }} />
        <Stack.Screen name="analisis/estrategia" options={{ title: 'Simulador de estrategia' }} />
      </Stack>
    </ThemeProvider>
  );
}
