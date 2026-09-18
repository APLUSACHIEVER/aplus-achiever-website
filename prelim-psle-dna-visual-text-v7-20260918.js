/* APLUS P6 English Prelim — PSLE Visual Text DNA V5.0
   Poster + online article visual structure, with six-feature information grids,
   product/event imagery placeholders, testimonial/callout blocks and linked-text MCQs.
*/
(function(){'use strict';
const GNAME='APLUS_P6_PSLE_PAPER2_GENERATION_V1',BANKNAME='APLUS_AI_DB_V1_P6_PSLE_VISUAL_TEXT_DNA_BATCH04',QDBNAME='APLUS_PSLE_VISUAL_QUESTION_DNA_BATCH02',VERSION='PSLE_VISUAL_TEXT_DNA_V7.0';
function rnd(seed){let x=(seed>>>0)||1;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
function sh(a,r){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function install(){
 const G=window[GNAME],bank=window[BANKNAME];
 if(!G||typeof G.generate!=='function'||!Array.isArray(bank)||!bank.length)return false;
 if(G.visualDNA===VERSION)return true;
 const original=G.generate;
 G.generate=function(options={}){
   const result=original.call(this,options);
   if(!result||!Array.isArray(result.paper))return result;
   const r=rnd(Number(options.seed||Date.now())^0xA5B4);
   const QDB=window[QDBNAME]||null; const eligible=bank.filter(t=>QDB&&QDB.records&&QDB.records[t.id]); const pool=eligible.length?eligible:bank; const t=pool[Math.floor(r()*pool.length)];
   const visual={type:t.type,title:t.title,subtitle:t.subtitle,poster:t.poster,article:t.article};
   const sourceQs=(QDB&&QDB.records&&QDB.records[t.id])||(t.questions||[]); const qs=sourceQs.slice(0,5).map((x,i)=>{
     const opts=sh(x.o,r);
     return {type:'mcq',marks:1,section:'visual',number:21+i,id:'Q'+(21+i),
       visual,question:x.q,options:opts,answer:x.a,skill:x.s,
       difficulty:i<1?2:i<3?3:4,
       explanation:'The answer is supported by the information in Text 1 and/or Text 2.',
       sourceDatabase:'APLUS PSLE Visual Text DNA Batch 04',sourceRecordId:t.id,
       visualDNA:VERSION,visualQuestionType:x.s};
   });
   if(qs.length!==5)return result;
   const kept=result.paper.filter(q=>q&&q.section!=='visual');
   result.paper=kept.slice(0,20).concat(qs,kept.slice(20));
   result.paper.forEach((q,i)=>{q.number=i+1;q.id='Q'+(i+1)});
   result.diagnostics=result.diagnostics||{};
   result.diagnostics.visualDNA=VERSION;
   result.diagnostics.visualRecordId=t.id;
   result.diagnostics.visualQuestionSkills=qs.map(q=>q.skill);
   result.diagnostics.visualQuestionCount=5;
   result.diagnostics.visualTextCount=2;
   result.ok=true;
   return result;
 };
 G.visualDNA=VERSION;G.visualDatabaseVersion='BATCH04';
 return true;
}
install();let tries=0;const timer=setInterval(()=>{if(install()||++tries>180)clearInterval(timer)},100);
})();