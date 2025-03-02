const chatArea = document.getElementById("chat-area");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const voiceBtn = document.getElementById("voice-btn");
const languageSelect = document.getElementById("language");
const keyboardContainer = document.getElementById("keyboard");

let recognition;
let isRecognizing = false;

// Define keymaps for different languages
const keymaps = {
    "en-US": ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", " "],
    "hi-IN": ["अ", "आ", "इ", "ई", "उ", "ऊ", "क", "ख", "ग", "घ", "च", " ", ".", ",", "?", "!"],
    // Add other language keymaps here
};

// Create keyboard
function createKeyboard(language) {
    const keys = keymaps[language];
    keyboardContainer.innerHTML = '';
    keys.forEach(key => {
        const button = document.createElement("button");
        button.classList.add("key");
        button.textContent = key;
        button.addEventListener("click", () => {
            userInput.value += key;
        });
        keyboardContainer.appendChild(button);
    });
}

// Append messages to the chat
function appendMessage(role, text) {
    const message = document.createElement("div");
    message.classList.add("chat-message", role);
    message.innerHTML = `<p>${text}</p>`;
    chatArea.appendChild(message);
    chatArea.scrollTop = chatArea.scrollHeight;
}

// Start new chat
document.getElementById("new-chat").addEventListener("click", () => {
    chatArea.innerHTML = '';
    userInput.value = '';
});

// Handle speech recognition
try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        throw new Error("Speech Recognition API is not supported in this browser.");
    }
    recognition = new SpeechRecognition();
    recognition.lang = languageSelect.value;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
        console.log("Speech recognition started");
        voiceBtn.textContent = "🛑 Stop";
        isRecognizing = true;
    };

    recognition.onend = () => {
        console.log("Speech recognition ended");
        voiceBtn.textContent = "🎙 Speak";
        isRecognizing = false;
    };

    recognition.onresult = (event) => {
        let speechToText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
            speechToText += event.results[i][0].transcript;
        }
        userInput.value = speechToText;
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        alert("Error with speech recognition. Please try again.");
    };

} catch (error) {
    voiceBtn.disabled = true;
    console.error("Speech recognition is not supported:", error);
    alert("Speech recognition is not supported in your browser.");
}

// Change recognition language
languageSelect.addEventListener("change", () => {
    if (recognition) recognition.lang = languageSelect.value;
});

// Start or stop speech recognition on button click
voiceBtn.addEventListener("click", () => {
    if (isRecognizing) {
        recognition.stop();  // Stop recognition if it's already active
    } else {
        recognition.start();  // Start recognition if it's not active
    }
});

// Send message
// sendBtn.addEventListener("click", () => {
//     const message = userInput.value.trim();
//     if (!message) return;

//     appendMessage("user", message);
//     userInput.value = "";

//     fetch("/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ message })
//     })
//         .then(response => response.json())
//         .then(data => {
//             appendMessage("bot", data.response || "I couldn't understand that.");
//         })
//         .catch(() => {
//             appendMessage("bot", "Error communicating with the server.");
//         });
// });

sendBtn.addEventListener("click", () => {
    const message = userInput.value.trim();
    if (!message) return;

    appendMessage("user", message);
    userInput.value = "";

    fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
    })
        .then(response => {
            // Check the status of the response
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            // Check if response contains error
            if (data.error) {
                throw new Error(data.error);
            }
            appendMessage("bot", data.response || "I couldn't understand that.");
        })
        .catch(error => {
            console.error("Error:", error);  // Log the error for debugging
            appendMessage("bot", "Error communicating with the server.");
        });
});
