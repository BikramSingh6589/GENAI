import { useState, useEffect, useRef } from "react";

function App() {

  // TODO 1: Store all chat messages
  const [messages, setMessages] = useState([]);

  // TODO 2: Store input text
  const [input, setInput] = useState("");

  // TODO 3: Used for auto-scroll
  const bottomRef = useRef(null);


  // TODO 4: Load old messages from backend when page loads
  useEffect(() => {
    fetch("http://localhost:3000/api/messages")
      .then(res => res.json())
      .then(data => {
        setMessages(data);
      })
      .catch(err => console.log(err));
  }, []);


  // TODO 5: Send message to backend
  const sendMessage = async () => {
  if (!input.trim()) return; // if input is empty, do nothing

  const userMessage = { role: "user", content: input }; // create usermsg object
  setMessages(prev => [...prev, userMessage]); // 


  // Send it to backend
  const response = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message: input })
  });

  setInput("");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let aiText = "";

  // Add empty AI message first
  setMessages(prev => [...prev, { role: "assistant", content: "" }]);

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    aiText += chunk;

    setMessages(prev => {
      const updated = [...prev];
      updated[updated.length - 1].content = aiText;
      return updated;
    });
  }
};



  // TODO 7: Auto scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>Simple AI Chat</h2>

      {/* TODO 8: Chat display area */}
      <div style={{
        border: "1px solid gray",
        height: "400px",
        overflowY: "auto",
        padding: "10px",
        marginBottom: "10px"
      }}>
        {messages.map((msg, index) => (
          <div key={index}
            style={{
              textAlign: msg.role === "user" ? "right" : "left",
              marginBottom: "8px"
            }}
          >
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      {/* TODO 9: Input box */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type message..."
        style={{ width: "80%", padding: "8px" }}
      />

      {/* TODO 10: Send button */}
      <button
        onClick={sendMessage}
        style={{ padding: "8px" }}
      >
        Send
      </button>
    </div>
  );
}

export default App;
