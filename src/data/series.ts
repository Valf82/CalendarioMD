import type { Level, Series } from './types';

export const LEVELS: Record<Level, string> = {
  mundial: 'Mundial',
  inter: 'Internacional',
  nacional: 'Nacional',
};

const list: Series[] = [
  { id: 'f1', name: 'Fórmula 1', level: 'mundial', type: 'Monoplaza', tv: ['Fox Sports', 'Disney+ Premium', 'F1 TV Pro'], url: 'https://www.formula1.com/en/racing/2026' },
  { id: 'indycar', name: 'IndyCar', level: 'mundial', type: 'Monoplaza', tv: ['ESPN / Disney+ (Latam)'], verifyTv: true, url: 'https://www.indycar.com' },
  { id: 'fe', name: 'Fórmula E', level: 'mundial', type: 'Monoplaza', tv: ['App Formula E / YouTube'], verifyTv: true, url: 'https://www.fiaformulae.com' },
  { id: 'wec', name: 'FIA WEC', level: 'mundial', type: 'Resistencia', tv: ['FIA WEC TV (app)', 'ESPN / Disney+'], verifyTv: true, url: 'https://www.fiawec.com' },
  { id: 'imsa', name: 'IMSA WeatherTech', level: 'mundial', type: 'Resistencia', tv: ['IMSA TV en YouTube (fuera de EE.UU.)'], url: 'https://www.imsa.com' },
  { id: 'igtc', name: 'Intercontinental GT Challenge', level: 'mundial', type: 'GT', tv: ['GT World en YouTube (gratis)'], url: 'https://www.intercontinentalgtchallenge.com' },
  { id: 'wrc', name: 'WRC', level: 'mundial', type: 'Rally', tv: ['Rally.TV'], url: 'https://www.wrc.com' },

  { id: 'f2', name: 'Fórmula 2', level: 'inter', type: 'Monoplaza', tv: ['F1 TV Pro', 'Disney+ Premium'], url: 'https://www.fiaformula2.com' },
  { id: 'tcrsa', name: 'TCR South America', level: 'inter', type: 'Turismo', tv: ['YouTube TCR South America'], verifyTv: true, url: 'https://www.tcr-worldranking.com' },
  { id: 'pcc', name: 'Porsche Cup Brasil', level: 'inter', type: 'GT', tv: ['Band', 'YouTube Porsche Cup'], verifyTv: true, url: 'https://www.porschecupbrasil.com.br' },
  { id: 'elms', name: 'European Le Mans Series', level: 'inter', type: 'Resistencia', tv: ['YouTube ELMS (gratis)'], url: 'https://www.europeanlemansseries.com' },
  { id: 'alms', name: 'Asian / Winter Le Mans Series', level: 'inter', type: 'Resistencia', tv: ['YouTube Asian Le Mans Series'], verifyTv: true, url: 'https://www.asianlemansseries.com' },
  { id: 'gtwc', name: 'GT World Challenge', level: 'inter', type: 'GT', tv: ['GT World en YouTube (gratis)'], url: 'https://www.gt-world-challenge-europe.com' },

  { id: 'tc', name: 'Turismo Carretera', level: 'nacional', type: 'Turismo', tv: ['TV Pública', 'DeporTV', 'MotorPlay'], url: 'https://www.actc.org.ar' },
  { id: 'tcp', name: 'TC Pista', level: 'nacional', type: 'Turismo', tv: ['MotorPlay', 'DeporTV'], verifyTv: true, url: 'https://www.actc.org.ar' },
  { id: 'tcm', name: 'TC Mouras / TC Pista Mouras', level: 'nacional', type: 'Turismo', tv: ['MotorPlay'], verifyTv: true, url: 'https://www.actc.org.ar' },
  { id: 'tn', name: 'Turismo Nacional', level: 'nacional', type: 'Turismo', tv: ['Streaming oficial APAT'], verifyTv: true, url: 'https://apat.org.ar/carreras/calendario' },
  { id: 'tc2000', name: 'TC2000', level: 'nacional', type: 'Turismo', tv: ['eltrece (Carburando)'], verifyTv: true, url: 'https://tc2000.com.ar' },
  { id: 'top', name: 'Top Race', level: 'nacional', type: 'Turismo', tv: ['Streaming oficial Top Race'], verifyTv: true, url: 'https://www.toprace.com.ar/toprace/calendario.html' },
  { id: 'rally', name: 'Rally Argentino', level: 'nacional', type: 'Rally', tv: ['Redes oficiales del campeonato'], verifyTv: true },
  { id: 'stock', name: 'Stock Car Pro Series', level: 'nacional', type: 'Stock', tv: ['Band / BandSports (Brasil)', 'YouTube Stock Car'], verifyTv: true, url: 'https://www.stockcar.com.br' },
  { id: 'truck', name: 'Copa Truck', level: 'nacional', type: 'Stock', tv: ['Band / Canal Acelerados (Brasil)'], verifyTv: true, url: 'https://www.copatruck.com.br' },
  { id: 'cup', name: 'NASCAR Cup Series', level: 'nacional', type: 'Stock', tv: ['ESPN / Disney+ (Latam)', 'NASCAR app'], verifyTv: true, url: 'https://www.nascar.com' },
  { id: 'xfin', name: "NASCAR O'Reilly Series", level: 'nacional', type: 'Stock', tv: ['ESPN / Disney+ (Latam)', 'NASCAR app'], verifyTv: true, url: 'https://www.nascar.com' },
  { id: 'truckus', name: 'NASCAR Craftsman Trucks', level: 'nacional', type: 'Stock', tv: ['ESPN / Disney+ (Latam)', 'NASCAR app'], verifyTv: true, url: 'https://www.nascar.com' },
  { id: 'woo', name: 'World of Outlaws', level: 'nacional', type: 'Tierra', tv: ['DIRTVision'], url: 'https://www.woosprint.com' },
  { id: 'usac', name: 'USAC', level: 'nacional', type: 'Tierra', tv: ['FloRacing'], url: 'https://www.usacracing.com' },
  { id: 'sc', name: 'Supercars', level: 'nacional', type: 'Turismo', tv: ['SuperView (streaming internacional)'], url: 'https://www.supercars.com' },
  { id: 'sgt', name: 'Super GT', level: 'nacional', type: 'GT', tv: ['YouTube oficial Super GT'], verifyTv: true, url: 'https://supergt.net' },
  { id: 'sf', name: 'Super Formula', level: 'nacional', type: 'Monoplaza', tv: ['SF Go (app oficial)'], verifyTv: true, url: 'https://superformula.net' },
  { id: 'dtm', name: 'DTM', level: 'nacional', type: 'GT', tv: ['YouTube DTM (internacional)'], url: 'https://www.dtm.com' },
  { id: 'btcc', name: 'BTCC', level: 'nacional', type: 'Turismo', tv: ['ITVX (Reino Unido)', 'YouTube BTCC'], verifyTv: true, url: 'https://www.btcc.net' },
];

export const SERIES_LIST = list;
export const SERIES: Record<string, Series> = Object.fromEntries(list.map((s) => [s.id, s]));
