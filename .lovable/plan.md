Current state (verified by reading the codebase):
- Every edge function under `supabase/functions/*/index.ts` sets `Access-Control-Allow-Origin: '*'`.
- `supabase/config.toml` only contains the auto-generated `project_id`; there are no project-level CORS overrides.
- The frontend Supabase client (`src/integrations/supabase/client.ts`) uses the standard `@supabase/supabase-js` client with localStorage auth persistence.

What I would change, and why:

1. Harden edge-function CORS headers
   - Replace the inline `corsHeaders` object in every edge function with a shared helper so all functions behave identically.
   - Add `Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS` to the preflight response.
   - Keep `Access-Control-Allow-Headers` comprehensive (authorization, x-client-info, apikey, content-type, and the x-supabase-client-* headers already present).
   - If you give me the external domain, change `Access-Control-Allow-Origin` from `*` to that exact origin and add `Vary: Origin`. This is required if the frontend ever sends cookies or auth headers that need credentials mode.
   - If you want to keep allowing any origin for now, leave `*` but add `Access-Control-Allow-Credentials: false` explicitly to avoid accidental credential leakage.

2. Make the frontend request mode explicit
   - In `src/integrations/supabase/client.ts`, set `auth.flowType = 'implicit'` is not needed; what matters is ensuring the Supabase client does not send cookies unless the backend allows credentials. No change is strictly required here if the edge functions stay `*` without credentials.
   - If we switch to a specific allowed origin, we would also need to set `auth.detectSessionInUrl: true` and ensure the client is created with `auth.persistSession: true` (already set).

3. Backend API origin allow-list (Lovable Cloud)
   - Direct calls to the database/auth/storage APIs (not edge functions) are subject to the Lovable Cloud/Supabase project's CORS allow-list. This cannot be changed in code; it must be configured in the backend settings.
   - Plan step: add the external frontend origin to the project's allowed CORS origins in the backend configuration.

4. Verify from the external host
   - After changes, test a booking flow and an admin login from the external domain and confirm no `CORS error` appears in the browser console.

Open question before implementing:
- What is the exact external domain where the frontend will be hosted (e.g. `https://springfesteeb3.com` or another URL)? This determines whether we restrict `Access-Control-Allow-Origin` to a specific origin or keep the wildcard.

Once you provide the domain, I can implement the shared CORS helper, update every edge function, and configure the backend allow-list.