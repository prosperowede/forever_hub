// =====================================================
// FOREVER AI — JAVASCRIPT
// ======================================

// =====================================================
// FOREVER AI — API CONFIG
// =====================================================

const API_KEY = "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";

const API_URL =
"https://api.groq.com/openai/v1/chat/completions";

const MODEL = "llama-3.3-70b-versatile";

// =====================================================
// ELEMENTS
// =====================================================

const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const messages = document.getElementById("messages");
const chatContainer = document.getElementById("chatContainer");

const welcomeScreen = document.getElementById("welcomeScreen");
const aiThinking = document.getElementById("aiThinking");

const newChatBtn = document.getElementById("newChatBtn");
const topNewChat = document.getElementById("topNewChat");

const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");


// =====================================================
// STARTUP
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    hideThinking();

    autoResizeTextarea();

});


// =====================================================
// SEND MESSAGE
// =====================================================

async function sendMessage() {

    const message = messageInput.value.trim();

    if (!message) return;

    welcomeScreen.style.display = "none";

    addUserMessage(message);

    messageInput.value = "";

    messageInput.style.height = "auto";

    scrollToBottom();

    showThinking();

    let aiMessageEl = null;

    let buffer = "";

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {

                "Content-Type": "application/json",

                "Authorization": `Bearer ${API_KEY}`

            },

            body: JSON.stringify({

                model: MODEL,

                stream: true,

                messages: [

                    {

                        role: "user",

                        content: message

                    }

                ]

            })

        });

        if (!response.ok) {

            const data = await response.json().catch(() => ({}));

            hideThinking();

            // Log the real error for debugging, but never show
            // Groq's raw error payload as if it were a chat reply.
            console.error("Groq API error:", data);

            if (response.status === 429) {

                throw new Error(
                    "RATE_LIMIT"
                );

            }

            if (response.status === 401 || response.status === 403) {

                throw new Error(
                    "AUTH"
                );
            }

            throw new Error(
                "GENERIC"
            );

        }

        // ---------------------------------------------------
        // Read the SSE stream and reveal text as it arrives,
        // the way a real AI chat app does.
        // ---------------------------------------------------

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let sseBuffer = "";

        while (true) {

            const { value, done } = await reader.read();

            if (done) break;

            sseBuffer += decoder.decode(value, { stream: true });

            const lines = sseBuffer.split("\n");

            // Keep the last (possibly incomplete) line for the next chunk.
            sseBuffer = lines.pop();

            for (const line of lines) {

                const trimmed = line.trim();

                if (!trimmed.startsWith("data:")) continue;

                const payload = trimmed.slice(5).trim();

                if (payload === "[DONE]") continue;

                let json;

                try {
                    json = JSON.parse(payload);
                } catch {
                    continue;
                }

                const delta = json.choices?.[0]?.delta?.content;

                if (!delta) continue;

                if (!aiMessageEl) {
                    hideThinking();
                    aiMessageEl = createAIMessageShell();
                }

                buffer += delta;

                updateAIMessageContent(aiMessageEl, buffer, true);

                scrollToBottom();

            }

        }

        hideThinking();

        if (!aiMessageEl) {

            addAIMessage(
                "I couldn't generate a response to that. Try rephrasing your message."
            );

            scrollToBottom();

            return;

        }

        finalizeAIMessage(aiMessageEl, buffer);

        scrollToBottom();

    } catch (error) {

        hideThinking();

        console.error(error);

        addAIMessage(getFriendlyErrorMessage(error.message));

    }

}


// =====================================================
// FRIENDLY ERROR MESSAGES
// =====================================================

function getFriendlyErrorMessage(code) {

    switch (code) {

        case "RATE_LIMIT":
            return "I'm getting too many requests right now (API rate limit reached). Please wait a moment and try again.";

        case "AUTH":
            return "There's a problem with the API key for Forever AI — it may be invalid or expired. Please check the key.";

        case "GENERIC":
            return "Something went wrong reaching Forever AI's servers. Please try again in a moment.";

        default:
            // Network failure (fetch itself threw, e.g. offline).
            return "I couldn't connect right now. Please check your connection and try again.";

    }

}


function addUserMessage(text) {

    const article = document.createElement("article");

    article.className = "message user-message";

    article.innerHTML = `

        <div class="message-body">

            <div class="message-header">

                <strong>You</strong>

            </div>

            <div class="message-text">

                <p>${escapeHTML(text)}</p>

            </div>

        </div>

    `;

    messages.appendChild(article);

}


// =====================================================
// AI MESSAGE
// =====================================================

function createAIMessageShell() {

    const article = document.createElement("article");

    article.className = "message ai-message";

    article.innerHTML = `

        <div class="message-avatar ai-avatar">
            <img src="forever_ai_icon.png" alt="Forever AI">
        </div>

        <div class="message-body">

            <div class="message-header">

                <strong>Forever AI</strong>

                <span>AI</span>

            </div>

            <div class="message-text"></div>

        </div>

    `;

    messages.appendChild(article);

    return article;

}


function updateAIMessageContent(article, text, streaming) {

    const textEl = article.querySelector(".message-text");

    let html = renderMarkdown(text);

    if (streaming) {
        html += '<span class="cursor-blink"></span>';
    }

    textEl.innerHTML = html;

}


function finalizeAIMessage(article, text) {

    updateAIMessageContent(article, text, false);

    const body = article.querySelector(".message-body");

    const actions = document.createElement("div");

    actions.className = "message-actions";

    actions.innerHTML = `

        <button
            title="Copy"
            class="copy-btn"
        >
            <i class="fa-regular fa-copy"></i>
        </button>

        <button title="Good response">
            <i class="fa-regular fa-thumbs-up"></i>
        </button>

        <button title="Bad response">
            <i class="fa-regular fa-thumbs-down"></i>
        </button>

    `;

    body.appendChild(actions);

    const copyButton = actions.querySelector(".copy-btn");

    copyButton.addEventListener("click", () => {

        navigator.clipboard.writeText(text);

        copyButton.innerHTML =
            '<i class="fa-solid fa-check"></i>';

        setTimeout(() => {

            copyButton.innerHTML =
                '<i class="fa-regular fa-copy"></i>';

        }, 1500);

    });

}


function addAIMessage(text) {

    const article = createAIMessageShell();

    finalizeAIMessage(article, text);

}


// =====================================================
// MARKDOWN RENDERING (safe)
// =====================================================

function renderMarkdown(text) {

    if (typeof marked === "undefined" || typeof DOMPurify === "undefined") {
        // Fallback if the CDN scripts failed to load — never show
        // raw, unescaped text.
        return `<p>${escapeHTML(text)}</p>`;
    }

    const rawHTML = marked.parse(text, {
        breaks: true
    });

    const clean = DOMPurify.sanitize(rawHTML, {
        ADD_ATTR: ["target", "rel"]
    });

    // Force all links to open safely in a new tab.
    const container = document.createElement("div");
    container.innerHTML = clean;

    container.querySelectorAll("a").forEach(link => {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
    });

    return container.innerHTML;

}


// =====================================================
// THINKING ANIMATION
// =====================================================

function showThinking() {

    aiThinking.style.display = "flex";

    scrollToBottom();

}

function hideThinking() {

    aiThinking.style.display = "none";

}


// =====================================================
// AUTO SCROLL
// =====================================================

function scrollToBottom() {

    setTimeout(() => {

        chatContainer.scrollTo({

            top: chatContainer.scrollHeight,

            behavior: "smooth"

        });

    }, 50);

}

// =====================================================
// SEND BUTTON
// =====================================================

sendButton.addEventListener("click", () => {

    sendMessage();

});


// =====================================================
// ENTER TO SEND
// =====================================================

messageInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter" && !event.shiftKey) {

        event.preventDefault();

        sendMessage();

    }

});


// =====================================================
// AUTO RESIZE TEXTAREA
// =====================================================

messageInput.addEventListener("input", () => {

    autoResizeTextarea();

});

function autoResizeTextarea() {

    messageInput.style.height = "auto";

    messageInput.style.height =
        Math.min(messageInput.scrollHeight, 160) + "px";

}


// =====================================================
// NEW CHAT
// =====================================================

function startNewChat() {

    messages.innerHTML = "";

    welcomeScreen.style.display = "flex";

    hideThinking();

    messageInput.value = "";

    messageInput.style.height = "auto";

    chatContainer.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

newChatBtn.addEventListener("click", startNewChat);

topNewChat.addEventListener("click", startNewChat);


// =====================================================
// SUGGESTION CARDS
// =====================================================

const suggestionCards =
    document.querySelectorAll(".suggestion-card");

suggestionCards.forEach(card => {

    card.addEventListener("click", () => {

        const title =
            card.querySelector("strong").textContent;

        const prompts = {

            "Help me code":
                "Help me build a coding project.",

            "Give me an idea":
                "Give me a creative project idea.",

            "Help me learn":
                "Teach me something new.",

            "Create something":
                "Create something amazing."

        };

        messageInput.value =
            prompts[title] || title;

        autoResizeTextarea();

        messageInput.focus();

    });

});


// =====================================================
// MOBILE SIDEBAR
// =====================================================

mobileMenuBtn.addEventListener("click", () => {

    sidebar.classList.add("open");

    sidebarOverlay.classList.add("active");

});

sidebarOverlay.addEventListener("click", closeSidebar);

function closeSidebar() {

    sidebar.classList.remove("open");

    sidebarOverlay.classList.remove("active");

}


// =====================================================
// CLOSE SIDEBAR ON MOBILE
// =====================================================

const sidebarItems =
    document.querySelectorAll(".nav-item, .history-item");

sidebarItems.forEach(item => {

    item.addEventListener("click", () => {

        if (window.innerWidth <= 700) {

            closeSidebar();

        }

    });

});


// =====================================================
// SECURITY HELPER
// =====================================================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}
