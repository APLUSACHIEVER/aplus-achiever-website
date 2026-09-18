/* APLUS P6 English Prelim — PSLE DNA Editing Engine V2.0
   Rebuilds Q36–45 as a coherent passage-based Editing section.
   Non-destructive: wraps the existing generation function.
*/
(function(){'use strict';
const GNAME='APLUS_P6_PSLE_PAPER2_GENERATION_V1';
const BANKNAME='APLUS_AI_DB_V1_P6_PSLE_PAPER2_EDITING_DNA_BATCH03';
const VERSION='PSLE_EDITING_DNA_V2.0';
function rnd(seed){let x=(seed>>>0)||1;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
function install(){
 const G=window[GNAME], bank=window[BANKNAME];
 if(!G||typeof G.generate!=='function'||!Array.isArray(bank)||!bank.length)return false;
 if(G.editingDNA===VERSION)return true;
 const original=G.generate;
 G.generate=function(options={}){
   const result=original.call(this,options);
   if(!result||!Array.isArray(result.paper))return result;
   const r=rnd(Number(options.seed||Date.now())^0xED2036);
   const set=bank[Math.floor(r()*bank.length)];
   const items=set.sentences.slice(0,10);
   if(items.length!==10)return result;
   const passage=items.map(x=>'('+x.number+') '+x.text).join(' ');
   const replacement=items.map(x=>({
     type:'oe',marks:1,section:'editing',number:x.number,id:'Q'+x.number,
     question:'Correct the error. Write the corrected sentence.',
     passage:passage,
     original:x.text,answer:x.correct,acceptedPatterns:[x.correct],
     errorType:x.errorType,skill:x.skill,difficulty:x.difficulty,
     sourceDatabase:'APLUS PSLE Editing DNA Batch 03',
     sourceRecordId:set.id,passageId:set.id,
     generationLayer:'PSLE_PAPER2_DNA_V2'
   }));
   const kept=result.paper.filter(q=>q&&q.section!=='editing');
   result.paper=kept.slice(0,35).concat(replacement,kept.slice(35));
   result.paper.forEach((q,i)=>{q.number=i+1;q.id='Q'+(i+1)});
   result.diagnostics=result.diagnostics||{};
   result.diagnostics.editingDNA=VERSION;
   result.diagnostics.editingPassageId=set.id;
   result.diagnostics.editingSkills=replacement.map(q=>q.skill);
   result.diagnostics.editingErrors=replacement.map(q=>q.errorType);
   result.ok=true;
   return result;
 };
 G.editingDNA=VERSION;
 G.editingPassageDNA=setVersion();
 return true;
}
function setVersion(){return VERSION}
install();let tries=0;const timer=setInterval(()=>{if(install()||++tries>180)clearInterval(timer)},100);
})();