import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, RefreshCw, Luggage, ShieldAlert, Clock, Plane } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AiTravelAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiTravelAssistant: React.FC<AiTravelAssistantProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Namaste & Welcome to Wiings Airline! ✈️\n\nI am **Aero**, your AI Travel Concierge. I can help you with:\n• Searching flights and seat availability\n• Baggage guidelines & cabin restrictions\n• Web check-in assistance and boarding gate info\n• Ticket cancellation & refund estimates\n\nHow may I assist your journey today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });

      const data = await res.json();
      const replyText = data.text || "I'm having trouble processing that right now. Please try again or visit our Help Desk.";

      const aiMessage: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: "I encountered a network issue contacting the Wiings reservation core. Please check your connection and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { label: 'Baggage Allowance', icon: <Luggage className="w-3.5 h-3.5" />, query: 'What is the baggage allowance for Economy and Business class on Wiings?' },
    { label: 'Check-in Rules', icon: <Clock className="w-3.5 h-3.5" />, query: 'How does web check-in work and what time does the gate close?' },
    { label: 'Cancellation & Refund', icon: <ShieldAlert className="w-3.5 h-3.5" />, query: 'What is the cancellation and refund policy for Flexi vs Standard fares?' },
    { label: 'Flight WG-204 Status', icon: <Plane className="w-3.5 h-3.5" />, query: 'What is the current flight status and gate for flight WG-204 from Delhi to Dubai?' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-[#FCFAF6] border-l border-[#E8E2D5] text-slate-800 shadow-2xl h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#EBE5DA] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shadow-sm">
              <Bot className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-900 font-['Outfit']">
                  Aero — AI Travel Concierge
                </h3>
                <span className="text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full">
                  Gemini Flash AI
                </span>
              </div>
              <p className="text-xs text-slate-500">Wiings Airline Knowledge & Reservation Specialist</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Close AI Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick prompt pills */}
        <div className="p-3 bg-[#F6F2E9]/70 border-b border-[#EBE5DA]">
          <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
            Quick Inquiries:
          </p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(p.query)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-sky-50 border border-[#E8E2D5] hover:border-sky-300 text-xs text-slate-700 hover:text-sky-700 transition-all text-left shadow-sm font-medium"
              >
                {p.icon}
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => {
            const isAI = m.sender === 'assistant';
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="w-7 h-7 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isAI
                      ? 'bg-white text-slate-800 border border-[#E8E2D5] rounded-tl-sm'
                      : 'bg-sky-600 text-white font-medium rounded-tr-sm shadow-sky-600/10'
                  }`}
                >
                  <div className="whitespace-pre-line">{m.text}</div>
                  <div
                    className={`mt-1.5 text-[10px] text-right ${
                      isAI ? 'text-slate-400' : 'text-sky-100'
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>
                {!isAI && (
                  <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
          {loading && (
            <div className="flex gap-2.5 justify-start items-center">
              <div className="w-7 h-7 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="p-3 bg-white rounded-2xl border border-[#E8E2D5] flex items-center gap-2 text-xs text-slate-500 shadow-sm">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-600" />
                <span>Aero is analyzing flight databases...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white border-t border-[#EBE5DA] flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about flights, seats, baggage, check-in, PNR..."
            className="flex-1 bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shadow-md shadow-sky-600/20 active:scale-95"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
