/* APLUS P6 English Prelim — Vocabulary Context Engine V1 */
(function(){
'use strict';

const VOCAB = [
 {word:'cautious',stem:'The climber checked each loose rope twice before stepping forward because he wanted to be ___.',options:['cautious','generous','swift','miserable'],skill:'context_clue'},
 {word:'reluctant',stem:'Although her friends encouraged her to perform, Mei was ___ to go on stage because she was nervous.',options:['reluctant','fortunate','substantial','persistent'],skill:'emotion_inference'},
 {word:'meticulous',stem:'Daniel was ___ when completing the model; he checked every small detail before declaring it finished.',options:['meticulous','scarce','swift','miserable'],skill:'precision'},
 {word:'persistent',stem:'Even after his first three attempts failed, Amir remained ___ and continued practising until he succeeded.',options:['persistent','reluctant','fragile','fortunate'],skill:'character_inference'},
 {word:'substantial',stem:'The school made a ___ improvement to the playground by adding new equipment and safer flooring.',options:['substantial','scarce','fragile','reluctant'],skill:'word_choice'},
 {word:'inevitable',stem:'With dark clouds covering the sky and thunder in the distance, rain seemed ___.',options:['inevitable','generous','meticulous','swift'],skill:'inference'},
 {word:'deteriorate',stem:'Without proper care, the old wooden fence began to ___ and became weaker each year.',options:['deteriorate','relieve','persist','generous'],skill:'cause_effect'},
 {word:'scarce',stem:'During the long drought, clean drinking water became ___, so families had to use it carefully.',options:['scarce','substantial','swift','fortunate'],skill:'quantity'},
 {word:'relieve',stem:'The cool towel helped to ___ the runner’s headache after the long race.',options:['relieve','deteriorate','persuade','scarce'],skill:'cause_effect'},
 {word:'consequence',stem:'As a ___ of leaving the gate open, the puppy ran out of the garden.',options:['consequence','purpose','permission','decision'],skill:'cause_effect'},
 {word:'generous',stem:'The ___ donor gave enough books to the school library for every class to receive a set.',options:['generous','scarce','reluctant','miserable'],skill:'character_inference'},
 {word:'fragile',stem:'The museum placed a warning beside the vase because it was extremely ___ and could break easily.',options:['fragile','persistent','swift','substantial'],skill:'context_clue'},
 {word:'swift',stem:'The lifeguard took ___ action when he noticed that the swimmer was in trouble.',options:['swift','reluctant','fragile','scarce'],skill:'context_clue'},
 {word:'fortunate',stem:'We were ___ to find the lost wallet before anyone else picked it up.',options:['fortunate','miserable','reluctant','meticulous'],skill:'inference'},
 {word:'miserable',stem:'After standing in the cold rain for an hour without a jacket, the children felt ___.',options:['miserable','generous','fortunate','swift'],skill:'emotion_inference'}
];

function norm(x){return String(x||'').trim().toLowerCase().replace(/[.!?]+$/,'')}
function shuffle(a,r){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function rng(seed){let a=seed|0;return()=>{a=a+0x6D2B79F5|0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function makeQuestions(seed){
 const r=rng(seed);
 const chosen=shuffle(VOCAB,r).slice(0,5);
 return chosen.map((x,i)=>({
   id:'vocabulary-context-'+x.word+'-'+seed,
   section:'vocabulary',
   sectionName:'BOOKLET A · Vocabulary',
   booklet:'A',
   number:11+i,
   question:x.stem,
   options:shuffle(x.options,r),
   answer:x.word,
   marks:1,
   skill:x.skill,
   difficulty:3,
   type:'mcq',
   sourceId:'P6-VOC-CONTEXT-'+x.word.toUpperCase(),
   sourceType:'APLUS_ORIGINAL_CONTEXT_ENGINE'
 }));
}

function patch(){
 const api=window.APLUS_P6_PRELIM_V2;
 if(!api||typeof api.getState!=='function')return;
 const start=document.getElementById('startBtn');
 if(!start||start.dataset.vocabFix==='1')return;
 start.dataset.vocabFix='1';
 start.addEventListener('click',function(){
   setTimeout(function(){
     const state=api.getState();
     if(!state||!Array.isArray(state.questions))return;
     const replacement=makeQuestions(state.seed);
     const old=state.questions.filter(q=>q.section==='vocabulary');
     if(old.length!==5)return;
     const numbers=old.map(q=>q.number);
     replacement.forEach((q,i)=>q.number=numbers[i]);
     let n=0;
     state.questions=state.questions.map(q=>q.section==='vocabulary'?replacement[n++]:q);
     try{localStorage.setItem('APLUS_P6_PRELIM_SESSION_V2',JSON.stringify(state))}catch(e){}
   },0);
 },false);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patch);else patch();
})();
