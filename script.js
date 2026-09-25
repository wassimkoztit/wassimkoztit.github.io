// ========================================
// PAGE LOAD ANIMATION
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    const profile = document.querySelector(".profile");
    const links = document.querySelectorAll(".link-card");
    const footer = document.querySelector(".footer");

    profile.style.opacity = "0";
    profile.style.transform = "translateY(15px)";

    links.forEach(link => {
        link.style.opacity = "0";
        link.style.transform = "translateY(15px)";
    });

    footer.style.opacity = "0";

    setTimeout(() => {
        profile.style.transition = "all 0.6s ease";
        profile.style.opacity = "1";
        profile.style.transform = "translateY(0)";
    }, 100);

    links.forEach((link, index) => {
        setTimeout(() => {
            link.style.transition = "opacity 0.5s ease, transform 0.5s ease";
            link.style.opacity = "1";
            link.style.transform = "translateY(0)";
        }, 180 + (index * 90));
    });

    setTimeout(() => {
        footer.style.transition = "opacity 0.5s ease";
        footer.style.opacity = "1";
    }, 700);

});


// ========================================
// AI CHAT ASSISTANT
// ========================================

let userData = null;
let lastReplies = {}; // لتتبع آخر رد لكل intent (منع التكرار)

// Load me.json
fetch("me.json")
    .then(res => res.json())
    .then(data => {
        userData = data;
        console.log("AI data loaded:", data.name);
    })
    .catch(err => console.error("Failed to load me.json:", err));


// DOM elements
const aiModal    = document.getElementById("aiChatModal");
const aiClose    = document.getElementById("aiChatClose");
const aiInput    = document.getElementById("aiChatInput");
const aiSend     = document.getElementById("aiChatSend");
const aiMessages = document.getElementById("aiChatMessages");
const aiTrigger  = document.querySelector(".ai-chat-trigger");


// Open modal
aiTrigger?.addEventListener("click", (e) => {
    e.preventDefault();
    aiModal.classList.add("active");
    setTimeout(() => aiInput.focus(), 300);
});


// Close modal
aiClose?.addEventListener("click", () => aiModal.classList.remove("active"));

aiModal?.addEventListener("click", (e) => {
    if (e.target === aiModal) aiModal.classList.remove("active");
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") aiModal.classList.remove("active");
});


// Send message
aiSend?.addEventListener("click", sendMessage);
aiInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
});


function sendMessage() {
    const text = aiInput.value.trim();
    if (!text) return;

    addMessage(text, "user");
    aiInput.value = "";

    const typingEl = document.createElement("div");
    typingEl.className = "ai-message ai-message-bot ai-message-typing";
    typingEl.innerHTML = "<span></span><span></span><span></span>";
    aiMessages.appendChild(typingEl);
    aiMessages.scrollTop = aiMessages.scrollHeight;

    setTimeout(() => {
        typingEl.remove();
        const reply = getAIResponse(text);
        addMessage(reply, "bot", true);
    }, 700);
}


// ========================================
// RENDER MESSAGE — supports markdown links
// ========================================

function addMessage(text, type, allowLinks = false) {
    const el = document.createElement("div");
    el.className = `ai-message ai-message-${type}`;

    if (allowLinks && type === "bot") {
        el.innerHTML = renderWithLinks(text);
    } else {
        el.textContent = text;
    }

    aiMessages.appendChild(el);
    aiMessages.scrollTop = aiMessages.scrollHeight;
}


// Convert [label](url) to <a> buttons
function renderWithLinks(text) {
    // Escape HTML first
    let safe = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Convert newlines to <br>
    safe = safe.replace(/\n/g, "<br>");

    // Convert [label](url) to button-style links
    safe = safe.replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="ai-link-btn">$1 <i class="fa-solid fa-arrow-up-right-from-square"></i></a>'
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
// LEVENSHTEIN DISTANCE
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


function fuzzyMatch(word, keyword) {
    if (word === keyword) return true;
    if (word.length < 3 || keyword.length < 3) return false;

    const distance = levenshtein(word, keyword);
    const maxLen = Math.max(word.length, keyword.length);

    return distance / maxLen <= 0.3;
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
    "want", "wanna", "need", "like", "would like",
    "tell", "show", "give", "know", "get", "find",
    "see", "look", "help", "let", "make", "made"
]);


// ========================================
// RANDOM PICK (avoid repeats)
// ========================================

function pickRandom(intentName, options) {
    if (options.length === 1) return options[0];

    let last = lastReplies[intentName];
    let choice;

    // Try up to 5 times to pick a different reply
    for (let i = 0; i < 5; i++) {
        choice = options[Math.floor(Math.random() * options.length)];
        if (choice !== last) break;
    }

    lastReplies[intentName] = choice;
    return choice;
}


// ========================================
// INTENTS — multiple reply variants
// ========================================

const INTENTS = [
    {
        name: "greeting",
        keywords: [
            "hi", "hello", "hey", "yo", "sup", "hola",
            "salam", "salamo", "salut", "bonjour", "bonsoir",
            "good morning", "good evening", "good afternoon",
            "labas", "how are you", "how r u", "hru", "ca va",
            "kidayr", "whats up", "wassup"
        ],
        replies: [
            () => `Hello! I'm ${userData.name}'s AI assistant. Ask me about:\n- His birthday\n- His skills\n- His companies\n- His projects\n- How to contact him`,
            () => `Hi there! Ready to answer anything about Wassim. What would you like to know?`,
            () => `Hey! I know everything about ${userData.name}. Skills, companies, projects, contact... just ask!`,
            () => `Salam! I'm here to help. Try asking "what are his skills?" or "tell me about his companies"`
        ]
    },
    {
        name: "thanks",
        keywords: [
            "thanks", "thank", "thank you", "thx", "ty",
            "merci", "chokran", "choukran", "shukran",
            "barak allah", "appreciate", "grazie", "gracias"
        ],
        replies: [
            () => "You're welcome! Happy to help. Anything else?",
            () => "Glad I could help! Ask me anything else.",
            () => "No problem at all! Anything else you want to know?",
            () => "My pleasure! Feel free to ask more questions."
        ]
    },
    {
        name: "goodbye",
        keywords: [
            "bye", "goodbye", "see you", "cya", "later",
            "au revoir", "a plus", "a bientot", "bslama",
            "adios", "ciao", "good night", "gn", "farewell"
        ],
        replies: [
            () => "Goodbye! Come back anytime.",
            () => "See you later! Take care.",
            () => "Bye! Feel free to return whenever you need.",
            () => "Take care! Have a great day."
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
                const date = new Date(userData.birthday);
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
        name: "contact",
        keywords: [
            "contact", "email", "mail", "reach", "gmail",
            "e mail", "e-mail", "whatsapp", "phone", "number",
            "tel", "telephone", "call", "mobile", "gsm",
            "get in touch", "talk to him", "speak to him",
            "message him", "hire him", "work with him"
        ],
        replies: [
            () => `Here's how to reach Wassim:\n\n[Email](mailto:${userData.email})\n[WhatsApp Personal](https://wa.me/212679484103)\n[WhatsApp Business](https://wa.me/212664158149)`,
            () => `You can contact him here:\n\n[Send Email](mailto:${userData.email})\n[WhatsApp](https://wa.me/212664158149)`,
            () => `Contact info:\n\nEmail: ${userData.email}\n\n[Personal WhatsApp](https://wa.me/212679484103) · [Business WhatsApp](https://wa.me/212664158149)`
        ]
    },
    {
        name: "who",
        keywords: [
            "name", "who", "whois", "who is", "nom",
            "identity", "yourself", "about him", "about wassim",
            "chkoun", "presentation", "intro", "introduce",
            "tell me about", "info", "information"
        ],
        replies: [
            () => `${userData.name}\n${userData.title}\nLocation: ${userData.location}\n\n${userData.about}`,
            () => `${userData.name} is a ${userData.title} from ${userData.location}.\n\n${userData.about}`,
            () => `Let me introduce him:\n\nName: ${userData.name}\nTitle: ${userData.title}\nLocation: ${userData.location}\n\n${userData.about}`
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
                const tech = userData.skills.technical.slice(0, 6).map(s => `- ${s}`).join("\n");
                return `Top technical skills:\n${tech}\n\nAsk "programming" for languages.`;
            },
            () => {
                const tech = userData.skills.technical.slice(6, 12).map(s => `- ${s}`).join("\n");
                return `More technical skills:\n${tech}`;
            },
            () => `He has ${userData.skills.technical.length} technical skills total. Here's a preview:\n- ${userData.skills.technical.slice(0, 5).join("\n- ")}`
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
            () => `Programming languages & tools:\n- ${userData.skills.programming.join("\n- ")}`,
            () => `Tech stack:\n${userData.skills.programming.map(s => `• ${s}`).join("\n")}`
        ]
    },
    {
        name: "other_skills",
        keywords: [
            "other", "soft skill", "soft skills", "design",
            "teamwork", "team work", "graphic", "svg"
        ],
        replies: [
            () => `Other skills:\n- ${userData.skills.other.join("\n- ")}`
        ]
    },
    {
        name: "fields",
        keywords: [
            "field", "domain", "work", "job", "profession",
            "career", "specialty", "metier", "industry"
        ],
        replies: [
            () => `Fields: ${userData.fields.join(" | ")}`,
            () => `He works in:\n- ${userData.fields.join("\n- ")}`
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
                const edu = userData.education.map(e =>
                    `- ${e.diploma}${e.option ? " (" + e.option + ")" : ""}${e.school ? " - " + e.school : ""} - ${e.year}`
                ).join("\n");
                return `Education:\n${edu}`;
            }
        ]
    },
    {
        name: "experience",
        keywords: [
            "experience", "stage", "internship", "career",
            "sgtm", "worked", "job history", "professional",
            "worked at", "worked for"
        ],
        replies: [
            () => {
                const exp = userData.experience.map(e =>
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
            () => `Certifications:\n- ${userData.certifications.join("\n- ")}`
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
                const langs = userData.languages.map(l => `- ${l.language}: ${l.level}`).join("\n");
                return `Languages:\n${langs}`;
            }
        ]
    },
    {
        name: "projects",
        keywords: [
            "project", "projects", "portfolio", "projet",
            "built", "created", "made", "work sample"
        ],
        replies: [
            () => `Projects:\n- ${userData.projects.join("\n- ")}`,
            () => `Some of his projects:\n${userData.projects.map(p => `• ${p}`).join("\n")}`
        ]
    },
    {
        name: "companies",
        keywords: [
            "company", "companies", "business", "startup",
            "founder", "co-founder", "cofounder", "ceo",
            "owner", "entrepreneur", "venture",
            "warstom", "weyra", "4-event", "4event", "solarax",
            "solarax.ma", "warstom.com", "weyra.ai", "4-event.fun",
            "his company", "his companies", "his startups",
            "what does he own", "what does he run"
        ],
        replies: [
            () => {
                const list = userData.companies.map(c => {
                    return `**${c.name}** — ${c.role}\n[${c.website}](https://${c.website})\nStatus: ${c.status} (${c.expected_launch})`;
                }).join("\n\n");
                return `Wassim's companies & ventures:\n\n${list}`;
            },
            () => {
                return `He founded/co-founded:\n\n${userData.companies.map(c => `• ${c.name} — ${c.role} [Visit](https://${c.website})`).join("\n")}`;
            }
        ]
    },
    {
        name: "warstom",
        keywords: ["warstom", "warstom.com"],
        replies: [
            () => `**Warstom** — Founder & CEO\n[warstom.com](https://warstom.com)\nStatus: Under Development — Coming Soon\nExpected launch: 03-2027\n\nA tech company focused on innovative digital platforms and AI solutions.`
        ]
    },
    {
        name: "weyra",
        keywords: ["weyra", "weyra.ai"],
        replies: [
            () => `**Weyra AI** — Founder\n[weyra.ai](https://weyra.ai)\nStatus: Under Development — Coming Soon\nExpected launch: 03-2027\n\nAn AI assistant platform, built in partnership with Warstom.`
        ]
    },
    {
        name: "4event",
        keywords: ["4-event", "4event", "4 event", "4-event.fun"],
        replies: [
            () => `**4-Event** — Co-Founder\n[4-event.fun](https://4-event.fun)\nStatus: Coming Soon\nExpected launch: 11-2026\n\nAn event platform for discovering, creating and sharing events.`
        ]
    },
    {
        name: "solarax",
        keywords: ["solarax", "solarax.ma"],
        replies: [
            () => `**Solarax** — Founder\n[solarax.ma](https://solarax.ma)\nStatus: Planned\nExpected launch: 2028\n\nA renewable energy company focused on solar solutions in Morocco.`
        ]
    },
    {
        name: "interests",
        keywords: [
            "interest", "hobby", "hobbies", "passion",
            "likes", "enjoys", "free time", "loisir", "loves"
        ],
        replies: [
            () => `Interests: ${userData.interests.join(", ")}`,
            () => `He's passionate about:\n- ${userData.interests.join("\n- ")}`
        ]
    },
    {
        name: "location",
        keywords: [
            "location", "country", "city", "pays", "ville",
            "live", "lives", "based", "from", "stay", "residence"
        ],
        replies: [
            () => `Based in ${userData.location}`,
            () => `He lives in ${userData.location}`
        ]
    },
    {
        name: "social",
        keywords: [
            "social", "instagram", "facebook", "linkedin", "github",
            "insta", "fb", "links", "profiles", "accounts"
        ],
        replies: [
            () => {
                const s = userData.social;
                return `Social media:\n\n[Instagram](${s.instagram})\n[Facebook](${s.facebook})\n[LinkedIn](${s.linkedin})\n[GitHub](${s.github})`;
            },
            () => {
                const s = userData.social;
                return `Find him on:\n- Instagram: ${s.instagram}\n- GitHub: ${s.github}\n- LinkedIn: ${s.linkedin}`;
            }
        ]
    },
    {
        name: "help",
        keywords: [
            "help", "what can you do", "options", "menu",
            "commands", "questions", "aide", "what do you know"
        ],
        replies: [
            () => `I can answer:\n- Birthday & age\n- Skills (technical & programming)\n- Education\n- Experience\n- Companies (Warstom, Weyra, 4-Event, Solarax)\n- Languages\n- Projects\n- Contact info\n- Location\n- Social media`
        ]
    },
    {
        name: "yes",
        keywords: ["yes", "yeah", "yep", "ok", "okay", "sure", "oui", "wakha", "alright"],
        replies: [
            () => "Great! What would you like to know?",
            () => "Perfect! Ask me anything.",
            () => "Cool! Go ahead, I'm listening."
        ]
    },
    {
        name: "no",
        keywords: ["no", "nope", "nah", "non", "la", "nothing"],
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
            return;
        }

        // Single-word keyword
        wordsToCheck.forEach(word => {
            if (word === k) {
                score += 2;
            } else if (fuzzyMatch(word, k)) {
                score += 1;
            }
        });
    });

    return score;
}


// ========================================
// MAIN RESPONSE ENGINE
// ========================================

function getAIResponse(question) {
    if (!userData) {
        return "Still loading my data... try again in a second.";
    }

    let bestIntent = null;
    let bestScore = 0;

    INTENTS.forEach(intent => {
        const score = scoreIntent(question, intent);
        if (score > bestScore) {
            bestScore = score;
            bestIntent = intent;
        }
    });

    if (bestIntent && bestScore >= 2) {
        const variants = bestIntent.replies || [bestIntent.reply];
        const chosen = pickRandom(bestIntent.name, variants);
        return typeof chosen === "function" ? chosen() : chosen;
    }

    // Default fallback with variations
    const fallbacks = [
        `Hmm, I'm not sure about that. Try:\n- "What are his skills?"\n- "Tell me about Warstom"\n- "How can I contact him?"`,
        `I didn't quite catch that. You can ask about:\n- His companies\n- His projects\n- His skills`,
        `Not sure what you mean. Try asking "who is Wassim?" or "what companies does he own?"`
    ];
    return pickRandom("fallback", fallbacks);
}
