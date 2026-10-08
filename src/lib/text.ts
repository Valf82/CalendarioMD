/** "José Manuel Urcera" -> "jose-manuel-urcera", para usar en rutas. */
export function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const norm = (s: string) => slugify(s).replace(/-/g, ' ');

export function formatPoints(p: number | null | undefined): string {
  if (p == null) return '—';
  return Number.isInteger(p) ? String(p) : p.toFixed(1).replace('.', ',');
}

const CIRCUIT_ES: Record<string, string> = {
  Melbourne: 'Australia', Shanghai: 'China', Suzuka: 'Japón', Sakhir: 'Bahréin', Jeddah: 'Arabia Saudita', Miami: 'Miami',
  Montreal: 'Canadá', 'Monte Carlo': 'Mónaco', Catalunya: 'Barcelona', Spielberg: 'Austria', Silverstone: 'Silverstone',
  'Spa-Francorchamps': 'Bélgica', Hungaroring: 'Hungría', Zandvoort: 'Países Bajos', Monza: 'Monza', Madring: 'Madrid',
  Baku: 'Bakú', 'Kuala Lumpur': 'Malasia', Singapore: 'Singapur', Austin: 'Austin', 'Mexico City': 'México', Interlagos: 'Brasil',
  'Las Vegas': 'Las Vegas', Lusail: 'Qatar', 'Yas Marina Circuit': 'Abu Dhabi',
};

/** Nombre corto en español de un gran premio a partir del circuito de OpenF1. */
export const circuitEs = (short: string) => CIRCUIT_ES[short] ?? short;
