import {CONFIG as C} from './config.js';
import {observe,focusFamilies,unlockProgress} from './learning-engine.js';
import {summarize,compare} from './statistics.js';
export function recordAnswer(state,task,ok,ms) {
  const d=state.day,s=observe(state.model,task,ok,ms);
  const row={id:task.id,family:task.family,ok,ms:s.recent.at(-1).ms};
  d.rows[d.stage].push(row);
  if(task.level===1){state.level1Attempts++;state.recentLevel1.push(row);state.recentLevel1=state.recentLevel1.slice(-C.LEVEL_2_RECENT_WINDOW);state.level2=unlockProgress(state);}
  return row;
}
export function finishPhase(state) {
  const d=state.day,phase=d.stage;d.results[phase]=summarize(d.rows[phase]);
  if(phase==='a'){d.focus=focusFamilies(d.rows.a,state.model);d.stage='between';}
  else if(phase==='b'){d.results.comparison=compare(d.rows.a,d.rows.b,d.focus);d.stage='done';}
  else d.stage=d.returnStage||'ready';
  d.elapsed=0;d.active=null;d.feedback=null;
}
