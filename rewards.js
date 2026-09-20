import {CONFIG as C} from './config.js';
import {distribution} from './learning-engine.js';
import {dayKey,dayOrdinal} from './storage.js';
export function qualifies(report){
  if(!report.total)return false;
  if(report.level<=4)return report.correct/report.total>=C.QUALIFYING_SUCCESS_ACCURACY&&report.total>=(report.phase==='a'?C.MIN_GENERAL_ATTEMPTS_FOR_SUCCESS:C.MIN_FOCUS_ATTEMPTS_FOR_SUCCESS);
  const onlyDrills=report.drills===report.total;
  return report.correct/report.total>=C.ADVANCED_SUCCESS_ACCURACY&&
    (onlyDrills?report.total>=C.DRILL_MIN_ATTEMPTS[report.phase]:
      report.fullTasks>=C.ADVANCED_MIN_TASKS[report.phase]&&report.steps>=C.ADVANCED_MIN_STEPS[report.phase]);
}
export function unlockLevels(state){
  const opened=[];
  for(const [key,rule] of Object.entries(C.UNLOCK)){
    const level=Number(key);if(state.unlockedLevels.includes(level)||!state.unlockedLevels.includes(rule.prerequisite))continue;
    const p=state.levelProgress[rule.prerequisite]||{},d=distribution(state.factMastery,rule.prerequisite);
    const yes=level===2?state.level2QualifyingSuccesses>=C.LEVEL_2_REQUIRED_SUCCESSES:
      (p.successes||0)>=rule.successes&&(p.observations||0)>=rule.observations&&
      (!rule.coverage||(d.counts.secure+d.counts.automated)/d.total>=rule.coverage)&&
      (!rule.strategyCompetence||((p.fullTasks||0)>=rule.minStrategyTasks&&(p.correctFullTasks||0)/p.fullTasks>=rule.strategyCompetence));
    if(yes){state.unlockedLevels.push(level);opened.push(level);}
  }return opened;
}
export function recognition(state,report){
  if([5,10,20,30,50,100].includes(state.currentStreak))return `Schon ${state.currentStreak} Tage in Folge erfolgreich gelernt!`;
  const messages=['Stark geübt!','Du bleibst dran.','Heute wieder konzentriert gelernt.','Übung für Übung kommst du weiter.','Dranbleiben lohnt sich.'];
  return messages[(state.successNumber-1)%messages.length];
}
export function awardSuccess(state,report,date=dayKey()){
  if(state.awardedPhases[report.id])return state.cards.find(c=>c.phaseId===report.id)||null;
  if(!qualifies(report))return null;
  state.successNumber++;
  state.awardedPhases[report.id]=state.successNumber;
  const gap=state.lastQualifyingSuccessDate?dayOrdinal(date)-dayOrdinal(state.lastQualifyingSuccessDate):null;
  if(gap!==0){state.currentStreak=gap===1?state.currentStreak+1:1;state.lastQualifyingSuccessDate=date;}
  state.longestStreak=Math.max(state.longestStreak,state.currentStreak);
  state.level2QualifyingSuccesses=Math.min(C.LEVEL_2_REQUIRED_SUCCESSES,state.level2QualifyingSuccesses+1);
  (state.levelProgress[report.level]||={observations:0,successes:0}).successes++;
  const card={phaseId:report.id,date,number:state.successNumber,streak:state.currentStreak,accuracy:report.accuracy,correct:report.correct,total:report.total,level:report.level,phase:report.phase,message:recognition(state,report)};
  state.cards.push(card);report.successNumber=card.number;return card;
}
