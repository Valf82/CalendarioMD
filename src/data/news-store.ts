import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { useSyncExternalStore } from 'react';

import { DATA_BASE_URL } from '@/config';
import { cachedJson } from '@/lib/storage';

import bundled from './generated/news.json';
import config from './news-sources.json';
import type { NewsFile, NewsItem } from './types';

/**
 * Noticias. Parten de la copia que genera el pipeline y se completan con:
 *  - el JSON publicado en el repositorio de datos (si DATA_BASE_URL está configurada);
 *  - los feeds RSS leídos en vivo desde el celular (en web el navegador los bloquea por CORS).
 * Las fuentes y las reglas de clasificación son las mismas que usa el pipeline (news-sources.json).
 */
interface State {
  items: NewsItem[];
  updatedAt: string;
  loading: boolean;
  /** hubo al menos una fuente en vivo que respondió */
  live: boolean;
}

const CACHE_KEY = 'news:v1';
const rules = config.rules.map((r) => ({ series: r.series, rx: new RegExp(r.pattern, 'i') }));
const dropRx = new RegExp(config.drop, 'i');
const DAY = 86_400_000;

let state: State = { items: prune((bundled as NewsFile).items), updatedAt: (bundled as NewsFile).generatedAt, loading: false, live: false };
const listeners = new Set<() => void>();
let started = false;

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useNews = () => useSyncExternalStore(subscribe, () => state);

function prune(items: NewsItem[]): NewsItem[] {
  const cutoff = Date.now() - config.maxAgeDays * DAY;
  return items.filter((i) => Date.parse(i.published) >= cutoff).slice(0, config.maxItems);
}

function merge(...lists: NewsItem[][]): NewsItem[] {
  const byId = new Map<string, NewsItem>();
  const titles = new Set<string>();
  for (const it of lists.flat().sort((a, b) => b.published.localeCompare(a.published))) {
    const key = it.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    if (byId.has(it.id) || titles.has(key)) continue;
    byId.set(it.id, it);
    titles.add(key);
  }
  return prune([...byId.values()]);
}

// ---------- Lectura de RSS ----------

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”' };

function decode(s: string): string {
  return s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

function text(raw?: string | null): string {
  if (!raw) return '';
  return decode(
    raw
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

const tag = (block: string, name: string) => block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'))?.[1];

function cleanUrl(url: string): string {
  return decode(url.trim())
    .replace(/([?&])utm_[^&]*/g, '$1')
    .replace(/[?&]+$/, '')
    .replace('?&', '?');
}

function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return `n${(h >>> 0).toString(36)}`;
}

export function classify(title: string, cats: string[], summary: string): string[] {
  const t = `${title} ${cats.join(' ')} ${summary.slice(0, 240)}`;
  const found: string[] = [];
  for (const r of rules) if (r.rx.test(t) && !found.includes(r.series)) found.push(r.series);
  if (found.includes('cup') && (found.includes('xfin') || found.includes('truckus'))) found.splice(found.indexOf('cup'), 1);
  return found;
}

interface Feed {
  id: string;
  name: string;
  lang: string;
  url: string;
  series?: string[];
  classify?: boolean;
}

const BAD_IMAGE = /advertis|banner|\/ads?\/|\blogo|pixel|spacer|gravatar|avatar|emoji|icon|sprite|\/feed\/|doubleclick/i;

/** La imagen de la nota: los campos pensados para eso primero; la primera <img> del texto es el último recurso. */
function pickImage(block: string): string | undefined {
  for (const rx of [/<enclosure[^>]*url="([^"]+)"/i, /<media:content[^>]*url="([^"]+)"/i, /<media:thumbnail[^>]*url="([^"]+)"/i]) {
    const u = block.match(rx)?.[1];
    if (u?.startsWith('http') && !BAD_IMAGE.test(u)) return u;
  }
  for (const m of block.matchAll(/<img[^>]*src="([^"]+)"/gi)) {
    if (m[1].startsWith('http') && !BAD_IMAGE.test(m[1]) && /\.(jpe?g|png|webp)(\?|$)/i.test(m[1])) return m[1];
  }
  return undefined;
}

export function parseFeed(feed: Feed, xml: string): NewsItem[] {
  const out: NewsItem[] = [];
  for (const m of xml.matchAll(/<(item|entry)[\s>][\s\S]*?<\/\1>/gi)) {
    const block = m[0];
    const title = text(tag(block, 'title'));
    let link = tag(block, 'link');
    if (!link) link = block.match(/<link[^>]*href="([^"]+)"/i)?.[1];
    link = link ? text(link) : '';
    const published = Date.parse(text(tag(block, 'pubDate') ?? tag(block, 'published') ?? tag(block, 'updated') ?? tag(block, 'dc:date')));
    if (!title || !link || !Number.isFinite(published)) continue;
    const cats = [...block.matchAll(/<category[^>]*>([\s\S]*?)<\/category>/gi)].map((c) => text(c[1]));
    const summary = text(tag(block, 'description') ?? tag(block, 'summary') ?? tag(block, 'content:encoded')).replace(/\s*(Keep reading|Seguir leyendo|Leer más|Read more).*$/i, '');
    if (!feed.series?.length && dropRx.test(`${title} ${cats.join(' ')}`)) continue;
    let series = feed.classify || !feed.series?.length ? classify(title, cats, summary) : [];
    if (!series.length) series = [...(feed.series ?? [])];
    const image = pickImage(block);
    const url = cleanUrl(link);
    out.push({
      id: hash(url),
      title,
      summary: summary.slice(0, 260),
      url,
      source: feed.name,
      lang: feed.lang,
      published: new Date(published).toISOString(),
      image: image?.startsWith('http') ? decode(image) : null,
      series,
    });
  }
  return out;
}

async function fetchFeed(feed: Feed): Promise<NewsItem[]> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 15_000);
  try {
    const res = await fetch(feed.url, { signal: ctl.signal });
    if (!res.ok) return [];
    return parseFeed(feed, await res.text());
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

// ---------- Carga ----------

async function loadCached(): Promise<NewsItem[]> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? ((JSON.parse(raw) as NewsFile).items ?? []) : [];
  } catch {
    return [];
  }
}

/** Actualiza las noticias. Nunca falla: si no hay red, quedan las que ya había. */
export async function refreshNews(force = false): Promise<void> {
  if (state.loading) return;
  set({ loading: true });
  try {
    const sources: NewsItem[][] = [state.items, await loadCached()];
    if (DATA_BASE_URL) {
      try {
        sources.push((await cachedJson<NewsFile>(`${DATA_BASE_URL}/news.json`, force ? 0 : 20 * 60_000, force)).data.items);
      } catch {
        // sin repositorio de datos
      }
    }
    let live = false;
    if (Platform.OS !== 'web') {
      const results = await Promise.all((config.feeds as Feed[]).map(fetchFeed));
      live = results.some((r) => r.length);
      sources.push(...results);
    }
    const items = merge(...sources);
    set({ items, updatedAt: new Date().toISOString(), live });
    AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ generatedAt: state.updatedAt, items })).catch(() => {});
  } finally {
    set({ loading: false });
  }
}

/** Primera carga: usa lo guardado y actualiza una sola vez por sesión. */
export function startNews() {
  if (started) return;
  started = true;
  loadCached().then((cached) => {
    if (cached.length) set({ items: merge(state.items, cached) });
    refreshNews();
  });
}
