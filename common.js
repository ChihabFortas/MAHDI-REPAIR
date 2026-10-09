import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,onAuthStateChanged,signOut,setPersistence,browserLocalPersistence} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore,collection,doc,onSnapshot,runTransaction,serverTimestamp,getDoc,setDoc,addDoc} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {firebaseConfig,SHOP,ADMINS,IDLE_MINUTES} from "./firebase-config.js";
import {money,t,S} from "./ui.js";
export {money,t,S};
export const auth=getAuth(initializeApp(firebaseConfig)),db=getFirestore(auth.app),$=id=>document.getElementById(id);
export {SHOP};
setPersistence(auth,browserLocalPersistence).catch(()=>{});
document.documentElement.style.visibility='hidden';setTimeout(()=>{document.documentElement.style.visibility=''},8000);
export const reveal=()=>{document.documentElement.style.visibility=''};
export const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export const TIERS=[['r','Retail prices'],['w','Wholesale prices'],['p','Repair prices']];
export const fixedOf=(n,r)=>{n=Number(n)||0;r=Number(r)||0;return (n+(r||n))/2};
export const priceOf=(p,t='r')=>{const n=Number(p.normal)||0;if(t==='w')return Number(p.wholesale)||n;if(t==='p')return Number(p.repair)||n;return n};
export const PART_TYPES=["LCD","Battery","Back glass","Upper housing","Lower housing","Sub board","Charging port","Antenna","Cables","Rear camera","Front camera","Camera lens","Speaker","Earpiece","Buttons","SIM tray","Vibration motor","Fingerprint sensor"];
export const QUALITY=["Original","Third party","Refurbished"],SERVICES=["Cleaning service","Software service","Cosmetic service"];
export const norm=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim(),num=v=>Number(v)||0;
export const specialOf=(w,n)=>(num(w)+num(n))/2;
export const gen=p=>{const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let c=p;for(let i=0;i<6;i++)c+=A[Math.floor(Math.random()*A.length)];return c};
export let user=null,role=null,profile=null;
export const HOME={reception:'reception.html',technician:'technician.html',manager:'manager.html',admin:'admin.html'};
const ALLR=['reception','technician','manager','admin'],FRONT=['reception','manager','admin'];
const PAGES={'reception.html':FRONT,'technician.html':['technician','manager','admin'],'manager.html':['manager','admin'],'admin.html':['admin'],'inventory.html':ALLR,'pos.html':FRONT,'quotes.html':FRONT,'quote.html':ALLR,'seed.html':['admin'],'treasury.html':['manager','admin'],'statistics.html':['manager','admin'],'suppliers.html':['manager','admin'],'invoices.html':['reception','manager','admin'],'stockmgmt.html':['manager','admin'],'settings.html':ALLR};
export const canManage=()=>role==='manager'||role==='admin';
export const isAdmin=canManage; // back-office special price: manager + admin only
export async function loadProfile(u){let s=await getDoc(doc(db,'users',u.uid));
 if(!s.exists()&&(ADMINS||[]).map(norm).includes(norm(u.email))){await setDoc(doc(db,'users',u.uid),{email:u.email,name:u.email.split('@')[0],role:'admin',active:true,createdAt:serverTimestamp()});s=await getDoc(doc(db,'users',u.uid))}
 return s.exists()?s.data():null}
export async function logAudit(action,detail='',extra={}){try{await addDoc(collection(db,'audit'),{action,detail:String(detail).slice(0,300),by:user?.email||'',role,at:serverTimestamp(),...extra})}catch(e){}}
export function deny(msg){reveal();document.body.innerHTML=`<div style="max-width:440px;margin:14vh auto;padding:26px;background:var(--card,#fff);color:var(--ink,#14212b);border-radius:14px;text-align:center"><h2>${msg}</h2><p><button id="dn1">Back</button> <button id="dn2">Sign out</button></p></div>`;
 document.getElementById('dn1').onclick=()=>location.href=HOME[role]||'index.html';document.getElementById('dn2').onclick=()=>signOut(auth)}
function nav(){document.querySelectorAll('header button[onclick]').forEach(b=>{const m=/location\.href='([^']+)'/.exec(b.getAttribute('onclick'));if(m){const a=PAGES[m[1]];if(a&&!a.includes(role))b.remove()}});
 const h=document.querySelector('header'),lo=$('lo');if(!h)return;const mk=(t,c)=>{const e=document.createElement('span');e.className='bd';e.style.cssText='background:'+c+';color:#fff;white-space:nowrap';e.textContent=t;return e};
 const a=mk(profile.name||user.email,'#2a3a46'),b=mk(role[0].toUpperCase()+role.slice(1),'#0f7b7b');lo?(h.insertBefore(a,lo),h.insertBefore(b,lo)):h.append(a,b)}
let it;function idle(){const r=()=>{clearTimeout(it);it=setTimeout(()=>signOut(auth),(IDLE_MINUTES||30)*6e4)};['click','keydown','mousemove','touchstart'].forEach(e=>addEventListener(e,r,{passive:true}));r()}
export function start(cb){let ready=false;(auth.authStateReady?auth.authStateReady():Promise.resolve()).then(()=>onAuthStateChanged(auth,async u=>{if(!u){location.replace('index.html');return}if(ready)return;ready=true;user=u;
 try{const p=await loadProfile(u);if(!p){deny('Your account is waiting for an administrator to give it a role.');return}if(p.active!==true){deny('This account has been disabled.');return}
  profile=p;role=p.role;const pg=location.pathname.split('/').pop()||'index.html',al=PAGES[pg];if(al&&!al.includes(role)){deny('You do not have access to this page.');return}
  nav();if(S.skin==='pme')buildPME();idle();reveal();cb(u);hashNav()}catch(e){deny('Access check failed: '+e.message)}}));
 const o=$('lo');if(o)o.onclick=()=>signOut(auth)}
export const watchParts=cb=>onSnapshot(collection(db,'parts'),s=>cb(s.docs.map(d=>({...d.data(),id:d.id}))));
export async function moveStock(partId,delta,type,ref,note='',col='parts'){
 await runTransaction(db,async tx=>{const r=doc(db,col,partId),s=await tx.get(r);if(!s.exists())throw new Error('Part '+partId+' not found');
  const p=s.data(),q=(p.qty||0)+delta;if(q<0)throw new Error(`Not enough stock for ${p.name} (have ${p.qty||0})`);
  tx.update(r,{qty:q});tx.set(doc(collection(db,'movements')),{partId,inv:col,name:p.name,model:p.model,type,qty:delta,balance:q,ref,note,by:user.email,at:serverTimestamp()})})}
export function printPartLabel(p){const pa=$('pa');
 pa.innerHTML=`<div class="lb"><b>${esc(p.name)}</b><br>${esc(p.model)} · ${esc(p.quality)}<svg id="bcp"></svg><b>${esc(p.id)}</b> · Price: <b>${num(p.normal).toFixed(2)}</b></div>`;
 JsBarcode(pa.querySelector('#bcp'),p.id,{format:'CODE128',displayValue:false,margin:0,height:40,width:2});pa.querySelector('#bcp').setAttribute('preserveAspectRatio','none');
 let st=$('ps');if(!st){st=document.createElement('style');st.id='ps';document.head.appendChild(st)}
 st.textContent='@page{size:45mm 35mm;margin:0}';setTimeout(()=>window.print(),150)}

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
export function printA4(html){const pa=$('pa');pa.innerHTML=html;let st=$('ps');if(!st){st=document.createElement('style');st.id='ps';document.head.appendChild(st)}st.textContent='@page{size:A4;margin:12mm}';setTimeout(()=>window.print(),150)}
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
 ['Stock',[['Parts catalog','inventory.html#cat'],['Accessories','pos.html#acc'],['Movements','inventory.html#mv'],['Import','inventory.html#im'],['Stock counts','stockmgmt.html#count'],['Merge products','stockmgmt.html#merge']]],
 ['Purchases',[['Supplier orders','suppliers.html#po'],['Receiving notes','inventory.html#rc'],['Supplier returns','suppliers.html#rt'],['Purchase invoices','invoices.html#purchase'],['Purchase credit notes','invoices.html#purchaseCredit']]],
 ['Sales',[['Counter sale','pos.html#pos'],['Delivery notes','inventory.html#dn'],['Sales journal','pos.html#sal'],['Returns','pos.html#ret'],['Proforma invoices','invoices.html#proforma'],['Sales invoices','invoices.html#sale'],['Credit note invoices','invoices.html#saleCredit'],['New quote','quotes.html']]],
 ['Workshop',[['Reception desk','reception.html'],['Technician board','technician.html'],['New quote','quotes.html']]],
 ['Suppliers',[['Supplier list','suppliers.html#sp'],['Payments','suppliers.html#py']]],
 ['Customers',[['Customers & debts','pos.html#cus']]],
 ['Costs & losses',[['Expenses','treasury.html#ex'],['Losses','treasury.html#ls']]],
 ['Statistics',[['Statistics','statistics.html'],['Manager overview','manager.html']]],
 ['Treasury',[['Registers','treasury.html#rg'],['Daily closing','treasury.html#cl']]]];
const RIB=[['General',[['📦','Products','inventory.html#cat'],['🧾','Receiving notes','inventory.html#rc'],['🏭','Supplier list','suppliers.html#sp'],['🛒','Counter sale','pos.html#pos'],['📤','Delivery notes','inventory.html#dn'],['📒','Sales journal','pos.html#sal'],['👥','Customers & debts','pos.html#cus'],['📄','Invoices','invoices.html'],['📋','Stock counts','stockmgmt.html#count']]],
 ['Additional',[['💸','Expenses','treasury.html#ex'],['🗑️','Losses','treasury.html#ls'],['🔐','Registers','treasury.html#rg'],['🧮','Daily closing','treasury.html#cl'],['📊','Statistics','statistics.html']]],
 ['Workshop',[['🛠️','Reception desk','reception.html'],['🔧','Technician board','technician.html'],['🧾','New quote','quotes.html']]]];
function buildPME(){const h=document.querySelector('header');if(!h||document.querySelector('.pm-bar'))return;document.documentElement.classList.add('pme-nav');
 const ok=u=>{const a=PAGES[u.split('#')[0]];return !a||a.includes(role)},here=location.pathname.split('/').pop()+location.hash;
 const bar=document.createElement('div');bar.className='pm-bar';bar.innerHTML=MENUS.map(([n,it])=>{const L=it.filter(([,u])=>ok(u));return L.length?`<div class="pm-menu"><span>${n}</span><div class="pm-dd">${L.map(([l,u])=>`<a href="${u}">${l}</a>`).join('')}</div></div>`:''}).join('');
 bar.querySelectorAll('.pm-menu>span').forEach(s=>s.onclick=()=>{const m=s.parentElement,o=m.classList.contains('open');bar.querySelectorAll('.pm-menu').forEach(x=>x.classList.remove('open'));if(!o)m.classList.add('open')});
 bar.querySelectorAll('.pm-dd a').forEach(a=>a.addEventListener('click',()=>bar.querySelectorAll('.pm-menu').forEach(x=>x.classList.remove('open'))));
 const rib=RIB.map(([n,it])=>[n,it.filter(([,,u])=>ok(u))]).filter(([,it])=>it.length),tabs=document.createElement('div');tabs.className='pm-tabs';
 const act=rib.findIndex(([,it])=>it.some(([,,u])=>here.startsWith(u.split('#')[0])));let cur=act<0?0:act;
 const panels=rib.map(([n,it],i)=>{const d=document.createElement('div');d.className='pm-rib';d.innerHTML=it.map(([ic,l,u])=>`<a href="${u}" class="${here===u||(!u.includes('#')&&here.startsWith(u))?'on':''}"><i>${ic}</i>${l}</a>`).join('')+(i===0?'':'');return d});
 const shop=document.createElement('div');shop.className='pm-shop';shop.textContent=(SHOP.name||'').toUpperCase();
 const right=document.createElement('div');right.className='pm-right';right.innerHTML='<a href="settings.html"><i>⚙️</i>Settings</a><a href="#" id="pmq" style="color:#a00"><i>⏻</i>Sign out</a>';
 const show=i=>{cur=i;tabs.querySelectorAll('span').forEach((s,k)=>s.classList.toggle('on',k===i));panels.forEach((p,k)=>p.classList.toggle('on',k===i))};
 rib.forEach(([n],i)=>{const s=document.createElement('span');s.textContent=n;s.onclick=()=>show(i);tabs.append(s)});
 const rw=document.createElement('div');rw.className='pm-ribwrap';panels.forEach(p=>rw.append(p));rw.append(shop,right);
 h.after(bar,tabs,rw);right.querySelector('#pmq').onclick=e=>{e.preventDefault();signOut(auth)};show(cur);
 const st=document.createElement('div');st.className='pm-status';st.innerHTML=`<span>Server: Firebase</span> · <span>User: ${esc(profile.name||user.email)}</span> · <span>Role: ${role}</span> · <span>${esc(SHOP.name)}</span>`;document.body.append(st)}
