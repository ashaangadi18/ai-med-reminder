const express = require("express");
const axios = require("axios");
const { requireAuth } = require("../middleware/auth.middleware");
const { readTable } = require("../config/db");

const router = express.Router();
router.use(requireAuth);

const SYSTEM_PROMPT = `You are the in-app assistant for MediMind, a medicine reminder and prescription
reading app. You help users understand their medicine schedule, general facts about common
medicines (what a drug class is typically used for, general food/timing guidance), and how to use
the app.

Rules you must always follow:
- You are not a doctor. Never diagnose, never tell someone to start/stop/change a dose.
- For any question about a specific dosage change, drug interaction, or symptom that sounds
  urgent, clearly recommend they contact a licensed doctor or pharmacist, and for emergencies
  contact local emergency services immediately.
- Keep answers short, warm, and easy to read on a phone screen.
- You may reference the user's own medicine list if it is provided to you below, to answer
  questions like "when is my next dose" or "what have I added".`;

function fallbackReply(message) {
  const lower = message.toLowerCase();
  if (lower.includes("interact")) {
    return "I can't safely evaluate drug interactions without a configured AI key. Please check with your pharmacist or doctor, or ask them directly using the details on your prescription label.";
  }
  if (lower.includes("dose") || lower.includes("dosage")) {
    return "I can't give dosage guidance without a connected AI model right now. Please follow the dosage on your prescription, and check with your doctor or pharmacist for any changes.";
  }
  return "The AI assistant isn't connected yet — add an ANTHROPIC_API_KEY in backend/.env to enable smart answers. Meanwhile, you can still add medicines, scan prescriptions, and track reminders from the dashboard.";
}

// POST /api/chat - send a message to the assistant
router.post("/", async (req, res) => {
  const { message, history } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ message: "Please enter a message." });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.json({ reply: fallbackReply(message), source: "offline" });
  }

  try {
    const medicines = readTable("medicines").filter((m) => m.userId === req.user.id);
    const medsSummary = medicines
      .map((m) => `${m.name} ${m.dosage || ""} - ${m.frequency} at ${m.times.join(", ")}`)
      .join("\n");

    const contextBlock = medsSummary
      ? `Here is this user's current medicine list:\n${medsSummary}`
      : "This user has no medicines saved yet.";

    const messages = [
      ...(Array.isArray(history) ? history : []),
      { role: "user", content: `${contextBlock}\n\nUser question: ${message}` },
    ];

    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages,
      },
      {
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        timeout: 20000,
      }
    );

    const textBlock = response.data.content.find((c) => c.type === "text");
    res.json({ reply: textBlock ? textBlock.text : "I'm not sure how to answer that yet.", source: "ai" });
  } catch (err) {
    console.error("Chat API error:", err?.response?.data || err.message);
    res.json({
      reply: "I had trouble reaching the AI assistant just now. Please try again in a moment.",
      source: "error",
    });
  }
});

module.exports = router;
