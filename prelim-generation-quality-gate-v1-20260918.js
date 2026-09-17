/* APLUS P6 English Prelim — Generation Quality Gate V1
   Validates generated papers before they reach the examination UI.
*/
(function(){'use strict';
const G=window.APLUS_P6_PSLE_PAPER2_GENERATION_V1;if(!G)return;
const original=G.generate;
function norm(s){return String(s??'').toLowerCase().replace(/[“”‘’".,!?;:()[\]{}]/g,' ').replace(/\s+/g,' ').trim()}
function answerBalance(p){let c={A:0,B:0,C:0,D:0};p.filter(q=>q.type==='mcq').forEach(q=>{let i=q.options.findIndex(x=>norm(x)===norm(q.answer));if(i>=0)c['ABCD'[i]]++});return c}
function check(p){if(!Array.isArray(p)||p.length!==75)return{ok:false,reason:'question_count'};if(p.reduce((s,q)=>s+(Number(q.marks)||0),0)!==90)return{ok:false,reason:'mark_total'};let stems=new Set();for(const q of p){let st=norm(q.question);if(!st||stems.has(st))return{ok:false,reason:'duplicate_stem'};stems.add(st);if(q.type==='mcq'){if(!Array.isArray(q.options)||q.options.length!==4)return{ok:false,reason:'mcq_options'};if(new Set(q.options.map(norm)).size!==4)return{ok:false,reason:'duplicate_options'};if(!q.options.some(x=>norm(x)===norm(q.answer)))return{ok:false,reason:'missing_answer'}}}let b=answerBalance(p),vals=Object.values(b),max=Math.max(...vals),min=Math.min(...vals);if(max-min>5)return{ok:false,reason:'answer_imbalance',balance:b};return{ok:true,balance:b}}
G.generate=function(options={}){let base=options.seed||Math.floor(Math.random()*4294967295);let last=null;for(let i=0;i<8;i++){let seed=(base+i*2654435761)>>>0;let r=original(Object.assign({},options,{seed}));if(!r||!r.ok){last=r;continue}let q=check(r.paper);if(q.ok){r.qualityGate=q;r.seed=seed;return r}last={ok:false,error:'Generation quality gate rejected the paper.',diagnostics:q}}return last||{ok:false,error:'Generation quality gate rejected all attempts.'}};
G.qualityGateVersion='1.0';
})();