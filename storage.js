import {CONFIG as C} from './config.js';
export const STORAGE_KEY='einmaleins-in-ruhe-v1';
export const dayKey=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export const freshState=()=>({version:1,model:{},level2:false,level1Attempts:0,recentLevel1:[],day:null,history:[]});
export function loadState(storage=localStorage,key=STORAGE_KEY) {
  try{const raw=storage.getItem(key);if(!raw)return {state:freshState(),error:null};const s=JSON.parse(raw);
    if(s.version!==1||!s.model||typeof s.model!=='object'||!Array.isArray(s.history)||!Array.isArray(s.recentLevel1))throw Error('Format');
    return {state:s,error:null};
  }catch{return {state:freshState(),error:'Dein Lernstand konnte nicht geladen werden. Bitte hole einen Erwachsenen dazu.',blocked:true};}
}
export function saveState(state,storage=localStorage,key=STORAGE_KEY){try{storage.setItem(key,JSON.stringify(state));return true;}catch{return false;}}
export function ensureDay(state,date=dayKey()) {
  if(state.day?.date===date)return state.day;
  if(state.day){state.history.push({date:state.day.date,stage:state.day.stage,results:state.day.results});state.history=state.history.slice(-C.HISTORY_DAYS);}
  state.day={date,stage:'ready',elapsed:0,rows:{a:[],b:[],rest:[]},results:{},focus:[],active:null,feedback:null};
  return state.day;
}
