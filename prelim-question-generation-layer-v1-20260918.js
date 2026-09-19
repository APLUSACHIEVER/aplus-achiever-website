/* APLUS P6 English Prelim — PSLE Paper 2 Generation Layer V1.7 — generation stability fix
   Focused fix: Comprehension Cloze blanks carry their actual question numbers
   directly at each blank position: (46) ______ through (60) ______.
*/
(function(){'use strict';
const BP=[
{id:'grammar',count:10,marks:10,kind:'mcq'},
{id:'vocabulary',count:5,marks:5,kind:'mcq'},
{id:'vocabularyCloze',count:5,marks:5,kind:'mcq'},
{id:'visual',count:5,marks:5,kind:'mcq'},
{id:'grammarCloze',count:10,marks:10,kind:'oe'},
{id:'editing',count:10,marks:10,kind:'oe'},
{id:'comprehensionCloze',count:15,marks:15,kind:'oe'},
{id:'synthesis',count:5,marks:10,kind:'oe'},
{id:'comprehension',count:10,marks:20,kind:'oe'}
];
const clean=s=>String(s??'').toLowerCase().replace(/[“”‘’".,!?;:()[\]{}]/g,' ').replace(/\s+/g,' ').trim();
const rnd=seed=>{let x=(seed>>>0)||1;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}};
const sh=(a,r)=>{a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const get=n=>Array.isArray(window[n])?window[n]:[];
const REAL2026=()=>get('APLUS_2026_PRELIM_REAL_SOURCE_BANK');
const EXP2026=()=>[].concat(
  get('APLUS_2026_PRELIM_EXPANSION_BATCH02'),
  get('APLUS_2026_PRELIM_EXPANSION_BATCH03'),
  get('APLUS_2026_PRELIM_EXPANSION_BATCH04'),
  get('APLUS_2026_PRELIM_EXPANSION_BATCH05'),
  get('APLUS_2026_PRELIM_EXPANSION_BATCH06'),
  get('APLUS_2026_PRELIM_EXPANSION_BATCH07'),
  get('APLUS_2026_PRELIM_EXPANSION_BATCH08'),
  get('APLUS_2026_PRELIM_EXPANSION_BATCH09')
).filter(Boolean);
const EXP_SOURCE='APLUS 2026 Prelim Expansion Inventory';
const expRecords=()=>EXP2026();
const uniq=a=>{const m=new Map();a.forEach(x=>x&&x.id&&m.set(String(x.id),x));return[...m.values()]};
function registry(){const E=expRecords();return{
 grammar:uniq([].concat(E.filter(x=>x.section==='grammar'),REAL2026().filter(x=>x.section==='grammar'),get('APLUS_AI_DB_V1_P6_PSLE_PAPER2_CORE_GRAMMAR_BATCH01'),get('APLUS_AI_DB_V1_P6_GRAMMAR_QUESTION_BANK'),get('APLUS_AI_DB_V1_GRAMMAR_P6_QUESTION_BANK'),get('APLUS_AI_DB_V1_GRAMMAR_P6_EXPANSION_BATCH02'),get('APLUS_AI_DB_V1_GRAMMAR_P6_EXPANSION_BATCH03'),get('APLUS_AI_DB_V1_GRAMMAR_P6_EXPANSION_BATCH04'))),
 vocab:uniq([].concat(E.filter(x=>x.section==='vocabulary'),REAL2026().filter(x=>x.section==='vocabulary'),get('APLUS_AI_DB_V1_P6_PSLE_PAPER2_MASTER_VOCABULARY_CONTENT_B03'),get('APLUS_AI_DB_V1_P6_PSLE_PAPER2_CORE_VOCABULARY_BATCH02'))),
 ce:uniq([].concat(E.filter(x=>x.section==='grammarCloze').map(x=>Object.assign({type:'cloze',text:x.passage||x.text},x)),get('APLUS_AI_DB_V1_P6_CLOZE_EDITING_QUESTION_BANK'),get('APLUS_AI_DB_V1_P6_CLOZE_EDITING_EXPANSION_BATCH02'),get('APLUS_AI_DB_V1_P6_CLOZE_EDITING_EXPANSION_BATCH03'),get('APLUS_AI_DB_V1_P6_CLOZE_EDITING_EXPANSION_BATCH04'))),
 editing:uniq([].concat(E.filter(x=>x.section==='editing').map(x=>Object.assign({original:x.sentence||x.original,corrected:x.correct||x.corrected,correct:x.correct||x.corrected},x)),get('APLUS_AI_DB_V1_P6_PSLE_PAPER2_MASTER_EDITING_DNA_B03'),get('APLUS_AI_DB_V1_P6_PSLE_PAPER2_CORE_EDITING_DNA_BATCH02'))),
 synthesis:uniq([].concat(E.filter(x=>x.section==='synthesis').map(x=>Object.assign({question:x.question||((x.starter||'')+' ________________________________'),answer:x.answer||x.answerContinuation,acceptedPatterns:x.acceptedAnswers||x.acceptedPatterns},x)),get('APLUS_AI_DB_V1_P6_SYNTHESIS_TRANSFORMATION_QUESTION_BANK'),get('APLUS_AI_DB_V1_P6_SYNTHESIS_TRANSFORMATION_EXPANSION_BATCH02'),get('APLUS_AI_DB_V1_P6_SYNTHESIS_TRANSFORMATION_EXPANSION_BATCH04'))),
 comp:uniq([].concat(get('APLUS_AI_DB_V1_P6_COMPREHENSION_QUESTION_BANK'),get('APLUS_AI_DB_V1_P6_COMPREHENSION_EXPANSION_BATCH02'))),
 passages:uniq([].concat(get('APLUS_AI_DB_V1_P6_COMPREHENSION_PASSAGE_SETS_BATCH01'),get('APLUS_AI_DB_V1_P6_COMPREHENSION_PASSAGE_SETS_BATCH02'))),
 visual:uniq(get('APLUS_AI_DB_V1_P6_PSLE_PAPER2_CORE_VISUAL_TEXT_DNA_BATCH01')),taonanDNA:get('APLUS_TAONAN_2026_P2_DNA_BANK'),
realGrammar:uniq([].concat(E.filter(x=>x.section==='grammar'),REAL2026().filter(x=>x.section==='grammar'))),realVocab:uniq([].concat(E.filter(x=>x.section==='vocabulary'),REAL2026().filter(x=>x.section==='vocabulary'))),realVocabCloze:uniq([].concat(E.filter(x=>x.section==='vocabularyCloze'),E.filter(x=>x.section==='vocabulary-cloze'),REAL2026().filter(x=>x.section==='vocabularyCloze')))
}};
function tag(q,s,source,id,skill,diff){return Object.assign(q,{section:s,sourceDatabase:source,sourceRecordId:String(id||''),skill:skill||s,difficulty:Number(diff)||3,generationLayer:'PSLE_PAPER2_GENERATION_V1'});}
function mcq(x,s,source,r){if(!x)return null;let question=x.question||x.context||x.text;if(!question)return null;let answer=x.answer;if(typeof answer==='number'&&Array.isArray(x.options))answer=x.options[answer];if(answer==null)return null;let opts=Array.isArray(x.options)?x.options.slice():Array.isArray(x.distractors)?[answer,...x.distractors]:[];opts=opts.map(String).filter(v=>clean(v)!==clean(answer));opts=[...new Set(opts)];if(opts.length<3)return null;opts=sh([String(answer),...sh(opts,r).slice(0,3)],r);if(new Set(opts.map(clean)).size!==4)return null;return tag({type:'mcq',marks:1,question:String(question),options:opts,answer:String(answer),explanation:x.explanation||x.rule||''},s,source,x.id,x.skill||x.topic,x.difficulty);}
function take(pool,n,r){return sh(pool.filter(Boolean),r).slice(0,n);}
function grammar(R,n,r){let out=[];for(const x of take(R.grammar,n*5,r)){const q=mcq(x,'grammar','P6 Grammar Database',r);if(q)out.push(q);if(out.length===n)break}return out.slice(0,n);}
function vocab(R,n,r,cloze){let out=[];if(cloze){for(const x of take(R.realVocabCloze,1,r)){out.push(tag({type:'mcq',marks:1,passage:String(x.passage||''),blankNumber:x.questionNumber,question:'Choose the word closest in meaning to the underlined word.',options:x.options.map(String),answer:String(x.answer),explanation:'The correct option matches the meaning of the underlined word in context.'},'vocabularyCloze','2026 School Prelim Real Source',x.id,x.skill,x.difficulty));}}else{
  // Booklet A Vocabulary Q11–15: use the imported 2026 school-prelim sentence-fit items first.
  // These already follow the PSLE-style format: one standalone sentence with a blank and four options.
  const sourceVocab=uniq((window.APLUS_2026_PRELIM_REAL_SOURCE_BANK||[]).filter(x=>x&&x.section==='vocabulary'&&Number(x.questionNumber)>=11&&Number(x.questionNumber)<=15&&/_{3,}/.test(String(x.question||''))));
  for(const x of take(sourceVocab,n,r)){const q=mcq(x,'vocabulary','2026 School Prelim Real Source',r);if(q)out.push(q);}
  // Keep the existing fallback bank unchanged if the real-source layer is ever unavailable.
  if(out.length<n){for(const x of take(R.realVocab,n,r)){const q=mcq(x,'vocabulary','2026 School Prelim Real Source',r);if(q)out.push(q);}}
} if(!cloze && out.length>=n)return out.slice(0,n); for(const x of take(R.vocab,n*6,r)){if(!x.word)continue;const context=x.contextClue||((x.contextClues||[]).join('; '))||'Choose the word that best matches the meaning described.';const bad=sh(R.vocab.map(y=>y&&y.word).filter(Boolean).filter(w=>clean(w)!==clean(x.word)),r).slice(0,3);if(bad.length<3)continue;out.push(tag({type:'mcq',marks:1,question:String(context)+(cloze?' Which word best completes the context?':' Which word best fits the context?'),options:sh([String(x.word),...bad],r),answer:String(x.word),explanation:x.definition||''},cloze?'vocabularyCloze':'vocabulary','P6 Master Vocabulary',x.id,'vocabulary',x.difficulty));if(out.length===n)break}return out.slice(0,n);}
function visualText(t){let a=[t.title,'Organised by '+t.org,'',t.intro,'','DATE: '+t.date,'VENUE: '+t.venue,'TIME: '+t.time,''];t.cards.forEach((c,i)=>{a.push('['+(i+1)+'] '+c[0]);c.slice(1).forEach(v=>a.push('• '+v));a.push('')});return a.join('\n')}
function visual(R,n,r){
  // Safe fallback. The dedicated Visual Text V8 module may replace this section
  // after the generation layer is loaded. This fallback must never depend on
  // an undeclared VISUAL_TEMPLATES variable.
  const pool=Array.isArray(R.visual)?R.visual.filter(Boolean):[];
  if(!pool.length)return[];
  const t=pool[Math.floor(r()*pool.length)];
  const title=String(t.title||'Visual Text');
  const type=String(t.type||'notice').replace(/_/g,' ');
  const text=[title,'TYPE: '+type.toUpperCase(),'The visual text presents information for pupils to read carefully.','Focus on the stated details, purpose and conditions when answering the questions.'].join('\\n');
  const bank=[
    {q:'What is the main purpose of the visual text?',a:'To provide information to readers.',d:['To tell a fictional story.','To entertain readers with a joke.','To describe a personal experience.']},
    {q:'Which skill is most important when answering questions about this visual text?',a:'Reading and matching stated information.',d:['Guessing from a single keyword.','Ignoring details in the text.','Choosing the longest option.']},
    {q:'Why should readers pay attention to the details in the visual text?',a:'Different details may have different meanings or conditions.',d:['All details mean the same thing.','Only the title matters.','The details are included for decoration.']},
    {q:'Which statement is supported by the visual text?',a:'The information should be read carefully before a choice is made.',d:['Readers should ignore the information.','The text gives no useful information.','Only one type of reader can understand it.']},
    {q:'What should a pupil do before selecting an answer?',a:'Check the answer against the information given.',d:['Choose an option at random.','Use information from another question.','Select the first option seen.']}
  ];
  return bank.slice(0,n).map((x,i)=>tag({
    type:'mcq',marks:1,
    visual:{type:t.type,title,subtitle:t.subtitle||'',text},
    question:x.q,
    options:sh([x.a,...x.d],r),
    answer:x.a,
    explanation:'Use the information stated in the visual text and match it to the question.'
  },'visual','P6 Visual Text Safe Fallback',String(t.id||title)+'-'+i,'visual comprehension',i<2?2:(i<4?3:4)));
}
function cloze(R,n,r,section){const pool=R.ce.filter(x=>x&&x.type==='cloze'&&x.text&&x.answer!=null);const chosen=take(pool,n,r);if(chosen.length<n)return[];const start=section==='grammarCloze'?26:46;const title=section==='grammarCloze'?'GRAMMAR CLOZE':'COMPREHENSION CLOZE';const passage=title+'\n\n'+chosen.map((x,i)=>{const num=start+i;let text=String(x.text);if(/_{2,}/.test(text))text=text.replace(/_{2,}/,'('+num+') ______');else text=text+' ('+num+') ______';return text}).join(' ');return chosen.map((x,i)=>tag({type:'oe',marks:1,passage,blankNumber:start+i,question:'Fill in the blank with the most suitable word.',answer:String(x.answer),acceptedPatterns:[String(x.answer)],explanation:x.explanation||''},section,'P6 Cloze and Editing Database',x.id,x.skill,x.difficulty));}
function editing(R,n,r){let out=[];for(const x of take(R.editing,n*5,r)){if(!x.original||(x.corrected==null&&x.correct==null))continue;const ans=x.corrected||x.correct;if(clean(x.original)===clean(ans))continue;out.push(tag({type:'oe',marks:1,passage:String(x.original),question:'Correct the error. Write the corrected sentence.',answer:String(ans),acceptedPatterns:[String(ans)],explanation:x.rule||''},'editing','P6 Editing DNA',x.id,x.errorType||x.skill,'3'));if(out.length===n)break}if(out.length<n){for(const x of take(R.ce.filter(y=>y&&y.type==='editing'&&y.text&&y.answer),n*4,r)){if(out.length>=n)break;out.push(tag({type:'oe',marks:1,passage:String(x.text),question:'Correct the sentence.',answer:String(x.answer),acceptedPatterns:[String(x.answer)],explanation:x.explanation||''},'editing','P6 Cloze Editing Database',x.id,x.skill,x.difficulty));}}return out.slice(0,n);}
function synthesis(R,n,r){return take(R.synthesis.filter(x=>x&&x.question&&x.answer!=null),n,r).map(x=>tag({type:'oe',marks:2,question:String(x.question),answer:String(x.answer),acceptedPatterns:Array.isArray(x.acceptedPatterns)?x.acceptedPatterns:[String(x.answer)],explanation:x.explanation||''},'synthesis','P6 Synthesis Transformation Database',x.id,x.skill,'3'));}
function comprehension(R,n,r){let out=[];for(const x of take(R.comp.filter(q=>q&&q.question&&q.answer!=null&&q.passage),n*3,r)){let ans=typeof x.answer==='number'&&Array.isArray(x.options)?x.options[x.answer]:x.answer;out.push(tag({type:'oe',marks:2,passage:String(x.passage),question:String(x.question),answer:String(ans),acceptedPatterns:[String(ans)],explanation:x.explanation||''},'comprehension','P6 Comprehension Database',x.id,x.skill||x.type,x.difficulty));if(out.length===n)break}if(out.length<n){for(const p of sh(R.passages,r)){for(const q of sh(Array.isArray(p.questions)?p.questions:[],r)){if(out.length>=n)break;let ans=typeof q.answer==='number'&&Array.isArray(q.options)?q.options[q.answer]:q.answer;if(!q.question||ans==null)continue;out.push(tag({type:'oe',marks:2,passage:String(p.text||p.passage||''),question:String(q.question),answer:String(ans),acceptedPatterns:[String(ans)],explanation:q.explanation||''},'comprehension','P6 Comprehension Passage Database',(p.passageId||p.id)+'-'+(q.id||out.length),q.skill||q.type,'3'));}}}return out.slice(0,n);}
function valid(p){if(p.length!==75)return false;let marks=0;for(const b of BP){const q=p.filter(x=>x.section===b.id);if(q.length!==b.count)return false;marks+=q.reduce((s,x)=>s+Number(x.marks||0),0);if(b.kind==='mcq'&&q.some(x=>!Array.isArray(x.options)||x.options.length!==4||!x.options.some(o=>clean(o)===clean(x.answer))))return false;if(b.kind==='oe'&&q.some(x=>!x.answer||!String(x.answer).trim()))return false}return marks===90;}
function generate(options={}){const R=registry(),r=rnd(options.seed||Date.now()),p=[];const makers={grammar:()=>grammar(R,10,r),vocabulary:()=>vocab(R,5,r,false),vocabularyCloze:()=>vocab(R,5,r,true),visual:()=>visual(R,5,r),grammarCloze:()=>cloze(R,10,r,'grammarCloze'),editing:()=>editing(R,10,r),comprehensionCloze:()=>cloze(R,15,r,'comprehensionCloze'),synthesis:()=>synthesis(R,5,r),comprehension:()=>comprehension(R,10,r)};for(const b of BP){const q=makers[b.id]();if(q.length<b.count)return{ok:false,error:'Insufficient database records for '+b.id,diagnostics:{section:b.id,found:q.length,required:b.count}};q.slice(0,b.count).forEach(x=>{x.number=p.length+1;x.id='Q'+x.number;x.marks=b.marks/b.count;p.push(x);});}return{ok:valid(p),paper:p,profile:options.profile||'standard',seed:options.seed||Date.now(),diagnostics:{questionCount:p.length,marks:p.reduce((s,x)=>s+x.marks,0),registry:{grammar:R.grammar.length,vocab:R.vocab.length,realGrammar:R.realGrammar.length,realVocab:R.realVocab.length,realVocabCloze:R.realVocabCloze.length,clozeEditing:R.ce.length,editing:R.editing.length,synthesis:R.synthesis.length,comprehension:R.comp.length,passages:R.passages.length,visual:R.visual.length,taonanDNA:R.taonanDNA.length}}};}
window.APLUS_P6_PSLE_PAPER2_GENERATION_V1={version:'1.8',blueprint:BP,registry,generate};
})();