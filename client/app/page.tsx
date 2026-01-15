"use client";

import React, { useState, KeyboardEvent } from 'react';
import ReactMarkdown from 'react-markdown';

// --- Interfaces ---
interface Message {
  role: 'user' | 'bot';
  content: string;
}

interface ChatResponse {
  reply: string;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          sessionId: 'temp-session',
          context: (window as any).VetChatbotConfig || {},
        }),
      });

      const data: ChatResponse = await res.json();
      setMessages((prev) => [...prev, { role: 'bot', content: data.reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'bot', content: "Sorry, I'm having trouble connecting." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="fixed bottom-5 right-5 z-[1000] font-sans">
      {/* FAB Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 transition-all flex items-center justify-center text-3xl"
        >
          🐾
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 h-[450px] bg-white shadow-2xl flex flex-col rounded-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-green-600 text-white flex justify-between items-center font-bold">
            <span>Vet Assistant</span>
            <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-green-700 px-2 rounded transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Chat Box */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  m.role === 'user'
                    ? 'ml-auto bg-green-100 text-green-900 rounded-br-none'
                    : 'mr-auto bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'
                }`}
              >
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            ))}
            {loading && (
              <div className="mr-auto bg-white p-3 rounded-lg shadow-sm border border-gray-100 animate-pulse text-xs text-gray-400">
                Assistant is typing...
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t bg-white flex gap-2">
            <input
              className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ask about your pet..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={sendMessage}
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
