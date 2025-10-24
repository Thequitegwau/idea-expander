import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/generate", async (req, res) => {
  const { topic, count, tone } = req.body;

  const prompt = `
You are a creative academic brainstorming assistant.
Generate ${count} ideas related to "${topic}" in a ${tone} tone.
Each idea should be a concise, professional project or research concept, suitable for students.
Return the ideas as a plain numbered list.
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You generate structured academic and creative ideas." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "No ideas generated.";
    res.json({ ideas: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error generating ideas" });
  }
});

app.listen(3000, () => console.log("✅ AI backend running on http://localhost:3000"));
