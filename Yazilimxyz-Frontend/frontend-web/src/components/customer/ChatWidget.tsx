"use client";
import React, { useState } from "react";
import { Send, MessageCircle, X } from "lucide-react";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Merhaba! Size nasıl yardımcı olabilirim?", sender: "agent", time: "14:02" },
    { id: 2, text: "Merhaba, Nike Tişörtün M bedeni ne zaman gelir?", sender: "user", time: "14:03" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (input.trim() === "") return;
    setMessages([
      ...messages,
      { id: Date.now(), text: input, sender: "user", time: new Date().toLocaleTimeString().slice(0,5) },
    ]);
    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4">
      {/* Chat butonu */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gray-800 text-white p-4 rounded-full shadow-lg hover:bg-gray-700 transition"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat penceresi */}
      {isOpen && (
        <div className="w-80 h-96 bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
            <span className="font-semibold">Canlı Destek</span>
            <button onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Mesajlar */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-2 rounded-lg max-w-[70%] text-sm shadow
                    ${msg.sender === "user" ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-900"}`}
                >
                  {msg.text}
                  <div className="text-[10px] opacity-70 mt-1 text-right">{msg.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-2 border-t flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Mesajınızı yazın..."
              className="flex-1 border rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            <button
              onClick={sendMessage}
              className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
