/* APLUS P6 English Prelim — PSLE 2026 Paper 2 Format Engine V1 */
(function(){
'use strict';
const KEY='APLUS_P6_PRELIM_SESSION_V2';
const G=[
['The group of pupils ___ preparing for the science exhibition.',['is','are','were','have'],'is','subject-verb agreement'],
['By the time we reached the hall, the programme ___.',['had started','starts','will start','is starting'],'had started','past perfect'],
['Sarah ___ her homework before she went out to play.',['finished','has finished','finishing','finish'],'finished','past simple'],
['Neither of the boys ___ willing to give up.',['was','were','are','have'],'was','subject-verb agreement'],
['We have lived in Singapore ___ 2018.',['since','for','from','during'],'since','preposition'],
['You ___ bring your umbrella because it may rain later.',['should','would','did','has'],'should','modal verb'],
['There ___ enough water in the bottle for everyone.',['is','are','were','have'],'is','subject-verb agreement'],
['The pupils were tired, ___ they continued practising.',['but','because','unless','so that'],'but','conjunction'],
['This is the ___ painting in the exhibition.',['most colourful','more colourful','colourful','colourfully'],'most colourful','superlative'],
['Mum asked me where ___ my school bag.',['I had left','had I left','did I leave','I leave'],'I had left','embedded question']
];
const VC=[
['The mountain path was wet and slippery. The hikers moved very slowly because they wanted to be ___.',['cautious','generous','ancient','miserable'],'cautious'],
['Although Amir was nervous about speaking on stage, he finally agreed to go up. At first, he was ___.',['reluctant','swift','substantial','fragile'],'reluctant'],
['The art teacher was very ___. She checked every small detail before displaying the pupils’ work.',['meticulous','scarce','fortunate','miserable'],'meticulous'],
['The team kept practising even after losing several matches. Their ___. helped them improve.',['persistence','fragility','scarcity','fortune'],'persistence'],
['The old wooden fence became weaker after years of rain and sun. It began to ___.',['deteriorate','relieve','persist','recover'],'deteriorate']
];
const VISUAL=[
['SCHOOL ECO WEEK\nMonday–Friday\nBring a reusable bottle.\nUse the recycling bins correctly.\nSwitch off lights when you leave a room.\nFriday: Eco Challenge at 3.00 p.m. in the school hall.\nAll pupils are welcome.','Why are pupils encouraged to bring reusable bottles?',['To reduce waste','To join a sports team','To borrow books','To arrive earlier'],'To reduce waste','purpose'],
['SCHOOL ECO WEEK\nMonday–Friday\nBring a reusable bottle.\nUse the recycling bins correctly.\nSwitch off lights when you leave a room.\nFriday: Eco Challenge at 3.00 p.m. in the school hall.\nAll pupils are welcome.','When will the Eco Challenge take place?',['Friday at 3.00 p.m.','Monday at 3.00 p.m.','Friday at 5.00 p.m.','Thursday at 3.00 p.m.'],'Friday at 3.00 p.m.','retrieval'],
['SCHOOL ECO WEEK\nMonday–Friday\nBring a reusable bottle.\nUse the recycling bins correctly.\nSwitch off lights when you leave a room.\nFriday: Eco Challenge at 3.00 p.m. in the school hall.\nAll pupils are welcome.','Who may attend the Eco Challenge?',['All pupils','Teachers only','Parents only','School visitors only'],'All pupils','audience'],
['SCHOOL ECO WEEK\nMonday–Friday\nBring a reusable bottle.\nUse the recycling bins correctly.\nSwitch off lights when you leave a room.\nFriday: Eco Challenge at 3.00 p.m. in the school hall.\nAll pupils are welcome.','Which action is NOT mentioned in the notice?',['Planting trees','Using recycling bins','Switching off lights','Bringing a reusable bottle'],'Planting trees','detail'],
['SCHOOL ECO WEEK\nMonday–Friday\nBring a reusable bottle.\nUse the recycling bins correctly.\nSwitch off lights when you leave a room.\nFriday: Eco Challenge at 3.00 p.m. in the school hall.\nAll pupils are welcome.','What is the main purpose of the notice?',['To encourage pupils to take part in Eco Week','To announce a change in school hours','To advertise a sports competition','To remind pupils about homework'],'To encourage pupils to take part in Eco Week','main idea']
];
const GC=[
['By the time the pupils arrived, the teacher ___ the experiment.','had started','past perfect'],
['Sarah has not finished her project ___.','yet','present perfect'],
['The boys ___ quietly while the baby was sleeping.','spoke','past simple'],
['There ___ many books on the shelf.','are','subject-verb agreement'],
['If it rains tomorrow, we ___ indoors.','will stay','first conditional'],
['Mum bought ___ umbrella because it was raining.','an','article'],
['The teacher spoke to Jane and ___ brother.','her','possessive pronoun'],
['We arrived ___ the station before noon.','at','preposition'],
['The pupils were tired, ___ they continued working.','but','connector'],
['The boy ___ won the prize is my classmate.','who','relative pronoun']
];
const EDITING=[
['Neither of the boys were ready for the race.','was','subject-verb agreement'],['She has went to the library already.','gone','verb form'],['There are much equipment in the room.','is','uncountable noun / agreement'],['We arrived in the station at noon.','at','preposition'],['He is good in solving difficult puzzles.','at','preposition'],['The pupils was excited about the school trip.','were','subject-verb agreement'],['My sister enjoys to read before bedtime.','reading','gerund'],['We have lived here since three years.','for','preposition'],['Each of the players have a water bottle.','has','subject-verb agreement'],['The teacher asked me where was my book.','my book was','embedded question'],['He ran quick to catch the bus.','quickly','adverb'],['I prefer walking than taking the bus.','to','verb/preposition collocation'],['The news are surprising.','is','subject-verb agreement'],['She is interested to join the art club.','in joining','preposition / gerund'],['If it rains tomorrow, we stayed at home.','will stay','first conditional']
];
const CC=[['Mia forgot her umbrella. When dark clouds appeared, her friend offered to share one with her. Mia felt ___ by the kind gesture.','grateful','emotion inference'],['The plants were watered regularly; ___, they grew well.','therefore','cause and effect'],['The path was slippery because it had rained. The pupils walked ___.','carefully','word form'],['Ben could not lift the heavy box, so he asked his sister for ___.','help','word form'],['The children wanted to continue playing outside. ___, the rain became heavier.','However','contrast / cohesion']];
const SYN=[['Tom was very tired. He finished his homework. Combine the sentences using “although”.','Although Tom was very tired, he finished his homework.','although'],['The rain was heavy. The match was cancelled. Combine the sentences using “because”.','The match was cancelled because the rain was heavy.','because'],['The bag was too heavy for Sara to lift. Rewrite using “not ... enough”.','The bag was not light enough for Sara to lift.','enough'],['The room was so noisy that I could not concentrate. Rewrite using “too ... to”.','The room was too noisy for me to concentrate.','too ... to'],['He left early because he wanted to catch the bus. Rewrite using “so that”.','He left early so that he could catch the bus.','purpose']];
const CA=[['Mia found a wallet near the school gate. She handed it to the general office without opening it.','What does this show about Mia?','She is honest and responsible.'],['The school garden was once an empty patch of soil. After pupils planted vegetables, neighbours began visiting and helping them.','What was one important benefit of the garden?','It brought the school community closer.'],['Jay noticed that his shoelace was loose before a race. He stopped to tie it before running.','Why did Jay stop?','He wanted to avoid tripping.'],['The old bridge was closed after heavy rain made its surface slippery. Pupils were told to use the longer path instead.','Why did pupils use the longer path?','It was safer than the slippery bridge.'],['Lina had practised many times. On the day of the performance, she felt nervous but continued playing until the end.','What can we infer about Lina?','She perseveres even when she feels nervous.'],['A class collected used books and sorted them before giving them to a community centre.','Why did the pupils sort the books?','To organise the books before donating them.'],['The inventor tested a machine several times. When it failed, he changed one part and tested it again.','What quality did the inventor show?','He was persistent and willing to improve.'],['The rain stopped just before the outdoor event began. The pupils moved the chairs outside and started preparing.','What happened after the rain stopped?','The pupils prepared the outdoor event.'],['A notice reminded pupils to bring reusable bottles because the school wanted to reduce plastic waste.','What was the purpose of the notice?','To encourage pupils to reduce plastic waste.'],['Sara borrowed an umbrella because dark clouds were gathering.','Why did Sara borrow the umbrella?','She expected that it might rain.']];
const CB=[['The community garden produced vegetables, but watering the plants regularly was difficult. The pupils created a rota so different pupils could take turns.','Why did the pupils create a rota?','To make sure the plants were watered regularly.'],['A boy found a damaged bicycle beside a bin. Instead of throwing it away, he repaired it.','What does his action suggest?','He believes useful items should be repaired and reused.'],['The library introduced a quiet reading hour every Wednesday afternoon. Pupils had to keep their voices low and switch off their devices.','What was the main purpose of the reading hour?','To give pupils a quiet time to read.'],['When the power failed during a school reading event, the organisers gave pupils torches and moved the activity to a brighter area.','How did the organisers respond to the problem?','They changed the arrangements so the event could continue.'],['Amir planted seeds in dry soil but forgot to water them. After several days, the seeds did not grow.','Why did the seeds not grow?','The soil did not have enough water.'],['The pupils thought an old note was unimportant. Later, they discovered that it described an event from the school’s early history.','Why did they change their opinion of the note?','They discovered that it had historical value.'],['A volunteer repaired a footbridge and placed a warning sign while the final inspection was being completed.','Why was the warning sign necessary?','To warn people while the bridge was still being checked.'],['A class tried to build a model shelter. Their first design collapsed, so they strengthened the base and tried again.','What did the pupils learn from the failure?','They learned to improve their design after testing it.'],['A student lent his umbrella to a classmate who had forgotten one. He then walked home carefully in the light rain.','What does this show about the student?','He was considerate towards his classmate.'],['The school replaced broken taps with water-saving ones. After the change, less water was used each month.','What was the result of replacing the taps?','The school used less water.']];
function oe(id,section,booklet,name,passage,q,a,marks,skill,type){return{id,section,sectionName:name,booklet,passage,question:q,answer:a,acceptedPatterns:[a],marks,skill,difficulty:3,type:type||'text',sourceType:'APLUS_ORIGINAL'}}
function mcq(id,section,name,booklet,passage,q,opts,a,skill){return{id,section,sectionName:name,booklet,passage,question:q,options:opts,answer:a,marks:1,skill,difficulty:3,type:'mcq',sourceType:'APLUS_ORIGINAL'}}
function apply(){
 let s;try{s=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){return}
 if(!s||!Array.isArray(s.questions)||s.questions.length!==75||s.psleFormatVersion==='2026.2')return;
 const old=s.questions;
 const vocab=old.filter(q=>q.section==='vocabulary').slice(0,5);
 const grammar=G.map((x,i)=>mcq(`grammar-${i+1}`,'grammar','BOOKLET A · Grammar','A','',`Choose the correct answer. ${x[0]}`,x[1],x[2],x[3]));
 const vc=VC.map((x,i)=>mcq(`vcloze-${i+1}`,'vocabularyCloze','BOOKLET A · Vocabulary Cloze','A','Read the passage and choose the word that best completes each blank.',x[0],x[1],x[2],'context vocabulary'));
 const visual=VISUAL.map((x,i)=>mcq(`visual-${i+1}`,'visual','BOOKLET A · Visual Text','A',x[0],x[1],x[2],x[3],x[4]));
 const ca=CA.map((x,i)=>oe(`compA-${i+1}`,'comprehensionA','A','BOOKLET A · Comprehension',x[0],x[1],x[2],1,'comprehension','text'));
 const gc=GC.map((x,i)=>oe(`gcloze-${i+1}`,'grammarCloze','B','BOOKLET B · Grammar Cloze','Complete the passage by writing the correct word in each blank.',x[0],x[1],1,x[2],'text'));
 const ed=EDITING.map((x,i)=>oe(`editing-${i+1}`,'editing','B','BOOKLET B · Editing for Spelling and Grammar','Correct the underlined word or phrase. Write the correct answer.','Incorrect: '+x[0],x[1],1,x[2],'editing'));
 const cc=CC.map((x,i)=>oe(`cc-${i+1}`,'comprehensionCloze','B','BOOKLET B · Comprehension Cloze','Complete the passage with a suitable word.',x[0],x[1],1,x[2],'text'));
 const syn=SYN.map((x,i)=>oe(`syn-${i+1}`,'synthesis','B','BOOKLET B · Synthesis and Transformation','Rewrite the sentences as instructed.',x[0],x[1],2,x[2],'text'));
 const cb=CB.map((x,i)=>oe(`compB-${i+1}`,'comprehensionB','B','BOOKLET B · Comprehension',x[0],x[1],x[2],2,'comprehension','text'));
 let all=[...grammar,...vocab,...vc,...visual,...ca,...gc,...ed,...cc,...syn,...cb];let n=1;all.forEach(q=>q.number=n++);
 s.questions=all;s.total=90;s.psleFormatVersion='2026.2';s.formatSummary={bookletA:{grammar:10,vocabulary:5,vocabularyCloze:5,visualText:5,comprehensionOE:10},bookletB:{grammarCloze:10,editingForSpellingAndGrammar:15,comprehensionCloze:5,synthesisTransformation:5,comprehensionOE:10},mcqItems:25,openEndedItems:50,totalItems:75,totalMarks:90,durationMinutes:110};
 localStorage.setItem(KEY,JSON.stringify(s));location.reload();
}
window.APLUS_P6_PRELIM_PSLE_FORMAT_V1={apply};
const start=document.getElementById('startBtn');if(start)start.addEventListener('click',()=>setTimeout(apply,60),false);
})();
