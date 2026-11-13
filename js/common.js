import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,onAuthStateChanged,signOut} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore,initializeFirestore,persistentLocalCache,persistentMultipleTabManager,collection,doc,onSnapshot,runTransaction,serverTimestamp,getDoc,setDoc,addDoc,getDocs,query,where,writeBatch,updateDoc} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {firebaseConfig,SHOP,ADMINS,IDLE_MINUTES} from "./firebase-config.js?v=72";
import {money,t,S,onSave,adopt} from "./ui.js?v=72";
import {printPA} from "./printer.js?v=72";
export {printPA};
/* Where pages live (v74). Code names pages by file name ('reception.html#cat'); pageUrl() gives the real address.
   Source of truth: scripts/layout.json. Root pages (index, app, track, shop) have no folder. */
export const ROOT=new URL('../',import.meta.url).href.split('?')[0];
export const PAGE_DIR={"dashboard.html":"pages/repairs/","reception.html":"pages/repairs/","quotes.html":"pages/repairs/","quote.html":"pages/repairs/","handover.html":"pages/repairs/","technician.html":"pages/repairs/","partsqueue.html":"pages/repairs/","tasks.html":"pages/repairs/","board.html":"pages/repairs/","pos.html":"pages/sales/","salesdash.html":"pages/sales/","delivery.html":"pages/sales/","orders.html":"pages/sales/","b2b.html":"pages/sales/","customers.html":"pages/sales/","crm.html":"pages/sales/","marketing.html":"pages/sales/","invoices.html":"pages/sales/","receiving.html":"pages/purchases/","suppliers.html":"pages/purchases/","supplierorders.html":"pages/purchases/","inventory.html":"pages/stock/","locations.html":"pages/stock/","partseditor.html":"pages/stock/","catalog.html":"pages/stock/","import.html":"pages/stock/","dailycount.html":"pages/stock/","stockmgmt.html":"pages/stock/","treasury.html":"pages/finance/","statistics.html":"pages/finance/","analytics.html":"pages/finance/","manager.html":"pages/finance/","techreport.html":"pages/finance/","attend.html":"pages/staff/","staffhr.html":"pages/staff/","kiosk.html":"pages/staff/","admin.html":"pages/admin/","settings.html":"pages/admin/","alerts.html":"pages/admin/","seed.html":"pages/admin/"};
export const pageUrl=h=>{if(!h||/^([a-z]+:|#|\/)/i.test(h))return h;const m=/^([\w-]+\.html)(.*)$/.exec(h);return m?ROOT+(PAGE_DIR[m[1]]||'')+m[1]+m[2]:h};
export const asset=p=>new URL(p,ROOT).href;
/* App version (v73): shown at the bottom of every page and in the shell status bar. Build = commit stamped by scripts/build.mjs. */
export const APP_VERSION='73';
export const BUILD_ID=new URL(import.meta.url).searchParams.get('v')||'dev';
(function verTag(){const txt='v'+APP_VERSION+' · build '+BUILD_ID,sb=document.getElementById('sver');if(sb){sb.textContent=txt;sb.title='Mahdi Repair '+txt;return}
 if(document.getElementById('rd-ver')||window.self!==window.top)return;// inside the app shell the status bar already shows it
 const f=document.createElement('footer');f.id='rd-ver';f.textContent='Mahdi Repair · '+txt;document.body.append(f)})();
export {money,t,S};
export const auth=getAuth(initializeApp(firebaseConfig)),db=(()=>{try{return initializeFirestore(auth.app,{localCache:persistentLocalCache({tabManager:persistentMultipleTabManager()})})}catch(e){return getFirestore(auth.app)}})(),$=id=>document.getElementById(id);
export {SHOP};
document.documentElement.style.visibility='hidden';setTimeout(()=>reveal(),8000);
export const reveal=()=>{document.documentElement.style.visibility='';const f=document.getElementById('fouc');if(f)f.remove()};
export const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export const TIERS=[['r','Retail prices'],['w','Wholesale prices'],['p','Repair prices']];
export const fixedOf=(n,r)=>{n=Number(n)||0;r=Number(r)||0;return (n+(r||n))/2};
export const priceOf=(p,t='r')=>{const n=Number(p.normal)||0;if(t==='w')return Number(p.wholesale)||n;if(t==='p')return Number(p.repair)||n;return n};
export const PART_TYPES=["LCD","Battery","Back glass","Upper housing","Lower housing","Sub board","Charging port","Antenna","Cables","Rear camera","Front camera","Camera lens","Speaker","Earpiece","Buttons","SIM tray","Vibration motor","Fingerprint sensor"];
export const QUALITY=["Original","Third party","Copy","Refurbished"],SERVICES=["Cleaning service","Software service","Cosmetic service"];
export const norm=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim(),num=v=>Number(v)||0;

// Smart search: every word typed must appear somewhere (any order, partial words, accents ignored). "lcd samsung" finds "Samsung A17 LCD".
const _sn=s=>String(s==null?'':s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\p{L}\p{N}\s]+/gu,' ').replace(/\s+/g,' ').trim();
export const hit=(hay,q)=>{const k=_sn(q);if(!k)return true;const h=_sn(hay),hc=h.replace(/ /g,'');return k.split(' ').every(w=>h.includes(w)||hc.includes(w))};
// Arrow-key navigation for a result list: Up/Down move the highlight, Enter picks it (default: click it).
export function listNav(inputId,itemSel,pick){const inp=document.getElementById(inputId);if(!inp||inp._ln)return;inp._ln=1;let i=-1;
 const items=()=>[...document.querySelectorAll(itemSel)].filter(e=>e.offsetParent!==null);
 const mark=(L)=>{L.forEach((e,j)=>e.classList.toggle('navon',j===i));if(L[i])L[i].scrollIntoView({block:'nearest'})};
 inp.addEventListener('input',()=>{i=-1;items().forEach(e=>e.classList.remove('navon'))});
 inp.addEventListener('keydown',e=>{const k=e.key;if(k!=='ArrowDown'&&k!=='ArrowUp'&&k!=='Enter')return;const L=items();if(!L.length)return;
  if(k==='Enter'){if(i<0||!L[i])return;e.preventDefault();e.stopImmediatePropagation();const el=L[i];i=-1;L.forEach(x=>x.classList.remove('navon'));pick?pick(el):el.click();return}
  e.preventDefault();i=k==='ArrowDown'?Math.min(L.length-1,i+1):Math.max(0,i-1);mark(L)},true)}
export const specialOf=(w,n)=>(num(w)+num(n))/2;
export const gen=p=>{const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let c=p;for(let i=0;i<6;i++)c+=A[Math.floor(Math.random()*A.length)];return c};
export let user=null,role=null,profile=null;
export const HOME={sales:'app.html',reception:'app.html',technician:'app.html',inventory:'app.html',manager:'app.html',admin:'app.html'};
const ALLR=['reception','sales','technician','inventory','manager','admin'],REPAIR=['reception','manager','admin'],SALES=['sales','manager','admin'],STOCKV=['reception','sales','inventory','manager','admin'],FRONT=REPAIR;
/* Supplier orders / payments / returns are switched off for now. Set to false to bring them back. */
const SUP_OFF=true;
const PAGES={'analytics.html':['manager','admin'],'handover.html':REPAIR,'b2b.html':['sales','manager','admin'],'tasks.html':ALLR,'reception.html':REPAIR,'technician.html':['technician','manager','admin'],'manager.html':['manager','admin'],'admin.html':['admin'],'inventory.html':STOCKV,'pos.html':SALES,'quotes.html':REPAIR,'quote.html':['reception','inventory','manager','admin'],'seed.html':['admin'],'treasury.html':['manager','admin'],'statistics.html':['manager','admin'],'suppliers.html':['manager','admin'],'invoices.html':['reception','sales','manager','admin'],'dailycount.html':['reception','sales','inventory','manager','admin'],'stockmgmt.html':['manager','admin'],'partsqueue.html':['inventory','manager','admin'],'techreport.html':['manager','admin'],'board.html':REPAIR,'dashboard.html':REPAIR,'locations.html':STOCKV,'crm.html':['manager','admin'],'partseditor.html':['admin'],'catalog.html':['admin'],'orders.html':SALES,'customers.html':SALES,'delivery.html':SALES,'receiving.html':['manager','admin'],'supplierorders.html':SUP_OFF?[]:['manager','admin'],'salesdash.html':SALES,'marketing.html':SALES,'shop.html':SALES,'import.html':['manager','admin'],'attend.html':ALLR,'kiosk.html':['manager','admin'],'staffhr.html':['manager','admin'],'alerts.html':['admin'],'settings.html':ALLR};
export const slugName=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'.').replace(/^\.+|\.+$/g,'');
export const STAFF_DOMAIN='staff.mahdirepair.app';
export const canManage=()=>role==='manager'||role==='admin';
export const isAdmin=canManage; // back-office special price: manager + admin only
export async function loadProfile(u){let s=await getDoc(doc(db,'users',u.uid));
 if(!s.exists()&&(ADMINS||[]).map(norm).includes(norm(u.email))){await setDoc(doc(db,'users',u.uid),{email:u.email,name:u.email.split('@')[0],role:'admin',active:true,createdAt:serverTimestamp()});s=await getDoc(doc(db,'users',u.uid))}
 return s.exists()?s.data():null}
export async function logAudit(action,detail='',extra={}){try{await addDoc(collection(db,'audit'),{action,detail:String(detail).slice(0,300),by:user?.email||'',role,at:serverTimestamp(),...extra})}catch(e){}}
export function deny(msg){reveal();document.body.innerHTML=`<div style="max-width:440px;margin:14vh auto;padding:26px;background:var(--card,#fff);color:var(--ink,#14212b);border-radius:14px;text-align:center"><h2>${msg}</h2><p><button id="dn1">Back</button> <button id="dn2">Sign out</button></p></div>`;
 document.getElementById('dn1').onclick=()=>location.href=pageUrl(HOME[role]||'index.html');document.getElementById('dn2').onclick=()=>signOut(auth)}
function nav(){document.querySelectorAll('header button[onclick]').forEach(b=>{const m=/location\.href='([^']+)'/.exec(b.getAttribute('onclick'));if(m){const a=PAGES[m[1]];if(a&&!a.includes(role))b.remove()}});
 const h=document.querySelector('header'),lo=$('lo');if(!h||h.classList.contains('sh-top'))return;const mk=(t,c)=>{const e=document.createElement('span');e.className='bd';e.style.cssText='background:'+c+';color:#fff;white-space:nowrap';e.textContent=t;return e};
 const a=mk(profile.name||user.email,'#2a3a46'),b=mk(role[0].toUpperCase()+role.slice(1),'#0f7b7b');lo?(h.insertBefore(a,lo),h.insertBefore(b,lo)):h.append(a,b)}
let it;function idle(){if(window.self!==window.top)return;const r=()=>{clearTimeout(it);it=setTimeout(()=>signOut(auth),(IDLE_MINUTES||30)*6e4)};['click','keydown','mousemove','touchstart'].forEach(e=>addEventListener(e,r,{passive:true}));r()}
/* Per-user settings: pulled from the account once per browser tab, pushed after every "Save" */
let _pt=null;
async function syncPrefs(u){const ref=doc(db,'userPrefs',u.uid),push=()=>{clearTimeout(_pt);_pt=setTimeout(()=>setDoc(ref,{prefs:JSON.parse(JSON.stringify(S)),updatedAt:serverTimestamp(),by:u.email||''}).catch(()=>{}),400)};
 onSave(push);let k='';try{k=sessionStorage.getItem('rd_prefs_uid')}catch(_){}if(k===u.uid)return false;
 try{const s=await Promise.race([getDoc(ref),new Promise((_,j)=>setTimeout(j,4000))]);try{sessionStorage.setItem('rd_prefs_uid',u.uid)}catch(_){}
  if(s.exists()&&s.data().prefs){if(adopt(s.data().prefs)){location.reload();return true}}else push()}catch(e){}
 return false}
if(window.top!==window.self)addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();try{window.top.postMessage({rdPalette:1},location.origin)}catch(_){}}});
export function start(cb){let ready=false;(auth.authStateReady?auth.authStateReady():Promise.resolve()).then(()=>onAuthStateChanged(auth,async u=>{if(!u){setTimeout(()=>{if(!auth.currentUser)(window.top||window).location.replace(ROOT+'index.html')},1500);return}if(ready)return;ready=true;user=u;if(await syncPrefs(u))return;
 try{const p=await loadProfile(u);if(!p){deny('Your account is waiting for an administrator to give it a role.');return}if(p.active!==true){deny('This account has been disabled.');return}
  profile=p;role=p.role;const pg=location.pathname.split('/').pop()||'index.html',al=PAGES[pg];if(al&&!al.includes(role)){deny('You do not have access to this page.');return}
  if(window.self===window.top&&!['app.html','index.html','track.html'].includes(pg)){window.top.location.replace(ROOT+'app.html#'+encodeURIComponent(pg+location.search+location.hash));return}nav();idle();reveal();cb(u);hashNav();if(role!=='technician')import('./tasks.js?v=72').then(m=>m.genRecurring(db,user,profile)).catch(()=>{})}catch(e){deny('Access check failed: '+e.message)}}));
 const o=$('lo');if(o)o.onclick=()=>signOut(auth)}
export const watchParts=(cb,all)=>onSnapshot(collection(db,'parts'),s=>cb(s.docs.map(d=>({...d.data(),id:d.id})).filter(p=>all||!p.hidden)));
export async function moveStock(partId,delta,type,ref,note='',col='parts'){let nq=0;
 await runTransaction(db,async tx=>{const r=doc(db,col,partId),s=await tx.get(r);if(!s.exists())throw new Error('Part '+partId+' not found');
  const p=s.data(),q=(p.qty||0)+delta;if(q<0)throw new Error(`Not enough stock for ${p.name} (have ${p.qty||0})`);
  nq=q;tx.update(r,{qty:q});tx.set(doc(collection(db,'movements')),{partId,inv:col,name:p.name,model:p.model,type,qty:delta,balance:q,ref,note,by:user.email,at:serverTimestamp()})});
 try{await updateDoc(doc(db,'shopItems',col+'_'+partId),{qty:nq})}catch(e){}}
export function printPartLabel(p){const pa=$('pa');
 pa.innerHTML=`<div class="lb"><b>${esc(p.name)}</b><br>${esc(p.model)} · ${esc(p.quality)}<svg id="bcp"></svg><b>${esc(p.id)}</b> · Price: <b>${num(p.normal).toFixed(2)}</b></div>`;
 JsBarcode(pa.querySelector('#bcp'),p.id,{format:'CODE128',displayValue:false,margin:0,height:40,width:2});pa.querySelector('#bcp').setAttribute('preserveAspectRatio','none');
 let st=$('ps');if(!st){st=document.createElement('style');st.id='ps';document.head.appendChild(st)}
 st.textContent='@page{size:45mm 35mm;margin:0}';setTimeout(()=>printPA("label"),150)}

// ---- part images: upload / camera (compressed, stored in the document) or a link
export function imgToData(file,max=240){return new Promise((res,rej)=>{const r=new FileReader();r.onerror=rej;r.onload=()=>{const im=new Image();im.onerror=rej;im.onload=()=>{const k=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',0.65))};im.src=r.result};r.readAsDataURL(file)})}
export const thumb=p=>p&&p.img?`<img class="th" loading="lazy" src="${esc(p.img)}" alt="" onerror="this.style.visibility='hidden'">`:'<span class="noimg"></span>';
export const IMG_HTML=`<div class="w"><label>Image</label><div class="ib"><img class="ipv" alt=""><div><label class="bt">📷 Take photo<input type="file" accept="image/*" capture="environment" hidden class="icam"></label><label class="bt">Upload<input type="file" accept="image/*" hidden class="iup"></label><button type="button" class="irm">Remove</button><input class="iurl" placeholder="…or paste an image link (https://…)"></div></div></div>`;
export function imgPicker(root){let v='';const q=s=>root.querySelector(s),pv=q('.ipv'),u=q('.iurl');
 const set=x=>{v=x||'';pv.src=v;pv.style.visibility=v?'visible':'hidden';u.value=v.startsWith('data:')?'':v};
 const f=async e=>{const fl=e.target.files[0];if(fl)try{set(await imgToData(fl))}catch(x){alert('Could not read image')}e.target.value=''};
 q('.icam').onchange=f;q('.iup').onchange=f;q('.irm').onclick=()=>set('');u.oninput=()=>{v=u.value.trim();pv.src=v;pv.style.visibility=v?'visible':'hidden'};
 return {val:()=>v,set}}

// ---- document numbering, A4 printing, reusable line editor
export async function nextNo(kind){const y=new Date().getFullYear(),ref=doc(db,'counters',kind+'-'+y);return runTransaction(db,async tx=>{const s=await tx.get(ref),n=(s.exists()?s.data().n:0)+1;tx.set(ref,{n});return `${kind}-${y}-${String(n).padStart(4,'0')}`})}
export function printA4(html,kind="invoice"){const pa=$('pa');pa.innerHTML=html;let st=$('ps');if(!st){st=document.createElement('style');st.id='ps';document.head.appendChild(st)}st.textContent='@page{size:A4;margin:12mm}';setTimeout(()=>printPA(kind),150)}
export function docHTML(d){const rows=d.lines.map((l,i)=>`<tr><td>${i+1}</td><td>${esc(l.sku||'')}</td><td style="text-align:start">${esc(l.name)}</td><td>${l.qty}</td><td>${money(l.price)}</td><td>${money(l.qty*l.price)}</td></tr>`).join('');
 return `<div class="doc"><div style="display:flex;justify-content:space-between;gap:12px"><div><h1 style="margin:0;font-size:22px">${esc(SHOP.name)}</h1><div>${esc(SHOP.phone||'')}</div></div><div style="text-align:end"><h2 style="margin:0">${esc(d.title)}</h2><div><b>${esc(d.no)}</b></div><div>${esc(d.date)}</div>${d.sub?`<div>${esc(d.sub)}</div>`:''}</div></div><hr><div><b>${esc(d.partyLabel)}:</b> ${esc(d.party.name)}<br>${esc(d.party.phone||'')} ${esc(d.party.address||'')}</div><br>
 <table><thead><tr><th>#</th><th>Code</th><th>Designation</th><th>Qty</th><th>Unit price</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table><table style="width:55%;margin-inline-start:auto;margin-top:8px">${d.totals.map(([l,v])=>`<tr><td><b>${esc(l)}</b></td><td style="text-align:end">${v}</td></tr>`).join('')}</table>${d.notes?`<p>${esc(d.notes)}</p>`:''}</div>`}
export function linesEditor(host,{items,price=()=>0,label='Price',allowFree=false,onChange=()=>{}}){let L=[],opts='';const dl='dl'+Math.random().toString(36).slice(2,8),val=l=>l.name?(l.sku?l.sku+' – ':'')+l.name:(l.sku||''),total=()=>L.reduce((a,l)=>a+(Number(l.qty)||0)*(Number(l.price)||0),0),blank=()=>({sku:'',name:'',qty:1,price:''});
 const draw=()=>{host.innerHTML=`<datalist id="${dl}">${opts}</datalist><table style="min-width:0"><thead><tr><th>Item</th><th>Qty</th><th>${label}</th><th></th></tr></thead><tbody>${L.map((l,i)=>`<tr><td><input list="${dl}" data-i="${i}" data-k="item" value="${esc(val(l))}"></td><td><input type="number" min="1" step="1" style="width:70px" data-i="${i}" data-k="qty" value="${l.qty}"></td><td><input type="number" step="0.01" min="0" style="width:100px" data-i="${i}" data-k="price" value="${l.price}"></td><td><button type="button" data-rm="${i}">×</button></td></tr>`).join('')}</tbody></table><button type="button" data-add style="margin-top:6px">+ Add line</button>`;
  host.querySelectorAll('input').forEach(x=>x.onchange=()=>{const l=L[x.dataset.i],k=x.dataset.k;if(k==='item'){const raw=x.value.trim(),id=raw.split(' – ')[0].trim(),p=items().find(p=>p.id===id);if(p){l.sku=p.id;l.name=p.name;l.col=p._c;if(l.price===''||l.price==null)l.price=price(p)}else if(allowFree&&raw){l.sku='';l.name=raw;l.col=null}else{l.sku='';l.name='';l.col=null}}else l[k]=x.value;draw();onChange()});
  host.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{L.splice(b.dataset.rm,1);if(!L.length)L.push(blank());draw();onChange()});host.querySelector('[data-add]').onclick=()=>{L.push(blank());draw()}};
 return {refresh(){opts=items().map(p=>`<option value="${esc(p.id)} – ${esc(p.name)}">`).join('')},set(l){L=(l&&l.length?l:[blank()]).map(x=>({...x}));draw();onChange()},get:()=>L.filter(l=>l.name&&Number(l.qty)>0).map(l=>({...l,qty:Number(l.qty),price:Number(l.price)||0})),total}}

// ---- hash tabs (e.g. inventory.html#rc) and the PME-style menu bar + ribbon
function hashNav(){const go=()=>{const h=location.hash.slice(1);if(!h)return;const b=document.querySelector(`#tabs button[data-t="${h}"],#tabs button[data-k="${h}"]`);if(b)b.click()};setTimeout(go,80);addEventListener('hashchange',go)}
const MENUS=[['File',[['Settings','settings.html'],['Admin panel','admin.html'],['Demo data','seed.html']]],
 ['Stock',[['Parts catalog','inventory.html#cat'],['Storage map','locations.html'],['Accessories','pos.html#acc'],['Movements','inventory.html#mv'],['Import products','import.html'],['Daily stock check','dailycount.html'],['Stock counts','stockmgmt.html#count']]],
 ['Purchases',[['Receiving notes','receiving.html']]],
 ['Sales',[['Counter dashboard','salesdash.html'],['Marketing','marketing.html'],['Counter sale','pos.html#pos'],['Delivery notes','delivery.html'],['Wholesale clients','b2b.html'],['Sales journal','pos.html#sal'],['Returns','pos.html#ret'],['Proforma invoices','invoices.html#proforma'],['Sales invoices','invoices.html#sale'],['Credit note invoices','invoices.html#saleCredit'],['New quote','quotes.html']]],
 ['Workshop',[['Hand over (scan)','handover.html'],['Tasks','tasks.html'],['Live board','board.html'],['Reception desk','reception.html'],['Technician board','technician.html'],['Parts queue','partsqueue.html'],['Bonus report','techreport.html'],['New quote','quotes.html']]],
 ['Suppliers',[['Supplier list','suppliers.html#sp']]],
 ['Customers',[['Customers & debts','pos.html#cus']]],
 ['Costs & losses',[['Expenses','treasury.html#ex'],['Losses','treasury.html#ls']]],
 ['Customers',[['CRM dashboard','crm.html'],['Customers & debts','pos.html#cus']]],['Statistics',[['Analytics (AI)','analytics.html'],['Statistics','statistics.html'],['Manager overview','manager.html']]],
 ['Treasury',[['Registers','treasury.html#rg'],['Daily closing','treasury.html#cl']]]];
const RIB=[['General',[['📌','Live board','board.html'],['📦','Products','inventory.html#cat'],['🗂️','Storage map','locations.html'],['🧾','Receiving notes','receiving.html'],['🏭','Supplier list','suppliers.html#sp'],['🛒','Counter sale','pos.html#pos'],['📤','Delivery notes','delivery.html'],['📒','Sales journal','pos.html#sal'],['👥','Customers & debts','pos.html#cus'],['📄','Invoices','invoices.html'],['📋','Stock counts','stockmgmt.html#count']]],
 ['Additional',[['💸','Expenses','treasury.html#ex'],['🗑️','Losses','treasury.html#ls'],['🔐','Registers','treasury.html#rg'],['🧮','Daily closing','treasury.html#cl'],['📊','Statistics','statistics.html']]],
 ['Workshop',[['✅','Tasks','tasks.html'],['🛠️','Reception desk','reception.html'],['🔧','Technician board','technician.html'],['📦','Parts queue','partsqueue.html'],['🏅','Bonus report','techreport.html'],['🧾','New quote','quotes.html']]]];
function buildPME(){const h=document.querySelector('header');if(window.self!==window.top||!h||document.querySelector('.pm-bar'))return;document.documentElement.classList.add('pme-nav');
 const ok=u=>{const b=u.split('#')[0],a=PAGES[b];if(role==='technician')return ['tasks.html','technician.html','attend.html','settings.html'].includes(b);return !a||a.includes(role)},here=location.pathname.split('/').pop()+location.hash;
 const bar=document.createElement('div');bar.className='pm-bar';bar.innerHTML=MENUS.map(([n,it])=>{const L=it.filter(([,u])=>ok(u));return L.length?`<div class="pm-menu"><span>${n}</span><div class="pm-dd">${L.map(([l,u])=>`<a href="${u}">${l}</a>`).join('')}</div></div>`:''}).join('');
 bar.querySelectorAll('.pm-menu>span').forEach(s=>s.onclick=()=>{const m=s.parentElement,o=m.classList.contains('open');bar.querySelectorAll('.pm-menu').forEach(x=>x.classList.remove('open'));if(!o)m.classList.add('open')});
 bar.querySelectorAll('.pm-dd a').forEach(a=>a.addEventListener('click',()=>bar.querySelectorAll('.pm-menu').forEach(x=>x.classList.remove('open'))));
 const rib=RIB.map(([n,it])=>[n,it.filter(([,,u])=>ok(u))]).filter(([,it])=>it.length),tabs=document.createElement('div');tabs.className='pm-tabs';
 const act=rib.findIndex(([,it])=>it.some(([,,u])=>here.startsWith(u.split('#')[0])));let cur=act<0?0:act;
 const panels=rib.map(([n,it],i)=>{const d=document.createElement('div');d.className='pm-rib';d.innerHTML=it.map(([ic,l,u])=>`<a href="${pageUrl(u)}" class="${here===u||(!u.includes('#')&&here.startsWith(u))?'on':''}"><i>${ic}</i>${l}</a>`).join('')+(i===0?'':'');return d});
 const shop=document.createElement('div');shop.className='pm-shop';shop.textContent=(SHOP.name||'').toUpperCase();
 const right=document.createElement('div');right.className='pm-right';right.innerHTML='<a href="'+pageUrl('settings.html')+'"><i>⚙️</i>Settings</a><a href="#" id="pmq" style="color:#a00"><i>⏻</i>Sign out</a>';
 const show=i=>{cur=i;tabs.querySelectorAll('span').forEach((s,k)=>s.classList.toggle('on',k===i));panels.forEach((p,k)=>p.classList.toggle('on',k===i))};
 rib.forEach(([n],i)=>{const s=document.createElement('span');s.textContent=n;s.onclick=()=>show(i);tabs.append(s)});
 const rw=document.createElement('div');rw.className='pm-ribwrap';panels.forEach(p=>rw.append(p));rw.append(shop,right);
 h.after(bar,tabs,rw);right.querySelector('#pmq').onclick=e=>{e.preventDefault();signOut(auth)};show(cur);
 const st=document.createElement('div');st.className='pm-status';st.innerHTML=`<span>Server: Firebase</span> · <span>User: ${esc(profile.name||user.email)}</span> · <span>Role: ${role}</span> · <span>${esc(SHOP.name)}</span>`;document.body.append(st)}

// ---- received-with checklist, storage locations, part movement + analysis
export const DEV_HTML=`<div class="dvk"><div><label>Device type</label><select class="dt"><option value="phone">Smartphone</option><option value="tablet">Tablet</option><option value="other">Other</option></select></div>
<div class="dvsim"><label class="ck"><input type="radio" class="sm" value="none" checked> No SIM card</label><label class="ck"><input type="radio" class="sm" value="1"> 1 SIM card</label><label class="ck"><input type="radio" class="sm" value="2"> 2 SIM cards</label><label class="ck"><input type="checkbox" class="tr"> SIM tray present</label></div>
<div><label class="ck"><input type="checkbox" class="cv"> Phone cover</label><label class="ck"><input type="checkbox" class="pl"> Plastic cover</label><label class="ck"><input type="checkbox" class="pn"> SIM tray opener</label><label class="ck"><input type="checkbox" class="ch"> Charger present</label></div></div>`;
export function devKit(root){const q=s=>root.querySelector(s),nm='sm'+Math.random().toString(36).slice(2,7);root.querySelectorAll('.sm').forEach(r=>r.name=nm);const tog=()=>{q('.dvsim').style.display=q('.dt').value==='phone'?'':'none'};q('.dt').onchange=tog;
 return {get(){const ph=q('.dt').value==='phone',sm=root.querySelector('.sm:checked');return {type:q('.dt').value,sim:ph?(sm?sm.value:'none'):null,tray:ph?q('.tr').checked:null,cover:q('.cv').checked,plastic:q('.pl').checked,pin:q('.pn').checked,charger:q('.ch').checked}},
  set(d){d=d||{type:'phone',sim:'none'};q('.dt').value=d.type||'phone';root.querySelectorAll('.sm').forEach(r=>r.checked=r.value===String(d.sim==null?'none':d.sim));q('.tr').checked=!!d.tray;q('.cv').checked=!!d.cover;q('.pl').checked=!!d.plastic;q('.pn').checked=!!d.pin;q('.ch').checked=!!d.charger;tog()}}}
export const devLine=t=>{const d=t&&t.device;if(!d)return '';const a=[];if(d.type==='phone'){a.push(d.sim==='none'||d.sim==null?'No SIM':'SIM '+d.sim);if(d.tray)a.push('Tray')}else a.push(d.type==='tablet'?'Tablet':'Other');if(d.cover)a.push('Cover');if(d.plastic)a.push('Film');if(d.pin)a.push('Pin');if(d.charger)a.push('Charger');return a.join(' · ')};
export const LOC={S:{n:36,pad:2,icon:'🗄️',label:'Shelf'},D:{n:300,pad:3,icon:'🧰',label:'Drawer'},C:{n:300,pad:3,icon:'🔌',label:'Charging drawer'}};
export const locNorm=c=>{const m=/^([SDC])(\d{1,3})$/.exec(c);return m?m[1]+m[2].padStart(LOC[m[1]].pad,'0'):c};
export const locCodes=s=>(String(s||'').toUpperCase().match(/[SDC]\d{1,3}/g)||[]).map(locNorm);
export const locBadge=s=>{if(!s)return '';const c=locCodes(s);return c.length?c.map(x=>`<span class="loc">${LOC[x[0]].icon} ${x}</span>`).join(' '):`<span class="loc">📍 ${esc(s)}</span>`};
export const LOC_HTML=`<div><label>Shelf / location</label><div style="display:flex;gap:6px;margin-bottom:6px"><select class="lt"><option value="">–</option><option value="S">Shelf (1–36)</option><option value="D">Drawer (1–300)</option><option value="C">Charging drawer (1–300)</option></select><input class="ln" type="number" min="1" placeholder="No." style="width:80px"><button type="button" class="lnf">Next free</button></div><input name="location" placeholder="S12 / D045 / C210"></div>`;
export function wireLoc(root,used=()=>[]){const lt=root.querySelector('.lt'),ln=root.querySelector('.ln'),inp=root.querySelector('input[name=location]'),nf=root.querySelector('.lnf');
 const upd=()=>{if(!lt.value||!ln.value)return;const n=Math.min(LOC[lt.value].n,Math.max(1,Number(ln.value)||1));inp.value=lt.value+String(n).padStart(LOC[lt.value].pad,'0')};
 lt.onchange=()=>{ln.max=lt.value?LOC[lt.value].n:'';upd()};ln.oninput=upd;
 nf.onclick=()=>{if(!lt.value){alert('Select a type first.');return}const u=new Set(used().flatMap(locCodes));for(let i=1;i<=LOC[lt.value].n;i++){const c=lt.value+String(i).padStart(LOC[lt.value].pad,'0');if(!u.has(c)){ln.value=i;upd();return}}alert('No free location.')};
 return ()=>{const c=locCodes(inp.value)[0];lt.value=c?c[0]:'';ln.value=c?Number(c.slice(1)):''}}
export async function logPrices(col,sku,oldP,newP,who,source=''){const b=writeBatch(db);let n=0;['buy','wholesale','normal','repair'].forEach(f=>{if(newP[f]===undefined)return;const o=Number(oldP&&oldP[f])||0,nw=Number(newP[f])||0;if(o!==nw){n++;b.set(doc(collection(db,'priceLog')),{sku,col,field:f,old:o,new:nw,source,by:(who&&who.email)||'',at:serverTimestamp()})}});if(n)try{await b.commit()}catch(e){}}
const MVL={in:'Received (purchase)',out:'Delivered / out',sale:'POS sale',use:'Used in repair',return:'Returned',loss:'Loss',adjust:'Adjustment',merge:'Merge',issue:'Issued to technician',takeback:'Taken back from technician'};
function dlg(id){let d=document.getElementById(id);if(!d){d=document.createElement('dialog');d.id=id;d.style.width='min(980px,98vw)';document.body.append(d)}return d}
export async function showMovements(p){const d=dlg('mvd');d.innerHTML=`<div style="padding:18px"><h2 style="margin:0 0 4px">Movement</h2><b>${esc(p.name)}</b> <small>${esc(p.id)}</small> ${locBadge(p.location)}<div id="mvb" style="margin-top:10px;overflow-x:auto">…</div><div style="text-align:end;margin-top:10px"><button type="button" id="mvx">Close</button></div></div>`;d.showModal();d.querySelector('#mvx').onclick=()=>d.close();
 try{const s=await getDocs(query(collection(db,'movements'),where('partId','==',p.id))),L=s.docs.map(x=>x.data()).sort((a,b)=>(b.at?.seconds||9e9)-(a.at?.seconds||9e9)),ins=L.filter(m=>m.qty>0).reduce((a,m)=>a+m.qty,0),outs=-L.filter(m=>m.qty<0).reduce((a,m)=>a+m.qty,0);
  d.querySelector('#mvb').innerHTML=`<div class="kp" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:10px"><div><b>${num(p.qty)}</b><br><small>Stock now</small></div><div><b>+${ins}</b><br><small>Total in</small></div><div><b>-${outs}</b><br><small>Total out</small></div></div><table><thead><tr><th>Date</th><th>Type</th><th>Qty</th><th>Balance</th><th>Reference</th><th>Note</th><th>User</th></tr></thead><tbody>`+(L.map(m=>`<tr><td>${m.at?m.at.toDate().toLocaleString():''}</td><td>${MVL[m.type]||esc(m.type)}</td><td style="color:${m.qty<0?'var(--bad)':m.qty>0?'#1e8e4e':'inherit'}"><b>${m.qty>0?'+':''}${m.qty}</b></td><td>${m.balance}</td><td>${esc(m.ref||'')}</td><td>${esc(m.note||'')}</td><td>${esc((m.by||'').split('@')[0])}</td></tr>`).join('')||'<tr><td colspan="7">Nothing to show.</td></tr>')+'</tbody></table>'}catch(e){d.querySelector('#mvb').textContent=e.message}}
let RCV=null;
export async function showAnalysis(p){const d=dlg('ald');d.innerHTML=`<div style="padding:18px"><h2 style="margin:0 0 4px">Stock analysis</h2><b>${esc(p.name)}</b> <small>${esc(p.id)}</small> ${locBadge(p.location)}<div id="alb" style="margin-top:10px;overflow-x:auto">…</div><div style="text-align:end;margin-top:10px"><button type="button" id="alx">Close</button></div></div>`;d.showModal();d.querySelector('#alx').onclick=()=>d.close();
 try{if(!RCV||Date.now()-RCV.t>3e5)RCV={t:Date.now(),d:(await getDocs(collection(db,'receivings'))).docs.map(x=>x.data())};
  const [ms,pl]=await Promise.all([getDocs(query(collection(db,'movements'),where('partId','==',p.id))),getDocs(query(collection(db,'priceLog'),where('sku','==',p.id)))]);
  const M=ms.docs.map(x=>x.data()),PL=pl.docs.map(x=>x.data()).sort((a,b)=>(b.at?.seconds||9e9)-(a.at?.seconds||9e9));
  const B=[];RCV.d.forEach(r=>(r.lines||[]).forEach(l=>{if(l.sku===p.id)B.push({date:r.date,sup:r.who||'',qty:num(l.qty),price:num(l.price),ref:r.no})}));B.sort((a,b)=>a.date>b.date?1:-1);B.forEach((x,i)=>{x.chg=i&&B[i-1].price?(x.price-B[i-1].price)/B[i-1].price*100:null});
  const sup={};B.forEach(x=>{const s=sup[x.sup]||(sup[x.sup]={n:0,qty:0,sum:0,last:x});s.n++;s.qty+=x.qty;s.sum+=x.price*x.qty;if(x.date>=s.last.date)s.last=x});
  const prices=B.map(x=>x.price),avg=B.reduce((a,x)=>a+x.price*x.qty,0)/Math.max(1,B.reduce((a,x)=>a+x.qty,0)),last=B[B.length-1];
  const soldQ=-M.filter(m=>['sale','use','out'].includes(m.type)).reduce((a,m)=>a+m.qty,0),inQ=M.filter(m=>m.type==='in').reduce((a,m)=>a+m.qty,0),margin=num(p.buy)?(num(p.normal)-num(p.buy))/num(p.buy)*100:null;
  const mo={};M.forEach(m=>{if(!m.at)return;const k=m.at.toDate().toISOString().slice(0,7),x=mo[k]||(mo[k]={i:0,o:0});m.qty>0?x.i+=m.qty:x.o-=m.qty});const keys=[...Array(12)].map((_,i)=>{const t=new Date();t.setDate(1);t.setMonth(t.getMonth()-11+i);return t.toISOString().slice(0,7)}),mx=Math.max(1,...keys.map(k=>Math.max((mo[k]||{}).i||0,(mo[k]||{}).o||0)));
  const tile=(l,v)=>`<div style="background:var(--card);border:1px solid var(--line);border-radius:10px;padding:8px 10px"><b>${v}</b><br><small>${l}</small></div>`,pc=v=>v==null?'':`<span style="color:${v>0?'var(--bad)':v<0?'#1e8e4e':'inherit'}">${v>0?'▲':v<0?'▼':'='} ${Math.abs(v).toFixed(1)}%</span>`;
  d.querySelector('#alb').innerHTML=`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-bottom:12px">${tile('Stock now',num(p.qty))}${tile('Buy',money(p.buy))}${tile('Sale',money(p.normal))}${tile('Margin',margin==null?'-':margin.toFixed(0)+'%')}${tile('Last purchase',last?money(last.price)+' · '+esc(last.sup)+' · '+last.date:'-')}${tile('Average purchase price',B.length?money(avg):'-')}${tile('Lowest / highest',B.length?money(Math.min(...prices))+' / '+money(Math.max(...prices)):'-')}${tile('Total purchased',inQ)}${tile('Total sold / used',soldQ)}</div>
  <b>Last price by supplier</b><table style="margin:6px 0 12px"><thead><tr><th>Supplier</th><th>Last price</th><th>Date</th><th>Purchases</th><th>Average</th></tr></thead><tbody>${Object.entries(sup).map(([s,x])=>`<tr><td>${esc(s)}</td><td><b>${money(x.last.price)}</b></td><td>${x.last.date}</td><td>${x.n}</td><td>${money(x.sum/Math.max(1,x.qty))}</td></tr>`).join('')||'<tr><td colspan="5">Nothing to show.</td></tr>'}</tbody></table>
  <b>Purchase price history</b><table style="margin:6px 0 12px"><thead><tr><th>Date</th><th>Supplier</th><th>Qty</th><th>Unit price</th><th>Change</th><th>Reference</th></tr></thead><tbody>${[...B].reverse().map(x=>`<tr><td>${x.date}</td><td>${esc(x.sup)}</td><td>${x.qty}</td><td><b>${money(x.price)}</b></td><td>${pc(x.chg)}</td><td>${esc(x.ref||'')}</td></tr>`).join('')||'<tr><td colspan="6">Nothing to show.</td></tr>'}</tbody></table>
  <b>Price changes</b><table style="margin:6px 0 12px"><thead><tr><th>Date</th><th>Price</th><th>Old</th><th>New</th><th>Source</th><th>User</th></tr></thead><tbody>${PL.map(x=>`<tr><td>${x.at?x.at.toDate().toLocaleString():''}</td><td>${{buy:'Buy',wholesale:'Wholesale',normal:'Sale',repair:'Repair'}[x.field]||x.field}</td><td>${money(x.old)}</td><td><b>${money(x.new)}</b></td><td>${esc(x.source||'')}</td><td>${esc((x.by||'').split('@')[0])}</td></tr>`).join('')||'<tr><td colspan="6">Nothing to show.</td></tr>'}</tbody></table>
  <b>Total in</b> / <b>Total out</b><div style="display:flex;align-items:flex-end;gap:6px;height:110px;margin:16px 0 4px">${keys.map(k=>{const x=mo[k]||{i:0,o:0};return `<div style="flex:1;display:flex;gap:2px;align-items:flex-end;height:100%" title="${k}: +${x.i} / -${x.o}"><div style="flex:1;background:#1e8e4e;height:${x.i/mx*100}%;min-height:1px"></div><div style="flex:1;background:var(--bad);height:${x.o/mx*100}%;min-height:1px"></div></div>`}).join('')}</div><div style="display:flex;gap:6px;font-size:10px;color:var(--mut)">${keys.map(k=>`<span style="flex:1;text-align:center">${k.slice(5)}</span>`).join('')}</div>`}catch(e){d.querySelector('#alb').textContent=e.message}}

// ---- shared status colours, chips, and navigation through the app shell
export const STATUS={received:['Reception','#64748b'],diagnose:['Diagnose','#f59e0b'],awaiting_approval:['Waiting approval','#a855f7'],waiting_parts:['Waiting parts','#b45309'],repair:['Repair','#2563eb'],ready:['Ready for pickup','#16a34a'],no_repair:['Return without repair','#6b7280'],returned:['Returned','#334155']};
export const chip=s=>{const x=STATUS[s]||[s,'#64748b'];return `<span class="chip2" style="--c:${x[1]}"><i></i>${esc(x[0])}</span>`};
export const goPage=(href,focus)=>{if(window.self!==window.top)window.top.postMessage({rdGo:href,focus:!!focus},location.origin);else location.href=pageUrl(href)};
export {PAGES};

// ---- customer notifications (WhatsApp / SMS) and tracking link
export const trackBase=()=>(!SHOP.trackUrl||/YOUR-/.test(SHOP.trackUrl))?new URL('track.html',ROOT).href.split('?')[0].split('#')[0]:SHOP.trackUrl;
export const trackUrl=t=>trackBase()+'?code='+t.code;
export const MSG_DEF={diagnose:{en:'Hello {name}, our technician is checking your {device} (ticket {code}). We will contact you with the diagnosis. Follow it here: {link}',fr:'Bonjour {name}, notre technicien examine votre {device} (ticket {code}). Nous vous contacterons avec le diagnostic. Suivi : {link}',ar:'مرحباً {name}، يقوم الفني بفحص جهازك {device} (التذكرة {code}). سنتواصل معك بنتيجة الفحص. تابع هنا: {link}'},
quote:{en:'Hello {name}, the repair of your {device} (ticket {code}) needs your approval. Price: {quote}. Please reply YES to approve, or call us at {shopPhone}. Details: {link}',fr:'Bonjour {name}, la réparation de votre {device} (ticket {code}) attend votre accord. Prix : {quote}. Répondez OUI pour accepter, ou appelez-nous au {shopPhone}. Détails : {link}',ar:'مرحباً {name}، إصلاح جهازك {device} (التذكرة {code}) يحتاج موافقتك. السعر: {quote}. أرسل "نعم" للموافقة أو اتصل بنا على {shopPhone}. التفاصيل: {link}'},
parts:{en:'Hello {name}, we are waiting for a part for your {device} (ticket {code}). We will let you know as soon as it arrives. Follow it here: {link}',fr:'Bonjour {name}, nous attendons une pièce pour votre {device} (ticket {code}). Nous vous préviendrons dès son arrivée. Suivi : {link}',ar:'مرحباً {name}، ننتظر وصول قطعة لجهازك {device} (التذكرة {code}). سنخبرك فور وصولها. تابع هنا: {link}'},
repair:{en:'Hello {name}, your {device} (ticket {code}) is being repaired now. Follow it here: {link}',fr:'Bonjour {name}, votre {device} (ticket {code}) est en cours de réparation. Suivi : {link}',ar:'مرحباً {name}، جهازك {device} (التذكرة {code}) قيد الإصلاح الآن. تابع هنا: {link}'},
returned:{en:'Hello {name}, thank you for choosing {shop}. We hope your {device} works well. Tell us how we did: {link}',fr:'Bonjour {name}, merci d’avoir choisi {shop}. Nous espérons que votre {device} fonctionne bien. Donnez-nous votre avis : {link}',ar:'مرحباً {name}، شكراً لاختيارك {shop}. نتمنى أن يعمل جهازك {device} بشكل جيد. شاركنا رأيك: {link}'},
receipt:{en:'Hello {name}, we received your {device} at {shop}. Ticket N° {code}. Price: {price}. Follow the repair here: {link}',fr:'Bonjour {name}, nous avons bien reçu votre {device} chez {shop}. Ticket N° {code}. Prix : {price}. Suivez la réparation ici : {link}',ar:'مرحباً {name}، استلمنا جهازك {device} في {shop}. رقم التذكرة {code}. السعر: {price}. تابع الإصلاح هنا: {link}'},ready:{en:'Hello {name}, your {device} is ready for pickup at {shop}. Track it here: {link}',fr:'Bonjour {name}, votre {device} est prêt à être récupéré chez {shop}. Suivi : {link}',ar:'مرحباً {name}، جهازك {device} جاهز للاستلام من {shop}. تتبّع حالته: {link}'},nr:{en:'Hello {name}, your {device} is ready to be collected from {shop} (returned without repair). Details: {link}',fr:'Bonjour {name}, votre {device} est disponible chez {shop} (restitué sans réparation). Détails : {link}',ar:'مرحباً {name}، جهازك {device} جاهز للاستلام من {shop} (دون إصلاح). التفاصيل: {link}'}};
export const watchShopCfg=cb=>onSnapshot(doc(db,'settings','shop'),s=>cb(s.data()||{}),()=>cb({}));
/* which customer message fits the ticket's status (one WhatsApp button for every status) */
export const MSG_OF={received:'receipt',diagnose:'diagnose',awaiting_approval:'quote',waiting_parts:'parts',repair:'repair',ready:'ready',no_repair:'nr',returned:'returned'};
export const msgKind=t=>MSG_OF[t&&t.status]||'receipt';
export function msgText(t,cfg,kind='ready'){const lang=(cfg&&cfg.defaultLang)||'en',tp=(cfg&&cfg.tpl&&cfg.tpl[kind]&&cfg.tpl[kind][lang])||MSG_DEF[kind][lang]||MSG_DEF[kind].en;return tp.replace(/\{name\}/g,t.firstName||'').replace(/\{device\}/g,t.model||'').replace(/\{shop\}/g,SHOP.name).replace(/\{link\}/g,trackUrl(t)).replace(/\{price\}/g,t.price!=null?money(t.price):'').replace(/\{code\}/g,t.code).replace(/\{quote\}/g,()=>{const q=t.pendingQuote&&t.pendingQuote.price;return q!=null&&q!==''?money(q):(t.price!=null&&t.price!==''?money(t.price):'')}).replace(/\{shopPhone\}/g,SHOP.phone||'')}
export function phoneIntl(p,cfg){const raw=String(p||'').trim();let d=raw.replace(/\D/g,'');if(raw.startsWith('+'))return d;if(d.startsWith('00'))return d.slice(2);const cc=String((cfg&&cfg.countryCode)||'').replace(/\D/g,'');if(d.startsWith('0')&&cc)return cc+d.slice(1);return d}
export const waLink=(t,cfg,kind)=>`https://wa.me/${phoneIntl(t.phone,cfg)}?text=${encodeURIComponent(msgText(t,cfg,kind))}`;
let WCFG={};onAuthStateChanged(auth,u=>{if(u)getDoc(doc(db,'settings','shop')).then(s=>{WCFG=s.data()||{}}).catch(()=>{})});
/* WhatsApp chat with any phone number (customers, suppliers, wholesale clients) */
export const waHref=(phone,text)=>{const n=phoneIntl(phone,WCFG);return n?`https://wa.me/${n}${text?'?text='+encodeURIComponent(text):''}`:''};
export const WA_SVG='<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z"/></svg>';
export const waBtn=(phone,text,label)=>{const h=waHref(phone,text);return h?`<a class="wa-b" href="${h}" target="_blank" rel="noopener" onclick="event.stopPropagation()" title="WhatsApp ${String(phone).replace(/[<>"&]/g,'')}">${WA_SVG}${label?'<span>'+label+'</span>':''}</a>`:''};
export const smsLink=(t,cfg,kind)=>`sms:+${phoneIntl(t.phone,cfg)}?&body=${encodeURIComponent(msgText(t,cfg,kind))}`;
export async function markNotified(t,via){try{await updateDoc(doc(db,'tickets',t.code),{notifiedAt:Date.now(),notifiedVia:via,notifiedBy:user.email,updatedAt:serverTimestamp()});logAudit('customer.notify',t.code+' · '+via)}catch(e){}}

// In-app dialogs (replace the browser's alert/confirm pop-ups)
function _dlg(msg,yes,no){return new Promise(res=>{const d=document.createElement('dialog');d.className='appdlg';const m=document.createElement('div');m.className='adm';m.textContent=String(msg);const b=document.createElement('div');b.className='adb';let r=false;const done=v=>{if(r)return;r=true;d.close();d.remove();res(v)};
 if(no){const n=document.createElement('button');n.textContent=no;n.onclick=()=>done(false);b.append(n)}
 const y=document.createElement('button');y.className='p';y.textContent=yes;y.onclick=()=>done(true);b.append(y);d.append(m,b);d.addEventListener('cancel',e=>{e.preventDefault();done(false)});d.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();done(false)}else e.stopPropagation()});document.body.append(d);d.showModal();y.focus()})}
export const askYes=(msg,yes='Yes',no='Cancel')=>_dlg(msg,yes,no);
window.alert=msg=>{_dlg(msg,'OK',null)};

// ---- modern dropdowns: styled replacement for <select> and <input list> (keeps the native element as the source of truth)
(()=>{
 const st=document.createElement('style');st.id='dd-css';st.textContent="/* ---- modern dropdowns (v52) ---- */\nselect.dd-n{position:absolute!important;opacity:0!important;pointer-events:none!important;width:1px!important;height:1px!important;min-width:0!important;padding:0!important;border:0!important}\n.dd-b{display:inline-flex;align-items:center;justify-content:space-between;gap:8px;text-align:start;width:100%;min-width:110px;padding:9px 12px;border:1px solid var(--line);border-radius:12px;background:var(--card);color:var(--ink);font:inherit;cursor:pointer;transition:border-color .15s,box-shadow .15s,transform .1s;box-shadow:0 1px 2px #0000000d}\n.dd-b:hover{border-color:color-mix(in srgb,var(--ac) 55%,var(--line))}.dd-b:focus-visible,.dd-b.open{outline:0;border-color:var(--ac);box-shadow:0 0 0 3px color-mix(in srgb,var(--ac) 22%,transparent)}\n.dd-b span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dd-b span.ph{color:var(--mut)}.dd-b::after{content:\"\";flex:none;width:8px;height:8px;border-inline-end:2px solid var(--mut);border-bottom:2px solid var(--mut);transform:rotate(45deg) translateY(-2px);transition:transform .2s}.dd-b.open::after{transform:rotate(-135deg) translateY(-2px)}\n.dd-b:disabled{opacity:.55;cursor:not-allowed}\n.dd-pop{position:fixed;z-index:99999;background:color-mix(in srgb,var(--card) 94%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid var(--line);border-radius:16px;box-shadow:0 18px 50px #0003,0 2px 8px #0001;padding:6px;display:flex;flex-direction:column;max-height:min(320px,60vh);animation:ddin .14s ease-out;transform-origin:top center}\n@keyframes ddin{from{opacity:0;transform:translateY(-6px) scale(.98)}to{opacity:1;transform:none}}\n.dd-pop input.dd-s{width:100%;margin:2px 0 6px;padding:8px 12px;border-radius:10px;background:color-mix(in srgb,var(--ink) 5%,transparent);border:1px solid transparent}.dd-pop input.dd-s:focus{outline:0;border-color:var(--ac)}\n.dd-l{overflow-y:auto;overscroll-behavior:contain}.dd-o{display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:10px;cursor:pointer;font-size:15px;color:var(--ink);transition:background .1s}\n.dd-o:hover,.dd-o.hi{background:color-mix(in srgb,var(--ac) 13%,transparent)}.dd-o.sel{font-weight:700;color:var(--ac)}.dd-o.sel::after{content:\"\u2713\";margin-inline-start:auto}.dd-o.off{opacity:.45;pointer-events:none}.dd-g{padding:8px 12px 3px;font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--mut);font-weight:700}.dd-e{padding:12px;color:var(--mut);text-align:center;font-size:14px}\n.dd-o mark{background:color-mix(in srgb,var(--ac) 28%,transparent);color:inherit;border-radius:3px}\n";document.head.append(st);
 let pop=null,anchor=null;
 const close=()=>{if(pop){if(pop._kt)pop._kt.removeEventListener('keydown',pop._key,true);pop.remove();pop=null}if(anchor){anchor.classList.remove('open');anchor=null}};
 const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
 function open(btn,items,cur,onPick,searchable,inp){close();anchor=btn;btn.classList.add('open');
  pop=mk('div','dd-pop');const host=btn.closest('dialog[open]')||document.body;let hi=-1,rows=[];
  const sInp=searchable?mk('input','dd-s'):null;if(sInp){sInp.placeholder='Search…';sInp.autocomplete='rd-search-off';pop.append(sInp)}
  const list=mk('div','dd-l');pop.append(list);
  const paint=q=>{list.innerHTML='';rows=[];const nq=(q||'').toLowerCase();let n=0;
   items.forEach(it=>{if(it.group){const gl=mk('div','dd-g',it.group);list.append(gl);return}
    const t=it.text||'';if(nq&&!t.toLowerCase().includes(nq))return;const r=mk('div','dd-o'+(it.value===cur?' sel':'')+(it.disabled?' off':''));
    const i=nq?t.toLowerCase().indexOf(nq):-1;if(i>=0){r.append(document.createTextNode(t.slice(0,i)));const m=mk('mark',0,t.slice(i,i+nq.length));r.append(m,document.createTextNode(t.slice(i+nq.length)))}else r.textContent=t||'–';
    r.onmousedown=e=>{e.preventDefault();onPick(it);close()};r._v=it;list.append(r);rows.push(r);n++});
   if(!n)list.append(mk('div','dd-e','No match'));
   [...list.querySelectorAll('.dd-g')].forEach(g=>{if(!g.nextElementSibling||g.nextElementSibling.classList.contains('dd-g'))g.remove()});
   hi=rows.findIndex(r=>r.classList.contains('sel'));if(hi<0&&(nq||inp))hi=0;mark(true)};
  const mark=sc=>{rows.forEach((r,i)=>r.classList.toggle('hi',i===hi));if(sc&&rows[hi])rows[hi].scrollIntoView({block:'nearest'})};
  paint('');host.append(pop);
  const place=()=>{const r=btn.getBoundingClientRect(),w=Math.max(r.width,190),vh=innerHeight,below=vh-r.bottom,up=r.top>below&&below<260;pop.style.minWidth=w+'px';pop.style.left=Math.min(Math.max(8,r.left),innerWidth-w-8)+'px';
   if(up){pop.style.bottom=(vh-r.top+6)+'px';pop.style.top='auto';pop.style.maxHeight=Math.min(320,r.top-14)+'px';pop.style.transformOrigin='bottom center'}else{pop.style.top=(r.bottom+6)+'px';pop.style.bottom='auto';pop.style.maxHeight=Math.min(320,below-14)+'px'}};place();
  const key=e=>{if(!pop)return;const k=e.key;
   if(k==='Escape'){e.preventDefault();e.stopPropagation();close();(inp||btn).focus();return}
   if(k==='ArrowDown'||k==='ArrowUp'){e.preventDefault();e.stopPropagation();if(!rows.length)return;hi=k==='ArrowDown'?Math.min(rows.length-1,hi+1):Math.max(0,hi<0?0:hi-1);mark(true);return}
   if(k==='Enter'||k==='Tab'&&inp){if(rows[hi]){e.preventDefault();e.stopPropagation();onPick(rows[hi]._v);close()}else if(k==='Enter')close()}};
  const t=sInp||inp||btn;t.addEventListener('keydown',key,true);pop._kt=t;if(inp)pop.style.animation='none';
  if(sInp){sInp.oninput=()=>paint(sInp.value);setTimeout(()=>sInp.focus(),0)}
  pop._paint=paint;pop._key=key;
  const away=e=>{if(pop&&!pop.contains(e.target)&&e.target!==btn&&e.target!==inp){close();document.removeEventListener('mousedown',away,true)}};document.addEventListener('mousedown',away,true);
  const rs=()=>{if(pop)place()};addEventListener('resize',rs,{once:true});}
 // ---- <select>
 const sync=s=>{const b=s._dd;if(!b)return;const o=s.options[s.selectedIndex];const sp=b.firstChild;sp.textContent=o?o.text:'';sp.classList.toggle('ph',!o||o.value==='');b.disabled=s.disabled;b.hidden=s.hidden||s.style.display==='none'||(s.closest('[hidden]')&&false);if(!b.hidden&&getComputedStyle(s).display==='none'&&s.style.display!=='none'){b.hidden=true}};
 function enhS(s){if(s._dd||s.multiple||s.size>1||s.dataset.native!==undefined||s.closest('header,.pm-bar'))return;
  const b=mk('button','dd-b');b.type='button';b.append(mk('span'));b.className+=' '+(s.className||'');if(s.id)b.dataset.for=s.id;
  const cs=s.style;['width','minWidth','maxWidth','flex','margin','marginInline','marginTop','marginBottom','fontSize'].forEach(k=>{if(cs[k])b.style[k]=cs[k]});
  {const w=s.offsetWidth,p=s.parentElement;if(w&&p&&p.clientWidth&&w<p.clientWidth*.9){b.style.width='auto';b.style.minWidth=Math.max(110,w)+'px'}else if(w&&getComputedStyle(s).width!==''&&s.style.width==='auto'){b.style.width='auto'}}
  s.after(b);s._dd=b;s.classList.add('dd-n');s.tabIndex=-1;
  b.onclick=e=>{e.preventDefault();e.stopPropagation();if(anchor===b){close();return}
   const items=[];[...s.children].forEach(c=>{if(c.tagName==='OPTGROUP'){items.push({group:c.label});[...c.children].forEach(o=>items.push({value:o.value,text:o.text,disabled:o.disabled}))}else items.push({value:c.value,text:c.text,disabled:c.disabled})});
   open(b,items,s.value,it=>{s.value=it.value;sync(s);s.dispatchEvent(new Event('input',{bubbles:true}));s.dispatchEvent(new Event('change',{bubbles:true}))},items.filter(x=>!x.group).length>8)};
  b.onkeydown=e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){if(!pop){e.preventDefault();b.click()}}};
  new MutationObserver(()=>sync(s)).observe(s,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled','hidden','style','class']});
  s.addEventListener('change',()=>sync(s));sync(s)}
 // programmatic value changes
 const vd=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value');
 Object.defineProperty(HTMLSelectElement.prototype,'value',{get(){return vd.get.call(this)},set(v){vd.set.call(this,v);sync(this)},configurable:true});
 const sd=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'selectedIndex');
 Object.defineProperty(HTMLSelectElement.prototype,'selectedIndex',{get(){return sd.get.call(this)},set(v){sd.set.call(this,v);sync(this)},configurable:true});
 // ---- <input list>
 function enhI(i){if(i._ddi)return;const dl=document.getElementById(i.getAttribute('list')||'');if(!dl)return;i._ddi=1;i._dl=dl;i.removeAttribute('list');i.autocomplete='rd-'+(i.name||i.id||'list')+'-off';
  const show=()=>{const q=i.value.trim().toLowerCase();const all=[...dl.options].map(o=>({value:o.value,text:o.value+(o.label&&o.label!==o.value?' – '+o.label:'')}));
   const starts=all.filter(x=>x.text.toLowerCase().startsWith(q)),rest=all.filter(x=>!x.text.toLowerCase().startsWith(q)&&x.text.toLowerCase().includes(q)),items=(q?[...starts,...rest]:all).slice(0,200);
   if(!items.length){close();return}
   open(i,items,'',pick,false,i)};
  const pick=it=>{i.value=it.value;i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}))};
  i.addEventListener('focus',show);i.addEventListener('click',()=>{if(!pop||anchor!==i)show()});i.addEventListener('input',show);
  i.addEventListener('blur',()=>setTimeout(()=>{if(anchor===i)close()},120))}
 const scan=r=>{(r||document).querySelectorAll('select:not(.dd-n)').forEach(enhS);(r||document).querySelectorAll('input[list]').forEach(enhI)};
 let q=0;const sched=()=>{if(q)return;q=1;queueMicrotask(()=>{q=0;scan()})};
 const init=()=>{scan();new MutationObserver(sched).observe(document.body,{childList:true,subtree:true})};
 if(document.body)init();else addEventListener('DOMContentLoaded',init);
 addEventListener('scroll',e=>{if(pop&&!pop.contains(e.target)&&anchor&&anchor.tagName!=='INPUT')close()},true);
})();
