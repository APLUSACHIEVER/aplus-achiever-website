/* APLUS P6 PSLE English — Comprehension Cloze DNA V1.0
   Non-destructive wrapper for Q46–60.
   Replaces the existing generated cloze with one coherent original passage.
*/
(function(){
'use strict';
const GNAME='APLUS_P6_PSLE_PAPER2_GENERATION_V1';
const BANKNAME='APLUS_P6_PSLE_COMPREHENSION_CLOZE_PASSAGE_DNA_B01';
const VERSION='PSLE_COMPREHENSION_CLOZE_DNA_V1.1';
const EXTRABANK='APLUS_P6_PSLE_COMPREHENSION_CLOZE_PASSAGE_DNA_B02';\nconst EXTRABANK2='APLUS_P6_PSLE_COMPREHENSION_CLOZE_PASSAGE_DNA_B03';
function loadScript(src,key){if(document.querySelector('script[data-aplus-cc-dna="'+key+'"]'))return;const s=document.createElement('script');s.src=src+'?v=20260918a';s.async=false;s.dataset.aplusCcDna=key;document.head.appendChild(s)}
function install(){
 const G=window[GNAME],BASE=window[BANKNAME],EXTRA=window[EXTRABANK],EXTRA2=window[EXTRABANK2],BANK=[...(Array.isArray(BASE)?BASE:[]),...(Array.isArray(EXTRA)?EXTRA:[]),...(Array.isArray(EXTRA2)?EXTRA2:[])];
 if(!G||typeof G.generate!=='function'||!BANK.length)return false;
 if(G.comprehensionClozeDNAVersion===VERSION)return true;
 const original=G.generate;
 function passageWithBlanks(record,start){let n=start;return record.text.replace(/\s+/g,' ').trim().split(/(?=\b)/).join('')}
 function buildPassage(record,start){
   let text=record.text.replace(/\s+/g,' ').trim();
   const parts=text.split(/(?<=[.!?])\s+/);
   const blankAnswers=record.blanks.map(x=>String(x.answer));
   // Insert blanks at natural anchor words. Each anchor is replaced only once.
   let used=0;
   for(let i=0;i<parts.length&&used<blankAnswers.length;i++){
     const a=blankAnswers[used];
     const re=new RegExp('\\b'+a.replace(/[.*+?^${}()|[\\]\\\\]/g,'\\$&')+'\\b','i');
     if(re.test(parts[i])){parts[i]=parts[i].replace(re,'@@BLANK@@');used++}
   }
   // Fallback: if an answer is not an exact lexical anchor, insert the blank before a suitable phrase.
   while(used<blankAnswers.length){
     const idx=Math.min(parts.length-1,Math.floor((used/blankAnswers.length)*parts.length));
     parts[idx]=parts[idx]+' @@BLANK@@';used++;
   }
   let q=start;
   let cursor=0;
   const out=[];
   parts.forEach(p=>{if(p.indexOf('@@BLANK@@')<0){out.push(p);return;}const pieces=p.split('@@BLANK@@');for(let j=0;j<pieces.length;j++){if(pieces[j])out.push(pieces[j]);if(j<pieces.length-1){out.push('('+q+') ______');q++;}}});
   return {text:out.join(' '),next:q};
 }
 function rebuild(p,seed){
   const records=[...BANK];
   const index=(Math.abs(Number(seed)||1)>>>0)%records.length;
   const record=records[index];
   const built=buildPassage(record,46);
   const qs=[];
   for(let i=0;i<15;i++){
     const b=record.blanks[i];
     qs.push({number:46+i,id:'Q'+(46+i),section:'comprehensionCloze',type:'oe',marks:1,question:'('+(46+i)+')',passage:built.text,answer:b.answer,acceptedPatterns:[b.answer],skill:b.skill,difficulty:b.difficulty,passageId:record.id,passageTitle:record.title,passageTheme:record.theme,sourceDatabase:'APLUS PSLE Comprehension Cloze Passage DNA B01 + B02 + B03',sourceRecordId:record.id,comprehensionClozeDNA:true});
   }
   const filtered=p.filter(q=>!q||q.section!=='comprehensionCloze');
   let pos=filtered.findIndex(q=>q&&q.section==='synthesis');
   if(pos<0)pos=filtered.length;
   filtered.splice(pos,0,...qs);
   return filtered.map((q,i)=>Object.assign({},q,{number:i+1,id:'Q'+(i+1)}));
 }
 G.generate=function(options={}){
   const r=original(options);
   if(!r||!r.ok||!Array.isArray(r.paper))return r;
   r.paper=rebuild(r.paper,r.seed||options.seed||Date.now());
   r.comprehensionClozeDNAVersion=VERSION;
   r.qualityGate=r.qualityGate||{};
   r.qualityGate.comprehensionClozeDNA={version:VERSION,passageCount:BANK.length,passageId:r.paper.find(q=>q&&q.section==='comprehensionCloze')?.passageId||null,items:15,marks:15};
   return r;
 };
 G.comprehensionClozeDNAVersion=VERSION;
 G.comprehensionClozeDNABank=BANK;
 return true;
}
loadScript('aplus-ai-db-v1-p6-psle-comprehension-cloze-passage-dna-b01-20260918.js','bank01');
loadScript('aplus-ai-db-v1-p6-psle-comprehension-cloze-passage-dna-b02-20260919.js','bank02');\nloadScript('aplus-ai-db-v1-p6-psle-comprehension-cloze-passage-dna-b03-20260919.js','bank03');
let tries=0;const poll=setInterval(()=>{if(install()||++tries>100)clearInterval(poll)},100);
})();
