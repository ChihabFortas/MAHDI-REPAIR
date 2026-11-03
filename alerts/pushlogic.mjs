// Pure logic: which phone notifications must be sent now. Used by push.mjs.
const ms=x=>!x?0:x.toMillis?x.toMillis():x.seconds!==undefined?x.seconds*1000:x._seconds!==undefined?x._seconds*1000:+x||0;
export function buildPushes({tickets=[],orders=[],needs=[],sinceMs=0}){const out=[],R=(...r)=>({roles:r});
 for(const t of tickets){const u=ms(t.updatedAt)||ms(t.createdAt);if(u<=sinceMs)continue;
  if(t.status==='ready')out.push({key:'ready-'+t.id,to:R('reception','manager','admin'),title:'📱 Repair ready',body:`${t.model||''} · ${((t.firstName||'')+' '+(t.lastName||'')).trim()} — tell the customer`,href:'reception.html'});
  else if(t.status==='awaiting_approval')out.push({key:'appr-'+t.id+'-'+u,to:R('reception','manager','admin'),title:'💬 Quote waiting for customer',body:`${t.model||''} · ${t.code||''}`,href:'reception.html'});
  if(t.techId&&!['ready','returned','no_repair'].includes(t.status))out.push({key:'assign-'+t.id+'-'+t.techId,to:{uids:[t.techId]},title:'🔧 New device assigned',body:`${t.model||''} · ${t.problem||t.code||''}`,href:'technician.html'})}
 for(const o of orders){if(o.status==='new'&&ms(o.createdAt)>sinceMs)out.push({key:'order-'+o.id,to:R('sales','manager','admin'),title:'🌐 New online order',body:`${o.code||''} · ${(o.customer&&o.customer.name)||''}`,href:'orders.html'})}
 for(const n of needs){if(ms(n.createdAt)>sinceMs)out.push({key:'need-'+n.id,to:R('inventory','manager','admin'),title:'🛎️ Part needed',body:`${n.name||n.model||''}`,href:'partsqueue.html#nd'})}
 return out}
export const targets=(p,tokens)=>tokens.filter(t=>(p.to.roles&&p.to.roles.includes(t.role))||(p.to.uids&&p.to.uids.includes(t.uid)));
