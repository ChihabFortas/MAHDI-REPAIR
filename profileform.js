// Generic detailed "file" form (tabs of fields) with create / update / delete. Used for staff, customers and suppliers.
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CSS=`dialog.pfd{border:0;border-radius:18px;padding:0;width:min(860px,97vw);max-height:94vh;background:var(--card,#fff);color:var(--ink,#14212b);box-shadow:0 30px 90px #0007}dialog.pfd::backdrop{background:#0008}
.pfd form{display:flex;flex-direction:column;max-height:94vh}.pfd .phd{padding:18px 22px 10px}.pfd .phd h2{margin:0;font-size:22px}.pfd .phd small{color:var(--mut,#5d6b77)}
.pfd .ptb{display:flex;gap:6px;padding:0 18px 8px;overflow-x:auto;border-bottom:1px solid var(--line,#d9e0e6)}.pfd .ptb button{flex:none;border-radius:99px;padding:7px 14px;border:1px solid var(--line,#d9e0e6);background:var(--card,#fff);color:inherit;cursor:pointer;font:inherit}.pfd .ptb button.on{background:var(--ac,#0f7b7b);color:#fff;border-color:var(--ac,#0f7b7b)}.pfd .ptb button.bad{border-color:#dc2626;color:#dc2626}.pfd .ptb button.on.bad{color:#fff;background:#dc2626}
.pfd .pbd{overflow-y:auto;padding:16px 22px;flex:1}.pfd .psec{display:none;grid-template-columns:1fr 1fr;gap:12px 14px}.pfd .psec.on{display:grid}.pfd .pfl{display:flex;flex-direction:column}.pfd .pfl.w{grid-column:1/-1}.pfd label{font-size:13px;color:var(--mut,#5d6b77);margin-bottom:3px;display:block}.pfd label i{color:#dc2626;font-style:normal}
.pfd input,.pfd select,.pfd textarea{font:inherit;padding:9px 11px;border:1px solid var(--line,#d9e0e6);border-radius:10px;width:100%;background:var(--card,#fff);color:inherit;box-sizing:border-box}.pfd input.err,.pfd select.err{border-color:#dc2626;background:#dc26260d}.pfd .pck{display:flex;align-items:center;gap:8px;padding:9px 0}.pfd .pck input{width:auto}.pfd .phint{font-size:12px;color:var(--mut,#5d6b77);margin-top:2px}
.pfd .psh{grid-column:1/-1;font-weight:700;font-size:13px;letter-spacing:.05em;text-transform:uppercase;color:var(--ac,#0f7b7b);margin-top:6px}.pfd .pft{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;padding:12px 22px 16px;border-top:1px solid var(--line,#d9e0e6)}.pfd .pft .d{margin-inline-end:auto;color:#dc2626}.pfd .pft button{padding:9px 16px;border-radius:10px;border:1px solid var(--line,#d9e0e6);background:var(--card,#fff);color:inherit;font:inherit;cursor:pointer}.pfd .pft .p{background:var(--ac,#0f7b7b);border-color:var(--ac,#0f7b7b);color:#fff;font-weight:600}
@media(max-width:640px){.pfd .psec{grid-template-columns:1fr}}`;
let st=null;const ensure=()=>{if(!st){st=document.createElement('style');st.textContent=CSS;document.head.append(st)}};
const fld=(f,v)=>{const id='pf_'+f.k,val=v==null?'':v,r=f.req?' <i>*</i>':'',ph=f.ph?` placeholder="${esc(f.ph)}"`:'';let h;
 if(f.t==='select')h=`<select name="${f.k}" id="${id}">${f.o.map(o=>{const [a,b]=Array.isArray(o)?o:[o,o];return `<option value="${esc(a)}" ${String(val)===String(a)?'selected':''}>${esc(b)}</option>`}).join('')}</select>`;
 else if(f.t==='textarea')h=`<textarea name="${f.k}" id="${id}" rows="${f.rows||3}"${ph}>${esc(val)}</textarea>`;
 else if(f.t==='check')return `<div class="pfl ${f.w?'w':''}"><label class="pck"><input type="checkbox" name="${f.k}" id="${id}" ${v?'checked':''}> ${esc(f.l)}</label></div>`;
 else if(f.t==='tags')h=`<input name="${f.k}" id="${id}" value="${esc(Array.isArray(val)?val.join(', '):val)}"${ph||' placeholder="separate with commas"'}>`;
 else{const ty=f.t||'text';h=`<input name="${f.k}" id="${id}" type="${ty}" ${ty==='number'?`step="${f.step||'any'}" ${f.min!=null?`min="${f.min}"`:''} ${f.max!=null?`max="${f.max}"`:''}`:''} value="${esc(val)}"${ph}${f.ro?' readonly':''}${f.list?` list="dl_${f.k}"`:''}>${f.list?`<datalist id="dl_${f.k}">${f.list.map(x=>`<option value="${esc(x)}">`).join('')}</datalist>`:''}`}
 return `<div class="pfl ${f.w?'w':''}"><label for="${id}">${esc(f.l)}${r}</label>${h}${f.h?`<div class="phint">${esc(f.h)}</div>`:''}</div>`};
export function openProfile({title,sub='',sections,data={},canDelete=false,saveLabel='Save',onSave,onDelete}){ensure();
 const d=document.createElement('dialog');d.className='pfd';
 d.innerHTML=`<form novalidate><div class="phd"><h2>${esc(title)}</h2><small>${esc(sub)}</small></div><div class="ptb">${sections.map((s,i)=>`<button type="button" data-i="${i}" class="${i?'':'on'}">${esc(s.icon?s.icon+' ':'')}${esc(s.name)}</button>`).join('')}</div>
 <div class="pbd">${sections.map((s,i)=>`<div class="psec ${i?'':'on'}" data-i="${i}">${s.fields.map(f=>f.head?`<div class="psh">${esc(f.head)}</div>`:fld(f,data[f.k]??f.d)).join('')}</div>`).join('')}</div>
 <div class="pft">${canDelete&&onDelete?'<button type="button" class="d" id="pfDel">🗑 Delete</button>':''}<button type="button" id="pfX">Cancel</button><button class="p">${esc(saveLabel)}</button></div></form>`;
 document.body.append(d);const F=d.querySelector('form'),tabs=[...d.querySelectorAll('.ptb button')],secs=[...d.querySelectorAll('.psec')];
 const go=i=>{tabs.forEach((b,k)=>b.classList.toggle('on',k===i));secs.forEach((s,k)=>s.classList.toggle('on',k===i))};tabs.forEach((b,i)=>b.onclick=()=>go(i));
 const close=()=>{try{d.close()}catch(_){}d.remove()};d.querySelector('#pfX').onclick=close;d.addEventListener('cancel',e=>{e.preventDefault();close()});
 const all=sections.flatMap(s=>s.fields.filter(f=>!f.head));
 F.onsubmit=async e=>{e.preventDefault();tabs.forEach(b=>b.classList.remove('bad'));d.querySelectorAll('.err').forEach(x=>x.classList.remove('err'));
  const v={};let bad=null;
  all.forEach(f=>{const el=F.elements[f.k];if(!el)return;let x;if(f.t==='check')x=el.checked;else if(f.t==='number')x=el.value===''?null:Number(el.value);else if(f.t==='tags')x=el.value.split(',').map(s=>s.trim()).filter(Boolean);else x=String(el.value).trim();
   if(f.req&&(x===''||x===null||(Array.isArray(x)&&!x.length))){el.classList.add('err');const si=secs.findIndex(s=>s.contains(el));tabs[si].classList.add('bad');if(!bad)bad={el,si}}v[f.k]=x});
  if(bad){go(bad.si);bad.el.focus();return}
  const b=F.querySelector('.p');b.disabled=true;try{await onSave(v);close()}catch(x){alert('Could not save: '+(x.message||x));b.disabled=false}};
 const del=d.querySelector('#pfDel');if(del)del.onclick=async()=>{try{const r=await onDelete();if(r!==false)close()}catch(x){alert(x.message||x)}};
 d.showModal();const f0=F.querySelector('input:not([type=hidden]),select');if(f0&&!data[all[0].k])setTimeout(()=>f0.focus(),50);return d}
