// Checks that every local file referenced by a page or script exists (href, src, import, page links).
// Usage: node scripts/checklinks.mjs   → lists broken references and exits 1 if any.
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = /^(node_modules|\.git|\.claude|mobile|functions|alerts|data)$/;
const walk = d => fs.readdirSync(d, {withFileTypes: true}).flatMap(e => e.isDirectory() ? (SKIP.test(e.name) ? [] : walk(path.join(d, e.name))) : [path.join(d, e.name)]);
const files = walk(root).filter(f => /\.(html|js|mjs)$/.test(f) && !f.includes(path.sep + 'scripts' + path.sep));
const IMPORTS = /(?:from\s+|import\(\s*)["']([^"']+)["']/g;
const PATS = [
  /(?:href|src)=["']([^"'$`{}()[\]]+?)["']/g,
  IMPORTS,
  /location\.(?:href=|replace\()\s*["']([^"']+)["']/g,
  /window\.open\(\s*["']([^"']+)["']/g,
  /fetch\(\s*["']([^"']+)["']/g,
];
let bad = 0;
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  // in a .js file only imports are relative to the file; links in its HTML strings are relative to the page that shows them
  for (const re of (f.endsWith('.html') ? PATS : [IMPORTS])) for (const m of s.matchAll(re)) {
    let u = m[1].trim();
    if (!u || /^([a-z][a-z0-9+.-]*:|\/\/|#|data:|mailto:|tel:)/i.test(u) || u.includes('${')) continue;
    u = u.split('#')[0].split('?')[0]; if (!u) continue;
    const t = path.resolve(path.dirname(f), u);
    if (!fs.existsSync(t)) { bad++; console.log(path.relative(root, f) + ' → ' + m[1]) }
  }
}
console.log(bad ? bad + ' broken reference(s)' : 'All local references resolve.');
process.exit(bad ? 1 : 0);
