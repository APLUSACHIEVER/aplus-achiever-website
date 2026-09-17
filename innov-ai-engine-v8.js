/* APLUS AI Personal Learning Path V8
   Standalone planner. Reads V5 memory when available; existing files are untouched.
*/
(function(){'use strict';
const KEY='APLUS_AI_PATH_V8_STATE';
const DEFAULT_SKILLS=[
{id:'vocabulary::meaning',name:'Vocabulary Meaning',area:'Vocabulary',priority:92,reason:'Build reliable word meaning recall in context.'},
{id:'vocabulary::context',name:'Vocabulary in Context',area:'Vocabulary',priority:88,reason:'Use surrounding clues to select the precise meaning.'},
{id:'vocabulary::recall',name:'Vocabulary Recall',area:'Vocabulary',priority:76,reason:'Improve fast retrieval under test conditions.'},
{id:'grammar::subject-verb agreement',name:'Subject–Verb Agreement',area:'Grammar',priority:84,reason:'Secure a common grammar rule before moving to harder structures.'},
{id:'grammar::past perfect',name:'Past Perfect',area:'Grammar',priority:72,reason:'Strengthen sequence-of-events reasoning.'},
{id:'grammar::preposition',name:'Prepositions',area:'Grammar',priority:68,reason:'Improve accuracy in common usage patterns.'}
];
function fresh(){return{version:8,createdAt:new Date().toISOString(),planDate:new Date().toISOString().slice(0,10),minutes:20,focus:[],completed:[],history:[]}}
function load(){try{const s=JSON.parse(localStorage.getItem(KEY));return s&&s.version===8?s:fresh()}catch(e){return fresh()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function memory(){try{return window.APLUSAILearningMemoryV5?window.APLUSAILearningMemoryV5.snapshot(window.APLUSAILearningMemoryV5.load()):null}catch(e){return null}}
function scoreSkill(x){let key=x.id,score=x.priority||50;const m=memory();if(m){const found=(m.skills||[]).find(a=>a.key===key);if(found){score+=(1-(found.retention||.5))*45;score+=(1-(found.accuracy||.5))*25;if(found.mastery==='fragile')score+=18;if(found.mastery==='developing')score+=10;if(found.mastery==='mastered')score-=28}}return score}
function buildPlan(){const s=load();const ranked=DEFAULT_SKILLS.map(x=>Object.assign({},x,score:Math.round(scoreSkill(x)))).sort((a,b)=>b.score-a.score);s.focus=ranked.slice(0,4);s.planDate=new Date().toISOString().slice(0,10);return save(s)}
function today(){const s=load();return s.planDate===new Date().toISOString().slice(0,10)&&s.focus.length?s:buildPlan()}
function complete(id){const s=today();if(s.completed.indexOf(id)<0)s.completed.push(id);return save(s)}
function reset(){return save(fresh())}
function recommendation(){const s=today();const next=s.focus.find(x=>s.completed.indexOf(x.id)<0)||s.focus[0];return next?{skill:next,action:'practice',reason:next.reason}:null}
function progress(){const s=today();return{focus:s.focus,completed:s.completed,total:s.focus.length,done:s.completed.length,percent:s.focus.length?Math.round(s.completed.length/s.focus.length*100):0}}
function explainPlan(){const s=today();return{headline:'Your plan is built around what needs attention first.',steps:s.focus.map((x,i)=>({order:i+1,skill:x.name,area:x.area,priority:x.score,reason:x.reason}))}}
window.APLUSAIPathV8={version:8,load,save,today,buildPlan,complete,recommendation,progress,explainPlan,reset,skills:()=>DEFAULT_SKILLS.slice()};
})();