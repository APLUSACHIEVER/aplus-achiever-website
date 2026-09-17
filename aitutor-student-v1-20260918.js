(() => {
  'use strict';
  const KEY = 'APLUS_AI_TUTOR_STUDENT_V1';
  const state = JSON.parse(localStorage.getItem(KEY) || 'null') || {
    level: 'P3', questions: 0, correct: 0, skills: {}, mistakes: [], history: [], lastQuestion: null
  };

  const $ = id => document.getElementById(id);
  const levelMap = { P3: 1, P4: 2, P5: 3 };
  const skillNames = ['Vocabulary','Grammar','Word Meaning','Word Family','Collocation','Confusables','Context Clues'];
  let session = { mode: null, questions: [], index: 0, answered: false };

  function save(){ localStorage.setItem(KEY, JSON.stringify(state)); }
  function arr(v){ return Array.isArray(v) ? v : []; }
  function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
  function shuffle(a){ return [...a].sort(() => Math.random() - .5); }
  function clean(s){ return String(s || '').trim(); }
  function esc(s){ return clean(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  function db(){
    const vocab = [
      ...arr(window.APLUS_AI_DB_V1_VOCABULARY_RICH_P3),
      ...arr(window.APLUS_AI_DB_V1_VOCABULARY_RICH_P45),
      ...arr(window.APLUS_AI_DB_V1_VOCABULARY_WORDFAMILY_P3P5_BATCH01)
    ];
    const conf = arr(window.APLUS_AI_DB_V1_VOCABULARY_CONFUSABLES_P3P5_BATCH01);
    const ctx = arr(window.APLUS_AI_DB_V1_VOCABULARY_CONTEXTCLUES_P3P5_BATCH01);
    const coll = arr(window.APLUS_AI_DB_V1_VOCABULARY_COLLOCATIONS_P3P5_BATCH01);
    const grammar = arr(window.APLUS_AI_DB_V1_GRAMMAR_LARGE_P3P5_BATCH01);
    return {vocab,conf,ctx,coll,grammar};
  }

  function profileLevel(){ return levelMap[state.level] || 1; }
  function recordLevel(rec){
    const x = String(rec.level || '').toUpperCase();
    if(x.includes('P3')) return 1;
    if(x.includes('P4')) return 2;
    if(x.includes('P5')) return 3;
    if(x.includes('3')) return 1;
    if(x.includes('4')) return 2;
    if(x.includes('5')) return 3;
    return 2;
  }
  function eligible(records){
    const p = profileLevel();
    return records.filter(r => { const l=recordLevel(r); return l===p || l===Math.max(1,p-1) || l===Math.min(3,p+1); });
  }

  function skillScore(skill){ return state.skills[skill] || {correct:0,total:0,mastery:0,lastWrong:0}; }
  function updateSkill(skill, ok){
    const s = skillScore(skill); s.total++; if(ok) s.correct++; else s.lastWrong=Date.now();
    s.mastery = Math.round((s.correct/s.total)*100); state.skills[skill]=s;
  }
  function addMistake(q){
    const item = {id:q.id, skill:q.skill, prompt:q.prompt, answer:q.answer, level:state.level, at:Date.now()};
    state.mistakes = [item,...state.mistakes.filter(x=>x.id!==q.id)].slice(0,30);
  }

  function vocabQuestions(){
    const {vocab,conf,ctx,coll}=db(), out=[];
    eligible(vocab).forEach(r=>{
      const word=clean(r.word), def=clean(r.definition); if(!word||!def) return;
      const distractors = shuffle(vocab.filter(x=>clean(x.word)&&clean(x.word).toLowerCase()!==word.toLowerCase()).map(x=>clean(x.word))).slice(0,3);
      if(distractors.length<3) return;
      const examples=arr(r.examples); const ex=clean(examples[0]);
      if(ex && ex.toLowerCase().includes(word.toLowerCase())){
        const prompt=ex.replace(new RegExp('\\b'+word.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')+'\\b','i'),'_____');
        out.push({id:r.id+'-ctx',skill:'Vocabulary',type:'Vocabulary',prompt,options:shuffle([word,...distractors]),answer:word,explain:def});
      } else {
        out.push({id:r.id+'-def',skill:'Word Meaning',type:'Vocabulary',prompt:'Which word best matches this meaning? “'+def+'”',options:shuffle([word,...distractors]),answer:word,explain:'Meaning: '+def});
      }
    });
    eligible(ctx).forEach(r=>{ const target=clean(r.target), clues=arr(r.clues); if(!target||!clues.length)return; const clue=clean(clues[0]); const pool=eligible(vocab).map(x=>clean(x.word)).filter(w=>w&&w.toLowerCase()!==target.toLowerCase()); const opts=shuffle([target,...pool]).slice(0,4); if(opts.length===4) out.push({id:r.id,skill:'Context Clues',type:'Context Clue',prompt:clue,options:opts,answer:target,explain:clean(r.inference)||'Use the clues around the word to infer its meaning.'}); });
    eligible(conf).forEach(r=>{ const pair=arr(r.pair); if(pair.length<2)return; const answer=clean(pair[0]); const sentence=clean(r.cue||r.template); if(!answer||!sentence)return; out.push({id:r.id,skill:'Confusables',type:'Confusable',prompt:sentence,options:shuffle(pair),answer,explain:clean(r.rule)||'Check the meaning and spelling carefully.'}); });
    eligible(coll).forEach(r=>{ const phrase=clean(r.collocation||r.phrase||r.pattern); if(!phrase)return; const parts=phrase.split(/\s+/); if(parts.length<2)return; const answer=parts[parts.length-1]; const prompt=parts.slice(0,-1).join(' ')+' _____.'; const pool=shuffle(vocab.map(x=>clean(x.word)).filter(w=>w&&w.toLowerCase()!==answer.toLowerCase())).slice(0,3); if(pool.length===3) out.push({id:r.id,skill:'Collocation',type:'Collocation',prompt,options:shuffle([answer,...pool]),answer,explain:'Common word combination: '+phrase}); });
    return out;
  }

  function grammarQuestions(){
    const {grammar}=db(), out=[];
    eligible(grammar).forEach(r=>{
      const topic=clean(r.topic), focus=clean(r.focus), rules=arr(r.rules); if(!topic)return;
      let prompt='', options=[], answer='';
      const templates=arr(r.templates);
      if(templates.length){
        const t=clean(templates[0]);
        const m=t.match(/\[([^\]]+)\]/g);
        if(m && m.length){ answer=clean(m[0].slice(1,-1)); prompt=t.replace(m[0],'_____'); const choices=[answer]; arr(r.commonMistakes).slice(0,5).forEach(x=>{const w=clean(x).split(' ')[0]; if(w&&!choices.includes(w))choices.push(w)}); options=shuffle(choices).slice(0,4); }
      }
      if(!prompt || options.length<2){
        const examples=templates.length?templates:[topic+' — choose the correct form.'];
        prompt=clean(examples[0]).replace(/\[[^\]]+\]/,'_____');
        const fallback=['is','are','was','were']; answer=focus.toLowerCase().includes('singular')?'is':focus.toLowerCase().includes('plural')?'are':pick(fallback); options=shuffle([answer,...fallback.filter(x=>x!==answer)]).slice(0,4);
      }
      if(options.length===4) out.push({id:r.id,skill:'Grammar',type:'Grammar',prompt,options,answer,explain:(rules[0]||focus||topic)});
    });
    return out;
  }

  function buildSession(mode){
    const v=vocabQuestions(), g=grammarQuestions();
    let pool = mode==='grammar'?g:mode==='review'?buildReview():mode==='mixed'?shuffle([...v,...g]):v;
    if(!pool.length) pool=shuffle([...v,...g]);
    const weak = skillNames.slice().sort((a,b)=>skillScore(a).mastery-skillScore(b).mastery);
    pool.sort((a,b)=> (weak.indexOf(a.skill)-weak.indexOf(b.skill)) + Math.random()-.5);
    session={mode,questions:shuffle(pool).slice(0,10),index:0,answered:false};
    renderQuestion();
  }
  function buildReview(){
    const all=[...vocabQuestions(),...grammarQuestions()];
    const ids=new Set(state.mistakes.map(m=>m.id));
    const review=all.filter(q=>ids.has(q.id)||skillScore(q.skill).mastery<60);
    return review.length?review:all;
  }

  function renderQuestion(){
    const q=session.questions[session.index];
    if(!q){
      $('questionArea').innerHTML='<div class="empty-quiz"><div class="empty-icon">✓</div><h3>Nice work!</h3><p>Your session is complete. Your Tutor Brain has updated your learning profile.</p></div>';
      $('quizLabel').textContent='SESSION COMPLETE'; $('questionProgress').textContent='Choose another practice to continue'; updateUI(); return;
    }
    session.answered=false; state.lastQuestion=q;
    $('quizLabel').textContent=q.type.toUpperCase(); $('questionProgress').textContent='Question '+(session.index+1)+' of '+session.questions.length+' · '+state.level;
    $('questionArea').innerHTML='<div class="question-text">'+esc(q.prompt)+'</div><div class="options">'+q.options.map((o,i)=>'<button class="option-btn" data-answer="'+esc(o)+'" type="button"><b>'+String.fromCharCode(65+i)+'.</b> '+esc(o)+'</button>').join('')+'</div><div id="feedbackSlot"></div>';
    document.querySelectorAll('.option-btn').forEach(b=>b.addEventListener('click',()=>answerQuestion(b.getAttribute('data-answer'),b)));
  }

  function answerQuestion(value,btn){
    if(session.answered)return; session.answered=true;
    const q=session.questions[session.index], ok=value.toLowerCase()===q.answer.toLowerCase();
    document.querySelectorAll('.option-btn').forEach(b=>{ if(b.getAttribute('data-answer').toLowerCase()===q.answer.toLowerCase()) b.classList.add('correct'); });
    if(!ok)btn.classList.add('wrong');
    state.questions++; if(ok)state.correct++; updateSkill(q.skill,ok); if(!ok)addMistake(q); else state.mistakes=state.mistakes.filter(x=>x.id!==q.id);
    state.history.unshift({id:q.id,skill:q.skill,ok,at:Date.now()}); state.history=state.history.slice(0,100); save();
    const title=ok?'Correct!':'Let’s fix this one.';
    $('feedbackSlot').innerHTML='<div class="feedback"><b>'+title+'</b><br>'+esc(q.explain)+(ok?'':'<br><small>Try a similar question again later. Your Tutor Brain will use this result to choose your next practice.</small>')+'</div><button class="next-btn" id="nextQuestion" type="button">'+(session.index+1===session.questions.length?'Finish':'Next question')+' →</button>';
    $('nextQuestion').onclick=()=>{session.index++;renderQuestion();}; updateUI();
  }

  function renderSkills(){
    const html=skillNames.map(s=>{const x=skillScore(s);return '<div class="skill-row"><div class="skill-head"><span>'+s+'</span><span>'+x.mastery+'%</span></div><div class="bar"><span style="width:'+x.mastery+'%"></span></div></div>';}).join(''); $('skillsList').innerHTML=html;
  }
  function renderReview(){
    const weak=skillNames.map(s=>({s,m:skillScore(s).mastery})).filter(x=>x.m<60).sort((a,b)=>a.m-b.m).slice(0,3);
    const items=weak.map(x=>'<div class="review-item"><span class="dot"></span><div><b>'+x.s+'</b><small>'+x.m+'% mastery · needs more practice</small></div></div>');
    if(!items.length && !state.mistakes.length) items.push('<div class="review-item"><span class="dot"></span><div><b>You are on track.</b><small>No urgent review items yet.</small></div></div>');
    $('reviewList').innerHTML=items.join('');
  }
  function renderPath(){
    const weak=skillNames.slice().sort((a,b)=>skillScore(a).mastery-skillScore(b).mastery).slice(0,3);
    $('pathList').innerHTML=weak.map((s,i)=>'<div class="path-item"><span class="dot"></span><div><b>'+(i+1)+'. '+s+'</b><small>'+ (skillScore(s).mastery<40?'Recovery practice':skillScore(s).mastery<70?'Build accuracy':'Stretch with transfer')+'</small></div></div>').join('');
  }
  function updateUI(){
    $('statQuestions').textContent=state.questions; $('statAccuracy').textContent=state.questions?Math.round(state.correct/state.questions*100)+'%':'—';
    const vals=skillNames.map(s=>skillScore(s).mastery).filter(x=>x>0); $('statMastery').textContent=vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length)+'%':'0%'; $('statReview').textContent=state.mistakes.length;
    renderSkills();renderReview();renderPath();
    $('dataStatus').textContent='Tutor Brain ready · '+state.level;
    $('coachMessage').textContent=state.questions?'I’m adapting to your recent answers.':'Let’s start with a short practice session.';
  }

  document.querySelectorAll('.level-btn').forEach(b=>b.addEventListener('click',()=>{state.level=b.dataset.level;document.querySelectorAll('.level-btn').forEach(x=>x.classList.toggle('active',x===b));save();updateUI();}));
  document.querySelectorAll('.practice-card').forEach(b=>b.addEventListener('click',()=>{ $('quizCard').scrollIntoView({behavior:'smooth',block:'start'});buildSession(b.dataset.mode); }));
  $('closeQuiz').addEventListener('click',()=>{ $('questionArea').innerHTML='<div class="empty-quiz"><div class="empty-icon">✦</div><h3>Your next question is waiting.</h3><p>Choose a practice mode above.</p></div>'; });
  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{
    const action=b.dataset.action;
    if(action==='easier')buildSession('review'); else if(action==='challenge')buildSession('mixed'); else if(action==='another')buildSession('vocabulary'); else if(action==='explain'){
      const q=state.lastQuestion; $('quizCard').scrollIntoView({behavior:'smooth'}); if(q){ $('questionArea').innerHTML='<div class="feedback"><b>AI Tutor explanation</b><br>'+esc(q.explain||'Review the rule and look at the context carefully.')+'</div>'; }
    }
  }));
  $('resetBtn').addEventListener('click',()=>{if(confirm('Reset this browser profile and all local learning progress?')){localStorage.removeItem(KEY);location.reload();}});
  updateUI();
})();
