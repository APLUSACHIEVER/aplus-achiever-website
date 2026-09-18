/* APLUS SCIENCE PRACTICE UI V2 */
(function(){
"use strict";
const qs=new URLSearchParams(location.search), paperId=qs.get("paperId")||qs.get("id");
const E=window.APLUS_SCIENCE_PRACTICE_V2, bank=E.getQuestions(paperId);
const root=document.getElementById("sciencePractice");
if(!root)return;
if(!bank.length){root.innerHTML='<div class="science-empty"><h2>Question bank not attached yet</h2><p>This paper is catalogued. Add authorised question data to the Science question bank to enable online practice.</p></div>';return;}
let s=E.start(paperId,"practice");
function render(){
 const q=bank[s.index]; if(!q){finish();return;}
 const options=(q.options||[]).map((o,i)=>'<button class="science-option" data-v="'+String.fromCharCode(65+i)+'">'+String.fromCharCode(65+i)+'. '+o+'</button>').join("");
 root.innerHTML='<div class="science-practice-head"><span>Question '+(s.index+1)+' / '+bank.length+'</span><span>'+Number(q.marks||0)+' marks</span></div><article class="science-question"><div class="science-q-meta">'+(q.topic||"Science")+' · '+(q.skill||"Scientific reasoning")+'</div><h2>'+q.question+'</h2>'+(q.type==="mcq"?'<div class="science-options">'+options+'</div>':'<textarea id="scienceAnswer" rows="5" placeholder="Type your answer here..."></textarea><button id="saveStructured" class="science-primary">Save Answer</button>')+'</article>';
 root.querySelectorAll(".science-option").forEach(b=>b.onclick=()=>{E.answer(q.id,b.dataset.v);s=E.load();s.index++;E.start(paperId,"practice");s=E.load();s.index=Number(s.index||0);saveIndex();});
 const save=document.getElementById("saveStructured");if(save)save.onclick=()=>{E.answer(q.id,document.getElementById("scienceAnswer").value);s=E.load();s.index++;saveIndex()};
}
function saveIndex(){localStorage.setItem("APLUS_SCIENCE_UI_INDEX",String(s.index));render()}
function finish(){s=E.submit();root.innerHTML='<div class="science-result"><h2>Practice Complete</h2><p>'+s.earned+' / '+s.max+'</p><p>Results have been recorded for your learning analytics.</p><a href="progress.html">View Progress</a></div>'}
const saved=Number(localStorage.getItem("APLUS_SCIENCE_UI_INDEX")||0);s.index=saved;render();
})();