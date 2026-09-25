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
let lastReplies = {};

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
// RENDER MESSAGE
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


function renderWithLinks(text) {
    let safe = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    safe = safe.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    safe = safe.replace(/\n/g, "<br>");

    safe = safe.replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g,
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
    "want", "wanna", "need", "like", "would",
    "tell", "show", "give", "know", "get", "find",
    "see", "look", "let", "make", "made"
]);


// ========================================
// RANDOM PICK
// ========================================

function pickRandom(intentName, options) {
    if (options.length === 1) return options[0];

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
// MATH EVALUATOR (safe)
// ========================================

function tryMath(question) {
    const cleaned = question.replace(/[^0-9+\-*/().\s]/g, "").trim();

    // Must contain at least one operator and one number
    if (!/[+\-*/]/.test(cleaned)) return null;
    if (!/\d/.test(cleaned)) return null;

    // Avoid huge or dangerous input
    if (cleaned.length > 30) return null;

    try {
        // Only allow numbers and operators
        const result = Function(`"use strict"; return (${cleaned})`)();

        if (typeof result !== "number" || !isFinite(result)) return null;

        return { expression: cleaned, result };
    } catch {
        return null;
    }
}


// ========================================
// INTENTS
// ========================================

const INTENTS = [

    // ==========================================
    // HOW ARE YOU / FEELINGS
    // ==========================================
    {
        name: "howareyou",
        keywords: [
            "how are you", "how r u", "how r you", "hru",
            "how you doing", "how are u", "how is it going",
            "how is it", "ca va", "comment ca va", "kidayr",
            "kidayra", "labas", "labas 3lik", "whats up",
            "wassup", "sup", "how do you feel", "how you feel"
        ],
        replies: [
            () => `I'm just code, but running great — thanks for asking!\n\nHow can I help you today?`,
            () => `Doing well on my side! Ready to answer anything about ${userData.name}.`,
            () => `All good here! ⚡ What would you like to know?`,
            () => `I'm fine, thanks! Ask me anything about Wassim — skills, companies, contact...`
        ]
    },

    // ==========================================
    // GREETING
    // ==========================================
    {
        name: "greeting",
        keywords: [
            "hi", "hello", "hey", "yo", "hola",
            "salam", "salamo", "salut", "bonjour", "bonsoir",
            "good morning", "good evening", "good afternoon"
        ],
        replies: [
            () => `Hello! I'm ${userData.name}'s AI assistant. Ask me about:\n- His birthday\n- His skills\n- His companies\n- His projects\n- How to contact him`,
            () => `Hi there! Ready to answer anything about Wassim. What would you like to know?`,
            () => `Hey! I know everything about ${userData.name}. Skills, companies, projects, contact... just ask!`,
            () => `Salam! I'm here to help. Try asking "what are his skills?" or "tell me about his companies"`
        ]
    },

    // ==========================================
    // THANKS
    // ==========================================
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

    // ==========================================
    // GOODBYE
    // ==========================================
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

    // ==========================================
    // ABOUT THE BOT ITSELF
    // ==========================================
    {
        name: "bot_identity",
        keywords: [
            "your name", "who are you", "what are you",
            "are you human", "are you a bot", "are you real",
            "are you ai", "are you a robot", "your identity",
            "what is your name", "who made you", "who created you",
            "who built you", "who developed you"
        ],
        replies: [
            () => `I'm an AI assistant built to tell you about ${userData.name}.\n\nI'm not human — just code that knows his info!`,
            () => `I'm the AI assistant of ${userData.name}.\n\nI'm not a real person, just a smart bot with his data.`,
            () => `I'm a virtual assistant created for ${userData.name}'s links page.\n\nI know his skills, companies, projects, contact info and more.`
        ]
    },

    // ==========================================
    // COMPLIMENTS
    // ==========================================
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
            () => `Thank you! That's very kind. 😊`,
            () => `Thanks! I appreciate it. Anything else I can help with?`,
            () => `Aw, thanks! I'll do my best to keep helping you.`,
            () => `Appreciate it! Let me know if you need anything else.`
        ]
    },

    // ==========================================
    // INSULTS / NEGATIVE
    // ==========================================
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
            () => `My apologies. Let me try again — what exactly do you want to know?`
        ]
    },

    // ==========================================
    // JOKES / FUN
    // ==========================================
    {
        name: "joke",
        keywords: ["tell me a joke", "make me laugh", "say something funny", "joke"],
        replies: [
            () => `Why did the electrician go to therapy?\nBecause he had too many live wires! ⚡`,
            () => `Why do solar panels make great comedians?\nBecause they always shine bright! ☀️`,
            () => `I would tell you a joke about AI, but I'm still processing it. 🤖`
        ]
    },

    // ==========================================
    // TIME / DATE
    // ==========================================
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

    // ==========================================
    // CAPABILITIES
    // ==========================================
    {
        name: "help",
        keywords: [
            "help", "what can you do", "options", "menu",
            "commands", "questions", "aide", "what do you know",
            "what can i ask", "what can i ask you", "show me options"
        ],
        replies: [
            () => `I can answer:\n- Birthday & age\n- Email, WhatsApp, phone\n- Instagram, Facebook, LinkedIn, GitHub\n- Skills (technical & programming)\n- Education\n- Experience\n- Companies (Warstom, Weyra, 4-Event, Solarax)\n- Languages\n- Projects\n- Location`,
            () => `Ask me about ${userData.name}:\n- His skills & expertise\n- His companies\n- His projects\n- His contact info\n- His education & experience\n- His social media\n\nOr just say "hi"!`,
            () => `You can ask things like:\n- "What is his email?"\n- "Tell me about Warstom"\n- "What are his skills?"\n- "Who is Wassim?"\n- "Show his Instagram"`
        ]
    },

    // ==========================================
    // SEPARATE CONTACT CHANNELS
    // ==========================================
    {
        name: "email",
        keywords: [
            "email", "mail", "gmail", "e mail", "e-mail",
            "send email", "his email", "email address"
        ],
        replies: [
            () => `${userData.email}`,
            () => `His email: ${userData.email}`,
            () => `[Send him an email](mailto:${userData.email})`
        ]
    },
    {
        name: "whatsapp",
        keywords: [
            "whatsapp", "wa", "whats app", "what's app",
            "whatsapp number", "whatsapp business"
        ],
        replies: [
            () => `Personal: ${userData.whatsapp_personal}\nBusiness: ${userData.whatsapp_business}`,
            () => `WhatsApp Personal: ${userData.whatsapp_personal}\nWhatsApp Business: ${userData.whatsapp_business}`,
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
            () => `Personal: ${userData.whatsapp_personal}\nBusiness: ${userData.whatsapp_business}`,
            () => `His phone numbers:\n- Personal: ${userData.whatsapp_personal}\n- Business: ${userData.whatsapp_business}`
        ]
    },
    {
        name: "instagram",
        keywords: ["instagram", "insta", "ig"],
        replies: [
            () => `[Instagram](${userData.social.instagram})`,
            () => `His Instagram: ${userData.social.instagram}`,
            () => `[Follow him on Instagram](${userData.social.instagram})`
        ]
    },
    {
        name: "facebook",
        keywords: ["facebook", "fb"],
        replies: [
            () => `[Facebook](${userData.social.facebook})`,
            () => `His Facebook: ${userData.social.facebook}`,
            () => `[Visit his Facebook](${userData.social.facebook})`
        ]
    },
    {
        name: "linkedin",
        keywords: ["linkedin", "linked in", "ln"],
        replies: [
            () => `[LinkedIn](${userData.social.linkedin})`,
            () => `His LinkedIn: ${userData.social.linkedin}`,
            () => `[Connect with him on LinkedIn](${userData.social.linkedin})`
        ]
    },
    {
        name: "github",
        keywords: ["github", "git hub", "git"],
        replies: [
            () => `[GitHub](${userData.social.github})`,
            () => `His GitHub: ${userData.social.github}`,
            () => `[Check his GitHub](${userData.social.github})`
        ]
    },

    // ==========================================
    // GENERAL CONTACT
    // ==========================================
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
            () => `You can reach Wassim here:\n\n[Email](mailto:${userData.email})\n[WhatsApp Personal](https://wa.me/212679484103)\n[WhatsApp Business](https://wa.me/212664158149)`,
            () => `Contact options:\n\nEmail: ${userData.email}\n[Personal WhatsApp](https://wa.me/212679484103)\n[Business WhatsApp](https://wa.me/212664158149)`,
            () => `Ways to contact him:\n\n[Send Email](mailto:${userData.email})\n[WhatsApp](https://wa.me/212664158149)`
        ]
    },

    // ==========================================
    // PROFILE
    // ==========================================
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
            () => `He has ${userData.skills.technical.length} technical skills total:\n- ${userData.skills.technical.slice(0, 5).join("\n- ")}`
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
            "field", "domain", "profession",
            "specialty", "metier", "industry"
        ],
        replies: [
            () => `Fields: ${userData.fields.join(" | ")}`,
            () => `He works in:\n- ${userData.fields.join("\n- ")}`
        ]
    },
    {
        name: "job",
        keywords: ["job", "work", "career", "what does he do"],
        replies: [
            () => `He's a ${userData.title}.\n\nFields: ${userData.fields.join(" | ")}`
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
            "experience", "stage", "internship",
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

    // ==========================================
    // COMPANIES
    // ==========================================
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
                const list = userData.companies.map(c => {
                    return `**${c.name}** — ${c.role}\n[${c.website}](https://${c.website})\nStatus: ${c.status} (${c.expected_launch})`;
                }).join("\n\n");
                return `Wassim's companies & ventures:\n\n${list}`;
            },
            () => `He founded/co-founded:\n\n${userData.companies.map(c => `• **${c.name}** — ${c.role} [Visit](https://${c.website})`).join("\n")}`
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

    // ==========================================
    // MISC
    // ==========================================
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

    const normalized = normalize(question);

    // ---------- 1. MATH ----------
    const mathResult = tryMath(question);
    if (mathResult) {
        return `Result: **${mathResult.result}**`;
    }

    // ---------- 2. INTENT SCORING ----------
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

    // ---------- 3. SMART FALLBACK ----------
    const fallbacks = [
        () => `I'm not sure what you mean. But I can tell you about:\n- His skills\n- His companies (Warstom, Weyra, 4-Event, Solarax)\n- His email & WhatsApp\n- His education & experience\n\nTry rephrasing your question.`,
        () => `Hmm, I didn't quite get that. Here's what I can do:\n- Answer about ${userData.name}\n- Give you his contact info\n- Explain his companies\n- List his skills\n\nWhat do you want to know?`,
        () => `I'm still learning! I know a lot about ${userData.name}:\n- Skills, companies, projects\n- Contact (email, WhatsApp, social)\n- Education, experience\n\nAsk me anything about him.`,
        () => `That's outside my knowledge, but I'm great at answering questions about ${userData.name}.\n\nTry:\n- "What are his skills?"\n- "Tell me about Warstom"\n- "Give me his email"`
    ];
    return pickRandom("fallback", fallbacks)();
}




// ========================================
// LOADER
// ========================================

window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if (!loader) return;

    // Minimum display time for the loader (in ms)
    // Slower = higher value, Faster = lower value
    const MIN_LOADER_TIME = 2200;

    setTimeout(() => {
        loader.classList.add("hidden");
    }, MIN_LOADER_TIME);
});



    // ==========================================
    // ABOUT THE BOT ITSELF — Weyra AI v3.03.01
    // ==========================================
    {
        name: "bot_identity",
        keywords: [
            "your name", "who are you", "what are you",
            "are you human", "are you a bot", "are you real",
            "are you ai", "are you a robot", "your identity",
            "what is your name", "who made you", "who created you",
            "who built you", "who developed you",
            "weyra", "what is weyra", "tell me about weyra",
            "tell me about yourself", "introduce yourself",
            "which version", "your version", "what version"
        ],
        replies: [
            () => `I'm **Weyra AI v3.03.01** — a mini version generated by **Wassim El Koztit**.\n\nI know everything about him: skills, companies, projects, contact info.`,
            () => `I'm the mini version of **Weyra AI**, version **v3.03.01**.\n\nI was generated by ${userData.name} to help you learn about him.`,
            () => `**Weyra AI v3.03.01** here — a lightweight assistant created by ${userData.name}.\n\nAsk me anything about him!`,
            () => `I'm a mini Weyra AI (v3.03.01), generated by ${userData.name}.\n\nPart of his upcoming Weyra project at [weyra.ai](https://weyra.ai) (launching 03-2027).`
        ]
    },



    // ========================================
// MULTI-LANGUAGE WELCOME MESSAGE
// ========================================

function getWelcomeMessage() {
    const lang = (navigator.language || "en").toLowerCase().slice(0, 2);

    const messages = {
        en: `Hi! I'm <strong>Weyra AI v3.03.01</strong> — a mini version generated by Wassim.<br>Ask me anything about him!`,
        fr: `Salut ! Je suis <strong>Weyra AI v3.03.01</strong> — une mini version générée par Wassim.<br>Posez-moi une question sur lui !`,
        ar: `مرحبا! أنا <strong>Weyra AI v3.03.01</strong> — نسخة مصغرة أنشأها وسيم.<br>اسألني أي شيء عنه!`,
        es: `¡Hola! Soy <strong>Weyra AI v3.03.01</strong> — una mini versión generada por Wassim.<br>¡Pregúntame lo que quieras sobre él!`
    };

    return messages[lang] || messages.en;
}

window.addEventListener("load", () => {
    const welcome = document.getElementById("aiWelcomeMessage");
    if (welcome) welcome.innerHTML = getWelcomeMessage();
});
