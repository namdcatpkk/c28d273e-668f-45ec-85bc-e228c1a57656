

// Values to be replaced
const chatbotName = "GreenBuds support";
const chatbotAvatarURL = "https://firebasestorage.googleapis.com/v0/b/hey-addy-chatgpt.appspot.com/o/userData%2Fu0EqlErXiedmgZbNrybl6I56ust1%2Fgreenbuds-suppo-51a2bed8-a304-4%2Fapp_image.png?alt=media&token=6c5d46b3-d803-4358-bdba-2dd10805a2ee";
const customerAvatarURL = "https://i.imgur.com/vphoLPW.png";
const customerName = "You";
const chatbotAPI = "https://us-central1-hey-addy-chatgpt.cloudfunctions.net/businessInference/infer";
const publicId = "c28d273e-668f-45ec-85bc-e228c1a57656";

const chatHistory = document.getElementById("chat-history");
const sendBtn = document.getElementById("send-btn");
const messageInput = document.getElementById("message-input");
const container = document.querySelector(".chat-container");

// Send button is disabled by default until input len > 1
sendBtn.disabled = true;

window.onload = async function() {
    initializeBotMessage(); // Show initial message
}

function addMessageToChat(message, type) {
    const messageElem = document.createElement("div");
    if (type == "customer") {
        messageElem.setAttribute("class", "message-customer-parent");
        messageElem.innerHTML = customerMessageHTML.replace("{{message}}", message);
    }
    chatHistory.append(messageElem);
}

function createBotMessageElement(message) {
    const messageId = `bot-message-${Date.now()}`;
    const messageElem = document.createElement("div");

    messageElem.setAttribute("class", "message-chatbot-parent");
    let innerHTML = chatbotMessageHTML.replace("{{messageId}}", messageId);
    innerHTML = innerHTML.replace("{{message}}", message);
    messageElem.innerHTML = innerHTML;

    chatHistory.append(messageElem);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    return messageId;
}

function initializeBotMessage() {
    fetch(`${chatbotAPI}/bot-init?publicId=${publicId}`)
    .then(response => response.json())
    .then(data => {
        if (data.text) {
            createBotMessageElement(data.text);
        }
        chatHistory.scrollTop = chatHistory.scrollHeight;
    });
}

sendBtn.addEventListener("click", () => {
    const message = messageInput.value;
    if (message) {
        addMessageToChat(message, "customer");
        messageInput.value = "";


        // show thinking element
        const thinkingElem = document.createElement("div");
        thinkingElem.setAttribute("class", "message-chatbot-parent");

        setTimeout(() => {
            thinkingElem.innerHTML = chatbotThinking;
            chatHistory.append(thinkingElem);
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }, 400);
        
        // There's an element to fetch message in
        fetch(`${chatbotAPI}/qa?user_query=${message}&publicId=${publicId}`)
            .then(response => response.json())
            .then(data => {
                // remove thinking
                thinkingElem.style.display = "none";
                if (data.response) {
                    createBotMessageElement(data.response);
                } else {
                    createBotMessageElement("Sorry I could not understand your question");
                }
                chatHistory.scrollTop = chatHistory.scrollHeight;
                
            }).catch((error) => {
                thinkingElem.style.display = "none";
                createBotMessageElement("Oops... I had a glitch :( My engineers are working on it");
                
            })
    }
});

// Send button only visible when input text value > 1 character
messageInput.addEventListener('input', () => {
    // Get trimmed value of input
    const trimmedValue = messageInput.value.trim();

    // Enable/disable send button based on input value
    if (trimmedValue.length > 1) {
      sendBtn.disabled = false;
    } else {
      sendBtn.disabled = true;
    }
  });


const customerMessageHTML = `
    <div class="message customer">
        <div class="horizontal-flex flex-end">
            <img class="avatar" src="${customerAvatarURL}">
            <div class="text">
                <span class="name">${customerName}</span>
                <p>{{message}}</p>
            </div>
        </div>
        
    </div>

`;

const chatbotMessageHTML = `
    <div class="message chatbot">
        <img class="avatar" src="${chatbotAvatarURL}">
        <div class="text">
            <span class="name" id="chatbot-name">${chatbotName}</span>
            <p id="{{messageId}}">{{message}}</p>
        </div>
    </div>
`;

const chatbotThinking = `
    <div class="message chatbot">
        <img class="avatar" src="${chatbotAvatarURL}">
        <div class="text">
            <span class="name" id="chatbot-name">${chatbotName}</span>
            <p id="{{messageId}}">thinking...</p>
        </div>
    </div>
`;



