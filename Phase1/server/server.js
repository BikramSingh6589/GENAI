import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt: message,
        stream: true
      }),
    });

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value);

      // Ollama sends JSON per line
      const lines = buffer.split("\n");
      buffer = lines.pop(); // keep incomplete line

      for (let line of lines) {
        if (!line.trim()) continue;

        const parsed = JSON.parse(line);

        if (parsed.response) {
          res.write(parsed.response); // send only text
        }
      }
    }

    res.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});




app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
