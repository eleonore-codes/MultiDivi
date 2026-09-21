import {CONFIG as C} from './config.js';
export const STORAGE_KEY='multidivi-learning';
export const LEGACY_KEY='einmaleins-in-ruhe-v1';
export const dayKey=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export const dayOrdinal=date=>{const [y,m,d]=date.split('-').map(Number);return Math.floor(Date.UTC(y,m-1,d)/86400000);};
export const freshState=()=>({schemaVersion:C.SCHEMA_VERSION,revision:0,factMastery:{},strategyEvidence:{},dailySummaries:{},session:null,unlockedLevels:[1,2,3,4,5,6],levelProgress:{},successNumber:0,level2QualifyingSuccesses:0,currentStreak:0,longestStreak:0,lastQualifyingSuccessDate:null,practiceDays:[],learningDays:[],awardedPhases:{},cards:[],completedDates:[],selectedLevel:1});
export function migrate(raw){
  raw=structuredClone(raw);
  if(raw.schemaVersion===2){
    raw.practiceDays=[...(raw.learningDays||[])];
    raw.cards=(raw.cards||[]).map(eventSnapshot);
    raw.learningDays=[...new Set(raw.cards.map(c=>c.localDate))];
    raw.schemaVersion=3;
    for(const k of ['successNumber','currentStreak','longestStreak','revision','level2QualifyingSuccesses'])raw[k]??=0;
    raw.successNumber=Math.max(raw.successNumber,...raw.cards.map(c=>c.number),0);
    raw.awardedPhases??={};
    for(const card of raw.cards)raw.awardedPhases[card.phaseId]=card.number;
    raw.lastQualifyingSuccessDate??=null;
  }
  raw.unlockedLevels=[1,2,3,4,5,6];
  if(raw.schemaVersion!==C.SCHEMA_VERSION)throw Error('Unbekannte Datenversion. Daten bleiben erhalten.');
  // Validate before saving the migrated copy; never erase an unreadable profile.
  if(!raw.factMastery||!raw.dailySummaries||!raw.strategyEvidence||!Array.isArray(raw.unlockedLevels)||!Array.isArray(raw.learningDays)||!Array.isArray(raw.cards)||!raw.awardedPhases||!raw.levelProgress||!Array.isArray(raw.completedDates)||!Number.isInteger(raw.successNumber))throw Error('Beschädigte Daten.');
  for(const k of ['successNumber','level2QualifyingSuccesses','currentStreak','longestStreak','revision'])if(!Number.isInteger(raw[k])||raw[k]<0)throw Error('Ungültiger Zähler');
  if(!raw.unlockedLevels.includes(1)||raw.unlockedLevels.some(l=>!Number.isInteger(l)||l<1||l>6))throw Error('Ungültige Stufe');
  for(const s of Object.values(raw.factMastery))if(!Number.isInteger(s.attempts)||s.attempts<0||!Array.isArray(s.recent)||s.recent.some(r=>typeof r.ok!=='boolean'||!['firstMs','totalMs'].every(k=>r[k]===null||(Number.isFinite(r[k])&&r[k]>=0))))throw Error('Ungültige Beobachtung');
  if(raw.session&&(!['a','b','between','done'].includes(raw.session.stage)||!raw.session.id||!raw.session.rows||!Array.isArray(raw.session.rows.a)||!Array.isArray(raw.session.rows.b)||!Number.isFinite(raw.session.elapsed)||raw.session.elapsed<0))throw Error('Ungültige Sitzung');
  return raw;
}
export function eventSnapshot(card){
  return {...card,successId:card.successId||`success:${card.phaseId}`,successNumber:card.number,
    sessionId:card.sessionId||card.phaseId.replace(/:[ab]$/,''),phaseId:card.phaseId,
    localDate:card.date,timestamp:card.timestamp??null,
    trainingType:card.phase==='a'?'3-Minuten-Training':'2-Minuten-Fokustraining',
    context:{level:card.level},resultSummary:{accuracy:card.accuracy,correct:card.correct,total:card.total},
    currentStreakAtSuccess:card.streak,recognitionMessage:card.message};
}
export function loadState(storage,key=STORAGE_KEY){
  try{const raw=storage.getItem(key);if(!raw&&key===STORAGE_KEY&&storage.getItem(LEGACY_KEY))throw Error('Älteren Lernstand vor Migration prüfen');return {state:raw?migrate(JSON.parse(raw)):freshState(),legacy:!raw&&!!storage.getItem(LEGACY_KEY),blocked:false};}
  catch(error){return {state:null,blocked:true,error:'Der Lernstand kann nicht gelesen werden. Bitte die Daten sichern und prüfen lassen.'};}
}
export function saveState(state,storage,key=STORAGE_KEY){
  try{const current=storage.getItem?.(key);if(current&&JSON.parse(current).revision!==state.revision)return false;const next={...state,revision:state.revision+1};storage.setItem(key,JSON.stringify(next));state.revision=next.revision;return true;}catch{return false;}
}
export function resetState(storage,key=STORAGE_KEY){const s=freshState();const old=storage.getItem?.(key);if(old)s.revision=JSON.parse(old).revision||0;if(!saveState(s,storage,key))throw Error('Speichern nicht möglich');return s;}
export function currentStreak(state,today=dayKey()){return state.lastQualifyingSuccessDate&&dayOrdinal(today)-dayOrdinal(state.lastQualifyingSuccessDate)<=1?state.currentStreak:0;}
