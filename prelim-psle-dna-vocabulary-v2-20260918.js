/* APLUS P6 English Prelim — Vocabulary Section PSLE DNA V2 */
(function(){'use strict';
const G='APLUS_P6_PSLE_PAPER2_GENERATION_V1',B='APLUS_AI_DB_V1_P6_PSLE_VOCABULARY_DNA_BATCH01',V='PSLE_VOCABULARY_DNA_V2.0';
const norm=s=>String(s??'').toLowerCase().replace(/[“”‘’"'.!,?;:()[\]{}]/g,' ').replace(/\s+/g,' ').trim();
const rnd=seed=>{let x=(seed>>>0)||1;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}};
const sh=(a,r)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function install(){const g=window[G],b=window[B];if(!g||typeof g.generate!=='function'||!Array.isArray(b)||b.length<5)return false;if(g.vocabSectionDNA===V)return true;
const orig=g.generate;g.generate=function(options={}){const out=orig.call(this,options);if(!out||!Array.isArray(out.paper))return out;const r=rnd(Number(options.seed||Date.now())^0x110515),pool=sh(b,r).slice(0,5);
if(pool.length<5)return out;
const qs=pool.map((x,i)=>{const opts=sh(x.options,r);return {type:'mcq',marks:1,section:'vocabulary',number:11+i,id:'Q'+(11+i),question:x.sentence,options:opts,answer:x.answer,optionStyle:'numeric',vocabularyDNA:V,targetWord:x.word,skill:'meaning in context',difficulty:x.difficulty,sourceDatabase:'APLUS P6 PSLE Vocabulary DNA Batch 01',sourceRecordId:x.id,explanation:'Choose the option closest in meaning to the underlined word as it is used in the sentence.'}});
if(qs.some(q=>q.options.length!==4||new Set(q.options.map(norm)).size!==4||!q.options.some(o=>norm(o)===norm(q.answer))))return out;
const paper=out.paper.filter(q=>q.section!=='vocabulary');paper.splice(10,0,...qs);paper.forEach((q,i)=>{q.number=i+1;q.id='Q'+(i+1)});out.paper=paper;out.diagnostics=out.diagnostics||{};out.diagnostics.vocabularyDNA=V;out.diagnostics.vocabularyRecordIds=qs.map(q=>q.sourceRecordId);return out};g.vocabSectionDNA=V;return true}
let n=0;const p=setInterval(()=>{if(install()||++n>120)clearInterval(p)},100);install();
})();