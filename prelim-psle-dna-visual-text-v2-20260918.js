/* APLUS P6 English Prelim — PSLE Visual Text DNA V2.0
   Rebuilds Q21–25 as five linked MCQs based on one coherent visual text.
*/
(function(){'use strict';
const GNAME='APLUS_P6_PSLE_PAPER2_GENERATION_V1',BANKNAME='APLUS_AI_DB_V1_P6_PSLE_VISUAL_TEXT_DNA_BATCH01',VERSION='PSLE_VISUAL_TEXT_DNA_V2.0';
function rnd(seed){let x=(seed>>>0)||1;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
function sh(a,r){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function visual(t){return [t.title,'Organised by '+t.org,'',t.intro,'','DATE: '+t.date,'VENUE: '+t.venue,'TIME: '+t.time,'',...t.facts.map((x,i)=>'['+(i+1)+'] '+x)].join('\n')}
function install(){const G=window[GNAME],bank=window[BANKNAME];if(!G||typeof G.generate!=='function'||!Array.isArray(bank)||!bank.length)return false;if(G.visualDNA===VERSION)return true;const original=G.generate;
G.generate=function(options={}){const result=original.call(this,options);if(!result||!Array.isArray(result.paper))return result;const r=rnd(Number(options.seed||Date.now())^0x2125),t=bank[Math.floor(r()*bank.length)],f=t.facts;
const specs=[
['Which statement is true according to the visual text?',[f[0],f[1],f[2],f[3]],f[0],'retrieval',2],
['Who would need to take note of the stated requirement?',[f[2],f[3],f[4],f[0]],f[2],'condition',3],
['Why is the information about the time or date important to participants?',['It helps them know when to take part.','It tells them which books to buy.','It explains how to win a prize.','It gives them the names of all teachers.'],'It helps them know when to take part.','purpose',2],
['Which person would be able to take part based on the information given?',[f[0],f[1],f[2],f[4]],f[1],'inference',3],
['What is the main purpose of this visual text?',[t.intro,'To report on an event that has already ended.','To describe a problem without suggesting an activity.','To give instructions for completing school homework.'],t.intro,'purpose',3]
];
const qs=specs.map((s,i)=>{let opts=sh(s[1],r);return {type:'mcq',marks:1,section:'visual',number:21+i,id:'Q'+(21+i),visual:{type:t.type,title:t.title,text:visual(t),organisation:t.org,date:t.date,venue:t.venue,time:t.time},question:s[0],options:opts,answer:s[2],skill:s[3],difficulty:s[4],explanation:'The answer is supported by the stated information and context of the visual text.',sourceDatabase:'APLUS PSLE Visual Text DNA Batch 01',sourceRecordId:t.id,visualDNA:VERSION}});
const kept=result.paper.filter(q=>q&&q.section!=='visual');result.paper=kept.slice(0,20).concat(qs,kept.slice(20));result.paper.forEach((q,i)=>{q.number=i+1;q.id='Q'+(i+1)});result.diagnostics=result.diagnostics||{};result.diagnostics.visualDNA=VERSION;result.diagnostics.visualRecordId=t.id;result.diagnostics.visualSkills=qs.map(q=>q.skill);result.ok=true;return result};
G.visualDNA=VERSION;return true}
install();let tries=0;const timer=setInterval(()=>{if(install()||++tries>180)clearInterval(timer)},100)})();