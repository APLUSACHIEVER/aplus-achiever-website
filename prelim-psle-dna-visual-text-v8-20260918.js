/* APLUS P6 English Prelim — PSLE Visual Text DNA V8.0
   Uses Visual Text Batch 04 + Question Form DNA Batch 03.
   One shared Text 1 + Text 2, five linked MCQs, with PSLE-style question-form coverage.
*/
(function(){'use strict';
const GNAME='APLUS_P6_PSLE_PAPER2_GENERATION_V1',BANKNAME='APLUS_AI_DB_V1_P6_PSLE_VISUAL_TEXT_DNA_BATCH04',QDBNAME='APLUS_PSLE_VISUAL_QUESTION_DNA_BATCH03',EXTRABANK='APLUS_AI_DB_V1_P6_PSLE_VISUAL_TEXT_DNA_BATCH05',EXTRAQDB='APLUS_PSLE_VISUAL_QUESTION_DNA_BATCH05',VERSION='PSLE_VISUAL_TEXT_DNA_V8.2';
function loadScript(src,key){if(document.querySelector('script[data-aplus-visual-dna="'+key+'"]'))return;const s=document.createElement('script');s.src=src+'?v=20260919a';s.async=false;s.dataset.aplusVisualDna=key;document.head.appendChild(s)}
function rnd(seed){let x=(seed>>>0)||1;return()=>{x^=x<<13;x^=x>>>17;return(x>>>0)/4294967296}}
function sh(a,r){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function install(){
 const G=window[GNAME],baseBank=window[BANKNAME],extraBank=window[EXTRABANK],bank=[...(Array.isArray(baseBank)?baseBank:[]),...(Array.isArray(extraBank)?extraBank:[])],baseQdb=window[QDBNAME],extraQdb=window[EXTRAQDB],qdb={records:{...((baseQdb&&baseQdb.records)||{}),...((extraQdb&&extraQdb.records)||{})}};
 if(!G||typeof G.generate!=='function'||!bank.length||!Object.keys(qdb.records).length)return false;
 if(G.visualDNA===VERSION)return true;
 const original=G.generate;
 G.generate=function(options={}){
   const result=original.call(this,options);
   if(!result||!Array.isArray(result.paper))return result;
   const r=rnd(Number(options.seed||Date.now())^0xA5B408);
   const ids=Object.keys(qdb.records).filter(id=>bank.some(t=>t.id===id));
   if(!ids.length)return result;
   const t=bank.find(x=>x.id===ids[Math.floor(r()*ids.length)]);
   const sourceQs=qdb.records[t.id];
   if(!t||!Array.isArray(sourceQs)||sourceQs.length<5)return result;
   const visual={type:t.type,title:t.title,subtitle:t.subtitle,poster:t.poster,article:t.article};
   const qs=sourceQs.slice(0,5).map((x,i)=>{
     const opts=sh(x.o||[],r);
     return {type:'mcq',marks:1,section:'visual',number:21+i,id:'Q'+(21+i),
       visual,question:x.q,options:opts,answer:x.a,skill:x.s,
       difficulty:i===0?2:(i===1?2:(i<4?3:4)),
       explanation:(x.s==='feature_application'?'Use the pupil profile and match it with the relevant features in Text 1.':x.s==='both_texts'?'Compare information from both texts before choosing the answer.':x.s==='main_message'?'Focus on the central message of Text 2 rather than one detail.':x.s==='text_type'?'Consider the purpose and presentation of Text 1.':'Use the stated information and context in the texts.'),
       sourceDatabase:'APLUS PSLE Visual Question DNA Batch 03 + Batch 05',
       sourceRecordId:t.id,visualDNA:VERSION,visualQuestionType:x.s};
   });
   if(qs.some(q=>q.options.length!==4||new Set(q.options.map(String)).size!==4||!q.options.some(o=>String(o).trim().toLowerCase()===String(q.answer).trim().toLowerCase())))return result;
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
 G.visualDNA=VERSION;G.visualDatabaseVersion='BATCH04+BATCH05';G.visualQuestionDatabaseVersion='VQDNA_3.0+4.0';return true;
}
loadScript('aplus-ai-db-v1-p6-psle-visual-text-dna-batch05-20260919.js','batch05');
install();let tries=0;const poll=setInterval(()=>{if(install()||++tries>120)clearInterval(poll)},100);
})();