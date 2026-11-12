(()=>{
const cv=document.getElementById('c'),bgc=document.getElementById('bgc'),bctx=bgc.getContext('2d');let ctx=cv.getContext('2d');const mctx=ctx;let bgDirty=true,bgKey='';
const W=960,H=540,GY=470,G=1500;
const SL={x:170,y:395}; // sling anchor
const MAXPULL=95,POWER=12.5;

/* ---- full-screen view: the world (960x540) is centred, sky/ground extend to fill ---- */
let VW=W,VH=H,OX=0,OY=0,SX=1,SY=1,GC={};
// gradients are cached per screen size instead of being rebuilt every frame
function grad(k,f){return GC[k]||(GC[k]=f())}
function resize(){
  const iw=VP.w,ih=VP.h,a=iw/ih;
  if(a>=W/H){VH=H;VW=H*a}else{VW=W;VH=W/a}
  OX=(VW-W)/2;OY=VH-H;
  // pixel density: sharp on phones, but never more than ~2.4 million pixels per canvas
  const dpr=Math.max(.5,Math.min(2,devicePixelRatio||1,Math.sqrt(2.4e6/(iw*ih))));
  cv.width=bgc.width=Math.round(iw*dpr);cv.height=bgc.height=Math.round(ih*dpr);
  SX=cv.width/VW;SY=cv.height/VH;
  GC={};bgDirty=true;
}
addEventListener('resize',resize);resize();

/* ---- clouds ---- */
const clouds=[];
for(let i=0;i<8;i++)clouds.push({x:-OX+Math.random()*VW,y:-OY+30+Math.random()*(OY+150),r:20+Math.random()*24,v:8+Math.random()*16});
function moveClouds(dt){
  for(const c of clouds){
    c.x+=c.v*dt;
    if(c.x-c.r*3>VW-OX){c.x=-OX-c.r*3;c.y=-OY+30+Math.random()*(OY+150)}
  }
}
function drawCloud(c){
  const r=c.r;
  ctx.fillStyle='rgba(255,255,255,.88)';
  ctx.beginPath();
  ctx.arc(c.x,c.y,r,0,7);ctx.arc(c.x+r*.95,c.y+r*.2,r*.8,0,7);ctx.arc(c.x-r*.95,c.y+r*.25,r*.7,0,7);ctx.arc(c.x+r*.3,c.y-r*.5,r*.75,0,7);
  ctx.rect(c.x-r*1.4,c.y+r*.3,r*2.9,r*.7);
  ctx.fill();
}


/* ---- sounds (synthesised, no files needed) ---- */
const AC=window.AudioContext||window.webkitAudioContext;let ac=null,master=null,lastHit=0;
function initAudio(){
  if(!AC)return;
  if(!ac){ac=new AC();master=ac.createGain();master.gain.value=.5;master.connect(ac.destination)}
  if(ac.state==='suspended')ac.resume();
}
function tone(f,d,type,v,f2,delay){
  if(!ac)return;delay=delay||0;
  const t=ac.currentTime+delay,o=ac.createOscillator(),g=ac.createGain();
  o.type=type;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+d);
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+d+.02);
}
let NBUF=null;
function noise(d,v,fq){
  if(!ac)return;
  if(!NBUF){const n=ac.sampleRate;NBUF=ac.createBuffer(1,n,ac.sampleRate);const a=NBUF.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1}
  const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain(),t=ac.currentTime;
  s.buffer=NBUF;f.type='lowpass';f.frequency.value=fq;
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);
  s.connect(f);f.connect(g);g.connect(master);s.start(t,Math.random()*Math.max(0,.98-d),d+.02);
}
const SFX={
  pull(){tone(500,.05,'square',.08,420)},
  launch(){tone(260,.18,'triangle',.3,800);noise(.12,.12,2500)},
  dash(){noise(.25,.25,3000);tone(400,.2,'sawtooth',.12,1200)},
  hitWood(v){noise(.12,.35*v,700);tone(140,.1,'sine',.3*v,70)},
  hitStone(v){noise(.08,.3*v,3500);tone(900,.07,'square',.12*v,500)},
  breakBlock(){noise(.3,.45,1200);tone(110,.25,'sine',.4,50)},
  // joyful "heyy!" – formant-synthesised voices (no audio files); n = number of voices
  cheer(delay,n){
    if(!ac)return;delay=delay||0;n=n||3;
    [300,380,455,350].slice(0,n).forEach((f0,i)=>{
      const t=ac.currentTime+delay+i*.06,d=.8;
      const o=ac.createOscillator(),lfo=ac.createOscillator(),lg=ac.createGain(),g=ac.createGain(),a=ac.createBiquadFilter(),b=ac.createBiquadFilter(),ga=ac.createGain(),gb=ac.createGain();
      o.type='sawtooth';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f0*1.65,t+.2);o.frequency.exponentialRampToValueAtTime(f0*1.5,t+d);
      lfo.frequency.value=6;lg.gain.value=f0*.025;lfo.connect(lg);lg.connect(o.frequency);
      a.type='bandpass';a.Q.value=6;a.frequency.setValueAtTime(680,t);a.frequency.exponentialRampToValueAtTime(330,t+.28);
      b.type='bandpass';b.Q.value=8;b.frequency.setValueAtTime(1700,t);b.frequency.exponentialRampToValueAtTime(2700,t+.28);
      ga.gain.value=1;gb.gain.value=.55;
      g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.2,t+.05);g.gain.setValueAtTime(.2,t+d*.55);g.gain.exponentialRampToValueAtTime(.001,t+d);
      o.connect(a);o.connect(b);a.connect(ga);b.connect(gb);ga.connect(g);gb.connect(g);g.connect(master);
      o.start(t);lfo.start(t);o.stop(t+d+.05);lfo.stop(t+d+.05);
    });
    setTimeout(()=>noise(.09,.12,3500),delay*1000); // the "h" breath
  },
  fox(){noise(.05,.8,9000);noise(.16,.25,1500);tone(130,.12,'sine',.35,50);SFX.cheer(.08,2)},
  win(){[523,659,784,1047].forEach((f,i)=>tone(f,.3,'triangle',.25,f,i*.14));SFX.cheer(.3,3)},
  lose(){[392,330,262].forEach((f,i)=>tone(f,.35,'sawtooth',.14,f*.97,i*.2))}
};

/* ---- environment art (wood plank, bricks, sling, scenery) ---- */
const ART={"plank": {"src": "img/plank.webp", "w": 400, "h": 53}, "brick": {"src": "img/brick.webp", "w": 158, "h": 64}, "sling": {"src": "img/sling.webp", "w": 120, "h": 181}, "tree": {"src": "img/tree.webp", "w": 240, "h": 314}, "joshua": {"src": "img/joshua.webp", "w": 180, "h": 210}, "mountain": {"src": "img/mountain.webp", "w": 340, "h": 273}, "rock1": {"src": "img/rock1.webp", "w": 150, "h": 134}, "rock2": {"src": "img/rock2.webp", "w": 150, "h": 128}};
for(const k in ART){const im=new Image();im.src=ART[k].src;ART[k].img=im}
window.ART=ART;
function artOk(k){const i=ART[k].img;return i.complete&&i.naturalWidth>0}
function drawArt(k,x,y,w,h){if(!artOk(k))return false;ctx.drawImage(ART[k].img,x-w/2,y-h/2,w,h);return true}
// draws a sprite standing on a baseline: centre x, ground y, width w
function standArt(k,x,gy,w){const h=w*ART[k].h/ART[k].w;return drawArt(k,x,gy-h/2,w,h)}
function blockArt(b){
  const k=b.m==='stone'?'brick':'plank';if(!artOk(k))return false;
  const im=ART[k].img,horiz=b.w>=b.h,L=horiz?b.w:b.h,T=horiz?b.h:b.w;
  ctx.save();ctx.translate(b.x,b.y);if(!horiz)ctx.rotate(Math.PI/2);
  if(k==='brick'){const n=Math.max(1,Math.round(L/(T*2.47))),tl=L/n;for(let i=0;i<n;i++)ctx.drawImage(im,-L/2+i*tl,-T/2,tl+.5,T)}
  else ctx.drawImage(im,-L/2,-T/2,L,T);
  ctx.restore();return true;
}

/* ---- character art (one packed WebP sheet, embedded) ---- */
const SHEET=new Image();let sheetOk=false;
SHEET.onload=()=>{sheetOk=true};
SHEET.src="img/characters.webp";
const SPR={"rabbit": [0, 0, 140, 150], "cat": [142, 0, 150, 138], "squirrel": [294, 0, 150, 141], "turtle": [446, 0, 150, 150], "hamster": [598, 0, 147, 150], "fox": [747, 0, 148, 150], "wolf": [897, 0, 148, 150]};
window.SHEETIMG=SHEET;window.SPR=SPR;
const REWARD={'الأدغال الكثيفة':{k:'squirrel',name:'السنجاب',e:'🐿️'},'المراعي الخضراء':{k:'cat',name:'القطة',e:'🐱'},'فوق السحاب':{k:'hamster',name:'الهامستر',e:'🐹'},'الجزيرة':{k:'turtle',name:'السلحفاة',e:'🐢'}};
window.REWARD=REWARD;
// draws a character centred at (x,y) with the given height; returns false if the art is not ready
function sprite(name,x,y,h){
  const r=SPR[name];if(!sheetOk||!r)return false;
  const w=h*r[2]/r[3];
  ctx.drawImage(SHEET,r[0],r[1],r[2],r[3],x-w/2,y-h/2,w,h);return true;
}

/* ---- injured enemy: dizzy eyes, bandages, orbiting stars, red flash + shake after each hit ---- */
const REDS={};
function redSil(kind){
  if(REDS[kind])return REDS[kind];
  const r=SPR[kind],c=document.createElement('canvas');c.width=r[2];c.height=r[3];
  const g=c.getContext('2d');g.drawImage(SHEET,r[0],r[1],r[2],r[3],0,0,r[2],r[3]);
  g.globalCompositeOperation='source-in';g.fillStyle='rgb(255,40,40)';g.fillRect(0,0,r[2],r[3]);
  return REDS[kind]=c;
}
function dizzyEye(x,y,er,t){
  ctx.save();ctx.translate(x,y);
  ctx.fillStyle='#fff';ctx.strokeStyle='#6b3b12';ctx.lineWidth=Math.max(1,er*.16);
  ctx.beginPath();ctx.arc(0,0,er,0,7);ctx.fill();ctx.stroke();
  ctx.rotate(t);ctx.strokeStyle='#222';ctx.lineWidth=Math.max(1,er*.17);ctx.beginPath();
  for(let a=0;a<=4*Math.PI;a+=.35){const r=er*.82*a/(4*Math.PI);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}
  ctx.stroke();ctx.restore();
}
function plaster(x,y,w,rot){
  ctx.save();ctx.translate(x,y);ctx.rotate(rot);
  ctx.fillStyle='#f5d9aa';ctx.strokeStyle='#b88a55';ctx.lineWidth=Math.max(1,w*.03);
  rr(-w/2,-w*.17,w,w*.34,w*.1);ctx.fill();ctx.stroke();
  ctx.fillStyle='#d9ae74';ctx.fillRect(-w*.14,-w*.17,w*.28,w*.34);
  ctx.fillStyle='#b88a55';for(const dx of[-.06,.06])for(const dy of[-.07,.07]){ctx.beginPath();ctx.arc(dx*w,dy*w,w*.017,0,7);ctx.fill()}
  ctx.restore();
}
function drawFox(b){
  const kind=b.kind||'fox',r=SPR[kind],hh=b.h*1.55,w=hh*r[2]/r[3],cx=b.x,cy=b.y-4;
  if(!sheetOk){ctx.fillText(kind==='wolf'?'🐺':'🦊',b.x,b.y+2);return}
  if(!(b.hp<MAT.fox.hp-.001)){ctx.drawImage(SHEET,r[0],r[1],r[2],r[3],cx-w/2,cy-hh/2,w,hh);return}
  const now=performance.now(),k=Math.max(0,1-(now-(b.ht||0))/700),dmg=Math.min(1,1-Math.max(0,b.hp)/MAT.fox.hp);
  ctx.save();ctx.translate(cx,cy+hh*.04);
  ctx.rotate(Math.sin(now/260)*.05+Math.sin(now/38)*.11*k);ctx.translate(Math.sin(now/30)*2.2*k,-hh*.04);
  ctx.drawImage(SHEET,r[0],r[1],r[2],r[3],-w/2,-hh/2,w,hh);
  if(k>0){ // red flash right after a hit
    const ga=ctx.globalAlpha;ctx.globalAlpha=ga*.55*k;ctx.drawImage(redSil(kind),-w/2,-hh/2,w,hh);ctx.globalAlpha=ga;
  }
  const er=w*.092,t=now/260;
  const eyes=kind==='wolf'?[[.462,.471]]:[[.457,.467],[.838,.456]]; // the wolf's right eye is under a scar patch
  eyes.forEach((e,i)=>dizzyEye((e[0]-.5)*w,(e[1]-.5)*hh,er,i?-t:t));
  plaster((.27-.5)*w,(.30-.5)*hh,w*.26,-.6);
  if(dmg>.5)plaster((.80-.5)*w,(.72-.5)*hh,w*.22,.5);
  const n=dmg>.5?3:2;ctx.font=Math.round(w*.26)+'px serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillStyle='#ffd54f';ctx.strokeStyle='#d99a00';ctx.lineWidth=1.5;
  for(let i=0;i<n;i++){const a=now/420+i*2*Math.PI/n,sx=Math.cos(a)*w*.32,sy=-hh*.5-hh*.03+Math.sin(a)*hh*.07;ctx.strokeText('★',sx,sy);ctx.fillText('★',sx,sy)}
  ctx.restore();
}

/* ---- materials ---- */
const MAT={
  wood:{d:1,hp:70,col:'#c98a4b',edge:'#8a5a2b'},
  stone:{d:2.2,hp:160,col:'#9aa0a6',edge:'#5f666c'},
  fox:{d:.8,hp:28,col:'#e8742a',edge:'#9c4311'}
};

/* ---- heroes (step 1: rabbit only; others come in next steps) ---- */
const HERO={
  rabbit:{emoji:'🐰',art:'rabbit',r:16,d:1.2,ability:'dash'}
};

/* ---- above-the-clouds world background ---- */
const SKYIMG=new Image();SKYIMG.src='img/bg-sky.webp';
const ISLIMG=new Image();ISLIMG.src='img/bg-island.webp';
const PASIMG=new Image();PASIMG.src='img/bg-pasture.webp';
window.SKYIMG=SKYIMG;window.ISLIMG=ISLIMG;window.PASIMG=PASIMG;
function drawSkyBg(img){
  img=img||SKYIMG;
  if(!img.complete||!img.naturalWidth){ctx.fillStyle='#8fd3ee';ctx.fillRect(0,0,VW,VH);return}
  const iw=img.naturalWidth,ih=img.naturalHeight,k=Math.max(VW/iw,VH/ih),w=iw*k,h=ih*k;
  ctx.drawImage(img,(VW-w)/2,(VH-h)/2,w,h);
}
function drawGrassGround(){
  const g=grad('grass',()=>{const g=ctx.createLinearGradient(0,GY-10,0,H+OY);g.addColorStop(0,'#7cc866');g.addColorStop(.25,'#4fa04f');g.addColorStop(1,'#2f6e3a');return g});
  ctx.fillStyle=g;
  ctx.beginPath();ctx.moveTo(-OX-20,GY+6);
  for(let x=-OX-20;x<=VW-OX+40;x+=40)ctx.quadraticCurveTo(x+20,GY-6,x+40,GY+6);
  ctx.lineTo(VW-OX+40,H+OY+20);ctx.lineTo(-OX-20,H+OY+20);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#a6e08a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-OX-20,GY+6);
  for(let x=-OX-20;x<=VW-OX+40;x+=40)ctx.quadraticCurveTo(x+20,GY-6,x+40,GY+6);
  ctx.stroke();
}
function drawSandGround(){
  const g=grad('sand',()=>{const g=ctx.createLinearGradient(0,GY-10,0,H+OY);g.addColorStop(0,'#f6e3b4');g.addColorStop(1,'#d9b374');return g});
  ctx.fillStyle=g;
  ctx.beginPath();ctx.moveTo(-OX-20,GY+8);
  for(let x=-OX-20;x<=VW-OX+40;x+=40)ctx.quadraticCurveTo(x+20,GY-8,x+40,GY+8);
  ctx.lineTo(VW-OX+40,H+OY+20);ctx.lineTo(-OX-20,H+OY+20);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-OX-20,GY+8);
  for(let x=-OX-20;x<=VW-OX+40;x+=40)ctx.quadraticCurveTo(x+20,GY-8,x+40,GY+8);
  ctx.stroke();
}
function drawCloudGround(){
  const g=grad('cloud',()=>{const g=ctx.createLinearGradient(0,GY-14,0,H+OY);g.addColorStop(0,'#ffffff');g.addColorStop(.35,'#e3f1fb');g.addColorStop(1,'#a9cfe8');return g});
  ctx.fillStyle=g;
  ctx.beginPath();
  for(let x=-OX-20;x<VW-OX+40;x+=46){ctx.moveTo(x+30,GY+2);ctx.arc(x,GY+2,30,0,7);ctx.moveTo(x+23+22,GY-4);ctx.arc(x+23,GY-4,22,0,7)}
  ctx.fill();
  ctx.fillRect(-OX-20,GY,VW+60,H-GY+OY+20);
}
/* ---- levels (data-driven so worlds can be added later) ---- */
const LEVELS0=[
 {world:'الأدغال الكثيفة',n:1,birds:['rabbit','rabbit','rabbit'],
  blocks:[
   ['wood',640,GY-30,20,60],['wood',740,GY-30,20,60],['wood',690,GY-70,140,20],
   ['fox',690,GY-100,38,38],
   ['wood',840,GY-30,20,60],['wood',900,GY-30,20,60],['wood',870,GY-70,100,20],['fox',870,GY-98,34,34]
  ]},
 {world:'الأدغال الكثيفة',n:2,birds:['rabbit','rabbit','rabbit'],
  blocks:[
   ['stone',620,GY-30,20,60],['stone',720,GY-30,20,60],['wood',670,GY-70,140,20],['fox',670,GY-98,38,38],
   ['wood',790,GY-30,20,60],['wood',870,GY-30,20,60],['wood',830,GY-70,110,20],
   ['wood',810,GY-100,20,40],['wood',850,GY-100,20,40],['wood',830,GY-130,90,20],['fox',830,GY-158,34,34]
  ]},
 {world:'الأدغال الكثيفة',n:3,birds:['rabbit','rabbit','rabbit','rabbit'],
  blocks:[
   ['stone',590,GY-30,20,60],['stone',690,GY-30,20,60],['wood',640,GY-70,140,20],
   ['wood',610,GY-100,20,40],['wood',670,GY-100,20,40],['wood',640,GY-130,100,20],['fox',640,GY-158,34,34],
   ['fox',750,GY-14,28,28],
   ['wood',810,GY-30,20,60],['wood',890,GY-30,20,60],['wood',850,GY-70,120,20],['fox',850,GY-98,34,34]
  ]},
 {world:'المراعي الخضراء',pas:1,n:1,birds:['rabbit','rabbit','rabbit'],
  blocks:[
   ['wood',650,GY-30,20,60],['wood',730,GY-30,20,60],['stone',690,GY-70,110,20],['fox',690,GY-98,36,36],
   ['stone',820,GY-30,20,60],['stone',900,GY-30,20,60],['wood',860,GY-70,110,20],['fox',860,GY-98,34,34]
  ]},
 {world:'المراعي الخضراء',pas:1,n:2,birds:['rabbit','rabbit','rabbit','rabbit'],
  blocks:[
   ['stone',630,GY-30,20,60],['stone',730,GY-30,20,60],['wood',680,GY-70,130,20],
   ['wood',650,GY-100,20,40],['wood',710,GY-100,20,40],['wood',680,GY-130,90,20],['fox',680,GY-158,34,34],
   ['wood',810,GY-30,20,60],['wood',890,GY-30,20,60],['stone',850,GY-70,120,20],['fox',850,GY-98,34,34],
   ['fox',770,GY-14,28,28]
  ]},
 {world:'المراعي الخضراء',pas:1,n:3,birds:['rabbit','rabbit','rabbit','rabbit'],
  blocks:[
   ['stone',600,GY-30,20,60],['stone',680,GY-30,20,60],['stone',760,GY-30,20,60],['stone',840,GY-30,20,60],
   ['wood',640,GY-70,100,20],['wood',800,GY-70,100,20],['fox',640,GY-98,34,34],['fox',800,GY-98,34,34],
   ['wood',720,GY-100,20,40],['wood',720,GY-130,150,20],['fox',720,GY-158,34,34],['stone',900,GY-30,20,60]
  ]},
 {world:'فوق السحاب',sky:1,n:1,birds:['rabbit','rabbit','rabbit'],
  blocks:[
   ['wood',640,GY-30,20,60],['wood',730,GY-30,20,60],['wood',685,GY-70,130,20],['fox',685,GY-98,36,36],
   ['stone',830,GY-30,20,60],['stone',900,GY-30,20,60],['wood',865,GY-70,110,20],['fox',865,GY-98,34,34]
  ]},
 {world:'فوق السحاب',sky:1,n:2,birds:['rabbit','rabbit','rabbit','rabbit'],
  blocks:[
   ['stone',610,GY-30,20,60],['stone',700,GY-30,20,60],['wood',655,GY-70,130,20],
   ['wood',630,GY-100,20,40],['wood',680,GY-100,20,40],['wood',655,GY-130,90,20],['fox',655,GY-158,34,34],
   ['wood',800,GY-30,20,60],['wood',880,GY-30,20,60],['stone',840,GY-70,120,20],['fox',840,GY-98,34,34],
   ['fox',750,GY-14,28,28]
  ]},
 {world:'فوق السحاب',sky:1,n:3,birds:['rabbit','rabbit','rabbit','rabbit'],
  blocks:[
   ['stone',590,GY-30,20,60],['stone',670,GY-30,20,60],['stone',750,GY-30,20,60],['stone',830,GY-30,20,60],
   ['wood',630,GY-70,100,20],['wood',790,GY-70,100,20],['fox',630,GY-98,34,34],['fox',790,GY-98,34,34],
   ['wood',710,GY-100,20,40],['wood',710,GY-130,140,20],['fox',710,GY-158,34,34],['stone',900,GY-30,20,60]
  ]},
 {world:'الجزيرة',isl:1,n:1,birds:['rabbit','rabbit','rabbit'],
  blocks:[
   ['wood',650,GY-30,20,60],['wood',740,GY-30,20,60],['wood',695,GY-70,130,20],['fox',695,GY-98,36,36],
   ['wood',850,GY-30,20,60],['stone',910,GY-30,20,60],['wood',880,GY-70,100,20],['fox',880,GY-98,34,34]
  ]},
 {world:'الجزيرة',isl:1,n:2,birds:['rabbit','rabbit','rabbit','rabbit'],
  blocks:[
   ['stone',620,GY-30,20,60],['stone',710,GY-30,20,60],['wood',665,GY-70,130,20],
   ['wood',640,GY-100,20,40],['wood',690,GY-100,20,40],['wood',665,GY-130,90,20],['fox',665,GY-158,34,34],
   ['wood',810,GY-30,20,60],['wood',890,GY-30,20,60],['stone',850,GY-70,120,20],['fox',850,GY-98,34,34],
   ['fox',760,GY-14,28,28]
  ]},
 {world:'الجزيرة',isl:1,n:3,birds:['rabbit','rabbit','rabbit','rabbit'],
  blocks:[
   ['stone',600,GY-30,20,60],['stone',680,GY-30,20,60],['stone',760,GY-30,20,60],['stone',840,GY-30,20,60],
   ['wood',640,GY-70,100,20],['wood',800,GY-70,100,20],['fox',640,GY-98,34,34],['fox',800,GY-98,34,34],
   ['wood',720,GY-100,20,40],['wood',720,GY-130,150,20],['fox',720,GY-158,34,34],['wood',910,GY-30,20,60],['fox',910,GY-62,28,28]
  ]}
];

/* ---- 10 levels per world: 3 hand-made + 7 generated from tower patterns ---- */
const LEVELS=[];
(()=>{
  const worlds=[];
  LEVELS0.forEach(L=>{let w=worlds.find(x=>x.name===L.world);if(!w)worlds.push(w={name:L.world,list:[]});w.list.push(L)});
  const tower=(v,cx,pm,qm)=>{
    const a=[[pm,cx-40,GY-30,20,60],[pm,cx+40,GY-30,20,60],[qm,cx,GY-70,110,20]];
    if(v===0)a.push(['fox',cx,GY-98,34,34]);
    else if(v===1)a.push([pm,cx-25,GY-100,20,40],[pm,cx+25,GY-100,20,40],[qm,cx,GY-130,90,20],['fox',cx,GY-158,34,34]);
    else if(v===2)return [[pm,cx-30,GY-30,20,60],[pm,cx+30,GY-30,20,60],[qm,cx,GY-70,90,20],['fox',cx,GY-14,28,28],['fox',cx,GY-98,30,30]];
    else a.push([pm,cx-25,GY-100,20,40],[pm,cx+25,GY-100,20,40],[qm,cx,GY-130,90,20],[pm,cx-15,GY-160,20,40],[pm,cx+15,GY-160,20,40],[qm,cx,GY-190,70,20],['fox',cx,GY-216,32,32]);
    return a;
  };
  const PAT={4:[1,0],5:[2,1],6:[1,1,0],7:[0,2,1],8:[2,3,0],9:[3,1,2],10:[3,2,3]};
  worlds.forEach((w,wi)=>{
    w.list.forEach(L=>LEVELS.push(L));
    const {n:_n,birds:_b,blocks:_k,...flags}=w.list[0];
    for(let n=4;n<=10;n++){
      const pat=PAT[n],xs=pat.length===2?[690,870]:[620,760,900];
      const pm=((n+wi)%2||(wi>=2&&n>=6))?'stone':'wood',qm=((n+wi)%3===0)?'stone':'wood';
      let blocks=[];pat.forEach((v,i)=>{blocks=blocks.concat(tower(v,xs[i],pm,qm))});
      const foxes=blocks.filter(b=>b[0]==='fox').length;
      LEVELS.push({...flags,n,birds:Array(Math.min(5,foxes+2+(n>=7?1:0))).fill('rabbit'),blocks});
    }
  });
})();

let lastHero='rabbit',dragId=null,bodies,birds,bird,state,score,lvIdx=0,drag=null,trail=[],settleT=0,fx=[],fallen=[],shiftT=1;
const STAY=.6,FADE=2.2; // seconds a spent hero stays on the field, then fades out

let _id=0;
function mk(m,x,y,w,h){const t=MAT[m],ms=t.d*w*h/1000;return{id:_id++,m,x,y,w,h,a:0,av:0,vx:0,vy:0,hp:t.hp,im:1/ms,ii:1/(ms*(w*w+h*h)/12),fox:m==='fox',dead:false,rest:0}}

const scEl=document.getElementById('sc'),lvt=document.getElementById('lvt'),barf=document.getElementById('barf');
let shown=-1;
const WORLD_NAMES=[...new Set(LEVELS.map(x=>x.world))];
function load(i){
  const L=LEVELS[i];
  lvt.textContent=L.world+' - المرحلة '+L.n;
  barf.style.width=(L.n/10*100)+'%';
  bodies=L.blocks.map(b=>mk(b[0],b[1],b[2],b[3],b[4]));
  // enemy type: world 1 = foxes only, world 2 = wolves only, later worlds = mixed
  {const wi=WORLD_NAMES.indexOf(L.world);let fi=0;for(const b of bodies)if(b.fox){b.kind=wi===0?'fox':wi===1?'wolf':((fi+L.n)%2?'wolf':'fox');fi++}}
  fx=[];fallen=[];birds=L.birds.slice();bird=null;score=0;state='aim';trail=[];settleT=0;
  nextBird();hideMsg();bubL.innerHTML='';lastBub=0;lvToken++;drag=null;
  run();
}
function nextBird(){
  if(!birds.length){bird=null;return}
  const k=birds.shift(),h=HERO[k];
  bird={k,h,x:SL.x-60,y:GY-24,vx:0,vy:0,a:0,av:0,ii:0,r:h.r,im:1/(h.d*h.r*h.r*3.14/1000),flying:false,used:false,age:0,hop:{t:0}};shiftT=0;
  state='aim';
}

/* ---- balloon-pop effect ---- */
function spawnPop(x,y){
  fx.push({ring:true,x,y,t:0});
  const cols=['#ff9800','#ffcc80','#ffffff','#ff7043','#ffe082'];
  for(let i=0;i<18;i++){
    const a=Math.random()*6.283,sp=150+Math.random()*250;
    fx.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-80,s:3+Math.random()*4,c:cols[i%cols.length],life:.55+Math.random()*.35,max:.9});
  }
}
function updateFx(dt){
  for(const f of fx){
    if(f.ring){f.t+=dt;continue}
    f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=700*dt;f.vx*=1-1.5*dt;f.life-=dt;
  }
  fx=fx.filter(f=>f.ring?f.t<.3:f.life>0);
}
function drawFx(){
  for(const f of fx){
    if(f.ring){
      const k=f.t/.3;
      ctx.globalAlpha=1-k;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(f.x,f.y,10+k*55,0,7);ctx.fill();
      ctx.globalAlpha=1-k;ctx.strokeStyle='#ffb74d';ctx.lineWidth=5*(1-k)+1;ctx.beginPath();ctx.arc(f.x,f.y,14+k*80,0,7);ctx.stroke();
    }else{
      ctx.globalAlpha=Math.min(1,f.life/.3);ctx.fillStyle=f.c;ctx.fillRect(f.x-f.s/2,f.y-f.s/2,f.s,f.s);
    }
  }
  ctx.globalAlpha=1;
}

/* ---- wood / stone damage: debris chips, cracks, dark scuffs ---- */
function spawnDebris(b,n,big){
  const cols=b.m==='stone'?['#9aa0a6','#5f666c','#cfd3d6','#7d848a']:['#c98a4b','#8a5a2b','#e0a96a','#a5693a'];
  for(let i=0;i<n;i++){
    const a=-Math.PI/2+(Math.random()-.5)*2.6,sp=(big?120:70)+Math.random()*(big?260:170);
    fx.push({x:b.x+(Math.random()-.5)*b.w,y:b.y+(Math.random()-.5)*b.h,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-40,s:2+Math.random()*(big?5:3.5),c:cols[i%cols.length],life:.5+Math.random()*.5,max:.9});
  }
}
function drawCracks(b,dmg){
  const n=dmg>.7?3:dmg>.45?2:dmg>.2?1:0;if(!n)return;
  let sd=(b.id+3)*9301;const rnd=()=>{sd=(sd*9301+49297)%233280;return sd/233280};
  const horiz=b.w>=b.h,L=horiz?b.w:b.h,T=horiz?b.h:b.w;
  ctx.save();ctx.strokeStyle=b.m==='stone'?'rgba(20,22,26,.85)':'rgba(40,20,6,.85)';ctx.lineWidth=2;ctx.lineJoin='round';ctx.lineCap='round';
  for(let c=0;c<n;c++){
    // each crack runs across the short side, at a different place along the long side
    let u=(-.32+c*.32+(rnd()-.5)*.14)*L,v=-T/2;
    ctx.beginPath();
    const pt=(uu,vv)=>horiz?[b.x+uu,b.y+vv]:[b.x+vv,b.y+uu];
    let q=pt(u,v);ctx.moveTo(q[0],q[1]);
    for(let i=1;i<=4;i++){u+=(rnd()-.5)*T*.9;v=-T/2+T*i/4;q=pt(Math.max(-L/2+2,Math.min(L/2-2,u)),v);ctx.lineTo(q[0],q[1])}
    ctx.stroke();
  }
  ctx.restore();
}

/* ---- praise / challenge bubbles ---- */
const bubL=document.createElement('div');bubL.id='bubbles';document.getElementById('rot').appendChild(bubL);
let lastBub=0,lastTxt='',lvToken=0;
const PRAISE=['أحسنت','رائع','بطل'],HAPPY=['👏','🌟','🏆','🎉','✨','💪','🔥','😍','🥳','😎'];
const MINOR=['👍 جيد!','💥 ضربة!','😎 استمر!','⚡ أقوى!','🎯 صوّب جيدًا!','💪 تحدّي: اكسرها!','🔥 هيا هيا!','😃 ممتاز!'];
const pick=a=>{let t,k=0;do{t=a[Math.random()*a.length|0]}while(t===lastTxt&&++k<5);lastTxt=t;return t};
function bubble(x,y,txt,cls){
  while(bubL.children.length>5)bubL.removeChild(bubL.firstChild);
  const e=document.createElement('div');e.className='bub'+(cls?' '+cls:'');e.textContent=txt;
  const px=Math.max(60,Math.min(VP.w-60,(x+OX)/VW*VP.w+(Math.random()*40-20))),py=Math.max(50,(y+OY)/VH*VP.h-26);
  e.style.left=px+'px';e.style.top=py+'px';bubL.appendChild(e);
  setTimeout(()=>e.remove(),1550);
}
function praiseBubble(x,y,big){bubble(x,y,pick(PRAISE)+' '+HAPPY[Math.random()*HAPPY.length|0],big?'big':'')}
function minorBubble(x,y){
  const n=performance.now();if(n-lastBub<650)return;lastBub=n;
  bubble(x,y,pick(MINOR),'ch');
}
function foxBubble(b){
  lastBub=performance.now();
  const left=bodies.filter(q=>q.fox&&!q.dead&&q!==b).length;
  const top=b.y-(b.h||60)/2-24; // above the enemy, not coming out of it
  praiseBubble(b.x,top,true);
  const tok=lvToken;
  if(left>0)setTimeout(()=>{if(tok===lvToken)bubble(b.x,top-48,(b.kind==='wolf'?'🐺':'🦊')+' بقي '+left+' — هل تقدر؟ 💪','ch')},450);
  else setTimeout(()=>{if(tok===lvToken)bubble(b.x,top-48,'🎉 فزت! أنت بطل 🏆','big')},450);
}

/* ---- damage ---- */
function hit(b,speed){
  if(speed<170||b.dead)return;
  const now=performance.now();
  if(now-(b.lt||0)<250)return;
  b.lt=now;
  b.hp-=(speed-170)*0.22;
  if(b.hp<=0){b.dead=true;score+=b.fox?3:1;if(b.fox){SFX.fox();spawnPop(b.x,b.y);foxBubble(b)}else{SFX.breakBlock();spawnDebris(b,18,true);const n2=performance.now();if(n2-lastBub>300){lastBub=n2;praiseBubble(b.x,b.y,false)}}}
  else{b.ht=now;if(!b.fox)spawnDebris(b,7,false);score+=1;minorBubble(b.x,b.y);if(now-lastHit>60){lastHit=now;(b.m==='stone'?SFX.hitStone:SFX.hitWood)(Math.min(1,speed/700))}}
}

/* ---- physics (rotating rigid boxes) ---- */
const GROUND={id:-1,im:0,ii:0,vx:0,vy:0,av:0,x:0,y:GY,static:true};let warm={};
function verts(b){
  const c=Math.cos(b.a),s=Math.sin(b.a),hw=b.w/2,hh=b.h/2;
  return [[-hw,-hh],[hw,-hh],[hw,hh],[-hw,hh]].map(p=>[b.x+p[0]*c-p[1]*s,b.y+p[0]*s+p[1]*c]);
}
function inside(b,v,eps){
  const c=Math.cos(b.a),s=Math.sin(b.a),dx=v[0]-b.x,dy=v[1]-b.y,lx=dx*c+dy*s,ly=-dx*s+dy*c;
  return Math.abs(lx)<=b.w/2+eps&&Math.abs(ly)<=b.h/2+eps;
}
function sat(a,b){
  const axes=[];
  for(const o of [a,b]){const c=Math.cos(o.a),s=Math.sin(o.a);axes.push([c,s],[-s,c])}
  let best=1e9,bn=null;
  for(const ax of axes){
    let a0=1e9,a1=-1e9,b0=1e9,b1=-1e9;
    for(const v of a.v){const d=v[0]*ax[0]+v[1]*ax[1];if(d<a0)a0=d;if(d>a1)a1=d}
    for(const v of b.v){const d=v[0]*ax[0]+v[1]*ax[1];if(d<b0)b0=d;if(d>b1)b1=d}
    const ov=Math.min(a1-b0,b1-a0);
    if(ov<=0)return null;
    if(ov<best){best=ov;bn=ax}
  }
  if((a.x-b.x)*bn[0]+(a.y-b.y)*bn[1]<0)bn=[-bn[0],-bn[1]];
  return{n:bn};
}
function addPts(out,a,b,nx,ny,pts,fric){
  if(!pts.length)return;
  if(pts.length>2){
    const tx=-ny,ty=nx;let lo=pts[0],hi=pts[0];
    for(const p of pts){const t=p[0]*tx+p[1]*ty;if(t<lo[0]*tx+lo[1]*ty)lo=p;if(t>hi[0]*tx+hi[1]*ty)hi=p}
    pts=lo===hi?[lo]:[lo,hi];
  }
  for(const p of pts)out.push({a,b,nx,ny,px:p[0],py:p[1],d:p[2],fric,Pn:0,Pt:0,key:a.id+'|'+b.id+'|'+p[3]});
}
function boxContacts(a,b,out){
  const r=sat(a,b);if(!r)return;
  const nx=r.n[0],ny=r.n[1];let sA=1e9,sB=-1e9;
  for(const v of a.v)sA=Math.min(sA,v[0]*nx+v[1]*ny);
  for(const v of b.v)sB=Math.max(sB,v[0]*nx+v[1]*ny);
  const pts=[];
  for(const v of a.v){const d=sB-(v[0]*nx+v[1]*ny);if(d>-1&&inside(b,v,1.5))pts.push([v[0],v[1],d,a.v.indexOf(v)])}
  for(const v of b.v){const d=(v[0]*nx+v[1]*ny)-sA;if(d>-1&&inside(a,v,1.5))pts.push([v[0],v[1],d,4+b.v.indexOf(v)])}
  addPts(out,a,b,nx,ny,pts,.55);
}
function circleContact(c,b,out){
  const cs=Math.cos(b.a),sn=Math.sin(b.a),dx=c.x-b.x,dy=c.y-b.y,lx=dx*cs+dy*sn,ly=-dx*sn+dy*cs,hw=b.w/2,hh=b.h/2;
  const qx=Math.max(-hw,Math.min(hw,lx)),qy=Math.max(-hh,Math.min(hh,ly));
  let ex=lx-qx,ey=ly-qy,d=Math.hypot(ex,ey);
  if(d>=c.r)return;
  if(d<1e-4){const px=hw-Math.abs(lx),py=hh-Math.abs(ly);if(px<py){ex=lx<0?-1:1;ey=0;d=-px}else{ex=0;ey=ly<0?-1:1;d=-py}}
  else{ex/=d;ey/=d}
  out.push({a:c,b,nx:ex*cs-ey*sn,ny:ex*sn+ey*cs,px:b.x+qx*cs-qy*sn,py:b.y+qx*sn+qy*cs,d:c.r-d,fric:0,Pn:0,Pt:0,bird:true,key:'bird'});
}
function buildContacts(){
  const out=[];
  for(const b of bodies){b.v=verts(b);b.rad=Math.hypot(b.w,b.h)/2}
  for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){
    const a=bodies[i],b=bodies[j];
    if(Math.hypot(a.x-b.x,a.y-b.y)>a.rad+b.rad)continue;
    boxContacts(a,b,out);
  }
  for(const a of bodies){
    const pts=[];a.v.forEach((v,i)=>{if(v[1]>GY-1)pts.push([v[0],v[1],v[1]-GY,i])});
    addPts(out,a,GROUND,0,-1,pts,.7);
  }
  if(bird&&bird.flying)for(const b of bodies)circleContact(bird,b,out);
  return out;
}
function relN(c){
  const a=c.a,b=c.b;
  return((a.vx-a.av*c.ray)-(b.vx-b.av*c.rby))*c.nx+((a.vy+a.av*c.rax)-(b.vy+b.av*c.rbx))*c.ny;
}
function relT(c){
  const a=c.a,b=c.b;
  return((a.vx-a.av*c.ray)-(b.vx-b.av*c.rby))*c.tx+((a.vy+a.av*c.rax)-(b.vy+b.av*c.rbx))*c.ty;
}
function applyImp(c,ix,iy){
  const a=c.a,b=c.b;
  a.vx+=a.im*ix;a.vy+=a.im*iy;a.av+=a.ii*(c.rax*iy-c.ray*ix);
  b.vx-=b.im*ix;b.vy-=b.im*iy;b.av-=b.ii*(c.rbx*iy-c.rby*ix);
}
function solve(cs,dt){
  for(const c of cs){
    const a=c.a,b=c.b;
    c.rax=c.px-a.x;c.ray=c.py-a.y;c.rbx=c.px-b.x;c.rby=c.py-b.y;
    c.tx=-c.ny;c.ty=c.nx;
    const rna=c.rax*c.ny-c.ray*c.nx,rnb=c.rbx*c.ny-c.rby*c.nx;
    const rta=c.rax*c.ty-c.ray*c.tx,rtb=c.rbx*c.ty-c.rby*c.tx;
    c.kN=a.im+b.im+rna*rna*a.ii+rnb*rnb*b.ii;
    c.kT=a.im+b.im+rta*rta*a.ii+rtb*rtb*b.ii;
    const vn=relN(c);
    c.bias=Math.min(150,.2/dt*Math.max(c.d-.5,0));
    c.bounce=-vn>260?-.15*vn:0;
    const w=warm[c.key];
    if(vn<0){const imp=-vn;if(c.bird)hit(b,imp);else if(b.static)hit(a,imp*.5);else{hit(a,imp*.7);hit(b,imp*.7)}}
    if(w&&!c.bird&&c.bounce===0){c.Pn=w.Pn;c.Pt=w.Pt;applyImp(c,c.nx*c.Pn+c.tx*c.Pt,c.ny*c.Pn+c.ty*c.Pt)}
  }
  for(let it=0;it<10;it++)for(const c of cs){
    let dP=(Math.max(c.bias,c.bounce)-relN(c))/c.kN;
    const nP=Math.max(c.Pn+dP,0);dP=nP-c.Pn;c.Pn=nP;
    applyImp(c,c.nx*dP,c.ny*dP);
    if(c.fric){
      let dT=-relT(c)/c.kT;const mx=c.fric*c.Pn,nT=Math.max(-mx,Math.min(mx,c.Pt+dT));
      dT=nT-c.Pt;c.Pt=nT;applyImp(c,c.tx*dT,c.ty*dT);
    }
  }
  warm={};for(const c of cs)warm[c.key]={Pn:c.Pn,Pt:c.Pt};
}
function step(dt){
  for(const b of bodies)b.vy+=G*dt;
  const flying=bird&&bird.flying;
  if(flying){bird.vy+=G*dt;bird.age+=dt;if(bird.x>VW-OX+80||bird.x<-OX-80)bird.age=99}
  solve(buildContacts(),dt);
  for(const b of bodies){
    b.x+=b.vx*dt;b.y+=b.vy*dt;b.a+=b.av*dt;
    b.vx*=1-.1*dt;b.vy*=1-.02*dt;b.av*=1-1.2*dt;
    if(Math.hypot(b.vx,b.vy)<6&&Math.abs(b.av)<.05)b.rest+=dt;else b.rest=0;
    if(b.rest>.5){b.vx=b.vy=b.av=0}
  }
  if(flying){
    bird.x+=bird.vx*dt;bird.y+=bird.vy*dt;
    if(bird.y+bird.r>GY){bird.y=GY-bird.r;bird.vy=bird.vy>150?-bird.vy*.25:0;bird.vx*=.9}
  }
  // anything knocked far off the screen is gone; an enemy out there counts as defeated
  for(const b of bodies){
    if(b.dead||(b.x>-OX-60&&b.x<VW-OX+60&&b.y<H+OY+120))continue;
    b.dead=true;
    if(b.fox){score+=3;SFX.fox();foxBubble({x:Math.max(-OX+60,Math.min(VW-OX-60,b.x)),y:b.y,h:b.h,kind:b.kind})}
  }
  bodies=bodies.filter(b=>!b.dead);
}

/* ---- input ---- */
function pos(e){const p=toLocal(e.clientX,e.clientY);return{x:p.x*VW/VP.w-OX,y:p.y*VH/VP.h-OY}}
cv.addEventListener('pointerdown',e=>{
  initAudio();
  const p=pos(e);
  if(state==='aim'&&bird&&!bird.hop&&Math.hypot(p.x-bird.x,p.y-bird.y)<55){SFX.pull();drag=p;dragId=e.pointerId;try{cv.setPointerCapture(e.pointerId)}catch(_){}}
  else if(state==='fly'&&bird&&!bird.used)useAbility();
});
cv.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==dragId||!bird)return;
  let p=pos(e),dx=p.x-SL.x,dy=p.y-SL.y,d=Math.hypot(dx,dy);
  if(d>MAXPULL){dx*=MAXPULL/d;dy*=MAXPULL/d}
  if(SL.y+dy>GY-bird.r){dy=GY-bird.r-SL.y}
  bird.x=SL.x+dx;bird.y=SL.y+dy;
});
cv.addEventListener('pointercancel',e=>{
  if(!drag||e.pointerId!==dragId)return;drag=null;dragId=null;
  if(bird&&!bird.flying){bird.x=SL.x;bird.y=SL.y}
});
cv.addEventListener('pointerup',e=>{
  if(!drag||e.pointerId!==dragId||!bird)return;drag=null;dragId=null;
  const dx=SL.x-bird.x,dy=SL.y-bird.y;
  if(Math.hypot(dx,dy)<14){bird.x=SL.x;bird.y=SL.y;return}
  bird.vx=dx*POWER;bird.vy=dy*POWER;bird.flying=true;state='fly';trail=[];SFX.launch();
});
function useAbility(){
  bird.used=true;
  if(bird.h.ability==='dash'){SFX.dash();const s=Math.hypot(bird.vx,bird.vy)||1;bird.vx=bird.vx/s*Math.max(s*1.7,900);bird.vy=bird.vy/s*Math.max(s*1.7,900)*.8}
}

/* ---- game flow ---- */
const msg=document.getElementById('msg'),mt=document.getElementById('mt'),ms=document.getElementById('ms'),mb=document.getElementById('mb');
function showMsg(t,s,btn,fn){msg.classList.remove('lose','win');mb.className='';mt.textContent=t;ms.textContent=s;mb.textContent=btn;mb.onclick=fn;msg.style.display='flex'}
// defeat: the victorious fox (smug half-closed eyes, rays, confetti) above a replay button
function drawLoseFox(kind){kind=kind||'fox';
  const c=document.getElementById('lfox'),g=c.getContext('2d'),S=440;g.clearRect(0,0,S,S);
  g.save();g.translate(S/2,S*.52);
  for(let i=0;i<14;i++){g.rotate(Math.PI*2/14);g.fillStyle='rgba(255,213,79,.3)';g.beginPath();g.moveTo(0,0);g.lineTo(-16,-S*.47);g.lineTo(16,-S*.47);g.fill()}
  g.restore();
  const gl=g.createRadialGradient(S/2,S*.52,10,S/2,S*.52,S*.36);gl.addColorStop(0,'rgba(255,244,200,.95)');gl.addColorStop(1,'rgba(255,244,200,0)');
  g.fillStyle=gl;g.beginPath();g.arc(S/2,S*.52,S*.36,0,7);g.fill();
  if(sheetOk){
    const r=SPR[kind],h=310,w=h*r[2]/r[3];
    g.save();g.translate(S/2,S*.56);g.rotate(-.07);
    g.drawImage(SHEET,r[0],r[1],r[2],r[3],-w/2,-h/2,w,h);
    for(const [fx0,fy0] of (kind==='wolf'?[[.462,.471]]:[[.457,.467],[.838,.456]])){ // half-closed lids = smug look
      const ex=(fx0-.5)*w,ey=(fy0-.5)*h,er=.09*w;
      g.fillStyle=kind==='wolf'?'#8d877d':'#e2893a';g.beginPath();g.arc(ex,ey,er,Math.PI,0);g.closePath();g.fill();
      g.strokeStyle='#6b3b12';g.lineWidth=4;g.lineCap='round';g.beginPath();g.moveTo(ex-er,ey);g.lineTo(ex+er,ey);g.stroke();
    }
    g.restore();
  }
  const cols=['#ff7043','#4fc3f7','#ffd54f','#81c784','#ba68c8'];let sd=7;const rnd=()=>{sd=(sd*9301+49297)%233280;return sd/233280};
  for(let i=0;i<26;i++){g.save();g.translate(rnd()*S,rnd()*S*.8);g.rotate(rnd()*6);g.fillStyle=cols[i%5];g.fillRect(-5,-2.5,10,5);g.restore()}
  g.fillStyle='#ffd54f';g.strokeStyle='#e0a100';g.lineWidth=2;g.font='38px serif';g.textAlign='center';g.textBaseline='middle';
  for(const [x,y] of [[60,70],[385,95],[70,330],[380,340]]){g.strokeText('✦',x,y);g.fillText('✦',x,y)}
}
function showLose(fn,kind){msg.classList.remove('win');msg.classList.add('lose');drawLoseFox(kind);mb.className='mbtn';mb.innerHTML='<svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg><span>إعادة</span>';mb.onclick=fn;msg.style.display='flex'}
function hideMsg(){msg.style.display='none'}
// win: the hero that finished the level, smiling, on golden rays with confetti
const HAPPY_FACE={ // where the rabbit's eyes/brows and mouth are, as fractions of its sprite
  rabbit:{cover:[[.515,.415,.14,.115,'30,30,30',.84],[.795,.415,.13,.115,'243,241,238',.8],[.69,.61,.085,.045,'243,241,238',.6]],
          eyes:[[.52,.44,'#f3f1ee'],[.785,.44,'#2b2b2b']],mouth:[.69,.595],blush:[[.44,.54],[.9,.53]]}
};
function drawWinHero(k){
  const H0=HERO[k]||HERO.rabbit,art=H0.art,c=document.getElementById('lfox'),g=c.getContext('2d'),S=440;g.clearRect(0,0,S,S);
  g.save();g.translate(S/2,S*.52);
  for(let i=0;i<16;i++){g.rotate(Math.PI*2/16);g.fillStyle=i%2?'rgba(255,213,79,.38)':'rgba(129,199,132,.3)';g.beginPath();g.moveTo(0,0);g.lineTo(-18,-S*.48);g.lineTo(18,-S*.48);g.fill()}
  g.restore();
  const gl=g.createRadialGradient(S/2,S*.52,10,S/2,S*.52,S*.38);gl.addColorStop(0,'rgba(255,250,215,.97)');gl.addColorStop(1,'rgba(255,250,215,0)');
  g.fillStyle=gl;g.beginPath();g.arc(S/2,S*.52,S*.38,0,7);g.fill();
  if(sheetOk&&SPR[art]){
    const r=SPR[art],h=300,w=h*r[2]/r[3];
    g.save();g.translate(S/2,S*.56);g.rotate(.05);
    g.drawImage(SHEET,r[0],r[1],r[2],r[3],-w/2,-h/2,w,h);
    const F=HAPPY_FACE[art];
    if(F){
      const P=(fx,fy)=>[(fx-.5)*w,(fy-.5)*h];
      for(const [fx,fy,rx,ry,col,soft] of F.cover){ // soft patches of fur over the angry eyes and frown
        const [p,q]=P(fx,fy),R=rx*w;g.save();g.translate(p,q);g.scale(1,ry*h/R);
        const gr=g.createRadialGradient(0,0,0,0,0,R);gr.addColorStop(0,'rgb('+col+')');gr.addColorStop(soft,'rgb('+col+')');gr.addColorStop(1,'rgba('+col+',0)');
        g.fillStyle=gr;g.beginPath();g.arc(0,0,R,0,7);g.fill();g.restore();
      }
      g.lineCap='round';
      for(const [fx,fy,col] of F.eyes){const [p,q]=P(fx,fy);g.strokeStyle=col;g.lineWidth=w*.03;g.beginPath();g.arc(p,q+w*.03,w*.055,Math.PI*1.12,Math.PI*1.88);g.stroke()}
      {const [p,q]=P(F.mouth[0],F.mouth[1]);
        g.beginPath();g.moveTo(p-w*.06,q);g.quadraticCurveTo(p,q+w*.11,p+w*.06,q);g.closePath();g.fillStyle='#7a2b2b';g.fill();
        g.save();g.clip();g.fillStyle='#ff8fa3';g.beginPath();g.ellipse(p,q+w*.05,w*.032,w*.02,0,0,7);g.fill();g.restore();
        g.strokeStyle='#2b2b2b';g.lineWidth=w*.014;g.stroke()}
      g.fillStyle='rgba(255,120,140,.45)';for(const [fx,fy] of F.blush){const [p,q]=P(fx,fy);g.beginPath();g.ellipse(p,q,w*.055,w*.032,0,0,7);g.fill()}
    }
    g.restore();
  }
  const cols=['#ff7043','#4fc3f7','#ffd54f','#81c784','#ba68c8','#f06292'];let sd=11;const rnd=()=>{sd=(sd*9301+49297)%233280;return sd/233280};
  for(let i=0;i<30;i++){g.save();g.translate(rnd()*S,rnd()*S*.85);g.rotate(rnd()*6);g.fillStyle=cols[i%6];g.fillRect(-5,-2.5,10,5);g.restore()}
  g.fillStyle='#ffd54f';g.strokeStyle='#e0a100';g.lineWidth=2;g.font='38px serif';g.textAlign='center';g.textBaseline='middle';
  for(const [x,y] of [[58,72],[386,92],[66,330],[382,338]]){g.strokeText('✦',x,y);g.fillText('✦',x,y)}
}
const STAR='<svg viewBox="0 0 24 24"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z" fill="FILL" stroke="EDGE" stroke-width="1.6" stroke-linejoin="round"/></svg>';
function showWin(stars,note,onNext,onReplay,heroK){
  msg.classList.remove('lose');msg.classList.add('win');
  drawWinHero(heroK);
  mt.textContent='أحسنت!';ms.textContent=note||'';
  document.getElementById('wstars').innerHTML=[0,1,2].map(i=>STAR.replace('FILL',i<stars?'#ffc928':'#e3e6ea').replace('EDGE',i<stars?'#e09400':'#b9bfc6')).join('');
  document.getElementById('bnext').onclick=onNext;document.getElementById('brep').onclick=onReplay;
  msg.style.display='flex';
}
function foxesLeft(){return bodies.some(b=>b.fox)}
function afterShot(){
  if(!foxesLeft()){
    const left=birds.length,stars=left>=2?3:left===1?2:1;
    SFX.win();window.onWin&&window.onWin(lvIdx,stars);
    const nx=LEVELS[lvIdx+1],lastOfWorld=!nx||nx.world!==LEVELS[lvIdx].world,rw=lastOfWorld&&REWARD[LEVELS[lvIdx].world];
    showWin(stars,rw?'🎉 حرّرت '+rw.name+' '+rw.e:'',()=>{lvIdx=lvIdx<LEVELS.length-1?lvIdx+1:0;load(lvIdx)},()=>load(lvIdx),lastHero);
    state='end';return;
  }
  if(!birds.length){SFX.lose();showLose(()=>load(lvIdx),(bodies.find(q=>q.fox)||{}).kind);state='end';return}
  nextBird();
}
function update(dt){
  if(state==='end')return;
  shiftT=Math.min(1,shiftT+dt/.45);
  if(bird&&bird.hop){const h=bird.hop;h.t+=dt;const k=Math.min(1,h.t/.45),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;bird.x=SL.x-60+60*e;bird.y=GY-24+(SL.y-(GY-24))*e-80*Math.sin(Math.PI*k);if(k>=1){bird.x=SL.x;bird.y=SL.y;bird.hop=null}}
  step(dt);
  if(state==='fly'&&bird){
    if(trail.length===0||Math.hypot(bird.x-trail[trail.length-1].x,bird.y-trail[trail.length-1].y)>22)trail.push({x:bird.x,y:bird.y});
    const slow=Math.hypot(bird.vx,bird.vy)<30&&bird.age>.5; // stopped anywhere (ground or on debris)
    const calm=bodies.every(b=>Math.hypot(b.vx,b.vy)<12&&Math.abs(b.av)<.3);
    if((slow||bird.age>4||bird.age>=99)&&calm){settleT+=dt}else settleT=0;
    if(settleT>.5||bird.age>=99||bird.age>6){settleT=0;if(bird.age<99&&bird.x>-OX&&bird.x<VW-OX)fallen.push({k:bird.k,x:bird.x,y:bird.y,t:0});lastHero=bird.k;bird=null;afterShot()}
    else if(!foxesLeft()){settleT+=dt}
  }
}

/* ---- drawing ---- */
function rr(x,y,w,h,r){
  ctx.beginPath();
  if(ctx.roundRect){ctx.roundRect(x,y,w,h,r);return}
  r=Math.max(0,Math.min(r,Math.abs(w)/2,Math.abs(h)/2));
  ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
}
// everything that never moves (sky, hills, ground, scenery, sling) is painted once on the
// background canvas, and again only after a resize, a new level, or when an image finishes loading
function bgReady(){for(const k in ART)if(!artOk(k))return false;return [SKYIMG,ISLIMG,PASIMG].every(i=>i.complete&&i.naturalWidth>0)}
function isImgBg(){const L=LEVELS[lvIdx]||{};return !!(L.sky||L.isl||L.pas)}
function drawBg(){
  const LV=LEVELS[lvIdx]||{},SKY=!!LV.sky,ISL=!!LV.isl,PAS=!!LV.pas,IMGBG=SKY||ISL||PAS;
  const key=lvIdx+'|'+(SKY?1:ISL?2:PAS?3:0);
  if(!bgDirty&&key===bgKey)return;
  bgKey=key;bgDirty=!bgReady();
  ctx=bctx;
  try{
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,bgc.width,bgc.height);
  ctx.setTransform(SX,0,0,SY,0,0);
  if(IMGBG){drawSkyBg(SKY?SKYIMG:ISL?ISLIMG:PASIMG)}else{const g=grad('sky',()=>{const g=ctx.createLinearGradient(0,0,0,VH);g.addColorStop(0,'#8fd3ee');g.addColorStop(1,'#e6f6d8');return g});
  ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH)}
  ctx.translate(OX,OY);
  if(!IMGBG){
  standArt('mountain',600,GY+30,340);
  ctx.fillStyle='#5aa86a';ctx.beginPath();ctx.ellipse(250,GY+20,420,120,0,Math.PI,0);ctx.fill();
  ctx.fillStyle='#3f8a52';ctx.beginPath();ctx.ellipse(760,GY+30,380,100,0,Math.PI,0);ctx.fill();
  if(OX>0){ctx.fillStyle='#5aa86a';ctx.beginPath();ctx.ellipse(-OX+120,GY+20,300,100,0,Math.PI,0);ctx.fill();
    ctx.fillStyle='#3f8a52';ctx.beginPath();ctx.ellipse(W+OX-120,GY+30,300,100,0,Math.PI,0);ctx.fill()}
  ctx.fillStyle='#6b4a2b';ctx.fillRect(-OX,GY,VW,H-GY);
  ctx.fillStyle='#4aa04a';ctx.fillRect(-OX,GY,VW,10);
  // scenery behind the action
  standArt('tree',330,GY+8,135);standArt('rock2',425,GY+4,52);standArt('joshua',945,GY+4,90);
  }else if(SKY)drawCloudGround();else if(ISL)drawSandGround();else drawGrassGround();
  // sling
  if(!standArt('sling',SL.x,GY+4,69)){
  ctx.strokeStyle='#5b3a1a';ctx.lineWidth=12;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(SL.x,GY);ctx.lineTo(SL.x,SL.y+35);ctx.stroke();
  ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(SL.x,SL.y+35);ctx.lineTo(SL.x-18,SL.y-5);ctx.moveTo(SL.x,SL.y+35);ctx.lineTo(SL.x+18,SL.y-5);ctx.stroke()}
  }finally{ctx=mctx}
}
function draw(){
  drawBg();
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);
  ctx.setTransform(SX,0,0,SY,0,0);
  ctx.translate(OX,OY);
  if(!isImgBg())for(const c of clouds)drawCloud(c);
  // aim preview + band
  if(drag&&bird){
    let vx=(SL.x-bird.x)*POWER,vy=(SL.y-bird.y)*POWER,x=bird.x,y=bird.y;
    ctx.fillStyle='rgba(255,255,255,.85)';
    for(let i=0;i<22;i++){for(let k=0;k<3;k++){vy+=G/60/3*1;x+=vx/60/3;y+=vy/60/3}ctx.beginPath();ctx.arc(x,y,3.2,0,7);ctx.fill()}
    ctx.strokeStyle='#3a2410';ctx.lineWidth=6;
    ctx.beginPath();ctx.moveTo(SL.x-22,SL.y-20);ctx.lineTo(bird.x,bird.y);ctx.lineTo(SL.x+22,SL.y-20);ctx.stroke();
  }
  // trail
  ctx.fillStyle='rgba(255,255,255,.7)';for(const t of trail){ctx.beginPath();ctx.arc(t.x,t.y,2.6,0,7);ctx.fill()}
  // blocks
  for(const b of bodies){
    const t=MAT[b.m];
    ctx.save();
    ctx.translate(b.x,b.y);ctx.rotate(b.a);ctx.translate(-b.x,-b.y);
    if(b.fox){
      ctx.font=Math.round(b.w*1.15)+'px serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.globalAlpha=1;ctx.fillStyle='#000';
      drawFox(b);
    }else{
      const k=Math.max(0,1-(performance.now()-(b.ht||0))/260);if(k>0)ctx.translate(Math.sin(performance.now()/22)*1.8*k,Math.cos(performance.now()/27)*1.2*k);
      if(!blockArt(b)){ctx.fillStyle=t.col;ctx.strokeStyle=t.edge;ctx.lineWidth=3;
      rr(b.x-b.w/2,b.y-b.h/2,b.w,b.h,4);ctx.fill();ctx.stroke()}
      const dmg=Math.min(1,1-Math.max(0,b.hp)/t.hp);
      if(dmg>.02){ctx.fillStyle='rgba(20,10,0,'+(.34*dmg)+')';rr(b.x-b.w/2,b.y-b.h/2,b.w,b.h,4);ctx.fill()}
      drawCracks(b,dmg);
      if(k>0){ctx.fillStyle='rgba(255,255,255,'+(.5*k)+')';rr(b.x-b.w/2,b.y-b.h/2,b.w,b.h,4);ctx.fill()}
    }
    ctx.restore();
  }
  drawFx();
  // spent heroes: stay where they landed, then fade out gently
  for(const f of fallen){const H0=HERO[f.k];{const q=f.t<STAY?0:Math.min(1,(f.t-STAY)/FADE);ctx.globalAlpha=1-q*q*(3-2*q)}ctx.font=Math.round(H0.r*2.1)+'px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#000';if(!sprite(H0.art,f.x,f.y-2,H0.r*3))ctx.fillText(H0.emoji,f.x,f.y+1)}
  ctx.globalAlpha=1;
  // waiting birds + current
  ctx.globalAlpha=1;ctx.fillStyle='#000';
  birds.forEach((k,i)=>{ctx.font='28px serif';ctx.textAlign='center';ctx.textBaseline='middle';if(!sprite(HERO[k].art,SL.x-60-i*42-42*(1-Math.min(1,shiftT)),GY-22,44))ctx.fillText(HERO[k].emoji,SL.x-60-i*38,GY-16)});
  if(bird){ctx.font=Math.round(bird.r*2.1)+'px serif';ctx.textAlign='center';ctx.textBaseline='middle';if(!sprite(bird.h.art,bird.x,bird.y-2,bird.r*3))ctx.fillText(bird.h.emoji,bird.x,bird.y+1)}
  if(score!==shown){shown=score;scEl.textContent=score}
}

/* ---- loop ---- */
let last=performance.now(),acc=0,running=false,paused=true,endT=0;
function run(){if(paused||running)return;running=true;endT=0;last=performance.now();acc=0;requestAnimationFrame(frame)}
function frame(t){
  if(paused){running=false;return}
  const rdt=Math.min(.05,(t-last)/1000);acc+=rdt;last=t;
  try{
    moveClouds(rdt);updateFx(rdt);for(const f of fallen)f.t+=rdt;fallen=fallen.filter(f=>f.t<STAY+FADE);
    for(;;){const h=(bird&&bird.flying&&Math.hypot(bird.vx,bird.vy)>1100)?1/240:1/120;if(acc<h)break;update(h);acc-=h}
    draw();
  }catch(err){console.error(err)}
  // once a level is over and the effects have finished, stop drawing until the next level
  if(state==='end'){endT+=rdt;if(endT>1.5&&!fx.length&&!fallen.length){running=false;return}}else endT=0;
  requestAnimationFrame(frame);
}
window.startGame=i=>{lvIdx=i||0;paused=false;load(lvIdx)};
// a stopped game (level over) is redrawn once after a resize so the scene behind the window isn't blank
addEventListener('resize',()=>{if(!running&&!paused&&bodies)try{draw()}catch(e){}});
window.curLevel=()=>lvIdx;
window.pauseGame=()=>{paused=true;drag=null;dragId=null;bubL.innerHTML='';lvToken++};
window.LV_COUNT=LEVELS.length;
window.LV_WORLDS=[];for(let i=0;i<LEVELS.length;i++){const w=LEVELS[i].world;let g=window.LV_WORLDS.find(x=>x.name===w);if(!g)window.LV_WORLDS.push(g={name:w,idx:[]});g.idx.push(i)}
})();
