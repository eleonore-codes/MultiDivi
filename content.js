export const familyId = (a,b) => `${Math.min(a,b)}x${Math.max(a,b)}`;
export const TASKS = [];
for(let a=1;a<=10;a++) for(let b=1;b<=10;b++) {
  const p=a*b, family=familyId(a,b);
  const forms=[['product',`${a} × ${b} = □`,p,`${a} × ${b} = ${p}`],
    ['right',`${a} × □ = ${p}`,b,`${a} × ${b} = ${p}`],
    ['left',`□ × ${b} = ${p}`,a,`${a} × ${b} = ${p}`],
    ['quotient',`${p} : ${a} = □`,b,`${p} : ${a} = ${b}`],
    ['divisor',`${p} : □ = ${b}`,a,`${p} : ${a} = ${b}`]];
  for(const [form,label,answer,solution] of forms) TASKS.push({id:`${a}-${b}-${form}`,family,a,b,form,label,answer,solution,level:1,easy:[1,2,5,10].includes(a)||[1,2,5,10].includes(b)});
}
export const REMAINDERS=[];
for(let d=2;d<=10;d++) for(let q=1;q<=10;q++) for(let r=1;r<d;r++) {
  const n=d*q+r;
  REMAINDERS.push({id:`r-${d}-${q}-${r}`,family:familyId(d,q),a:d,b:q,form:'remainder',label:`${n} : ${d} =`,answer:q,remainder:r,solution:`${n} : ${d} = ${q} Rest ${r}`,level:2,easy:false});
}
export const ALL_TASKS=[...TASKS,...REMAINDERS];
export const BY_ID=Object.fromEntries(ALL_TASKS.map(t=>[t.id,t]));
