/* APLUS AI TUTOR BRAIN V12
   Unified orchestration layer for Vocabulary, Grammar, Mistake, Review,
   Learning Path and Student Profile. Standalone; does not modify older engines.
*/
(function(){
  'use strict';
  const KEY='APLUS_AI_TUTOR_BRAIN_V12';
  const now=()=>Date.now();
  const fresh=()=>({version:12,startedAt:now(),mode:'today',turns:0,history:[],lastAction:null});
  function load(){try{return Object.assign(fresh(),JSON.parse(localStorage.getItem(KEY)||'{}'));}catch(e){return fresh();}}
  function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s;}
  function v5(){return window.APLUSAILearningMemoryV5||null;}
  function v8(){return window.APLUSAIPathV8||null;}
  function v9(){return window.APLUSAIEngineV9||null;}
  function v10(){return window.APLUSAIStudentIntelligenceV10||null;}
  function v11(){return window.APLUSAIComprehensiveTutorV11||null;}
  function snapshot(){
    const m=v5(), i=v10(), p=v8();
    let memory=null, intelligence=null, plan=null;
    try{memory=m?m.snapshot(m.load()):null;}catch(e){}
    try{intelligence=i?i.intelligence():null;}catch(e){}
    try{plan=p?p.today():null;}catch(e){}
    const skills=(memory&&memory.skills)||{};
    const rows=Object.keys(skills).map(k=>({key:k,mastery:Number(skills[k].mastery||0),retention:Number(skills[k].retention||0),accuracy:Number(skills[k].accuracy||0)}));
    rows.sort((a,b)=>(a.retention+a.mastery)-(b.retention+b.mastery));
    return {memory,intelligence,plan,weakSkills:rows.slice(0,3),timestamp:now()};
  }
  function classify(text){
    const t=String(text||'').toLowerCase().trim();
    if(/^(hi|hello|hey|good morning|good afternoon|good evening)/.test(t)) return 'greet';
    if(/why.*(wrong|mistake)|wrong.*why|哪里错|为什么错/.test(t)) return 'mistake';
    if(/mistake|错误|错题/.test(t)) return 'mistake';
    if(/review|复习|due|该复习/.test(t)) return 'review';
    if(/weak|weakest|薄弱|弱项/.test(t)) return 'weak';
    if(/next|接下来|下一步|今天学什么/.test(t)) return 'next';
    if(/path|plan|学习路径|计划/.test(t)) return 'path';
    if(/profile|进步|成绩|能力|我的情况/.test(t)) return 'profile';
    if(/grammar|语法/.test(t)) return 'grammar';
    if(/vocab|vocabulary|word|单词|词汇/.test(t)) return 'vocabulary';
    if(/question|题目|练习|practice|测试/.test(t)) return 'practice';
    if(/explain|teach|解释|教我/.test(t)) return 'teach';
    if(/challenge|挑战/.test(t)) return 'challenge';
    return 'chat';
  }
  function focus(snap){
    if(snap.weakSkills&&snap.weakSkills[0]) return snap.weakSkills[0].key;
    return 'vocabulary::meaning';
  }
  function response(intent,snap){
    const weak=focus(snap);
    const label=weak.replace(/^vocabulary::/,'Vocabulary · ').replace(/^grammar::/,'Grammar · ');
    const intel=snap.intelligence||{};
    const acc=intel.accuracy==null?'—':Math.round(intel.accuracy*100)+'%';
    if(intent==='greet') return 'Hi! I’m your APLUS Tutor Brain. I connect your vocabulary, grammar, mistakes, review schedule, learning path and student profile so your next activity is based on your learning data.';
    if(intent==='weak') return 'Your current focus is '+label+'. I’ll use this area to decide what you should practise next, then adjust after your answers.';
    if(intent==='mistake') return 'Let’s repair the mistake instead of simply showing the answer. I’ll identify the likely misconception, explain the rule or meaning, give a short example, then retest you.';
    if(intent==='review') return 'Review mode checks what you previously struggled with. The goal is retrieval, not just rereading.';
    if(intent==='path') return 'Your Learning Path is the route. Tutor Brain is the controller: it can move you between teaching, practice, review and challenge as your performance changes.';
    if(intent==='profile') return 'Your current learning profile shows '+acc+' overall accuracy. I use accuracy, retention, repeated mistakes and recent performance together rather than relying on one score.';
    if(intent==='grammar') return 'I’ll switch the next activity toward Grammar while still using your overall profile to choose the difficulty and skill.';
    if(intent==='vocabulary') return 'I’ll switch the next activity toward Vocabulary and select a skill that matches your current learning needs.';
    if(intent==='teach') return 'Teaching mode: first I explain the idea simply, then show an example, then check whether you can use it yourself.';
    if(intent==='practice') return 'Practice mode: I’ll give you a focused four-option question and use your answer to update the next decision.';
    if(intent==='challenge') return 'Challenge mode increases difficulty only when your recent performance supports it.';
    if(intent==='next') return 'Next action: '+label+'. I’ll choose between Teach, Practice or Review based on your current signals.';
    return 'I’m here to help you learn. Ask me about your weak areas, a mistake, review, your learning path, vocabulary, grammar, or what to do next.';
  }
  function question(preferred){
    try{
      const t=v11(); if(t&&t.askQuestion) return t.askQuestion(preferred||null);
    }catch(e){}
    return null;
  }
  function decide(s,request){
    const snap=snapshot(), intent=classify(request||'next');
    let action={intent,mode:s.mode||'today',focus:focus(snap),reason:'Based on your current learning signals'};
    if(intent==='teach') action.mode='teach';
    else if(intent==='review'||intent==='mistake') action.mode=intent;
    else if(intent==='challenge') action.mode='challenge';
    else if(intent==='practice'||intent==='question') action.mode='practice';
    else if(intent==='path'||intent==='next') action.mode='today';
    s.lastAction=action;s.turns++;s.history.push({time:now(),request:String(request||''),action});
    if(s.history.length>30)s.history.shift(); save(s);
    return {action,snapshot:snap,message:response(intent,snap)};
  }
  function next(){return decide(load(),'next');}
  function ask(text){return decide(load(),text);}
  function current(){return snapshot();}
  function start(mode){const s=load();s.mode=mode||'today';s.startedAt=now();save(s);return decide(s,'next');}
  function reset(){const s=fresh();save(s);return s;}
  function systems(){return {vocabulary:!!v5(),grammar:!!v5(),mistake:!!v11(),review:!!v9(),learningPath:!!v8(),studentProfile:!!v10(),tutor:!!v11()};}
  window.APLUSAITutorBrainV12={version:12,load,save,snapshot,classify,decide,next,ask,current,start,reset,systems};
})();