# Agenda Motor

Una app personal de Android para seguir todo el automovilismo en un solo lugar: el calendario de las carreras que quedan, las posiciones de cada campeonato, las noticias, los pilotos y equipos, la telemetría y un par de simulaciones.

Cubre unas 30 categorías, desde la Fórmula 1 y el WEC hasta el Turismo Carretera, el TC2000 y el Turismo Nacional. Todo se organiza por categoría: entrás a una (por ejemplo, Turismo Carretera) y ves ahí sus posiciones, pilotos, equipos, ficha técnica, calendario, noticias y análisis.

**Qué tiene**

- **Agenda:** las carreras que quedan, con hora (Argentina, la del teléfono o UTC), circuito y dónde verlas.
- **Noticias:** de todas las categorías, juntas o separadas, con imagen y fuente.
- **Posiciones y estadísticas:** de fuentes oficiales (FIA, IndyCar, NASCAR, ACTC, APAT, TC2000 y otras).
- **Pilotos y equipos:** fichas con resultados, staff, ingenieros y auto.
- **Ficha técnica:** reglamento y especificaciones de motor, chasis, frenos y neumáticos, con sus fuentes.
- **Telemetría y cronometraje:** comparación de vueltas en F1 y cronometraje por vuelta y sector en las demás.
- **Simulaciones:** probabilidades de título en F1 y un simulador de estrategia de paradas.

Es un proyecto personal, sin fines comerciales. Los datos vienen de fuentes públicas y oficiales, y se actualizan con un pipeline en Python que corre en GitHub Actions.

---

## Cómo está organizada

Cuatro pestañas:

- **Agenda**: las carreras que quedan con hora (Argentina, del teléfono o UTC), autódromo y dónde verlas. Filtros por nivel, categoría favorita y búsqueda. Tocá una carrera para ver dónde verla y agregarla al calendario.
- **Noticias**: todas juntas o por categoría, con imagen y fuente. Se actualizan solas desde el celular leyendo los feeds de Motorsport.com, Solo TC, Campeones, Infobae, Sportscar365 y otros.
- **Categorías**: las 32 categorías agrupadas por nivel (Mundial, Internacional, Nacional), con favoritas ★. Cada categoría reúne todo lo suyo en un solo lugar: **Posiciones · Pilotos · Equipos · Técnica · Calendario · Noticias · Análisis**.
- **Análisis**: telemetría y cronometraje, y dos simulaciones.

Dentro de una categoría, cada piloto y cada equipo tiene su ficha (resumen, resultados, staff, auto y motor).

### Análisis y simulaciones

| Herramienta | Qué hace |
|---|---|
| Telemetría de F1 | Compara la vuelta más rápida de dos pilotos: velocidad, acelerador, freno, marcha, RPM, delta y mapa por mini-sectores |
| Telemetría de NASCAR | Tiempo por vuelta, posición en carrera y loop data |
| Cronometraje de WEC, IMSA e IndyCar | Cada vuelta de cada auto, con sectores, velocidad punta y tandas |
| Probabilidades de título (F1) | Monte Carlo de 10.000 temporadas posibles |
| Simulador de estrategia (F1) | Desgaste real de cada neumático, costo de parada y comparación de estrategias de una y dos paradas |

## Fuentes de datos

| Categoría | Fuente |
|---|---|
| F1 | [Jolpica](https://github.com/jolpica/jolpica-f1) (resultados), [OpenF1](https://github.com/br-g/openf1) (telemetría), MultiViewer (trazados) |
| NASCAR | Feeds oficiales de nascar.com |
| IndyCar | API oficial de indycar.com + [raceindycar](https://github.com/parkermerritt05/raceindycar) |
| WEC, IMSA | Cronometraje oficial Al Kamel |
| TC, TC Pista, TC Mouras | actc.org.ar |
| Turismo Nacional | apat.org.ar (con lastre) |
| TC2000 | tc2000.com.ar |
| Fórmula 2 | fiaformula2.com |
| Fórmula E, WRC, Supercars, Stock Car, Super Formula, DTM, BTCC | Wikipedia (sus sitios oficiales no son accesibles); se marca como "fuente de respaldo" |
| Noticias | RSS públicos (ver `src/data/news-sources.json`) |

Las fichas técnicas (`src/data/tech.ts`) citan sus fuentes. La investigación de repositorios está en [docs/REPOS.md](docs/REPOS.md).

## El pipeline de datos

Un script de Python baja las posiciones, la telemetría de WEC/IMSA/IndyCar y las noticias, y genera:

- `data/standings.json`, `data/news.json`, `data/telemetry/<serie>.json`
- `src/data/generated/`: la copia que va dentro de la app

Primera vez:

```bash
python3 -m venv pipeline/.venv
```

```bash
pipeline/.venv/bin/pip install -r pipeline/requirements.txt
```

Actualizar todo (unos 8 minutos por los PDF de IndyCar):

```bash
pipeline/.venv/bin/python pipeline/run.py
```

Solo algunas fuentes, por ejemplo las noticias:

```bash
pipeline/.venv/bin/python pipeline/run.py --solo news
```

Si una fuente falla, se conservan sus datos anteriores y la app los marca como "sin actualizar". En una corrida parcial (`--solo`) no se toca el resto.

### Actualización automática con GitHub

`.github/workflows/datos.yml` corre el pipeline todos los días a las 7:00 (Argentina) y los lunes a la madrugada. Para que la app lea esos datos sin recompilar, subí el proyecto a un repositorio público y poné su dirección en `src/config.ts` (`DATA_BASE_URL`). Sin eso, la app usa la copia empaquetada y las noticias y posiciones en vivo que consulta sola.

## Tecnologías

React Native con Expo (SDK 57) y Expo Router en TypeScript; Python para el pipeline de datos; GitHub Actions para la actualización automática.

## Usarla en el celular (Expo Go)

1. Instalá **Expo Go** desde Google Play.
2. En la carpeta del proyecto:

```bash
npm install
```

```bash
npx expo start
```

3. Escaneá el QR con Expo Go (celular y compu en la misma red Wi-Fi).

## Instalarla como app propia (APK)

Con una cuenta gratuita de Expo, creá un `eas.json` con un perfil `preview` que tenga `"android": { "buildType": "apk" }` y corré:

```bash
npx eas-cli@latest build --platform android --profile preview
```

## Desarrollo

```bash
npm run typecheck
```

```bash
npx expo lint
```

Estructura:

- `src/app/`: pantallas (Expo Router). `(tabs)/` las 4 pestañas, `categoria/[id]` el eje de la app, `piloto/`, `equipo/`, `telemetria/` y `analisis/` el resto.
- `src/features/`: las secciones de una categoría (posiciones, pilotos, equipos, técnica, calendario, noticias, análisis).
- `src/components/`: el kit visual (`ui.tsx`) y piezas compartidas. Estilo: neutros fríos, un solo acento, IBM Plex Sans y Mono, líneas finas en lugar de bloques de color.
- `src/theme.ts`: paleta, escala tipográfica y espaciado.
- `src/lib/`: `telemetry.ts`, `championship.ts` y `strategy.ts` son funciones puras sin dependencias de la app, por lo que se pueden probar con Node.
- `src/data/`: agenda, staff, fichas técnicas y los almacenes que leen lo que genera el pipeline.
- `pipeline/`: el pipeline de datos en Python (`sources/` tiene un módulo por fuente).
