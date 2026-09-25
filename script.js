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
// RESPONSE ENGINE
// ========================================

function getAIResponse(question) {
    if (!userData) {
        return "Still loading my data... try again in a second.";
    }

    const q = question.toLowerCase();

    // Greeting
    if (matches(q, ["hi", "hello", "hey", "salam", "salut", "bonjour"])) {
        return `Hi! I'm ${userData.name}'s AI assistant. Ask me about his skills, projects, experience, or how to contact him.`;
    }

    // Name / Who
    if (matches(q, ["name", "who", "whois", "nom"])) {
        return `${userData.name} - ${userData.title}\n${userData.location}\n\n${userData.about}`;
    }

    // Birthday / Age
    if (matches(q, ["birthday", "birth", "born", "age", "old", "anniversaire", "naissance"])) {
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

    // Skills - technical
    if (matches(q, ["skill", "skills", "competence", "competences", "know", "technical"])) {
        const tech = userData.skills.technical.slice(0, 6).map(s => `- ${s}`).join("\n");
        return `Main technical skills:\n${tech}\n\n...and more! Ask "programming" for languages.`;
    }

    // Programming
    if (matches(q, ["programming", "code", "coding", "dev", "developer", "language"])) {
        return `Programming languages & tools:\n- ${userData.skills.programming.join("\n- ")}`;
    }

    // Other skills
    if (matches(q, ["other", "soft", "design", "teamwork"])) {
        return `Other skills:\n- ${userData.skills.other.join("\n- ")}`;
    }

    // Fields
    if (matches(q, ["field", "domain", "work", "job", "profession"])) {
        return `Fields: ${userData.fields.join(" | ")}`;
    }

    // Education
    if (matches(q, ["education", "study", "studies", "diploma", "formation", "school", "bac"])) {
        const edu = userData.education.map(e =>
            `- ${e.diploma}${e.option ? " (" + e.option + ")" : ""}${e.school ? " - " + e.school : ""} - ${e.year}`
        ).join("\n");
        return `Education:\n${edu}`;
    }

    // Experience
    if (matches(q, ["experience", "stage", "internship", "career", "sgtm"])) {
        const exp = userData.experience.map(e =>
            `- ${e.role} - ${e.field}${e.note ? " (" + e.note + ")" : ""}`
        ).join("\n");
        return `Experience:\n${exp}`;
    }

    // Certifications
    if (matches(q, ["certification", "certificate", "certifications", "certif"])) {
        return `Certifications:\n- ${userData.certifications.join("\n- ")}`;
    }

    // Languages
    if (matches(q, ["language", "langue", "speak", "languages"])) {
        const langs = userData.languages.map(l => `- ${l.language}: ${l.level}`).join("\n");
        return `Languages:\n${langs}`;
    }

    // Projects
    if (matches(q, ["project", "projects", "portfolio", "projet"])) {
        return `Projects:\n- ${userData.projects.join("\n- ")}`;
    }

    // Interests
    if (matches(q, ["interest", "hobby", "hobbies", "passion"])) {
        return `Interests: ${userData.interests.join(", ")}`;
    }

    // Email
    if (matches(q, ["email", "mail", "contact", "reach"])) {
        return `Email: ${userData.email}`;
    }

    // WhatsApp
    if (matches(q, ["whatsapp", "phone", "number", "tel", "telephone"])) {
        return `WhatsApp Personal: ${userData.whatsapp_personal}\nWhatsApp Business: ${userData.whatsapp_business}`;
    }

    // Location
    if (matches(q, ["location", "where", "country", "city", "pays", "ville"])) {
        return `Based in ${userData.location}`;
    }

    // Social media
    if (matches(q, ["social", "instagram", "facebook", "linkedin", "github"])) {
        const s = userData.social;
        return `Social media:\n- Instagram: ${s.instagram}\n- Facebook: ${s.facebook}\n- LinkedIn: ${s.linkedin}\n- GitHub: ${s.github}`;
    }

    // Default
    return `I'm not sure about that. Try asking about:\n- His birthday\n- His skills\n- His education\n- His experience\n- His projects\n- His languages\n- How to contact him\n- His social media`;
}


function matches(question, keywords) {
    return keywords.some(k => question.includes(k));
}
