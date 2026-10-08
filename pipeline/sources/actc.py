"""ACTC (actc.org.ar, sitio oficial): Turismo Carretera, TC Pista, TC Mouras y TC Pista Mouras.

Las páginas /<cat>/campeonato y /<cat>/copa son Next.js y traen la tabla completa embebida
(pilotos, número, foto, puntos por fecha). La marca viene solo como logo: se deduce con pilotos
de marca conocida.
"""
from __future__ import annotations

from common import SeriesData, Table, get, json_values, next_flight, row, title_name

BASE = 'https://actc.org.ar'
CATEGORIES = {
    'tc': ('Turismo Carretera', 'Copa de Oro'),
    'tcp': ('TC Pista', 'Copa de Plata'),
    'tcm': ('TC Mouras', None),
    'tcpm': ('TC Pista Mouras', None),
}

# Pilotos de marca conocida, para identificar cada logo (apellido en mayúsculas como lo publica la ACTC).
SEED_BRANDS = {
    'FRITZLER': 'Mercedes-Benz', 'URCERA': 'Mercedes-Benz',
    'CASTELLANO': 'Dodge', 'DIANDA': 'Dodge',
    'LEDESMA': 'Chevrolet', 'LANDA': 'Chevrolet',
    'FAÍN': 'Torino', 'CHAPUR': 'Torino',
    'WERNER': 'Ford', 'LAMBIRIS': 'Ford',
    'ROSSI': 'Toyota', 'DI PALMA': 'Toyota', 'PALAZZO': 'Toyota',
    'SANTERO': 'BMW',
}


def _drivers_and_rounds(cat: str, page: str) -> tuple[list[dict], list[dict]]:
    blob = next_flight(get(f'{BASE}/{cat}/{page}'))
    drivers = next((a for a in json_values(blob, 'drivers') if a and isinstance(a[0], dict) and 'points' in a[0]), [])
    rounds = next((a for a in json_values(blob, 'rounds') if a and isinstance(a[0], dict) and 'label' in a[0]), [])
    return drivers, rounds


def _logo_brands(all_drivers: list[dict]) -> dict[str, str]:
    votes: dict[str, dict[str, int]] = {}
    for d in all_drivers:
        brand = SEED_BRANDS.get(d.get('surname', '').upper())
        logo = d.get('brandLogoUrl')
        if brand and logo:
            votes.setdefault(logo, {}).setdefault(brand, 0)
            votes[logo][brand] += 1
    return {logo: max(v, key=v.get) for logo, v in votes.items()}


def _wins(drivers: list[dict]) -> dict[str, int]:
    """Ganador de cada fecha = el que más puntos sumó en la final de esa fecha."""
    best: dict[int, tuple[float, str]] = {}
    for d in drivers:
        for rp in d.get('roundPoints') or []:
            f = rp.get('final') or 0
            rid = rp.get('roundId')
            if rid is not None and f and (rid not in best or f > best[rid][0]):
                best[rid] = (f, d['id'])
    wins: dict[str, int] = {}
    for _, did in best.values():
        wins[did] = wins.get(did, 0) + 1
    return wins


def _table(title: str, drivers: list[dict], brands: dict[str, str], wins: dict[str, int]) -> Table:
    t = Table(title, 'drivers')
    for d in sorted(drivers, key=lambda x: x.get('position') or 999):
        photo = d.get('photoUrl')
        t.rows.append(row(
            d['position'], title_name(d.get('fullName') or f"{d.get('givenName','')} {d.get('surname','')}"), d.get('points'),
            number=str(d.get('carNumber') or '') or None,
            car=brands.get(d.get('brandLogoUrl') or ''),
            team=d.get('team') or None,
            wins=wins.get(d['id']),
            photo=f'{BASE}{photo}' if photo else None,
        ))
    return t


def fetch() -> dict[str, SeriesData]:
    raw: dict[str, tuple] = {}
    everyone: list[dict] = []
    for cat, (name, copa) in CATEGORIES.items():
        general, rounds = _drivers_and_rounds(cat, 'campeonato')
        cup = _drivers_and_rounds(cat, 'copa')[0] if copa else []
        raw[cat] = (name, copa, general, cup, rounds)
        everyone += general

    brands = _logo_brands(everyone)
    out: dict[str, SeriesData] = {}
    for cat, (name, copa, general, cup, rounds) in raw.items():
        if not general:
            continue
        last = max(rounds, key=lambda r: r.get('order', 0)) if rounds else None
        wins = _wins(general)
        sd = SeriesData(
            source='actc.org.ar (oficial)',
            source_url=f'{BASE}/{cat}/campeonato',
            official=True,
            updated=f"Tras {last['label'].split(' ', 1)[-1]} ({last['date'][8:10]}/{last['date'][5:7]})" if last else '',
        )
        if cup:
            sd.tables.append(_table(copa, cup, brands, wins))
        # En la app, TC Mouras y TC Pista Mouras son una sola ficha con dos tablas.
        if cat in ('tcm', 'tcpm'):
            table = _table(name, general, brands, wins)
            if 'tcm' in out:
                out['tcm'].tables.append(table)
            else:
                sd.tables.append(table)
                out['tcm'] = sd
            continue
        sd.tables.append(_table('Campeonato general', general, brands, wins))
        out[cat] = sd
    unknown = {d.get('brandLogoUrl') for d in everyone} - set(brands) - {None, ''}
    if unknown:
        print(f'  ! ACTC: {len(unknown)} logos de marca sin identificar')
    return out
