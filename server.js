import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ API route
app.post("/api/generate", async (req, res) => {
  try {
    const { topic, count, tone } = req.body;

    // Basic validation
    if (!topic || !count || !tone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const prompt = `Generate ${count} creative ideas about "${topic}" in a ${tone} tone. List them clearly.`;

    // 🔑 Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // you can change to "gpt-4-turbo" if needed
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();

    // Log any OpenAI error for debugging
    if (data.error) {
      console.error("OpenAI Error:", data.error);
      return res
        .status(500)
        .json({ error: "OpenAI API error", details: data.error });
    }

    // ✅ Extract ideas safely
    const ideas = data.choices?.[0]?.message?.content?.trim() || "No ideas generated.";
    res.json({ ideas });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Failed to generate ideas" });
  }
});

// ✅ Vercel-compatible export
export default app;

// ✅ Local dev server (only runs locally)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`✅ Backend running at http://localhost:${PORT}`));
}
