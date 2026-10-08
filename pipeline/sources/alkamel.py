"""Cronometraje oficial Al Kamel: FIA WEC e IMSA.

- Campeonato: los PDF oficiales de puntos que publica el cronometrador tras cada carrera.
- Telemetría: el CSV "Analysis" / "Time Cards" de la carrera, con cada vuelta de cada auto
  (tiempo, 3 sectores, velocidad promedio y punta, piloto, paso por boxes y bandera).
"""
from __future__ import annotations

import csv
import io
import re
import urllib.parse

from common import SeriesData, Table, get, num, pdf_lines, row, title_name

# Posición, nombre (sin dígitos, salvo un '#nn' de auto al principio) y puntos totales.
LINE = re.compile(r'^\s*(\d+)\s+((?:#\d+\s+)?[^\d]+?)\s+(\d+(?:\.\d+)?)(?:\s|$)')

SERIES = {
    'wec': {
        'name': 'FIA WEC',
        'home': 'https://fiawec.alkamelsystems.com/',
        'analysis': r'_Race/.*23_Analysis_Race[^/]*\.CSV$',
    },
    'imsa': {
        'name': 'IMSA WeatherTech',
        'home': 'https://imsa.results.alkamelcloud.com/',
        'analysis': r'_Race/.*23_Time Cards_Race[^/]*\.CSV$',
    },
}


def _links(home: str) -> list[str]:
    page = get(home)
    found = re.findall(r"""(Results/[^"'<>]+?\.(?:pdf|PDF|csv|CSV|json|JSON))""", page)
    return sorted({urllib.parse.unquote(x) for x in found})


def _url(home: str, path: str) -> str:
    return home + urllib.parse.quote(path)


def _hour(path: str) -> int:
    m = re.search(r'/(\d+)_Hour \d+/', path)
    return int(m.group(1)) if m else 0


def _parse_points(lines: list[tuple[int, str]]) -> dict[str, list[tuple[int, str, float]]]:
    """Agrupa las filas por título de página ('GTP Drivers', 'Hypercar ... Drivers', etc.)."""
    by_title: dict[str, list[tuple[int, str, float]]] = {}
    page_title: dict[int, str] = {}
    for page, line in lines:
        if page not in page_title:
            page_title[page] = ' '.join(line.split())
        m = LINE.match(line)
        if m and not re.search(r'Pos\s+Driver', line):
            by_title.setdefault(page_title[page], []).append((int(m.group(1)), m.group(2).strip(), float(m.group(3))))
    return by_title


def _crews(rows: list[tuple[int, str, float]], teams: dict[str, str]) -> list[dict]:
    """En resistencia los pilotos de un mismo auto empatan: los junto en una fila."""
    out: list[dict] = []
    for pos, name, pts in rows:
        name = title_name(name)
        team = teams.get(name.lower())
        if out and out[-1]['pos'] == pos and out[-1]['points'] == pts:
            out[-1]['name'] += ' / ' + name
            continue
        out.append(row(pos, name, pts, team=team))
    return out


def _seconds(t: str) -> float | None:
    t = (t or '').strip()
    if not t:
        return None
    parts = t.split(':')
    try:
        s = float(parts[-1])
        if len(parts) >= 2:
            s += int(parts[-2]) * 60
        if len(parts) == 3:
            s += int(parts[0]) * 3600
        return round(s, 3)
    except ValueError:
        return None


def _telemetry(csv_text: str, event: str) -> dict:
    reader = csv.DictReader(io.StringIO(csv_text.lstrip('﻿')), delimiter=';')
    cars: dict[str, dict] = {}
    for r in reader:
        r = {k.strip(): (v or '').strip() for k, v in r.items() if k}
        n = r.get('NUMBER', '') or '?'
        car = cars.setdefault(n, {
            'number': n, 'team': r.get('TEAM'), 'manufacturer': r.get('MANUFACTURER'),
            'class': r.get('CLASS'), 'drivers': [], 'laps': [],
        })
        driver = title_name(r.get('DRIVER_NAME', ''))
        if driver and driver not in car['drivers']:
            car['drivers'].append(driver)
        lap = _seconds(r.get('LAP_TIME', ''))
        if lap is None:
            continue
        pit = 1 if r.get('CROSSING_FINISH_LINE_IN_PIT') or r.get('PIT_TIME') else 0
        # [vuelta, tiempo, s1, s2, s3, km/h prom, punta, índice de piloto, boxes, bandera]
        car['laps'].append([
            int(r.get('LAP_NUMBER') or 0), lap,
            _seconds(r.get('S1', '')), _seconds(r.get('S2', '')), _seconds(r.get('S3', '')),
            num(r.get('KPH')), num(r.get('TOP_SPEED')),
            car['drivers'].index(driver) if driver in car['drivers'] else 0,
            pit, r.get('FLAG_AT_FL') or '',
        ])
    return {
        'event': event,
        'fields': ['lap', 'time', 's1', 's2', 's3', 'kph', 'top', 'driver', 'pit', 'flag'],
        'cars': sorted(cars.values(), key=lambda c: (c['class'] or '', int(c['number']) if c['number'].isdigit() else 999)),
    }


def fetch() -> tuple[dict[str, SeriesData], dict[str, dict]]:
    standings: dict[str, SeriesData] = {}
    telemetry: dict[str, dict] = {}
    for sid, cfg in SERIES.items():
        home = cfg['home']
        try:
            links = _links(home)
        except RuntimeError as e:
            print(f'  ! {sid}: {e}')
            continue
        event_m = re.search(r'Results/[^/]+/\d+_([^/]+)/', links[0]) if links else None
        event = event_m.group(1).title() if event_m else ''

        # Telemetría: el CSV de la última hora de carrera.
        analysis = [p for p in links if re.search(cfg['analysis'], p)]
        teams: dict[str, str] = {}
        if analysis:
            best = max(analysis, key=lambda p: (_hour(p), 'Final' in p))
            tel = _telemetry(get(_url(home, best), binary=True).decode('utf-8-sig', errors='replace'), event)
            telemetry[sid] = tel
            for c in tel['cars']:
                for d in c['drivers']:
                    teams[d.lower()] = c['team']

        # Campeonato: PDF de puntos.
        pdfs = [p for p in links if re.search(r'Championship', p, re.I) and p.lower().endswith('.pdf')]
        sd = SeriesData(source='Al Kamel Systems, cronometraje oficial', source_url=home, official=True,
                        updated=f'Tras {event}' if event else '')
        if sid == 'wec':
            for key, title, kind in (('Hypercar_World_Endurance_Drivers', 'Pilotos Hypercar', 'drivers'),
                                     ('Hypercar_World_Endurance_Manufacturers', 'Constructores Hypercar', 'teams'),
                                     ('LMGT3_Drivers', 'Pilotos LMGT3', 'drivers'),
                                     ('LMGT3_Teams', 'Equipos LMGT3', 'teams')):
                pdf = next((p for p in pdfs if key in p), None)
                if not pdf:
                    continue
                groups = _parse_points(pdf_lines(get(_url(home, pdf), binary=True)))
                rows = [r for g in groups.values() for r in g]
                t = Table(title, kind)
                t.rows = _crews(rows, teams) if kind == 'drivers' else [row(p, n, pts) for p, n, pts in rows]
                sd.tables.append(t)
        else:
            pdf = next((p for p in pdfs if re.search(r'/00_Championship Points', p)), None)
            if pdf:
                groups = _parse_points(pdf_lines(get(_url(home, pdf), binary=True)))
                # Las páginas de equipos tienen texto superpuesto en el PDF: se usan solo pilotos y marcas.
                order = ['GTP Drivers', 'GTP Manufacturers', 'LMP2 Drivers',
                         'GTDPRO Drivers', 'GTDPRO Manufacturers', 'GTD Drivers', 'GTD Manufacturers']
                for want in order:
                    rows = [r for title, g in groups.items() if title.endswith(want) for r in g]
                    if not rows:
                        continue
                    cls, what = want.split(' ')
                    cls = {'GTDPRO': 'GTD Pro'}.get(cls, cls)
                    kind = 'drivers' if what == 'Drivers' else 'teams'
                    label = {'Drivers': 'Pilotos', 'Teams': 'Equipos', 'Manufacturers': 'Marcas'}[what]
                    t = Table(f'{label} {cls}', kind)
                    t.rows = _crews(rows, teams) if kind == 'drivers' else [row(p, n, pts) for p, n, pts in rows]
                    sd.tables.append(t)
                if 'Provisional' in pdf:
                    sd.note = 'Puntos provisionales: pueden cambiar hasta que el resultado sea oficial.'
        if sd.tables:
            standings[sid] = sd
    return standings, telemetry
