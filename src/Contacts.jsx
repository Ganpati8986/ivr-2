// import { useEffect, useState } from 'react';
// import { Upload, Trash2, Check } from 'lucide-react';
// import { api } from './api';
// import { GROUPS, parseRecipients, fileToText } from './lib';

// const when = (iso) => (iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

// export default function Contacts() {
//   const [data, setData] = useState(null);
//   const [pending, setPending] = useState(null); // { id, label, r }
//   const [busy, setBusy] = useState(false);
//   const [err, setErr] = useState('');

//   const load = () => api('GET', '/groups').then((d) => setData(d.groups || {})).catch((e) => { setErr(e.message); setData({}); });
//   useEffect(() => { load(); }, []);

//   const pick = (g) => async (e) => {
//     const f = e.target.files[0]; e.target.value = ''; if (!f) return;
//     setErr('');
//     try {
//       const r = parseRecipients(await fileToText(f));
//       if (!r.valid.length) return setErr(`No valid 10-digit mobile numbers found in “${f.name}”.`);
//       setPending({ id: g.id, label: g.label, r });
//     } catch { setErr('Could not read this file. Please use an Excel (.xlsx / .xls), .csv or .txt file.'); }
//   };
//   const save = async () => {
//     setBusy(true); setErr('');
//     try { await api('PUT', '/groups/' + pending.id, { people: pending.r.valid }); setPending(null); await load(); }
//     catch (e) { setErr(e.message); }
//     setBusy(false);
//   };
//   const clear = async (g) => {
//     if (!window.confirm(`Delete the saved list “${g.label}”?`)) return;
//     setErr('');
//     try { await api('DELETE', '/groups/' + g.id); await load(); } catch (e) { setErr(e.message); }
//   };

//   const Row = ({ g }) => {
//     const l = data?.[g.id];
//     return (
//       <li>
//         <b>{g.label}</b>
//         {l ? <span className="badge g">{l.people.length} numbers</span> : <span className="badge">empty</span>}
//         {l && <small>updated {when(l.updated_at)}</small>}
//         <div className="acts">
//           <label className="ghost file"><Upload size={14} /> {l ? 'Replace' : 'Upload'}<input type="file" accept=".xlsx,.xls,.xlsm,.ods,.csv,.txt" hidden onChange={pick(g)} /></label>
//           {l && <button className="ghost" onClick={() => clear(g)} aria-label={`Delete ${g.label}`}><Trash2 size={14} /></button>}
//         </div>
//       </li>
//     );
//   };

//   return (
//     <>
//       <header className="head">
//         <h1>Contact lists</h1>
//         <p>Upload one Excel / CSV per class or staff group once. On the Send page they appear in a drop-down, so you never need to pick the file again.</p>
//       </header>
//       {err && <div className="alert r">{err}</div>}
//       {pending && (
//         <div className="card confirm">
//           <h2>Save “{pending.label}”?</h2>
//           <p><b>{pending.r.valid.length}</b> valid numbers{pending.r.dups ? ` · ${pending.r.dups} duplicates removed` : ''}{pending.r.invalid.length ? ` · ${pending.r.invalid.length} invalid skipped` : ''}. This replaces the list saved now.</p>
//           <div className="row">
//             <button className="primary" disabled={busy} onClick={save}><Check size={16} /> {busy ? 'Saving…' : 'Save list'}</button>
//             <button className="ghost" disabled={busy} onClick={() => setPending(null)}>Cancel</button>
//           </div>
//         </div>
//       )}
//       <section className="card">
//         <h2>Classes</h2>
//         <p className="desc">Excel columns: <code>Mobile</code> and <code>Name</code> (any order, name optional, first row can be a header).</p>
//         {data === null ? <div className="empty">Loading…</div> : <ul className="log">{GROUPS.filter((g) => g.kind === 'student').map((g) => <Row key={g.id} g={g} />)}</ul>}
//       </section>
//       <section className="card">
//         <h2>Staff</h2>
//         {data === null ? <div className="empty">Loading…</div> : <ul className="log">{GROUPS.filter((g) => g.kind === 'staff').map((g) => <Row key={g.id} g={g} />)}</ul>}
//       </section>
//     </>
//   );
// }



import { useEffect, useState } from 'react';
import { Upload, Trash2, Pencil, Plus, Wand2 } from 'lucide-react';
import { api } from './api';
import { KINDS, DEFAULT_LISTS, parseRecipients, fileToText } from './lib';

const when = (iso) => (iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

export default function Contacts() {
  const [groups, setGroups] = useState(null);
  const [pending, setPending] = useState(null); // uploaded file waiting for confirmation
  const [edit, setEdit] = useState(null);       // { id, label, kind }
  const [nw, setNw] = useState({ label: '', kind: 'student' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const load = () => api('GET', '/groups').then((d) => setGroups(d.groups || [])).catch((e) => { setErr(e.message); setGroups([]); });
  useEffect(() => { load(); }, []);
  const run = async (fn) => { setBusy(true); setErr(''); try { await fn(); await load(); } catch (e) { setErr(e.message); } setBusy(false); };

  const add = () => run(async () => {
    if (!nw.label.trim()) throw new Error('Enter a list name.');
    await api('POST', '/groups', nw); setNw({ ...nw, label: '' });
  });
  const seed = () => run(async () => { for (const g of DEFAULT_LISTS) await api('POST', '/groups', g); });
  const saveEdit = () => run(async () => { await api('PUT', '/groups/' + edit.id, { label: edit.label, kind: edit.kind }); setEdit(null); });
  const remove = (g) => { if (window.confirm(`Delete “${g.label}” and its ${g.people.length} saved numbers?`)) run(() => api('DELETE', '/groups/' + g.id)); };
  const saveUpload = () => run(async () => { await api('PUT', '/groups/' + pending.id, { people: pending.r.valid }); setPending(null); });

  const pick = (g) => async (e) => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return;
    setErr('');
    try {
      const r = parseRecipients(await fileToText(f));
      if (!r.valid.length) return setErr(`No valid 10-digit mobile numbers found in “${f.name}”.`);
      setPending({ id: g.id, label: g.label, r });
    } catch { setErr('Could not read this file. Please use an Excel (.xlsx / .xls), .csv or .txt file.'); }
  };

  const row = (g) => edit?.id === g.id ? (
    <li key={g.id}>
      <input value={edit.label} maxLength={40} onChange={(e) => setEdit({ ...edit, label: e.target.value })} aria-label="List name" />
      <select value={edit.kind} onChange={(e) => setEdit({ ...edit, kind: e.target.value })} aria-label="Type">
        {Object.entries(KINDS).map(([k, t]) => <option key={k} value={k}>{t}</option>)}
      </select>
      <div className="acts">
        <button className="primary" disabled={busy} onClick={saveEdit}>Save</button>
        <button className="ghost" onClick={() => setEdit(null)}>Cancel</button>
      </div>
    </li>
  ) : (
    <li key={g.id}>
      <b>{g.label}</b>
      <span className={'badge' + (g.people.length ? ' g' : '')}>{g.people.length ? `${g.people.length} numbers` : 'empty'}</span>
      {g.people.length > 0 && <small>updated {when(g.updated_at)}</small>}
      <div className="acts">
        <label className="ghost file"><Upload size={14} /> {g.people.length ? 'Replace' : 'Upload'}<input type="file" accept=".xlsx,.xls,.xlsm,.ods,.csv,.txt" hidden onChange={pick(g)} /></label>
        <button className="ghost" onClick={() => setEdit({ id: g.id, label: g.label, kind: g.kind })} aria-label={`Edit ${g.label}`}><Pencil size={14} /></button>
        <button className="ghost" onClick={() => remove(g)} aria-label={`Delete ${g.label}`}><Trash2 size={14} /></button>
      </div>
    </li>
  );

  return (
    <>
      <header className="head">
        <h1>Contact lists</h1>
        <p>Make your own lists (a class, staff, bus drivers, committee…), upload an Excel / CSV once, and pick it from the drop-down on the Send page.</p>
      </header>
      {err && <div className="alert r">{err}</div>}

      {pending && (
        <div className="card confirm">
          <h2>Save numbers to “{pending.label}”?</h2>
          <p><b>{pending.r.valid.length}</b> valid numbers{pending.r.dups ? ` · ${pending.r.dups} duplicates removed` : ''}{pending.r.invalid.length ? ` · ${pending.r.invalid.length} invalid skipped` : ''}. This replaces the numbers saved in this list now.</p>
          <div className="row">
            <button className="primary" disabled={busy} onClick={saveUpload}>{busy ? 'Saving…' : 'Save'}</button>
            <button className="ghost" disabled={busy} onClick={() => setPending(null)}>Cancel</button>
          </div>
        </div>
      )}

      <section className="card">
        <h2>New list</h2>
        <div className="row">
          <input value={nw.label} maxLength={40} placeholder="e.g. Class 5, Bus Drivers, Committee" onChange={(e) => setNw({ ...nw, label: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && add()} aria-label="New list name" />
          <select value={nw.kind} onChange={(e) => setNw({ ...nw, kind: e.target.value })} aria-label="Type">
            {Object.entries(KINDS).map(([k, t]) => <option key={k} value={k}>{t}</option>)}
          </select>
          <button className="primary" disabled={busy} onClick={add}><Plus size={16} /> Add list</button>
        </div>
        <p className="desc">Type decides which combined option it joins: <b>All Students</b> (Students / Classes), <b>All Staff</b> (Staff). Every list joins <b>Entire School</b>.</p>
      </section>

      {groups === null && <div className="empty">Loading…</div>}
      {groups?.length === 0 && (
        <section className="card">
          <h2>No lists yet</h2>
          <p className="desc">Create your own above, or start with the standard set (Nursery, LKG, UKG, Class 1–12, Teaching Staff, Non-Teaching Staff). You can rename or delete any of them later.</p>
          <button className="ghost" disabled={busy} onClick={seed}><Wand2 size={16} /> {busy ? 'Creating…' : 'Create standard lists'}</button>
        </section>
      )}
      {groups?.length > 0 && Object.entries(KINDS).map(([k, title]) => {
        const items = groups.filter((g) => g.kind === k);
        return items.length > 0 && (
          <section className="card" key={k}>
            <h2>{title}</h2>
            <ul className="log">{items.map(row)}</ul>
          </section>
        );
      })}
      <p className="desc">Excel columns: <code>Mobile</code> and <code>Name</code> (any order, name optional, header row optional).</p>
    </>
  );
}