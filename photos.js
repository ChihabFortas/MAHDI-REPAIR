/* Device photos for repair tickets. Stored in Firestore: tickets/{code}/photos/{id} {data,thumb,at,by}
   Photos are shrunk in the browser first (1280px JPEG, ~100-150 KB) so uploads are fast and cheap. */
import {collection,getDocs,setDoc,deleteDoc,doc,query,orderBy,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
export const MAX_PHOTOS=8;
const shrink=(src,w0,h0,max,q)=>{const k=Math.min(1,max/Math.max(w0,h0)),c=document.createElement('canvas');c.width=Math.round(w0*k);c.height=Math.round(h0*k);c.getContext('2d').drawImage(src,0,0,c.width,c.height);return c.toDataURL('image/jpeg',q)};
export async function fromFile(file){const url=URL.createObjectURL(file);try{const im=new Image();im.src=url;await im.decode();return {data:shrink(im,im.naturalWidth,im.naturalHeight,1280,.72),thumb:shrink(im,im.naturalWidth,im.naturalHeight,260,.6)}}finally{URL.revokeObjectURL(url)}}
export const fromVideo=v=>({data:shrink(v,v.videoWidth,v.videoHeight,1280,.72),thumb:shrink(v,v.videoWidth,v.videoHeight,260,.6)});
export async function loadPhotos(db,code){try{return (await getDocs(query(collection(db,'tickets',code,'photos'),orderBy('at','asc')))).docs.map(d=>({...d.data(),id:d.id}))}catch(e){try{return (await getDocs(collection(db,'tickets',code,'photos'))).docs.map(d=>({...d.data(),id:d.id}))}catch(_){return []}}}
export async function savePhotos(db,code,list,by){for(const p of list){const id='P'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);await setDoc(doc(db,'tickets',code,'photos',id),{data:p.data,thumb:p.thumb,by:by||'',at:serverTimestamp()})}}
export const deletePhoto=(db,code,id)=>deleteDoc(doc(db,'tickets',code,'photos',id));
/* full-size viewer */
export function lightbox(list,i){const d=document.createElement('dialog');d.style.cssText='border:0;padding:0;background:#000;width:min(96vw,900px);max-height:96vh;border-radius:12px';
 const show=()=>{d.innerHTML=`<div style="position:relative;text-align:center"><img src="${list[i].data}" style="max-width:100%;max-height:90vh"><button data-x style="position:absolute;top:8px;inset-inline-end:8px">✕</button>${list.length>1?`<button data-p style="position:absolute;top:50%;inset-inline-start:8px">‹</button><button data-n style="position:absolute;top:50%;inset-inline-end:8px">›</button>`:''}<div style="color:#fff;padding:6px">${i+1} / ${list.length}</div></div>`;
  d.querySelector('[data-x]').onclick=()=>{d.close();d.remove()};const p=d.querySelector('[data-p]'),n=d.querySelector('[data-n]');if(p){p.onclick=()=>{i=(i-1+list.length)%list.length;show()};n.onclick=()=>{i=(i+1)%list.length;show()}}};
 show();document.body.append(d);d.showModal();d.addEventListener('close',()=>d.remove())}
/* desk camera: live preview, many shots, no page reload. onShot({data,thumb}) is called for every picture. */
export async function openCam(onShot,label){const d=document.createElement('dialog');d.style.cssText='border:0;border-radius:14px;padding:14px;width:min(640px,96vw)';
 d.innerHTML=`<div style="display:grid;gap:10px"><div style="display:flex;gap:8px;align-items:center"><b style="flex:1">${label.title}</b><select id="cs" style="width:auto;max-width:55%"></select></div><video playsinline muted autoplay style="width:100%;border-radius:10px;background:#000;max-height:60vh"></video><div id="cm" style="color:#b45309;font-size:13px"></div><div style="display:flex;gap:8px;justify-content:flex-end;align-items:center"><span id="cc" style="flex:1;color:#64748b"></span><button class="p" id="sh">📸 ${label.shot}</button><button id="dn">${label.done}</button></div></div>`;
 document.body.append(d);const v=d.querySelector('video'),sel=d.querySelector('#cs'),cc=d.querySelector('#cc'),cm=d.querySelector('#cm');let st=null,n=0;
 const stop=()=>{if(st)st.getTracks().forEach(t=>t.stop());st=null};
 const start=async id=>{stop();try{st=await navigator.mediaDevices.getUserMedia({video:id?{deviceId:{exact:id},width:{ideal:1280},height:{ideal:720}}:{facingMode:'environment',width:{ideal:1280},height:{ideal:720}},audio:false});v.srcObject=st;await v.play();cm.textContent='';
   const ds=(await navigator.mediaDevices.enumerateDevices()).filter(x=>x.kind==='videoinput');if(sel.options.length!==ds.length){sel.innerHTML=ds.map((x,i)=>`<option value="${x.deviceId}">${x.label||('Camera '+(i+1))}</option>`).join('');const cur=st.getVideoTracks()[0].getSettings().deviceId;if(cur)sel.value=cur}
  }catch(e){cm.textContent=label.err+' '+e.message}};
 sel.onchange=()=>start(sel.value);
 d.querySelector('#sh').onclick=()=>{if(!v.videoWidth)return;onShot(fromVideo(v));n++;cc.textContent='✔ '+n;v.style.opacity=.3;setTimeout(()=>v.style.opacity=1,120)};
 const close=()=>{stop();d.close();d.remove()};d.querySelector('#dn').onclick=close;d.addEventListener('cancel',stop);
 d.showModal();start();}
