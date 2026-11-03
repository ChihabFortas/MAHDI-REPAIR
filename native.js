// Runs only inside the Android/iOS app (Capacitor shell). In a normal browser it does nothing.
import {doc,setDoc,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
export const Cap=()=>window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform()?window.Capacitor:null;
const P=n=>{const c=Cap();return c?c.registerPlugin(n):null};
export async function nativeScan(){const c=Cap(),B=P('BarcodeScanner');if(!c||!B)return null;
 try{if(c.getPlatform()==='android'){const a=await B.isGoogleBarcodeScannerModuleAvailable();if(!a.available){await B.installGoogleBarcodeScannerModule();throw new Error('Scanner is being installed by Google Play services — try again in a few seconds.')}}
  const r=await B.scan({formats:['QR_CODE']});return r&&r.barcodes&&r.barcodes[0]?r.barcodes[0].rawValue:''}catch(e){if(/cancel/i.test(e.message||''))return '';throw e}}
export async function initNative({db,user,role,go,closeMenu}){const c=Cap();if(!c)return;window.__native=true;document.documentElement.classList.add('native');
 try{const S=P('StatusBar');S.setBackgroundColor&&S.setBackgroundColor({color:'#e8f4fa'});S.setStyle&&S.setStyle({style:'LIGHT'})}catch(_){}
 try{const A=P('App');A.addListener('backButton',()=>{if(closeMenu())return;if(history.length>1)history.back();else A.minimizeApp&&A.minimizeApp()})}catch(_){}
 try{const PN=P('PushNotifications');let r=await PN.checkPermissions();if(r.receive==='prompt'||r.receive==='prompt-with-rationale')r=await PN.requestPermissions();if(r.receive!=='granted')return;
  PN.addListener('registration',async t=>{try{await setDoc(doc(db,'fcmTokens',t.value),{uid:user.uid,role,platform:c.getPlatform(),at:serverTimestamp()})}catch(e){console.warn('token',e.message)}});
  PN.addListener('pushNotificationActionPerformed',a=>{const h=a.notification&&a.notification.data&&a.notification.data.href;if(h)go(h)});
  await PN.register()}catch(e){console.warn('push',e.message)}}
