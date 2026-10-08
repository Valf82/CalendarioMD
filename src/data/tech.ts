import type { TechSheet, TechVariant } from './types';

/**
 * Fichas técnicas por categoría y por auto/motor.
 * Fuentes: reglamentos técnicos y fichas oficiales de equipos y fabricantes; se citan en cada ficha.
 * "≈" = valor aproximado o que el BoP (balance de prestaciones) ajusta carrera a carrera.
 */

const FIA_F1 = { label: 'FIA · Reglamento técnico de unidades de potencia 2026', url: 'https://www.fia.com/sites/default/files/fia_2026_formula_1_technical_regulations_pu_-_issue_5_-_2023-12-06.pdf' };
const F1_GUIDE = { label: 'Formula 1 · Guía de los reglamentos 2026', url: 'https://www.formula1.com/en/latest/article/the-beginners-guide-to-the-2026-regulations.6j0tS0hrHG2T01tpmK6XYz' };

export const SERIES_TECH: Record<string, TechSheet> = {
  f1: {
    model: 'Reglamento técnico 2026',
    summary: 'Autos más chicos y livianos, la mitad de la potencia eléctrica y alerones activos en lugar del DRS.',
    sections: [
      {
        title: 'Motor de combustión',
        facts: [
          ['Arquitectura', 'V6 a 90°, 1.6 L (1600 cm³), 4 válvulas por cilindro (24)'],
          ['Diámetro × carrera', '80 × 53 mm'],
          ['Régimen máximo', '15.000 rpm'],
          ['Alimentación', 'Turbo único (máx. 150.000 rpm), inyección directa a 350 bar, un inyector por cilindro'],
          ['Límite de combustible', 'Flujo de energía máximo de 3000 MJ/h: se regula la energía, no la masa de nafta'],
          ['Relación de compresión', '16:1 (era 18:1 hasta 2025)'],
          ['Potencia', '≈ 400 kW (≈ 540 CV) del motor térmico'],
          ['Peso mínimo de la unidad', '185 kg'],
        ],
      },
      {
        title: 'Sistema híbrido (ERS)',
        facts: [
          ['MGU-K', '350 kW (antes 120 kW), hasta 60.000 rpm'],
          ['MGU-H', 'Eliminado'],
          ['Reparto', '≈ 50 % combustión / 50 % eléctrico (antes ≈ 80/20)'],
          ['Batería', 'Iones de litio, peso mínimo 35 kg, hasta 1000 V'],
          ['Energía', 'Ventana de uso de 4 MJ por vuelta; recuperación de hasta ≈ 9 MJ por vuelta según el circuito'],
          ['Modo adelantamiento', 'Energía eléctrica extra para el auto que está a menos de 1 segundo del de adelante'],
        ],
      },
      {
        title: 'Aerodinámica',
        facts: [
          ['Alerones activos', 'Delantero y trasero móviles: modo curva (cerrado, máxima carga) y modo recta (abierto, mínima resistencia)'],
          ['DRS', 'Eliminado'],
          ['Carga y resistencia', '≈ 30 % menos carga y ≈ 55 % menos resistencia que en 2025 (estimación FIA)'],
          ['Piso', 'Más plano y angosto, con menos efecto suelo; sin alerón inferior (beam wing)'],
        ],
      },
      {
        title: 'Chasis, medidas y peso',
        facts: [
          ['Monocasco', 'Fibra de carbono con celda de supervivencia y halo'],
          ['Distancia entre ejes', 'Máx. 3400 mm (200 mm menos)'],
          ['Ancho', 'Máx. 1900 mm (100 mm menos)'],
          ['Peso mínimo', '768 kg con piloto, sin combustible (32 kg menos)'],
          ['Seguridad', 'Arco antivuelco homologado a 20 g; nariz de absorción en dos etapas'],
        ],
      },
      {
        title: 'Neumáticos',
        facts: [
          ['Proveedor', 'Pirelli: P Zero (5 compuestos slick) y Cinturato (intermedio y lluvia)'],
          ['Llantas', '18"'],
          ['Cambios', 'Banda 25 mm más angosta adelante y 30 mm atrás; diámetro 15 mm menor adelante y 10 mm atrás'],
        ],
      },
      {
        title: 'Combustible y reglas de uso',
        facts: [
          ['Combustible', '100 % sustentable (sin origen fósil)'],
          ['Asignación por piloto', '4 motores térmicos, turbos y escapes; 3 MGU-K, baterías y electrónicas de control por temporada'],
        ],
      },
    ],
    sources: [FIA_F1, F1_GUIDE, { label: 'Mercedes-AMG F1 · Ficha técnica W17', url: 'https://www.mercedesamgf1.com/f1-w17-2026-technical-specifications' }],
  },

  indycar: {
    model: 'Dallara DW12 (kit IR-18) con motor híbrido Chevrolet o Honda',
    summary: 'Auto único para todos; cambia el motor y la configuración aerodinámica según el tipo de circuito.',
    sections: [
      {
        title: 'Motor',
        facts: [
          ['Arquitectura', 'V6 2.2 L biturbo (turbos BorgWarner), inyección directa'],
          ['Fabricantes', 'Chevrolet (preparado por Ilmor) y Honda (HRC)'],
          ['Régimen máximo', '12.000 rpm'],
          ['Potencia', '≈ 550 HP en superóvalos, 575 HP en óvalos de 1,5 millas, 650 HP en óvalos cortos y circuitos'],
          ['Push-to-pass', '+50 HP durante un tiempo total limitado por carrera (solo en circuitos)'],
        ],
      },
      {
        title: 'Sistema híbrido (desde 2024)',
        facts: [
          ['Almacenamiento', 'Supercondensadores (no batería)'],
          ['Motogenerador', 'Integrado en la campana de embrague, desarrollado en conjunto por Chevrolet y Honda'],
          ['Uso', 'Recupera energía al frenar; el piloto decide cuándo desplegarla (≈ +60 HP)'],
          ['Extra', 'Permite arrancar el motor desde el auto, sin arrancador externo'],
          ['Potencia combinada', 'Hasta ≈ 900 HP sumando push-to-pass e híbrido'],
        ],
      },
      {
        title: 'Transmisión',
        facts: [['Caja', 'Xtrac #1011, secuencial de 6 marchas con levas al volante']],
      },
      {
        title: 'Chasis y suspensión',
        facts: [
          ['Monocasco', 'Fibra de carbono con estructura de kevlar en panal de abejas'],
          ['Suspensión', 'Doble brazo (A-arm) con push-rod, tercer resorte y barra estabilizadora, adelante y atrás'],
          ['Protección', 'Aeroscreen (pantalla con estructura de titanio)'],
        ],
      },
      {
        title: 'Frenos y neumáticos',
        facts: [
          ['Frenos', 'PFC: discos y pastillas de carbono, cálipers ZR90 de 4 pistones (óvalos) o 6 pistones (circuitos)'],
          ['Neumáticos', 'Firestone Firehawk (slick y lluvia), llantas OZ o BBS'],
        ],
      },
      {
        title: 'Medidas y combustible',
        facts: [
          ['Largo', '5123 mm en circuitos y óvalos cortos; 5012 mm en superóvalos'],
          ['Ancho', '1918–1943 mm'],
          ['Alto', '1016 mm con cámara'],
          ['Combustible', 'Shell, 100 % renovable'],
        ],
      },
      {
        title: 'Lo que viene',
        facts: [['2028', 'Nuevo Dallara IR-28: 45 kg más liviano, batería con 14 veces más energía que los supercondensadores y caja Xtrac 11 kg más liviana']],
      },
    ],
    sources: [{ label: 'INDYCAR / Dallara (fichas técnicas)', url: 'https://www.indycar.com' }, { label: 'Speedcafe · Presentación del IR-28', url: 'https://speedcafe.com/indycar-news-2026-new-dallara-ir-28-revealed-images-renders-details-engine-safety-chassis/' }],
  },

  cup: {
    model: 'Next Gen (séptima generación)',
    summary: 'Auto de piezas comunes de proveedores únicos; las marcas aportan motor y carrocería.',
    sections: [
      {
        title: 'Motor',
        facts: [
          ['Arquitectura', 'V8 5.86 L (358 pulgadas cúbicas), aspirado, 2 válvulas por cilindro con varillas (pushrod)'],
          ['Alimentación', 'Inyección electrónica de combustible'],
          ['Potencia', '≈ 670 HP con espaciador cónico; ≈ 510 HP en superóvalos (Daytona, Talladega, Atlanta)'],
          ['2026', 'En óvalos cortos el límite subió de 670 a 750 HP'],
          ['Motores', 'Chevrolet R07, Ford FR9 y Toyota TRD'],
        ],
      },
      {
        title: 'Transmisión',
        facts: [['Caja', 'Transeje secuencial Xtrac de 5 marchas, montado atrás junto al diferencial']],
      },
      {
        title: 'Chasis y suspensión',
        facts: [
          ['Chasis', 'Tubular de acero de proveedor único, con jaula de seguridad integrada'],
          ['Carrocería', 'Simétrica, de material compuesto'],
          ['Suspensión', 'Independiente en las cuatro ruedas (primera vez atrás en la Copa)'],
          ['Aerodinámica', 'Piso con difusor trasero'],
        ],
      },
      {
        title: 'Ruedas',
        facts: [
          ['Llantas', 'Aluminio forjado de 18" con tuerca central única'],
          ['Neumáticos', 'Goodyear Eagle'],
        ],
      },
      {
        title: 'Medidas y peso',
        facts: [
          ['Largo / ancho / alto', '4912 / 1996 / 1280 mm'],
          ['Distancia entre ejes', '2794 mm (110")'],
          ['Peso', '1451 kg sin piloto ni combustible; 1542 kg con piloto y combustible'],
        ],
      },
      { title: 'Combustible', facts: [['Combustible', 'Sunoco Green E15 de 98 octanos']] },
    ],
    sources: [{ label: 'NASCAR (especificaciones del Next Gen)', url: 'https://www.nascar.com' }, { label: 'Red Bull · Cómo funcionan los motores NASCAR', url: 'https://www.redbull.com/us-en/how-nascar-engines-work' }],
  },

  wec: {
    model: 'Hypercar: reglamentos LMH y LMDh',
    summary: 'Dos caminos técnicos muy distintos igualados por el BoP: potencia, peso y energía por tanda.',
    sections: [
      {
        title: 'Reglamentos',
        facts: [
          ['LMH (Le Mans Hypercar)', 'Chasis libre de cada marca; híbrido opcional en el eje delantero (tracción integral), que solo puede actuar por encima de cierta velocidad fijada por el BoP'],
          ['LMDh', 'Chasis LMP2 de Dallara, Oreca, Ligier o Multimatic con carrocería de la marca e híbrido común en el eje trasero'],
        ],
      },
      {
        title: 'Híbrido común LMDh',
        facts: [
          ['Motogenerador', 'Bosch, 50 kW (67 HP)'],
          ['Batería', 'Williams Advanced Engineering'],
          ['Caja', 'Xtrac P1359: transversal, 7 marchas, con el motogenerador integrado'],
        ],
      },
      {
        title: 'Potencia y peso',
        facts: [
          ['Potencia máxima', '500 kW (671 HP) combinados en cualquier momento; los motores rinden entre 480 y 520 kW'],
          ['Peso mínimo', '1030 kg, ajustado por el BoP'],
          ['BoP', 'Ajusta potencia, peso y energía disponible por tanda en cada carrera'],
        ],
      },
      {
        title: 'Neumáticos y medidas',
        facts: [
          ['Neumáticos', 'Michelin, 29/71-18 adelante y 34/71-18 atrás'],
          ['Medidas máximas', '5100 mm de largo y 2000 mm de ancho'],
        ],
      },
      { title: 'Combustible', facts: [['WEC', 'TotalEnergies, 100 % renovable']] },
    ],
    sources: [{ label: 'Xtrac · Proveedor único de cajas LMDh', url: 'https://www.xtrac.com/xtrac-appointed-sole-gearbox-supplier-for-new-hybrid-lmdh-class-of-endurance-racing/' }, { label: 'PMW · Hypercar and LMDh technical hub', url: 'https://www.pmw-magazine.com/features/le-mans-100-hypercar-technical-preview.html' }],
  },

  imsa: {
    model: 'GTP (LMDh), LMP2, GTD Pro y GTD',
    sections: [
      {
        title: 'GTP',
        facts: [
          ['Reglamento', 'LMDh: chasis LMP2 + híbrido común (Bosch 50 kW, batería Williams, caja Xtrac P1359)'],
          ['Potencia', '500 kW combinados, ajustados por BoP'],
          ['Peso mínimo', '1030 kg'],
          ['Neumáticos', 'Michelin, 29/71-18 adelante y 34/71-18 atrás'],
          ['Combustible', 'VP Racing Fuels'],
        ],
      },
      { title: 'LMP2', facts: [['Auto', 'Oreca 07 con motor Gibson GK428 V8 4.2 L aspirado, ≈ 600 HP']] },
      { title: 'GTD Pro y GTD', facts: [['Autos', 'GT3 de fábrica igualados por BoP; GTD Pro con pilotos profesionales, GTD con amateurs']] },
    ],
    sources: [{ label: 'IMSA / fichas de cada fabricante' }],
  },

  fe: {
    model: 'Gen4 (temporada 2026-27); antes Gen3 Evo',
    sections: [
      {
        title: 'Gen4',
        facts: [
          ['Constructor', 'Spark Racing Technology'],
          ['Potencia', 'Hasta 600 kW en modo ataque'],
          ['Regeneración', 'Hasta 700 kW'],
          ['Tracción', 'Integral permanente (motores adelante y atrás)'],
          ['Batería', '55 kWh, Podium Advanced Technologies'],
          ['Peso', '1016 kg'],
          ['Medidas', '5540 mm de largo, 1800 mm de ancho, 1025 mm de alto, 3080 mm entre ejes'],
          ['Neumáticos', 'Bridgestone'],
        ],
      },
      {
        title: 'Gen3 Evo (hasta 2025-26)',
        facts: [
          ['Potencia', '300 kW en carrera, 350 kW en modo ataque y clasificación, 400 kW en el modo de arranque'],
          ['Batería', '47 kWh, WAE Technologies'],
          ['Tracción', 'Integral solo en modo ataque y largadas'],
          ['Neumáticos', 'Hankook'],
        ],
      },
    ],
    sources: [{ label: 'FIA Formula E / Spark Racing Technology', url: 'https://www.fiaformulae.com' }],
  },

  f2: {
    model: 'Dallara F2 2024',
    sections: [
      { title: 'Motor', facts: [['Motor', 'Mecachrome V6 3.4 L turbo'], ['Potencia', '≈ 620 HP']] },
      { title: 'Chasis', facts: [['Chasis', 'Dallara F2 2024, monocasco de carbono con halo'], ['Aerodinámica', 'Con DRS'], ['Neumáticos', 'Pirelli de 18"']] },
    ],
    sources: [{ label: 'FIA Formula 2', url: 'https://www.fiaformula2.com' }],
  },

  wrc: {
    model: 'Rally1 (sin híbrido desde 2025)',
    sections: [
      { title: 'Motor', facts: [['Arquitectura', '1.6 L turbo de 4 cilindros, inyección directa'], ['Potencia', '≈ 380 CV con restrictor'], ['Híbrido', 'Eliminado en 2025'], ['Modelos', 'Toyota GR Yaris (motor GI4B), Hyundai i20 N, Ford Puma (EcoBoost)']] },
      { title: 'Transmisión', facts: [['Tracción', 'Integral'], ['Caja', 'Secuencial']] },
      { title: 'Chasis', facts: [['Estructura', 'Tubular (spaceframe) con celda de seguridad FIA'], ['Suspensión', 'McPherson'], ['Frenos', 'Discos de 300 a 370 mm según superficie, cálipers de 4 pistones'], ['Peso mínimo', '1180 kg sin híbrido']] },
      { title: 'Medidas', facts: [['Toyota GR Yaris', '4225 mm de largo, 1875 mm de ancho, 2630 mm entre ejes']] },
      { title: 'Combustible', facts: [['Combustible', 'Sustentable, sin origen fósil']] },
    ],
    sources: [{ label: 'FIA WRC / Toyota Gazoo Racing / Hyundai Motorsport' }],
  },

  sc: {
    model: 'Gen3',
    sections: [
      {
        title: 'Motores',
        facts: [
          ['Ford Mustang', 'V8 5.4 L Coyote, doble árbol, 4 válvulas por cilindro'],
          ['Chevrolet Camaro ZL1', 'V8 5.7 L LTR, varillas, 2 válvulas por cilindro'],
          ['Toyota GR Supra (desde 2026)', 'V8 5.2 L derivado del 2UR-GSE, cuatro árboles, 94 × 94 mm'],
          ['Potencia', '≈ 600 HP (≈ 447 kW)'],
        ],
      },
      { title: 'Transmisión', facts: [['Caja', 'Transeje Xtrac de 6 marchas con palanca manual'], ['Tracción', 'Trasera']] },
      { title: 'Chasis y peso', facts: [['Chasis', 'De control, común a todas las marcas'], ['Peso mínimo', '1335 kg sin combustible, con lastre de piloto a 95 kg; mínimo 725 kg sobre el eje delantero']] },
    ],
    sources: [{ label: 'Supercars · Detalles técnicos Gen3', url: 'https://www.supercars.com/news/supercars-reveals-key-gen3-details' }, { label: 'Supercars · Motor Toyota', url: 'https://www.supercars.com/news/toyota-supercars-engine-specifications-revealed-v8-capacity-displacement-news-gen3-technical' }],
  },

  sf: {
    model: 'Dallara SF23',
    sections: [
      { title: 'Motor', facts: [['Arquitectura', '2.0 L turbo de 4 cilindros'], ['Fabricantes', 'Honda HR-417E y Toyota TRD-01F'], ['Potencia', '≈ 550 HP + 51 HP con Overtake System (más caudal de combustible)']] },
      { title: 'Chasis', facts: [['Peso', '650 kg'], ['Frenos', 'Brembo de carbono'], ['Neumáticos', 'Yokohama Advan']] },
    ],
    sources: [{ label: 'Japan Race Promotion / Dallara' }],
  },

  sgt: {
    model: 'GT500 (Class One) y GT300',
    sections: [
      { title: 'GT500', facts: [['Motor', '2.0 L turbo de 4 cilindros con restrictor de caudal de combustible, ≈ 650 CV'], ['Chasis', 'Monocasco de carbono, carrocería de plástico reforzado con fibra de carbono'], ['Modelos', 'Toyota GR Supra, Honda Prelude-GT (desde 2026) y Nissan Z NISMO']] },
      { title: 'Reglas 2026', facts: [['Motores', 'Un solo motor por auto para toda la temporada'], ['Lastre por éxito', 'Además del peso, ahora regula el caudal de combustible y el tiempo de recarga en boxes']] },
      { title: 'GT300', facts: [['Autos', 'GT3 y JAF-GT (diseño japonés)']] },
    ],
    sources: [{ label: 'GT Association / Honda Racing' }],
  },

  btcc: {
    model: 'NGTC (Next Generation Touring Car)',
    sections: [
      { title: 'Motor', facts: [['Arquitectura', '2.0 L turbo de inyección directa, acelerador electrónico'], ['Potencia', 'Más de 350 HP'], ['Origen', 'Motor común de TOCA o propio de la marca (de la misma familia que el auto)']] },
      { title: '2026', facts: [['Híbrido', 'Eliminado: lo reemplaza el TOCA Turbo Boost'], ['Combustible', '100 % renovable (segunda temporada)'], ['Electrónica', 'ECU Cosworth Antares 8'], ['Igualación', 'Lastre por éxito']] },
    ],
    sources: [{ label: 'BTCC · Technical Overview', url: 'https://btcc.net/about/technical-overview/' }],
  },

  dtm: {
    model: 'GT3',
    sections: [{ title: 'Autos', facts: [['Base', 'GT3 de fábrica: Mercedes-AMG, BMW M4, Porsche 911, Ferrari 296, Lamborghini, Ford Mustang, Aston Martin y McLaren'], ['Igualación', 'BoP'], ['Pilotos', 'Uno por auto, carreras sprint de sábado y domingo']] }],
    sources: [{ label: 'DTM / SRO (reglamento GT3)' }],
  },

  igtc: {
    model: 'GT3',
    sections: [{ title: 'GT3', facts: [['Autos', 'Ferrari 296, Porsche 911 GT3 R, BMW M4, Mercedes-AMG GT3, Lamborghini, Audi R8, McLaren, Aston Martin, Ford Mustang, Corvette Z06'], ['Potencia', '≈ 500–600 HP según BoP'], ['Peso', '≈ 1250–1350 kg según BoP'], ['Ayudas', 'ABS y control de tracción permitidos']] }],
    sources: [{ label: 'SRO Motorsports Group' }],
  },
  gtwc: {
    model: 'GT3',
    sections: [{ title: 'GT3', facts: [['Autos', 'Los mismos GT3 del Intercontinental GT Challenge'], ['Formatos', 'Sprint (1 hora, 2 pilotos) y Endurance (3 a 24 horas)'], ['Clases de pilotos', 'Pro, Gold, Silver y Bronze']] }],
    sources: [{ label: 'SRO Motorsports Group' }],
  },
  elms: {
    model: 'LMP2, LMP3 y LMGT3',
    sections: [{ title: 'Clases', facts: [['LMP2', 'Oreca 07 con Gibson V8 4.2 L, ≈ 600 HP'], ['LMP3', 'Ligier JS P325 (motor Toyota V35A 3.5 V6 biturbo, ≈ 470 HP, caja Xtrac P1152) o Duqueine D09'], ['LMGT3', 'GT3 con BoP']] }],
    sources: [{ label: 'ACO / Ligier Automotive' }],
  },
  alms: {
    model: 'LMP2, LMP3 y GT3',
    sections: [{ title: 'Clases', facts: [['LMP2', 'Oreca 07 con Gibson V8 4.2 L'], ['LMP3', 'Ligier JS P325 o Duqueine D09'], ['GT', 'GT3 con BoP']] }],
    sources: [{ label: 'ACO' }],
  },
  tcrsa: {
    model: 'TCR',
    sections: [{ title: 'Auto', facts: [['Motor', '2.0 L turbo de 4 cilindros, ≈ 340 HP'], ['Tracción', 'Delantera'], ['Caja', 'Secuencial'], ['Igualación', 'BoP por modelo']] }],
    sources: [{ label: 'WSC Group (reglamento TCR)' }],
  },
  pcc: {
    model: 'Porsche 911 GT3 Cup (992)',
    sections: [{ title: 'Auto', facts: [['Motor', 'Bóxer de 6 cilindros, 4.0 L aspirado, 375 kW (510 CV)'], ['Caja', 'Secuencial de 6 marchas con levas'], ['Tracción', 'Trasera'], ['Peso', '≈ 1260 kg'], ['Clase Sprint', 'Porsche 718 Cayman GT4 RS Clubsport']] }],
    sources: [{ label: 'Porsche Motorsport' }],
  },

  tc: {
    model: 'Turismo Carretera 2026',
    summary: 'Chasis tubular con carrocería de cada marca y motores de 6 cilindros igualados por cilindrada, régimen y peso.',
    sections: [
      {
        title: 'Motor',
        facts: [
          ['Arquitectura', '6 cilindros en línea, preparación nacional (Mercedes-Benz usa el multiválvulas "Cherokee-ACTC")'],
          ['Régimen máximo', '8500 rpm para todas las marcas (en 2026 bajó 200 rpm, 300 rpm en Ford)'],
          ['Cilindrada', 'Según la marca: de 3430 cm³ (Ford y BMW) a 3550 cm³ (Torino)'],
        ],
      },
      {
        title: 'Transmisión',
        facts: [['Cajas permitidas', 'Saenz, Sadev y, desde 2026, la 3MO-TXL (más confiable y con más ajustes)'], ['Tracción', 'Trasera']],
      },
      {
        title: 'Chasis y carrocería',
        facts: [
          ['Chasis', 'Tubular de acero'],
          ['Carrocería', 'Techo, laterales, puertas y zócalos originales; capó, tapa de baúl y paragolpes trasero en fibra'],
          ['Ejemplo (Mercedes-Benz CLE 53 AMG)', '2789–2840 mm entre ejes, 1628 mm de trocha delantera, 1115 mm de altura de cabina'],
        ],
      },
      {
        title: 'Aerodinámica 2026',
        facts: [
          ['Cambios', 'Quinta carga aerodinámica: se eliminaron las "bananitas" laterales y el gurney del alerón, ≈ 100 kg menos de carga'],
          ['Alerón', 'Altura máxima 940 mm; splitter de 40 mm'],
          ['Opcionales', 'Torino y Mercedes-Benz: spoiler trasero; Toyota y Dodge: dos tomas en el paragolpes delantero'],
        ],
      },
      { title: 'Peso', facts: [['Peso mínimo', '1310 kg (Torino 1300 kg)']] },
      { title: 'Lo que viene', facts: [['Motor nuevo (proyecto)', 'Inyección electrónica en lugar de carburador, compresor e intercooler, 700–750 HP']] },
    ],
    sources: [{ label: 'Solo TC · Reglamento técnico 2026', url: 'https://www.solotc.com.ar/tc-reglamento-tecnico-mercedes-benz-auto-2026/' }, { label: 'MDZ · Cambios reglamentarios 2026', url: 'https://www.mdzol.com/deportes/turismo-carretera-2026-todos-los-cambios-reglamentarios-que-entran-vigencia-este-ano-n1444546' }],
  },

  tcp: {
    model: 'TC Pista',
    sections: [{ title: 'Auto', facts: [['Base', 'Los mismos autos y marcas del Turismo Carretera con motores de menor potencia'], ['Rol', 'Escalón previo al TC']] }],
    sources: [{ label: 'ACTC', url: 'https://actc.org.ar' }],
  },
  tcm: {
    model: 'TC Mouras y TC Pista Mouras',
    sections: [{ title: 'Auto', facts: [['Base', 'Autos tipo TC con motor de 6 cilindros en línea'], ['Particularidad', 'Solo corren en el Autódromo Roberto Mouras de La Plata'], ['Rol', 'Escalones formativos de la ACTC']] }],
    sources: [{ label: 'ACTC', url: 'https://actc.org.ar' }],
  },

  tc2000: {
    model: 'SUV TC2000',
    summary: 'Desde 2024 la categoría corre con SUVs sobre una base técnica común.',
    sections: [
      {
        title: 'Motor',
        facts: [
          ['Arquitectura', '5 cilindros turbo, 2500 cm³'],
          ['Proveedor', 'BaseN S.A.S. (Córdoba)'],
          ['Potencia / torque', '500 HP / 550 Nm'],
          ['Régimen máximo', '8000 rpm'],
        ],
      },
      { title: 'Transmisión', facts: [['Caja', 'Xtrac secuencial de 6 marchas y reversa']] },
      {
        title: 'Chasis y aerodinámica',
        facts: [
          ['Suspensión', 'Independiente adelante y atrás'],
          ['Carga aerodinámica', '600 kg'],
          ['Paquete aerodinámico', 'Splitter con difusor, ductos para el intercooler con salida por el capó, guardabarros que generan carga, difusor trasero y alerón de carbono'],
          ['Velocidad máxima', '300 km/h'],
        ],
      },
      { title: 'Frenos y ruedas', facts: [['Frenos', 'A disco en las cuatro ruedas'], ['Ruedas', 'Llantas de aluminio de 18" con Pirelli P Zero']] },
      { title: 'Peso', facts: [['Peso con piloto', '1120 kg']] },
      { title: 'Modelos', facts: [['SUVs', 'Toyota Corolla Cross, Chevrolet Tracker, Honda ZR-V, Volkswagen Nivus, Fiat Pulse y Nissan Kicks (algunos equipos siguen con sedanes)'], ['Próximas marcas', 'Geely y, en 2027, GAC']] },
    ],
    sources: [{ label: 'Carburando · Ficha técnica oficial del SUV', url: 'https://www.carburando.com/notas/tc2000-la-ficha-tecnica-oficial-del-suv' }, { label: 'TC2000 (sitio oficial)', url: 'https://tc2000.com.ar' }],
  },

  tn: {
    model: 'Turismo Nacional Clase 2 y Clase 3',
    sections: [
      { title: 'Clase 3', facts: [['Motor', '2.0 L aspirado, régimen limitado a 8500 rpm'], ['Tracción', 'Delantera'], ['Modelos', 'Chevrolet Cruze, VW Virtus y Vento GLI, Honda Civic, Ford Focus, Toyota Corolla']] },
      { title: 'Clase 2', facts: [['Motor', '1.6 L aspirado'], ['Modelos', 'Toyota Yaris, Peugeot 208, Fiat Cronos, entre otros']] },
      { title: 'Igualación', facts: [['Lastre', 'Kilos extra según los resultados (ver la columna de lastre en Posiciones)']] },
      { title: 'Base', facts: [['Autos', 'Carrocería y piezas del auto de calle, con jaula de seguridad']] },
    ],
    sources: [{ label: 'APAT · Reglamento técnico TN', url: 'https://apat.org.ar/descargas/REGLAMENTO%20TECNICO-APAT2025.pdf' }],
  },

  stock: {
    model: 'Stock Car Pro Series 2026',
    sections: [
      { title: 'Motor', facts: [['2026', 'Vuelve el V8 aspirado en lugar del 4 cilindros turbo de 2025'], ['Potencia', '≈ 500 CV'], ['Torque', '≈ 58 mkgf (el turbo daba 47)'], ['Peso del motor', '≈ 50 kg más que el turbo: cambia el reparto entre ejes']] },
      { title: 'Transmisión', facts: [['Caja', 'Xtrac P1529 secuencial de 6 marchas']] },
      { title: 'Carrocerías', facts: [['Modelos', 'SUVs: Mitsubishi Eclipse Cross, Chevrolet Tracker, Toyota Corolla Cross']] },
    ],
    sources: [{ label: 'CBA · Reglamento técnico Stock Car 2026', url: 'https://cba.org.br/upload/downloads//860/stock-car-pro-series-regulamento-tecnico-2026-.pdf' }],
  },

  truck: {
    model: 'Camiones preparados',
    sections: [{ title: 'Camión', facts: [['Marcas', 'Mercedes-Benz, Volkswagen, Iveco y Volvo'], ['Motor', 'Diésel de 12 a 13 L, más de 1000 HP'], ['Velocidad', 'Limitada electrónicamente a 160 km/h']] }],
    sources: [{ label: 'Copa Truck' }],
  },
  xfin: {
    model: "Auto de la O'Reilly Series",
    sections: [{ title: 'Auto', facts: [['Motor', 'V8 5.86 L aspirado, ≈ 650 HP'], ['Caja', 'Manual de 4 marchas'], ['Marcas', 'Chevrolet, Ford y Toyota']] }],
    sources: [{ label: 'NASCAR' }],
  },
  truckus: {
    model: 'Pickups de NASCAR',
    sections: [{ title: 'Pickup', facts: [['Motor', 'V8 aspirado'], ['Marcas', 'Chevrolet Silverado, Ford F-150, Toyota Tundra y Ram (vuelve en 2026)']] }],
    sources: [{ label: 'NASCAR' }],
  },
  woo: {
    model: 'Sprint car con alerón (410)',
    sections: [{ title: 'Auto', facts: [['Motor', 'V8 de 410 pulgadas cúbicas (6.7 L), inyección mecánica a metanol'], ['Potencia', '≈ 900 HP'], ['Peso', '≈ 635 kg con piloto'], ['Particularidad', 'Sin caja de cambios ni burro de arranque; alerón superior gigante']] }],
    sources: [{ label: 'World of Outlaws' }],
  },
  usac: {
    model: 'Sprint cars y midgets sin alerón',
    sections: [{ title: 'Autos', facts: [['Sprint', 'V8 a metanol, sin alerón'], ['Midget', '4 cilindros, ≈ 350 HP, ≈ 450 kg']] }],
    sources: [{ label: 'USAC' }],
  },
  top: {
    model: 'Top Race',
    sections: [{ title: 'Auto', facts: [['Base', 'Estructura tubular común con carrocerías de sedanes'], ['Nota', 'La categoría no publica una ficha técnica detallada de 2026']] }],
    sources: [{ label: 'Top Race', url: 'https://www.toprace.com.ar' }],
  },
  rally: {
    model: 'Rally Argentino',
    sections: [{ title: 'Clases', facts: [['Maxi Rally', 'Tracción integral y motor turbo'], ['Clases menores', 'Autos de calle preparados, tracción delantera']] }],
    sources: [{ label: 'Rally Argentino' }],
  },
};

/** Fichas por auto, equipo o motor. `match` enlaza con el equipo o la marca en la app. */
export const TECH_VARIANTS: Record<string, TechVariant[]> = {
  f1: [
    {
      name: 'Mercedes W17', match: ['mercedes'],
      sheet: {
        model: 'Mercedes-AMG F1 W17 · motor M17 E Performance',
        sections: [
          { title: 'Unidad de potencia', facts: [['Motor', 'Mercedes-AMG F1 M17 E Performance (Brixworth)'], ['Combustible / aceite', 'PETRONAS Primax / PETRONAS Syntium']] },
          { title: 'Transmisión', facts: [['Caja', '8 marchas y reversa, carcasa de fibra de carbono'], ['Accionamiento', 'Secuencial semiautomático, hidráulico'], ['Embrague', 'Discos de carbono']] },
          { title: 'Chasis y suspensión', facts: [['Monocasco', 'Fibra de carbono moldeada con núcleo de panal'], ['Delantera', 'Triángulos de fibra de carbono con push-rod'], ['Trasera', 'Triángulos de fibra de carbono con push-rod, resortes y amortiguadores internos'], ['Diseño', 'Geometría trasera anti-levantamiento modificada para el control en frenada']] },
          { title: 'Frenos y ruedas', facts: [['Discos y pastillas', 'Carbono, Carbone Industrie; freno trasero by-wire'], ['Cálipers', 'Brembo monobloque de aleación de aluminio niquelado'], ['Llantas', 'OZ de magnesio forjado']] },
          { title: 'Medidas y peso', facts: [['Largo / ancho / alto', 'Menos de 5505 / 1900 / 970 mm'], ['Peso declarado', '772 kg']] },
        ],
        sources: [{ label: 'Mercedes-AMG F1 · Ficha técnica W17', url: 'https://www.mercedesamgf1.com/f1-w17-2026-technical-specifications' }],
      },
    },
    {
      name: 'McLaren MCL40', match: ['mclaren'],
      sheet: {
        model: 'McLaren MCL40 · motor Mercedes-AMG M17 E Performance',
        sections: [
          { title: 'Unidad de potencia', facts: [['Motor', 'Mercedes-AMG F1 M17 E Performance (cliente)'], ['MGU-K', '350 kW, 60.000 rpm'], ['Batería', 'Iones de litio, 4 MJ por vuelta']] },
          { title: 'Transmisión', facts: [['Caja', 'McLaren, 8 marchas y reversa, secuencial seamless']] },
          { title: 'Chasis y suspensión', facts: [['Monocasco', 'Compuesto de fibra de carbono con mandos y tanque integrados'], ['Delantera', 'Brazos de fibra de carbono y titanio, push-rod con barra de torsión, resorte y amortiguador internos'], ['Trasera', 'Igual esquema push-rod'], ['Nariz', 'De dos etapas']] },
          { title: 'Frenos, dirección y ruedas', facts: [['Cálipers', 'AP Racing con bombas delantera y trasera'], ['Discos', 'Carbono-carbono ventilados; freno trasero by-wire'], ['Dirección', 'Asistida, piñón y cremallera'], ['Llantas', 'Enkei de magnesio de 18"']] },
          { title: 'Peso', facts: [['Peso', '772 kg con piloto, sin combustible'], ['Reparto', '44–46 % sobre el eje delantero']] },
        ],
        sources: [{ label: 'McLaren · Ficha técnica MCL40', url: 'https://www.mclaren.com/racing/formula-1/2026/what-is-the-technical-specification-of-our-2026-formula-1/' }],
      },
    },
    {
      name: 'Ferrari SF-26', match: ['ferrari'],
      sheet: {
        model: 'Ferrari SF-26 · motor 067/6',
        sections: [
          { title: 'Motor 067/6', facts: [['Arquitectura', 'V6 a 90°, 1600 cm³, 4 válvulas por cilindro'], ['Diámetro × carrera', '80 × 53 mm'], ['Turbo', 'Único, hasta 150.000 rpm'], ['Inyección', 'Directa, hasta 350 bar'], ['Flujo de energía', '3000 MJ/h']] },
          { title: 'Sistema híbrido', facts: [['MGU-K', '350 kW, hasta 60.000 rpm'], ['Batería', 'Iones de litio, mínimo 35 kg con electrónica'], ['Energía', '4 MJ de diferencia máxima de carga; recarga de hasta 9 MJ'], ['Tensión máxima', '1000 V']] },
          { title: 'Transmisión', facts: [['Caja', 'Ferrari longitudinal, 8 marchas y reversa'], ['Diferencial', 'Trasero de control hidráulico']] },
          { title: 'Chasis, frenos y ruedas', facts: [['Chasis', 'Compuesto de carbono en panal con halo'], ['Suspensión', 'Push-rod adelante y atrás'], ['Frenos', 'Brembo, discos de carbono ventilados; freno trasero de control electrónico'], ['Llantas', '18"'], ['Peso', '770 kg con refrigerante, aceite y piloto']] },
        ],
        sources: [{ label: 'Scuderia Ferrari (ficha técnica, vía Race Tech)', url: 'https://www.racetechmag.com/2026/02/f1s-2026-liveries-and-tech-spec-round-up/' }],
      },
    },
    {
      name: 'Red Bull RB22', match: ['red_bull'],
      sheet: {
        model: 'Red Bull Racing RB22 · motor Red Bull Ford DM01',
        sections: [
          { title: 'Unidad de potencia', facts: [['Motor', 'Red Bull Ford DM01: primer motor propio de Red Bull, desarrollado con Ford'], ['Combustible / aceite', 'Esso Synergy / Mobil 1']] },
          { title: 'Transmisión', facts: [['Caja', 'Red Bull Technology, 8 marchas']] },
          { title: 'Frenos y ruedas', facts: [['Frenos', 'Discos de carbono-carbono, cálipers Brembo'], ['Llantas', 'OZ de 18"']] },
        ],
        sources: [{ label: 'Oracle Red Bull Racing (vía Race Tech)', url: 'https://www.racetechmag.com/2026/02/f1s-2026-liveries-and-tech-spec-round-up/' }],
      },
    },
    {
      name: 'Aston Martin AMR26', match: ['aston_martin'],
      sheet: {
        model: 'Aston Martin AMR26 · motor Honda RA626H',
        sections: [
          { title: 'Unidad de potencia', facts: [['Motor', 'Honda RA626H, sociedad de fábrica desde 2026'], ['Potencia combinada', 'Más de 1000 HP'], ['Combustible / aceite', 'Aramco / Valvoline']] },
          { title: 'Transmisión', facts: [['Caja', 'Aston Martin, 8 marchas semiautomática (la primera propia del equipo)']] },
          { title: 'Ruedas y peso', facts: [['Llantas', 'Fondmetal de magnesio forjado, 18"'], ['Peso', '770 kg con piloto, sin combustible']] },
        ],
        sources: [{ label: 'Honda · AMR26', url: 'https://global.honda/en/F1/machine/2026_AMR26/' }],
      },
    },
    {
      name: 'Alpine A526', match: ['alpine'],
      sheet: {
        model: 'Alpine A526 · motor Mercedes-AMG',
        sections: [
          { title: 'Unidad de potencia', facts: [['Motor', 'Mercedes-AMG M17 E Performance (cliente, 2026–2030); Alpine cerró su programa de motores de Viry-Châtillon'], ['Potencia combinada', 'Más de 1000 HP']] },
          { title: 'Suspensión', facts: [['Delantera', 'Doble triángulo con pull-rod'], ['Trasera', 'Doble triángulo con push-rod']] },
          { title: 'Concepto', facts: [['Filosofía', '"Chico y liviano"'], ['Peso', '770 kg con piloto, refrigerante y aceite']] },
        ],
        sources: [{ label: 'BWT Alpine F1 Team (vía Race Tech)', url: 'https://www.racetechmag.com/2026/02/f1s-2026-liveries-and-tech-spec-round-up/' }],
      },
    },
    {
      name: 'Williams FW48', match: ['williams'],
      sheet: {
        model: 'Williams FW48 · motor Mercedes-AMG',
        sections: [
          { title: 'Unidad de potencia', facts: [['Motor', 'Mercedes-AMG M17 E Performance (cliente)']] },
          { title: 'Diseño', facts: [['Rasgos', 'Toma de aire grande, nariz larga y alerón delantero en forma de pala'], ['Enfoque', 'Suspensión de diseño conservador']] },
        ],
        sources: [{ label: 'Atlassian Williams Racing (vía Race Tech)', url: 'https://www.racetechmag.com/2026/02/f1s-2026-liveries-and-tech-spec-round-up/' }],
      },
    },
    {
      name: 'Racing Bulls VCARB 03', match: ['rb'],
      sheet: {
        model: 'Racing Bulls VCARB 03 · motor Red Bull Ford DM01',
        sections: [
          { title: 'Unidad de potencia', facts: [['Motor', 'Red Bull Ford DM01'], ['Combustible / aceite', 'Esso Synergy / Mobil 1']] },
          { title: 'Chasis y frenos', facts: [['Monocasco', 'Fibra de carbono con halo'], ['Frenos', 'Brembo: cálipers de 6 pistones en aluminio-litio, discos y pastillas de carbono'], ['Peso', '770 kg con piloto, sin combustible']] },
        ],
        sources: [{ label: 'Visa Cash App Racing Bulls (ficha del auto)' }],
      },
    },
    {
      name: 'Haas VF-26', match: ['haas'],
      sheet: {
        model: 'Haas VF-26 · motor Ferrari 067/6',
        sections: [
          { title: 'Unidad de potencia', facts: [['Motor', 'Ferrari 067/6 (cliente): V6 a 90°, 80 × 53 mm, turbo único'], ['MGU-K', '350 kW']] },
          { title: 'Transmisión', facts: [['Caja', '8 marchas y reversa']] },
          { title: 'Chasis y frenos', facts: [['Suspensión', 'Push-rod adelante y atrás'], ['Frenos', 'Brembo, discos de carbono autoventilados con freno by-wire'], ['Peso', '770 kg con piloto, sin combustible'], ['Socio técnico', 'Toyota Gazoo Racing']] },
        ],
        sources: [{ label: 'TGR Haas F1 Team (vía Race Tech)', url: 'https://www.racetechmag.com/2026/02/f1s-2026-liveries-and-tech-spec-round-up/' }],
      },
    },
    {
      name: 'Audi R26', match: ['audi'],
      sheet: {
        model: 'Audi R26 · motor Audi AFR 26 Hybrid',
        sections: [
          { title: 'Unidad de potencia', facts: [['Motor', 'Audi AFR 26 Hybrid: V6 1.6 turbo propio, desarrollado en Neuburg (Alemania)'], ['ERS', 'MGU-K y batería de iones de litio de Audi'], ['Combustible / aceite', 'BP Ultimate Sustainable / Castrol']] },
          { title: 'Chasis y suspensión', facts: [['Monocasco', 'Fibra de carbono con celda de supervivencia'], ['Suspensión', 'Doble triángulo con push-rod adelante y atrás']] },
          { title: 'Frenos', facts: [['Frenos', 'Brembo, discos de carbono']] },
          { title: 'Medidas y peso', facts: [['Largo / alto', '5440 / 980 mm'], ['Peso', '770 kg']] },
        ],
        sources: [{ label: 'Audi F1 Team (vía Race Tech)', url: 'https://www.racetechmag.com/2026/02/f1s-2026-liveries-and-tech-spec-round-up/' }],
      },
    },
    {
      name: 'Cadillac MAC-26', match: ['cadillac'],
      sheet: {
        model: 'Cadillac MAC-26 · motor Ferrari 067/6',
        sections: [
          { title: 'Unidad de potencia', facts: [['Motor', 'Ferrari 067/6 (cliente, hasta tener motor propio)']] },
          { title: 'Transmisión', facts: [['Caja', 'Carcasa propia con componentes internos Ferrari']] },
          { title: 'Suspensión', facts: [['Delantera', 'Pull-rod con mucho anti-dive (evita que la trompa se hunda al frenar)'], ['Trasera', 'Push-rod']] },
        ],
        sources: [{ label: 'Cadillac F1 Team (vía Race Tech)', url: 'https://www.racetechmag.com/2026/02/f1s-2026-liveries-and-tech-spec-round-up/' }],
      },
    },
  ],

  wec: [
    { name: 'Toyota TR010 Hybrid', match: ['Toyota'], sheet: { model: 'Toyota TR010 Hybrid (LMH)', sections: [
      { title: 'Motor', facts: [['Motor', 'Toyota H8909: V6 3.5 L biturbo, central longitudinal'], ['Potencia térmica', '≈ 500 kW antes del BoP']] },
      { title: 'Híbrido', facts: [['Motogenerador', 'Delantero Aisin-Denso, 200 kW: tracción integral'], ['Batería', 'Toyota Hybrid System-Racing (THS-R), iones de litio']] },
      { title: 'Chasis', facts: [['Monocasco', 'Fibra de carbono y panal de aluminio'], ['Suspensión', 'Doble triángulo con push-rod, adelante y atrás'], ['Frenos', 'Discos de carbono Brembo ventilados con cálipers Akebono'], ['Llantas', 'Rays forjadas de una pieza']] },
      { title: 'Medidas y peso', facts: [['Largo / ancho / alto', '4900 / 2000 / 1150 mm'], ['Peso', '1040 kg (antes del BoP)']] },
    ], sources: [{ label: 'Toyota Gazoo Racing' }] } },
    { name: 'Ferrari 499P', match: ['Ferrari'], sheet: { model: 'Ferrari 499P (LMH)', sections: [
      { title: 'Motor', facts: [['Motor', 'Ferrari F163CG: V6 3.0 L biturbo a 120°, montaje longitudinal'], ['Potencia', '≈ 671 HP del motor térmico']] },
      { title: 'Híbrido', facts: [['Motogenerador', '200 kW en el eje delantero'], ['Batería', '800 V, desarrollada por Ferrari']] },
      { title: 'Transmisión', facts: [['Caja', 'Xtrac secuencial']] },
      { title: 'Chasis', facts: [['Monocasco', 'Fibra de carbono'], ['Suspensión', 'Doble triángulo con push-rod'], ['Frenos', 'Brembo de carbono: discos de 380 mm adelante y 355 mm atrás, cálipers monobloque de 6 pistones'], ['Llantas', 'OZ forjadas de una pieza'], ['Peso', '1030 kg']] },
    ], sources: [{ label: 'Ferrari Competizioni GT' }] } },
    { name: 'BMW M Hybrid V8', match: ['BMW'], sheet: { model: 'BMW M Hybrid V8 (LMDh, chasis Dallara)', sections: [
      { title: 'Motor', facts: [['Motor', 'BMW P66/3: V8 4.0 L biturbo'], ['Potencia', '477 kW del motor; 500 kW combinados']] },
      { title: 'Híbrido y caja', facts: [['Motogenerador', 'Bosch 50 kW, trasero'], ['Caja', 'Xtrac P1359, 7 marchas']] },
      { title: 'Chasis', facts: [['Monocasco', 'Fibra de carbono de base LMP2 (Dallara)'], ['Frenos', 'Brembo'], ['Llantas', 'OZ forjadas'], ['Peso', '1030 kg']] },
    ], sources: [{ label: 'BMW M Motorsport' }] } },
    { name: 'Cadillac V-Series.R', match: ['Cadillac'], sheet: { model: 'Cadillac V-Series.R (LMDh, chasis Dallara)', sections: [
      { title: 'Motor', facts: [['Motor', 'Cadillac LMC55R: V8 5.5 L aspirado (el único V8 sin turbo del Hypercar)']] },
      { title: 'Híbrido y caja', facts: [['Motogenerador', 'Bosch 50 kW, trasero'], ['Caja', 'Xtrac P1359']] },
      { title: 'Chasis', facts: [['Monocasco', 'Dallara de base LMP2'], ['Frenos', 'Brembo de carbono: discos de 380/355 mm, cálipers de 6 pistones'], ['Llantas', 'OZ forjadas'], ['Peso', '1030 kg']] },
    ], sources: [{ label: 'Cadillac Racing' }] } },
    { name: 'Alpine A424', match: ['Alpine'], sheet: { model: 'Alpine A424 (LMDh, chasis Oreca)', sections: [
      { title: 'Motor', facts: [['Motor', 'Alpine V634: V6 3.4 L turbo']] },
      { title: 'Híbrido y caja', facts: [['Motogenerador', 'Bosch 50 kW, trasero'], ['Caja', 'Xtrac P1359, secuencial']] },
      { title: 'Chasis', facts: [['Monocasco', 'Fibra de carbono de base Oreca 07'], ['Suspensión', 'Doble triángulo con push-rod; dirección asistida'], ['Frenos', 'AP Racing de carbono con cálipers monobloque de 6 pistones'], ['Medidas', '5000 × 1998 × 1058 mm, 3148 mm entre ejes'], ['Peso', '1030 kg']] },
    ], sources: [{ label: 'Alpine Motorsports' }] } },
    { name: 'Peugeot 9X8', match: ['Peugeot'], sheet: { model: 'Peugeot 9X8 (LMH)', sections: [
      { title: 'Motor', facts: [['Motor', 'Peugeot X6H: V6 2.6 L biturbo']] },
      { title: 'Híbrido', facts: [['Motogenerador', 'Delantero, 200 kW: tracción integral']] },
    ], sources: [{ label: 'Peugeot Sport' }] } },
    { name: 'Aston Martin Valkyrie AMR-LMH', match: ['Aston Martin'], sheet: { model: 'Aston Martin Valkyrie AMR-LMH (chasis Multimatic)', sections: [
      { title: 'Motor', facts: [['Motor', 'Aston Martin-Cosworth RA: V12 6.5 L aspirado, central longitudinal'], ['Potencia', '≈ 671 HP'], ['Híbrido', 'No tiene: es el único Hypercar sin sistema híbrido']] },
      { title: 'Transmisión', facts: [['Caja', 'Xtrac secuencial']] },
    ], sources: [{ label: 'Aston Martin Racing' }] } },
    { name: 'Genesis GMR-001', match: ['Genesis'], sheet: { model: 'Genesis GMR-001 (LMDh, chasis Oreca)', sections: [
      { title: 'Motor', facts: [['Motor', 'Genesis G8MR: V8 3.2 L biturbo'], ['Potencia', '≈ 680 HP combinados']] },
      { title: 'Híbrido y caja', facts: [['Motogenerador', 'Bosch 50 kW, trasero'], ['Caja', 'Secuencial (Xtrac P1359)']] },
      { title: 'Chasis', facts: [['Suspensión', 'Doble triángulo con push-rod, barra estabilizadora'], ['Frenos', 'Discos ventilados'], ['Medidas', '5000 mm de largo, 2000 mm de ancho, 3150 mm entre ejes'], ['Peso', '1030 kg'], ['Debut', '2026']] },
    ], sources: [{ label: 'Genesis Magma Racing' }] } },
  ],

  imsa: [
    { name: 'Porsche 963', match: ['Porsche'], sheet: { model: 'Porsche 963 (LMDh, chasis Multimatic)', sections: [
      { title: 'Motor', facts: [['Motor', 'Porsche 9RD: V8 4.6 L biturbo'], ['Potencia', '500 kW combinados']] },
      { title: 'Híbrido y caja', facts: [['Motogenerador', 'Bosch 50 kW, trasero'], ['Caja', 'Xtrac P1359']] },
      { title: 'Chasis', facts: [['Monocasco', 'Fibra de carbono con núcleo de panal de aluminio'], ['Suspensión', 'Doble triángulo con push-rod; dirección asistida'], ['Frenos', 'AP Racing de carbono: discos de 380/365 mm, cálipers de 6 pistones'], ['Llantas', 'BBS forjadas'], ['Medidas', '5100 × 2000 × 1060 mm, 3148 mm entre ejes'], ['Peso', '1030 kg']] },
    ], sources: [{ label: 'Porsche Motorsport' }] } },
    { name: 'Acura ARX-06', match: ['Acura'], sheet: { model: 'Acura ARX-06 (LMDh, chasis Oreca)', sections: [
      { title: 'Motor', facts: [['Motor', 'Acura AR24e: V6 2.4 L biturbo']] },
      { title: 'Híbrido y caja', facts: [['Motogenerador', 'Bosch 50 kW'], ['Caja', 'Xtrac P1359']] },
      { title: 'Chasis', facts: [['Frenos', 'AP Racing de carbono, cálipers de 6 pistones'], ['Medidas', '5100 × 2000 × 1060 mm'], ['Peso', '1030 kg']] },
    ], sources: [{ label: 'HRC US' }] } },
    { name: 'Cadillac V-Series.R', match: ['Cadillac'], sheet: { model: 'Cadillac V-Series.R (LMDh, chasis Dallara)', sections: [{ title: 'Motor', facts: [['Motor', 'LMC55R: V8 5.5 L aspirado'], ['Híbrido', 'Bosch 50 kW']] }], sources: [{ label: 'Cadillac Racing' }] } },
    { name: 'BMW M Hybrid V8', match: ['BMW'], sheet: { model: 'BMW M Hybrid V8 (LMDh, chasis Dallara)', sections: [{ title: 'Motor', facts: [['Motor', 'P66/3: V8 4.0 L biturbo'], ['Híbrido', 'Bosch 50 kW']] }], sources: [{ label: 'BMW M Motorsport' }] } },
  ],

  cup: [
    { name: 'Chevrolet Camaro ZL1', match: ['Chevrolet'], sheet: { model: 'Chevrolet Camaro ZL1 · motor R07', sections: [{ title: 'Motor', facts: [['Motor', 'Chevrolet R07: V8 358 pulgadas cúbicas, varillas']] }], sources: [{ label: 'Chevrolet Racing' }] } },
    { name: 'Ford Mustang Dark Horse', match: ['Ford'], sheet: { model: 'Ford Mustang Dark Horse · motor FR9', sections: [{ title: 'Motor', facts: [['Motor', 'Ford FR9: V8 358 pulgadas cúbicas, varillas']] }], sources: [{ label: 'Ford Performance' }] } },
    { name: 'Toyota Camry XSE', match: ['Toyota'], sheet: { model: 'Toyota Camry XSE · motor TRD', sections: [{ title: 'Motor', facts: [['Motor', 'Toyota TRD: V8 358 pulgadas cúbicas, varillas']] }], sources: [{ label: 'Toyota Racing Development' }] } },
  ],

  tc: [
    { name: 'Ford', match: ['Ford'], sheet: { model: 'Ford', sections: [{ title: 'Motor y peso 2026', facts: [['Cilindrada', '3430 cm³'], ['Régimen máximo', '8500 rpm (bajó 300 rpm)'], ['Peso mínimo', '1310 kg']] }], sources: [{ label: 'ACTC (vía Solo TC)' }] } },
    { name: 'BMW', match: ['BMW'], sheet: { model: 'BMW', sections: [{ title: 'Motor y peso 2026', facts: [['Cilindrada', '3430 cm³'], ['Régimen máximo', '8500 rpm'], ['Peso mínimo', '1310 kg']] }], sources: [{ label: 'ACTC (vía Solo TC)' }] } },
    { name: 'Chevrolet', match: ['Chevrolet'], sheet: { model: 'Chevrolet', sections: [{ title: 'Motor y peso 2026', facts: [['Cilindrada', '3460 cm³'], ['Régimen máximo', '8500 rpm'], ['Peso mínimo', '1310 kg']] }], sources: [{ label: 'ACTC (vía Solo TC)' }] } },
    { name: 'Dodge', match: ['Dodge'], sheet: { model: 'Dodge', sections: [{ title: 'Motor y peso 2026', facts: [['Cilindrada', '3500 cm³'], ['Régimen máximo', '8500 rpm'], ['Peso mínimo', '1310 kg'], ['Opcional', 'Dos tomas de aire en el paragolpes delantero']] }], sources: [{ label: 'ACTC (vía Solo TC)' }] } },
    { name: 'Toyota Camry', match: ['Toyota'], sheet: { model: 'Toyota Camry', sections: [{ title: 'Motor y peso 2026', facts: [['Cilindrada', '3500 cm³'], ['Régimen máximo', '8500 rpm'], ['Peso mínimo', '1310 kg'], ['Opcional', 'Dos tomas de aire en el paragolpes delantero']] }], sources: [{ label: 'ACTC (vía Solo TC)' }] } },
    { name: 'Mercedes-Benz CLE 53 AMG', match: ['Mercedes-Benz'], sheet: { model: 'Mercedes-Benz CLE 53 AMG', sections: [
      { title: 'Motor y peso 2026', facts: [['Motor', 'Multiválvulas Cherokee-ACTC'], ['Cilindrada', '3500 cm³'], ['Régimen máximo', '8500 rpm'], ['Peso mínimo', '1310 kg']] },
      { title: 'Medidas', facts: [['Distancia entre ejes', '2789 a 2840 mm'], ['Trocha delantera', '1628 mm'], ['Altura de cabina', '1115 mm']] },
      { title: 'Aerodinámica', facts: [['Splitter', '40 mm'], ['Alerón', 'Hasta 940 mm de altura; spoiler trasero opcional']] },
    ], sources: [{ label: 'Solo TC · Reglamento técnico del Mercedes-Benz', url: 'https://www.solotc.com.ar/tc-reglamento-tecnico-mercedes-benz-auto-2026/' }] } },
    { name: 'Torino', match: ['Torino'], sheet: { model: 'Torino', sections: [{ title: 'Motor y peso 2026', facts: [['Cilindrada', '3550 cm³ (la mayor del TC)'], ['Régimen máximo', '8500 rpm'], ['Peso mínimo', '1300 kg (10 kg menos que el resto)'], ['Opcional', 'Spoiler trasero']] }], sources: [{ label: 'ACTC (vía Solo TC)' }] } },
  ],
};

/** Variantes que aplican a un equipo o marca (por id de la API o por nombre). */
export function variantsFor(seriesId: string, keys: (string | undefined)[]): TechVariant[] {
  const wanted = keys.filter(Boolean).map((k) => k!.toLowerCase());
  return (TECH_VARIANTS[seriesId] ?? []).filter((v) => v.match?.some((m) => wanted.some((w) => w === m.toLowerCase() || w.includes(m.toLowerCase()))));
}
