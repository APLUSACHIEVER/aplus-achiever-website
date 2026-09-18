/* APLUS P6 English Prelim — PSLE Visual Text DNA V4.0
   Uses original APLUS visual texts with PSLE-style linked-text question design.
   Five linked MCQs are supplied by the database so answer validity is deterministic.
*/
(function(){'use strict';
const GNAME='APLUS_P6_PSLE_PAPER2_GENERATION_V1',BANKNAME='APLUS_AI_DB_V1_P6_PSLE_VISUAL_TEXT_DNA_BATCH03',VERSION='PSLE_VISUAL_TEXT_DNA_V4.0';
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
   const r=rnd(Number(options.seed||Date.now())^0x73A1);
   const t=bank[Math.floor(r()*bank.length)];
   const visual={type:t.type,title:t.title,subtitle:t.subtitle,texts:t.texts};
   const qs=(t.questions||[]).slice(0,5).map((x,i)=>{
     const opts=sh(x.o,r);
     return {
       type:'mcq',marks:1,section:'visual',number:21+i,id:'Q'+(21+i),
       visual,question:x.q,options:opts,answer:x.a,
       skill:x.s,difficulty:i<2?2:i<4?3:4,
       explanation:'The answer is supported by the information in the visual text(s).',
       sourceDatabase:'APLUS PSLE Visual Text DNA Batch 03',
       sourceRecordId:t.id,visualDNA:VERSION,
       visualQuestionType:x.s
     };
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
   result.diagnostics.visualTextCount=t.texts.length;
   result.ok=true;
   return result;
 };
 G.visualDNA=VERSION;
 G.visualDatabaseVersion='BATCH03';
 return true;
}
install();
let tries=0;const timer=setInterval(()=>{if(install()||++tries>180)clearInterval(timer)},100);
})();