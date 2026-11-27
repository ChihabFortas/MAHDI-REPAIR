// In-memory stand-in for the Firebase Firestore web SDK (only what the app uses), for browser tests.
const DB=window.__DB||(window.__DB={});const subs=new Set();const SV={ts:{__ts:1},union:'__u',remove:'__r'};
const col=n=>DB[n]||(DB[n]={});let idn=0;
const now=()=>({seconds:Math.floor(Date.now()/1000),nanoseconds:0,toDate(){return new Date(this.seconds*1000)},toMillis(){return this.seconds*1000}});
export const initializeFirestore=()=>({});export const getFirestore=()=>({});export const persistentLocalCache=()=>({});export const persistentMultipleTabManager=()=>({});
export const collection=(_db,...p)=>({kind:'col',path:p.join('/')});
export function doc(a,...p){if(a&&a.kind==='col'){const id=p[0]||('auto'+(++idn)+Math.random().toString(36).slice(2,7));return {kind:'doc',path:a.path,id}}const all=p.join('/').split('/');return {kind:'doc',path:all.slice(0,-1).join('/'),id:all[all.length-1]}}
export const where=(f,op,v)=>({t:'w',f,op,v});export const orderBy=(f,d='asc')=>({t:'o',f,d});export const limit=n=>({t:'l',n});
export const query=(c,...q)=>({kind:'q',path:c.path,q});
export const serverTimestamp=()=>SV.ts;export const arrayUnion=(...v)=>({[SV.union]:v});export const arrayRemove=(...v)=>({[SV.remove]:v});export const deleteField=()=>({__del:1});
const get=(o,f)=>f.split('.').reduce((a,k)=>a==null?a:a[k],o);
function apply(old,data,merge){const r=merge?{...(old||{})}:{};for(const [k,v] of Object.entries(data)){
 if(v===SV.ts)r[k]=now();else if(v&&v[SV.union]){const a=Array.isArray(r[k])?[...r[k]]:[];v[SV.union].forEach(x=>{if(!a.some(y=>JSON.stringify(y)===JSON.stringify(x)))a.push(x)});r[k]=a}
 else if(v&&v[SV.remove]){r[k]=(Array.isArray(r[k])?r[k]:[]).filter(y=>!v[SV.remove].some(x=>JSON.stringify(x)===JSON.stringify(y)))}else if(v&&v.__del)delete r[k];else r[k]=v}return r}
const snap=(path,id)=>{const d=col(path)[id];return {id,exists:()=>d!==undefined,data:()=>d===undefined?undefined:JSON.parse(JSON.stringify(d),(k,v)=>v&&v.seconds!==undefined&&v.nanoseconds!==undefined?{...v,toDate(){return new Date(v.seconds*1000)},toMillis(){return v.seconds*1000}}:v),ref:{id,path}}};
function run(r){let ids=Object.keys(col(r.path));const q=r.q||[];
 for(const c of q.filter(c=>c.t==='w'))ids=ids.filter(id=>{const v=get(col(r.path)[id],c.f);return c.op==='=='?v===c.v:c.op==='!='?v!==c.v&&v!==undefined:c.op==='in'?c.v.includes(v):c.op==='array-contains'?Array.isArray(v)&&v.includes(c.v):c.op==='>='?v>=c.v:c.op==='<='?v<=c.v:c.op==='>'?v>c.v:c.op==='<'?v<c.v:true});
 for(const c of q.filter(c=>c.t==='o')){ids=ids.filter(id=>get(col(r.path)[id],c.f)!==undefined);ids.sort((a,b)=>{const x=get(col(r.path)[a],c.f),y=get(col(r.path)[b],c.f),xs=x&&x.seconds!==undefined?x.seconds:x,ys=y&&y.seconds!==undefined?y.seconds:y;return (xs>ys?1:xs<ys?-1:0)*(c.d==='desc'?-1:1)})}
 const l=q.find(c=>c.t==='l');if(l)ids=ids.slice(0,l.n);const docs=ids.map(id=>snap(r.path,id));return {docs,size:docs.length,empty:!docs.length,forEach:f=>docs.forEach(f),docChanges:()=>docs.map(d=>({type:'added',doc:d}))}}
const notify=()=>queueMicrotask(()=>subs.forEach(s=>s()));
export async function getDoc(r){return snap(r.path,r.id)}export async function getDocs(r){return run(r)}
export function onSnapshot(r,cb,err){const f=()=>{try{cb(r.kind==='doc'?snap(r.path,r.id):run(r))}catch(e){console.error(e)}};subs.add(f);setTimeout(f,0);return ()=>subs.delete(f)}
export async function setDoc(r,data,o){col(r.path)[r.id]=apply(col(r.path)[r.id],data,o&&o.merge);window.__LOG.push(['set',r.path,r.id]);notify()}
export async function addDoc(c,data){const r=doc(c);await setDoc(r,data);return r}
export async function updateDoc(r,data){if(col(r.path)[r.id]===undefined)throw new Error('No document to update: '+r.path+'/'+r.id);col(r.path)[r.id]=apply(col(r.path)[r.id],data,true);window.__LOG.push(['update',r.path,r.id,Object.keys(data)]);notify()}
export async function deleteDoc(r){delete col(r.path)[r.id];window.__LOG.push(['delete',r.path,r.id]);notify()}
export function writeBatch(){const ops=[];return {set:(r,d,o)=>ops.push(()=>setDoc(r,d,o)),update:(r,d)=>ops.push(()=>updateDoc(r,d)),delete:r=>ops.push(()=>deleteDoc(r)),commit:async()=>{for(const o of ops)await o()}}}
export async function runTransaction(_db,fn){return fn({get:getDoc,set:setDoc,update:updateDoc,delete:deleteDoc})}
window.__LOG=window.__LOG||[];
