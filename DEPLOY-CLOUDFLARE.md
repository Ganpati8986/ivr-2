# Demo deploy: Cloudflare Pages (free) + Supabase Storage (free, audio only)

## A. Supabase (2 min)
1. supabase.com -> New project.
2. Storage -> New bucket -> name `audio` -> turn ON "Public bucket".
3. Project Settings -> API: copy "Project URL" and the `service_role` key.

## B. Cloudflare Pages (5 min)
1. Push this folder to a private GitHub repo (.env is not included).
2. dash.cloudflare.com -> Workers & Pages -> Create -> Pages -> Connect to Git -> pick the repo.
3. Build command: `npm run build`   Output directory: `dist`
4. Environment variables (Production), add as "Secret" where possible:
   - NODE_VERSION = 22
   - OMIXO_API_KEY
   - APP_USERNAME, APP_PASSWORD   (the login you give the school)
   - SUPABASE_URL, SUPABASE_SERVICE_KEY
5. Save and Deploy. If you add variables after the first deploy, press "Retry deployment".
6. Open the pages.dev link, log in, Send page -> "Record now" -> public check must be green.

## Notes
- Notice history is kept in the browser (localStorage), so each browser sees only its own notices.
- Demo limit: 50 calls/day (change DAILY in src/api.js).
- Old server version (Render / own server) still works: restore src/api.server.js.bak as src/api.js.
