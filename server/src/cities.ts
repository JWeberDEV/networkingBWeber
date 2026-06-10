// Curated set of supported cities. Expansion is a deliberate decision — add a
// city here (and seed/announce it) rather than letting users free-type any city.
export const CITIES = [
  'Asunción',
  'Ciudad del Este',
  'Encarnación',
  'Hernandarias',
  'Pedro Juan Caballero',
  'Salto del Guairá',
];

export const DEFAULT_CITY = 'Asunción';

export function isValidCity(city: unknown): city is string {
  return typeof city === 'string' && CITIES.includes(city);
}
