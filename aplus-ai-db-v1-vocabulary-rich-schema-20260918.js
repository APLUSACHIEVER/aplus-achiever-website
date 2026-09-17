/* APLUS AI English Database V1 — Tutor Brain Training Schema
   Existing schema upgraded in place.
   Backward-compatible with the original vocabulary fields.
   All training metadata is English-only.
*/
const APLUS_AI_DB_V1_VOCABULARY_SCHEMA={
version:'2.0',
required:['id','level','subject','domain','word','definition','synonym','antonym','collocations','examples','difficulty','skills','commonMistakes'],
core:{id:'Stable unique identifier used across Tutor Brain links',level:'P3-P5 learner level',subject:'English vocabulary domain',domain:'Semantic or curriculum domain',word:'Target lexical item',definition:'Student-friendly meaning in the intended sense',synonym:'Closest practical synonym; avoid misleading near-synonyms',antonym:'Clear contextual opposite where one exists',collocations:'Natural word combinations useful for Singapore primary English',examples:'Original age-appropriate examples',difficulty:'Initial difficulty from 1-5; may be recalibrated from learner evidence',skills:'Specific assessable skills',commonMistakes:'Likely learner errors used for diagnosis'},
difficulty:{1:'foundation',2:'developing',3:'secure',4:'advanced',5:'challenging'},
tutorBrain:{
role:'Training data for adaptive tutoring, diagnosis, question generation, review, and mastery tracking',
selectionSignals:['skillNeed','mistakeHistory','reviewDue','difficultyFit','recentAccuracy','responseTime','confidence','masteryState'],
questionPolicy:['one defensible answer','plausible distractors','clear contextual evidence','no accidental ambiguity','age-appropriate language','fresh context for review'],
feedbackPolicy:['identify the tested skill','explain the decisive clue','name the misconception when detected','show the correct usage','avoid unnecessary information overload'],
progression:['recognition','guided_recall','independent_recall','contextual_usage','transfer','mastery_confirmation'],
recovery:['reduce cognitive load','preserve the same target skill','change the surface context','retest after explanation'],
mastery:['require repeated evidence','separate correctness from confidence','use transfer questions before declaring stable mastery']},
trainingFields:{
partOfSpeech:'Required grammatical role when relevant',
wordFamily:'Linked forms of the target word',
phonics:'Useful pronunciation or sound-pattern information',
syllableCount:'Number of syllables where useful',
pronunciation:'Student-friendly pronunciation support where available',
register:'formal, neutral, informal, or context-specific usage',
contextClues:'Clue types that can reveal the intended meaning',
confusableWords:'Words commonly confused with the target',
questionTemplates:'Question DNA identifiers suitable for this record',
reviewIntervals:'Suggested review spacing after successful retrieval',
masteryThreshold:'Evidence required before the skill is treated as stable',
diagnosticCues:'Observable answer patterns that indicate specific misconceptions',
misconceptionTags:'Stable identifiers for common learner misconceptions',
prerequisiteSkills:'Skills that should normally be secure first',
progressionSkills:'Next skills that can be trained after mastery',
linkedRecords:'IDs of related vocabulary, collocation, confusable, word-family, grammar, or question records',
primarySkill:'Single main skill being trained',
secondarySkills:'Supporting skills trained in the same item',
questionDna:'Preferred generator DNA types for this target',
validityChecks:'Checks required before a generated question is released',
sourceLicense:'License or provenance classification',
sourceAttribution:'Attribution when external licensed material is used'},
answerEvidence:{required:['semanticFit','grammaticalFit','collocationFit'],optional:['contextClueFit','spellingFit','wordFormFit'],rule:'A generated item should be rejected if more than one option remains reasonably defensible'},
diagnosticModel:{correct:{signals:['correct answer','appropriate confidence','stable response time'],possibleState:'secure_or_progressing'},wrong:{signals:['wrong answer'],possibleStates:['misconception','retrieval_gap','context_gap','word_form_gap','collocation_gap','confusable_gap','careless_error']},confidence:{highCorrect:'evidence supports stable knowledge',highWrong:'possible misconception or overconfidence',lowCorrect:'possible fragile knowledge',lowWrong:'possible retrieval weakness or uncertainty'}},
reviewModel:{states:['new','learning','review_due','fragile','secure','mastered','recovery'],priorityOrder:['overdue_review','repeated_mistake','fragile_skill','new_learning','standard_practice','mastery_challenge'],intervals:[1,3,7,14,30]},
qualityRules:{definition:'student-friendly and sense-specific',synonym:'must fit the intended context',antonym:'must be a defensible opposite in context',collocations:'must be natural and standard',examples:'must be original and age-appropriate',difficulty:'1-5 with evidence-based recalibration',skills:'must be observable through assessment',commonMistakes:'must describe realistic learner errors',questionTemplates:'must map to an existing Question DNA type',links:'referenced IDs must be stable and compatible',copyright:'Do not copy protected exam questions; use licensed material or generate APLUS-original variations'},
compatibility:{originalVersion:'1.0',preserveOriginalFields:true,unknownFieldsAllowed:true,missingTrainingFields:'Use safe defaults until the record is enriched',migrationStrategy:'Enrich existing records incrementally without deleting or replacing original learning data'},
futureExpansion:['grammarLinks','readingComprehensionLinks','studentAbilitySignals','adaptiveWeights','mistakeRecoveryPath','reviewHistory','masteryEvidence','transferContexts','questionPerformanceStats']
};
if(typeof window!=='undefined') window.APLUS_AI_DB_V1_VOCABULARY_SCHEMA=APLUS_AI_DB_V1_VOCABULARY_SCHEMA;
