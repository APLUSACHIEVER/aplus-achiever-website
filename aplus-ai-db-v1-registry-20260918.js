/* APLUS AI English Database V1 registry.
   Future versions should load this registry, then consume the named globals.
   Existing website files are not modified by this database layer.
*/
const APLUS_AI_DB_V1_REGISTRY={
 version:'1.0.0',
 files:[
  'aplus-ai-db-v1-config-20260918.js',
  'aplus-ai-db-v1-curriculum-map-20260918.js',
  'aplus-ai-db-v1-vocabulary-core-20260918.js',
  'aplus-ai-db-v1-grammar-core-20260918.js',
  'aplus-ai-db-v1-question-patterns-20260918.js',
  'aplus-ai-db-v1-learning-taxonomy-20260918.js'
 ],
 globals:['APLUS_AI_DB_V1_CONFIG','APLUS_AI_DB_V1_CURRICULUM','APLUS_AI_DB_V1_VOCABULARY','APLUS_AI_DB_V1_GRAMMAR','APLUS_AI_DB_V1_QUESTION_PATTERNS','APLUS_AI_DB_V1_SKILLS','APLUS_AI_DB_V1_MISTAKE_TYPES','APLUS_AI_DB_V1_REVIEW_RULES'],
 stats:{vocabularyCore:150,grammarCore:100,questionBlueprints:60,skills:21,mistakeTypes:20},
 loadScript(src){return new Promise((resolve,reject)=>{if(document.querySelector('script[src="'+src+'"]'))return resolve();const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});},
 async loadAll(base=''){for(const file of this.files)await this.loadScript(base+file);return this.ready();},
 ready(){return this.globals.every(k=>typeof window[k]!=='undefined');},
 getVocabulary(level){const d=window.APLUS_AI_DB_V1_VOCABULARY||[];return level?d.filter(x=>x.level===level):d;},
 getGrammar(level){const d=window.APLUS_AI_DB_V1_GRAMMAR||[];return level?d.filter(x=>x.level===level):d;},
 getPatterns(level,domain){return (window.APLUS_AI_DB_V1_QUESTION_PATTERNS||[]).filter(x=>(!level||x.level===level)&&(!domain||x.domain===domain));},
 getSkill(id){return (window.APLUS_AI_DB_V1_SKILLS||[]).find(x=>x.id===id);},
 getMistake(id){return (window.APLUS_AI_DB_V1_MISTAKE_TYPES||[]).find(x=>x.id===id);}
};
if(typeof window!=='undefined')window.APLUS_AI_DB_V1_REGISTRY=APLUS_AI_DB_V1_REGISTRY;