const DEFAULT_API_ROOT = 'https://resilient-vision-production-1fad.up.railway.app';

function normalizeApiBase(value) {
  const raw = String(value || DEFAULT_API_ROOT).trim().replace(/\/+$/, '');
  return raw.endsWith('/api') ? raw : `${raw}/api`;
}

export const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);
export const API_ROOT = API_BASE.replace(/\/api$/, '');

export default API_BASE;
