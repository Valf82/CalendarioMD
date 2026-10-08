import { useColorScheme } from 'react-native';

/**
 * Sistema visual: neutros fríos, un solo acento y una sola familia tipográfica (IBM Plex).
 * El color se reserva para lo que significa algo: el acento marca selección y enlaces,
 * el verde y el ámbar marcan estado, y los colores de equipo aparecen solo en listados de F1.
 */
const light = {
  bg: '#F6F7F9',
  surface: '#FFFFFF',
  raised: '#EEF0F3',
  line: '#E3E6EB',
  ink: '#0E1116',
  ink2: '#3B424D',
  muted: '#6B7380',
  subtle: '#9AA2AE',
  accent: '#D93A2B',
  onAccent: '#FFFFFF',
  ok: '#1B8A57',
  warn: '#B3761A',
};

export type Palette = typeof light;

const dark: Palette = {
  bg: '#0B0C0F',
  surface: '#131519',
  raised: '#1B1E24',
  line: '#242830',
  ink: '#EDEFF2',
  ink2: '#C3C8D0',
  muted: '#8B929E',
  subtle: '#5F6672',
  accent: '#FF6355',
  onAccent: '#FFFFFF',
  ok: '#4CC38A',
  warn: '#E0A93B',
};

export function usePalette(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}

/** Fuentes cargadas (ver `fontAssets`). */
export const F = {
  regular: 'IBMPlexSans_400Regular',
  medium: 'IBMPlexSans_500Medium',
  semi: 'IBMPlexSans_600SemiBold',
  mono: 'IBMPlexMono_500Medium',
  monoSemi: 'IBMPlexMono_600SemiBold',
};

/** Escala tipográfica. Los números alineados en columnas usan `num`. */
export const ty = {
  title: { fontFamily: F.semi, fontSize: 30, lineHeight: 34, letterSpacing: -0.6 },
  h1: { fontFamily: F.semi, fontSize: 22, lineHeight: 28, letterSpacing: -0.3 },
  h2: { fontFamily: F.semi, fontSize: 17, lineHeight: 22, letterSpacing: -0.1 },
  body: { fontFamily: F.regular, fontSize: 15, lineHeight: 21 },
  bodyMedium: { fontFamily: F.medium, fontSize: 15, lineHeight: 21 },
  small: { fontFamily: F.regular, fontSize: 13, lineHeight: 18 },
  smallMedium: { fontFamily: F.medium, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: F.regular, fontSize: 12, lineHeight: 16 },
  label: { fontFamily: F.medium, fontSize: 11, lineHeight: 14, letterSpacing: 0.9, textTransform: 'uppercase' as const },
  num: { fontFamily: F.mono, fontSize: 15, lineHeight: 20 },
  numLarge: { fontFamily: F.monoSemi, fontSize: 26, lineHeight: 30, letterSpacing: -0.5 },
};

/** Espaciado en múltiplos de 4. */
export const sp = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 6, md: 10, lg: 14 };

export const fontAssets = {
  IBMPlexSans_400Regular: require('@expo-google-fonts/ibm-plex-sans/400Regular/IBMPlexSans_400Regular.ttf'),
  IBMPlexSans_500Medium: require('@expo-google-fonts/ibm-plex-sans/500Medium/IBMPlexSans_500Medium.ttf'),
  IBMPlexSans_600SemiBold: require('@expo-google-fonts/ibm-plex-sans/600SemiBold/IBMPlexSans_600SemiBold.ttf'),
  IBMPlexMono_500Medium: require('@expo-google-fonts/ibm-plex-mono/500Medium/IBMPlexMono_500Medium.ttf'),
  IBMPlexMono_600SemiBold: require('@expo-google-fonts/ibm-plex-mono/600SemiBold/IBMPlexMono_600SemiBold.ttf'),
};
