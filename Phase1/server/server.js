import express from "express";
import cors from "cors";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import pkg from "pg";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


//- Database Config

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
//---------------------------------------


// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // Start Groq streaming
    const stream = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // You can change model if needed
      messages: [
        { role: "user", content: message }
      ],
      stream: true,
    });

    // Streaming headers
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    // Send chunks as they arrive
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        res.write(content);
      }
    }

    res.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});


app.get("/api/messages", async (req, res) => {
  const result = await pool.query(
    "SELECT role, content FROM messages ORDER BY id ASC"
  );
  res.json(result.rows);
});


app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
