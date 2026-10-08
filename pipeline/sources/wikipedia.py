"""Respaldo con Wikipedia para las categorías sin una fuente oficial accesible.

Se usa solo donde el sitio oficial bloquea las consultas o no publica la tabla en un formato legible
(Fórmula E, WRC, Supercars, Stock Car, Super Formula, DTM, BTCC). En la app se marcan como "Wikipedia".
"""
from __future__ import annotations

import re
import urllib.parse

from common import SeriesData, Table, get

PAGES = {
    'indycar': ('2026 IndyCar Series', [(r'^Driver standings$', 'Pilotos', 'drivers', -1, 'simple', 30), (r'^Engine manufacturer', 'Motoristas', 'teams', -1, 'simple', 5)]),
    'wec': ('2026 FIA World Endurance Championship', [(r'^Hypercar World Endurance Drivers', 'Pilotos Hypercar', 'drivers', -1, 'crew', 40), (r'^Hypercar World Endurance Manufacturers', 'Constructores Hypercar', 'teams', -1, 'simple', 12)]),
    'imsa': ('2026 IMSA SportsCar Championship', [(r'Grand Touring Prototype', 'Pilotos GTP', 'drivers', -2, 'simple', 20)]),
    'cup': ('2026 NASCAR Cup Series', [(r"^Drivers' championship$", 'Pilotos', 'drivers', -2, 'simple', 36), (r"^Manufacturers' championship$", 'Marcas', 'teams', -1, 'simple', 5)]),
    'f2': ('2026 Formula 2 Championship', [(r"^Drivers' Championship standings", 'Pilotos', 'drivers', -1, 'simple', 22), (r"^Teams' Championship standings", 'Equipos', 'teams', -1, 'simple', 12)]),
    'fe': ('2025–26 Formula E World Championship', [(r"^Drivers' Championship$", 'Pilotos 2025-26', 'drivers', -1, 'simple', 22), (r"^Teams' Championship$", 'Equipos 2025-26', 'teams', -1, 'simple', 12)]),
    'wrc': ('2026 World Rally Championship', [(r'for Drivers$', 'Pilotos', 'drivers', -1, 'simple', 15), (r'for Manufacturers$', 'Constructores', 'teams', -1, 'simple', 6)]),
    'sc': ('2026 Supercars Championship', [(r"^Driver'?s'? Championship$", 'Pilotos', 'drivers', -1, 'simple', 26), (r"^Teams' Championship$", 'Equipos', 'teams', -1, 'simple', 16)]),
    'stock': ('2026 Stock Car Pro Series', [(r"^Drivers' Championship$", 'Pilotos', 'drivers', -1, 'team_car', 30), (r'^Teams Championship', 'Equipos', 'teams', -1, 'join', 22), (r'^Manufacturer Championship', 'Marcas', 'teams', -1, 'simple', 5)]),
    'sf': ('2026 Super Formula Championship', [(r"^Drivers' championship$", 'Pilotos', 'drivers', -1, 'simple', 22), (r"^Teams' championship$", 'Equipos', 'teams', -1, 'join', 16)]),
    'dtm': ('2026 Deutsche Tourenwagen Masters', [(r"^Drivers' championship$", 'Pilotos', 'drivers', -1, 'simple', 24), (r"^Teams' championship$", 'Equipos', 'teams', -1, 'join', 12)]),
    'btcc': ('2026 British Touring Car Championship', [(r"^Drivers' Championship$", 'Pilotos', 'drivers', -1, 'simple', 24), (r"^Teams' Championship$", 'Equipos', 'teams', -1, 'simple', 12)]),
}


def raw(title: str) -> str:
    return get('https://en.wikipedia.org/w/index.php?' + urllib.parse.urlencode({'title': title, 'action': 'raw'}))


def links(s: str) -> list[str]:
    return [(b or a).strip() for a, b in re.findall(r'\[\[([^\]|]+)(?:\|([^\]]+))?\]\]', s)]


def cells(row: str) -> list[str]:
    out = []
    for line in row.split('\n'):
        line = line.strip()
        if not line or line.startswith('|+') or line[0] not in '!|':
            continue
        for part in re.split(r'\|\||!!', line[1:]):
            head = part.split('|')[0]
            if '|' in part and '[[' not in head and '{{' not in head:
                part = part.split('|', 1)[1]
            out.append(part.strip())
    return out


def tables(txt: str) -> list[tuple[int, str]]:
    res, i = [], 0
    while (s := txt.find('{|', i)) >= 0:
        depth, j = 0, s
        while j < len(txt):
            if txt.startswith('{|', j):
                depth += 1
                j += 2
            elif txt.startswith('|}', j):
                depth -= 1
                j += 2
                if depth == 0:
                    break
            else:
                j += 1
        res.append((s, txt[s:j]))
        i = j
    return res


def last_heading(txt: str, pos: int) -> str:
    hs = re.findall(r'^(=+)\s*(.+?)\s*\1\s*$', txt[:pos], re.M)
    return hs[-1][1] if hs else ''


def rows_of(table: str, pts_idx: int, maxrows: int) -> list[dict]:
    out = []
    for r in table.split('\n|-')[1:]:
        c = cells(r)
        if len(c) < 3:
            continue
        pos = re.sub(r"<[^>]+>|\{\{[^}]*\}\}|'", '', c[0]).strip()
        if not re.match(r'^\d+$', pos):
            continue
        names = [n for cc in c[1:4] for n in links(cc) if not re.match(r'^\d{4} ', n)]
        if not names:
            continue
        raw = re.sub(r'\{\{[Tt]ooltip\|([^|}]+)[^}]*\}\}', r'\1', c[pts_idx])
        raw = re.sub(r"<ref.*?(</ref>|/>)|<sup.*?</sup>|\{\{.*?\}\}|'", '', raw)
        m = re.search(r'-?\d+(\.\d+)?', raw)
        pts = float(m.group()) if m else None
        if pts is not None and pts == int(pts):
            pts = int(pts)
        out.append({'pos': int(pos), 'names': names, 'points': pts, 'wins': len(re.findall(r'FFFFBF', r, re.I))})
    return out[:maxrows]


def shape(rows: list[dict], mode: str, kind: str) -> list[dict]:
    out: list[dict] = []
    for r in rows:
        n = r['names']
        if mode == 'crew':
            team = n[1] if len(n) > 1 else None
            if out and out[-1]['pos'] == r['pos'] and out[-1].get('team') == team:
                out[-1]['name'] += ' / ' + n[0]
                continue
            d = {'pos': r['pos'], 'name': n[0], 'points': r['points']}
            if team:
                d['team'] = team
        elif mode == 'team_car':
            d = {'pos': r['pos'], 'name': n[0], 'points': r['points']}
            if len(n) > 2:
                d['team'], d['car'] = ' '.join(n[1:-1]), n[-1]
            elif len(n) > 1:
                d['team'] = n[1]
        elif mode == 'join':
            d = {'pos': r['pos'], 'name': ' '.join(n), 'points': r['points']}
        else:
            d = {'pos': r['pos'], 'name': ' / '.join(n), 'points': r['points']}
        if kind == 'drivers' and r['wins']:
            d['wins'] = r['wins']
        out.append(d)
    return out



OFFICIAL_ELSEWHERE = {'indycar', 'wec', 'imsa', 'cup', 'f2'}


def fetch() -> dict[str, SeriesData]:
    result: dict[str, SeriesData] = {}
    for serie, (page, specs) in PAGES.items():
        if serie in OFFICIAL_ELSEWHERE:
            continue
        try:
            txt = raw(page)
        except RuntimeError as e:
            print(f'  ! {serie}: {e}')
            continue
        sd = SeriesData(source='Wikipedia (sin fuente oficial accesible)', official=False, updated='Última edición de Wikipedia',
                        source_url='https://en.wikipedia.org/wiki/' + urllib.parse.quote(page.replace(' ', '_')))
        all_tables = tables(txt)
        for rx, title, kind, pts_idx, mode, maxrows in specs:
            candidates = (t for pos, t in all_tables if re.search(rx, last_heading(txt, pos), re.I) and 'Pos' in t[:3000])
            rows = next((r for r in (shape(rows_of(t, pts_idx, maxrows), mode, kind) for t in candidates) if r), [])
            if rows:
                sd.tables.append(Table(title, kind, rows))
            else:
                print(f'  ! {serie}: no encontré la tabla "{title}"')
        if sd.tables:
            result[serie] = sd
    return result
