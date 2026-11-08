// Product picker window (Enter in a note's product box): browse, insert, add, modify, hide-delete
import {$,esc,db,num,norm,hit,gen,user,logAudit,logPrices,specialOf,fixedOf,canManage,PART_TYPES,QUALITY,askYes} from "./common.js?v=46";
import {doc,setDoc,updateDoc,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const CSS=`#pkw{width:min(1040px,97vw);max-height:94vh;border:0;border-radius:14px;padding:0;background:var(--card);color:var(--ink)}#pkw::backdrop{background:#0009}#pkw .in{padding:14px 16px;display:flex;flex-direction:column;gap:10px;height:min(86vh,720px)}
#pkw .fl{display:flex;gap:8px;flex-wrap:wrap;align-items:end}#pkw .fl>div{flex:1;min-width:120px}#pkw label{font-size:12px;color:var(--mut);display:block}#pkw .tw{flex:1;min-height:0;overflow:auto;border:1px solid var(--line);border-radius:10px}
#pkw table{width:100%;border-collapse:collapse;font-size:14px}#pkw th{position:sticky;top:0;background:color-mix(in srgb,var(--ac) 14%,var(--card));padding:6px 8px;text-align:start;font-size:12.5px}#pkw td{padding:6px 8px;border-bottom:1px solid var(--line);white-space:nowrap}#pkw td.n,#pkw th.n{text-align:end}#pkw td.l{white-space:normal}
#pkw tr.r{cursor:pointer}#pkw tr.r:hover{background:color-mix(in srgb,var(--ac) 8%,transparent)}#pkw tr.on,#pkw tr.on:hover{background:var(--ac);color:#fff}#pkw .z{color:#e5484d;font-weight:700}#pkw tr.on .z{color:#fff}
#pkw .ft{display:flex;gap:8px;align-items:center;flex-wrap:wrap}#pkw .ft .sp{flex:1;color:var(--mut);font-size:13px}#pkw button{padding:8px 14px}
#pke{width:min(640px,96vw);border:0;border-radius:14px;padding:0;background:var(--card);color:var(--ink)}#pke::backdrop{background:#0009}#pke form{padding:16px 18px;display:grid;grid-template-columns:1fr 1fr;gap:10px}#pke .w{grid-column:1/-1}#pke .fa{display:flex;gap:8px;justify-content:flex-end}
@media(max-width:700px){#pke form{grid-template-columns:1fr}}`;
let dlg,ed,O,rows=[],sel=0,LOC=new Map(),F={};
const key=p=>(p.col||p._c)+'_'+p.id,colOf=p=>p.col||p._c||'products';
function build(){if(dlg)return;const st=document.createElement('style');st.textContent=CSS;document.head.append(st);
 dlg=document.createElement('dialog');dlg.id='pkw';dlg.innerHTML=`<div class="in"><h2 style="margin:0">Product list</h2>
 <div class="fl"><div style="flex:2"><label>Designation</label><input id="pkq" autocomplete="off"></div><div><label>Product code</label><input id="pkc" autocomplete="off"></div><div><label>Sale price</label><input id="pkp" autocomplete="off" inputmode="decimal"></div>
 <div><label>Type</label><select id="pkt"><option value="">All</option><option value="products">Accessories</option><option value="parts">Repair parts</option></select></div><div><label>Family</label><select id="pkf"><option value="">All</option></select></div><div><label>Brand</label><select id="pkb"><option value="">All</option></select></div><div><label>Stock</label><select id="pks"><option value="">All</option><option value="in">In stock</option><option value="out">Out of stock</option></select></div></div>
 <div class="tw"><table><thead><tr><th>Code</th><th>Designation</th><th>Family</th><th class="n">Stock</th><th class="n" id="pkh1">Purchase</th><th class="n" id="pkh2">Sale</th><th>Location</th></tr></thead><tbody id="pkr"></tbody></table></div>
 <div class="ft"><button id="pka">＋ Add</button><button id="pkm">✎ Modify</button><button id="pkd">🗑 Delete</button><span class="sp" id="pkn"></span><button class="p" id="pki">↵ Insert</button><button id="pkx">Cancel</button></div></div>`;
 document.body.append(dlg);
 ed=document.createElement('dialog');ed.id='pke';ed.innerHTML=`<form id="pkf2"><h2 class="w" id="pkt2" style="margin:0"></h2>
 <div><label>Type</label><select name="col" id="pkcol"><option value="products">Accessory</option><option value="parts">Repair part</option></select></div><div><label>Code / barcode</label><input name="id" placeholder="Auto"></div>
 <div class="w"><label>Designation</label><input name="name" required></div><div><label id="pkml">Category</label><input name="model" required></div><div><label>Brand</label><input name="brand"></div>
 <div class="pp"><label>Part type</label><select name="type">${PART_TYPES.map(x=>`<option>${x}</option>`).join('')}</select></div><div class="pp"><label>Quality</label><select name="quality">${QUALITY.map(x=>`<option>${x}</option>`).join('')}</select></div>
 <div><label>Supplier</label><input name="supplier"></div><div><label>Minimum stock (alert)</label><input name="minQty" type="number" min="0"></div>
 <div><label>Purchase price</label><input name="buy" type="number" step="0.01" min="0"></div><div><label>Wholesale price</label><input name="wholesale" type="number" step="0.01" min="0"></div>
 <div><label>Normal sale price</label><input name="normal" type="number" step="0.01" min="0" required></div><div class="pp"><label>Repair price</label><input name="repair" type="number" step="0.01" min="0"></div><div><label>Location</label><input name="location"></div>
 <p class="w" style="margin:0;color:var(--mut);font-size:13px">Quantity is not set here — it comes from receiving notes.</p>
 <div class="w fa"><button type="button" id="pkex">Cancel</button><button class="p">Save</button></div></form>`;document.body.append(ed);
 ['pkq','pkc','pkp'].forEach(i=>$(i).oninput=()=>{sel=0;draw()});['pkt','pkf','pkb','pks'].forEach(i=>$(i).onchange=()=>{sel=0;draw()});
 dlg.addEventListener('keydown',e=>{if(e.target.closest&&e.target.closest('#pke'))return;const k=e.key;if(k==='ArrowDown'){e.preventDefault();mv(1)}else if(k==='ArrowUp'){e.preventDefault();mv(-1)}else if(k==='PageDown'){e.preventDefault();mv(10)}else if(k==='PageUp'){e.preventDefault();mv(-10)}else if(k==='Enter'&&!/BUTTON/.test(e.target.tagName)){e.preventDefault();ins()}});
 $('pkx').onclick=()=>dlg.close();$('pki').onclick=ins;$('pka').onclick=()=>openE(null);$('pkm').onclick=()=>{if(rows[sel])openE(rows[sel])};$('pkd').onclick=del;$('pkex').onclick=()=>ed.close();$('pkf2').onsubmit=save;$('pkcol').onchange=pp;
 $('pkr').onclick=e=>{const t=e.target.closest('tr.r');if(t){sel=+t.dataset.i;mark()}};$('pkr').ondblclick=e=>{if(e.target.closest('tr.r'))ins()}}
const pp=()=>{const p=$('pkcol').value==='parts';ed.querySelectorAll('.pp').forEach(x=>x.style.display=p?'':'none');$('pkml').textContent=p?'Phone model':'Category'};
const all=()=>{const m=new Map();O.items().forEach(p=>m.set(key(p),{...p,col:colOf(p)}));LOC.forEach((v,k)=>m.set(k,{...(m.get(k)||{}),...v}));return [...m.values()].filter(p=>!p.hidden)};
function draw(){const q=$('pkq').value,c=norm($('pkc').value),pr=$('pkp').value.trim(),t=$('pkt').value,fa=$('pkf').value,br=$('pkb').value,s=$('pks').value,A=all();
 const keep=(id,v,L)=>{const e=$(id),o=e.value;e.innerHTML='<option value="">All</option>'+[...new Set(L.filter(Boolean))].sort().map(x=>`<option>${esc(x)}</option>`).join('');e.value=o};
 if(!draw.f){keep('pkf',0,A.map(p=>p.model||p.type));keep('pkb',0,A.map(p=>p.brand));draw.f=1}
 rows=A.filter(p=>(!t||p.col===t)&&(!fa||(p.model||p.type)===fa)&&(!br||p.brand===br)&&(!s||(s==='in'?num(p.qty)>0:num(p.qty)<=0))&&(!c||norm(p.id).includes(c))&&(!pr||String(O.price?O.price(p):num(p.normal)).startsWith(pr))&&(!q||hit(norm(p.name+' '+(p.model||'')+' '+(p.brand||'')+' '+(p.aliases||[]).join(' ')),q))).sort((a,b)=>(num(b.qty)>0)-(num(a.qty)>0)||String(a.name).localeCompare(String(b.name)));
 if(sel>=rows.length)sel=Math.max(0,rows.length-1);const sh=rows.slice(0,400),f=O.fm||(x=>num(x).toFixed(2));
 $('pkr').innerHTML=sh.map((p,i)=>`<tr class="r ${i===sel?'on':''}" data-i="${i}"><td>${esc(p.id)}</td><td class="l"><b>${esc(p.name)}</b></td><td>${esc(p.model||p.type||'')}</td><td class="n ${num(p.qty)<=0?'z':''}">${num(p.qty)}</td><td class="n">${f(num(p.buy))}</td><td class="n">${f(O.price?O.price(p):num(p.normal))}</td><td>${esc(p.location||'')}</td></tr>`).join('')||'<tr><td colspan="7" style="color:var(--mut);padding:14px">No product found. Use “＋ Add” to create it.</td></tr>';
 $('pkn').textContent='Number of products: '+rows.length+(rows.length>400?' (showing 400 — refine the search)':'');$('pkh2').textContent=O.priceLabel||'Sale';const m=canManage();['pka','pkm','pkd'].forEach(i=>$(i).style.display=m?'':'none');
 const r=$('pkr').querySelector('tr.on');if(r)r.scrollIntoView({block:'nearest'})}
const mark=()=>{$('pkr').querySelectorAll('tr').forEach(r=>r.classList.toggle('on',+r.dataset.i===sel))};
const mv=d=>{sel=Math.max(0,Math.min(Math.min(rows.length,400)-1,sel+d));mark();const r=$('pkr').querySelector('tr.on');if(r)r.scrollIntoView({block:'nearest'})};
function ins(){const p=rows[sel];if(!p)return;dlg.close();O.onPick(p)}
function openE(p){const f=$('pkf2');f.reset();$('pkt2').textContent=p?'Modify product':'New product';f.col.value=p?p.col:'products';f.col.disabled=!!p;f.id.readOnly=!!p;
 if(p)['id','name','model','brand','type','quality','supplier','minQty','buy','wholesale','normal','repair','location'].forEach(k=>{if(f[k]&&p[k]!=null)f[k].value=p[k]});pp();ed.dataset.edit=p?key(p):'';ed.showModal();f.name.focus()}
async function save(e){e.preventDefault();const f=e.target,v=Object.fromEntries(new FormData(f));v.col=f.col.value;const edit=ed.dataset.edit?all().find(x=>key(x)===ed.dataset.edit):null,id=edit?edit.id:((v.id||'').trim()||gen(v.col==='parts'?'P-':'A-'));
 if(!edit&&all().some(x=>x.id===id&&x.col===v.col)){alert('This code already exists.');return}
 const d={name:v.name.trim(),model:v.model.trim(),brand:v.brand||'',supplier:v.supplier||'',minQty:num(v.minQty),buy:num(v.buy),wholesale:num(v.wholesale),normal:num(v.normal),location:v.location||''};
 if(v.col==='parts'){Object.assign(d,{mk:norm(v.model),type:v.type,quality:v.quality,repair:num(v.repair),special:specialOf(v.wholesale,v.normal),fixed:fixedOf(v.normal,v.repair)})}
 try{if(edit){await updateDoc(doc(db,v.col,id),d);try{await logPrices(v.col,id,edit,d,user,'Edit')}catch(_){}}else await setDoc(doc(db,v.col,id),{...d,qty:0,createdAt:serverTimestamp()});
  logAudit(edit?'product.edit':'product.create',id+' · '+d.name);LOC.set(v.col+'_'+id,{...(edit||{}),...d,id,col:v.col,qty:edit?edit.qty:0});sel=Math.max(0,all().filter(x=>0).length);ed.close();$('pkq').value='';draw();const i=rows.findIndex(x=>x.id===id&&x.col===v.col);if(i>=0){sel=i;mark()}$('pkq').focus()}catch(x){alert(x.message)}}
async function del(){const p=rows[sel];if(!p)return;if(num(p.qty)!==0){alert('Only products with quantity 0 can be deleted. This one has '+num(p.qty)+' in stock.');return}
 if(!(await askYes('Remove “'+p.name+'” from the product list? It is only hidden: its history and statistics are kept.')))return;
 try{await updateDoc(doc(db,p.col,p.id),{hidden:true,hiddenAt:Date.now(),hiddenBy:user.email});logAudit('product.hide',p.id+' · '+p.name);LOC.set(key(p),{...p,hidden:true});draw()}catch(x){alert(x.message)}}
// opts: items() -> products (each with col), onPick(p), query, price(p), priceLabel, fm
export function openPicker(opts){O=opts;build();LOC=new Map();draw.f=0;sel=0;$('pkq').value=opts.query||'';$('pkc').value='';$('pkp').value='';['pkt','pkf','pkb','pks'].forEach(i=>$(i).value='');draw();dlg.showModal();$('pkq').focus();$('pkq').select()}
