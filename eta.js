/* Delivery-time estimator. Settings live in settings/repairTime */
import {db} from "./common.js?v=46";
import {doc,getDoc,setDoc,onSnapshot} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
export const ETA_DEF={levels:[30,60,120,240],start:'09:00',end:'18:00',days:[0,1,2,3,4,6],buffer:0,wip:50,techs:0};
export const ETA_Q=['received','diagnose','repair'];
export const watchEta=cb=>onSnapshot(doc(db,'settings','repairTime'),s=>cb({...ETA_DEF,...(s.exists()?s.data():{})}),()=>cb({...ETA_DEF}));
export const saveEta=c=>setDoc(doc(db,'settings','repairTime'),c);
const hm=s=>{const m=/^(\d{1,2}):(\d{2})/.exec(s||'');return m?(+m[1])*60+(+m[2]):0};
/* add `mins` of working time starting at `from` (Date) -> Date */
export function addWork(from,mins,c){const S=hm(c.start),E=Math.max(S+1,hm(c.end)),days=c.days&&c.days.length?c.days:[0,1,2,3,4,6];
 let d=new Date(from),left=Math.max(0,Math.round(mins)),g=0;
 while(g++<800){if(days.includes(d.getDay())){const cur=d.getHours()*60+d.getMinutes();
   if(cur<E){const st=Math.max(cur,S),room=E-st;if(left<=room){d.setHours(0,0,0,0);d.setMinutes(st+left);return d}left-=room}}
  d.setDate(d.getDate()+1);d.setHours(0,0,0,0);d.setMinutes(hm(c.start))}
 return d}
/* tickets: array, techs: active technicians, opt:{level,techId} */
export function estimate(tickets,techs,c,opt){const lv=i=>(c.levels&&c.levels[i]!=null?+c.levels[i]:ETA_DEF.levels[i])||0;
 const open=tickets.filter(t=>ETA_Q.includes(t.status)),n=Math.max(1,+c.techs||techs.length||1),
  w=t=>lv(Math.min(3,Math.max(0,+t.level||0)))*(t.status==='repair'?(+c.wip||50)/100:1);
 const un=open.filter(t=>!t.techId).reduce((a,t)=>a+w(t),0);let load;
 if(opt.techId){load=open.filter(t=>t.techId===opt.techId).reduce((a,t)=>a+w(t),0)+un/n}
 else load=open.reduce((a,t)=>a+w(t),0)/n;
 const own=lv(Math.min(3,Math.max(0,+opt.level||0))),mins=load+own+(+c.buffer||0);
 return {at:addWork(new Date(),mins,c),mins:Math.round(mins),queue:open.length,techs:n,own}}
export const fmtDur=m=>{m=Math.round(m);const h=Math.floor(m/60),r=m%60;return (h?h+'h ':'')+(r||!h?r+'min':'')};
export const pad=n=>String(n).padStart(2,'0');
export const ymd=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
