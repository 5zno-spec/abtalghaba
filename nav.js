// The phone's back button / back gesture goes to the previous screen instead of leaving the game:
// level (or its win/lose window) → level map → main menu → (only then) leave.
// While the player is anywhere but the main menu, one extra history entry is kept; pressing
// back uses it up, and this file takes the player one screen back (re-adding it if needed).
(()=>{
  const $=id=>document.getElementById(id);
  const inst=$('inst'),menu=$('menu');
  function depth(){
    if(inst&&inst.classList.contains('on'))return 3;                 // install popup open
    if($('bbk').style.display==='flex')return 2;                     // inside a level
    if(menu.classList.contains('show')&&$('lpanel').style.display==='flex')return 1; // level map
    return 0;                                                         // main menu
  }
  let held=false,quiet=false;
  function sync(){
    const d=depth();
    if(d>0&&!held){history.pushState({abtal:1},'');held=true}
    // back on the main menu by tapping (not the back button): drop the spare entry so the
    // next back press leaves right away instead of doing nothing
    else if(d===0&&held){held=false;quiet=true;history.back()}
  }
  addEventListener('popstate',()=>{
    if(quiet){quiet=false;return}
    held=false;
    const d=depth();
    if(d===3)$('instx').click();
    else if(d===2)$('bbk').click();
    else if(d===1)$('bback').click();
    setTimeout(sync,0);
  });
  // watch the screens change, whichever button or code changed them
  const mo=new MutationObserver(()=>sync());
  for(const el of [menu,$('lpanel'),$('bbk'),inst])if(el)mo.observe(el,{attributes:true,attributeFilter:['class','style']});
  sync();
})();
