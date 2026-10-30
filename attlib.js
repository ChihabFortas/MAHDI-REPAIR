// Shared attendance maths (used by attend.html and staffhr.html)
export const pad=n=>String(n).padStart(2,'0');
export const ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
export const tmin=s=>{const [h,m]=String(s||'0:0').split(':').map(Number);return (h||0)*60+(m||0)};
export const fmtH=m=>{m=Math.round(m||0);const s=m<0?'-':'';m=Math.abs(m);return s+Math.floor(m/60)+'h'+pad(m%60)};
export const clock=ts=>{if(!ts)return '';const d=ts.toDate?ts.toDate():new Date(ts);return pad(d.getHours())+':'+pad(d.getMinutes())};
export const atMs=ts=>ts&&ts.toMillis?ts.toMillis():ts&&ts.seconds?ts.seconds*1000:+ts||0;
export const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
export const monthDates=(m,upTo)=>{const [y,mo]=m.split('-').map(Number),n=new Date(y,mo,0).getDate(),o=[];for(let d=1;d<=n;d++){const s=m+'-'+pad(d);if(!upTo||s<=upTo)o.push(s)}return o};
/** what is expected of a person on a date */
export function expectedFor(date,sched,shifts,holidays,leaves){const hol=(holidays||[]).find(h=>h.date===date);if(hol)return {kind:'holiday',label:hol.name||'Holiday',min:0};
 const lv=(leaves||[]).find(l=>l.status==='approved'&&l.from<=date&&l.to>=date);if(lv)return {kind:'leave',label:lv.type,min:0};
 const ov=sched&&sched.overrides&&sched.overrides[date];const wd=new Date(date+'T12:00:00').getDay();const id=ov!==undefined?ov:(sched&&sched.days?sched.days[wd]:'');
 const sh=(shifts||[]).find(s=>s.id===id);if(!sh)return {kind:'off',label:'Day off',min:0};
 const len=tmin(sh.end)-tmin(sh.start);return {kind:'work',shift:sh,label:sh.name,min:Math.max(0,(len<0?len+1440:len)-(+sh.breakMin||0))}}
/** events of one day (sorted) -> worked minutes etc. */
export function dayCalc(ev,shift,cfg,live){const E=[...ev].sort((a,b)=>atMs(a.at)-atMs(b.at));let inAt=null,brk=null,sb=0,worked=0,breaks=0,first=null,last=null,open=false;const toM=ms=>ms/60000;
 for(const e of E){const t=atMs(e.at);if(e.type==='in'){if(inAt===null){inAt=t;sb=0;if(first===null)first=t}}else if(e.type==='breakStart'){if(inAt!==null&&brk===null)brk=t}else if(e.type==='breakEnd'){if(brk!==null){sb+=t-brk;brk=null}}else if(e.type==='out'){if(inAt!==null){if(brk!==null){sb+=t-brk;brk=null}worked+=(t-inAt)-sb;breaks+=sb;inAt=null;sb=0;last=t}}}
 let onBreak=false;if(inAt!==null){open=true;if(live){const t=Date.now();if(brk!==null){sb+=t-brk;onBreak=true}worked+=(t-inAt)-sb;breaks+=sb}}
 worked=toM(worked);breaks=toM(breaks);if(cfg&&cfg.autoBreak&&shift&&!breaks&&worked>360&&last!==null){breaks=+shift.breakMin||0;worked=Math.max(0,worked-breaks)}
 return {worked,breaks,first,last,open,onBreak,incomplete:open&&!live,count:E.length}}
/** month analytics for one person */
export function monthStats(m,logs,sched,shifts,holidays,leaves,cfg,today){const dates=monthDates(m,today),by={};logs.forEach(l=>{(by[l.date]=by[l.date]||[]).push(l)});
 const grace=+(cfg&&cfg.graceMin)||10,R={days:[],worked:0,expected:0,overtime:0,deficit:0,late:0,lateMin:0,early:0,absent:0,present:0,scheduled:0,onTime:0,incomplete:0,leaveDays:0,holidays:0,offWorked:0};
 for(const date of dates){const ex=expectedFor(date,sched,shifts,holidays,leaves),ev=by[date]||[],c=dayCalc(ev,ex.shift,cfg,date===today),row={date,ex,c,flags:[]};
  if(ex.kind==='leave')R.leaveDays++;if(ex.kind==='holiday')R.holidays++;
  if(ex.kind==='work'&&(date<today||ev.length)){R.scheduled++;R.expected+=ex.min}
  if(ev.length){R.present++;R.worked+=c.worked;if(c.incomplete){R.incomplete++;row.flags.push('missing clock-out')}
   if(ex.kind==='work'){const st=tmin(ex.shift.start),f=c.first?new Date(c.first):null,fm=f?f.getHours()*60+f.getMinutes():0;if(f&&fm>st+grace){R.late++;R.lateMin+=fm-st;row.flags.push('late '+(fm-st)+' min')}else R.onTime++;
    if(c.last&&!c.open){const l=new Date(c.last),lm=l.getHours()*60+l.getMinutes(),en=tmin(ex.shift.end);if(en>st&&lm<en-grace){R.early++;row.flags.push('left early')}}
    const diff=c.worked-ex.min;if(!c.open||date===today){if(diff>0)R.overtime+=diff;else if(date!==today)R.deficit+=-diff}}
   else{R.offWorked+=c.worked;R.overtime+=c.worked;row.flags.push('worked on '+ex.label.toLowerCase())}}
  else if(ex.kind==='work'&&date<today){R.absent++;row.flags.push('absent')}
  R.days.push(row)}
 const att=R.scheduled?(R.scheduled-R.absent)/R.scheduled*100:null,pun=R.present?R.onTime/Math.max(1,R.onTime+R.late)*100:null,hr=R.expected?Math.min(100,R.worked/R.expected*100):null;
 R.attendance=att,R.punctuality=pun,R.hoursRatio=hr;const parts=[[att,.5],[pun,.35],[hr,.15]].filter(p=>p[0]!==null),w=parts.reduce((a,p)=>a+p[1],0);R.score=parts.length?Math.round(parts.reduce((a,p)=>a+p[0]*p[1],0)/w):null;return R}
export const rating=s=>s===null?'—':s>=90?'Excellent':s>=75?'Good':s>=60?'Needs attention':'Poor';
