import {CONFIG as C} from './config.js';
import {TASKS,REMAINDERS} from './content.js';
export const median = values => {if(!values.length)return null;const a=[...values].sort((x,y)=>x-y),m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2;};
export function metrics(s) {
  const recent=s?.recent||[], accuracy=recent.length?recent.filter(x=>x.ok).length/recent.length:0;
  const speed=median(recent.filter(x=>x.ok&&x.ms!==null).map(x=>x.ms));
  return {accuracy,speed};
}
export function mastery(s,level=1) {
  if(!s?.attempts)return 'new';
  const {accuracy,speed}=metrics(s),fast=level===2?C.REMAINDER_FAST_RESPONSE_MS:C.FAST_RESPONSE_MS;
  if(s.attempts>=C.MASTERY_MIN_ATTEMPTS&&accuracy>=C.MASTERY_ACCURACY&&speed!==null&&speed<=fast&&s.streak>=C.MASTERY_FAST_STREAK)return 'automated';
  if(accuracy<C.SECURE_ACCURACY)return 'uncertain';
  if(speed===null||speed>fast)return 'slow';
  return s.attempts>=C.SECURE_MIN_ATTEMPTS?'secure':'learning';
}
export function observe(model,task,ok,ms,now=Date.now()) {
  const s=model[task.id] ||= {attempts:0,correct:0,incorrect:0,recent:[],streak:0,last:0};
  s.attempts++; s.correct+=Number(ok); s.incorrect+=Number(!ok);
  // Interruptions count towards accuracy, but do not poison speed estimates.
  const timed=Number.isFinite(ms)&&ms>=0&&ms<C.INTERRUPTION_MS?Math.round(ms):null;
  s.recent.push({ok,ms:timed});s.recent=s.recent.slice(-C.RECENT_WINDOW);
  s.streak=ok&&timed!==null&&timed<=(task.level===2?C.REMAINDER_FAST_RESPONSE_MS:C.FAST_RESPONSE_MS)?s.streak+1:0;
  s.last=now;s.state=mastery(s,task.level);s.score=({new:0,uncertain:.15,slow:.4,learning:.5,secure:.75,automated:1})[s.state];
  return s;
}
export function priority(task,model,now=Date.now()) {
  const s=model[task.id],state=mastery(s,task.level);
  let weight=({new:3,uncertain:10,slow:7,learning:4,secure:2,automated:.6})[state];
  if(s)weight+=Math.min(3,(now-s.last)/86400000/3);
  // Related facts inform selection; they never manufacture mastery of an unseen form.
  const related=TASKS.filter(t=>t.family===task.family&&t.id!==task.id).map(t=>model[t.id]).filter(Boolean);
  if(related.some(x=>['uncertain','slow'].includes(mastery(x))))weight+=1;
  return weight;
}
export function selectTask(model,{level=1,recent=[],focus=[]}={},rng=Math.random,now=Date.now()) {
  const source=level===2?REMAINDERS:TASKS;
  const last=recent.slice(-C.SPACING_TASKS);
  let pool=source.filter(t=>!last.some(x=>x.id===t.id||x.label===t.label||x.family===t.family));
  if(!pool.length)pool=source.filter(t=>t.id!==recent.at(-1)?.id);
  const choice=rng();
  let subset;
  if(focus.length&&choice<C.FOCUS_SHARE)subset=pool.filter(t=>focus.includes(t.family));
  else if(choice<(focus.length?C.FOCUS_SHARE+C.EASY_SHARE:C.EASY_SHARE))subset=pool.filter(t=>t.easy);
  else if(!focus.length&&choice<C.EASY_SHARE+C.COVERAGE_SHARE)subset=pool.filter(t=>!model[t.id]);
  if(subset?.length)pool=subset;
  const weights=pool.map(t=>priority(t,model,now)),total=weights.reduce((a,b)=>a+b,0);
  let target=rng()*total;
  return pool.find((_,i)=>(target-=weights[i])<=0)||pool.at(-1);
}
export function focusFamilies(rows,model) {
  const scores={};
  // First revisit mistakes. If there were none, use slow or unstable facts instead.
  const errors=rows.filter(row=>!row.ok);
  for(const row of errors.length?errors:rows){const s=model[row.id];scores[row.family]=(scores[row.family]||0)+(!row.ok?5:row.ms===null?2:row.ms>C.FAST_RESPONSE_MS?3:mastery(s)!=='automated'?1:0);}
  return Object.entries(scores).sort((a,b)=>b[1]-a[1]).slice(0,C.FOCUS_FAMILIES).map(([id])=>id);
}
export function unlockProgress(state) {
  const recent=state.recentLevel1||[],timed=recent.filter(x=>x.ok&&x.ms!==null).map(x=>x.ms);
  const mastered=TASKS.filter(t=>mastery(state.model[t.id])==='automated');
  const families=new Set(TASKS.map(t=>t.family));
  const observedFamilies=new Set(TASKS.filter(t=>state.model[t.id]?.attempts>=C.SECURE_MIN_ATTEMPTS).map(t=>t.family));
  const accuracy=recent.length?recent.filter(x=>x.ok).length/recent.length:0,speed=median(timed);
  const operations=['product','quotient'].every(form=>TASKS.filter(t=>t.form===form&&mastery(state.model[t.id])==='automated').length/100>=C.LEVEL_2_MIN_MASTERY_COVERAGE);
  return state.level2 || (state.level1Attempts>=C.LEVEL_2_MIN_OBSERVATIONS&&recent.length>=C.LEVEL_2_MIN_RECENT_OBSERVATIONS&&timed.length>=C.LEVEL_2_MIN_RECENT_OBSERVATIONS&&accuracy>=C.LEVEL_2_MIN_ACCURACY&&speed!==null&&speed<=C.LEVEL_2_MAX_MEDIAN_MS&&mastered.length/TASKS.length>=C.LEVEL_2_MIN_MASTERY_COVERAGE&&observedFamilies.size/families.size>=C.LEVEL_2_MIN_FAMILY_COVERAGE&&operations);
}
