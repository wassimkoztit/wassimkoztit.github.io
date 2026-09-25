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

    // Typing indicator
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
// NORMALIZE — clean user input
// ========================================

function normalize(str) {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")   // remove accents
        .replace(/[^\w\s]/g, " ")          // remove punctuation
        .replace(/\s+/g, " ")
        .trim();
}


// ========================================
// LEVENSHTEIN DISTANCE — typo tolerance
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


// Check if a word is close to a keyword (typo tolerant)
function fuzzyMatch(word, keyword) {
    if (word === keyword) return true;
    if (word.length < 3 || keyword.length < 3) return false;

    const distance = levenshtein(word, keyword);
    const maxLen = Math.max(word.length, keyword.length);

    // 30% error tolerance
    return distance / maxLen <= 0.3;
}


// Check if question contains any keyword (exact or typo)
function matches(question, keywords) {
    const words = normalize(question).split(" ");

    return keywords.some(keyword => {
        const k = normalize(keyword);

        // Direct substring match
        if (question.includes(k)) return true;

        // Word-level fuzzy match
        return words.some(word => fuzzyMatch(word, k));
    });
}


// ========================================
// RESPONSE ENGINE
// ========================================

function getAIResponse(question) {
    if (!userData) {
        return "Still loading my data... try again in a second.";
    }

    const q = normalize(question);

    // ==================
    // GREETINGS
    // ==================
    if (matches(q, [
        "hi", "hello", "hey", "yo", "sup", "hola",
        "salam", "salamo", "salut", "bonjour", "bonsoir",
        "good morning", "good evening", "good afternoon",
        "labas", "comment ca va", "how are you"
    ])) {
        return `Hello! I'm ${userData.name}'s AI assistant.\n\nI can tell you about:\n- His birthday\n- His skills\n- His education\n- His experience\n- His projects\n- His languages\n- How to contact him\n\nWhat would you like to know?`;
    }

    // ==================
    // THANKS
    // ==================
    if (matches(q, [
        "thanks", "thank", "thank you", "thx", "ty",
        "merci", "chokran", "choukran", "shukran",
        "barak allah", "appreciate", "grazie", "gracias"
    ])) {
        return "You're welcome! Happy to help. Anything else you'd like to know?";
    }

    // ==================
    // GOODBYE
    // ==================
    if (matches(q, [
        "bye", "goodbye", "see you", "cya", "later",
        "au revoir", "a plus", "a bientot", "bslama",
        "b slama", "adios", "ciao", "good night", "gn"
    ])) {
        return "Goodbye! Feel free to come back anytime. Take care!";
    }

    // ==================
    // HOW ARE YOU
    // ==================
    if (matches(q, [
        "how are you", "how r u", "hru", "ca va",
        "comment vas tu", "kidayr", "labas"
    ])) {
        return "I'm just code, but I'm running great! Thanks for asking. How can I help you?";
    }

    // ==================
    // WHO / NAME
    // ==================
    if (matches(q, [
        "name", "who", "whois", "who is", "nom",
        "identity", "yourself", "about him", "about wassim",
        "chkoun", "presentation", "intro", "introduce"
    ])) {
        return `${userData.name}\n${userData.title}\nLocation: ${userData.location}\n\n${userData.about}`;
    }

    // ==================
    // BIRTHDAY / AGE
    // ==================
    if (matches(q, [
        "birthday", "birth", "born", "age", "old",
        "anniversaire", "naissance", "date of birth", "dob"
    ])) {
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

    // ==================
    // SKILLS
    // ==================
    if (matches(q, [
        "skill", "skills", "competence", "competences",
        "know", "technical", "abilities", "expertise"
    ])) {
        const tech = userData.skills.technical.slice(0, 6).map(s => `- ${s}`).join("\n");
        return `Main technical skills:\n${tech}\n\n...and more! Ask "programming" for languages.`;
    }

    // ==================
    // PROGRAMMING
    // ==================
    if (matches(q, [
        "programming", "code", "coding", "dev", "developer",
        "language", "tech stack", "framework",
        "html", "css", "javascript", "php"
    ])) {
        return `Programming languages & tools:\n- ${userData.skills.programming.join("\n- ")}`;
    }

    // ==================
    // OTHER SKILLS
    // ==================
    if (matches(q, [
        "other", "soft", "design", "teamwork", "team work"
    ])) {
        return `Other skills:\n- ${userData.skills.other.join("\n- ")}`;
    }

    // ==================
    // FIELDS
    // ==================
    if (matches(q, [
        "field", "domain", "work", "job", "profession",
        "career", "specialty", "metier"
    ])) {
        return `Fields: ${userData.fields.join(" | ")}`;
    }

    // ==================
    // EDUCATION
    // ==================
    if (matches(q, [
        "education", "study", "studies", "diploma", "degree",
        "formation", "school", "bac", "baccalaureate",
        "university", "college", "cfmmer"
    ])) {
        const edu = userData.education.map(e =>
            `- ${e.diploma}${e.option ? " (" + e.option + ")" : ""}${e.school ? " - " + e.school : ""} - ${e.year}`
        ).join("\n");
        return `Education:\n${edu}`;
    }

    // ==================
    // EXPERIENCE
    // ==================
    if (matches(q, [
        "experience", "stage", "internship", "career",
        "sgtm", "worked", "job history", "professional"
    ])) {
        const exp = userData.experience.map(e =>
            `- ${e.role} - ${e.field}${e.note ? " (" + e.note + ")" : ""}`
        ).join("\n");
        return `Experience:\n${exp}`;
    }

    // ==================
    // CERTIFICATIONS
    // ==================
    if (matches(q, [
        "certification", "certificate", "certifications",
        "certif", "award", "achievement", "diplome"
    ])) {
        return `Certifications:\n- ${userData.certifications.join("\n- ")}`;
    }

    // ==================
    // LANGUAGES
    // ==================
    if (matches(q, [
        "language", "langue", "speak", "languages",
        "spoken", "arabic", "french", "english", "spanish"
    ])) {
        const langs = userData.languages.map(l => `- ${l.language}: ${l.level}`).join("\n");
        return `Languages:\n${langs}`;
    }

    // ==================
    // PROJECTS
    // ==================
    if (matches(q, [
        "project", "projects", "portfolio", "projet",
        "built", "created", "made"
    ])) {
        return `Projects:\n- ${userData.projects.join("\n- ")}`;
    }

    // ==================
    // INTERESTS
    // ==================
    if (matches(q, [
        "interest", "hobby", "hobbies", "passion",
        "likes", "enjoys", "free time", "loisir"
    ])) {
        return `Interests: ${userData.interests.join(", ")}`;
    }

    // ==================
    // EMAIL
    // ==================
    if (matches(q, [
        "email", "mail", "contact", "reach", "gmail",
        "e mail", "e-mail"
    ])) {
        return `Email: ${userData.email}`;
    }

    // ==================
    // WHATSAPP / PHONE
    // ==================
    if (matches(q, [
        "whatsapp", "phone", "number", "tel", "telephone",
        "call", "mobile", "gsm"
    ])) {
        return `WhatsApp Personal: ${userData.whatsapp_personal}\nWhatsApp Business: ${userData.whatsapp_business}`;
    }

    // ==================
    // LOCATION
    // ==================
    if (matches(q, [
        "location", "where", "country", "city",
        "pays", "ville", "live", "based", "from"
    ])) {
        return `Based in ${userData.location}`;
    }

    // ==================
    // SOCIAL MEDIA
    // ==================
    if (matches(q, [
        "social", "instagram", "facebook", "linkedin", "github",
        "insta", "fb", "links", "profiles", "accounts"
    ])) {
        const s = userData.social;
        return `Social media:\n- Instagram: ${s.instagram}\n- Facebook: ${s.facebook}\n- LinkedIn: ${s.linkedin}\n- GitHub: ${s.github}`;
    }

    // ==================
    // HELP
    // ==================
    if (matches(q, [
        "help", "what can you do", "options", "menu",
        "commands", "questions", "aide"
    ])) {
        return `I can answer questions about:\n- Birthday & age\n- Skills (technical & programming)\n- Education & diplomas\n- Experience & internships\n- Certifications\n- Languages\n- Projects\n- Interests\n- Contact info (email, WhatsApp)\n- Location\n- Social media`;
    }

    // ==================
    // YES / OK
    // ==================
    if (matches(q, ["yes", "yeah", "yep", "ok", "okay", "sure", "oui", "wakha"])) {
        return "Great! What would you like to know about Wassim?";
    }

    // ==================
    // NO
    // ==================
    if (matches(q, ["no", "nope", "nah", "non", "la"])) {
        return "Alright! Let me know if you change your mind.";
    }

    // ==================
    // DEFAULT
    // ==================
    return `I'm not sure about that. Try asking:\n- "What is his birthday?"\n- "What are his skills?"\n- "Where does he study?"\n- "What did he do at SGTM?"\n- "What languages does he speak?"\n- "How can I contact him?"\n- "Show me his social media"`;
}
