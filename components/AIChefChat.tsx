import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, ChefHat, Mic, MoveUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '../types';
import { streamChatResponse } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

const AIChefChat: React.FC = () => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
       setMessages([{ id: 'welcome', role: 'model', text: t('chat_welcome'), timestamp: new Date() }]);
    }
  }, [t, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: messageText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.filter(m => m.id !== 'welcome').map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const stream = streamChatResponse(history, userMsg.text, language);
      let fullResponse = "";
      const modelMsgId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: "", timestamp: new Date() }]);

      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => prev.map(m => m.id === modelMsgId ? { ...m, text: fullResponse } : m));
      }
    } catch (e) { console.error(e); } finally { setIsTyping(false); }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex flex-col justify-end font-sans">
      
      {/* FLOATING ORB TRIGGER */}
      <AnimatePresence>
        {!isOpen && (
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="pointer-events-auto absolute bottom-28 right-5 w-16 h-16 rounded-full flex items-center justify-center z-50 group"
            >
                {/* Glowing Orb Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-rose-500 via-orange-400 to-amber-300 rounded-full animate-spin-slow blur-md opacity-80" />
                <div className="absolute inset-1 bg-gradient-to-tr from-rose-500 to-orange-500 rounded-full" />
                <MessageCircle className="text-white relative z-10" size={28} />
            </motion.button>
        )}
      </AnimatePresence>

      {/* IMMERSIVE GLASS OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="pointer-events-auto fixed inset-0 bg-white/80 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="px-6 pt-12 pb-4 flex items-center justify-between border-b border-stone-100/50">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-200">
                    <ChefHat size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-editorial italic font-bold text-stone-900">Chef AI</h2>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] text-stone-400 font-brutal font-bold uppercase tracking-widest">Online</p>
                    </div>
                  </div>
               </div>
               <button onClick={() => setIsOpen(false)} className="p-3 bg-stone-100 rounded-full hover:bg-stone-200 transition">
                  <X size={20} className="text-stone-600" />
               </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
               {messages.map((msg, idx) => (
                 <motion.div 
                   key={msg.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                 >
                    <div className={`max-w-[85%] px-6 py-4 rounded-[2rem] text-sm leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-stone-900 text-white rounded-br-sm' 
                        : 'bg-white border border-stone-200 text-stone-800 rounded-bl-sm shadow-sm'
                    }`}>
                        {msg.text}
                    </div>
                 </motion.div>
               ))}
               {isTyping && (
                  <div className="flex items-center gap-1 px-4 text-stone-400 text-xs font-bold font-brutal uppercase tracking-widest animate-pulse">
                      Chef is cooking<span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span>
                  </div>
               )}
               <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-gradient-to-t from-white via-white to-transparent">
               <div className="flex items-center gap-3 bg-stone-100/80 p-2 pr-3 rounded-[2rem] border border-stone-200 transition-shadow focus-within:shadow-lg focus-within:ring-2 ring-stone-900/10">
                  <button className="p-3 bg-white rounded-full shadow-sm text-stone-400 hover:text-stone-900 transition">
                    <Mic size={20} />
                  </button>
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1 bg-transparent border-none outline-none text-base text-stone-900 placeholder:text-stone-400 font-medium h-12"
                    placeholder="Ask for a recipe..."
                    autoFocus
                  />
                  <button 
                    onClick={() => handleSend()}
                    disabled={!input.trim()}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${input.trim() ? 'bg-stone-900 text-white shadow-lg' : 'bg-stone-200 text-stone-400'}`}
                  >
                     <MoveUpRight size={20} />
                  </button>
               </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChefChat;