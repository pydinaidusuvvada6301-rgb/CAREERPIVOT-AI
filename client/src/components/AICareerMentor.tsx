import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  X,
  MessageSquare,
  Sparkles,
  RefreshCw,
  ChevronDown,
  User,
  Zap,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { MentorMessage } from '../types';

export const AICareerMentor: React.FC = () => {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<MentorMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Hello ${profile?.fullName || 'there'}! I'm your CareerPivot AI Mentor. I analyze your current skills and target role (${profile?.targetRole || 'Full-Stack Software Engineer'}) to help you plan high-impact projects, prepare for technical interviews, and bridge skill gaps. What would you like to explore today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        'How do I bridge my top missing skills?',
        'What project should I build next?',
        'Give me a 5-minute technical interview question',
      ],
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const userMsg: MentorMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);
    setError(null);

    try {
      const history = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.sendMentorMessage({
        message: text,
        history,
        userProfile: {
          education: profile?.education,
          targetRole: profile?.targetRole,
          currentSkills: profile?.currentSkills,
          careerStage: profile?.careerStage,
        },
      });

      const assistantMsg: MentorMessage = {
        id: 'asst-' + Date.now(),
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: res.suggestedActions,
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Mentor chat error:', err);
      setError(err.message || 'Mentor is temporarily unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full border border-electric-400/40 bg-cyber-surface/90 px-4 py-3 text-sm font-semibold text-white shadow-glow-md backdrop-blur-md hover:border-electric-400 hover:shadow-glow-lg transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-neon-purple text-white shadow-xs">
            <Bot className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-electric-500"></span>
            </span>
          </div>
          <span className="hidden sm:inline font-mono tracking-tight text-xs text-electric-400">
            AI Career Mentor
          </span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[580px] w-[95vw] sm:w-[420px] flex-col rounded-3xl border border-electric-500/30 bg-cyber-bg/95 shadow-2xl backdrop-blur-xl transition-all overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-cyber-surface/80 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-neon-purple text-white shadow-xs">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  CareerPivot AI Mentor
                  <span className="inline-flex items-center rounded-md bg-electric-500/10 px-1.5 py-0.5 text-[9px] font-mono text-electric-400 border border-electric-500/20">
                    Live
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400 truncate max-w-[220px]">
                  Target: {profile?.targetRole || 'Full-Stack Engineer'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600/30 border border-brand-500/30 text-electric-400 text-xs">
                    <Bot className="h-3 w-3" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-brand-600 to-blue-600 text-white shadow-xs'
                      : 'border border-slate-800 bg-cyber-surface/70 text-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/40 flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-electric-400 flex items-center gap-1">
                        <Sparkles className="h-2.5 w-2.5" /> Recommended Questions:
                      </span>
                      {msg.suggestedActions.map((act, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(act)}
                          className="text-left rounded-lg border border-electric-500/20 bg-electric-500/5 px-2 py-1 text-[11px] text-slate-300 hover:border-electric-400 hover:bg-electric-500/10 hover:text-electric-300 transition-colors"
                        >
                          &rarr; {act}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="mt-1 block text-[9px] text-slate-400 text-right">
                    {msg.timestamp}
                  </span>
                </div>

                {msg.role === 'user' && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-300 text-xs">
                    <User className="h-3 w-3" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-xs text-electric-400">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600/30 border border-brand-500/30">
                  <Bot className="h-3 w-3" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl border border-slate-800 bg-cyber-surface/70 px-3 py-2 text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-electric-400 animate-pulse"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-electric-400 animate-pulse delay-150"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-electric-400 animate-pulse delay-300"></span>
                  <span className="ml-1 text-[11px]">Analyzing career context...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-300">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="border-t border-slate-800 bg-cyber-surface/90 p-3">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Ask about roadmaps, missing skills, or interviews..."
                className="flex-1 rounded-xl border border-slate-700 bg-cyber-bg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-electric-400 focus:outline-hidden focus:ring-1 focus:ring-electric-400"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-electric-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-glow-sm transition-all"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
