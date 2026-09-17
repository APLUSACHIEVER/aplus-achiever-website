/* APLUS P6 PSLE English — Comprehension OE DNA V1
   Q66–75: 10 open-ended questions / 20 marks.
   Non-destructive wrapper. Uses APLUS-original passage/question banks only.
*/
(function(){
'use strict';
const GNAME='APLUS_P6_PSLE_PAPER2_GENERATION_V1';
const VERSION='PSLE_COMPREHENSION_OE_DNA_V1.0';
const rnd=seed=>{let x=(seed>>>0)||1;return()=>{x^=x<<13;x^=x>>>17;return(x>>>0)/4294967296}};
const sh=(a,r)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const arr=n=>Array.isArray(window[n])?window[n]:[];
function collect(){
 const sets=[].concat(arr('APLUS_AI_DB_V1_P6_COMPREHENSION_PASSAGE_SETS_BATCH01'),arr('APLUS_AI_DB_V1_P6_COMPREHENSION_PASSAGE_SETS_BATCH02'));
 return sets.filter(p=>String(p.passage||p.text||'').trim().length>=250&&Array.isArray(p.questions)&&p.questions.length>=5);
}
function answer(q){if(q==null)return '';if(typeof q.answer==='number'&&Array.isArray(q.options))return String(q.options[q.answer]??'');if(Array.isArray(q.answer))return q.answer.join('; ');return String(q.answer??q.answerText??'');}
function skill(q){return String(q.skill||q.type||'comprehension').replace(/_/g,' ')}
function normalize(q,p,pid,idx){
 const a=answer(q); if(!q.question||!a)return null;
 let question=String(q.question).trim();
 const s=skill(q).toLowerCase();
 if(/vocab|meaning|word/i.test(s)&&!/own words/i.test(question))question+=' Answer in your own words.';
 else if(!/complete sentence|state|give|write/i.test(question))question+=' Answer in a complete sentence.';
 return {type:'oe',responseType:'open-ended',marks:2,section:'comprehension',passage:p,passageSetId:pid,question,answer:a,acceptedPatterns:Array.isArray(q.acceptedPatterns)?[a,...q.acceptedPatterns]:[a],explanation:q.explanation||'',skill:skill(q),difficulty:Number(q.difficulty)||3,sourceDatabase:'APLUS P6 Comprehension Passage Sets — PSLE OE DNA V1',sourceRecordId:String(q.id||idx),generationLayer:VERSION};
}
function build(seed){
 const r=rnd(seed), candidates=sh(collect(),r), out=[];
 for(const p of candidates.slice(0,8)){
   const qs=sh(p.questions,r);
   const selected=qs.slice(0,5);
   selected.forEach((q,i)=>{const x=normalize(q,String(p.passage||p.text||'').trim(),String(p.passageId||p.id||p.title||'PASSAGE'),i);if(x)out.push(x);});
   if(out.length>=10)break;
 }
 return out.slice(0,10);
}
function install(){
 const G=window[GNAME]; if(!G||typeof G.generate!=='function')return false;
 if(G.comprehensionOEDNAVersion===VERSION)return true;
 const original=G.generate;
 G.generate=function(options={}){
   const result=original.call(this,options);
   if(!result||!Array.isArray(result.paper))return result;
   const seed=(options.seed||Date.now())^0x66aa7711;
   const qs=build(seed);
   if(qs.length!==10)return result;
   const rest=result.paper.filter(q=>q&&q.section!=='comprehension');
   qs.forEach((q,i)=>{q.number=66+i;q.id='Q'+(66+i);});
   result.paper=rest.concat(qs);
   result.paper.forEach((q,i)=>{q.number=i+1;q.id='Q'+(i+1);});
   result.paper.forEach(q=>{if(q.section==='comprehension'){q.type='oe';q.responseType='open-ended';q.marks=2;}});
   result.diagnostics=result.diagnostics||{};
   result.diagnostics.comprehensionOEDNA=VERSION;
   result.diagnostics.comprehensionOEPassageIds=[...new Set(qs.map(q=>q.passageSetId))];
   result.diagnostics.comprehensionOESkills=qs.map(q=>q.skill);
   result.ok=true;
   return result;
 };
 G.comprehensionOEDNAVersion=VERSION;
 return true;
}
let tries=0;const timer=setInterval(()=>{if(install()||++tries>120)clearInterval(timer)},100);install();
})();
