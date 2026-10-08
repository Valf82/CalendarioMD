"""Turismo Nacional (APAT) y TC2000, desde sus sitios oficiales."""
from __future__ import annotations

import re

from common import SeriesData, Table, get, html_tables, num, page_text, row, title_name


def turismo_nacional() -> dict[str, SeriesData]:
    sd = SeriesData(source='apat.org.ar (oficial)', source_url='https://apat.org.ar/campeonato/ranking/c3', official=True, updated='')
    for clase, title in (('c3', 'Clase 3'), ('c2', 'Clase 2')):
        page = get(f'https://apat.org.ar/campeonato/ranking/{clase}')
        table = next((t for t in html_tables(page) if t and t[0][:3] == ['Pos', 'Nro', 'Piloto']), None)
        if not table:
            print(f'  ! TN {title}: no encontré la tabla')
            continue
        header = table[0]
        idx = {h: i for i, h in enumerate(header)}
        t = Table(title, 'drivers')
        for cells in table[1:]:
            if not cells or not cells[0].isdigit():
                continue
            # La celda "Piloto" trae también el equipo pegado al final: lo saco.
            team = cells[idx['Equipo']] if 'Equipo' in idx else ''
            name = cells[idx['Piloto']]
            if team and name.endswith(team):
                name = name[: -len(team)].strip()
            lastre = cells[idx['Lastre (Kg)']] if 'Lastre (Kg)' in idx and idx['Lastre (Kg)'] < len(cells) else ''
            t.rows.append(row(
                int(cells[0]), title_name(name), cells[idx['Puntos']],
                number=cells[idx['Nro']], team=team or None,
                car=cells[idx['Marca']] if 'Marca' in idx else None,
                ballast=f'{lastre} kg' if num(lastre) else None,
            ))
        sd.tables.append(t)
    sd.updated = 'Ranking oficial vigente'
    sd.note = 'El lastre es el peso extra que carga cada auto según sus resultados.'
    return {'tn': sd} if sd.tables else {}


def tc2000() -> dict[str, SeriesData]:
    text = page_text(get('https://tc2000.com.ar/estadisticas.php?accion=posiciones'))
    # Secuencias "N° | Nombre | puntos"; cada vez que vuelve a 1° empieza otra tabla (pilotos, equipos, marcas).
    seq = re.findall(r'\|\s*(\d+)°\s*\|\s*([^|]+?)\s*\|\s*(-?\d+(?:[.,]\d+)?)\s*(?=\|)', text)
    groups: list[list[tuple[str, str, str]]] = []
    for pos, name, pts in seq:
        if pos == '1' or not groups:
            groups.append([])
        groups[-1].append((pos, name, pts))

    # Marca de cada piloto, desde la tabla de estadísticas 2026.
    cars: dict[str, str] = {}
    for t in html_tables(get('https://tc2000.com.ar/estadisticas.php?accion=2026')):
        if t and t[0][:2] == ['Piloto', 'Auto']:
            cars = {r[0].lower(): r[1] for r in t[1:] if len(r) > 1}

    note = None
    m = re.search(r'\|\s*(Resultado de carrera[^|]+)\|', text)
    if m:
        note = m.group(1).strip()
    sd = SeriesData(source='tc2000.com.ar (oficial)', source_url='https://tc2000.com.ar/estadisticas.php?accion=posiciones',
                    official=True, updated='Posiciones oficiales vigentes', note=note)
    titles = [('Pilotos', 'drivers'), ('Equipos', 'teams'), ('Marcas', 'teams')]
    for (title, kind), g in zip(titles, groups):
        t = Table(title, kind)
        for pos, name, pts in g:
            t.rows.append(row(int(pos), name.strip(), pts, car=cars.get(name.strip().lower()) if kind == 'drivers' else None))
        sd.tables.append(t)
    return {'tc2000': sd} if sd.tables else {}
