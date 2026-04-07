import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

/* ================================
   🤖 CHAT (SMART)
================================ */
app.post("/chat", async (req, res) => {
  const { messages } = req.body;

  try {
    const prompt = `
You are a highly accurate Indian legal assistant.

STRICT RULES:
- Only mention real Indian laws (IPC, CrPC, IT Act)
- If unsure, say "I am not certain"
- Do NOT guess law sections

Conversation:
${messages.map(m => `${m.role}: ${m.content}`).join("\n")}

Respond in this format:

⚖️ Legal Guidance:

Relevant Law:
...

Explanation:
...

Next Steps:
1. ...
2. ...

⚠️ Not a substitute for a lawyer.
`;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        model: "phi",
        prompt,
        stream: false
      })
    });

    const data = await response.json();

    const reply = data.response?.trim();

    res.json({
      reply: reply || "⚠️ AI did not respond. Check Ollama."
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================================
   🧾 FIR GENERATOR (SMART)
================================ */
app.post("/fir", async (req, res) => {
  const { text } = req.body;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        model: "phi",
        prompt: `
Generate a formal FIR in India based on:

${text}

Format properly:

Police Station:
Date:
Complainant Details:
Incident Description:
Accused (if known):
Signature:
        `,
        stream: false
      })
    });

    const data = await response.json();

    res.json({
      fir: data.response || "Could not generate FIR"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});