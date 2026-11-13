// The phone's back button / back gesture goes to the previous screen instead of leaving the game:
// level (or its win/lose window) → level map → main menu → (only then) leave.
// One history entry is kept for each screen deeper than the main menu (map = 1, level = 2), and
// they are added at the moment the player taps into that screen. Chrome on Android skips history
// entries that a page adds without a tap, so entries are never re-added after a back press:
// each press simply uses up one entry and this file shows the screen one step back.
(()=>{
  const $=id=>document.getElementById(id);
  const menu=$('menu'),inst=$('inst');
  function depth(){
    if($('bbk').style.display==='flex')return 2;                                      // inside a level
    if(menu.classList.contains('show')&&$('lpanel').style.display==='flex')return 1;   // level map
    return 0;                                                                          // main menu
  }
  let count=0,quiet=0; // entries we added; back steps we triggered ourselves
  function sync(){
    const d=depth();
    while(count<d){history.pushState({abtal:count+1},'');count++}
    // went back with the game's own buttons: drop the spare entries so the phone's back button
    // keeps matching the screens
    if(count>d){const n=count-d;count=d;quiet++;history.go(-n)}
  }
  addEventListener('popstate',()=>{
    if(quiet>0){quiet--;return}
    count=Math.max(0,count-1);
    if(inst&&inst.classList.contains('on'))$('instx').click();
    const d=depth();
    if(d===2)$('bbk').click();
    else if(d===1)$('bback').click();
  });
  // watch the screens change, whichever button or code changed them
  const mo=new MutationObserver(()=>{if(!quiet)sync()});
  for(const el of [menu,$('lpanel'),$('bbk')])mo.observe(el,{attributes:true,attributeFilter:['class','style']});
})();
