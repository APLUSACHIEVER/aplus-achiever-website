/* APLUS SCIENCE PRACTICE ENGINE V1 */
(function(){
"use strict";
const E=window.APLUS_SCIENCE_ENGINE_V1;
const Q=window.APLUS_SCIENCE_QUESTIONS_V1||[];
const KEY="APLUS_SCIENCE_PRACTICE_V1";
function load(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){return {}}}
function save(x){localStorage.setItem(KEY,JSON.stringify(x));return x}
function getQuestions(paperId){return Q.filter(q=>q.paperId===paperId)}
function grade(q,answer){
 if(q.type==="mcq") return String(answer||"").trim().toUpperCase()===String(q.answer||"").trim().toUpperCase()?q.marks:0;
 if(Array.isArray(q.answer)){return q.answer.map(x=>String(x).toLowerCase()).includes(String(answer||"").trim().toLowerCase())?q.marks:0}
 return null;
}
function start(paperId){
 const p=E&&E.getById(paperId), qs=getQuestions(paperId);
 const x=load(); x.sessions=x.sessions||{}; x.sessions[paperId]={paperId,startedAt:Date.now(),answers:{},submitted:false}; save(x);
 return {paper:p,questions:qs};
}
function answer(paperId,qid,value){const x=load();x.sessions=x.sessions||{};x.sessions[paperId]=x.sessions[paperId]||{paperId,startedAt:Date.now(),answers:{}};x.sessions[paperId].answers[qid]=value;save(x)}
function submit(paperId){
 const x=load(),s=x.sessions&&x.sessions[paperId];if(!s)return null;
 const qs=getQuestions(paperId);let score=0,total=0;
 const results=qs.map(q=>{total+=Number(q.marks)||0;const earned=grade(q,s.answers[q.id]);if(earned!=null)score+=earned;return {questionId:q.id,earned}});
 s.submitted=true;s.submittedAt=Date.now();s.score=score;s.total=total;s.results=results;save(x);
 if(E)E.recordAttempt({paperId,score,total,questionCount:qs.length});
 return s;
}
window.APLUS_SCIENCE_PRACTICE_V1={questions:Q,getQuestions,start,answer,submit,grade};
})();