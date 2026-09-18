/* APLUS SCIENCE FULL-PAPER TIMER V1 */
(function(){
"use strict";
const KEY="APLUS_SCIENCE_TIMED_V1";
function start(minutes,onTick,onEnd){let end=Date.now()+minutes*60000,st={end,minutes,active:true};localStorage.setItem(KEY,JSON.stringify(st));
function tick(){let s=JSON.parse(localStorage.getItem(KEY)||"{}"),left=Math.max(0,s.end-Date.now());if(!left){s.active=false;localStorage.setItem(KEY,JSON.stringify(s));onTick(0);onEnd&&onEnd();return}onTick(left);requestAnimationFrame(tick)}tick();return st}
function format(ms){let sec=Math.ceil(ms/1000),m=Math.floor(sec/60),s=sec%60;return String(m).padStart(2,"0")+":"+String(s).padStart(2,"0")}
window.APLUS_SCIENCE_TIMER_V1={start,format};
})();