(() => {
  'use strict';

  /*
   * APLUS AI Tutor V3
   * High-confidence question engine.
   * Existing databases are READ ONLY.
   * Rule: never show a full sentence as a cloze question unless the target is replaced by a blank.
   * Rule: no generic fallback questions with arbitrary answers.
   */

  const KEY = 'APLUS_AI_TUTOR_STUDENT_V3';
  const LEGACY_KEYS = ['APLUS_AI_TUTOR_STUDENT_V2','APLUS_AI_TUTOR_STUDENT_V1'];
  const $ = id => document.getElementById(id);
  const arr = v => Array.isArray(v) ? v : [];
  const clean = v => String(v ?? '').trim();
  const esc = v => clean(v).replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const shuffle = a => [...a].sort(() => Math.random() - 0.5);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const levelRank = {P3:1,P4:2,P5:3};
  const skillNames = ['Vocabulary','Grammar','Word Meaning','Collocation','Confusables','Context Clues'];

  let state = loadState();
  let session = {mode:null,questions:[],index:0,answered:false};

  function freshState(){
    return {version:3,level:'P3',questions:0,correct:0,skills:{},mistakes:[],history:[],lastQuestion:null,profile:{confidence:50}};
  }

  function loadState(){
    try{
      const own = JSON.parse(localStorage.getItem(KEY) || 'null');
      if(own) return {...freshState(),...own,version:3};
      for(const k of LEGACY_KEYS){
        const old = JSON.parse(localStorage.getItem(k) || 'null');
        if(old) return {...freshState(),...old,version:3,skills:old.skills||{},mistakes:old.mistakes||[],history:old.history||[]};
      }
    }catch(e){}
    return freshState();
  }
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}

  function db(){
    return {
      p3:arr(window.APLUS_AI_DB_V1_VOCABULARY_RICH_P3),
      p45:arr(window.APLUS_AI_DB_V1_VOCABULARY_RICH_P45),
      family:arr(window.APLUS_AI_DB_V1_VOCABULARY_WORDFAMILY_P3P5_BATCH01),
      conf:arr(window.APLUS_AI_DB_V1_VOCABULARY_CONFUSABLES_P3P5_BATCH01),
      ctx:arr(window.APLUS_AI_DB_V1_VOCABULARY_CONTEXTCLUES_P3P5_BATCH01),
      coll:arr(window.APLUS_AI_DB_V1_VOCABULARY_COLLOCATIONS_P3P5_BATCH01),
      grammar:arr(window.APLUS_AI_DB_V1_GRAMMAR_LARGE_P3P5_BATCH01)
    };
  }

  function recRank(r){
    const l=clean(r.level).toUpperCase();
    if(l.includes('P3'))return 1;
    if(l.includes('P4'))return 2;
    if(l.includes('P5'))return 3;
    const n=parseInt((l.match(/[1-5]/)||[])[0]||'',10);
    return Number.isFinite(n)?n:2;
  }
  function eligible(records){
    const base=levelRank[state.level]||1;
    return records.filter(r=>{
      const n=recRank(r);
      return n>=Math.max(1,base-1)&&n<=Math.min(3,base+1);
    });
  }

  function skillState(skill){return state.skills[skill]||{correct:0,total:0,mastery:0,lastWrong:0,lastSeen:0,streak:0};}
  function updateSkill(skill,ok){
    const s=skillState(skill);
    s.total++;
    s.lastSeen=Date.now();
    if(ok){s.correct++;s.streak++;}else{s.lastWrong=Date.now();s.streak=0;}
    s.mastery=Math.round(s.correct/Math.max(1,s.total)*100);
    state.skills[skill]=s;
  }
  function addMistake(q){
    const old=state.mistakes.find(x=>x.id===q.id);
    state.mistakes=[{id:q.id,skill:q.skill,answer:q.answer,prompt:q.prompt,level:state.level,at:Date.now(),count:(old?.count||0)+1,misconception:q.misconception||''},...state.mistakes.filter(x=>x.id!==q.id)].slice(0,50);
  }
  function clearMistake(id){state.mistakes=state.mistakes.filter(x=>x.id!==id);}
  function targetLevel(skill){
    const m=skillState(skill).mastery, b=levelRank[state.level]||1;
    if(m<40)return Math.max(1,b-1);
    if(m>=85)return Math.min(3,b+1);
    return b;
  }

  /* ---------- Vocabulary morphology ---------- */
  function surfaceCandidates(base){
    const w=clean(base);
    if(!w)return [];
    const out=[w];
    if(w.endsWith('y') && w.length>2){out.push(w.slice(0,-1)+'ies',w.slice(0,-1)+'ied');}
    if(w.endsWith('e')){out.push(w+'d',w.slice(0,-1)+'ing',w+'s');}
    else {out.push(w+'ed',w+'ing',w+'s');}
    return [...new Set(out)];
  }
  function findSurface(example,base){
    const text=clean(example);
    if(!text||!base)return null;
    const forms=surfaceCandidates(base).sort((a,b)=>b.length-a.length);
    for(const form of forms){
      const re=new RegExp('\\b'+form.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')+'\\b','i');
      const m=text.match(re);
      if(m)return {surface:m[0],index:m.index,length:m[0].length};
    }
    return null;
  }
  function blankExample(example,base){
    const hit=findSurface(example,base);
    if(!hit)return null;
    const prompt=example.slice(0,hit.index)+'_____'+example.slice(hit.index+hit.length);
    if(!prompt.includes('_____'))return null;
    return {prompt,answer:hit.surface};
  }

  /* Only use distractors that can occupy the same broad word-form slot. */
  const commonVerbBases=new Set(['adapt','appreciate','anticipate','contribute','convince','demonstrate','determine','diminish','emerge','emphasise','encounter','endure','enhance','evaluate','expand','identify','illustrate','imitate','influence','inspire','maintain','modify','predict','preserve','prohibit','reassure','reconsider','retrieve','resolve','transform','support','provide','improve','reduce','reach','raise','prevent','avoid','borrow','lend','bring','take','make','give','get','choose','follow','join','miss','spend','solve','invite','score','win','wash','brush','wear','pack','check','show','face','overcome','focus','concentrate','belong','depend']);
  const commonAdjectiveBases=new Set(['accurate','adequate','alert','ambitious','appropriate','arrogant','beneficial','cautious','compassionate','competent','considerate','constant','crucial','desperate','diligent','distinct','efficient','elaborate','enthusiastic','evident','exceptional','flexible','frustrated','genuine','gradual','gracious','hostile','innovative','keen','mature','modest','optimistic','persistent','precise','reluctant','scarce','significant','subtle','sufficient','unpredictable','vital','agitated','bewildered','compulsory','defiant','exhausted','feasible','immense','unanimous','miserable']);

  function formClass(base,answer){
    const b=clean(base).toLowerCase(), a=clean(answer).toLowerCase();
    if(commonVerbBases.has(b))return 'verb';
    if(commonAdjectiveBases.has(b))return 'adjective';
    if(a.endsWith('ly'))return 'adverb';
    return 'word';
  }
  function makeSurfaceDistractors(record,pool,answer){
    const cls=formClass(record.word,answer);
    const candidates=shuffle(pool).filter(r=>clean(r.word).toLowerCase()!==clean(record.word).toLowerCase());
    const out=[];
    for(const r of candidates){
      const b=clean(r.word);
      if(!b)continue;
      if(cls==='verb'&&!commonVerbBases.has(b.toLowerCase()))continue;
      if(cls==='adjective'&&!commonAdjectiveBases.has(b.toLowerCase()))continue;
      const ex=clean(arr(r.examples)[0]);
      const hit=ex?findSurface(ex,b):null;
      let form=hit?hit.surface:b;
      const answerLower=answer.toLowerCase();
      if(form.toLowerCase()===answerLower)continue;
      if(out.some(x=>x.toLowerCase()===form.toLowerCase()))continue;
      out.push(form);
      if(out.length===3)break;
    }
    return out;
  }

  function validQuestion(q){
    if(!q||!clean(q.prompt)||!clean(q.answer)||!Array.isArray(q.options)||q.options.length<4)return false;
    const opts=q.options.map(x=>clean(x).toLowerCase());
    if(new Set(opts).size!==opts.length)return false;
    if(!opts.includes(clean(q.answer).toLowerCase()))return false;
    if(q.type==='Vocabulary in Context'||q.type==='Collocation'||q.type==='Confusable Words'||q.type==='Context Clue'){
      if(!q.prompt.includes('_____'))return false;
    }
    return true;
  }

  function makeVocabQuestions(){
    const {p3,p45,conf,coll}=db();
    const core=eligible([...p3,...p45]);
    const out=[];

    /* 1. High-confidence context cloze from the actual example sentence. */
    for(const r of shuffle(core)){
      const base=clean(r.word), ex=clean(arr(r.examples)[0]);
      if(!base||!ex)continue;
      const cloze=blankExample(ex,base);
      if(!cloze)continue;
      const distractors=makeSurfaceDistractors(r,core,cloze.answer);
      if(distractors.length<3)continue;
      const q={id:r.id+'-v3-context',skill:'Vocabulary',type:'Vocabulary in Context',prompt:cloze.prompt,options:shuffle([cloze.answer,...distractors]),answer:cloze.answer,explain:'The missing word is '+cloze.answer+'. '+clean(r.definition),source:r.id,misconception:arr(r.commonMistakes)[0]||''};
      if(validQuestion(q))out.push(q);
      if(out.length>=45)break;
    }

    /* 2. Collocation: blank the head word, not an arbitrary final word. */
    for(const r of eligible(coll)){
      const patterns=arr(r.patterns).map(clean).filter(x=>x.includes(' '));
      const pattern=pick(patterns);
      const answer=clean(r.word);
      if(!pattern||!answer)continue;
      const re=new RegExp('\\b'+answer.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')+'\\b','i');
      if(!re.test(pattern))continue;
      const prompt=pattern.replace(re,'_____');
      const candidates=shuffle(eligible(coll)).map(x=>clean(x.word)).filter(x=>x&&x.toLowerCase()!==answer.toLowerCase());
      const distractors=[];
      for(const x of candidates){if(!distractors.some(d=>d.toLowerCase()===x.toLowerCase())){distractors.push(x);}if(distractors.length===3)break;}
      if(distractors.length<3)continue;
      const q={id:r.id+'-v3-collocation',skill:'Collocation',type:'Collocation',prompt,options:shuffle([answer,...distractors]),answer,explain:'Natural collocation: “'+pattern+'”.',source:r.id,misconception:clean(r.mistake)};
      if(validQuestion(q))out.push(q);
    }

    /* 3. Confusables: derive the answer from the cue itself, never assume pair[0]. */
    const confPool=eligible(conf);
    for(const r of confPool){
      const pair=arr(r.pair).map(clean).filter(Boolean);
      const cues=arr(r.cue).map(clean).filter(Boolean);
      if(pair.length<2||!cues.length)continue;
      let cueHit=null,answer=null;
      for(const cue of cues){
        const found=pair.find(w=>new RegExp('\\b'+w.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')+'\\b','i').test(cue));
        if(found){cueHit=cue;answer=found;break;}
      }
      if(!cueHit||!answer)continue;
      const prompt=cueHit.replace(new RegExp('\\b'+answer.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')+'\\b','i'),'_____');
      if(!prompt.includes('_____'))continue;
      const distractors=[...pair.filter(x=>x.toLowerCase()!==answer.toLowerCase())];
      const sameLevel=shuffle(confPool.filter(x=>x!==r)).map(x=>arr(x.pair)).flat().map(clean);
      for(const x of sameLevel){if(x&&!distractors.some(d=>d.toLowerCase()===x.toLowerCase()))distractors.push(x);if(distractors.length===3)break;}
      if(distractors.length<3)continue;
      const q={id:r.id+'-v3-confusable-'+answer,skill:'Confusables',type:'Confusable Words',prompt,options:shuffle([answer,...distractors.slice(0,3)]),answer,explain:clean(r.rule)||'Choose the word whose meaning and grammar fit the sentence.',source:r.id,misconception:clean(r.mistake)};
      if(validQuestion(q))out.push(q);
    }

    return out;
  }

  const grammarPatterns=[
    [/subject-verb agreement|indefinite pronouns|there is and there are/i,['The box of pencils _____ on the table.','is','are','be','am'],'is','The subject is “box”, which is singular.'],
    [/present simple/i,['Every morning, Maya _____ to school at seven.','walk','walks','walking','walked'],'walks','A singular third-person subject takes the -s form in the present simple.'],
    [/present continuous/i,['Look! The children _____ football in the field.','play','played','are playing','have played'],'are playing','An action happening now uses am/is/are + -ing.'],
    [/past simple negatives/i,['Ben did not _____ his homework last night.','finish','finished','finishes','finishing'],'finish','After did not, use the base form.'],
    [/past simple questions/i,['_____ you see the rainbow yesterday?','Did','Do','Were','Have'],'Did','Use did for most simple past questions.'],
    [/past simple irregular/i,['Yesterday, we _____ to the museum.','go','went','gone','going'],'went','The irregular past form of go is went.'],
    [/present perfect/i,['She has _____ her project already.','finish','finished','finishing','finishes'],'finished','Present perfect uses has/have + past participle.'],
    [/modal should/i,['You _____ drink more water when you are thirsty.','should','should to','shoulds','should drinking'],'should','Use should + base verb.'],
    [/modal must|modal verbs/i,['Students _____ wear their school uniform on Monday.','must','must to','musts','must wearing'],'must','Must is followed by the base verb.'],
    [/may and might/i,['It _____ rain later, so bring an umbrella.','might','might to','might rains','mights'],'might','Might expresses possibility and is followed by the base verb.'],
    [/countable and uncountable|countability/i,['Which sentence is correct?','We need some information.','We need many informations.','We need an informations.','We need two information.'],'We need some information.','Information is normally uncountable in this meaning.'],
    [/few and little/i,['There is _____ water left in the bottle.','a little','a few','many','few'],'a little','Use a little with an uncountable noun such as water.'],
    [/each and every/i,['Every student _____ a notebook.','has','have','having','are having'],'has','Every takes a singular noun and singular verb.'],
    [/comparative adjectives|comparatives with than/i,['This puzzle is _____ than the last one.','more difficult','most difficult','difficultest','more difficulter'],'more difficult','Use the comparative form to compare two things.'],
    [/superlative adjectives/i,['Ali is the _____ runner in the class.','fastest','faster','most fast','fast'],'fastest','A superlative compares one member with a group.'],
    [/as...as/i,['The blue bag is as _____ as the red bag.','heavy','heavier','heaviest','more heavy'],'heavy','Use as + adjective + as for equal comparison.'],
    [/adverb formation|adjective versus adverb/i,['The girl sang _____ at the concert.','beautifully','beautiful','beauty','beautify'],'beautifully','An adverb describes how an action is performed.'],
    [/linking verbs/i,['The soup tastes _____.','delicious','deliciously','deliciousness','deliciously enough'],'delicious','A linking verb can be followed by an adjective describing the subject.'],
    [/infinitive of purpose/i,['I went to the library _____ a book.','to borrow','for borrow','borrowing','borrowed'],'to borrow','Use to + base verb to express purpose.'],
    [/verb plus gerund/i,['I enjoy _____ storybooks.','reading','to read','read','reads'],'reading','Enjoy is followed by an -ing form.'],
    [/verb plus infinitive/i,['She decided _____ early.','to leave','leaving','leave','left'],'to leave','Decide is followed by to + base verb.'],
    [/relative pronouns|relative clauses/i,['The boy _____ won the race is my friend.','who','which','where','what'],'who','Use who for a person in this relative clause.'],
    [/reported questions|noun clauses with question words/i,['He asked where I _____.','lived','did I live','do I live','am I living'],'lived','Reported questions use statement word order.'],
    [/reported statements/i,['Mum told me _____ quiet.','to be','be','being','that be'],'to be','Tell + object + to-infinitive is a common reporting pattern.'],
    [/first conditional/i,['If it _____, we will stay indoors.','rains','will rain','rained','raining'],'rains','The first conditional normally uses present simple after if.'],
    [/unless/i,['Unless you hurry, you _____ the bus.','will miss','missed','are miss','will missed'],'will miss','Unless means “if not”; use the suitable future result form.'],
    [/zero conditional/i,['If you heat ice, it _____.','melts','will melt','melted','melting'],'melts','General truths use present simple in both clauses.'],
    [/passive present simple/i,['English _____ in many countries.','is spoken','is speak','speaks','is speaking'],'is spoken','Present simple passive uses is/am/are + past participle.'],
    [/passive past simple/i,['The window _____ yesterday.','was broken','was break','broke','is broken'],'was broken','Past simple passive uses was/were + past participle.'],
    [/passive with modal/i,['The work must _____ today.','be completed','completed','be complete','is completed'],'be completed','Modal passive uses modal + be + past participle.'],
    [/contrast connectors/i,['_____ he was tired, he continued working.','Although','Despite','Because of','Unless'],'Although','Although is followed by a clause.'],
    [/reason connectors/i,['He stayed home _____ he was ill.','because','despite','although','unless'],'because','Because introduces a reason clause.'],
    [/result connectors/i,['It was raining, _____ we stayed indoors.','so','although','unless','because of'],'so','So introduces the result.'],
    [/sentence structure/i,['Which sentence is complete and correctly joined?','Because he was tired, he went home.','Because he was tired.','He went home because.','He tired went home because.'],'Because he was tired, he went home.','The sentence contains a complete main clause and a correctly attached reason clause.'],
    [/parallel structure/i,['She likes reading, swimming, and _____.','cycling','to cycle','cycle','cycled'],'cycling','The three items use matching grammatical forms.'],
    [/question forms/i,['Where _____ you going?','are','is','do','did'],'are','Use are with you in the present continuous question.']
  ];

  function makeGrammarQuestions(){
    const rows=eligible(db().grammar),out=[];
    for(const r of rows){
      const topic=clean(r.topic)+' '+clean(r.focus)+' '+arr(r.skills).join(' ');
      const p=grammarPatterns.find(x=>x[0].test(topic));
      if(!p)continue; // Never invent a generic grammar question.
      const o=p[1],q={id:r.id+'-v3-grammar',skill:'Grammar',type:'Grammar',prompt:o[0],options:[o[1],o[2],o[3],o[4]],answer:o[5],explain:o[6],source:r.id,topic:r.topic,misconception:arr(r.commonMistakes)[0]||''};
      if(validQuestion(q))out.push(q);
    }
    return out;
  }

  function allQuestions(){return [...makeVocabQuestions(),...makeGrammarQuestions()];}

  function scoreQuestion(q){
    const s=skillState(q.skill), recent=state.history.slice(0,15).some(x=>x.id===q.id);
    let score=Math.random()*8;
    if(s.mastery<50)score+=25;
    if(s.lastWrong)score+=10;
    if(state.mistakes.some(m=>m.id===q.id))score+=35;
    if(!recent)score+=8;
    if(recRank({level:q.level})===targetLevel(q.skill))score+=5;
    return score;
  }

  function adaptiveSort(pool){return shuffle(pool).map(q=>({q,score:scoreQuestion(q)})).sort((a,b)=>b.score-a.score).map(x=>x.q);}

  function buildReviewPool(){
    const all=allQuestions();
    const mistakeIds=new Set(state.mistakes.map(x=>x.id));
    const weak=new Set(skillNames.filter(s=>skillState(s).mastery<65));
    const preferred=all.filter(q=>mistakeIds.has(q.id)||weak.has(q.skill));
    return preferred.length?preferred:all;
  }

  function buildSession(mode){
    let pool;
    if(mode==='grammar')pool=makeGrammarQuestions();
    else if(mode==='review')pool=buildReviewPool();
    else if(mode==='mixed')pool=allQuestions();
    else pool=makeVocabQuestions();
    pool=adaptiveSort(pool);
    const size=mode==='mixed'?12:10;
    session={mode,questions:pool.slice(0,size),index:0,answered:false};
    renderQuestion();
  }

  function renderQuestion(){
    const q=session.questions[session.index];
    if(!q){
      $('quizLabel').textContent='SESSION COMPLETE';
      $('questionProgress').textContent='Your Tutor Brain has updated your learning profile.';
      $('questionArea').innerHTML='<div class="empty-quiz"><div class="empty-icon">✓</div><h3>Session complete.</h3><p>Your next practice will adapt to the skills you need most.</p></div>';
      updateUI();return;
    }
    session.answered=false;state.lastQuestion=q;save();
    $('quizLabel').textContent=clean(q.type).toUpperCase();
    $('questionProgress').textContent='Question '+(session.index+1)+' of '+session.questions.length+' · '+state.level;
    $('questionArea').innerHTML='<div class="question-text">'+esc(q.prompt)+'</div><div class="options">'+q.options.map((o,i)=>'<button class="option-btn" data-answer="'+esc(o)+'" type="button"><b>'+String.fromCharCode(65+i)+'.</b> '+esc(o)+'</button>').join('')+'</div><div id="feedbackSlot"></div>';
    document.querySelectorAll('.option-btn').forEach(btn=>btn.addEventListener('click',()=>answerQuestion(btn.getAttribute('data-answer'),btn)));
  }

  function diagnose(q){
    if(q.misconception)return 'Learning signal recorded: '+q.misconception;
    if(q.skill==='Confusables')return 'The Tutor Brain will revisit the exact word contrast.';
    if(q.skill==='Collocation')return 'The Tutor Brain will revisit the natural word combination.';
    if(q.skill==='Grammar')return 'The Tutor Brain will revisit this grammar pattern.';
    return 'This item has been added to Smart Review.';
  }

  function recovery(q){
    const pool=q.skill==='Grammar'?makeGrammarQuestions():makeVocabQuestions();
    const same=pool.filter(x=>x.skill===q.skill&&x.id!==q.id);
    if(!same.length)return;
    const easier=same.sort((a,b)=>{
      const aM=skillState(a.skill).mastery,bM=skillState(b.skill).mastery;
      return (aM-bM)+Math.random()-0.5;
    })[0];
    session.questions=[...session.questions.slice(0,session.index+1),easier,...session.questions.slice(session.index+1)];
    session.index++;renderQuestion();
  }

  function answerQuestion(value,btn){
    if(session.answered)return;
    session.answered=true;
    const q=session.questions[session.index];
    const ok=clean(value).toLowerCase()===clean(q.answer).toLowerCase();
    document.querySelectorAll('.option-btn').forEach(b=>{if(clean(b.getAttribute('data-answer')).toLowerCase()===clean(q.answer).toLowerCase())b.classList.add('correct');});
    if(!ok)btn.classList.add('wrong');
    state.questions++;if(ok)state.correct++;
    updateSkill(q.skill,ok);
    if(ok)clearMistake(q.id);else addMistake(q);
    state.profile.confidence=Math.max(0,Math.min(100,state.profile.confidence+(ok?2:-3)));
    state.history.unshift({id:q.id,skill:q.skill,ok,at:Date.now(),level:state.level});
    state.history=state.history.slice(0,150);save();
    const diagnosis=ok?'Good — your answer fits the sentence and rule.':diagnose(q);
    $('feedbackSlot').innerHTML='<div class="feedback '+(ok?'feedback-good':'feedback-fix')+'"><b>'+(ok?'Correct!':'Let’s fix this one.')+'</b><br>'+esc(q.explain||'Review the context carefully.')+'<br><small>'+esc(diagnosis)+'</small></div><div class="feedback-actions">'+(!ok?'<button class="mini-btn" id="recoveryBtn" type="button">Try a recovery question</button>':'')+'<button class="next-btn" id="nextQuestion" type="button">'+(session.index+1===session.questions.length?'Finish':'Next question')+' →</button></div>';
    if($('recoveryBtn'))$('recoveryBtn').onclick=()=>recovery(q);
    $('nextQuestion').onclick=()=>{session.index++;renderQuestion();};
    updateUI();
  }

  function renderSkills(){
    $('skillsList').innerHTML=skillNames.map(s=>{const x=skillState(s);return '<div class="skill-row"><div class="skill-head"><span>'+esc(s)+'</span><span>'+x.mastery+'%</span></div><div class="bar"><span style="width:'+x.mastery+'%"></span></div></div>';}).join('');
  }
  function renderReview(){
    const items=[];
    state.mistakes.slice(0,3).forEach(m=>items.push('<div class="review-item"><span class="dot"></span><div><b>'+esc(m.skill)+'</b><small>Recent mistake · '+esc(m.level)+'</small></div></div>'));
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
    $('dataStatus').textContent='Tutor Brain V3 ready · '+state.level;
    $('coachMessage').textContent=state.questions?'I’m adapting to your recent answers.':'Let’s start with a short practice session.';
    renderSkills();renderReview();renderPath();
    document.querySelectorAll('.level-btn').forEach(b=>b.classList.toggle('active',b.dataset.level===state.level));
  }

  document.querySelectorAll('.level-btn').forEach(b=>b.addEventListener('click',()=>{state.level=b.dataset.level;save();updateUI();}));
  document.querySelectorAll('.practice-card').forEach(b=>b.addEventListener('click',()=>{$('quizCard').scrollIntoView({behavior:'smooth',block:'start'});buildSession(b.dataset.mode);}));
  $('closeQuiz').addEventListener('click',()=>{$('questionArea').innerHTML='<div class="empty-quiz"><div class="empty-icon">✦</div><h3>Your next question is waiting.</h3><p>Choose a practice mode above.</p></div>';});
  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{const a=b.dataset.action;if(a==='easier')buildSession('review');else if(a==='challenge')buildSession('mixed');else if(a==='another')buildSession('vocabulary');else if(a==='explain'){const q=state.lastQuestion;$('quizCard').scrollIntoView({behavior:'smooth'});if(q)$('questionArea').innerHTML='<div class="feedback"><b>AI Tutor explanation</b><br>'+esc(q.explain||'Review the rule and context carefully.')+'</div>';}}));
  $('resetBtn').addEventListener('click',()=>{if(confirm('Reset this browser profile and local learning progress?')){localStorage.removeItem(KEY);for(const k of LEGACY_KEYS)localStorage.removeItem(k);location.reload();}});
  updateUI();
})();
