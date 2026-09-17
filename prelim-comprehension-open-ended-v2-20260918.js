/* APLUS P6 English Prelim — Comprehension Open-Ended Module V2
   Rebuilds Q66–Q75 as coherent linked comprehension questions.
   Design:
   - 10 OE questions / 20 marks
   - two complete APLUS-original passage sets, 5 linked questions each
   - no isolated one-sentence passages
   - no MCQ options in the comprehension section
   - questions are derived from the connected passage-set database
   - supports literal, sequence, vocabulary-in-context, cause/effect,
     inference, reference, comparison, author purpose, summary and lesson skills
*/
(function(){'use strict';
const VERSION='PSLE_COMPREHENSION_OE_V2.0';
const GNAME='APLUS_P6_PSLE_PAPER2_GENERATION_V1';
const clean=s=>String(s??'').toLowerCase().replace(/[“”‘’".,!?;:()[\]{}]/g,' ').replace(/\s+/g,' ').trim();
const rnd=seed=>{let x=(seed>>>0)||1;return()=>{x^=x<<13;x^=x>>>17;return(x>>>0)/4294967296}};
const sh=(a,r)=>{a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const get=n=>Array.isArray(window[n])?window[n]:[];
const uniq=a=>{const m=new Map();a.forEach(x=>x&&x.id&&m.set(String(x.id),x));return[...m.values()]};
function registry(){return{
  passages:uniq([].concat(get('APLUS_AI_DB_V1_P6_COMPREHENSION_PASSAGE_SETS_BATCH01'),get('APLUS_AI_DB_V1_P6_COMPREHENSION_PASSAGE_SETS_BATCH02'))),
  comp:uniq([].concat(get('APLUS_AI_DB_V1_P6_COMPREHENSION_QUESTION_BANK'),get('APLUS_AI_DB_V1_P6_COMPREHENSION_EXPANSION_BATCH02')))
}};
function answerOf(q){
  if(q==null)return '';
  if(typeof q.answer==='number'&&Array.isArray(q.options))return q.options[q.answer]??'';
  if(Array.isArray(q.answer))return q.answer.join('; ');
  return String(q.answer??'');
}
function accepted(q,answer){
  const a=[answer];
  if(Array.isArray(q.acceptedPatterns))a.push(...q.acceptedPatterns);
  if(typeof q.answerText==='string')a.push(q.answerText);
  return [...new Set(a.map(String).filter(Boolean))];
}
function normalizeQuestion(q,passage,pid,index){
  const answer=answerOf(q);
  if(!q.question||!answer)return null;
  const skill=String(q.skill||q.type||'comprehension').replace(/_/g,' ');
  let prompt=String(q.question).trim();
  const lower=prompt.toLowerCase();
  if(lower.includes('what does')||lower.includes('what is meant by')){
    if(!/in your own words/i.test(prompt))prompt+=' Answer in your own words.';
  } else if(/what can we infer|why did|why was|what lesson|how did|what is the main idea|what is the passage mainly about/i.test(prompt)){
    if(!/answer in a complete sentence/i.test(prompt))prompt+=' Answer in a complete sentence.';
  }
  return {
    type:'oe',
    responseType:'open-ended',
    marks:2,
    passage:String(passage||''),
    passageSetId:String(pid||''),
    question:prompt,
    answer,
    acceptedPatterns:accepted(q,answer),
    explanation:q.explanation||'',
    section:'comprehension',
    sourceDatabase:'P6 Comprehension Passage Sets — Open-Ended V2',
    sourceRecordId:String(pid||'')+'-'+String(q.id||index),
    skill,
    difficulty:Number(q.difficulty)||3,
    generationLayer:VERSION
  };
}
function buildFromPassageSets(R,n,r){
  const candidates=R.passages.filter(p=>{
    const passage=String(p.passage||p.text||'').trim();
    return passage.length>=250&&Array.isArray(p.questions)&&p.questions.length>=5;
  });
  if(candidates.length<2)return[];
  const selected=sh(candidates,r).slice(0,2);
  const out=[];
  selected.forEach((p,pi)=>{
    const passage=String(p.passage||p.text||'').trim();
    const qs=sh(p.questions,r).slice(0,5);
    qs.forEach((q,i)=>{const x=normalizeQuestion(q,passage,p.passageId||p.id,pi*5+i);if(x)out.push(x);});
  });
  return out.slice(0,n);
}
function buildFallback(R,n,r){
  const groups={};
  R.comp.forEach(q=>{const p=String(q.passage||'').trim();if(!p)return;(groups[p]||(groups[p]=[])).push(q);});
  const sets=Object.keys(groups).filter(p=>p.length>=250&&groups[p].length>=5);
  const out=[];
  sh(sets,r).slice(0,2).forEach((p,pi)=>sh(groups[p],r).slice(0,5).forEach((q,i)=>{const x=normalizeQuestion(q,p,'COMP-FALLBACK-'+pi,pi*5+i);if(x)out.push(x);}));
  return out.slice(0,n);
}
function install(){
  const G=window[GNAME];
  if(!G||typeof G.generate!=='function')return false;
  if(G.comprehensionVersion===VERSION)return true;
  const original=G.generate;
  G.generate=function(options={}){
    const result=original.call(this,options);
    if(!result||!Array.isArray(result.paper))return result;
    const R=G.registry?G.registry():registry();
    const r=rnd((options.seed||Date.now())^0x51f15e);
    let qs=buildFromPassageSets(R,10,r);
    if(qs.length<10)qs=buildFallback(R,10,r);
    if(qs.length===10){
      const paper=result.paper.filter(q=>q&&q.section!=='comprehension');
      qs.forEach((q,i)=>{q.number=66+i;q.id='Q'+(66+i);});
      result.paper=paper.concat(qs);
      result.paper.forEach((q,i)=>{q.number=i+1;q.id='Q'+(i+1);});
      result.paper.forEach(q=>{if(q.section==='comprehension')q.marks=2;});
      result.diagnostics=result.diagnostics||{};
      result.diagnostics.comprehensionOpenEndedVersion=VERSION;
      result.diagnostics.comprehensionPassages=[...new Set(qs.map(q=>q.passageSetId))];
      result.qualityGateVersion=VERSION;
      result.ok=true;
    }
    return result;
  };
  G.comprehensionVersion=VERSION;
  return true;
}
let tries=0;
const timer=setInterval(()=>{tries++;if(install()||tries>120)clearInterval(timer)},100);
install();
})();
