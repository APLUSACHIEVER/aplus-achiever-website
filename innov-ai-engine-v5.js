/* APLUS AI Student Learning Memory V5
   Standalone long-term learner memory layer. Does not modify existing files.
*/
(function(){'use strict';
const KEY='APLUS_AI_ENGINE_V5_MEMORY';
function fresh(){return {version:5,student:{id:'demo-student',name:'Student'},createdAt:new Date().toISOString(),lastActive:null,totalAttempts:0,totalCorrect:0,skills:{},knowledge:{},misconceptions:{},sessions:[],events:[],preferences:{pace:'adaptive',focus:[]}};}
function load(){try{const x=JSON.parse(localStorage.getItem(KEY));return x&&x.version===5?x:fresh();}catch(e){return fresh();}}
function save(s){s.lastActive=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(s));return s;}
function keyFor(q){return (q.area||'general')+'::'+(q.skill||q.term||q.id||'unknown');}
function ensure(s,k){if(!s.skills[k])s.skills[k]={attempts:0,correct:0,accuracy:0,streak:0,lastSeen:null,lastCorrect:null,confidence:.5,retention:.5,mastery:'developing'};return s.skills[k];}
function mastery(a){if(a>=.9)return'mastered';if(a>=.75)return'stable';if(a>=.55)return'developing';return'fragile';}
function record(s,q,result,meta){const k=keyFor(q),x=ensure(s,k),correct=!!result.correct,now=Date.now();x.attempts++;x.correct+=correct?1:0;x.accuracy=x.correct/x.attempts;x.streak=correct?x.streak+1:0;x.lastSeen=new Date(now).toISOString();if(correct)x.lastCorrect=x.lastSeen;x.confidence=Math.max(0,Math.min(1,x.confidence+(correct?.06:-.10)));x.retention=Math.max(0,Math.min(1,x.retention+(correct?.045:-.08)));x.mastery=mastery(x.retention*.6+x.accuracy*.4);if(result.diagnosis){const d=result.diagnosis.type;s.misconceptions[d]=(s.misconceptions[d]||0)+(correct?0:1);}s.totalAttempts++;s.totalCorrect+=correct?1:0;s.events.unshift({at:new Date(now).toISOString(),type:'answer',questionId:q.id,key:k,correct,diagnosis:result.diagnosis?result.diagnosis.type:null,seconds:meta&&meta.seconds!=null?meta.seconds:null});s.events=s.events.slice(0,200);return save(s);}
function rememberSession(s,summary){s.sessions.unshift(Object.assign({at:new Date().toISOString()},summary||{}));s.sessions=s.sessions.slice(0,50);return save(s);}
function snapshot(s){const skills=Object.entries(s.skills).map(([key,x])=>Object.assign({key},x));const weak=skills.filter(x=>x.retention<.65).sort((a,b)=>a.retention-b.retention);const stable=skills.filter(x=>x.retention>=.75).sort((a,b)=>b.retention-a.retention);return {student:s.student,totalAttempts:s.totalAttempts,totalCorrect:s.totalCorrect,overallAccuracy:s.totalAttempts?s.totalCorrect/s.totalAttempts:0,skills,weakSkills:weak,stableSkills:stable,misconceptions:s.misconceptions,sessions:s.sessions,lastActive:s.lastActive};}
function focus(s){const p=snapshot(s);if(p.weakSkills.length)return {type:'strengthen',skill:p.weakSkills[0].key,reason:'This skill has the lowest current retention signal.'};if(p.misconceptions&&Object.keys(p.misconceptions).length)return {type:'repair',skill:Object.keys(p.misconceptions).sort((a,b)=>p.misconceptions[b]-p.misconceptions[a])[0],reason:'A repeated misconception is present in the learning memory.'};return {type:'extend',reason:'Core skills are currently stable; introduce a controlled challenge.'};}
function exportData(s){return JSON.stringify(snapshot(s),null,2);}
function reset(){const s=fresh();return save(s);}
window.APLUSAILearningMemoryV5={version:5,load,save,record,rememberSession,snapshot,focus,exportData,reset,keyFor};
})();