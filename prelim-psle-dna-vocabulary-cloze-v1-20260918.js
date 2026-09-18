/* APLUS P6 English Prelim — Vocabulary Cloze DNA V1
   Q16–20: one coherent passage, five underlined target words, four numbered choices.
*/
(function(){'use strict';
const GNAME='APLUS_P6_PSLE_PAPER2_GENERATION_V1',BNAME='APLUS_AI_DB_V1_P6_PSLE_VOCABULARY_CLOZE_VISUAL_DNA_BATCH01',VERSION='PSLE_VOCABULARY_CLOZE_DNA_V1.0';
const norm=s=>String(s??'').toLowerCase().replace(/[“”‘’"'.!,?;:()[\]{}]/g,' ').replace(/\s+/g,' ').trim();
const rnd=seed=>{let x=(seed>>>0)||1;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}};
const sh=(a,r)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function install(){const G=window[GNAME],B=window[BNAME];if(!G||typeof G.generate!=='function'||!Array.isArray(B)||!B.length)return false;if(G.vocabClozeDNA===VERSION)return true;
 const original=G.generate;G.generate=function(options={}){
  const out=original.call(this,options);if(!out||!Array.isArray(out.paper))return out;
  const r=rnd(Number(options.seed||Date.now())^0x51C10E),set=B[Math.floor(r()*B.length)];if(!set||!Array.isArray(set.items)||set.items.length!==5)return out;
  const qs=set.items.map((it,i)=>{const opts=sh(it.options,r);return {type:'mcq',marks:1,section:'vocabularyCloze',number:16+i,id:'Q'+(16+i),passage:'For each question from 16 to 20, choose the word closest in meaning to the underlined word(s).\n\n'+set.passage,question:'Which word is closest in meaning to the underlined word?',options:opts,answer:it.answer,optionStyle:'numeric',vocabularyClozeDNA:VERSION,targetWord:it.word,sourceDatabase:'APLUS Vocabulary Cloze Visual DNA Batch 01',sourceRecordId:set.id,skill:'meaning in context',difficulty:i<2?2:i<4?3:4,explanation:'Choose the option that is closest in meaning to the underlined word as it is used in the passage.'}});
  if(qs.some(q=>q.options.length!==4||new Set(q.options.map(norm)).size!==4||!q.options.some(x=>norm(x)===norm(q.answer))))return out;
  const paper=out.paper.filter(q=>q.section!=='vocabularyCloze');paper.splice(15,0,...qs);paper.forEach((q,i)=>{q.number=i+1;q.id='Q'+(i+1)});out.paper=paper;out.diagnostics=out.diagnostics||{};out.diagnostics.vocabularyClozeDNA=VERSION;out.diagnostics.vocabularyClozePassageId=set.id;out.diagnostics.vocabularyClozeTargets=qs.map(q=>q.targetWord);return out;
 };G.vocabClozeDNA=VERSION;return true;}
let n=0;const poll=setInterval(()=>{if(install()||++n>120)clearInterval(poll)},100);install();
})();