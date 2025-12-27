
import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, X, Send, Sparkles, ChefHat, Mic, MoveUpRight, 
  Wand2, Coffee, Moon, Sun, ArrowRight, Clock, Flame, Utensils, 
  ChevronDown, Maximize2
} from 'lucide-react';
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { ChatMessage, GeneratedRecipe } from '../types';
import { streamChatResponse } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';

// --- VISUAL TOKENS ---
const GLASS_PANEL = "bg-[#F9F8F6]/80 backdrop-blur-3xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.12)]";
const ORB_GRADIENT = "bg-gradient-to-tr from-rose-400 via-orange-300 to-amber-200";

const AIChefChat: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<'chat' | 'voice'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Circadian Logic
  const hour = new Date().getHours();
  const isNight = hour > 19 || hour < 6;

  // --- HAPTICS ENGINE ---
  const vibrate = (pattern: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern);
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    setMessages(prev => {
        if (prev.length === 0 || (prev.length === 1 && prev[0].id === 'welcome')) {
            return [{ id: 'welcome', role: 'model', text: t('chat_welcome'), timestamp: new Date() }];
        }
        return prev;
    });
  }, [t, language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isTyping]);

  // --- LOGIC ---
  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    vibrate([10, 40]); // Send "Whoosh"
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
      vibrate(10); // Receive "Pop"
    } catch (e) { console.error(e); } finally { setIsTyping(false); }
  };

  // --- GENERATIVE WIDGET RENDERER ---
  // If the AI response contains specific keywords, we render a rich widget instead of just text
  const renderMessageContent = (text: string) => {
      // Mock detection for "Generative UI" demo
      if (text.toLowerCase().includes("timer") && text.toLowerCase().includes("minutes")) {
          return (
              <div className="flex flex-col gap-2">
                  <p>{text}</p>
                  <div className="mt-2 p-4 bg-stone-900 rounded-2xl text-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <Clock className="text-rose-400 animate-pulse" />
                          <span className="font-mono text-xl">15:00</span>
                      </div>
                      <button className="text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-white/30">Start</button>
                  </div>
              </div>
          )
      }
      return <p className="leading-relaxed">{text}</p>;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex flex-col justify-end font-sans">
      
      {/* 1. LIQUID ORB (The Trigger) */}
      <AnimatePresence>
        {!isOpen && (
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute bottom-28 right-5 z-50 pointer-events-auto"
            >
                <button
                    onClick={() => { vibrate(); setIsOpen(true); }}
                    className="relative w-16 h-16 rounded-full flex items-center justify-center group"
                >
                    {/* Bio-Luminescent Core */}
                    <div className={`absolute inset-0 ${ORB_GRADIENT} rounded-full animate-spin-slow blur-md opacity-80 group-hover:blur-xl transition-all duration-500`} />
                    <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse mix-blend-overlay" />
                    
                    {/* Glass Shell */}
                    <div className="relative z-10 w-full h-full rounded-full bg-white/10 backdrop-blur-[2px] border border-white/40 flex items-center justify-center shadow-lg">
                         <Sparkles className="text-white drop-shadow-md" size={24} strokeWidth={2} />
                    </div>
                </button>
            </motion.div>
        )}
      </AnimatePresence>

      {/* 2. THE ORACLE INTERFACE (Spatial Sheet) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50, borderRadius: "50px" }}
            animate={{ opacity: 1, scale: 1, y: 0, borderRadius: "0px" }}
            exit={{ opacity: 0, scale: 0.9, y: 50, borderRadius: "50px", filter: "blur(20px)" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`pointer-events-auto fixed inset-0 z-50 flex flex-col ${GLASS_PANEL}`}
          >
            {/* A. Atmospheric Header */}
            <div className="px-6 pt-12 pb-4 flex items-center justify-between border-b border-white/10 relative overflow-hidden">
               {/* Background Aurora */}
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-rose-100/20 to-blue-100/20 blur-xl pointer-events-none" />

               <div className="flex items-center gap-4 relative z-10">
                  <div className="relative">
                      <div className={`w-12 h-12 rounded-full ${ORB_GRADIENT} blur-sm absolute inset-0 animate-pulse`} />
                      <div className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center relative border border-white/50">
                          <ChefHat size={20} className="text-rose-500" />
                      </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-editorial italic font-bold text-stone-900 leading-none">The Oracle</h2>
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <p className="text-[10px] text-stone-500 font-brutal font-bold uppercase tracking-widest">
                            {isTyping ? "Synthesizing..." : "Listening"}
                        </p>
                    </div>
                  </div>
               </div>
               
               <button 
                  onClick={() => setIsOpen(false)} 
                  className="w-10 h-10 bg-white/50 hover:bg-white rounded-full flex items-center justify-center transition-all active:scale-95"
               >
                  <ChevronDown size={24} className="text-stone-600" />
               </button>
            </div>

            {/* B. Conversational Stream */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-hide relative">
               {messages.map((msg) => (
                 <motion.div 
                   key={msg.id}
                   initial={{ opacity: 0, y: 20, scale: 0.95 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                 >
                    {msg.role === 'model' && (
                        <div className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center mr-3 mt-1 shrink-0 shadow-sm">
                            <Sparkles size={14} className="text-rose-400" />
                        </div>
                    )}
                    
                    <div className={`max-w-[85%] relative group ${
                        msg.role === 'user' 
                        ? 'bg-stone-900 text-white rounded-[1.5rem] rounded-tr-sm px-6 py-4 shadow-xl shadow-stone-300/30' 
                        : 'bg-white/60 backdrop-blur-md border border-white/60 text-stone-800 rounded-[1.5rem] rounded-tl-sm px-6 py-5 shadow-sm'
                    }`}>
                        <div className={`text-sm ${msg.role === 'model' ? 'font-medium' : 'font-light'}`}>
                            {renderMessageContent(msg.text)}
                        </div>
                        
                        {/* Message Metadata (Timestamp) on Hover */}
                        <div className={`absolute -bottom-5 text-[9px] text-stone-400 font-brutal opacity-0 group-hover:opacity-100 transition-opacity ${msg.role === 'user' ? 'right-2' : 'left-2'}`}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                 </motion.div>
               ))}
               
               {isTyping && (
                  <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center mr-3 mt-1">
                            <Sparkles size={14} className="text-rose-400 animate-spin-slow" />
                      </div>
                      <div className="bg-white/40 border border-white/40 px-6 py-4 rounded-[1.5rem] rounded-tl-sm shadow-sm flex gap-1 backdrop-blur-sm">
                          <motion.div animate={{ height: [5, 15, 5] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1 bg-stone-400 rounded-full" />
                          <motion.div animate={{ height: [5, 15, 5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 bg-stone-400 rounded-full" />
                          <motion.div animate={{ height: [5, 15, 5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 bg-stone-400 rounded-full" />
                      </div>
                  </div>
               )}
               <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* C. The Input Capsule (Floating Island) */}
            <div className="p-4 pb-8 bg-gradient-to-t from-[#F9F8F6] via-[#F9F8F6]/90 to-transparent relative z-20">
               
               {/* Context Chips (Magnetic Scroll) */}
               <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide px-2 snap-x">
                   {["Quick Breakfast", "Low Carb", "Pantry Check", "Surprise Me"].map((s, i) => (
                       <button
                           key={i}
                           onClick={() => handleSend(s)}
                           className="snap-center flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-md border border-stone-200 rounded-xl shadow-sm text-xs font-bold text-stone-600 hover:border-rose-300 hover:text-rose-500 transition-all whitespace-nowrap active:scale-95"
                       >
                           <Wand2 size={12} /> {s}
                       </button>
                   ))}
               </div>

               {/* Command Input */}
               <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xl p-2 rounded-[2rem] border border-stone-200 shadow-lg shadow-stone-200/20 transition-all focus-within:shadow-rose-100/50 focus-within:border-rose-200 ring-2 ring-transparent focus-within:ring-rose-50">
                  <button className="w-10 h-10 bg-stone-100 rounded-full text-stone-400 hover:text-stone-900 transition-colors flex items-center justify-center">
                    <Mic size={18} />
                  </button>
                  
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1 bg-transparent border-none outline-none text-base text-stone-900 placeholder:text-stone-400 font-medium h-10 px-2"
                    placeholder="Ask the Oracle..."
                    autoFocus
                  />
                  
                  <button 
                    onClick={() => handleSend()}
                    disabled={!input.trim()}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        input.trim() 
                        ? 'bg-stone-900 text-white shadow-md rotate-0 scale-100' 
                        : 'bg-stone-100 text-stone-300 rotate-90 scale-90'
                    }`}
                  >
                     <ArrowRight size={18} />
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
