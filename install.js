(()=>{
const inst=document.getElementById('inst'),menu=document.getElementById('menu');
let dp=null,timer=null,due=false,closed=false;
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const KEY='abtal_inst_x';
const dismissed=()=>{try{return Date.now()-(+localStorage.getItem(KEY)||0)<864e5}catch(e){return false}};
const canShow=()=>!closed&&!standalone()&&!dismissed()&&(dp||ios)&&menu.classList.contains('vis');
function show(){if(!canShow())return;document.getElementById('instlogo').src=document.getElementById('mlogo').src;inst.classList.add('on')}
function hide(){inst.classList.remove('on')}
addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;if(due)show()});
addEventListener('appinstalled',()=>{closed=true;dp=null;hide()});
document.getElementById('instx').onclick=()=>{closed=true;hide();try{localStorage.setItem(KEY,Date.now())}catch(e){}};
document.getElementById('instb').onclick=async()=>{
  if(dp){const p=dp;dp=null;try{p.prompt();const r=await p.userChoice;if(r&&r.outcome==='accepted'){closed=true}}catch(e){}hide();return}
  inst.classList.add('hint');
};
/* show 2 seconds after the second screen (menu) opens; hide it when the menu closes */
new MutationObserver(()=>{
  const vis=menu.classList.contains('vis');
  if(vis&&!timer&&!due){timer=setTimeout(()=>{due=true;show()},2000)}
  if(!vis)hide();
}).observe(menu,{attributes:true,attributeFilter:['class']});
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
})();
