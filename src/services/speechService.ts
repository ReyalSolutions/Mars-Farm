// Speech Synthesis Service for Farmer AI Voice Customization

export interface VoiceConfig {
  voiceURI: string;
  rate: number; // 0.6 to 1.8
  pitch: number; // 0.6 to 1.6
  volume: number; // 0.1 to 1.0
  autoSpeak: boolean; // Auto-speak incoming AI responses
}

const DEFAULT_CONFIG: VoiceConfig = {
  voiceURI: '',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  autoSpeak: false
};

const STORAGE_KEY = 'mars_farmer_ai_voice_v1';

export function getSavedVoiceConfig(): VoiceConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_CONFIG;
}

export function saveVoiceConfig(config: VoiceConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {}
}

export function getBrowserVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  const allVoices = window.speechSynthesis.getVoices();
  // Filter for English voices first, fallback to all if none
  const englishVoices = allVoices.filter(v => v.lang.startsWith('en'));
  return englishVoices.length > 0 ? englishVoices : allVoices;
}

// Clean markdown text (strip **, #, bullet dashes, emojis) for natural voice reading
export function cleanTextForSpeech(rawText: string): string {
  return rawText
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold **text** -> text
    .replace(/\*(.*?)\*/g, '$1')     // Italic *text* -> text
    .replace(/^#+\s+/gm, '')         // Headers #
    .replace(/^[-*•]\s+/gm, '')      // Bullets
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links [text](url) -> text
    .replace(/[`_~]/g, '')           // Code ticks, underscores
    // Strip common emojis that speech engines pronounce awkwardly
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

export function speakText(
  text: string,
  config: VoiceConfig,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  // Cancel any ongoing speech
  stopSpeech();

  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) return false;

  const utterance = new SpeechSynthesisUtterance(cleaned);
  utterance.rate = Math.max(0.6, Math.min(1.8, config.rate));
  utterance.pitch = Math.max(0.6, Math.min(1.6, config.pitch));
  utterance.volume = Math.max(0.1, Math.min(1.0, config.volume));

  // Match selected voice by URI
  const voices = window.speechSynthesis.getVoices();
  if (config.voiceURI) {
    const matched = voices.find(v => v.voiceURI === config.voiceURI);
    if (matched) {
      utterance.voice = matched;
    }
  } else {
    // Default to natural English voice if available
    const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Guy')));
    if (preferred) {
      utterance.voice = preferred;
    }
  }

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    activeUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    activeUtterance = null;
    if (onError) onError(e);
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
}

export function isSpeaking(): boolean {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}
