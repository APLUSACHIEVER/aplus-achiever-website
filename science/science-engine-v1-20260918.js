/* APLUS PSLE SCIENCE ENGINE V1 — inventory, paper selection, attempts, progress */
(function(){
  'use strict';
  const KEY='APLUS_SCIENCE_PROGRESS_V1';
  function all(){
    return [].concat(
      window.APLUS_SCIENCE_PAPER_INVENTORY_BATCH01||[],
      window.APLUS_SCIENCE_PAPER_INVENTORY_BATCH02||[],
      window.APLUS_SCIENCE_PAPER_INVENTORY_BATCH03||[]
    );
  }
  function uid(){return 'SCI-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);}
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
  function save(x){localStorage.setItem(KEY,JSON.stringify(x));return x}
  function normalise(p){
    return Object.assign({
      id:'',year:'',school:'',type:'',subject:'Science',level:'Primary 6',
      sourceName:'',sourceSite:'',status:'catalogued',file:'',questions:[],
      licensed:false
    },p||{});
  }
  const api={
    version:'1.0',
    inventory:all().map(normalise),
    getById(id){return this.inventory.find(p=>p.id===id)||null},
    years(){return [...new Set(this.inventory.map(p=>p.year))].sort((a,b)=>b-a)},
    schools(){return [...new Set(this.inventory.map(p=>p.school))].sort()},
    types(){return [...new Set(this.inventory.map(p=>p.type))].sort()},
    filter({year='',school='',type='',q=''}={}){
      const s=String(q||'').toLowerCase().trim();
      return this.inventory.filter(p=>
        (!year||String(p.year)===String(year)) &&
        (!school||p.school===school) &&
        (!type||p.type===type) &&
        (!s||[p.school,p.type,p.year,p.sourceName].join(' ').toLowerCase().includes(s))
      );
    },
    progress(){return load()},
    recordAttempt(data){
      const x=load(); const id=uid();
      x.attempts=x.attempts||[];
      x.attempts.push(Object.assign({id,at:Date.now()},data||{}));
      save(x); return x.attempts[x.attempts.length-1];
    },
    stats(){
      const a=(load().attempts||[]);
      const attempted=new Set(a.map(x=>x.paperId));
      const scores=a.filter(x=>typeof x.score==='number');
      const avg=scores.length?scores.reduce((s,x)=>s+x.score,0)/scores.length:0;
      return {papers:this.inventory.length,attempted:attempted.size,attempts:a.length,average:Math.round(avg*10)/10};
    }
  };
  window.APLUS_SCIENCE_ENGINE_V1=api;
})();