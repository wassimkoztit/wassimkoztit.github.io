/* ============================================================
   WEYRA AI — Wassim Personal Assistant
   Version: 2.2.0
   Language: English only
   Data source: me.json
   Features: Name memory + Combined best of v1.04.02 + v2.0.0
   ============================================================ */

/* ========================================
   PAGE LOAD ANIMATION
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {

    const profile = document.querySelector(".profile");
    const links = document.querySelectorAll(".link-card");
    const footer = document.querySelector(".footer");

    if (profile) {
        profile.style.opacity = "0";
        profile.style.transform = "translateY(15px)";
    }

    links.forEach(link => {
        link.style.opacity = "0";
        link.style.transform = "translateY(15px)";
    });

    if (footer) footer.style.opacity = "0";

    setTimeout(() => {
        if (profile) {
            profile.style.transition = "all 0.6s ease";
            profile.style.opacity = "1";
            profile.style.transform = "translateY(0)";
        }
    }, 100);

    links.forEach((link, index) => {
        setTimeout(() => {
            link.style.transition = "opacity 0.5s ease, transform 0.5s ease";
            link.style.opacity = "1";
            link.style.transform = "translateY(0)";
        }, 180 + (index * 90));
    });

    setTimeout(() => {
        if (footer) {
            footer.style.transition = "opacity 0.5s ease";
            footer.style.opacity = "1";
        }
    }, 700);

});


/* ============================================================
   WEYRA AI CORE
   ============================================================ */

(() => {
    "use strict";

    /* ============================================================
       GLOBAL STATE
       ============================================================ */

    window.userData = null;
    window.lastReplies = {};
    window.lastTopic = null;
    window.lastList = null;
    window.lastMessage = "";
    window.repeatCount = 0;
    window._lastQuestion = "";
    window.conversationHistory = [];
    window.lastIntentName = null;
    window.clarificationContext = null;
    window.awaitingClarification = false;

    // ===== NEW: User name memory =====
    window.visitorName = null;
    window.visitorNameAsked = false;

    let dataLoaded = false;
    let isSending = false;


    /* ============================================================
       DOM ELEMENTS
       ============================================================ */

    const aiModal        = document.getElementById("aiChatModal");
    const aiClose        = document.getElementById("aiChatClose");
    const aiInput        = document.getElementById("aiChatInput");
    const aiSend         = document.getElementById("aiChatSend");
    const aiMessages     = document.getElementById("aiChatMessages");
    const aiTrigger      = document.querySelector(".ai-chat-trigger");
    const aiScrollBottom = document.getElementById("aiScrollBottom");

    if (!aiMessages) {
        console.warn("Weyra: #aiChatMessages not found.");
        return;
    }


    /* ============================================================
       LOAD me.json
       ============================================================ */

    async function loadUserData() {
        try {
            const response = await fetch("me.json", { cache: "no-store" });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            window.userData = await response.json();
            dataLoaded = true;

            console.log("Weyra: me.json loaded —", window.userData.name);
        } catch (error) {
            console.error("Weyra: failed to load me.json", error);

            window.userData = {
                name: "Wassim El Koztit",
                title: "Founder & Entrepreneur",
                error: "Unable to load personal data."
            };
        }
    }

    loadUserData();


    /* ============================================================
       OPEN / CLOSE MODAL
       ============================================================ */

    aiTrigger?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!aiModal) return;

        aiModal.classList.add("active");
        setTimeout(() => aiInput?.focus(), 300);
    });

    aiClose?.addEventListener("click", () => {
        aiModal?.classList.remove("active");
    });

    aiModal?.addEventListener("click", (e) => {
        if (e.target === aiModal) aiModal.classList.remove("active");
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") aiModal?.classList.remove("active");
    });


    /* ============================================================
       BASIC TEXT UTILITIES
       ============================================================ */

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function cleanSpaces(text) {
        return String(text ?? "").replace(/\s+/g, " ").trim();
    }

    function normalize(text) {
        return cleanSpaces(
            String(text ?? "")
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[’']/g, "'")
                .replace(/[^a-z0-9\s'-]/g, " ")
                .replace(/\s+/g, " ")
        );
    }


    /* ============================================================
       WORD CORRECTIONS (English + Brands)
       ============================================================ */

    const WORD_CORRECTIONS = {
        // Wassim
        "wasim": "wassim",
        "wassem": "wassim",
        "waseem": "wassim",
        "wassm": "wassim",
        "wsm": "wassim",

        // Weyra
        "weyrah": "weyra",
        "weyraa": "weyra",
        "weira": "weyra",
        "wira": "weyra",
        "wera": "weyra",

        // Warstom
        "warstorm": "warstom",
        "warstoom": "warstom",
        "warstm": "warstom",
        "wastrom": "warstom",
        "wrstom": "warstom",

        // Solarax
        "solaraxx": "solarax",
        "solaracs": "solarax",
        "solarex": "solarax",
        "solrax": "solarax",

        // 4-Event
        "4event": "4-event",
        "4events": "4-event",
        "4 event": "4-event",
        "forevent": "4-event",
        "4evnt": "4-event",
        "4ev": "4-event",
        "4vnt": "4-event",

        // CFMMER
        "cfmer": "cfmmer",
        "cfmr": "cfmmer",
        "cfme": "cfmmer",

        // SMS / Chat
        "wht": "what",
        "wat": "what",
        "wats": "what is",
        "whre": "where",
        "wher": "where",
        "wer": "where",
        "wich": "which",
        "whch": "which",
        "hw": "how",
        "hwo": "how",
        "whois": "who is",
        "whos": "who is",
        "ur": "your",
        "u": "you",
        "r": "are",
        "yr": "your",
        "ya": "you",
        "abt": "about",
        "bout": "about",
        "pls": "please",
        "plz": "please",
        "thx": "thanks",
        "ty": "thank you",
        "tq": "thank you",
        "idk": "i don't know",
        "btw": "by the way",
        "asap": "as soon as possible",
        "im": "i am",
        "ive": "i have",
        "ill": "i will",
        "dont": "don't",
        "doesnt": "doesn't",
        "cant": "can't",
        "wont": "won't",
        "isnt": "isn't",
        "arent": "aren't",
        "wasnt": "wasn't",
        "werent": "weren't",
        "wanna": "want",
        "gonna": "going",
        "gotta": "got to",
        "kinda": "kind of",
        "sorta": "sort of",
        "lemme": "let me",
        "gimme": "give me",
        "cuz": "because",
        "coz": "because",
        "becoz": "because",

        // Common English typos
        "studdy": "study",
        "stduy": "study",
        "studi": "study",
        "educaton": "education",
        "eduction": "education",
        "experiance": "experience",
        "expereince": "experience",
        "skils": "skills",
        "skil": "skill",
        "compny": "company",
        "comapny": "company",
        "companey": "company",
        "projet": "project",
        "projets": "projects",
        "adress": "address",
        "addres": "address",
        "emial": "email",
        "eamil": "email",
        "contat": "contact",
        "conatct": "contact",
        "langauge": "language",
        "languge": "language",
        "certifcate": "certificate",
        "certficate": "certificate",
        "diplom": "diploma",
        "dipolma": "diploma",
        "renewablee": "renewable",
        "renwable": "renewable",
        "electrcial": "electrical",
        "electical": "electrical",
        "eletrical": "electrical",
        "developper": "developer",
        "devloper": "developer",
        "artifical": "artificial",
        "inteligence": "intelligence",
        "intelligance": "intelligence",
        "assisstant": "assistant",
        "asistant": "assistant",
        "tecnical": "technical",
        "tehcnical": "technical",
        "profesional": "professional",
        "proffesional": "professional",
        "buisness": "business",
        "busines": "business",
        "orginization": "organization",
        "organisaton": "organization",
        "maintenence": "maintenance",
        "maintainance": "maintenance",
        "photovoltic": "photovoltaic",
        "instalation": "installation",
        "installtion": "installation",
        "programmng": "programming",
        "programing": "programming",
        "webiste": "website",
        "websit": "website",
        "gitub": "github",
        "linkdin": "linkedin",

        // Short forms
        "whats": "what is",
        "wheres": "where is",
        "whens": "when is",
        "hows": "how is"
    };


    /* ============================================================
       TEXT CORRECTION
       ============================================================ */

    function applyShorthand(text) {
        let out = text;

        const keys = Object.keys(WORD_CORRECTIONS)
            .sort((a, b) => b.length - a.length);

        keys.forEach(from => {
            const to = WORD_CORRECTIONS[from];
            const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(`\\b${escaped}\\b`, "gi");
            out = out.replace(regex, to);
        });

        return out;
    }


    function collapseRepeated(text) {
        return text.replace(/([a-zA-Z])\1{2,}/g, "$1");
    }


    function fixLeetSpeak(text) {
        return text
            .replace(/([a-zA-Z])0([a-zA-Z])/g, "$1o$2")
            .replace(/([a-zA-Z])1([a-zA-Z])/g, "$1i$2")
            .replace(/([a-zA-Z])3([a-zA-Z])/g, "$1e$2")
            .replace(/([a-zA-Z])4([a-zA-Z])/g, "$1a$2")
            .replace(/([a-zA-Z])5([a-zA-Z])/g, "$1s$2")
            .replace(/([a-zA-Z])7([a-zA-Z])/g, "$1t$2")
            .replace(/@/g, "a");
    }


    const GLUED_WORDS = [
        "what", "is", "his", "her", "the", "about", "tell", "me",
        "how", "can", "i", "you", "your", "contact", "him", "her",
        "email", "phone", "whatsapp", "warstom", "weyra", "solarax",
        "event", "skills", "skill", "company", "companies", "birthday",
        "location", "education", "experience", "projects", "name",
        "who", "where", "when", "why", "more", "details", "show",
        "give", "get", "find", "help", "hi", "hello", "and", "or",
        "age", "old", "live", "lives", "based", "from", "work",
        "job", "career", "study", "studies", "diploma", "degree",
        "school", "university", "college", "cfmmer"
    ];


    function splitGlued(text) {
        return text.replace(/\b([a-z]{12,})\b/gi, (word) => {
            const lower = word.toLowerCase();
            if (GLUED_WORDS.some(w => lower.startsWith(w))) {
                return greedySplit(lower);
            }
            return word;
        });
    }


    function greedySplit(word) {
        const result = [];
        let remaining = word;
        const sorted = [...GLUED_WORDS].sort((a, b) => b.length - a.length);

        let safety = 0;
        while (remaining.length > 0 && safety < 20) {
            safety++;
            let matched = false;

            for (const w of sorted) {
                if (remaining.startsWith(w)) {
                    result.push(w);
                    remaining = remaining.slice(w.length);
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                if (result.length > 0) {
                    result[result.length - 1] += remaining;
                } else {
                    return word;
                }
                break;
            }
        }

        return result.length > 1 ? result.join(" ") : word;
    }


    function correctWords(text) {
        let fixed = text;

        fixed = applyShorthand(fixed);
        fixed = collapseRepeated(fixed);
        fixed = fixLeetSpeak(fixed);
        fixed = splitGlued(fixed);

        return cleanSpaces(normalize(fixed));
    }


    /* ============================================================
       LEVENSHTEIN + SIMILARITY
       ============================================================ */

    function levenshtein(a, b) {
        a = String(a);
        b = String(b);

        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                matrix[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
                    ? matrix[i - 1][j - 1]
                    : Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
            }
        }

        return matrix[b.length][a.length];
    }


    function similarity(a, b) {
        a = normalize(a);
        b = normalize(b);

        if (!a || !b) return 0;
        if (a === b) return 1;

        const distance = levenshtein(a, b);
        const maxLength = Math.max(a.length, b.length);

        if (!maxLength) return 1;

        return 1 - distance / maxLength;
    }


    function fuzzyMatch(input, target, threshold = 0.72) {
        if (!input || !target) return 0;
        if (input.length < 3 || target.length < 3) return 0;

        const score = similarity(input, target);
        return score >= threshold ? score : 0;
    }


    /* ============================================================
       USER NAME CAPTURE
       ============================================================ */

    // Patterns that indicate the user is telling their name:
    //   "I'm Mohammed" / "im mohammed" / "my name is Mohammed"
    //   "call me Mohammed" / "you can call me Mohammed"
    //   "name's Mohammed" / "this is Mohammed"
    const NAME_PATTERNS = [
        /^(?:hi|hello|hey)[,!\s]+(?:i am|i'm|im|my name is|name'?s|call me|this is)\s+([a-z][a-z'-]{1,20})$/i,
        /^(?:i am|i'm|im)\s+([a-z][a-z'-]{1,20})$/i,
        /^my name is\s+([a-z][a-z'-]{1,20})$/i,
        /^name'?s\s+([a-z][a-z'-]{1,20})$/i,
        /^(?:you can\s+)?call me\s+([a-z][a-z'-]{1,20})$/i,
        /^this is\s+([a-z][a-z'-]{1,20})$/i,
        /^(?:i am|i'm|im)\s+called\s+([a-z][a-z'-]{1,20})$/i
    ];

    // Words that should NOT be captured as names
    const RESERVED_NAMES = new Set([
        "wassim", "weyra", "warstom", "solarax", "cfmmer", "sgtm",
        "here", "back", "sorry", "fine", "good", "ok", "okay",
        "ready", "done", "sure", "asking", "looking", "trying",
        "just", "still", "going", "coming", "leaving", "talking",
        "tired", "happy", "sad", "angry", "busy", "free",
        "the", "a", "an", "not", "no", "yes", "your", "my",
        "about", "for", "with", "from", "to", "at", "in", "on"
    ]);

    function isValidName(name) {
        if (!name) return false;

        const lower = name.toLowerCase();

        if (lower.length < 2 || lower.length > 20) return false;
        if (RESERVED_NAMES.has(lower)) return false;
        if (!/^[a-z][a-z'-]*$/i.test(name)) return false;

        return true;
    }

    function capitalizeName(name) {
        if (!name) return "";
        return name
            .split(/[\s-]+/)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(" ");
    }

    function extractName(text) {
        const trimmed = cleanSpaces(text);

        for (const pattern of NAME_PATTERNS) {
            const match = trimmed.match(pattern);
            if (match && match[1]) {
                const candidate = match[1].trim();
                if (isValidName(candidate)) {
                    return capitalizeName(candidate);
                }
            }
        }

        return null;
    }

    function isAskingName(text) {
        const normalized = correctWords(text);
        return /\b(what(?:'s| is) your name|who are you|your name)\b/i.test(normalized)
            && !/\b(what(?:'s| is) (his|wassim's|the) name)\b/i.test(normalized);
    }

    function responseAskingName() {
        return pickRandom("asking_name", [
            () => `I'm **Weyra AI v1.3.1** — a mini assistant created by Wassim.\n\nAnd you? What's your name? 😊`,
            () => `I'm **Weyra AI** — Wassim's personal AI assistant.\n\nMay I ask your name?`,
            () => `I'm Weyra AI, version v1.3.1. What should I call you?`
        ])();
    }

    function responseNameStored(name) {
        return pickRandom("name_stored", [
            () => `Nice to meet you, **${name}**! 😊\n\nWhat would you like to know about Wassim?`,
            () => `Great to meet you, **${name}**!\n\nAsk me anything — skills, companies, projects, or contact info.`,
            () => `Welcome, **${name}**!\n\nHow can I help you learn more about Wassim?`,
            () => `Hello **${name}**! 👋\n\nWhat would you like to know?`
        ])();
    }

    function withName(text) {
        // Optional helper: inject name into a response if we know it
        if (!window.visitorName) return text;
        return text; // Currently not used, kept for future use
    }


    /* ============================================================
       ENTITY ALIASES
       ============================================================ */

    const ENTITY_ALIASES = {
        wassim: ["wassim", "him", "his"],
        warstom: ["warstom", "warstom.com"],
        weyra: ["weyra", "weyra.ai", "weyra ai"],
        solarax: ["solarax", "solarax.ma"],
        "4-event": ["4event", "4 event", "4-event", "4events", "four event"],
        cfmmer: ["cfmmer"],
        sgtm: ["sgtm"]
    };


    function detectEntity(text) {
        const normalized = correctWords(text);

        let best = null;
        let bestScore = 0;

        for (const [entity, aliases] of Object.entries(ENTITY_ALIASES)) {
            for (const alias of aliases) {
                if (normalized.includes(alias) && alias.length >= 3) {
                    const score = alias.length / Math.max(normalized.length, 1);
                    if (score > bestScore) {
                        best = entity;
                        bestScore = score;
                    }
                }

                const fuzzy = fuzzyMatch(normalized, alias, 0.82);
                if (fuzzy > bestScore && normalized.length < 30) {
                    best = entity;
                    bestScore = fuzzy;
                }
            }
        }

        return best;
    }


    /* ============================================================
       TOPIC KEYWORDS
       ============================================================ */

    const TOPICS = {
        education: [
            "education", "school", "studied", "study", "studies",
            "college", "university", "diploma", "degree", "bac",
            "baccalaureate", "technician", "specialized technician",
            "qualification", "academic"
        ],
        location: [
            "where", "location", "located", "address", "city",
            "place", "based"
        ],
        skills: [
            "skills", "skill", "abilities", "technical skills",
            "what can he do", "what does he know"
        ],
        programming: [
            "programming", "coding", "code", "developer",
            "development", "html", "css", "javascript", "php",
            "software"
        ],
        ai: [
            "artificial intelligence", "ai", "ai skills",
            "machine learning", "assistant"
        ],
        design: [
            "design", "graphic design", "svg", "logo", "visual"
        ],
        experience: [
            "experience", "work experience", "job experience",
            "internship", "intern", "sgtm", "worked"
        ],
        certifications: [
            "certifications", "certificates", "certificate", "certification"
        ],
        languages: [
            "languages", "language", "speaks", "english",
            "french", "arabic", "spanish"
        ],
        projects: [
            "projects", "project", "built", "created", "developed"
        ],
        services: [
            "services", "service", "offers", "offer",
            "provides", "provide", "what does he offer"
        ],
        companies: [
            "companies", "company", "businesses", "business",
            "brands", "ventures"
        ],
        interests: [
            "interests", "interested", "likes", "passions", "hobbies"
        ],
        goals: [
            "goals", "plans", "future", "ambitions", "objectives"
        ],
        contact: [
            "contact", "email", "phone", "whatsapp", "instagram",
            "facebook", "linkedin", "github", "social media"
        ],
        identity: [
            "who is", "who's", "about him", "about wassim",
            "tell me about him", "tell me about wassim",
            "profile", "bio"
        ],
        birthday: [
            "birthday", "born", "date of birth", "birth date",
            "when was he born"
        ],
        job: [
            "job", "occupation", "profession", "career", "role",
            "works as", "what does he do"
        ],
        ecosystem: [
            "ecosystem", "relationship", "connection", "related",
            "part of", "belongs to"
        ]
    };


    function detectTopic(text) {
        const normalized = correctWords(text);

        let bestTopic = null;
        let bestScore = 0;

        for (const [topic, keywords] of Object.entries(TOPICS)) {
            let score = 0;

            for (const keyword of keywords) {
                if (normalized.includes(keyword)) {
                    score += keyword.split(" ").length + 1;
                    continue;
                }

                const words = normalized.split(" ");
                for (const word of words) {
                    const fuzzy = fuzzyMatch(word, keyword, 0.82);
                    if (fuzzy > 0) score += fuzzy;
                }
            }

            if (score > bestScore) {
                bestScore = score;
                bestTopic = topic;
            }
        }

        return bestTopic;
    }


    /* ============================================================
       SPECIAL MESSAGES
       ============================================================ */

    function isGreeting(text) {
        return /^(hi|hello|hey|good morning|good afternoon|good evening|yo|sup)\b/i
            .test(correctWords(text));
    }

    function isThanks(text) {
        return /\b(thanks|thank you|thx|thank|appreciate)\b/i
            .test(correctWords(text));
    }

    function isGoodbye(text) {
        return /\b(bye|goodbye|see you|see ya|talk to you later|farewell)\b/i
            .test(correctWords(text));
    }

    function isHelp(text) {
        return /\b(help|what can you do|what can i ask|commands|options|menu)\b/i
            .test(correctWords(text));
    }

    function isCompliment(text) {
        return /\b(great|good job|nice bot|awesome|amazing|perfect|excellent|well done|bravo|you rock|impressive|good bot)\b/i
            .test(correctWords(text));
    }

    function isInsult(text) {
        return /\b(stupid|dumb|useless|i hate you|shut up|nonsense)\b/i
            .test(correctWords(text));
    }

    function isJoke(text) {
        return /\b(joke|make me laugh|funny)\b/i.test(correctWords(text));
    }

    function isTime(text) {
        return /\b(what time|current time|time now)\b/i.test(correctWords(text));
    }

    function isDate(text) {
        return /\b(what date|today date|current date|what day)\b/i.test(correctWords(text));
    }

    function isBotIdentity(text) {
        return /\b(your name|who are you|what are you|are you human|are you a bot|are you real|are you ai|are you a robot|who made you|who created you|introduce yourself|which version)\b/i
            .test(correctWords(text));
    }

    function isMore(text) {
        return /^(more|tell me more|continue|next|go on|keep going|details|and also)\b/i
            .test(correctWords(text));
    }


    /* ============================================================
       CONTEXT RESOLUTION
       ============================================================ */

    function getRecentMessages() {
        return window.conversationHistory.slice(-6);
    }

    function getPreviousEntity() {
        for (let i = window.conversationHistory.length - 1; i >= 0; i--) {
            const message = window.conversationHistory[i].content;
            const entity = detectEntity(message);
            if (entity) return entity;
        }
        return null;
    }

    function getPreviousTopic() {
        for (let i = window.conversationHistory.length - 1; i >= 0; i--) {
            const message = window.conversationHistory[i].content;
            const topic = detectTopic(message);
            if (topic) return topic;
        }
        return null;
    }

    function resolveContext(text) {
        let entity = detectEntity(text);
        let topic = detectTopic(text);

        const normalized = correctWords(text);

        const contextualWords = [
            "it", "this", "that", "he", "his", "him",
            "they", "their", "there", "the company",
            "the school", "the project", "the ai", "the assistant"
        ];

        const containsContextReference = contextualWords.some(word =>
            normalized.includes(word)
        );

        if (containsContextReference) {
            if (!entity) entity = getPreviousEntity();
            if (!topic) topic = getPreviousTopic();
        }

        return { entity, topic };
    }


    /* ============================================================
       SAFE MATH EVALUATOR (Parser, no eval)
       ============================================================ */

    function tryMath(text) {
        let expression = String(text)
            .replace(/,/g, "")
            .replace(/×/g, "*")
            .replace(/÷/g, "/");

        if (!/^[\d\s()+\-*/%.]+$/.test(expression)) return null;
        if (!/[+\-*/%]/.test(expression)) return null;
        if (!/\d/.test(expression)) return null;
        if (expression.length > 30) return null;

        try {
            let index = 0;
            const tokenList = expression.match(/\d+(?:\.\d+)?|[+\-*/%()]/g) || [];

            function peek() { return tokenList[index]; }
            function consume() { return tokenList[index++]; }

            function parseExpression() {
                let value = parseTerm();
                while (peek() === "+" || peek() === "-") {
                    const op = consume();
                    const right = parseTerm();
                    value = op === "+" ? value + right : value - right;
                }
                return value;
            }

            function parseTerm() {
                let value = parseFactor();
                while (peek() === "*" || peek() === "/" || peek() === "%") {
                    const op = consume();
                    const right = parseFactor();
                    if ((op === "/" || op === "%") && right === 0) {
                        throw new Error("Division by zero");
                    }
                    if (op === "*") value *= right;
                    if (op === "/") value /= right;
                    if (op === "%") value %= right;
                }
                return value;
            }

            function parseFactor() {
                const token = peek();
                if (token === "(") {
                    consume();
                    const value = parseExpression();
                    if (consume() !== ")") throw new Error("Invalid");
                    return value;
                }
                if (token === "-") {
                    consume();
                    return -parseFactor();
                }
                if (!token || !/^\d/.test(token)) throw new Error("Invalid");
                return Number(consume());
            }

            const result = parseExpression();
            if (index !== tokenList.length) return null;
            if (!Number.isFinite(result)) return null;

            return result;
        } catch {
            return null;
        }
    }


    /* ============================================================
       DATA HELPERS
       ============================================================ */

    function getEducation() {
        return window.userData?.education || [];
    }

    function getCompanies() {
        return window.userData?.companies || [];
    }

    function getCompany(name) {
        const companies = getCompanies();
        const normalizedName = normalize(name);
        return companies.find(company =>
            normalize(company.name) === normalizedName
        );
    }

    function getCompanyByEntity(entity) {
        if (!entity) return null;
        if (entity === "warstom") return getCompany("Warstom");
        if (entity === "weyra") return getCompany("Weyra AI");
        if (entity === "4-event") return getCompany("4-Event");
        if (entity === "solarax") return getCompany("Solarax");
        return null;
    }

    function getCFMMER() {
        return getEducation().find(item =>
            item?.school?.acronym === "CFMMER"
        );
    }

    function formatLocation(loc) {
        if (!loc) return "";
        if (typeof loc === "string") return loc;
        if (typeof loc === "object") {
            const parts = [];
            if (loc.city) parts.push(loc.city);
            if (loc.country) parts.push(loc.country);
            return parts.join(", ");
        }
        return "";
    }


    /* ============================================================
       RANDOM PICK
       ============================================================ */

    function pickRandom(intentName, options) {
        if (!options || options.length === 0) return () => "";
        if (options.length === 1) return options[0];

        let last = window.lastReplies[intentName];
        let choice;

        for (let i = 0; i < 5; i++) {
            choice = options[Math.floor(Math.random() * options.length)];
            if (choice !== last) break;
        }

        window.lastReplies[intentName] = choice;
        return choice;
    }


    /* ============================================================
       URL NORMALIZER (fixes missing protocol)
       ============================================================ */

    function normalizeURL(url) {
        if (!url) return "";
        const trimmed = String(url).trim();
        if (!trimmed) return "";

        if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
            return trimmed;
        }

        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            return "mailto:" + trimmed;
        }

        return "https://" + trimmed;
    }


    /* ============================================================
       RESPONSE BUILDERS
       ============================================================ */

    function responseGreeting() {
        // If we know the visitor's name, greet them personally
        if (window.visitorName) {
            return pickRandom("greeting_personal", [
                () => `Hello **${window.visitorName}**! 👋\n\nWhat would you like to know about Wassim?`,
                () => `Hi **${window.visitorName}**! Ready to answer anything. What's on your mind?`,
                () => `Hey **${window.visitorName}**! Ask me anything about Wassim.`
            ])();
        }

        const variants = [
            () => `Hello! I'm Weyra AI v1.3.1 — your AI assistant.\n\nAsk me about:\n- Birthday\n- Skills\n- Companies\n- Projects\n- Contact info`,
            () => `Hi there! Ready to answer anything. What would you like to know?\n\nBy the way, what's your name?`,
            () => `Hey! I know a lot. Skills, companies, projects, contact... just ask!\n\n(You can also tell me your name if you like.)`,
            () => `Welcome! I'm here to help. Try asking "what are his skills?" or "tell me about his companies"`
        ];
        const chosen = pickRandom("greeting", variants);
        return typeof chosen === "function" ? chosen() : chosen;
    }


    function responseIdentity() {
        const name = window.userData?.name || "Wassim El Koztit";
        const title = window.userData?.title || "Founder & Entrepreneur";
        const location = formatLocation(window.userData?.location);
        const tagline = window.userData?.tagline || "";
        const about = window.userData?.about || "";

        return `${name}\n${title}\nLocation: ${location}\n\n${tagline ? tagline + "\n\n" : ""}${about}`;
    }


    function responseEducation() {
        const education = getEducation();

        if (!education.length) {
            return "Wassim's education information is not currently available.";
        }

        const lines = education.map(item => {
            const schoolName = typeof item.school === "string"
                ? item.school
                : (item.school?.name || "");
            const schoolCity = typeof item.school === "object" && item.school?.city
                ? ` — ${item.school.city}`
                : "";
            const option = item.option ? ` (${item.option})` : "";

            return `- ${item.diploma}${option}${schoolName ? " — " + schoolName + schoolCity : ""} (${item.year})`;
        });

        return `Education:\n${lines.join("\n")}`;
    }


    function responseCFMMER(text) {
        const school = getCFMMER();

        if (!school) {
            return "I don't currently have the CFMMER information in my data.";
        }

        const data = school.school || {};
        const normalized = correctWords(text);

        if (
            normalized.includes("where") ||
            normalized.includes("location") ||
            normalized.includes("address") ||
            normalized.includes("located")
        ) {
            let answer = `CFMMER is located in ${data.city || "Rabat"}, ${data.country || "Morocco"}.`;
            if (data.address) answer += `\nAddress: ${data.address}`;
            if (data.map) answer += `\n[Open in Google Maps](${data.map})`;
            return `%%SCHOOL_IMAGE:cfmmer%%\n${answer}`;
        }

        let html = `%%SCHOOL_IMAGE:cfmmer%%\n**${data.name || "CFMMER"}** (${data.acronym || "CFMMER"})\n`;
        if (data.city) html += `\n**City:** ${data.city}, ${data.country || ""}`;
        if (data.address) html += `\n**Address:** ${data.address}`;
        if (data.platform) html += `\n**Platform:** [Official Platform](${data.platform})`;
        if (data.map) html += `\n**Location:** [Open in Maps](${data.map})`;
        html += `\n\n**Diploma:** ${school.diploma}${school.option ? " (" + school.option + ")" : ""}\n**Year:** ${school.year}`;
        return html;
    }


    function responseSkills() {
        const skills = window.userData?.skills || {};
        const sections = [];

        for (const [category, values] of Object.entries(skills)) {
            if (!Array.isArray(values) || !values.length) continue;

            const title = category
                .replace(/_/g, " ")
                .replace(/\b\w/g, c => c.toUpperCase());

            sections.push(`**${title}**\n- ${values.join("\n- ")}`);
        }

        return sections.length
            ? `Wassim's skills:\n\n${sections.join("\n\n")}`
            : "Wassim's skills are not currently available.";
    }


    function responseProgramming() {
        const list = window.userData?.skills?.programming_and_software
            || window.userData?.skills?.programming
            || [];

        return list.length
            ? `Programming & Software:\n- ${list.join("\n- ")}`
            : "Programming skills not loaded.";
    }


    function responseAISkills() {
        const list = window.userData?.skills?.ai_and_digital || [];

        return list.length
            ? `AI & Digital skills:\n- ${list.join("\n- ")}`
            : "AI skills not loaded.";
    }


    function responseDesignSkills() {
        const list = window.userData?.skills?.design || [];

        return list.length
            ? `Design skills:\n- ${list.join("\n- ")}`
            : "Design skills not loaded.";
    }


    function responseOtherSkills() {
        const list = window.userData?.skills?.other || [];

        return list.length
            ? `Soft & Personal skills:\n- ${list.join("\n- ")}`
            : "Other skills not loaded.";
    }


    function responseExperience() {
        const experiences = window.userData?.experience || [];

        if (!experiences.length) {
            return "Wassim's work experience is not currently available.";
        }

        return experiences.map(exp => {
            let answer = `**${exp.role || "Experience"}**`;
            if (exp.company) answer += ` — ${exp.company}`;
            if (exp.field) answer += `\n${exp.field}`;
            if (Array.isArray(exp.tasks) && exp.tasks.length) {
                answer += `\n\nMain tasks:\n- ${exp.tasks.join("\n- ")}`;
            }
            if (exp.note) answer += `\n\n${exp.note}`;
            return answer;
        }).join("\n\n");
    }


    function responseCertifications() {
        const certifications = window.userData?.certifications || [];

        return certifications.length
            ? `Certifications:\n- ${certifications.join("\n- ")}`
            : "No certifications are currently listed.";
    }


    function responseLanguages() {
        const languages = window.userData?.languages || [];

        return languages.length
            ? `Languages:\n${languages.map(item => `- ${item.language}: ${item.level}`).join("\n")}`
            : "Wassim's language information is not currently available.";
    }


    function responseProjects() {
        const projects = window.userData?.projects || [];

        if (!projects.length) {
            return "No projects are currently listed.";
        }

        window.lastList = projects.map(project => ({
            name: project.name,
            data: project
        }));

        if (typeof projects[0] === "string") {
            return `Projects:\n- ${projects.join("\n- ")}`;
        }

        const list = projects.map((project, index) =>
            `${index + 1}. **${project.name}** (${project.type})\n   ${project.description || ""}`
        ).join("\n\n");

        return `His projects:\n\n${list}`;
    }


    function responseServices() {
        const services = window.userData?.personal_services || [];

        return services.length
            ? `Personal services:\n- ${services.join("\n- ")}`
            : "No personal services are currently listed.";
    }


    function responseCompanies() {
        const companies = getCompanies();

        if (!companies.length) {
            return "No companies or projects are currently listed.";
        }

        window.lastList = companies.map(company => ({
            name: company.name,
            data: company
        }));

        const list = companies.map((company, index) => {
            const relationship = company.parent_project
                ? ` — part of ${company.parent_project}`
                : "";

            return `${index + 1}. **${company.name}** — ${company.role}\n   ${company.tagline}${relationship}`;
        }).join("\n\n");

        return `Wassim's companies & ventures:\n\n${list}\n\nAsk about any one by name (e.g., "tell me about Warstom") or by number (1-4).`;
    }


    function responseCompany(entity) {
        const company = getCompanyByEntity(entity);

        if (!company) {
            return "I couldn't find that company in Wassim's data.";
        }

        const logoKey = entity;

        let answer = `%%COMPANY_LOGO:${logoKey}%%\n`;
        answer += `**${company.name}** — ${company.role}\n`;

        if (company.website) {
            const url = normalizeURL(company.website);
            const label = String(company.website).replace(/^https?:\/\//i, "").replace(/\/$/, "");
            answer += `[${label}](${url})\n`;
        }

        if (company.status) answer += `Status: ${company.status}\n`;
        if (company.expected_launch) answer += `Expected launch: ${company.expected_launch}\n`;
        if (company.category) answer += `Category: ${company.category}\n`;
        if (company.parent_project) answer += `Parent project: ${company.parent_project}\n`;

        if (company.tagline) answer += `\n**${company.tagline}**\n`;
        if (company.description) answer += `\n${company.description}\n`;

        if (Array.isArray(company.features) && company.features.length) {
            answer += `\n**Features:**\n- ${company.features.join("\n- ")}\n`;
        }

        if (Array.isArray(company.services) && company.services.length) {
            answer += `\n**Services:**\n- ${company.services.join("\n- ")}\n`;
        }

        if (Array.isArray(company.role_inside_warstom) && company.role_inside_warstom.length) {
            answer += `\n**Role inside Warstom:**\n- ${company.role_inside_warstom.join("\n- ")}\n`;
        }

        if (company.team_model) answer += `\n**Team model:** ${company.team_model}\n`;
        if (company.important_note) answer += `\n**Note:** ${company.important_note}`;

        return answer.trim();
    }


    function responseInterests() {
        const interests = window.userData?.interests || [];

        return interests.length
            ? `Interests:\n- ${interests.join("\n- ")}`
            : "Wassim's interests are not currently listed.";
    }


    function responseGoals() {
        const goals = window.userData?.goals || {};
        const sections = [];

        for (const [period, items] of Object.entries(goals)) {
            if (!Array.isArray(items) || !items.length) continue;

            const title = period
                .replace(/_/g, " ")
                .replace(/\b\w/g, c => c.toUpperCase());

            sections.push(`**${title}**\n- ${items.join("\n- ")}`);
        }

        return sections.length
            ? `Wassim's goals:\n\n${sections.join("\n\n")}`
            : "Wassim's goals are not currently listed.";
    }


    function responseJob() {
        const profile = window.userData?.professional_profile;

        if (profile?.current_role) {
            return `Wassim's current professional role is **${profile.current_role}**.`;
        }

        return `He's a ${window.userData?.title || ""}.\n\nFields: ${(window.userData?.fields || []).join(" | ")}`;
    }


    function responseBirthday() {
        const birthday = window.userData?.birthday;

        if (!birthday) {
            return "Wassim's birthday is not currently listed.";
        }

        const date = new Date(birthday);
        const now = new Date();
        let age = now.getFullYear() - date.getFullYear();
        const m = now.getMonth() - date.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < date.getDate())) age--;

        const formatted = date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        return `Birthday: ${formatted}\nAge: ${age} years old`;
    }


    function responseLocation() {
        const location = window.userData?.location;

        if (!location) {
            return "Wassim's location is not currently listed.";
        }

        return `Based in ${formatLocation(location)}`;
    }


    function responseEcosystem() {
        const rel = window.userData?.project_relationships;
        const eco = window.userData?.ecosystem;

        if (rel) {
            let out = `**Project ecosystem & relationships:**\n\n`;
            for (const [name, desc] of Object.entries(rel)) {
                out += `- **${name}**: ${desc}\n`;
            }
            return out;
        }

        if (eco) {
            return Object.entries(eco).map(([name, data]) => {
                let line = `**${name}** — ${data.type || ""}`;
                if (data.parent) line += `; parent: ${data.parent}`;
                if (data.relationship) line += `; ${data.relationship}`;
                if (data.role) line += `; role: ${data.role}`;
                return line;
            }).join("\n");
        }

        return "Ecosystem info not loaded.";
    }


    function responseFields() {
        const fields = window.userData?.fields || [];
        return fields.length
            ? `Fields: ${fields.join(" | ")}`
            : "Fields not loaded.";
    }


    function getContactResponse(text) {
        const normalized = correctWords(text);
        const social = window.userData?.social || {};

        if (normalized.includes("email")) {
            return window.userData?.email
                ? `[${window.userData.email}](mailto:${window.userData.email})`
                : "Email not listed.";
        }

        if (normalized.includes("whatsapp")) {
            const personalUrl = social.whatsapp_personal
                ? normalizeURL(social.whatsapp_personal)
                : "https://wa.me/212679484103";
            const businessUrl = social.whatsapp_business
                ? normalizeURL(social.whatsapp_business)
                : "https://wa.me/212664158149";

            return `Personal: ${window.userData?.whatsapp_personal || ""}\nBusiness: ${window.userData?.whatsapp_business || ""}\n\n[Personal WhatsApp](${personalUrl})\n[Business WhatsApp](${businessUrl})`;
        }

        if (normalized.includes("phone") || normalized.includes("number")) {
            return `Personal: ${window.userData?.whatsapp_personal || ""}\nBusiness: ${window.userData?.whatsapp_business || ""}`;
        }

        if (normalized.includes("instagram")) {
            return social.instagram
                ? `[Instagram](${normalizeURL(social.instagram)})`
                : "Instagram not listed.";
        }

        if (normalized.includes("facebook")) {
            return social.facebook
                ? `[Facebook](${normalizeURL(social.facebook)})`
                : "Facebook not listed.";
        }

        if (normalized.includes("linkedin")) {
            return social.linkedin
                ? `[LinkedIn](${normalizeURL(social.linkedin)})`
                : "LinkedIn not listed.";
        }

        if (normalized.includes("github")) {
            return social.github
                ? `[GitHub](${normalizeURL(social.github)})`
                : "GitHub not listed.";
        }

        const emailLink = window.userData?.email
            ? `[Email](mailto:${window.userData.email})`
            : "";
        const waPersonal = social.whatsapp_personal
            ? `[WhatsApp Personal](${normalizeURL(social.whatsapp_personal)})`
            : "";
        const waBusiness = social.whatsapp_business
            ? `[WhatsApp Business](${normalizeURL(social.whatsapp_business)})`
            : "";

        return `You can reach him here:\n\n${emailLink}\n${waPersonal}\n${waBusiness}`.trim();
    }


    function getMoreAbout() {
        const topic = window.lastTopic;
        const entity = getPreviousEntity();

        if (entity && (entity === "warstom" || entity === "weyra" || entity === "solarax" || entity === "4-event")) {
            return responseCompany(entity);
        }

        switch (topic) {
            case "education": return responseEducation();
            case "skills": return responseSkills();
            case "programming": return responseProgramming();
            case "ai": return responseAISkills();
            case "design": return responseDesignSkills();
            case "experience": return responseExperience();
            case "projects": return responseProjects();
            case "companies": return responseCompanies();
            case "services": return responseServices();
            case "goals": return responseGoals();
            case "interests": return responseInterests();
            case "languages": return responseLanguages();
            case "certifications": return responseCertifications();
            default:
                return "You can ask me for more information about Wassim's education, skills, experience, projects, companies, services, interests or goals.";
        }
    }


    /* ============================================================
       SELECTION 1 / 2 / 3
       ============================================================ */

    function handleSelection(text) {
        if (!window.lastList) return null;

        const normalized = correctWords(text);
        const match = normalized.match(/^(?:option\s*)?([1-9])$/);

        if (!match) return null;

        const index = Number(match[1]) - 1;

        if (index < 0 || index >= window.lastList.length) {
            return "That option is not available.";
        }

        const selected = window.lastList[index];

        if (!selected?.data) return null;

        const data = selected.data;

        if (data.category) {
            const entity = detectEntity(data.name);
            if (entity) return responseCompany(entity);
        }

        return `**${selected.name}**\n${data.description || "No additional information is available."}`;
    }


    /* ============================================================
       GENERIC JSON SEARCH
       ============================================================ */

    function flattenObject(value, path = "", output = []) {
        if (value === null || value === undefined) return output;

        if (
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean"
        ) {
            output.push({ path, value: String(value) });
            return output;
        }

        if (Array.isArray(value)) {
            value.forEach((item, index) => {
                flattenObject(item, path ? `${path}.${index}` : String(index), output);
            });
            return output;
        }

        if (typeof value === "object") {
            Object.entries(value).forEach(([key, child]) => {
                flattenObject(child, path ? `${path}.${key}` : key, output);
            });
        }

        return output;
    }


    function genericSearch(text) {
        if (!window.userData) return null;

        const normalized = correctWords(text);
        const queryWords = normalized.split(" ").filter(word => word.length >= 3);

        if (!queryWords.length) return null;

        const entries = flattenObject(window.userData);

        let best = null;
        let bestScore = 0;

        for (const entry of entries) {
            const haystack = normalize(`${entry.path} ${entry.value}`);
            let score = 0;

            for (const word of queryWords) {
                if (haystack.includes(word)) score += 1;
            }

            if (score > bestScore) {
                bestScore = score;
                best = entry;
            }
        }

        if (!best || bestScore === 0) return null;
        return best;
    }


    /* ============================================================
       FALLBACK
       ============================================================ */

    function fallbackResponse(text) {
        const entity = detectEntity(text);

        if (entity) {
            const company = getCompanyByEntity(entity);
            if (company) return responseCompany(entity);
        }

        const searchResult = genericSearch(text);

        if (searchResult) {
            return `I found this information in Wassim's profile:\n\n**${searchResult.path}**: ${searchResult.value}`;
        }

        const words = normalize(text)
            .split(" ")
            .filter(w => w.length > 2);

        let partialMatch = null;
        if (words.length > 0) {
            for (const [topic, keywords] of Object.entries(TOPICS)) {
                for (const keyword of keywords) {
                    for (const word of words) {
                        if (keyword.includes(word) || word.includes(keyword)) {
                            partialMatch = topic;
                            break;
                        }
                    }
                    if (partialMatch) break;
                }
                if (partialMatch) break;
            }
        }

        let fallbackText = pickRandom("fallback", [
            () => `I'm not sure what you mean. But I can tell you about:\n- Skills\n- Companies (Warstom, Weyra, 4-Event, Solarax)\n- Email & WhatsApp\n- Education & experience\n- Goals & ecosystem\n\nTry rephrasing your question.`,
            () => `Hmm, I didn't quite get that. Here's what I can do:\n- Answer about the owner\n- Give you contact info\n- Explain his companies\n- List his skills\n- Show his goals\n\nWhat do you want to know?`,
            () => `I'm still learning! I know a lot:\n- Skills, companies, projects\n- Contact (email, WhatsApp, social)\n- Education, experience\n- Goals & ecosystem\n\nAsk me anything.`,
            () => `That's outside my knowledge, but I'm great at answering questions about the person behind this page.\n\nTry:\n- "What are his skills?"\n- "Tell me about Warstom"\n- "Give me his email"`
        ])();

        if (typeof fallbackText === "function") fallbackText = fallbackText();

        // Add name if we know it
        if (window.visitorName) {
            fallbackText = fallbackText.replace(/^I'm not sure/, `I'm not sure, ${window.visitorName}.`);
        }

        if (partialMatch) {
            fallbackText += `\n\nDid you mean something about **${partialMatch}**? Try asking more specifically.`;
        }

        return fallbackText;
    }


    /* ============================================================
       MAIN AI RESPONSE
       ============================================================ */

    function getAIResponse(question) {
        if (!window.userData) {
            return "Still loading my data... try again in a second.";
        }

        const fixedQuestion = correctWords(question);
        const trimmed = fixedQuestion.trim();

        // ===== PRIORITY 0: NAME CAPTURE =====
        const detectedName = extractName(question);
        if (detectedName) {
            window.visitorName = detectedName;
            window.visitorNameAsked = true;
            window.lastTopic = "name_capture";
            window.lastIntentName = "greeting";
            return responseNameStored(detectedName);
        }

        // ===== PRIORITY 1: USER ASKING THE BOT'S NAME =====
        if (isAskingName(question)) {
            window.visitorNameAsked = true;
            window.lastTopic = "asking_name";
            window.lastIntentName = "default";
            return responseAskingName();
        }

        // 1. Selection (1-9)
        if (/^[1-9]$/.test(trimmed) && window.lastList) {
            const selection = handleSelection(trimmed);
            if (selection) return selection;
        }

        // 2. Awaiting clarification
        if (window.awaitingClarification && window.clarificationContext) {
            if (/^[12]$/.test(trimmed)) {
                const idx = parseInt(trimmed, 10) - 1;
                const selected = window.clarificationContext.options[idx];
                window.awaitingClarification = false;
                window.clarificationContext = null;

                if (selected === "skills") return responseSkills();
                if (selected === "programming") return responseProgramming();
                if (selected === "education") return responseEducation();
                if (selected === "experience") return responseExperience();
                if (selected === "projects") return responseProjects();
                if (selected === "companies") return responseCompanies();
            }

            window.awaitingClarification = false;
            window.clarificationContext = null;
        }

        // 3. Math
        const mathResult = tryMath(fixedQuestion);
        if (mathResult !== null) {
            return `Result: **${mathResult}**`;
        }

        // 4. Greetings
        if (isGreeting(fixedQuestion)) {
            window.lastTopic = "greeting";
            window.lastIntentName = "greeting";
            return responseGreeting();
        }

        // 5. Thanks
        if (isThanks(fixedQuestion)) {
            const thanksReplies = window.visitorName
                ? [
                    () => `You're welcome, **${window.visitorName}**! Happy to help. Anything else?`,
                    () => `Anytime, **${window.visitorName}**! Ask me more.`,
                    () => `My pleasure, **${window.visitorName}**! Feel free to ask more.`
                ]
                : [
                    () => "You're welcome! Happy to help. Anything else?",
                    () => "Glad I could help! Ask me anything else.",
                    () => "No problem at all! Anything else you want to know?",
                    () => "My pleasure! Feel free to ask more questions."
                ];
            return pickRandom("thanks", thanksReplies)();
        }

        // 6. Goodbye
        if (isGoodbye(fixedQuestion)) {
            const byeReplies = window.visitorName
                ? [
                    () => `Goodbye, **${window.visitorName}**! Come back anytime.`,
                    () => `See you later, **${window.visitorName}**! Take care.`,
                    () => `Take care, **${window.visitorName}**! Have a great day.`
                ]
                : [
                    () => "Goodbye! Come back anytime.",
                    () => "See you later! Take care.",
                    () => "Bye! Feel free to return whenever you need.",
                    () => "Take care! Have a great day."
                ];
            return pickRandom("goodbye", byeReplies)();
        }

        // 7. Bot identity
        if (isBotIdentity(fixedQuestion)) {
            return pickRandom("bot_identity", [
                () => `I'm **Weyra AI v1.3.1** - a mini version generated by **Wassim El Koztit**.\n\nI know everything about him: skills, companies, projects, contact info.`,
                () => `I'm the mini version of **Weyra AI**, version **v1.3.1**.\n\nI was generated by Wassim to help you learn about him.`,
                () => `**Weyra AI v1.3.1** here - a lightweight assistant created by Wassim.\n\nAsk me anything about him!`,
                () => `I'm a mini Weyra AI (v1.3.1), generated by Wassim.\n\nPart of his upcoming Weyra project at [weyra.ai](https://weyra.ai) (launching 03-2027).`
            ])();
        }

        // 8. Compliment / Insult / Joke
        if (isCompliment(fixedQuestion)) {
            const complimentReplies = window.visitorName
                ? [
                    () => `Thank you, **${window.visitorName}**! That's very kind.`,
                    () => `Thanks, **${window.visitorName}**! I appreciate it.`,
                    () => `Aw, thanks **${window.visitorName}**! I'll keep doing my best.`
                ]
                : [
                    () => `Thank you! That's very kind.`,
                    () => `Thanks! I appreciate it. Anything else I can help with?`,
                    () => `Aw, thanks! I'll do my best to keep helping you.`,
                    () => `Appreciate it! Let me know if you need anything else.`
                ];
            return pickRandom("compliment", complimentReplies)();
        }

        if (isInsult(fixedQuestion)) {
            const insultReplies = window.visitorName
                ? [
                    () => `Sorry if I didn't help, **${window.visitorName}**. Try rephrasing?`,
                    () => `My apologies, **${window.visitorName}**. Let me try again.`
                ]
                : [
                    () => `Sorry if I didn't help. Try asking differently or in another way.`,
                    () => `I'm still learning. Can you rephrase your question?`,
                    () => `My apologies. Let me try again - what exactly do you want to know?`
                ];
            return pickRandom("insult", insultReplies)();
        }

        if (isJoke(fixedQuestion)) {
            return pickRandom("joke", [
                () => `Why did the electrician go to therapy?\nBecause he had too many live wires!`,
                () => `Why do solar panels make great comedians?\nBecause they always shine bright!`,
                () => `I would tell you a joke about AI, but I'm still processing it.`
            ])();
        }

        // 9. Time / Date
        if (isTime(fixedQuestion)) {
            return `I don't have a real clock, but your device knows: ${new Date().toLocaleTimeString()}`;
        }

        if (isDate(fixedQuestion)) {
            return `Today is ${new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}.`;
        }

        // 10. Help
        if (isHelp(fixedQuestion)) {
            window.lastTopic = "help";
            window.lastIntentName = "help";
            const helpIntro = window.visitorName ? `Sure, **${window.visitorName}**! ` : "";
            return helpIntro + pickRandom("help", [
                () => `I can answer:\n- Birthday & age\n- Email, WhatsApp, phone\n- Instagram, Facebook, LinkedIn, GitHub\n- Skills (technical, programming, AI, design)\n- Education\n- Experience\n- Companies (Warstom, Weyra, 4-Event, Solarax)\n- Ecosystem & relationships\n- Languages\n- Projects\n- Location\n- Goals`,
                () => `Ask me about the owner:\n- Skills & expertise\n- Companies & ecosystem\n- Projects\n- Contact info\n- Education & experience\n- Social media\n- Goals\n\nOr just say "hi"!`,
                () => `You can ask things like:\n- "What is his email?"\n- "Tell me about Warstom"\n- "What are his skills?"\n- "Who is Wassim?"\n- "Show his Instagram"\n- "What is the ecosystem?"`
            ])();
        }

        // 11. More
        if (isMore(fixedQuestion)) {
            return getMoreAbout();
        }

        // 12. Context resolution
        const context = resolveContext(fixedQuestion);
        let entity = context.entity;
        let topic = context.topic;

        // 13. Explicit CFMMER
        if (entity === "cfmmer" || fixedQuestion.includes("cfmmer")) {
            window.lastTopic = "education";
            window.lastIntentName = "cfmmer";
            return responseCFMMER(fixedQuestion);
        }

        // 14. Explicit company
        if (entity === "warstom" || entity === "weyra" || entity === "solarax" || entity === "4-event") {
            window.lastTopic = entity;
            window.lastIntentName = "company_detail";
            return responseCompany(entity);
        }

        // 15. Contact
        if (
            topic === "contact" ||
            /\b(email|whatsapp|instagram|facebook|linkedin|github|phone|contact)\b/.test(fixedQuestion)
        ) {
            window.lastTopic = "contact";
            window.lastIntentName = "contact";
            return getContactResponse(fixedQuestion);
        }

        // 16. Topic-based responses
        if (topic) {
            window.lastTopic = topic;
            window.lastIntentName = topic;

            switch (topic) {
                case "identity": return responseIdentity();
                case "birthday": return responseBirthday();
                case "location": return responseLocation();
                case "education": return responseEducation();
                case "skills": return responseSkills();
                case "programming": return responseProgramming();
                case "ai": return responseAISkills();
                case "design": return responseDesignSkills();
                case "experience": return responseExperience();
                case "certifications": return responseCertifications();
                case "languages": return responseLanguages();
                case "projects": return responseProjects();
                case "services": return responseServices();
                case "companies": return responseCompanies();
                case "interests": return responseInterests();
                case "goals": return responseGoals();
                case "job": return responseJob();
                case "ecosystem": return responseEcosystem();
                default: break;
            }
        }

        // 17. Contextual follow-up
        const previousEntity = getPreviousEntity();

        if (previousEntity &&
            /\b(it|this|that|he|his|him|there|the company|the project)\b/.test(fixedQuestion)
        ) {
            if (
                previousEntity === "warstom" ||
                previousEntity === "weyra" ||
                previousEntity === "solarax" ||
                previousEntity === "4-event"
            ) {
                return responseCompany(previousEntity);
            }
        }

        // 18. Smart ambiguity handler
        const topicScores = {};
        for (const [t, keywords] of Object.entries(TOPICS)) {
            let score = 0;
            for (const kw of keywords) {
                if (fixedQuestion.includes(kw)) score += 2;
            }
            if (score > 0) topicScores[t] = score;
        }

        const sortedTopics = Object.entries(topicScores)
            .sort((a, b) => b[1] - a[1]);

        if (sortedTopics.length >= 2 && sortedTopics[0][1] === sortedTopics[1][1]) {
            window.clarificationContext = {
                options: [sortedTopics[0][0], sortedTopics[1][0]]
            };
            window.awaitingClarification = true;

            const intro = window.visitorName ? `**${window.visitorName}**, ` : "";
            return `${intro}I want to make sure I understand you correctly. Are you asking about:\n\n1. **${sortedTopics[0][0].replace(/_/g, " ")}**\n2. **${sortedTopics[1][0].replace(/_/g, " ")}**\n\nPlease type 1 or 2, or rephrase your question.`;
        }

        // 19. Fallback
        return fallbackResponse(fixedQuestion);
    }


    /* ============================================================
       LINK SANITIZER
       ============================================================ */

    function safeURL(url) {
        try {
            const parsed = new URL(url, window.location.href);
            const allowedProtocols = ["http:", "https:", "mailto:", "tel:"];
            if (!allowedProtocols.includes(parsed.protocol)) return "#";
            return parsed.href;
        } catch {
            return "#";
        }
    }


    /* ============================================================
       SUGGESTIONS
       ============================================================ */

    const SUGGESTIONS = {
        greeting: [
            "What are his skills?",
            "Tell me about his companies",
            "How to contact him?"
        ],
        help: [
            "What are his skills?",
            "Tell me about Warstom",
            "Contact him"
        ],
        fallback: [
            "What are his skills?",
            "Tell me about his companies",
            "How to contact him?"
        ],
        default: [
            "What are his skills?",
            "Tell me about his companies",
            "How to contact him?"
        ]
    };


    function renderSuggestions(intentName) {
        const suggestionIntents = ["help", "fallback", "greeting", "default"];

        if (!suggestionIntents.includes(intentName)) {
            return "";
        }

        const suggestions = SUGGESTIONS[intentName] || SUGGESTIONS.default;
        if (!suggestions || !suggestions.length) return "";

        const buttons = suggestions.map(s =>
            `<button class="ai-suggest-btn" onclick="window.sendSuggestion('${s.replace(/'/g, "\\'")}')">${s}</button>`
        ).join("");

        return `\n\n%%SUGGESTIONS%%<div class="ai-suggestions">${buttons}</div>%%/SUGGESTIONS%%`;
    }


    window.sendSuggestion = function (text) {
        if (!aiInput) return;
        aiInput.value = text;
        sendMessage();
    };


    /* ============================================================
       MARKDOWN LINK RENDERER
       ============================================================ */

    function renderMarkdownLink(label, url) {
        const cleanLabel = (label === undefined || label === null || label === "" || label === "undefined" || label === "null")
            ? (url ? String(url).replace(/^https?:\/\//i, "").replace(/\/$/, "") : "Link")
            : String(label).trim();

        const cleanUrl = normalizeURL(url);

        if (!cleanUrl) {
            return escapeHTML(cleanLabel);
        }

        const finalUrl = safeURL(cleanUrl);

        return `<a href="${escapeHTML(finalUrl)}" target="_blank" rel="noopener noreferrer" class="ai-link-btn">${escapeHTML(cleanLabel)} <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    }


    /* ============================================================
       MESSAGE RENDERING
       ============================================================ */

    function renderWithLinks(text) {
        let safe = escapeHTML(text);

        // Bold
        safe = safe.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

        // Markdown links [label](url)
        safe = safe.replace(
            /\[([^\]]*)\]\(([^)\s]+)\)/g,
            (_, label, url) => renderMarkdownLink(label, url)
        );

        // Plain URLs (not inside href)
        safe = safe.replace(
            /(^|[\s>])(https?:\/\/[^\s<]+)/g,
            (_, prefix, url) => {
                const clean = url.replace(/[.,!?;:]+$/, "");
                const safeUrl = safeURL(clean);
                return `${prefix}<a href="${escapeHTML(safeUrl)}" target="_blank" rel="noopener noreferrer" class="ai-link-btn">${escapeHTML(clean)} <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
            }
        );

        // Company logo injection
        safe = safe.replace(
            /%%COMPANY_LOGO:([a-z0-9\-]+)%%/gi,
            (match, companyKey) => {
                const logoMap = {
                    warstom:   { src: "warstomfulllogo.png",  alt: "Warstom" },
                    weyra:     { src: "20260923_153222.png",  alt: "Weyra AI" },
                    solarax:   { src: "solaraxfulllogo.png",  alt: "Solarax" },
                    "4event":  { src: "4eventlogoicon.png",   alt: "4-Event" },
                    "4-event": { src: "4eventlogoicon.png",   alt: "4-Event" }
                };
                const logo = logoMap[companyKey.toLowerCase()];
                if (!logo) return "";
                return `<div class="ai-company-logo"><img src="${logo.src}" alt="${logo.alt}"></div>`;
            }
        );

        // School image injection
        safe = safe.replace(
            /%%SCHOOL_IMAGE:([a-z0-9\-]+)%%/gi,
            (match, schoolKey) => {
                const schoolMap = {
                    cfmmer: { src: "cfmmerpicture.jpg", alt: "CFMMER - Rabat" }
                };
                const school = schoolMap[schoolKey.toLowerCase()];
                if (!school) return "";
                return `<div class="ai-school-image"><img src="${school.src}" alt="${school.alt}" loading="lazy"></div>`;
            }
        );

        // New lines
        safe = safe.replace(/\n/g, "<br>");

        // Restore suggestion block
        safe = safe.replace(
            /%%SUGGESTIONS%%([\s\S]*?)%%\/SUGGESTIONS%%/g,
            (match, inner) => inner
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&amp;/g, "&")
                .replace(/&quot;/g, '"')
                .replace(/&#039;/g, "'")
        );

        return safe;
    }


    function addMessage(text, type, allowLinks = false) {
        if (!aiMessages) return;

        const el = document.createElement("div");
        el.className = `ai-message ai-message-${type}`;

        if (allowLinks && type === "bot") {
            el.innerHTML = renderWithLinks(text);
        } else {
            el.textContent = text;
        }

        aiMessages.appendChild(el);
        aiMessages.scrollTop = aiMessages.scrollHeight;

        updateScrollButton();
    }


    function createTypingLogo() {
        const typingEl = document.createElement("div");
        typingEl.className = "ai-message ai-message-bot ai-message-typing";
        typingEl.innerHTML = '<img src="20260923_152215.png" alt="Weyra AI" class="ai-typing-logo">';
        aiMessages.appendChild(typingEl);
        aiMessages.scrollTop = aiMessages.scrollHeight;

        updateScrollButton();

        return typingEl;
    }


    /* ============================================================
       SCROLL TO BOTTOM
       ============================================================ */

    function updateScrollButton() {
        if (!aiMessages || !aiScrollBottom) return;

        const distanceFromBottom =
            aiMessages.scrollHeight - aiMessages.scrollTop - aiMessages.clientHeight;

        if (distanceFromBottom > 80) {
            aiScrollBottom.classList.add("visible");
        } else {
            aiScrollBottom.classList.remove("visible");
        }
    }

    aiMessages?.addEventListener("scroll", updateScrollButton);

    aiScrollBottom?.addEventListener("click", () => {
        aiMessages?.scrollTo({
            top: aiMessages.scrollHeight,
            behavior: "smooth"
        });
    });


    /* ============================================================
       SEND MESSAGE
       ============================================================ */

    function sendMessage(forcedText) {
        if (isSending) return;
        if (!aiInput || !aiMessages) return;

        const text = typeof forcedText === "string"
            ? forcedText.trim()
            : aiInput.value.trim();

        if (!text) return;

        isSending = true;

        window._lastQuestion = text;

        window.conversationHistory.push({
            role: "user",
            content: text,
            timestamp: Date.now()
        });

        if (window.conversationHistory.length > 12) {
            window.conversationHistory = window.conversationHistory.slice(-12);
        }

        // Anti-spam
        if (text.toLowerCase() === window.lastMessage.toLowerCase()) {
            window.repeatCount++;
            if (window.repeatCount >= 3) {
                const msg = window.visitorName
                    ? `You've asked that 3 times, **${window.visitorName}**! 😅 Try something different or say 'help'.`
                    : `You've asked that 3 times! 😅 Try asking differently or say 'help' to see what I can do.`;
                addMessage(msg, "bot");
                window.repeatCount = 0;
                isSending = false;
                return;
            }
        } else {
            window.repeatCount = 0;
            window.lastMessage = text;
        }

        if (typeof forcedText !== "string") {
            aiInput.value = "";
        }

        addMessage(text, "user");

        const typingEl = createTypingLogo();

        setTimeout(() => {
            typingEl.remove();

            if (!dataLoaded) {
                addMessage("I'm loading Wassim's profile. Please try again in a moment.", "bot");
                isSending = false;
                return;
            }

            let reply = getAIResponse(text);

            const intentName = window.lastIntentName;
            if (intentName) {
                reply += renderSuggestions(intentName);
            }

            window.conversationHistory.push({
                role: "bot",
                content: reply,
                timestamp: Date.now()
            });

            if (window.conversationHistory.length > 12) {
                window.conversationHistory = window.conversationHistory.slice(-12);
            }

            addMessage(reply, "bot", true);
            isSending = false;
        }, 1200);
    }


    /* ============================================================
       SEND EVENTS
       ============================================================ */

    aiSend?.addEventListener("click", sendMessage);

    aiInput?.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });


    /* ============================================================
       PUBLIC DEBUG API
       ============================================================ */

    window.Weyra = {
        version: "2.2.0",
        ask: (q) => getAIResponse(q),
        correct: (t) => correctWords(t),
        detectEntity: (t) => detectEntity(t),
        detectTopic: (t) => detectTopic(t),
        getData: () => window.userData,
        getName: () => window.visitorName,
        setName: (n) => { window.visitorName = n; },
        clearHistory: () => {
            window.conversationHistory = [];
            window.lastTopic = null;
            window.lastList = null;
            window.lastMessage = "";
            window.repeatCount = 0;
        }
    };

    console.log("%cWeyra AI v2.2.0 loaded", "font-weight:bold;");

})();
