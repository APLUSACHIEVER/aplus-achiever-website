/* APLUS AI Tutor V7 — Explain -> Example -> Check -> Retest
   Standalone teaching orchestrator. Existing files are untouched.
*/
(function(){'use strict';
const KEY='APLUS_AI_TUTOR_V7_STATE';
const BANK=[
{id:'v7-reluctant',area:'vocabulary',skill:'meaning',term:'reluctant',prompt:'The boy was ______ to speak in front of the whole class because he felt nervous.',options:['reluctant','eager','proud','careless'],answer:0,explain:'Reluctant means not willing or not eager to do something. The clue “felt nervous” shows that the boy did not want to speak.',example:'Mia was reluctant to answer because she was unsure of herself.',check:'If a student is reluctant to join a new club, the student is most likely…',checkOptions:['unwilling','excited','certain','careless'],checkAnswer:0},
{id:'v7-sv',area:'grammar',skill:'subject-verb agreement',term:'subject-verb agreement',prompt:'The list of items ______ on the teacher’s desk.',options:['is','are','were','have'],answer:0,explain:'The main subject is “list”, which is singular. “Of items” is only a phrase describing the list.',example:'The list of names is on the table.',check:'Which sentence is correct?',checkOptions:['The group of students is ready.','The group of students are ready.','The group of students were ready.','The group of students have ready.'],checkAnswer:0}
];
function fresh(){return{version:7,stage:'idle',question:null,selected:null,lastResult:null,history:[],sessionCorrect:0,sessionAttempts:0};}
function load(){try{const s=JSON.parse(localStorage.getItem(KEY));return s&&s.version===7?s:fresh()}catch(e){return fresh()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function choose(q){return q||BANK[Math.floor(Math.random()*BANK.length)]}
function start(q){const s=load();s.stage='explain';s.question=choose(q);s.selected=null;s.lastResult=null;return save(s)}
function current(){return load().question}
function explain(){const s=load();if(!s.question)return start();s.stage='example';return save(s)}
function example(){const s=load();if(!s.question)return start();s.stage='check';return save(s)}
function check(index){const s=load(),q=s.question;if(!q)return start();const correct=index===q.checkAnswer;s.selected=index;s.lastResult={stage:'check',correct};s.sessionAttempts++;if(correct)s.sessionCorrect++;s.stage=correct?'retest':'explain';return save(s)}
function retest(){const s=load();if(!s.question)return start();s.stage='retest';s.selected=null;return save(s)}
function answerRetest(index){const s=load(),q=s.question;if(!q)return start();const correct=index===q.answer;s.selected=index;s.lastResult={stage:'retest',correct};s.sessionAttempts++;if(correct)s.sessionCorrect++;s.stage=correct?'complete':'example';return save(s)}
function next(){const s=load();s.question=null;s.stage='idle';s.selected=null;s.lastResult=null;return save(s)}
function progress(){const s=load();return{stage:s.stage,attempts:s.sessionAttempts,correct:s.sessionCorrect,accuracy:s.sessionAttempts?s.sessionCorrect/s.sessionAttempts:0,question:s.question}}
function bank(){return BANK.slice()}
function reset(){return save(fresh())}
window.APLUSAITutorV7={version:7,load,save,bank,start,current,explain,example,check,retest,answerRetest,next,progress,reset};
})();