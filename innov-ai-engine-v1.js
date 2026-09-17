/* APLUS AI Engine V1 — isolated innovation module
 * No dependency on existing APLUS website files.
 * Stores demo learner state locally and selects the next learning action.
 */
(function(global){
  'use strict';
  const KEY='APLUS_AI_ENGINE_V1_STATE';
  const defaults={
    studentId:'demo-student',
    vocabulary:{recall:0.72,context:0.61,streak:3},
    grammar:{mastery:0.84},
    fluency:{score:0.68},
    mistakes:{reluctant:3,hesitant:2,adapt:1},
    history:[]
  };
  function clone(x){return JSON.parse(JSON.stringify(x));}
  function load(){try{return Object.assign(clone(defaults),JSON.parse(localStorage.getItem(KEY)||'{}'));}catch(e){return clone(defaults);}}
  function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s;}
  function clamp(n){return Math.max(0,Math.min(1,n));}
  function analyse(s){
    const signals=[];
    if((s.vocabulary.recall||0)<0.75) signals.push({area:'vocabulary',reason:'Recall below target',priority:1});
    if((s.vocabulary.context||0)<0.70) signals.push({area:'context',reason:'Context usage needs practice',priority:2});
    if((s.grammar.mastery||0)<0.80) signals.push({area:'grammar',reason:'Grammar mastery below target',priority:2});
    const repeated=Object.entries(s.mistakes||{}).sort((a,b)=>b[1]-a[1])[0];
    if(repeated&&repeated[1]>=2) signals.push({area:'mistake',reason:'Repeated error: '+repeated[0],priority:0});
    return signals.sort((a,b)=>a.priority-b.priority);
  }
  function nextAction(s){
    const signals=analyse(s);
    if(!signals.length) return {mode:'mixed-review',title:'Mixed mastery check',reason:'Core indicators are on target.',difficulty:'challenge'};
    const x=signals[0];
    if(x.area==='mistake') return {mode:'mistake-review',title:'Review '+x.reason.replace('Repeated error: ',''),reason:'A repeated error was detected.',difficulty:'targeted'};
    if(x.area==='vocabulary') return {mode:'vocabulary',title:'Vocabulary recall practice',reason:x.reason,difficulty:'adaptive'};
    if(x.area==='context') return {mode:'context',title:'Vocabulary in context',reason:x.reason,difficulty:'adaptive'};
    return {mode:'grammar',title:'Grammar application practice',reason:x.reason,difficulty:'adaptive'};
  }
  function record(result){
    const s=load();
    const r=Object.assign({area:'vocabulary',correct:false,responseSeconds:20,confidence:0.5},result||{});
    s.history.push({at:new Date().toISOString(),...r});
    if(s.history.length>100)s.history.shift();
    const weight=0.08;
    if(r.area==='vocabulary') s.vocabulary.recall=clamp(s.vocabulary.recall+(r.correct?weight:-weight));
    if(r.area==='context') s.vocabulary.context=clamp(s.vocabulary.context+(r.correct?weight:-weight));
    if(r.area==='grammar') s.grammar.mastery=clamp(s.grammar.mastery+(r.correct?weight:-weight));
    if(!r.correct && r.term){s.mistakes[r.term]=(s.mistakes[r.term]||0)+1;}
    if(r.correct && r.term && s.mistakes[r.term]) s.mistakes[r.term]=Math.max(0,s.mistakes[r.term]-1);
    return save(s);
  }
  function reset(){return save(clone(defaults));}
  global.APLUSAIEngineV1={load,save,analyse,nextAction,record,reset};
})(window);
