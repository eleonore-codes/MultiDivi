import {median} from './learning-engine.js';
export function summarize(rows){const correct=rows.filter(r=>r.ok).length;return {total:rows.length,correct,accuracy:rows.length?Math.round(correct/rows.length*100):null,wrong:rows.length-correct,firstMs:median(rows.filter(r=>r.ok&&r.firstMs!==null).map(r=>r.firstMs)),totalMs:median(rows.filter(r=>r.ok&&r.totalMs!==null).map(r=>r.totalMs)),steps:rows.reduce((n,r)=>n+(r.steps||1),0),drills:rows.filter(r=>r.drill).length,correctFullTasks:rows.filter(r=>!r.drill&&r.ok).length,fullTasks:rows.filter(r=>!r.drill).length};}
export function compare(a,b){
  const ids=[...new Set(a.map(x=>x.id))].filter(id=>b.some(x=>x.id===id));
  // Equal weight per shared task prevents changing frequencies from fabricating improvement.
  const groups=ids.map(id=>({a:a.filter(r=>r.id===id),b:b.filter(r=>r.id===id)}));
  const adequate=groups.length>=3&&groups.every(g=>g.a.length>=2&&g.b.length>=2);
  const pct=side=>groups.length?Math.round(groups.reduce((n,g)=>n+g[side].filter(r=>r.ok).length/g[side].length,0)/groups.length*100):null;
  const before=pct('a'),after=pct('b');
  let faster=0;
  for(const g of groups){const x=g.a.filter(r=>r.ok&&r.firstMs!==null),y=g.b.filter(r=>r.ok&&r.firstMs!==null);if(x.length>=2&&y.length>=2&&median(y.map(r=>r.firstMs))<median(x.map(r=>r.firstMs))*.85)faster++;}
  return {adequate,before,after,faster,message:adequate&&after>before?'Bei gleichen Aufgaben warst du im zweiten Teil sicherer.':faster?`${faster} Aufgaben hast du wiederholt schneller begonnen.`:'Du hast gezielt geübt. Beim nächsten Mal übst du weiter.'};
}
