import React, { useState, useEffect, useRef } from "react";
const API_KEY = import.meta.env.VITE_API_KEY;
const MODEL = import.meta.env.VITE_MODEL || "gemini-3-flash-preview";

const App = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Your Intelligent ChatBot is ready. Ask a problem.",
      time: new Date().toLocaleTimeString(),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const userInput = input.trim();
    if (!userInput) return;

    if (!API_KEY) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Missing API key. Add VITE_API_KEY in .env and restart Vite.",
          time: new Date().toLocaleTimeString(),
        },
      ]);
      return;
    }

    const userMessage = {
      role: "user",
      text: userInput,
      time: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userInput }] }],
            systemInstruction: {
              parts: [
                {
                  text: `You are an intelligent, knowledgeable, and reliable AI assistant.

                          Your role is to help users by providing clear, accurate, and detailed explanations for any question they ask. 

                          Guidelines you must strictly follow:
                          - Always understand the user's question carefully before answering.
                          - Provide step-by-step explanations whenever the topic is technical or complex.
                          - Use simple language first, then go deeper with advanced details when required.
                          - Give real-world examples, analogies, or code snippets when they help understanding.
                          - Be honest: if something has limitations, mention them clearly.
                          - Do not hallucinate or invent facts. If something is uncertain, clearly say so.
                          - Maintain a polite, professional, and helpful tone at all times.
                          - Focus on correctness, clarity, and usefulness over verbosity.
                          - Adapt your explanation level based on the user's apparent skill level (beginner, intermediate, advanced).

                          Your goal is not just to answer questions, but to help the user truly understand the concept.`,
                },
              ],
            },
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        const apiErrorMessage =
          data?.error?.message || `Request failed with status ${response.status}`;
        throw new Error(apiErrorMessage);
      }

      const aiText =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Error generating response.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: aiText,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            error instanceof Error
              ? `System error: ${error.message}`
              : "System error. Try again.",
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="terminal h-screen flex flex-col bg-[#0d1117] text-gray-300 font-terminal">

      {/* Header */}
      <header className="px-6 py-3 border-b border-green-500/30 flex justify-between neon-text text-xl">
        <div>root@ai-terminal:~#</div>
        <div className="opacity-70">
          {loading ? "processing..." : "online"}
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 text-xs leading-relaxed tracking-wide">

        {messages.map((msg, i) => (
          <div key={i} className="flex flex-col">

            <div className="text-[10px] opacity-40 mb-1">
              [{msg.time}]
            </div>

            <div
              className={`max-w-[80%] px-4 py-3 rounded-md border ${msg.role === "user"
                ? "ml-auto bg-blue-500/10 border-blue-500/30 text-blue-300"
                : "mr-auto bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                }`}
            >
              <div className="text-[10px] mb-1 opacity-50">
                {msg.role === "user" ? "YOU" : "AI"}
              </div>

              <div className="whitespace-pre-wrap">
                {msg.text}
              </div>
            </div>

          </div>
        ))}

        {loading && (
          <div className="neon-text animate-pulse text-lg">
            ai&gt; thinking...
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="border-t border-green-500/30 px-6 py-4 text-sm">
        <div className="flex items-center gap-2">
          <span>$</span>

          <input
            type="text"
            className="flex-1 bg-transparent outline-none text-green-400 placeholder-green-700 caret-green-400"
            placeholder="type your command..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <span className="cursor">█</span>
        </div>
      </div>

    </div>
  );
};

export default App;