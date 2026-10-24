// Publishes public, sanitised copies of stock items (no buy/wholesale prices) for the online shop.
import {db} from "./common.js?v=30";
import {collection,doc,getDocs,writeBatch,setDoc,deleteDoc} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const rs=(url,max)=>new Promise(res=>{const im=new Image();im.onerror=()=>res('');im.onload=()=>{const k=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',0.7))};im.src=url});
export const sid=(col,id)=>col+'_'+id;
export async function build(col,p,all){
 const s=p.shop||{},done=!!s.done&&s.published!==false;if(!done&&!(all&&Number(p.qty)>0&&Number(p.normal)>0))return null;
 const photos=s.photos&&s.photos.length?s.photos:(p.img&&String(p.img).startsWith('data:')?[p.img]:[]);
 let thumb=p.img&&String(p.img).startsWith('data:')?p.img:(photos[0]?await rs(photos[0],320):(p.img||''));
 const item={src:col,sid:p.id,kind:col==='parts'?'part':'accessory',title:s.title||p.name||'',brand:s.brand||p.brand||'',category:s.category||p.type||p.model||'Other',grade:s.grade||p.quality||'',short:s.short||'',color:s.color||'',price:Number(p.normal)||0,qty:Math.max(0,Number(p.qty)||0),thumb,ts:s.doneAt||0,full:!!s.done,model:p.model||''};
 const det={photos,description:s.description||'',compat:s.compat||p.compat||(p.model?[p.model]:[]),tags:s.tags||[],warranty:s.warranty||'',ref:p.ref||'',title:item.title};
 return {item,det}}
export async function syncOne(col,p){const b=await build(col,p,false),id=sid(col,p.id);if(!b){try{await deleteDoc(doc(db,'shopItems',id));await deleteDoc(doc(db,'shopDetails',id))}catch(e){}return}
 await setDoc(doc(db,'shopItems',id),b.item);await setDoc(doc(db,'shopDetails',id),b.det)}
export async function syncAll(all,progress=()=>{}){const [a,b,ex]=await Promise.all([getDocs(collection(db,'parts')),getDocs(collection(db,'products')),getDocs(collection(db,'shopItems'))]);
 const src=[...a.docs.map(d=>['parts',{...d.data(),id:d.id}]),...b.docs.map(d=>['products',{...d.data(),id:d.id}])],keep=new Set(),ops=[];let n=0;
 for(const [c,p] of src){const r=await build(c,p,all);if(!r)continue;const id=sid(c,p.id);keep.add(id);ops.push(w=>{w.set(doc(db,'shopItems',id),r.item);w.set(doc(db,'shopDetails',id),r.det)});progress(++n)}
 ex.docs.forEach(d=>{if(!keep.has(d.id))ops.push(w=>{w.delete(doc(db,'shopItems',d.id));w.delete(doc(db,'shopDetails',d.id))})});
 for(let i=0;i<ops.length;i+=150){const w=writeBatch(db);ops.slice(i,i+150).forEach(f=>f(w));await w.commit()}return keep.size}
