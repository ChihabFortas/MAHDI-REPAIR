// Settings (theme, language, currency) + translation. Imported by every page.
const KEY='rd_settings',DEF={lang:'en',theme:'light',skin:'modern',easy:false,fs:'m',accent:'',cur:{sym:'$',pos:'before',dec:2}};
let st={};try{st=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
export const S={...DEF,...st};S.cur={...DEF.cur,...(st.cur||{})};
export const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
export const money=n=>{const v=Number(n)||0,d=S.cur.dec,s=v.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});return S.cur.pos==='before'?S.cur.sym+s:s+' '+S.cur.sym};
const THEMES={light:{},calm:{'--bg':'#f6f2ea','--card':'#fffdf9','--ink':'#26363b','--mut':'#6b7a7f','--line':'#e6dfd2','--ac':'#2a8f7f','--hdr':'#2f4a4f'},dark:{'--bg':'#0f171d','--card':'#18232b','--ink':'#e8eef2','--mut':'#93a4b0','--line':'#2b3a45','--ac':'#2aa5a5','--hdr':'#0a1014','--bad':'#ff8a80'}};
export function apply(){const r=document.documentElement;['--bg','--card','--ink','--mut','--line','--ac','--hdr','--bad'].forEach(k=>r.style.removeProperty(k));
 Object.entries(THEMES[S.theme]||{}).forEach(([k,v])=>r.style.setProperty(k,v));if(S.accent)r.style.setProperty('--ac',S.accent);
 r.dataset.theme=S.theme;r.dataset.skin=S.skin;r.dataset.easy=S.easy?'1':'0';r.dataset.fs=S.fs;r.lang=S.lang;r.dir=S.lang==='ar'?'rtl':'ltr'}
apply();
export const setLang=l=>{S.lang=l;save();location.reload()};
const css=`html[data-fs=s] body{font-size:13.5px!important}html[data-fs=l] body{font-size:17px!important}
html[dir=rtl] th,html[dir=rtl] td{text-align:right!important}html[dir=rtl] body{font-family:Tahoma,"Segoe UI",system-ui,sans-serif}
html[data-easy="1"] body{font-size:17px!important;line-height:1.6}
html[data-easy="1"] main button,html[data-easy="1"] main input,html[data-easy="1"] main select,html[data-easy="1"] dialog input,html[data-easy="1"] dialog select,html[data-easy="1"] dialog button{padding:12px 15px!important;border-radius:12px!important}
html[data-easy="1"] .card,html[data-easy="1"] .tbl,html[data-easy="1"] .stat,html[data-easy="1"] .pr,html[data-easy="1"] .pt{border-radius:18px!important}
html[data-easy="1"] th,html[data-easy="1"] td{padding:15px 14px!important}html[data-easy="1"] .stat b{font-size:36px!important}html[data-easy="1"] .stats{gap:14px!important}
html[data-easy="1"] .tbl table{min-width:0!important}html[data-easy="1"] .tbl th:nth-child(3),html[data-easy="1"] .tbl td:nth-child(3),html[data-easy="1"] .tbl th:nth-child(7),html[data-easy="1"] .tbl td:nth-child(7){display:none}
html[data-theme=dark] main input,html[data-theme=dark] main select,html[data-theme=dark] main textarea,html[data-theme=dark] dialog input,html[data-theme=dark] dialog select,html[data-theme=dark] dialog textarea,html[data-theme=dark] #login input,html[data-theme=dark] main button:not(.p),html[data-theme=dark] dialog button:not(.p),html[data-theme=dark] .bt{background:var(--card);color:var(--ink);border-color:var(--line)}
html[data-theme=dark] .stat,html[data-theme=dark] .pr,html[data-theme=dark] .pt,html[data-theme=dark] .kp div,html[data-theme=dark] .card,html[data-theme=dark] .tbl,html[data-theme=dark] dialog,html[data-theme=dark] #login{background:var(--card);color:var(--ink)}
html[data-theme=dark] th{background:#1f2c35!important;color:var(--mut)}html[data-theme=dark] .bd{background:#26343e;color:var(--ink)}html[data-theme=dark] .tabs button.on{color:#fff}
html[data-skin=pme] body{font:13px/1.35 Tahoma,"Segoe UI",Arial,sans-serif!important;background:#fff;padding-bottom:28px}
html[data-skin=pme] header{background:#f3f3f3!important;color:#111!important;padding:4px 10px!important;border-bottom:1px solid #b9b9b9;position:static!important}
html[data-skin=pme] header h1{font-size:13px!important;color:#222}html.pme-nav header button[onclick]{display:none!important}
html[data-skin=pme] header button,html[data-skin=pme] header select{color:#111!important;background:#fff!important;border:1px solid #aaa!important;border-radius:2px!important;padding:3px 8px!important;min-height:0}
html[data-skin=pme] header .bd{background:#dbe7f6!important;color:#0a2a66!important}
.pm-bar{display:flex;flex-wrap:wrap;background:#f0f0f0;border-bottom:1px solid #c5c5c5;font-size:13px}.pm-menu{position:relative}.pm-menu>span{display:block;padding:5px 12px;cursor:pointer;user-select:none}.pm-menu:hover>span,.pm-menu.open>span{background:#cfe3f8}
.pm-dd{display:none;position:absolute;top:100%;inset-inline-start:0;min-width:230px;background:#fff;border:1px solid #999;box-shadow:2px 3px 6px #0004;z-index:60}.pm-menu:hover .pm-dd,.pm-menu.open .pm-dd{display:block}.pm-dd a{display:block;padding:6px 14px;color:#111;text-decoration:none}.pm-dd a:hover{background:#cfe3f8}
.pm-tabs{display:flex;background:#b7d1f2;padding:3px 6px 0}.pm-tabs span{padding:4px 22px;cursor:pointer;border:1px solid #8aa;border-bottom:0;margin-inline-end:2px;background:#d6e6fa;border-radius:3px 3px 0 0;color:#123}.pm-tabs span.on{background:#e9f2fd;font-weight:700}
.pm-ribwrap{display:flex;align-items:center;gap:6px;padding:6px 8px;background:linear-gradient(#eaf3fe,#c3d9f4);border-bottom:1px solid #8aa;overflow-x:auto}.pm-rib{display:none;gap:4px}.pm-rib.on{display:flex}
.pm-rib a,.pm-right a{display:flex;flex-direction:column;align-items:center;min-width:72px;padding:4px 6px;text-decoration:none;color:#0b2a66;font-size:12px;border:1px solid transparent;border-radius:3px;text-align:center;white-space:nowrap}.pm-rib a:hover,.pm-rib a.on,.pm-right a:hover{background:#fde7a0;border-color:#c9a53a}
.pm-rib a i,.pm-right a i{font-style:normal;font-size:26px;line-height:1.1}.pm-shop{margin:0 auto;font-weight:800;color:#0a2a8a;font-size:20px;letter-spacing:.5px;white-space:nowrap;padding:0 14px}.pm-right{display:flex;gap:2px}
.pm-status{position:fixed;bottom:0;left:0;right:0;background:#d6e6fa;border-top:1px solid #8aa;font-size:12px;padding:3px 10px;z-index:20;color:#123;white-space:nowrap;overflow:hidden}
html[data-skin=pme] th{background:#dbe7f6!important;color:#0a2a66!important;border:1px solid #b5c4d8!important;font-weight:700;padding:4px 6px!important}
html[data-skin=pme] td{border:1px solid #dfe6ee!important;padding:3px 6px!important}html[data-skin=pme] .card,html[data-skin=pme] .tbl{border-radius:0!important;border-color:#9fb4cf!important}
html[data-skin=pme] tr.psel td{background:#0a78d7!important;color:#fff!important}html[data-skin=pme] tr.psel td small{color:#dbe9ff}
html[data-skin=pme] button{border-radius:2px!important;background:linear-gradient(#fff,#e1e1e1)!important;color:#111!important;border:1px solid #9a9a9a!important}
html[data-skin=pme] button.p{background:linear-gradient(#eaf8ea,#b6e0b6)!important;color:#0a4a0a!important;border-color:#6aa86a!important}html[data-skin=pme] button.d{background:linear-gradient(#fff3f3,#f1c3c3)!important;color:#8a0f0f!important;border-color:#c98a8a!important}
html[data-skin=pme] .tabs button.on{background:#0a78d7!important;color:#fff!important}html[data-skin=pme] input,html[data-skin=pme] select,html[data-skin=pme] textarea{border-radius:2px!important;border-color:#9fb4cf!important}
html[data-skin=pme] td.pc-buy{background:#c8f2c8!important}html[data-skin=pme] td.pc-w{background:#c8dcf2!important}html[data-skin=pme] td.pc-rep{background:#d9c6f5!important}html[data-skin=pme] td.pc-sale{background:#f5c6c6!important}
html[data-skin=pme] #tb button{min-height:54px;font-weight:700}html[data-skin=pme] #tb button:nth-child(1){background:linear-gradient(#fde4e4,#f1a9a9)!important}html[data-skin=pme] #tb button:nth-child(2){background:linear-gradient(#fff8c8,#f1e07a)!important}html[data-skin=pme] #tb button:nth-child(3){background:linear-gradient(#e4f6e4,#a9dba9)!important}html[data-skin=pme] #tb button:nth-child(4){background:linear-gradient(#e0f2ff,#9fd0f2)!important}html[data-skin=pme] #tb button:nth-child(5){background:linear-gradient(#f1e4ff,#cda9f1)!important}html[data-skin=pme] #tb button:nth-child(6){background:linear-gradient(#d6f5ee,#7fd6c0)!important}
html[data-skin=pme] .tot{background:#d4b0ff;padding:6px 12px;border:1px solid #9a7ac4}html[data-skin=pme] #tt{font-size:48px;color:#e00000}
@media(max-width:700px){.pm-bar{display:none}.pm-shop{display:none}.pm-status{font-size:11px}}

@media(max-width:700px){
 header{flex-wrap:nowrap!important;overflow-x:auto;white-space:nowrap;gap:8px!important;padding:10px 12px!important}header h1{font-size:16px!important;flex:none!important;margin-inline-end:6px}header button,header select,header span{flex:none}
 main{padding:12px!important}.tabs{flex-wrap:nowrap!important;overflow-x:auto}.tabs button{flex:none}
 input,select,textarea{font-size:16px!important}button,select,input{min-height:42px}input[type=checkbox]{min-height:0}
 dialog{width:100vw!important;max-width:100vw!important;max-height:100vh;border-radius:0!important;margin:0!important}.g,form.m{grid-template-columns:1fr!important;padding:14px!important}.fa{flex-wrap:wrap}
 .sticky{position:static!important}.pos{grid-template-columns:1fr!important}.kp{grid-template-columns:repeat(2,1fr)!important}.bar>*{min-width:0!important;flex:1 1 140px}
 main table.stack{min-width:0!important;display:block}main table.stack thead{display:none}main table.stack tbody{display:block}
 main table.stack tr{display:block;border:1px solid var(--line);border-radius:12px;margin:8px 0;padding:6px 8px;background:var(--card)}
 main table.stack td{display:flex;justify-content:space-between;align-items:center;gap:12px;border:0!important;padding:5px 2px!important;text-align:end!important}
 main table.stack td::before{content:attr(data-label);color:var(--mut);font-size:13px;text-align:start;flex:none}main table.stack td:not([data-label])::before{content:none}
 main table.stack td[colspan]{display:block;text-align:center!important}
 .tbl,.card{overflow-x:visible!important}.cols,.g2{grid-template-columns:1fr!important}
}`;
const RAW=`Dashboard|Tableau de bord|لوحة التحكم
Inventory|Inventaire|المخزون
POS|Caisse|نقطة البيع
Sign out|Déconnexion|تسجيل الخروج
Sign in|Connexion|تسجيل الدخول
⚙ Settings|⚙ Paramètres|⚙ الإعدادات
Settings|Paramètres|الإعدادات
New quote|Nouveau devis|عرض سعر جديد
+ New ticket|+ Nouveau ticket|+ تذكرة جديدة
New ticket|Nouveau ticket|تذكرة جديدة
Wrong email or password.|E-mail ou mot de passe incorrect.|البريد أو كلمة المرور غير صحيحة.
Email|E-mail|البريد الإلكتروني
Password|Mot de passe|كلمة المرور
All tickets|Tous les tickets|كل التذاكر
Reception|Réception|الاستقبال
Diagnose|Diagnostic|التشخيص
Waiting approval|Attente d'accord|بانتظار الموافقة
Waiting parts|Attente de pièces|بانتظار القطع
Repair|Réparation|الإصلاح
Ready for pickup|Prêt à retirer|جاهز للاستلام
Returned|Restitué|تم التسليم
Search name, phone, model or code|Rechercher nom, téléphone, modèle ou code|ابحث بالاسم أو الهاتف أو الموديل أو الرمز
Hide returned|Masquer les restitués|إخفاء المسلّمة
Code|Code|الرمز
Customer|Client|العميل
Phone|Téléphone|الهاتف
Problem|Panne|العطل
Status|Statut|الحالة
Est. delivery|Livraison est.|التسليم المتوقع
Price|Prix|السعر
Edit|Modifier|تعديل
Parts & quote|Pièces & devis|القطع وعرض السعر
Receipt|Reçu|إيصال
Label|Étiquette|ملصق
Delete|Supprimer|حذف
First name|Prénom|الاسم
Last name|Nom|اللقب
Phone number|Numéro de téléphone|رقم الهاتف
Phone model|Modèle du téléphone|موديل الهاتف
Color|Couleur|اللون
Repair price|Prix de réparation|سعر الإصلاح
Date received|Date de réception|تاريخ الاستلام
Estimated delivery|Livraison estimée|التسليم المتوقع
Cancel|Annuler|إلغاء
Save|Enregistrer|حفظ
Save & print|Enregistrer et imprimer|حفظ وطباعة
No tickets here. Click “New ticket” to add one.|Aucun ticket. Cliquez sur « Nouveau ticket » pour en ajouter.|لا توجد تذاكر. اضغط «تذكرة جديدة» للإضافة.
Track your repair|Suivre votre réparation|تتبع إصلاحك
Enter your tracking code or the phone number you gave us.|Entrez votre code de suivi ou le numéro de téléphone donné.|أدخل رمز التتبع أو رقم الهاتف الذي زودتنا به.
Track|Suivre|تتبع
Return|Restitution|التسليم
Waiting for your approval|En attente de votre accord|بانتظار موافقتك
Waiting for parts|En attente de pièces|بانتظار القطع
Received|Reçu le|تاريخ الاستلام
Quotation|Devis|عرض السعر
Pending|En attente|قيد الانتظار
To be confirmed|À confirmer|سيتم التأكيد
No repair found. Check the code or phone number.|Aucune réparation trouvée. Vérifiez le code ou le numéro.|لم يتم العثور على إصلاح. تحقق من الرمز أو الرقم.
Could not load. Try again in a moment.|Chargement impossible. Réessayez.|تعذر التحميل. حاول مجدداً.
RD-XXXXXX or phone number|RD-XXXXXX ou numéro de téléphone|RD-XXXXXX أو رقم الهاتف
Parts catalog|Catalogue de pièces|كتالوج القطع
Receiving notes|Bons de réception|سندات الاستلام
Delivery notes|Bons de livraison|سندات التسليم
Movements|Mouvements|الحركات
Import|Importer|استيراد
Phone model, e.g. Samsung A17|Modèle, ex. Samsung A17|الموديل مثل Samsung A17
Search tracking no. or part name|Rechercher n° de suivi ou pièce|ابحث برقم التتبع أو اسم القطعة
+ New part|+ Nouvelle pièce|+ قطعة جديدة
+ Receiving note (supplier)|+ Bon de réception (fournisseur)|+ سند استلام (مورّد)
+ Delivery note (customer)|+ Bon de livraison (client)|+ سند تسليم (عميل)
No.|N°|الرقم
Date|Date|التاريخ
Supplier|Fournisseur|المورّد
Lines|Lignes|البنود
Total|Total|المجموع
Part|Pièce|القطعة
Type|Type|النوع
Qty|Qté|الكمية
Balance|Solde|الرصيد
Reference|Référence|المرجع
By|Par|بواسطة
Filter movements by part, model or reference|Filtrer les mouvements|تصفية الحركات
Import existing inventory (Excel or CSV)|Importer un inventaire (Excel ou CSV)|استيراد المخزون (Excel أو CSV)
Download CSV template|Télécharger le modèle CSV|تنزيل نموذج CSV
Tracking number|Numéro de suivi|رقم التتبع
Part name|Nom de la pièce|اسم القطعة
Part type|Type de pièce|نوع القطعة
Quality|Qualité|الجودة
Quantity (opening stock)|Quantité (stock initial)|الكمية (مخزون افتتاحي)
Expiry date|Date d'expiration|تاريخ الانتهاء
Purchase price|Prix d'achat|سعر الشراء
Wholesale price|Prix de gros|سعر الجملة
Normal sale price|Prix de vente normal|سعر البيع العادي
Shelf / location|Étagère / emplacement|الرف / الموقع
Tracking no.|N° de suivi|رقم التتبع
Buy|Achat|الشراء
Wholesale|Gros|جملة
Sale|Vente|البيع
Special|Spécial|خاص
Expiry|Expiration|الانتهاء
Adjust|Ajuster|تعديل الكمية
No items entered for this part.|Aucun article pour cette pièce.|لا توجد عناصر لهذه القطعة.
No parts yet. Add a part or import a file.|Aucune pièce. Ajoutez-en ou importez un fichier.|لا توجد قطع. أضف قطعة أو استورد ملفاً.
Open|Ouvrir|فتح
+ Add line|+ Ajouter une ligne|+ إضافة سطر
Confirm note|Confirmer le bon|تأكيد السند
Supplier / customer|Fournisseur / client|المورّد / العميل
Receiving note – from supplier|Bon de réception – fournisseur|سند استلام – من المورّد
Delivery note – to customer|Bon de livraison – client|سند تسليم – إلى العميل
Part (tracking no. / name)|Pièce (n° / nom)|القطعة (الرقم / الاسم)
Unit price|Prix unitaire|سعر الوحدة
No notes yet.|Aucun bon.|لا توجد سندات.
No movements.|Aucun mouvement.|لا توجد حركات.
Original|Original|أصلي
Third party|Compatible|تجاري
Refurbished|Reconditionné|مجدَّد
LCD|Écran|الشاشة
Battery|Batterie|البطارية
Back glass|Vitre arrière|الزجاج الخلفي
Upper housing|Châssis supérieur|الهيكل العلوي
Lower housing|Châssis inférieur|الهيكل السفلي
Sub board|Carte secondaire|اللوحة الفرعية
Charging port|Connecteur de charge|منفذ الشحن
Antenna|Antenne|الهوائي
Cables|Nappes|الكوابل
Rear camera|Caméra arrière|الكاميرا الخلفية
Front camera|Caméra avant|الكاميرا الأمامية
Camera lens|Vitre caméra|عدسة الكاميرا
Speaker|Haut-parleur|السماعة الخارجية
Earpiece|Écouteur interne|سماعة الأذن
Buttons|Boutons|الأزرار
SIM tray|Tiroir SIM|حامل الشريحة
Vibration motor|Vibreur|محرك الاهتزاز
Fingerprint sensor|Capteur d'empreinte|مستشعر البصمة
Find parts|Trouver des pièces|البحث عن القطع
Quote|Devis|عرض السعر
Item|Article|العنصر
Add service|Ajouter un service|إضافة خدمة
Service price|Prix du service|سعر الخدمة
Cleaning service|Nettoyage|خدمة التنظيف
Software service|Service logiciel|خدمة البرمجيات
Cosmetic service|Service esthétique|خدمة تجميلية
Other…|Autre…|أخرى…
Nothing quoted yet.|Rien dans le devis.|لا شيء في عرض السعر بعد.
Add to quote|Ajouter au devis|أضف إلى العرض
Request|Demander|طلب
Use (deduct)|Utiliser (déduire)|استخدام (خصم)
Return to stock|Remettre en stock|إرجاع للمخزون
quoted|proposé|مُسعَّر
requested|demandé|مطلوب
used|utilisé|مستخدم
Service|Service|خدمة
No inventory items for this part and model.|Aucun article en stock pour cette pièce et ce modèle.|لا توجد عناصر في المخزون لهذه القطعة والموديل.
Type a phone model to see its parts.|Saisissez un modèle pour voir ses pièces.|اكتب موديل الهاتف لعرض قطعه.
Out of stock|Rupture de stock|نفد من المخزون
Ticket not found.|Ticket introuvable.|التذكرة غير موجودة.
OK|OK|موافق
Type the phone model and press OK.|Saisissez le modèle puis appuyez sur OK.|اكتب موديل الهاتف ثم اضغط موافق.
Quote summary|Récapitulatif du devis|ملخص عرض السعر
Nothing added yet.|Rien d'ajouté.|لم تتم إضافة شيء.
Add|Ajouter|إضافة
+ Add service|+ Ajouter un service|+ إضافة خدمة
Customer approved – submit|Client d'accord – valider|وافق العميل – إرسال
New repair ticket|Nouveau ticket de réparation|تذكرة إصلاح جديدة
Back to quote|Retour au devis|العودة لعرض السعر
Create ticket & print receipt|Créer le ticket et imprimer le reçu|إنشاء التذكرة وطباعة الإيصال
No compatible items in inventory.|Aucun article compatible.|لا توجد عناصر متوافقة.
POS – Selling point|Caisse – Point de vente|نقطة البيع
Customer (name or phone) – empty = walk-in|Client (nom ou téléphone) – vide = passage|العميل (الاسم أو الهاتف) – فارغ = زبون عابر
+ New customer|+ Nouveau client|+ عميل جديد
Retail prices|Prix détail|أسعار التجزئة
Wholesale prices|Prix de gros|أسعار الجملة
Walk-in|Client de passage|زبون عابر
Paid in full at the counter|Payé en totalité au comptoir|مدفوع بالكامل عند الصندوق
Delivery notes total|Total des bons de livraison|مجموع سندات التسليم
Received (paid)|Reçu (payé)|المستلَم (المدفوع)
Current debt|Dette actuelle|الدين الحالي
Receive payment|Encaisser un paiement|استلام دفعة
Search name or scan barcode, then Enter|Nom ou code-barres puis Entrée|ابحث بالاسم أو امسح الباركود ثم Enter
All items|Tous les articles|كل العناصر
Accessories|Accessoires|الإكسسوارات
Repair parts (wholesale)|Pièces de réparation (gros)|قطع الإصلاح (جملة)
Current sale|Vente en cours|عملية البيع الحالية
Scan or click an item to add it.|Scannez ou cliquez sur un article.|امسح أو اضغط على عنصر لإضافته.
Discount|Remise|الخصم
Payment|Paiement|الدفع
Cash|Espèces|نقدي
Card|Carte|بطاقة
Transfer|Virement|تحويل
Amount paid now|Montant payé maintenant|المبلغ المدفوع الآن
Clear|Vider|مسح
Complete sale|Valider la vente|إتمام البيع
Customers & debts|Clients et dettes|العملاء والديون
Sales|Ventes|المبيعات
Sales today|Ventes du jour|مبيعات اليوم
Revenue|Chiffre d'affaires|الإيرادات
Collected|Encaissé|المحصّل
Sold on credit|Vendu à crédit|مباع بالآجل
Gross profit|Marge brute|إجمالي الربح
Top item|Article phare|الأكثر مبيعاً
Search accessories|Rechercher un accessoire|ابحث عن إكسسوار
+ New accessory|+ Nouvel accessoire|+ إكسسوار جديد
Barcode / no.|Code-barres / n°|الباركود / الرقم
Name|Nom|الاسم
Category|Catégorie|الفئة
Debt|Dette|الدين
Sell|Vendre|بيع
Reprint|Réimprimer|إعادة الطباعة
New accessory|Nouvel accessoire|إكسسوار جديد
Barcode / tracking no.|Code-barres / n° de suivi|الباركود / رقم التتبع
Opening quantity|Quantité initiale|الكمية الافتتاحية
Sale price|Prix de vente|سعر البيع
Create|Créer|إنشاء
Items|Articles|العناصر
Paid|Payé|المدفوع
Retail|Détail|تجزئة
New customer|Nouveau client|عميل جديد
Import accessories (Excel / CSV)|Importer des accessoires (Excel / CSV)|استيراد الإكسسوارات (Excel / CSV)
Thank you!|Merci !|شكراً لكم!
TOTAL|TOTAL|المجموع
Account balance due|Solde dû|الرصيد المستحق
Mahdi Repair – Reception|Mahdi Repair – Réception|Mahdi Repair – الاستقبال
Mahdi Repair – Technician|Mahdi Repair – Technicien|Mahdi Repair – الفني
Mahdi Repair – Manager|Mahdi Repair – Direction|Mahdi Repair – المدير
Mahdi Repair – Admin|Mahdi Repair – Administration|Mahdi Repair – الإدارة
Technician|Technicien|فني
Manager|Responsable|المدير
Admin|Administrateur|المسؤول
You do not have access to this page.|Vous n'avez pas accès à cette page.|ليس لديك صلاحية الدخول إلى هذه الصفحة.
Your account is waiting for an administrator to give it a role.|Votre compte attend qu'un administrateur lui attribue un rôle.|حسابك بانتظار أن يمنحه المسؤول دوراً.
This account has been disabled.|Ce compte a été désactivé.|تم تعطيل هذا الحساب.
Back|Retour|رجوع
Forgot password?|Mot de passe oublié ?|نسيت كلمة المرور؟
If this email has an account, a reset link was sent.|Si cet e-mail a un compte, un lien de réinitialisation a été envoyé.|إذا كان هذا البريد مسجلاً فقد أُرسل رابط إعادة التعيين.
Checking access…|Vérification de l'accès…|جارٍ التحقق من الصلاحيات…
Users|Utilisateurs|المستخدمون
Audit log|Journal d'audit|سجل التدقيق
Access rights|Droits d'accès|صلاحيات الوصول
+ Add staff|+ Ajouter un employé|+ إضافة موظف
Add staff|Ajouter un employé|إضافة موظف
Role|Rôle|الدور
Active|Actif|نشط
Reset password|Réinitialiser le mot de passe|إعادة تعيين كلمة المرور
Temporary password|Mot de passe temporaire|كلمة مرور مؤقتة
Time|Heure|الوقت
User|Utilisateur|المستخدم
Action|Action|الإجراء
Detail|Détail|التفاصيل
To diagnose|À diagnostiquer|للتشخيص
Waiting|En attente|قيد الانتظار
In repair|En réparation|قيد الإصلاح
Late|En retard|متأخر
Parts requested|Pièces demandées|القطع المطلوبة
Open tickets|Tickets ouverts|التذاكر المفتوحة
Late tickets|Tickets en retard|التذاكر المتأخرة
Avg. repair time|Durée moyenne|متوسط مدة الإصلاح
Repair revenue (month)|Revenus réparation (mois)|إيرادات الإصلاح (الشهر)
POS sales (month)|Ventes caisse (mois)|مبيعات نقطة البيع (الشهر)
Customer debts|Créances clients|ديون العملاء
Stock value (cost)|Valeur du stock (coût)|قيمة المخزون (التكلفة)
Stock value (special price)|Valeur du stock (prix spécial)|قيمة المخزون (السعر الخاص)
Tickets by status|Tickets par statut|التذاكر حسب الحالة
Received, last 14 days|Reçus, 14 derniers jours|المستلمة، آخر 14 يوماً
Stock alerts|Alertes de stock|تنبيهات المخزون
Low stock (2 or less)|Stock faible (2 ou moins)|مخزون منخفض (2 أو أقل)
Expiring within 60 days|Expire sous 60 jours|تنتهي خلال 60 يوماً
Top debts|Plus grosses dettes|أكبر الديون
Recent activity|Activité récente|النشاط الأخير
Reception desk|Accueil|مكتب الاستقبال
Technician board|Atelier|لوحة الفني
Manager overview|Vue direction|نظرة المدير
Admin panel|Administration|لوحة الإدارة
Nothing to show.|Rien à afficher.|لا شيء لعرضه.
Nothing to do here.|Rien à faire ici.|لا شيء هنا.
Filter the log|Filtrer le journal|تصفية السجل
Sessions end automatically after a period of inactivity.|Les sessions se ferment après une période d'inactivité.|تنتهي الجلسات تلقائياً بعد فترة من عدم النشاط.
New sale [F1]|Nouvelle vente [F1]|بيع جديد [F1]
Hold [F8]|Mettre en attente [F8]|تعليق [F8]
Customer [F9]|Client [F9]|العميل [F9]
Repair price [F12]|Prix réparation [F12]|سعر الإصلاح [F12]
Complete [F3]|Valider [F3]|إتمام [F3]
Held sales|Ventes en attente|المبيعات المعلقة
Resume|Reprendre|استئناف
Close|Fermer|إغلاق
The sale is empty.|La vente est vide.|عملية البيع فارغة.
Replace the current sale?|Remplacer la vente en cours ?|استبدال عملية البيع الحالية؟
Delete this held sale?|Supprimer cette vente en attente ?|حذف عملية البيع المعلقة؟
On credit|À terme (crédit)|بالآجل
Repair prices|Prix réparation|أسعار الإصلاح
Price 3|Prix 3|السعر 3
Brand|Marque|الماركة
All families|Toutes les familles|كل الفئات
All brands|Toutes les marques|كل الماركات
All locations|Tous les emplacements|كل المواقع
Any stock|Tout stock|أي مخزون
In stock|En stock|متوفر
Margin|Marge|الهامش
Seller|Vendeur|البائع
Mahdi Repair – Treasury|Mahdi Repair – Trésorerie|Mahdi Repair – الخزينة
Treasury|Trésorerie|الخزينة
Registers|Caisses|الصناديق
Expenses|Charges|المصاريف
Losses|Pertes|الخسائر
Daily closing|Clôture journalière|الإقفال اليومي
+ New register|+ Nouvelle caisse|+ صندوق جديد
Create default registers|Créer les caisses par défaut|إنشاء الصناديق الافتراضية
Register|Caisse|الصندوق
Total balance|Solde total|الرصيد الإجمالي
+ Cash in|+ Encaissement|+ إيداع
+ Cash out|+ Décaissement|+ سحب
Cash in|Encaissement|إيداع
Cash out|Décaissement|سحب
Transfer between registers|Transfert entre caisses|تحويل بين الصناديق
Source|Source|المصدر
Mode|Mode|الطريقة
Remark|Remarque|ملاحظة
Today|Aujourd'hui|اليوم
Last 7 days|7 derniers jours|آخر 7 أيام
This month|Ce mois|هذا الشهر
All|Tout|الكل
Total cash in:|Total encaissements :|إجمالي الإيداعات:
Total cash out:|Total décaissements :|إجمالي السحوبات:
Initial balance|Solde initial|الرصيد الابتدائي
Default for POS cash|Par défaut pour la caisse (espèces)|الافتراضي لنقد نقطة البيع
Cash register|Caisse espèces|صندوق نقدي
Bank account|Compte bancaire|حساب بنكي
Day register|Caisse journée|صندوق اليوم
Safe|Coffre|الخزنة
+ New expense|+ Nouvelle charge|+ مصروف جديد
New expense|Nouvelle charge|مصروف جديد
Edit expense|Modifier la charge|تعديل المصروف
Designation|Désignation|البيان
Expense type|Type de charge|نوع المصروف
Sub-type|Sous-type|النوع الفرعي
Payment mode|Mode de paiement|طريقة الدفع
Amount excl. tax|Montant HT|المبلغ دون ضريبة
VAT|TVA|الضريبة
Stamp duty|Timbre|رسم الطابع
Total incl. tax|Montant TTC|المبلغ الإجمالي
Paid from register|Payé depuis la caisse|مدفوع من الصندوق
Visible to administrators only|Visible uniquement par les administrateurs|ظاهر للمسؤولين فقط
Observation|Observation|ملاحظة
Total (incl. tax):|Total TTC :|الإجمالي:
+ New loss|+ Nouvelle perte|+ خسارة جديدة
New loss|Nouvelle perte|خسارة جديدة
Loss type|Type de perte|نوع الخسارة
Product|Produit|المنتج
Unit cost|Coût unitaire|تكلفة الوحدة
Breakage|Casse|كسر
Theft|Vol|سرقة
Expired|Périmé|منتهي الصلاحية
Damaged|Endommagé|تالف
Other|Autre|أخرى
Opening|Ouverture|الافتتاح
Expected closing|Clôture prévue|الإقفال المتوقع
Counted cash|Espèces comptées|النقد المعدود
Gap|Écart|الفرق
Observations|Observations|ملاحظات
Save closing|Enregistrer la clôture|حفظ الإقفال
Lock day|Verrouiller la journée|إقفال اليوم
Unlock day|Déverrouiller la journée|فتح اليوم
Locked|Verrouillé|مقفل
This day is locked.|Cette journée est verrouillée.|هذا اليوم مقفل.
Day summary|Résumé de la journée|ملخص اليوم
POS sales|Ventes caisse|مبيعات نقطة البيع
Customer payments|Versements clients|دفعات العملاء
Purchases received|Achats reçus|المشتريات المستلمة
Recent closings|Dernières clôtures|آخر عمليات الإقفال
Delete this record?|Supprimer cet enregistrement ?|حذف هذا السجل؟
Select a register first.|Sélectionnez d'abord une caisse.|اختر صندوقاً أولاً.
Amount|Montant|المبلغ
From register|De la caisse|من الصندوق
To register|Vers la caisse|إلى الصندوق
Not enough stock.|Stock insuffisant.|المخزون غير كافٍ.
This register has entries.|Cette caisse contient des écritures.|هذا الصندوق يحتوي على قيود.
This entry belongs to another record.|Cette écriture dépend d'un autre enregistrement.|هذا القيد تابع لسجل آخر.
Enter the counted cash first.|Saisissez d'abord les espèces comptées.|أدخل النقد المعدود أولاً.
Cash in registers|Argent en caisse|النقد في الصناديق
Expenses (month)|Charges (mois)|المصاريف (الشهر)
Losses (month)|Pertes (mois)|الخسائر (الشهر)
All types|Tous les types|كل الأنواع
Search…|Rechercher…|بحث…
Stock now|Stock actuel|المخزون الحالي
Mahdi Repair – Statistics|Mahdi Repair – Statistiques|Mahdi Repair – الإحصائيات
Statistics|Statistiques|الإحصائيات
From|Du|من
To|Au|إلى
Month|Mois|شهر
Year|Année|سنة
Period|Période|الفترة
Purchases|Achats|المشتريات
POS & delivery sales|Ventes caisse et livraisons|مبيعات نقطة البيع والتسليم
Repair revenue|Revenus des réparations|إيرادات الإصلاح
Total sales|Total des ventes|إجمالي المبيعات
Inventory gap|Écart d'inventaire|فرق الجرد
Gross profit|Bénéfice brut|الربح الإجمالي
Net profit|Bénéfice net|الربح الصافي
Gross %|Brut %|إجمالي %
Net %|Net %|صافي %
Export Excel|Exporter Excel|تصدير Excel
Print / PDF|Imprimer / PDF|طباعة / PDF
Gross profit = total sales − cost of goods sold (parts and products at buy price). Net profit = gross profit − expenses − losses − inventory gaps. Repairs count when the ticket is returned.|Bénéfice brut = ventes − coût des marchandises vendues (pièces et produits au prix d'achat). Bénéfice net = bénéfice brut − charges − pertes − écarts d'inventaire. Les réparations comptent à la restitution du ticket.|الربح الإجمالي = المبيعات − تكلفة البضاعة المباعة (القطع والمنتجات بسعر الشراء). الربح الصافي = الربح الإجمالي − المصاريف − الخسائر − فروق الجرد. تُحتسب الإصلاحات عند تسليم التذكرة.
Suppliers|Fournisseurs|الموردون
Mahdi Repair – Suppliers|Mahdi Repair – Fournisseurs|Mahdi Repair – الموردون
Payments|Règlements|الدفعات
Returns|Retours|المرتجعات
+ New supplier|+ Nouveau fournisseur|+ مورّد جديد
New supplier|Nouveau fournisseur|مورّد جديد
Edit supplier|Modifier le fournisseur|تعديل المورّد
Phone|Téléphone|الهاتف
Address|Adresse|العنوان
Family|Famille|الفئة
Notes|Notes|ملاحظات
Balance due|Solde dû|الرصيد المستحق
Statement|Situation|كشف الحساب
Pay|Payer|دفع
Return|Restitution|التسليم
Return to supplier|Retour fournisseur|إرجاع للمورّد
Total supplier balances|Total des soldes fournisseurs|إجمالي أرصدة الموردين
Total customer balances|Total des soldes clients|إجمالي أرصدة العملاء
Customers − suppliers|Clients − fournisseurs|العملاء − الموردون
Pay supplier|Régler le fournisseur|دفع للمورّد
Supplier statement|Situation fournisseur|كشف حساب المورّد
Opening balance|Solde d'ouverture|الرصيد الافتتاحي
Receiving note|Bon de réception|سند استلام
Payment|Règlement|دفعة
Purchase return|Retour d'achat|مرتجع مشتريات
Refund received|Remboursement reçu|استرداد مستلم
Debit|Débit|مدين
Credit|Crédit|دائن
Print|Imprimer|طباعة
Close|Fermer|إغلاق
Paid now|Payé maintenant|المدفوع الآن
Pay from register|Payer depuis la caisse|الدفع من الصندوق
Supplier refunds in cash now|Remboursement fournisseur en espèces|استرداد نقدي من المورّد
Initial balance (we owe)|Solde initial (dû)|الرصيد الابتدائي (علينا)
+ New return|+ Nouveau retour|+ مرتجع جديد
New return|Nouveau retour|مرتجع جديد
Save return|Enregistrer le retour|حفظ المرتجع
Customer (empty = walk-in)|Client (vide = passage)|العميل (فارغ = زبون عابر)
Refund|Remboursement|الاسترداد
Credit to customer account|Crédit sur le compte client|رصيد في حساب العميل
Cash refund|Remboursement en espèces|استرداد نقدي
Walk-in returns must be refunded in cash.|Les retours de passage sont remboursés en espèces.|مرتجعات الزبون العابر تُسترد نقداً.
Create a cash register first.|Créez d'abord une caisse.|أنشئ صندوقاً نقدياً أولاً.
Unknown item. Pick it from the list.|Article inconnu. Choisissez dans la liste.|عنصر غير معروف. اختره من القائمة.
Credit note|Avoir|إشعار دائن
Reprint|Réimprimer|إعادة الطباعة
Fixed price (admin) = (normal + repair) / 2|Prix fixe (admin) = (normal + réparation) / 2|السعر الثابت (للمسؤول) = (العادي + الإصلاح) / 2
Fixed|Fixe|ثابت
Stock value (fixed price)|Valeur du stock (prix fixe)|قيمة المخزون (السعر الثابت)
Mahdi Repair – Invoices|Mahdi Repair – Factures|Mahdi Repair – الفواتير
Invoices|Factures|الفواتير
Orders|Commandes|الطلبيات
+ New order|+ Nouvelle commande|+ طلبية جديدة
New order|Nouvelle commande|طلبية جديدة
Edit order|Modifier la commande|تعديل الطلبية
Expected date|Date prévue|التاريخ المتوقع
Unit cost|Coût unitaire|تكلفة الوحدة
Open|Ouverte|مفتوحة
Partially received|Partiellement reçue|مستلمة جزئياً
Received|Reçu|مستلمة
Cancelled|Annulée|ملغاة
Receive|Réceptionner|استلام
Receive goods|Réception de marchandises|استلام البضاعة
Receive now|Réceptionner maintenant|استلم الآن
Confirm note|Confirmer le bon|تأكيد السند
Create a supplier first.|Créez d'abord un fournisseur.|أنشئ مورّداً أولاً.
Purchase order|Bon de commande fournisseur|أمر شراء
Proforma invoice|Facture proforma|فاتورة مبدئية
Sales invoice|Facture de vente|فاتورة مبيعات
Credit note invoice|Facture d'avoir|فاتورة إشعار دائن
Purchase invoice|Facture d'achat|فاتورة مشتريات
Purchase credit note|Avoir d'achat|إشعار دائن مشتريات
+ New invoice|+ Nouvelle facture|+ فاتورة جديدة
New invoice|Nouvelle facture|فاتورة جديدة
Reference|Référence|المرجع
Due date|Date d'échéance|تاريخ الاستحقاق
Discount|Remise|الخصم
VAT rate %|Taux de TVA %|نسبة الضريبة %
Total excl. tax|Total HT|الإجمالي دون ضريبة
Issued|Émise|صادرة
Void|Annulée|ملغاة
Cancel|Annuler|إلغاء
Save & print|Enregistrer et imprimer|حفظ وطباعة
An invoice already exists for this document. Create another?|Une facture existe déjà pour ce document. En créer une autre ?|توجد فاتورة لهذا المستند. إنشاء أخرى؟
Unit price|Prix unitaire|سعر الوحدة
Mahdi Repair – Stock|Mahdi Repair – Stock|Mahdi Repair – المخزون
Stock counts|Inventaires|جرد المخزون
Merge products|Fusionner des produits|دمج المنتجات
+ New count|+ Nouvel inventaire|+ جرد جديد
New count|Nouvel inventaire|جرد جديد
Title|Titre|العنوان
Scope|Périmètre|النطاق
Accessories & repair parts|Accessoires et pièces|الإكسسوارات وقطع الإصلاح
Repair parts|Pièces de réparation|قطع الإصلاح
Include out-of-stock items|Inclure les ruptures de stock|تضمين المنتجات النافدة
Create count|Créer l'inventaire|إنشاء الجرد
Counted|Compté|المعدود
System qty|Qté système|كمية النظام
Difference|Écart|الفرق
Value|Valeur|القيمة
Scan or type code, then Enter|Scannez ou saisissez le code puis Entrée|امسح أو اكتب الرمز ثم Enter
Uncounted|Non comptés|غير معدودة
Differences|Écarts|فروقات
Validate count|Valider l'inventaire|اعتماد الجرد
Validated|Validé|معتمد
Print differences|Imprimer les écarts|طباعة الفروقات
Counted items|Articles comptés|العناصر المعدودة
Shortage|Manquants|نقص
Surplus|Excédent|فائض
Validate this count and adjust the stock? Uncounted items stay unchanged.|Valider cet inventaire et ajuster le stock ? Les articles non comptés restent inchangés.|اعتماد الجرد وتعديل المخزون؟ العناصر غير المعدودة تبقى دون تغيير.
Showing the first 150 rows. Refine the search.|Affichage des 150 premières lignes. Affinez la recherche.|عرض أول 150 صفاً. حدّد البحث.
Item to keep|Article à conserver|العنصر المراد الإبقاء عليه
Item to merge into it (will be removed)|Article à fusionner (sera supprimé)|العنصر المراد دمجه (سيُحذف)
Merge|Fusionner|دمج
Possible duplicates|Doublons possibles|تكرارات محتملة
Merge these two items? Stock moves to the kept item, the other is removed.|Fusionner ces deux articles ? Le stock passe à l'article conservé, l'autre est supprimé.|دمج هذين العنصرين؟ ينتقل المخزون إلى العنصر المُبقى ويُحذف الآخر.
Both items must be of the same kind.|Les deux articles doivent être du même type.|يجب أن يكون العنصران من النوع نفسه.
No duplicates found.|Aucun doublon trouvé.|لا توجد تكرارات.
Merged.|Fusionné.|تم الدمج.
Interface style|Style d'interface|نمط الواجهة
Modern|Moderne|عصري
PME classic|PME classique|PME الكلاسيكي
File|Fichier|ملف
Stock|Stock|المخزون
Workshop|Maintenance|الورشة
Customers|Clients|العملاء
Costs & losses|Charges et pertes|المصاريف والخسائر
General|Général|عام
Additional|Supplémentaire|إضافي
Products|Produits|المنتجات
Counter sale|Vente au comptoir|بيع بالتجزئة
Sales journal|Journal des ventes|سجل المبيعات
Supplier list|Liste des fournisseurs|قائمة الموردين
Supplier orders|Commandes fournisseur|طلبيات الموردين
Supplier returns|Retours fournisseur|مرتجعات الموردين
Proforma invoices|Factures proforma|فواتير مبدئية
Sales invoices|Factures de vente|فواتير المبيعات
Credit note invoices|Factures d'avoir|فواتير الإشعار الدائن
Purchase invoices|Factures d'achat|فواتير المشتريات
Purchase credit notes|Avoirs d'achat|إشعارات دائنة للمشتريات
Server: Firebase|Serveur : Firebase|الخادم: Firebase
User:|Utilisateur :|المستخدم:
Role:|Rôle :|الدور:
My devices|Mes appareils|أجهزتي
History|Historique|السجل
My stats|Mes statistiques|إحصائياتي
Request parts|Demander des pièces|طلب قطع
New quote|Nouveau devis|عرض سعر جديد
Mark repaired|Marquer réparé|تم الإصلاح
Send to reception|Envoyer à l'accueil|إرسال إلى الاستقبال
New total price|Nouveau prix total|السعر الإجمالي الجديد
Current price|Prix actuel|السعر الحالي
Note|Note|ملاحظة
Level|Niveau|المستوى
Device|Appareil|الجهاز
Repair level|Niveau de réparation|مستوى الإصلاح
Technician|Technicien|الفني
Unassigned|Non assigné|غير معيّن
0 – Basic|0 – Basique|0 – أساسي
1 – Normal|1 – Normal|1 – عادي
2 – Difficult|2 – Difficile|2 – صعب
3 – Most difficult|3 – Très difficile|3 – الأصعب
Basic|Basique|أساسي
Difficult|Difficile|صعب
Most difficult|Très difficile|الأصعب
Level 0 – Basic|Niveau 0 – Basique|المستوى 0 – أساسي
Level 1 – Normal|Niveau 1 – Normal|المستوى 1 – عادي
Level 2 – Difficult|Niveau 2 – Difficile|المستوى 2 – صعب
Level 3 – Most difficult|Niveau 3 – Très difficile|المستوى 3 – الأصعب
Price change requests|Demandes de changement de prix|طلبات تغيير السعر
Old price:|Ancien prix :|السعر القديم:
New price:|Nouveau prix :|السعر الجديد:
Mark contacted|Marquer contacté|تم الاتصال
✓ Customer contacted|✓ Client contacté|✓ تم الاتصال بالعميل
Approve new price|Approuver le nouveau prix|الموافقة على السعر الجديد
Reject|Refuser|رفض
Confirmed new price:|Nouveau prix confirmé :|السعر الجديد المؤكد:
Reject ?|Refuser ?|رفض ؟
Repair bonuses|Primes de réparation|مكافآت الإصلاح
Amount paid per repaired device, for each repair level.|Montant versé par appareil réparé, selon le niveau.|المبلغ المدفوع لكل جهاز مُصلَح حسب المستوى.
Per-technician override|Valeurs par technicien|قيم خاصة بكل فني
Saved|Enregistré|تم الحفظ
Bonus report|Rapport des primes|تقرير المكافآت
Mahdi Repair – Bonus report|Mahdi Repair – Rapport des primes|Mahdi Repair – تقرير المكافآت
Parts queue|File des pièces|طلبات القطع
Mahdi Repair – Parts queue|Mahdi Repair – File des pièces|Mahdi Repair – طلبات القطع
Requests|Demandes|الطلبات
Issued|Émise|صادرة
Stock now|Stock actuel|المخزون الحالي
Requested|Demandé|مطلوب
Issue|Remettre|تسليم
Decline|Refuser|رفض
Take back|Reprendre|استرجاع
Out of stock|Rupture de stock|نفد من المخزون
Bonus|Prime|المكافأة
Inventory|Inventaire|المخزون
issued|remis|مسلّم
declined|refusé|مرفوض
Mark this device as repaired and waiting for return to the customer?|Marquer cet appareil comme réparé et en attente de restitution ?|تأكيد أن الجهاز تم إصلاحه وبانتظار التسليم للعميل؟
Some requested parts were not issued yet. Mark repaired anyway?|Certaines pièces demandées n'ont pas encore été remises. Marquer réparé quand même ?|بعض القطع المطلوبة لم تُسلَّم بعد. تأكيد الإصلاح رغم ذلك؟
Inventory|Inventaire|المخزون
Image|Image|الصورة
📷 Take photo|📷 Prendre une photo|📷 التقاط صورة
Upload|Téléverser|رفع
…or paste an image link (https://…)|…ou collez un lien d'image (https://…)|…أو الصق رابط الصورة (https://…)
Remove|Retirer|إزالة
Language|Langue|اللغة
Theme|Thème|المظهر
Light|Clair|فاتح
Calm (easy on the eyes)|Doux (reposant)|هادئ (مريح للعين)
Dark|Sombre|داكن
Accent color|Couleur d'accent|اللون الرئيسي
Text size|Taille du texte|حجم النص
Small|Petit|صغير
Normal|Normal|عادي
Large|Grand|كبير
Easy view – bigger text and a simpler dashboard|Vue simple – texte plus grand, tableau de bord épuré|العرض المبسط – نص أكبر ولوحة أبسط
Currency|Devise|العملة
Preset|Préréglage|قائمة جاهزة
Custom|Personnalisée|مخصص
Symbol|Symbole|الرمز
Position|Position|الموضع
Before the amount|Avant le montant|قبل المبلغ
After the amount|Après le montant|بعد المبلغ
Decimals|Décimales|الخانات العشرية
Preview|Aperçu|معاينة
Reset to defaults|Réinitialiser|إعادة الضبط
These settings are saved on this device.|Ces paramètres sont enregistrés sur cet appareil.|تُحفظ هذه الإعدادات على هذا الجهاز.
Display|Affichage|العرض`;
const D=new Map();RAW.split('\n').forEach(l=>{const [e,f,a]=l.split('|');D.set(e,{fr:f,ar:a})});
const PAT=[[/^(\d+) in stock( · .*)?$/,'$1 en stock$2','$1 في المخزون$2'],[/^Out of stock( · .*)?$/,'Rupture de stock$1','نفد من المخزون$1'],[/^(\d+) available$/,'$1 disponible(s)','$1 متوفر'],[/^Held \((\d+)\)$/,'En attente ($1)','معلّق ($1)'],[/^(\d+) items$/,'$1 articles','$1 عنصر'],[/^Quote total: (.*)$/,'Total du devis : $1','إجمالي العرض: $1'],[/^Total: (.*)$/,'Total : $1','المجموع: $1'],[/^(.*) \(late\)$/,'$1 (en retard)','$1 (متأخر)'],[/^Quote (.+)$/,'Devis $1','عرض $1'],[/^(.*) – repair tracking$/,'$1 – suivi des réparations','$1 – تتبع الإصلاح']];
export function t(s){if(S.lang==='en')return s;const k=String(s).trim();if(!k)return s;const e=D.get(k);if(e&&e[S.lang])return String(s).replace(k,()=>e[S.lang]);
 for(const [re,fr,ar] of PAT)if(re.test(k)){const v=k.replace(re,S.lang==='fr'?fr:ar);return String(s).replace(k,()=>v)}return s}
function walk(n){if(n.nodeType===3){const v=t(n.nodeValue);if(v!==n.nodeValue)n.nodeValue=v;return}
 if(n.nodeType!==1||/^(SCRIPT|STYLE|TEXTAREA)$/.test(n.tagName))return;
 for(const a of ['placeholder','title','data-label']){const x=n.getAttribute&&n.getAttribute(a);if(x){const v=t(x);if(v!==x)n.setAttribute(a,v)}}
 n.childNodes.forEach(walk)}
function chrome(){const h=document.querySelector('header');if(!h||h.dataset.ui)return;h.dataset.ui=1;
 const sel=document.createElement('select');sel.style.cssText='width:auto;padding:6px;background:transparent;color:#fff;border:1px solid #4a5b68;border-radius:8px';
 [['en','EN'],['fr','FR'],['ar','AR']].forEach(([v,l])=>{const o=new Option(l,v);o.style.color='#000';sel.add(o)});sel.value=S.lang;sel.onchange=()=>setLang(sel.value);
 const b=document.createElement('button');b.textContent='⚙ Settings';b.onclick=()=>location.href='settings.html';
 const lo=h.querySelector('#lo');if(lo){h.insertBefore(b,lo);h.insertBefore(sel,lo)}else h.append(b,sel)}
function labelTables(){document.querySelectorAll('main table').forEach(t=>{const hs=[...t.querySelectorAll('thead th')].map(h=>h.textContent.trim());if(!hs.length)return;t.classList.add('stack');
 t.querySelectorAll('tbody tr').forEach(tr=>[...tr.children].forEach((td,i)=>{if(td.colSpan===1&&hs[i]&&td.getAttribute('data-label')!==hs[i])td.setAttribute('data-label',hs[i])}))})}
function init(){const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);chrome();
 const mob=matchMedia('(max-width:700px)');let q=0;const later=()=>{if(!mob.matches||q)return;q=requestAnimationFrame(()=>{q=0;labelTables()})};
 if(S.lang!=='en')walk(document.body);later();
 if(S.skin==='pme')document.addEventListener('click',e=>{const tr=e.target.closest('main table tbody tr');if(tr&&!e.target.closest('button,input,select,a')){document.querySelectorAll('tr.psel').forEach(x=>x.classList.remove('psel'));tr.classList.add('psel')}});
 new MutationObserver(ms=>{if(S.lang!=='en')ms.forEach(m=>{m.addedNodes.forEach(walk);if(m.type==='characterData')walk(m.target)});later()}).observe(document.body,{childList:true,subtree:true,characterData:true});
 if(S.lang!=='en')for(const f of ['alert','confirm','prompt']){const o=window[f].bind(window);window[f]=(m,...r)=>o(t(String(m)),...r)}}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
