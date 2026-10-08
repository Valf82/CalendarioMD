import { Pressable } from 'react-native';

import { toggleFavorite, useFavorites } from '@/lib/favorites';
import { usePalette } from '@/theme';

import { T } from './ui';

/** Estrella para marcar una categoría como favorita. */
export function FavoriteButton({ id, size = 20 }: { id: string; size?: number }) {
  const p = usePalette();
  const on = useFavorites().includes(id);
  return (
    <Pressable onPress={() => toggleFavorite(id)} hitSlop={12} accessibilityRole="button" accessibilityLabel={on ? 'Quitar de favoritas' : 'Agregar a favoritas'} accessibilityState={{ selected: on }}>
      <T color={on ? p.accent : p.subtle} style={{ fontSize: size, lineHeight: size + 4 }}>
        {on ? '★' : '☆'}
      </T>
    </Pressable>
  );
}
