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

  function normalizeP45(records){
    return arr(records).map((r,i)=>{
      // P4/P5 rich vocabulary DB uses compact tuple records:
      // [word, definition, synonym, antonym, collocations, examples, difficulty, skills, commonMistakes]
      if(Array.isArray(r)){
        const difficulty=Number(r[6]) || 4;
        return {
          id:'P45-'+String(i+1).padStart(3,'0'),
          word:r[0],
          definition:r[1],
          synonym:r[2],
          antonym:r[3],
          collocations:arr(r[4]),
          examples:arr(r[5]),
          difficulty,
          skills:arr(r[7]),
          commonMistakes:arr(r[8]),
          // Difficulty 3–4 is the P4 band; difficulty 5 is the P5 challenge band.
          level:difficulty>=5?'P5':'P4'
        };
      }
      return r;
    });
  }

  function db(){
    return {
      p3: arr(window.APLUS_AI_DB_V1_VOCABULARY_RICH_P3),
      p45: normalizeP45(window.APLUS_AI_DB_V1_VOCABULARY_RICH_P45),
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
    if(Number.isFinite(n)) return n;
    const d = Number(r.difficulty);
    if(Number.isFinite(d)){
      if(d <= 3) return 1;
      if(d === 4) return 2;
      return 3;
    }
    return 2;
  }

  // Level selection is a real difficulty switch:
  // P3 = foundation, P4 = build, P5 = challenge.
  // Do not mix adjacent school levels when the student explicitly selects one.
  function eligible(records){
    const selected = state.level || 'P3';
    return records.filter(r => recRank(r) === (levelRank[selected] || 1));
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
    // Keep the question difficulty inside the student's selected school level.
    // Mastery adapts skill selection, review priority and question order,
    // but clicking P3/P4/P5 must never silently move the student to another level.
    return levelRank[state.level] || 1;
  }

  function wordClass(r){
    const d=clean(r?.definition || r?.meaning).toLowerCase();
    if(/^to\\s+/.test(d)) return 'verb';
    if(/^(a|an|the)\\s+/.test(d)) return 'noun';
    if(/^(very|extremely|quite|not|full of|having|able to|likely to|eager to|willing to|showing|feeling)\\b/.test(d)) return 'adjective';
    if(/ly$/.test(clean(r?.word).toLowerCase())) return 'adverb';
    return '';
  }
  function chooseWords(records, answer, n=3){
    const seen = new Set([clean(answer).toLowerCase()]);
    const targetRec = records.find(r => clean(r?.word).toLowerCase()===clean(answer).toLowerCase());
    const targetClass = wordClass(targetRec);
    const pool = targetClass ? records.filter(r => wordClass(r)===targetClass) : records;
    const candidates = shuffle(pool.map(r => clean(r.word)).filter(Boolean)).filter(w => !seen.has(w.toLowerCase()));
    const out=[];
    for(const w of candidates){ if(!seen.has(w.toLowerCase())){out.push(w);seen.add(w.toLowerCase());} if(out.length===n)break; }
    // If the database does not have enough same-class distractors, safely top up from the full pool.
    if(out.length<n){
      for(const w of shuffle(records.map(r => clean(r.word)).filter(Boolean))){
        if(out.length>=n) break;
        if(!seen.has(w.toLowerCase())){out.push(w);seen.add(w.toLowerCase());}
      }
    }
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

  function vocabPos(r){
    const d=clean(r?.definition || r?.meaning).toLowerCase();
    const w=clean(r?.word).toLowerCase();
    if(/^to\s+/.test(d)) return 'verb';
    if(/^(a|an|the)\s+/.test(d)) return 'noun';
    if(/^(very|extremely|quite|full of|having|able to|likely to|eager to|willing to|showing|feeling)\b/.test(d)) return 'adjective';
    if(/ly$/.test(w)) return 'adverb';
    return '';
  }

  function generatedVocabPrompt(r){
    const word=clean(r?.word);
    const d=clean(r?.definition || r?.meaning).toLowerCase();
    const pos=vocabPos(r);
    if(!word || !d) return null;
    if(pos==='verb'){
      if(/give special importance|special importance|stress|highlight|draw attention/.test(d)) return {prompt:'The teacher asked the pupils to _____ the most important point in their answers.',answer:word};
      if(/move closer|come closer|go nearer/.test(d)) return {prompt:'The puppy began to _____ the children when they called it gently.',answer:word};
      if(/try to|make an effort|attempt/.test(d)) return {prompt:'The pupils decided to _____ the difficult problem before the lesson ended.',answer:word};
      if(/put in order|make plans|organis|organize/.test(d)) return {prompt:'The class monitor helped to _____ the books before the lesson began.',answer:word};
      if(/respect|like someone|like something/.test(d)) return {prompt:'Many pupils _____ their teacher because she is patient and helpful.',answer:word};
      if(/catch|record/.test(d)) return {prompt:'The photographer managed to _____ the beautiful moment with her camera.',answer:word};
      return null;
    }
    if(pos==='adjective'){
      if(/excited|interested|eager|enthusiastic/.test(d)) return {prompt:'After hearing the good news, Mia was _____ and could not stop smiling throughout the afternoon.',answer:word};
      if(/worried|nervous|anxious|concerned/.test(d)) return {prompt:'Before the important test, Mia felt _____ and checked her work carefully.',answer:word};
      if(/happy|cheerful|positive|optimistic/.test(d)) return {prompt:'Although the task was difficult, Tom remained _____ and encouraged his classmates to keep trying.',answer:word};
      if(/calm|patient|peaceful/.test(d)) return {prompt:'Even when the situation became difficult, Ben remained _____ and dealt with the problem carefully.',answer:word};
      if(/brave|courageous|fearless/.test(d)) return {prompt:'The _____ girl stayed calm and helped her younger brother when they heard the loud noise.',answer:word};
      if(/modest|humble/.test(d)) return {prompt:'Although she won the prize, Sarah remained _____ and thanked her teammates.',answer:word};
      return null;
    }
    return null;
  }

  function vocabQuestionAlignmentOK(prompt, answer, record){
    const p=clean(prompt).toLowerCase();
    const pos=vocabPos(record);
    if(!p || !answer || !pos) return true;
    if(pos==='verb' && /\b(remained|was|were|felt|seemed|looked|became|stayed)\s+_{3,}/.test(p)) return false;
    if(pos==='adjective' && /\bto\s+_{3,}/.test(p)) return false;
    return true;
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
      const exactEx=examples.find(x=>isCompleteVocabSentence(sentenceBlank(x,word)));
      let prompt=exactEx ? sentenceBlank(exactEx,word) : '';
      let answer=word;

      // If the stored example uses an inflected form (for example, "emphasised"),
      // never force the base word into an incompatible sentence slot.
      if(!prompt || !vocabQuestionAlignmentOK(prompt,answer,r)){
        const generated=generatedVocabPrompt(r);
        if(generated){ prompt=generated.prompt; answer=generated.answer; }
      }
      if(!prompt || !isCompleteVocabSentence(prompt) || !vocabQuestionAlignmentOK(prompt,answer,r)) continue;

      const distractors=chooseWords(core,word,3);
      if(distractors.length<3) continue;
      out.push({id:r.id+'-meaning-context-v5',skill:'Vocabulary',type:'Vocabulary in Context',prompt,options:shuffle([answer,...distractors]),answer,explain:'The sentence context supports “'+answer+'”. '+def,source:r.id,level:r.level,questionStyle:'complete-sentence'});      if(out.length>=35) break;
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
    {test:/subject-verb agreement|indefinite pronouns|there is and there are/i, make:()=>({prompt:'The box of pencils _____ on the table.',options:['is','are','be','am'],answer:'is',explain:'The subject is “box”, which is singular, so the verb must be “is”.'})},
    {test:/present simple/i, make:()=>({prompt:'Every morning, Maya _____ to school at seven.',options:['walk','walks','walking','walked'],answer:'walks',explain:'For a singular third-person subject in the present simple, use the -s form.'})},
    {test:/present continuous/i, make:()=>({prompt:'Look! The children _____ football in the field.',options:['play','played','are playing','have played'],answer:'are playing',explain:'An action happening now uses am/is/are + -ing.'})},
    {test:/past simple negatives/i, make:()=>({prompt:'Ben did not _____ his homework last night.',options:['finish','finished','finishes','finishing'],answer:'finish',explain:'After did not, use the base form of the verb.'})},
    {test:/past simple questions/i, make:()=>({prompt:'_____ you see the rainbow yesterday?',options:['Did','Do','Were','Have'],answer:'Did',explain:'Use did to form most simple past questions.'})},
    {test:/past simple irregular/i, make:()=>({prompt:'Yesterday, we _____ to the museum.',options:['go','went','gone','going'],answer:'went',explain:'“Go” has the irregular past form “went”.'})},
    {test:/present perfect/i, make:()=>({prompt:'She has _____ her project already.',options:['finish','finished','finishing','finishes'],answer:'finished',explain:'Present perfect uses has/have + past participle.'})},
    {test:/modal should/i, make:()=>({prompt:'You _____ drink more water when you are thirsty.',options:['should','should to','shoulds','should drinking'],answer:'should',explain:'Use should + base verb.'})},
    {test:/modal must|modal verbs/i, make:()=>({prompt:'Students _____ wear their school uniform on Monday.',options:['must','must to','musts','must wearing'],answer:'must',explain:'Must is followed by the base verb.'})},
    {test:/may and might/i, make:()=>({prompt:'It _____ rain later, so bring an umbrella.',options:['might','might to','might rains','mights'],answer:'might',explain:'Might expresses possibility and is followed by the base verb.'})},
    {test:/countable and uncountable|countability/i, make:()=>({prompt:'We need _____ information before making a decision.',options:['some','many','an','two'],answer:'some',explain:'“Information” is normally uncountable, so “some information” is correct.'})},
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
    {test:/sentence structure/i, make:()=>({prompt:'Because he was tired, he _____ home early.',options:['went','go','going','goes'],answer:'went',explain:'The sentence describes a completed past action, so the past-tense form “went” is required.'})},
    {test:/parallel structure/i, make:()=>({prompt:'She likes reading, swimming, and _____.',options:['cycling','to cycle','cycle','cycled'],answer:'cycling',explain:'The three items should use matching grammatical forms.'})},
    {test:/question forms/i, make:()=>({prompt:'Where _____ you going?',options:['are','is','do','did'],answer:'are',explain:'Use are with you in the present continuous question.'})}
  ];

  // PSLE-style Grammar Gate: every generated grammar item must be a sentence-level fill-in-the-blank MCQ.
  function psleGrammarFallback(r){
    const topic=clean(r.topic)+' '+clean(r.focus)+' '+arr(r.skills).join(' ');
    const make=(prompt,options,answer,explain)=>({prompt,options,answer,explain});
    if(/past simple regular verbs/i.test(topic)) return make('Yesterday, Sarah _____ her homework before dinner.',['finished','finish','finishes','finishing'],'finished','Use the regular past-tense form for a completed action in the past.');
    if(/articles/i.test(topic)) return make('Mum bought _____ umbrella because it was raining.',['an','a','the','some'],'an','Use “an” before a singular countable noun beginning with a vowel sound.');
    if(/pronouns/i.test(topic) && /subject/i.test(topic)) return make('_____ is going to the library after school.',['She','Her','Hers','Him'],'She','A subject pronoun is needed before the verb.');
    if(/object pronouns/i.test(topic)) return make('Mum gave the books to _____.',['him','he','his','himself'],'him','Use an object pronoun after the preposition “to”.');
    if(/possessive determiners/i.test(topic)) return make('This is _____ new school bag.',['my','mine','me','I'],'my','A possessive determiner is used before a noun.');
    if(/determiners/i.test(topic)) return make('_____ books on the table belong to the library.',['These','This','That','A'],'These','Use “these” with plural nouns that are nearby.');
    if(/prepositions of time/i.test(topic)) return make('The lesson starts _____ eight o’clock.',['at','on','in','by'],'at','Use “at” for a specific clock time.');
    if(/prepositions of place/i.test(topic)) return make('The cat is hiding _____ the table.',['under','between','towards','during'],'under','“Under” describes a position below something.');
    if(/prepositions of movement/i.test(topic)) return make('The boy walked _____ the room and sat down.',['into','at','on','during'],'into','Use “into” for movement from outside to inside.');
    if(/conjunctions|because and so|coordinating conjunctions/i.test(topic)) return make('I was tired, _____ I went to bed early.',['so','but','or','because'],'so','“So” introduces the result of being tired.');
    if(/past simple negatives/i.test(topic)) return make('Ben did not _____ his homework last night.',['finish','finished','finishes','finishing'],'finish','After “did not”, use the base form of the verb.');
    if(/past simple questions/i.test(topic)) return make('_____ you see the rainbow yesterday?',['Did','Do','Were','Have'],'Did','Use “did” to form a simple past question.');
    if(/irregular past verbs/i.test(topic)) return make('Yesterday, we _____ to the museum.',['went','go','gone','going'],'went','“Went” is the irregular past form of “go”.');
    if(/present perfect/i.test(topic)) return make('She has _____ her project already.',['finished','finish','finishing','finishes'],'finished','Present perfect uses has/have + past participle.');
    if(/modal verbs|can and cannot/i.test(topic)) return make('You _____ finish your homework before playing games.',['must','must to','musts','must finishing'],'must','A modal verb is followed by the base form of the verb.');
    if(/comparative adjectives/i.test(topic)) return make('This puzzle is _____ than the last one.',['more difficult','most difficult','difficultest','more difficulter'],'more difficult','Use the comparative form when comparing two things.');
    if(/superlative adjectives/i.test(topic)) return make('Ali is the _____ runner in the class.',['fastest','faster','most fast','fast'],'fastest','Use a superlative when comparing one member with a group.');
    if(/adverbs/i.test(topic)) return make('The girl sang _____ at the concert.',['beautifully','beautiful','beauty','beautify'],'beautifully','An adverb describes how an action is performed.');
    if(/infinitive of purpose/i.test(topic)) return make('I went to the library _____ a book.',['to borrow','for borrow','borrowing','borrowed'],'to borrow','Use to + base verb to express purpose.');
    if(/gerunds after prepositions/i.test(topic)) return make('She is interested in _____ stories.',['reading','read','to read','reads'],'reading','A verb after a preposition normally takes the -ing form.');
    if(/gerunds|verb plus gerund/i.test(topic)) return make('I enjoy _____ storybooks.',['reading','to read','read','reads'],'reading','“Enjoy” is followed by an -ing form.');
    if(/infinitive|verb plus infinitive/i.test(topic)) return make('She decided _____ early.',['to leave','leaving','leave','left'],'to leave','“Decide” is followed by to + base verb.');
    if(/relative pronouns|relative clauses/i.test(topic)) return make('The boy _____ won the race is my friend.',['who','which','where','what'],'who','Use “who” for a person in this relative clause.');
    if(/first conditional/i.test(topic)) return make('If it _____, we will stay indoors.',['rains','will rain','rained','raining'],'rains','Use present simple after “if” in the first conditional.');
    if(/unless/i.test(topic)) return make('Unless you hurry, you _____ the bus.',['will miss','missed','are miss','will missed'],'will miss','“Unless” introduces the condition; the result can use will + base verb.');
    if(/zero conditional/i.test(topic)) return make('If you heat ice, it _____.',['melts','will melt','melted','melting'],'melts','General truths use the present simple in both clauses.');
    if(/passive present simple/i.test(topic)) return make('English _____ in many countries.',['is spoken','is speak','speaks','is speaking'],'is spoken','Present simple passive uses is/am/are + past participle.');
    if(/passive past simple/i.test(topic)) return make('The window _____ yesterday.',['was broken','was break','broke','is broken'],'was broken','Past simple passive uses was/were + past participle.');
    if(/passive with modal/i.test(topic)) return make('The work must _____ today.',['be completed','completed','be complete','is completed'],'be completed','A modal passive uses modal + be + past participle.');
    if(/reported questions|noun clauses with question words/i.test(topic)) return make('He asked where I _____.',['lived','did I live','do I live','am I living'],'lived','Reported questions use statement word order.');
    if(/reported statements/i.test(topic)) return make('Mum told me _____ quiet.',['to be','be','being','that be'],'to be','Tell + object + to-infinitive is a common reporting pattern.');
    if(/reported commands and requests/i.test(topic)) return make('The teacher told us _____ our books.',['to open','open','opening','opened'],'to open','Use tell + object + to-infinitive for a common reported command.');
    if(/quantifiers|countability/i.test(topic)) return make('There is _____ water left in the bottle.',['a little','a few','many','few'],'a little','Use “a little” with an uncountable noun such as water.');
    if(/question forms|simple questions/i.test(topic)) return make('Where _____ you going?',['are','is','do','did'],'are','Use “are” with “you” in the present continuous question.');
    if(/parallel structure/i.test(topic)) return make('She likes reading, swimming, and _____.',['cycling','to cycle','cycle','cycled'],'cycling','Use matching grammatical forms in a coordinated list.');
    // Safe PSLE-style generic fallback: never return a rule-definition question.
    const word=clean(arr(r.commonMistakes)[0]).replace(/^[^a-zA-Z]*|[^a-zA-Z]+$/g,'') || 'use';
    return make('Choose the correct form for the grammar point in this sentence: The pupils _____ their work carefully.',['check','checks','checking','checked'],'check','Choose the verb form that fits the sentence and the grammar point being practised: '+clean(r.focus||r.topic)+'.');
  }

  function grammarQuestion(r){
    const topic=clean(r.topic)+' '+clean(r.focus)+' '+arr(r.skills).join(' ');
    const pattern=grammarPatterns.find(x=>x.test.test(topic));
    if(pattern){ const q=pattern.make(); return {...q,id:r.id+'-grammar',skill:'Grammar',type:'Grammar',source:r.id,topic:r.topic,misconception:arr(r.commonMistakes)[0]||'',questionStyle:'PSLE sentence fill-in-the-blank'}; }
    const q=psleGrammarFallback(r);
    return {id:r.id+'-grammar',skill:'Grammar',type:'Grammar',prompt:q.prompt,options:q.options,answer:q.answer,explain:q.explain,source:r.id,topic:r.topic,misconception:arr(r.commonMistakes)[0]||'',questionStyle:'PSLE sentence fill-in-the-blank'};
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
    document.querySelectorAll('.level-btn').forEach(b=>{
      const active=b.dataset.level===state.level;
      b.classList.toggle('active',active);
      b.setAttribute('aria-pressed',String(active));
    });
  }

  function setLevel(level, button){
    if(!levelRank[level]) return;
    state.level = level;
    document.querySelectorAll('.level-btn').forEach(b=>{
      const active = b.dataset.level === level;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    save();
    updateUI();
  }

  document.querySelectorAll('.level-btn').forEach(b=>{
    b.setAttribute('aria-pressed', b.classList.contains('active') ? 'true' : 'false');
    b.addEventListener('click',()=>setLevel(b.dataset.level,b));
  });
  document.querySelectorAll('.practice-card, .micro-practice-btn').forEach(b=>b.addEventListener('click',()=>{$('quizCard').scrollIntoView({behavior:'smooth',block:'start'});buildSession(b.dataset.mode);}));
  $('closeQuiz').addEventListener('click',()=>{$('questionArea').innerHTML='<div class="empty-quiz"><div class="empty-icon">✦</div><h3>Your next question is waiting.</h3><p>Choose a practice mode above.</p></div>';});
  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{const a=b.dataset.action;if(a==='easier')buildSession('review');else if(a==='challenge')buildSession('mixed');else if(a==='another')buildSession('vocabulary');else if(a==='explain'){const q=state.lastQuestion;$('quizCard').scrollIntoView({behavior:'smooth'});if(q)$('questionArea').innerHTML='<div class="feedback"><b>AI Tutor explanation</b><br>'+esc(q.explain||'Review the rule and look at the context carefully.')+'</div>';}}));
  $('resetBtn').addEventListener('click',()=>{if(confirm('Reset this browser profile and local learning progress?')){localStorage.removeItem(KEY);localStorage.removeItem(oldKey);location.reload();}});
  updateUI();
})();
