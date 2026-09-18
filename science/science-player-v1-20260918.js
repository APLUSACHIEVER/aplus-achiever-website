/* APLUS PSLE SCIENCE PAPER PLAYER V1 */
(function(){
  'use strict';
  const E=window.APLUS_SCIENCE_ENGINE_V1;
  function esc(v){return String(v==null?'':v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
  function qs(k){return new URLSearchParams(location.search).get(k)||'';}
  function render(root){
    const p=E&&E.getById(qs('id'));
    if(!p){root.innerHTML='<div class="notice"><strong>Paper not found.</strong><p>Return to the Science paper archive and select a paper.</p></div>';return;}
    const hasFile=!!p.file;
    root.innerHTML=
      '<div class="paper-top"><div><a href="papers.html">← School Papers</a><h1>'+esc(p.school)+' · '+esc(p.year)+'</h1><p>'+esc(p.type)+' · Primary 6 Science</p></div><div class="paper-badge">'+(hasFile?'READY':'CATALOGUED')+'</div></div>'+
      (hasFile
        ? '<iframe class="paper-frame" src="../'+esc(p.file)+'" title="Science paper"></iframe>'
        : '<div class="paper-empty"><div class="empty-icon">SCI</div><h2>Paper is catalogued</h2><p>The paper metadata is ready in the APLUS Science engine. The original authorised PDF has not yet been attached to this record.</p><p><strong>Next step:</strong> upload the authorised PDF to the Science paper folder and add its path to the inventory record.</p></div>');
  }
  window.APLUS_SCIENCE_PLAYER_V1={render};
})();