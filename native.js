// Runs only inside the Android/iOS app (Capacitor shell). In a normal browser it does nothing.
import {doc,setDoc,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
/* Capacitor object: this page, or the app shell that holds it in an iframe */
export const Cap=()=>{for(const w of [window,window.parent,window.top]){try{const c=w&&w.Capacitor;if(c&&c.isNativePlatform&&c.isNativePlatform())return c}catch(_){}}return null};
/* When the app loads from a web address, the shell's Capacitor object has no registerPlugin(): use its Plugins list instead */
export const plug=(c,n)=>{if(!c)return null;try{if(typeof c.registerPlugin==='function')return c.registerPlugin(n)}catch(_){}return (c.Plugins&&c.Plugins[n])||null};
const P=n=>plug(Cap(),n);
export async function nativeScan(formats){const c=Cap(),B=P('BarcodeScanner');if(!c)return null;if(!B)throw new Error('Barcode scanner plugin is missing in this app version. Update the app.');
 try{if(c.getPlatform()==='android'){const a=await B.isGoogleBarcodeScannerModuleAvailable();if(!a.available){await B.installGoogleBarcodeScannerModule();throw new Error('Scanner is being installed by Google Play services — try again in a few seconds.')}}
  const r=await B.scan({formats:formats||['QR_CODE']});return r&&r.barcodes&&r.barcodes[0]?r.barcodes[0].rawValue:''}catch(e){if(/cancel/i.test(e.message||''))return '';throw e}}
export async function initNative({db,user,role,go,closeMenu}){const c=Cap();if(!c)return;window.__native=true;document.documentElement.classList.add('native');
 try{const S=P('StatusBar');S.setOverlaysWebView&&S.setOverlaysWebView({overlay:false});S.setBackgroundColor&&S.setBackgroundColor({color:'#e8f4fa'});S.setStyle&&S.setStyle({style:'LIGHT'})}catch(_){}
 try{const A=P('App');A.addListener('backButton',()=>{if(closeMenu())return;if(history.length>1)history.back();else A.minimizeApp&&A.minimizeApp()})}catch(_){}
 try{const PN=P('PushNotifications');let r=await PN.checkPermissions();if(r.receive==='prompt'||r.receive==='prompt-with-rationale')r=await PN.requestPermissions();if(r.receive!=='granted')return;
  PN.addListener('registration',async t=>{try{await setDoc(doc(db,'fcmTokens',t.value),{uid:user.uid,role,platform:c.getPlatform(),at:serverTimestamp()})}catch(e){console.warn('token',e.message)}});
  PN.addListener('pushNotificationActionPerformed',a=>{const h=a.notification&&a.notification.data&&a.notification.data.href;if(h)go(h)});
  await PN.register()}catch(e){console.warn('push',e.message)}}
