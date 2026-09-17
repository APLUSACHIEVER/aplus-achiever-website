(() => {
'use strict';
const $=id=>document.getElementById(id), A=v=>Array.isArray(v)?v:[], C=v=>String(v??'').trim(), S=a=>[...a].sort(()=>Math.random()-.5);
const R={P3:1,P4:2,P5:3};
const db={
 p3:typeof APLUS_AI_DB_V1_VOCABULARY_RICH_P3!=='undefined'?A(APLUS_AI_DB_V1_VOCABULARY_RICH_P3):[],
 p45:typeof APLUS_AI_DB_V1_VOCABULARY_RICH_P45!=='undefined'?A(APLUS_AI_DB_V1_VOCABULARY_RICH_P45):[],
 conf:typeof APLUS_AI_DB_V1_VOCABULARY_CONFUSABLES_P3P5_BATCH01!=='undefined'?A(APLUS_AI_DB_V1_VOCABULARY_CONFUSABLES_P3P5_BATCH01):[],
 coll:typeof APLUS_AI_DB_V1_VOCABULARY_COLLOCATIONS_P3P5_BATCH01!=='undefined'?A(APLUS_AI_DB_V1_VOCABULARY_COLLOCATIONS_P3P5_BATCH01):[],
 grammar:typeof APLUS_AI_DB_V1_GRAMMAR_LARGE_P3P5_BATCH01!=='undefined'?A(APLUS_AI_DB_V1_GRAMMAR_LARGE_P3P5_BATCH01):[]
};
const KEY='APLUS_AI_TUTOR_STUDENT_V4';
let state=(()=>{try{return JSON.parse(localStorage.getItem(KEY))||null}catch(e){return null}})()||{level:'P3',questions:0,correct:0,mistakes:[],skills:{},history:[]};
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function rank(r){let x=C(r.level).toUpperCase();if(x.includes('P3'))return 1;if(x.includes('P4'))return 2;if(x.includes('P5'))return 3;return 2}
function eligible(a){let n=R[state.level]||1;return a.filter(x=>Math.abs(rank(x)-n)<=1)}
function skill(s){return state.skills[s]||{correct:0,total:0,mastery:0,lastWrong:0}}
function mark(s,ok){let x=skill(s);x.total++;if(ok)x.correct++;else x.lastWrong=Date.now();x.mastery=Math.round(x.correct/x.total*100);state.skills[s]=x}
function esc(x){return C(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function forms(w){w=C(w);return [...new Set([w,w+'s',w+'ed',w+'ing',w.endsWith('e')?w.slice(0,-1)+'ing':w+'ing',w.endsWith('y')?w.slice(0,-1)+'ied':w+'ied'])]}
function locate(ex,w){for(let f of forms(w).sort((a,b)=>b.length-a.length)){let re=new RegExp('\\b'+f.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')+'\\b','i'),m=C(ex).match(re);if(m)return{form:m[0],i:m.index}}return null}
function vocab(){let out=[];let pool=eligible([...db.p3,...db.p45]);for(let r of S(pool)){let w=C(r.word),ex=C(A(r.examples)[0]),h=locate(ex,w);if(!w||!h)continue;let prompt=ex.slice(0,h.i)+'_____'+ex.slice(h.i+h.form.length), distract=S(pool.filter(x=>C(x.word).toLowerCase()!==w.toLowerCase())).map(x=>C(x.word)).filter(Boolean).filter(x=>x.toLowerCase()!==h.form.toLowerCase()).slice(0,3);if(distract.length<3)continue;out.push({id:r.id+'-v4',skill:'Vocabulary',prompt,answer:h.form,options:S([h.form,...distract]),explain:'The sentence needs “'+h.form+'”. '+C(r.definition)});if(out.length>=40)break}return out}
function confusables(){let out=[];for(let r of eligible(db.conf)){let pair=A(r.pair).map(C).filter(Boolean),cues=A(r.cue).map(C).filter(Boolean);if(pair.length<2)continue;for(let cue of cues){let ans=pair.find(w=>new RegExp('\\b'+w.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')+'\\b','i').test(cue));if(!ans)continue;let prompt=cue.replace(new RegExp('\\b'+ans.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')+'\\b','i'),'_____');if(!prompt.includes('_____'))continue;let ds=S(pair.filter(x=>x!==ans)).slice(0,3);while(ds.length<3)ds.push(C(S(eligible(db.conf).flatMap(x=>A(x.pair))).find(x=>x&&x!==ans&&!ds.includes(x))||''));ds=ds.filter(Boolean).slice(0,3);if(ds.length===3)out.push({id:r.id+'-v4',skill:'Confusables',prompt,answer:ans,options:S([ans,...ds]),explain:C(r.rule)||'Choose the word that fits the meaning and grammar.'});break}}return out}
const GP=[
['common nouns','Which sentence is correct?',['There are two books on the desk.','There are two book on the desk.','There is two books on the desk.','There are a books on the desk.'],'There are two books on the desk.'],
['pronouns','Mum gave the books to _____.',['me','I','my','mine'],'me'],
['articles','She ate _____ apple after lunch.',['an','a','the','some'],'an'],
['subject-verb agreement','The box of pencils _____ on the table.',['is','are','be','am'],'is'],
['present simple','Every morning, Maya _____ to school at seven.',['walk','walks','walking','walked'],'walks'],
['present continuous','Look! The children _____ football.',['are playing','play','played','have played'],'are playing'],
['past simple','Yesterday, we _____ to the museum.',['went','go','gone','going'],'went'],
['prepositions of time','The test starts _____ Monday morning.',['on','at','in','by'],'on'],
['conjunctions','It was raining, _____ we stayed indoors.',['so','but','because','unless'],'so'],
['past continuous','I _____ dinner when the phone rang.',['was eating','ate','am eating','have eaten'],'was eating'],
['present perfect','She has _____ her project already.',['finished','finish','finishing','finishes'],'finished'],
['modal verbs','You _____ wear your seat belt.',['must','must to','musts','must wearing'],'must'],
['adjectives','This puzzle is _____ than the last one.',['more difficult','most difficult','difficultest','more difficulter'],'more difficult'],
['adverbs','The girl sang _____ at the concert.',['beautifully','beautiful','beauty','beautify'],'beautifully'],
['prepositions','The cat jumped _____ the box.',['into','at','on','by'],'into'],
['relative clauses','The boy _____ won the race is my friend.',['who','which','where','what'],'who'],
['reported speech','He said that he _____ tired.',['was','is','were','be'],'was'],
['conditional sentences','If it _____, we will stay indoors.',['rains','will rain','rained','raining'],'rains'],
['active and passive voice','The cake _____ by Mum yesterday.',['was made','was make','made','is making'],'was made'],
['gerunds and infinitives','I enjoy _____ storybooks.',['reading','to read','read','reads'],'reading'],
['sentence structure','Which sentence is complete?',['Because he was tired, he went home.','Because he was tired.','He went home because.','He tired went home.'],'Because he was tired, he went home.'],
['quantifiers','There is _____ water left.',['a little','a few','many','few'],'a little'],
['possessives','This is _____ bag.',['Sarah’s','Sarah','Sarahs','Sarahs’'],'Sarah’s'],
['question forms','Where _____ you going?',['are','is','do','did'],'are'],
['determiners','_____ books belong to me.',['These','This','That','A'],'These'],
['there is and there are','_____ three apples in the basket.',['There are','There is','There be','There has'],'There are'],
['negatives','She does not _____ coffee.',['drink','drinks','drank','drinking'],'drink'],
['can and cannot','He can _____ very fast.',['run','runs','running','to run'],'run'],
['comparative adjectives','My bag is as _____ as yours.',['heavy','heavier','heaviest','more heavy'],'heavy'],
['superlative adjectives','Ali is the _____ runner in the class.',['fastest','faster','most fast','fast'],'fastest'],
['infinitive of purpose','I went to the library _____ a book.',['to borrow','for borrow','borrowing','borrowed'],'to borrow'],
['zero conditional','If you heat ice, it _____.',['melts','will melt','melted','melting'],'melts'],
['reported questions','He asked where I _____.',['lived','did I live','do I live','am I living'],'lived'],
['unless','Unless you hurry, you _____ the bus.',['will miss','missed','are miss','will missed'],'will miss'],
['passive','English _____ in many countries.',['is spoken','is speak','speaks','is speaking'],'is spoken'],
['although','_____ he was tired, he continued working.',['Although','Despite','Because of','Unless'],'Although'],
['because','He stayed home _____ he was ill.',['because','despite','although','unless'],'because'],
['parallel structure','She likes reading, swimming, and _____.',['cycling','to cycle','cycle','cycled'],'cycling']
];
function grammar(){let out=[];for(let r of eligible(db.grammar)){let t=(C(r.topic)+' '+C(r.focus)+' '+A(r.skills).join(' ')).toLowerCase(),g=GP.find(x=>t.includes(x[0]));if(!g)continue;out.push({id:r.id+'-v4',skill:'Grammar',prompt:g[1],options:S(g[2]),answer:g[3],explain:C(r.rules&&r.rules[0])||'Choose the form that matches the grammar rule.'})}return S(out)}
function review(){let all=[...vocab(),...grammar()];let ids=new Set(state.mistakes.map(x=>x.id));return S(all.filter(q=>ids.has(q.id))).concat(S(all.filter(q=>!ids.has(q.id)))).slice(0,10)}
let session={list:[],i:0,mode:''};
function start(mode){session.mode=mode;session.i=0;session.list=mode==='grammar'?grammar():mode==='review'?review():mode==='mixed'?S([...vocab(),...grammar()]):S([...vocab(),...confusables()]);session.list=session.list.slice(0,mode==='mixed'?12:10);render()}
function render(){let q=session.list[session.i];if(!q){$('quizLabel').textContent='SESSION COMPLETE';$('questionProgress').textContent='Your Tutor Brain has updated your learning profile.';$('questionArea').innerHTML='<div class="empty-quiz"><div class="empty-icon">✓</div><h3>Session complete.</h3><p>Your next practice will adapt to the skills you need most.</p></div>';update();return}$('quizLabel').textContent=q.skill.toUpperCase();$('questionProgress').textContent='Question '+(session.i+1)+' of '+session.list.length+' · '+state.level;$('questionArea').innerHTML='<div class="question-text">'+esc(q.prompt)+'</div><div class="options">'+q.options.map((o,i)=>'<button class="option-btn" type="button" data-v="'+esc(o)+'"><b>'+String.fromCharCode(65+i)+'.</b> '+esc(o)+'</button>').join('')+'</div><div id="feedbackSlot"></div>';$('questionArea').querySelectorAll('.option-btn').forEach(b=>b.onclick=()=>answer(q,b))}
function answer(q,b){if(b.disabled)return;let ok=C(b.dataset.v).toLowerCase()===C(q.answer).toLowerCase();$('questionArea').querySelectorAll('.option-btn').forEach(x=>{x.disabled=true;if(C(x.dataset.v).toLowerCase()===C(q.answer).toLowerCase())x.classList.add('correct')});if(!ok)b.classList.add('wrong');state.questions++;if(ok)state.correct++;mark(q.skill,ok);if(!ok)state.mistakes.unshift({id:q.id,skill:q.skill,prompt:q.prompt,answer:q.answer});else state.mistakes=state.mistakes.filter(x=>x.id!==q.id);state.mistakes=state.mistakes.slice(0,50);state.history.unshift({id:q.id,ok,at:Date.now()});save();$('feedbackSlot').innerHTML='<div class="feedback '+(ok?'feedback-good':'feedback-fix')+'"><b>'+(ok?'Correct!':'Let’s fix this one.')+'</b><br>'+esc(q.explain)+'</div><div class="feedback-actions"><button class="next-btn" id="nextQuestion" type="button">'+(session.i+1===session.list.length?'Finish':'Next question')+' →</button></div>';$('nextQuestion').onclick=()=>{session.i++;render()};update()}
function update(){$('statQuestions').textContent=state.questions;$('statAccuracy').textContent=state.questions?Math.round(state.correct/state.questions*100)+'%':'—';let m=Object.values(state.skills).filter(x=>x.total);$('statMastery').textContent=m.length?Math.round(m.reduce((a,x)=>a+x.mastery,0)/m.length)+'%':'0%';$('statReview').textContent=state.mistakes.length;$('dataStatus').textContent='Tutor Brain V4 ready · '+state.level;$('coachMessage').textContent=state.questions?'I’m adapting to your recent answers.':'Let’s start with a short practice session.';let names=['Vocabulary','Grammar','Confusables','Collocation','Word Meaning','Context Clues'];$('skillsList').innerHTML=names.map(s=>{let x=skill(s);return '<div class="skill-row"><div class="skill-head"><span>'+esc(s)+'</span><span>'+x.mastery+'%</span></div><div class="bar"><span style="width:'+x.mastery+'%"></span></div></div>'}).join('');$('reviewList').innerHTML=state.mistakes.length?state.mistakes.slice(0,3).map(x=>'<div class="review-item"><span class="dot"></span><div><b>'+esc(x.skill)+'</b><small>Recent mistake</small></div></div>').join(''):'<div class="review-item"><span class="dot"></span><div><b>You are on track.</b><small>No urgent review item yet.</small></div></div>';$('pathList').innerHTML=names.slice(0,3).map((s,i)=>'<div class="path-item"><span class="dot"></span><div><b>'+(i+1)+'. '+esc(s)+'</b><small>Adaptive practice based on your mastery</small></div></div>').join('')}
document.querySelectorAll('.level-btn').forEach(b=>b.onclick=()=>{state.level=b.dataset.level;save();update()});document.querySelectorAll('.practice-card').forEach(b=>b.onclick=()=>{start(b.dataset.mode);$('quizCard').scrollIntoView({behavior:'smooth',block:'start'})});$('closeQuiz').onclick=()=>{$('questionArea').innerHTML='<div class="empty-quiz"><div class="empty-icon">✦</div><h3>Your next question is waiting.</h3><p>Choose a practice mode above.</p></div>'};document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{let a=b.dataset.action;if(a==='challenge')start('mixed');else if(a==='easier')start('review');else if(a==='another')start('vocabulary');else if(a==='explain'){let q=state.mistakes[0];if(q){$('quizCard').scrollIntoView({behavior:'smooth'});$('questionArea').innerHTML='<div class="feedback"><b>AI Tutor explanation</b><br>Review this recent '+esc(q.skill)+' mistake: '+esc(q.prompt)+'<br><small>Expected answer: '+esc(q.answer)+'</small></div>'}}});$('resetBtn').onclick=()=>{localStorage.removeItem(KEY);location.reload()};update();
})();
