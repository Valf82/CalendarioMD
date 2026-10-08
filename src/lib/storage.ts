import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

/** Estado que se guarda en el teléfono (filtros, zona horaria, categoría elegida). */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (raw != null) setValue(JSON.parse(raw) as T);
      })
      .catch(() => {});
  }, [key]);

  const set = useCallback(
    (next: T) => {
      setValue(next);
      AsyncStorage.setItem(key, JSON.stringify(next)).catch(() => {});
    },
    [key],
  );

  return [value, set] as const;
}

/** Una API que no responde no debe dejar la pantalla cargando para siempre. */
const TIMEOUT_MS = 25_000;

interface CacheEntry<T> {
  at: number;
  data: T;
}

/** Cola por servidor: espacia las consultas para respetar los límites de APIs gratuitas. */
const queues = new Map<string, Promise<unknown>>();
const GAP_MS: Record<string, number> = { 'api.openf1.org': 350, 'api.jolpi.ca': 260 };

function hostOf(url: string): string {
  const m = url.match(/^https?:\/\/([^/]+)/);
  return m ? m[1] : '';
}

async function politeFetch(url: string, signal: AbortSignal): Promise<Response> {
  const host = hostOf(url);
  // session_key=latest puede quedar colgado durante una sesión en vivo: va por fuera de la cola
  // para no frenar al resto (lo corta el timeout).
  const gap = url.includes('session_key=latest') ? undefined : GAP_MS[host];
  const run = async () => {
    for (let attempt = 0; ; attempt++) {
      const res = await fetch(url, { signal });
      // 429 = demasiadas consultas: espero y reintento.
      if (res.status !== 429 || attempt >= 3) return res;
      await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
    }
  };
  if (!gap) return run();
  const prev = queues.get(host) ?? Promise.resolve();
  const next = prev.then(run, run);
  queues.set(
    host,
    next.then(
      () => new Promise((r) => setTimeout(r, gap)),
      () => new Promise((r) => setTimeout(r, gap)),
    ),
  );
  return next;
}

/**
 * fetch con caché local: devuelve lo guardado si es más nuevo que `maxAgeMs`,
 * y si la red falla usa la última copia aunque esté vieja.
 */
export async function cachedJson<T>(url: string, maxAgeMs: number, force = false): Promise<{ data: T; at: number; stale: boolean }> {
  const key = `cache:${url}`;
  let cached: CacheEntry<T> | null = null;
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw) cached = JSON.parse(raw) as CacheEntry<T>;
  } catch {}

  if (!force && cached && Date.now() - cached.at < maxAgeMs) {
    return { data: cached.data, at: cached.at, stale: false };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await politeFetch(url, controller.signal);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as T;
    clearTimeout(timer);
    const entry: CacheEntry<T> = { at: Date.now(), data };
    AsyncStorage.setItem(key, JSON.stringify(entry)).catch(() => {});
    return { data, at: entry.at, stale: false };
  } catch (err) {
    clearTimeout(timer);
    if (cached) return { data: cached.data, at: cached.at, stale: true };
    throw err;
  }
}
