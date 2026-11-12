const $=id=>document.getElementById(id);
const store={get(){try{return JSON.parse(localStorage.getItem('abtal_prog')||'{}')}catch(e){return {}}},set(o){try{localStorage.setItem('abtal_prog',JSON.stringify(o))}catch(e){}}};
let prog=store.get();if(typeof prog.unlocked!=='number')prog={unlocked:0,stars:{}};
if(prog.v!==2){const st={};for(const k in (prog.stars||{})){const i=+k;st[Math.floor(i/3)*10+i%3]=prog.stars[k]}prog={v:2,unlocked:Math.floor(prog.unlocked/3)*10+prog.unlocked%3,stars:st};store.set(prog)}
if(!prog.stars||typeof prog.stars!=='object')prog.stars={};prog.unlocked=Math.max(0,prog.unlocked|0);
window.onWin=(i,st)=>{prog.stars[i]=Math.max(prog.stars[i]||0,st);prog.unlocked=Math.max(prog.unlocked,Math.min(i+1,window.LV_COUNT-1));store.set(prog)};
const menu=$('menu'),logo=$('mlogo');
logo.src=document.querySelector('#splash img').src;$('shine').style.setProperty('--logo','url("'+logo.src+'")');
function showMenu(){window.pauseGame&&window.pauseGame();$('shine').style.display='';$('mpanel').style.display='flex';$('lpanel').style.display='none';$('bbk').style.display='none';menu.classList.add('show');requestAnimationFrame(()=>requestAnimationFrame(()=>menu.classList.add('vis')))}
function hideMenu(){menu.classList.remove('vis');setTimeout(()=>menu.classList.remove('show'),400);$('bbk').style.display='flex'}
function play(i){window.lockLandscape&&window.lockLandscape();initAudioSafe();hideMenu();window.startGame(i)}
function initAudioSafe(){}
const MAPBG='img/bg-map-jungle.webp';
const PASTURE='data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20960%20540%22%20preserveAspectRatio%3D%22xMidYMid%20slice%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22s%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%220%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%238fd3ee%22%2F%3E%3Cstop%20offset%3D%22.65%22%20stop-color%3D%22%23e6f6d8%22%2F%3E%3C%2FlinearGradient%3E%3CradialGradient%20id%3D%22h%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%23fff6b0%22%20stop-opacity%3D%22.9%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23fff6b0%22%20stop-opacity%3D%220%22%2F%3E%3C%2FradialGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22960%22%20height%3D%22540%22%20fill%3D%22url%28%23s%29%22%2F%3E%3Ccircle%20cx%3D%22800%22%20cy%3D%2290%22%20r%3D%22110%22%20fill%3D%22url%28%23h%29%22%2F%3E%3Ccircle%20cx%3D%22800%22%20cy%3D%2290%22%20r%3D%2244%22%20fill%3D%22%23ffe27a%22%2F%3E%3Cg%20fill%3D%22%23fff%22%20opacity%3D%22.92%22%3E%3Cellipse%20cx%3D%22170%22%20cy%3D%2280%22%20rx%3D%2270%22%20ry%3D%2222%22%2F%3E%3Cellipse%20cx%3D%22215%22%20cy%3D%2264%22%20rx%3D%2244%22%20ry%3D%2220%22%2F%3E%3Cellipse%20cx%3D%22520%22%20cy%3D%22130%22%20rx%3D%2260%22%20ry%3D%2218%22%2F%3E%3Cellipse%20cx%3D%22560%22%20cy%3D%22116%22%20rx%3D%2236%22%20ry%3D%2216%22%2F%3E%3C%2Fg%3E%3Cellipse%20cx%3D%22160%22%20cy%3D%22400%22%20rx%3D%22520%22%20ry%3D%22150%22%20fill%3D%22%23a5d98f%22%2F%3E%3Cellipse%20cx%3D%22800%22%20cy%3D%22420%22%20rx%3D%22560%22%20ry%3D%22170%22%20fill%3D%22%238cca78%22%2F%3E%3Cg%3E%3Crect%20x%3D%22110%22%20y%3D%22300%22%20width%3D%22110%22%20height%3D%2278%22%20fill%3D%22%23c0392b%22%2F%3E%3Cpolygon%20points%3D%22100%2C302%20165%2C252%20230%2C302%22%20fill%3D%22%238e2a20%22%2F%3E%3Crect%20x%3D%22146%22%20y%3D%22330%22%20width%3D%2238%22%20height%3D%2248%22%20fill%3D%22%23f4e4c1%22%2F%3E%3Cpath%20d%3D%22M146%20330l38%2048M184%20330l-38%2048%22%20stroke%3D%22%23c0392b%22%20stroke-width%3D%223%22%2F%3E%3C%2Fg%3E%3Cellipse%20cx%3D%22640%22%20cy%3D%22372%22%20rx%3D%2236%22%20ry%3D%2226%22%20fill%3D%22%23e8c15a%22%2F%3E%3Cellipse%20cx%3D%22640%22%20cy%3D%22354%22%20rx%3D%2224%22%20ry%3D%2216%22%20fill%3D%22%23f0cf72%22%2F%3E%3Cellipse%20cx%3D%22700%22%20cy%3D%22380%22%20rx%3D%2230%22%20ry%3D%2222%22%20fill%3D%22%23e8c15a%22%2F%3E%3Cellipse%20cx%3D%22480%22%20cy%3D%22560%22%20rx%3D%22760%22%20ry%3D%22190%22%20fill%3D%22%235fae5c%22%2F%3E%3Cg%20fill%3D%22%23f6ead0%22%3E%3Crect%20x%3D%220%22%20y%3D%22448%22%20width%3D%22960%22%20height%3D%226%22%2F%3E%3Crect%20x%3D%220%22%20y%3D%22470%22%20width%3D%22960%22%20height%3D%226%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%22436%22%20width%3D%229%22%20height%3D%2252%22%20rx%3D%222%22%2F%3E%3Crect%20x%3D%2280%22%20y%3D%22436%22%20width%3D%229%22%20height%3D%2252%22%20rx%3D%222%22%2F%3E%3Crect%20x%3D%22150%22%20y%3D%22436%22%20width%3D%229%22%20height%3D%2252%22%20rx%3D%222%22%2F%3E%3Crect%20x%3D%22220%22%20y%3D%22436%22%20width%3D%229%22%20height%3D%2252%22%20rx%3D%222%22%2F%3E%3Crect%20x%3D%22290%22%20y%3D%22436%22%20width%3D%229%22%20height%3D%2252%22%20rx%3D%222%22%2F%3E%3Crect%20x%3D%22360%22%20y%3D%22436%22%20width%3D%229%22%20height%3D%2252%22%20rx%3D%222%22%2F%3E%3Crect%20x%3D%22430%22%20y%3D%22436%22%20width%3D%229%22%20height%3D%2252%22%20rx%3D%222%22%2F%3E%3Crect%20x%3D%22500%22%20y%3D%22436%22%20width%3D%229%22%20height%3D%2252%22%20rx%3D%222%22%2F%3E%3Crect%20x%3D%22570%22%20y%3D%22436%22%20width%3D%229%22%20height%3D%2252%22%20rx%3D%222%22%2F%3E%3Crect%20x%3D%22640%22%20y%3D%22436%22%20width%3D%229%22%20height%3D%2252%22%20rx%3D%222%22%2F%3E%3Crect%20x%3D%22710%22%20y%3D%22436%22%20width%3D%229%22%20height%3D%2252%22%20rx%3D%222%22%2F%3E%3Crect%20x%3D%22780%22%20y%3D%22436%22%20width%3D%229%22%20height%3D%2252%22%20rx%3D%222%22%2F%3E%3Crect%20x%3D%22850%22%20y%3D%22436%22%20width%3D%229%22%20height%3D%2252%22%20rx%3D%222%22%2F%3E%3Crect%20x%3D%22920%22%20y%3D%22436%22%20width%3D%229%22%20height%3D%2252%22%20rx%3D%222%22%2F%3E%3C%2Fg%3E%3Cg%20transform%3D%22translate%28380%20500%29%22%3E%3Ccircle%20cx%3D%220%22%20cy%3D%220%22%20r%3D%2216%22%20fill%3D%22%23fff%22%2F%3E%3Ccircle%20cx%3D%22-14%22%20cy%3D%223%22%20r%3D%2211%22%20fill%3D%22%23fff%22%2F%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%224%22%20r%3D%2212%22%20fill%3D%22%23fff%22%2F%3E%3Cellipse%20cx%3D%2222%22%20cy%3D%22-2%22%20rx%3D%228%22%20ry%3D%229%22%20fill%3D%22%233a3a3a%22%2F%3E%3Crect%20x%3D%22-10%22%20y%3D%2212%22%20width%3D%223%22%20height%3D%2210%22%20fill%3D%22%233a3a3a%22%2F%3E%3Crect%20x%3D%228%22%20y%3D%2212%22%20width%3D%223%22%20height%3D%2210%22%20fill%3D%22%233a3a3a%22%2F%3E%3C%2Fg%3E%3Cg%20transform%3D%22translate%28430%20515%29%22%3E%3Ccircle%20cx%3D%220%22%20cy%3D%220%22%20r%3D%2216%22%20fill%3D%22%23fff%22%2F%3E%3Ccircle%20cx%3D%22-14%22%20cy%3D%223%22%20r%3D%2211%22%20fill%3D%22%23fff%22%2F%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%224%22%20r%3D%2212%22%20fill%3D%22%23fff%22%2F%3E%3Cellipse%20cx%3D%2222%22%20cy%3D%22-2%22%20rx%3D%228%22%20ry%3D%229%22%20fill%3D%22%233a3a3a%22%2F%3E%3Crect%20x%3D%22-10%22%20y%3D%2212%22%20width%3D%223%22%20height%3D%2210%22%20fill%3D%22%233a3a3a%22%2F%3E%3Crect%20x%3D%228%22%20y%3D%2212%22%20width%3D%223%22%20height%3D%2210%22%20fill%3D%22%233a3a3a%22%2F%3E%3C%2Fg%3E%3Cg%20transform%3D%22translate%28405%20525%29%22%3E%3Ccircle%20cx%3D%220%22%20cy%3D%220%22%20r%3D%2216%22%20fill%3D%22%23fff%22%2F%3E%3Ccircle%20cx%3D%22-14%22%20cy%3D%223%22%20r%3D%2211%22%20fill%3D%22%23fff%22%2F%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%224%22%20r%3D%2212%22%20fill%3D%22%23fff%22%2F%3E%3Cellipse%20cx%3D%2222%22%20cy%3D%22-2%22%20rx%3D%228%22%20ry%3D%229%22%20fill%3D%22%233a3a3a%22%2F%3E%3Crect%20x%3D%22-10%22%20y%3D%2212%22%20width%3D%223%22%20height%3D%2210%22%20fill%3D%22%233a3a3a%22%2F%3E%3Crect%20x%3D%228%22%20y%3D%2212%22%20width%3D%223%22%20height%3D%2210%22%20fill%3D%22%233a3a3a%22%2F%3E%3C%2Fg%3E%3Ccircle%20cx%3D%22637%22%20cy%3D%22516%22%20r%3D%223%22%20fill%3D%22%23f48fb1%22%2F%3E%3Ccircle%20cx%3D%22814%22%20cy%3D%22533%22%20r%3D%223%22%20fill%3D%22%23fff%22%2F%3E%3Ccircle%20cx%3D%22860%22%20cy%3D%22529%22%20r%3D%223%22%20fill%3D%22%23ffd54f%22%2F%3E%3Ccircle%20cx%3D%22664%22%20cy%3D%22503%22%20r%3D%223%22%20fill%3D%22%23ffd54f%22%2F%3E%3Ccircle%20cx%3D%22115%22%20cy%3D%22523%22%20r%3D%223%22%20fill%3D%22%23ce93d8%22%2F%3E%3Ccircle%20cx%3D%22889%22%20cy%3D%22515%22%20r%3D%223%22%20fill%3D%22%23ce93d8%22%2F%3E%3Ccircle%20cx%3D%22556%22%20cy%3D%22506%22%20r%3D%223%22%20fill%3D%22%23ffd54f%22%2F%3E%3Ccircle%20cx%3D%2213%22%20cy%3D%22513%22%20r%3D%223%22%20fill%3D%22%23ce93d8%22%2F%3E%3Ccircle%20cx%3D%22286%22%20cy%3D%22511%22%20r%3D%223%22%20fill%3D%22%23ce93d8%22%2F%3E%3Ccircle%20cx%3D%22163%22%20cy%3D%22504%22%20r%3D%223%22%20fill%3D%22%23ffd54f%22%2F%3E%3Ccircle%20cx%3D%22632%22%20cy%3D%22528%22%20r%3D%223%22%20fill%3D%22%23ffd54f%22%2F%3E%3Ccircle%20cx%3D%22135%22%20cy%3D%22500%22%20r%3D%223%22%20fill%3D%22%23fff%22%2F%3E%3Ccircle%20cx%3D%22214%22%20cy%3D%22513%22%20r%3D%223%22%20fill%3D%22%23ffd54f%22%2F%3E%3Ccircle%20cx%3D%22893%22%20cy%3D%22510%22%20r%3D%223%22%20fill%3D%22%23f48fb1%22%2F%3E%3Ccircle%20cx%3D%22321%22%20cy%3D%22512%22%20r%3D%223%22%20fill%3D%22%23ffd54f%22%2F%3E%3Ccircle%20cx%3D%22186%22%20cy%3D%22512%22%20r%3D%223%22%20fill%3D%22%23ce93d8%22%2F%3E%3Ccircle%20cx%3D%22305%22%20cy%3D%22501%22%20r%3D%223%22%20fill%3D%22%23f48fb1%22%2F%3E%3Ccircle%20cx%3D%22424%22%20cy%3D%22510%22%20r%3D%223%22%20fill%3D%22%23ffd54f%22%2F%3E%3Ccircle%20cx%3D%22270%22%20cy%3D%22504%22%20r%3D%223%22%20fill%3D%22%23f48fb1%22%2F%3E%3Ccircle%20cx%3D%22308%22%20cy%3D%22538%22%20r%3D%223%22%20fill%3D%22%23fff%22%2F%3E%3Ccircle%20cx%3D%22610%22%20cy%3D%22521%22%20r%3D%223%22%20fill%3D%22%23fff%22%2F%3E%3Ccircle%20cx%3D%22317%22%20cy%3D%22522%22%20r%3D%223%22%20fill%3D%22%23f48fb1%22%2F%3E%3Ccircle%20cx%3D%22492%22%20cy%3D%22520%22%20r%3D%223%22%20fill%3D%22%23ffd54f%22%2F%3E%3Ccircle%20cx%3D%22492%22%20cy%3D%22530%22%20r%3D%223%22%20fill%3D%22%23ffd54f%22%2F%3E%3Ccircle%20cx%3D%2258%22%20cy%3D%22516%22%20r%3D%223%22%20fill%3D%22%23fff%22%2F%3E%3Ccircle%20cx%3D%22767%22%20cy%3D%22522%22%20r%3D%223%22%20fill%3D%22%23ce93d8%22%2F%3E%3Ccircle%20cx%3D%2218%22%20cy%3D%22535%22%20r%3D%223%22%20fill%3D%22%23ce93d8%22%2F%3E%3Ccircle%20cx%3D%22374%22%20cy%3D%22524%22%20r%3D%223%22%20fill%3D%22%23fff%22%2F%3E%3Ccircle%20cx%3D%22463%22%20cy%3D%22502%22%20r%3D%223%22%20fill%3D%22%23ffd54f%22%2F%3E%3Ccircle%20cx%3D%22638%22%20cy%3D%22512%22%20r%3D%223%22%20fill%3D%22%23fff%22%2F%3E%3Ccircle%20cx%3D%22773%22%20cy%3D%22515%22%20r%3D%223%22%20fill%3D%22%23ce93d8%22%2F%3E%3Ccircle%20cx%3D%22352%22%20cy%3D%22532%22%20r%3D%223%22%20fill%3D%22%23f48fb1%22%2F%3E%3Ccircle%20cx%3D%22914%22%20cy%3D%22533%22%20r%3D%223%22%20fill%3D%22%23f48fb1%22%2F%3E%3Ccircle%20cx%3D%22794%22%20cy%3D%22529%22%20r%3D%223%22%20fill%3D%22%23fff%22%2F%3E%3Ccircle%20cx%3D%22603%22%20cy%3D%22523%22%20r%3D%223%22%20fill%3D%22%23f48fb1%22%2F%3E%3Ccircle%20cx%3D%2237%22%20cy%3D%22527%22%20r%3D%223%22%20fill%3D%22%23fff%22%2F%3E%3Ccircle%20cx%3D%22213%22%20cy%3D%22521%22%20r%3D%223%22%20fill%3D%22%23f48fb1%22%2F%3E%3Ccircle%20cx%3D%22940%22%20cy%3D%22509%22%20r%3D%223%22%20fill%3D%22%23f48fb1%22%2F%3E%3Ccircle%20cx%3D%22282%22%20cy%3D%22534%22%20r%3D%223%22%20fill%3D%22%23fff%22%2F%3E%3Ccircle%20cx%3D%22319%22%20cy%3D%22520%22%20r%3D%223%22%20fill%3D%22%23f48fb1%22%2F%3E%3Ccircle%20cx%3D%22181%22%20cy%3D%22505%22%20r%3D%223%22%20fill%3D%22%23ffd54f%22%2F%3E%3Ccircle%20cx%3D%22738%22%20cy%3D%22519%22%20r%3D%223%22%20fill%3D%22%23ce93d8%22%2F%3E%3Ccircle%20cx%3D%22165%22%20cy%3D%22503%22%20r%3D%223%22%20fill%3D%22%23fff%22%2F%3E%3Ccircle%20cx%3D%22615%22%20cy%3D%22534%22%20r%3D%223%22%20fill%3D%22%23ce93d8%22%2F%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%22515%22%20r%3D%223%22%20fill%3D%22%23f48fb1%22%2F%3E%3Ccircle%20cx%3D%22846%22%20cy%3D%22516%22%20r%3D%223%22%20fill%3D%22%23ce93d8%22%2F%3E%3Ccircle%20cx%3D%22666%22%20cy%3D%22526%22%20r%3D%223%22%20fill%3D%22%23ffd54f%22%2F%3E%3Ccircle%20cx%3D%2257%22%20cy%3D%22502%22%20r%3D%223%22%20fill%3D%22%23ce93d8%22%2F%3E%3Ccircle%20cx%3D%22342%22%20cy%3D%22513%22%20r%3D%223%22%20fill%3D%22%23ffd54f%22%2F%3E%3Ccircle%20cx%3D%22749%22%20cy%3D%22536%22%20r%3D%223%22%20fill%3D%22%23ffd54f%22%2F%3E%3Ccircle%20cx%3D%22645%22%20cy%3D%22526%22%20r%3D%223%22%20fill%3D%22%23fff%22%2F%3E%3Ccircle%20cx%3D%22172%22%20cy%3D%22527%22%20r%3D%223%22%20fill%3D%22%23f48fb1%22%2F%3E%3Ccircle%20cx%3D%22152%22%20cy%3D%22503%22%20r%3D%223%22%20fill%3D%22%23ce93d8%22%2F%3E%3Ccircle%20cx%3D%22301%22%20cy%3D%22509%22%20r%3D%223%22%20fill%3D%22%23ce93d8%22%2F%3E%3Ccircle%20cx%3D%22944%22%20cy%3D%22510%22%20r%3D%223%22%20fill%3D%22%23ce93d8%22%2F%3E%3Ccircle%20cx%3D%22499%22%20cy%3D%22520%22%20r%3D%223%22%20fill%3D%22%23ce93d8%22%2F%3E%3Ccircle%20cx%3D%22280%22%20cy%3D%22518%22%20r%3D%223%22%20fill%3D%22%23ce93d8%22%2F%3E%3Ccircle%20cx%3D%22413%22%20cy%3D%22509%22%20r%3D%223%22%20fill%3D%22%23fff%22%2F%3E%3Ccircle%20cx%3D%22386%22%20cy%3D%22534%22%20r%3D%223%22%20fill%3D%22%23ffd54f%22%2F%3E%3Ccircle%20cx%3D%22642%22%20cy%3D%22531%22%20r%3D%223%22%20fill%3D%22%23f48fb1%22%2F%3E%3C%2Fsvg%3E';
const WBG=[
  'linear-gradient(rgba(255,250,235,.55),rgba(255,250,235,.55)),url("'+MAPBG+'") center/cover no-repeat',
  'linear-gradient(rgba(255,250,235,.18),rgba(255,250,235,.18)),url("'+window.PASIMG.src+'") center/cover no-repeat',
  'linear-gradient(rgba(255,255,255,.12),rgba(255,255,255,.12)),url("'+window.SKYIMG.src+'") center/cover no-repeat',
  'linear-gradient(rgba(255,255,255,.15),rgba(255,255,255,.15)),url("'+window.ISLIMG.src+'") center/cover no-repeat'];
let wcur=0,wN=0,txNow=0;
const WMAP=[{mode:'smooth',kind:'dirt'},{mode:'line',kind:'stone'},{mode:'smooth',kind:'cloud'},{mode:'smooth',kind:'sand'}];
function mapPts(kind,N,por,VH){
  const ky=(VH||540)/540;
  const P=[];
  for(let i=0;i<N;i++){
    const t=i/(N-1);let u;
    if(kind==='dirt')u=.5+.45*Math.sin(i*.95);
    else if(kind==='stone')u=i%2?.12:.88;
    else if(kind==='cloud')u=Math.max(.05,Math.min(.95,.95-.9*t+.12*Math.sin(i*1.6)));
    else u=.1+.8*Math.sin(Math.PI*t);
    P.push(por?[Math.round(90+u*360),Math.round(870-710*t)]:[Math.round(860-750*(i===N-1?1:t*.93)),Math.round((150+u*260)*ky)]);
  }
  return P;
}
const _thumb={};
function charImg(k){
  if(_thumb[k])return _thumb[k];
  const S=window.SHEETIMG,r=window.SPR&&window.SPR[k];
  if(!S||!S.naturalWidth||!r)return null;
  const c=document.createElement('canvas');c.width=c.height=96;
  const sc=Math.min(96/r[2],96/r[3]),w=r[2]*sc,h=r[3]*sc;
  c.getContext('2d').drawImage(S,r[0],r[1],r[2],r[3],(96-w)/2,(96-h)/2,w,h);
  return _thumb[k]=c.toDataURL('image/png');
}
function pathD(P,mode,por){
  let d='M'+P[0].join(' ');
  for(let k=1;k<P.length;k++){
    const a=P[k-1],b=P[k];
    if(mode==='line')d+=' L'+b[0]+' '+b[1];
    else if(mode==='smooth'){
      const p0=P[k-2]||a,p3=P[k+1]||b;
      d+=' C'+(a[0]+(b[0]-p0[0])/6)+' '+(a[1]+(b[1]-p0[1])/6)+' '+(b[0]-(p3[0]-a[0])/6)+' '+(b[1]-(p3[1]-a[1])/6)+' '+b[0]+' '+b[1];
    }else d+=por?' C'+a[0]+' '+(a[1]+b[1])/2+' '+b[0]+' '+(a[1]+b[1])/2+' '+b[0]+' '+b[1]:' C'+(a[0]+b[0])/2+' '+a[1]+' '+(a[0]+b[0])/2+' '+b[1]+' '+b[0]+' '+b[1];
  }
  return d;
}
function pathArt(d,kind){
  const T=(w,c,x)=>'<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round" '+(x||'')+'/>';
  if(kind==='stone')return T(36,'#fff','opacity=".3"')+T(28,'#555c62')+'<path d="'+d+'" fill="none" stroke="#cfd3d6" stroke-width="20" stroke-linejoin="round" stroke-dasharray="20 7"/>';
  if(kind==='cloud')return T(24,'#ffffff','opacity=".55"')+T(44,'#ffffff','stroke-dasharray="0.1 30" opacity=".95"')+T(30,'#e4f1ff','stroke-dasharray="0.1 30" stroke-dashoffset="15"');
  if(kind==='sand')return T(40,'#b98a4a','opacity=".55"')+T(32,'#f4dca0','opacity=".97"')+T(7,'#b98a4a','stroke-dasharray="0.1 26" opacity=".85"');
  return T(32,'#fff','opacity=".3"')+T(22,'#6b4423','opacity=".92"')+T(12,'#e8c990','stroke-dasharray="2 20"');
}
function mapSvg(slide,w){
  const por=slide.clientWidth/slide.clientHeight<1,VW=por?540:960,VH=por?960:Math.round(Math.max(380,Math.min(540,960*slide.clientHeight/Math.max(1,slide.clientWidth))));
  const C=WMAP[w%WMAP.length],idx=window.LV_WORLDS[w].idx,P=mapPts(C.kind,idx.length+1,por,VH),d=pathD(P,C.mode,por);
  let o='<svg viewBox="0 0 '+VW+' '+VH+'" preserveAspectRatio="xMidYMid meet" style="overflow:visible">'+pathArt(d,C.kind);
  const rw=window.REWARD[window.LV_WORLDS[w].name];
  for(let i=0;i<P.length;i++){
    const x=P[i][0],y=P[i][1];
    if(i===P.length-1&&rw){
      const freed=(prog.stars[idx[idx.length-1]]||0)>0,img=charImg(rw.k);
      o+='<g class="node lock"><g class="nb">';
      if(freed)o+='<circle class="ring" cx="'+x+'" cy="'+y+'" r="50" fill="none" stroke="#ffd54f" stroke-width="5"/>';
      o+='<circle cx="'+x+'" cy="'+(y+5)+'" r="46" fill="rgba(0,0,0,.25)"/><circle cx="'+x+'" cy="'+y+'" r="46" fill="'+(freed?'#fff3c4':'#d5dbe0')+'" stroke="'+(freed?'#f5a300':'#7d847d')+'" stroke-width="6"/>';
      o+=img?'<image href="'+img+'" x="'+(x-40)+'" y="'+(y-40)+'" width="80" height="80" style="'+(freed?'':'filter:grayscale(.85) brightness(.75)')+'"/>':'<text x="'+x+'" y="'+(y+14)+'" text-anchor="middle" font-size="44">'+rw.e+'</text>';
      if(!freed){
        let bars='';for(let k=-3;k<=3;k++)bars+='<line x1="'+(x+k*11)+'" y1="'+(y-37)+'" x2="'+(x+k*11)+'" y2="'+(y+37)+'"/>';
        bars+='<line x1="'+(x-38)+'" y1="'+(y-20)+'" x2="'+(x+38)+'" y2="'+(y-20)+'"/><line x1="'+(x-38)+'" y1="'+(y+20)+'" x2="'+(x+38)+'" y2="'+(y+20)+'"/>';
        o+='<g stroke="#3a4a55" stroke-opacity=".5" stroke-width="8" stroke-linecap="round">'+bars+'</g><g stroke="#ffffff" stroke-width="4.5" stroke-linecap="round">'+bars+'</g><text x="'+(x+36)+'" y="'+(y+40)+'" font-size="26" text-anchor="middle">🔒</text>';
      }else o+='<text x="'+(x+38)+'" y="'+(y-34)+'" font-size="28" text-anchor="middle">✨</text>';
      o+='</g><text x="'+x+'" y="'+(y+76)+'" text-anchor="middle" font-size="24" font-weight="700" fill="#fff" stroke="#3a2a12" stroke-width="4" paint-order="stroke" font-family="inherit">'+rw.name+'</text>'
        +'<text x="'+x+'" y="'+(y+98)+'" text-anchor="middle" font-size="17" font-weight="700" fill="'+(freed?'#fff3c4':'#fff')+'" stroke="#3a2a12" stroke-width="3.5" paint-order="stroke" font-family="inherit">'+(freed?'تم تحريره!':'أنهِ المراحل لتحريره')+'</text></g>';
      continue;
    }
    const g=idx[i],has=g!==undefined,ok=has&&g<=prog.unlocked,n=has?Math.max(0,Math.min(3,prog.stars[g]|0)):0;
    o+='<g class="node'+(ok?'':' lock')+'"'+(ok?' data-i="'+g+'"':'')+'>';
    if(ok&&g===prog.unlocked)o+='<circle class="ring" cx="'+x+'" cy="'+y+'" r="30" fill="none" stroke="#ffd54f" stroke-width="5"/>';
    o+='<g class="nb"><circle cx="'+x+'" cy="'+(y+4)+'" r="30" fill="rgba(0,0,0,.25)"/><circle cx="'+x+'" cy="'+y+'" r="30" fill="'+(ok?'#4cb85a':'#b9bfb9')+'" stroke="'+(ok?'#1f5a28':'#7d847d')+'" stroke-width="5"/>'
     +(ok?'<text x="'+x+'" y="'+(y+10)+'" text-anchor="middle" font-size="28" font-weight="700" fill="#fff" font-family="inherit">'+(i+1)+'</text>':'<text x="'+x+'" y="'+(y+9)+'" text-anchor="middle" font-size="24">🔒</text>')+'</g>';
    if(ok)o+='<text x="'+x+'" y="'+(y+54)+'" text-anchor="middle" font-size="20" fill="#f5a300" stroke="#fff" stroke-width=".6" letter-spacing="2">'+'★'.repeat(n)+'<tspan fill="#fff" stroke="#c9a74a">'+'★'.repeat(3-n)+'</tspan></text>';
    o+='</g>';
  }
  return o+'</svg>';
}
function buildWorlds(){
  const W=window.LV_WORLDS,tr=$('wtrack');wN=W.length;tr.innerHTML='';
  for(let k=wN-1;k>=0;k--){const s=document.createElement('div');s.className='wslide';s.dataset.w=k;s.style.background=WBG[k%WBG.length];tr.appendChild(s)}
  tr.querySelectorAll('.wslide').forEach(s=>{
    s.innerHTML=mapSvg(s,+s.dataset.w);
    s.querySelectorAll('.node[data-i]').forEach(e=>e.onclick=()=>play(+e.dataset.i));
  });
  $('wdots').innerHTML=W.map(()=>'<i></i>').join('');
}
function place(anim){
  const tr=$('wtrack'),s=tr.querySelector('.wslide[data-w="'+wcur+'"]');if(!s)return;
  if(!anim)tr.classList.add('drag');
  txNow=-s.offsetLeft+($('lpanel').clientWidth-s.offsetWidth)/2;
  tr.style.transform='translateX('+txNow+'px)';
  if(!anim){tr.offsetWidth;tr.classList.remove('drag')}
  tr.querySelectorAll('.wslide').forEach(e=>e.classList.toggle('cur',+e.dataset.w===wcur));
  {const t=$('wtitle'),ic=['🌿','🐄','☁️','🏝️'][wcur%4];t.dataset.w=wcur%4;t.innerHTML='<span class="wic">'+ic+'</span><span>'+window.LV_WORLDS[wcur].name+'</span><span class="wic">'+ic+'</span>';t.classList.remove('pop');void t.offsetWidth;t.classList.add('pop')}
  $('wprev').style.visibility=wcur>0?'visible':'hidden';$('wnext').style.visibility=wcur<wN-1?'visible':'hidden';
  [...$('wdots').children].forEach((e,i)=>e.classList.toggle('on',i===wcur));
}
function goWorld(i){wcur=Math.max(0,Math.min(wN-1,i));place(true)}
function openWorlds(at){
  const u=at==null?prog.unlocked:at;wcur=Math.max(0,window.LV_WORLDS.findIndex(w=>w.idx.includes(u)));
  buildWorlds();place(false);
}
$('wprev').onclick=()=>goWorld(wcur-1);$('wnext').onclick=()=>goWorld(wcur+1);
let dg=null;const vw=$('lgrid');
const lx=e=>toLocal(e.clientX,e.clientY).x;
vw.addEventListener('pointerdown',e=>{dg={x:lx(e),id:e.pointerId,on:false}});
vw.addEventListener('pointermove',e=>{
  if(!dg)return;const dx=lx(e)-dg.x;
  if(!dg.on&&Math.abs(dx)>10){dg.on=true;$('wtrack').classList.add('drag');try{vw.setPointerCapture(dg.id)}catch(_){}}
  if(dg.on){let m=dx;if((dx>0&&wcur>=wN-1)||(dx<0&&wcur<=0))m=dx*.3;$('wtrack').style.transform='translateX('+(txNow+m)+'px)'}
});
function endDrag(e){
  if(!dg)return;const dx=lx(e)-dg.x,on=dg.on;dg=null;$('wtrack').classList.remove('drag');
  if(on){if(dx>60)goWorld(wcur+1);else if(dx<-60)goWorld(wcur-1);else place(true)}
}
vw.addEventListener('pointerup',endDrag);vw.addEventListener('pointercancel',endDrag);
addEventListener('keydown',e=>{if($('lpanel').style.display!=='flex')return;if(e.key==='ArrowLeft')goWorld(wcur+1);else if(e.key==='ArrowRight')goWorld(wcur-1)});
addEventListener('resize',()=>{if($('lpanel').style.display==='flex'){buildWorlds();place(false)}});
$('bplay').onclick=()=>play(prog.unlocked);
$('blv').onclick=()=>{$('shine').style.display='none';$('mpanel').style.display='none';$('lpanel').style.display='flex';openWorlds()};
$('bback').onclick=()=>{$('shine').style.display='';$('lpanel').style.display='none';$('mpanel').style.display='flex'};
$('bbk').onclick=()=>{const cur=window.curLevel?window.curLevel():null;showMenu();$('shine').style.display='none';$('mpanel').style.display='none';$('lpanel').style.display='flex';openWorlds(cur)};
setTimeout(()=>{const sp=$('splash');sp.classList.add('out');showMenu();setTimeout(()=>sp.remove(),700)},5000);
