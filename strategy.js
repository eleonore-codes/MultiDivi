import {possiblePlaceValueError} from './place-value.js';
export function newWork(task){return {taskId:task.id,stage:task.level===5?'decompose':task.level===6?'choose':'answer',decomp:[],partials:{},selected:null,remaining:task.dividend,quotients:[],chunks:[],chunk:null,errors:[],checks:0,feedback:null,done:false,firstMs:null,totalMs:0,interrupted:false,quotient:null};}
export function selectPartial(work,index){if(work.stage!=='partials'||work.partials[index]!==undefined)return false;work.selected=index;return true;}
export function promptFor(task,w){
  if(task.drill)return {label:task.label,expected:task.answer,component:task.component};
  if(task.level<=4)return {label:task.level===2?(w.stage==='rest'?`${task.label} · Rest`:`${task.label} · Ergebnis`):task.label,expected:w.stage==='rest'?task.remainder:task.answer,component:w.stage==='rest'?'remainder':'fact'};
  if(task.level===5){
    if(w.stage==='decompose'){const i=w.decomp.length,n=i<2?task.a:task.b;return {label:`${n}: ${i%2===0?'Zehnerzahl':'Einerzahl'}?`,expected:task.decomposition.flat()[i],component:'decomposition'};}
    if(w.stage==='partials'&&w.selected!==null){const p=task.partials[w.selected];return {label:`${p.label} = □`,expected:p.answer,component:'partial-product'};}
    if(w.stage==='sum')return {label:`${task.partials.map(p=>p.answer).join(' + ')} = □`,expected:task.answer,component:'recombination'};
    return null;
  }
  if(w.stage==='choose')return {label:`${task.divisor} × □ passt in ${w.remaining}`,expected:null,component:'division-relationship'};
  if(w.stage==='product')return {label:`${task.divisor} × ${w.chunk} = □`,expected:task.divisor*w.chunk,component:'partial-product'};
  if(w.stage==='subtract')return {label:`${w.remaining} − ${task.divisor*w.chunk} = □`,expected:w.remaining-task.divisor*w.chunk,component:'partial-calculation'};
  return {label:`${w.quotients.join(' + ')} = □`,expected:task.answer,component:'recombination'};
}
export function acceptValue(task,w,value,timing={}){
  if(w.done||w.feedback)return null;const p=promptFor(task,w);if(!p||value===null)return null;
  const ok=p.expected===null?Number.isInteger(value)&&value>0&&value*task.divisor<=w.remaining:value===p.expected;
  w.checks++;w.totalMs+=timing.totalMs||0;if(w.firstMs===null)w.firstMs=timing.firstMs??null;w.interrupted ||= !!timing.interrupted;
  const evidence={component:p.component,ok,possiblePlaceValueError:p.expected!==null&&possiblePlaceValueError(p.expected,value),expected:p.expected,actual:value,label:p.label,remaining:w.remaining,firstMs:timing.firstMs??null,totalMs:timing.totalMs??null};
  if(task.level===5&&!task.drill&&w.stage==='partials'){
    const part=task.partials[w.selected];
    w.diagnosticSeen??={};
    if(part.a<=10&&part.b<=10&&!w.diagnosticSeen[w.selected]){
      evidence.underlyingFactId=`1-${part.a}-${part.b}-product`;
      w.diagnosticSeen[w.selected]=true;
    }
  }
  if(!ok){
    if(evidence.possiblePlaceValueError)evidence.errorType='place-value';
    else if(p.component==='partial-product')evidence.errorType='multiplication-fact';
    else evidence.errorType=p.component;
    w.errors.push(evidence);
  }
  // Basic retrieval moves on after correction feedback. Strategy steps must be corrected in place.
  if(task.level<=4||task.drill){
    if(task.level===2&&!task.drill&&w.stage!=='rest'){w.quotient=value;w.stage='rest';w.feedback=ok?null:{ok,solution:`Ergebnis: ${task.answer}`,retry:false};}
    else{w.done=true;w.feedback={ok:!w.errors.length,solution:task.solution||`${task.label.replace('□',String(task.answer))}`,retry:false};}
    return evidence;
  }
  if(!ok){w.feedback={ok:false,solution:p.expected===null?'Wähle eine kleinere Anzahl. Mindestens 1.':`${(p.label.includes('□')?p.label.replace('□',String(p.expected)):p.label+' '+p.expected)}`,retry:true};return evidence;}
  if(task.level===5){
    if(w.stage==='decompose'){w.decomp.push(value);if(w.decomp.length===4)w.stage='partials';}
    else if(w.stage==='partials'){w.partials[w.selected]=value;w.selected=null;if(Object.keys(w.partials).length===4)w.stage='sum';}
    else{w.done=true;w.feedback={ok:true,solution:task.solution,retry:false};}
  }else{
    if(w.stage==='choose'){w.chunk=value;w.stage='product';}
    else if(w.stage==='product')w.stage='subtract';
    else if(w.stage==='subtract'){w.chunks.push({q:w.chunk,product:task.divisor*w.chunk,before:w.remaining,after:value});w.quotients.push(w.chunk);w.remaining=value;w.stage=value===0?'sum':'choose';}
    else{w.done=true;w.feedback={ok:true,solution:task.solution,retry:false};}
  }return evidence;
}
export function strategyDrills(rows,taskById){
  const drills=new Map();
  for(const r of rows)for(const e of r.errors||[]){

    const parent=taskById[r.id];if(!parent)continue;
    const id=`drill-${parent.level}-${e.component}-${e.label}`;
    drills.set(id,{...parent,id,drill:true,component:e.component,label:e.label,answer:e.expected,dividend:e.remaining??parent.dividend,solution:e.expected===null?'Wähle eine positive Anzahl, deren Vielfaches noch hineinpasst.':(e.label.includes('□')?e.label.replace('□',String(e.expected)):e.label+' '+e.expected),family:`component-${e.component}`});
  }
  return [...drills.values()];
}
