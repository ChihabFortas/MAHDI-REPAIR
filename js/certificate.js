/* Hand-over certificate (A4, Arabic): "شهادة استلام هاتف بعد التصليح" */
import {SHOP} from "./common.js?v=72";
import {printDoc} from "./printkit.js?v=72";
const e=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const dmy=d=>{const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(d||'');return m?`${m[3]}/${m[2]}/${m[1]}`:(d||'')};
export const CERT_CSS=`*{box-sizing:border-box}body{margin:0;background:#fff;color:#000;font-family:Tahoma,"Noto Sans Arabic",Arial,sans-serif}
.ct{width:186mm;margin:0 auto;padding:6mm 4mm;direction:rtl;font-size:14px;line-height:1.9}
.ct h1{text-align:center;font-size:24px;margin:6px 0 2px}.ct .sh{text-align:center;font-size:13px;color:#333;margin-bottom:10px}
.ct .bx{border:2px solid #000;border-radius:6px;padding:8mm 8mm 6mm}.ct .ln{display:flex;gap:6px;align-items:baseline;margin:6px 0}
.ct .ln b{white-space:nowrap}.ct .ln span{flex:1;border-bottom:1px dotted #000;min-height:22px;padding:0 6px}
.ct p{margin:10px 0;text-align:justify}.ct .sg{display:flex;justify-content:space-between;gap:20px;margin-top:22mm;text-align:center}
.ct .sg div{flex:1}.ct .sg i{display:block;border-top:1px solid #000;margin:0 14px 4px}.ct .ft{margin-top:14px;font-size:11px;color:#444;text-align:center}`;
/* t: ticket, x:{idNo,imei,repair,date,note} */
export function certHTML(t,x){x=x||{};const nm=`${t.firstName||''} ${t.lastName||''}`.trim(),ln=(l,v)=>`<div class="ln"><b>${l}:</b><span>${e(v)}</span></div>`,
 d=x.date?new Date(x.date):new Date(),dd=`${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
 return `<div class="ct"><h1>شهادة استلام هاتف بعد التصليح</h1><div class="sh">${e(SHOP.name||'')}${SHOP.phone?' · '+e(SHOP.phone):''}${SHOP.address?' · '+e(SHOP.address):''}</div>
<div class="bx">${ln('الاسم واللقب',nm)}${ln('رقم الهاتف',t.phone)}${ln('رقم بطاقة التعريف الوطنية',x.idNo)}
${ln('نوع الجهاز',[t.model,t.color].filter(Boolean).join(' – '))}${ln('رقم IMEI / الرقم التسلسلي',x.imei)}${ln('رقم وصل الاستلام',t.code)}${ln('تاريخ إيداع الجهاز',dmy(t.receivedDate))}${ln('العطل المصرّح به',t.problem)}${ln('التصليح المنجز',x.repair)}
${x.note?ln('ملاحظات',x.note):''}
<p>أصرّح أنا الموقع أسفله بأنني استلمت جهازي المذكور أعلاه من ${e(SHOP.name||'المحل')} بعد التصليح، في حالة جيدة وسليمة، وبعد أن تأكدت من اشتغاله ومن كافة ملحقاته المودعة، وأنني لم أتمكن من إحضار وصل الاستلام الأصلي (ضائع أو منسي)، ولا أحتفظ بأي مطالبة أخرى تخص هذا الجهاز أو هذا التصليح بعد هذا التاريخ.</p>
<div class="ln"><b>تحريراً بتاريخ:</b><span>${dd}</span></div>
<div class="sg"><div><i></i>إمضاء الزبون (قرأ وصادق)</div><div><i></i>ختم وإمضاء صاحب المحل</div></div></div>
<div class="ft">تُحفظ هذه الشهادة في أرشيف المحل · ${e(t.code)}</div></div>`}
export const printCert=(t,x)=>printDoc(certHTML(t,x),CERT_CSS,'size:A4;margin:10mm');
