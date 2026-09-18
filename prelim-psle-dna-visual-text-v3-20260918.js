/* APLUS P6 English Prelim — PSLE Visual Text DNA V3.0
   Format-focused engine: one information-rich visual text + five linked MCQs.
   Original APLUS content; mirrors the 2026 Paper 2 component structure,
   not any copyrighted SEAB question or artwork.
*/
(function(){'use strict';
const GNAME='APLUS_P6_PSLE_PAPER2_GENERATION_V1',BANKNAME='APLUS_AI_DB_V1_P6_PSLE_VISUAL_TEXT_DNA_BATCH02',VERSION='PSLE_VISUAL_TEXT_DNA_V3.0';
function rnd(seed){let x=(seed>>>0)||1;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
function sh(a,r){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function install(){const G=window[GNAME],bank=window[BANKNAME];if(!G||typeof G.generate!=='function'||!Array.isArray(bank)||!bank.length)return false;if(G.visualDNA===VERSION)return true;const original=G.generate;
G.generate=function(options={}){const result=original.call(this,options);if(!result||!Array.isArray(result.paper))return result;const r=rnd(Number(options.seed||Date.now())^0x2135),t=bank[Math.floor(r()*bank.length)];
const f=t.panels.flatMap(p=>p.lines), all=[...f];
const pool=all.length;
const pick=(offset)=>all[offset%pool];
const specs=[
['Which of the following is true according to the visual text?',[pick(0),pick(2),pick(4),pick(6)],pick(0),'retrieval',2],
['Which person would have to follow the requirement stated in the visual text?',[pick(1),pick(5),pick(8),pick(10)],pick(1),'detail-and-condition',3],
['Why is the information about the stated time important?',['It tells participants when they should attend.','It tells participants which activity they must choose.','It explains how participants will be judged.','It shows which materials will be provided.'],'It tells participants when they should attend.','purpose',2],
['Which of the following can be inferred from the visual text?',[pick(3),pick(7),pick(9),pick(11)],pick(3),'inference',3],
['What is the main purpose of the visual text?',[t.highlight,'To give information about an activity and its arrangements.','To persuade readers to buy a product immediately.','To report on an event that has already taken place.'],'To give information about an activity and its arrangements.','overall-purpose',3]
];
const visual={type:t.type,title:t.title,subtitle:t.subtitle,organisation:t.organiser,date:t.date,time:t.time,venue:t.venue,highlight:t.highlight,panels:t.panels,footer:t.footer};
const qs=specs.map((s,i)=>{const opts=sh(s[1],r);return {type:'mcq',marks:1,section:'visual',number:21+i,id:'Q'+(21+i),visual,question:s[0],options:opts,answer:s[2],skill:s[3],difficulty:s[4],explanation:'The answer is supported by the visual text.',sourceDatabase:'APLUS PSLE Visual Text DNA Batch 02',sourceRecordId:t.id,visualDNA:VERSION}});
const kept=result.paper.filter(q=>q&&q.section!=='visual');result.paper=kept.slice(0,20).concat(qs,kept.slice(20));result.paper.forEach((q,i)=>{q.number=i+1;q.id='Q'+(i+1)});result.diagnostics=result.diagnostics||{};result.diagnostics.visualDNA=VERSION;result.diagnostics.visualRecordId=t.id;result.diagnostics.visualQuestionSkills=qs.map(q=>q.skill);result.ok=true;return result};
G.visualDNA=VERSION;return true}
install();let tries=0;const timer=setInterval(()=>{if(install()||++tries>180)clearInterval(timer)},100)})();