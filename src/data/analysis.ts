/** Herramientas de análisis y simulación disponibles, y a qué categorías aplican. */
export interface AnalysisTool {
  id: string;
  group: 'telemetry' | 'simulation';
  title: string;
  description: string;
  href: string;
  series: string[];
  /** datos en vivo (se piden al abrir) o de la última carrera procesada por el pipeline */
  live: boolean;
}

export const ANALYSIS_TOOLS: AnalysisTool[] = [
  { id: 'tel-f1', group: 'telemetry', title: 'Telemetría de F1', description: 'Compará la vuelta más rápida de dos pilotos: velocidad, acelerador, freno, marcha y RPM, delta de tiempo y mapa por mini-sectores.', href: '/telemetria/f1', series: ['f1'], live: true },
  { id: 'tel-nascar', group: 'telemetry', title: 'Telemetría de NASCAR', description: 'Tiempo de cada vuelta, posición en carrera y loop data (rating, sobrepasos, vueltas rápidas) de Cup, O’Reilly y Trucks.', href: '/telemetria/nascar', series: ['cup', 'xfin', 'truckus'], live: true },
  { id: 'tel-wec', group: 'telemetry', title: 'Cronometraje del WEC', description: 'Cada vuelta de cada auto con sectores, velocidad punta y piloto al volante, por clase.', href: '/telemetria/wec', series: ['wec'], live: false },
  { id: 'tel-imsa', group: 'telemetry', title: 'Cronometraje de IMSA', description: 'Cada vuelta de GTP, LMP2, GTD Pro y GTD con sectores, velocidad punta y tandas por piloto.', href: '/telemetria/imsa', series: ['imsa'], live: false },
  { id: 'tel-indycar', group: 'telemetry', title: 'Cronometraje de IndyCar', description: 'Vuelta por vuelta con posición y el tiempo en cada tramo del circuito, curva por curva.', href: '/telemetria/indycar', series: ['indycar'], live: false },
  { id: 'sim-titulo', group: 'simulation', title: 'Probabilidades de título', description: 'Simula miles de veces lo que queda de la temporada a partir del rendimiento de cada piloto y calcula quién tiene chances de ser campeón.', href: '/analisis/campeonato', series: ['f1'], live: true },
  { id: 'sim-estrategia', group: 'simulation', title: 'Simulador de estrategia', description: 'Estima la degradación de cada neumático con los datos reales de una carrera y compara estrategias de una y dos paradas.', href: '/analisis/estrategia', series: ['f1'], live: true },
];

export const toolsFor = (serie: string) => ANALYSIS_TOOLS.filter((t) => t.series.includes(serie));
