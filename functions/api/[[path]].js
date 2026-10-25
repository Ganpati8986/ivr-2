// Cloudflare Pages Function: thin pipe between the React app and Omixo / Supabase.
// Secrets live in Cloudflare env vars (never in the browser bundle).
const OMIXO = (env) => (env.OMIXO_BASE || 'https://api.omixo.ai/api/v1').replace(/\/$/, '');
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json' } });

function authed(request, env) {
  try {
    const [u, ...p] = atob((request.headers.get('authorization') || '').replace(/^Basic /, '')).split(':');
    return u.trim().toLowerCase() === String(env.APP_USERNAME || '').trim().toLowerCase() && p.join(':') === env.APP_PASSWORD;
  } catch { return false; }
}

export async function onRequest({ request, env, params }) {
  const url = new URL(request.url);
  const path = '/' + [].concat(params.path || []).join('/');
  const user = { username: String(env.APP_USERNAME || '').toLowerCase() };

  if (path === '/login' || path === '/me') return authed(request, env) ? json({ user }) : json({ error: path === '/login' ? 'Incorrect username or password.' : 'Not logged in.' }, 401);
  if (!authed(request, env)) return json({ error: 'Please log in first.' }, 401);

  if (path === '/public-check') {
    const ok = !!(env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY);
    return json({ ok, url: url.origin, error: ok ? undefined : 'SUPABASE_URL / SUPABASE_SERVICE_KEY are not set in Cloudflare.' });
  }

  if (path === '/upload' && request.method === 'POST') {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) return json({ error: 'Audio storage (Supabase) is not configured.' }, 500);
    const buf = await request.arrayBuffer();
    if (buf.byteLength < 100 || buf.byteLength > 25e6) return json({ error: 'Empty or too large audio file.' }, 400);
    const name = [...crypto.getRandomValues(new Uint8Array(12))].map((b) => b.toString(16).padStart(2, '0')).join('') + '.wav';
    const base = env.SUPABASE_URL.replace(/\/$/, '');
    const r = await fetch(`${base}/storage/v1/object/${env.SUPABASE_BUCKET || 'audio'}/${name}`, {
      method: 'POST', body: buf,
      headers: { ...(env.SUPABASE_SERVICE_KEY.startsWith('eyJ') ? { Authorization: 'Bearer ' + env.SUPABASE_SERVICE_KEY } : {}), apikey: env.SUPABASE_SERVICE_KEY, 'Content-Type': 'audio/wav', 'x-upsert': 'true' },
    });
    if (!r.ok) return json({ error: 'Audio upload failed: ' + (await r.text()).slice(0, 200) }, 502);
    return json({ url: `${base}/storage/v1/object/public/${env.SUPABASE_BUCKET || 'audio'}/${name}` });
  }

  if (path.startsWith('/omixo/')) {
    const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text();
    const r = await fetch(OMIXO(env) + path.slice(6) + url.search, {
      method: request.method, body,
      headers: { 'X-API-Key': env.OMIXO_API_KEY, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    });
    return new Response(await r.text(), { status: r.status, headers: { 'content-type': 'application/json' } });
  }
  return json({ error: 'Not found' }, 404);
}