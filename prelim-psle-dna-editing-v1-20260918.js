/* APLUS P6 English Prelim — PSLE DNA Editing Engine V1
   Non-destructive wrapper: keeps the working Prelim UI and generator,
   but rebuilds Q36–45 from a focused Editing for Spelling and Grammar DNA bank.
*/
(function(){'use strict';
const GNAME='APLUS_P6_PSLE_PAPER2_GENERATION_V1';
const BANKNAME='APLUS_AI_DB_V1_P6_PSLE_PAPER2_CORE_EDITING_DNA_BATCH02';
const VERSION='PSLE_EDITING_DNA_V1.0';
const rnd=seed=>{let x=(seed>>>0)||1;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}};
const sh=(a,r)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function install(){
 const G=window[GNAME], bank=window[BANKNAME];
 if(!G||typeof G.generate!=='function'||!Array.isArray(bank)||bank.length<10)return false;
 if(G.editingDNA===VERSION)return true;
 const original=G.generate;
 G.generate=function(options={}){
   const result=original.call(this,options);
   if(!result||!Array.isArray(result.paper))return result;
   const r=rnd(Number(options.seed||Date.now())^0x36ed);
   const chosen=sh(bank,r).slice(0,10);
   if(chosen.length!==10)return result;
   const paper=result.paper.filter(q=>q&&q.section!=='editing');
   const replacement=chosen.map((x,i)=>({
     type:'oe',marks:1,section:'editing',number:36+i,id:'Q'+(36+i),
     question:'Correct the error. Write the corrected sentence.',
     passage:'',
     original:String(x.original||''),
     answer:String(x.correct||''),
     acceptedPatterns:[String(x.correct||'')],
     errorType:String(x.errorType||'grammar'),
     skill:String(x.errorType||'grammar'),
     rule:String(x.rule||''),
     misconception:String(x.misconception||''),
     difficulty:Number(x.difficulty)||3,
     sourceDatabase:'APLUS PSLE Editing DNA Batch 02',sourceRecordId:x.id,
     generationLayer:'PSLE_PAPER2_DNA_V1'
   }));
   const before=paper.slice(0,35), after=paper.slice(35);
   result.paper=before.concat(replacement,after);
   result.paper.forEach((q,i)=>{q.number=i+1;q.id='Q'+(i+1)});
   result.diagnostics=result.diagnostics||{};
   result.diagnostics.editingDNA=VERSION;
   result.diagnostics.editingSkills=replacement.map(q=>q.skill);
   result.diagnostics.editingErrors=replacement.map(q=>q.errorType);
   result.ok=true;
   return result;
 };
 G.editingDNA=VERSION;
 return true;
}
let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>180)clearInterval(timer)},100);install();
})();
