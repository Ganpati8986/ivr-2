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

// // Reads a recipients file (.csv / .txt / .xlsx / .xls / .ods) and returns plain text lines: "number, name"
// export async function fileToText(f) {
//   if (!/\.(xlsx|xls|xlsm|ods)$/i.test(f.name)) return (await f.text()).replace(/^\uFEFF/, '').replace(/\r/g, '').replace(/^\D*number.*\n/i, '');
//   const XLSX = await import('xlsx'); // loaded only when an Excel file is chosen
//   const wb = XLSX.read(await f.arrayBuffer(), { type: 'array' });
//   const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: false, defval: '' });
//   const isPhone = (c) => { const d = String(c).replace(/\D/g, ''); return d.length >= 10 && d.length <= 12; };
//   return rows.map((r, i) => {
//     const cells = r.map((c) => String(c).trim()).filter(Boolean);
//     const k = cells.findIndex(isPhone);                 // works for "Name | Mobile" and "Mobile | Name" columns
//     if (k < 0) return i === 0 ? '' : cells.join(', ');  // first row without a number = header, skipped
//     const [num] = cells.splice(k, 1);
//     return [num, ...cells].join(', ');
//   }).filter(Boolean).join('\n');
// }


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

// // Reads a recipients file (.csv / .txt / .xlsx / .xls / .ods) and returns plain text lines: "number, name"
// export async function fileToText(f) {
//   if (!/\.(xlsx|xls|xlsm|ods)$/i.test(f.name)) return (await f.text()).replace(/^\uFEFF/, '').replace(/\r/g, '').replace(/^\D*number.*\n/i, '');
//   const XLSX = await import('xlsx'); // loaded only when an Excel file is chosen
//   const wb = XLSX.read(await f.arrayBuffer(), { type: 'array' });
//   const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: false, defval: '' });
//   const isPhone = (c) => { const d = String(c).replace(/\D/g, ''); return d.length >= 10 && d.length <= 12; };
//   return rows.map((r, i) => {
//     const cells = r.map((c) => String(c).trim()).filter(Boolean);
//     const k = cells.findIndex(isPhone);                 // works for "Name | Mobile" and "Mobile | Name" columns
//     if (k < 0) return i === 0 ? '' : cells.join(', ');  // first row without a number = header, skipped
//     const [num] = cells.splice(k, 1);
//     return [num, ...cells].join(', ');
//   }).filter(Boolean).join('\n');
// }

// /* ---------- Saved contact lists (classes / staff) ----------
//    Edit CLASS_NAMES to match the classes your school actually has. */
// export const CLASS_NAMES = ['Nursery', 'LKG', 'UKG', ...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)];
// const slug = (t) => t.toLowerCase().replace(/\s+/g, '-');
// export const GROUPS = [
//   ...CLASS_NAMES.map((n) => ({ id: slug(n), label: n, kind: 'student' })),
//   { id: 'staff-teaching', label: 'Teaching Staff', kind: 'staff' },
//   { id: 'staff-nonteaching', label: 'Non-Teaching Staff', kind: 'staff' },
// ];
// export const COMBOS = [
//   { id: 'all-students', label: 'All Students (all classes)' },
//   { id: 'all-staff', label: 'All Staff (teaching + non-teaching)' },
//   { id: 'all-school', label: 'Entire School (students + staff)' },
// ];
// const idsOf = (id) => id === 'all-students' ? GROUPS.filter((g) => g.kind === 'student').map((g) => g.id)
//   : id === 'all-staff' ? GROUPS.filter((g) => g.kind === 'staff').map((g) => g.id)
//   : id === 'all-school' ? GROUPS.map((g) => g.id) : [id];
// // people of a list (or combined list); one number is kept once even if a parent has children in two classes
// export function groupPeople(id, data) {
//   const seen = new Set(), out = [];
//   idsOf(id).forEach((i) => (data?.[i]?.people || []).forEach((p) => { if (!seen.has(p.to)) { seen.add(p.to); out.push(p); } }));
//   return out;
// }
 



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

/* ---------- Saved contact lists ----------
   Lists are created / renamed / deleted by the user (Contact lists tab) and stored in the DB.
   DEFAULT_LISTS is only used by the one-click "Create standard lists" button. */
export const CLASS_NAMES = ['Nursery', 'LKG', 'UKG', ...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)];
const slug = (t) => t.toLowerCase().replace(/\s+/g, '-');
export const DEFAULT_LISTS = [
  ...CLASS_NAMES.map((n) => ({ id: slug(n), label: n, kind: 'student' })),
  { id: 'staff-teaching', label: 'Teaching Staff', kind: 'staff' },
  { id: 'staff-nonteaching', label: 'Non-Teaching Staff', kind: 'staff' },
];
export const KINDS = { student: 'Students / Classes', staff: 'Staff', other: 'Other' };
export const COMBOS = [
  { id: 'all-students', label: 'All Students (all classes)' },
  { id: 'all-staff', label: 'All Staff' },
  { id: 'all-school', label: 'Entire School (students + staff + other)' },
];
// people of one list or a combined list; a number is kept once even if it is in several lists
export function groupPeople(id, groups) {
  const gs = id === 'all-school' ? groups : id === 'all-students' ? groups.filter((g) => g.kind === 'student')
    : id === 'all-staff' ? groups.filter((g) => g.kind === 'staff') : groups.filter((g) => g.id === id);
  const seen = new Set(), out = [];
  gs.forEach((g) => (g.people || []).forEach((p) => { if (!seen.has(p.to)) { seen.add(p.to); out.push(p); } }));
  return out;
}