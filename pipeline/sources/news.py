"""Noticias de automovilismo desde feeds RSS públicos.

Las fuentes y las reglas de clasificación por categoría están en src/data/news-sources.json,
el mismo archivo que usa la app para actualizar las noticias en vivo desde el celular.
"""
from __future__ import annotations

import concurrent.futures as cf
import hashlib
import html
import json
import re
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

from common import get

CONFIG = json.loads((Path(__file__).resolve().parents[2] / 'src' / 'data' / 'news-sources.json').read_text(encoding='utf8'))
RULES = [(r['series'], re.compile(r['pattern'], re.I)) for r in CONFIG['rules']]
DROP = re.compile(CONFIG['drop'], re.I)

ITEM = re.compile(r'<(item|entry)[\s>].*?</\1>', re.S | re.I)


def _tag(block: str, name: str) -> str | None:
    m = re.search(rf'<{name}(?:\s[^>]*)?>(.*?)</{name}>', block, re.S | re.I)
    return m.group(1) if m else None


def _text(raw: str | None) -> str:
    if not raw:
        return ''
    raw = re.sub(r'<!\[CDATA\[(.*?)\]\]>', r'\1', raw, flags=re.S)
    raw = re.sub(r'<(script|style).*?</\1>', '', raw, flags=re.S | re.I)
    raw = re.sub(r'<[^>]+>', ' ', raw)
    return re.sub(r'\s+', ' ', html.unescape(raw)).strip()


def _clean_url(url: str) -> str:
    url = html.unescape(url.strip())
    url = re.sub(r'([?&])utm_[^&]*', r'\1', url)
    url = re.sub(r'[?&]+$', '', url).replace('?&', '?')
    return url


BAD_IMAGE = re.compile(r'advertis|banner|/ads?/|\blogo|pixel|spacer|gravatar|avatar|emoji|icon|sprite|/feed/|doubleclick', re.I)


def _image(block: str) -> str | None:
    # Primero los campos pensados para la imagen de la nota; la primera <img> del texto es el último recurso.
    for pat in (r'<enclosure[^>]*url="([^"]+)"', r'<media:content[^>]*url="([^"]+)"', r'<media:thumbnail[^>]*url="([^"]+)"'):
        m = re.search(pat, block, re.I)
        if m and m.group(1).startswith('http') and not BAD_IMAGE.search(m.group(1)):
            return html.unescape(m.group(1))
    for m in re.finditer(r'<img[^>]*src="([^"]+)"', block, re.I):
        url = m.group(1)
        if url.startswith('http') and not BAD_IMAGE.search(url) and re.search(r'\.(jpe?g|png|webp)(\?|$)', url, re.I):
            return html.unescape(url)
    return None


def _date(raw: str | None) -> datetime | None:
    if not raw:
        return None
    raw = _text(raw)
    try:
        d = parsedate_to_datetime(raw)
    except (TypeError, ValueError):
        try:
            d = datetime.fromisoformat(raw.replace('Z', '+00:00'))
        except ValueError:
            return None
    return d if d.tzinfo else d.replace(tzinfo=timezone.utc)


def classify(title: str, cats: list[str], summary: str) -> list[str]:
    text = f"{title} {' '.join(cats)} {summary[:240]}"
    found: list[str] = []
    for series, rx in RULES:
        if rx.search(text) and series not in found:
            found.append(series)
    # Si es una carrera de NASCAR de otra división, no es de la Cup.
    if 'cup' in found and ('xfin' in found or 'truckus' in found):
        found.remove('cup')
    return found


def parse_feed(feed: dict, xml: str) -> list[dict]:
    out = []
    for m in ITEM.finditer(xml):
        block = m.group(0)
        title = _text(_tag(block, 'title'))
        link = _tag(block, 'link')
        if link is None:  # Atom: <link href="..."/>
            lm = re.search(r'<link[^>]*href="([^"]+)"', block)
            link = lm.group(1) if lm else None
        link = _text(link) if link and '<' not in link[:3] else (link or '')
        if not title or not link:
            continue
        cats = [_text(c) for c in re.findall(r'<category[^>]*>(.*?)</category>', block, re.S | re.I)]
        summary = _text(_tag(block, 'description') or _tag(block, 'summary') or _tag(block, 'content:encoded'))
        summary = re.sub(r'\s*(Keep reading|Seguir leyendo|Leer más|Read more).*$', '', summary, flags=re.I)
        published = _date(_tag(block, 'pubDate') or _tag(block, 'published') or _tag(block, 'updated') or _tag(block, 'dc:date'))
        if not published:
            continue
        if DROP.search(f'{title} {" ".join(cats)}') and not feed.get('series'):
            continue
        series = classify(title, cats, summary) if feed.get('classify') or not feed.get('series') else []
        series = series or list(feed.get('series') or [])
        url = _clean_url(link)
        out.append({
            'id': hashlib.sha1(url.encode()).hexdigest()[:12],
            'title': title,
            'summary': summary[:260],
            'url': url,
            'source': feed['name'],
            'lang': feed['lang'],
            'published': published.astimezone(timezone.utc).isoformat(timespec='seconds'),
            'image': _image(block),
            'series': series,
        })
    return out


def _norm(title: str) -> str:
    return re.sub(r'[^a-z0-9]+', ' ', title.lower()).strip()


def fetch() -> dict:
    def load(feed):
        try:
            return feed, get(feed['url'], timeout=30, retries=2)
        except RuntimeError as e:
            print(f"  ! noticias {feed['id']}: {e}")
            return feed, None

    with cf.ThreadPoolExecutor(max_workers=6) as pool:
        loaded = list(pool.map(load, CONFIG['feeds']))

    items: dict[str, dict] = {}
    seen_titles: set[str] = set()
    for feed, xml in loaded:
        if not xml:
            continue
        for it in parse_feed(feed, xml):
            key = _norm(it['title'])
            if it['id'] in items or key in seen_titles:
                continue
            seen_titles.add(key)
            items[it['id']] = it
    cutoff = datetime.now(timezone.utc) - timedelta(days=CONFIG['maxAgeDays'])
    ordered = sorted((i for i in items.values() if i['published'] >= cutoff.isoformat()), key=lambda i: i['published'], reverse=True)
    return {'generatedAt': datetime.now(timezone.utc).isoformat(timespec='seconds'), 'items': ordered[: CONFIG['maxItems']]}
