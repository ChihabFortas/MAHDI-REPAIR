// Recurring tasks, templates and auto-created tasks
import {db as _db} from "./common.js?v=46";
import {doc,getDoc,setDoc,collection,getDocs,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
export const DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
export const BUILTIN=[
 {id:'b_daily',name:'Daily shelf count (10–15 min)',title:'Daily shelf count',desc:'Open Stock → Daily stock check and count today’s items. Fix any difference with “Fix stock”.',priority:'normal',checklist:['Open Stock → Daily stock check','Count today’s items on the shelf','Fix the differences in the app','Look at “items most often wrong”']},
 {id:'b_weekly',name:'Weekly stock check',title:'Weekly stock check',desc:'Check the most valuable and fastest-moving items and the shortages.',priority:'normal',checklist:['Count the 20 most valuable items','Check the low-stock list','Compare with open supplier orders','Write down items to buy']},
 {id:'b_receive',name:'Receive supplier order',title:'Receive supplier order',desc:'',priority:'high',checklist:['Check the delivery against the order','Count every item and check damage','Create the receiving note','Update buying / selling prices','Put items on shelves and set their location','Print labels','Pay the supplier or record the balance']},
 {id:'b_employee',name:'New employee setup',title:'New employee setup',desc:'',priority:'normal',checklist:['Create the account (Admin → Users): login name + role','Give the password and ask them to change it','Show the attendance QR and the shop rules','Set language and settings','Training on their daily screens','Introduce the Daily stock check']}];
const ymd=d=>d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0');
export const dueToday=(r,d=new Date())=>{if(r.freq==='weekly')return +r.dow===d.getDay();if(r.freq==='monthly'){const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();return Math.min(+r.dom||1,last)===d.getDate()}return true};
export const freqText=r=>r.freq==='weekly'?'Every '+DAYS[+r.dow||0]:r.freq==='monthly'?'Monthly, day '+(r.dom||1):'Every day';
const mk=(user,profile,d,extra)=>({title:d.title,desc:d.desc||'',projectId:'',assigneeId:d.assigneeId||'',assigneeName:d.assigneeName||'',assigneeRole:d.assigneeRole||'',status:'todo',priority:d.priority||'normal',due:d.due||new Date().toISOString().slice(0,10),ref:d.ref||'',checklist:(d.checklist||[]).map(t=>({text:typeof t==='string'?t:t.text,done:false})),comments:[],createdBy:user.uid,createdByName:(profile&&profile.name)||user.email,createdAt:serverTimestamp(),updatedAt:serverTimestamp(),...extra});
// one task per key (e.g. the same missing part is requested only once)
export async function autoTask(user,profile,key,d){const r=doc(_db,'tasks','auto_'+key);try{if((await getDoc(r)).exists())return false}catch(_){}
 try{await setDoc(r,mk(user,profile,d,{auto:true}));return true}catch(e){console.warn('autoTask',e.message);return false}}
export async function genRecurring(db,user,profile){const day=ymd(new Date()),k='rd_rec_'+day;try{if(sessionStorage.getItem(k))return;sessionStorage.setItem(k,'1')}catch(_){}
 let rules=[];try{rules=(await getDocs(collection(db,'taskRules'))).docs.map(d=>({...d.data(),id:d.id}))}catch(_){return}
 for(const r of rules){if(r.active===false||!dueToday(r))continue;const id='rec_'+r.id+'_'+day,ref=doc(db,'tasks',id);
  try{if((await getDoc(ref)).exists())continue}catch(_){}
  try{await setDoc(ref,mk(user,profile,r,{auto:true,ruleId:r.id}))}catch(e){console.warn('rec',e.message)}}}
