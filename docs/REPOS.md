# Repositorios útiles para Agenda Motor

Investigación del 8 de octubre de 2026. Tres agentes (modelo Haiku) buscaron y abrieron cada repositorio; después verifiqué por mi cuenta los que más pesaban en las decisiones (licencia, circuitos que cubre y método). Las estrellas y fechas de commit vienen de los agentes, salvo donde se indica. GitHub limitó las consultas a la API durante la verificación, así que algunos datos salen de las páginas públicas.

Regla que se siguió: se adopta código o datos solo con **licencia clara** y actividad en los últimos 12 meses. Cuando un repositorio no tiene licencia, se puede tomar la *idea* del método publicado, pero no el código.

## Ya adoptados

| Repositorio | Licencia | Qué se tomó | Dónde está |
|---|---|---|---|
| [br-g/openf1](https://github.com/br-g/openf1) | CC BY-NC-SA 4.0 | API con la telemetría del live timing de F1 (velocidad, RPM, marcha, acelerador, freno, posición, neumáticos) | `src/api/openf1.ts` |
| [theOehrly/Fast-F1](https://github.com/theOehrly/Fast-F1) | MIT | El método: distancia por integración de la velocidad, alineación de vueltas por distancia, delta y mini-sectores; trazado y curvas desde MultiViewer | `src/lib/telemetry.ts` |
| [jolpica/jolpica-f1](https://github.com/jolpica/jolpica-f1) | Apache-2.0 | Resultados, posiciones y estadísticas históricas de la F1 | `src/api/f1.ts` |
| [parkermerritt05/raceindycar](https://github.com/parkermerritt05/raceindycar) | MIT | Lectura de los PDF oficiales de vueltas y tramos de IndyCar | `pipeline/sources/indycar.py` |
| [Ark07Yad/pitwall](https://github.com/Ark07Yad/pitwall) | MIT | La idea de degradación de neumáticos por compuesto y la comparación de estrategias, **reescrita** | `src/lib/strategy.ts` |
| [Malek1414/f1-predictions](https://github.com/Malek1414/f1-predictions) | MIT | La idea de simular la temporada completa miles de veces para estimar el campeón, **reescrita** (no usa su Elo) | `src/lib/championship.ts` |

OpenF1 es CC BY-NC-SA: sirve para uso personal, no para vender la app.

## Candidatos para después

| Repositorio | Licencia | Para qué serviría | Por qué todavía no |
|---|---|---|---|
| [bacinger/f1-circuits](https://github.com/bacinger/f1-circuits) | MIT | Trazados GeoJSON de 40 circuitos. Incluye Madring, Sepang, Bakú y Singapur (verificado) | MultiViewer ya cubre casi todo; sirve para el hueco de Sepang |
| [TUMFTM/laptime-simulation](https://github.com/TUMFTM/laptime-simulation) | LGPL-3.0 | Simular una vuelta (perfil de velocidad por adherencia) | Reescribirlo en TypeScript es mucho trabajo; reimplementar, no copiar |
| [matteocelani/f1-telemetry](https://github.com/matteocelani/f1-telemetry) | MIT | Decodificar el feed en vivo de F1 durante la carrera | Es ingeniería inversa y el acceso en vivo puede bloquearse |
| [vishwapramuditha/moto-db](https://github.com/vishwapramuditha/moto-db) | CC0 | JSON de calendarios y resultados de varias categorías, como respaldo | Depende de ESPN; sin verificar la calidad |
| [ab5525/pynascar](https://github.com/ab5525/pynascar) | MIT | Vueltas, boxes y banderas de NASCAR | Los feeds oficiales de nascar.com ya cubren lo que se usa |
| [kyleGrealis/nascaR.data](https://github.com/kyleGrealis/nascaR.data) | GPL-3.0 | Historia de NASCAR desde 1949 | GPL: tomar solo los datos, citando la fuente |
| [palomacdev/openwec](https://github.com/palomacdev/openwec) | MIT | Lógica de tandas, ritmo y degradación en WEC e IMSA | Habría que portarla a partir del cronometraje de Al Kamel |
| [riddlejack/BryceCast](https://github.com/riddlejack/BryceCast) | MIT | Decodificar tiempos de lazos de cronometraje de INDY NXT | Sirve de referencia; la serie no es IndyCar |
| [vivekjoshy/openskill.py](https://github.com/vivekjoshy/openskill.py) | MIT | Rating de pilotos a partir del orden de llegada | Falta definir para qué categoría tiene sentido |
| [Bmorganqwe98/racing-2026-calendar](https://github.com/Bmorganqwe98/racing-2026-calendar) | MIT | Calendarios en formato .ics | Sin commits desde mayo; la agenda propia ya está más completa |
| [Shopify/react-native-skia](https://github.com/Shopify/react-native-skia) | MIT | Dibujar series de miles de puntos de telemetría | El SVG actual alcanza con 200–300 puntos por serie; el agente reportó que viene incluido en Expo Go (no lo verifiqué) |
| [NaturalIntelligence/fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) | MIT | Leer RSS y Atom | El lector propio (60 líneas) alcanzó; reconsiderar si aparecen feeds raros |

## Descartados

- **Sin licencia** (se puede aprender del método, no copiar el código): camiloclarke/F1-Tyre-Degradation, IAmTomShaw/f1-race-replay, cardsdeveloper/f1-strategy, yacobwood/BTCC, joe0121/yellowcarpoints y otros.
- **Licencia no clara:** tobi/imsa_data (el README dice MIT pero no hay archivo LICENSE; es el mejor dataset de WEC e IMSA, conviene pedirle confirmación al autor).
- **Inactivos:** juanmanzanero/fastest-lap (2023), TUMFTM/racetrack-database (2021), sublee/trueskill (2023), jemorriso/nascar (2021), f1datajunkie/WEC (2022).
- **Solo no comercial:** mohammedmedjadj/Motorsport-Strategy-Lab (CC BY-NC-SA).
- **react-native-rss-parser** y **rss-parser**: el primero no se publica desde 2020; el segundo depende de módulos de Node.

## Advertencia de seguridad

Un agente reportó que el repositorio `Lanthanum89/F1-2025-ML-Champion-Predictor` tiene un commit del 7 de septiembre de 2026 titulado "Remove A8-new malware from public/fonts and .vscode". No lo verifiqué, pero conviene no clonarlo ni ejecutarlo. Ningún repositorio se clonó ni se ejecutó durante esta investigación: los que se usan se consultaron por su API pública o se reescribieron.

## Lo que no existe

- **Argentina** (TC, TC2000, Turismo Nacional, Top Race): no hay repositorios de resultados. Los datos salen de los sitios oficiales con scrapers propios (`pipeline/sources/actc.py` y `argentina.py`).
- **Supercars, DTM, BTCC y Fórmula E:** solo aparecen dentro de herramientas generales (racetui, moto-db). No hay repositorios dedicados.
- **Simuladores de campeonato fuera de F1:** no se encontró ninguno con licencia clara.

## Cómo se validó lo que se construyó

- **Probabilidades de título** (`src/lib/championship.ts`): prueba retroactiva con la temporada 2026 cortando tras las rondas 6, 9 y 12 y comparando con los puntos reales de la ronda 16. El rango P10–P90 cubrió al 82, 91 y 91 % de los pilotos (objetivo: 80 %) y el modelo ubicó al líder real primero en los tres cortes. Error medio de puntos: 23, 17 y 8.
- **Simulador de estrategia** (`src/lib/strategy.ts`): se probó con cinco carreras secas de 2026. El costo de parada medido (22–23 s) coincide con lo conocido de la F1 y el desgaste por vuelta sale en un rango razonable. La diferencia de tiempo *entre compuestos* no es confiable con los datos de una sola carrera (el ruido de las vueltas supera esa diferencia), por eso el modelo la fuerza a respetar el orden blando ≤ medio ≤ duro y avisa cuando dos compuestos no se pueden separar.
