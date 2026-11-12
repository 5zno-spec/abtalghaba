/* Phones and tablets always play in landscape. If the device is held upright, #rot (which holds the
   whole game) is turned 90° and sized to the long side; VP gives the game's view size and toLocal()
   turns screen touch coordinates into game coordinates. */
(()=>{
const rot=document.getElementById('rot');
const touch=matchMedia('(pointer: coarse)').matches;
const VP=window.VP={w:innerWidth,h:innerHeight,rot:false};
function fit(){
  const iw=innerWidth,ih=innerHeight,r=touch&&ih>iw;
  VP.rot=r;VP.w=r?ih:iw;VP.h=r?iw:ih;
  rot.classList.toggle('rot',r);rot.classList.toggle('short',VP.h<520);
  rot.style.width=VP.w+'px';rot.style.height=VP.h+'px';
  rot.style.transform=r?'translateX('+iw+'px) rotate(90deg)':'';
  rot.style.setProperty('--vw',VP.w/100+'px');rot.style.setProperty('--vh',VP.h/100+'px');
}
window.toLocal=(x,y)=>VP.rot?{x:y,y:innerWidth-x}:{x,y};
// on phones, the first tap asks for full screen locked to landscape (Android); where that is not
// allowed (iPhone, desktop) the rotation above keeps the game in landscape anyway
window.lockLandscape=()=>{
  if(!touch)return;
  const so=screen.orientation;if(!so||!so.lock)return;
  const de=document.documentElement,fs=de.requestFullscreen||de.webkitRequestFullscreen;
  const go=()=>so.lock('landscape').catch(()=>{});
  if(document.fullscreenElement||matchMedia('(display-mode: standalone)').matches||!fs)go();
  else{try{const p=fs.call(de,{navigationUI:'hide'});p&&p.then?p.then(go,()=>{}):go()}catch(e){}}
};
addEventListener('resize',fit);addEventListener('orientationchange',()=>setTimeout(fit,80));fit();
})();
