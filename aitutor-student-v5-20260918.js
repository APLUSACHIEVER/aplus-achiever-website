(() => {
'use strict';
const $=id=>document.getElementById(id), A=v=>Array.isArray(v)?v:[], C=v=>String(v??'').trim(), shuffle=a=>[...a].sort(()=>Math.random()-.5);
const R={P3:1,P4:2,P5:3}, KEY='APLUS_AI_TUTOR_STUDENT_V5';
const db={
 p3:typeof APLUS_AI_DB_V1_VOCABULARY_RICH_P3!=='undefined'?A(APLUS_AI_DB_V1_VOCABULARY_RICH_P3):[],
 p45:typeof APLUS_AI_DB_V1_VOCABULARY_RICH_P45!=='undefined'?A(APLUS_AI_DB_V1_VOCABULARY_RICH_P45):[],
 conf:typeof APLUS_AI_DB_V1_VOCABULARY_CONFUSABLES_P3P5_BATCH01!=='undefined'?A(APLUS_AI_DB_V1_VOCABULARY_CONFUSABLES_P3P5_BATCH01):[],
 coll:typeof APLUS_AI_DB_V1_VOCABULARY_COLLOCATIONS_P3P5_BATCH01!=='undefined'?A(APLUS_AI_DB_V1_VOCABULARY_COLLOCATIONS_P3P5_BATCH01):[],
 grammar:typeof APLUS_AI_DB_V1_GRAMMAR_LARGE_P3P5_BATCH01!=='undefined'?A(APLUS_AI_DB_V1_GRAMMAR_LARGE_P3P5_BATCH01):[]
};
let state;try{state=JSON.parse(localStorage.getItem(KEY))}catch(e){};state=state||{version:5,level:'P3',questions:0,correct:0,skills:{},mistakes:[],history:[]};
const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
const rank=r=>{let x=C(r.level).toUpperCase();return x.includes('P3')?1:x.includes('P4')?2:x.includes('P5')?3:2};
const eligible=a=>{let n=R[state.level]||1;return a.filter(r=>Math.abs(rank(r)-n)<=1)};
const esc=x=>C(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function skill(s){return state.skills[s]||{correct:0,total:0,mastery:0,lastWrong:0,streak:0}}
function mark(s,ok){let x=skill(s);x.total++;ok?(x.correct++,x.streak++):(x.lastWrong=Date.now(),x.streak=0);x.mastery=Math.round(x.correct/x.total*100);state.skills[s]=x}
const escRe=s=>C(s).replace(/[.*+?^${}()|[\\]\\]/g,'\\$&');
function findForm(sentence,word){let base=C(word);let candidates=[base,base+'s',base+'ed',base+'ing',base.endsWith('e')?base.slice(0,-1)+'ing':'',base.endsWith('y')?base.slice(0,-1)+'ies':''];for(const f of [...new Set(candidates)].sort((a,b)=>b.length-a.length)){if(!f)continue;let m=C(sentence).match(new RegExp('\\b'+escRe(f)+'\\b','i'));if(m)return m[0]}return null}
function plausibleDistractors(answer,rec,pool){let pos=C(rec.partOfSpeech||rec.wordClass||'').toLowerCase();let same=pool.filter(x=>x!==rec&&C(x.word).toLowerCase()!==C(rec.word).toLowerCase());if(pos)same=same.filter(x=>C(x.partOfSpeech||x.wordClass||'').toLowerCase()===pos).concat(same);let seen=new Set(),out=[];for(const x of same){let w=C(x.word);if(!w||seen.has(w.toLowerCase())||w.toLowerCase()===answer.toLowerCase())continue;seen.add(w.toLowerCase());out.push(w);if(out.length===3)break}return out}
function vocab(){let pool=eligible([...db.p3,...db.p45]),out=[];for(const r of shuffle(pool)){let word=C(r.word),ex=C(A(r.examples)[0]),form=findForm(ex,word);if(!word||!ex||!form)continue;let prompt=ex.replace(new RegExp('\\b'+escRe(form)+'\\b','i'),'_____');let ds=plausibleDistractors(form,r,pool);if(ds.length<3)continue;out.push({id:'v:'+r.id,skill:'Vocabulary',topic:word,prompt,answer:form,options:shuffle([form,...ds]),explain:'The sentence needs “'+form+'”. '+C(r.definition),difficulty:r.difficulty||2,source:r});if(out.length>=30)break}return out}
function confusables(){let out=[];for(const r of shuffle(eligible(db.conf))){let pair=A(r.pair).map(C).filter(Boolean),cues=A(r.cue).map(C).filter(Boolean);for(const cue of cues){let ans=pair.find(w=>new RegExp('\\b'+escRe(w)+'\\b','i').test(cue));if(!ans)continue;let prompt=cue.replace(new RegExp('\\b'+escRe(ans)+'\\b','i'),'_____');if(!prompt.includes('_____'))continue;let other=pair.filter(w=>w!==ans);if(other.length!==1)continue;out.push({id:'c:'+r.id+':'+ans,skill:'Confusables',topic:pair.join(' / '),prompt,answer:ans,options:shuffle([ans,other[0],ans,other[0]]).filter((v,i,a)=>a.indexOf(v)===i),explain:C(r.rule),difficulty:rank(r)});break}}return out.filter(q=>q.options.length===2).map(q=>{let filler=shuffle(['carefully','quickly','usually','today']).find(x=>!q.options.includes(x));return {...q,options:shuffle([...q.options,filler, 'never'])}}).map(q=>({...q,options:q.options.slice(0,4)}))}
const G={
'common nouns':['There are _____ books on the shelf.',['three','a','much','one'],'three'],
'pronouns':['Mum gave the book to _____.',['me','I','my','mine'],'me'],
'determiners':['_____ apples are on the table.',['These','This','That','A'],'These'],
'articles':['She ate _____ orange after lunch.',['an','a','the','some'],'an'],
'subject-verb agreement':['The box of pencils _____ on the table.',['is','are','be','am'],'is'],
'present simple':['Every morning, Amir _____ to school.',['walks','walk','walking','walked'],'walks'],
'present continuous':['Look! The children _____ football.',['are playing','play','played','have played'],'are playing'],
'past simple':['Yesterday, we _____ to the museum.',['went','go','gone','going'],'went'],
'prepositions of time':['The test starts _____ Monday.',['on','at','in','by'],'on'],
'conjunctions':['It was raining, _____ we stayed indoors.',['so','but','because','unless'],'so'],
'past continuous':['I _____ dinner when the phone rang.',['was eating','ate','am eating','have eaten'],'was eating'],
'present perfect':['She has _____ her project already.',['finished','finish','finishing','finishes'],'finished'],
'modal verbs':['You _____ wear your seat belt.',['must','must to','musts','must wearing'],'must'],
'adjectives':['This puzzle is _____ than the last one.',['more difficult','most difficult','difficultest','more difficulter'],'more difficult'],
'adverbs':['The girl sang _____.',['beautifully','beautiful','beauty','beautify'],'beautifully'],
'prepositions':['The cat jumped _____ the box.',['into','at','on','by'],'into'],
'relative clauses':['The boy _____ won the race is my friend.',['who','which','where','what'],'who'],
'reported speech':['He said that he _____ tired.',['was','is','were','be'],'was'],
'conditional sentences':['If it _____, we will stay indoors.',['rains','will rain','rained','raining'],'rains'],
'active and passive voice':['The cake _____ by Mum yesterday.',['was made','was make','made','is making'],'was made'],
'gerunds and infinitives':['I enjoy _____ storybooks.',['reading','to read','read','reads'],'reading'],
'quantifiers':['There is _____ water left.',['a little','a few','many','few'],'a little'],
'possessives':['This is _____ bag.',['Sarah’s','Sarah','Sarahs','Sarahs’'],'Sarah’s'],
'question forms':['Where _____ you going?',['are','is','do','did'],'are'],
'there is and there are':['_____ three apples in the basket.',['There are','There is','There be','There has'],'There are'],
'negative sentences':['She does not _____ coffee.',['drink','drinks','drank','drinking'],'drink'],
'can and cannot':['He can _____ very fast.',['run','runs','running','to run'],'run'],
'frequency adverbs':['She _____ walks to school.',['usually','usual','use','used'],'usually'],
'adjective order':['She wore a _____ dress.',['beautiful red','red beautiful','beautifully red','red beautifully'],'beautiful red'],
'comparative adjectives':['My bag is _____ than yours.',['heavier','heaviest','heavy','more heavy'],'heavier'],
'superlative adjectives':['Ali is the _____ runner in the class.',['fastest','faster','most fast','fast'],'fastest'],
'infinitive of purpose':['I went to the library _____ a book.',['to borrow','for borrow','borrowing','borrowed'],'to borrow'],
'zero conditional':['If you heat ice, it _____.',['melts','will melt','melted','melting'],'melts'],
'reported questions':['He asked where I _____.',['lived','did I live','do I live','am I living'],'lived'],
'unless':['Unless you hurry, you _____ the bus.',['will miss','missed','are miss','will missed'],'will miss'],
'passive':['English _____ in many countries.',['is spoken','is speak','speaks','is speaking'],'is spoken'],
'although':['_____ he was tired, he continued working.',['Although','Despite','Because of','Unless'],'Although'],
'because':['He stayed home _____ he was ill.',['because','despite','although','unless'],'because'],
'parallel structure':['She likes reading, swimming, and _____.',['cycling','to cycle','cycle','cycled'],'cycling'],
'irregular plural nouns':['The farmer has three _____.',['children','childs','child','childes'],'children'],
'possessive nouns':['This is the _____ bicycle.',['girl’s','girls','girls’','girl'],'girl’s'],
'object pronouns':['Dad called Sam and _____.',['me','I','my','mine'],'me'],
'negative sentences':['They did not _____ the answer.',['know','knew','knows','knowing'],'know'],
'countable and uncountable nouns':['We need _____ information before deciding.',['more','many','a few','few'],'more'],
'few and little':['There are _____ students absent today.',['a few','a little','much','little'],'a few'],
'as as':['The new bag is as _____ as the old one.',['heavy','heavier','heaviest','more heavy'],'heavy']
};
function grammar(){let out=[];for(const r of eligible(db.grammar)){let keys=Object.keys(G).filter(k=>(C(r.topic)+' '+C(r.focus)+' '+A(r.skills).join(' ')).toLowerCase().includes(k.toLowerCase()));if(!keys.length)continue;let g=G[keys[0]],q={id:'g:'+r.id,skill:'Grammar',topic:r.topic,prompt:g[0],options:shuffle(g[1]),answer:g[2],explain:C(A(r.rules)[0])||'Choose the form that matches the sentence.',difficulty:r.difficulty||2,source:r};if(!out.some(x=>x.prompt===q.prompt))out.push(q)}return shuffle(out)}
function diagnose(q,ok){if(ok)return 'Correct — keep going.';if(q.skill==='Grammar')return 'Let’s focus on the grammar rule, not just the answer. Read the sentence again and identify the subject, time clue, or word pattern.';if(q.skill==='Confusables')return 'This is a meaning-and-context mistake. Compare what each word means before choosing by sound or spelling.';return 'This is a vocabulary-in-context mistake. Look at the words around the blank and check the meaning of the whole sentence.'}
let session={list:[],i:0,mode:''};
function build(mode){let all=mode==='grammar'?grammar():mode==='review'?review():mode==='mixed'?shuffle([...vocab(),...grammar(),...confusables()]):shuffle([...vocab(),...confusables()]);session={list:all.slice(0,mode==='mixed'?12:10),i:0,mode};render()}
function review(){let ids=new Set(state.mistakes.map(x=>x.baseId));let all=[...vocab(),...grammar(),...confusables()];let exact=all.filter(q=>ids.has(q.id));return shuffle(exact.length?exact:all).slice(0,10)}
function render(){let q=session.list[session.i];if(!q){$('quizLabel').textContent='SESSION COMPLETE';$('questionProgress').textContent='Tutor Brain updated';$('questionArea').innerHTML='<div class="empty-quiz"><div class="empty-icon">✓</div><h3>Good work.</h3><p>Your next session will use your recent answers to adjust practice.</p></div>';update();return}$('quizLabel').textContent=q.skill.toUpperCase();$('questionProgress').textContent='Question '+(session.i+1)+' of '+session.list.length+' · '+state.level;$('questionArea').innerHTML='<div class="question-text">'+esc(q.prompt)+'</div><div class="options">'+q.options.map((o,i)=>'<button class="option-btn" data-v="'+esc(o)+'" type="button"><b>'+String.fromCharCode(65+i)+'.</b> '+esc(o)+'</button>').join('')+'</div><div id="feedbackSlot"></div>';$('questionArea').querySelectorAll('.option-btn').forEach(b=>b.onclick=()=>answer(q,b))}
function answer(q,b){if(b.disabled)return;let ok=C(b.dataset.v).toLowerCase()===C(q.answer).toLowerCase();$('questionArea').querySelectorAll('.option-btn').forEach(x=>{x.disabled=true;if(C(x.dataset.v).toLowerCase()===C(q.answer).toLowerCase())x.classList.add('correct')});if(!ok)b.classList.add('wrong');state.questions++;if(ok)state.correct++;mark(q.skill,ok);if(!ok)state.mistakes=[{baseId:q.id,skill:q.skill,topic:q.topic,answer:q.answer,prompt:q.prompt,at:Date.now()} ,...state.mistakes.filter(x=>x.baseId!==q.id)].slice(0,50);else state.mistakes=state.mistakes.filter(x=>x.baseId!==q.id);state.history.unshift({id:q.id,ok,skill:q.skill,at:Date.now()});save();$('feedbackSlot').innerHTML='<div class="feedback '+(ok?'feedback-good':'feedback-fix')+'"><b>'+(ok?'Correct!':'Not quite.')+'</b><br>'+esc(diagnose(q,ok))+'<br><small>'+esc(q.explain)+'</small></div><div class="feedback-actions"><button class="next-btn" id="nextQuestion" type="button">'+(session.i+1===session.list.length?'Finish':'Next question')+' →</button></div>';$('nextQuestion').onclick=()=>{session.i++;render()};update()}
function update(){ $('statQuestions').textContent=state.questions;$('statAccuracy').textContent=state.questions?Math.round(state.correct/state.questions*100)+'%':'—';let vals=Object.values(state.skills).filter(x=>x.total);$('statMastery').textContent=vals.length?Math.round(vals.reduce((a,x)=>a+x.mastery,0)/vals.length)+'%':'0%';$('statReview').textContent=state.mistakes.length;$('dataStatus').textContent='Tutor Brain V5 ready · '+state.level;$('coachMessage').textContent=state.questions?'I’m adapting to your recent answers.':'Let’s start with a short practice session.';let names=['Vocabulary','Grammar','Confusables'];$('skillsList').innerHTML=names.map(s=>{let x=skill(s);return '<div class="skill-row"><div class="skill-head"><span>'+s+'</span><span>'+x.mastery+'%</span></div><div class="bar"><span style="width:'+x.mastery+'%"></span></div></div>'}).join('');$('reviewList').innerHTML=state.mistakes.length?state.mistakes.slice(0,3).map(x=>'<div class="review-item"><span class="dot"></span><div><b>'+esc(x.skill)+'</b><small>'+esc(x.topic||'Recent mistake')+'</small></div></div>').join(''):'<div class="review-item"><span class="dot"></span><div><b>You are on track.</b><small>No urgent review item yet.</small></div></div>';$('pathList').innerHTML=names.map((s,i)=>'<div class="path-item"><span class="dot"></span><div><b>'+(i+1)+'. '+s+'</b><small>'+(['Build foundations','Strengthen weak areas','Transfer and challenge'][i])+'</small></div></div>').join('')}
document.querySelectorAll('.level-btn').forEach(b=>b.onclick=()=>{state.level=b.dataset.level;save();update()});document.querySelectorAll('.practice-card').forEach(b=>b.onclick=()=>{build(b.dataset.mode);$('quizCard').scrollIntoView({behavior:'smooth',block:'start'})});$('closeQuiz').onclick=()=>{session={list:[],i:0,mode:''};render()};document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{let a=b.dataset.action;if(a==='challenge')build('mixed');else if(a==='easier')build('review');else if(a==='another')build('vocabulary');else if(a==='explain'){let q=state.mistakes[0];if(q){$('quizCard').scrollIntoView({behavior:'smooth'});$('questionArea').innerHTML='<div class="feedback"><b>AI Tutor explanation</b><br>'+esc(diagnose(q,false))+'<br><small>Expected answer: '+esc(q.answer)+'</small></div>'}}});$('resetBtn').onclick=()=>{localStorage.removeItem(KEY);location.reload()};update();
})();