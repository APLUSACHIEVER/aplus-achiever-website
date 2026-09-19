(() => {
  'use strict';

  const KEY = 'APLUS_AI_TUTOR_STUDENT_V2';
  const oldKey = 'APLUS_AI_TUTOR_STUDENT_V1';
  const $ = id => document.getElementById(id);
  const arr = v => Array.isArray(v) ? v : [];
  const clean = v => String(v ?? '').trim();
  const esc = v => clean(v).replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const shuffle = a => [...a].sort(() => Math.random() - 0.5);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const levelRank = { P3: 1, P4: 2, P5: 3 };
  const skillNames = ['Vocabulary','Grammar','Word Meaning','Word Family','Collocation','Confusables','Context Clues'];

  let state = loadState();
  let session = { mode:null, questions:[], index:0, answered:false };

  function loadState(){
    try {
      const v2 = JSON.parse(localStorage.getItem(KEY) || 'null');
      if(v2) return v2;
      const v1 = JSON.parse(localStorage.getItem(oldKey) || 'null');
      if(v1) return { ...v1, version:2, profile: v1.profile || {confidence:50} };
    } catch(e) {}
    return { version:2, level:'P3', questions:0, correct:0, skills:{}, mistakes:[], history:[], lastQuestion:null, profile:{confidence:50} };
  }
  function save(){ localStorage.setItem(KEY, JSON.stringify(state)); }

  function db(){
    return {
      p3: arr(window.APLUS_AI_DB_V1_VOCABULARY_RICH_P3),
      p45: arr(window.APLUS_AI_DB_V1_VOCABULARY_RICH_P45),
      family: arr(window.APLUS_AI_DB_V1_VOCABULARY_WORDFAMILY_P3P5_BATCH01),
      conf: arr(window.APLUS_AI_DB_V1_VOCABULARY_CONFUSABLES_P3P5_BATCH01),
      ctx: arr(window.APLUS_AI_DB_V1_VOCABULARY_CONTEXTCLUES_P3P5_BATCH01),
      coll: arr(window.APLUS_AI_DB_V1_VOCABULARY_COLLOCATIONS_P3P5_BATCH01),
      dna: arr(window.APLUS_AI_DB_V1_VOCABULARY_QUESTION_DNA_BATCH01),
      grammar: arr(window.APLUS_AI_DB_V1_GRAMMAR_LARGE_P3P5_BATCH01),
      legacy: arr(window.APLUS_VOCABULARY || window.vocabularyData || window.VOCABULARY_DATA)
    };
  }

  function recRank(r){
    const l = clean(r.level).toUpperCase();
    if(l.includes('P3')) return 1;
    if(l.includes('P4')) return 2;
    if(l.includes('P5')) return 3;
    const n = parseInt(l.match(/[1-5]/)?.[0] || '', 10);
    return Number.isFinite(n) ? n : 2;
  }

  function eligible(records){
    const p = levelRank[state.level] || 1;
    return records.filter(r => {
      const rnk = recRank(r);
      return rnk >= Math.max(1,p-1) && rnk <= Math.min(3,p+1);
    });
  }

  function skillState(skill){
    return state.skills[skill] || {correct:0,total:0,mastery:0,lastWrong:0,lastSeen:0,streak:0};
  }
  function updateSkill(skill, ok){
    const s = skillState(skill);
    s.total += 1;
    s.lastSeen = Date.now();
    if(ok){ s.correct += 1; s.streak += 1; }
    else { s.lastWrong = Date.now(); s.streak = 0; }
    s.mastery = Math.round((s.correct / Math.max(1,s.total)) * 100);
    state.skills[skill] = s;
  }
  function addMistake(q){
    const old = state.mistakes.find(x => x.id === q.id);
    const item = { id:q.id, skill:q.skill, answer:q.answer, prompt:q.prompt, level:state.level, at:Date.now(), count:(old?.count || 0)+1, misconception:q.misconception || '' };
    state.mistakes = [item, ...state.mistakes.filter(x => x.id !== q.id)].slice(0,40);
  }
  function clearMistake(id){ state.mistakes = state.mistakes.filter(x => x.id !== id); }

  function targetLevelFor(skill){
    const m = skillState(skill).mastery;
    const base = levelRank[state.level] || 1;
    if(m < 40) return Math.max(1,base-1);
    if(m >= 85) return Math.min(3,base+1);
    return base;
  }

  function chooseWords(records, answer, n=3){
    const seen = new Set([clean(answer).toLowerCase()]);
    const candidates = shuffle(records.map(r => clean(r.word)).filter(Boolean)).filter(w => !seen.has(w.toLowerCase()));
    const out=[];
    for(const w of candidates){ if(!seen.has(w.toLowerCase())){out.push(w);seen.add(w.toLowerCase());} if(out.length===n)break; }
    return out;
  }

  // P3–P5 Vocabulary Quality Gate: only complete-sentence questions are allowed.
  function isCompleteVocabSentence(text){
    const t=clean(text).replace(/\s+/g,' ');
    if(!t || !/_{3,}/.test(t)) return false;
    if(!/^[A-Z]/.test(t)) return false;
    if(!/[.!?]$/.test(t)) return false;
    const words=t.replace(/_{3,}/g,' blank ').split(/\s+/).filter(Boolean);
    if(words.length<6) return false;
    if(/^Which\s+(word|sentence|option)\b/i.test(t)) return false;
    if(/^What\s+/i.test(t) || /^Choose\s+/i.test(t)) return false;
    return true;
  }

  function sentenceBlank(text, word){
    const src=clean(text), w=clean(word);
    if(!src || !w) return '';
    const escaped=w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    return src.replace(new RegExp('\\b'+escaped+'\\b','i'),'_____');
  }

  function makeVocabQuestions(){
    const {p3,p45,conf,ctx} = db();
    const core = eligible([...p3,...p45]);
    const out=[];

    // Core vocabulary: ONLY records with a real, complete example sentence.
    for(const r of shuffle(core)){
      const word=clean(r.word), def=clean(r.definition);
      if(!word || !def) continue;
      const examples=arr(r.examples).map(clean).filter(Boolean);
      const ex=examples.find(x=>isCompleteVocabSentence(sentenceBlank(x,word)));
      if(!ex) continue;
      const prompt=sentenceBlank(ex,word);
      if(!isCompleteVocabSentence(prompt)) continue;
      const distractors=chooseWords(core,word,3);
      if(distractors.length<3) continue;
      out.push({id:r.id+'-meaning-context-v4',skill:'Vocabulary',type:'Vocabulary in Context',prompt,options:shuffle([word,...distractors]),answer:word,explain:'The sentence context supports “'+word+'”. '+def,source:r.id,level:r.level,questionStyle:'complete-sentence'});
      if(out.length>=35) break;
    }

    // Context clues: retain only complete sentences with a real blank.
    for(const r of eligible(ctx)){
      const target=clean(r.target), clue=clean(arr(r.clues)[0]);
      if(!target||!clue) continue;
      const prompt=sentenceBlank(clue,target);
      if(!isCompleteVocabSentence(prompt)) continue;
      const words=chooseWords(core,target,3);
      if(words.length===3) out.push({id:r.id+'-context-v4',skill:'Context Clues',type:'Context Clue',prompt,options:shuffle([target,...words]),answer:target,explain:clean(r.inference)||'Use the surrounding clues to infer the meaning.',source:r.id,level:r.level,questionStyle:'complete-sentence'});
    }

    // Confusable words: complete-sentence context only.
    for(const r of eligible(conf)){
      const pair=arr(r.pair).map(clean).filter(Boolean);
      if(pair.length<2) continue;
      const rule=clean(r.rule), cues=arr(r.cue).map(clean).filter(Boolean);
      let prompt='', answer='';
      for(const target of shuffle(pair.slice(0,2))){
        const cue=cues.find(x=>x.toLowerCase().includes(target.toLowerCase()));
        if(cue){ prompt=sentenceBlank(cue,target); answer=target; break; }
      }
      if(!answer || !isCompleteVocabSentence(prompt)) continue;
      const forms=[];
      const addForm=w=>{w=clean(w);if(w&&!forms.some(x=>x.toLowerCase()===w.toLowerCase()))forms.push(w);};
      pair.slice(0,2).forEach(addForm);
      if(/ed$/i.test(answer)){addForm(answer.replace(/ed$/i,''));addForm(answer.replace(/ed$/i,'ing'));}
      else if(/ing$/i.test(answer)){addForm(answer.replace(/ing$/i,''));addForm(answer.replace(/ing$/i,'ed'));}
      else if(/s$/i.test(answer)&&!/ss$/i.test(answer)){addForm(answer.replace(/s$/i,''));}
      else {addForm(answer+'s');addForm(answer+'ed');}
      for(const x of shuffle(eligible(conf))){
        for(const w of arr(x.pair).map(clean)){if(forms.length>=4)break;addForm(w);}
        if(forms.length>=4)break;
      }
      const options=shuffle(forms.slice(0,4));
      if(options.length<4 || !options.some(x=>x.toLowerCase()===answer.toLowerCase())) continue;
      out.push({id:r.id+'-confusable-context-v4',skill:'Confusables',type:'Confusable Words',prompt,options,answer,explain:rule||'Use the meaning and grammatical role of the word in the sentence.',source:r.id,misconception:clean(r.mistake)||'confusable-pair',level:r.level,questionStyle:'complete-sentence',commonMistake:clean(r.mistake)});
    }

    // Definition-only, fragment-style collocation and word-family prompts are excluded
    // until they have a verified complete-sentence form.
    return out;
  }
  const grammarPatterns = [
    {test:/subject-verb agreement|indefinite pronouns|there is and there are/i, make:()=>({prompt:'Which sentence is correct?',options:['The box of pencils is on the table.','The box of pencils are on the table.','The box of pencils be on the table.','The box of pencils am on the table.'],answer:'The box of pencils is on the table.',explain:'The subject is “box”, which is singular.'})},
    {test:/present simple/i, make:()=>({prompt:'Every morning, Maya _____ to school at seven.',options:['walk','walks','walking','walked'],answer:'walks',explain:'For a singular third-person subject in the present simple, use the -s form.'})},
    {test:/present continuous/i, make:()=>({prompt:'Look! The children _____ football in the field.',options:['play','played','are playing','have played'],answer:'are playing',explain:'An action happening now uses am/is/are + -ing.'})},
    {test:/past simple negatives/i, make:()=>({prompt:'Ben did not _____ his homework last night.',options:['finish','finished','finishes','finishing'],answer:'finish',explain:'After did not, use the base form of the verb.'})},
    {test:/past simple questions/i, make:()=>({prompt:'_____ you see the rainbow yesterday?',options:['Did','Do','Were','Have'],answer:'Did',explain:'Use did to form most simple past questions.'})},
    {test:/past simple irregular/i, make:()=>({prompt:'Yesterday, we _____ to the museum.',options:['go','went','gone','going'],answer:'went',explain:'“Go” has the irregular past form “went”.'})},
    {test:/present perfect/i, make:()=>({prompt:'She has _____ her project already.',options:['finish','finished','finishing','finishes'],answer:'finished',explain:'Present perfect uses has/have + past participle.'})},
    {test:/modal should/i, make:()=>({prompt:'You _____ drink more water when you are thirsty.',options:['should','should to','shoulds','should drinking'],answer:'should',explain:'Use should + base verb.'})},
    {test:/modal must|modal verbs/i, make:()=>({prompt:'Students _____ wear their school uniform on Monday.',options:['must','must to','musts','must wearing'],answer:'must',explain:'Must is followed by the base verb.'})},
    {test:/may and might/i, make:()=>({prompt:'It _____ rain later, so bring an umbrella.',options:['might','might to','might rains','mights'],answer:'might',explain:'Might expresses possibility and is followed by the base verb.'})},
    {test:/countable and uncountable|countability/i, make:()=>({prompt:'Which sentence is correct?',options:['We need some information.','We need many informations.','We need an informations.','We need two information.'],answer:'We need some information.',explain:'Information is normally uncountable in this meaning.'})},
    {test:/few and little/i, make:()=>({prompt:'There is _____ water left in the bottle.',options:['a little','a few','many','few'],answer:'a little',explain:'Use a little with an uncountable noun such as water.'})},
    {test:/each and every/i, make:()=>({prompt:'Every student _____ a notebook.',options:['has','have','having','are having'],answer:'has',explain:'Every takes a singular countable noun and singular verb.'})},
    {test:/comparative adjectives|comparatives with than/i, make:()=>({prompt:'This puzzle is _____ than the last one.',options:['more difficult','most difficult','difficultest','more difficulter'],answer:'more difficult',explain:'Use the comparative form to compare two things.'})},
    {test:/superlative adjectives/i, make:()=>({prompt:'Ali is the _____ runner in the class.',options:['fastest','faster','most fast','fast'],answer:'fastest',explain:'A superlative compares one member with a group.'})},
    {test:/as...as/i, make:()=>({prompt:'The blue bag is as _____ as the red bag.',options:['heavy','heavier','heaviest','more heavy'],answer:'heavy',explain:'Use as + adjective + as for equal comparison.'})},
    {test:/adverb formation|adjective versus adverb/i, make:()=>({prompt:'The girl sang _____ at the concert.',options:['beautifully','beautiful','beauty','beautify'],answer:'beautifully',explain:'An adverb is used to describe how an action is performed.'})},
    {test:/linking verbs/i, make:()=>({prompt:'The soup tastes _____.',options:['delicious','deliciously','deliciousness','deliciously enough'],answer:'delicious',explain:'A linking verb such as tastes can be followed by an adjective describing the subject.'})},
    {test:/infinitive of purpose/i, make:()=>({prompt:'I went to the library _____ a book.',options:['to borrow','for borrow','borrowing','borrowed'],answer:'to borrow',explain:'Use to + base verb to express purpose.'})},
    {test:/verb plus gerund/i, make:()=>({prompt:'I enjoy _____ storybooks.',options:['reading','to read','read','reads'],answer:'reading',explain:'Enjoy is followed by an -ing form.'})},
    {test:/verb plus infinitive/i, make:()=>({prompt:'She decided _____ early.',options:['to leave','leaving','leave','left'],answer:'to leave',explain:'Decide is followed by to + base verb.'})},
    {test:/relative pronouns|relative clauses/i, make:()=>({prompt:'The boy _____ won the race is my friend.',options:['who','which','where','what'],answer:'who',explain:'Use who for a person in this relative clause.'})},
    {test:/reported questions|noun clauses with question words/i, make:()=>({prompt:'He asked where I _____.',options:['lived','did I live','do I live','am I living'],answer:'lived',explain:'Reported questions use statement word order.'})},
    {test:/reported statements/i, make:()=>({prompt:'Mum told me _____ quiet.',options:['to be','be','being','that be'],answer:'to be',explain:'Tell + object + to-infinitive is a common reporting pattern.'})},
    {test:/first conditional/i, make:()=>({prompt:'If it _____, we will stay indoors.',options:['rains','will rain','rained','raining'],answer:'rains',explain:'The first conditional normally uses present simple after if.'})},
    {test:/unless/i, make:()=>({prompt:'Unless you hurry, you _____ the bus.',options:['will miss','missed','are miss','will missed'],answer:'will miss',explain:'Unless means “if not”; use the suitable future result form.'})},
    {test:/zero conditional/i, make:()=>({prompt:'If you heat ice, it _____.',options:['melts','will melt','melted','melting'],answer:'melts',explain:'General truths use present simple in both clauses.'})},
    {test:/passive present simple/i, make:()=>({prompt:'English _____ in many countries.',options:['is spoken','is speak','speaks','is speaking'],answer:'is spoken',explain:'Present simple passive uses is/am/are + past participle.'})},
    {test:/passive past simple/i, make:()=>({prompt:'The window _____ yesterday.',options:['was broken','was break','broke','is broken'],answer:'was broken',explain:'Past simple passive uses was/were + past participle.'})},
    {test:/passive with modal/i, make:()=>({prompt:'The work must _____ today.',options:['be completed','completed','be complete','is completed'],answer:'be completed',explain:'Modal passive uses modal + be + past participle.'})},
    {test:/contrast connectors/i, make:()=>({prompt:'_____ he was tired, he continued working.',options:['Although','Despite','Because of','Unless'],answer:'Although',explain:'Although is followed by a clause.'})},
    {test:/reason connectors/i, make:()=>({prompt:'He stayed home _____ he was ill.',options:['because','despite','although','unless'],answer:'because',explain:'Because introduces a reason clause.'})},
    {test:/result connectors/i, make:()=>({prompt:'It was raining, _____ we stayed indoors.',options:['so','although','unless','because of'],answer:'so',explain:'So introduces the result.'})},
    {test:/sentence structure/i, make:()=>({prompt:'Which sentence is complete and correctly joined?',options:['Because he was tired, he went home.','Because he was tired.','He went home because.','He tired went home because.'],answer:'Because he was tired, he went home.',explain:'The sentence contains a complete main clause and a correctly attached reason clause.'})},
    {test:/parallel structure/i, make:()=>({prompt:'She likes reading, swimming, and _____.',options:['cycling','to cycle','cycle','cycled'],answer:'cycling',explain:'The three items should use matching grammatical forms.'})},
    {test:/question forms/i, make:()=>({prompt:'Where _____ you going?',options:['are','is','do','did'],answer:'are',explain:'Use are with you in the present continuous question.'})}
  ];

  function grammarQuestion(r){
    const topic=clean(r.topic)+' '+clean(r.focus)+' '+arr(r.skills).join(' ');
    const pattern=grammarPatterns.find(x=>x.test.test(topic));
    if(pattern){ const q=pattern.make(); return {...q,id:r.id+'-grammar',skill:'Grammar',type:'Grammar',source:r.id,topic:r.topic,misconception:arr(r.commonMistakes)[0]||''}; }
    return {id:r.id+'-grammar',skill:'Grammar',type:'Grammar',prompt:'Which statement best matches this grammar rule? “'+clean(arr(r.rules)[0]||r.focus||r.topic)+'”',options:['The rule should be applied accurately in context.','The rule can always be ignored.','The rule changes every time.','The rule has no effect on sentence meaning.'],answer:'The rule should be applied accurately in context.',explain:clean(arr(r.rules)[0]||r.focus||r.topic),source:r.id,topic:r.topic,misconception:arr(r.commonMistakes)[0]||''};
  }

  function makeGrammarQuestions(){
    return shuffle(eligible(db().grammar)).map(grammarQuestion);
  }

  function buildReview(){
    const all=[...makeVocabQuestions(),...makeGrammarQuestions()];
    const ids=new Set(state.mistakes.map(x=>x.id));
    const weak=new Set(skillNames.filter(s=>skillState(s).mastery<65));
    const review=all.filter(q=>ids.has(q.id)||weak.has(q.skill));
    return review.length?review:all;
  }

  function adaptiveSort(pool){
    const recent=new Set(state.history.slice(0,12).map(x=>x.id));
    return pool.map(q=>{
      const s=skillState(q.skill), target=targetLevelFor(q.skill);
      let score=0;
      if(s.mastery<50) score+=30;
      if(s.lastWrong) score+=15;
      if(state.mistakes.some(m=>m.id===q.id)) score+=35;
      if(recRank(q)===target) score+=10;
      if(!recent.has(q.id)) score+=8;
      score+=Math.random()*12;
      return {q,score};
    }).sort((a,b)=>b.score-a.score).map(x=>x.q);
  }

  function buildSession(mode){
    let v=makeVocabQuestions(), g=makeGrammarQuestions();
    let pool = mode==='grammar' ? g : mode==='review' ? buildReview() : mode==='mixed' ? [...v,...g] : v;
    pool=adaptiveSort(pool);
    const size=mode==='mixed'?12:mode==='micro2'?8:mode==='micro3'?12:10;
    session={mode,questions:pool.slice(0,size),index:0,answered:false};
    if(!session.questions.length) session.questions=[...v,...g].slice(0,10);
    renderQuestion();
  }

  function renderQuestion(){
    const q=session.questions[session.index];
    if(!q){
      $('quizLabel').textContent='SESSION COMPLETE';
      $('questionProgress').textContent='Your Tutor Brain has updated your learning profile.';
      $('questionArea').innerHTML='<div class="empty-quiz"><div class="empty-icon">✓</div><h3>Good work.</h3><p>Your next practice will adapt to what you found easy and difficult.</p></div>';
      updateUI(); return;
    }
    session.answered=false; state.lastQuestion=q; save();
    $('quizLabel').textContent=clean(q.type).toUpperCase();
    $('questionProgress').textContent='Question '+(session.index+1)+' of '+session.questions.length+' · '+state.level;
    $('questionArea').innerHTML='<div class="question-text">'+esc(q.prompt)+'</div><div class="options">'+q.options.map((o,i)=>'<button class="option-btn" data-answer="'+esc(o)+'" type="button"><b>'+String.fromCharCode(65+i)+'.</b> '+esc(o)+'</button>').join('')+'</div><div id="feedbackSlot"></div>';
    document.querySelectorAll('.option-btn').forEach(btn=>btn.addEventListener('click',()=>answerQuestion(btn.getAttribute('data-answer'),btn)));
  }

  function answerQuestion(value,btn){
    if(session.answered)return;
    session.answered=true;
    const q=session.questions[session.index];
    const ok=clean(value).toLowerCase()===clean(q.answer).toLowerCase();
    document.querySelectorAll('.option-btn').forEach(b=>{ if(clean(b.getAttribute('data-answer')).toLowerCase()===clean(q.answer).toLowerCase()) b.classList.add('correct'); });
    if(!ok)btn.classList.add('wrong');
    state.questions++; if(ok)state.correct++;
    updateSkill(q.skill,ok);
    if(ok) clearMistake(q.id); else addMistake(q);
    state.profile.confidence=Math.max(0,Math.min(100,state.profile.confidence+(ok?2:-3)));
    state.history.unshift({id:q.id,skill:q.skill,ok,at:Date.now(),level:state.level});
    state.history=state.history.slice(0,120);
    save();

    const diagnosis = ok ? 'Keep going — this skill is becoming more secure.' : diagnose(q);
    $('feedbackSlot').innerHTML='<div class="feedback '+(ok?'feedback-good':'feedback-fix')+'"><b>'+(ok?'Correct!':'Let’s fix this one.')+'</b><br>'+esc(q.explain||'Review the rule and use the context carefully.')+'<br><small>'+esc(diagnosis)+'</small></div><div class="feedback-actions">'+(!ok?'<button class="mini-btn" id="recoveryBtn" type="button">Try a recovery question</button>':'')+'<button class="next-btn" id="nextQuestion" type="button">'+(session.index+1===session.questions.length?'Finish':'Next question')+' →</button></div>';
    if($('recoveryBtn')) $('recoveryBtn').onclick=()=>recovery(q);
    $('nextQuestion').onclick=()=>{session.index++;renderQuestion();};
    updateUI();
  }

  function diagnose(q){
    if(q.misconception) return 'Possible learning signal: '+q.misconception;
    if(q.skill==='Confusables') return 'Check the exact meaning of each word before choosing.';
    if(q.skill==='Word Family') return 'Check the word form required by the sentence.';
    if(q.skill==='Grammar') return 'The Tutor Brain will use this result to revisit the grammar skill.';
    return 'This item has been added to Smart Review.';
  }

  function recovery(q){
    const pool = q.skill==='Grammar'?makeGrammarQuestions():makeVocabQuestions();
    const same=pool.filter(x=>x.skill===q.skill && x.id!==q.id);
    if(!same.length)return;
    session.questions=[...session.questions.slice(0,session.index+1),pick(same),...session.questions.slice(session.index+1)];
    session.index++; renderQuestion();
  }

  function renderSkills(){
    $('skillsList').innerHTML=skillNames.map(s=>{const x=skillState(s);return '<div class="skill-row"><div class="skill-head"><span>'+esc(s)+'</span><span>'+x.mastery+'%</span></div><div class="bar"><span style="width:'+x.mastery+'%"></span></div></div>';}).join('');
  }
  function renderReview(){
    const items=[];
    state.mistakes.slice(0,3).forEach(m=>items.push('<div class="review-item"><span class="dot"></span><div><b>'+esc(m.skill)+'</b><small>Recent mistake · '+esc(m.level)+'</small></div></div>'));
    skillNames.map(s=>({s,m:skillState(s).mastery})).filter(x=>x.m>0&&x.m<60).sort((a,b)=>a.m-b.m).slice(0,3-items.length).forEach(x=>items.push('<div class="review-item"><span class="dot"></span><div><b>'+esc(x.s)+'</b><small>'+x.m+'% mastery · needs practice</small></div></div>'));
    if(!items.length)items.push('<div class="review-item"><span class="dot"></span><div><b>You are on track.</b><small>No urgent review item yet.</small></div></div>');
    $('reviewList').innerHTML=items.join('');
  }
  function renderPath(){
    const weak=skillNames.slice().sort((a,b)=>skillState(a).mastery-skillState(b).mastery).slice(0,3);
    $('pathList').innerHTML=weak.map((s,i)=>{const m=skillState(s).mastery;return '<div class="path-item"><span class="dot"></span><div><b>'+(i+1)+'. '+esc(s)+'</b><small>'+(m<40?'Recovery → build foundations':m<70?'Build accuracy → review again':'Transfer → stretch challenge')+'</small></div></div>';}).join('');
  }
  function updateUI(){
    $('statQuestions').textContent=state.questions;
    $('statAccuracy').textContent=state.questions?Math.round(state.correct/state.questions*100)+'%':'—';
    const vals=skillNames.map(s=>skillState(s).mastery).filter(x=>x>0);
    $('statMastery').textContent=vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length)+'%':'0%';
    $('statReview').textContent=state.mistakes.length;
    $('dataStatus').textContent='Tutor Brain ready · '+state.level;
    const coachMessage=$('coachMessage');
    if(coachMessage) coachMessage.textContent=state.questions?'I’m adapting to your recent answers.':'Let’s start with a short practice session.';
    renderSkills();renderReview();renderPath();
    document.querySelectorAll('.level-btn').forEach(b=>b.classList.toggle('active',b.dataset.level===state.level));
  }

  document.querySelectorAll('.level-btn').forEach(b=>b.addEventListener('click',()=>{state.level=b.dataset.level;save();updateUI();}));
  document.querySelectorAll('.practice-card, .micro-practice-btn').forEach(b=>b.addEventListener('click',()=>{$('quizCard').scrollIntoView({behavior:'smooth',block:'start'});buildSession(b.dataset.mode);}));
  $('closeQuiz').addEventListener('click',()=>{$('questionArea').innerHTML='<div class="empty-quiz"><div class="empty-icon">✦</div><h3>Your next question is waiting.</h3><p>Choose a practice mode above.</p></div>';});
  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{const a=b.dataset.action;if(a==='easier')buildSession('review');else if(a==='challenge')buildSession('mixed');else if(a==='another')buildSession('vocabulary');else if(a==='explain'){const q=state.lastQuestion;$('quizCard').scrollIntoView({behavior:'smooth'});if(q)$('questionArea').innerHTML='<div class="feedback"><b>AI Tutor explanation</b><br>'+esc(q.explain||'Review the rule and look at the context carefully.')+'</div>';}}));
  $('resetBtn').addEventListener('click',()=>{if(confirm('Reset this browser profile and local learning progress?')){localStorage.removeItem(KEY);localStorage.removeItem(oldKey);location.reload();}});
  updateUI();
})();
