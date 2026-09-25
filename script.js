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
        addMessage(reply, "bot");
    }, 700);
}


function addMessage(text, type) {
    const el = document.createElement("div");
    el.className = `ai-message ai-message-${type}`;
    el.textContent = text;
    aiMessages.appendChild(el);
    aiMessages.scrollTop = aiMessages.scrollHeight;
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
// STOP WORDS - ignored when matching
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
// SMART MATCH — sentence-aware
// ========================================

function matches(question, keywords) {
    const normalized = normalize(question);
    const words = normalized.split(" ").filter(w => w.length > 0);

    // Filter out stop words for the meaningful word list
    const meaningful = words.filter(w => !STOP_WORDS.has(w));

    // If nothing left after stop words, fall back to raw words
    const wordsToCheck = meaningful.length > 0 ? meaningful : words;

    return keywords.some(keyword => {
        const k = normalize(keyword);

        // 1. Multi-word keyword - direct substring match
        if (k.includes(" ")) {
            if (normalized.includes(k)) return true;
            // Also check all meaningful words present
            const kParts = k.split(" ");
            const allPresent = kParts.every(part =>
                wordsToCheck.some(w => w === part || fuzzyMatch(w, part))
            );
            if (allPresent) return true;
            return false;
        }

        // 2. Single-word keyword - check against meaningful words
        return wordsToCheck.some(word => word === k || fuzzyMatch(word, k));
    });
}


// ========================================
// INTENT SCORING — best match wins
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
        reply: () => `Hello! I'm ${userData.name}'s AI assistant.\n\nI can tell you about:\n- His birthday\n- His skills\n- His education\n- His experience\n- His projects\n- His languages\n- How to contact him\n\nWhat would you like to know?`
    },
    {
        name: "thanks",
        keywords: [
            "thanks", "thank", "thank you", "thx", "ty",
            "merci", "chokran", "choukran", "shukran",
            "barak allah", "appreciate", "grazie", "gracias"
        ],
        reply: () => "You're welcome! Happy to help. Anything else you'd like to know?"
    },
    {
        name: "goodbye",
        keywords: [
            "bye", "goodbye", "see you", "cya", "later",
            "au revoir", "a plus", "a bientot", "bslama",
            "adios", "ciao", "good night", "gn", "farewell"
        ],
        reply: () => "Goodbye! Feel free to come back anytime. Take care!"
    },
    {
        name: "birthday",
        keywords: [
            "birthday", "birth", "born", "age", "old",
            "anniversaire", "naissance", "date of birth", "dob",
            "how old"
        ],
        reply: () => {
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
        reply: () => `You can contact Wassim here:\n\nEmail: ${userData.email}\nWhatsApp Personal: ${userData.whatsapp_personal}\nWhatsApp Business: ${userData.whatsapp_business}`
    },
    {
        name: "who",
        keywords: [
            "name", "who", "whois", "who is", "nom",
            "identity", "yourself", "about him", "about wassim",
            "chkoun", "presentation", "intro", "introduce",
            "tell me about", "info", "information"
        ],
        reply: () => `${userData.name}\n${userData.title}\nLocation: ${userData.location}\n\n${userData.about}`
    },
    {
        name: "skills",
        keywords: [
            "skill", "skills", "competence", "competences",
            "technical", "abilities", "expertise", "good at",
            "capable", "talents", "strengths"
        ],
        reply: () => {
            const tech = userData.skills.technical.slice(0, 6).map(s => `- ${s}`).join("\n");
            return `Main technical skills:\n${tech}\n\n...and more! Ask "programming" for languages.`;
        }
    },
    {
        name: "programming",
        keywords: [
            "programming", "code", "coding", "dev", "developer",
            "tech stack", "framework", "html", "css",
            "javascript", "php", "software", "web dev"
        ],
        reply: () => `Programming languages & tools:\n- ${userData.skills.programming.join("\n- ")}`
    },
    {
        name: "other_skills",
        keywords: [
            "other", "soft skill", "soft skills", "design",
            "teamwork", "team work", "graphic", "svg"
        ],
        reply: () => `Other skills:\n- ${userData.skills.other.join("\n- ")}`
    },
    {
        name: "fields",
        keywords: [
            "field", "domain", "work", "job", "profession",
            "career", "specialty", "metier", "industry"
        ],
        reply: () => `Fields: ${userData.fields.join(" | ")}`
    },
    {
        name: "education",
        keywords: [
            "education", "study", "studies", "diploma", "degree",
            "formation", "school", "bac", "baccalaureate",
            "university", "college", "cfmmer", "student", "graduate"
        ],
        reply: () => {
            const edu = userData.education.map(e =>
                `- ${e.diploma}${e.option ? " (" + e.option + ")" : ""}${e.school ? " - " + e.school : ""} - ${e.year}`
            ).join("\n");
            return `Education:\n${edu}`;
        }
    },
    {
        name: "experience",
        keywords: [
            "experience", "stage", "internship", "career",
            "sgtm", "worked", "job history", "professional",
            "worked at", "worked for"
        ],
        reply: () => {
            const exp = userData.experience.map(e =>
                `- ${e.role} - ${e.field}${e.note ? " (" + e.note + ")" : ""}`
            ).join("\n");
            return `Experience:\n${exp}`;
        }
    },
    {
        name: "certifications",
        keywords: [
            "certification", "certificate", "certifications",
            "certif", "award", "achievement", "diplome", "certified"
        ],
        reply: () => `Certifications:\n- ${userData.certifications.join("\n- ")}`
    },
    {
        name: "languages",
        keywords: [
            "language", "langue", "speak", "languages",
            "spoken", "arabic", "french", "english", "spanish",
            "talks", "fluent"
        ],
        reply: () => {
            const langs = userData.languages.map(l => `- ${l.language}: ${l.level}`).join("\n");
            return `Languages:\n${langs}`;
        }
    },
    {
        name: "projects",
        keywords: [
            "project", "projects", "portfolio", "projet",
            "built", "created", "made", "work sample"
        ],
        reply: () => `Projects:\n- ${userData.projects.join("\n- ")}`
    },
    {
        name: "interests",
        keywords: [
            "interest", "hobby", "hobbies", "passion",
            "likes", "enjoys", "free time", "loisir", "loves"
        ],
        reply: () => `Interests: ${userData.interests.join(", ")}`
    },
    {
        name: "location",
        keywords: [
            "location", "country", "city", "pays", "ville",
            "live", "lives", "based", "from", "stay", "residence"
        ],
        reply: () => `Based in ${userData.location}`
    },
    {
        name: "social",
        keywords: [
            "social", "instagram", "facebook", "linkedin", "github",
            "insta", "fb", "links", "profiles", "accounts"
        ],
        reply: () => {
            const s = userData.social;
            return `Social media:\n- Instagram: ${s.instagram}\n- Facebook: ${s.facebook}\n- LinkedIn: ${s.linkedin}\n- GitHub: ${s.github}`;
        }
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
        reply: () => {
            const list = userData.companies.map(c => {
                return `- ${c.name} (${c.website})\n  Role: ${c.role}\n  Status: ${c.status}\n  Expected launch: ${c.expected_launch}`;
            }).join("\n\n");

            return `Wassim's companies & ventures:\n\n${list}`;
        }
    },
    {
        name: "help",
        keywords: [
            "help", "what can you do", "options", "menu",
            "commands", "questions", "aide", "what do you know"
        ],
        reply: () => `I can answer questions about:\n- Birthday & age\n- Skills (technical & programming)\n- Education & diplomas\n- Experience & internships\n- Certifications\n- Languages\n- Projects\n- Interests\n- Contact info (email, WhatsApp)\n- Location\n- Social media`
    },
    {
        name: "yes",
        keywords: ["yes", "yeah", "yep", "ok", "okay", "sure", "oui", "wakha", "alright"],
        reply: () => "Great! What would you like to know about Wassim?"
    },
    {
        name: "no",
        keywords: ["no", "nope", "nah", "non", "la", "nothing"],
        reply: () => "Alright! Let me know if you change your mind."
    }
];


// Score how well a question matches an intent
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
                score += 3; // strong match
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

    // Require a minimum score to avoid false positives
    if (bestIntent && bestScore >= 2) {
        return bestIntent.reply();
    }

    // Default fallback
    return `I'm not sure about that. Try asking:\n- "What is his birthday?"\n- "What are his skills?"\n- "Where does he study?"\n- "What did he do at SGTM?"\n- "What languages does he speak?"\n- "I want to contact him"\n- "Show me his social media"`;
}
