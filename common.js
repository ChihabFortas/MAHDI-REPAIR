import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,onAuthStateChanged,signOut} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore,collection,doc,onSnapshot,runTransaction,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {firebaseConfig,SHOP,ADMINS} from "./firebase-config.js";
import {money,t,S} from "./ui.js";
export {money,t,S};
export const auth=getAuth(initializeApp(firebaseConfig)),db=getFirestore(auth.app),$=id=>document.getElementById(id);
export {SHOP};
export const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export const PART_TYPES=["LCD","Battery","Back glass","Upper housing","Lower housing","Sub board","Charging port","Antenna","Cables","Rear camera","Front camera","Camera lens","Speaker","Earpiece","Buttons","SIM tray","Vibration motor","Fingerprint sensor"];
export const QUALITY=["Original","Third party","Refurbished"],SERVICES=["Cleaning service","Software service","Cosmetic service"];
export const norm=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim(),num=v=>Number(v)||0;
export const specialOf=(w,n)=>(num(w)+num(n))/2;
export const gen=p=>{const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let c=p;for(let i=0;i<6;i++)c+=A[Math.floor(Math.random()*A.length)];return c};
export let user=null;export const isAdmin=()=>!!user&&(ADMINS||[]).map(norm).includes(norm(user.email));
export function start(cb){onAuthStateChanged(auth,u=>{if(!u){location.href='index.html';return}user=u;cb(u)});
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
