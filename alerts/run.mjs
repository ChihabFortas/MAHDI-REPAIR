// Daily shop alerts: reads Firestore, builds the alerts, optionally asks Claude for a short brief, sends Telegram / WhatsApp / email.
// Usage:  node alerts/run.mjs            (real run, needs secrets)
//         node alerts/run.mjs --sample alerts/sample.json --dry   (test without Firebase / sending)
import fs from 'node:fs';
const args=process.argv.slice(2),dry=args.includes('--dry'),si=args.indexOf('--sample'),sample=si>-1?JSON.parse(fs.readFileSync(args[si+1],'utf8')):null;
const src=fs.readFileSync(new URL('../alertlogic.js',import.meta.url),'utf8');
const {buildAlerts}=await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));
const env=process.env;let data,cfg,db=null;
if(sample){data=sample.data;cfg=sample.cfg||{};data.now=new Date(data.now||Date.now())}
else{
 const {default:admin}=await import('firebase-admin');admin.initializeApp({credential:admin.credential.cert(JSON.parse(env.FIREBASE_SERVICE_ACCOUNT))});db=admin.firestore();
 cfg=((await db.doc('settings/alerts').get()).data())||{};const tz=cfg.timezone||'Africa/Algiers',now=new Date();
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:tz}).format(now),tzOff=Math.round((new Date(now.toLocaleString('en-US',{timeZone:tz}))-new Date(now.toLocaleString('en-US',{timeZone:'UTC'})))/60000),loc=new Date(now.toLocaleString('en-US',{timeZone:tz}));
 const d35=new Date(now-36*864e5).toISOString().slice(0,10),get=async q=>(await q.get()).docs.map(d=>({...d.data(),id:d.id}));
 const [deliveries,tickets,orders,products,parts,users,sch,leaves,logs,att]=await Promise.all([get(db.collection('deliveries').where('date','>=',d35)),get(db.collection('tickets')),get(db.collection('orders').where('status','==','new')),get(db.collection('products')),get(db.collection('parts')),get(db.collection('users')),get(db.collection('staffSchedules')),get(db.collection('leaves').where('status','==','approved')),get(db.collection('attendanceLogs').where('date','==',today)),db.doc('settings/attendance').get()]);
 const schedules={};sch.forEach(s=>schedules[s.id]=s);
 data={now,today,tzOff,nowMin:loc.getHours()*60+loc.getMinutes(),deliveries,tickets,orders,products,parts,users,schedules,leaves,logs,attCfg:att.data()||{}}}
const r=buildAlerts(data,cfg);let text=r.text;const lang=r.cfg.lang||'en';
if(r.digest.closed){console.log('Shop closed today — nothing to send.');process.exit(0)}
if(!r.alerts.length&&r.cfg.sendWhenAllGood===false){console.log('No alerts and "send when all good" is off.');process.exit(0)}
// optional AI brief
if(r.cfg.aiBrief!==false&&env.ANTHROPIC_API_KEY&&!dry){try{const names={en:'English',fr:'French',ar:'Arabic'};
 const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01'},body:JSON.stringify({model:env.ANTHROPIC_MODEL||'claude-sonnet-5-5',max_tokens:500,messages:[{role:'user',content:`You advise the owner of a phone repair and accessories shop in Algeria. Here are today's figures and alerts as JSON. Write at most 6 short lines in ${names[lang]||'English'}: what stands out, then 3 concrete actions for tomorrow. Be specific and practical, no greetings, no fluff.\n\n${JSON.stringify({digest:r.digest,alerts:r.alerts})}`}]})});
 const j=await res.json();const t=j.content&&j.content[0]&&j.content[0].text;if(t)text+='\n\n🤖 '+t.trim();else console.warn('AI brief failed:',JSON.stringify(j).slice(0,200))}catch(e){console.warn('AI brief error:',e.message)}}
console.log(text);if(dry){console.log('\n[dry run — nothing sent]');process.exit(0)}
const res=[];
if(cfg.telegram&&cfg.telegram.enabled&&cfg.telegram.chatId&&env.TELEGRAM_BOT_TOKEN)res.push(['telegram',fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chat_id:cfg.telegram.chatId,text:text.slice(0,4000)})}).then(async x=>{if(!x.ok)throw new Error(await x.text())})]);
if(cfg.whatsapp&&cfg.whatsapp.enabled&&cfg.whatsapp.phone&&env.CALLMEBOT_APIKEY)res.push(['whatsapp',fetch(`https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(cfg.whatsapp.phone)}&text=${encodeURIComponent(text.slice(0,1500))}&apikey=${encodeURIComponent(env.CALLMEBOT_APIKEY)}`).then(async x=>{if(!x.ok)throw new Error(await x.text())})]);
if(cfg.email&&cfg.email.enabled&&cfg.email.to&&env.SMTP_HOST){const nm=(await import('nodemailer')).default,port=+env.SMTP_PORT||587;res.push(['email',nm.createTransport({host:env.SMTP_HOST,port,secure:port===465,auth:{user:env.SMTP_USER,pass:env.SMTP_PASS}}).sendMail({from:env.EMAIL_FROM||env.SMTP_USER,to:cfg.email.to,subject:`Shop report ${r.digest.date}${r.alerts.length?` — ${r.alerts.length} alert(s)`:''}`,text})])}
if(!res.length)console.warn('No channel is enabled/configured (check the Alerts page and the GitHub secrets).');
let okc=0;const out=[];for(const [n,p] of res){try{await p;okc++;out.push(n+': sent');console.log('✔',n,'sent')}catch(e){out.push(n+': FAILED '+e.message.slice(0,120));console.error('✘',n,e.message)}}
if(db){try{await db.doc('settings/alertsLast').set({at:new Date(),text,alerts:r.alerts.length,channels:out})}catch(e){}}
if(res.length&&!okc)process.exit(1);
