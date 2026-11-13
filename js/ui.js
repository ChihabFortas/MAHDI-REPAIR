// Settings (theme, language, currency) + translation. Imported by every page.
const KEY='rd_settings',DEF={lang:'en',theme:'light',skin:'modern',look:'clean',palette:'mahdi',easy:false,fs:'m',density:'cozy',radius:'auto',motion:true,accent:'',cur:{sym:'$',pos:'before',dec:2}};
let st={};try{st=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
export const S={...DEF,...st};S.cur={...DEF.cur,...(st.cur||{})};
const HOOKS=[];export const onSave=f=>{HOOKS.push(f)};
export const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}HOOKS.forEach(f=>{try{f()}catch(_){}})};
/* replace this user's settings with the ones saved in their account; returns true when the language changed */
export function adopt(n){const old=S.lang;Object.keys(S).forEach(k=>delete S[k]);Object.assign(S,{...DEF,...n});S.cur={...DEF.cur,...(n.cur||{})};try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}apply();return S.lang!==old}
export const money=n=>{const v=Number(n)||0,d=S.cur.dec,s=v.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});return S.cur.pos==='before'?S.cur.sym+s:s+' '+S.cur.sym};
/* ---------- Appearance (v75) ----------
   palette = colour theme (accent + tinted neutrals), look = interface style, theme = mode (light / dark / auto).
   Old settings (skins glass/material/pme, "calm" mode, "round" corners) are migrated in apply(). */
export const PALETTES={mahdi:['Mahdi blue','#1c93c2'],ocean:['Ocean','#0369a1'],sky:['Sky','#0ea5e9'],blue:['Royal blue','#2563eb'],indigo:['Indigo','#4f46e5'],violet:['Violet','#7c3aed'],berry:['Berry','#c026d3'],rose:['Rose','#e11d48'],sunset:['Sunset','#ea580c'],amber:['Amber','#d97706'],emerald:['Emerald','#059669'],teal:['Teal','#0f766e'],forest:['Forest','#3f7d3a'],graphite:['Graphite','#475569'],sand:['Sand (warm)','#b45309']};
export const LOOKS={clean:['Clean','Calm white cards, light shadows. Best for everyday work.'],soft:['Soft','Rounder, airy and gentle, with a soft coloured background.'],bold:['Bold','Coloured top bar and strong buttons. Easy to find things fast.'],glass:['Glass','Frosted see-through cards on a colour gradient.'],flat:['Flat','No shadows, thin lines, tight and fast. For heavy data work.'],contrast:['High contrast','Darker text and borders, thick focus ring. Easiest to read.']};
export const QUICK=[['Mahdi (default)',{look:'clean',palette:'mahdi',theme:'light'}],['Ocean glass',{look:'glass',palette:'ocean',theme:'light'}],['Midnight',{look:'clean',palette:'indigo',theme:'dark'}],['Warm sand',{look:'soft',palette:'sand',theme:'light'}],['Emerald bold',{look:'bold',palette:'emerald',theme:'light'}],['Graphite pro',{look:'flat',palette:'graphite',theme:'light'}],['Rose soft',{look:'soft',palette:'rose',theme:'light'}],['Night glass',{look:'glass',palette:'violet',theme:'dark'}],['Sunset bold',{look:'bold',palette:'sunset',theme:'light'}],['High contrast',{look:'contrast',palette:'blue',theme:'light'}]];
const hx=h=>{h=String(h||'').replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16)||0;return [n>>16&255,n>>8&255,n&255]};
const mix=(a,b,w)=>{const A=hx(a),B=hx(b);return '#'+A.map((v,i)=>Math.round(v*w+B[i]*(1-w)).toString(16).padStart(2,'0')).join('')};
const WARM={light:{'--bg':'#f5f1e9','--card':'#fffdf8','--ink':'#22313a','--mut':'#677780','--line':'#e7dfd1','--sub':'#faf6ef'},dark:{'--bg':'#14110d','--card':'#1d1914','--ink':'#efe7da','--mut':'#a89b8a','--line':'#332c23','--sub':'#18140f'}};
function themeVars(pal,mode,accent){const ac=accent||(PALETTES[pal]||PALETTES.mahdi)[1];
 const V=mode==='dark'?{'--bg':mix(ac,'#0a0e14',.05),'--card':mix(ac,'#121821',.05),'--ink':'#e8edf4','--mut':'#97a3b6','--line':mix(ac,'#232d3b',.08),'--sub':mix(ac,'#0e141c',.04),'--hdr':'#080b10','--bad':'#ff8a80','--ok':'#47cd89','--warn':'#fdb022','--ac':mix(ac,'#ffffff',.86)}
  :{'--bg':mix(ac,'#f4f6f9',.035),'--card':'#ffffff','--ink':'#101828','--mut':'#5a6476','--line':mix(ac,'#e2e7ee',.06),'--sub':mix(ac,'#f8fafc',.03),'--hdr':mix(ac,'#0b1220',.35),'--bad':'#d92d20','--ok':'#079455','--warn':'#dc6803','--ac':ac};
 if(pal==='sand'&&!accent)Object.assign(V,WARM[mode==='dark'?'dark':'light']);
 return V}
const mq=typeof matchMedia==='function'?matchMedia('(prefers-color-scheme: dark)'):null;
export const modeOf=()=>S.theme==='auto'?(mq&&mq.matches?'dark':'light'):(S.theme==='dark'?'dark':'light');
function migrate(){let ch=false;const set=(k,v)=>{if(S[k]!==v){S[k]=v;ch=true}};
 if(S.skin&&S.skin!=='modern'){if(!st.look)set('look',{glass:'glass',material:'bold',pme:'flat'}[S.skin]||'clean');set('skin','modern')}
 if(S.theme==='calm'){set('theme','light');if(!S.accent&&(st.palette||'sky')==='sky')set('palette','sand')}
 if(!LOOKS[S.look])set('look','clean');if(!PALETTES[S.palette])set('palette','mahdi');if(S.radius==='round'&&!S.radiusSet)set('radius','auto');
 if(ch)try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
export function apply(){const r=document.documentElement;['--bg','--card','--ink','--mut','--line','--ac','--hdr','--bad','--sub','--ok','--warn'].forEach(k=>r.style.removeProperty(k));
 // pages marked data-fixed-design (login) keep their own look: only the language follows the saved settings
 if(r.hasAttribute('data-fixed-design')){['theme','skin','easy','fs','density','radius','look','motion'].forEach(k=>delete r.dataset[k]);r.lang=S.lang;r.dir=S.lang==='ar'?'rtl':'ltr';return}
 migrate();const mode=modeOf(),V=themeVars(S.palette,mode,S.accent);
 if(S.look==='contrast')Object.assign(V,mode==='dark'?{'--ink':'#ffffff','--mut':'#cfd8e3','--line':'#5b6b80'}:{'--ink':'#000000','--mut':'#30394a','--line':'#8a95a6'});
 Object.entries(V).forEach(([k,v])=>r.style.setProperty(k,v));r.classList.toggle('embed',window.self!==window.top);if(new URLSearchParams(location.search).get('focus'))r.classList.add('pos-focus');
 r.dataset.theme=mode;r.dataset.skin='modern';r.dataset.look=S.look||'clean';r.dataset.easy=S.easy?'1':'0';r.dataset.fs=S.fs;r.dataset.density=S.density||'cozy';r.dataset.radius=S.radius||'auto';r.dataset.motion=S.motion===false?'off':'on';r.lang=S.lang;r.dir=S.lang==='ar'?'rtl':'ltr';
 const tc=document.querySelector('meta[name=theme-color]');if(tc)tc.content=mode==='dark'?'#0a0e14':V['--ac']}
if(mq&&mq.addEventListener)mq.addEventListener('change',()=>{if(S.theme==='auto')apply()});
apply();
export const setLang=l=>{S.lang=l;save();location.reload()};
const css=`html[data-fs=s] body{font-size:13.5px!important}html[data-fs=l] body{font-size:17px!important}html[data-fs=xl] body{font-size:18.5px!important}
html[dir=rtl] th,html[dir=rtl] td{text-align:right!important}html[dir=rtl] body{font-family:Tahoma,"Segoe UI",system-ui,sans-serif}
html[data-easy="1"] body{font-size:17px!important;line-height:1.6}
html[data-easy="1"] main button,html[data-easy="1"] main input,html[data-easy="1"] main select,html[data-easy="1"] dialog input,html[data-easy="1"] dialog select,html[data-easy="1"] dialog button{padding:12px 15px!important;border-radius:12px!important}
html[data-easy="1"] .card,html[data-easy="1"] .tbl,html[data-easy="1"] .stat,html[data-easy="1"] .pr,html[data-easy="1"] .pt{border-radius:18px!important}
html[data-easy="1"] th,html[data-easy="1"] td{padding:15px 14px!important}html[data-easy="1"] .stat b{font-size:36px!important}html[data-easy="1"] .stats{gap:14px!important}
html[data-easy="1"] .tbl table{min-width:0!important}html[data-easy="1"] .tbl th:nth-child(3),html[data-easy="1"] .tbl td:nth-child(3),html[data-easy="1"] .tbl th:nth-child(7),html[data-easy="1"] .tbl td:nth-child(7){display:none}
html[data-theme=dark] main input,html[data-theme=dark] main select,html[data-theme=dark] main textarea,html[data-theme=dark] dialog input,html[data-theme=dark] dialog select,html[data-theme=dark] dialog textarea,html[data-theme=dark] #login input,html[data-theme=dark] main button:not(.p),html[data-theme=dark] dialog button:not(.p),html[data-theme=dark] .bt{background:var(--card);color:var(--ink);border-color:var(--line)}
html[data-theme=dark] .stat,html[data-theme=dark] .pr,html[data-theme=dark] .pt,html[data-theme=dark] .kp div,html[data-theme=dark] .card,html[data-theme=dark] .tbl,html[data-theme=dark] dialog,html[data-theme=dark] #login{background:var(--card);color:var(--ink)}
html[data-theme=dark] th{background:#1f2c35!important;color:var(--mut)}html[data-theme=dark] .bd{background:#26343e;color:var(--ink)}html[data-theme=dark] .tabs button.on{color:#fff}
.loc{display:inline-block;background:#e8f1ff;color:#0a3d91;border:1px solid #b9d0f5;border-radius:6px;padding:0 6px;font-size:12px;font-weight:700;white-space:nowrap;margin:1px 2px 1px 0}
.dvk{border:1px solid #cfd8e0;border-radius:10px;padding:10px;display:grid;gap:8px}.dvk label.ck{display:inline-flex;align-items:center;gap:6px;margin-inline-end:14px;color:inherit;font-size:inherit}.dvk label.ck input{width:auto;min-height:0}
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


.chip2{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;font-weight:600;font-size:12.5px;color:var(--c);background:color-mix(in srgb,var(--c) 14%,transparent);white-space:nowrap}.chip2 i{width:8px;height:8px;border-radius:50%;background:var(--c)}
html[data-skin=modern] body{background:var(--bg)}html[data-skin=modern] .card,html[data-skin=modern] .tbl,html[data-skin=modern] .kp div,html[data-skin=modern] .stat,html[data-skin=modern] .lane,html[data-skin=modern] .dc,html[data-skin=modern] .tk,html[data-skin=modern] .pr,html[data-skin=modern] .pt,html[data-skin=modern] .k2,html[data-skin=modern] .panel,html[data-skin=modern] dialog,html[data-skin=modern] #login{border-radius:16px;box-shadow:0 1px 2px rgba(16,24,40,.05),0 6px 20px rgba(16,24,40,.06)}html[data-skin=modern] th{background:transparent!important}
html[data-skin=glass]{--glass:rgba(255,255,255,.58);--glassb:rgba(255,255,255,.72)}html[data-skin=glass][data-theme=dark]{--glass:rgba(24,30,48,.52);--glassb:rgba(255,255,255,.13)}
html[data-skin=glass] body{background:radial-gradient(900px 600px at 6% -8%,color-mix(in srgb,var(--ac) 40%,transparent),transparent 62%),radial-gradient(800px 600px at 100% 8%,color-mix(in srgb,var(--ac) 22%,#ff7ad9 28%),transparent 56%),radial-gradient(900px 700px at 50% 112%,color-mix(in srgb,var(--ac) 28%,#59f0c4 26%),transparent 62%),var(--bg)!important;background-attachment:fixed}
html[data-skin=glass] .card,html[data-skin=glass] .tbl,html[data-skin=glass] .kp div,html[data-skin=glass] .stat,html[data-skin=glass] .lane,html[data-skin=glass] .dc,html[data-skin=glass] .tk,html[data-skin=glass] .pr,html[data-skin=glass] .pt,html[data-skin=glass] .k2,html[data-skin=glass] .panel,html[data-skin=glass] dialog,html[data-skin=glass] #login{background:var(--glass)!important;-webkit-backdrop-filter:blur(26px) saturate(180%);backdrop-filter:blur(26px) saturate(180%);border:1px solid var(--glassb)!important;border-radius:22px!important;box-shadow:0 12px 40px rgba(20,30,90,.14),inset 0 1px 0 rgba(255,255,255,.55)!important;color:var(--ink)}
html[data-skin=glass] .k2,html[data-skin=glass] .panel,html[data-skin=glass] .card,html[data-skin=glass] .stat,html[data-skin=glass] .dc,html[data-skin=glass] .tk,html[data-skin=glass] .pr{transition:transform .3s cubic-bezier(.2,.9,.3,1.2),box-shadow .3s;animation:rise .6s both cubic-bezier(.2,.9,.3,1)}
html[data-skin=glass] .k2:hover,html[data-skin=glass] .stat:hover,html[data-skin=glass] .pr:hover,html[data-skin=glass] .dc:hover{transform:translateY(-4px) scale(1.012)}
@keyframes rise{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:none}}
html[data-skin=glass] dialog::backdrop{-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);background:rgba(15,20,45,.32)}html[data-skin=glass] th{background:transparent!important}
html[data-skin=glass] button:not(.p):not(.d){background:rgba(255,255,255,.5)!important;border:1px solid rgba(255,255,255,.75)!important;border-radius:14px!important;color:var(--ink)!important}html[data-skin=glass][data-theme=dark] button:not(.p):not(.d){background:rgba(255,255,255,.08)!important;border-color:rgba(255,255,255,.14)!important}
html[data-skin=glass] input,html[data-skin=glass] select,html[data-skin=glass] textarea{background:rgba(255,255,255,.5)!important;border:1px solid rgba(255,255,255,.75)!important;border-radius:14px!important;color:var(--ink)!important}html[data-skin=glass][data-theme=dark] input,html[data-skin=glass][data-theme=dark] select,html[data-skin=glass][data-theme=dark] textarea{background:rgba(255,255,255,.07)!important;border-color:rgba(255,255,255,.14)!important}
html[data-skin=material] body{background:color-mix(in srgb,var(--ac) 7%,var(--bg))!important}
html[data-skin=material] .card,html[data-skin=material] .tbl,html[data-skin=material] .kp div,html[data-skin=material] .stat,html[data-skin=material] .lane,html[data-skin=material] .dc,html[data-skin=material] .tk,html[data-skin=material] .pr,html[data-skin=material] .pt,html[data-skin=material] .k2,html[data-skin=material] .panel,html[data-skin=material] dialog,html[data-skin=material] #login{background:color-mix(in srgb,var(--ac) 8%,var(--card))!important;border:0!important;border-radius:28px!important;box-shadow:none!important}html[data-skin=material] dialog{border-radius:32px!important}html[data-skin=material] th{background:transparent!important}
html[data-skin=material] button{border-radius:999px!important;font-weight:600}html[data-skin=material] button:not(.p):not(.d){background:color-mix(in srgb,var(--ac) 14%,var(--card))!important;border-color:transparent!important;color:var(--ink)!important}html[data-skin=material] button.p{background:var(--ac)!important;border-color:var(--ac)!important;color:#fff!important}
html[data-skin=material] input,html[data-skin=material] select,html[data-skin=material] textarea{border-radius:18px!important;border:1.5px solid color-mix(in srgb,var(--ac) 25%,var(--line))!important;background:color-mix(in srgb,var(--ac) 5%,var(--card))!important;color:var(--ink)}html[data-skin=material] .tabs button.on{background:color-mix(in srgb,var(--ac) 28%,var(--card))!important;color:var(--ink)!important}
[hidden]{display:none!important}html.embed #tabs{display:none!important}html.embed header,html.embed .pm-bar,html.embed .pm-tabs,html.embed .pm-ribwrap,html.embed .pm-status{display:none!important}html.embed body{padding-bottom:0!important}html.embed main{max-width:none!important;padding:18px 22px!important}
html.pos-focus main{max-width:none!important;padding:10px 14px!important}html.pos-focus .pos{grid-template-columns:minmax(0,1fr) 470px!important}html.pos-focus #st{display:none}html.pos-focus #gr{max-height:calc(100vh - 300px);overflow:auto}html.pos-focus #cl2{max-height:calc(100vh - 470px);overflow:auto}html.pos-focus .grid{grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}
.rdback{position:fixed;top:10px;inset-inline-start:12px;z-index:99;padding:8px 14px;border-radius:999px;border:1px solid var(--line);background:var(--card);color:var(--ink);box-shadow:0 4px 14px #0003;cursor:pointer;font-weight:600}
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
const RAW=`Defaults|Valeurs par défaut|الافتراضيات
Default|Par défaut|افتراضي
Empty fields use your defaults|Les champs vides prennent vos valeurs par défaut|الحقول الفارغة تأخذ القيم الافتراضية
Where does the money go?|Où va l’argent ?|أين يذهب المال؟
Repairs|Réparations|الإصلاحات
Accounting|Comptabilité|المحاسبة
Reports|Rapports|التقارير
Send the receipt by WhatsApp|Envoyer le reçu par WhatsApp|إرسال الإيصال عبر واتساب
📎 Share PDF|📎 Partager le PDF|📎 مشاركة PDF
💬 WhatsApp customer|💬 WhatsApp client|💬 واتساب العميل
This customer has no phone number.|Ce client n’a pas de numéro de téléphone.|هذا العميل ليس لديه رقم هاتف.
Excel|Excel|Excel
Export to Excel (CSV)|Exporter vers Excel (CSV)|تصدير إلى Excel (CSV)
KPIs|Indicateurs clés|المؤشرات
Printers|Imprimantes|الطابعات
Receipts|Reçus|الإيصالات
Device tickets & labels|Étiquettes appareils|ملصقات الأجهزة
Special invoices|Factures spéciales|الفواتير الخاصة
Reports & statistics|Rapports et statistiques|التقارير والإحصائيات
Customer receipts, sale tickets, credit notes (thermal 80 mm)|Reçus clients, tickets de vente, avoirs (thermique 80 mm)|إيصالات العملاء وتذاكر البيع (حرارية 80 مم)
Sticker glued to the device, part labels (45 × 35 mm)|Étiquette collée sur l’appareil, étiquettes pièces (45 × 35 mm)|ملصق على الجهاز وملصقات القطع (45 × 35 مم)
Sales and purchase invoices, delivery notes (A4)|Factures de vente et d’achat, bons de livraison (A4)|فواتير البيع والشراء ووصولات التسليم (A4)
Proforma and credit note invoices (A4)|Factures proforma et avoirs (A4)|الفواتير الأولية وفواتير الإرجاع (A4)
Dashboards, KPIs, statistics, staff reports (A4)|Tableaux de bord, KPI, statistiques, rapports (A4)|لوحات المتابعة والمؤشرات والإحصائيات (A4)
Default printer|Imprimante par défaut|الطابعة الافتراضية
Print directly (QZ Tray)|Imprimer directement (QZ Tray)|طباعة مباشرة (QZ Tray)
Test|Tester|تجربة
Test print|Impression de test|طباعة تجريبية
Save printers|Enregistrer les imprimantes|حفظ الطابعات
🔍 Find printers|🔍 Chercher les imprimantes|🔍 البحث عن الطابعات
Saved ✓ (this computer)|Enregistré ✓ (cet ordinateur)|تم الحفظ ✓ (هذا الجهاز)
QZ Tray not found|QZ Tray introuvable|لم يتم العثور على QZ Tray
printers found.|imprimantes trouvées.|طابعات.
QZ Tray is running. Documents print straight to the chosen printer, without the print window.|QZ Tray est actif. Les documents partent directement vers l’imprimante choisie, sans fenêtre d’impression.|QZ Tray يعمل. تُطبع المستندات مباشرة على الطابعة المختارة دون نافذة الطباعة.
Direct printing needs the free QZ Tray app on this computer. Without it, the print window opens and a message tells you which printer to pick.|L’impression directe nécessite l’application gratuite QZ Tray sur cet ordinateur. Sans elle, la fenêtre d’impression s’ouvre et un message indique l’imprimante à choisir.|الطباعة المباشرة تحتاج تطبيق QZ Tray المجاني على هذا الجهاز. بدونه تُفتح نافذة الطباعة وتظهر رسالة باسم الطابعة المطلوبة.
is not in the problem list yet.|n’est pas encore dans la liste des pannes.|غير موجود في قائمة الأعطال بعد.
Add it for everyone?|L’ajouter pour tout le monde ?|إضافته للجميع؟
Add to list|Ajouter à la liste|أضف إلى القائمة
Only this ticket|Seulement ce ticket|لهذه التذكرة فقط
Added to the problem list|Ajouté à la liste des pannes|أضيف إلى قائمة الأعطال
Saved on this computer only. Ask the admin to publish the new Firestore rules to share it.|Enregistré sur cet ordinateur seulement. Demandez à l’admin de publier les nouvelles règles Firestore pour le partager.|حُفظ على هذا الجهاز فقط. اطلب من المسؤول نشر قواعد Firestore الجديدة لمشاركته.
Add photos of what you find during the repair, like water damage or a swollen battery.|Ajoutez des photos de ce que vous trouvez pendant la réparation, comme une oxydation ou une batterie gonflée.|أضف صور ما تجده أثناء الإصلاح، مثل أثر الماء أو بطارية منتفخة.
No camera found. Choose a picture instead.|Aucune caméra trouvée. Choisissez une image.|لم يتم العثور على كاميرا. اختر صورة بدلاً من ذلك.
Default device type|Type d'appareil par défaut|نوع الجهاز الافتراضي
Default repair level|Niveau de réparation par défaut|مستوى الإصلاح الافتراضي
Default problem|Panne par défaut|العطل الافتراضي
Default technician|Technicien par défaut|الفني الافتراضي
Default accessories|Accessoires par défaut|الملحقات الافتراضية
Standard defaults|Valeurs standard|القيم القياسية
Save as my defaults|Enregistrer comme mes valeurs|حفظ كقيم افتراضية لي
Customer & device|Client et appareil|الزبون والجهاز
Problem & condition|Panne et état|العطل والحالة
Price & planning|Prix et planning|السعر والتخطيط
Unknown device|Appareil inconnu|جهاز غير معروف
Edit ticket|Modifier le ticket|تعديل التذكرة
Optional|Facultatif|اختياري
Density|Densité|الكثافة
Compact|Compact|مضغوط
Comfortable|Confortable|مريح
Spacious|Aéré|واسع
Corners|Coins|الحواف
Sharp|Nets|حادة
Rounded|Arrondis|مستديرة
Soft|Doux|ناعمة
Layout|Disposition|التخطيط
Search pages and actions…|Rechercher pages et actions…|ابحث عن الصفحات والإجراءات…
Search|Rechercher|بحث
Favorites|Favoris|المفضلة
Recent|Récents|الأخيرة
All pages|Toutes les pages|كل الصفحات
Pin to favorites|Épingler aux favoris|تثبيت في المفضلة
Unpin|Désépingler|إلغاء التثبيت
No match|Aucun résultat|لا نتائج
to open|pour ouvrir|للفتح
to move|pour naviguer|للتنقل
Quick search|Recherche rapide|بحث سريع
Dashboard|Tableau de bord|لوحة التحكم
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
↩ Return after repair|↩ Retour après réparation|↩ إرجاع بعد الإصلاح
Return after repair|Retour après réparation|إرجاع بعد الإصلاح
Customer name or phone|Nom ou téléphone du client|اسم العميل أو هاتفه
Return reason|Motif du retour|سبب الإرجاع
Same problem|Même panne|نفس العطل
Another problem|Autre panne|عطل آخر
Create ticket & print receipt|Créer le ticket et imprimer le reçu|إنشاء التذكرة وطباعة الإيصال
↩ Return|↩ Retour|↩ إرجاع
Request a part|Demander une pièce|طلب قطعة
Part|Pièce|القطعة
Parts needed|Pièces à commander|قطع مطلوبة
Requested parts arrived|Pièces demandées arrivées|وصلت القطع المطلوبة
Done|Terminé|تم
Return without repair|Restitution sans réparation|إرجاع دون إصلاح
Returned without repair|Restitué sans réparation|أُعيد دون إصلاح
Unrepairable|Irréparable|غير قابل للإصلاح
Customer decision|Décision du client|قرار العميل
Customer declined|Client a refusé|رفض العميل
High price|Prix élevé|سعر مرتفع
Customer doesn't want to lose data|Le client ne veut pas perdre ses données|العميل لا يريد فقدان بياناته
Part unavailable – customer does not want to wait|Pièce indisponible – le client ne veut pas attendre|القطعة غير متوفرة – العميل لا يريد الانتظار
Customer wants diagnosis only|Le client veut seulement le diagnostic|العميل يريد التشخيص فقط
Reason|Motif|السبب
Diagnosis fee (0 if none):|Frais de diagnostic (0 si aucun) :|رسوم التشخيص (0 إن لم توجد):
Out of stock – flagged to inventory.|Rupture de stock – signalé à l'inventaire.|نفد من المخزون – تم إبلاغ المخزون.
Return without repair ?|Restitution sans réparation ?|إرجاع دون إصلاح ؟
Create purchase order|Créer un bon de commande|إنشاء أمر شراء
Repaired|Réparés|المُصلَحة
Returns|Retours|المرتجعات
Return rate|Taux de retour|نسبة الإرجاع
Data loss|Perte de données|فقدان البيانات
Part unavailable|Pièce indisponible|قطعة غير متوفرة
Diagnosis only|Diagnostic seulement|التشخيص فقط
Returns after repair (month)|Retours après réparation (mois)|المرتجعات بعد الإصلاح (الشهر)
Returned without repair (month)|Restitués sans réparation (mois)|المُعادة دون إصلاح (الشهر)
Ordered|Commandée|تم الطلب
Closed|Clôturée|مغلقة
Device type|Type d'appareil|نوع الجهاز
Smartphone|Smartphone|هاتف ذكي
Tablet|Tablette|لوحي
Other|Autre|أخرى
No SIM card|Sans carte SIM|بدون شريحة
1 SIM card|1 carte SIM|شريحة واحدة
2 SIM cards|2 cartes SIM|شريحتان
SIM tray present|Tiroir SIM présent|حامل الشريحة موجود
Phone cover|Coque du téléphone|غطاء الهاتف
Plastic cover|Film plastique|غلاف بلاستيكي
SIM tray opener|Outil d'ouverture SIM|أداة فتح حامل الشريحة
Charger present|Chargeur présent|الشاحن موجود
Shelf (1–36)|Étagère (1–36)|رف (1–36)
Drawer (1–300)|Tiroir (1–300)|درج (1–300)
Charging drawer (1–300)|Tiroir connecteurs de charge (1–300)|درج منافذ الشحن (1–300)
Next free|Prochain libre|التالي الشاغر
Select a type first.|Choisissez d'abord un type.|اختر النوع أولاً.
No free location.|Aucun emplacement libre.|لا يوجد موقع شاغر.
Movement|Mouvement|الحركة
Analysis|Analyse|التحليل
Stock analysis|Analyse du stock|تحليل المخزون
Total in|Total entrées|إجمالي الوارد
Total out|Total sorties|إجمالي الصادر
Last price by supplier|Dernier prix par fournisseur|آخر سعر لكل مورّد
Purchase price history|Historique des prix d'achat|سجل أسعار الشراء
Price changes|Changements de prix|تغيّرات الأسعار
Last purchase|Dernier achat|آخر شراء
Average purchase price|Prix d'achat moyen|متوسط سعر الشراء
Lowest / highest|Plus bas / plus haut|الأدنى / الأعلى
Total purchased|Total acheté|إجمالي المشتريات
Total sold / used|Total vendu / utilisé|إجمالي المبيعات / المستخدم
Change|Variation|التغيّر
Received (purchase)|Reçu (achat)|مستلم (شراء)
Delivered / out|Livré / sorti|مسلّم / صادر
POS sale|Vente caisse|بيع نقطة البيع
Used in repair|Utilisé en réparation|مستخدم في الإصلاح
Issued to technician|Remis au technicien|مسلّم للفني
Taken back from technician|Repris du technicien|مسترجع من الفني
Adjustment|Ajustement|تعديل
Storage map|Plan de stockage|خريطة التخزين
Mahdi Repair – Storage map|Mahdi Repair – Plan de stockage|Mahdi Repair – خريطة التخزين
Shelves|Étagères|الرفوف
Drawers|Tiroirs|الأدراج
Charging drawers|Tiroirs connecteurs de charge|أدراج منافذ الشحن
Find a part|Trouver une pièce|ابحث عن قطعة
Free|Libres|شاغرة
Print labels|Imprimer les étiquettes|طباعة الملصقات
Other locations|Autres emplacements
Live board|Tableau en direct|اللوحة المباشرة
Mahdi Repair – Live board|Mahdi Repair – Tableau en direct|Mahdi Repair – اللوحة المباشرة
All technicians|Tous les techniciens|كل الفنيين
Only late|Seulement en retard|المتأخرة فقط
Received with|Reçu avec|استُلم مع
History|Historique|السجل
Open in reception desk|Ouvrir à l'accueil|فتح في مكتب الاستقبال
Dashboard|Tableau de bord|لوحة التحكم
Good day|Bonne journée|يوم سعيد
Tickets today|Tickets du jour|تذاكر اليوم
In progress|En cours|قيد التنفيذ
Waiting approval|Attente d'accord|بانتظار الموافقة
Due today|À livrer aujourd'hui|مستحقة اليوم
Late|En retard|متأخر
Repaired today|Réparés aujourd'hui|مُصلَحة اليوم
Parts needed|Pièces à commander|قطع مطلوبة
Sales today|Ventes du jour|مبيعات اليوم
Refunds today|Remboursements du jour|مرتجعات اليوم
Cash in registers|Argent en caisse|النقد في الصناديق
Receivables|Créances|المستحقات
Devices in repair|Appareils en réparation|الأجهزة قيد الإصلاح
Devices by technician|Appareils par technicien
Received, last 14 days|Reçus, 14 derniers jours|المستلمة، آخر 14 يوماً
Current repairs|Réparations en cours|الإصلاحات الجارية
List|Liste|قائمة
Board|Tableau|لوحة
Device|Appareil|الجهاز
New|Nouveau|جديد
Ready|Prêt|جاهز
Edit ticket|Modifier le ticket|تعديل التذكرة
Parts & quote|Pièces & devis|القطع وعرض السعر
Close|Fermer|إغلاق
Technician|Technicien|الفني
Status|Statut|الحالة
Exit|Quitter|خروج
Exit POS|Quitter la caisse|الخروج من نقطة البيع
Exit full screen|Quitter le plein écran|الخروج من ملء الشاشة
Workshop|Atelier|الورشة
Sales|Ventes|المبيعات
Finance|Finance|المالية
Inventory|Inventaire|المخزون
Menu|Menu|القائمة
Interface style|Style d'interface|نمط الواجهة
Modern|Moderne|عصري
iOS glass|Verre iOS|زجاج iOS
Android 16|Android 16|Android 16
PME classic|PME classique|PME الكلاسيكي
Color palette|Palette de couleurs|لوحة الألوان
Custom color|Couleur personnalisée|لون مخصص
Mode|Mode|الوضع
Back|Retour|رجوع
← Back|← Retour|→ رجوع
WhatsApp|WhatsApp|واتساب
SMS|SMS|رسالة نصية
Copy message|Copier le message|نسخ الرسالة
Ready – not notified|Prêt – non notifié|جاهز – لم يُبلَّغ
CRM dashboard|Tableau de bord CRM|لوحة علاقات العملاء
Mahdi Repair – CRM dashboard|Mahdi Repair – Tableau de bord CRM|Mahdi Repair – لوحة علاقات العملاء
Customers|Clients|العملاء
Customer messages|Messages clients|رسائل العملاء
Country code (digits, e.g. 213)|Indicatif pays (chiffres, ex. 213)|رمز الدولة (أرقام، مثل 213)
Default customer language|Langue par défaut du client|لغة العميل الافتراضية
Scan to track|Scannez pour suivre|امسح للتتبع
How was our service?|Comment était notre service ?|كيف كانت خدمتنا؟
Your comment (optional)|Votre commentaire (facultatif)|تعليقك (اختياري)
Send|Envoyer|إرسال
Please choose a rating|Veuillez choisir une note|الرجاء اختيار تقييم
Thank you for your feedback!|Merci pour votre avis !|شكراً لملاحظاتك!
Customers served|Clients servis|العملاء المخدومون
Repeat customers|Clients fidèles|العملاء المتكررون
Incomplete repairs|Réparations non abouties|إصلاحات غير مكتملة
Completion rate|Taux d'achèvement|نسبة الإنجاز
Quote approval|Acceptation des devis|قبول عروض الأسعار
Avg repair time|Durée moyenne|متوسط مدة الإصلاح
On-time delivery|Livraison à temps|التسليم في الوقت
Average rating|Note moyenne|متوسط التقييم
Satisfied (4–5 ★)|Satisfaits (4–5 ★)|راضون (4–5 ★)
Review rate|Taux d'avis|نسبة التقييم
Customers notified|Clients notifiés|العملاء المُبلَّغون
Satisfaction|Satisfaction|الرضا
Top customers|Meilleurs clients|أفضل العملاء
Customer comments|Commentaires clients|تعليقات العملاء
Visits|Visites|الزيارات
Rating|Note|التقييم
Supplier payments|Règlements fournisseurs|دفعات الموردين
Copy|Copie|نسخة
Part details editor|Éditeur de fiches pièces|محرر تفاصيل القطع
Not reviewed|Non vérifié|غير مراجَع
No image|Sans image|بدون صورة
Reviewed|Vérifié|تمت مراجعته
Reference|Référence|المرجع
Compatible devices|Appareils compatibles|الأجهزة المتوافقة
Tidy spelling|Corriger l'orthographe|تصحيح الإملاء
Save & next|Enregistrer et suivant|حفظ والتالي
Skip ▶|Passer ▶|تخطي ◀
Notes|Notes|ملاحظات
Save|Enregistrer|حفظ
Discard changes|Annuler les modifications|تجاهل التغييرات
Unsaved changes|Modifications non enregistrées|تغييرات غير محفوظة
Saved ✓|Enregistré ✓|تم الحفظ ✓
Toolbar|Barre d'outils|شريط الأدوات
Parts requests|Demandes de pièces|طلبات القطع
Issued parts|Pièces remises|القطع المسلّمة
System|Système|النظام
Users|Utilisateurs|المستخدمون
Demo data|Données de démo|بيانات تجريبية
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
Display|Affichage|العرض
Analytics (AI)|Analyses (IA)|التحليلات (ذكاء اصطناعي)
Daily stock check|Contrôle de stock quotidien|الجرد اليومي
Blind count (hide app quantity)|Comptage à l’aveugle (masquer la quantité de l’app)|جرد أعمى (إخفاء كمية التطبيق)
＋ 5 more items|＋ 5 articles de plus|＋ 5 عناصر أخرى
Search or scan an item to check it now…|Chercher ou scanner un article à vérifier…|ابحث أو امسح عنصراً لجرده الآن…
Accuracy (30 days)|Précision (30 jours)|الدقة (30 يوماً)
Catalog checked (30 days)|Catalogue vérifié (30 jours)|الكتالوج المجرود (30 يوماً)
Net difference today|Écart net aujourd’hui|صافي الفرق اليوم
Fix stock|Corriger le stock|تصحيح المخزون
Check now|Vérifier|جرد الآن
✓ Same|✓ Identique|✓ نفسه
Last 14 days|14 derniers jours|آخر 14 يوماً
Checked|Vérifiés|تم جردها
Matched|Conformes|مطابقة
Value of differences|Valeur des écarts|قيمة الفروقات
Items that are most often wrong|Articles les plus souvent faux|العناصر الأكثر خطأً
Annual leave|Congé annuel|إجازة سنوية
Sick leave|Congé maladie|إجازة مرضية
Unpaid leave|Congé sans solde|إجازة بدون أجر
Attendance|Présence|الحضور
Hours worked|Heures travaillées|ساعات العمل
Expected so far|Prévu jusqu’ici|المتوقع حتى الآن
Overtime|Heures supplémentaires|ساعات إضافية
Late arrivals|Retards|التأخيرات
Absences|Absences|الغيابات
Leave requests|Demandes de congé|طلبات الإجازة
My week|Ma semaine|أسبوعي
Not clocked in|Pas encore pointé|لم تسجّل الحضور
Point the camera at the code shown on the shop screen.|Pointez la caméra vers le code affiché sur l’écran du magasin.|وجّه الكاميرا نحو الرمز المعروض على شاشة المحل.
Request leave|Demander un congé|طلب إجازة
Scan the QR code|Scanner le code QR|امسح رمز QR
Send request|Envoyer la demande|إرسال الطلب
＋ Request leave|＋ Demander un congé|＋ طلب إجازة
📷 Scan the shop QR code|📷 Scanner le code QR du magasin|📷 امسح رمز QR الخاص بالمحل
Scanner could not load (check your connection)|Le scanner n’a pas pu se charger (vérifiez la connexion)|تعذّر تحميل الماسح (تحقق من الاتصال)
The end date is before the start date.|La date de fin est avant la date de début.|تاريخ النهاية قبل تاريخ البداية.
The scanner is being installed by Google Play services. Try again in a few seconds.|Le scanner est en cours d’installation par Google Play. Réessayez dans quelques secondes.|يجري تثبيت الماسح عبر خدمات Google Play. حاول مجدداً بعد ثوانٍ.
The shop code is missing or expired. Scan the QR code on the shop screen again (the screen must stay open).|Le code du magasin est absent ou expiré. Scannez à nouveau le code QR sur l’écran du magasin (l’écran doit rester ouvert).|رمز المحل غير موجود أو منتهي. امسح رمز QR على شاشة المحل مجدداً (يجب أن تبقى الشاشة مفتوحة).
This is not the shop attendance code.|Ce n’est pas le code de pointage du magasin.|هذا ليس رمز حضور المحل.
To clock in or out, scan the QR code shown at the shop with your phone camera (or tap “Scan”).|Pour pointer, scannez le code QR affiché au magasin avec la caméra de votre téléphone (ou touchez « Scanner »).|لتسجيل الحضور أو الانصراف امسح رمز QR المعروض في المحل بكاميرا هاتفك (أو اضغط «مسح»).
✔ Shop code received — you can clock now.|✔ Code du magasin reçu — vous pouvez pointer.|✔ تم استلام رمز المحل — يمكنك التسجيل الآن.
Cancel this request?|Annuler cette demande ?|إلغاء هذا الطلب؟
Clock in|Pointer l’arrivée|تسجيل الحضور
Clock out|Pointer le départ|تسجيل الانصراف
Break started|Pause commencée|بدأت الاستراحة
Break ended|Pause terminée|انتهت الاستراحة
▶ Clock in|▶ Pointer l’arrivée|▶ تسجيل الحضور
■ Clock out|■ Pointer le départ|■ تسجيل الانصراف
☕ Start break|☕ Commencer la pause|☕ بدء الاستراحة
▶ End break|▶ Terminer la pause|▶ إنهاء الاستراحة
No records yet today.|Aucun enregistrement aujourd’hui.|لا توجد تسجيلات اليوم بعد.
Home|Accueil|الرئيسية
Alerts|Alertes|التنبيهات
Clock|Pointage|الحضور
Cheque|Chèque|شيك
Scan the barcode here (or type code / phone / name)…|Scannez le code-barres ici (ou saisissez code / téléphone / nom)…|امسح الباركود هنا (أو اكتب الرمز / الهاتف / الاسم)…
Scan the barcode on the receipt or on the sticker behind the device.|Scannez le code-barres du reçu ou de l’autocollant au dos de l’appareil.|امسح الباركود الموجود على الوصل أو على الملصق خلف الجهاز.
The ticket opens here and you can hand the device over and collect the payment.|Le ticket s’ouvre ici et vous pouvez remettre l’appareil et encaisser le paiement.|تُفتح التذكرة هنا ويمكنك تسليم الجهاز وقبض المبلغ.
Enter the customer’s national ID number for the certificate.|Saisissez le numéro de la carte d’identité nationale du client pour l’attestation.|أدخل رقم بطاقة التعريف الوطنية للزبون من أجل الشهادة.
📤 Hand over|📤 Remise|📤 تسليم
📷 Camera|📷 Caméra|📷 الكاميرا
Photos of the device|Photos de l’appareil|صور الجهاز
Take photo|Prendre une photo|التقاط صورة
Appearance|Apparence|المظهر
Language & currency|Langue et devise|اللغة والعملة
Repairs & tickets|Réparations et tickets|الإصلاحات والتذاكر
Security & access|Sécurité et accès|الأمان والصلاحيات
About|À propos|حول التطبيق
✨ Quick themes|✨ Thèmes rapides|✨ سمات جاهزة
One click sets the style, colours and mode together. Fine-tune below.|Un clic règle le style, les couleurs et le mode. Affinez plus bas.|نقرة واحدة تضبط النمط والألوان والوضع معاً. عدّل التفاصيل في الأسفل.
🧩 Style|🧩 Style|🧩 النمط
How cards, buttons and the top bar look.|L’apparence des cartes, des boutons et de la barre du haut.|شكل البطاقات والأزرار والشريط العلوي.
🎨 Colour|🎨 Couleur|🎨 اللون
The main colour of buttons, highlights and the menu. Backgrounds are tuned to match.|La couleur principale des boutons, des sélections et du menu. Les fonds s’accordent automatiquement.|اللون الرئيسي للأزرار والتحديد والقائمة. تتناسق الخلفيات معه تلقائياً.
Your own colour|Votre couleur|لونك الخاص
Use the theme colour|Utiliser la couleur du thème|استخدام لون السمة
🌗 Mode|🌗 Mode|🌗 الوضع
☀️ Light|☀️ Clair|☀️ فاتح
🌙 Dark|🌙 Sombre|🌙 داكن
🖥 Automatic|🖥 Automatique|🖥 تلقائي
Extra large|Très grand|كبير جداً
Density (space between things)|Densité (espacement)|الكثافة (المسافات)
Style default|Selon le style|حسب النمط
⚙ Comfort|⚙ Confort|⚙ الراحة
Animations|Animations|الحركات
Smooth movements and transitions. Turn off on slow computers.|Mouvements et transitions fluides. À couper sur les ordinateurs lents.|حركات وانتقالات سلسة. أوقفها على الأجهزة البطيئة.
Easy view|Affichage simplifié|العرض المبسّط
Bigger text and a simpler dashboard.|Texte plus grand et tableau de bord simplifié.|نص أكبر ولوحة متابعة أبسط.
Reset appearance|Réinitialiser l’apparence|إعادة ضبط المظهر
Back to Mahdi blue, Clean, Light.|Retour au bleu Mahdi, style Net, mode clair.|العودة إلى أزرق مهدي، النمط النظيف، الوضع الفاتح.
Changes show here and on this page at once. Press Save to keep them on all your devices.|Les changements s’affichent ici tout de suite. Cliquez sur Enregistrer pour les garder sur tous vos appareils.|تظهر التغييرات هنا فوراً. اضغط حفظ للاحتفاظ بها على كل أجهزتك.
Clean|Net|نظيف
Calm white cards, light shadows. Best for everyday work.|Cartes blanches sobres, ombres légères. Idéal au quotidien.|بطاقات بيضاء هادئة وظلال خفيفة. الأفضل للعمل اليومي.
Rounder, airy and gentle, with a soft coloured background.|Plus arrondi, aéré et doux, avec un fond légèrement coloré.|أكثر استدارة وهدوءاً مع خلفية ملونة خفيفة.
Bold|Affirmé|بارز
Coloured top bar and strong buttons. Easy to find things fast.|Barre du haut colorée et boutons marqués. On trouve tout vite.|شريط علوي ملون وأزرار واضحة. تجد كل شيء بسرعة.
Glass|Verre|زجاجي
Frosted see-through cards on a colour gradient.|Cartes translucides sur un dégradé de couleurs.|بطاقات شفافة مثلجة على تدرج لوني.
Flat|Plat|مسطّح
No shadows, thin lines, tight and fast. For heavy data work.|Sans ombres, lignes fines, compact. Pour beaucoup de données.|بدون ظلال، خطوط رفيعة ومضغوط. للعمل الكثيف بالبيانات.
High contrast|Contraste élevé|تباين عالٍ
Darker text and borders, thick focus ring. Easiest to read.|Texte et bordures plus foncés, contour épais. Le plus lisible.|نص وحدود أغمق وإطار تركيز سميك. الأسهل قراءة.
Mahdi (default)|Mahdi (par défaut)|مهدي (افتراضي)
Ocean glass|Verre océan|زجاج المحيط
Warm sand|Sable chaud|رمل دافئ
Emerald bold|Émeraude affirmé|زمردي بارز
Graphite pro|Graphite pro|جرافيت احترافي
Rose soft|Rose doux|وردي ناعم
Night glass|Verre de nuit|زجاج ليلي
Sunset bold|Couchant affirmé|غروب بارز
Mahdi blue|Bleu Mahdi|أزرق مهدي
Ocean|Océan|المحيط
Royal blue|Bleu roi|أزرق ملكي
Berry|Baie|توتي
Sunset|Couchant|غروب
Forest|Forêt|غابة
Sand (warm)|Sable (chaud)|رملي (دافئ)
🌐 Language|🌐 Langue|🌐 اللغة
The language of menus, buttons and messages.|La langue des menus, boutons et messages.|لغة القوائم والأزرار والرسائل.
💱 Currency|💱 Devise|💱 العملة
How amounts are written everywhere in the app.|La façon d’écrire les montants dans l’application.|طريقة كتابة المبالغ في كل التطبيق.
🔔 Alerts on the Reception desk|🔔 Alertes à la réception|🔔 تنبيهات مكتب الاستقبال
Sound for new quote answers|Son pour les réponses aux devis|صوت عند الرد على عروض الأسعار
Beep when a customer accepts or refuses a price.|Bip quand un client accepte ou refuse un prix.|تنبيه صوتي عند قبول أو رفض العميل للسعر.
📝 New ticket defaults|📝 Valeurs par défaut des tickets|📝 القيم الافتراضية للتذاكر
🔒 Session|🔒 Session|🔒 الجلسة
Sign out automatically after|Déconnexion automatique après|تسجيل الخروج تلقائياً بعد
Shop default|Réglage de la boutique|إعداد المحل
Never|Jamais|أبداً
Fix display problems|Corriger les problèmes d’affichage|إصلاح مشاكل العرض
Clear and reload|Vider et recharger|مسح وإعادة التحميل
🛡 Access rights|🛡 Droits d’accès|🛡 الصلاحيات
Access rights by role|Droits d’accès par rôle|الصلاحيات حسب الدور
Users and roles|Utilisateurs et rôles|المستخدمون والأدوار
ℹ About|ℹ À propos|ℹ حول التطبيق
↺ Reset|↺ Réinitialiser|↺ إعادة الضبط
Reset all my settings|Réinitialiser tous mes réglages|إعادة ضبط كل إعداداتي
Reset everything|Tout réinitialiser|إعادة ضبط الكل
Reset all your settings to the defaults?|Réinitialiser tous vos réglages ?|إعادة كل إعداداتك إلى الافتراضي؟
Saved ✓ (your account)|Enregistré ✓ (votre compte)|تم الحفظ ✓ (حسابك)
Saved to your account and used on every device.|Enregistré dans votre compte et utilisé sur tous vos appareils.|يُحفظ في حسابك ويُستخدم على كل أجهزتك.
Signed in as|Connecté en tant que|متصل باسم
Who can open each page|Qui peut ouvrir chaque page|من يمكنه فتح كل صفحة
Save access rights|Enregistrer les droits|حفظ الصلاحيات
Restore defaults|Rétablir par défaut|استعادة الافتراضي
💬 WhatsApp PDF|💬 PDF par WhatsApp|💬 PDF عبر واتساب
PDF saved. Drag it into the WhatsApp chat that just opened.|PDF enregistré. Glissez-le dans la discussion WhatsApp qui vient de s’ouvrir.|تم حفظ PDF. اسحبه إلى محادثة واتساب التي فُتحت.
PDF saved. This customer has no phone number.|PDF enregistré. Ce client n’a pas de numéro de téléphone.|تم حفظ PDF. هذا العميل ليس لديه رقم هاتف.
Desk camera|Caméra du comptoir|كاميرا المكتب
Take picture|Capturer|التقاط
No photos yet|Aucune photo pour l’instant|لا توجد صور بعد
Camera error:|Erreur caméra :|خطأ في الكاميرا:
Maximum 8 photos per ticket|Maximum 8 photos par ticket|الحد الأقصى 8 صور لكل تذكرة
🎥 Desk camera|🎥 Caméra du comptoir|🎥 كاميرا المكتب
🖼 Upload|🖼 Importer|🖼 رفع صورة
Add at least one problem|Ajoutez au moins un problème|أضف عطلاً واحداً على الأقل
Choose a problem – you can add several|Choisissez un problème – vous pouvez en ajouter plusieurs|اختر عطلاً – يمكنك إضافة عدة أعطال
Your settings are saved to your account and follow you on every device.|Vos paramètres sont enregistrés dans votre compte et vous suivent sur chaque appareil.|إعداداتك محفوظة في حسابك وتتبعك على كل جهاز.
Open ticket|Ouvrir le ticket|فتح التذكرة
Hand over (scan)|Remise (scan)|تسليم (مسح)
Hand over to customer|Remise au client|التسليم للزبون
Amount due|Montant dû|المبلغ المستحق
Amount collected now|Montant encaissé maintenant|المبلغ المقبوض الآن
Payment method|Mode de paiement|طريقة الدفع
Customer rating (optional)|Note du client (facultatif)|تقييم الزبون (اختياري)
✔ Hand over the device|✔ Remettre l’appareil|✔ تسليم الجهاز
Put the whole amount on credit (pay next time)|Mettre tout le montant à crédit (paiement la prochaine fois)|وضع كامل المبلغ كدَين (يدفع لاحقاً)
Customer will pay by (date)|Le client paiera avant le (date)|يدفع الزبون قبل (التاريخ)
Parts used|Pièces utilisées|القطع المستعملة
National ID number *|N° de carte d’identité nationale *|رقم بطاقة التعريف الوطنية *
IMEI / serial (optional)|IMEI / série (facultatif)|IMEI / الرقم التسلسلي (اختياري)
Repair done|Réparation effectuée|التصليح المنجز
Customer has no receipt (lost / forgotten) → sign a certificate|Le client n’a pas son reçu (perdu / oublié) → faire signer une attestation|الزبون ليس لديه وصل (ضائع / منسي) ← توقيع شهادة
🖨 Print hand-over certificate|🖨 Imprimer l’attestation de remise|🖨 طباعة شهادة التسليم
+ Add item|+ Ajouter un élément|+ إضافة عنصر
+ New task|+ Nouvelle tâche|+ مهمة جديدة
All projects|Tous les projets|كل المشاريع
Assigned to|Assigné à|مُسنَد إلى
Checklist|Liste de contrôle|قائمة المراجعة
Comments|Commentaires|التعليقات
Delete this project?|Supprimer ce projet ?|حذف هذا المشروع؟
Delete this task?|Supprimer cette tâche ?|حذف هذه المهمة؟
Description|Description|الوصف
Edit project|Modifier le projet|تعديل المشروع
New project|Nouveau projet|مشروع جديد
Edit task|Modifier la tâche|تعديل المهمة
New task|Nouvelle tâche|مهمة جديدة
Everyone|Tout le monde|الجميع
High|Haute|عالية
Low|Basse|منخفضة
Urgent|Urgente|عاجلة
In review|En révision|قيد المراجعة
To do|À faire|للإنجاز
Later / no date|Plus tard / sans date|لاحقاً / بدون تاريخ
Linked ticket / order (optional)|Ticket / commande liée (facultatif)|تذكرة / طلب مرتبط (اختياري)
My tasks|Mes tâches|مهامي
No project|Aucun projet|بدون مشروع
Only the assignee or a manager can change this task.|Seul le responsable ou un manager peut modifier cette tâche.|يمكن للمُسنَد إليه أو المدير فقط تعديل هذه المهمة.
Overdue|En retard|متأخرة
Priority|Priorité|الأولوية
Project|Projet|المشروع
Projects|Projets|المشاريع
Task|Tâche|مهمة
Team workload|Charge de l’équipe|عبء عمل الفريق
This project still has tasks. Delete or move them first.|Ce projet contient encore des tâches. Supprimez-les ou déplacez-les d’abord.|لا يزال في هذا المشروع مهام. احذفها أو انقلها أولاً.
This week|Cette semaine|هذا الأسبوع
Write a comment…|Écrire un commentaire…|اكتب تعليقاً…
✅ Tasks|✅ Tâches|✅ المهام
Tasks|Tâches|المهام
Devices by technician|Appareils par technicien|الأجهزة حسب الفني
Done this week|Terminées cette semaine|المنجزة هذا الأسبوع
My next tasks|Mes prochaines tâches|مهامي القادمة
Open Tasks|Ouvrir les tâches|فتح المهام
Project progress|Avancement des projets|تقدم المشاريع
✅ Tasks &amp; projects|✅ Tâches et projets|✅ المهام والمشاريع
Catalog builder|Constructeur de catalogue|منشئ الكتالوج
Clock-in QR (kiosk)|QR de pointage (borne)|رمز QR للحضور (الشاشة)
Counter dashboard|Tableau du comptoir|لوحة المبيعات
Import products|Importer des produits|استيراد المنتجات
Marketing|Marketing|التسويق
My attendance|Ma présence|حضوري
Notifications|Notifications|الإشعارات
Online orders|Commandes en ligne|الطلبات الإلكترونية
Online shop|Boutique en ligne|المتجر الإلكتروني
Staff attendance|Présence du personnel|حضور الموظفين
Wholesale clients|Clients grossistes|زبائن الجملة
✕ Exit full screen|✕ Quitter le plein écran|✕ إنهاء ملء الشاشة
Cracked screen|Écran fissuré|شاشة مكسورة
Screen not working|Écran ne fonctionne pas|الشاشة لا تعمل
Touch not responding|Tactile ne répond pas|اللمس لا يستجيب
Display lines / spots|Lignes / taches sur l'écran|خطوط / بقع على الشاشة
Battery drains fast|Batterie se décharge vite|البطارية تنفد بسرعة
Does not charge|Ne charge pas|لا يشحن
Does not power on|Ne s'allume pas|لا يعمل / لا يشتغل
Water damage|Dégât des eaux|تضرر بالماء
Broken back glass|Vitre arrière cassée|الزجاج الخلفي مكسور
Camera not working|Caméra ne fonctionne pas|الكاميرا لا تعمل
Speaker not working|Haut-parleur ne fonctionne pas|مكبّر الصوت لا يعمل
Microphone not working|Microphone ne fonctionne pas|الميكروفون لا يعمل
Earpiece not working|Écouteur interne ne fonctionne pas|سماعة المكالمات لا تعمل
No network / no signal|Pas de réseau / pas de signal|لا توجد شبكة / لا إشارة
Wi-Fi / Bluetooth not working|Wi-Fi / Bluetooth ne fonctionne pas|الواي فاي / البلوتوث لا يعمل
Buttons not working|Boutons ne fonctionnent pas|الأزرار لا تعمل
Overheating|Surchauffe|سخونة زائدة
Software / system problem|Problème logiciel / système|مشكل في النظام / البرمجيات
Forgot password / locked|Mot de passe oublié / verrouillé|نسيان كلمة السر / الجهاز مقفل
Slow / freezing|Lent / se fige|بطيء / يتجمد
Rebooting by itself|Redémarre tout seul|يعيد التشغيل لوحده
Fell / physical damage|Chute / dommage physique|سقوط / ضرر مادي
Fingerprint / Face ID not working|Empreinte / Face ID ne fonctionne pas|البصمة / Face ID لا تعمل
Vibration not working|Vibreur ne fonctionne pas|الاهتزاز لا يعمل
SIM not detected|SIM non détectée|الشريحة غير مكتشفة
Needs diagnosis|Nécessite un diagnostic|يحتاج إلى تشخيص
No display|Pas d'affichage|لا توجد صورة
Display lines / flickering|Lignes / scintillement de l'écran|خطوط / وميض في الشاشة
Overheating / loud fan|Surchauffe / ventilateur bruyant|سخونة / مروحة مزعجة
Windows / system problem|Problème Windows / système|مشكل في ويندوز / النظام
Virus / malware|Virus / logiciel malveillant|فيروس / برمجيات خبيثة
Blue screen|Écran bleu|شاشة زرقاء
Keyboard not working|Clavier ne fonctionne pas|لوحة المفاتيح لا تعمل
Touchpad not working|Pavé tactile ne fonctionne pas|لوحة اللمس لا تعمل
Hard drive / SSD failure|Panne disque dur / SSD|عطل القرص الصلب / SSD
Needs more RAM / upgrade|Besoin de plus de RAM / mise à niveau|يحتاج رام إضافية / ترقية
Wi-Fi not working|Wi-Fi ne fonctionne pas|الواي فاي لا يعمل
No sound|Pas de son|لا يوجد صوت
USB / ports not working|USB / ports ne fonctionnent pas|منافذ USB لا تعمل
Hinge / body broken|Charnière / boîtier cassé|المفصلة / الهيكل مكسور
Black|Noir|أسود
White|Blanc|أبيض
Silver|Argent|فضي
Gray|Gris|رمادي
Space Gray|Gris sidéral|رمادي فلكي
Gold|Or|ذهبي
Rose Gold|Or rose|ذهبي وردي
Blue|Bleu|أزرق
Dark Blue|Bleu foncé|أزرق غامق
Light Blue|Bleu clair|أزرق فاتح
Green|Vert|أخضر
Dark Green|Vert foncé|أخضر غامق
Mint|Menthe|نعناعي
Red|Rouge|أحمر
Pink|Rose|وردي
Purple|Violet|بنفسجي
Violet|Mauve|أرجواني
Orange|Orange|برتقالي
Yellow|Jaune|أصفر
Titanium|Titane|تيتانيوم
Graphite|Graphite|جرافيت
Midnight|Minuit|منتصف الليل
Starlight|Lumière stellaire|ضوء النجوم
Bronze|Bronze|برونزي
Brown|Marron|بني
Beige|Beige|بيج
Cream|Crème|كريمي
Lavender|Lavande|لافندر
Coral|Corail|مرجاني
Turquoise|Turquoise|فيروزي
Multicolor|Multicolore|متعدد الألوان`;
const D=new Map();RAW.split('\n').forEach(l=>{const [e,f,a]=l.split('|');D.set(e,{fr:f,ar:a})});
const PAT=[[/^(\d+) in stock( · .*)?$/,'$1 en stock$2','$1 في المخزون$2'],[/^Out of stock( · .*)?$/,'Rupture de stock$1','نفد من المخزون$1'],[/^(\d+) available$/,'$1 disponible(s)','$1 متوفر'],[/^Held \((\d+)\)$/,'En attente ($1)','معلّق ($1)'],[/^(\d+) items$/,'$1 articles','$1 عنصر'],[/^Quote total: (.*)$/,'Total du devis : $1','إجمالي العرض: $1'],[/^Total: (.*)$/,'Total : $1','المجموع: $1'],[/^(.*) \(late\)$/,'$1 (en retard)','$1 (متأخر)'],[/^Quote (.+)$/,'Devis $1','عرض $1'],[/^Clocked out · (.*) worked$/,'Parti · $1 travaillées','تم الانصراف · عمل $1'],[/^On break since (.*)$/,'En pause depuis $1','في استراحة منذ $1'],[/^Working since (.*) · (.*)$/,'Au travail depuis $1 · $2','يعمل منذ $1 · $2'],[/^Camera not available: (.*)$/,'Caméra indisponible : $1','الكاميرا غير متاحة: $1'],[/^Could not complete the hand-over: (.*)$/,'Impossible de terminer la remise : $1','تعذّر إتمام التسليم: $1'],[/^Print failed: (.*)$/,'Échec de l’impression : $1','فشلت الطباعة: $1'],[/^Role: (.*)$/,'Rôle : $1','الدور: $1'],[/^User: (.*)$/,'Utilisateur : $1','المستخدم: $1'],[/^(.*) – repair tracking$/,'$1 – suivi des réparations','$1 – تتبع الإصلاح']];
export function t(s){if(S.lang==='en')return s;const k=String(s).trim();if(!k)return s;const e=D.get(k);if(e&&e[S.lang])return String(s).replace(k,()=>e[S.lang]);
 for(const [re,fr,ar] of PAT)if(re.test(k)){const v=k.replace(re,S.lang==='fr'?fr:ar);return String(s).replace(k,()=>v)}return s}
function walk(n){if(n.nodeType===3){const v=t(n.nodeValue);if(v!==n.nodeValue)n.nodeValue=v;else if(S.lang==='ar'&&n.parentElement&&/[A-Za-z]{3}/.test(v)&&!/[\u0600-\u06FF]/.test(v)&&!n.parentElement.hasAttribute('dir')&&!/^(OPTION|SCRIPT|STYLE|TEXTAREA|CODE)$/.test(n.parentElement.tagName))n.parentElement.setAttribute('dir','auto');return}
 if(n.nodeType!==1||/^(SCRIPT|STYLE|TEXTAREA)$/.test(n.tagName))return;
 for(const a of ['placeholder','title','data-label']){const x=n.getAttribute&&n.getAttribute(a);if(x){const v=t(x);if(v!==x)n.setAttribute(a,v)}}
 n.childNodes.forEach(walk)}
function chrome(){const h=document.querySelector('header');if(!h||h.dataset.ui||h.classList.contains('sh-top'))return;h.dataset.ui=1;
 const sel=document.createElement('select');sel.style.cssText='width:auto;padding:6px;background:transparent;color:#fff;border:1px solid #4a5b68;border-radius:8px';
 [['en','EN'],['fr','FR'],['ar','AR']].forEach(([v,l])=>{const o=new Option(l,v);o.style.color='#000';sel.add(o)});sel.value=S.lang;sel.onchange=()=>setLang(sel.value);
 const b=document.createElement('button');b.className='uic';sel.className='uic';b.textContent='⚙ Settings';b.onclick=()=>location.href=new URL('../pages/admin/settings.html',import.meta.url).href;
 const lo=h.querySelector('#lo');if(lo){h.insertBefore(b,lo);h.insertBefore(sel,lo)}else h.append(b,sel)}
function labelTables(){document.querySelectorAll('main table').forEach(t=>{const hs=[...t.querySelectorAll('thead th')].map(h=>h.textContent.trim());if(!hs.length)return;t.classList.add('stack');
 t.querySelectorAll('tbody tr').forEach(tr=>[...tr.children].forEach((td,i)=>{if(td.colSpan===1&&hs[i]&&td.getAttribute('data-label')!==hs[i])td.setAttribute('data-label',hs[i])}))})}
function embedKit(){const emb=window.self!==window.top;
 if(emb&&(window.name||'').startsWith('rd:')&&window.name.slice(3)!==location.pathname.split('/').pop()){const b=document.createElement('button');b.className='rdback';b.textContent='← Back';b.onclick=()=>history.back();document.body.append(b)}
 if(emb)['click','keydown','mousemove','touchstart'].forEach(e=>addEventListener(e,()=>{const n=Date.now();if(n-(window.__fw||0)>5000){window.__fw=n;try{window.top.dispatchEvent(new Event('mousemove'))}catch(x){}}},{passive:true}))}
addEventListener('storage',e=>{if(e.key!==KEY)return;try{const n=JSON.parse(e.newValue||'{}'),old=S.lang;Object.keys(S).forEach(k=>delete S[k]);Object.assign(S,{...DEF,...n});S.cur={...DEF.cur,...(n.cur||{})};apply();if(S.lang!==old)location.reload()}catch(x){}});
/* v74: no browser autofill in the app. Chrome ignores autocomplete="off" on name/phone/address fields, but it does
   not fill a field whose autocomplete value it does not know. The app's own suggestion lists (<datalist>) keep working.
   A field can opt back in with the attribute data-autofill (the login name). */
const AF_SKIP=/^(checkbox|radio|file|hidden|button|submit|reset|range|color|image)$/i;
function noAutofill(root){if(!root||root.nodeType!==1)return;const L=root.matches&&root.matches('input,textarea,select,form')?[root]:[];if(root.querySelectorAll)L.push(...root.querySelectorAll('input,textarea,select,form'));
 for(const el of L){if(el.hasAttribute('data-autofill')||el.dataset.afx)continue;el.dataset.afx='1';
  if(el.tagName==='FORM'){el.setAttribute('autocomplete','off');continue}
  if(el.tagName==='INPUT'&&AF_SKIP.test(el.type))continue;
  if(el.type==='password'){el.setAttribute('autocomplete','new-password')}else el.setAttribute('autocomplete','rd-'+(el.name||el.id||'f')+'-off');
  el.setAttribute('data-lpignore','true');el.setAttribute('data-1p-ignore','true');el.setAttribute('data-bwignore','true');el.setAttribute('data-form-type','other')}}
function init(){const st=document.createElement('style');st.textContent=css+`
@media(max-width:900px){html.embed header{display:flex!important;flex-wrap:nowrap!important;overflow-x:auto;white-space:nowrap;gap:8px!important;padding:8px 10px!important;background:var(--card)!important;color:var(--ink)!important;border-bottom:1px solid var(--line);position:sticky;top:0;z-index:6;-webkit-overflow-scrolling:touch}
html.embed header h1,html.embed header .uic,html.embed header #lo{display:none!important}
html.embed header button,html.embed header select{flex:none;background:var(--card)!important;color:var(--ink)!important;border:1px solid var(--line)!important;font-size:14px;padding:8px 12px}
html.embed header button.p,html.embed header button[id=nw]{background:var(--ac)!important;color:#fff!important;border-color:var(--ac)!important}
.bar>label{flex:0 0 auto!important}.bar>input:not([type]),.bar>input[type=text],.bar>input[type=search]{flex:1 1 100%!important;min-width:100%!important}}`;document.head.appendChild(st);chrome();embedKit();
 const mob=matchMedia('(max-width:700px)');let q=0;const later=()=>{if(!mob.matches||q)return;q=requestAnimationFrame(()=>{q=0;labelTables()})};
 if(S.lang!=='en')walk(document.body);later();
 if(S.skin==='pme')document.addEventListener('click',e=>{const tr=e.target.closest('main table tbody tr');if(tr&&!e.target.closest('button,input,select,a')){document.querySelectorAll('tr.psel').forEach(x=>x.classList.remove('psel'));tr.classList.add('psel')}});
 noAutofill(document.body);new MutationObserver(ms=>ms.forEach(m=>{const el=m.target,v=el.getAttribute('autocomplete');if(el.tagName==='FORM'||el.hasAttribute('data-autofill')||el.type==='password'||(el.tagName==='INPUT'&&AF_SKIP.test(el.type))||/-off$/.test(v||''))return;delete el.dataset.afx;noAutofill(el)})).observe(document.body,{subtree:true,attributes:true,attributeFilter:['autocomplete']});new MutationObserver(ms=>{ms.forEach(m=>m.addedNodes.forEach(noAutofill));if(S.lang!=='en')ms.forEach(m=>{m.addedNodes.forEach(walk);if(m.type==='characterData')walk(m.target)});later()}).observe(document.body,{childList:true,subtree:true,characterData:true});
 if(S.lang!=='en')for(const f of ['alert','confirm','prompt']){const o=window[f].bind(window);window[f]=(m,...r)=>o(t(String(m)),...r)}}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
