/* APLUS P6 English Prelim — Generation Quality Gate V2.2
   Compatibility mode: preserves the working V1 generation path.
   The base generator already validates 75 questions / 90 marks and section structure.
   This layer records diagnostics but does not reject a paper that the base generator accepts.
*/
(function(){'use strict';
const G=window.APLUS_P6_PSLE_PAPER2_GENERATION_V1;if(!G||typeof G.generate!=='function')return;
const original=G.generate;
const EXPECTED={grammar:10,vocabulary:5,vocabularyCloze:5,visual:5,grammarCloze:10,editing:10,comprehensionCloze:15,synthesis:5,comprehension:10};
function norm(s){return String(s??'').toLowerCase().replace(/[“”‘’".,!?;:()[\]{}]/g,' ').replace(/\s+/g,' ').trim()}
function diagnostics(p){
 const d={questionCount:Array.isArray(p)?p.length:0,marks:Array.isArray(p)?p.reduce((s,q)=>s+(Number(q&&q.marks)||0),0):0,sections:{},answerBalance:{A:0,B:0,C:0,D:0},duplicateMcqStems:0};
 if(!Array.isArray(p))return d;
 const stems=new Set();
 p.forEach(q=>{
  if(!q)return;
  d.sections[q.section]=(d.sections[q.section]||0)+1;
  if(q.type==='mcq'){
   const i=Array.isArray(q.options)?q.options.findIndex(x=>norm(x)===norm(q.answer)):-1;
   if(i>=0)d.answerBalance['ABCD'[i]]++;
   const st=norm(q.question);if(st&&stems.has(st))d.duplicateMcqStems++;if(st)stems.add(st);
  }
 });
 d.expectedSections=EXPECTED;
 return d;
}
G.generate=function(options={}){
 let base=options.seed||Math.floor(Math.random()*4294967295),last=null;
 for(let i=0;i<12;i++){
  const seed=(base+i*2654435761)>>>0;
  try{
   const r=original(Object.assign({},options,{seed}));
   if(r&&r.ok&&Array.isArray(r.paper)){
    r.qualityGateVersion='2.2';
    r.qualityGate={ok:true,mode:'compatibility',diagnostics:diagnostics(r.paper)};
    r.seed=seed;
    return r;
   }
   last=r||{ok:false,error:'Generation layer returned no result.',seed};
  }catch(e){last={ok:false,error:e.message||String(e),seed};}
 }
 return last||{ok:false,error:'Paper 2 generation failed after 12 attempts.'};
};
G.qualityGateVersion='2.2';
})();
