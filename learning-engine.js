import {CONFIG as C} from './config.js';
import {LEVEL_TASKS,ALL_TASKS} from './content.js';
export const median=values=>{if(!values.length)return null;const a=[...values].sort((a,b)=>a-b),m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2;};
export function metrics(s){const r=s?.recent||[],times=r.filter(x=>x.ok&&x.firstMs!==null).map(x=>x.firstMs);return {accuracy:r.length?r.filter(x=>x.ok).length/r.length:0,firstMs:median(times),totalMs:median(r.filter(x=>x.ok&&x.totalMs!==null).map(x=>x.totalMs)),times};}
export function mastery(s,level=1){
  if(!s||s.attempts<C.SUFFICIENT_OBSERVATIONS)return 'unseen';
  const m=metrics(s);
  if(m.accuracy<C.SECURE_ACCURACY)return 'uncertain';
  if(level>=5)return s.attempts>=C.STRATEGY_MIN_OBSERVATIONS&&m.accuracy>=C.STRATEGY_ACCURACY?'secure':'unseen';
  if(m.firstMs===null)return 'unseen';
  if(m.firstMs>C.FAST_RESPONSE_MS[level])return 'slow';
  const stable=m.times.length>=C.FAST_STREAK&&Math.max(...m.times.slice(-C.FAST_STREAK))<=C.FAST_RESPONSE_MS[level]*C.STABILITY_RATIO;
  return s.attempts>=C.MASTERY_MIN_OBSERVATIONS&&m.accuracy>=C.AUTOMATIZATION_ACCURACY&&s.fastStreak>=C.FAST_STREAK&&stable?'automated':'secure';
}
export function observe(model,task,ok,timing={},now=Date.now()){
  const s=model[task.id]||={attempts:0,correct:0,incorrect:0,recent:[],fastStreak:0,last:0,level:task.level};
  const valid=v=>!timing.interrupted&&Number.isFinite(v)&&v>=0&&v<C.INTERRUPTION_MS?Math.round(v):null;
  const row={ok,firstMs:valid(timing.firstMs),totalMs:valid(timing.totalMs)};
  s.attempts++;s.correct+=Number(ok);s.incorrect+=Number(!ok);s.recent.push(row);s.recent=s.recent.slice(-C.RECENT_WINDOW);
  s.fastStreak=ok&&row.firstMs!==null&&row.firstMs<=C.FAST_RESPONSE_MS[task.level]?s.fastStreak+1:0;s.last=now;s.state=mastery(s,task.level);return row;
}
export function priority(task,model,now=Date.now()){
  const s=model[task.id];return C.PRIORITY[mastery(s,task.level)]+(s?Math.min(C.SPACED_MAX_BONUS,Math.max(0,now-s.last)/86400000/C.SPACED_DAYS):0);
}
export function focusFamilies(rows,model){
  const scores={};for(const r of rows){const weak=!r.ok?6:r.firstMs===null?1:r.firstMs>C.FAST_RESPONSE_MS[r.level]?4:mastery(model[r.id],r.level)!=='automated'?2:0;scores[r.family]=(scores[r.family]||0)+weak;}
  return Object.entries(scores).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,C.FOCUS_FAMILIES).map(([f])=>f);
}
export function selectTask(model,{level=1,recent=[],focus=[]}={},rng=Math.random,now=Date.now()){
  let pool=LEVEL_TASKS[level].filter(t=>!recent.slice(-C.SPACING_TASKS).some(r=>r.family===t.family||r.id===t.id));
  if(!pool.length)pool=LEVEL_TASKS[level];const roll=rng();let subset;
  if(focus.length&&roll<C.FOCUS_SHARE)subset=pool.filter(t=>focus.includes(t.family));
  else if(roll<(focus.length?C.FOCUS_SHARE+C.EASY_SHARE:C.EASY_SHARE))subset=pool.filter(t=>t.easy);
  else if(!focus.length&&roll<C.EASY_SHARE+C.COVERAGE_SHARE)subset=pool.filter(t=>!model[t.id]);
  if(subset?.length)pool=subset;
  const weakBases=new Set(ALL_TASKS.filter(t=>model[t.id]&&['uncertain','slow'].includes(mastery(model[t.id],t.level))).map(t=>t.baseFamily));
  const weights=pool.map(t=>priority(t,model,now)+(weakBases.has(t.baseFamily)?1:0));let choice=rng()*weights.reduce((a,b)=>a+b,0);
  return pool.find((_,i)=>(choice-=weights[i])<=0)||pool.at(-1);
}
export function distribution(model,level,filter=()=>true){const tasks=LEVEL_TASKS[level].filter(filter),counts={unseen:0,uncertain:0,slow:0,secure:0,automated:0};for(const t of tasks)counts[mastery(model[t.id],level)]++;return {total:tasks.length,counts,sufficient:tasks.length-counts.unseen};}
