/* APLUS P6 English Prelim — PSLE-style Paper 2 engine V3 */
(function(){
'use strict';
const KEY='APLUS_P6_PRELIM_SESSION_V2', COMPLETED='APLUS_P6_PRELIM_COMPLETED_V2', TOTAL_TIME=6600;
const BLUEPRINT=[
 {id:'grammar',name:'BOOKLET A · Grammar',count:10,marks:10,booklet:'A',kind:'mcq'},
 {id:'vocabulary',name:'BOOKLET A · Vocabulary',count:5,marks:5,booklet:'A',kind:'mcq'},
 {id:'vocabularyCloze',name:'BOOKLET A · Vocabulary Cloze',count:5,marks:5,booklet:'A',kind:'mcq'},
 {id:'visual',name:'BOOKLET A · Visual Text',count:5,marks:5,booklet:'A',kind:'mcq'},
 {id:'grammarCloze',name:'BOOKLET B · Grammar Cloze',count:10,marks:10,booklet:'B',kind:'oe'},
 {id:'editing',name:'BOOKLET B · Editing for Spelling and Grammar',count:10,marks:10,booklet:'B',kind:'oe'},
 {id:'comprehensionCloze',name:'BOOKLET B · Comprehension Cloze',count:15,marks:15,booklet:'B',kind:'oe'},
 {id:'synthesis',name:'BOOKLET B · Synthesis and Transformation',count:5,marks:10,booklet:'B',kind:'oe'},
 {id:'comprehension',name:'BOOKLET B · Comprehension',count:10,marks:20,booklet:'B',kind:'oe'}
];
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').toLowerCase().replace(/[“”‘’]/g,"'").replace(/\s+/g,' ').trim().replace(/[.?!,;:]+$/,'');
function seed(){return Math.floor(100000+Math.random()*899999)}
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function shuffle(a,r){a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function db(n){return Array.isArray(window[n])?window[n]:[]}
function make(id,section,question,answer,opts,skill,marks=1,extra={}){return Object.assign({id,section,question,answer,options:opts||null,skill,difficulty:3,marks,type:opts?'mcq':'text',sourceType:'APLUS_ORIGINAL'},extra)}

const GRAMMAR=[
 ['The pupils in the classroom ___ waiting for the teacher.',['is','are','was','has'],'are','subject-verb agreement'],
 ['Neither of the boys ___ brought his book today.',['have','has','are','were'],'has','subject-verb agreement'],
 ['By the time we reached the hall, the programme ___.',['starts','has started','had started','will start'],'had started','past perfect'],
 ['Mum ___ dinner when the doorbell rang.',['cooks','was cooking','has cooked','will cook'],'was cooking','past continuous'],
 ['Please remember ___ your homework before you leave.',['check','checking','to check','checked'],'to check','infinitive'],
 ['There ___ several pieces of equipment in the room.',['is','are','was','has'],'are','uncountable noun'],
 ['We arrived ___ the station just before noon.',['in','at','on','by'],'at','preposition'],
 ['The girl spoke ___ because the baby was asleep.',['quiet','quietly','quieter','quietness'],'quietly','adverb'],
 ['If the weather improves, we ___ the match outside.',['played','play','will play','would played'],'will play','first conditional'],
 ['This is the book ___ I borrowed from the library.',['who','where','which','whose'],'which','relative pronoun']
];
const VOCAB=[
 ['The climber checked each loose rope twice before stepping forward because he wanted to be ___.',['careless','careful','cautious','uncertain'],'cautious','meaning in context'],
 ['Although her friends encouraged her to perform, Mei was ___ to go on stage because she was nervous.',['eager','reluctant','proud','certain'],'reluctant','meaning in context'],
 ['Daniel was ___ when completing the model; he checked every small detail before declaring it finished.',['meticulous','careless','hasty','forgetful'],'meticulous','meaning in context'],
 ['Even after several attempts failed, Amir remained ___ and continued practising until he succeeded.',['persistent','fragile','miserable','scarce'],'persistent','meaning in context'],
 ['Without proper care, the old wooden fence began to ___ and became weaker each year.',['improve','deteriorate','expand','recover'],'deteriorate','meaning in context']
];
const VOC_CLOZE={title:'The School Garden Project',passage:'The pupils decided to turn an unused corner of the school into a garden. At first, the soil was dry and the plants looked ___. The pupils watered them regularly and removed weeds. Their teacher reminded them to be ___ because plants need time to grow. After several weeks, the garden became much more ___. The pupils were ___ when they saw the first flowers. They also learned that careful planning could make a small project ___.',items:[['fragile','healthy','ancient','swift'],'fragile'],[['patient','reluctant','careless','silent'],'patient'],[['greener','narrower','scarcer','heavier'],'greener'],[['delighted','miserable','uncertain','fragile'],'delighted'],[['successful','impossible','ordinary','empty'],'successful']]};
const VISUAL={title:'SCHOOL READING WEEK',text:'MONDAY–FRIDAY | 8–12 SEPTEMBER\nBring a book you enjoy and read for at least 20 minutes each day.\nBOOK SWAP: Wednesday, 1.30–2.30 p.m., Library\nPUPIL CHALLENGE: Record the title of each book you finish.\nReminder: Return borrowed library books before joining the Book Swap.',items:[
 ['What is the main purpose of the notice?',['To encourage pupils to take part in Reading Week','To announce a sports competition','To tell pupils the library is closed','To sell new school books'],'To encourage pupils to take part in Reading Week','purpose'],
 ['When will the Book Swap take place?',['Monday morning','Tuesday afternoon','Wednesday afternoon','Friday afternoon'],'Wednesday afternoon','retrieval'],
 ['Where will the Book Swap be held?',['The classroom','The hall','The library','The school garden'],'The library','retrieval'],
 ['What should pupils do before joining the Book Swap?',['Record the weather','Return borrowed library books','Buy a new book','Meet the teacher'],'Return borrowed library books','instruction'],
 ['Why are pupils asked to record the titles of books they finish?',['To keep track of their reading','To reserve seats in the library','To enter a sports event','To borrow more equipment'],'To keep track of their reading','purpose/inference']
]};
const GRAM_CLOZE={title:'A Visit to the Science Centre',passage:'Last Saturday, our class ___(1) to the Science Centre. We ___(2) there early because our teacher wanted us to have enough time. While we ___(3) through the first exhibition, our guide explained how electricity is produced. Each pupil ___(4) a worksheet to complete. We had to listen carefully ___(5) the instructions were important. There ___(6) several experiments for us to try. My partner and I ___(7) the instructions before we began. We ___(8) never seen such a large machine before. If we ___(9) more time, we would have tried another experiment, but the centre ___(10) closing soon.',answers:['went','arrived','were walking','received','because','were','read','had','had','was']};
const EDITING=[
 ['The pupils was excited about the school trip.','was','were','subject-verb agreement'],
 ['They packed their bags careful before leaving.','careful','carefully','adverb form'],
 ['Mum gave me an useful piece of advice.','an','a','article'],
 ['We arrived at the museum in ten o’clock.','in','at','preposition'],
 ['The guide asked us to stood quietly.','stood','stand','verb form'],
 ['There is many interesting exhibits in the hall.','is','are','subject-verb agreement'],
 ['The children enjoyed to learn about fossils.','to learn','learning','gerund'],
 ['Neither of the answers were correct.','were','was','subject-verb agreement'],
 ['The box was too heavy that Ben could not lift it.','too','so','result structure'],
 ['She has finish her project already.','finish','finished','present perfect']
];
const COMP_CLOZE={title:'The Lost Puppy',passage:'On Saturday morning, Lina was walking home when she heard a soft sound behind a bush. She looked carefully and saw a small puppy that seemed frightened. Lina did not know who the puppy belonged to, so she checked its collar. There was no name on it, but there was a phone number. Lina used her mother’s phone to call the number. A worried owner answered and said that the puppy had escaped from the garden. Lina waited with the puppy until the owner arrived. The owner was extremely ___(46) to Lina for helping. Lina was glad that the puppy was ___(47) returned home. She also realised that staying calm and thinking carefully could ___(48) a difficult situation easier to solve. The experience made her feel ___(49) about helping others. She later told her friends that a small act of kindness can have a ___(50) effect. Her friends agreed that people should be ___(51) when they see someone in need. They also thought Lina had acted ___(52) by checking the collar instead of simply walking away. The owner offered Lina a reward, but she ___(53) to accept it. She said that helping the puppy was the right thing to do. Before Lina left, the owner ___(54) her once again. Lina went home feeling ___(55) that she had helped. On the way, she thought about how one small decision could ___(56) a big difference. The next day, she ___(57) the story to her classmates. They were ___(58) by her kindness and decided to help more often. Lina hoped the lesson would ___(59) with them. In the end, the class agreed that kindness should be ___(60) through actions, not just words.',answers:{46:'grateful',47:'safely',48:'make',49:'proud',50:'positive',51:'helpful',52:'wisely',53:'refused',54:'thanked',55:'satisfied',56:'make',57:'shared',58:'impressed',59:'stay',60:'shown'}};
const SYNTH=[
 ['Tom was tired. He finished his homework. Rewrite using “although”.','Although Tom was tired, he finished his homework.',['although tom was tired, he finished his homework.','although tom was tired he finished his homework.'],'contrast'],
 ['The rain was heavy. The match was cancelled. Rewrite using “because”.','The match was cancelled because the rain was heavy.',['the match was cancelled because the rain was heavy.'],'cause and effect'],
 ['The bag was too heavy for Sara to lift. Rewrite using “not ... enough”.','The bag was not light enough for Sara to lift.',['the bag was not light enough for sara to lift.'],'enough'],
 ['The room was so noisy that I could not concentrate. Rewrite using “too ... to”.','The room was too noisy for me to concentrate.',['the room was too noisy for me to concentrate.'],'too...to'],
 ['He left early because he wanted to catch the bus. Rewrite using “so that”.','He left early so that he could catch the bus.',['he left early so that he could catch the bus.'],'purpose']
];
const COMP=[
 ['The school introduced a quiet reading corner during recess. At first, only a few pupils used it. After teachers placed comfortable seats and a wider range of books there, more pupils began visiting it. Why did more pupils start using the reading corner?','Because it became more comfortable and offered more books.',['because it became more comfortable and offered more books.'],'cause and effect'],
 ['Jia found a sketchbook on a bench. She noticed the owner had written a name on the first page, so she handed it to the school office. What does this show about Jia?','She is honest and considerate.',['she is honest and considerate.','she was honest and considerate.'],'character inference'],
 ['A community garden produced vegetables and also brought neighbours together. What was another benefit of the garden besides growing vegetables?','It helped bring the neighbours together.',['it helped bring the neighbours together.'],'main idea'],
 ['The old footbridge became slippery after several days of rain. Pupils were told to use another route while repairs were arranged. Why were pupils told to use another route?','The bridge had become unsafe.',['the bridge had become unsafe.','the bridge was unsafe.'],'inference'],
 ['Amir tried three times to repair his bicycle. Each attempt failed, but he studied the problem and tried again. What can you infer about Amir?','He is persistent and willing to learn from mistakes.',['he is persistent and willing to learn from mistakes.'],'character inference'],
 ['A notice says a bus route has changed because road works are taking place nearby. What is the reason for the change?','The road works affected the usual route.',['the road works affected the usual route.'],'cause and effect'],
 ['A passage explains how a seed changes from a small seed into a flowering plant. Which text structure is mainly used?','A sequence of stages.',['a sequence of stages.','a sequence of events.'],'text structure'],
 ['A volunteer repaired an old bicycle instead of throwing it away. What does this action suggest?','He values repairing and reusing things.',['he values repairing and reusing things.'],'inference'],
 ['A girl kept practising a difficult piece of music every evening until she could play it smoothly. What lesson does this example suggest?','Regular practice can help someone improve.',['regular practice can help someone improve.','practice can help someone improve.'],'lesson'],
 ['A writer describes a noisy playground becoming quieter after pupils agree on new rules. What is the likely purpose of the passage?','To show how agreed rules can improve a situation.',['to show how agreed rules can improve a situation.'],'author purpose']
];
function baseAnswerMatch(q,u){let a=norm(u);if(!a)return false;let accepted=q.acceptedPatterns||[q.answer];return accepted.some(x=>norm(x)===a)}
function makeMCQ(sec,arr,r){return arr.map((x,i)=>make(sec+'-'+(i+1),sec,x[0],x[2],shuffle(x[1],r),x[3],1))}
function build(profile,student,s){let r=rng(s),qs=[];
 makeMCQ('grammar',GRAMMAR,r).forEach(q=>qs.push(q));
 makeMCQ('vocabulary',VOCAB,r).forEach(q=>qs.push(q));
 VOC_CLOZE.items.forEach((x,i)=>{let n=16+i;qs.push(make('vcl-'+n,'vocabularyCloze',`Choose the word that best completes the passage at blank ${i+1}.`,x[1],x[0], 'vocabulary in context',1,{title:VOC_CLOZE.title,passage:VOC_CLOZE.passage.replace('___',`___`)}))});
 VISUAL.items.forEach((x,i)=>qs.push(make('vis-'+i,'visual',x[0],x[3],x[1],x[4],1,{title:VISUAL.title,visual:VISUAL.text})));
 GRAM_CLOZE.answers.forEach((a,i)=>{let n=26+i;let prompt=GRAM_CLOZE.passage.split(`___(${i+1})`);let display=prompt[0]+`___(${i+1})`+(prompt[1]||'');qs.push(make('gcl-'+n,'grammarCloze',`Fill in blank ${i+1} with one suitable word.`,a,null,'grammar cloze',1,{title:GRAM_CLOZE.title,passage:GRAM_CLOZE.passage,blank:i+1}))});
 EDITING.forEach((x,i)=>qs.push(make('edit-'+i,'editing',`Correct the underlined word in sentence ${i+1}.`,x[2],null,x[3],1,{passage:'Editing for Spelling and Grammar\n'+EDITING.map((z,j)=>`${j+1}. ${z[0]}`).join('\n'),editingSentence:x[0],wrong:x[1]})));
 const cc=Object.entries(COMP_CLOZE.answers);cc.forEach(([num,a],i)=>qs.push(make('cc-'+num,'comprehensionCloze',`Fill in blank ${num} with one suitable word.`,a,null,'comprehension cloze',1,{title:COMP_CLOZE.title,passage:COMP_CLOZE.passage,blank:Number(num)})));
 SYNTH.forEach((x,i)=>qs.push(make('syn-'+i,'synthesis',x[0],x[1],null,x[3],2,{acceptedPatterns:x[2]})));
 COMP.forEach((x,i)=>qs.push(make('comp-'+i,'comprehension',x[0],x[1],null,x[3],2,{acceptedPatterns:x[2],passage:'COMPREHENSION\nRead the passage carefully and answer the question in complete sentences.'})));
 qs.forEach((q,i)=>{q.number=i+1;q.sectionName=BLUEPRINT.find(s=>s.id===q.section).name;q.booklet=BLUEPRINT.find(s=>s.id===q.section).booklet;q.paperSeed=s});return qs}
function fresh(){return{candidate:'',klass:'',profile:'standard',seed:seed(),paperId:'',questions:[],answers:{},index:0,remaining:TOTAL_TIME,started:false,submitted:false}}
let state=(()=>{try{return JSON.parse(localStorage.getItem(KEY))||fresh()}catch(e){return fresh()}})();
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
function show(id){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));$(id)?.classList.add('active')}
function format(s){s=Math.max(0,s|0);return`${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s%3600/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
function renderNav(){let root=$('sectionNav');if(!root)return;root.innerHTML='';BLUEPRINT.forEach(sec=>{let box=document.createElement('div');box.className='nav-section';box.innerHTML=`<div class="nav-section-title">${esc(sec.name)}</div>`;state.questions.filter(q=>q.section===sec.id).forEach(q=>{let b=document.createElement('button');b.className='nav-q'+(q.number-1===state.index?' current':'')+(state.answers[q.id]!=null?' answered':'');b.textContent=q.number;b.onclick=()=>{state.index=q.number-1;save();render()};box.appendChild(b)});root.appendChild(box)})}
function render(){let q=state.questions[state.index];if(!q)return;let sec=BLUEPRINT.find(s=>s.id===q.section);$('bookletLabel').textContent=`BOOKLET ${q.booklet}`;$('sectionLabel').textContent=sec.name.replace(/^BOOKLET [AB] · /,'');$('progressText').textContent=`Question ${q.number} of 75`;$('progressBar').style.width=`${q.number/75*100}%`;$('markText').textContent=`${q.marks} ${q.marks===1?'mark':'marks'}`;
 let h=`<div class="q-kicker">${esc(q.sectionName)} <span>${q.marks} ${q.marks===1?'mark':'marks'}</span></div><h2>Question ${q.number}</h2>`;
 if(q.title)h+=`<div class="passage-title"><strong>${esc(q.title)}</strong></div>`;
 if(q.visual)h+=`<div class="visual"><strong>${esc(q.title||'VISUAL TEXT')}</strong><pre>${esc(q.visual)}</pre></div>`;
 if(q.passage&&!q.visual)h+=`<div class="passage">${esc(q.passage)}</div>`;
 if(q.section==='editing')h+=`<div class="editing-target"><strong>Sentence ${q.number-35}</strong><br>${esc(q.editingSentence||'')}</div>`;
 h+=`<div class="question-text">${esc(q.question)}</div>`;
 if(q.options){h+=`<div class="options">${q.options.map((o,i)=>`<label class="option"><input type="radio" name="answer" value="${esc(o)}" ${norm(state.answers[q.id])===norm(o)?'checked':''}><span>${String.fromCharCode(65+i)}.</span><em>${esc(o)}</em></label>`).join('')}</div>`}
 else {h+=`<textarea id="textAnswer" rows="3" spellcheck="false" placeholder="Write your answer here">${esc(state.answers[q.id]||'')}</textarea>`}
 $('questionCard').innerHTML=h;
 document.querySelectorAll('input[name=answer]').forEach(x=>x.onchange=()=>{state.answers[q.id]=x.value;save();renderNav()});$('textAnswer')?.addEventListener('input',e=>{state.answers[q.id]=e.target.value;save()});
 $('prevBtn').disabled=state.index===0;$('nextBtn').textContent=state.index===74?'END EXAMINATION':'Next';renderNav();$('timer').textContent=format(state.remaining)}
function start(){state=fresh();state.candidate=$('candidateName').value.trim()||'Candidate';state.klass=$('candidateClass').value.trim();state.profile=$('paperProfile').value;state.paperId=`APLUS-P6-ENG-P2-${new Date().getFullYear()}-${String(state.seed).slice(-6)}`;state.questions=build(state.profile,state.student,state.seed);state.started=true;save();show('exam');render()}
function resume(){let x;try{x=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}if(x&&Array.isArray(x.questions)&&x.questions.length===75){state=x;show('exam');render()}}
function score(){return state.questions.reduce((n,q)=>n+(baseAnswerMatch(q,state.answers[q.id])?q.marks:0),0)}
function submit(){state.submitted=true;state.completedAt=new Date().toISOString();state.score=score();state.total=90;localStorage.setItem(COMPLETED,JSON.stringify(state));localStorage.removeItem(KEY);showResult()}
function showSubmit(){let a=state.questions.filter(q=>String(state.answers[q.id]??'').trim()).length;$('submitSummary').innerHTML=`<div><strong>${a}</strong> of <strong>75</strong> questions answered</div><div>Paper ID: <strong>${esc(state.paperId)}</strong></div><div>Time remaining: <strong>${format(state.remaining)}</strong></div>`;show('submitScreen')}
function showResult(){let s=state.score||0,p=Math.round(s/90*100);$('paperId').textContent=`Paper ID: ${state.paperId}`;$('score').textContent=`${s} / 90`;$('percentage').textContent=`${p}%`;$('resultMessage').textContent=p>=80?'Strong progress.':p>=50?'More practice is needed.':'Let’s rebuild the basics.';let html='<h3>Section Results</h3>';BLUEPRINT.forEach(sec=>{let rows=state.questions.filter(q=>q.section===sec.id),got=rows.reduce((n,q)=>n+(baseAnswerMatch(q,state.answers[q.id])?q.marks:0),0);html+=`<div class="result-row"><span>${esc(sec.name)}</span><strong>${got} / ${sec.marks}</strong></div>`});$('sectionResults').innerHTML=html;$('skillResults').innerHTML='<h3>Paper Structure</h3><p>Booklet A: 25 multiple-choice questions · 25 marks</p><p>Booklet B: 50 open-ended questions · 65 marks</p><p>APLUS-original PSLE-style practice; syllabus-aligned and not an official SEAB paper.</p>';show('result')}
function printPaper(){let w=window.open('','_blank');if(!w)return;let rows=state.questions.map(q=>`<section class="print-q"><div><b>Question ${q.number}</b> <span>${q.marks} ${q.marks===1?'mark':'marks'}</span></div>${q.title?`<h3>${esc(q.title)}</h3>`:''}${q.visual?`<pre>${esc(q.visual)}</pre>`:''}${q.passage&&!q.visual?`<p class="passage">${esc(q.passage)}</p>`:''}<p>${esc(q.question)}</p>${q.options?`<ol type="A">${q.options.map(o=>`<li>${esc(o)}</li>`).join('')}</ol>`:`<div class="answer">Answer: ${esc(state.answers[q.id]||'________________')}</div>`}</section>`).join('');w.document.write(`<!doctype html><html><head><title>${esc(state.paperId)}</title><style>@page{size:A4;margin:16mm}body{font-family:Arial,sans-serif;font-size:11pt;line-height:1.45}.head{text-align:center;border-bottom:2px solid #111;padding-bottom:10px;margin-bottom:18px}.print-q{break-inside:avoid;margin:0 0 18px}.print-q>div{display:flex;justify-content:space-between}.passage{white-space:pre-wrap;border:1px solid #bbb;padding:10px}.answer{border-bottom:1px solid #555;min-height:25px}li{margin:5px 0}pre{white-space:pre-wrap;border:1px solid #222;padding:12px;font-family:Arial}</style></head><body><div class="head"><h1>APLUS P6 English Prelim</h1><h2>PSLE-Style English Language Examination</h2><p>PAPER 2 · ${esc(state.paperId)} · ${esc(state.candidate)}</p><p>90 marks · 1 hour 50 minutes</p></div>${rows}</body></html>`);w.document.close();w.focus();w.print()}
function tick(){if(!state.started||state.submitted)return;state.remaining--;if(state.remaining<=0){state.remaining=0;save();submit();return}if(state.remaining%5===0)save();$('timer')&&( $('timer').textContent=format(state.remaining));}
$('startBtn')?.addEventListener('click',start);$('resumeBtn')?.addEventListener('click',resume);$('prevBtn')?.addEventListener('click',()=>{if(state.index>0){state.index--;save();render()}});$('nextBtn')?.addEventListener('click',()=>{if(state.index<74){state.index++;save();render()}else showSubmit()});$('confirmSubmitBtn')?.addEventListener('click',submit);$('backToExamBtn')?.addEventListener('click',()=>{show('exam');render()});$('reviewBtn')?.addEventListener('click',()=>{state.index=0;show('exam');render()});$('printBtn')?.addEventListener('click',printPaper);$('newExamBtn')?.addEventListener('click',()=>{localStorage.removeItem(COMPLETED);state=fresh();show('landing')});
if(state.started&&!state.submitted&&state.questions.length===75){show('exam');render()}else if(state.questions.length&&state.questions.length!==75){state=fresh();save()}
setInterval(tick,1000);
window.APLUS_P6_PRELIM_V3={generate:()=>{state=fresh();state.questions=build('standard',null,state.seed);return state.questions},BLUEPRINT,print:printPaper,getState:()=>state};
})();