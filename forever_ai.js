// =====================================================
// FOREVER AI — JAVASCRIPT
// =====================================================


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

    // Don't send empty messages
    if (!message) {
        return;
    }


    // Hide welcome screen
    welcomeScreen.style.display = "none";


    // Add user message
    addUserMessage(message);


    // Clear input
    messageInput.value = "";


    // Reset textarea height
    messageInput.style.height = "auto";


    // Scroll to bottom
    scrollToBottom();


    // Show AI thinking animation
    showThinking();


    // updated AI response api now available
    try {

    const response = await fetch("/.netlify/functions/gemini", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: message
        })
    });

    const data = await response.json();

    hideThinking();

    addAIMessage(data.reply);

    scrollToBottom();

} catch (error) {

    hideThinking();

    addAIMessage(
        "Sorry, I couldn't connect to Forever AI."
    );

    console.error(error);

}


// =====================================================
// USER MESSAGE
// =====================================================

function addUserMessage(text) {

    const article = document.createElement("article");

    article.className = "message user-message";


    article.innerHTML = `

        <div class="message-avatar user-avatar">
            F
        </div>


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
            F
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


    // Activate copy button
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

    if (
        event.key === "Enter" &&
        !event.shiftKey
    ) {

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

    // Remove all generated messages
    messages.innerHTML = "";


    // Show welcome screen
    welcomeScreen.style.display = "flex";


    // Make sure thinking animation is hidden
    hideThinking();


    // Clear input
    messageInput.value = "";

    messageInput.style.height = "auto";


    // Scroll to top
    chatContainer.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// Sidebar new chat
newChatBtn.addEventListener("click", () => {

    startNewChat();

});


// Top new chat
topNewChat.addEventListener("click", () => {

    startNewChat();

});


// =====================================================
// SUGGESTION CARDS
// =====================================================

const suggestionCards =
    document.querySelectorAll(".suggestion-card");


suggestionCards.forEach(card => {

    card.addEventListener("click", () => {

        const title =
            card.querySelector("strong").textContent;


        const descriptions = {

            "Help me code":
                "Help me build a coding project.",

            "Give me an idea":
                "Give me a creative idea for a new project.",

            "Help me learn":
                "Help me understand something I'm learning.",

            "Create something":
                "Help me create something amazing."

        };


        const prompt =
            descriptions[title] || title;


        messageInput.value = prompt;


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


sidebarOverlay.addEventListener("click", () => {

    closeSidebar();

});


function closeSidebar() {

    sidebar.classList.remove("open");

    sidebarOverlay.classList.remove("active");

}


// =====================================================
// CLOSE SIDEBAR AFTER SELECTING AN ITEM
// =====================================================

const sidebarItems =
    document.querySelectorAll(
        ".nav-item, .history-item"
    );


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