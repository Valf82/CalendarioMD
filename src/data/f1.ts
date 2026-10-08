import type { Facts } from './types';

/**
 * Datos fijos de las escuderías de F1 2026, indexados por el constructorId de la API (Jolpica).
 * Posiciones, puntos y pilotos vienen en vivo; esto es lo que la API no tiene.
 * Staff al inicio de la temporada 2026: puede haber cambios durante el año.
 */
export interface F1TeamInfo {
  name: string;
  fullName: string;
  color: string;
  base: string;
  car: string;
  powerUnit: string;
  titles: string;
  staff: Facts;
  /** ingeniero de pista por driverId de la API */
  raceEngineers: Record<string, string>;
}

export const F1_TEAMS: Record<string, F1TeamInfo> = {
  mercedes: {
    name: 'Mercedes',
    fullName: 'Mercedes-AMG Petronas F1 Team',
    color: '#00D7B6',
    base: 'Brackley (Reino Unido); motores en Brixworth',
    car: 'W17',
    powerUnit: 'Mercedes',
    titles: '8 de constructores (2014–2021)',
    staff: [
      ['Jefe de equipo y CEO', 'Toto Wolff'],
      ['Director técnico', 'James Allison'],
      ['Director de ingeniería en pista', 'Andrew Shovlin'],
      ['Jefa de estrategia', 'Rosie Wait'],
      ['Jefe de ingeniería de carrera', 'Peter Bonnington'],
    ],
    raceEngineers: { antonelli: 'Peter Bonnington', russell: 'Marcus Dudley' },
  },
  ferrari: {
    name: 'Ferrari',
    fullName: 'Scuderia Ferrari HP',
    color: '#ED1131',
    base: 'Maranello (Italia)',
    car: 'SF-26',
    powerUnit: 'Ferrari',
    titles: '16 de constructores',
    staff: [
      ['Jefe de equipo', 'Frédéric Vasseur'],
      ['Director técnico (chasis)', 'Loïc Serra'],
      ['Director técnico (motor)', 'Enrico Gualtieri'],
      ['Jefe de estrategia', 'Ravin Jain'],
    ],
    raceEngineers: { leclerc: 'Bryan Bozzi', hamilton: 'Carlos Santi' },
  },
  mclaren: {
    name: 'McLaren',
    fullName: 'McLaren Mastercard F1 Team',
    color: '#F47600',
    base: 'Woking (Reino Unido)',
    car: 'MCL40',
    powerUnit: 'Mercedes',
    titles: '10 de constructores (el último en 2025)',
    staff: [
      ['CEO de McLaren Racing', 'Zak Brown'],
      ['Jefe de equipo', 'Andrea Stella'],
      ['Director deportivo', 'Will Courtenay (ex jefe de estrategia de Red Bull)'],
      ['Director de carrera', 'Randeep Singh'],
      ['Director de ingeniería de carrera', 'Will Joseph'],
    ],
    raceEngineers: { norris: 'Will Joseph', piastri: 'Tom Stallard' },
  },
  red_bull: {
    name: 'Red Bull',
    fullName: 'Oracle Red Bull Racing',
    color: '#4781D7',
    base: 'Milton Keynes (Reino Unido)',
    car: 'RB22',
    powerUnit: 'Red Bull Ford (primer motor propio)',
    titles: '6 de constructores',
    staff: [
      ['Jefe de equipo y CEO', 'Laurent Mekies'],
      ['Director técnico', 'Pierre Waché'],
      ['Jefa de estrategia', 'Hannah Schmitz'],
    ],
    raceEngineers: { max_verstappen: 'Gianpiero Lambiase', hadjar: 'Richard Wood' },
  },
  aston_martin: {
    name: 'Aston Martin',
    fullName: 'Aston Martin Aramco F1 Team',
    color: '#229971',
    base: 'Silverstone (Reino Unido)',
    car: 'AMR26',
    powerUnit: 'Honda',
    titles: 'Sin títulos',
    staff: [
      ['Jefe de equipo y socio técnico', 'Adrian Newey'],
    ],
    raceEngineers: { alonso: 'Chris Cronin / Andrew Vizard', stroll: 'Gary Gannon' },
  },
  alpine: {
    name: 'Alpine',
    fullName: 'BWT Alpine F1 Team',
    color: '#00A1E8',
    base: 'Enstone (Reino Unido)',
    car: 'A526',
    powerUnit: 'Mercedes (primer año como cliente)',
    titles: '2 de constructores como Renault (2005 y 2006)',
    staff: [
      ['Asesor ejecutivo (jefe de hecho)', 'Flavio Briatore'],
      ['Director general', 'Steve Nielsen'],
      ['Director técnico', 'David Sanchez'],
    ],
    raceEngineers: { gasly: 'Josh Peckett', colapinto: 'Stuart Barlow' },
  },
  williams: {
    name: 'Williams',
    fullName: 'Atlassian Williams Racing',
    color: '#1868DB',
    base: 'Grove (Reino Unido)',
    car: 'FW48',
    powerUnit: 'Mercedes',
    titles: '9 de constructores',
    staff: [
      ['Jefe de equipo', 'James Vowles'],
      ['Director técnico general', 'Pat Fry'],
    ],
    raceEngineers: { albon: 'James Urwin', sainz: 'Gaetan Jego' },
  },
  rb: {
    name: 'Racing Bulls',
    fullName: 'Visa Cash App Racing Bulls',
    color: '#6C98FF',
    base: 'Faenza (Italia)',
    car: 'VCARB 03',
    powerUnit: 'Red Bull Ford',
    titles: 'Sin títulos',
    staff: [
      ['Jefe de equipo', 'Alan Permane'],
      ['Director técnico', 'Dan Fallows'],
    ],
    raceEngineers: { lawson: 'Alexandre Iliopoulos', arvid_lindblad: 'Pierre Hamelin' },
  },
  haas: {
    name: 'Haas',
    fullName: 'TGR Haas F1 Team',
    color: '#9C9FA2',
    base: 'Kannapolis (EE.UU.) y Banbury (Reino Unido)',
    car: 'VF-26',
    powerUnit: 'Ferrari',
    titles: 'Sin títulos',
    staff: [
      ['Jefe de equipo', 'Ayao Komatsu'],
      ['Jefa de estrategia', 'Carine Cridelich'],
    ],
    raceEngineers: { ocon: 'Laura Müller', bearman: "Ronan O'Hare" },
  },
  audi: {
    name: 'Audi',
    fullName: 'Audi F1 Team',
    color: '#BB0A30',
    base: 'Hinwil (Suiza); motores en Neuburg (Alemania)',
    car: 'R26',
    powerUnit: 'Audi (motor propio)',
    titles: 'Sin títulos (primer año como Audi, ex Sauber)',
    staff: [
      ['CEO y jefe de equipo', 'Mattia Binotto'],
      ['Director técnico', 'James Key'],
    ],
    raceEngineers: { bortoleto: 'José Manuel López', hulkenberg: 'Steven Petrik' },
  },
  cadillac: {
    name: 'Cadillac',
    fullName: 'Cadillac F1 Team',
    color: '#C9C9C9',
    base: 'Silverstone (Reino Unido) y Fishers, Indiana (EE.UU.)',
    car: 'MAC-26',
    powerUnit: 'Ferrari (cliente hasta tener motor propio)',
    titles: 'Sin títulos (debut en 2026)',
    staff: [
      ['Jefe de equipo', 'Graeme Lowdon'],
      ['Director técnico general', 'Nick Chester'],
    ],
    raceEngineers: { bottas: 'John Howard', perez: 'Carlo Pasetti' },
  },
};


export const NATIONALITY_ES: Record<string, string> = {
  Argentine: 'Argentina', Australian: 'Australia', Brazilian: 'Brasil', British: 'Reino Unido',
  Canadian: 'Canadá', Dutch: 'Países Bajos', Finnish: 'Finlandia', French: 'Francia',
  German: 'Alemania', Italian: 'Italia', Japanese: 'Japón', Mexican: 'México',
  Monegasque: 'Mónaco', 'New Zealander': 'Nueva Zelanda', Spanish: 'España', Thai: 'Tailandia',
  American: 'Estados Unidos', Swiss: 'Suiza', Austrian: 'Austria', Danish: 'Dinamarca',
  Chinese: 'China', Swedish: 'Suecia', Belgian: 'Bélgica',
};
