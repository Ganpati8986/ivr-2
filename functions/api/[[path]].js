// // Cloudflare Pages Function: thin pipe between the React app and Omixo / Supabase.
// // Secrets live in Cloudflare env vars (never in the browser bundle).
// const OMIXO = (env) => (env.OMIXO_BASE || 'https://api.omixo.ai/api/v1').replace(/\/$/, '');
// const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json' } });

// function authed(request, env) {
//   try {
//     const [u, ...p] = atob((request.headers.get('authorization') || '').replace(/^Basic /, '')).split(':');
//     return u.trim().toLowerCase() === String(env.APP_USERNAME || '').trim().toLowerCase() && p.join(':') === env.APP_PASSWORD;
//   } catch { return false; }
// }

// export async function onRequest({ request, env, params }) {
//   const url = new URL(request.url);
//   const path = '/' + [].concat(params.path || []).join('/');
//   const user = { username: String(env.APP_USERNAME || '').toLowerCase() };

//   if (path === '/login' || path === '/me') return authed(request, env) ? json({ user }) : json({ error: path === '/login' ? 'Incorrect username or password.' : 'Not logged in.' }, 401);
//   if (!authed(request, env)) return json({ error: 'Please log in first.' }, 401);

//   if (path === '/public-check') {
//     const ok = !!(env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY);
//     return json({ ok, url: url.origin, error: ok ? undefined : 'SUPABASE_URL / SUPABASE_SERVICE_KEY are not set in Cloudflare.' });
//   }

//   if (path === '/upload' && request.method === 'POST') {
//     if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) return json({ error: 'Audio storage (Supabase) is not configured.' }, 500);
//     const buf = await request.arrayBuffer();
//     if (buf.byteLength < 100 || buf.byteLength > 25e6) return json({ error: 'Empty or too large audio file.' }, 400);
//     const name = [...crypto.getRandomValues(new Uint8Array(12))].map((b) => b.toString(16).padStart(2, '0')).join('') + '.wav';
//     const base = env.SUPABASE_URL.replace(/\/$/, '');
//     const r = await fetch(`${base}/storage/v1/object/${env.SUPABASE_BUCKET || 'audio'}/${name}`, {
//       method: 'POST', body: buf,
//       headers: { ...(env.SUPABASE_SERVICE_KEY.startsWith('eyJ') ? { Authorization: 'Bearer ' + env.SUPABASE_SERVICE_KEY } : {}), apikey: env.SUPABASE_SERVICE_KEY, 'Content-Type': 'audio/wav', 'x-upsert': 'true' },
//     });
//     if (!r.ok) return json({ error: 'Audio upload failed: ' + (await r.text()).slice(0, 200) }, 502);
//     return json({ url: `${base}/storage/v1/object/public/${env.SUPABASE_BUCKET || 'audio'}/${name}` });
//   }

//   if (path.startsWith('/omixo/')) {
//     const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text();
//     const r = await fetch(OMIXO(env) + path.slice(6) + url.search, {
//       method: request.method, body,
//       headers: { 'X-API-Key': env.OMIXO_API_KEY, ...(body ? { 'Content-Type': 'application/json' } : {}) },
//     });
//     return new Response(await r.text(), { status: r.status, headers: { 'content-type': 'application/json' } });
//   }
//   return json({ error: 'Not found' }, 404);
// }


// Cloudflare Pages Function: thin pipe between the React app and Omixo / Supabase.
// Secrets live in Cloudflare env vars (never in the browser bundle).
// const OMIXO = (env) => (env.OMIXO_BASE || 'https://api.omixo.ai/api/v1').replace(/\/$/, '');
// const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json' } });

// function authed(request, env) {
//   try {
//     const [u, ...p] = atob((request.headers.get('authorization') || '').replace(/^Basic /, '')).split(':');
//     return u.trim().toLowerCase() === String(env.APP_USERNAME || '').trim().toLowerCase() && p.join(':') === env.APP_PASSWORD;
//   } catch { return false; }
// }

// const norm10 = (v) => String(v || '').replace(/\D/g, '').slice(-10);
// function cleanPeople(arr) {
//   const seen = new Set(), out = [];
//   for (const p of Array.isArray(arr) ? arr : []) {
//     const to = norm10(p?.to); if (!/^[6-9]\d{9}$/.test(to) || seen.has(to)) continue;
//     seen.add(to); out.push({ to, name: String(p?.name || '').replace(/[{}\u0000-\u001f,;]/g, '').trim().slice(0, 40) });
//   }
//   return out;
// }

// export async function onRequest({ request, env, params }) {
//   const url = new URL(request.url);
//   const path = '/' + [].concat(params.path || []).join('/');
//   const user = { username: String(env.APP_USERNAME || '').toLowerCase() };

//   if (path === '/login' || path === '/me') return authed(request, env) ? json({ user }) : json({ error: path === '/login' ? 'Incorrect username or password.' : 'Not logged in.' }, 401);
//   if (!authed(request, env)) return json({ error: 'Please log in first.' }, 401);

//   if (path === '/public-check') {
//     const ok = !!(env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY);
//     return json({ ok, url: url.origin, error: ok ? undefined : 'SUPABASE_URL / SUPABASE_SERVICE_KEY are not set in Cloudflare.' });
//   }

//   if (path === '/upload' && request.method === 'POST') {
//     if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) return json({ error: 'Audio storage (Supabase) is not configured.' }, 500);
//     const buf = await request.arrayBuffer();
//     if (buf.byteLength < 100 || buf.byteLength > 25e6) return json({ error: 'Empty or too large audio file.' }, 400);
//     const name = [...crypto.getRandomValues(new Uint8Array(12))].map((b) => b.toString(16).padStart(2, '0')).join('') + '.wav';
//     const base = env.SUPABASE_URL.replace(/\/$/, '');
//     const r = await fetch(`${base}/storage/v1/object/${env.SUPABASE_BUCKET || 'audio'}/${name}`, {
//       method: 'POST', body: buf,
//       headers: { ...(env.SUPABASE_SERVICE_KEY.startsWith('eyJ') ? { Authorization: 'Bearer ' + env.SUPABASE_SERVICE_KEY } : {}), apikey: env.SUPABASE_SERVICE_KEY, 'Content-Type': 'audio/wav', 'x-upsert': 'true' },
//     });
//     if (!r.ok) return json({ error: 'Audio upload failed: ' + (await r.text()).slice(0, 200) }, 502);
//     return json({ url: `${base}/storage/v1/object/public/${env.SUPABASE_BUCKET || 'audio'}/${name}` });
//   }

//   // Saved contact lists (class / staff) — one row per list in Supabase table `contact_groups` (see supabase-contacts.sql)
//   if (path === '/groups' || path.startsWith('/groups/')) {
//     if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) return json({ error: 'Supabase is not configured.' }, 500);
//     const key = env.SUPABASE_SERVICE_KEY, tbl = env.SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/contact_groups';
//     const H = { ...(key.startsWith('eyJ') ? { Authorization: 'Bearer ' + key } : {}), apikey: key, 'Content-Type': 'application/json' };
//     const fail = async (r) => json({ error: 'Contact list storage error: ' + (await r.text()).slice(0, 200) }, 502);
//     if (path === '/groups' && request.method === 'GET') {
//       const r = await fetch(tbl + '?select=grp,people,updated_at', { headers: H });
//       if (!r.ok) return fail(r);
//       return json({ groups: Object.fromEntries((await r.json()).map((x) => [x.grp, { people: x.people, updated_at: x.updated_at }])) });
//     }
//     const grp = path.slice(8);
//     if (!/^[a-z0-9-]{1,40}$/.test(grp)) return json({ error: 'Invalid list name.' }, 400);
//     if (request.method === 'PUT') {
//       const people = cleanPeople((await request.json().catch(() => ({}))).people);
//       if (!people.length) return json({ error: 'No valid mobile numbers found.' }, 400);
//       if (people.length > 5000) return json({ error: 'Max 5000 numbers per list.' }, 400);
//       const r = await fetch(tbl + '?on_conflict=grp', { method: 'POST', headers: { ...H, Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ grp, people, updated_at: new Date().toISOString() }) });
//       return r.ok ? json({ ok: true, count: people.length }) : fail(r);
//     }
//     if (request.method === 'DELETE') { const r = await fetch(`${tbl}?grp=eq.${grp}`, { method: 'DELETE', headers: H }); return r.ok ? json({ ok: true }) : fail(r); }
//     return json({ error: 'Not found' }, 404);
//   }

//   if (path.startsWith('/omixo/')) {
//     const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text();
//     const r = await fetch(OMIXO(env) + path.slice(6) + url.search, {
//       method: request.method, body,
//       headers: { 'X-API-Key': env.OMIXO_API_KEY, ...(body ? { 'Content-Type': 'application/json' } : {}) },
//     });
//     return new Response(await r.text(), { status: r.status, headers: { 'content-type': 'application/json' } });
//   }
//   return json({ error: 'Not found' }, 404);
// }


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

const norm10 = (v) => String(v || '').replace(/\D/g, '').slice(-10);
function cleanPeople(arr) {
  const seen = new Set(), out = [];
  for (const p of Array.isArray(arr) ? arr : []) {
    const to = norm10(p?.to); if (!/^[6-9]\d{9}$/.test(to) || seen.has(to)) continue;
    seen.add(to); out.push({ to, name: String(p?.name || '').replace(/[{}\u0000-\u001f,;]/g, '').trim().slice(0, 40) });
  }
  return out;
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

  // Saved contact lists — user-made; one row per list in Supabase table `contact_groups` (see supabase-contacts.sql)
  if (path === '/groups' || path.startsWith('/groups/')) {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) return json({ error: 'Supabase is not configured.' }, 500);
    const key = env.SUPABASE_SERVICE_KEY, tbl = env.SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/contact_groups';
    const H = { ...(key.startsWith('eyJ') ? { Authorization: 'Bearer ' + key } : {}), apikey: key, 'Content-Type': 'application/json' };
    const fail = async (r) => json({ error: 'Contact list storage error: ' + (await r.text()).slice(0, 200) }, 502);
    const KINDS = ['student', 'staff', 'other'];
    const cleanLabel = (v) => String(v || '').replace(/[\u0000-\u001f]/g, '').trim().slice(0, 40);

    if (path === '/groups' && request.method === 'GET') {
      const r = await fetch(tbl + '?select=grp,label,kind,people,updated_at&order=created_at.asc', { headers: H });
      if (!r.ok) return fail(r);
      return json({ groups: (await r.json()).map((x) => ({ id: x.grp, label: x.label || x.grp, kind: x.kind || 'student', people: x.people || [], updated_at: x.updated_at })) });
    }
    if (path === '/groups' && request.method === 'POST') {
      const b = await request.json().catch(() => ({}));
      const label = cleanLabel(b.label); if (!label) return json({ error: 'Enter a list name.' }, 400);
      const kind = KINDS.includes(b.kind) ? b.kind : 'student';
      const id = /^[a-z0-9-]{1,40}$/.test(b.id || '') ? b.id : 'g' + Math.random().toString(36).slice(2, 10);
      const r = await fetch(tbl, { method: 'POST', headers: { ...H, Prefer: 'return=minimal' }, body: JSON.stringify({ grp: id, label, kind, people: [] }) });
      if (r.status === 409) return json({ error: 'A list with this id already exists.' }, 409);
      return r.ok ? json({ ok: true, id }) : fail(r);
    }
    const grp = path.slice(8);
    if (!/^[a-z0-9-]{1,40}$/.test(grp)) return json({ error: 'Invalid list.' }, 400);
    if (request.method === 'PUT') {          // rename / change type / replace numbers
      const b = await request.json().catch(() => ({})), patch = {};
      if ('label' in b) { patch.label = cleanLabel(b.label); if (!patch.label) return json({ error: 'Enter a list name.' }, 400); }
      if ('kind' in b) { if (!KINDS.includes(b.kind)) return json({ error: 'Invalid type.' }, 400); patch.kind = b.kind; }
      if ('people' in b) {
        const people = cleanPeople(b.people);
        if (!people.length) return json({ error: 'No valid mobile numbers found.' }, 400);
        if (people.length > 5000) return json({ error: 'Max 5000 numbers per list.' }, 400);
        patch.people = people; patch.updated_at = new Date().toISOString();
      }
      if (!Object.keys(patch).length) return json({ error: 'Nothing to update.' }, 400);
      const r = await fetch(`${tbl}?grp=eq.${grp}`, { method: 'PATCH', headers: { ...H, Prefer: 'return=representation' }, body: JSON.stringify(patch) });
      if (!r.ok) return fail(r);
      return (await r.json()).length ? json({ ok: true, count: patch.people?.length }) : json({ error: 'List not found.' }, 404);
    }
    if (request.method === 'DELETE') { const r = await fetch(`${tbl}?grp=eq.${grp}`, { method: 'DELETE', headers: H }); return r.ok ? json({ ok: true }) : fail(r); }
    return json({ error: 'Not found' }, 404);
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