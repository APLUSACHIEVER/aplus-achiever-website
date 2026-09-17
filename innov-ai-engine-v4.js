/* APLUS AI Smart Review Engine V4
   Standalone spaced-review scheduler. Existing website files are untouched.
*/
(function(){'use strict';
const KEY='APLUS_AI_ENGINE_V4_STATE';
const DEFAULT_INTERVALS=[10,1440,4320,10080,43200]; // minutes: 10m, 1d, 3d, 7d, 30d
const BANK=[
 {id:'v4-reluctant',area:'vocabulary',skill:'meaning',prompt:'The boy was ______ to speak in front of the class because he felt nervous.',options:['reluctant','eager','proud','careless'],answer:0},
 {id:'v4-hesitant',area:'vocabulary',skill:'meaning',prompt:'Sarah was ______ when asked to choose a team because she was unsure which one to join.',options:['hesitant','certain','cheerful','generous'],answer:0},
 {id:'v4-adapt',area:'vocabulary',skill:'context',prompt:'When Mei moved to a new school, she quickly learned the routines and ______ to her new environment.',options:['adapted','avoided','ignored','delayed'],answer:0},
 {id:'v4-sv',area:'grammar',skill:'subject-verb agreement',prompt:'The list of items ______ on the teacher’s desk.',options:['is','are','were','have'],answer:0},
 {id:'v4-past-perfect',area:'grammar',skill:'past perfect',prompt:'By the time the bus arrived, we ______ for twenty minutes.',options:['had waited','have waited','will wait','are waiting'],answer:0}
];
function fresh(){return {version:4,items:{},events:[],streak:0};}
function load(){try{const s=JSON.parse(localStorage.getItem(KEY));return s&&s.version===4?s:fresh();}catch(e){return fresh();}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s;}
function bank(){return BANK.slice();}
function ensure(s,q){if(!s.items[q.id])s.items[q.id]={id:q.id,area:q.area,skill:q.skill,level:0,reviews:0,correct:0,wrong:0,dueAt:Date.now(),lastAt:null,status:'new',ease:1};return s.items[q.id];}
function dueItems(s,now){now=now||Date.now();return BANK.filter(q=>ensure(s,q).dueAt<=now);}
function interval(level){return DEFAULT_INTERVALS[Math.max(0,Math.min(DEFAULT_INTERVALS.length-1,level))];}
function formatDue(ts){const d=ts-Date.now();if(d<=0)return 'Due now';const m=Math.ceil(d/60000);if(m<60)return 'in '+m+' min';const h=Math.ceil(m/60);if(h<24)return 'in '+h+' hr';const days=Math.ceil(h/24);return 'in '+days+' day'+(days===1?'':'s');}
function priority(q,s){const x=ensure(s,q),over=Math.max(0,Date.now()-x.dueAt)/60000;let p=over/30+ (x.wrong*2) + (x.level===0?1:0);p+=Math.random()*.05;return p;}
function selectNext(s){const due=dueItems(s);if(due.length){due.sort((a,b)=>priority(b,s)-priority(a,s));const q=due[0];return {question:q,mode:'review',reason:'This knowledge point is due for spaced review.',dueAt:ensure(s,q).dueAt};}
const q=BANK.slice().sort((a,b)=>priority(b,s)-priority(a,s))[0];return {question:q,mode:'practice',reason:'No review is due yet, so AI keeps the session moving with a practice item.',dueAt:ensure(s,q).dueAt};}
function answer(s,q,index,meta){const x=ensure(s,q),correct=index===q.answer;const now=Date.now();x.lastAt=now;x.reviews++;if(correct){x.correct++;x.level=Math.min(DEFAULT_INTERVALS.length-1,x.level+1);x.status=x.level>=4?'stable':'learning';let gap=interval(x.level);if(meta&&meta.fast===false)gap=Math.max(5,Math.round(gap*.7));x.dueAt=now+gap*60000;s.streak++;}else{x.wrong++;x.level=Math.max(0,x.level-1);x.status='needs review';x.dueAt=now+DEFAULT_INTERVALS[0]*60000;s.streak=0;}s.events.unshift({at:new Date(now).toISOString(),id:q.id,correct,level:x.level,nextDue:x.dueAt,mode:meta&&meta.mode||'practice'});s.events=s.events.slice(0,50);save(s);return {correct,item:x,next:selectNext(s),schedule:{label:formatDue(x.dueAt),dueAt:x.dueAt,intervalMinutes:correct?interval(x.level):DEFAULT_INTERVALS[0]}};}
function upcoming(s){return BANK.map(q=>{const x=ensure(s,q);return {question:q,item:x,dueLabel:formatDue(x.dueAt)}}).sort((a,b)=>a.item.dueAt-b.item.dueAt);}
function summary(s){const all=BANK.map(q=>ensure(s,q));return {due:all.filter(x=>x.dueAt<=Date.now()).length,total:all.length,stable:all.filter(x=>x.status==='stable').length,needsReview:all.filter(x=>x.status==='needs review').length,streak:s.streak};}
function reset(){return save(fresh());}
window.APLUSAIEngineV4={version:4,bank,load,save,selectNext,answer,upcoming,summary,formatDue,reset,intervals:DEFAULT_INTERVALS};
})();