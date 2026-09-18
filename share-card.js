export function canShareFile(nav,file){try{return typeof nav.share==='function'&&typeof nav.canShare==='function'&&nav.canShare({files:[file]});}catch{return false;}}
export function themeForDate(date){return Math.floor(Date.parse(date+'T12:00:00Z')/86400000)%3;}
export async function createCard(day){
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;const c=canvas.getContext('2d');if(!c)throw Error('Canvas');
  const theme=themeForDate(day.date),colors=['#163f59','#79400f','#215c3e'];
  c.fillStyle='#f3f6f8';c.fillRect(0,0,1080,1350);c.fillStyle=colors[theme];c.fillRect(0,0,1080,330);
  c.fillStyle='white';c.font='bold 62px Arial';c.fillText('Gut geübt!',70,108);c.font='32px Arial';c.fillText(new Date(day.date+'T12:00:00').toLocaleDateString('de-DE'),70,165);
  // Original, generic drawings live only on the intentionally generated card.
  c.save();c.translate(690,80);c.strokeStyle='white';c.fillStyle='white';c.lineWidth=7;
  if(theme===0){c.beginPath();c.moveTo(0,130);c.lineTo(35,90);c.lineTo(95,80);c.lineTo(132,40);c.lineTo(210,40);c.lineTo(250,85);c.lineTo(295,103);c.lineTo(305,140);c.lineTo(0,140);c.closePath();c.stroke();for(const x of [60,247]){c.beginPath();c.arc(x,145,25,0,Math.PI*2);c.fill();}}
  else if(theme===1){for(const [x,y]of [[0,95],[110,95],[55,0]]){c.strokeRect(x,y,90,70);for(const dx of [17,58])c.strokeRect(x+dx,y-13,16,13);}}
  else{c.beginPath();c.ellipse(125,65,55,80,.5,0,Math.PI*2);c.stroke();c.beginPath();c.moveTo(92,130);c.lineTo(45,213);c.stroke();for(let x=95;x<=145;x+=25){c.beginPath();c.moveTo(x,10);c.lineTo(x,118);c.stroke();}c.beginPath();c.arc(240,160,37,0,Math.PI*2);c.stroke();}
  c.restore();c.fillStyle='#142e41';c.font='bold 44px Arial';c.fillText('Mein Einmaleins-Training',70,410);
  const section=(y,title,s)=>{c.fillStyle='#e4edf2';c.fillRect(70,y,940,180);c.fillStyle='#142e41';c.font='bold 34px Arial';c.fillText(title,100,y+55);c.font='44px Arial';c.fillText(`${s.correct} richtig · ${s.wrong} noch mit Fehler`,100,y+125);};
  section(465,'6 Minuten · Gemischt',day.results.a);section(675,'4 Minuten · Gezielt',day.results.b);
  const comparison=day.results.comparison;c.font='bold 32px Arial';c.fillText('Gleiche Aufgaben · Vorher und nachher',70,925);c.font='36px Arial';
  c.fillText(comparison.adequate?`${comparison.before.accuracy} % richtig → ${comparison.after.accuracy} % richtig`:'Noch zu wenige gleiche Aufgaben.',70,985);
  c.font='29px Arial';wrap(c,comparison.message,70,1050,920,44);
  c.fillStyle=colors[theme];c.font='bold 34px Arial';c.fillText('Training für heute geschafft.',70,1230);c.font='32px Arial';c.fillText('Bis morgen!',70,1280);
  return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('PNG')),'image/png'));
}
function wrap(c,text,x,y,width,lineHeight){let line='';for(const word of text.split(' ')){const test=line+word+' ';if(c.measureText(test).width>width&&line){c.fillText(line.trim(),x,y);line=word+' ';y+=lineHeight;}else line=test;}c.fillText(line.trim(),x,y);}
