import {CONFIG as C} from './config.js';
export const familyId=(a,b)=>`${Math.min(a,b)}x${Math.max(a,b)}`;
export const LEVEL_TASKS={1:[],2:[],3:[],4:[],5:[],6:[]};
function add(level,id,a,b,form,label,answer,extra={}) {
  if(answer>C.MAX_RESULT)throw Error('Result out of range');
  const family=extra.family||familyId(a,b);
  LEVEL_TASKS[level].push({id,level,a,b,operands:[a,b],form,label,answer,family,
    baseFamily:family,easy:[1,2,5,10].includes(a)||[1,2,5,10].includes(b),
    difficulty:level,placeValues:String(answer).split('').reverse().map(Number),...extra});
}
for(let a=1;a<=10;a++)for(let b=1;b<=10;b++){
  const p=a*b;
  for(const [form,label,answer,solution] of [
    ['product',`${a} × ${b} = □`,p,`${a} × ${b} = ${p}`],
    ['right',`${a} × □ = ${p}`,b,`${a} × ${b} = ${p}`],
    ['left',`□ × ${b} = ${p}`,a,`${a} × ${b} = ${p}`],
    ['quotient',`${p} : ${a} = □`,b,`${p} : ${a} = ${b}`],
    ['divisor',`${p} : □ = ${b}`,a,`${p} : ${a} = ${b}`]
  ])add(1,`1-${a}-${b}-${form}`,a,b,form,label,answer,{solution});
}
for(let d=2;d<=10;d++)for(let q=1;q<=10;q++)for(let r=1;r<d;r++)
  add(2,`2-${d}-${q}-${r}`,d,q,'remainder',`${d*q+r} : ${d}`,q,{remainder:r,dividend:d*q+r,solution:`${d*q+r} : ${d} = ${q} Rest ${r}`});
for(let a=1;a<=10;a++)for(let b=1;b<=9;b++){
  const t=10*b,p=a*t,extra={baseFamily:familyId(a,b),family:`t-${familyId(a,b)}`};
  add(3,`3-${a}-${b}-p`,a,t,'product',`${a} × ${t} = □`,p,{...extra,solution:`${a} × ${t} = ${p}`});
  add(3,`3-${a}-${b}-s`,t,a,'product',`${t} × ${a} = □`,p,{...extra,solution:`${t} × ${a} = ${p}`});
  add(3,`3-${a}-${b}-d`,a,t,'quotient',`${p} : ${t} = □`,a,{...extra,dividend:p,divisor:t,solution:`${p} : ${t} = ${a}`});
}
const [a4,z4,b4,y4]=C.RANGES.level4;
for(let a=a4;a<=z4;a++)for(let b=b4;b<=y4;b++){
  const p=a*b;
  add(4,`4-${a}-${b}-p`,a,b,'product',`${a} × ${b} = □`,p,{solution:`${a} × ${b} = ${p}`});
  add(4,`4-${a}-${b}-d`,a,b,'quotient',`${p} : ${a} = □`,b,{dividend:p,divisor:a,solution:`${p} : ${a} = ${b}`});
}
export const decompose=n=>[Math.floor(n/10)*10,n%10];
const [a5,z5,b5,y5]=C.RANGES.level5;
for(let a=a5;a<=z5;a++)for(let b=b5;b<=y5;b++)if(a%10&&b%10){
  const da=decompose(a),db=decompose(b),partials=da.flatMap(x=>db.map(y=>({a:x,b:y,answer:x*y,label:`${x} × ${y}`})));
  add(5,`5-${a}-${b}`,a,b,'board',`${a} × ${b}`,a*b,{decomposition:[da,db],partials,strategy:'distributive',solution:`${a} × ${b} = ${a*b}`});
}
const [d6,z6,q6,y6]=C.RANGES.level6;
for(let d=d6;d<=z6;d++)for(let q=q6;q<=y6;q++)
  add(6,`6-${d}-${q}`,d,q,'division-strategy',`${d*q} : ${d}`,q,{dividend:d*q,divisor:d,strategy:'partial-quotients',solution:`${d*q} : ${d} = ${q}`});
export const TASKS=LEVEL_TASKS[1],REMAINDERS=LEVEL_TASKS[2];
export const ALL_TASKS=Object.values(LEVEL_TASKS).flat();
export const BY_ID=Object.fromEntries(ALL_TASKS.map(t=>[t.id,t]));
