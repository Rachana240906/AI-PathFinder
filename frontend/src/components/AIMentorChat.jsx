import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, X, Send, Bot, User, Sparkles,
  ChevronDown, Minimize2, Maximize2, Zap
} from 'lucide-react';

export default function AIMentorChat({
  currentUser,
  selectedRole,
  roles = [],
  userSkills = [],
  gapAnalysis,
  isOpen,
  onClose
}) {
  const [messages, setMessages] = useState([
    {
      sender: 'mentor',
      text: `Hi ${currentUser?.name || 'there'}! 👋 I'm your PathFinder AI Career Mentor. I'm actively analyzing your trajectory towards ${roles.find(r => r.id === selectedRole)?.title || 'your dream role'}. Ask me anything about skill gaps, project architectures, or interview advice!`,
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  const QUICK_QUESTIONS = [
    'Why am I missing Docker and how do I learn it fast?',
    'How do I prepare for technical interviews for this role?',
    'Suggest a high-impact portfolio project for my resume',
    'How can I tailor my roadmap for a lighter week?'
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (messageText = input) => {
    if (!messageText.trim()) return;

    const userMsg = {
      sender: 'user',
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/mentor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          user_profile: {
            name: currentUser?.name || 'Student',
            target_role: selectedRole,
            skills: userSkills,
            readiness_score: gapAnalysis?.match_score || 70,
            missing_skills: (gapAnalysis?.missing_core_skills || []).map(s => typeof s === 'object' ? s.name : s)
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [
          ...prev,
          {
            sender: 'mentor',
            text: data.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col rounded-3xl shadow-2xl overflow-hidden border transition-all duration-200 animate-fade-in"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border)',
        width: minimized ? '320px' : '420px',
        maxHeight: minimized ? '60px' : '620px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-3.5 flex items-center justify-between cursor-pointer border-b"
        style={{
          background: 'var(--accent)',
          borderColor: 'var(--accent)',
          color: '#ffffff'
        }}
        onClick={() => setMinimized(m => !m)}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-tight flex items-center gap-1.5">
              <span>PathFinder Career Mentor</span>
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            </h3>
            <p className="text-[10px] text-emerald-100">AI Powered · Context Aware</p>
          </div>
        </div>

        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setMinimized(m => !m)}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            {minimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Chat Messages */}
          <div className="flex-1 p-4 space-y-3.5 overflow-y-auto max-h-[420px] bg-slate-50/50 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'mentor' && (
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                  }`}
                >
                  <p>{m.text}</p>
                  <span className={`text-[9px] mt-1 block ${m.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'}`}>
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <div className="w-6 h-6 rounded-lg bg-emerald-600/30 text-emerald-700 flex items-center justify-center shrink-0 text-[10px]">
                  AI
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce delay-200" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Pills */}
          <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200 flex gap-1.5 overflow-x-auto">
            {QUICK_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 text-slate-700 whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask your Career Mentor anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl text-xs outline-none bg-slate-50 border border-slate-200 text-slate-900 focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl text-white transition-opacity shadow-xs cursor-pointer"
              style={{
                background: !input.trim() ? '#94a3b8' : 'var(--accent)',
                cursor: !input.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
