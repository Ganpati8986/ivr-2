// import { useEffect, useState } from 'react';
// import { Download, RefreshCw } from 'lucide-react';
// import { api } from './api';

// const L = { ANSWERED: ['Answered', 'g'], 'NO ANSWER': ['No answer', 'a'], BUSY: ['Busy', 'a'], FAILED: ['Failed', 'r'] };

// export default function Records() {
//   const [rows, setRows] = useState([]);
//   const [q, setQ] = useState('');
//   const [err, setErr] = useState('');
//   const [busy, setBusy] = useState(false);
//   const load = async () => {
//     setBusy(true); setErr('');
//     try { setRows((await api('GET', '/records?limit=300')).records); } catch (e) { setErr(e.message); }
//     setBusy(false);
//   };
//   useEffect(() => { load(); }, []);
//   const shown = rows.filter((r) => !q || `${r.to} ${r.from}`.includes(q.replace(/\D/g, '') || q));
//   const csv = () => {
//     const h = 'Date,From,To,Direction,Duration(sec),Status,Cost\n';
//     const b = shown.map((r) => [r.started_at, r.from, r.to, r.direction, r.duration, r.disposition, r.cost].join(',')).join('\n');
//     const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([h + b], { type: 'text/csv' }));
//     a.download = 'call-records.csv'; a.click();
//   };
//   return (
//     <>
//       <header className="head"><h1>Call records</h1><p>Every call: who it went to, how long it lasted and what it cost.</p></header>
//       <section className="card">
//         <div className="row between">
//           <input className="search" placeholder="Search by number" value={q} onChange={(e) => setQ(e.target.value)} />
//           <span className="row"><button className="ghost" onClick={load} disabled={busy}><RefreshCw size={14} /> Refresh</button><button className="ghost" onClick={csv}><Download size={14} /> Export CSV</button></span>
//         </div>
//         {err && <div className="alert r">{err}</div>}
//         <div className="tablewrap"><table>
//           <thead><tr><th>Date</th><th>Number</th><th>Talk time (sec)</th><th>Status</th><th>Cost</th></tr></thead>
//           <tbody>{shown.map((r) => { const [t, tone] = L[String(r.disposition).toUpperCase()] || [r.disposition, 'n']; return (
//             <tr key={r.cdr_id}><td className="mono">{r.started_at}</td><td className="mono">{r.to}</td><td className="mono">{r.duration}</td><td><span className={'badge ' + tone}>{t}</span></td><td className="mono">{r.cost}</td></tr>); })}</tbody>
//         </table></div>
//         {!shown.length && !busy && <div className="empty">No records found.</div>}
//       </section>
//     </>
//   );
// }


import { useEffect, useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { api } from './api';

const L = {
  ANSWERED: ['Answered', 'g'],
  'NO ANSWER': ['No answer', 'a'],
  BUSY: ['Busy', 'a'],
  FAILED: ['Failed', 'r'],
  'NO ANSWER': ['No answer', 'a'],
  'CANCEL': ['Cancelled', 'a'],
  CANCELED: ['Cancelled', 'a'],
  CONGESTION: ['Congestion', 'r'],
  'CHANUNAVAIL': ['Unavailable', 'r'],
};

const formatDate = (value) => {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

const escapeCSV = (value) => {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
};

export default function Records() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setBusy(true);
    setErr('');

    try {
      // const response = await api('GET', '/records?limit=300');
       const response = await api('GET', '/records');

      // Match the API response structure
      const records = Array.isArray(response?.records)
        ? response.records
        : [];

      setRows(records);
    } catch (e) {
      setErr(e.message || 'Failed to load call records.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Search using the actual API fields
  const searchValue = q.trim().toLowerCase();

  const shown = rows.filter((r) => {
    if (!searchValue) return true;

    return [
      r.dst,
      r.src,
      r.did,
      r.direction,
      r.disposition,
      r.channel_type,
      r.cost,
    ].some((value) =>
      String(value ?? '').toLowerCase().includes(searchValue)
    );
  });

  const csv = () => {
    const headers = [
      'ID',
      'Date',
      'From',
      'To',
      'DID',
      'Direction',
      'Talk Time (sec)',
      'Status',
      'Cost',
      'Channel Type',
      'Recording URL',
    ];

    const body = shown.map((r) => [
      r.id,
      r.start_at,
      r.src,
      r.dst,
      r.did,
      r.direction,
      r.billsec,
      r.disposition,
      r.cost,
      r.channel_type,
      r.recording_url,
    ]);

    const content = [
      headers.map(escapeCSV).join(','),
      ...body.map((row) => row.map(escapeCSV).join(',')),
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + content], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = 'call-records.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <>
      <header className="head">
        <h1>Call records</h1>
        <p>
          Every call: who it went to, how long it lasted and what it cost.
        </p>
      </header>

      <section className="card">
        <div className="row between">
          <input
            className="search"
            placeholder="Search by phone number or status"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <span className="row">
            <button
              className="ghost"
              onClick={load}
              disabled={busy}
              type="button"
            >
              <RefreshCw size={14} />
              {busy ? 'Loading...' : 'Refresh'}
            </button>

            <button
              className="ghost"
              onClick={csv}
              disabled={!shown.length}
              type="button"
            >
              <Download size={14} />
              Export CSV
            </button>
          </span>
        </div>

        {err && <div className="alert r">{err}</div>}

        <div style={{ margin: '12px 0', fontSize: '13px' }}>
          Total records: <strong>{rows.length}</strong>
          {' | '}
          Showing: <strong>{shown.length}</strong>
        </div>

        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>From</th>
                <th>Number</th>
                <th>Direction</th>
                <th>Talk time (sec)</th>
                <th>Status</th>
                <th>Cost</th>
              </tr>
            </thead>

            <tbody>
              {shown.map((r, index) => {
                const status = String(
                  r.disposition || 'UNKNOWN'
                ).toUpperCase();

                const [label, tone] = L[status] || [status, 'n'];

                return (
                  <tr key={r.id ?? index}>
                    <td className="mono">
                      {formatDate(r.start_at)}
                    </td>

                    <td className="mono">
                      {r.src || '-'}
                    </td>

                    <td className="mono">
                      {r.dst || '-'}
                    </td>

                    <td>
                      {r.direction || '-'}
                    </td>

                    <td className="mono">
                      {r.billsec ?? 0}
                    </td>

                    <td>
                      <span className={'badge ' + tone}>
                        {label}
                      </span>
                    </td>

                    <td className="mono">
                      {r.cost != null ? r.cost : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!shown.length && !busy && !err && (
          <div className="empty">
            {rows.length
              ? 'No matching records found.'
              : 'No records found.'}
          </div>
        )}

        {busy && rows.length === 0 && (
          <div className="empty">Loading call records...</div>
        )}
      </section>
    </>
  );
}
