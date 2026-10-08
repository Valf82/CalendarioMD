import type { RaceEvent } from './types';

/**
 * Carreras que quedan de la temporada 2026 (verificado el 3 oct 2026).
 * La app oculta sola las que ya terminaron.
 */
export const EVENTS: RaceEvent[] = [
  // Fórmula 1 (horarios oficiales 2026)
  { s: 'f1', n: 'GP de Singapur', d: '2026-10-11', u: '2026-10-11T12:00:00Z', p: 'Marina Bay Street Circuit', c: 'Singapur', r: 'Singapur', st: 'ok' },
  { s: 'f1', n: 'GP de Estados Unidos', d: '2026-10-25', u: '2026-10-25T20:00:00Z', p: 'Circuit of the Americas', c: 'Austin, Texas', r: 'Estados Unidos', st: 'ok' },
  { s: 'f1', n: 'GP de la Ciudad de México', d: '2026-11-01', u: '2026-11-01T20:00:00Z', p: 'Autódromo Hermanos Rodríguez', c: 'Ciudad de México', r: 'México', st: 'ok' },
  { s: 'f1', n: 'GP de São Paulo', d: '2026-11-08', u: '2026-11-08T17:00:00Z', p: 'Autódromo José Carlos Pace (Interlagos)', c: 'São Paulo', r: 'Brasil', st: 'ok' },
  { s: 'f1', n: 'GP de Las Vegas', d: '2026-11-21', u: '2026-11-22T04:00:00Z', p: 'Las Vegas Strip Circuit', c: 'Las Vegas, Nevada', r: 'Estados Unidos', st: 'ok', x: 'Se corre el sábado a la noche en Las Vegas.' },
  { s: 'f1', n: 'GP de Qatar', d: '2026-11-29', u: '2026-11-29T16:00:00Z', p: 'Lusail International Circuit', c: 'Lusail', r: 'Qatar', st: 'ok', x: 'Sujeto a la situación en Medio Oriente: la F1 tiene un plan B en Europa.' },
  { s: 'f1', n: 'GP de Abu Dhabi', d: '2026-12-06', u: '2026-12-06T13:00:00Z', p: 'Yas Marina Circuit', c: 'Abu Dhabi', r: 'Emiratos Árabes', st: 'ok', x: 'Final de temporada. Sujeto a la situación en Medio Oriente.' },
  // Fórmula 2
  { s: 'f2', n: 'Ronda 13 · Qatar (carrera principal)', d: '2026-11-29', p: 'Lusail International Circuit', c: 'Lusail', r: 'Qatar', st: 'tbc', x: 'Fin de semana 27–29 nov, telonera de la F1.' },
  { s: 'f2', n: 'Ronda 14 · Abu Dhabi (final)', d: '2026-12-06', p: 'Yas Marina Circuit', c: 'Abu Dhabi', r: 'Emiratos Árabes', st: 'tbc', x: 'Fin de semana 4–6 dic, telonera de la F1.' },
  // Fórmula E temporada 13
  { s: 'fe', n: 'E-Prix de Jeddah · Ronda 1 (debut Gen4)', d: '2026-12-18', p: 'Jeddah Corniche Circuit', c: 'Jeddah', r: 'Arabia Saudita', st: 'tbc' },
  { s: 'fe', n: 'E-Prix de Jeddah · Ronda 2', d: '2026-12-19', p: 'Jeddah Corniche Circuit', c: 'Jeddah', r: 'Arabia Saudita', st: 'tbc' },
  // WEC (Qatar y Bahréin reemplazados)
  { s: 'wec', n: '8 Horas de Barcelona', d: '2026-10-18', p: 'Circuit de Barcelona-Catalunya', c: 'Montmeló', r: 'España', st: 'tbc', x: 'Reemplaza a las 1812 km de Qatar. Primera edición.' },
  { s: 'wec', n: '8 Horas de Monza (final)', d: '2026-11-08', p: 'Autodromo Nazionale Monza', c: 'Monza', r: 'Italia', st: 'tbc', x: 'Reemplaza a las 8 Horas de Bahréin.' },
  // IMSA
  { s: 'imsa', n: 'Motul Petit Le Mans (10 horas, final)', d: '2026-10-03', u: '2026-10-03T16:10:00Z', p: 'Michelin Raceway Road Atlanta', c: 'Braselton, Georgia', r: 'Estados Unidos', st: 'ok' },
  // IGTC + GTWC America
  { s: 'igtc', n: 'Indianapolis 8 Hour (final)', d: '2026-10-10', p: 'Indianapolis Motor Speedway (circuito mixto)', c: 'Indianápolis', r: 'Estados Unidos', st: 'tbc', x: 'Cierra también el GT World Challenge America.' },
  // WRC
  { s: 'wrc', n: 'Rally Italia Sardegna (final de temporada)', d: '2026-10-04', p: 'Cerdeña, base en Olbia', c: 'Olbia', r: 'Italia', st: 'ok', x: 'Rally del 1 al 4 oct; el domingo se corre la Power Stage. Arabia Saudita salió del calendario.' },
  // TCR South America
  { s: 'tcrsa', n: 'Fecha 8', d: '2026-10-04', p: 'Sede a confirmar', c: '', r: 'Argentina', st: 'tbc', x: 'Fin de semana 3–4 oct.' },
  { s: 'tcrsa', n: 'Fecha 9 · Rosario', d: '2026-11-08', p: 'Autódromo Juan Manuel Fangio', c: 'Rosario, Santa Fe', r: 'Argentina', st: 'ok', x: 'Fin de semana 7–8 nov.' },
  { s: 'tcrsa', n: 'Fecha 10 · El Pinar (final)', d: '2026-12-06', p: 'Autódromo Víctor Borrat Fabini', c: 'El Pinar, Canelones', r: 'Uruguay', st: 'ok', x: 'Primera definición del campeonato en Uruguay.' },
  // Porsche Cup Brasil
  { s: 'pcc', n: 'Telonera del GP de São Paulo de F1', d: '2026-11-07', p: 'Autódromo José Carlos Pace (Interlagos)', c: 'São Paulo', r: 'Brasil', st: 'tbc' },
  { s: 'pcc', n: 'Final de temporada', d: '2026-11-28', p: 'Autódromo José Carlos Pace (Interlagos)', c: 'São Paulo', r: 'Brasil', st: 'tbc' },
  // ELMS
  { s: 'elms', n: '4 Horas de Portimão (final)', d: '2026-10-10', p: 'Autódromo Internacional do Algarve', c: 'Portimão', r: 'Portugal', st: 'ok' },
  // Asian / Winter LMS
  { s: 'alms', n: 'Rondas 1 y 2 · Paul Ricard', d: '2026-11-14', e: '2026-11-15', p: 'Circuit Paul Ricard', c: 'Le Castellet', r: 'Francia', st: 'tbc', x: 'Por el conflicto en Medio Oriente, la temporada 2026/27 se corre en Europa.' },
  // GT World Challenge
  { s: 'gtwc', n: 'Europe Sprint · Barcelona', d: '2026-10-04', p: 'Circuit de Barcelona-Catalunya', c: 'Montmeló', r: 'España', st: 'ok' },
  { s: 'gtwc', n: 'Asia · Beijing Street Circuit', d: '2026-10-04', p: 'Circuito callejero de Beijing', c: 'Beijing', r: 'China', st: 'ok', x: 'Fin de semana 3–4 oct.' },
  { s: 'gtwc', n: 'Europe Endurance · 3 Horas de Portimão (final)', d: '2026-10-18', p: 'Autódromo Internacional do Algarve', c: 'Portimão', r: 'Portugal', st: 'ok' },
  { s: 'gtwc', n: 'Asia · Shanghái (final)', d: '2026-11-01', p: 'Shanghai International Circuit', c: 'Shanghái', r: 'China', st: 'ok', x: 'Fin de semana 31 oct – 1 nov.' },
  { s: 'gtwc', n: 'Australia · Adelaide (final)', d: '2026-12-06', p: 'Adelaide Street Circuit', c: 'Adelaide', r: 'Australia', st: 'ok', x: 'Telonera del Grand Final de Supercars (3–6 dic).' },
  // Turismo Carretera · Copa de Oro
  { s: 'tc', n: 'Copa de Oro · Fecha 12 · San Nicolás', d: '2026-10-04', u: '2026-10-04T16:00:00Z', ap: true, p: 'Autódromo Ciudad de San Nicolás', c: 'San Nicolás, Buenos Aires', r: 'Argentina', st: 'ok' },
  { s: 'tc', n: 'Copa de Oro · Fecha 13 · Rosario', d: '2026-10-25', u: '2026-10-25T16:00:00Z', ap: true, p: 'Autódromo Juan Manuel Fangio', c: 'Rosario, Santa Fe', r: 'Argentina', st: 'ok', x: 'El TC vuelve a Rosario por primera vez desde 2019.' },
  { s: 'tc', n: 'Copa de Oro · Fecha 14 · Río Cuarto', d: '2026-11-15', u: '2026-11-15T16:00:00Z', ap: true, p: 'Autódromo Parque Ciudad de Río Cuarto', c: 'Río Cuarto, Córdoba', r: 'Argentina', st: 'ok' },
  { s: 'tc', n: 'Gran Premio Coronación · La Plata', d: '2026-12-06', u: '2026-12-06T16:00:00Z', ap: true, p: 'Autódromo Roberto Mouras', c: 'La Plata, Buenos Aires', r: 'Argentina', st: 'ok', x: 'Define el campeón 2026.' },
  // TC Pista (corre junto al TC)
  { s: 'tcp', n: 'Rosario', d: '2026-10-25', p: 'Autódromo Juan Manuel Fangio', c: 'Rosario, Santa Fe', r: 'Argentina', st: 'tbc', x: 'Corre en el mismo fin de semana que el TC.' },
  { s: 'tcp', n: 'Río Cuarto', d: '2026-11-15', p: 'Autódromo Parque Ciudad de Río Cuarto', c: 'Río Cuarto, Córdoba', r: 'Argentina', st: 'tbc', x: 'Corre en el mismo fin de semana que el TC.' },
  { s: 'tcp', n: 'Coronación · La Plata', d: '2026-12-06', p: 'Autódromo Roberto Mouras', c: 'La Plata, Buenos Aires', r: 'Argentina', st: 'tbc', x: 'Corre en el mismo fin de semana que el TC.' },
  // TC Mouras / TC Pista Mouras
  { s: 'tcm', n: 'Instancia final · La Plata', d: '2026-11-29', p: 'Autódromo Roberto Mouras', c: 'La Plata, Buenos Aires', r: 'Argentina', st: 'tbc' },
  { s: 'tcm', n: 'Definición del campeonato · La Plata', d: '2026-12-06', p: 'Autódromo Roberto Mouras', c: 'La Plata, Buenos Aires', r: 'Argentina', st: 'tbc', x: 'Junto al Gran Premio Coronación del TC.' },
  // Turismo Nacional
  { s: 'tn', n: 'Fecha 10 · Clase 2 y 3', d: '2026-10-11', p: 'Autódromo Ciudad de San Martín', c: 'San Martín, Mendoza', r: 'Argentina', st: 'ok' },
  { s: 'tn', n: 'Fecha 11 · Clase 2 y 3', d: '2026-11-01', p: 'Autódromo Ciudad de Concordia', c: 'Concordia, Entre Ríos', r: 'Argentina', st: 'ok' },
  { s: 'tn', n: 'Fecha 12 · Clase 2 y 3 (final)', d: '2026-11-29', p: 'Autódromo Ciudad de Viedma', c: 'Viedma, Río Negro', r: 'Argentina', st: 'ok' },
  // TC2000
  { s: 'tc2000', n: 'Fecha 9 · La Pampa', d: '2026-10-11', p: 'Autódromo Provincia de La Pampa', c: 'Toay, La Pampa', r: 'Argentina', st: 'ok' },
  { s: 'tc2000', n: 'Fecha 10', d: '2026-11-01', p: 'Sede a confirmar', c: '', r: 'Argentina', st: 'tbc' },
  { s: 'tc2000', n: 'Fecha 11', d: '2026-11-22', p: 'Sede a confirmar', c: '', r: 'Argentina', st: 'tbc' },
  { s: 'tc2000', n: 'Fecha 12 (final)', d: '2026-12-13', p: 'Sede a confirmar', c: '', r: 'Argentina', st: 'tbc' },
  // Top Race
  { s: 'top', n: 'Fecha 9', d: '2026-11-01', p: 'Sede a confirmar', c: '', r: 'Argentina', st: 'tbc' },
  { s: 'top', n: 'Fecha 10 (final)', d: '2026-12-13', p: 'Sede a confirmar', c: '', r: 'Argentina', st: 'tbc' },
  // Rally Argentino
  { s: 'rally', n: 'Gran Premio final (tres etapas)', d: '2026-10-17', e: '2026-10-20', p: 'Sede a confirmar', c: '', r: 'Argentina', st: 'tbc', x: 'Las dos últimas fechas se unificaron en un solo Gran Premio con puntaje especial.' },
  // Stock Car Brasil
  { s: 'stock', n: 'Etapa 10 · Endurance 3 horas', d: '2026-10-18', p: 'Autódromo Internacional Ayrton Senna', c: 'Goiânia, Goiás', r: 'Brasil', st: 'ok' },
  { s: 'stock', n: 'Etapa 11', d: '2026-11-15', p: 'Velopark', c: 'Nova Santa Rita, Rio Grande do Sul', r: 'Brasil', st: 'ok' },
  { s: 'stock', n: 'Etapa 12 · Super Final', d: '2026-12-13', p: 'Autódromo José Carlos Pace (Interlagos)', c: 'São Paulo', r: 'Brasil', st: 'ok' },
  // Copa Truck
  { s: 'truck', n: 'Etapa 8', d: '2026-11-01', p: 'Autódromo de Chapecó', c: 'Chapecó, Santa Catarina', r: 'Brasil', st: 'ok' },
  { s: 'truck', n: 'Etapa 9 (final)', d: '2026-11-29', p: 'Autódromo Internacional Nelson Piquet', c: 'Brasilia', r: 'Brasil', st: 'ok' },
  // NASCAR
  { s: 'cup', n: 'Playoffs · Charlotte Roval', d: '2026-10-11', u: '2026-10-11T19:00:00Z', p: 'Charlotte Motor Speedway (Roval)', c: 'Concord, Carolina del Norte', r: 'Estados Unidos', st: 'ok' },
  { s: 'cup', n: 'Playoffs · Phoenix (Ronda de 8)', d: '2026-10-18', u: '2026-10-18T19:00:00Z', p: 'Phoenix Raceway', c: 'Avondale, Arizona', r: 'Estados Unidos', st: 'ok' },
  { s: 'cup', n: 'Playoffs · Talladega', d: '2026-10-25', u: '2026-10-25T18:00:00Z', p: 'Talladega Superspeedway', c: 'Talladega, Alabama', r: 'Estados Unidos', st: 'ok' },
  { s: 'cup', n: 'Playoffs · Martinsville', d: '2026-11-01', u: '2026-11-01T19:00:00Z', p: 'Martinsville Speedway', c: 'Ridgeway, Virginia', r: 'Estados Unidos', st: 'ok' },
  { s: 'cup', n: 'Carrera por el Campeonato', d: '2026-11-08', u: '2026-11-08T20:00:00Z', p: 'Homestead-Miami Speedway', c: 'Homestead, Florida', r: 'Estados Unidos', st: 'ok' },
  { s: 'xfin', n: 'Carrera por el Campeonato', d: '2026-11-07', p: 'Homestead-Miami Speedway', c: 'Homestead, Florida', r: 'Estados Unidos', st: 'tbc', x: 'Corre el argentino Baltazar Leguizamón en la categoría.' },
  { s: 'truckus', n: 'Carrera por el Campeonato', d: '2026-11-06', p: 'Homestead-Miami Speedway', c: 'Homestead, Florida', r: 'Estados Unidos', st: 'tbc' },
  { s: 'woo', n: 'World Finals', d: '2026-11-01', e: '2026-11-04', p: 'The Dirt Track at Charlotte', c: 'Concord, Carolina del Norte', r: 'Estados Unidos', st: 'tbc', x: 'Fechas según el anuncio de la serie; confirmá en el sitio oficial.' },
  { s: 'usac', n: 'Sprint · Western World Championships (final)', d: '2026-10-23', e: '2026-10-24', p: 'Central Arizona Raceway', c: 'Casa Grande, Arizona', r: 'Estados Unidos', st: 'ok' },
  { s: 'usac', n: 'Midget · Turkey Night Grand Prix (final)', d: '2026-11-28', p: 'Ventura Raceway', c: 'Ventura, California', r: 'Estados Unidos', st: 'ok' },
  // Supercars
  { s: 'sc', n: 'Repco Bathurst 1000', d: '2026-10-11', u: '2026-10-11T00:15:00Z', ap: true, p: 'Mount Panorama', c: 'Bathurst, Nueva Gales del Sur', r: 'Australia', st: 'ok', x: 'En Argentina larga el sábado 10 a la noche.' },
  { s: 'sc', n: 'Finals · Gold Coast 500', d: '2026-10-25', p: 'Surfers Paradise Street Circuit', c: 'Gold Coast, Queensland', r: 'Australia', st: 'tbc', x: 'Fin de semana 23–25 oct. Arranca la definición entre los 10 mejores.' },
  { s: 'sc', n: 'Finals · Sandown 500', d: '2026-11-15', p: 'Sandown Raceway', c: 'Melbourne, Victoria', r: 'Australia', st: 'tbc', x: 'Fin de semana 13–15 nov.' },
  { s: 'sc', n: 'Finals · Adelaide Grand Final', d: '2026-12-06', p: 'Adelaide Street Circuit', c: 'Adelaide', r: 'Australia', st: 'tbc', x: 'Fin de semana 3–6 dic.' },
  // Japón
  { s: 'sgt', n: 'Autopolis', d: '2026-10-18', p: 'Autopolis', c: 'Hita, Ōita', r: 'Japón', st: 'ok' },
  { s: 'sgt', n: 'Motegi · carrera extra + 300 km final', d: '2026-11-07', e: '2026-11-08', p: 'Mobility Resort Motegi', c: 'Motegi, Tochigi', r: 'Japón', st: 'ok' },
  { s: 'sf', n: 'Suzuka · doble carrera final', d: '2026-11-21', e: '2026-11-22', p: 'Suzuka Circuit', c: 'Suzuka, Mie', r: 'Japón', st: 'ok' },
  // Europa
  { s: 'dtm', n: 'Final · Hockenheim', d: '2026-10-10', e: '2026-10-11', p: 'Hockenheimring Baden-Württemberg', c: 'Hockenheim', r: 'Alemania', st: 'ok', x: 'Dos carreras, sábado y domingo.' },
  { s: 'btcc', n: 'Final · Rondas 28, 29 y 30', d: '2026-10-11', p: 'Brands Hatch (trazado GP)', c: 'Kent, Inglaterra', r: 'Reino Unido', st: 'ok' },
];

export const SEASON_STATUS: [string, string][] = [
  ['IndyCar', 'Temporada 2026 terminada el 6 de septiembre en Laguna Seca. Álex Palou fue campeón por quinta vez. La 2027 arranca en marzo.'],
  ['Fórmula E', 'Temporada 12 terminada en agosto. La 13, con el auto Gen4, empieza el 18 de diciembre en Jeddah.'],
  ['Fórmula 3', 'Temporada terminada: la última fecha fue en Madrid, en septiembre.'],
  ['World Rallycross', 'No hay Mundial en 2026: la FIA lo canceló después de 2025.'],
  ['WRC', 'Cerdeña (1–4 oct) fue la última fecha: el Rally de Arabia Saudita se canceló.'],
  ['FIA WEC', 'Qatar y Bahréin se cancelaron. Los reemplazan Barcelona (18 oct) y Monza (8 nov).'],
  ['Fórmula 4 Sudamericana', 'No encontré un calendario oficial 2026 publicado.'],
];
