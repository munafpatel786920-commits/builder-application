import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, X, Mic, Volume2, HelpCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotProps {
  currentContext: any;
  triggerMode?: 'fixed' | 'inline';
}

export default function Chatbot({ currentContext, triggerMode = 'fixed' }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Namaste! 🙏 I am your **AI Build Advisor**. Ready to estimate materials, calculate cement/steel requirements, draft GST contracts, or retrieve site details. What can I assist you with today?'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const presetPrompts = [
    'How many Cement bags for 1200 sq ft concrete slab?',
    'What is the GST rate on construction material?',
    'Show guidelines from IS Code-456 on column casting',
    'Summarize current project expenses'
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      role: 'user',
      content: text
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          context: currentContext
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reach AI proxy.');
      }

      const data = await response.json();
      setMessages(prev => [...prev, {
        id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        role: 'assistant',
        content: data.text
      }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        role: 'assistant',
        content: '⚠️ Offline Mode Help: Standard cement calculation tip: 1Bag = 50Kg. For M20 concrete (1:1.5:3 ratio), expect to use 1 part cement, 1.5 parts coarse sand, and 3 parts aggregate. Check your network or Secrets setup.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple simulated Speech Recognition (Voice assistant) for Indian English / accented inputs
  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice assistant recognition not supported in this desktop browser. Try using Google Chrome.');
      return;
    }

    setIsListening(true);
    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // Indian Accent English
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setInputMessage(speechToText);
      setIsListening(false);
    };

    recognition.onerror = (e: any) => {
      console.error(e);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Simple Text To Speech playback for hands-free support on dusty building sites
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Strip markdown syntax
      const cleanText = text.replace(/[*#`_\-]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-IN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      {/* Floating Trigger button with rich gold styling */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={
          triggerMode === 'fixed' 
            ? "fixed top-28 right-6 z-50 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-full p-4 shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform"
            : "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-full py-1 px-3 shadow-md flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform border border-amber-400"
        }
        id="chatbot-trigger-btn"
      >
        <Bot className={triggerMode === 'fixed' ? "w-6 h-6 text-slate-950 font-bold" : "w-3.5 h-3.5 text-slate-950 font-bold"} />
        <span className={`${triggerMode === 'fixed' ? 'text-xs hidden md:inline' : 'text-[10px]'} font-black tracking-wider uppercase`}>
          AI Advisor
        </span>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950"></span>
        </span>
      </button>

      {/* Floating Panel window */}
      {isOpen && (
        <div 
          className="fixed top-48 right-6 z-50 w-[calc(100%-2rem)] sm:w-[420px] h-[550px] max-h-[calc(100vh-14rem)] bg-white border border-slate-300 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-800"
          id="chatbot-panel-window"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-50 via-white to-amber-500/10 p-4 border-b border-slate-205 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 border border-amber-100 rounded-lg text-amber-650 text-amber-600">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm tracking-wide text-slate-900">AI Build Advisor</h4>
                <p className="text-[10px] text-amber-700 font-mono font-bold">Insite-Ready Assistant</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-800 p-1.5 rounded-full hover:bg-slate-100 border border-transparent hover:border-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Context status bar */}
          <div className="bg-slate-100 px-4 py-2 text-[11px] text-slate-500 font-semibold border-b border-slate-200 flex justify-between">
            <span>Context: Active Project Inventory</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 rounded font-mono">Offline-ready Sync</span>
          </div>

          {/* Chat Messages */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role !== 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200 text-xs font-black">
                    AI
                  </div>
                )}
                
                <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-amber-500 text-slate-950 font-black rounded-tr-none' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none font-sans'
                }`}>
                  <p className="whitespace-pre-line">{m.content}</p>
                  
                  {m.role === 'assistant' && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => handleSpeak(m.content)}
                        className="text-amber-700 hover:text-amber-800 p-1 flex items-center gap-1.5 text-[10px] font-mono font-bold"
                        title="Voice Audio Out"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Speak
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 border border-amber-250">
                  <Bot className="w-4 h-4 animate-spin text-amber-600" />
                </div>
                <div className="bg-white border border-slate-200 max-w-[80%] rounded-xl p-3 text-xs text-slate-500 font-mono flex items-center gap-2 shadow-sm font-semibold">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce"></span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce delay-100"></span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce delay-200"></span>
                  <span>AI calculating...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Preset Prompts */}
          <div className="px-3 py-2 bg-slate-100 border-t border-slate-200 max-h-24 overflow-y-auto">
            <div className="flex items-center gap-1 mb-1 text-[10px] text-slate-450 text-slate-500 font-extrabold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" /> Click to Ask
            </div>
            <div className="flex flex-wrap gap-1">
              {presetPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  className="text-[10px] bg-white border border-slate-250 hover:border-amber-500 text-slate-650 hover:text-amber-700 py-1 px-2.5 rounded-xl transition-colors text-left truncate max-w-full font-semibold shadow-sm"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Input Panel */}
          <div className="p-3 bg-slate-100 border-t border-slate-200 flex gap-2 items-center">
            <button
              onClick={handleVoiceSearch}
              className={`p-2.5 rounded-xl border transition-all ${isListening ? 'bg-red-500 text-white animate-pulse border-red-400' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-250'} shadow-sm`}
              title="Voice Input (Accented)"
            >
              <Mic className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'enter' || e.key === 'Enter' ? handleSend() : null}
              placeholder="Ask dynamic cement ratio, IS-456, GST..."
              className="flex-grow bg-white border border-slate-300 focus:outline-none focus:border-amber-500 rounded-xl text-xs py-2 px-3 text-slate-800 placeholder-slate-400 focus:ring-1 focus:ring-amber-500/20"
            />
            <button
              onClick={() => handleSend()}
              className="p-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition-colors font-extrabold shadow-sm shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
