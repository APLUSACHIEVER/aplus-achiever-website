/* APLUS AI Misconception Engine V3
   Standalone learning engine. Does not modify or depend on existing APLUS pages.
*/
(function(){
  'use strict';
  const KEY='APLUS_AI_ENGINE_V3_STATE';
  const BANK=[
    {id:'v3-vocab-reluctant',area:'vocabulary',skill:'meaning',term:'reluctant',difficulty:2,prompt:'The boy was ______ to speak in front of the whole class because he felt nervous.',options:['reluctant','eager','proud','careless'],answer:0,why:'The sentence describes hesitation caused by nervousness.',distractorReasons:{1:'Eager means very willing, which is the opposite of the context.',2:'Proud describes a feeling, not unwillingness to act.',3:'Careless does not express hesitation.'},remediationIds:['v3-vocab-hesitant']},
    {id:'v3-vocab-hesitant',area:'vocabulary',skill:'meaning',term:'hesitant',difficulty:2,prompt:'Sarah was ______ when asked to choose a team because she was unsure which one to join.',options:['hesitant','certain','cheerful','generous'],answer:0,why:'Being unsure before making a choice suggests hesitation.',distractorReasons:{1:'Certain means sure, which conflicts with the clue.',2:'Cheerful describes mood, not uncertainty.',3:'Generous means willing to give or share.'},remediationIds:['v3-vocab-reluctant']},
    {id:'v3-vocab-adapt',area:'vocabulary',skill:'context',term:'adapt',difficulty:3,prompt:'When Mei moved to a new school, she quickly learned the routines and ______ to her new environment.',options:['adapted','avoided','ignored','delayed'],answer:0,why:'Learning new routines and becoming comfortable in a new environment is adapting.',distractorReasons:{1:'Avoided means stayed away from something.',2:'Ignored means paid no attention to it.',3:'Delayed means made something happen later.'},remediationIds:['v3-vocab-precise']},
    {id:'v3-vocab-precise',area:'vocabulary',skill:'context',term:'precise',difficulty:4,prompt:'The scientist recorded the ______ measurements so that another researcher could repeat the experiment.',options:['precise','random','ordinary','distant'],answer:0,why:'Measurements that can support a repeatable experiment need to be exact.',distractorReasons:{1:'Random suggests no exact method or order.',2:'Ordinary means usual and does not indicate accuracy.',3:'Distant describes position, not accuracy.'},remediationIds:['v3-vocab-adapt']},
    {id:'v3-grammar-sv',area:'grammar',skill:'subject-verb agreement',difficulty:2,prompt:'The list of items ______ on the teacher’s desk.',options:['is','are','were','have'],answer:0,why:'The subject is “list”, which is singular; “of items” does not change the subject.',distractorReasons:{1:'“Items” is inside the prepositional phrase and is not the main subject.',2:'“Were” is plural past tense and does not fit the sentence.',3:'“Have” does not agree with singular “list”.'},remediationIds:['v3-grammar-pp']},
    {id:'v3-grammar-pp',area:'grammar',skill:'past perfect',difficulty:3,prompt:'By the time the bus arrived, we ______ for twenty minutes.',options:['had waited','have waited','will wait','are waiting'],answer:0,why:'The waiting happened before another past event, so past perfect is appropriate.',distractorReasons:{1:'Present perfect does not match the completed past reference point.',2:'Future tense does not fit a past event.',3:'Present continuous does not describe the earlier completed action.'},remediationIds:['v3-grammar-prep']},
    {id:'v3-grammar-prep',area:'grammar',skill:'preposition',difficulty:2,prompt:'The students arrived ______ school before the bell rang.',options:['at','on','by','from'],answer:0,why:'We normally say “arrive at school” for this context.',distractorReasons:{1:'“On school” is not the standard expression.',2:'“By school” changes the meaning to a deadline or location near something.',3:'“From school” indicates origin rather than destination.'},remediationIds:['v3-grammar-sv']},
    {id:'v3-vocab-recall',area:'vocabulary',skill:'recall',difficulty:1,prompt:'If someone is reluctant to do something, they are ______ to do it.',options:['unwilling','delighted','certain','prepared'],answer:0,why:'Reluctant means not willing or not eager to do something.',distractorReasons:{1:'Delighted means very pleased.',2:'Certain means sure.',3:'Prepared means ready.'},remediationIds:['v3-vocab-reluctant']}
  ];

  function fresh(){return {version:3,ability:{vocabulary:.72,context:.61,grammar:.84,recall:.66},mistakes:{},misconceptions:{},history:[],streak:0,lastQuestion:null,lastDiagnosis:null,lastRemediation:null};}
  function load(){try{const x=JSON.parse(localStorage.getItem(KEY));return x&&x.version===3?x:fresh();}catch(e){return fresh();}}
  function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s;}
  function bank(){return BANK.slice();}
  function areaAbility(s,q){return Math.max(0,Math.min(1,s.ability[q.area==='vocabulary'?(q.skill==='context'?'context':q.skill==='recall'?'recall':'vocabulary'):'grammar']||.5));}
  function diagnose(q,index,meta){
    if(index===q.answer) return {type:'correct',label:'Correct understanding',message:'The answer matches the meaning and context.',severity:0};
    const specific=q.distractorReasons&&q.distractorReasons[index];
    let type='recall weakness',label='Recall weakness',message='The learner may know the word or rule but could not retrieve it reliably.';
    if(q.skill==='context') {type='context clue not recognised';label='Context clue not recognised';message='The learner may not have used the surrounding clues strongly enough.';}
    if(q.skill==='meaning') {type='meaning confusion';label='Meaning confusion';message='The selected option suggests the learner may be confusing the target meaning with a related or contrasting word.';}
    if(q.area==='grammar') {type='grammar rule confusion';label='Grammar rule confusion';message='The answer suggests the learner may need to revisit the specific grammar rule and how it works in context.';}
    if(meta&&meta.secondsLeft!=null&&meta.secondsLeft<=5){type='fluency pressure';label='Fluency pressure';message='The learner answered under time pressure; the concept may need faster retrieval practice.';}
    return {type,label,message,specific: specific||'Review the rule or meaning, then apply it to a fresh example.',severity:1};
  }
  function candidates(s,exclude){
    return BANK.filter(q=>q.id!==exclude);
  }
  function score(q,s){
    const a=areaAbility(s,q); let v=(1-a)*5 + q.difficulty*.25;
    const m=s.mistakes[q.id]||0; v+=m*2;
    if((s.misconceptions[q.skill]||0)>0) v+=2;
    if(q.id===s.lastQuestion) v-=8;
    return v+Math.random()*.2;
  }
  function selectNext(s,opts){opts=opts||{};let pool=candidates(s,opts.exclude||null);if(opts.area)pool=pool.filter(q=>q.area===opts.area);if(opts.remediationIds)pool=pool.filter(q=>opts.remediationIds.indexOf(q.id)>=0);if(!pool.length)pool=candidates(s,opts.exclude||null);pool.sort((a,b)=>score(b,s)-score(a,s));const q=pool[0];return {question:q,reason:reasonFor(q,s,opts),alternatives:pool.slice(1,4)};}
  function reasonFor(q,s,opts){if(opts.remediationIds)return 'AI selected a targeted remediation question for the diagnosed misconception.';const a=areaAbility(s,q);if((s.mistakes[q.id]||0)>0)return 'AI returned to a question with a previous mistake to strengthen retention.';if(a<.65)return 'AI selected this skill because the current ability signal is relatively weak.';if(q.difficulty>=3)return 'AI selected a moderate challenge to test whether the skill is becoming stable.';return 'AI selected this question to maintain balanced practice.';}
  function answer(s,q,index,meta){const correct=index===q.answer;const d=diagnose(q,index,meta);if(!correct){s.mistakes[q.id]=(s.mistakes[q.id]||0)+1;s.misconceptions[d.type]=(s.misconceptions[d.type]||0)+1;}const key=q.area==='vocabulary'?(q.skill==='context'?'context':q.skill==='recall'?'recall':'vocabulary'):'grammar';const old=s.ability[key]||.5;s.ability[key]=Math.max(0,Math.min(1,old+(correct?.035:-.07)));s.streak=correct?s.streak+1:0;s.lastQuestion=q.id;s.lastDiagnosis=d;s.history.unshift({at:new Date().toISOString(),questionId:q.id,selected:index,correct,diagnosis:d.type});s.history=s.history.slice(0,30);return {correct,diagnosis:d,ability:s.ability,streak:s.streak,next:selectNext(s,{exclude:q.id}),remediation:!correct?selectNext(s,{remediationIds:q.remediationIds||[],exclude:q.id}):null};}
  function selectRemediation(s,q,d){if(!q)return null;return selectNext(s,{remediationIds:q.remediationIds||[],exclude:q.id});}
  function getProfile(s){return {ability:s.ability,mistakes:s.mistakes,misconceptions:s.misconceptions,streak:s.streak,history:s.history,lastDiagnosis:s.lastDiagnosis};}
  function reset(){return save(fresh());}
  window.APLUSAIEngineV3={version:3,bank,load,save,selectNext,answer,diagnose,selectRemediation,getProfile,reset};
})();