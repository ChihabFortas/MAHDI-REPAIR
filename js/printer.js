// Printer routing (v73). Each kind of document can go to its own printer.
// Browsers cannot choose a printer by themselves, so direct printing uses QZ Tray (free helper app, qz.io)
// when it is installed on this computer. Without it the normal print window opens and a hint names the printer to pick.
// Choices are saved on this computer only, because every PC has its own printers.
const KEY = 'rd_printers';
export const KINDS = [
  ['receipt', 'Receipts', 'Customer receipts, sale tickets, credit notes (thermal 80 mm)', {width: 80}],
  ['label', 'Device tickets & labels', 'Sticker glued to the device, part labels (45 × 35 mm)', {width: 45, height: 35}],
  ['invoice', 'Invoices', 'Sales and purchase invoices, delivery notes (A4)', {width: 210, height: 297}],
  ['special', 'Special invoices', 'Proforma and credit note invoices (A4)', {width: 210, height: 297}],
  ['report', 'Reports & statistics', 'Dashboards, KPIs, statistics, staff reports (A4)', {width: 210, height: 297}],
];
export const getPrinters = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch (e) { return {} } };
export const setPrinters = o => { try { localStorage.setItem(KEY, JSON.stringify(o)) } catch (e) {} };
const prefOf = kind => ({copies: 1, direct: true, printer: '', ...(getPrinters()[kind] || {})});
const kindInfo = kind => KINDS.find(k => k[0] === kind) || KINDS[4];

const loadJS = u => new Promise((ok, ko) => { const e = document.createElement('script'); e.src = u; e.onload = ok; e.onerror = ko; document.head.append(e) });
let qzP = null;
export function qzConnect() {
  if (qzP) return qzP;
  qzP = (async () => {
    if (!window.qz) await loadJS('https://cdn.jsdelivr.net/npm/qz-tray@2.2.4/qz-tray.js');
    const qz = window.qz;
    qz.security.setCertificatePromise((resolve) => resolve());
    qz.security.setSignaturePromise(() => (resolve) => resolve());
    if (!qz.websocket.isActive()) await qz.websocket.connect({retries: 0, delay: 0});
    return qz;
  })().catch(e => { qzP = null; throw e });
  return qzP;
}
export async function listPrinters() { const qz = await qzConnect(); const l = await qz.printers.find(); return Array.isArray(l) ? l : [l] }

function toast(msg, ok) {
  let d = document.getElementById('rd-ptoast');
  if (!d) { d = document.createElement('div'); d.id = 'rd-ptoast'; d.setAttribute('role', 'status'); document.body.append(d) }
  d.style.cssText = `position:fixed;z-index:2147483000;top:14px;left:50%;transform:translateX(-50%);max-width:min(560px,92vw);padding:10px 16px;border-radius:12px;font:600 14px/1.35 system-ui,sans-serif;color:#fff;background:${ok ? '#15803d' : '#1e293b'};box-shadow:0 10px 30px rgb(0 0 0/.25)`;
  d.textContent = msg; clearTimeout(d._t); d._t = setTimeout(() => d.remove(), 6000);
}

// all CSS of the current page, so a #pa document can be printed outside the page
export function pageCss() {
  return [...document.styleSheets].map(s => { try { return [...s.cssRules].map(r => r.cssText).join('\n') } catch (e) { return '' } }).join('\n');
}

/* Print one document.
   kind: one of KINDS. html: the document markup. css: its styles. page: the @page rule body.
   browser(): what to do without direct printing (opens the normal print window). */
export async function routePrint(kind, {html, css = '', page = 'margin:0', browser}) {
  const p = prefOf(kind), [, label, , size] = kindInfo(kind);
  if (p.printer && p.direct) {
    try {
      const qz = await qzConnect();
      const cfg = qz.configs.create(p.printer, {units: 'mm', margins: 0, copies: Math.max(1, +p.copies || 1), size: size.height ? size : {width: size.width}, scaleContent: true});
      const doc = `<!doctype html><html><head><meta charset="utf-8"><style>${css}@page{${page}}</style></head><body style="margin:0;background:#fff">${html}</body></html>`;
      await qz.print(cfg, [{type: 'pixel', format: 'html', flavor: 'plain', data: doc}]);
      toast('🖨 ' + label + ' → ' + p.printer, true);
      return;
    } catch (e) { toast('⚠ Direct printing unavailable (' + (e && e.message || e) + '). Opening the print window…') }
  } else if (p.printer) toast('🖨 ' + label + ': choose “' + p.printer + '” in the print window');
  const n = Math.max(1, +p.copies || 1);
  for (let i = 0; i < n; i++) await browser();
}

/* Print what is in #pa (pages that print through the hidden #pa block). */
export function printPA(kind) {
  const pa = document.getElementById('pa'), ps = document.getElementById('ps');
  const page = ((ps && ps.textContent.match(/@page\{([^}]*)\}/)) || [, 'margin:0'])[1];
  return routePrint(kind, {
    html: `<div id="pa" style="display:block">${pa ? pa.innerHTML : ''}</div>`,
    css: pageCss() + '#pa{display:block!important}',
    page,
    browser: () => new Promise(r => { window.print(); setTimeout(r, 300) }),
  });
}
window.rdPrint = printPA;
