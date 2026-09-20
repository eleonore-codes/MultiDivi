import {CONFIG as C} from './config.js';
export const PLACES=['Einer','Zehner','Hunderter','Tausender'];
export const newInput=()=>({digits:[],lastDigit:null,lastTap:null});
export function enterDigit(input,digit,now) {
  if(!Number.isInteger(digit)||digit<0||digit>9||input.digits.length>=C.MAX_DIGITS)return false;
  // Ignore only near-simultaneous duplicate events. Intentional 00 and 22 remain valid.
  if(input.lastDigit===digit&&input.lastTap!==null&&now-input.lastTap<C.DOUBLE_TAP_MS)return false;
  input.digits.push(digit);input.lastDigit=digit;input.lastTap=now;return true;
}
export function backspace(input){input.digits.pop();input.lastTap=null;input.lastDigit=null;}
export const inputValue=input=>input.digits.length?input.digits.reduce((sum,d,i)=>sum+d*10**i,0):null;
export const inputDisplay=input=>input.digits.length?[...input.digits].reverse().join(''):'□';
export const activePlace=input=>PLACES[input.digits.length]||'Zahl vollständig?';
export const possiblePlaceValueError=(expected,actual)=>actual!==null&&expected!==actual&&((expected>0&&actual===expected/10)||(actual>0&&actual===expected*10)||(String(expected).replaceAll('0','')===String(actual).replaceAll('0','')));
