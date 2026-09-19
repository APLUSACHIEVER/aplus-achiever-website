/* APLUS P6 English Prelim — PSLE DNA Editing Engine V2.0
   Rebuilds Q36–45 as a coherent passage-based Editing section.
   Non-destructive: wraps the existing generation function.
*/
(function(){'use strict';
const GNAME='APLUS_P6_PSLE_PAPER2_GENERATION_V1';
const BANKNAME='APLUS_AI_DB_V1_P6_PSLE_PAPER2_EDITING_DNA_BATCH03';
const VERSION='PSLE_EDITING_DNA_V2.1';
const EXTRABANK='APLUS_AI_DB_V1_P6_PSLE_PAPER2_EDITING_DNA_BATCH04';
function loadScript(src,key){if(document.querySelector('script[data-aplus-editing-dna="'+key+'"]'))return;const s=document.createElement('script');s.src=src+'?v=20260919a';s.async=false;s.dataset.aplusEditingDna=key;document.head.appendChild(s)}
function rnd(seed){let x=(seed>>>0)||1;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
function install(){
 const G=window[GNAME], base=window[BANKNAME], extra=window[EXTRABANK], bank=[...(Array.isArray(base)?base:[]),...(Array.isArray(extra)?extra:[])];
 if(!G||typeof G.generate!=='function'||!bank.length)return false;
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
   const wordFix=x=>{
     if(x.correctWord)return String(x.correctWord);
     const a=String(x.text||'').match(/[A-Za-z]+(?:'[A-Za-z]+)?/g)||[];
     const b=String(x.correct||'').match(/[A-Za-z]+(?:'[A-Za-z]+)?/g)||[];
     for(let i=0;i<Math.min(a.length,b.length);i++){
       if(a[i].toLowerCase()!==b[i].toLowerCase())return b[i];
     }
     return String(x.correct||'');
   };
   const replacement=items.map(x=>{
     const correctWord=wordFix(x);
     return {
       type:'oe',marks:1,section:'editing',number:x.number,id:'Q'+x.number,
       question:'Write the correct word for the error in the sentence.',
       passage:passage,
       original:x.text,answer:correctWord,acceptedPatterns:[correctWord],
       correctedSentence:x.correct,errorType:x.errorType,skill:x.skill,difficulty:x.difficulty,
       sourceDatabase:'APLUS PSLE Editing DNA Batch 03 + Batch 04',
       sourceRecordId:set.id,passageId:set.id,
       generationLayer:'PSLE_PAPER2_DNA_V2'
     };
   });
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
loadScript('aplus-ai-db-v1-p6-psle-paper2-editing-dna-batch04-20260919.js','batch04');
install();let tries=0;const timer=setInterval(()=>{if(install()||++tries>180)clearInterval(timer)},100);
})();