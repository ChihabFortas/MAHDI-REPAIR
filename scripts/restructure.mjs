// One-time move of the pages into folders (v74). Kept for reference; running it twice does nothing.
// Usage: node scripts/restructure.mjs
import fs from 'fs';
import path from 'path';
import {execSync} from 'child_process';
import {fileURLToPath} from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const L = JSON.parse(fs.readFileSync(path.join(root, 'scripts/layout.json'), 'utf8'));
const DIR = {}; // page -> folder ('' for root)
for (const [k, v] of Object.entries(L)) if (Array.isArray(v)) v.forEach(p => DIR[p] = k === 'root' ? '' : k);
const NAMES = Object.keys(DIR).map(n => n.replace('.html', '')).join('|');
const rel = (fromDir, page) => { const to = DIR[page]; if (to === undefined) return page; const r = path.posix.relative(fromDir || '.', to || '.'); return (r ? r + '/' : '') + page };
const up = d => d ? d.split('/').map(() => '..').join('/') + '/' : '';

// 1. move
for (const [page, d] of Object.entries(DIR)) {
  if (!d) continue;
  const src = path.join(root, page), dst = path.join(root, d, page);
  if (fs.existsSync(src) && !fs.existsSync(dst)) { fs.mkdirSync(path.dirname(dst), {recursive: true}); execSync(`git mv "${page}" "${d}/${page}"`, {cwd: root}) }
}

// 2. rewrite paths inside every page
const NAV = new RegExp(`((?:href=|location\\.href=|location\\.replace\\(|window\\.open\\(|\\.href=)\\s*["'\`])(${NAMES})\\.html`, 'g');
for (const [page, d] of Object.entries(DIR)) {
  const f = path.join(root, d, page); if (!fs.existsSync(f)) continue;
  let s = fs.readFileSync(f, 'utf8'), o = s; const U = up(d);
  if (U) {
    s = s.replace(/((?:href|src)=["'])(?:\.\/)?(js|css|img)\//g, `$1${U}$2/`)
         .replace(/href="manifest\.webmanifest"/g, `href="${U}manifest.webmanifest"`)
         .replace(/(from\s+["'])\.\/js\//g, `$1${U}js/`)
         .replace(/(import\(\s*["'])\.\/js\//g, `$1${U}js/`)
         .replace(/new URL\(SHOP\.logo\|\|'img\/logo\.png',location\.href\)/g, `new URL(SHOP.logo||'img/logo.png',new URL('${U}',location.href))`)
         .replace("history.replaceState(null,'','index.html')", 'history.replaceState(null,\'\',location.pathname)');
  }
  s = s.replace(NAV, (m, a, n) => a + rel(d, n + '.html'));
  if (s !== o) fs.writeFileSync(f, s);
}
console.log('moved and rewritten', Object.values(DIR).filter(Boolean).length, 'pages');
