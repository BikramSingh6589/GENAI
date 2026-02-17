import express from "express";
import cors from "cors";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/* -------------------- DATABASE -------------------- */
const sql = neon(process.env.DATABASE_URL);

/* -------------------- GROQ -------------------- */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* -------------------- CHAT ROUTE -------------------- */
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // 1️⃣ Save user message
    await sql`
      INSERT INTO messages (role, content)
      VALUES (${ "user" }, ${ message })
    `;

    // 2️⃣ Start Groq streaming
    const stream = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: message }],
      stream: true,
    });

    // 3️⃣ Streaming headers
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullReply = "";

    // 4️⃣ Stream response to frontend
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";

      if (content) {
        fullReply += content;
        res.write(content);
      }
    }

    // 5️⃣ Save assistant reply
    await sql`
      INSERT INTO messages (role, content)
      VALUES (${ "assistant" }, ${ fullReply })
    `;

    res.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* -------------------- GET MESSAGES -------------------- */
app.get("/api/messages", async (req, res) => {
  try {
    const messages = await sql`
      SELECT role, content
      FROM messages
      ORDER BY id ASC
    `;

    res.json(messages);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

/* -------------------- START SERVER -------------------- */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

