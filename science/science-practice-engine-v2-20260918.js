/* APLUS SCIENCE PRACTICE ENGINE V2 — 2026 format + structured response support */
(function(){
"use strict";
const bank=window.APLUS_SCIENCE_QUESTIONS_V1||[];
const KEY="APLUS_SCIENCE_SESSION_V2";
function save(x){localStorage.setItem(KEY,JSON.stringify(x));return x}
function load(){try{return JSON.parse(localStorage.getItem(KEY)||"null")}catch(e){return null}}
function getQuestions(paperId){return bank.filter(q=>q.paperId===paperId)}
function start(paperId,mode){
 const qs=getQuestions(paperId); const s={paperId,mode:mode||"practice",index:0,answers:{},startedAt:Date.now(),finished:false};
 save(s); return s
}
function answer(qid,value){const s=load();if(!s)return null;s.answers[qid]=value;save(s);return s}
function grade(q,a){
 if(q.type==="mcq") return String(a??"").trim().toUpperCase()===String(q.answer??"").trim().toUpperCase()?Number(q.marks||2):0;
 if(Array.isArray(q.answer)&&Array.isArray(a)) return a.filter(x=>q.answer.includes(x)).length;
 return null;
}
function submit(){const s=load();if(!s)return null;const qs=getQuestions(s.paperId);let earned=0,max=0;
 qs.forEach(q=>{max+=Number(q.marks)||0;const g=grade(q,s.answers[q.id]);if(g!==null)earned+=g});
 s.finished=true;s.finishedAt=Date.now();s.earned=earned;s.max=max;save(s);return s}
function paperSummary(){return {mcq:30,mcqMarks:60,structured:"10–11",structuredMarks:40,total:100,durationMinutes:105}}
window.APLUS_SCIENCE_PRACTICE_V2={getQuestions,start,answer,grade,submit,load,paperSummary};
})();