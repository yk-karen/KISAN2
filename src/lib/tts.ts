// Multilingual Browser Text-to-Speech (SpeechSynthesis) Helper

const LANG_MAP: Record<string, string> = {
  ml: 'ml-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  en: 'en-IN',
};

let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
    };
  }
}

export function isTTSSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export function stopSpeech(): void {
  if (isTTSSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn('Error stopping speech:', e);
    }
  }
}

export function isSpeaking(): boolean {
  if (!isTTSSupported()) return false;
  return window.speechSynthesis.speaking || window.speechSynthesis.pending;
}

export interface SpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (errorMessage: string) => void;
}

export function speakText(
  text: string,
  appLanguage: string = 'en',
  options: SpeakOptions = {}
): void {
  if (!isTTSSupported()) {
    options.onError?.('Read aloud is not available on this device.');
    return;
  }

  // Cancel any ongoing speech to prevent overlapping utterances
  stopSpeech();

  if (!text || !text.trim()) {
    options.onEnd?.();
    return;
  }

  const targetLang = LANG_MAP[appLanguage] || (appLanguage.includes('-') ? appLanguage : `${appLanguage}-IN`);
  const utterance = new SpeechSynthesisUtterance(text.trim());
  utterance.lang = targetLang;

  // Voice Selection Strategy:
  // 1. Exact BCP-47 match (e.g. ml-IN, hi-IN, ta-IN, en-IN)
  // 2. Language prefix match (e.g. ml, hi, ta, en)
  // 3. Fall back to default system voice
  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  const langPrefix = targetLang.split('-')[0].toLowerCase();

  const exactMatch = voices.find(v => v.lang.toLowerCase() === targetLang.toLowerCase());
  const prefixMatch = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));

  if (exactMatch) {
    utterance.voice = exactMatch;
  } else if (prefixMatch) {
    utterance.voice = prefixMatch;
  }

  // Handle Chrome Chrome Android audio context requirements and completion events
  utterance.onstart = () => {
    options.onStart?.();
  };

  utterance.onend = () => {
    options.onEnd?.();
  };

  utterance.onerror = (event) => {
    // Canceled speech triggers an error event in some browsers; ignore canceled state
    if (event.error === 'canceled' || event.error === 'interrupted') {
      options.onEnd?.();
    } else {
      console.warn('SpeechSynthesis error:', event.error);
      options.onError?.('Read aloud encountered an error or was stopped.');
    }
  };

  try {
    window.speechSynthesis.speak(utterance);
  } catch (err: any) {
    console.warn('SpeechSynthesis invocation failed:', err);
    options.onError?.('Read aloud is not available on this device.');
  }
}
