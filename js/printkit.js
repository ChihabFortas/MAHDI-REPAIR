// Isolated printing / PDF for thermal receipts: renders in a clean hidden iframe, so app CSS (flex shell, color-mix, hidden panes) can never blank the output.
const loadJS=u=>new Promise((ok,ko)=>{const e=document.createElement('script');e.src=u;e.onload=ok;e.onerror=ko;document.head.append(e)});
export const RC_CSS=`*{box-sizing:border-box}body{margin:0;background:#fff;color:#000;font-family:Tahoma,"Noto Sans Arabic",Arial,sans-serif}
.rc2{width:72mm;padding:3mm 3mm 4mm;text-align:center;font-size:12.5px;line-height:1.35}.rc2 .lg{width:30mm;height:auto;display:block;margin:0 auto 2mm}.rc2 .sn{font-size:18px;font-weight:700;letter-spacing:.5px}.rc2 .sp{font-size:15px}.rc2 .sa{font-size:12px}
.rc2 hr{border:0;border-top:1px dashed #000;margin:2.5mm 0}.rc2 .tt{font-size:15px;font-weight:700;margin:3mm 0 3.5mm}
.rc2 .r{display:flex;justify-content:space-between;gap:3mm;margin:1.6mm 0;font-size:13px}.rc2 .r b{white-space:nowrap}.rc2 .r span{text-align:start;font-weight:400}
.rc2 .qq{width:38mm;height:38mm;margin:5mm auto 2mm}.rc2 .qq svg,.rc2 .qq img{width:100%;height:100%}.rc2 .cp{font-size:12px}.rc2 .ft{font-size:12px;margin-top:2mm}
.lb2{width:45mm;height:35mm;padding:1.5mm 2mm;overflow:hidden;font:700 8.5px/1.3 Arial,Tahoma,sans-serif}.lb2 .tl{display:flex;justify-content:space-between;font-size:10px}.lb2 svg.bc{width:100%;height:7mm;display:block;margin:1mm 0}.lb2 .dd{text-align:center;font-size:10px}`;
function frame(html,css,page,wMm){const f=document.createElement('iframe');f.setAttribute('aria-hidden','true');f.style.cssText='position:fixed;left:-10000px;top:0;border:0;visibility:hidden;width:'+(wMm?Math.ceil(wMm*3.7795)+'px':'300mm')+';height:3000px';document.body.append(f);
 const d=f.contentDocument;d.open();d.write(`<!doctype html><html><head><meta charset="utf-8"><style>${css||''}@page{${page||'margin:0'}}</style></head><body>${html}</body></html>`);d.close();return f}
const ready=async f=>{const d=f.contentDocument,im=[...d.images].filter(i=>!i.complete);await Promise.all(im.map(i=>new Promise(r=>{i.onload=i.onerror=r})));try{await d.fonts.ready}catch(_){}await new Promise(r=>setTimeout(r,120))};
import {routePrint,paperOf} from "./printer.js?v=72";
/* Thermal receipts and device labels are printed as a picture made by the browser.
   Printer drivers and the direct-print helper replace fonts and break Arabic letters apart; a picture keeps the text exactly as on screen.
   Paper: 80 mm rolls print about 72 mm wide, 58 mm rolls about 48 mm (Settings → Printers). */
export async function rasterize(html,css,wMm,scale=3){if(!window.html2canvas)await loadJS('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
 const f=frame(html,css,'margin:0',wMm);try{await ready(f);const el=f.contentDocument.body.firstElementChild;const cv=await html2canvas(el,{scale,backgroundColor:'#fff',useCORS:true,logging:false});return {url:cv.toDataURL('image/png'),w:cv.width,h:cv.height}}finally{f.remove()}}
export async function printDoc(html,css,page,kind){if(!kind)return browserPrint(html,css,page);
 if(kind==='receipt'||kind==='label'){let img=null;try{img=await rasterize(html,css,kind==='label'?45:72)}catch(e){console.warn('rasterize',e)}
  if(img){const lab=kind==='label',paper=lab?45:(+paperOf(kind)===58?58:80),iw=lab?45:(paper===58?48:72),ih=lab?35:Math.ceil(img.h/img.w*iw),ph=lab?35:ih+4,
   h2=`<img src="${img.url}" style="display:block;width:${iw}mm;height:${ih}mm;margin:${lab?0:'2mm'} auto 0">`,c2='body{margin:0;background:#fff}',p2=`size:${paper}mm ${ph}mm;margin:0`;
   return routePrint(kind,{html:h2,css:c2,page:p2,image:{url:img.url,pw:iw,ph:lab?35:ih},browser:()=>browserPrint(h2,c2,p2)})}}
 return routePrint(kind,{html,css,page,browser:()=>browserPrint(html,css,page)})}
async function browserPrint(html,css,page){const f=frame(html,css,page);await ready(f);const w=f.contentWindow;let done=false;const rm=()=>{if(done)return;done=true;setTimeout(()=>f.remove(),500)};w.onafterprint=rm;setTimeout(rm,120000);f.style.visibility='visible';f.style.left='0';f.style.width='1px';f.style.height='1px';w.focus();w.print()}
export async function docToPDF(html,css,wMm){if(!window.html2canvas)await loadJS('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');if(!window.jspdf)await loadJS('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
 const f=frame(html,css,'margin:0',wMm);try{await ready(f);const body=f.contentDocument.body,el=body.firstElementChild;const cv=await html2canvas(el,{scale:3,backgroundColor:'#fff',useCORS:true,logging:false}),h=cv.height/cv.width*wMm,pdf=new jspdf.jsPDF({unit:'mm',format:[wMm,h],orientation:'portrait'});pdf.addImage(cv.toDataURL('image/jpeg',.95),'JPEG',0,0,wMm,h);return pdf.output('blob')}finally{f.remove()}}
export async function saveOrShare(blob,name,share){if(share){const file=new File([blob],name,{type:'application/pdf'});if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:name});return}catch(e){if(e.name==='AbortError')return}}}
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);if(share)alert('PDF saved. Attach it in WhatsApp (direct sharing works on phones).')}
export {loadJS};
