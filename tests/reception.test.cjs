// Run: node tests/reception.test.cjs   (needs Playwright with Chromium; screenshots go to the temp folder or the 2nd argument)
// Browser test of the reception desk: several tickets at once + default phone number.
// The app files are served from the project folder through Playwright routing; Firebase is replaced by an in-memory fake.
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const ROOT=process.argv[2]||path.resolve(__dirname,'..'),OUT=process.argv[3]||require('os').tmpdir(),HERE=__dirname,BASE='http://localhost:5555/';
const TYPES={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.ico':'image/x-icon'};
const AUTH=`const U={uid:'u-admin',email:'admin@test.local',emailVerified:true,displayName:'Test admin'};const A={currentUser:U,authStateReady:()=>Promise.resolve()};
export const getAuth=()=>A;export const onAuthStateChanged=(_a,cb)=>{setTimeout(()=>cb(U),0);return ()=>{}};export const signOut=async()=>{};`;
const d=(s)=>({seconds:Math.floor(new Date(s).getTime()/1000),nanoseconds:0});
const T=(code,first,last,phone,model,problem,status,date,extra={})=>[code,{code,firstName:first,lastName:last,phone,model,color:'',problem,status,price:4500,level:1,urgency:2,receivedDate:date,estDelivery:'',techId:'',techName:'',history:[{s:status,t:0}],createdAt:d(date+'T10:00:00'),...extra}];
const SEED={users:{'u-admin':{role:'admin',active:true,name:'Test admin'}},
 technicians:{'t1':{name:'Yacine',active:true},'t2':{name:'Sofiane',active:true}},
 customers:{'C-KARIM':{name:'Karim Haddad',firstName:'Karim',lastName:'Haddad',phone:'0555123456',segment:'repair',type:'r',status:'active'}},
 tickets:Object.fromEntries([
  T('RD-AAAA01','Karim','Haddad','0555123456','Samsung A52','Screen','returned','2026-06-01',{customerId:'C-KARIM'}),
  T('RD-AAAA02','Karim','Haddad','0555123456','iPhone 11','Battery','returned','2026-09-01',{customerId:'C-KARIM'}),
  T('RD-BBBB01','Amina','Belkacem','0661234567','Redmi Note 10','Charging port','received','2026-11-20'),
  T('RD-BBBB02','Yanis','Cherif','0770112233','Galaxy S21','Screen','diagnose','2026-11-21'),
  T('RD-BBBB03','Sara','Mansouri','0550998877','Oppo A74','Camera','repair','2026-11-22'),
  T('RD-BBBB04','Walid','Ziani','0699887766','iPhone 12','Face ID','received','2026-11-23'),
  T('RD-BBBB05','Lina','Saadi','0541122334','Huawei P30','Speaker','waiting_parts','2026-11-24')])};
let failures=0;const check=(ok,msg)=>{console.log((ok?'✓ ':'✗ ')+msg);if(!ok)failures++};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2});
 await ctx.addInitScript(s=>{if(!window.__DB)window.__DB=JSON.parse(s)},JSON.stringify(SEED));
 await ctx.route('**/*',async r=>{const u=new URL(r.request().url());
  if(u.host==='www.gstatic.com'){const f=u.pathname.split('/').pop();return r.fulfill({contentType:'text/javascript',body:f==='firebase-app.js'?'export const initializeApp=()=>({});':f==='firebase-auth.js'?AUTH:fs.readFileSync(path.join(HERE,'fake-firestore.js'),'utf8')})}
  if(u.origin+'/'===BASE){let p=path.join(ROOT,decodeURIComponent(u.pathname));if(!fs.existsSync(p)||fs.statSync(p).isDirectory())return r.fulfill({status:404,body:''});return r.fulfill({contentType:TYPES[path.extname(p)]||'application/octet-stream',body:fs.readFileSync(p)})}
  return r.abort()});
 const page=await ctx.newPage();const errs=[];page.on('pageerror',e=>errs.push(e.message));
 await page.goto(BASE+'app.html#reception.html');
 const fr=async()=>{for(let i=0;i<60;i++){const f=page.frames().find(f=>/\/pages\/repairs\/reception\.html/.test(f.url()));if(f&&await f.$('#rows tr td').catch(()=>null))return f;await page.waitForTimeout(250)}throw new Error('reception did not load; errors: '+errs.join(' | '))};
 const f=await fr();await f.waitForSelector('[data-bk]',{state:'attached'});
 // in the shell, frames share window.__DB with the frame, not the top page
 const DB=()=>f.evaluate(()=>window.__DB);
 const yes=async()=>{const top=page;for(let i=0;i<20;i++){for(const fx of [f,top.mainFrame()]){const b=await fx.$('dialog[open] button:has-text("Set"), dialog[open] button:has-text("Yes"), dialog[open] button:has-text("Delete")');if(b){await b.click();return}}await page.waitForTimeout(150)}throw new Error('confirmation not shown')};
 // ---- 1. several tickets at once ----
 await f.click('#bks');check(await f.isVisible('#bkb'),'☑ Select shows the action bar and checkboxes');
 const boxes=await f.$$('[data-bk]');await boxes[0].click();await boxes[2].click({modifiers:['Shift']});
 check((await f.textContent('#bkn')).startsWith('3'),'tick one row + Shift-click another selects the range (3 tickets)');
 await f.selectOption('#bka','status');await f.selectOption('#bkv','ready');
 const sel=await f.$$eval('[data-bk]:checked',e=>e.map(x=>x.dataset.bk));
 await page.screenshot({path:path.join(OUT,'1-select-and-action.png')});
 await f.click('#bkgo');await yes();await page.waitForTimeout(600);
 let db=await DB();check(sel.every(c=>db.tickets[c].status==='ready'),`Set → status "Ready for pickup" on ${sel.join(', ')}`);
 check(Object.keys(db.tickets).filter(c=>!sel.includes(c)).every(c=>db.tickets[c].status!=='ready'),'tickets that were not ticked are unchanged');
 await f.click('#bkall');const all=(await f.$$('[data-bk]')).length;check((await f.textContent('#bkn')).startsWith(String(all)),`Select all ticks every ticket in the list (${all})`);
 await f.selectOption('#bka','tech');await f.selectOption('#bkv','t1');await f.click('#bkgo');await yes();await page.waitForTimeout(600);
 db=await DB();check(Object.values(db.tickets).every(t=>t.techId==='t1'&&t.techName==='Yacine'),'Assign technician → Yacine on all tickets');
 await f.click('#bkclr');check((await f.textContent('#bkn')).startsWith('0'),'Clear unticks everything');
 // hand over one after another
 const two=await f.$$('[data-bk]');await two[0].click();await two[1].click();await f.selectOption('#bka','ho');await f.click('#bkgo');await page.waitForTimeout(400);
 check(await f.isVisible('#hod')&&(await f.textContent('#hoq b'))==='1/2','Hand over opens the first of 2 tickets (1/2)');
 await f.click('#hodx');await page.waitForTimeout(500);check(await f.isVisible('#hod')&&(await f.textContent('#hoq b'))==='2/2','closing it opens the next one (2/2)');
 await f.click('#hoqx');await page.waitForTimeout(300);check(!(await f.isVisible('#hod')),'Stop ends the hand over queue');
 await f.click('#bks');check(!(await f.isVisible('#bkb')),'☑ Select again hides the bar');
 // ---- 2. default phone number ----
 await f.evaluate(()=>document.getElementById('nw').click());await f.click('#tkdb');await f.fill('#dfPhone','0000000000');await f.click('#dfSave');
 check(await f.$eval('#fph',e=>!e.required&&e.placeholder.includes('0000000000')),'saved default phone: phone field no longer required, shows the default');
 await f.fill('#ffn','Nadia');await f.fill('#fmodel','Nokia G20');await f.fill('#fprob','Screen');await f.press('#fprob','Enter');
 await page.screenshot({path:path.join(OUT,'2-new-ticket-default-phone.png')});
 const before=Object.keys((await DB()).tickets);await f.click('#sv');await page.waitForTimeout(900);
 db=await DB();const nk=Object.keys(db.tickets).find(k=>!before.includes(k)),nt=nk&&db.tickets[nk];
 check(nt&&nt.phone==='0000000000'&&nt.noPhone===true,`ticket saved with the default phone (${nk})`);
 check(!(db.trackingPhone&&db.trackingPhone['0000000000']),'default phone is not added to the public phone tracking list');
 check(nt&&!nt.customerId&&Object.keys(db.customers).length===1,'no client file is created for the default phone');
 await f.fill('#s','Nadia');await page.waitForTimeout(300);
 check(!(await f.$('[data-wa="'+nk+'"]')),'no WhatsApp button for a ticket with the default phone');
 await page.screenshot({path:path.join(OUT,'3-list-default-phone.png')});
 // ---- 3. a real phone still creates the client file ----
 await f.fill('#s','');await f.evaluate(()=>document.getElementById('nw').click());await f.fill('#ffn','Omar');await f.fill('#fph','0790123456');await f.fill('#fprob','Battery');await f.press('#fprob','Enter');
 const b2=Object.keys((await DB()).tickets);await f.click('#sv');await page.waitForTimeout(900);db=await DB();
 const ok=Object.keys(db.tickets).find(k=>!b2.includes(k));check(ok&&db.tickets[ok].noPhone===false&&!!db.tickets[ok].customerId&&db.trackingPhone&&db.trackingPhone['0790123456'],'a real phone still creates a client file and phone tracking');
 check(!errs.length,'no JavaScript errors'+(errs.length?': '+errs.join(' | '):''));
 await b.close();console.log(failures?`\n${failures} check(s) FAILED`:'\nAll checks passed');process.exit(failures?1:0)})().catch(e=>{console.error('ERROR',e.message);process.exit(2)});
