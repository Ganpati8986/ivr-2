import { useEffect, useState } from 'react';
import { Upload, Trash2, Check } from 'lucide-react';
import { api } from './api';
import { GROUPS, parseRecipients, fileToText } from './lib';

const when = (iso) => (iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

export default function Contacts() {
  const [data, setData] = useState(null);
  const [pending, setPending] = useState(null); // { id, label, r }
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const load = () => api('GET', '/groups').then((d) => setData(d.groups || {})).catch((e) => { setErr(e.message); setData({}); });
  useEffect(() => { load(); }, []);

  const pick = (g) => async (e) => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return;
    setErr('');
    try {
      const r = parseRecipients(await fileToText(f));
      if (!r.valid.length) return setErr(`No valid 10-digit mobile numbers found in “${f.name}”.`);
      setPending({ id: g.id, label: g.label, r });
    } catch { setErr('Could not read this file. Please use an Excel (.xlsx / .xls), .csv or .txt file.'); }
  };
  const save = async () => {
    setBusy(true); setErr('');
    try { await api('PUT', '/groups/' + pending.id, { people: pending.r.valid }); setPending(null); await load(); }
    catch (e) { setErr(e.message); }
    setBusy(false);
  };
  const clear = async (g) => {
    if (!window.confirm(`Delete the saved list “${g.label}”?`)) return;
    setErr('');
    try { await api('DELETE', '/groups/' + g.id); await load(); } catch (e) { setErr(e.message); }
  };

  const Row = ({ g }) => {
    const l = data?.[g.id];
    return (
      <li>
        <b>{g.label}</b>
        {l ? <span className="badge g">{l.people.length} numbers</span> : <span className="badge">empty</span>}
        {l && <small>updated {when(l.updated_at)}</small>}
        <div className="acts">
          <label className="ghost file"><Upload size={14} /> {l ? 'Replace' : 'Upload'}<input type="file" accept=".xlsx,.xls,.xlsm,.ods,.csv,.txt" hidden onChange={pick(g)} /></label>
          {l && <button className="ghost" onClick={() => clear(g)} aria-label={`Delete ${g.label}`}><Trash2 size={14} /></button>}
        </div>
      </li>
    );
  };

  return (
    <>
      <header className="head">
        <h1>Contact lists</h1>
        <p>Upload one Excel / CSV per class or staff group once. On the Send page they appear in a drop-down, so you never need to pick the file again.</p>
      </header>
      {err && <div className="alert r">{err}</div>}
      {pending && (
        <div className="card confirm">
          <h2>Save “{pending.label}”?</h2>
          <p><b>{pending.r.valid.length}</b> valid numbers{pending.r.dups ? ` · ${pending.r.dups} duplicates removed` : ''}{pending.r.invalid.length ? ` · ${pending.r.invalid.length} invalid skipped` : ''}. This replaces the list saved now.</p>
          <div className="row">
            <button className="primary" disabled={busy} onClick={save}><Check size={16} /> {busy ? 'Saving…' : 'Save list'}</button>
            <button className="ghost" disabled={busy} onClick={() => setPending(null)}>Cancel</button>
          </div>
        </div>
      )}
      <section className="card">
        <h2>Classes</h2>
        <p className="desc">Excel columns: <code>Mobile</code> and <code>Name</code> (any order, name optional, first row can be a header).</p>
        {data === null ? <div className="empty">Loading…</div> : <ul className="log">{GROUPS.filter((g) => g.kind === 'student').map((g) => <Row key={g.id} g={g} />)}</ul>}
      </section>
      <section className="card">
        <h2>Staff</h2>
        {data === null ? <div className="empty">Loading…</div> : <ul className="log">{GROUPS.filter((g) => g.kind === 'staff').map((g) => <Row key={g.id} g={g} />)}</ul>}
      </section>
    </>
  );
}