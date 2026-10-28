"use strict";(()=>{const menu=document.querySelector("header details.mobile-nav");if(!menu)return;
const summary=menu.querySelector("summary");
menu.addEventListener("click",e=>{if(e.target.closest('a[href^="#"]'))menu.open=false});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&menu.open){menu.open=false;summary.focus()}});
document.addEventListener("pointerdown",e=>{if(menu.open&&!menu.contains(e.target))menu.open=false});
const media=matchMedia("(min-width: 641px)");media.addEventListener("change",()=>{if(media.matches)menu.open=false});
})();