import type { SeriesInfo } from './types';

/**
 * Datos de cada categoría (menos la F1, que viene en vivo de la API).
 * Acá van los equipos con su staff y los pilotos cargados a mano; las posiciones vienen del pipeline
 * (src/data/standings-store.ts) y las fichas técnicas de src/data/tech.ts.
 */
export const SERIES_INFO: Record<string, SeriesInfo> = {
  indycar: {
    teams: [
      { name: 'Chip Ganassi Racing', car: 'Dallara IR-18', engine: 'Honda', drivers: ['Álex Palou', 'Scott Dixon', 'Kyffin Simpson'], staff: [['Dueño', 'Chip Ganassi']] },
      { name: 'Team Penske', car: 'Dallara IR-18', engine: 'Chevrolet', drivers: ['Josef Newgarden', 'Scott McLaughlin', 'David Malukas'], staff: [['Dueño', 'Roger Penske']] },
      { name: 'Arrow McLaren', car: 'Dallara IR-18', engine: 'Chevrolet', drivers: ["Pato O'Ward", 'Christian Lundgaard', 'Nolan Siegel'], staff: [['Jefe de equipo', 'Tony Kanaan'], ['CEO McLaren Racing', 'Zak Brown']] },
      { name: 'Andretti Global', car: 'Dallara IR-18', engine: 'Honda', drivers: ['Kyle Kirkwood', 'Marcus Ericsson', 'Will Power'], staff: [['Presidente y dueño', 'Dan Towriss']] },
      { name: 'Meyer Shank Racing', car: 'Dallara IR-18', engine: 'Honda', drivers: ['Felix Rosenqvist', 'Marcus Armstrong'], staff: [['Dueños', 'Mike Shank y Jim Meyer']] },
      { name: 'Rahal Letterman Lanigan Racing', car: 'Dallara IR-18', engine: 'Honda', drivers: ['Graham Rahal', 'Louis Foster', 'Mick Schumacher'], staff: [['Dueños', 'Bobby Rahal, David Letterman y Mike Lanigan']] },
      { name: 'Juncos Hollinger Racing', car: 'Dallara IR-18', engine: 'Chevrolet', drivers: ['Rinus VeeKay', 'Sting Ray Robb'], staff: [['Dueños', 'Ricardo Juncos (argentino) y Brad Hollinger']] },
      { name: 'Ed Carpenter Racing', car: 'Dallara IR-18', engine: 'Chevrolet', drivers: ['Alexander Rossi', 'Christian Rasmussen', 'Ed Carpenter'], staff: [['Dueño', 'Ed Carpenter']] },
      { name: 'A. J. Foyt Enterprises', car: 'Dallara IR-18', engine: 'Chevrolet', drivers: ['Santino Ferrucci', 'Caio Collet'], staff: [['Dueño', 'A. J. Foyt'], ['Presidente', 'Larry Foyt']] },
      { name: 'Dale Coyne Racing', car: 'Dallara IR-18', engine: 'Honda', drivers: ['Romain Grosjean', 'Dennis Hauger'], staff: [['Dueño', 'Dale Coyne']] },
    ],
    drivers: [
      { name: 'Josef Newgarden', number: '2', team: 'Team Penske', car: 'Chevrolet' },
      { name: 'Scott McLaughlin', number: '3', team: 'Team Penske', car: 'Chevrolet' },
      { name: 'Caio Collet', number: '4', team: 'A. J. Foyt Enterprises', car: 'Chevrolet' },
      { name: "Pato O'Ward", number: '5', team: 'Arrow McLaren', car: 'Chevrolet' },
      { name: 'Nolan Siegel', number: '6', team: 'Arrow McLaren', car: 'Chevrolet' },
      { name: 'Christian Lundgaard', number: '7', team: 'Arrow McLaren', car: 'Chevrolet' },
      { name: 'Kyffin Simpson', number: '8', team: 'Chip Ganassi Racing', car: 'Honda' },
      { name: 'Scott Dixon', number: '9', team: 'Chip Ganassi Racing', car: 'Honda' },
      { name: 'Álex Palou', number: '10', team: 'Chip Ganassi Racing', car: 'Honda', facts: [['Títulos IndyCar', '5 (2021, 2023, 2024, 2025, 2026)']] },
      { name: 'David Malukas', number: '12', team: 'Team Penske', car: 'Chevrolet' },
      { name: 'Santino Ferrucci', number: '14', team: 'A. J. Foyt Enterprises', car: 'Chevrolet' },
      { name: 'Graham Rahal', number: '15', team: 'Rahal Letterman Lanigan Racing', car: 'Honda' },
      { name: 'Romain Grosjean', number: '18', team: 'Dale Coyne Racing', car: 'Honda' },
      { name: 'Dennis Hauger', number: '19', team: 'Dale Coyne Racing', car: 'Honda' },
      { name: 'Alexander Rossi', number: '20', team: 'Ed Carpenter Racing', car: 'Chevrolet' },
      { name: 'Christian Rasmussen', number: '21', team: 'Ed Carpenter Racing', car: 'Chevrolet' },
      { name: 'Will Power', number: '26', team: 'Andretti Global', car: 'Honda' },
      { name: 'Kyle Kirkwood', number: '27', team: 'Andretti Global', car: 'Honda' },
      { name: 'Marcus Ericsson', number: '28', team: 'Andretti Global', car: 'Honda' },
      { name: 'Ed Carpenter', number: '33', team: 'Ed Carpenter Racing', car: 'Chevrolet' },
      { name: 'Louis Foster', number: '45', team: 'Rahal Letterman Lanigan Racing', car: 'Honda' },
      { name: 'Mick Schumacher', number: '47', team: 'Rahal Letterman Lanigan Racing', car: 'Honda' },
      { name: 'Felix Rosenqvist', number: '60', team: 'Meyer Shank Racing', car: 'Honda' },
      { name: 'Marcus Armstrong', number: '66', team: 'Meyer Shank Racing', car: 'Honda' },
      { name: 'Rinus VeeKay', number: '76', team: 'Juncos Hollinger Racing', car: 'Chevrolet' },
      { name: 'Sting Ray Robb', number: '77', team: 'Juncos Hollinger Racing', car: 'Chevrolet' },
    ],
  },

  wec: {
    teams: [
      { name: 'Toyota Racing', car: 'Toyota TR010 Hybrid (LMH)', engine: 'V6 3.5 L biturbo + híbrido', drivers: ['Sébastien Buemi', 'Brendon Hartley', 'Ryō Hirakawa', 'Mike Conway', 'Kamui Kobayashi', 'Nyck de Vries'], staff: [['Jefe de equipo', 'Kamui Kobayashi (también piloto)']] },
      { name: 'BMW M Team WRT', car: 'BMW M Hybrid V8 (LMDh, chasis Dallara)', engine: 'V8 4.0 L biturbo + híbrido', drivers: ['Robin Frijns', 'René Rast', 'Sheldon van der Linde', 'Kevin Magnussen', 'Raffaele Marciello', 'Dries Vanthoor'], staff: [['Jefe de WRT', 'Vincent Vosse']] },
      { name: 'Ferrari AF Corse', car: 'Ferrari 499P (LMH)', engine: 'V6 3.0 L biturbo + híbrido', drivers: ['James Calado', 'Antonio Giovinazzi', 'Alessandro Pier Guidi', 'Antonio Fuoco', 'Miguel Molina', 'Nicklas Nielsen'], staff: [['Jefe de resistencia Ferrari', 'Antonello Coletta'], ['Dueño de AF Corse', 'Amato Ferrari']], facts: [['Ganador de Le Mans', '2023, 2024 y 2025']] },
      { name: 'Alpine Endurance Team', car: 'Alpine A424 (LMDh, chasis Oreca)', engine: 'V6 3.4 L turbo + híbrido', drivers: ['Ferdinand Habsburg', 'Charles Milesi', 'António Félix da Costa', 'Jules Gounon', 'Frédéric Makowiecki'], facts: [['Nota', 'Última temporada de Alpine en el WEC']] },
      { name: 'Cadillac Hertz Team Jota', car: 'Cadillac V-Series.R (LMDh, chasis Dallara)', engine: 'V8 5.5 L atmosférico + híbrido', drivers: ['Norman Nato', 'Will Stevens', 'Earl Bamber', 'Sébastien Bourdais', 'Jack Aitken'], staff: [['Jefe de Jota', 'Sam Hignett']] },
      { name: 'Aston Martin THOR Team', car: 'Aston Martin Valkyrie AMR-LMH', engine: 'V12 6.5 L atmosférico (sin híbrido)', drivers: ['Tom Gamble', 'Harry Tincknell', 'Alex Riberas', 'Marco Sørensen'], staff: [['Jefe de equipo', 'Ian James (Heart of Racing)']] },
      { name: 'Peugeot TotalEnergies', car: 'Peugeot 9X8 (LMH)', engine: 'V6 2.6 L biturbo + híbrido', drivers: ['Paul di Resta', 'Stoffel Vandoorne', 'Nick Cassidy', 'Loïc Duval', 'Malthe Jakobsen', 'Théo Pourchaire'] },
      { name: 'Genesis Magma Racing', car: 'Genesis GMR-001 (LMDh, chasis Oreca)', engine: 'V8 3.2 L turbo + híbrido', drivers: ['Pipo Derani', 'André Lotterer', 'Mathys Jaubert', 'Paul-Loup Chatin', 'Mathieu Jaminet', 'Daniel Juncadella'], staff: [['Jefe de equipo', 'Cyril Abiteboul']], facts: [['Debut', '2026']] },
    ],
  },

  cup: {
    teams: [
      { name: 'Hendrick Motorsports', car: 'Chevrolet Camaro ZL1', drivers: ['Kyle Larson', 'Chase Elliott', 'William Byron', 'Alex Bowman'], staff: [['Dueño', 'Rick Hendrick'], ['Jefe de mecánicos de Larson', 'Cliff Daniels']] },
      { name: 'Joe Gibbs Racing', car: 'Toyota Camry XSE', drivers: ['Denny Hamlin', 'Christopher Bell', 'Chase Briscoe', 'Ty Gibbs'], staff: [['Dueño', 'Joe Gibbs']] },
      { name: 'Team Penske', car: 'Ford Mustang Dark Horse', drivers: ['Joey Logano', 'Ryan Blaney', 'Austin Cindric'], staff: [['Dueño', 'Roger Penske']] },
      { name: '23XI Racing', car: 'Toyota Camry XSE', drivers: ['Tyler Reddick', 'Bubba Wallace', 'Riley Herbst'], staff: [['Dueños', 'Michael Jordan, Denny Hamlin y Curtis Polk']] },
      { name: 'RFK Racing', car: 'Ford Mustang Dark Horse', drivers: ['Chris Buescher', 'Brad Keselowski', 'Ryan Preece'], staff: [['Dueños', 'Jack Roush y Brad Keselowski']] },
      { name: 'Trackhouse Racing', car: 'Chevrolet Camaro ZL1', drivers: ['Ross Chastain', 'Shane van Gisbergen'], staff: [['Dueño', 'Justin Marks']] },
      { name: 'Spire Motorsports', car: 'Chevrolet Camaro ZL1', drivers: ['Carson Hocevar', 'Daniel Suárez', 'Michael McDowell'] },
      { name: 'Richard Childress Racing', car: 'Chevrolet Camaro ZL1', drivers: ['Kyle Busch', 'Austin Dillon'], staff: [['Dueño', 'Richard Childress']] },
      { name: 'Front Row Motorsports', car: 'Ford Mustang Dark Horse', drivers: ['Noah Gragson', 'Todd Gilliland', 'Zane Smith'], staff: [['Dueño', 'Bob Jenkins']] },
      { name: 'Legacy Motor Club', car: 'Toyota Camry XSE', drivers: ['John Hunter Nemechek', 'Erik Jones'], staff: [['Dueño', 'Jimmie Johnson']] },
      { name: 'Wood Brothers Racing', car: 'Ford Mustang Dark Horse', drivers: ['Josh Berry'], staff: [['Dueños', 'Eddie y Len Wood']] },
      { name: 'Haas Factory Team', car: 'Chevrolet Camaro ZL1', drivers: ['Cole Custer'], staff: [['Dueño', 'Gene Haas']] },
    ],
  },

  tc2000: {
    teams: [
      { name: 'Toyota Gazoo Racing YPF Infinia', car: 'Toyota Corolla Cross', drivers: ['Matías Rossi', 'Emiliano Stang', 'Valentín Yankelevich'], facts: [['Tipo', 'Equipo oficial']] },
      { name: 'YPF Elaion Auro Pro Racing', car: 'Chevrolet Tracker', drivers: ['Franco Vivian', 'Franco Morillo'], facts: [['Tipo', 'Equipo oficial']] },
      { name: 'YPF Honda RV Racing', car: 'Honda ZR-V', drivers: ['Facundo Aldrighetti', 'Francisco Monarca'], facts: [['Tipo', 'Equipo oficial']] },
      { name: 'Corsi Sport', car: 'Toyota Corolla Cross', drivers: ['Gabriel Ponce de León', 'Tomás Fernández'] },
      { name: 'Pro Racing', car: 'Chevrolet Cruze', drivers: ['Franco Riva', 'Nicolás Traut'] },
      { name: 'Halcón Motorsport', car: 'Volkswagen Nivus', drivers: ['Lucas Carabajal', 'Nicolás Palau'] },
      { name: 'ATR Racing', car: 'Fiat Pulse / Fiat Cronos', drivers: ['Marcelo Ciarrochi', 'Benjamín Squaglia'] },
      { name: 'Pfening Competición', car: 'Nissan Kicks', drivers: ['Diego Ciantini'] },
    ],
    drivers: [
      { name: 'Matías Rossi', number: '1', team: 'Toyota Gazoo Racing YPF Infinia', car: 'Toyota Corolla Cross' },
      { name: 'Emiliano Stang', number: '162', team: 'Toyota Gazoo Racing YPF Infinia', car: 'Toyota Corolla Cross' },
      { name: 'Valentín Yankelevich', number: '5', team: 'Toyota Gazoo Racing YPF Infinia', car: 'Toyota Corolla Cross' },
      { name: 'Facundo Aldrighetti', number: '83', team: 'YPF Honda RV Racing', car: 'Honda ZR-V' },
      { name: 'Francisco Monarca', number: '23', team: 'YPF Honda RV Racing', car: 'Honda ZR-V' },
      { name: 'Franco Vivian', number: '57', team: 'YPF Elaion Auro Pro Racing', car: 'Chevrolet Tracker' },
      { name: 'Franco Morillo', number: '64', team: 'YPF Elaion Auro Pro Racing', car: 'Chevrolet Tracker' },
      { name: 'Nicolás Traut', number: '7', team: 'Pro Racing', car: 'Chevrolet Cruze' },
      { name: 'Franco Riva', number: '78', team: 'Pro Racing', car: 'Chevrolet Cruze' },
      { name: 'Gabriel Ponce de León', number: '32', team: 'Corsi Sport', car: 'Toyota Corolla Cross' },
      { name: 'Tomás Fernández', number: '11', team: 'Corsi Sport', car: 'Toyota Corolla Cross' },
      { name: 'Diego Ciantini', number: '115', team: 'Pfening Competición', car: 'Nissan Kicks' },
      { name: 'Marcelo Ciarrochi', number: '25', team: 'ATR Racing', car: 'Fiat Pulse' },
      { name: 'Benjamín Squaglia', number: '86', team: 'ATR Racing', car: 'Fiat Cronos' },
      { name: 'Nicolás Palau', number: '96', team: 'Halcón Motorsport', car: 'Volkswagen Nivus' },
      { name: 'Lucas Carabajal', team: 'Halcón Motorsport', car: 'Volkswagen Nivus' },
    ],
  },

};
