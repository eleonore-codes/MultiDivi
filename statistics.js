import {median} from './learning-engine.js';
export function summarize(rows) {return {total:rows.length,correct:rows.filter(r=>r.ok).length,wrong:rows.filter(r=>!r.ok).length,accuracy:rows.length?Math.round(100*rows.filter(r=>r.ok).length/rows.length):null};}
export function compare(a,b,focus) {
  // Compare identical task forms seen in BOTH phases, not unequal exercise counts.
  const ids=new Set(a.filter(x=>focus.includes(x.family)&&b.some(y=>y.id===x.id)).map(x=>x.id));
  const before=a.filter(x=>ids.has(x.id)),after=b.filter(x=>ids.has(x.id));
  let faster=0;
  for(const id of ids){const x=before.filter(r=>r.id===id&&r.ok&&r.ms!==null),y=after.filter(r=>r.id===id&&r.ok&&r.ms!==null);
    if(x.length>=2&&y.length>=2&&median(y.map(r=>r.ms))<median(x.map(r=>r.ms))*.85)faster++;}
  const adequate=before.length>=5&&after.length>=5&&ids.size>=3;
  return {before:summarize(before),after:summarize(after),comparable:ids.size,adequate,faster,
    message:adequate&&summarize(after).accuracy>summarize(before).accuracy?'Bei gleichen Aufgaben warst du im zweiten Teil sicherer.':faster?`${faster} Aufgaben hast du wiederholt schneller gelöst.`:'Du hast geübt. Ob es schon leichter geht, sehen wir beim nächsten Mal.'};
}
