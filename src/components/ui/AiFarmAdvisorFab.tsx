import React, { useState, useEffect, useRef } from 'react';
import {
  Sprout, Send, X, Sparkles, Loader2, Zap, CheckCircle2,
  Trash2, MessageSquare, Bot, ArrowRight, CornerDownLeft,
  ChevronDown, ChevronUp, Volume2, VolumeX, Sliders, Play, Square,
  Copy, Check
} from 'lucide-react';
import { queryFarmerAiAsync, getAiAdvisorStatus, AiAdvisorStatus } from '../../services/aiAdvisorService';
import {
  fetchChatHistoryFromSupabase,
  saveChatMessageToSupabase,
  clearChatHistoryFromSupabase,
  getSavedChatHistory,
  SavedChatMessage
} from '../../services/storageService';
import {
  VoiceConfig, getSavedVoiceConfig, saveVoiceConfig,
  getBrowserVoices, speakText, stopSpeech
} from '../../services/speechService';
import { AiResponseFormatter } from './AiResponseFormatter';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { useMission } from '../../context/MissionContext';
import { useAudio } from '../../context/AudioContext';

const QUICK_QUESTIONS = [
  'What should I plant for 6 crew?',
  'Which location has the best water ice?',
  'Why is my mission score low?',
  'How do I survive a global dust storm?',
  'Which crop has the lowest water consumption?',
];

export const AiFarmAdvisorFab: React.FC = () => {
  const { config, resourceProjection, suitability } = useMission();
  const { playClick, playSuccess } = useAudio();

  const [isOpen, setIsOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState<AiAdvisorStatus>(getAiAdvisorStatus());
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(isSupabaseConfigured());
  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);
  const [messages, setMessages] = useState<SavedChatMessage[]>(getSavedChatHistory());
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showQuickCommands, setShowQuickCommands] = useState<boolean>(false);

  // Voice Synthesizer State
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>(getSavedVoiceConfig);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [showVoiceSettings, setShowVoiceSettings] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    playClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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

  // Load browser voices & cleanup speech on unmount
  useEffect(() => {
    const loadVoices = () => {
      const v = getBrowserVoices();
      if (v.length > 0) {
        setAvailableVoices(v);
      }
    };
    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      stopSpeech();
    };
  }, []);

  const updateVoiceConfig = (partial: Partial<VoiceConfig>) => {
    setVoiceConfig(prev => {
      const updated = { ...prev, ...partial };
      saveVoiceConfig(updated);
      return updated;
    });
  };

  const handleSpeakMessage = (msgId: string, text: string) => {
    if (speakingMessageId === msgId) {
      stopSpeech();
      setSpeakingMessageId(null);
      return;
    }

    playClick();
    const started = speakText(
      text,
      voiceConfig,
      () => setSpeakingMessageId(msgId),
      () => setSpeakingMessageId(null),
      () => setSpeakingMessageId(null)
    );

    if (!started) {
      setSpeakingMessageId(null);
    }
  };

  const handleTestVoice = () => {
    playClick();
    speakText(
      'Farmer AI comms link established. Martian hydroponic and environmental loops operating nominally.',
      voiceConfig,
      () => setSpeakingMessageId('test-voice'),
      () => setSpeakingMessageId(null),
      () => setSpeakingMessageId(null)
    );
  };

  // Keyboard shortcut: ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        stopSpeech();
        setSpeakingMessageId(null);
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Auto-scroll to bottom when messages update or modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages, isOpen]);

  const toggleModal = () => {
    playClick();
    if (isOpen) {
      stopSpeech();
      setSpeakingMessageId(null);
    }
    setIsOpen(prev => !prev);
  };

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

    // Save user message to Supabase
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
      saveChatMessageToSupabase(aiMsg);
      playSuccess();

      // Auto-read aloud if enabled by user
      if (voiceConfig.autoSpeak) {
        setTimeout(() => handleSpeakMessage(aiMsg.id, aiMsg.text), 150);
      }
    } catch {
      const errorMsg: SavedChatMessage = {
        id: `err-${Date.now()}`,
        role: 'ai',
        text: '⚠️ Farmer AI temporarily offline. Switched to internal heuristic matrix.',
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
    if (confirm('Clear saved chat history with Farmer AI from Supabase and local storage?')) {
      playClick();
      const fresh = await clearChatHistoryFromSupabase();
      setMessages(fresh);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Render text with markdown bolding (**bold**)
  const renderText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : <span key={i}>{part}</span>
    );
  };

  return (
    <>
      {/* 1. FLOATING FAB (BOTTOM-RIGHT) - SOLID OPAQUE HIGH-CONTRAST */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
        <button
          onClick={toggleModal}
          id="farm-ai-advisor-fab"
          aria-label="Open Farm AI Advisor"
          className={`
            group relative flex items-center gap-2.5 p-2.5 sm:px-4 sm:py-3 rounded-full
            transition-all duration-200 transform hover:scale-105 active:scale-95 select-none
            bg-[#0b1329] border-2 shadow-[0_4px_25px_rgba(16,185,129,0.5)]
            ${isOpen
              ? 'border-bio-300 ring-2 ring-bio-400/50 text-white'
              : 'border-bio-400 hover:border-bio-300 text-white'
            }
          `}
        >
          {/* Subtle outer neon ring */}
          <span className="absolute -inset-0.5 rounded-full bg-bio-500 opacity-25 group-hover:opacity-60 blur-sm transition duration-300 -z-10" />

          {/* Solid Icon Pill with status ping */}
          <div className="relative flex items-center justify-center shrink-0">
            <div className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-bio-500 text-slate-950 flex items-center justify-center font-bold shadow-md group-hover:bg-bio-400 transition-colors">
              <Sprout className="w-5 h-5 sm:w-4 sm:h-4 text-slate-950" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bio-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-bio-400 border border-slate-950" />
            </span>
          </div>

          {/* Label text (hidden on very small screens, visible on sm+) */}
          <div className="hidden sm:block text-left font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold font-display uppercase tracking-wider text-white group-hover:text-bio-300 transition-colors">
                Farm AI
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-bio-950 border border-bio-400 text-bio-300 font-bold uppercase">
                {aiStatus.isLive ? 'LIVE' : 'AUTO'}
              </span>
            </div>
            <p className="text-[9px] text-slate-300 group-hover:text-white">
              NASA Agronomy Copilot
            </p>
          </div>

          {/* Mobile concise label */}
          <span className="sm:hidden text-xs font-mono font-bold text-bio-300 pr-1">
            AI
          </span>

          {/* Message count badge */}
          {messages.length > 0 && !isOpen && (
            <span className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-950 border border-slate-700 text-bio-300 rounded-full ml-0.5">
              {messages.length}
            </span>
          )}
        </button>
      </div>

      {/* 2. HOLOGRAPHIC MODAL DIALOG - FULL MOBILE OPTIMIZATION */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          {/* Backdrop click to dismiss */}
          <div className="absolute inset-0" onClick={toggleModal} />

          {/* Modal Container: Bottom sheet on mobile, centered modal on desktop */}
          <div
            className="relative w-full sm:max-w-2xl h-[92vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-2xl bg-[#080d1a] border-t-2 sm:border border-bio-500/50 shadow-[0_0_50px_rgba(16,185,129,0.3)] flex flex-col overflow-hidden z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Mobile Drag/Pull Indicator */}
            <div className="sm:hidden w-full flex justify-center pt-2 pb-1 bg-[#0d1527]">
              <div className="w-12 h-1 rounded-full bg-slate-600" />
            </div>

            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-800 bg-[#0d1527]">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-bio-500/20 border border-bio-500/60 flex items-center justify-center text-bio-400 shrink-0">
                  <Sprout className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <h3 className="text-xs sm:text-sm font-bold font-display text-white tracking-wide truncate">
                      FARMER AI ADVISOR
                    </h3>
                    <span className={`text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase border shrink-0 ${
                      aiStatus.isLive
                        ? 'bg-bio-950 border-bio-500/60 text-bio-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}>
                      {aiStatus.isLive ? 'MINIMAX M3' : 'HEURISTIC'}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 truncate">
                    {aiStatus.isLive ? `Engine: ${aiStatus.modelName}` : 'NASA Closed-Loop Agronomy Matrix'}
                  </p>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {/* Voice Synthesizer Settings Button */}
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setShowVoiceSettings(prev => !prev);
                  }}
                  title="Voice Settings (Speed, Pitch, Voice Selection)"
                  className={`p-1.5 rounded-lg transition-colors border ${
                    showVoiceSettings || voiceConfig.autoSpeak
                      ? 'bg-bio-950 border-bio-400 text-bio-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800 border-slate-700'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClearChat}
                  title="Clear Chat History"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleModal}
                  aria-label="Close Advisor Modal"
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sub-header status ribbon */}
            <div className="px-4 py-1.5 sm:px-5 sm:py-2 bg-[#0a101f] border-b border-slate-800 text-[10px] sm:text-[11px] font-mono flex items-center justify-between gap-2 text-slate-400">
              <span className="flex items-center gap-1.5 truncate">
                <Zap className="w-3 h-3 text-bio-400 shrink-0" />
                <span className="truncate">Status: <strong className="text-slate-200">{aiStatus.label}</strong></span>
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-bio-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{isCloudSynced ? 'Supabase Synced' : 'Local'}</span>
                </span>
                <span className="text-slate-700">|</span>
                <button
                  onClick={() => setShowVoiceSettings(prev => !prev)}
                  className="text-[10px] text-bio-400 hover:text-bio-300 flex items-center gap-1"
                >
                  <span>Voice: {voiceConfig.autoSpeak ? 'Auto 🔊' : 'Manual'}</span>
                </button>
                <span className="text-slate-700">|</span>
                <button
                  onClick={() => setShowSqlModal(prev => !prev)}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 underline"
                >
                  {showSqlModal ? 'Hide' : 'SQL ↗'}
                </button>
              </div>
            </div>

            {/* Collapsible Voice Customization Settings Drawer */}
            {showVoiceSettings && (
              <div className="p-3.5 sm:p-4 bg-[#091122] border-b border-bio-500/40 text-xs font-mono space-y-3 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-bio-300 font-bold">
                    <Volume2 className="w-4 h-4 text-bio-400" />
                    <span>Voice Synthesizer Adjustments</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowVoiceSettings(false)}
                    className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
                  >
                    Done ✕
                  </button>
                </div>

                {/* Voice Engine Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">
                    Speech Synthesizer Voice ({availableVoices.length > 0 ? `${availableVoices.length} voices available` : 'Default OS'}):
                  </label>
                  <select
                    value={voiceConfig.voiceURI}
                    onChange={(e) => updateVoiceConfig({ voiceURI: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-bio-400 rounded-lg p-2 text-xs text-white font-mono"
                  >
                    <option value="">Default Aerospace Comm Voice (Auto)</option>
                    {availableVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sliders: Rate & Pitch */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Speech Speed / Rate</span>
                      <span className="text-bio-300 font-bold">{voiceConfig.rate.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.6"
                      max="1.6"
                      step="0.05"
                      value={voiceConfig.rate}
                      onChange={(e) => updateVoiceConfig({ rate: parseFloat(e.target.value) })}
                      className="w-full accent-bio-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500">
                      <span>0.6x Slow</span>
                      <span>1.0x Normal</span>
                      <span>1.6x Fast</span>
                    </div>
                  </div>

                  <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Radio Pitch</span>
                      <span className="text-cyan-300 font-bold">{voiceConfig.pitch.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.6"
                      max="1.5"
                      step="0.05"
                      value={voiceConfig.pitch}
                      onChange={(e) => updateVoiceConfig({ pitch: parseFloat(e.target.value) })}
                      className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500">
                      <span>0.6x Deep Comms</span>
                      <span>1.0x Natural</span>
                      <span>1.5x Cyber</span>
                    </div>
                  </div>
                </div>

                {/* Toggles & Test Button */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-300 select-none">
                    <input
                      type="checkbox"
                      checked={voiceConfig.autoSpeak}
                      onChange={(e) => updateVoiceConfig({ autoSpeak: e.target.checked })}
                      className="rounded border-slate-700 text-bio-500 focus:ring-bio-400 accent-bio-500 w-4 h-4"
                    />
                    <span>Auto-Read incoming AI responses aloud</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleTestVoice}
                    className="px-3 py-1.5 rounded-lg bg-bio-950 border border-bio-500/60 text-bio-300 hover:bg-bio-500 hover:text-slate-950 transition-all text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <Play className="w-3 h-3" />
                    <span>Test Voice</span>
                  </button>
                </div>
              </div>
            )}

            {/* Collapsible Supabase SQL schema help */}
            {showSqlModal && (
              <div className="p-3 bg-slate-950 border-b border-cyan-500/30 text-xs font-mono space-y-1.5 animate-in fade-in max-h-40 overflow-y-auto">
                <div className="flex items-center justify-between text-cyan-300 font-bold text-[10px]">
                  <span>Supabase Table Schema:</span>
                  <span className="text-slate-400">Run in SQL editor</span>
                </div>
                <pre className="p-2 rounded bg-slate-900 border border-slate-800 text-[9px] text-slate-300 overflow-x-auto">
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

            {/* Ready-Made Commands Section (Responsive, Collapsible, One-by-One) */}
            <div className="border-b border-slate-800/80 bg-[#070c17]">
              {/* Collapsible Header Toggle */}
              <button
                type="button"
                onClick={() => setShowQuickCommands(prev => !prev)}
                className="w-full px-3.5 sm:px-5 py-2 flex items-center justify-between text-[11px] font-mono hover:bg-slate-900/60 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5 text-bio-400 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-bio-400" />
                  <span>Ready-Made Commands</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-bio-950 border border-bio-500/50 text-bio-300">
                    {QUICK_QUESTIONS.length}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200">
                  <span>{showQuickCommands ? 'Hide Commands' : 'Show Commands'}</span>
                  {showQuickCommands ? (
                    <ChevronUp className="w-3.5 h-3.5 text-bio-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Collapsible Body: One-by-One Full-Width Directives */}
              {showQuickCommands && (
                <div className="px-3 sm:px-5 pb-2.5 pt-1 space-y-1.5 max-h-52 overflow-y-auto scrollbar-thin animate-in fade-in slide-in-from-top-1">
                  <p className="text-[10px] font-mono text-slate-500 px-1 hidden sm:block">
                    Select a directive to run analysis against current mission parameters:
                  </p>
                  <div className="flex flex-col gap-1.5 w-full">
                    {QUICK_QUESTIONS.map((q, idx) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => {
                          sendMessage(q);
                          setShowQuickCommands(false); // Auto-collapse so user immediately sees response
                        }}
                        disabled={isThinking}
                        className="w-full text-left p-2.5 rounded-xl border border-slate-800 bg-slate-900/90 hover:border-bio-400 hover:bg-slate-850 text-slate-200 hover:text-white transition-all text-xs font-mono flex items-center justify-between gap-2 shadow-sm group disabled:opacity-40 active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-bold text-bio-400 font-mono shrink-0 px-1.5 py-0.5 rounded bg-bio-950/80 border border-bio-500/40">
                            0{idx + 1}
                          </span>
                          <span className="truncate text-[11px] sm:text-xs text-slate-200 group-hover:text-bio-200">
                            {q}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 group-hover:text-bio-300 font-bold shrink-0 flex items-center gap-0.5">
                          Run ↗
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Chat Message Stream */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3 scrollbar-thin">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-bio-950 border border-bio-500/40 flex items-center justify-center text-bio-400 shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold font-display text-slate-200">
                    Martian Agronomy Advisor Ready
                  </h4>
                  <p className="text-[11px] font-mono max-w-sm text-slate-400">
                    Ask questions about crop nutrition, calorie deficit risk, ECLSS water recycling, or lighting power budgets.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'user' ? (
                      /* User Message Bubble */
                      <div className="max-w-[90%] sm:max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-none bg-gradient-to-r from-cyan-950/90 to-[#0c1c33] border border-cyan-500/40 text-cyan-100 shadow-md text-xs font-mono space-y-1.5">
                        <div className="flex items-center justify-between text-[9px] font-mono text-cyan-400 pb-1 border-b border-cyan-900/60">
                          <span className="font-bold tracking-wider">👤 COMMANDER DIRECTIVE</span>
                          <span className="text-slate-400">{msg.timestamp}</span>
                        </div>
                        <p className="text-slate-100 leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    ) : (
                      /* AI Response Terminal Card (Expert Design) */
                      <div className="w-full sm:max-w-[92%] p-3.5 sm:p-4 rounded-2xl rounded-tl-sm bg-[#091122] border border-slate-800 border-l-4 border-l-bio-400 shadow-xl space-y-2.5">
                        {/* Header telemetry bar */}
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pb-2 border-b border-slate-800/80 gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-bio-400 font-bold flex items-center gap-1 font-display tracking-wide">
                              🌱 FARMER AI
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-bio-950 border border-bio-500/40 text-bio-300 font-mono">
                              {msg.source === 'LIVE_LLM' ? '⚡ MiniMax M3' : '🌱 Analytical Matrix'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[9px]">
                            {/* Read Aloud Button */}
                            <button
                              type="button"
                              onClick={() => handleSpeakMessage(msg.id, msg.text)}
                              title={speakingMessageId === msg.id ? 'Stop speaking' : 'Read aloud with customized voice'}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all select-none ${
                                speakingMessageId === msg.id
                                  ? 'bg-bio-500 text-slate-950 font-bold animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                                  : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-bio-300 border border-slate-700'
                              }`}
                            >
                              {speakingMessageId === msg.id ? (
                                <>
                                  <Square className="w-2.5 h-2.5 fill-current" />
                                  <span>Stop</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-2.5 h-2.5 text-bio-400" />
                                  <span>Listen</span>
                                </>
                              )}
                            </button>

                            {/* Copy Button */}
                            <button
                              type="button"
                              onClick={() => handleCopy(msg.id, msg.text)}
                              title="Copy response report"
                              className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="w-2.5 h-2.5 text-bio-400" />
                                  <span className="text-bio-300">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-2.5 h-2.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>

                            <span className="text-slate-500 text-[9px]">{msg.timestamp}</span>
                          </div>
                        </div>

                        {/* Expert Structured AI Message Body */}
                        <div className="pt-0.5">
                          <AiResponseFormatter content={msg.text} />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}

              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-bio-500/40 rounded-2xl px-3.5 py-2 text-xs font-mono text-bio-300 flex items-center gap-2 shadow-lg">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-bio-400 shrink-0" />
                    <span className="text-[11px]">Analyzing telemetry & synthesizing advice...</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Chat Input Footer */}
            <form onSubmit={handleSubmit} className="p-2.5 sm:p-4 border-t border-slate-800 bg-[#0a101f] flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about crops, ECLSS water, solar deficits, or survival..."
                disabled={isThinking}
                className="flex-1 bg-slate-950 border border-slate-700 focus:border-bio-400 focus:ring-1 focus:ring-bio-400/50 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none transition-all"
              />
              <button
                type="submit"
                disabled={isThinking || !input.trim()}
                className="px-3.5 sm:px-4 py-2 rounded-xl bg-bio-500 hover:bg-bio-400 text-slate-950 font-bold text-xs font-mono transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-md shrink-0"
              >
                <span className="hidden sm:inline">Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
