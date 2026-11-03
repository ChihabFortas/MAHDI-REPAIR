// Sends phone push notifications (Firebase Cloud Messaging) to the Android/iOS apps. Runs every ~5 minutes from GitHub Actions.
// node alerts/push.mjs [--sample alerts/push-sample.json]  (sample = print only, no Firebase)
import fs from 'node:fs';import {buildPushes,targets} from './pushlogic.mjs';
const a=process.argv.slice(2),si=a.indexOf('--sample');
if(si>-1){const s=JSON.parse(fs.readFileSync(a[si+1],'utf8'));for(const p of buildPushes(s.data)){const t=targets(p,s.tokens);console.log(p.title,'|',p.body,'→',t.length,'device(s)')}process.exit(0)}
const {default:admin}=await import('firebase-admin');admin.initializeApp({credential:admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))});const db=admin.firestore(),now=Date.now();
const st=(await db.doc('settings/pushState').get()).data()||{},since=st.lastRun||now-10*60000;
const get=async q=>(await q.get()).docs.map(d=>({...d.data(),id:d.id})),ts=m=>admin.firestore.Timestamp.fromMillis(m);
const [tickets,orders,needs,tokens]=await Promise.all([get(db.collection('tickets').where('updatedAt','>',ts(since))),get(db.collection('orders').where('createdAt','>',ts(since))),get(db.collection('partNeeds').where('createdAt','>',ts(since))),get(db.collection('fcmTokens'))]);
let sent=0;
for(const p of buildPushes({tickets,orders,needs,sinceMs:since})){
 const mark=db.doc('pushSent/'+p.key);try{await mark.create({at:now})}catch(e){continue} // already sent
 const T=targets(p,tokens);if(!T.length)continue;
 const r=await admin.messaging().sendEachForMulticast({tokens:T.map(x=>x.id),notification:{title:p.title,body:p.body},data:{href:p.href},android:{priority:'high',notification:{channelId:'default'}},apns:{payload:{aps:{sound:'default'}}}});
 sent+=r.successCount;
 await Promise.all(r.responses.map((x,i)=>x.error&&/registration-token-not-registered|invalid-argument|invalid-registration/.test(x.error.code||'')?db.doc('fcmTokens/'+T[i].id).delete():0));}
await db.doc('settings/pushState').set({lastRun:now,sent});console.log('pushes sent:',sent);
