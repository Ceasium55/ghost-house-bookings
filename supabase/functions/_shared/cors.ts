// Shared CORS helper for Springfest edge functions.
// Add any extra frontend origins (e.g. your own external domain) to ALLOWED_ORIGINS.

const ALLOWED_ORIGINS: string[] = [
  'https://id-preview--8161da77-ebfe-46c3-a211-d89fb6b1bdef.lovable.app',
  'https://springfesteeb3.lovable.app',
  'https://springfesteeb3.com',
  'https://www.springfesteeb3.com',
  'http://localhost:8080',
  'http://localhost:5173',
];

const COMMON_CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : '*';

  const headers: Record<string, string> = {
    ...COMMON_CORS_HEADERS,
    'Access-Control-Allow-Origin': allowedOrigin,
    'Vary': 'Origin',
  };

  if (allowedOrigin === '*') {
    headers['Access-Control-Allow-Credentials'] = 'false';
  } else {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}
