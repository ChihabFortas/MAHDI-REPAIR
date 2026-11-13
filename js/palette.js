// Command palette for the app shell (v73): Ctrl+K / "/" opens a search over every page the user may open.
// Favorites are stored in the user's settings (S.fav) so they follow the account; recents stay on this device.
// Pages inside the shell forward Ctrl+K with postMessage({rdPalette:1}) (see common.js).
const RKEY = 'rd_recent', MAXR = 6;
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
export const recent = () => { try { return JSON.parse(localStorage.getItem(RKEY) || '[]') } catch (e) { return [] } };
export function pushRecent(href) {
  try { const r = recent().filter(h => h !== href); r.unshift(href); localStorage.setItem(RKEY, JSON.stringify(r.slice(0, MAXR))) } catch (e) {}
}

export function initPalette({getItems, show, S, save, t, hit, onFav}) {
  // getItems(): [{icon,label,href,group,focus}] already filtered by role
  let items = [], byHref = new Map();
  const dlg = document.createElement('dialog');
  dlg.id = 'cp';
  dlg.setAttribute('aria-label', t('Quick search'));
  dlg.innerHTML = `<div class="cp-in"><span class="cp-ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></span><input id="cpq" autocomplete="off" spellcheck="false" placeholder="${esc(t('Search pages and actions…'))}"><kbd>Esc</kbd></div><div class="cp-l" id="cpl" role="listbox"></div><div class="cp-ft"><span><kbd>↑</kbd><kbd>↓</kbd> ${esc(t('to move'))}</span><span><kbd>Enter</kbd> ${esc(t('to open'))}</span><span><kbd>☆</kbd> ${esc(t('Pin to favorites'))}</span></div>`;
  document.body.append(dlg);
  const q = dlg.querySelector('#cpq'), list = dlg.querySelector('#cpl');
  let rows = [], hi = 0;
  const favs = () => (S.fav || []).filter(h => byHref.has(h));
  const isFav = h => (S.fav || []).includes(h);
  const toggleFav = h => {
    const f = new Set(S.fav || []); f.has(h) ? f.delete(h) : f.add(h); S.fav = [...f]; save(); onFav && onFav();
    draw(); const n = rows.findIndex(i => i.href === h); if (n > -1) move(n - hi); // keep the highlight on the page just (un)pinned
  };
  const row = (i, n) => `<div class="cp-o${n === hi ? ' hi' : ''}" role="option" data-i="${n}" aria-selected="${n === hi}"><i aria-hidden="true">${i.icon}</i><span class="cp-t">${esc(t(i.label))}<small>${esc(t(i.group))}</small></span><button class="cp-pin${isFav(i.href) ? ' on' : ''}" data-pin="${esc(i.href)}" title="${esc(t(isFav(i.href) ? 'Unpin' : 'Pin to favorites'))}" aria-label="${esc(t(isFav(i.href) ? 'Unpin' : 'Pin to favorites'))}">${isFav(i.href) ? '★' : '☆'}</button></div>`;
  function draw() {
    items = getItems(); byHref = new Map(items.map(i => [i.href, i]));
    const s = q.value.trim(); let html = ''; rows = [];
    const sec = (title, list2) => { if (!list2.length) return; html += `<div class="cp-g">${esc(t(title))}</div>`; list2.forEach(i => { html += row(i, rows.length); rows.push(i) }) };
    if (!s) {
      sec('Favorites', favs().map(h => byHref.get(h)));
      sec('Recent', recent().filter(h => byHref.has(h) && !isFav(h)).map(h => byHref.get(h)));
      sec('All pages', items.filter(i => !isFav(i.href)));
    } else {
      sec('Search', items.filter(i => hit(`${i.label} ${t(i.label)} ${i.group} ${t(i.group)} ${i.href}`, s)));
      if (!rows.length) html = `<div class="cp-e">${esc(t('No match'))}</div>`;
    }
    hi = Math.min(hi, Math.max(rows.length - 1, 0));
    list.innerHTML = html;
    list.querySelectorAll('.cp-o').forEach(o => o.classList.toggle('hi', +o.dataset.i === hi));
  }
  const go = n => { const i = rows[n]; if (!i) return; dlg.close(); show(i.href, !!i.focus) };
  const move = d => { if (!rows.length) return; hi = (hi + d + rows.length) % rows.length; list.querySelectorAll('.cp-o').forEach(o => { const on = +o.dataset.i === hi; o.classList.toggle('hi', on); o.setAttribute('aria-selected', on); if (on) o.scrollIntoView({block: 'nearest'}) }) };
  q.addEventListener('input', () => { hi = 0; draw() });
  q.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1) }
    else if (e.key === 'Enter') { e.preventDefault(); go(hi) }
  });
  list.addEventListener('click', e => {
    const p = e.target.closest('[data-pin]'); if (p) { e.stopPropagation(); toggleFav(p.dataset.pin); q.focus(); return }
    const o = e.target.closest('.cp-o'); if (o) go(+o.dataset.i);
  });
  list.addEventListener('mousemove', e => { const o = e.target.closest('.cp-o'); if (o && +o.dataset.i !== hi) { hi = +o.dataset.i; list.querySelectorAll('.cp-o').forEach(x => x.classList.toggle('hi', x === o)) } });
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close() });
  const open = () => { if (dlg.open) return; q.value = ''; hi = 0; draw(); dlg.showModal(); q.focus() };
  addEventListener('keydown', e => {
    const k = e.key.toLowerCase(), typing = /^(input|textarea|select)$/i.test(e.target.tagName) || e.target.isContentEditable;
    if ((e.ctrlKey || e.metaKey) && k === 'k') { e.preventDefault(); open() }
    else if (k === '/' && !typing && !dlg.open) { e.preventDefault(); open() }
  });
  addEventListener('message', e => { if (e.origin === location.origin && e.data && e.data.rdPalette) open() });
  return {open, toggleFav, isFav};
}
