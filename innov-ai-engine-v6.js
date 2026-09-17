/* APLUS AI Tutor V6
   Standalone tutor orchestrator. Reads V3 misconception signals and V5 learner memory.
   Does not modify existing APLUS files.
*/
(function(){'use strict';
const KEY='APLUS_AI_ENGINE_V6_TUTOR';
function fresh(){return {version:6,interactions:[],lastIntent:null,lastReply:null,lastQuestionId:null};}
function load(){try{const x=JSON.parse(localStorage.getItem(KEY));return x&&x.version===6?x:fresh();}catch(e){return fresh();}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s;}
function v3(){try{return window.APLUSAIEngineV3?window.APLUSAIEngineV3.load():JSON.parse(localStorage.getItem('APLUS_AI_ENGINE_V3_STATE'))||null;}catch(e){return null;}}
function v5(){try{return window.APLUSAILearningMemoryV5?window.APLUSAILearningMemoryV5.load():JSON.parse(localStorage.getItem('APLUS_AI_ENGINE_V5_MEMORY'))||null;}catch(e){return null;}}
function context(){const a=v3()||{},m=v5()||{};let snap=null,focus=null;try{if(window.APLUSAILearningMemoryV5){snap=window.APLUSAILearningMemoryV5.snapshot(m);focus=window.APLUSAILearningMemoryV5.focus(m);}}catch(e){}
if(!snap){const skills=Object.entries(m.skills||{}).map(([key,x])=>Object.assign({key},x));snap={student:m.student||{name:'Student'},totalAttempts:m.totalAttempts||0,totalCorrect:m.totalCorrect||0,overallAccuracy:m.totalAttempts?(m.totalCorrect||0)/m.totalAttempts:0,skills,weakSkills:skills.filter(x=>x.retention<.65).sort((x,y)=>x.retention-y.retention),stableSkills:skills.filter(x=>x.retention>=.75),misconceptions:m.misconceptions||{},sessions:m.sessions||[],lastActive:m.lastActive};}
return {v3:a,v5:m,memory:snap,focus};}
function intent(text){const t=String(text||'').toLowerCase();if(/why.*(wrong|incorrect|mistake)|为什么.*(错|错误)/.test(t))return'why_wrong';if(/weak|weakest|weakest at|最弱|弱项/.test(t))return'weakest_skill';if(/next|what.*learn|learn next|下一步|接下来学/.test(t))return'what_next';if(/give.*question|practice|练习|出.*题|给.*题/.test(t))return'give_question';if(/master|mastered|熟练|掌握/.test(t))return'mastery';if(/why.*(choose|selected)|为什么.*(选|选择)/.test(t))return'ai_decision';if(/explain|teach|how|解释|教我|怎么做/.test(t))return'explain';return'overview';}
function pct(n){return Math.round(Math.max(0,Math.min(1,n||0))*100)+'%';}
function weakest(c){const w=c.memory.weakSkills||[];if(w.length)return w[0];const a=c.v3.ability||{};const entries=Object.entries(a);if(entries.length){entries.sort((x,y)=>x[1]-y[1]);return {key:entries[0][0],retention:entries[0][1],accuracy:entries[0][1]};}return null;}
function replyFor(i,c){const v=c.v3||{},m=c.memory||{};const last=v.lastDiagnosis;const w=weakest(c);
if(i==='why_wrong'){if(last&&last.type&&last.type!=='correct')return `上一次错误主要属于「${last.label||last.type}」。${last.message||''}${last.specific?' 重点：'+last.specific:''} 下一步我会先给你一个更简单的例子，再安排一次针对性重测。`;return'我还没有收到一笔带诊断信息的错误记录。先完成一道题，我就能告诉你错在哪里，以及下一步怎么补。';}
if(i==='weakest_skill'){if(w)return `目前最需要加强的是「${w.key}」。${w.retention!=null?'当前保留度约 '+pct(w.retention)+'。':''} 我建议先做短练习，而不是一次做很多题。`;return'目前还没有足够的学习记录。我会在你完成几道题后建立个人能力画像。';}
if(i==='what_next'){if(c.focus&&c.focus.skill)return `下一步建议：${c.focus.type==='repair'?'先修复重复出现的误区':'先加强'}「${c.focus.skill}」。${c.focus.reason||''}`;if(w)return `下一步先练「${w.key}」，然后用一道新题检查是否真正掌握。`;return'先完成第一组练习，我会根据你的表现自动安排下一步。';}
if(i==='mastery'){if(w)return `我不会只看一次答对就判断掌握。现在「${w.key}」仍有需要加强的信号；我会结合正确率、保留度、连续表现和错误记录判断。`;return'目前还没有足够数据判断掌握程度。连续几次在不同题型中稳定答对后，我才会把技能标记为稳定或掌握。';}
if(i==='ai_decision'){return `我的选择依据不是随机出题，而是看学习记忆中的弱项、错误记录、误区和近期表现。${c.focus&&c.focus.reason?'当前重点：'+c.focus.reason:''}`;}
if(i==='explain'){if(last&&last.type&&last.type!=='correct')return `我们先处理刚才的误区：${last.message||'重新看清题目中的关键线索。'} 我会采用「解释 → 例子 → 小测 → 重测」的方式，而不是只给答案。`;return'可以。你告诉我一个词汇或语法点，我会用「简单解释 → 例子 → 检查理解 → 再测一次」的方式教你。';}
if(i==='give_question')return'可以。下一题会优先针对你目前较弱的技能，并避免刚刚做过的题。完成后，我会更新你的学习记忆。';
return `你好，我是 APLUS AI Tutor。现在我会结合你的学习记录来帮助你，而不是只给标准答案。你可以问我：我哪里最弱？为什么这题错？下一步学什么？给我一道适合我的题。`;
}
function chooseQuestion(c){const v=c.v3;if(v&&window.APLUSAIEngineV3){const r=window.APLUSAIEngineV3.selectNext(v,{exclude:v.lastQuestion});return r;}return null;}
function ask(text){const s=load(),c=context(),i=intent(text),r=replyFor(i,c);s.lastIntent=i;s.lastReply=r;s.interactions.unshift({at:new Date().toISOString(),intent:i,text:String(text||''),reply:r});s.interactions=s.interactions.slice(0,50);save(s);return {intent:i,reply:r,context:c,question:i==='give_question'?chooseQuestion(c):null};}
function recordTutorEvent(event){const s=load();s.interactions.unshift(Object.assign({at:new Date().toISOString(),type:'tutor-event'},event||{}));s.interactions=s.interactions.slice(0,50);return save(s);}
function history(){return load().interactions.slice();}
function reset(){return save(fresh());}
window.APLUSAITutorV6={version:6,load,save,context,intent,ask,chooseQuestion,recordTutorEvent,history,reset};
})();