/* APLUS P6 English Prelim — PSLE Paper 2 Generation Layer V1.2
   Uses the existing APLUS databases. APLUS-original PSLE-style practice.
   Visual Text upgraded to multimodal poster/flyer/notice-style stimuli.
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
const uniq=a=>{const m=new Map();a.forEach(x=>x&&x.id&&m.set(String(x.id),x));return[...m.values()]};
function registry(){return{
 grammar:uniq([].concat(get('APLUS_AI_DB_V1_P6_PSLE_PAPER2_CORE_GRAMMAR_BATCH01'),get('APLUS_AI_DB_V1_P6_GRAMMAR_QUESTION_BANK'),get('APLUS_AI_DB_V1_GRAMMAR_P6_QUESTION_BANK'),get('APLUS_AI_DB_V1_GRAMMAR_P6_EXPANSION_BATCH02'),get('APLUS_AI_DB_V1_GRAMMAR_P6_EXPANSION_BATCH03'),get('APLUS_AI_DB_V1_GRAMMAR_P6_EXPANSION_BATCH04'))),
 vocab:uniq([].concat(get('APLUS_AI_DB_V1_P6_PSLE_PAPER2_MASTER_VOCABULARY_CONTENT_B03'),get('APLUS_AI_DB_V1_P6_PSLE_PAPER2_CORE_VOCABULARY_BATCH02'))),
 ce:uniq([].concat(get('APLUS_AI_DB_V1_P6_CLOZE_EDITING_QUESTION_BANK'),get('APLUS_AI_DB_V1_P6_CLOZE_EDITING_EXPANSION_BATCH02'),get('APLUS_AI_DB_V1_P6_CLOZE_EDITING_EXPANSION_BATCH03'),get('APLUS_AI_DB_V1_P6_CLOZE_EDITING_EXPANSION_BATCH04'))),
 editing:uniq([].concat(get('APLUS_AI_DB_V1_P6_PSLE_PAPER2_MASTER_EDITING_DNA_B03'),get('APLUS_AI_DB_V1_P6_PSLE_PAPER2_CORE_EDITING_DNA_BATCH02'))),
 synthesis:uniq([].concat(get('APLUS_AI_DB_V1_P6_SYNTHESIS_TRANSFORMATION_QUESTION_BANK'),get('APLUS_AI_DB_V1_P6_SYNTHESIS_TRANSFORMATION_EXPANSION_BATCH02'),get('APLUS_AI_DB_V1_P6_SYNTHESIS_TRANSFORMATION_EXPANSION_BATCH04'))),
 comp:uniq([].concat(get('APLUS_AI_DB_V1_P6_COMPREHENSION_QUESTION_BANK'),get('APLUS_AI_DB_V1_P6_COMPREHENSION_EXPANSION_BATCH02'))),
 passages:uniq([].concat(get('APLUS_AI_DB_V1_P6_COMPREHENSION_PASSAGE_SETS_BATCH01'),get('APLUS_AI_DB_V1_P6_COMPREHENSION_PASSAGE_SETS_BATCH02'))),
 visual:uniq(get('APLUS_AI_DB_V1_P6_PSLE_PAPER2_CORE_VISUAL_TEXT_DNA_BATCH01')),
 qDNA:uniq(get('APLUS_AI_DB_V1_P6_PAPER2_QUESTION_DNA'))
}};
function tag(q,s,source,id,skill,diff){return Object.assign(q,{section:s,sourceDatabase:source,sourceRecordId:String(id||''),skill:skill||s,difficulty:Number(diff)||3,generationLayer:'PSLE_PAPER2_GENERATION_V1'});}
function mcq(x,s,source,r){if(!x)return null;let question=x.question||x.context||x.text;if(!question)return null;let answer=x.answer;if(typeof answer==='number'&&Array.isArray(x.options))answer=x.options[answer];if(answer==null)return null;let opts=Array.isArray(x.options)?x.options.slice():Array.isArray(x.distractors)?[answer,...x.distractors]:[];opts=opts.map(String);opts=[...new Set(opts.filter(v=>clean(v)!==clean(answer)))];if(opts.length<3)return null;opts=sh([String(answer),...sh(opts,r).slice(0,3)],r);if(new Set(opts.map(clean)).size!==4)return null;return tag({type:'mcq',marks:1,question:String(question).replace(/___/g,'___'),options:opts,answer:String(answer),explanation:x.explanation||x.rule||''},s,source,x.id,x.skill||x.topic,x.difficulty);}
function take(pool,n,r,used){let a=pool.filter(x=>x&&(!used||!used.has(String(x.id))));return sh(a,r).slice(0,n);}
function grammar(R,n,r){let out=[];for(const x of take(R.grammar,n*4,r,new Set())){const q=mcq(x,'grammar','P6 Grammar Database',r);if(q)out.push(q);if(out.length===n)break}return out;}
function vocab(R,n,r,cloze){let out=[],used=new Set();for(const x of take(R.vocab,n*5,r,used)){if(!x.word)continue;let context=x.contextClue||((x.contextClues||[]).join('; '));if(!context)context='Choose the word that best matches the meaning described.';let pool=R.vocab.map(y=>y&&y.word).filter(Boolean).filter(w=>clean(w)!==clean(x.word));let bad=sh(pool,r).slice(0,3);if(bad.length<3)continue;let q=tag({type:'mcq',marks:1,question:String(context)+(cloze?' Which word best completes the context?':' Which word best fits the context?'),options:sh([x.word,...bad],r),answer:String(x.word),explanation:x.definition||''},cloze?'vocabularyCloze':'vocabulary','P6 Master Vocabulary',x.id,'vocabulary',x.difficulty);out.push(q);used.add(String(x.id));if(out.length===n)break}return out;}

/*
   VISUAL TEXT DNA V1.2
   The stimulus is deliberately designed as an APLUS-original multimodal poster,
   flyer, programme or notice rather than a plain data table. One stimulus is
   shared by five questions, with a progression from retrieval to inference.
*/
const VISUAL_TEMPLATES=[
 {id:'VT-SPORTS-01',type:'event poster',title:'ANNUAL SPORTS DAY',org:'Sunshine Community Club',intro:'Are you interested in spending an active day with your family and friends? Join us for a day of games, challenges and fun.',date:'16 August 2026',venue:'Sunshine Community Club',time:'8.00 a.m. to 6.00 p.m.',cards:[
  {title:'PARENT-CHILD SOCCER CLINIC',body:['For children aged 6 to 12.','Each child must be accompanied by an adult.','Learn from experienced coaches and practise basic soccer skills.','Sign up by 8.00 a.m. onwards.','Limited slots available.']},
  {title:'BASKETBALL COMPETITION',body:['For teenagers aged 13 to 18.','Form a group of 3 to participate and win prizes.','Register at sunshineportsday.com.sg by 10 August 2026.','Receive a free T-shirt when you sign up for the competition.']},
  {title:'OBSTACLE COURSE CHALLENGE',body:['Join in the fun as a family of 4.','Cooperate with your family members to overcome different obstacles.','Challenge will be held hourly from 9.00 a.m. onwards.','Registration starts from 8.00 a.m. at the booth.','Win the challenge to receive a limited-edition cap and water bottle.']}
 ]},
 {id:'VT-READING-02',type:'school poster',title:'READING ADVENTURE WEEK',org:'Greenfield Primary School Library',intro:'Discover new stories, meet other readers and take part in activities throughout the week.',date:'7–11 September 2026',venue:'School Library and Activity Hall',time:'1.30 p.m. onwards',cards:[
  {title:'BOOK EXCHANGE',body:['Bring up to three books in good condition.','Exchange them for books brought by other pupils.','Open to P4–P6 pupils.','Place books at the library counter by Monday.']},
  {title:'AUTHOR MEET-AND-GREET',body:['Listen to a children’s author share writing tips.','The session begins at 2.30 p.m. on Wednesday.','Register through the library before Tuesday.','Participants may bring one book for signing.']},
  {title:'READING CHALLENGE',body:['Complete a reading task with your team.','Teams must have four members.','The challenge starts at 3.00 p.m. on Friday.','Winning teams will receive book vouchers.']}
 ]},
 {id:'VT-ECO-03',type:'campaign poster',title:'ECO HEROES CAMPAIGN',org:'Greenfield Primary School Eco Club',intro:'Small actions can make a big difference. Take part in our school-wide campaign to reduce waste.',date:'5–23 October 2026',venue:'School Hall, Garden and Canteen',time:'Before school and during recess',cards:[
  {title:'BOTTLE-FREE FRIDAY',body:['Bring a reusable bottle instead of a disposable one.','Pupils may refill bottles at the water stations.','The class with the highest participation will earn a garden pass.','Every Friday during the campaign.']},
  {title:'RECYCLE RIGHT',body:['Sort paper, plastic and metal into the correct bins.','Look for the recycling stations near the canteen.','Eco monitors will guide pupils during recess.','Clean and dry containers before recycling them.']},
  {title:'GREEN DESIGN CHALLENGE',body:['Work in pairs to create a useful item from clean recyclable materials.','Submit your design by 23 October.','A display of selected designs will be held in the school hall.','Prizes will be awarded for creativity and usefulness.']}
 ]},
 {id:'VT-SCIENCE-04',type:'programme flyer',title:'SCIENCE DISCOVERY DAY',org:'Riverside Primary School Science Club',intro:'Explore, investigate and discover how science works in everyday life.',date:'21 November 2026',venue:'School Science Rooms and Hall',time:'9.00 a.m. to 3.30 p.m.',cards:[
  {title:'ROCKET LAB',body:['Build a paper rocket and test its flight.','Open to P5–P6 pupils.','Bring a ruler and coloured pencils.','The first session starts at 9.30 a.m. in Science Room 2.']},
  {title:'MYSTERY LAB',body:['Solve a series of science clues with your team.','Teams must have three or four members.','Wear covered shoes for the experiment.','Register at the hall before 10.00 a.m.']},
  {title:'SCIENCE SHOW',body:['Watch live demonstrations at the school hall.','Two shows will be held at 1.00 p.m. and 2.30 p.m.','No registration is required.','Seats are available on a first-come, first-served basis.']}
 ]},
 {id:'VT-ARTS-05',type:'festival flyer',title:'YOUNG ARTISTS FESTIVAL',org:'Sunrise Community Arts Centre',intro:'Come and celebrate creativity through drawing, music and performance.',date:'12 December 2026',venue:'Sunrise Community Arts Centre',time:'10.00 a.m. to 5.00 p.m.',cards:[
  {title:'LIVE DRAWING WORKSHOP',body:['Suitable for ages 9 to 12.','Learn how to sketch people in motion.','Bring your own drawing materials or use the materials provided.','Morning session begins at 10.30 a.m.']},
  {title:'MINI MUSIC STAGE',body:['Young performers may sign up for a five-minute slot.','Open to singers and instrumentalists aged 10 to 14.','Registration closes on 5 December.','Each performer must bring a parent or guardian.']},
  {title:'ART MARKET',body:['View and purchase handmade items by young artists.','The market opens at 11.00 a.m.','A percentage of proceeds will support the centre’s art programme.','Cashless payment is available.']}
 ]},
 {id:'VT-HOLIDAY-06',type:'holiday programme',title:'DECEMBER DISCOVERY CAMP',org:'Bright Minds Learning Hub',intro:'Make your school holidays meaningful with hands-on activities, teamwork and new experiences.',date:'1–4 December 2026',venue:'Bright Minds Learning Hub',time:'9.00 a.m. to 4.00 p.m.',cards:[
  {title:'DAY 1 · INVENTORS',body:['Design a simple machine with your team.','Open to P5–P6 pupils.','Teams of four are encouraged.','Bring a notebook and pencil.']},
  {title:'DAY 2 · NATURE EXPLORERS',body:['Take part in a guided nature walk.','Wear covered shoes and a cap.','Participants must bring a water bottle.','The walk begins at 9.30 a.m.']},
  {title:'DAY 3 · CREATIVE CODERS',body:['Create a short interactive story using block coding.','No previous coding experience is needed.','Bring a charged laptop if you have one.','The workshop is held in Lab 1.']}
 ]}
];
function visualText(t){const line='━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';const inner=[];inner.push(line);inner.push(('                    '+t.title).slice(-Math.max(0,t.title.length+20)));inner.push(('                     organised by '+t.org));inner.push('');inner.push(t.intro);inner.push('');inner.push('DATE   '+t.date);inner.push('VENUE  '+t.venue);inner.push('TIME   '+t.time);inner.push('');t.cards.forEach((c,i)=>{inner.push('┌──────────────────────────────────────────────────┐');inner.push('│ '+c.title);inner.push('├──────────────────────────────────────────────────┤');c.body.forEach(v=>inner.push('│ • '+v));inner.push('└──────────────────────────────────────────────────┘');if(i<t.cards.length-1)inner.push('');});inner.push(line);return inner.join('\n');}
function visual(R,n,r){
 const t=VISUAL_TEMPLATES[Math.floor(r()*VISUAL_TEMPLATES.length)];
 const c=t.cards;
 const qsets=[
  {question:'According to the visual text, which statement is true?',options:[c[0].body[0],c[1].body[0],c[2].body[0],t.time],answer:c[0].body[0],skill:'visual literal retrieval'},
  {question:'Which activity is meant for participants who want to '+(t.id==='VT-SPORTS-01'?'work together as a family?':t.id==='VT-READING-02'?'exchange books with other pupils?':t.id==='VT-ECO-03'?'create something from recyclable materials?':t.id==='VT-SCIENCE-04'?'watch live science demonstrations?':t.id==='VT-ARTS-05'?'learn to sketch people in motion?':'take part in a coding activity?'),options:[c[0].title,c[1].title,c[2].title,'None of the above'],answer:c[2].title,skill:'visual detail matching'},
  {question:'Which activity has a specific registration requirement?',options:[c[0].title,c[1].title,c[2].title,t.title],answer:c[1].title,skill:'visual detail retrieval'},
  {question:'Why would a participant need to pay attention to the information in the visual text?',options:['Different activities have different requirements.',t.intro,'All activities take place at the same time.','Only adults may join the activities.'],answer:'Different activities have different requirements.',skill:'visual inference'},
  {question:'Which statement is best supported by the visual text?',options:[c[0].body[1],c[1].body[1],c[2].body[1],t.venue],answer:c[2].body[1],skill:'visual overall understanding'}
 ];
 /* Make the second and third questions logically grounded in the selected poster. */
 if(t.id==='VT-SPORTS-01'){
   qsets[1]={question:'Which activity is designed for participants to take part with family members?',options:[c[0].title,c[1].title,c[2].title,t.title],answer:c[2].title,skill:'visual detail matching'};
   qsets[2]={question:'Which activity requires participants to form a group of three?',options:[c[0].title,c[1].title,c[2].title,t.org],answer:c[1].title,skill:'visual detail retrieval'};
   qsets[4]={question:'Which statement is best supported by the visual text?',options:['The soccer clinic is for children aged 6 to 12.', 'The basketball competition is for children below 13.', 'The obstacle course is only for adults.', 'All activities require online registration.'],answer:'The soccer clinic is for children aged 6 to 12.',skill:'visual overall understanding'};
 }
 if(t.id==='VT-READING-02'){
   qsets[1]={question:'Which activity allows pupils to exchange books?',options:[c[0].title,c[1].title,c[2].title,t.title],answer:c[0].title,skill:'visual detail matching'};
   qsets[2]={question:'Which activity requires pupils to form teams of four?',options:[c[0].title,c[1].title,c[2].title,t.org],answer:c[2].title,skill:'visual detail retrieval'};
   qsets[4]={question:'Which statement is best supported by the visual text?',options:['The author session is held on Wednesday.', 'The book exchange is only for P1 pupils.', 'The reading challenge begins before school.', 'Participants may not bring books for signing.'],answer:'The author session is held on Wednesday.',skill:'visual overall understanding'};
 }
 if(t.id==='VT-ECO-03'){
   qsets[1]={question:'Which activity involves creating an item from recyclable materials?',options:[c[0].title,c[1].title,c[2].title,t.title],answer:c[2].title,skill:'visual detail matching'};
   qsets[2]={question:'Which activity gives pupils guidance from eco monitors?',options:[c[0].title,c[1].title,c[2].title,t.org],answer:c[1].title,skill:'visual detail retrieval'};
   qsets[4]={question:'Which statement is best supported by the visual text?',options:['Pupils can refill reusable bottles at the water stations.', 'The campaign lasts for only one day.', 'The design challenge is completed individually.', 'Recycling stations are found only in classrooms.'],answer:'Pupils can refill reusable bottles at the water stations.',skill:'visual overall understanding'};
 }
 if(t.id==='VT-SCIENCE-04'){
   qsets[1]={question:'Which activity does not require registration?',options:[c[0].title,c[1].title,c[2].title,t.title],answer:c[2].title,skill:'visual detail matching'};
   qsets[2]={question:'Which activity is specifically for P5–P6 pupils?',options:[c[0].title,c[1].title,c[2].title,t.org],answer:c[0].title,skill:'visual detail retrieval'};
   qsets[4]={question:'Which statement is best supported by the visual text?',options:['The Science Show has two scheduled sessions.', 'All activities are held in Science Room 2.', 'The Mystery Lab is only for individual participants.', 'The Rocket Lab starts at 1.00 p.m.'],answer:'The Science Show has two scheduled sessions.',skill:'visual overall understanding'};
 }
 if(t.id==='VT-ARTS-05'){
   qsets[1]={question:'Which activity is suitable for someone who wants to sketch people in motion?',options:[c[0].title,c[1].title,c[2].title,t.title],answer:c[0].title,skill:'visual detail matching'};
   qsets[2]={question:'Which activity has a registration closing date?',options:[c[0].title,c[1].title,c[2].title,t.org],answer:c[1].title,skill:'visual detail retrieval'};
   qsets[4]={question:'Which statement is best supported by the visual text?',options:['The art market opens at 11.00 a.m.', 'The drawing workshop is only for adults.', 'Performers can register after the festival.', 'The art market accepts only cash.'],answer:'The art market opens at 11.00 a.m.',skill:'visual overall understanding'};
 }
 if(t.id==='VT-HOLIDAY-06'){
   qsets[1]={question:'Which activity involves block coding?',options:[c[0].title,c[1].title,c[2].title,t.title],answer:c[2].title,skill:'visual detail matching'};
   qsets[2]={question:'Which activity requires participants to wear covered shoes?',options:[c[0].title,c[1].title,c[2].title,t.org],answer:c[1].title,skill:'visual detail retrieval'};
   qsets[4]={question:'Which statement is best supported by the visual text?',options:['The Nature Explorers activity begins at 9.30 a.m.', 'The camp is held only in the school library.', 'The coding workshop requires previous coding experience.', 'The Inventors activity is for adults only.'],answer:'The Nature Explorers activity begins at 9.30 a.m.',skill:'visual overall understanding'};
 }
 const text=visualText(t);
 return qsets.slice(0,n).map((q,i)=>tag({type:'mcq',marks:1,visual:{type:t.type,title:t.title,text,organisation:t.org,date:t.date,venue:t.venue,time:t.time},question:q.question,options:sh(q.options,r),answer:q.answer,explanation:'The answer is supported by information in the visual text.'},'visual','P6 Visual Text DNA V1.2',t.id+'-'+i,q.skill,Math.max(2,3+i%3)));
}
function cloze(R,n,r,section){let pool=R.ce.filter(x=>x&&x.type==='cloze'&&x.text&&x.answer!=null);let chosen=take(pool,n,r,new Set());if(chosen.length<n)return[];let passage=(section==='grammarCloze'?'GRAMMAR CLOZE':'COMPREHENSION CLOZE')+'\n\n'+chosen.map((x,i)=>(i+1)+'. '+String(x.text).replace(/___/,'___')).join(' ');return chosen.map((x,i)=>tag({type:'oe',marks:1,passage,blankNumber:i+1,question:'Fill in the blank with the most suitable word.',answer:String(x.answer),acceptedPatterns:[String(x.answer)],explanation:x.explanation||''},section,'P6 Cloze and Editing Database',x.id,x.skill,x.difficulty));}
function editing(R,n,r){let pool=R.editing.filter(x=>x&&x.original&&(x.corrected||x.correct));let out=pool.map(x=>({x,ans:x.corrected||x.correct})).filter(z=>clean(z.x.original)!==clean(z.ans)).map(z=>tag({type:'oe',marks:1,passage:String(z.x.original),question:'Correct the error. Write the corrected sentence.',answer:String(z.ans),acceptedPatterns:[String(z.ans)],explanation:z.x.rule||''},'editing','P6 Editing DNA',z.x.id,z.x.errorType||z.x.skill,'3'));if(out.length<n){for(const x of R.ce.filter(y=>y&&y.type==='editing'&&y.text&&y.answer)){if(out.length>=n)break;out.push(tag({type:'oe',marks:1,passage:String(x.text),question:'Correct the sentence.',answer:String(x.answer),acceptedPatterns:[String(x.answer)],explanation:x.explanation||''},'editing','P6 Cloze Editing Database',x.id,x.skill,x.difficulty));}}return sh(out,r).slice(0,n);}
function synthesis(R,n,r){return take(R.synthesis.filter(x=>x&&x.question&&x.answer!=null),n,r,new Set()).map(x=>tag({type:'oe',marks:2,question:String(x.question),answer:String(x.answer),acceptedPatterns:Array.isArray(x.acceptedPatterns)?x.acceptedPatterns:[String(x.answer)],explanation:x.explanation||''},'synthesis','P6 Synthesis Transformation Database',x.id,x.skill,'3'));}
function comprehension(R,n,r){let out=[];for(const x of take(R.comp.filter(q=>q&&q.question&&q.answer!=null&&q.passage),n,r,new Set())){let ans=typeof x.answer==='number'&&Array.isArray(x.options)?x.options[x.answer]:x.answer;out.push(tag({type:'oe',marks:2,passage:String(x.passage),question:String(x.question),answer:String(ans),acceptedPatterns:[String(ans)],explanation:x.explanation||''},'comprehension','P6 Comprehension Database',x.id,x.skill||x.type,x.difficulty));if(out.length===n)break}if(out.length<n){for(const p of sh(R.passages,r)){for(const q of sh(Array.isArray(p.questions)?p.questions:[],r)){if(out.length>=n)break;let ans=typeof q.answer==='number'&&Array.isArray(q.options)?q.options[q.answer]:q.answer;if(!q.question||ans==null)continue;out.push(tag({type:'oe',marks:2,passage:String(p.text||p.passage||''),question:String(q.question),answer:String(ans),acceptedPatterns:[String(ans)],explanation:q.explanation||''},'comprehension','P6 Comprehension Passage Database',(p.passageId||p.id)+'-'+(q.id||out.length),q.skill||q.type,'3'));}}}return out.slice(0,n);}
function valid(p){if(p.length!==75)return false;let marks=0;for(const b of BP){const q=p.filter(x=>x.section===b.id);if(q.length!==b.count)return false;marks+=q.reduce((s,x)=>s+Number(x.marks||0),0);if(b.kind==='mcq'&&q.some(x=>!Array.isArray(x.options)||x.options.length!==4||!x.options.some(o=>clean(o)===clean(x.answer))))return false;if(b.kind==='oe'&&q.some(x=>!x.answer||!String(x.answer).trim()))return false}return marks===90;}
function generate(options={}){const R=registry(),r=rnd(options.seed||Date.now()),p=[];const makers={grammar:()=>grammar(R,10,r),vocabulary:()=>vocab(R,5,r,false),vocabularyCloze:()=>vocab(R,5,r,true),visual:()=>visual(R,5,r),grammarCloze:()=>cloze(R,10,r,'grammarCloze'),editing:()=>editing(R,10,r),comprehensionCloze:()=>cloze(R,15,r,'comprehensionCloze'),synthesis:()=>synthesis(R,5,r),comprehension:()=>comprehension(R,10,r)};for(const b of BP){const q=makers[b.id]();if(q.length<b.count)return{ok:false,error:'Insufficient database records for '+b.id,diagnostics:{section:b.id,found:q.length,required:b.count,registry:{grammar:R.grammar.length,vocab:R.vocab.length,clozeEditing:R.ce.length,editing:R.editing.length,synthesis:R.synthesis.length,comprehension:R.comp.length,passages:R.passages.length,visual:R.visual.length}}};q.slice(0,b.count).forEach(x=>{x.number=p.length+1;x.id='Q'+x.number;x.marks=b.marks/b.count;p.push(x);});}return{ok:valid(p),paper:p,profile:options.profile||'standard',seed:options.seed||Date.now(),diagnostics:{questionCount:p.length,marks:p.reduce((s,x)=>s+x.marks,0),registry:{grammar:R.grammar.length,vocab:R.vocab.length,clozeEditing:R.ce.length,editing:R.editing.length,synthesis:R.synthesis.length,comprehension:R.comp.length,passages:R.passages.length,visual:R.visual.length}}};}
window.APLUS_P6_PSLE_PAPER2_GENERATION_V1={version:'1.2',blueprint:BP,registry,generate};
})();