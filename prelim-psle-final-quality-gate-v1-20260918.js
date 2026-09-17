/* APLUS P6 PSLE English — Final Paper 2 Quality Gate V1 */
(function(){
'use strict';
const GNAME='APLUS_P6_PSLE_PAPER2_GENERATION_V1';
const EXPECTED={grammar:10,vocabulary:5,vocabularyCloze:5,visual:5,grammarCloze:10,editing:10,comprehensionCloze:15,synthesis:5,comprehension:10};
const MARKS={grammar:10,vocabulary:5,vocabularyCloze:5,visual:5,grammarCloze:10,editing:10,comprehensionCloze:15,synthesis:10,comprehension:20};
const VERSION='PSLE_FINAL_QG_V1.0';
function norm(s){return String(s??'').toLowerCase().replace(/[“”‘’".,!?;:()[\]{}]/g,' ').replace(/\s+/g,' ').trim()}
function audit(p){
 const d={version:VERSION,questionCount:Array.isArray(p)?p.length:0,totalMarks:0,sections:{},sectionMarks:{},missing:[],unexpected:[],invalid:[],duplicateStems:0,mcqAnswerBalance:{A:0,B:0,C:0,D:0},ok:false};
 if(!Array.isArray(p)){d.invalid.push('paper is not an array');return d}
 const stems=new Set();
 p.forEach((q,i)=>{
  if(!q){d.invalid.push('Q'+(i+1)+' is empty');return}
  if(Number(q.number)!==i+1)d.invalid.push('Question numbering mismatch at '+(i+1));
  const s=String(q.section||'');d.sections[s]=(d.sections[s]||0)+1;d.sectionMarks[s]=(d.sectionMarks[s]||0)+(Number(q.marks)||0);d.totalMarks+=Number(q.marks)||0;
  if(q.type==='mcq'){
   if(!Array.isArray(q.options)||q.options.length!==4)d.invalid.push('Q'+(i+1)+' MCQ must have 4 options');
   const ai=Array.isArray(q.options)?q.options.findIndex(x=>norm(x)===norm(q.answer)):-1;if(ai<0)d.invalid.push('Q'+(i+1)+' MCQ answer not in options');else d.mcqAnswerBalance['ABCD'[ai]]++;
   const st=norm(q.question);if(st&&stems.has(st))d.duplicateStems++;if(st)stems.add(st)
  }else if(q.type==='oe'){if(!String(q.answer??'').trim())d.invalid.push('Q'+(i+1)+' OE has no answer')}else d.invalid.push('Q'+(i+1)+' invalid type')
 });
 Object.keys(EXPECTED).forEach(s=>{if((d.sections[s]||0)!==EXPECTED[s])d.missing.push(s+': '+(d.sections[s]||0)+'/'+EXPECTED[s]);if((d.sectionMarks[s]||0)!==MARKS[s])d.missing.push(s+' marks: '+(d.sectionMarks[s]||0)+'/'+MARKS[s])});
 Object.keys(d.sections).forEach(s=>{if(!(s in EXPECTED))d.unexpected.push(s)});
 d.ok=d.questionCount===75&&d.totalMarks===90&&d.missing.length===0&&d.unexpected.length===0&&d.invalid.length===0;return d;
}
function install(){
 const G=window[GNAME];if(!G||typeof G.generate!=='function')return false;if(G.finalQualityGateVersion===VERSION)return true;
 const required=['comprehensionOEDNAVersion','comprehensionClozeVersion','editingVersion','grammarClozeVersion'];if(required.some(k=>!G[k]))return false;
 const original=G.generate;G.generate=function(options={}){const r=original.call(this,options);if(!r||!Array.isArray(r.paper))return r;const d=audit(r.paper);r.finalQualityGate=d;r.diagnostics=r.diagnostics||{};r.diagnostics.finalQualityGate=d;if(!d.ok){r.ok=false;r.error='Final PSLE Paper 2 quality gate failed.'}else{r.ok=true;r.qualityGateVersion=VERSION}return r};G.finalQualityGateVersion=VERSION;return true;
}
let tries=0;const timer=setInterval(()=>{if(install()||++tries>180)clearInterval(timer)},100);install();
})();
