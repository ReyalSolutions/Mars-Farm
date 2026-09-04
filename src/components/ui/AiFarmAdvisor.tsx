import React, { useState, useRef, useEffect } from 'react';
import { Sprout, Send, X, ChevronDown, ChevronUp, Sparkles, Loader2, Cpu, Zap, CheckCircle2, Trash2, Clock } from 'lucide-react';
import { queryFarmerAiAsync, getAiAdvisorStatus, AiAdvisorStatus } from '../../services/aiAdvisorService';
import { fetchChatHistoryFromSupabase, saveChatMessageToSupabase, clearChatHistoryFromSupabase, getSavedChatHistory, SavedChatMessage } from '../../services/storageService';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { useMission } from '../../context/MissionContext';

const QUICK_QUESTIONS = [
  'What should I plant?',
  'Why is my score low?',
  'Which crop uses the least water?',
  'Can this farm feed my crew?',
  'How can I improve my farm?',
];

interface AiFarmAdvisorProps {
  /** Optional extra context text shown above chat, e.g. post-mission analysis */
  contextNote?: string;
  /** Whether the chat box is expanded by default */
  defaultOpen?: boolean;
}

export const AiFarmAdvisor: React.FC<AiFarmAdvisorProps> = ({ contextNote, defaultOpen = true }) => {
  const { config, resourceProjection, suitability } = useMission();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [aiStatus, setAiStatus] = useState<AiAdvisorStatus>(getAiAdvisorStatus());
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(isSupabaseConfigured());
  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);
  const [messages, setMessages] = useState<SavedChatMessage[]>(getSavedChatHistory());
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history from Supabase on mount
  useEffect(() => {
    setAiStatus(getAiAdvisorStatus());
    const loadCloudChat = async () => {
      const res = await fetchChatHistoryFromSupabase();
      if (res.messages.length > 0) {
        setMessages(res.messages);
      }
      setIsCloudSynced(res.isCloudSynced);
    };
    loadCloudChat();
  }, []);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = async (question: string) => {
    if (!question.trim() || isThinking) return;
    const userMsg: SavedChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: question.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsThinking(true);

    // Persist user message to Supabase
    saveChatMessageToSupabase(userMsg);

    try {
      const response = await queryFarmerAiAsync(question, config, resourceProjection, suitability);
      const aiMsg: SavedChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: response.answer,
        source: response.source,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...newHistory, aiMsg]);
      // Persist AI message to Supabase
      saveChatMessageToSupabase(aiMsg);
    } catch {
      const errorMsg: SavedChatMessage = {
        id: `err-${Date.now()}`,
        role: 'ai',
        text: '⚠️ Farmer AI temporarily offline. Check your configuration or network.',
        source: 'HEURISTIC_ENGINE',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...newHistory, errorMsg]);
      saveChatMessageToSupabase(errorMsg);
    } finally {
      setIsThinking(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleClearChat = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Clear all saved chat history with Farmer AI from Supabase and local storage?')) {
      const fresh = await clearChatHistoryFromSupabase();
      setMessages(fresh);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Render message text with bold markdown support (**text**)
  const renderText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : <span key={i}>{part}</span>
    );
  };

  return (
    <div className={`hud-panel rounded-2xl border transition-all overflow-hidden ${
      aiStatus.isLive ? 'border-bio-500/50 shadow-[0_0_20px_rgba(16,185,129,0.14)]' : 'border-bio-500/30'
    }`}>
      {/* Header — always visible, toggles panel */}
      <div
        onClick={() => setIsOpen(v => !v)}
        className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left hover:bg-space-900/50 transition-colors cursor-pointer select-none"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
            aiStatus.isLive ? 'bg-bio-500/20 border-bio-500/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-bio-500/20 border-bio-500/40'
          }`}>
            <Sprout className="w-4 h-4 text-bio-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs font-mono font-bold text-white uppercase tracking-wider">🌱 Farmer AI Advisor</p>
              {aiStatus.isLive ? (
                <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-bio-950 border border-bio-500/50 text-bio-300">
                  LIVE LLM
                </span>
              ) : (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-space-950 border border-slate-700 text-slate-400">
                  HEURISTIC
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              {aiStatus.isLive ? `Model: ${aiStatus.modelName}` : 'NASA AgriSim v2.6 · Deterministic Engine'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {aiStatus.isLive ? (
            <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full bg-bio-950/80 border border-bio-500/50 text-bio-300">
              <span className="w-2 h-2 rounded-full bg-bio-400 animate-ping" />
              <span>LIVE AI CONNECTED</span>
            </span>
          ) : (
            <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              HEURISTIC
            </span>
          )}

          {isOpen && (
            <button
              onClick={handleClearChat}
              title="Clear Saved Chat History"
              className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-space-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {/* Collapsible body */}
      {isOpen && (
        <div id="ai-advisor-body" className="border-t border-slate-800/80">
          {/* Live Indicator & Supabase Cloud Sync Banner */}
          <div className={`px-4 py-2 text-[11px] font-mono flex items-center justify-between gap-2 border-b flex-wrap ${
            aiStatus.isLive
              ? 'bg-bio-950/30 border-bio-500/30 text-bio-300'
              : 'bg-space-950 border-slate-800 text-slate-400'
          }`}>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-bio-400 shrink-0" />
              {aiStatus.isLive ? `Provider: ${aiStatus.label}` : 'Offline Mode: Heuristic Engine'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-bio-400 flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                {isCloudSynced ? 'Synced to Supabase Cloud' : 'Saved Locally'} ({messages.length} msgs)
              </span>
              <button
                onClick={() => setShowSqlModal(!showSqlModal)}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 underline"
              >
                {showSqlModal ? 'Hide SQL' : 'Supabase SQL ↗'}
              </button>
            </div>
          </div>

          {/* Collapsible Supabase Chat SQL instructions */}
          {showSqlModal && (
            <div className="p-3 bg-space-950 border-b border-cyan-500/30 text-xs font-mono space-y-1.5 animate-in fade-in">
              <div className="flex items-center justify-between text-cyan-300 font-bold text-[11px]">
                <span>Supabase Chat Table SQL (mars_ai_chat):</span>
                <span className="text-[10px] text-slate-400">Run in Supabase SQL Editor</span>
              </div>
              <pre className="p-2.5 rounded bg-space-900 border border-slate-800 text-[10px] text-slate-200 overflow-x-auto leading-relaxed">
{`create table if not exists mars_ai_chat (
  id text primary key,
  role text not null,
  message text not null,
  source text default 'HEURISTIC_ENGINE',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table mars_ai_chat enable row level security;
create policy "Allow public read" on mars_ai_chat for select using (true);
create policy "Allow public insert" on mars_ai_chat for insert with check (true);
create policy "Allow public delete" on mars_ai_chat for delete using (true);`}
              </pre>
            </div>
          )}

          {contextNote && (
            <div className="px-4 py-2 bg-bio-950/40 border-b border-bio-500/20 text-[11px] font-mono text-bio-300 flex items-center gap-2">
              <Sparkles className="w-3 h-3 shrink-0" />
              {contextNote}
            </div>
          )}

          {/* Quick question chips */}
          <div className="px-4 pt-3 pb-2 flex flex-wrap gap-1.5">
            {QUICK_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={isThinking}
                className="text-[10px] font-mono px-2.5 py-1 rounded-full border border-slate-700 bg-space-950 text-slate-300 hover:border-bio-400 hover:text-bio-300 transition-all disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Message history — persisted */}
          <div className="h-60 overflow-y-auto px-4 py-2 space-y-3 scrollbar-thin">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3.5 py-2 rounded-xl text-[11px] font-mono leading-relaxed space-y-1 ${
                    msg.role === 'user'
                      ? 'bg-cyan-900/40 border border-cyan-500/30 text-cyan-100 rounded-br-sm'
                      : 'bg-space-950 border border-slate-700 text-slate-200 rounded-bl-sm'
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pb-0.5 border-b border-slate-800/80 mb-1 gap-2">
                    <span className={msg.role === 'ai' ? 'text-bio-400 font-bold' : 'text-cyan-300 font-bold'}>
                      {msg.role === 'ai' ? '🌱 FARMER AI' : '👤 COMMANDER'}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] text-slate-500">
                      {msg.role === 'ai' && (
                        <span>{msg.source === 'LIVE_LLM' ? '⚡ Live LLM' : '🌱 Heuristic'}</span>
                      )}
                      <span>·</span>
                      <span>{msg.timestamp}</span>
                    </span>
                  </div>
                  <div>{renderText(msg.text)}</div>
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-space-950 border border-slate-700 rounded-xl px-3 py-2 text-[11px] font-mono text-bio-400 flex items-center gap-2 shadow-sm">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing agronomy advice via Gemini...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Chat input form — prominent and always accessible */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-space-950/80 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask Farmer AI (e.g. 'How do I optimize water for 6 astronauts?')..."
              disabled={isThinking}
              className="flex-1 bg-space-900 border border-slate-700 focus:border-bio-400 focus:ring-1 focus:ring-bio-400/50 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={isThinking || !input.trim()}
              className="px-4 py-2 rounded-lg bg-bio-500/20 border border-bio-500/50 text-bio-300 hover:bg-bio-500/30 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
