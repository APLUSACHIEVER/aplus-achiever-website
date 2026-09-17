/* APLUS AI Tutor Database V1 — P6 PSLE Paper 2 Master Blueprint
   Architecture layer only. APLUS-original generation metadata.
   Designed to compose complete Paper 2 practice papers without reproducing official papers.
*/
window.APLUS_AI_DB_V1_P6_PAPER2_BLUEPRINT = {
  version: "V1",
  level: "P6",
  assessment: "PSLE English Paper 2",
  totalMarks: 90,
  durationMinutes: 110,
  booklets: {
    A: [
      { component: "grammar", items: 10, marks: 10, mode: "mcq" },
      { component: "vocabulary", items: 5, marks: 5, mode: "mcq" },
      { component: "vocabulary_cloze", items: 5, marks: 5, mode: "mcq" },
      { component: "visual_text_comprehension", items: 5, marks: 5, mode: "mcq" }
    ],
    B: [
      { component: "grammar_cloze", items: 10, marks: 10, mode: "open_ended" },
      { component: "editing", items: 10, marks: 10, mode: "open_ended" },
      { component: "comprehension_cloze", items: 15, marks: 15, mode: "open_ended" },
      { component: "synthesis_transformation", items: 5, marks: 10, mode: "open_ended" },
      { component: "comprehension_open_ended", items: 10, marks: 20, mode: "open_ended" }
    ]
  },
  generationPolicy: {
    sourcePolicy: "APLUS_ORIGINAL",
    preserveMeaning: true,
    oneDefensibleAnswer: true,
    avoidOfficialPaperReproduction: true,
    avoidDuplicateConcepts: true,
    requireSkillCoverage: true,
    requireDifficultyBalance: true,
    requirePassageCoherence: true,
    requireDistractorValidation: true
  },
  difficultyProfiles: {
    standard: { low: 0.30, medium: 0.50, high: 0.20 },
    challenging: { low: 0.15, medium: 0.45, high: 0.40 },
    intensive: { low: 0.10, medium: 0.35, high: 0.55 },
    recovery: { low: 0.50, medium: 0.40, high: 0.10 }
  },
  cognitiveTargets: {
    literal: 0.35,
    inferential: 0.50,
    evaluative: 0.15
  },
  components: [
    "grammar",
    "vocabulary",
    "vocabulary_cloze",
    "visual_text_comprehension",
    "grammar_cloze",
    "editing",
    "comprehension_cloze",
    "synthesis_transformation",
    "comprehension_open_ended"
  ]
};
