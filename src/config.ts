/**
 * Dirección donde GitHub Actions publica los datos que genera el pipeline (carpeta `data/` del repo).
 * Ejemplo: 'https://raw.githubusercontent.com/<usuario>/<repo>/main/data'
 * Si queda vacía, la app usa solo la copia empaquetada (se actualiza al correr el pipeline y recompilar).
 */
export const DATA_BASE_URL = '';
