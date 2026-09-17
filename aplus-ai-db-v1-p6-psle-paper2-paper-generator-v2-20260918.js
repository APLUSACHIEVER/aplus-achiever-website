/* APLUS P6 PSLE Paper 2 Master Database V1 — Paper Generator V2 */
window.APLUS_AI_DB_V1_P6_PSLE_PAPER2_PAPER_GENERATOR_V2 = {
 version:'2.0',
 exam:{title:'APLUS P6 English Prelim',subtitle:'PSLE-Style English Language Examination',paper:'Paper 2 — Language Use and Comprehension',questions:75,marks:90,durationMinutes:110},
 blueprint:[
  {id:'grammar',count:10,marks:10,source:'grammarDNA'},
  {id:'vocabulary',count:5,marks:5,source:'vocabularyDNA'},
  {id:'vocabularyCloze',count:5,marks:5,source:'vocabularyClozeDNA'},
  {id:'visual',count:5,marks:5,source:'visualTextDNA'},
  {id:'grammarCloze',count:10,marks:10,source:'grammarClozeDNA'},
  {id:'editing',count:10,marks:10,source:'editingDNA'},
  {id:'comprehensionCloze',count:15,marks:15,source:'comprehensionClozeDNA'},
  {id:'synthesis',count:5,marks:10,source:'synthesisDNA'},
  {id:'comprehension',count:10,marks:20,source:'passageDNA'}
 ],
 profiles:{
  standard:{difficulty:[2,3,4],skills:'balanced'},
  hard:{difficulty:[3,4,5],skills:'balanced'},
  vocabularyIntensive:{difficulty:[2,3,4,5],skills:['vocabulary','context','word_form']},
  grammarIntensive:{difficulty:[2,3,4,5],skills:['agreement','tense','articles','connectors','grammar']},
  comprehensionIntensive:{difficulty:[3,4,5],skills:['inference','main_idea','cause_effect','author_intent','summary']},
  psleSimulation:{difficulty:[2,3,4,5],skills:'balanced',requirePassageSet:true},
  studentWeakness:{difficulty:[2,3,4,5],skills:'fromStudentProfile'}
 },
 selectionOrder:['studentProfile','profile','sectionBlueprint','skillBalance','difficulty','misconceptionCoverage','unusedRecord','distractorValidation','duplicateCheck','answerDistribution','finalValidation'],
 validation:{oneDefensibleAnswer:true,minimumOptions:4,avoidRepeatedStem:true,avoidRepeatedPassage:true,avoidDuplicateQuestionDNA:true,avoidAmbiguousSynonyms:true,avoidClueGiving:true,acceptedPatternsRequiredForSynthesis:true},
 answerBalance:{target:'balanced',maxSameAnswerRun:2},
 adaptive:{inputs:['accuracyBySection','accuracyBySkill','recentMistakes','misconceptions','mastery','reviewDue'],outputs:['sectionWeight','skillPriority','difficultyBand','recoveryRate','challengeRate']},
 paperId:{prefix:'APLUS-P6-ENG-P2',format:'APLUS-P6-ENG-P2-YYYY-######'},
 dataLineage:{rule:'Every generated item must retain sourceDatabase, sourceRecordId, skill, difficulty and generationSeed.'},
 integrity:{label:'APLUS-original PSLE-style practice; syllabus-aligned; not an official SEAB examination paper.'}
};