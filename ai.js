// ================= CONFIG =================
// ⬇️ PASTE YOUR COHERE API KEY HERE
const COHERE_API_KEY = "PK6ZC8iaxpBoEYu2FMXoymt9LmgQuNPcyZt7pZ6U";
const COHERE_MODEL = "command-a-reasoning-08-2025";

// ================= ELEMENTS =================
const chatBox = document.getElementById("chatBox");
const aiInput = document.getElementById("aiInput");
const aiSend  = document.getElementById("aiSend");

// ================= HELPERS =================
function addMessage(text, className){
  const div = document.createElement("div");
  div.className = className;
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ================= SEND MESSAGE =================
async function sendMessage(){
  const userText = aiInput.value.trim();
  if(!userText) return;

  // show user message
  addMessage(userText, "chatUser");
  aiInput.value = "";

  // loading indicator
  const loading = document.createElement("div");
  loading.className = "chatAI";
  loading.textContent = "AI píše…";
  chatBox.appendChild(loading);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const response = await fetch("https://api.cohere.com/v2/chat", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + COHERE_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: COHERE_MODEL,
        messages: [
          {
            role: "system",
            content: "Jsi školní asistent. Vysvětluj matematiku jednoduše, krok za krokem, česky."
          },
          {
            role: "user",
            content: userText
          }
        ]
      })
    });

    const data = await response.json();

    chatBox.removeChild(loading);

    // Cohere response text (safe fallback)
    let aiText = "Omlouvám se, odpověď se nepodařilo získat.";

    if (data.message && data.message.content && data.message.content.length > 0) {
      aiText = data.message.content[0].text;
    }

    addMessage(aiText, "chatAI");

  } catch (error) {
    chatBox.removeChild(loading);
    addMessage("Chyba při komunikaci s AI.", "chatAI");
    console.error(error);
  }
}

// ================= EVENTS =================
aiSend.onclick = sendMessage;

aiInput.addEventListener("keydown", e => {
  if(e.key === "Enter"){
    sendMessage();
  }
});

