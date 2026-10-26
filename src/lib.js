// export const norm = (s) => { let d = String(s || '').replace(/\D/g, ''); if (d.length > 10) d = d.slice(-10); return d; };
// export const validNum = (d) => /^[6-9]\d{9}$/.test(d);

// export function parseRecipients(text) {
//   const seen = new Set(), valid = [], invalid = []; let dups = 0;
//   String(text || '').split('\n').map((l) => l.trim()).filter(Boolean).forEach((l) => {
//     const [num, ...rest] = l.split(/[,\t;]/);
//     const to = norm(num), name = rest.join(' ').trim();
//     if (!validNum(to)) return invalid.push(l);
//     if (seen.has(to)) return dups++;
//     seen.add(to); valid.push({ to, name });
//   });
//   return { valid, invalid, dups };
// }
// export const LABEL = { done: 'Answered', missed: 'No answer', failed: 'Failed', pending: 'In queue' };
// export const TONE = { done: 'g', missed: 'a', failed: 'r', pending: 'n' };


export const norm = (s) => { let d = String(s || '').replace(/\D/g, ''); if (d.length > 10) d = d.slice(-10); return d; };
export const validNum = (d) => /^[6-9]\d{9}$/.test(d);

export function parseRecipients(text) {
  const seen = new Set(), valid = [], invalid = []; let dups = 0;
  String(text || '').split('\n').map((l) => l.trim()).filter(Boolean).forEach((l) => {
    const [num, ...rest] = l.split(/[,\t;]/);
    const to = norm(num), name = rest.join(' ').trim();
    if (!validNum(to)) return invalid.push(l);
    if (seen.has(to)) return dups++;
    seen.add(to); valid.push({ to, name });
  });
  return { valid, invalid, dups };
}
export const LABEL = { done: 'Answered', missed: 'No answer', failed: 'Failed', pending: 'In queue' };
export const TONE = { done: 'g', missed: 'a', failed: 'r', pending: 'n' };

// Reads a recipients file (.csv / .txt / .xlsx / .xls / .ods) and returns plain text lines: "number, name"
export async function fileToText(f) {
  if (!/\.(xlsx|xls|xlsm|ods)$/i.test(f.name)) return (await f.text()).replace(/^\uFEFF/, '').replace(/\r/g, '').replace(/^\D*number.*\n/i, '');
  const XLSX = await import('xlsx'); // loaded only when an Excel file is chosen
  const wb = XLSX.read(await f.arrayBuffer(), { type: 'array' });
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: false, defval: '' });
  const isPhone = (c) => { const d = String(c).replace(/\D/g, ''); return d.length >= 10 && d.length <= 12; };
  return rows.map((r, i) => {
    const cells = r.map((c) => String(c).trim()).filter(Boolean);
    const k = cells.findIndex(isPhone);                 // works for "Name | Mobile" and "Mobile | Name" columns
    if (k < 0) return i === 0 ? '' : cells.join(', ');  // first row without a number = header, skipped
    const [num] = cells.splice(k, 1);
    return [num, ...cells].join(', ');
  }).filter(Boolean).join('\n');
}
