const vocabulary = [

    /* =========================
       LEVEL 1 — FOUNDATION
       ========================= */

    {
        id: 1,
        word: "happy",
        level: 1,
        partOfSpeech: "adjective",
        meaning: "feeling pleased or joyful",
        chinese: "开心的；快乐的",
        synonyms: ["joyful", "cheerful"],
        antonyms: ["sad", "unhappy"],
        example: "She was happy to receive the gift.",
        topics: ["feelings"],
        questionTypes: ["meaning", "synonym", "context"]
    },

    {
        id: 2,
        word: "sad",
        level: 1,
        partOfSpeech: "adjective",
        meaning: "feeling unhappy",
        chinese: "悲伤的",
        synonyms: ["unhappy", "upset"],
        antonyms: ["happy", "cheerful"],
        example: "The boy felt sad when his toy broke.",
        topics: ["feelings"],
        questionTypes: ["meaning", "synonym", "context"]
    },

    {
        id: 3,
        word: "angry",
        level: 1,
        partOfSpeech: "adjective",
        meaning: "feeling strong displeasure",
        chinese: "生气的",
        synonyms: ["furious", "mad"],
        antonyms: ["calm", "pleased"],
        example: "Mum was angry when she saw the mess.",
        topics: ["feelings"],
        questionTypes: ["meaning", "synonym", "context"]
    },

    {
        id: 4,
        word: "big",
        level: 1,
        partOfSpeech: "adjective",
        meaning: "large in size",
        chinese: "大的",
        synonyms: ["large", "huge"],
        antonyms: ["small", "tiny"],
        example: "There was a big tree in the garden.",
        topics: ["description"],
        questionTypes: ["meaning", "synonym"]
    },

    {
        id: 5,
        word: "small",
        level: 1,
        partOfSpeech: "adjective",
        meaning: "little in size",
        chinese: "小的",
        synonyms: ["little", "tiny"],
        antonyms: ["big", "large"],
        example: "The puppy was very small.",
        topics: ["description"],
        questionTypes: ["meaning", "synonym"]
    },

    {
        id: 6,
        word: "fast",
        level: 1,
        partOfSpeech: "adjective",
        meaning: "moving quickly",
        chinese: "快速的",
        synonyms: ["quick", "rapid"],
        antonyms: ["slow"],
        example: "The cheetah is a very fast animal.",
        topics: ["description", "nature"],
        questionTypes: ["meaning", "synonym", "context"]
    },

    {
        id: 7,
        word: "slow",
        level: 1,
        partOfSpeech: "adjective",
        meaning: "moving at a low speed",
        chinese: "缓慢的",
        synonyms: ["unhurried"],
        antonyms: ["fast", "quick"],
        example: "The turtle moved slowly across the road.",
        topics: ["description", "nature"],
        questionTypes: ["meaning", "synonym"]
    },

    {
        id: 8,
        word: "kind",
        level: 1,
        partOfSpeech: "adjective",
        meaning: "caring and helpful towards others",
        chinese: "善良的",
        synonyms: ["caring", "gentle"],
        antonyms: ["unkind", "cruel"],
        example: "It was kind of Sarah to help the elderly man.",
        topics: ["character"],
        questionTypes: ["meaning", "synonym", "context"]
    },

    {
        id: 9,
        word: "brave",
        level: 1,
        partOfSpeech: "adjective",
        meaning: "willing to face danger or difficulty",
        chinese: "勇敢的",
        synonyms: ["courageous", "bold"],
        antonyms: ["cowardly", "afraid"],
        example: "The brave boy rescued the kitten.",
        topics: ["character"],
        questionTypes: ["meaning", "synonym", "context"]
    },

    {
        id: 10,
        word: "tired",
        level: 1,
        partOfSpeech: "adjective",
        meaning: "needing rest or sleep",
        chinese: "疲倦的",
        synonyms: ["exhausted", "weary"],
        antonyms: ["energetic", "active"],
        example: "I was tired after the long journey.",
        topics: ["feelings", "health"],
        questionTypes: ["meaning", "synonym", "context"]
    },

    /* =========================
       LEVEL 2
       ========================= */

    {
        id: 101,
        word: "anxious",
        level: 2,
        partOfSpeech: "adjective",
        meaning: "worried or nervous about something",
        chinese: "焦虑的；担心的",
        synonyms: ["worried", "nervous"],
        antonyms: ["calm", "relaxed"],
        example: "Sarah felt anxious before the examination.",
        topics: ["feelings", "school"],
        questionTypes: ["meaning", "synonym", "context"]
    },

    {
        id: 102,
        word: "curious",
        level: 2,
        partOfSpeech: "adjective",
        meaning: "wanting to know or learn something",
        chinese: "好奇的",
        synonyms: ["inquisitive", "interested"],
        antonyms: ["uninterested"],
        example: "The curious child wanted to know what was inside the box.",
        topics: ["character", "learning"],
        questionTypes: ["meaning", "synonym", "context"]
    },

    {
        id: 103,
        word: "generous",
        level: 2,
        partOfSpeech: "adjective",
        meaning: "willing to give or share with others",
        chinese: "慷慨的",
        synonyms: ["giving", "charitable"],
        antonyms: ["selfish", "stingy"],
        example: "The generous man donated food to the needy.",
        topics: ["character", "society"],
        questionTypes: ["meaning", "synonym", "context"]
    },

    {
        id: 104,
        word: "careful",
        level: 2,
        partOfSpeech: "adjective",
        meaning: "taking care to avoid mistakes or danger",
        chinese: "小心的；谨慎的",
        synonyms: ["cautious", "alert"],
        antonyms: ["careless", "reckless"],
        example: "Be careful when crossing the busy road.",
        topics: ["safety"],
        questionTypes: ["meaning", "synonym", "context"]
    },

    {
        id: 105,
        word: "confident",
        level: 2,
        partOfSpeech: "adjective",
        meaning: "feeling sure about your abilities",
        chinese: "有信心的",
        synonyms: ["self-assured", "certain"],
        antonyms: ["uncertain", "insecure"],
        example: "She felt confident before giving her speech.",
        topics: ["character", "school"],
        questionTypes: ["meaning", "synonym", "context"]
    },

    /* =========================
       LEVEL 3
       ========================= */

    {
        id: 201,
        word: "reluctant",
        level: 3,
        partOfSpeech: "adjective",
        meaning: "unwilling or hesitant to do something",
        chinese: "不情愿的；犹豫的",
        synonyms: ["unwilling", "hesitant"],
        antonyms: ["willing", "eager"],
        example: "Tom was reluctant to join the competition.",
        topics: ["character", "school"],
        questionTypes: ["meaning", "synonym", "context", "cloze"]
    },

    {
        id: 202,
        word: "persistent",
        level: 3,
        partOfSpeech: "adjective",
        meaning: "continuing despite difficulties",
        chinese: "坚持不懈的",
        synonyms: ["determined", "persevering"],
        antonyms: ["giving up"],
        example: "Her persistent efforts eventually paid off.",
        topics: ["character", "education"],
        questionTypes: ["meaning", "synonym", "context", "cloze"]
    },

    {
        id: 203,
        word: "responsible",
        level: 3,
        partOfSpeech: "adjective",
        meaning: "having a duty to deal with something properly",
        chinese: "负责任的",
        synonyms: ["reliable", "dependable"],
        antonyms: ["irresponsible"],
        example: "James is responsible for feeding the class hamster.",
        topics: ["character", "school"],
        questionTypes: ["meaning", "context", "cloze"]
    },

    {
        id: 204,
        word: "fortunate",
        level: 3,
        partOfSpeech: "adjective",
        meaning: "having good luck",
        chinese: "幸运的",
        synonyms: ["lucky", "blessed"],
        antonyms: ["unfortunate", "unlucky"],
        example: "We were fortunate to find shelter before the storm.",
        topics: ["life", "adventure"],
        questionTypes: ["meaning", "synonym", "context"]
    },

    {
        id: 205,
        word: "cautious",
        level: 3,
        partOfSpeech: "adjective",
        meaning: "careful to avoid danger or mistakes",
        chinese: "谨慎的",
        synonyms: ["careful", "alert"],
        antonyms: ["careless", "reckless"],
        example: "The hikers were cautious as they approached the cliff.",
        topics: ["safety", "adventure"],
        questionTypes: ["meaning", "synonym", "context", "cloze"]
    },

    /* =========================
       LEVEL 4
       ========================= */

    {
        id: 301,
        word: "determined",
        level: 4,
        partOfSpeech: "adjective",
        meaning: "having made a firm decision to achieve something",
        chinese: "坚定的；决心的",
        synonyms: ["resolute", "persistent"],
        antonyms: ["uncertain", "indecisive"],
        example: "She was determined to finish the race.",
        topics: ["character", "sports"],
        questionTypes: ["meaning", "synonym", "context", "cloze"]
    },

    {
        id: 302,
        word: "remarkable",
        level: 4,
        partOfSpeech: "adjective",
        meaning: "unusual or impressive",
        chinese: "非凡的；引人注目的",
        synonyms: ["extraordinary", "impressive"],
        antonyms: ["ordinary"],
        example: "The young scientist made a remarkable discovery.",
        topics: ["achievement", "science"],
        questionTypes: ["meaning", "synonym", "context"]
    },

    {
        id: 303,
        word: "sufficient",
        level: 4,
        partOfSpeech: "adjective",
        meaning: "enough for a particular purpose",
        chinese: "足够的",
        synonyms: ["enough", "adequate"],
        antonyms: ["insufficient"],
        example: "There was sufficient food for everyone.",
        topics: ["daily life"],
        questionTypes: ["meaning", "synonym", "context", "cloze"]
    },

    /* =========================
       LEVEL 5
       ========================= */

    {
        id: 401,
        word: "resourceful",
        level: 5,
        partOfSpeech: "adjective",
        meaning: "good at finding clever ways to solve problems",
        chinese: "足智多谋的",
        synonyms: ["inventive", "creative"],
        antonyms: ["helpless"],
        example: "The resourceful boy found a way to repair the broken bicycle.",
        topics: ["character", "problem solving"],
        questionTypes: ["meaning", "synonym", "context", "cloze"]
    },

    {
        id: 402,
        word: "persuade",
        level: 5,
        partOfSpeech: "verb",
        meaning: "to convince someone to do something",
        chinese: "说服",
        synonyms: ["convince", "influence"],
        antonyms: ["discourage"],
        example: "Jane tried to persuade her brother to help her.",
        topics: ["communication", "relationships"],
        questionTypes: ["meaning", "synonym", "context"]
    },

    {
        id: 403,
        word: "deteriorate",
        level: 5,
        partOfSpeech: "verb",
        meaning: "to become worse in condition",
        chinese: "恶化",
        synonyms: ["worsen", "decline"],
        antonyms: ["improve"],
        example: "The condition of the building began to deteriorate.",
        topics: ["environment", "description"],
        questionTypes: ["meaning", "synonym", "context", "cloze"]
    },

    /* =========================
       LEVEL 6
       ========================= */

    {
        id: 501,
        word: "relieved",
        level: 6,
        partOfSpeech: "adjective",
        meaning: "feeling relaxed after a worry has disappeared",
        chinese: "如释重负的",
        synonyms: ["reassured", "comforted"],
        antonyms: ["worried", "anxious"],
        example: "He was relieved when he found his missing wallet.",
        topics: ["feelings"],
        questionTypes: ["meaning", "synonym", "context", "cloze"]
    },

    {
        id: 502,
        word: "compassionate",
        level: 6,
        partOfSpeech: "adjective",
        meaning: "showing concern for people who are suffering",
        chinese: "富有同情心的",
        synonyms: ["caring", "sympathetic"],
        antonyms: ["cruel", "uncaring"],
        example: "The compassionate nurse comforted the frightened child.",
        topics: ["character", "health"],
        questionTypes: ["meaning", "synonym", "context"]
    },

    /* =========================
       LEVEL 7
       ========================= */

    {
        id: 601,
        word: "adapt",
        level: 7,
        partOfSpeech: "verb",
        meaning: "to change in order to suit a new situation",
        chinese: "适应；调整",
        synonyms: ["adjust", "modify"],
        antonyms: ["resist"],
        example: "Animals must adapt to changes in their environment.",
        topics: ["nature", "environment"],
        questionTypes: ["meaning", "synonym", "context", "cloze"]
    },

    {
        id: 602,
        word: "consequence",
        level: 7,
        partOfSpeech: "noun",
        meaning: "a result of an action or decision",
        chinese: "后果；结果",
        synonyms: ["result", "outcome"],
        antonyms: [],
        example: "He had to face the consequences of his actions.",
        topics: ["character", "decision"],
        questionTypes: ["meaning", "synonym", "context", "cloze"]
    },

    {
        id: 603,
        word: "vulnerable",
        level: 7,
        partOfSpeech: "adjective",
        meaning: "easily harmed or affected",
        chinese: "脆弱的；易受伤害的",
        synonyms: ["defenceless", "unprotected"],
        antonyms: ["protected", "secure"],
        example: "Young children are vulnerable to extreme weather.",
        topics: ["health", "safety"],
        questionTypes: ["meaning", "context", "cloze"]
    },

    /* =========================
       LEVEL 8
       ========================= */

    {
        id: 701,
        word: "inevitable",
        level: 8,
        partOfSpeech: "adjective",
        meaning: "certain to happen",
        chinese: "不可避免的",
        synonyms: ["unavoidable", "certain"],
        antonyms: ["avoidable"],
        example: "Some changes are inevitable as technology develops.",
        topics: ["technology", "society"],
        questionTypes: ["meaning", "synonym", "context"]
    },

    {
        id: 702,
        word: "significant",
        level: 8,
        partOfSpeech: "adjective",
        meaning: "important or meaningful",
        chinese: "重要的；有意义的",
        synonyms: ["important", "meaningful"],
        antonyms: ["insignificant"],
        example: "The discovery had a significant impact on science.",
        topics: ["science", "achievement"],
        questionTypes: ["meaning", "synonym", "context", "cloze"]
    },

    /* =========================
       LEVEL 9
       ========================= */

    {
        id: 801,
        word: "meticulous",
        level: 9,
        partOfSpeech: "adjective",
        meaning: "very careful and precise",
        chinese: "一丝不苟的",
        synonyms: ["careful", "thorough"],
        antonyms: ["careless"],
        example: "The meticulous student checked every answer twice.",
        topics: ["character", "education"],
        questionTypes: ["meaning", "synonym", "context"]
    },

    {
        id: 802,
        word: "unprecedented",
        level: 9,
        partOfSpeech: "adjective",
        meaning: "never having happened before",
        chinese: "前所未有的",
        synonyms: ["unparalleled", "unique"],
        antonyms: [],
        example: "The event attracted an unprecedented number of visitors.",
        topics: ["society", "events"],
        questionTypes: ["meaning", "context"]
    },

    /* =========================
       LEVEL 10
       ========================= */

    {
        id: 901,
        word: "resilient",
        level: 10,
        partOfSpeech: "adjective",
        meaning: "able to recover quickly from difficulties",
        chinese: "有韧性的；坚韧的",
        synonyms: ["strong", "tough"],
        antonyms: ["fragile"],
        example: "The resilient child continued trying despite several failures.",
        topics: ["character", "challenges"],
        questionTypes: ["meaning", "synonym", "context", "cloze"]
    },

    {
        id: 902,
        word: "persevere",
        level: 10,
        partOfSpeech: "verb",
        meaning: "to continue doing something despite difficulty",
        chinese: "坚持；坚忍不拔",
        synonyms: ["persist", "continue"],
        antonyms: ["quit", "give up"],
        example: "If you persevere, you will eventually improve.",
        topics: ["character", "education"],
        questionTypes: ["meaning", "synonym", "context", "cloze"]
    }

];
