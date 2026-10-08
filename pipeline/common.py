"""Utilidades compartidas: descargas, lectura de páginas Next.js, tablas HTML y PDF."""
from __future__ import annotations

import html
import io
import json
import re
import time
from dataclasses import dataclass, field
from typing import Any

import requests

UA = 'Mozilla/5.0 (X11; Linux x86_64) AgendaMotorPipeline/1.0 (uso personal, no comercial)'
SESSION = requests.Session()
SESSION.headers.update({'User-Agent': UA, 'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8'})


def get(url: str, *, binary: bool = False, accept: str | None = None, timeout: int = 45, retries: int = 3) -> Any:
    """GET con reintentos. Devuelve texto, bytes o JSON según `binary` / `accept`."""
    last: Exception | None = None
    for attempt in range(retries):
        try:
            headers = {'Accept': accept} if accept else {}
            r = SESSION.get(url, timeout=timeout, headers=headers)
            if r.status_code == 429:
                time.sleep(5 * (attempt + 1))
                continue
            r.raise_for_status()
            if binary:
                return r.content
            if accept and 'json' in accept:
                return r.json()
            r.encoding = r.encoding or 'utf-8'
            return r.text
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(2 * (attempt + 1))
    raise RuntimeError(f'No se pudo descargar {url}: {last}')


# ---------- Next.js (App Router): datos embebidos en self.__next_f.push ----------

def next_flight(page: str) -> str:
    chunks = re.findall(r'self\.__next_f\.push\(\[1,"(.*?)"\]\)', page, re.S)
    return ''.join(json.loads('"' + c + '"') for c in chunks)


def json_values(blob: str, key: str, opener: str = '[') -> list[Any]:
    """Todos los valores JSON (arrays u objetos) asociados a `"key":` dentro de un texto."""
    closer = ']' if opener == '[' else '}'
    out: list[Any] = []
    needle = f'"{key}":{opener}'
    i = 0
    while (i := blob.find(needle, i)) >= 0:
        start = i + len(needle) - 1
        depth, k = 0, start
        while k < len(blob):
            ch = blob[k]
            if ch == '"':
                k += 1
                while k < len(blob) and blob[k] != '"':
                    k += 2 if blob[k] == '\\' else 1
            elif ch == opener:
                depth += 1
            elif ch == closer:
                depth -= 1
                if depth == 0:
                    break
            k += 1
        try:
            out.append(json.loads(blob[start:k + 1]))
        except json.JSONDecodeError:
            pass
        i = k
    return out


# ---------- HTML ----------

def clean(s: str) -> str:
    s = re.sub(r'<script.*?</script>|<style.*?</style>', '', s, flags=re.S)
    s = re.sub(r'<[^>]+>', ' ', s)
    return re.sub(r'\s+', ' ', html.unescape(s)).strip()


def html_tables(page: str) -> list[list[list[str]]]:
    tables = []
    for t in re.findall(r'<table.*?</table>', page, re.S):
        rows = []
        for r in re.findall(r'<tr[^>]*>(.*?)</tr>', t, re.S):
            cells = [clean(c) for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.S)]
            if any(cells):
                rows.append(cells)
        tables.append(rows)
    return tables


def page_text(page: str) -> str:
    """Texto plano con separador ' | ' entre elementos, útil para páginas sin tablas."""
    t = re.sub(r'<script.*?</script>|<style.*?</style>', '', page, flags=re.S)
    t = html.unescape(re.sub(r'<[^>]+>', ' | ', t))
    return re.sub(r'(\s*\|\s*)+', ' | ', t)


# ---------- PDF ----------

def pdf_lines(data: bytes) -> list[tuple[int, str]]:
    """Líneas de texto de un PDF con el número de página (usa pdfplumber)."""
    import pdfplumber

    out = []
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        for n, page in enumerate(pdf.pages):
            text = page.extract_text(layout=True) or ''
            out.extend((n, line) for line in text.splitlines() if line.strip())
    return out


# ---------- Nombres ----------

def title_name(s: str) -> str:
    """'Otto FRITZLER' -> 'Otto Fritzler'; 'Canapino, Agustin' -> 'Agustin Canapino'."""
    s = s.strip()
    if ',' in s:
        last, first = [p.strip() for p in s.split(',', 1)]
        s = f'{first} {last}'
    parts = []
    for w in s.split():
        if w.isupper() and len(w) > 1:
            w = '-'.join(x.capitalize() for x in w.split('-'))
            w = re.sub(r"\b(Mc|O')([a-z])", lambda m: m.group(1) + m.group(2).upper(), w)
        parts.append(w)
    return ' '.join(parts)


def num(s: Any) -> float | int | None:
    if s is None:
        return None
    m = re.search(r'-?\d+(?:[.,]\d+)?', str(s))
    if not m:
        return None
    v = float(m.group().replace(',', '.'))
    return int(v) if v == int(v) else v


# ---------- Modelo de salida ----------

@dataclass
class Table:
    title: str
    kind: str  # 'drivers' | 'teams'
    rows: list[dict] = field(default_factory=list)

    def to_json(self) -> dict:
        return {'title': self.title, 'kind': self.kind, 'rows': self.rows}


@dataclass
class SeriesData:
    source: str
    source_url: str
    official: bool
    updated: str
    tables: list[Table] = field(default_factory=list)
    note: str | None = None

    def to_json(self) -> dict:
        d = {
            'source': self.source,
            'sourceUrl': self.source_url,
            'official': self.official,
            'updated': self.updated,
            'tables': [t.to_json() for t in self.tables if t.rows],
        }
        if self.note:
            d['note'] = self.note
        return d


def row(pos: int, name: str, points: Any, **extra: Any) -> dict:
    r = {'pos': int(pos), 'name': name, 'points': num(points) if not isinstance(points, (int, float)) else points}
    for k, v in extra.items():
        if v not in (None, '', 0) or k == 'wins' and v:
            r[k] = v
    return r
