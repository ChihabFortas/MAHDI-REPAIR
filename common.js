import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,onAuthStateChanged,signOut} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore,collection,doc,onSnapshot,runTransaction,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {firebaseConfig,SHOP,ADMINS} from "./firebase-config.js";
export const auth=getAuth(initializeApp(firebaseConfig)),db=getFirestore(auth.app),$=id=>document.getElementById(id);
export {SHOP};
export const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export const PART_TYPES=["LCD","Battery","Main board","Back glass","Upper housing","Lower housing","Sub board","Antenna","Cables","Camera","Speaker","Earpiece"];
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
