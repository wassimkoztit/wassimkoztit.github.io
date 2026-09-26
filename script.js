// ========================================
// PAGE LOAD ANIMATION
// ========================================

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


// ========================================
// AI CHAT ASSISTANT
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    // ----------------------------------------
    // STATE (global)
    // ----------------------------------------
    window.userData = null;
    window.lastReplies = {};
    window.lastTopic = null;
    window.lastList = null;
    window.lastMessage = "";
    window.repeatCount = 0;
    window._lastQuestion = "";

    // ----------------------------------------
    // DOM ELEMENTS
    // ----------------------------------------
    const aiModal        = document.getElementById("aiChatModal");
    const aiClose        = document.getElementById("aiChatClose");
    const aiInput        = document.getElementById("aiChatInput");
    const aiSend         = document.getElementById("aiChatSend");
    const aiMessages     = document.getElementById("aiChatMessages");
    const aiTrigger      = document.querySelector(".ai-chat-trigger");
    const aiScrollBottom = document.getElementById("aiScrollBottom");

    // ----------------------------------------
    // LOAD me.json
    // ----------------------------------------
    fetch("me.json")
        .then(res => res.json())
        .then(data => {
            window.userData = data;
            console.log("AI data loaded:", data.name);
        })
        .catch(err => console.error("Failed to load me.json:", err));


    // ----------------------------------------
    // OPEN MODAL
    // ----------------------------------------
    aiTrigger?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!aiModal) return;

        aiModal.classList.add("active");
        setTimeout(() => aiInput?.focus(), 300);
    });


    // ----------------------------------------
    // CLOSE MODAL
    // ----------------------------------------
    aiClose?.addEventListener("click", () => {
        aiModal?.classList.remove("active");
    });

    aiModal?.addEventListener("click", (e) => {
        if (e.target === aiModal) aiModal.classList.remove("active");
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") aiModal?.classList.remove("active");
    });


    // ----------------------------------------
    // SEND MESSAGE (with anti-spam)
    // ----------------------------------------
    aiSend?.addEventListener("click", sendMessage);

    aiInput?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    function sendMessage(forcedText) {
        if (!aiInput || !aiMessages) return;

        const text = typeof forcedText === "string"
            ? forcedText.trim()
            : aiInput.value.trim();

        if (!text) return;

        // Store last question for context (used by "more <company>")
        window._lastQuestion = text;

        // Anti-spam: same message repeated 3+ times
        if (text.toLowerCase() === window.lastMessage.toLowerCase()) {
            window.repeatCount++;
            if (window.repeatCount >= 3) {
                addMessage("You've asked that 3 times! 😅 Try asking differently or say 'help' to see what I can do.", "bot");
                window.repeatCount = 0;
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

        const typingEl = document.createElement("div");
        typingEl.className = "ai-message ai-message-bot ai-message-typing";
        typingEl.innerHTML = '<img src="20260923_152215.png" alt="Weyra AI" class="ai-typing-logo">';
        aiMessages.appendChild(typingEl);
        aiMessages.scrollTop = aiMessages.scrollHeight;

        updateScrollButton();

        setTimeout(() => {
            typingEl.remove();
            const reply = getAIResponse(text, window.userData, window.lastReplies);
            addMessage(reply, "bot", true);
        }, 1400);
    }


    // ----------------------------------------
    // ADD MESSAGE
    // ----------------------------------------
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


    // ----------------------------------------
    // SUGGESTION CLICK HANDLER
    // ----------------------------------------
    window.sendSuggestion = function(text) {
        if (!aiInput) return;
        aiInput.value = text;
        sendMessage();
    };


    // ----------------------------------------
    // SCROLL-TO-BOTTOM BUTTON
    // ----------------------------------------
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

});


// ========================================
// RENDER MESSAGE
// ========================================

function renderWithLinks(text) {
    let safe = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    safe = safe.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    safe = safe.replace(/\n/g, "<br>");

    // [label](url) → button link
    safe = safe.replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="ai-link-btn">$1 <i class="fa-solid fa-arrow-up-right-from-square"></i></a>'
    );

    // Restore suggestion block (unescape HTML inside the placeholder)
    safe = safe.replace(
        /%%SUGGESTIONS%%([\s\S]*?)%%\/SUGGESTIONS%%/g,
        (match, inner) => inner
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
    );

    return safe;
}


// ========================================
// NORMALIZE
// ========================================

function normalize(str) {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}


// ========================================
// TYPO FIXES
// ========================================

const TYPO_FIXES = {
    // ----------------------------------------
    // SMS / CHAT SHORTHAND
    // ----------------------------------------
    "wat": "what",
    "wats": "what is",
    "wot": "what",
    "hw": "how",
    "hru": "how are you",
    "howru": "how are you",
    "u": "you",
    "ur": "your",
    "urs": "yours",
    "r": "are",
    "r u": "are you",
    "pls": "please",
    "plz": "please",
    "thx": "thanks",
    "ty": "thank you",
    "tq": "thank you",
    "np": "no problem",
    "idk": "i don't know",
    "idc": "i don't care",
    "btw": "by the way",
    "fyi": "for your information",
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
    "wanna to": "want to",
    "gonna": "going",
    "gotta": "got to",
    "kinda": "kind of",
    "sorta": "sort of",
    "lemme": "let me",
    "gimme": "give me",
    "cuz": "because",
    "coz": "because",
    "becoz": "because",

    // ----------------------------------------
    // NAMES / BRANDS
    // ----------------------------------------
    "wasim": "wassim",
    "wasm": "wassim",
    "wassm": "wassim",
    "wassem": "wassim",
    "wassime": "wassim",
    "wasiim": "wassim",
    "waseem": "wassim",
    "weyrah": "weyra",
    "weyraa": "weyra",
    "wiera": "weyra",
    "warstome": "warstom",
    "warstm": "warstom",
    "wastrom": "warstom",
    "wrstom": "warstom",
    "solaraks": "solarax",
    "solrax": "solarax",
    "solarx": "solarax",
    "4evnt": "4event",
    "4ev": "4event",
    "4vnt": "4event"
};

// ========================================
// ADVANCED TYPO HANDLER
// ========================================

function fixTypos(text) {
    let fixed = text;

    // 1. Apply SMS shorthand dictionary
    fixed = applyShorthand(fixed);

    // 2. Collapse repeated letters (3+ → 1)
    //    "helloooo" → "hello", "skiiills" → "skills"
    fixed = collapseRepeated(fixed);

    // 3. Fix leet/numbers inside words
    //    "sk1lls" → "skills", "c0ntact" → "contact"
    fixed = fixLeetSpeak(fixed);

    // 4. Split glued words (best-effort)
    //    "whatishisemail" → "what is his email"
    fixed = splitGlued(fixed);

    return fixed;
}


// ----------------------------------------
// 1. Apply SMS shorthand
// ----------------------------------------
function applyShorthand(text) {
    let out = text;
    // Sort by length descending so "r u" is replaced before "r"
    const keys = Object.keys(TYPO_FIXES).sort((a, b) => b.length - a.length);

    keys.forEach(from => {
        const to = TYPO_FIXES[from];
        const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`\\b${escaped}\\b`, "gi");
        out = out.replace(regex, to);
    });

    return out;
}


// ----------------------------------------
// 2. Collapse repeated letters
//    "helloooo" → "hello"
//    "skiiiiillsss" → "skills"
// ----------------------------------------
function collapseRepeated(text) {
    return text.replace(/([a-zA-Z])\1{2,}/g, "$1");
}


// ----------------------------------------
// 3. Fix leet speak inside words
//    0 → o, 1 → i/l, 3 → e, 4 → a, 5 → s, 7 → t, @ → a
// ----------------------------------------
function fixLeetSpeak(text) {
    return text
        .replace(/([a-zA-Z])0([a-zA-Z])/g, "$1o$2")   // sk0lls → skolls
        .replace(/([a-zA-Z])1([a-zA-Z])/g, "$1i$2")   // sk1lls → skills
        .replace(/([a-zA-Z])3([a-zA-Z])/g, "$1e$2")   // h3llo → hello
        .replace(/([a-zA-Z])4([a-zA-Z])/g, "$1a$2")   // w4ssim → wassim
        .replace(/([a-zA-Z])5([a-zA-Z])/g, "$1s$2")   // wa55im → wassim
        .replace(/([a-zA-Z])7([a-zA-Z])/g, "$1t$2")   // con7act → contact
        .replace(/@/g, "a");
}


// ----------------------------------------
// 4. Split glued words (best-effort)
//    "whatishisemail" → "what is his email"
//    "tellmeaboutwarstom" → "tell me about warstom"
// ----------------------------------------
const GLUED_WORDS = [
    "what", "is", "his", "her", "the", "about", "tell", "me",
    "how", "can", "i", "you", "your", "contact", "him", "her",
    "email", "phone", "whatsapp", "warstom", "weyra", "solarax",
    "event", "skills", "skill", "company", "companies", "birthday",
    "location", "education", "experience", "projects", "name",
    "who", "where", "when", "why", "more", "details", "show",
    "give", "get", "find", "help", "hi", "hello", "and", "or"
];

function splitGlued(text) {
    // Only try to split words with no spaces that are long
    return text.replace(/\b([a-z]{12,})\b/gi, (word) => {
        const lower = word.toLowerCase();

        // Don't touch if already contains known words
        if (GLUED_WORDS.some(w => lower.startsWith(w))) {
            return greedySplit(lower);
        }
        return word;
    });
}

function greedySplit(word) {
    const result = [];
    let remaining = word;

    // Sort by length desc to prefer longer matches
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
            // Can't split further — append rest and bail
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


// ========================================
// LEVENSHTEIN
// ========================================

function levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

// ========================================
// SIMILARITY (0 → 1)
// ========================================

function similarity(a, b) {
    if (!a || !b) return 0;
    if (a === b) return 1;

    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;

    const dist = levenshtein(a, b);
    return 1 - (dist / maxLen);
}


function fuzzyMatch(word, keyword) {
    if (word === keyword) return true;
    if (!word || !keyword) return false;

    // Don't fuzzy-match very short words
    if (word.length < 3 || keyword.length < 3) return false;

    // Adaptive threshold: longer words allow more errors
    const maxLen = Math.max(word.length, keyword.length);
    let threshold = 0.3;

    if (maxLen >= 10) threshold = 0.35;  // longer words → more tolerance
    if (maxLen <= 5)  threshold = 0.25;  // shorter words → less tolerance

    const sim = similarity(word, keyword);
    return (1 - sim) <= threshold;
}


// ========================================
// STOP WORDS
// ========================================

const STOP_WORDS = new Set([
    "i", "me", "my", "mine", "you", "your", "yours",
    "he", "him", "his", "she", "her", "it", "its",
    "we", "us", "our", "they", "them", "their",
    "a", "an", "the", "is", "are", "was", "were",
    "be", "been", "being", "am",
    "do", "does", "did", "doing",
    "have", "has", "had", "having",
    "will", "would", "shall", "should",
    "can", "could", "may", "might", "must",
    "to", "of", "in", "on", "at", "by", "for",
    "with", "about", "from", "into", "onto", "upon",
    "and", "or", "but", "so", "if", "then", "than",
    "this", "that", "these", "those",
    "there", "here", "where", "when", "why", "how",
    "what", "which", "who", "whom", "whose",
    "please", "kindly", "just", "really", "very",
    "want", "wanna", "need", "like", "would",
    "tell", "show", "give", "know", "get", "find",
    "see", "look", "let", "make", "made"
]);


// ========================================
// RANDOM PICK
// ========================================

function pickRandom(intentName, options, lastReplies) {
    if (!options || options.length === 0) return () => "";
    if (options.length === 1) return options[0];

    lastReplies = lastReplies || window.lastReplies || (window.lastReplies = {});

    let last = lastReplies[intentName];
    let choice;

    for (let i = 0; i < 5; i++) {
        choice = options[Math.floor(Math.random() * options.length)];
        if (choice !== last) break;
    }

    lastReplies[intentName] = choice;
    return choice;
}


// ========================================
// MATH EVALUATOR
// ========================================

function tryMath(question) {
    const cleaned = question.replace(/[^0-9+\-*/().\s]/g, "").trim();

    if (!/[+\-*/]/.test(cleaned)) return null;
    if (!/\d/.test(cleaned)) return null;
    if (cleaned.length > 30) return null;

    try {
        const result = Function(`"use strict"; return (${cleaned})`)();
        if (typeof result !== "number" || !isFinite(result)) return null;
        return { expression: cleaned, result };
    } catch {
        return null;
    }
}


// ========================================
// SUGGESTIONS PER INTENT
// ========================================

const SUGGESTIONS = {
    greeting:     ["What are his skills?", "Tell me about his companies", "How to contact him?"],
    howareyou:    ["What can you do?", "Who is Wassim?", "Show his companies"],
    who:          ["His birthday?", "His location?", "His education?"],
    skills:       ["Show programming skills", "His certifications?", "His experience?"],
    programming:  ["Other skills?", "His projects?", "Contact him"],
    companies:    ["Tell me about Warstom", "What is Weyra AI?", "Tell me about Solarax"],
    warstom:      ["More Warstom details", "Tell me about Weyra AI", "Other companies?"],
    weyra:        ["More Weyra details", "Tell me about Warstom", "Other companies?"],
    solarax:      ["More Solarax details", "Tell me about Warstom", "Other companies?"],
    "4event":     ["More 4-Event details", "Tell me about Warstom", "Other companies?"],
    company_detail: ["Other companies?", "How to contact him?", "His skills?"],
    contact:      ["Show his Instagram", "His WhatsApp?", "His GitHub?"],
    email:        ["His WhatsApp?", "His Instagram?", "How to contact him?"],
    whatsapp:     ["His email?", "His Instagram?", "Contact him"],
    instagram:    ["His GitHub?", "His LinkedIn?", "Contact him"],
    github:       ["His LinkedIn?", "His projects?", "Contact him"],
    linkedin:     ["His GitHub?", "His experience?", "Contact him"],
    projects:     ["His companies?", "His skills?", "Contact him"],
    education:    ["His experience?", "His certifications?", "His skills?"],
    experience:   ["His education?", "His certifications?", "Contact him"],
    birthday:     ["His location?", "His education?", "His companies?"],
    location:     ["His birthday?", "His education?", "Contact him"],
    languages:    ["His skills?", "His education?", "Contact him"],
    interests:    ["His skills?", "His companies?", "Contact him"],
    certifications: ["His education?", "His experience?", "Contact him"],
    fields:       ["His skills?", "His companies?", "Contact him"],
    job:          ["His companies?", "His skills?", "Contact him"],
    help:         ["What are his skills?", "Tell me about Warstom", "Contact him"],
    default:      ["What are his skills?", "Tell me about his companies", "How to contact him?"]
};

function getSuggestions(intentName) {
    return SUGGESTIONS[intentName] || SUGGESTIONS.default;
}

function renderSuggestions(intentName) {
    const suggestions = getSuggestions(intentName);
    if (!suggestions || suggestions.length === 0) return "";

    const buttons = suggestions.map(s =>
        `<button class="ai-suggest-btn" onclick="window.sendSuggestion('${s.replace(/'/g, "\\'")}')">${s}</button>`
    ).join("");

    return `\n\n%%SUGGESTIONS%%<div class="ai-suggestions">${buttons}</div>%%/SUGGESTIONS%%`;
}


// ========================================
// GET MORE ABOUT TOPIC
// ========================================

function getMoreAbout(topic) {
    const u = window.userData || {};
    const moreInfo = {
        skills: u.skills?.technical
            ? `He has ${u.skills.technical.length} technical skills including:\n- ${u.skills.technical.slice(0, 8).join("\n- ")}`
            : "He has various technical skills in electrical engineering and web development.",
        companies: u.companies
            ? `He founded/co-founded ${u.companies.length} companies:\n${u.companies.map((c, i) => `${i + 1}. **${c.name}** — ${c.role}\n   ${c.tagline}`).join("\n")}\n\nAsk about any one by name for details.`
            : "He has founded multiple companies.",
        contact: u.email
            ? `Best ways to reach him:\n- Email: ${u.email}\n- WhatsApp: ${u.whatsapp_personal || ""}`
            : "You can reach him via email, WhatsApp, or social media.",
        who: u.about
            ? `${u.name} - ${u.title}\n\n${u.about}`
            : "He's the person behind this page.",
        projects: u.projects
            ? `His projects:\n- ${u.projects.join("\n- ")}`
            : "He works on various projects.",
        experience: u.experience
            ? u.experience.map(e => `- ${e.role} - ${e.field}`).join("\n")
            : "He has professional experience in his field.",
        education: u.education
            ? u.education.map(e => `- ${e.diploma} (${e.year})`).join("\n")
            : "He has a technical diploma."
    };

    return moreInfo[topic] || "What specifically would you like to know?";
}


// ========================================
// INTENTS
// ========================================

const INTENTS = [

    // ----------------------------------------
    // COMPANY DETAILS (via "more warstom" etc.)
    // ----------------------------------------
    {
        name: "company_detail",
        keywords: [
            "more warstom", "more weyra", "more 4event", "more 4-event", "more solarax",
            "details warstom", "details weyra", "details 4event", "details 4-event", "details solarax",
            "full warstom", "full weyra", "full 4event", "full 4-event", "full solarax",
            "warstom details", "weyra details", "4event details", "solarax details"
        ],
        replies: [
            () => {
                const q = (window._lastQuestion || "").toLowerCase();
                let companyName = null;

                if (q.includes("warstom")) companyName = "Warstom";
                else if (q.includes("weyra")) companyName = "Weyra AI";
                else if (q.includes("4-event") || q.includes("4event") || q.includes("4 event")) companyName = "4-Event";
                else if (q.includes("solarax")) companyName = "Solarax";

                if (!companyName) {
                    return "Which company? Try:\n- 'more warstom'\n- 'more weyra'\n- 'more 4event'\n- 'more solarax'";
                }

                const c = window.userData?.companies?.find(x => x.name === companyName);
                if (!c) return `${companyName} info not available.`;

                return `**${c.name} — Full Details**\n\n**Role:** ${c.role}\n**Website:** [${c.website}](https://${c.website})\n**Status:** ${c.status}\n**Expected launch:** ${c.expected_launch}\n**Category:** ${c.category}\n\n**Tagline:** ${c.tagline}\n\n**Description:**\n${c.description}\n\n**All features:**\n- ${c.features.join("\n- ")}\n\n**Mission:**\n${c.mission}`;
            }
        ]
    },

    // ----------------------------------------
    // "MORE" — continue previous topic
    // ----------------------------------------
    {
        name: "more",
        keywords: [
            "more", "tell me more", "continue", "next",
            "go on", "keep going", "and", "also", "details"
        ],
        replies: [
            () => {
                if (window.lastTopic && window.lastTopic !== "more" && window.lastTopic !== "fallback" && window.lastTopic !== "company_detail") {
                    return getMoreAbout(window.lastTopic);
                }
                return "More about what? Try asking about his skills, companies, or contact info.";
            }
        ]
    },

    {
        name: "howareyou",
        keywords: [
            "how are you", "how r u", "how r you", "hru",
            "how you doing", "how are u", "how is it going",
            "how is it", "whats up", "wassup", "sup",
            "how do you feel", "how you feel"
        ],
        replies: [
            () => `I'm just code, but running great - thanks for asking!\n\nHow can I help you today?`,
            () => `Doing well on my side! Ready to answer anything about the person behind this page.`,
            () => `All good here! What would you like to know?`,
            () => `I'm fine, thanks! Ask me anything - skills, companies, contact...`
        ]
    },

    {
        name: "greeting",
        keywords: [
            "hi", "hello", "hey", "yo", "hola",
            "good morning", "good evening", "good afternoon"
        ],
        replies: [
            () => `Hello! I'm Weyra AI v3.03.01 - your AI assistant.\n\nAsk me about:\n- Birthday\n- Skills\n- Companies\n- Projects\n- Contact info`,
            () => `Hi there! Ready to answer anything. What would you like to know?`,
            () => `Hey! I know a lot. Skills, companies, projects, contact... just ask!`,
            () => `Welcome! I'm here to help. Try asking "what are his skills?" or "tell me about his companies"`
        ]
    },

    {
        name: "thanks",
        keywords: ["thanks", "thank", "thank you", "thx", "ty", "appreciate"],
        replies: [
            () => "You're welcome! Happy to help. Anything else?",
            () => "Glad I could help! Ask me anything else.",
            () => "No problem at all! Anything else you want to know?",
            () => "My pleasure! Feel free to ask more questions."
        ]
    },

    {
        name: "goodbye",
        keywords: ["bye", "goodbye", "see you", "cya", "later", "good night", "farewell"],
        replies: [
            () => "Goodbye! Come back anytime.",
            () => "See you later! Take care.",
            () => "Bye! Feel free to return whenever you need.",
            () => "Take care! Have a great day."
        ]
    },

    {
        name: "bot_identity",
        keywords: [
            "your name", "who are you", "what are you",
            "are you human", "are you a bot", "are you real",
            "are you ai", "are you a robot", "your identity",
            "what is your name", "who made you", "who created you",
            "who built you", "who developed you",
            "what is weyra", "tell me about weyra",
            "tell me about yourself", "introduce yourself",
            "which version", "your version", "what version"
        ],
        replies: [
            () => `I'm **Weyra AI v3.03.01** - a mini version generated by **Wassim El Koztit**.\n\nI know everything about him: skills, companies, projects, contact info.`,
            () => `I'm the mini version of **Weyra AI**, version **v3.03.01**.\n\nI was generated by Wassim to help you learn about him.`,
            () => `**Weyra AI v3.03.01** here - a lightweight assistant created by Wassim.\n\nAsk me anything about him!`,
            () => `I'm a mini Weyra AI (v3.03.01), generated by Wassim.\n\nPart of his upcoming Weyra project at [weyra.ai](https://weyra.ai) (launching 03-2027).`
        ]
    },

    {
        name: "compliment",
        keywords: [
            "you are smart", "you are great", "you are amazing",
            "you are cool", "you are good", "nice", "cool",
            "awesome", "great job", "well done", "bravo",
            "impressive", "you rock", "good bot", "nice bot",
            "you are the best", "i like you"
        ],
        replies: [
            () => `Thank you! That's very kind.`,
            () => `Thanks! I appreciate it. Anything else I can help with?`,
            () => `Aw, thanks! I'll do my best to keep helping you.`,
            () => `Appreciate it! Let me know if you need anything else.`
        ]
    },

    {
        name: "insult",
        keywords: [
            "you are stupid", "you are dumb", "you are bad",
            "you are useless", "you suck", "i hate you",
            "shut up", "you are wrong", "nonsense"
        ],
        replies: [
            () => `Sorry if I didn't help. Try asking differently or in another way.`,
            () => `I'm still learning. Can you rephrase your question?`,
            () => `My apologies. Let me try again - what exactly do you want to know?`
        ]
    },

    {
        name: "joke",
        keywords: ["tell me a joke", "make me laugh", "say something funny", "joke"],
        replies: [
            () => `Why did the electrician go to therapy?\nBecause he had too many live wires!`,
            () => `Why do solar panels make great comedians?\nBecause they always shine bright!`,
            () => `I would tell you a joke about AI, but I'm still processing it.`
        ]
    },

    {
        name: "time",
        keywords: ["what time is it", "current time", "time now", "what is the time"],
        replies: [
            () => `I don't have a real clock, but your device knows: ${new Date().toLocaleTimeString()}`
        ]
    },

    {
        name: "date",
        keywords: ["what date is it", "today's date", "current date", "what day is it"],
        replies: [
            () => `Today is ${new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}.`
        ]
    },

    {
        name: "help",
        keywords: [
            "help", "what can you do", "options", "menu",
            "commands", "questions",
            "what can i ask", "what can i ask you", "show me options"
        ],
        replies: [
            () => `I can answer:\n- Birthday & age\n- Email, WhatsApp, phone\n- Instagram, Facebook, LinkedIn, GitHub\n- Skills (technical & programming)\n- Education\n- Experience\n- Companies (Warstom, Weyra, 4-Event, Solarax)\n- Languages\n- Projects\n- Location`,
            () => `Ask me about the owner:\n- Skills & expertise\n- Companies\n- Projects\n- Contact info\n- Education & experience\n- Social media\n\nOr just say "hi"!`,
            () => `You can ask things like:\n- "What is his email?"\n- "Tell me about Warstom"\n- "What are his skills?"\n- "Who is Wassim?"\n- "Show his Instagram"`
        ]
    },

    {
        name: "email",
        keywords: [
            "email", "mail", "gmail", "e mail", "e-mail",
            "send email", "his email", "email address"
        ],
        replies: [
            () => `${window.userData?.email || ""}`,
            () => `His email: ${window.userData?.email || ""}`,
            () => `[Send him an email](mailto:${window.userData?.email || ""})`
        ]
    },

    {
        name: "whatsapp",
        keywords: [
            "whatsapp", "wa", "whats app", "what's app",
            "whatsapp number", "whatsapp business"
        ],
        replies: [
            () => `Personal: ${window.userData?.whatsapp_personal || ""}\nBusiness: ${window.userData?.whatsapp_business || ""}`,
            () => `WhatsApp Personal: ${window.userData?.whatsapp_personal || ""}\nWhatsApp Business: ${window.userData?.whatsapp_business || ""}`,
            () => `[Personal WhatsApp](https://wa.me/212679484103)  \n[Business WhatsApp](https://wa.me/212664158149)`
        ]
    },

    {
        name: "phone",
        keywords: [
            "phone", "number", "tel", "telephone",
            "call", "mobile", "gsm", "phone number",
            "his number", "his phone"
        ],
        replies: [
            () => `Personal: ${window.userData?.whatsapp_personal || ""}\nBusiness: ${window.userData?.whatsapp_business || ""}`,
            () => `His phone numbers:\n- Personal: ${window.userData?.whatsapp_personal || ""}\n- Business: ${window.userData?.whatsapp_business || ""}`
        ]
    },

    {
        name: "instagram",
        keywords: ["instagram", "insta", "ig"],
        replies: [
            () => `[Instagram](${window.userData?.social?.instagram || ""})`,
            () => `His Instagram: ${window.userData?.social?.instagram || ""}`,
            () => `[Follow him on Instagram](${window.userData?.social?.instagram || ""})`
        ]
    },

    {
        name: "facebook",
        keywords: ["facebook", "fb"],
        replies: [
            () => `[Facebook](${window.userData?.social?.facebook || ""})`,
            () => `His Facebook: ${window.userData?.social?.facebook || ""}`,
            () => `[Visit his Facebook](${window.userData?.social?.facebook || ""})`
        ]
    },

    {
        name: "linkedin",
        keywords: ["linkedin", "linked in", "ln"],
        replies: [
            () => `[LinkedIn](${window.userData?.social?.linkedin || ""})`,
            () => `His LinkedIn: ${window.userData?.social?.linkedin || ""}`,
            () => `[Connect with him on LinkedIn](${window.userData?.social?.linkedin || ""})`
        ]
    },

    {
        name: "github",
        keywords: ["github", "git hub", "git"],
        replies: [
            () => `[GitHub](${window.userData?.social?.github || ""})`,
            () => `His GitHub: ${window.userData?.social?.github || ""}`,
            () => `[Check his GitHub](${window.userData?.social?.github || ""})`
        ]
    },

    {
        name: "contact",
        keywords: [
            "contact", "reach", "reach him", "get in touch",
            "talk to him", "speak to him", "message him",
            "hire him", "work with him", "contact him",
            "contact info", "contact information",
            "how to contact", "how can i contact"
        ],
        replies: [
            () => `You can reach him here:\n\n[Email](mailto:${window.userData?.email || ""})\n[WhatsApp Personal](https://wa.me/212679484103)\n[WhatsApp Business](https://wa.me/212664158149)`,
            () => `Contact options:\n\nEmail: ${window.userData?.email || ""}\n[Personal WhatsApp](https://wa.me/212679484103)\n[Business WhatsApp](https://wa.me/212664158149)`,
            () => `Ways to contact him:\n\n[Send Email](mailto:${window.userData?.email || ""})\n[WhatsApp](https://wa.me/212664158149)`
        ]
    },

    {
        name: "who",
        keywords: [
            "name", "who", "whois", "who is", "nom",
            "identity", "yourself", "about him",
            "presentation", "intro", "introduce",
            "tell me about", "info", "information"
        ],
        replies: [
            () => `${window.userData?.name || ""}\n${window.userData?.title || ""}\nLocation: ${window.userData?.location || ""}\n\n${window.userData?.about || ""}`,
            () => `${window.userData?.name || ""} is a ${window.userData?.title || ""} from ${window.userData?.location || ""}.\n\n${window.userData?.about || ""}`,
            () => `Let me introduce him:\n\nName: ${window.userData?.name || ""}\nTitle: ${window.userData?.title || ""}\nLocation: ${window.userData?.location || ""}\n\n${window.userData?.about || ""}`
        ]
    },

    {
        name: "skills",
        keywords: [
            "skill", "skills", "competence", "competences",
            "technical", "abilities", "expertise", "good at",
            "capable", "talents", "strengths"
        ],
        replies: [
            () => {
                if (!window.userData?.skills?.technical) return "Skills not loaded yet.";
                const tech = window.userData.skills.technical.slice(0, 6).map(s => `- ${s}`).join("\n");
                return `Top technical skills:\n${tech}\n\nAsk "programming" for languages.`;
            },
            () => {
                if (!window.userData?.skills?.technical) return "Skills not loaded yet.";
                const tech = window.userData.skills.technical.slice(6, 12).map(s => `- ${s}`).join("\n");
                return `More technical skills:\n${tech}`;
            },
            () => {
                if (!window.userData?.skills?.technical) return "Skills not loaded yet.";
                return `He has ${window.userData.skills.technical.length} technical skills total:\n- ${window.userData.skills.technical.slice(0, 5).join("\n- ")}`;
            }
        ]
    },

    {
        name: "programming",
        keywords: [
            "programming", "code", "coding", "dev", "developer",
            "tech stack", "framework", "html", "css",
            "javascript", "php", "software", "web dev"
        ],
        replies: [
            () => `Programming languages & tools:\n- ${(window.userData?.skills?.programming || []).join("\n- ")}`,
            () => `Tech stack:\n${(window.userData?.skills?.programming || []).map(s => `- ${s}`).join("\n")}`
        ]
    },

    {
        name: "other_skills",
        keywords: [
            "other", "soft skill", "soft skills", "design",
            "teamwork", "team work", "graphic", "svg"
        ],
        replies: [
            () => `Other skills:\n- ${(window.userData?.skills?.other || []).join("\n- ")}`
        ]
    },

    {
        name: "fields",
        keywords: ["field", "domain", "profession", "specialty", "metier", "industry"],
        replies: [
            () => `Fields: ${(window.userData?.fields || []).join(" | ")}`,
            () => `He works in:\n- ${(window.userData?.fields || []).join("\n- ")}`
        ]
    },

    {
        name: "job",
        keywords: ["job", "work", "career", "what does he do"],
        replies: [
            () => `He's a ${window.userData?.title || ""}.\n\nFields: ${(window.userData?.fields || []).join(" | ")}`
        ]
    },

    {
        name: "education",
        keywords: [
            "education", "study", "studies", "diploma", "degree",
            "formation", "school", "bac", "baccalaureate",
            "university", "college", "cfmmer", "student", "graduate"
        ],
        replies: [
            () => {
                if (!window.userData?.education) return "Education not loaded.";
                const edu = window.userData.education.map(e =>
                    `- ${e.diploma}${e.option ? " (" + e.option + ")" : ""}${e.school ? " - " + e.school : ""} - ${e.year}`
                ).join("\n");
                return `Education:\n${edu}`;
            }
        ]
    },

    {
        name: "experience",
        keywords: [
            "experience", "stage", "internship",
            "sgtm", "worked", "job history", "professional",
            "worked at", "worked for"
        ],
        replies: [
            () => {
                if (!window.userData?.experience) return "Experience not loaded.";
                const exp = window.userData.experience.map(e =>
                    `- ${e.role} - ${e.field}${e.note ? " (" + e.note + ")" : ""}`
                ).join("\n");
                return `Experience:\n${exp}`;
            }
        ]
    },

    {
        name: "certifications",
        keywords: [
            "certification", "certificate", "certifications",
            "certif", "award", "achievement", "diplome", "certified"
        ],
        replies: [
            () => `Certifications:\n- ${(window.userData?.certifications || []).join("\n- ")}`
        ]
    },

    {
        name: "languages",
        keywords: [
            "language", "langue", "speak", "languages",
            "spoken", "arabic", "french", "english", "spanish",
            "talks", "fluent"
        ],
        replies: [
            () => {
                if (!window.userData?.languages) return "Languages not loaded.";
                const langs = window.userData.languages.map(l => `- ${l.language}: ${l.level}`).join("\n");
                return `Languages:\n${langs}`;
            }
        ]
    },

    {
        name: "projects",
        keywords: ["project", "projects", "portfolio", "projet", "built", "created", "made", "work sample"],
        replies: [
            () => `Projects:\n- ${(window.userData?.projects || []).join("\n- ")}`,
            () => `Some of his projects:\n${(window.userData?.projects || []).map(p => `- ${p}`).join("\n")}`
        ]
    },

    // ----------------------------------------
    // COMPANIES (list)
    // ----------------------------------------
    {
        name: "companies",
        keywords: [
            "company", "companies", "business", "startup",
            "founder", "co-founder", "cofounder", "ceo",
            "owner", "entrepreneur", "venture",
            "his company", "his companies", "his startups",
            "what does he own", "what does he run"
        ],
        replies: [
            () => {
                if (!window.userData?.companies) return "Companies not loaded.";
                const list = window.userData.companies.map((c, i) => {
                    return `${i + 1}. **${c.name}** — ${c.role}\n   ${c.tagline}\n   [${c.website}](https://${c.website}) · ${c.status} (${c.expected_launch})`;
                }).join("\n\n");
                return `Wassim's companies & ventures:\n\n${list}\n\nAsk about any one by name (e.g., "tell me about Warstom") or by number (1-4).`;
            },
            () => {
                if (!window.userData?.companies) return "Companies not loaded.";
                const list = window.userData.companies.map((c, i) =>
                    `${i + 1}. **${c.name}** — ${c.role}\n   ${c.short_description}`
                ).join("\n\n");
                return `He founded/co-founded ${window.userData.companies.length} companies:\n\n${list}\n\nSay "1", "2", "3", or "4" for full details.`;
            }
        ]
    },

    // ----------------------------------------
    // WARSTOM
    // ----------------------------------------
    {
        name: "warstom",
        keywords: ["warstom", "warstom.com"],
        replies: [
            () => {
                const c = window.userData?.companies?.find(x => x.name === "Warstom");
                if (!c) return "Warstom info not available.";

                return `**${c.name}** — ${c.role}\n[${c.website}](https://${c.website})\nStatus: ${c.status}\nExpected launch: ${c.expected_launch}\nCategory: ${c.category}\n\n**${c.tagline}**\n\n${c.description}\n\n**Key features:**\n- ${c.features.slice(0, 6).join("\n- ")}\n\nAsk "more warstom" for the full list.`;
            }
        ]
    },

    // ----------------------------------------
    // WEYRA AI
    // ----------------------------------------
    {
        name: "weyra",
        keywords: ["weyra.ai", "weyra ai"],
        replies: [
            () => {
                const c = window.userData?.companies?.find(x => x.name === "Weyra AI");
                if (!c) return "Weyra AI info not available.";

                return `**${c.name}** — ${c.role}\n[${c.website}](https://${c.website})\nStatus: ${c.status}\nExpected launch: ${c.expected_launch}\nCategory: ${c.category}\n\n**${c.tagline}**\n\n${c.description}\n\n**Key features:**\n- ${c.features.slice(0, 6).join("\n- ")}\n\nAsk "more weyra" for the full list.`;
            }
        ]
    },

    // ----------------------------------------
    // 4-EVENT
    // ----------------------------------------
    {
        name: "4event",
        keywords: ["4-event", "4event", "4 event", "4-event.fun"],
        replies: [
            () => {
                const c = window.userData?.companies?.find(x => x.name === "4-Event");
                if (!c) return "4-Event info not available.";

                return `**${c.name}** — ${c.role}\n[${c.website}](https://${c.website})\nStatus: ${c.status}\nExpected launch: ${c.expected_launch}\nCategory: ${c.category}\n\n**${c.tagline}**\n\n${c.description}\n\n**Key features:**\n- ${c.features.slice(0, 6).join("\n- ")}\n\nAsk "more 4event" for the full list.`;
            }
        ]
    },

    // ----------------------------------------
    // SOLARAX
    // ----------------------------------------
    {
        name: "solarax",
        keywords: ["solarax", "solarax.ma"],
        replies: [
            () => {
                const c = window.userData?.companies?.find(x => x.name === "Solarax");
                if (!c) return "Solarax info not available.";

                return `**${c.name}** — ${c.role}\n[${c.website}](https://${c.website})\nStatus: ${c.status}\nExpected launch: ${c.expected_launch}\nCategory: ${c.category}\n\n**${c.tagline}**\n\n${c.description}\n\n**Key features:**\n- ${c.features.slice(0, 6).join("\n- ")}\n\nAsk "more solarax" for the full list.`;
            }
        ]
    },

    {
        name: "interests",
        keywords: ["interest", "hobby", "hobbies", "passion", "likes", "enjoys", "free time", "loisir", "loves"],
        replies: [
            () => `Interests: ${(window.userData?.interests || []).join(", ")}`,
            () => `He's passionate about:\n- ${(window.userData?.interests || []).join("\n- ")}`
        ]
    },

    {
        name: "location",
        keywords: [
            "location", "country", "city", "pays", "ville",
            "live", "lives", "based", "from", "stay", "residence"
        ],
        replies: [
            () => `Based in ${window.userData?.location || ""}`,
            () => `He lives in ${window.userData?.location || ""}`
        ]
    },

    {
        name: "birthday",
        keywords: [
            "birthday", "birth", "born", "age", "old",
            "anniversaire", "naissance", "date of birth", "dob",
            "how old"
        ],
        replies: [
            () => {
                if (!window.userData?.birthday) return "Birthday not loaded.";
                const date = new Date(window.userData.birthday);
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
        ]
    },

    {
        name: "yes",
        keywords: ["yes", "yeah", "yep", "ok", "okay", "sure", "alright"],
        replies: [
            () => "Great! What would you like to know?",
            () => "Perfect! Ask me anything.",
            () => "Cool! Go ahead, I'm listening."
        ]
    },

    {
        name: "no",
        keywords: ["no", "nope", "nah", "nothing"],
        replies: [
            () => "Alright! Come back if you need anything.",
            () => "No worries! I'm here if you change your mind.",
            () => "Okay! Feel free to ask later."
        ]
    }
];


// ========================================
// SCORE INTENT
// ========================================

function scoreIntent(question, intent) {
    const normalized = normalize(question);
    const words = normalized.split(" ").filter(w => w.length > 0);
    const meaningful = words.filter(w => !STOP_WORDS.has(w));
    const wordsToCheck = meaningful.length > 0 ? meaningful : words;

    let score = 0;

    intent.keywords.forEach(keyword => {
        const k = normalize(keyword);

        // Multi-word keyword
        if (k.includes(" ")) {
            if (normalized.includes(k)) {
                score += 3;
            }
            // Also: try matching all words present (any order)
            const kParts = k.split(" ");
            const allPresent = kParts.every(part =>
                wordsToCheck.some(w => w === part || fuzzyMatch(w, part))
            );
            if (allPresent && kParts.length > 1) {
                score += 2;
            }
            return;
        }

        // Single-word keyword
        wordsToCheck.forEach(word => {
            if (word === k) {
                score += 2;
                return;
            }

            // Check singular/plural variations
            if (word.replace(/s$/, "") === k.replace(/s$/, "")) {
                score += 2;
                return;
            }

            // Fuzzy match
            if (fuzzyMatch(word, k)) {
                score += 1;
            }
        });
    });

    return score;
}


// ========================================
// MAIN RESPONSE ENGINE
// ========================================

function getAIResponse(question, userData, lastReplies) {
    userData = userData || window.userData;
    lastReplies = lastReplies || window.lastReplies;

    if (!userData) {
        return "Still loading my data... try again in a second.";
    }

    // 0. FIX TYPOS
    const fixedQuestion = fixTypos(question);

    // 1. NUMBER SUPPORT (if last response was a list)
    const trimmed = fixedQuestion.trim();
    if (/^[1-9]$/.test(trimmed) && window.lastList) {
        const index = parseInt(trimmed, 10) - 1;
        if (window.lastList[index]) {
            return window.lastList[index];
        }
    }

    // 2. MATH
    const mathResult = tryMath(fixedQuestion);
    if (mathResult) {
        return `Result: **${mathResult.result}**`;
    }

    // 3. INTENT SCORING
    let bestIntent = null;
    let bestScore = 0;

    INTENTS.forEach(intent => {
        const score = scoreIntent(fixedQuestion, intent);
        if (score > bestScore) {
            bestScore = score;
            bestIntent = intent;
        }
    });

    if (bestIntent && bestScore >= 2) {
        const variants = bestIntent.replies || [bestIntent.reply];
        const chosen = pickRandom(bestIntent.name, variants, lastReplies);
        const replyText = typeof chosen === "function" ? chosen() : chosen;

        // Save last topic (context memory)
        window.lastTopic = bestIntent.name;

        // Save list for number support
        if (bestIntent.name === "companies" && userData.companies) {
            window.lastList = userData.companies.map(c =>
                `**${c.name}** — ${c.role}\n[${c.website}](https://${c.website})\nStatus: ${c.status}\nExpected launch: ${c.expected_launch}\nCategory: ${c.category}\n\n**${c.tagline}**\n\n${c.description}\n\n**All features:**\n- ${c.features.join("\n- ")}\n\n**Mission:**\n${c.mission}`
            );
        } else {
            window.lastList = null;
        }

        return replyText + renderSuggestions(bestIntent.name);
    }

    // 4. SMART FALLBACK
    window.lastTopic = "fallback";

    const fallbacks = [
        () => `I'm not sure what you mean. But I can tell you about:\n- Skills\n- Companies (Warstom, Weyra, 4-Event, Solarax)\n- Email & WhatsApp\n- Education & experience\n\nTry rephrasing your question.`,
        () => `Hmm, I didn't quite get that. Here's what I can do:\n- Answer about the owner\n- Give you contact info\n- Explain his companies\n- List his skills\n\nWhat do you want to know?`,
        () => `I'm still learning! I know a lot:\n- Skills, companies, projects\n- Contact (email, WhatsApp, social)\n- Education, experience\n\nAsk me anything.`,
        () => `That's outside my knowledge, but I'm great at answering questions about the person behind this page.\n\nTry:\n- "What are his skills?"\n- "Tell me about Warstom"\n- "Give me his email"`
    ];

    const fallbackText = pickRandom("fallback", fallbacks, lastReplies)();

    return fallbackText + renderSuggestions("default");
}
