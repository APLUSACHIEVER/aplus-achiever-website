/* APLUS AI Learning Coach V9
   Standalone daily coaching engine. Existing files are untouched.
*/
(function(){'use strict';
const KEY='APLUS_AI_COACH_V9_STATE';
const BANK=[
{id:'v9-vocab-reluctant',area:'Vocabulary',skill:'vocabulary::meaning',term:'reluctant',q:'Mia was ___ to speak in front of the class because she felt nervous.',options:['reluctant','delighted','certain','generous'],answer:0,explanation:'Reluctant means unwilling or hesitant to do something.'},
{id:'v9-vocab-adapt',area:'Vocabulary',skill:'vocabulary::context',term:'adapt',q:'Animals must ___ to changes in their environment in order to survive.',options:['adapt','scatter','ignore','borrow'],answer:0,explanation:'Adapt means to adjust to new conditions.'},
{id:'v9-vocab-precise',area:'Vocabulary',skill:'vocabulary::recall',term:'precise',q:'The teacher gave ___ instructions so everyone knew exactly what to do.',options:['precise','ancient','fragile','distant'],answer:0,explanation:'Precise means exact and accurate.'},
{id:'v9-grammar-sva',area:'Grammar',skill:'grammar::subject-verb agreement',term:'subject-verb agreement',q:'Neither the teacher nor the students ___ ready for the announcement.',options:['is','are','was','be'],answer:1,explanation:'With neither...nor, the verb agrees with the nearer subject: students are.'},
{id:'v9-grammar-perfect',area:'Grammar',skill:'grammar::past perfect',term:'past perfect',q:'By the time we arrived, the movie ___ already started.',options:['has','had','was','will'],answer:1,explanation:'Past perfect (had started) shows the earlier of two past events.'},
{id:'v9-grammar-prep',area:'Grammar',skill:'grammar::preposition',term:'preposition',q:'The students have been waiting ___ the bus for ten minutes.',options:['for','at','on','by'],answer:0,explanation:'We use “wait for” when referring to the person or thing expected.'}
];
function fresh(){return{version:9,date:new Date().toISOString().slice(0,10),minutes:20,startedAt:null,elapsed:0,queue:[],index:0,attempts:0,correct:0,review:0,practice:0,events:[],messages:[],finished:false};}
function load(){try{const s=JSON.parse(localStorage.getItem(KEY));return s&&s.version===9&&s.date===new Date().toISOString().slice(0,10)?s:fresh()}catch(e){return fresh()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function memory(){try{return window.APLUSAILearningMemoryV5?window.APLUSAILearningMemoryV5.load():null}catch(e){return null}}
function plan(){try{if(window.APLUSAIPathV8)return window.APLUSAIPathV8.today()}catch(e){}return null}
function score(q,s){let n=50,m=memory();if(m&&m.skills){const x=m.skills[(q.skill||'')];if(x)n+=(1-(x.retention||.5))*45+(1-(x.accuracy||.5))*25}if(q.area==='Vocabulary')n+=3;return n}
function buildQueue(){const s=load(),p=plan();let candidates=BANK.slice();if(p&&p.focus&&p.focus.length){const ids=p.focus.map(x=>x.id);candidates.sort((a,b)=>{const ai=ids.indexOf(a.skill),bi=ids.indexOf(b.skill);return (ai<0?99:ai)-(bi<0?99:bi)})}else candidates.sort((a,b)=>score(b,s)-score(a,s));
// Put due/review-oriented skills first, then practice across both areas.
s.queue=candidates.map(x=>x.id);s.index=0;s.events=[];s.messages=['Coach: Let’s use the next 20 minutes intelligently. I’ll adjust the session as you go.'];return save(s)}
function start(){let s=load();if(!s.startedAt){s.startedAt=Date.now();s.finished=false;if(!s.queue.length)buildQueue();s=load()}return save(s)}
function current(){const s=load();return s.queue[s.index]?BANK.find(q=>q.id===s.queue[s.index]):null}
function status(){const s=load();const elapsed=s.startedAt?Math.max(s.elapsed,Math.floor((Date.now()-s.startedAt)/1000)):0;const remaining=Math.max(0,s.minutes*60-elapsed);return{elapsed,remaining,percent:Math.min(100,Math.round(elapsed/(s.minutes*60)*100)),attempts:s.attempts,correct:s.correct,accuracy:s.attempts?Math.round(s.correct/s.attempts*100):0,review:s.review,practice:s.practice,finished:s.finished}}
function coachMessage(s,q,correct){if(correct)return s.attempts<3?'Coach: Good start. Keep going — I’ll increase variety if your accuracy stays strong.':'Coach: Correct. Your next task is selected from what still needs attention.';return 'Coach: Let’s slow down for this one. I’ve marked it for reinforcement before moving on.'}
function answer(choice,seconds){const s=load(),q=current();if(!q||s.finished)return{ok:false};const correct=Number(choice)===q.answer;s.attempts++;if(correct)s.correct++;else s.review++;s.practice++;s.events.unshift({at:new Date().toISOString(),id:q.id,correct,seconds:seconds==null?null:seconds});if(window.APLUSAILearningMemoryV5){try{window.APLUSAILearningMemoryV5.record(window.APLUSAILearningMemoryV5.load(),q,{correct,diagnosis:correct?null:{type:'coach-reinforcement'}},{seconds:seconds==null?null:seconds})}catch(e){}}
s.messages.unshift(coachMessage(s,q,correct));if(!correct){s.queue.push(q.id)}s.index++;if(s.index>=s.queue.length){s.finished=true;s.elapsed=s.startedAt?Math.floor((Date.now()-s.startedAt)/1000):s.elapsed}return save(s)}
function next(){const s=load();if(s.index<s.queue.length-1)s.index++;return save(s)}
function finish(){const s=load();s.finished=true;s.elapsed=s.startedAt?Math.floor((Date.now()-s.startedAt)/1000):s.elapsed;s.messages.unshift('Coach: Session complete. I’ve recorded today’s learning signal for future planning.');try{if(window.APLUSAILearningMemoryV5)window.APLUSAILearningMemoryV5.rememberSession(window.APLUSAILearningMemoryV5.load(),{type:'daily-coach-v9',attempts:s.attempts,correct:s.correct,accuracy:s.attempts?s.correct/s.attempts:0,review:s.review})}catch(e){}return save(s)}
function summary(){const s=load();return Object.assign(status(),{queueLength:s.queue.length,message:s.messages[0]||'Coach: Keep building consistency.'})}
function reset(){return save(fresh())}
window.APLUSAIEngineV9={version:9,bank:()=>BANK.slice(),load,save,buildQueue,start,current,status,answer,next,finish,summary,reset,plan};
})();