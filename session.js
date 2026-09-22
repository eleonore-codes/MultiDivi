import {CONFIG as C} from './config.js';
import {BY_ID} from './content.js';
import {observe,focusFamilies,distribution} from './learning-engine.js';
import {summarize,compare} from './statistics.js';
import {awardSuccess,unlockLevels} from './rewards.js';
import {dayKey} from './storage.js';
import {strategyDrills} from './strategy.js';
export function startSession(state,level,date=dayKey(),id=crypto.randomUUID()){
  if(![1,2,3,4,5,6].includes(level))return false;
  if(state.session&&state.session.stage!=='done')return false;
  state.session={id,date,level,stage:'a',elapsed:0,rows:{a:[],b:[]},reports:{},active:null,focus:[],drills:[],trial:null};
  return true;
}
export function recordTask(state,task,work,today=dayKey()){
  const s=state.session;if(!['a','b'].includes(s.stage))throw Error('No phase');
  const ok=work.errors.length===0,timing=observe(state.factMastery,task,ok,{firstMs:work.firstMs,totalMs:work.elapsedMs??work.totalMs,interrupted:work.interrupted});
  const row={id:task.id,family:task.family,level:task.level,ok,...timing,steps:work.checks-work.errors.length,drill:!!task.drill,errors:work.errors};
  s.rows[s.stage].push(row);
  const p=state.levelProgress[task.level]||={observations:0,successes:0,fullTasks:0,correctFullTasks:0};
  p.observations++;if(!task.drill){p.fullTasks++;p.correctFullTasks+=Number(ok);}
  if(!state.practiceDays.includes(today))state.practiceDays.push(today);
  const d=state.dailySummaries[today]||={date:today,levels:[],reports:[],successNumbers:[],streak:0,mastery:{}};
  if(!d.levels.includes(task.level))d.levels.push(task.level);
  return row;
}
export function recordEvidence(state,task,e){
  // A contextual step contributes accuracy once, never automatic retrieval speed.
  if(e.underlyingFactId&&BY_ID[e.underlyingFactId])observe(state.factMastery,BY_ID[e.underlyingFactId],e.ok,{interrupted:true});
  const key=`${task.level}:${e.component}`,s=state.strategyEvidence[key]||={attempts:0,correct:0,possiblePlaceValueErrors:0,errorTypes:{},recent:[]};
  s.attempts++;s.correct+=Number(e.ok);s.possiblePlaceValueErrors+=Number(e.possiblePlaceValueError);
  if(!e.ok)s.errorTypes[e.errorType]=(s.errorTypes[e.errorType]||0)+1;
  s.recent.push({ok:e.ok,firstMs:e.firstMs,totalMs:e.totalMs});s.recent=s.recent.slice(-C.RECENT_WINDOW);
}
export function finishPhase(state,date=dayKey()){
  const s=state.session,phase=s.stage;if(!['a','b'].includes(phase))return null;
  const id=`${s.id}:${phase}`;
  const report={...summarize(s.rows[phase]),id,sessionId:s.id,phase,level:s.level,date,development:phase==='b'?compare(s.rows.a,s.rows.b):null};
  s.reports[phase]=report;awardSuccess(state,report,date);unlockLevels(state);
  const d=state.dailySummaries[date]||={date,levels:[s.level],reports:[],successNumbers:[],streak:0,mastery:{}};
  if(!d.reports.some(r=>r.id===id))d.reports.push(report);
  if(report.successNumber&&!d.successNumbers.includes(report.successNumber))d.successNumbers.push(report.successNumber);
  d.streak=state.currentStreak;for(let l=1;l<=6;l++)d.mastery[l]=distribution(state.factMastery,l).counts;
  s.active=null;s.elapsed=0;
  if(phase==='a'){s.focus=focusFamilies(s.rows.a,state.factMastery);s.drills=strategyDrills(s.rows.a,BY_ID);s.stage='between';}
  else{s.comparison=compare(s.rows.a,s.rows.b);s.stage='done';if(!state.completedDates.includes(date))state.completedDates.push(date);if(!state.completedDates.includes(s.date))state.completedDates.push(s.date);}
  return report;
}
export function startFocus(state){const s=state.session;if(s?.stage!=='between')return false;s.stage='b';s.elapsed=0;s.active=null;return true;}
