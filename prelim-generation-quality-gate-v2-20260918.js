/* APLUS P6 English Prelim — Generation Quality Gate V2.1
   Structural quality gate for the 2026 PSLE Paper 2 format.
   Answer-position balance is diagnostic only; it must not block a valid paper.
*/
(function(){'use strict';
const G=window.APLUS_P6_PSLE_PAPER2_GENERATION_V1;if(!G)return;
const original=G.generate;
function norm(s){return String(s??'').toLowerCase().replace(/[“”‘’".,!?;:()[\]{}]/g,' ').replace(/\s+/g,' ').trim()}
const EXPECTED={grammar:10,vocabulary:5,vocabularyCloze:5,visual:5,grammarCloze:10,editing:10,comprehensionCloze:15,synthesis:5,comprehension:10};
function answerBalance(p){let c={A:0,B:0,C:0,D:0};p.filter(q=>q&&q.type==='mcq').forEach(q=>{let i=Array.isArray(q.options)?q.options.findIndex(x=>norm(x)===norm(q.answer)):-1;if(i>=0)c['ABCD'[i]]++});return c}
function check(p){
 if(!Array.isArray(p)||p.length!==75)return{ok:false,reason:'question_count',expected:75,actual:Array.isArray(p)?p.length:0};
 const actualMarks=p.reduce((s,q)=>s+(Number(q&&q.marks)||0),0);
 if(actualMarks!==90)return{ok:false,reason:'mark_total',expected:90,actual:actualMarks};
 let counts={};p.forEach(q=>{if(q)counts[q.section]=(counts[q.section]||0)+1});
 for(const k of Object.keys(EXPECTED))if(counts[k]!==EXPECTED[k])return{ok:false,reason:'section_count',section:k,expected:EXPECTED[k],actual:counts[k]||0};
 let stems=new Set();
 for(const q of p){
  if(!q||!q.section)return{ok:false,reason:'invalid_question'};
  if(q.type==='mcq'){
   const st=norm(q.question);
   if(!st||stems.has(st))return{ok:false,reason:'duplicate_mcq_stem',stem:q.question};
   stems.add(st);
   if(!Array.isArray(q.options)||q.options.length!==4)return{ok:false,reason:'mcq_options'};
   if(new Set(q.options.map(norm)).size!==4)return{ok:false,reason:'duplicate_options'};
   if(!q.options.some(x=>norm(x)===norm(q.answer)))return{ok:false,reason:'missing_answer'};
  }else if(!String(q.answer??'').trim())return{ok:false,reason:'missing_open_answer',section:q.section};
 }
 const balance=answerBalance(p);
 return{ok:true,balance,counts,notes:{answerBalance:'advisory-only'}};
}
G.generate=function(options={}){
 let base=options.seed||Math.floor(Math.random()*4294967295),last=null;
 for(let i=0;i<12;i++){
  const seed=(base+i*2654435761)>>>0;
  try{
   const r=original(Object.assign({},options,{seed}));
   if(!r||!r.ok){last=r||{ok:false,error:'Generation layer returned no result.'};continue}
   const q=check(r.paper);
   if(q.ok){r.qualityGate=q;r.qualityGateVersion='2.1';r.seed=seed;return r}
   last={ok:false,error:'Generation quality gate rejected the paper.',diagnostics:q,seed};
  }catch(e){last={ok:false,error:e.message||String(e),seed}}
 }
 return last||{ok:false,error:'Generation quality gate rejected all attempts.'};
};
G.qualityGateVersion='2.1';
})();
