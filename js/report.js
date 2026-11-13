// Report tools (v73): "Print" and "Excel" buttons for dashboards, KPIs and statistics pages.
// Excel = a CSV file (opens in Excel / LibreOffice / Google Sheets). Print goes to the "Reports" printer (Settings → Printers).
import {printPA} from "./printer.js?v=72";
import {t as tr} from "./ui.js?v=72";

const clean = s => String(s || '').replace(/\s+/g, ' ').trim();
const cell = v => { const s = clean(v); return /[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s };
const visible = el => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length) && !el.closest('dialog:not([open]),[hidden],#pa,.rp-tools');
const KPI_SEL = '.kp>*,.kg>*,.kp3>*,.kpi,.stat,.tile';

function kpis(root) {
  return [...root.querySelectorAll(KPI_SEL)].filter(visible).filter(e => !e.querySelector('table'))
    .map(e => e.innerText.split('\n').map(clean).filter(Boolean)).filter(l => l.length && l.join(' ').length < 160);
}
function tables(root) {
  return [...root.querySelectorAll('table')].filter(visible).map(tb => {
    const h = tb.closest('.card,section,div'), title = h && h.querySelector('h2,h3,b,strong');
    return {title: title ? clean(title.innerText) : '', rows: [...tb.rows].map(r => [...r.cells].filter(c => !c.querySelector('button:only-child')).map(c => clean(c.innerText)))};
  }).filter(t => t.rows.length);
}
const pageTitle = () => clean((document.querySelector('h1,h2') || {}).innerText || document.title || 'Report');

export function toCSV(root = document.querySelector('main') || document.body) {
  const L = [['sep=,'], [pageTitle()], [new Date().toLocaleString()], []];
  const k = kpis(root);
  if (k.length) { L.push([tr('KPIs')]); k.forEach(l => L.push(l.length > 1 ? [l.slice(0, -1).join(' '), l[l.length - 1]] : l)); L.push([]) }
  tables(root).forEach(t => { if (t.title) L.push([t.title]); t.rows.forEach(r => L.push(r)); L.push([]) });
  return L.map(r => r.map(cell).join(',')).join('\r\n');
}
export function exportCSV(name) {
  const blob = new Blob(['﻿' + toCSV()], {type: 'text/csv;charset=utf-8'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = (name || pageTitle()).replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') + '-' + new Date().toISOString().slice(0, 10) + '.csv';
  document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove() }, 1500);
}
export function printReport(root = document.querySelector('main') || document.body) {
  const c = root.cloneNode(true);
  // charts: keep what is drawn
  const src = [...root.querySelectorAll('canvas')], dst = [...c.querySelectorAll('canvas')];
  dst.forEach((cv, i) => { try { const im = document.createElement('img'); im.src = src[i].toDataURL('image/png'); im.style.cssText = 'max-width:100%;height:auto'; cv.replaceWith(im) } catch (e) {} });
  c.querySelectorAll('button,input,select,textarea,dialog,.rp-tools,script,#pa').forEach(e => e.remove());
  let pa = document.getElementById('pa'); if (!pa) { pa = document.createElement('div'); pa.id = 'pa'; document.body.append(pa) }
  pa.innerHTML = `<div class="rp-doc"><div class="rp-hd"><b>${pageTitle()}</b><span>${new Date().toLocaleString()}</span></div>${c.innerHTML}</div>`;
  let st = document.getElementById('ps'); if (!st) { st = document.createElement('style'); st.id = 'ps'; document.head.append(st) }
  st.textContent = '@page{size:A4;margin:10mm}#pa .rp-doc{font:12px/1.4 Arial,sans-serif;color:#000}#pa .rp-hd{display:flex;justify-content:space-between;border-bottom:2px solid #000;padding-bottom:6px;margin-bottom:10px;font-size:16px}#pa .rp-doc *{color:#000!important;box-shadow:none!important}#pa .rp-doc .card{border:1px solid #bbb;break-inside:avoid;margin:0 0 8px;padding:8px;background:#fff!important}#pa table{width:100%;border-collapse:collapse}#pa th,#pa td{border:1px solid #bbb;padding:3px 5px}';
  setTimeout(() => printPA('report'), 150);
}
/* adds the two buttons at the top of the page */
export function reportTools(opts = {}) {
  if (document.querySelector('.rp-tools')) return;
  const main = document.querySelector('main') || document.body;
  const d = document.createElement('div'); d.className = 'rp-tools';
  d.innerHTML = `<button type="button" data-rp="p" title="${tr('Print')}">🖨 ${tr('Print')}</button><button type="button" data-rp="x" title="${tr('Export to Excel (CSV)')}">⤓ ${tr('Excel')}</button>`;
  d.onclick = e => { const b = e.target.closest('[data-rp]'); if (!b) return; b.dataset.rp === 'p' ? printReport(opts.root && opts.root()) : exportCSV(opts.name) };
  const st = document.createElement('style');
  st.textContent = '.rp-tools{display:flex;gap:8px;justify-content:flex-end;margin:0 0 10px}.rp-tools button{min-height:36px;padding:0 14px;border-radius:10px;font-weight:600}@media print{.rp-tools{display:none}}';
  document.head.append(st); main.prepend(d);
}
