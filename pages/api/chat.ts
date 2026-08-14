// pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { personaPrompts, defaultPersona } from "../../lib/personaPrompts";

// Groq is OpenAI-compatible, so we reuse the same "openai" package —
// we just point it at Groq's servers and use a Groq API key instead.
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, personality } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Get system prompt for chosen personality
    const persona = personality || defaultPersona;
    const systemPrompt = personaPrompts[persona] || personaPrompts[defaultPersona];

    // Call Groq (free tier)
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // free, fast, good quality
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.9, // more variety in replies
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ||
      "I'm here, but I don't know what to say 😅";

    res.status(200).json({ reply });
  } catch (err: any) {
    console.error("Chat API error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
}