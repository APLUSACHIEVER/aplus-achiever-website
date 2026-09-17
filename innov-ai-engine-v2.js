/* APLUS AI Engine V2 — isolated adaptive question selector
 * New module. Does not modify or depend on existing APLUS pages.
 */
(function(global){
  'use strict';
  const KEY='APLUS_AI_ENGINE_V2_STATE';
  const BANK=[
    {id:'vocab-reluctant-01',area:'vocabulary',skill:'recall',term:'reluctant',difficulty:2,prompt:'Sarah was ______ to speak in front of the class because she felt nervous.',options:['eager','reluctant','careless','certain'],answer:1,why:'The clue “felt nervous” indicates she did not want to speak.'},
    {id:'vocab-adapt-01',area:'vocabulary',skill:'recall',term:'adapt',difficulty:3,prompt:'Animals must ______ to changes in their environment to survive.',options:['adapt','scatter','hesitate','ignore'],answer:0,why:'Adapt means to adjust to new conditions.'},
    {id:'vocab-hesitant-01',area:'vocabulary',skill:'context',term:'hesitant',difficulty:4,prompt:'Tom was ______ about joining the competition because he was unsure of his ability.',options:['hesitant','cheerful','certain','generous'],answer:0,why:'Hesitant means unsure or slow to make a decision.'},
    {id:'vocab-precise-01',area:'vocabulary',skill:'context',term:'precise',difficulty:6,prompt:'The scientist recorded the ______ measurement to ensure the results were reliable.',options:['precise','ordinary','distant','fragile'],answer:0,why:'Precise means exact and accurate.'},
    {id:'grammar-subject-01',area:'grammar',skill:'agreement',term:'subject-verb',difficulty:3,prompt:'Neither of the boys ______ willing to admit the mistake.',options:['were','are','was','have'],answer:2,why:'“Neither” is singular, so the verb is “was”.'},
    {id:'grammar-tense-01',area:'grammar',skill:'tense',term:'past-perfect',difficulty:5,prompt:'By the time we arrived, the movie ______ already started.',options:['has','had','was','is'],answer:1,why:'The earlier past action takes the past perfect: “had started”.'},
    {id:'grammar-preposition-01',area:'grammar',skill:'preposition',term:'preposition',difficulty:4,prompt:'The students were divided ______ four groups for the activity.',options:['in','into','at','by'],answer:1,why:'“Divided into” is the standard expression.'}
  ];
  const defaults={studentId:'demo-student',ability:{vocabulary:0.72,context:0.61,grammar:0.84},recent:[],mistakes:{reluctant:3,hesitant:2,adapt:1},streak:0};
  const clone=x=>JSON.parse(JSON.stringify(x));
  function load(){try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');return saved?merge(clone(defaults),saved):clone(defaults);}catch(e){return clone(defaults);}}
  function merge(a,b){Object.keys(b||{}).forEach(k=>{if(b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k])&&a[k])a[k]=merge(a[k],b[k]);else a[k]=b[k];});return a;}
  function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s;}
  function clamp(n){return Math.max(0,Math.min(1,n));}
  function difficulty(s){const avg=(s.ability.vocabulary+s.ability.context+s.ability.grammar)/3;return avg<.55?2:avg<.70?3:avg<.82?4:avg<.92?5:6;}
  function priority(s,q){let p=0;const a=q.area==='grammar'?s.ability.grammar:q.skill==='context'?s.ability.context:s.ability.vocabulary;if(a<.65)p+=5;else if(a<.78)p+=3;else if(a<.88)p+=1;const m=s.mistakes[q.term]||0;p+=m*3;if(q.difficulty===difficulty(s))p+=2;if(s.recent.indexOf(q.id)>=0)p-=5;return p;}
  function selectNext(){const s=load();let ranked=BANK.map(q=>({q,score:priority(s,q)})).sort((a,b)=>b.score-a.score);const chosen=ranked[0].q;return {question:clone(chosen),reason:reasonFor(s,chosen),difficulty:chosen.difficulty,alternatives:ranked.slice(1,4).map(x=>x.q.id)};}
  function reasonFor(s,q){if((s.mistakes[q.term]||0)>=2)return 'Repeated error detected: '+q.term+'. The engine prioritised targeted review.';if(q.area==='grammar'&&s.ability.grammar<.80)return 'Grammar mastery is below the current target.';if(q.skill==='context'&&s.ability.context<.70)return 'Context usage needs more practice.';if(s.ability.vocabulary<.75&&q.area==='vocabulary')return 'Vocabulary recall is below target.';return 'Selected to maintain an adaptive mix and avoid recent repetition.';}
  function answer(questionId,chosenIndex,responseSeconds,confidence){const s=load(),q=BANK.find(x=>x.id===questionId);if(!q)return null;const correct=Number(chosenIndex)===q.answer;const key=q.area==='grammar'?'grammar':q.skill==='context'?'context':'vocabulary';const delta=correct?.055:-.075;s.ability[key]=clamp(s.ability[key]+delta);if(!correct)s.mistakes[q.term]=(s.mistakes[q.term]||0)+1;else if(s.mistakes[q.term])s.mistakes[q.term]=Math.max(0,s.mistakes[q.term]-1);s.recent=[q.id].concat(s.recent.filter(id=>id!==q.id)).slice(0,5);s.streak=correct?s.streak+1:0;save(s);const next=selectNext();return {correct,explanation:q.why,next};}
  function reset(){return save(clone(defaults));}
  function bank(){return clone(BANK);}
  global.APLUSAIEngineV2={load,save,bank,selectNext,answer,reset,difficulty};
})(window);
