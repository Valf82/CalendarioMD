"""Fórmula 2 (fiaformula2.com) y NASCAR (feeds oficiales de nascar.com)."""
from __future__ import annotations

from common import SeriesData, Table, get, json_values, next_flight, row


def formula2() -> dict[str, SeriesData]:
    sd = SeriesData(source='fiaformula2.com (oficial)', source_url='https://www.fiaformula2.com/Standings/Driver',
                    official=True, updated='')
    for path, title, kind in (('Driver', 'Pilotos', 'drivers'), ('Team', 'Equipos', 'teams')):
        blob = next_flight(get(f'https://www.fiaformula2.com/Standings/{path}'))
        data = next((a for a in json_values(blob, 'standings') if a and isinstance(a[0], dict)), [])
        t = Table(title, kind)
        for d in data:
            pos = d.get('displayPosition') or ''
            if not str(pos).isdigit():
                continue
            if kind == 'drivers':
                name = f"{d.get('driverFirstName', '')} {d.get('driverLastName', '')}".strip()
                t.rows.append(row(int(pos), name, d.get('championshipPoints'), team=d.get('teamName')))
            else:
                t.rows.append(row(int(pos), d.get('teamName'), d.get('championshipPoints')))
        sd.tables.append(t)
        if path == 'Driver' and data:
            played = sum(1 for r in data[0].get('points') or [] if r and r[0] is not None)
            sd.updated = f'Tras {played} fechas'
    return {'f2': sd} if any(t.rows for t in sd.tables) else {}


NASCAR = {'cup': 1, 'xfin': 2, 'truckus': 3}


def nascar(year: int = 2026) -> dict[str, SeriesData]:
    out: dict[str, SeriesData] = {}
    for sid, n in NASCAR.items():
        base = f'https://cf.nascar.com/cacher/{year}/{n}/final'
        try:
            drivers = get(f'{base}/{n}-drivers-points.json', accept='application/json')
        except RuntimeError as e:
            print(f'  ! NASCAR {sid}: {e}')
            continue
        sd = SeriesData(source='nascar.com (feed oficial de puntos)', source_url=f'{base}/{n}-drivers-points.json',
                        official=True, updated='Puntos oficiales vigentes')
        t = Table('Pilotos', 'drivers')
        for d in drivers[:45]:
            t.rows.append(row(d['position'], d['driver_name'], d.get('points'),
                              number=d.get('car_no'), car=d.get('manufacturer'), wins=d.get('wins'),
                              poles=d.get('poles'), top5=d.get('top_5'), top10=d.get('top_10'),
                              lapsLed=d.get('laps_led'), starts=d.get('starts'), dnf=d.get('dnf'),
                              playoffRank=d.get('playoff_rank') or None))
        sd.tables.append(t)
        try:
            manuf = get(f'{base}/{n}-manufacturer-points.json', accept='application/json')
            mt = Table('Marcas', 'teams')
            for i, m in enumerate(sorted(manuf, key=lambda x: -(x.get('points') or 0)), 1):
                mt.rows.append(row(m.get('position') or i, m.get('manufacturer') or m.get('manufacturer_name') or '?', m.get('points')))
            sd.tables.append(mt)
        except RuntimeError:
            pass
        out[sid] = sd
    return out
