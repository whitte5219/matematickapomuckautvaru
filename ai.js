// === CONFIG ===
const COHERE_API_KEY = ""; // <-- paste your key here
const COHERE_MODEL = "command-a-reasoning-08-2025";

document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.getElementById("chatBox");
  const aiInput = document.getElementById("aiInput");
  const aiSend  = document.getElementById("aiSend");

  // If elements not found, file loaded on wrong page or cache issue
  if (!chatBox || !aiInput || !aiSend) {
    console.error("AI elements not found. Check index.html ids and that ai.js is loading.");
    return;
  }

  const history = []; // simple chat memory in this session

  function addMessage(text, cls) {
    const div = document.createElement("div");
    div.className = cls;
    div.textContent = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  async function sendMessage() {
    const userText = aiInput.value.trim();
    if (!userText) return;

    addMessage(userText, "chatUser");
    aiInput.value = "";

    if (!COHERE_API_KEY) {
      addMessage("Chybí API klíč. Vlož ho do ai.js do COHERE_API_KEY.", "chatAI");
      return;
    }

    addMessage("AI píše…", "chatAI");
    const loadingEl = chatBox.lastChild;

    history.push({ role: "user", content: userText });

    try {
      const res = await fetch("https://api.cohere.com/v2/chat", {
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
              content:
                "Jsi školní asistent pro matematiku (ZŠ). Vysvětluj česky, jednoduše, krok za krokem. " +
                "Zaměř se na rozdíl: obvod/obsah/povrch/objem a na tvary (čtverec, obdélník, kruh, krychle, kvádr, trojúhelník)."
            },
            ...history
          ]
        })
      });

      const data = await res.json();

      // remove "AI píše…"
      if (loadingEl && loadingEl.textContent === "AI píše…") chatBox.removeChild(loadingEl);

      // Show HTTP error clearly (401 etc.)
      if (!res.ok) {
        console.error("Cohere error:", res.status, data);
        addMessage(`Chyba API (${res.status}). Otevři Console (F12) pro detail.`, "chatAI");
        return;
      }

      let aiText = "Odpověď nepřišla.";
      if (data?.message?.content?.length) {
        aiText = data.message.content.map(x => x.text).join("\n").trim();
      }

      history.push({ role: "assistant", content: aiText });
      addMessage(aiText, "chatAI");

    } catch (err) {
      if (loadingEl && loadingEl.textContent === "AI píše…") chatBox.removeChild(loadingEl);
      console.error(err);
      addMessage("Chyba při komunikaci (možná CORS nebo síť). Otevři Console (F12).", "chatAI");
    }
  }

  aiSend.addEventListener("click", sendMessage);
  aiInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
});
