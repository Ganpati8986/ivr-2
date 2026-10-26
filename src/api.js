// // Browser-only "backend": login/upload/Omixo go through the Cloudflare Pages Function (/api/*),
// // notice history lives in this browser's localStorage. Demo build. The previous server client is in api.server.js.bak
// const KEY = 'vn_auth', NK = 'vn_notices', MAX_NOTICE = 2000, DAILY = 50;
// const GROUP = (s) => (['completed', 'answered'].includes(s) ? 'done' : s === 'no_answer' ? 'missed' : s === 'failed' ? 'failed' : 'pending');
// const norm10 = (s) => String(s || '').replace(/\D/g, '').slice(-10);
// const validNum = (d) => /^[6-9]\d{9}$/.test(d);
// const store = {
//   get: () => { try { return JSON.parse(localStorage.getItem(NK)) || []; } catch { return []; } },
//   set: (a) => { for (let n = a.length; n > 0; n = Math.floor(n / 2)) { try { localStorage.setItem(NK, JSON.stringify(a.slice(0, n))); return; } catch { /* quota: keep fewer */ } } },
// };

// async function call(method, path, body, headers = {}) {
//   const a = sessionStorage.getItem(KEY);
//   const opt = { method, headers: { ...(a ? { Authorization: 'Basic ' + a } : {}), ...headers } };
//   if (body !== undefined && body !== null) { opt.body = body instanceof Blob ? body : JSON.stringify(body); if (!(body instanceof Blob)) opt.headers['Content-Type'] = 'application/json'; }
//   let r;
//   try { r = await fetch('/api' + path, opt); } catch { throw new Error('Could not connect to the server.'); }
//   const d = await r.json().catch(() => ({}));
//   if (r.status === 401 && path !== '/login' && path !== '/me') window.dispatchEvent(new Event('auth-lost'));
//   if (!r.ok || d.ok === false) throw new Error(d.error || d.message || `Error ${r.status}`);
//   return d;
// }
// const omixo = (m, p, b) => call(m, '/omixo' + p, b);

// async function createNotice({ mode, msg, audio_url, people, title }) {
//   const shared = mode === 'audio' ? { audio_url } : { say: msg, voice: import.meta.env.VITE_VOICE || 'priya' };
//   const batches = []; let rejected = 0, sent = 0, error = null;
//   for (let i = 0; i < people.length; i += 1000) {
//     const chunk = people.slice(i, i + 1000);
//     try {
//       const d = await omixo('POST', '/calls/obd/bulk', { ...shared, calls: chunk.map((p) => ({ to: p.to, vars: { name: p.name || 'Abhibhavak' } })) });
//       batches.push(d.batch_id); rejected += d.rejected || 0; sent += chunk.length;
//     } catch (e) { error = e; break; }
//   }
//   if (!batches.length) throw error;
//   const list = store.get();
//   const id = (list[0]?.id || 0) + 1;
//   list.unshift({ id, username: sessionStorage.getItem('vn_user') || '', title, mode, msg: msg || null, audio_url: audio_url || null, total: sent, rejected, batches, people: people.slice(0, sent), created_at: new Date().toISOString() });
//   store.set(list);
//   return { id, partial: error ? `Only ${sent}/${people.length} numbers were queued: ${error.message}` : null };
// }

// async function statusOf(n) {
//   const names = Object.fromEntries(n.people.map((p) => [p.to, p.name]));
//   const parts = await Promise.allSettled(n.batches.map((b) => omixo('GET', '/calls/obd/batch/' + encodeURIComponent(b))));
//   const ok = parts.filter((p) => p.status === 'fulfilled').map((p) => p.value);
//   if (!ok.length) throw new Error('Status is not available right now.');
//   const counts = { done: 0, missed: 0, failed: 0, pending: 0 }, calls = [];
//   ok.forEach((d) => {
//     Object.entries(d.by_status || {}).forEach(([s, c]) => { counts[GROUP(s)] += c; });
//     (d.calls || []).forEach((c) => { const to = norm10(c.to); calls.push({ to, name: names[to] || '', group: GROUP(c.status), duration: c.duration_sec ?? 0 }); });
//   });
//   counts.pending += Math.max(0, n.total - n.rejected - Object.values(counts).reduce((a, b) => a + b, 0));
//   return { counts, calls };
// }

// export async function api(method, path, body, raw) {
//   if (path === '/login') {
//     const tok = btoa(`${String(body.username).trim()}:${body.password}`);
//     sessionStorage.setItem(KEY, tok);
//     try { const d = await call('POST', '/login'); sessionStorage.setItem('vn_user', d.user.username); return d; } catch (e) { sessionStorage.removeItem(KEY); throw e; }
//   }
//   if (path === '/me') { if (!sessionStorage.getItem(KEY)) throw new Error('Not logged in.'); return call('GET', '/me'); }
//   if (path === '/logout') { sessionStorage.removeItem(KEY); return { ok: true }; }
//   if (path === '/public-check') return call('GET', '/public-check');
//   if (path === '/upload') return call('POST', '/upload', raw.body);
//   if (path.startsWith('/records')) return { records: (await omixo('GET', '/calls/records' + path.slice(8))).records || [] };

//   if (path === '/notices' && method === 'GET') return { notices: store.get().slice(0, 50).map(({ id, username, title, mode, total, rejected, created_at }) => ({ id, username, title, mode, total, rejected, created_at })) };
//   if (path === '/notices' && method === 'POST') {
//     const seen = new Set(), people = [];
//     for (const p of body.people || []) { const to = norm10(p?.to); if (!validNum(to) || seen.has(to)) continue; seen.add(to); people.push({ to, name: String(p?.name || '').replace(/[{}]/g, '').trim().slice(0, 40) }); }
//     if (!people.length) throw new Error('No valid mobile numbers found.');
//     if (people.length > MAX_NOTICE) throw new Error(`Max ${MAX_NOTICE} numbers per notice.`);
//     const today = new Date(); today.setHours(0, 0, 0, 0);
//     const used = store.get().filter((n) => new Date(n.created_at) >= today).reduce((s, n) => s + n.total, 0);
//     if (used + people.length > DAILY) throw new Error(`Daily limit is ${DAILY} calls; ${used} already sent today.`);
//     if (body.mode === 'say') { const m = String(body.msg || '').trim(); if (!m || m.length > 800) throw new Error('Message must be 1 to 800 characters.'); return createNotice({ mode: 'say', msg: m, title: m.slice(0, 50), people }); }
//     if (body.mode === 'audio' && body.audio_url) return createNotice({ mode: 'audio', audio_url: body.audio_url, title: 'Voice notice', people });
//     throw new Error('Invalid notice.');
//   }
//   const m = /^\/notices\/(\d+)\/(status|retry)$/.exec(path);
//   if (m) {
//     const n = store.get().find((x) => x.id === +m[1]); if (!n) throw new Error('Notice not found.');
//     const s = await statusOf(n);
//     if (m[2] === 'status') return { ...s, retryCount: s.calls.filter((c) => ['missed', 'failed'].includes(c.group)).length };
//     if (s.counts.pending) throw new Error('Wait until all calls have finished.');
//     const people = s.calls.filter((c) => ['missed', 'failed'].includes(c.group)).map((c) => ({ to: c.to, name: c.name }));
//     if (!people.length) throw new Error('No numbers to retry.');
//     return createNotice({ mode: n.mode, msg: n.msg, audio_url: n.audio_url, people, title: 'Retry: ' + n.title });
//   }
//   throw new Error('Not found');
// }



// Browser-only "backend": login/upload/Omixo go through the Cloudflare Pages Function (/api/*),
// notice history lives in this browser's localStorage. Demo build. The previous server client is in api.server.js.bak
const KEY = 'vn_auth', NK = 'vn_notices', MAX_NOTICE = 2000, DAILY = 50;
const GROUP = (s) => (['completed', 'answered'].includes(s) ? 'done' : s === 'no_answer' ? 'missed' : s === 'failed' ? 'failed' : 'pending');
const norm10 = (s) => String(s || '').replace(/\D/g, '').slice(-10);
const validNum = (d) => /^[6-9]\d{9}$/.test(d);
const store = {
  get: () => { try { return JSON.parse(localStorage.getItem(NK)) || []; } catch { return []; } },
  set: (a) => { for (let n = a.length; n > 0; n = Math.floor(n / 2)) { try { localStorage.setItem(NK, JSON.stringify(a.slice(0, n))); return; } catch { /* quota: keep fewer */ } } },
};

async function call(method, path, body, headers = {}) {
  const a = sessionStorage.getItem(KEY);
  const opt = { method, headers: { ...(a ? { Authorization: 'Basic ' + a } : {}), ...headers } };
  if (body !== undefined && body !== null) { opt.body = body instanceof Blob ? body : JSON.stringify(body); if (!(body instanceof Blob)) opt.headers['Content-Type'] = 'application/json'; }
  let r;
  try { r = await fetch('/api' + path, opt); } catch { throw new Error('Could not connect to the server.'); }
  const d = await r.json().catch(() => ({}));
  if (r.status === 401 && path !== '/login' && path !== '/me') window.dispatchEvent(new Event('auth-lost'));
  if (!r.ok || d.ok === false) throw new Error(d.error || d.message || `Error ${r.status}`);
  return d;
}
const omixo = (m, p, b) => call(m, '/omixo' + p, b);

async function createNotice({ mode, msg, audio_url, people, title }) {
  const shared = mode === 'audio' ? { audio_url } : { say: msg, voice: import.meta.env.VITE_VOICE || 'priya' };
  const batches = []; let rejected = 0, sent = 0, error = null;
  for (let i = 0; i < people.length; i += 1000) {
    const chunk = people.slice(i, i + 1000);
    try {
      const d = await omixo('POST', '/calls/obd/bulk', { ...shared, calls: chunk.map((p) => ({ to: p.to, vars: { name: p.name || 'Abhibhavak' } })) });
      batches.push(d.batch_id); rejected += d.rejected || 0; sent += chunk.length;
    } catch (e) { error = e; break; }
  }
  if (!batches.length) throw error;
  const list = store.get();
  const id = (list[0]?.id || 0) + 1;
  list.unshift({ id, username: sessionStorage.getItem('vn_user') || '', title, mode, msg: msg || null, audio_url: audio_url || null, total: sent, rejected, batches, people: people.slice(0, sent), created_at: new Date().toISOString() });
  store.set(list);
  return { id, partial: error ? `Only ${sent}/${people.length} numbers were queued: ${error.message}` : null };
}

async function statusOf(n) {
  const names = Object.fromEntries(n.people.map((p) => [p.to, p.name]));
  const parts = await Promise.allSettled(n.batches.map((b) => omixo('GET', '/calls/obd/batch/' + encodeURIComponent(b))));
  const ok = parts.filter((p) => p.status === 'fulfilled').map((p) => p.value);
  if (!ok.length) throw new Error('Status is not available right now.');
  const counts = { done: 0, missed: 0, failed: 0, pending: 0 }, calls = [];
  ok.forEach((d) => {
    Object.entries(d.by_status || {}).forEach(([s, c]) => { counts[GROUP(s)] += c; });
    (d.calls || []).forEach((c) => { const to = norm10(c.to); calls.push({ to, name: names[to] || '', group: GROUP(c.status), duration: c.duration_sec ?? 0 }); });
  });
  counts.pending += Math.max(0, n.total - n.rejected - Object.values(counts).reduce((a, b) => a + b, 0));
  return { counts, calls };
}

export async function api(method, path, body, raw) {
  if (path === '/login') {
    const tok = btoa(`${String(body.username).trim()}:${body.password}`);
    sessionStorage.setItem(KEY, tok);
    try { const d = await call('POST', '/login'); sessionStorage.setItem('vn_user', d.user.username); return d; } catch (e) { sessionStorage.removeItem(KEY); throw e; }
  }
  if (path === '/me') { if (!sessionStorage.getItem(KEY)) throw new Error('Not logged in.'); return call('GET', '/me'); }
  if (path === '/logout') { sessionStorage.removeItem(KEY); return { ok: true }; }
  if (path === '/public-check') return call('GET', '/public-check');
  if (path === '/upload') return call('POST', '/upload', raw.body);
  if (path === '/groups' && method === 'GET') return call('GET', '/groups');
  if (/^\/groups\/[a-z0-9-]+$/.test(path)) return method === 'PUT' ? call('PUT', path, body) : call('DELETE', path);
  if (path.startsWith('/records')) return { records: (await omixo('GET', '/calls/records' + path.slice(8))).records || [] };

  if (path === '/notices' && method === 'GET') return { notices: store.get().slice(0, 50).map(({ id, username, title, mode, total, rejected, created_at }) => ({ id, username, title, mode, total, rejected, created_at })) };
  if (path === '/notices' && method === 'POST') {
    const seen = new Set(), people = [];
    for (const p of body.people || []) { const to = norm10(p?.to); if (!validNum(to) || seen.has(to)) continue; seen.add(to); people.push({ to, name: String(p?.name || '').replace(/[{}]/g, '').trim().slice(0, 40) }); }
    if (!people.length) throw new Error('No valid mobile numbers found.');
    if (people.length > MAX_NOTICE) throw new Error(`Max ${MAX_NOTICE} numbers per notice.`);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const used = store.get().filter((n) => new Date(n.created_at) >= today).reduce((s, n) => s + n.total, 0);
    if (used + people.length > DAILY) throw new Error(`Daily limit is ${DAILY} calls; ${used} already sent today.`);
    if (body.mode === 'say') { const m = String(body.msg || '').trim(); if (!m || m.length > 800) throw new Error('Message must be 1 to 800 characters.'); return createNotice({ mode: 'say', msg: m, title: m.slice(0, 50), people }); }
    if (body.mode === 'audio' && body.audio_url) return createNotice({ mode: 'audio', audio_url: body.audio_url, title: 'Voice notice', people });
    throw new Error('Invalid notice.');
  }
  const m = /^\/notices\/(\d+)\/(status|retry)$/.exec(path);
  if (m) {
    const n = store.get().find((x) => x.id === +m[1]); if (!n) throw new Error('Notice not found.');
    const s = await statusOf(n);
    if (m[2] === 'status') return { ...s, retryCount: s.calls.filter((c) => ['missed', 'failed'].includes(c.group)).length };
    if (s.counts.pending) throw new Error('Wait until all calls have finished.');
    const people = s.calls.filter((c) => ['missed', 'failed'].includes(c.group)).map((c) => ({ to: c.to, name: c.name }));
    if (!people.length) throw new Error('No numbers to retry.');
    return createNotice({ mode: n.mode, msg: n.msg, audio_url: n.audio_url, people, title: 'Retry: ' + n.title });
  }
  throw new Error('Not found');
}