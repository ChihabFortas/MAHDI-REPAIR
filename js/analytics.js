/* Analytics engine: turns raw shop data into a written report + early-warning alerts (EN / FR / AR).
   Pure functions, no imports. Used by analytics.html (browser). */
export const AN_DEF={receivedHrs:4,diagnoseHrs:24,approvalHrs:48,partsDays:5,repairDays:3,readyDays:5,orderHours:24,dropPct:20,slowPct:30};
const num=v=>Number(v)||0,pad=n=>String(n).padStart(2,'0');
const ms=x=>!x?0:x.toMillis?x.toMillis():x.seconds!==undefined?x.seconds*1000:x._seconds!==undefined?x._seconds*1000:+x||0;
const ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
export const monthKey=d=>d.getFullYear()+'-'+pad(d.getMonth()+1);
export const prevMonth=k=>{const [y,m]=k.split('-').map(Number),d=new Date(y,m-2,1);return monthKey(d)};
const inMonth=(t,k)=>{if(!t)return false;const d=new Date(t);return monthKey(d)===k};
const HR=3600e3,DAY=24*HR;
/* ---- messages: [en, fr, ar] ---- */
const M={
 up:['up {p}%','en hausse de {p}%','بارتفاع {p}%'],down:['down {p}%','en baisse de {p}%','بانخفاض {p}%'],flat:['about the same','stable','دون تغيير يُذكر'],
 vs:[' compared with last month',' par rapport au mois dernier',' مقارنة بالشهر الماضي'],
 sNone:['No sales were recorded this month.','Aucune vente enregistrée ce mois-ci.','لم تُسجَّل أي مبيعات هذا الشهر.'],
 s1:['Sales brought in {rev} from {n} delivery notes, {chg}{vs}.','Les ventes ont rapporté {rev} sur {n} bons de livraison, {chg}{vs}.','حققت المبيعات {rev} من {n} وصل تسليم، {chg}{vs}.'],
 s2:['The average sale is {avg}. Customers have paid {rate}% of the amount; {open} is still owed to you.','La vente moyenne est de {avg}. Les clients ont payé {rate}% du montant ; {open} reste dû.','متوسط البيع {avg}. دفع الزبائن {rate}% من المبلغ، ويبقى {open} مستحقاً لك.'],
 s3:['Best sellers: {top}.','Meilleures ventes : {top}.','الأكثر مبيعاً: {top}.'],
 s4:['The margin on items with a known cost is about {m}%.','La marge sur les articles dont le coût est connu est d’environ {m}%.','هامش الربح على المواد المعروفة التكلفة حوالي {m}%.'],
 rNone:['No purchases were received this month.','Aucun achat reçu ce mois-ci.','لم تُسجَّل أي مشتريات هذا الشهر.'],
 r1:['You received goods worth {tot} in {n} receipts, {chg}{vs}.','Vous avez reçu des marchandises pour {tot} en {n} bons de réception, {chg}{vs}.','استلمتَ بضاعة بقيمة {tot} في {n} وصل استلام، {chg}{vs}.'],
 r2:['{open} of this is not paid yet to suppliers{who}.','{open} reste à payer aux fournisseurs{who}.','{open} لم يُسدَّد بعد للموردين{who}.'],
 r3:['Most of the buying went to {sup}.','L’essentiel des achats est allé chez {sup}.','أغلب المشتريات كانت من {sup}.'],
 pNone:['No repair activity was recorded this month.','Aucune activité de réparation ce mois-ci.','لا يوجد نشاط إصلاح هذا الشهر.'],
 p1:['{rc} devices were received for repair ({chg}{vs}) and {dl} were handed back, bringing in {rev}.','{rc} appareils ont été reçus en réparation ({chg}{vs}) et {dl} ont été rendus, pour {rev}.','تم استلام {rc} جهازاً للإصلاح ({chg}{vs}) وتسليم {dl} جهازاً، بإيرادات {rev}.'],
 p2:['A device takes on average {t} from reception to ready{cmp}.','Un appareil prend en moyenne {t} entre la réception et la fin de réparation{cmp}.','يستغرق الجهاز في المتوسط {t} من الاستلام إلى الجاهزية{cmp}.'],
 p3:['The slowest step is “{st}” ({t} on average). This is where devices wait the most.','L’étape la plus lente est « {st} » ({t} en moyenne). C’est là que les appareils attendent le plus.','أبطأ مرحلة هي «{st}» ({t} في المتوسط). هنا ينتظر الجهاز أكثر.'],
 p4:['The most common problems: {top}. Most repaired models: {mod}.','Pannes les plus fréquentes : {top}. Modèles les plus réparés : {mod}.','أكثر الأعطال شيوعاً: {top}. أكثر الموديلات إصلاحاً: {mod}.'],
 p5:['{nr}% of devices went back without repair (diagnosis only). Customer rating: {rt}.','{nr}% des appareils sont repartis sans réparation (diagnostic seul). Note clients : {rt}.','{nr}% من الأجهزة عادت دون إصلاح (تشخيص فقط). تقييم الزبائن: {rt}.'],
 oNone:['No online orders this month.','Aucune commande en ligne ce mois-ci.','لا توجد طلبات من المتجر الإلكتروني هذا الشهر.'],
 o1:['The online shop received {n} orders worth {rev}, {chg}{vs}. {c} were cancelled.','La boutique en ligne a reçu {n} commandes pour {rev}, {chg}{vs}. {c} annulées.','استقبل المتجر الإلكتروني {n} طلباً بقيمة {rev}، {chg}{vs}. أُلغي منها {c}.'],
 cmpU:[', slower than last month ({p}%)',', plus lent que le mois dernier ({p}%)',' وهو أبطأ من الشهر الماضي ({p}%)'],cmpD:[', faster than last month',', plus rapide que le mois dernier',' وهو أسرع من الشهر الماضي'],
 /* alerts */
 aRec:['{n} device(s) waited more than {h} h in Reception without being diagnosed ({codes}).','{n} appareil(s) attendent depuis plus de {h} h à la réception sans diagnostic ({codes}).','{n} جهاز ينتظر أكثر من {h} ساعة في الاستقبال دون تشخيص ({codes}).'],
 rRec:['Assign them to a technician now; reception is the first impression of the shop.','Affectez-les à un technicien maintenant ; la réception est la première impression du magasin.','أسنِدها لفني الآن؛ فالاستقبال هو الانطباع الأول عن المحل.'],
 aDia:['{n} device(s) have been in Diagnose for more than {h} h ({codes}).','{n} appareil(s) sont en diagnostic depuis plus de {h} h ({codes}).','{n} جهاز في مرحلة التشخيص منذ أكثر من {h} ساعة ({codes}).'],
 rDia:['Ask the technician what is blocking the diagnosis; if it is too difficult, give it to a more experienced technician.','Demandez au technicien ce qui bloque le diagnostic ; si c’est trop difficile, confiez-le à un technicien plus expérimenté.','اسأل الفني عمّا يعطّل التشخيص؛ وإن كان صعباً فسلّمه لفني أكثر خبرة.'],
 aApp:['{n} quote(s) are waiting for customer approval for more than {h} h ({codes}).','{n} devis attendent l’accord du client depuis plus de {h} h ({codes}).','{n} عرض سعر ينتظر موافقة الزبون منذ أكثر من {h} ساعة ({codes}).'],
 rApp:['Call or message these customers today; every day of waiting delays the repair and blocks space and cash.','Appelez ou écrivez à ces clients aujourd’hui ; chaque jour d’attente retarde la réparation et bloque place et trésorerie.','اتصل بهؤلاء الزبائن اليوم؛ كل يوم انتظار يؤخر الإصلاح ويشغل مكاناً وسيولة.'],
 aPar:['{n} device(s) have been waiting for parts for more than {d} days ({codes}).','{n} appareil(s) attendent des pièces depuis plus de {d} jours ({codes}).','{n} جهاز ينتظر قطع غيار منذ أكثر من {d} أيام ({codes}).'],
 rPar:['Chase the supplier or switch to another one, and warn the customers about the delay. Keep fast-moving parts in stock.','Relancez le fournisseur ou changez-en, et prévenez les clients du retard. Gardez en stock les pièces les plus demandées.','تابع المورّد أو غيّره، وأخبر الزبائن بالتأخير. وأبقِ القطع الأكثر طلباً في المخزون.'],
 aRep:['{n} device(s) have been in Repair for more than {d} days ({codes}).','{n} appareil(s) sont en réparation depuis plus de {d} jours ({codes}).','{n} جهاز في مرحلة الإصلاح منذ أكثر من {d} أيام ({codes}).'],
 rRep:['Focus on these first: check what is holding each one (part, difficulty, technician busy) and decide today.','Traitez-les en priorité : vérifiez ce qui bloque chacun (pièce, difficulté, technicien occupé) et décidez aujourd’hui.','ركّز عليها أولاً: تحقق مما يعطّل كل جهاز (قطعة، صعوبة، انشغال الفني) وقرّر اليوم.'],
 aRdy:['{n} repaired device(s) are ready but not collected for more than {d} days ({codes}).','{n} appareil(s) réparés sont prêts mais non récupérés depuis plus de {d} jours ({codes}).','{n} جهاز مُصلَح وجاهز لم يُستلم منذ أكثر من {d} أيام ({codes}).'],
 rRdy:['Remind the customers (call / WhatsApp) and mention storage policy; unpaid balance is cash waiting to come in.','Relancez les clients (appel / WhatsApp) et rappelez la politique de stockage ; le solde impayé est de la trésorerie en attente.','ذكّر الزبائن (اتصال / واتساب) وبسياسة التخزين؛ فالرصيد غير المدفوع سيولة تنتظر الدخول.'],
 aLate:['{n} open ticket(s) are past their promised delivery date ({codes}).','{n} ticket(s) ouvert(s) ont dépassé la date de livraison promise ({codes}).','{n} تذكرة مفتوحة تجاوزت تاريخ التسليم الموعود ({codes}).'],
 rLate:['Contact these customers with a new date before they call you; then review the estimate settings (levels / buffer).','Contactez ces clients avec une nouvelle date avant qu’ils n’appellent ; puis revoyez les réglages d’estimation (niveaux / marge).','تواصل مع هؤلاء الزبائن بموعد جديد قبل أن يتصلوا بك، ثم راجع إعدادات التقدير (المستويات / الهامش).'],
 aOrd:['{n} online order(s) are waiting for confirmation for more than {h} h ({codes}).','{n} commande(s) en ligne attendent confirmation depuis plus de {h} h ({codes}).','{n} طلب إلكتروني ينتظر التأكيد منذ أكثر من {h} ساعة ({codes}).'],
 rOrd:['Confirm or call the customer now. Slow answers lose online sales.','Confirmez ou appelez le client maintenant. Les réponses lentes font perdre des ventes.','أكّد أو اتصل بالزبون الآن؛ البطء في الرد يضيّع المبيعات.'],
 aTech:['{tech} has {n} open devices, much more than the other technicians (average {avg}).','{tech} a {n} appareils ouverts, bien plus que les autres techniciens (moyenne {avg}).','لدى {tech} عدد {n} جهازاً مفتوحاً، أكثر بكثير من بقية الفنيين (المتوسط {avg}).'],
 rTech:['Move some tickets to a technician with less work.','Transférez quelques tickets à un technicien moins chargé.','انقل بعض التذاكر إلى فني لديه عمل أقل.'],
 aSal:['Sales are {p}% lower than last month.','Les ventes sont inférieures de {p}% à celles du mois dernier.','المبيعات أقل بـ {p}% من الشهر الماضي.'],
 rSal:['Check what changed (stock-outs, prices, opening hours) and run a promotion on your best sellers.','Vérifiez ce qui a changé (ruptures, prix, horaires) et lancez une promotion sur vos meilleures ventes.','افحص ما تغيّر (نفاد المخزون، الأسعار، الدوام) وأطلق عرضاً ترويجياً على الأكثر مبيعاً.'],
 aSlow:['The “{st}” step became {p}% slower than last month.','L’étape « {st} » est devenue {p}% plus lente que le mois dernier.','مرحلة «{st}» أصبحت أبطأ بـ {p}% عن الشهر الماضي.'],
 rSlow:['Look at the tickets that spent the longest there and fix the cause (people, parts, process).','Regardez les tickets qui y ont passé le plus de temps et corrigez la cause (personnes, pièces, processus).','افحص التذاكر التي قضت وقتاً أطول هناك وعالج السبب (أشخاص، قطع، إجراءات).'],
 aCol:['Only {r}% of this month’s sales were paid; {open} is owed by customers.','Seulement {r}% des ventes du mois sont payées ; {open} est dû par les clients.','تم تحصيل {r}% فقط من مبيعات الشهر؛ ويستحق على الزبائن {open}.'],
 rCol:['Follow up the biggest debtors and limit credit for slow payers.','Relancez les plus gros débiteurs et limitez le crédit pour les mauvais payeurs.','تابع أكبر المدينين وقلّل الائتمان للزبائن المتأخرين في السداد.'],
 aNR:['{p}% of the devices went back without repair; this may mean quotes are too high or diagnosis is not convincing.','{p}% des appareils sont repartis sans réparation ; les devis sont peut-être trop élevés ou le diagnostic peu convaincant.','{p}% من الأجهزة عادت دون إصلاح؛ قد تكون الأسعار مرتفعة أو التشخيص غير مُقنع.'],
 rNR:['Review the prices of the most refused repairs and explain the quote better.','Revoyez les prix des réparations les plus refusées et expliquez mieux le devis.','راجع أسعار الإصلاحات الأكثر رفضاً واشرح العرض للزبون بشكل أفضل.'],
 aOK:['No urgent problems found. Everything is moving normally.','Aucun problème urgent détecté. Tout avance normalement.','لا توجد مشاكل عاجلة. كل شيء يسير بشكل طبيعي.'],
 /* ideas */
 iTop:['“{p}” is your most common repair ({s}% of tickets). Keep its parts in stock, advertise a fixed price and a quick turnaround.','« {p} » est votre réparation la plus fréquente ({s}% des tickets). Gardez ses pièces en stock, affichez un prix fixe et un délai rapide.','«{p}» هو أكثر إصلاح عندك ({s}% من التذاكر). وفّر قطعه في المخزون وأعلن عن سعر ثابت وسرعة في التنفيذ.'],
 iUp:['After every repair offer a case, screen protector or charger. Accessories have high margin and are easy to add at hand-over.','Après chaque réparation, proposez une coque, un verre trempé ou un chargeur. Les accessoires ont une bonne marge et s’ajoutent facilement à la remise.','بعد كل إصلاح اعرض غلافاً أو واقي شاشة أو شاحناً؛ فهامش الإكسسوارات مرتفع وسهل إضافته عند التسليم.'],
 iOn:['Online sales are low. Share the shop link on your social pages and on every receipt (QR), and show wholesale and retail prices clearly.','Les ventes en ligne sont faibles. Partagez le lien de la boutique sur vos réseaux et sur chaque reçu (QR), et affichez clairement les prix.','المبيعات الإلكترونية ضعيفة. شارك رابط المتجر على صفحاتك وعلى كل وصل (QR) وأظهر الأسعار بوضوح.'],
 iRt:['Ask every customer to rate the service at hand-over and thank those who give 5 stars; reviews bring new customers.','Demandez une note à chaque client à la remise et remerciez ceux qui donnent 5 étoiles ; les avis attirent de nouveaux clients.','اطلب من كل زبون تقييم الخدمة عند التسليم واشكر من يعطي 5 نجوم؛ فالتقييمات تجلب زبائن جدداً.'],
 iDebt:['Offer a small discount for cash payment and keep credit for regular customers only.','Offrez une petite remise pour le paiement comptant et réservez le crédit aux clients réguliers.','قدّم خصماً بسيطاً للدفع النقدي واحصر الائتمان في الزبائن المنتظمين.'],
 iBuy:['A large part of your purchases is unpaid. Negotiate longer payment terms or pay the biggest invoices first to keep cash flow safe.','Une grande partie de vos achats est impayée. Négociez des délais ou payez d’abord les plus grosses factures pour sécuriser la trésorerie.','جزء كبير من مشترياتك غير مدفوع. فاوض على مهلة أطول أو سدّد أكبر الفواتير أولاً لحماية السيولة.'],
 st:{received:['Reception','Réception','الاستقبال'],diagnose:['Diagnose','Diagnostic','التشخيص'],awaiting_approval:['Waiting approval','Attente d’accord','انتظار الموافقة'],waiting_parts:['Waiting parts','Attente de pièces','انتظار القطع'],repair:['Repair','Réparation','الإصلاح'],ready:['Ready','Prêt','جاهز']}
};
const LI={en:0,fr:1,ar:2};
const fill=(s,v)=>s.replace(/\{(\w+)\}/g,(_,k)=>v[k]==null?'':v[k]);
const sum=(a,f)=>a.reduce((s,x)=>s+num(f(x)),0);
const top=(arr,f,n=3)=>{const m={};arr.forEach(x=>{const k=f(x);if(k)m[k]=(m[k]||0)+1});return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,n)};
export function analyze(data,opt){opt=opt||{};const lang=LI[opt.lang]!==undefined?opt.lang:'en',I=LI[lang],now=opt.now?new Date(opt.now):new Date(),nowMs=now.getTime(),cfg={...AN_DEF,...(opt.cfg||{})},
 mk=opt.month||monthKey(now),pk=prevMonth(mk),money=opt.money||(n=>Math.round(n).toLocaleString('en-US')),x=(k,v)=>fill(M[k][I],v||{}),tr=opt.tr||(s=>s),
 stN=s=>(M.st[s]||[s,s,s])[I],
 dur=h=>h<1?Math.max(1,Math.round(h*60))+(I===2?' دقيقة':' min'):h<48?(Math.round(h*10)/10)+(I===2?' ساعة':' h'):(Math.round(h/24*10)/10)+(I===2?' يوم':I===1?' j':' days'),
 chg=(a,b)=>{if(!b)return x('flat');const p=Math.round((a-b)/b*100);if(Math.abs(p)<3)return x('flat');return p>0?x('up',{p}):x('down',{p:-p})},
 pc=(a,b)=>b?Math.round((a-b)/b*100):0;
 const DL=(data.deliveries||[]).filter(d=>!['cancelled','draft','held'].includes(d.status)),RV=data.receivings||[],OR=data.orders||[],TK=data.tickets||[];
 const isRep=d=>d.source==='repair'||d.channel==='repair';
 const calc=k=>{const dl=DL.filter(d=>String(d.date||'').startsWith(k)&&!isRep(d)),rev=sum(dl,d=>d.total),paid=sum(dl,d=>d.paid),lines=dl.flatMap(d=>d.lines||[]),prod={};
  lines.forEach(l=>{const n=l.name||l.sku;if(n)prod[n]=(prod[n]||0)+num(l.qty)*num(l.price)});
  const wc=lines.filter(l=>num(l.cost)>0),wrev=sum(wc,l=>num(l.qty)*num(l.price)),wcost=sum(wc,l=>num(l.qty)*num(l.cost));
  const rv=RV.filter(r=>String(r.date||'').startsWith(k)),sup={};rv.forEach(r=>{if(r.who)sup[r.who]=(sup[r.who]||0)+num(r.total)});
  const rec=TK.filter(t=>String(t.receivedDate||'').startsWith(k)),dv=TK.filter(t=>t.status==='returned'&&inMonth(ms(t.handover&&t.handover.at)||ms(t.updatedAt),k)),
   dvOk=dv.filter(t=>!t.noRepair&&!(t.history||[]).some(h=>h.s==='no_repair')),
   turn=[],stg={};
  dv.forEach(t=>{const h=(t.history||[]).slice().sort((a,b)=>a.t-b.t);if(h.length<2)return;const end=h.find(e=>e.s==='ready'||e.s==='no_repair');if(end&&end.t>h[0].t)turn.push((end.t-h[0].t)/HR)});
  TK.forEach(t=>{const h=(t.history||[]).slice().sort((a,b)=>a.t-b.t);for(let i=0;i<h.length-1;i++){if(!inMonth(h[i].t,k))continue;const s=h[i].s;if(s==='returned'||s==='ready'||s==='no_repair')continue;(stg[s]=stg[s]||[]).push((h[i+1].t-h[i].t)/HR)}});
  const stAvg={};Object.keys(stg).forEach(s=>stAvg[s]=sum(stg[s],v=>v)/stg[s].length);
  const od=OR.filter(o=>inMonth(ms(o.createdAt),k)),odOk=od.filter(o=>o.status!=='cancelled');
  const rated=dv.filter(t=>t.rating);
  return {rev,n:dl.length,paid,prod:Object.entries(prod).sort((a,b)=>b[1]-a[1]).slice(0,3).map(e=>e[0]),margin:wrev?Math.round((wrev-wcost)/wrev*100):null,
   buy:sum(rv,r=>r.total),buyN:rv.length,buyOpen:sum(rv,r=>num(r.total)-num(r.paid)),topSup:Object.entries(sup).sort((a,b)=>b[1]-a[1])[0],
   rc:rec.length,dl:dv.length,rrev:sum(dvOk,t=>num(t.price)),turn:turn.length?sum(turn,v=>v)/turn.length:null,stAvg,probs:top(rec,t=>t.problem),mods:top(rec,t=>t.model),
   nr:dv.length?Math.round((dv.length-dvOk.length)/dv.length*100):0,rating:rated.length?Math.round(sum(rated,t=>t.rating)/rated.length*10)/10:null,
   on:odOk.length,onRev:sum(odOk,o=>o.total),onC:od.length-odOk.length}};
 const c=calc(mk),p=calc(pk);
 /* ---------- sections ---------- */
 const S=[];const add=(key,title,ps)=>S.push({key,title:title[I],ps:ps.filter(Boolean)});
 const sp=[];if(!c.n)sp.push(x('sNone'));else{sp.push(x('s1',{rev:money(c.rev),n:c.n,chg:chg(c.rev,p.rev),vs:M.vs[I]}));
  sp.push(x('s2',{avg:money(c.rev/c.n),rate:c.rev?Math.round(c.paid/c.rev*100):100,open:money(Math.max(0,c.rev-c.paid))}));
  if(c.prod.length)sp.push(x('s3',{top:c.prod.join(I===2?'، ':', ')}));if(c.margin!==null)sp.push(x('s4',{m:c.margin}))}
 add('sales',['Sales','Ventes','المبيعات'],sp);
 const rp=[];if(!c.buyN)rp.push(x('rNone'));else{rp.push(x('r1',{tot:money(c.buy),n:c.buyN,chg:chg(c.buy,p.buy),vs:M.vs[I]}));
  if(c.buyOpen>0.5)rp.push(x('r2',{open:money(c.buyOpen),who:''}));if(c.topSup)rp.push(x('r3',{sup:c.topSup[0]}))}
 add('receiving',['Receiving & purchases','Réception & achats','الاستلام والمشتريات'],rp);
 const wp=[];if(!c.rc&&!c.dl)wp.push(x('pNone'));else{wp.push(x('p1',{rc:c.rc,chg:chg(c.rc,p.rc),vs:M.vs[I],dl:c.dl,rev:money(c.rrev)}));
  if(c.turn!==null)wp.push(x('p2',{t:dur(c.turn),cmp:p.turn?(c.turn>p.turn*1.1?x('cmpU',{p:pc(c.turn,p.turn)}):c.turn<p.turn*0.9?x('cmpD'):''):''}));
  const sl=Object.entries(c.stAvg).sort((a,b)=>b[1]-a[1])[0];if(sl&&sl[1]>=1)wp.push(x('p3',{st:stN(sl[0]),t:dur(sl[1])}));
  if(c.probs.length)wp.push(x('p4',{top:c.probs.map(e=>tr(e[0])+' ('+e[1]+')').join(I===2?'، ':', '),mod:c.mods.map(e=>e[0]).join(I===2?'، ':', ')}));
  if(c.dl)wp.push(x('p5',{nr:c.nr,rt:c.rating!==null?c.rating+'/5':'–'}))}
 add('repairs',['Repairs','Réparations','الإصلاحات'],wp);
 const op=[];if(!c.on&&!c.onC)op.push(x('oNone'));else op.push(x('o1',{n:c.on,rev:money(c.onRev),chg:chg(c.onRev,p.onRev),vs:M.vs[I],c:c.onC}));
 add('online',['Online shop','Boutique en ligne','المتجر الإلكتروني'],op);
 /* ---------- alerts (live state, not tied to the month) ---------- */
 const A=[],ago=t=>(nowMs-t)/HR,open=TK.filter(t=>t.status&&t.status!=='returned'),lastT=t=>{const h=(t.history||[]).slice().sort((a,b)=>a.t-b.t);return h.length?h[h.length-1].t:ms(t.createdAt)};
 const stuck=(st,hrs,ka,kr,args)=>{const L=open.filter(t=>t.status===st&&lastT(t)&&ago(lastT(t))>hrs).sort((a,b)=>lastT(a)-lastT(b));
  if(L.length)A.push({sev:L.length>=5||ago(lastT(L[0]))>hrs*3?'high':'med',area:'repairs',text:x(ka,{n:L.length,h:hrs,d:Math.round(hrs/24),codes:L.slice(0,4).map(t=>t.code).join(', ')}),rec:x(kr),href:'reception.html',codes:L.map(t=>t.code)})};
 stuck('received',cfg.receivedHrs,'aRec','rRec');stuck('diagnose',cfg.diagnoseHrs,'aDia','rDia');stuck('awaiting_approval',cfg.approvalHrs,'aApp','rApp');
 stuck('waiting_parts',cfg.partsDays*24,'aPar','rPar');stuck('repair',cfg.repairDays*24,'aRep','rRep');stuck('ready',cfg.readyDays*24,'aRdy','rRdy');
 const today=ymd(now),late=open.filter(t=>t.estDelivery&&t.estDelivery<today&&!['ready','no_repair'].includes(t.status));
 if(late.length)A.push({sev:late.length>=5?'high':'med',area:'repairs',text:x('aLate',{n:late.length,codes:late.slice(0,4).map(t=>t.code).join(', ')}),rec:x('rLate'),href:'reception.html',codes:late.map(t=>t.code)});
 const wo=OR.filter(o=>o.status==='new'&&ms(o.createdAt)&&ago(ms(o.createdAt))>cfg.orderHours);
 if(wo.length)A.push({sev:'high',area:'online',text:x('aOrd',{n:wo.length,h:cfg.orderHours,codes:wo.slice(0,4).map(o=>o.code).join(', ')}),rec:x('rOrd'),href:'orders.html'});
 const tc={};open.filter(t=>t.techName&&['diagnose','repair','waiting_parts'].includes(t.status)).forEach(t=>tc[t.techName]=(tc[t.techName]||0)+1);
 const tn=Object.entries(tc);if(tn.length>=2){const avg=sum(tn,e=>e[1])/tn.length,mx=tn.sort((a,b)=>b[1]-a[1])[0];if(mx[1]>=4&&mx[1]>avg*1.7)A.push({sev:'med',area:'team',text:x('aTech',{tech:mx[0],n:mx[1],avg:Math.round(avg*10)/10}),rec:x('rTech'),href:'tasks.html'})}
 if(p.rev>0&&c.rev>0&&pc(c.rev,p.rev)<=-cfg.dropPct&&now.getDate()>=20)A.push({sev:'med',area:'sales',text:x('aSal',{p:-pc(c.rev,p.rev)}),rec:x('rSal'),href:'salesdash.html'});
 Object.keys(c.stAvg).forEach(s=>{if(p.stAvg[s]&&c.stAvg[s]>=2&&pc(c.stAvg[s],p.stAvg[s])>=cfg.slowPct)A.push({sev:'med',area:'repairs',text:x('aSlow',{st:stN(s),p:pc(c.stAvg[s],p.stAvg[s])}),rec:x('rSlow'),href:'techreport.html'})});
 if(c.n>=5&&c.rev&&c.paid/c.rev<0.6)A.push({sev:'med',area:'sales',text:x('aCol',{r:Math.round(c.paid/c.rev*100),open:money(c.rev-c.paid)}),rec:x('rCol'),href:'crm.html'});
 if(c.dl>=5&&c.nr>=30)A.push({sev:'low',area:'repairs',text:x('aNR',{p:c.nr}),rec:x('rNR'),href:'reception.html'});
 const ord={high:0,med:1,low:2};A.sort((a,b)=>ord[a.sev]-ord[b.sev]);
 if(!A.length)A.push({sev:'ok',area:'all',text:x('aOK'),rec:'',href:''});
 /* ---------- ideas ---------- */
 const I2=[];if(c.probs[0]&&c.rc>=5&&c.probs[0][1]/c.rc>=0.2)I2.push(x('iTop',{p:tr(c.probs[0][0]),s:Math.round(c.probs[0][1]/c.rc*100)}));
 if(c.dl)I2.push(x('iUp'));if(c.rating===null&&c.dl)I2.push(x('iRt'));if(c.on<3)I2.push(x('iOn'));
 if(c.rev&&c.paid/c.rev<0.85&&c.n>=5)I2.push(x('iDebt'));if(c.buy&&c.buyOpen/c.buy>0.5)I2.push(x('iBuy'));
 /* ---------- compact facts for the AI advisor ---------- */
 const facts={month:mk,previousMonth:pk,sales:{revenue:Math.round(c.rev),notes:c.n,previousRevenue:Math.round(p.rev),collectedPct:c.rev?Math.round(c.paid/c.rev*100):null,topProducts:c.prod,marginPct:c.margin},
  receiving:{purchases:Math.round(c.buy),receipts:c.buyN,previous:Math.round(p.buy),unpaid:Math.round(c.buyOpen),topSupplier:c.topSup?c.topSup[0]:null},
  repairs:{received:c.rc,previousReceived:p.rc,handedBack:c.dl,revenue:Math.round(c.rrev),avgTurnaroundHours:c.turn!==null?Math.round(c.turn*10)/10:null,previousTurnaroundHours:p.turn!==null?Math.round(p.turn*10)/10:null,
   avgHoursPerStage:Object.fromEntries(Object.entries(c.stAvg).map(([k,v])=>[k,Math.round(v*10)/10])),topProblems:c.probs,topModels:c.mods,noRepairPct:c.nr,rating:c.rating,
   openNow:Object.fromEntries(Object.entries(open.reduce((m,t)=>(m[t.status]=(m[t.status]||0)+1,m),{})))},
  online:{orders:c.on,revenue:Math.round(c.onRev),previousRevenue:Math.round(p.onRev),cancelled:c.onC},alerts:A.filter(a=>a.sev!=='ok').map(a=>a.text)};
 return {month:mk,sections:S,alerts:A,ideas:I2,facts,cur:c,prev:p}}
