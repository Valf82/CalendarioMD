"""IndyCar desde la API oficial de indycar.com (la misma que usa el sitio).

- Campeonato: suma de los puntos oficiales (PointsEarned) de todas las sesiones con puntaje
  de la temporada (carreras y clasificaciones). Coincide con la tabla oficial.
- Vueltas: con raceindycar (github.com/parkermerritt05/raceindycar), que lee los PDF oficiales
  de lap chart y sectores. Es lento, así que solo se procesa la última carrera.
"""
from __future__ import annotations

import concurrent.futures as cf
import re

from common import SeriesData, Table, get, row

BASE = 'https://www.indycar.com/api/results'
SERIES_GUID = 'b856a4f1-e85c-4fac-8c36-fd58d962227a'
SKIP = re.compile(r'practice|warm|test|carb', re.I)


def _api(path: str, **params) -> dict | list:
    q = '&'.join(f'{k}={v}' for k, v in params.items())
    return get(f'{BASE}/{path}?{q}', accept='application/json, text/javascript, */*; q=0.01')


def _season(year: int = 2026) -> dict:
    seasons = _api('SeasonDropDown', id=SERIES_GUID)
    return next(s for s in seasons if str(s.get('Year')) == str(year))


def fetch(year: int = 2026) -> tuple[dict[str, SeriesData], dict]:
    season = _season(year)
    sessions = [(ev, s) for ev in season['Events'] for s in ev['Sessions'] if not SKIP.search(s['SessionName'])]

    def load(item):
        ev, s = item
        return ev, s, _api('EventsSessionDetails', id=s['EventsSessionID'])

    with cf.ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(load, sessions))

    points: dict[str, float] = {}
    info: dict[str, dict] = {}
    wins: dict[str, int] = {}
    poles: dict[str, int] = {}
    led: dict[str, int] = {}
    last_race = None
    for ev, s, d in results:
        records = d.get('records') or []
        is_race = s['SessionName'].strip().lower() == 'race'
        for r in records:
            name = r.get('DriverName') or f"{r.get('FirstName','')} {r.get('LastName','')}".strip()
            info[name] = {'number': str(r.get('CarNumber') or ''), 'team': r.get('TeamName')}
            points[name] = points.get(name, 0) + (r.get('PointsEarned') or 0)
            if is_race:
                if str(r.get('PositionFinish')) == '1':
                    wins[name] = wins.get(name, 0) + 1
                if str(r.get('PositionStart')) == '1':
                    poles[name] = poles.get(name, 0) + 1
                led[name] = led.get(name, 0) + int(r.get('LapsLed') or 0)
        if is_race and records and (last_race is None or _date(d) > _date(last_race[2])):
            last_race = (ev, s, d)

    standings = Table('Pilotos', 'drivers')
    ordered = sorted(points.items(), key=lambda kv: -kv[1])
    for i, (name, pts) in enumerate(ordered, 1):
        if pts <= 0:
            continue
        standings.rows.append(row(i, name, pts, number=info[name]['number'], team=info[name]['team'],
                                  wins=wins.get(name), poles=poles.get(name), lapsLed=led.get(name)))

    sd = SeriesData(source='indycar.com (API oficial de resultados)', source_url='https://www.indycar.com/Standings',
                    official=True, updated='', tables=[standings])
    race_json = {}
    if last_race:
        ev, s, d = last_race
        sd.updated = f"Tras {d.get('EventName')} ({d.get('SessionDate')})"
        t = Table(f"Última carrera · {d.get('EventName')}", 'drivers')
        for r in sorted(d['records'], key=lambda r: int(r.get('PositionFinish') or 99)):
            t.rows.append(row(int(r.get('PositionFinish') or 0), r.get('DriverName'), r.get('PointsEarned') or 0,
                              number=str(r.get('CarNumber') or ''), team=r.get('TeamName'),
                              grid=r.get('PositionStart'), status=r.get('Status'), lapsLed=r.get('LapsLed'),
                              bestLap=r.get('BestLapTime'), pitStops=r.get('PitStops')))
        sd.tables.append(t)
        race_json = {'eventId': ev['EventID'], 'sessionId': s['EventsSessionID'], 'event': d.get('EventName'),
                     'date': d.get('SessionDate')}
    return {'indycar': sd}, race_json


def _date(d: dict) -> str:
    m = re.match(r'(\d+)/(\d+)/(\d+)', d.get('SessionDate') or '')
    return f'{m.group(3)}-{int(m.group(1)):02d}-{int(m.group(2)):02d}' if m else ''


def laps(race: dict, cache_dir: str) -> dict | None:
    """Vueltas de la última carrera con raceindycar. Devuelve el mismo formato que Al Kamel."""
    try:
        import raceindycar as ri
    except ImportError:
        return None
    ri.enable_cache(cache_dir)
    ev = ri.get_event(2026, race['eventId'])
    session = ev.get_session('R')
    session.load(laps=True)
    df = session.laps
    if df is None or df.empty:
        return None
    # Tramos del circuito medidos por los lazos de cronometraje (curvas y rectas), sin los de la calle de boxes.
    base = {'Driver', 'DriverNumber', 'LapNumber', 'Position', 'LapSpeed', 'LapTime', 'OnPitRoad', 'Team'}
    pit_lane = re.compile(r'PI|PO|S/F|SF to|FS -', re.I)
    segments = [c for c in df.columns if c not in base and not pit_lane.search(c) and df[c].notna().mean() > 0.5]
    labels = [re.sub(r'^T/S\s*', '', c) for c in segments]
    cars: dict[str, dict] = {}
    for _, r in df.sort_values(['DriverNumber', 'LapNumber']).iterrows():
        n = str(r['DriverNumber'])
        car = cars.setdefault(n, {'number': n, 'team': r.get('Team'), 'manufacturer': None, 'class': 'IndyCar',
                                  'drivers': [r.get('Driver')], 'laps': []})
        t = r.get('LapTime')
        if t != t or t is None:  # NaN
            continue
        pit = 1 if str(r.get('OnPitRoad')).strip().lower() in {'1', 'true', 'yes'} else 0
        speed_mph = r.get('LapSpeed')
        kph = round(float(speed_mph) * 1.609344, 1) if speed_mph == speed_mph and speed_mph is not None else None
        pos = r.get('Position')
        seg = [round(float(r[c]), 4) if r[c] == r[c] else None for c in segments]
        car['laps'].append([int(r['LapNumber']), round(float(t), 3), None, None, None, kph, None, 0, pit,
                            int(pos) if pos == pos and pos is not None else None, seg])
    return {
        'event': race.get('event'),
        'fields': ['lap', 'time', 's1', 's2', 's3', 'kph', 'top', 'driver', 'pit', 'pos', 'segments'],
        'segments': labels,
        'cars': list(cars.values()),
    }
