export function canShareFile(nav,file){try{return typeof nav.share==='function'&&typeof nav.canShare==='function'&&nav.canShare({files:[file]});}catch{return false;}}
export async function createCard(event){
  if(!event.successId)throw Error('Persisted success required');
  const card={number:event.successNumber,accuracy:event.resultSummary.accuracy,correct:event.resultSummary.correct,total:event.resultSummary.total,streak:event.currentStreakAtSuccess,date:event.localDate,message:event.recognitionMessage,trainingType:event.trainingType};
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;
  const c=canvas.getContext('2d');if(!c)throw Error('Canvas unavailable');
  c.fillStyle='#f3f6f8';c.fillRect(0,0,1080,1350);
  c.fillStyle='#163f59';c.fillRect(0,0,1080,410);
  c.fillStyle='white';c.font='32px Arial';c.fillText('MULTIDIVI',75,92);
  c.font='bold 78px Arial';c.fillText('Erfolg Nr. '+card.number,75,220);

  c.fillStyle='#142e41';c.font='bold 105px Arial';c.fillText(card.accuracy+' %',75,555);
  c.font='40px Arial';c.fillText('richtig',75,620);
  c.font='36px Arial';c.fillText(card.correct+' von '+card.total+' Aufgaben',75,695);
  c.fillStyle='#e0ebf1';c.fillRect(75,765,930,145);
  c.fillStyle='#163f59';c.font='bold 43px Arial';c.fillText(card.streak+(card.streak===1?' Tag':' Tage')+' in Folge',105,825);
  c.font='32px Arial';c.fillText('erfolgreich gelernt',105,875);
  c.fillStyle='#142e41';c.font='36px Arial';c.fillText(card.trainingType,75,980);
  c.font='30px Arial';
  c.fillText(new Date(card.date+'T12:00:00').toLocaleDateString('de-DE'),75,1090);
  c.font='bold 36px Arial';wrap(c,card.message,75,1190,900,50);
  return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('PNG')),'image/png'));
}
function wrap(c,text,x,y,width,step){let line='';for(const word of text.split(' ')){if(c.measureText(line+word).width>width){c.fillText(line,x,y);line='';y+=step;}line+=word+' ';}c.fillText(line.trim(),x,y);}
