import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { api } from './api';
import { LABEL, TONE } from './lib';

const RANGES = [['all', 'All time'], ['today', 'Today'], ['7', 'Last 7 days'], ['30', 'Last 30 days']];
const GROUPS = ['done', 'missed', 'failed', 'pending'];

const fmt = (v) => new Date(v).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
const pct = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : '–');
const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const what = (n) => (n.mode === 'audio' ? 'Voice recording / audio file' : n.msg || n.title);
const listsOf = (n) => (n.list_names?.length ? n.list_names.join(', ') : '—');
const download = (name, rows) => {
  const blob = new Blob(['\uFEFF' + rows.map((r) => r.map(esc).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
};

export default function History() {
  const [list, setList] = useState([]);
  const [stats, setStats] = useState({}); // notice id -> status data (counts + calls)
  const [range, setRange] = useState('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);
  const [filter, setFilter] = useState('all');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const cache = useRef({});

  const load = useCallback(async (force) => {
    setBusy(true); setErr('');
    try {
      const { notices } = await api('GET', '/notices');
      setList(notices);
      if (force) cache.current = {};
      // finished notices never change, so they are fetched once; unfinished ones are re-checked on every refresh
      const todo = notices.filter((n) => !cache.current[n.id]);
      for (let i = 0; i < todo.length; i += 5) {
        await Promise.all(todo.slice(i, i + 5).map(async (n) => {
          try {
            const d = await api('GET', `/notices/${n.id}/status`);
            if (d.counts.pending === 0) cache.current[n.id] = d;
            setStats((s) => ({ ...s, [n.id]: d }));
          } catch { /* status not available for this one right now */ }
        }));
      }
    } catch (e) { setErr(e.message || 'Could not load history.'); }
    setBusy(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const shown = useMemo(() => {
    const t0 = new Date(); t0.setHours(0, 0, 0, 0);
    const from = range === 'today' ? +t0 : range === 'all' ? 0 : Date.now() - +range * 864e5;
    const s = q.trim().toLowerCase();
    return list.filter((n) => new Date(n.created_at) >= from
      && (!s || [what(n), listsOf(n), n.username, n.title].some((v) => String(v || '').toLowerCase().includes(s))));
  }, [list, range, q]);

  const sum = useMemo(() => shown.reduce((a, n) => {
    const c = stats[n.id]?.counts;
    a.numbers += n.total - n.rejected;
    GROUPS.forEach((g) => { a[g] += c ? c[g] : 0; });
    return a;
  }, { numbers: 0, done: 0, missed: 0, failed: 0, pending: 0 }), [shown, stats]);

  const sel = list.find((n) => n.id === open);
  const sd = sel && stats[sel.id];
  const calls = (sd?.calls || []).filter((c) => filter === 'all' || c.group === filter);

  const exportAll = () => download('call-history.csv', [
    ['Date', 'Sent by', 'Voice / message', 'List', 'Numbers', 'Answered', 'No answer', 'Failed', 'In queue'],
    ...shown.map((n) => { const c = stats[n.id]?.counts || {}; return [fmt(n.created_at), n.username, what(n), listsOf(n), n.total - n.rejected, c.done, c.missed, c.failed, c.pending]; }),
  ]);
  const exportOne = () => download(`notice-${sel.id}.csv`, [
    ['Name', 'Number', 'Status', 'Talk time (sec)'],
    ...(sd?.calls || []).map((c) => [c.name, c.to, LABEL[c.group], c.duration]),
  ]);

  return (
    <>
      <header className="head">
        <h1>Call history</h1>
        <p>Every notice you sent: what was played, to which list, when, and how many people answered or missed it (outbound calls only).</p>
      </header>

      <section className="card">
        <div className="stats4" style={{ gridTemplateColumns: 'repeat(5,1fr)', marginTop: 0 }}>
          <div className="s"><strong>{shown.length}</strong><span>Notices sent</span></div>
          <div className="s"><strong>{sum.numbers}</strong><span>Numbers called</span></div>
          <div className="s g"><strong>{sum.done}</strong><span>Answered ({pct(sum.done, sum.numbers)})</span></div>
          <div className="s a"><strong>{sum.missed}</strong><span>No answer ({pct(sum.missed, sum.numbers)})</span></div>
          <div className="s r"><strong>{sum.failed}</strong><span>Failed</span></div>
        </div>

        <div className="row between">
          <span className="row">
            <input className="search" placeholder="Search message, list or user" value={q} onChange={(e) => setQ(e.target.value)} />
            <select value={range} onChange={(e) => setRange(e.target.value)}>
              {RANGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </span>
          <span className="row">
            <button className="ghost" type="button" onClick={() => load(true)} disabled={busy}><RefreshCw size={14} /> {busy ? 'Loading...' : 'Refresh'}</button>
            <button className="ghost" type="button" onClick={exportAll} disabled={!shown.length}><Download size={14} /> Export CSV</button>
          </span>
        </div>

        {err && <div className="alert r">{err}</div>}

        <div className="tablewrap" style={{ marginTop: 12 }}>
          <table>
            <thead>
              <tr><th>Date &amp; time</th><th>Voice / message</th><th>List</th><th>Numbers</th><th>Answered</th><th>No answer</th><th>Failed</th><th>In queue</th><th>Answer rate</th><th /></tr>
            </thead>
            <tbody>
              {shown.map((n) => {
                const c = stats[n.id]?.counts; const total = n.total - n.rejected;
                return (
                  <tr key={n.id} style={n.id === open ? { background: '#EEF6F7' } : undefined}>
                    <td className="mono">{fmt(n.created_at)}<br /><small>{n.username}</small></td>
                    <td style={{ maxWidth: 280 }} title={what(n)}>{what(n).length > 90 ? what(n).slice(0, 90) + '…' : what(n)}</td>
                    <td style={{ maxWidth: 180 }}>{listsOf(n)}</td>
                    <td className="mono">{total}{n.rejected ? <small> (+{n.rejected} rejected)</small> : null}</td>
                    {GROUPS.map((g) => <td key={g} className="mono">{c ? <span className={'badge ' + TONE[g]}>{c[g]}</span> : '…'}</td>)}
                    <td className="mono">{c ? pct(c.done, total) : '…'}</td>
                    <td><button className="link" onClick={() => { setOpen(n.id === open ? null : n.id); setFilter('all'); }}>{n.id === open ? 'Hide' : 'Details'}</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!shown.length && !busy && !err && <div className="empty">{list.length ? 'No notices in this period.' : 'No notices have been sent yet.'}</div>}
      </section>

      {sel && (
        <section className="card">
          <div className="row between">
            <h2>Notice details</h2>
            <button className="ghost" type="button" onClick={exportOne} disabled={!sd}><Download size={14} /> Export numbers</button>
          </div>
          <p><b>Sent:</b> {fmt(sel.created_at)} by {sel.username}</p>
          <p><b>List:</b> {listsOf(sel)}</p>
          <p><b>{sel.mode === 'audio' ? 'Voice:' : 'Message:'}</b> {sel.mode === 'audio' ? '' : sel.msg || sel.title}</p>
          {sel.mode === 'audio' && sel.audio_url && <audio controls src={sel.audio_url} style={{ width: '100%', maxWidth: 420 }} />}

          {sd ? (
            <>
              <div className="stats4">
                {GROUPS.map((g) => <div key={g} className={'s ' + TONE[g]}><strong>{sd.counts[g]}</strong><span>{LABEL[g]}</span></div>)}
              </div>
              <div className="row" style={{ gap: 8, marginBottom: 10 }}>
                {[['all', 'All'], ...GROUPS.map((g) => [g, LABEL[g]])].map(([g, l]) => (
                  <button key={g} className={filter === g ? 'primary' : 'ghost'} type="button" onClick={() => setFilter(g)}>{l}</button>
                ))}
              </div>
              <div className="tablewrap">
                <table>
                  <thead><tr><th>Name</th><th>Number</th><th>Status</th><th>Talk time (sec)</th></tr></thead>
                  <tbody>
                    {calls.map((x, i) => (
                      <tr key={i}><td>{x.name || '—'}</td><td className="mono">{x.to}</td><td><span className={'badge ' + TONE[x.group]}>{LABEL[x.group]}</span></td><td className="mono">{x.duration}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!calls.length && <div className="empty">No numbers in this status.</div>}
              <small>To call the missed numbers again, use “Delivery status” → “Call again those who didn’t answer”.</small>
            </>
          ) : <div className="empty">Loading…</div>}
        </section>
      )}
    </>
  );
}
