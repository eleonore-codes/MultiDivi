import {CONFIG as C} from './config.js';
export const STORAGE_KEY='multidivi-learning';
export const LEGACY_KEY='einmaleins-in-ruhe-v1';
export const dayKey=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export const dayOrdinal=date=>{const [y,m,d]=date.split('-').map(Number);return Math.floor(Date.UTC(y,m-1,d)/86400000);};
export const freshState=()=>({schemaVersion:C.SCHEMA_VERSION,revision:0,factMastery:{},strategyEvidence:{},dailySummaries:{},session:null,unlockedLevels:[1],levelProgress:{},successNumber:0,level2QualifyingSuccesses:0,currentStreak:0,longestStreak:0,lastQualifyingSuccessDate:null,learningDays:[],awardedPhases:{},cards:[],completedDates:[],selectedLevel:1});
export function migrate(raw){
  if(raw.schemaVersion!==C.SCHEMA_VERSION)throw Error('Unbekannte Datenversion. Daten bleiben erhalten.');
  // Add a migration here before increasing SCHEMA_VERSION. Never fall back to an empty profile.
  if(!raw.factMastery||!raw.dailySummaries||!raw.strategyEvidence||!Array.isArray(raw.unlockedLevels)||!Array.isArray(raw.learningDays)||!Array.isArray(raw.cards)||!raw.awardedPhases||!raw.levelProgress||!Array.isArray(raw.completedDates)||!Number.isInteger(raw.successNumber))throw Error('Beschädigte Daten.');
  for(const k of ['successNumber','level2QualifyingSuccesses','currentStreak','longestStreak','revision'])if(!Number.isInteger(raw[k])||raw[k]<0)throw Error('Ungültiger Zähler');
  if(!raw.unlockedLevels.includes(1)||raw.unlockedLevels.some(l=>!Number.isInteger(l)||l<1||l>6))throw Error('Ungültige Stufe');
  for(const s of Object.values(raw.factMastery))if(!Number.isInteger(s.attempts)||s.attempts<0||!Array.isArray(s.recent)||s.recent.some(r=>typeof r.ok!=='boolean'||!['firstMs','totalMs'].every(k=>r[k]===null||(Number.isFinite(r[k])&&r[k]>=0))))throw Error('Ungültige Beobachtung');
  if(raw.session&&(!['a','b','between','done'].includes(raw.session.stage)||!raw.session.id||!raw.session.rows||!Array.isArray(raw.session.rows.a)||!Array.isArray(raw.session.rows.b)||!Number.isFinite(raw.session.elapsed)||raw.session.elapsed<0))throw Error('Ungültige Sitzung');
  return raw;
}
export function loadState(storage,key=STORAGE_KEY){
  try{const raw=storage.getItem(key);return {state:raw?migrate(JSON.parse(raw)):freshState(),legacy:!raw&&!!storage.getItem(LEGACY_KEY),blocked:false};}
  catch(error){return {state:null,blocked:true,error:'Der Lernstand kann nicht gelesen werden. Bitte die Daten sichern und prüfen lassen.'};}
}
export function saveState(state,storage,key=STORAGE_KEY){
  try{state.revision++;storage.setItem(key,JSON.stringify(state));return true;}catch{return false;}
}
export function resetState(storage,key=STORAGE_KEY){const s=freshState();if(!saveState(s,storage,key))throw Error('Speichern nicht möglich');return s;}
export function currentStreak(state,today=dayKey()){return state.lastQualifyingSuccessDate&&dayOrdinal(today)-dayOrdinal(state.lastQualifyingSuccessDate)<=1?state.currentStreak:0;}
