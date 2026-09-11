import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles } from 'lucide-react';

const INITIAL_SUGGESTIONS = [
  'Are Zivana Jewels pieces waterproof?',
  'Gift recommendations under ₹2,500',
  'How do I care for 18K PVD gold?',
  'What is your 7-Day Return Policy?',
];

export default function AIChatbotDrawer({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Namaste! Welcome to Zivana Jewels Concierge. I am your personal jewellery stylist. How may I assist your style journey today?',
      suggestions: INITIAL_SUGGESTIONS,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 200);
    }
  }, [isOpen, messages]);

  const handleSend = async (textToSend) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || loading) return;

    const userMessageId = `user_${Date.now()}`;
    const newMessages = [
      ...messages,
      {
        id: userMessageId,
        sender: 'user',
        text: messageText,
        timestamp: new Date(),
      },
    ];

    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      });

      const data = await response.json();

      if (data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot_${Date.now()}`,
            sender: 'bot',
            text: data.reply,
            suggestions: data.suggestions || [],
            timestamp: new Date(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot_${Date.now()}`,
            sender: 'bot',
            text: 'I am delighted to help with your jewellery inquiry. All Zivana Jewels pieces feature anti-tarnish 18K PVD Gold fused to medical-grade 316L stainless steel, backed by our 7-Day Easy Return Policy.',
            suggestions: INITIAL_SUGGESTIONS,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: 'Our concierge server is momentarily experiencing high volume. You may reach our dedicated Indian luxury concierge directly on WhatsApp or browse our anti-tarnish waterproof collections.',
          suggestions: ['Explore Waterproof Bestsellers', 'View Return Policy'],
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#17151F]/40 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-screen max-w-md bg-[#FAF9FF] border-l border-[#D6CFFF]/40 shadow-2xl flex flex-col h-full"
            >
              {/* Header */}
              <header className="px-5 py-4 border-b border-[#D6CFFF]/30 bg-white/80 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-[#17151F] to-[#7464B8] flex items-center justify-center text-white shadow-sm">
                    <Sparkles className="w-4 h-4 text-[#D6CFFF]" />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#17151F] tracking-wide font-serif">
                      Zivana Jewels Concierge
                    </h3>
                    <p className="text-[11px] text-[#7464B8] font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                      AI Jewellery Stylist · Online
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close concierge drawer"
                  className="p-1.5 rounded-full text-slate-500 hover:text-[#17151F] hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </header>

              {/* Chat Message Stream */}
              <section aria-label="Conversation messages" className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-end gap-2 max-w-[85%]">
                        {!isUser && (
                          <div className="w-6 h-6 rounded-full bg-[#17151F] text-[#D6CFFF] flex items-center justify-center shrink-0 mb-1">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                            isUser
                              ? 'bg-[#17151F] text-white rounded-br-xs shadow-sm'
                              : 'bg-white text-[#17151F] border border-[#D6CFFF]/40 rounded-bl-xs shadow-sm'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>

                      {/* Suggestion Chips */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5 pl-8 max-w-[95%]">
                          {msg.suggestions.map((sug, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSend(sug)}
                              className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white border border-[#D6CFFF] text-[#554784] hover:bg-[#D6CFFF]/30 hover:border-[#7464B8] transition-all shadow-xs text-left"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex items-center gap-2 pl-2">
                    <div className="w-6 h-6 rounded-full bg-[#17151F] text-[#D6CFFF] flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="px-4 py-2.5 bg-white border border-[#D6CFFF]/40 rounded-2xl rounded-bl-xs flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7464B8] animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7464B8] animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7464B8] animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </section>

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-[#D6CFFF]/30">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask our jewellery stylist..."
                    className="flex-1 bg-[#FAF9FF] border border-[#D6CFFF]/60 rounded-full px-4 py-2.5 text-xs sm:text-sm text-[#17151F] placeholder:text-slate-400 focus:outline-none focus:border-[#7464B8] focus:ring-1 focus:ring-[#7464B8]"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    aria-label="Send message"
                    className="w-10 h-10 rounded-full bg-[#17151F] text-[#D6CFFF] hover:bg-[#7464B8] hover:text-white disabled:opacity-40 disabled:hover:bg-[#17151F] disabled:hover:text-[#D6CFFF] flex items-center justify-center transition-all shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <p className="text-[10px] text-center text-slate-400 mt-2">
                  Zivana Jewels Luxury Styling & Waterproof Care Guarantee
                </p>
              </div>
            </motion.aside>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
