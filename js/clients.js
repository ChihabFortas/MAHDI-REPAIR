// Client database helpers shared by the client database page (customers.html), reception, hand over and the CRM.
// A client is a document in `customers`. `segment` says which database it belongs to:
//   'repair'    repair shop clients (built from repair tickets)
//   'wholesale' wholesale and counter clients (delivery notes, invoices, payments) – also every older client without a segment
//   'online'    online shop clients (`shopUid` links the staff file to the shop account in `shopCustomers`)
import {db,norm,num,hit} from "./common.js?v=72";
import {doc,onSnapshot} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const SEGMENTS=[['repair','Repair shop','🔧'],['wholesale','Wholesale & counter','📦'],['online','Online shop','🛒']];
export const segOf=c=>c&&['repair','wholesale','online'].includes(c.segment)?c.segment:'wholesale';
export const digits=p=>String(p||'').replace(/\D/g,'').replace(/^(00)?213/,'0');
/* two phone numbers are the same client when their last 9 digits match (0555… = +213 555…) */
export const samePhone=(a,b)=>{const x=digits(a),y=digits(b);return x.length>=6&&y.length>=6&&x.slice(-9)===y.slice(-9)};
export const fullName=c=>(c&&(c.name||[c.firstName,c.lastName].filter(Boolean).join(' ')))||'';

/* search by first name, last name, full name or phone (any part of the number) */
export function matches(c,q){const k=norm(q);if(!k)return true;const d=digits(q);
 if(d.length>=3&&[c.phone,c.phone2,c.whatsapp].some(p=>digits(p).includes(d)))return true;
 return hit(norm([c.name,c.firstName,c.lastName,c.company].filter(Boolean).join(' ')),k)}

/* the repair tickets of a client: linked ones, plus older unlinked tickets with the same phone */
export const ticketsOf=(c,T)=>ticketIndex(T)(c);
const pkey=p=>{const d=digits(p).slice(-9);return d.length>=6?d:''};
/* index once, then look up each client quickly (pages with thousands of tickets) */
export function ticketIndex(T){const byId=new Map(),byPh=new Map(),put=(m,k,t)=>{let a=m.get(k);if(!a)m.set(k,a=[]);a.push(t)};
 T.forEach(t=>{if(t.customerId)put(byId,t.customerId,t);else if(!t.noPhone){const k=pkey(t.phone);if(k)put(byPh,k,t)}});
 return c=>{const k=pkey(c.phone);return [...(byId.get(c.id)||[]),...(k?byPh.get(k)||[]:[])].sort((a,b)=>(b.receivedDate||'').localeCompare(a.receivedDate||''))}}
/* a repair counts for loyalty when it was repaired and handed back (not a warranty return, not "returned without repair") */
export const counts=t=>!t.isReturn&&!t.noRepair&&t.status==='returned';

/* ---- loyalty: discount on the next repair after N finished repairs ---- */
export const LOYALTY_DEFAULT={enabled:true,tiers:[{n:1,pct:10},{n:2,pct:15},{n:3,pct:20}]};
export function watchLoyalty(cb){return onSnapshot(doc(db,'settings','loyalty'),s=>cb(cleanLoyalty(s.exists()?s.data():LOYALTY_DEFAULT)),()=>cb(cleanLoyalty(LOYALTY_DEFAULT)))}
export function cleanLoyalty(v){const tiers=(Array.isArray(v&&v.tiers)?v.tiers:[]).map(x=>({n:Math.max(1,Math.floor(num(x.n))),pct:Math.min(90,Math.max(0,num(x.pct)))})).filter(x=>x.pct>0).sort((a,b)=>a.n-b.n);
 return {enabled:!!(v&&v.enabled!==false),tiers}}
/* done = finished repairs before this one → {pct, done, next:{n,pct}|null} */
export function loyaltyFor(done,L){const r={pct:0,done,next:null};if(!L||!L.enabled)return r;
 for(const x of L.tiers){if(done>=x.n)r.pct=x.pct;else{r.next=x;break}}return r}
export const applyPct=(price,pct)=>Math.round(num(price)*(1-num(pct)/100));
/* what the client saved with loyalty discounts */
export const savedOf=T=>T.reduce((a,t)=>a+(t.loyalty&&t.loyalty.pct?Math.max(0,num(t.loyalty.listPrice)-num(t.price)):0),0);
/* what the client paid for repairs (finished repairs + diagnosis fees) */
export const spentOf=T=>T.reduce((a,t)=>a+(t.status!=='returned'?0:t.noRepair?num(t.noRepairFee):num(t.price)),0);
