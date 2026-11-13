import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useFarm } from '../context/FarmContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { SafetyDisclaimer } from '../components/SafetyDisclaimer';
import { 
  MessageSquareText, 
  Send, 
  Volume2, 
  VolumeX, 
  Bot, 
  User, 
  Sparkles, 
  MapPin, 
  RotateCcw,
  HelpCircle,
  Check
} from 'lucide-react';

export const AIChatAssistant = () => {
  const { selectedFarm } = useFarm();
  const { language, t } = useLanguage();
  const { profile } = useAuth();
  const messagesEndRef = useRef(null);

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Namaste! I am AgriSahayak, your AI agricultural advisor. I can help with crop selection, soil nutrient deficiencies, organic pest management, and irrigation planning. How may I support your farm today?`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);

  const promptChips = [
    'Which crop is best for black soil in Kharif?',
    'Why are my older leaves turning yellow?',
    'What is the recommended dosage of DAP for Wheat?',
    'How can I control pink bollworm organically?',
    'Tips to save water using drip irrigation'
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setLoading(true);

    try {
      const payload = {
        message: text,
        farmId: selectedFarm?.id || null,
        preferredLanguage: language,
        history: newHistory.slice(-8).map(m => ({ role: m.role, content: m.content }))
      };

      const res = await axios.post('/api/chat', payload);
      if (res.data?.success) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: res.data.data.reply,
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'I experienced an issue processing your agricultural inquiry. Please try again or verify your connection.',
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Text-To-Speech for accessibility
  const handleSpeak = (text, idx) => {
    if ('speechSynthesis' in window) {
      if (speakingIdx === idx) {
        window.speechSynthesis.cancel();
        setSpeakingIdx(null);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.onend = () => setSpeakingIdx(null);
      utterance.onerror = () => setSpeakingIdx(null);
      setSpeakingIdx(idx);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12 flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-xs flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-800 text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
              AgriSahayak AI Conversational Assistant
            </h1>
            <p className="text-xs text-stone-400">
              {selectedFarm ? `Advising for: ${selectedFarm.name} (${selectedFarm.soilType} soil)` : 'General Agro-Advisory Mode'}
            </p>
          </div>
        </div>

        {selectedFarm && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-semibold border border-emerald-200">
            <MapPin className="w-3.5 h-3.5" />
            <span>{selectedFarm.name}</span>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-white rounded-3xl p-4 sm:p-6 border border-stone-200/80 shadow-xs overflow-y-auto space-y-4">
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                isUser ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-700'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-emerald-700" />}
              </div>

              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                isUser 
                  ? 'bg-emerald-700 text-white rounded-tr-xs shadow-xs' 
                  : 'bg-stone-50 border border-stone-200/80 text-stone-800 rounded-tl-xs'
              }`}>
                <div className="whitespace-pre-wrap">{m.content}</div>

                <div className={`flex items-center justify-between gap-4 mt-2 pt-1 border-t text-[10px] ${
                  isUser ? 'border-white/20 text-emerald-200' : 'border-stone-200/50 text-stone-400'
                }`}>
                  <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  
                  {!isUser && (
                    <button
                      onClick={() => handleSpeak(m.content, idx)}
                      className="hover:text-emerald-700 flex items-center gap-1 transition"
                      title="Read Aloud"
                    >
                      {speakingIdx === idx ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-emerald-600">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3 text-xs text-stone-500 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>AgriSahayak is reasoning your farming question...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 shrink-0">
        {promptChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(chip)}
            className="text-[11px] bg-white border border-stone-200 text-stone-700 hover:border-emerald-400 hover:bg-emerald-50 px-3 py-1.5 rounded-full shrink-0 transition"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 bg-white rounded-2xl p-2 border border-stone-200 shadow-sm shrink-0"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask any agricultural question in your preferred language..."
          className="flex-1 text-xs sm:text-sm px-3 py-2 bg-transparent focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || loading}
          className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
