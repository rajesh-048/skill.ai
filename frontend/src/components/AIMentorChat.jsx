import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Bot, Send, Sparkles, X, Minimize2, Maximize2, 
  BookOpen, ChevronRight, CornerDownLeft, Loader2 
} from 'lucide-react';
import Markdown from 'react-markdown';
import { chatWithMentorApi, chatWithMentorStreamApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AIMentorChat = ({ activeDocument = null }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hello ${user?.profile?.full_name || 'Learner'}! 👋 I am **SkillSphere AI Mentor**, your dedicated tutor aligned with MoSPI capacity building standards.\n\nI can help you:\n- **Explain complex topics** with code & math\n- **Detect and close your competency gaps**\n- **Synthesize uploaded documents with verified citations**\n\nWhat would you like to master today?`,
      citations: [],
      suggested_questions: [
        'How do I close my Machine Learning gap?',
        'Explain Gradient Descent with Python code',
        'Summarize my uploaded notes'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = useCallback(async (customMessage = null) => {
    const textToSend = customMessage || input;
    if (!textToSend.trim() || loading || streaming) return;

    const userMsg = { role: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!customMessage) setInput('');
    setLoading(true);
    setStreaming(true);

    // Add a placeholder AI message that we'll append tokens to
    const aiIndex = messages.length + 1; // +1 for the user msg we just pushed
    setMessages((prev) => [...prev, {
      role: 'assistant',
      text: '',
      citations: [],
      suggested_questions: [],
      streaming: true,
    }]);

    const payload = {
      message: textToSend,
      document_id: activeDocument?.id || null,
      session_id: 'skillsphere_main_session',
    };

    // Try streaming first
    const abort = chatWithMentorStreamApi(payload, {
      onToken: (token) => {
        setMessages((prev) => {
          const updated = [...prev];
          const last = { ...updated[updated.length - 1] };
          last.text += token;
          updated[updated.length - 1] = last;
          return updated;
        });
      },
      onMeta: ({ citations, suggested }) => {
        setMessages((prev) => {
          const updated = [...prev];
          const last = { ...updated[updated.length - 1] };
          if (citations) last.citations = citations;
          if (suggested) last.suggested_questions = suggested;
          updated[updated.length - 1] = last;
          return updated;
        });
      },
      onDone: () => {
        setMessages((prev) => {
          const updated = [...prev];
          const last = { ...updated[updated.length - 1] };
          last.streaming = false;
          updated[updated.length - 1] = last;
          return updated;
        });
        setLoading(false);
        setStreaming(false);
      },
      onError: async (err) => {
        // Streaming failed — fall back to non-streaming API
        try {
          const res = await chatWithMentorApi(payload);
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'assistant',
              text: res.reply,
              citations: res.citations || [],
              suggested_questions: res.suggested_questions || [],
            };
            return updated;
          });
        } catch (fallbackErr) {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'assistant',
              text: `I encountered an error: ${fallbackErr.message}. SkillSphere offline mentor fallback is active.`,
              citations: [],
              suggested_questions: ['Explain Supervised vs Unsupervised learning', 'How do I start Day 1 of my roadmap?'],
            };
            return updated;
          });
        }
        setLoading(false);
        setStreaming(false);
      },
    });
    abortRef.current = abort;
  }, [input, loading, streaming, activeDocument, messages.length]);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-brand-600 to-emerald-500 text-white font-bold text-xs shadow-2xl shadow-brand-500/30 hover:scale-105 active:scale-95 transition-all group"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white animate-pulse" />
          </div>
          <span>SkillSphere AI Mentor</span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[520px] bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-brand-600 to-emerald-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">SkillSphere AI Mentor</h4>
                <p className="text-[10px] text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                  MoSPI Intelligent Pedagogical Engine
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Context Banner */}
          {activeDocument && (
            <div className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 border-b border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-[11px] text-indigo-700 dark:text-indigo-300">
              <span className="flex items-center gap-1.5 truncate">
                <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Context: {activeDocument.title}</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60">Grounded</span>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3.5 rounded-2xl max-w-[88%] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-brand-600 text-white rounded-br-none shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200/60 dark:border-slate-700/60'
                  }`}
                >
                  {m.text ? (
                    <div className="whitespace-pre-wrap prose prose-xs max-w-none dark:prose-invert">
                      <Markdown>{m.text}</Markdown>
                    </div>
                  ) : m.streaming ? (
                    /* Typing indicator: three pulsing dots */
                    <div className="flex items-center gap-1 py-1 px-0.5">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500"
                          style={{
                            animation: `pulse-dot 1.4s ease-in-out ${i * 0.2}s infinite`,
                          }}
                        />
                      ))}
                      <style>{`
                        @keyframes pulse-dot {
                          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
                          40% { opacity: 1; transform: scale(1.1); }
                        }
                      `}</style>
                    </div>
                  ) : null}

                  {/* Citations Pill */}
                  {m.citations && m.citations.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                      {m.citations.map((c, cIdx) => (
                        <div key={cIdx} className="text-[10px] bg-white dark:bg-navy-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                          <span className="font-bold text-brand-600 dark:text-brand-400">📄 {c.citation_text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Suggested Questions */}
                {m.suggested_questions && m.suggested_questions.length > 0 && (
                  <div className="mt-2 space-y-1 w-full max-w-[90%]">
                    {m.suggested_questions.map((q, qIdx) => (
                      <button
                        key={qIdx}
                        onClick={() => handleSend(q)}
                        className="w-full text-left p-1.5 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-brand-50 dark:hover:bg-brand-950/40 text-[11px] text-slate-600 dark:text-slate-300 hover:text-brand-700 dark:hover:text-brand-300 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between transition-colors"
                      >
                        <span className="truncate">{q}</span>
                        <ChevronRight className="w-3 h-3 opacity-60 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs w-fit">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />
                <span>{streaming ? 'Streaming response...' : 'SkillSphere Mentor is analyzing...'}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="p-3 bg-slate-50 dark:bg-navy-950 border-t border-slate-200 dark:border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Mentor a question or topic..."
                disabled={loading}
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              {streaming ? (
                <button
                  type="button"
                  onClick={() => { abortRef.current?.(); setLoading(false); setStreaming(false); }}
                  className="p-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white transition-colors shadow-md shadow-red-500/20"
                  title="Stop generating"
                >
                  <span className="block w-3 h-3 bg-white rounded-sm" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-40 transition-colors shadow-md shadow-brand-500/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>

        </div>
      )}
    </div>
  );
};
