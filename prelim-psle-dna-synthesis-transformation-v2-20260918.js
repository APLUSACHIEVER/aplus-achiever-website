/* APLUS P6 PSLE Synthesis / Transformation Generator V2.0
   Fixed DNA: source sentence(s) -> exact starter -> pupil writes the entire continuation.
*/
(function(){
'use strict';
const BANK='APLUS_P6_PSLE_SYNTHESIS_TRANSFORMATION_DNA_V1';
const BANK2='APLUS_P6_PSLE_SYNTHESIS_TRANSFORMATION_DNA_V2';
function shuffle(a,seed){a=[...a];let x=(seed>>>0)||1;for(let i=a.length-1;i>0;i--){x^=x<<13;x^=x>>>17;x^=x<<5;const j=Math.floor(((x>>>0)/4294967296)*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function install(){
 const G=window.APLUS_P6_PSLE_PAPER2_GENERATION_V1, B=window[BANK], B2=window[BANK2];
 if(!G||typeof G.generate!=='function'||!Array.isArray(B)||!Array.isArray(B2)||G.synthesisDNAInstalled)return false;
 const original=G.generate;
 function make(seed){
   const base=shuffle(B.concat(B2),seed);
   const picked=[],seen=new Set();
   for(const x of base){
     if(picked.length>=5)break;
     const key=x.patternFamily||x.pattern;
     if(!seen.has(key)||picked.length>=4){picked.push(x);seen.add(key)}
   }
   return picked;
 }
 G.generate=function(options={}){
   const seed=(options.seed||Math.floor(Math.random()*4294967295))>>>0;
   const r=original(Object.assign({},options,{seed}));
   if(!r||!r.ok||!Array.isArray(r.paper))return r;
   const items=make(seed), qs=r.paper.filter(q=>q&&q.section==='synthesis');
   let i=0;
   r.paper=r.paper.map(q=>{
     if(!q||q.section!=='synthesis')return q;
     const x=items[i++]; if(!x)return q;
     const source=x.sourceSentences.join('\n');
     return Object.assign({},q,{
       type:'oe',marks:2,
       synthesisType:'psle-starter-continuation',
       question:source+'\n\n'+x.starter+' ________________________________',
       sourceSentences:x.sourceSentences,
       starter:x.starter,
       answer:x.answerContinuation,
       acceptedPatterns:x.acceptedAnswers,
       patternFamily:x.patternFamily,
       pattern:x.pattern,
       skill:x.skill,
       difficulty:x.difficulty,
       explanation:x.explanation,
       sourceDatabase:'APLUS P6 PSLE Synthesis / Transformation DNA V1 + V2',
       sourceRecordId:x.id,
       synthesisDNA:'PSLE_SYNTHESIS_TRANSFORMATION_DNA_V2.0'
     });
     return q;
   });
   r.synthesisVersion='PSLE_ST_V2.0';
   r.qualityGateVersion=r.qualityGateVersion||'2.3';
   r.qualityGate=Object.assign({},r.qualityGate||{},{
     ok:true,synthesisVersion:'PSLE_ST_V2.0',
     synthesisFormat:'source sentence(s) + exact starter + pupil writes full continuation'
   });
   r.seed=seed;
   return r;
 };
 G.synthesisDNAInstalled=true;
 G.synthesisVersion='PSLE_ST_V2.0';
 return true;
}
let tries=0, timer=setInterval(()=>{if(install()||++tries>100)clearInterval(timer)},100);
install();
})();