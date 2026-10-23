import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,onAuthStateChanged,signOut} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore,collection,doc,onSnapshot,runTransaction,serverTimestamp,getDoc,setDoc,addDoc,getDocs,query,where,writeBatch,updateDoc} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {firebaseConfig,SHOP,ADMINS,IDLE_MINUTES} from "./firebase-config.js";
import {money,t,S} from "./ui.js";
export {money,t,S};
export const auth=getAuth(initializeApp(firebaseConfig)),db=getFirestore(auth.app),$=id=>document.getElementById(id);
export {SHOP};
document.documentElement.style.visibility='hidden';setTimeout(()=>{document.documentElement.style.visibility=''},8000);
export const reveal=()=>{document.documentElement.style.visibility=''};
export const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export const TIERS=[['r','Retail prices'],['w','Wholesale prices'],['p','Repair prices']];
export const fixedOf=(n,r)=>{n=Number(n)||0;r=Number(r)||0;return (n+(r||n))/2};
export const priceOf=(p,t='r')=>{const n=Number(p.normal)||0;if(t==='w')return Number(p.wholesale)||n;if(t==='p')return Number(p.repair)||n;return n};
export const PART_TYPES=["LCD","Battery","Back glass","Upper housing","Lower housing","Sub board","Charging port","Antenna","Cables","Rear camera","Front camera","Camera lens","Speaker","Earpiece","Buttons","SIM tray","Vibration motor","Fingerprint sensor"];
export const QUALITY=["Original","Third party","Copy","Refurbished"],SERVICES=["Cleaning service","Software service","Cosmetic service"];
export const norm=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim(),num=v=>Number(v)||0;
export const specialOf=(w,n)=>(num(w)+num(n))/2;
export const gen=p=>{const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let c=p;for(let i=0;i<6;i++)c+=A[Math.floor(Math.random()*A.length)];return c};
export let user=null,role=null,profile=null;
export const HOME={reception:'app.html',technician:'app.html',inventory:'app.html',manager:'app.html',admin:'app.html'};
const ALLR=['reception','technician','inventory','manager','admin'],FRONT=['reception','manager','admin'];
const PAGES={'reception.html':FRONT,'technician.html':['technician','manager','admin'],'manager.html':['manager','admin'],'admin.html':['admin'],'inventory.html':ALLR,'pos.html':FRONT,'quotes.html':FRONT,'quote.html':ALLR,'seed.html':['admin'],'treasury.html':['manager','admin'],'statistics.html':['manager','admin'],'suppliers.html':['manager','admin'],'invoices.html':['reception','manager','admin'],'stockmgmt.html':['manager','admin'],'partsqueue.html':['inventory','manager','admin'],'techreport.html':['manager','admin'],'board.html':FRONT,'dashboard.html':FRONT,'locations.html':ALLR,'crm.html':['manager','admin'],'partseditor.html':['admin'],'settings.html':ALLR};
export const canManage=()=>role==='manager'||role==='admin';
export const isAdmin=canManage; // back-office special price: manager + admin only
export async function loadProfile(u){let s=await getDoc(doc(db,'users',u.uid));
 if(!s.exists()&&(ADMINS||[]).map(norm).includes(norm(u.email))){await setDoc(doc(db,'users',u.uid),{email:u.email,name:u.email.split('@')[0],role:'admin',active:true,createdAt:serverTimestamp()});s=await getDoc(doc(db,'users',u.uid))}
 return s.exists()?s.data():null}
export async function logAudit(action,detail='',extra={}){try{await addDoc(collection(db,'audit'),{action,detail:String(detail).slice(0,300),by:user?.email||'',role,at:serverTimestamp(),...extra})}catch(e){}}
export function deny(msg){reveal();document.body.innerHTML=`<div style="max-width:440px;margin:14vh auto;padding:26px;background:var(--card,#fff);color:var(--ink,#14212b);border-radius:14px;text-align:center"><h2>${msg}</h2><p><button id="dn1">Back</button> <button id="dn2">Sign out</button></p></div>`;
 document.getElementById('dn1').onclick=()=>location.href=HOME[role]||'index.html';document.getElementById('dn2').onclick=()=>signOut(auth)}
function nav(){document.querySelectorAll('header button[onclick]').forEach(b=>{const m=/location\.href='([^']+)'/.exec(b.getAttribute('onclick'));if(m){const a=PAGES[m[1]];if(a&&!a.includes(role))b.remove()}});
 const h=document.querySelector('header'),lo=$('lo');if(!h||h.classList.contains('sh-top'))return;const mk=(t,c)=>{const e=document.createElement('span');e.className='bd';e.style.cssText='background:'+c+';color:#fff;white-space:nowrap';e.textContent=t;return e};
 const a=mk(profile.name||user.email,'#2a3a46'),b=mk(role[0].toUpperCase()+role.slice(1),'#0f7b7b');lo?(h.insertBefore(a,lo),h.insertBefore(b,lo)):h.append(a,b)}
let it;function idle(){if(window.self!==window.top)return;const r=()=>{clearTimeout(it);it=setTimeout(()=>signOut(auth),(IDLE_MINUTES||30)*6e4)};['click','keydown','mousemove','touchstart'].forEach(e=>addEventListener(e,r,{passive:true}));r()}
export function start(cb){let ready=false;(auth.authStateReady?auth.authStateReady():Promise.resolve()).then(()=>onAuthStateChanged(auth,async u=>{if(!u){setTimeout(()=>{if(!auth.currentUser)(window.top||window).location.replace('index.html')},1500);return}if(ready)return;ready=true;user=u;
 try{const p=await loadProfile(u);if(!p){deny('Your account is waiting for an administrator to give it a role.');return}if(p.active!==true){deny('This account has been disabled.');return}
  profile=p;role=p.role;const pg=location.pathname.split('/').pop()||'index.html',al=PAGES[pg];if(al&&!al.includes(role)){deny('You do not have access to this page.');return}
  if(window.self===window.top&&!['app.html','index.html','track.html'].includes(pg)){window.top.location.replace('app.html#'+encodeURIComponent(pg+location.search+location.hash));return}nav();idle();reveal();cb(u);hashNav()}catch(e){deny('Access check failed: '+e.message)}}));
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
 ['Stock',[['Parts catalog','inventory.html#cat'],['Storage map','locations.html'],['Accessories','pos.html#acc'],['Movements','inventory.html#mv'],['Import','inventory.html#im'],['Stock counts','stockmgmt.html#count'],['Merge products','stockmgmt.html#merge']]],
 ['Purchases',[['Supplier orders','suppliers.html#po'],['Receiving notes','inventory.html#rc'],['Supplier returns','suppliers.html#rt'],['Purchase invoices','invoices.html#purchase'],['Purchase credit notes','invoices.html#purchaseCredit']]],
 ['Sales',[['Counter sale','pos.html#pos'],['Delivery notes','inventory.html#dn'],['Sales journal','pos.html#sal'],['Returns','pos.html#ret'],['Proforma invoices','invoices.html#proforma'],['Sales invoices','invoices.html#sale'],['Credit note invoices','invoices.html#saleCredit'],['New quote','quotes.html']]],
 ['Workshop',[['Live board','board.html'],['Reception desk','reception.html'],['Technician board','technician.html'],['Parts queue','partsqueue.html'],['Bonus report','techreport.html'],['New quote','quotes.html']]],
 ['Suppliers',[['Supplier list','suppliers.html#sp'],['Payments','suppliers.html#py']]],
 ['Customers',[['Customers & debts','pos.html#cus']]],
 ['Costs & losses',[['Expenses','treasury.html#ex'],['Losses','treasury.html#ls']]],
 ['Customers',[['CRM dashboard','crm.html'],['Customers & debts','pos.html#cus']]],['Statistics',[['Statistics','statistics.html'],['Manager overview','manager.html']]],
 ['Treasury',[['Registers','treasury.html#rg'],['Daily closing','treasury.html#cl']]]];
const RIB=[['General',[['📌','Live board','board.html'],['📦','Products','inventory.html#cat'],['🗂️','Storage map','locations.html'],['🧾','Receiving notes','inventory.html#rc'],['🏭','Supplier list','suppliers.html#sp'],['🛒','Counter sale','pos.html#pos'],['📤','Delivery notes','inventory.html#dn'],['📒','Sales journal','pos.html#sal'],['👥','Customers & debts','pos.html#cus'],['📄','Invoices','invoices.html'],['📋','Stock counts','stockmgmt.html#count']]],
 ['Additional',[['💸','Expenses','treasury.html#ex'],['🗑️','Losses','treasury.html#ls'],['🔐','Registers','treasury.html#rg'],['🧮','Daily closing','treasury.html#cl'],['📊','Statistics','statistics.html']]],
 ['Workshop',[['🛠️','Reception desk','reception.html'],['🔧','Technician board','technician.html'],['📦','Parts queue','partsqueue.html'],['🏅','Bonus report','techreport.html'],['🧾','New quote','quotes.html']]]];
function buildPME(){const h=document.querySelector('header');if(window.self!==window.top||!h||document.querySelector('.pm-bar'))return;document.documentElement.classList.add('pme-nav');
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
export const goPage=(href,focus)=>{if(window.self!==window.top)window.top.postMessage({rdGo:href,focus:!!focus},location.origin);else location.href=href};
export {PAGES};

// ---- customer notifications (WhatsApp / SMS) and tracking link
export const trackBase=()=>(!SHOP.trackUrl||/YOUR-/.test(SHOP.trackUrl))?new URL('track.html',location.href).href.split('?')[0].split('#')[0]:SHOP.trackUrl;
export const trackUrl=t=>trackBase()+'?code='+t.code;
export const MSG_DEF={ready:{en:'Hello {name}, your {device} is ready for pickup at {shop}. Track it here: {link}',fr:'Bonjour {name}, votre {device} est prêt à être récupéré chez {shop}. Suivi : {link}',ar:'مرحباً {name}، جهازك {device} جاهز للاستلام من {shop}. تتبّع حالته: {link}'},nr:{en:'Hello {name}, your {device} is ready to be collected from {shop} (returned without repair). Details: {link}',fr:'Bonjour {name}, votre {device} est disponible chez {shop} (restitué sans réparation). Détails : {link}',ar:'مرحباً {name}، جهازك {device} جاهز للاستلام من {shop} (دون إصلاح). التفاصيل: {link}'}};
export const watchShopCfg=cb=>onSnapshot(doc(db,'settings','shop'),s=>cb(s.data()||{}),()=>cb({}));
export function msgText(t,cfg,kind='ready'){const lang=(cfg&&cfg.defaultLang)||'en',tp=(cfg&&cfg.tpl&&cfg.tpl[kind]&&cfg.tpl[kind][lang])||MSG_DEF[kind][lang]||MSG_DEF[kind].en;return tp.replace(/\{name\}/g,t.firstName||'').replace(/\{device\}/g,t.model||'').replace(/\{shop\}/g,SHOP.name).replace(/\{link\}/g,trackUrl(t)).replace(/\{price\}/g,t.price!=null?money(t.price):'').replace(/\{code\}/g,t.code)}
export function phoneIntl(p,cfg){const raw=String(p||'').trim();let d=raw.replace(/\D/g,'');if(raw.startsWith('+'))return d;if(d.startsWith('00'))return d.slice(2);const cc=String((cfg&&cfg.countryCode)||'').replace(/\D/g,'');if(d.startsWith('0')&&cc)return cc+d.slice(1);return d}
export const waLink=(t,cfg,kind)=>`https://wa.me/${phoneIntl(t.phone,cfg)}?text=${encodeURIComponent(msgText(t,cfg,kind))}`;
export const smsLink=(t,cfg,kind)=>`sms:+${phoneIntl(t.phone,cfg)}?&body=${encodeURIComponent(msgText(t,cfg,kind))}`;
export async function markNotified(t,via){try{await updateDoc(doc(db,'tickets',t.code),{notifiedAt:Date.now(),notifiedVia:via,notifiedBy:user.email,updatedAt:serverTimestamp()});logAudit('customer.notify',t.code+' · '+via)}catch(e){}}
