import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

/** Categorías favoritas: compartidas entre pantallas y guardadas en el teléfono. */
const KEY = 'favorites:v1';
let favs: string[] = [];
const listeners = new Set<() => void>();

AsyncStorage.getItem(KEY)
  .then((raw) => {
    if (raw) {
      favs = JSON.parse(raw) as string[];
      listeners.forEach((l) => l());
    }
  })
  .catch(() => {});

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useFavorites = () => useSyncExternalStore(subscribe, () => favs);

export function toggleFavorite(id: string) {
  favs = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id];
  listeners.forEach((l) => l());
  AsyncStorage.setItem(KEY, JSON.stringify(favs)).catch(() => {});
}
