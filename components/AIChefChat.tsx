
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, ChefHat, Mic, MoveUpRight, Wand2, Coffee, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '../types';
import { streamChatResponse } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';

const AIChefChat: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate Contextual Suggestions based on time and user data
  const getSuggestions = () => {
    const hour = new Date().getHours();
    const suggestions = [];

    if (hour < 11) suggestions.push({ label: 'Healthy Breakfast', icon: <Coffee size={14} /> });
    else if (hour > 18) suggestions.push({ label: 'Light Dinner', icon: <Moon size={14} /> });
    else suggestions.push({ label: 'Quick Lunch', icon: <Sun size={14} /> });

    if (user.pantry && user.pantry.length > 2) {
      suggestions.push({ label: 'Cook from Pantry', icon: <ChefHat size={14} /> });
    } else {
      suggestions.push({ label: 'Surprise Me', icon: <Wand2 size={14} /> });
    }
    
    // Add specific goal based suggestion
    if (user.goals?.includes('Weight Loss')) {
       suggestions.push({ label: 'Low Calorie Snack', icon: <Sparkles size={14} /> });
    }

    return suggestions;
  };

  const suggestions = getSuggestions();

  // Initialize chat
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

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    // Vibrate on send
    if(navigator.vibrate) navigator.vibrate(10);

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: messageText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.filter(m => m.id !== 'welcome').map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      
      // Inject user context into the prompt invisibly if it's the first message or specific request
      // (Simplified logic here: we just pass the text to the service, the service handles the prompt)
      
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
      
      {/* 1. LIQUID ORB TRIGGER */}
      <AnimatePresence>
        {!isOpen && (
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute bottom-28 right-5 z-50 pointer-events-auto"
            >
                <button
                    onClick={() => setIsOpen(true)}
                    className="relative w-16 h-16 rounded-full flex items-center justify-center group"
                >
                    {/* Living Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-rose-500 via-orange-500 to-amber-400 rounded-full animate-spin-slow blur-sm opacity-90 group-hover:blur-md transition-all duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-bl from-rose-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
                    
                    {/* Icon */}
                    <div className="relative z-10 bg-black/10 w-full h-full rounded-full flex items-center justify-center backdrop-blur-[1px]">
                         <MessageCircle className="text-white drop-shadow-md" size={28} strokeWidth={1.5} />
                    </div>

                    {/* Notification Dot */}
                    <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-[#F9F8F6] rounded-full z-20" />
                </button>
            </motion.div>
        )}
      </AnimatePresence>

      {/* 2. IMMERSIVE CHAT INTERFACE */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="pointer-events-auto fixed inset-0 z-50 flex flex-col bg-[#F9F8F6]/95 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="px-6 pt-12 pb-4 flex items-center justify-between bg-gradient-to-b from-white/80 to-transparent">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-rose-400 to-orange-400">
                     <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Chef" alt="AI" className="w-10 h-10 object-cover" />
                     </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-editorial italic font-bold text-stone-900 leading-none">{t('gen_ai_chef')}</h2>
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <p className="text-[10px] text-stone-400 font-brutal font-bold uppercase tracking-widest">{t('chat_chef_online')}</p>
                    </div>
                  </div>
               </div>
               <button 
                  onClick={() => setIsOpen(false)} 
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-stone-100 text-stone-400 hover:text-stone-900 transition-colors"
               >
                  <X size={20} />
               </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scrollbar-hide">
               {messages.map((msg, idx) => (
                 <motion.div 
                   key={msg.id}
                   initial={{ opacity: 0, y: 20, scale: 0.95 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   transition={{ duration: 0.3 }}
                   className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                 >
                    {msg.role === 'model' && (
                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center mr-3 mt-1 shrink-0">
                            <Sparkles size={14} className="text-rose-400" />
                        </div>
                    )}
                    
                    <div className={`max-w-[85%] ${
                        msg.role === 'user' 
                        ? 'bg-stone-900 text-white rounded-[1.5rem] rounded-tr-sm px-6 py-4 shadow-xl shadow-stone-200' 
                        : 'bg-white border border-stone-100 text-stone-800 rounded-[1.5rem] rounded-tl-sm px-6 py-5 shadow-sm'
                    }`}>
                        <p className={`text-sm leading-relaxed ${msg.role === 'model' ? 'font-medium' : 'font-light'}`}>
                            {msg.text}
                        </p>
                    </div>
                 </motion.div>
               ))}
               
               {isTyping && (
                  <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center mr-3 mt-1 shrink-0">
                            <Sparkles size={14} className="text-rose-400 animate-pulse" />
                      </div>
                      <div className="bg-white border border-stone-100 px-6 py-4 rounded-[1.5rem] rounded-tl-sm shadow-sm flex gap-1">
                          <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-stone-400 rounded-full" />
                          <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-stone-400 rounded-full" />
                          <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-stone-400 rounded-full" />
                      </div>
                  </div>
               )}
               <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* 3. INPUT ISLAND */}
            <div className="p-4 pb-8 bg-gradient-to-t from-white via-white/90 to-transparent relative z-20">
               
               {/* Context Chips */}
               <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide px-2">
                   {suggestions.map((s, i) => (
                       <button
                           key={i}
                           onClick={() => handleSend(s.label)}
                           className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl shadow-sm text-xs font-bold text-stone-600 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50 transition-colors whitespace-nowrap active:scale-95"
                       >
                           {s.icon} {s.label}
                       </button>
                   ))}
               </div>

               {/* Command Bar */}
               <div className="flex items-center gap-2 bg-stone-100/50 backdrop-blur-md p-1.5 pr-2 rounded-[2rem] border border-stone-200 transition-all focus-within:bg-white focus-within:shadow-[0_0_0_2px_rgba(251,113,133,0.3)] focus-within:border-rose-200">
                  <button className="w-10 h-10 bg-white rounded-full shadow-sm text-stone-400 hover:text-rose-500 transition-colors flex items-center justify-center">
                    <Mic size={18} />
                  </button>
                  
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1 bg-transparent border-none outline-none text-base text-stone-900 placeholder:text-stone-400 font-medium h-10 px-2"
                    placeholder={t('chat_placeholder')}
                    autoFocus
                  />
                  
                  <button 
                    onClick={() => handleSend()}
                    disabled={!input.trim()}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        input.trim() 
                        ? 'bg-stone-900 text-white shadow-lg rotate-0' 
                        : 'bg-stone-200 text-stone-400 rotate-90'
                    }`}
                  >
                     <MoveUpRight size={18} />
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
