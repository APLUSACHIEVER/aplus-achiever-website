/* APLUS SCIENCE QUESTION ENGINE V2 — question-level metadata + analytics */
(function(){
"use strict";
const Q=window.APLUS_SCIENCE_QUESTIONS_V1||[];
const KEY="APLUS_SCIENCE_ANALYTICS_V2";
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {attempts:[]}}}
function write(x){localStorage.setItem(KEY,JSON.stringify(x));return x}
function record(q,paperId,answer,earned,seconds){
 const x=read();x.attempts=x.attempts||[];x.attempts.push({id:q.id,paperId,answer,earned,marks:q.marks||0,topic:q.topic||"Unclassified",subtopic:q.subtopic||"",skill:q.skill||"Scientific reasoning",difficulty:q.difficulty||"standard",seconds:seconds||0,at:Date.now()});write(x);
}
function analytics(){
 const a=read().attempts||[], by={};
 a.forEach(x=>{const k=x.topic||"Unclassified";by[k]=by[k]||{topic:k,attempts:0,marks:0,earned:0};by[k].attempts++;by[k].marks+=Number(x.marks)||0;by[k].earned+=Number(x.earned)||0});
 return Object.values(by).map(x=>Object.assign(x,{accuracy:x.marks?Math.round(x.earned/x.marks*100):0})).sort((a,b)=>a.accuracy-b.accuracy);
}
window.APLUS_SCIENCE_ANALYTICS_V2={record,analytics,read};
})();