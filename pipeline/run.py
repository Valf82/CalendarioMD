#!/usr/bin/env python3
"""Baja las posiciones y la telemetría de fuentes oficiales y genera los JSON que usa la app.

Uso, desde la carpeta del proyecto:
    pipeline/.venv/bin/python pipeline/run.py              # todo
    pipeline/.venv/bin/python pipeline/run.py --rapido     # sin las vueltas de IndyCar (tardan ~6 min)
    pipeline/.venv/bin/python pipeline/run.py --solo tc,tn # solo algunas fuentes

Salida:
    data/standings.json              posiciones de todas las categorías (lo que lee la app)
    data/news.json                   noticias clasificadas por categoría
    data/telemetry/<serie>.json      vueltas de la última carrera de WEC, IMSA e IndyCar
    src/data/generated/              copia que va empaquetada dentro de la app
Si una fuente falla, se conservan sus datos anteriores y se marca como desactualizada.
"""
from __future__ import annotations

import argparse
import json
import shutil
import sys
import time
import traceback
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from sources import actc, alkamel, argentina, indycar, international, news, wikipedia  # noqa: E402

ROOT = HERE.parent
DATA = ROOT / 'data'
APP_COPY = ROOT / 'src' / 'data' / 'generated'
CACHE = HERE / '.cache'


def dump(path: Path, obj) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, separators=(',', ':')), encoding='utf8')


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--rapido', action='store_true', help='no procesar las vueltas de IndyCar')
    ap.add_argument('--solo', default='', help='fuentes separadas por coma: actc,tn,tc2000,alkamel,indycar,f2,nascar,wikipedia,news')
    args = ap.parse_args()
    only = {s.strip() for s in args.solo.split(',') if s.strip()}

    previous = {}
    if (DATA / 'standings.json').exists():
        previous = json.loads((DATA / 'standings.json').read_text(encoding='utf8')).get('series', {})

    series: dict[str, dict] = {}
    telemetry: dict[str, dict] = {}
    indycar_race: dict = {}

    def step(name, fn):
        if only and name not in only:
            return
        t0 = time.time()
        try:
            res = fn()
            print(f'✓ {name} ({time.time() - t0:.0f}s): {", ".join(res) if res else "sin datos"}')
        except Exception as e:  # noqa: BLE001
            print(f'✗ {name}: {e}')
            traceback.print_exc(limit=1)

    def run_actc():
        r = actc.fetch(); series.update({k: v.to_json() for k, v in r.items()}); return list(r)

    def run_tn():
        r = argentina.turismo_nacional(); series.update({k: v.to_json() for k, v in r.items()}); return list(r)

    def run_tc2000():
        r = argentina.tc2000(); series.update({k: v.to_json() for k, v in r.items()}); return list(r)

    def run_alkamel():
        st, tel = alkamel.fetch()
        series.update({k: v.to_json() for k, v in st.items()}); telemetry.update(tel)
        return list(st) + [f'telemetría {k}' for k in tel]

    def run_indycar():
        nonlocal indycar_race
        st, indycar_race = indycar.fetch()
        series.update({k: v.to_json() for k, v in st.items()})
        return list(st)

    def run_indycar_laps():
        if not indycar_race:
            return []
        tel = indycar.laps(indycar_race, str(CACHE / 'indycar'))
        if tel:
            telemetry['indycar'] = tel
            return ['telemetría indycar']
        return []

    def run_f2():
        r = international.formula2(); series.update({k: v.to_json() for k, v in r.items()}); return list(r)

    def run_nascar():
        r = international.nascar(); series.update({k: v.to_json() for k, v in r.items()}); return list(r)

    def run_wiki():
        r = wikipedia.fetch()
        # Una fuente oficial siempre le gana a Wikipedia.
        added = [k for k in r if k not in series]
        series.update({k: r[k].to_json() for k in added})
        return added

    step('actc', run_actc)
    step('tn', run_tn)
    step('tc2000', run_tc2000)
    step('alkamel', run_alkamel)
    step('indycar', run_indycar)
    if not args.rapido:
        step('indycar', run_indycar_laps)
    step('f2', run_f2)
    step('nascar', run_nascar)
    step('wikipedia', run_wiki)

    def run_news():
        data = news.fetch()
        dump(DATA / 'news.json', data)
        return [f"{len(data['items'])} noticias"]

    step('news', run_news)

    # Lo que falló hoy conserva el dato anterior. En una corrida parcial (--solo) no se toca el resto.
    refreshed = bool(series)
    for k, v in previous.items():
        if k not in series:
            series[k] = v if only else {**v, 'stale': True}

    now = datetime.now(timezone.utc).isoformat(timespec='seconds')
    out = {'generatedAt': now, 'series': dict(sorted(series.items()))}
    if refreshed or not only:
        dump(DATA / 'standings.json', out)
    for k, v in telemetry.items():
        dump(DATA / 'telemetry' / f'{k}.json', {**v, 'generatedAt': now})

    # Copia empaquetada en la app.
    APP_COPY.mkdir(parents=True, exist_ok=True)
    shutil.copy(DATA / 'standings.json', APP_COPY / 'standings.json')
    if (DATA / 'news.json').exists():
        shutil.copy(DATA / 'news.json', APP_COPY / 'news.json')
    for f in (DATA / 'telemetry').glob('*.json'):
        shutil.copy(f, APP_COPY / f'telemetry-{f.stem}.json')

    print(f'\nListo: {len(series)} categorías, telemetría de {", ".join(sorted(p.stem for p in (DATA / "telemetry").glob("*.json")))}.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
