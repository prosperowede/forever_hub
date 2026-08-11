// =====================================================
// FOREVER AI — JAVASCRIPT
// ======================================

// =====================================================
// FOREVER AI — API CONFIG
// =====================================================

const API_KEY = "AQ.Ab8RN6KrPTqGkM9RgXeikZ1PRPp8SNJH1oHPvZbmhLf2IDqjvQ";

const API_URL =
"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

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

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {

                "Content-Type": "application/json",

                "X-goog-api-key": API_KEY

            },

            body: JSON.stringify({

                contents: [

                    {

                        parts: [

                            {

                                text: message

                            }

                        ]

                    }

                ]

            })

        });

        const data = await response.json();

        hideThinking();

        if (!response.ok) {

            // Log the real error for debugging, but never show
            // Google's raw error payload as if it were a chat reply.
            console.error("Gemini API error:", data);

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

        // Check for a safety block or empty candidate list, which
        // also isn't a normal error status but still isn't a real reply.
        const candidate = data.candidates?.[0];

        if (!candidate || candidate.finishReason === "SAFETY") {

            console.error("Gemini API returned no usable candidate:", data);

            addAIMessage(
                "I couldn't generate a response to that. Try rephrasing your message."
            );

            scrollToBottom();

            return;

        }

        const reply =

            candidate.content?.parts?.[0]?.text ||

            "Sorry, I couldn't generate a response.";

        addAIMessage(reply);

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

function addAIMessage(text) {

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

            <div class="message-text">

                <p>${escapeHTML(text)}</p>

            </div>

            <div class="message-actions">

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

            </div>

        </div>

    `;

    messages.appendChild(article);

    const copyButton = article.querySelector(".copy-btn");

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
