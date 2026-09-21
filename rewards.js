import {CONFIG as C} from './config.js';
import {dayKey,dayOrdinal,eventSnapshot} from './storage.js';
export function qualifies(report){
  if(!report.total)return false;
  if(report.level<=4)return report.correct/report.total>=C.QUALIFYING_SUCCESS_ACCURACY&&report.total>=(report.phase==='a'?C.MIN_GENERAL_ATTEMPTS_FOR_SUCCESS:C.MIN_FOCUS_ATTEMPTS_FOR_SUCCESS);
  const onlyDrills=report.drills===report.total;
  return report.correct/report.total>=C.ADVANCED_SUCCESS_ACCURACY&&
    (onlyDrills?report.total>=C.DRILL_MIN_ATTEMPTS[report.phase]:
      (report.correctFullTasks??Math.min(report.correct,report.fullTasks))>=C.ADVANCED_MIN_TASKS[report.phase]&&report.steps>=C.ADVANCED_MIN_STEPS[report.phase]);
}
export function unlockLevels(state){state.unlockedLevels=[1,2,3,4,5,6];return [];}
export function recognition(state,report){
  if(report.development?.adequate&&report.development.after>report.development.before)return 'Bei gleichen Aufgaben hast du heute sicherer gerechnet.';
  if(report.level<=4&&report.development?.adequate&&report.development.faster>=3)return 'Gleiche Aufgaben hast du wiederholt schneller begonnen.';
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
  if(!state.learningDays.includes(date))state.learningDays.push(date);
  (state.levelProgress[report.level]||={observations:0,successes:0}).successes++;
  const card=eventSnapshot({sessionId:report.sessionId,timestamp:new Date().toISOString(),phaseId:report.id,date,number:state.successNumber,streak:state.currentStreak,accuracy:report.accuracy,correct:report.correct,total:report.total,level:report.level,phase:report.phase,message:recognition(state,report)});
  state.cards.push(card);report.successNumber=card.number;return card;
}
