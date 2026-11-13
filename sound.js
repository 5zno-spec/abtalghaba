// Sound on/off: the speaker button in the bottom-right corner, remembered on this device.
// Every AudioContext the game creates sends its sound through one switch, so muting silences
// everything without changing the game code. Loaded before game.js.
(()=>{
  let muted=false;
  try{muted=localStorage.getItem('abtal_mute')==='1'}catch(e){}
  const Base=window.AudioContext||window.webkitAudioContext;
  const switches=[];
  if(Base){
    // the speakers' "destination" is a getter somewhere up the prototype chain
    let p=Base.prototype,d=null;
    while(p&&!(d=Object.getOwnPropertyDescriptor(p,'destination')))p=Object.getPrototypeOf(p);
    if(d&&d.get){
      class Switched extends Base{
        constructor(...a){
          super(...a);
          const g=this.createGain();g.gain.value=muted?0:1;g.connect(d.get.call(this));
          Object.defineProperty(this,'destination',{value:g});
          switches.push(g);
        }
      }
      window.AudioContext=Switched;
      if(window.webkitAudioContext)window.webkitAudioContext=Switched;
    }
  }
  const btn=document.getElementById('bsnd');
  function setMuted(m){
    muted=!!m;
    try{localStorage.setItem('abtal_mute',muted?'1':'0')}catch(e){}
    for(const g of switches)g.gain.setTargetAtTime(muted?0:1,g.context.currentTime,.03);
    if(btn){
      btn.classList.toggle('off',muted);
      btn.setAttribute('aria-label',muted?'تشغيل الصوت':'كتم الصوت');
      btn.setAttribute('aria-pressed',muted?'true':'false');
    }
  }
  window.isMuted=()=>muted;
  if(btn){setMuted(muted);btn.addEventListener('click',e=>{e.stopPropagation();setMuted(!muted)})}
})();
