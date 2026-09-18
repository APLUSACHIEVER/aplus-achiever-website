/* APLUS P6 English Prelim — Grammar Section PSLE DNA V1
   Q1–10: independent contextual sentences, numbered blanks, four numbered choices.
*/
(function(){'use strict';
const G='APLUS_P6_PSLE_PAPER2_GENERATION_V1',B='APLUS_AI_DB_V1_P6_PSLE_PAPER2_CORE_GRAMMAR_BATCH01',V='PSLE_GRAMMAR_DNA_V1.0';
const norm=s=>String(s??'').toLowerCase().replace(/[“”‘’"'.!,?;:()[\]{}]/g,' ').replace(/\s+/g,' ').trim();
const rnd=seed=>{let x=(seed>>>0)||1;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}};
const sh=(a,r)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function install(){const g=window[G],b=window[B];if(!g||typeof g.generate!=='function'||!Array.isArray(b)||b.length<10)return false;if(g.grammarSectionDNA===V)return true;
const orig=g.generate;g.generate=function(options={}){const out=orig.call(this,options);if(!out||!Array.isArray(out.paper))return out;const r=rnd(Number(options.seed||Date.now())^0x1001),pool=sh(b,r).slice(0,10);
const qs=pool.map((x,i)=>{const raw=String(x.context||'');const stem=raw.replace(/_{2,}/,'('+String(i+1)+') ______');const opts=sh([String(x.answer),...(Array.isArray(x.distractors)?x.distractors:[])],r).slice(0,4);return {type:'mcq',marks:1,section:'grammar',number:i+1,id:'Q'+(i+1),question:stem,options:opts,answer:String(x.answer),optionStyle:'numeric',grammarDNA:V,skill:x.skill||x.concept,difficulty:x.difficulty,sourceDatabase:'APLUS P6 PSLE Grammar Core Batch 01',sourceRecordId:x.id,explanation:x.rule||''}});
if(qs.some(q=>!q.question.includes('('+q.number+') ______')||q.options.length!==4||new Set(q.options.map(norm)).size!==4||!q.options.some(o=>norm(o)===norm(q.answer))))return out;
const paper=out.paper.filter(q=>q.section!=='grammar');paper.splice(0,0,...qs);paper.forEach((q,i)=>{q.number=i+1;q.id='Q'+(i+1)});out.paper=paper;out.diagnostics=out.diagnostics||{};out.diagnostics.grammarDNA=V;out.diagnostics.grammarFormat='independent sentence + numbered blank + four choices';return out};g.grammarSectionDNA=V;return true}
let n=0;const p=setInterval(()=>{if(install()||++n>120)clearInterval(p)},100);install();
})();