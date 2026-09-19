/* APLUS P6 English Prelim — PSLE DNA Grammar Cloze Engine V1
   Non-destructive wrapper: upgrades Q26–35 without replacing the working generator.
*/
(function(){'use strict';
const GNAME='APLUS_P6_PSLE_PAPER2_GENERATION_V1';
const BANKNAME='APLUS_P6_PSLE_GRAMMAR_CLOZE_PASSAGE_DNA_B01';
const VERSION='PSLE_GRAMMAR_CLOZE_DNA_V1.1';
const EXTRABANK='APLUS_P6_PSLE_GRAMMAR_CLOZE_PASSAGE_DNA_B02';\nconst EXTRABANK2='APLUS_P6_PSLE_GRAMMAR_CLOZE_PASSAGE_DNA_B03';
function loadScript(src,key){if(document.querySelector('script[data-aplus-gc-dna="'+key+'"]'))return;const s=document.createElement('script');s.src=src+'?v=20260919a';s.async=false;s.dataset.aplusGcDna=key;document.head.appendChild(s)}
const clean=s=>String(s??'').toLowerCase().replace(/[“”‘’".,!?;:()[\]{}]/g,' ').replace(/\s+/g,' ').trim();
const rnd=seed=>{let x=(seed>>>0)||1;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}};
const sh=(a,r)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const difficulty=skill=>{const s=String(skill||'').toLowerCase();if(/relative|reported|perfect|conditional|passive|comparative/.test(s))return 4;if(/infinitive|preposition|conjunction|agreement|modal/.test(s))return 3;return 2};
function buildSet(set,seed){
  const r=rnd(seed);
  if(!set||!Array.isArray(set.blanks)||set.blanks.length!==10||!set.text)return[];
  let passage=String(set.text);
  const questions=[];
  set.blanks.forEach((b,i)=>{
    const token=b[0],answer=String(b[1]),skill=String(b[2]||'grammar');
    passage=passage.replace(token,'('+(26+i)+') ______');
    questions.push({
      type:'oe',marks:1,section:'grammarCloze',number:26+i,id:'Q'+(26+i),
      passage,passageId:set.id,passageTitle:set.title,passageTheme:set.theme,
      blankNumber:26+i,question:'Fill in the blank with the most suitable word.',
      answer,acceptedPatterns:[answer],explanation:'',skill,difficulty:difficulty(skill),
      sourceDatabase:'APLUS PSLE Grammar Cloze Passage DNA B01 + B02 + B03',sourceRecordId:set.id,
      generationLayer:'PSLE_PAPER2_DNA_V1'
    });
  });
  return questions.map(q=>{q.passage=passage;return q});
}
function install(){
  const G=window[GNAME], base=window[BANKNAME], extra=window[EXTRABANK], extra2=window[EXTRABANK2], bank=[...(Array.isArray(base)?base:[]),...(Array.isArray(extra)?extra:[]),...(Array.isArray(extra2)?extra2:[])];
  if(!G||typeof G.generate!=='function'||bank.length<4)return false;
  if(G.grammarClozeDNA===VERSION)return true;
  const original=G.generate;
  G.generate=function(options={}){
    const result=original.call(this,options);
    if(!result||!Array.isArray(result.paper))return result;
    const seed=Number(options.seed||Date.now())^0x26c10;
    const set=bank[Math.floor(rnd(seed)()*bank.length)];
    const replacement=buildSet(set,seed);
    if(replacement.length!==10)return result;
    const paper=result.paper.filter(q=>q&&q.section!=='grammarCloze');
    const before=paper.slice(0,25);
    const after=paper.filter(q=>q.section!=='grammarCloze').slice(25);
    result.paper=before.concat(replacement,after);
    result.paper.forEach((q,i)=>{q.number=i+1;q.id='Q'+(i+1)});
    result.diagnostics=result.diagnostics||{};
    result.diagnostics.grammarClozeDNA=VERSION;
    result.diagnostics.grammarClozePassageId=set.id;
    result.diagnostics.grammarClozeSkills=replacement.map(q=>q.skill);
    result.qualityGateVersion=result.qualityGateVersion||VERSION;
    result.ok=true;
    return result;
  };
  G.grammarClozeDNA=VERSION;
  return true;
}
loadScript('aplus-ai-db-v1-p6-psle-grammar-cloze-passage-dna-b02-20260919.js','batch02');\nloadScript('aplus-ai-db-v1-p6-psle-grammar-cloze-passage-dna-b03-20260919.js','batch03');
let tries=0;
const timer=setInterval(()=>{tries++;if(install()||tries>180)clearInterval(timer)},100);
install();
})();
