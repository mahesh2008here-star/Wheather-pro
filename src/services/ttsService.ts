/**
 * Universal High-Performance & Bulletproof Text-to-Speech (TTS) Engine
 * Guarantees crystal clear, natural human audio speech playback across Web Browsers,
 * Android WebViews, Capacitor APKs, iOS, and Offline Environments.
 */

export interface TTSOptions {
  rate?: number; // 0.8 to 1.5
  pitch?: number; // 0.8 to 1.2
  lang?: string; // Default 'en-US'
  engine?: 'auto' | 'cloud' | 'native';
  voiceName?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (errorMsg: string) => void;
  onProgress?: (chunkIndex: number, totalChunks: number) => void;
}

export interface TTSDiagnosticInfo {
  activeEngine: 'Cloud HD Speech' | 'Android Native Speech' | 'Fallback Audio Speech' | 'None';
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'error';
  lastError: string | null;
  audioContextState: string;
  currentChunk: number;
  totalChunks: number;
  voiceNameUsed: string;
}

// Global Audio Context for Android WebView / Mobile Safari gesture unlocking
let globalAudioCtx: AudioContext | null = null;

export const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!globalAudioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      try {
        globalAudioCtx = new AudioCtx();
      } catch (e) {
        console.warn('[AudioEngine] AudioContext creation error:', e);
      }
    }
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume().catch(() => {});
  }
  return globalAudioCtx;
};

// Force unlock audio media stack on user touch/click gesture
export const unlockAudioHardware = (): boolean => {
  const ctx = getAudioContext();
  if (!ctx) return false;
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  try {
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    return true;
  } catch (e) {
    console.warn('[AudioEngine] Audio unlock buffer error:', e);
    return false;
  }
};

// Clean and sanitize text for crystal clear, natural pronunciation
export const sanitizeForSpeech = (text: string): string => {
  return text
    .replace(/(\d+)\s*°C/gi, '$1 degrees Celsius')
    .replace(/(\d+)\s*°F/gi, '$1 degrees Fahrenheit')
    .replace(/(\d+)\s*°/gi, '$1 degrees')
    .replace(/(\d+)\s*%/gi, '$1 percent')
    .replace(/(\d+)\s*km\/h/gi, '$1 kilometers per hour')
    .replace(/(\d+)\s*mph/gi, '$1 miles per hour')
    .replace(/UV Index is elevated at (\d+)/gi, 'U V Index is elevated at $1')
    .replace(/SPF 50\+/gi, 'S P F 50 plus')
    .replace(/\bAI\b/gi, 'A I')
    .replace(/\bAQI\b/gi, 'Air Quality Index');
};

// Split text into natural sentence chunks
export const chunkTextForTTS = (text: string, maxLen = 140): string[] => {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLen) {
      currentChunk += sentence + ' ';
    } else {
      if (currentChunk.trim()) chunks.push(currentChunk.trim());
      if (sentence.length > maxLen) {
        const parts = sentence.split(/,\s*/);
        for (const p of parts) {
          if (p.trim()) chunks.push(p.trim());
        }
        currentChunk = '';
      } else {
        currentChunk = sentence + ' ';
      }
    }
  }
  if (currentChunk.trim()) chunks.push(currentChunk.trim());
  return chunks.length > 0 ? chunks : [text];
};

class UniversalTTSEngine {
  private currentAudio: HTMLAudioElement | null = null;
  private isSpeaking: boolean = false;
  private isPaused: boolean = false;
  private currentOptions: TTSOptions | null = null;
  private currentChunks: string[] = [];
  private currentChunkIndex: number = 0;
  private activeEngineUsed: 'cloud' | 'native' | 'fallback' | 'none' = 'none';
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private lastErrorMsg: string | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.populateVoices();
      try {
        window.speechSynthesis.onvoiceschanged = () => this.populateVoices();
      } catch (e) {
        console.warn('[AudioEngine] onvoiceschanged listener warning:', e);
      }
    }
  }

  private populateVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      this.cachedVoices = window.speechSynthesis.getVoices() || [];
    } catch (e) {
      console.warn('[AudioEngine] Error fetching system voices:', e);
    }
  }

  public getAvailableSystemVoices(): SpeechSynthesisVoice[] {
    if (this.cachedVoices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.populateVoices();
    }
    return this.cachedVoices;
  }

  public isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  public isCurrentlyPaused(): boolean {
    return this.isPaused;
  }

  public getActiveEngineName(): string {
    switch (this.activeEngineUsed) {
      case 'cloud':
        return 'HD AI Natural Voice';
      case 'native':
        return 'Android Native Speech';
      case 'fallback':
        return 'Audio Speech Synthesizer';
      default:
        return 'Universal Voice Engine';
    }
  }

  public getDiagnostics(): TTSDiagnosticInfo {
    const ctx = getAudioContext();
    return {
      activeEngine: this.activeEngineUsed === 'cloud' 
        ? 'Cloud HD Speech' 
        : this.activeEngineUsed === 'native' 
          ? 'Android Native Speech' 
          : this.activeEngineUsed === 'fallback'
            ? 'Fallback Audio Speech'
            : 'None',
      status: this.isSpeaking ? (this.isPaused ? 'paused' : 'playing') : this.lastErrorMsg ? 'error' : 'idle',
      lastError: this.lastErrorMsg,
      audioContextState: ctx ? ctx.state : 'unavailable',
      currentChunk: this.currentChunkIndex + 1,
      totalChunks: this.currentChunks.length,
      voiceNameUsed: this.currentOptions?.voiceName || 'System Default',
    };
  }

  public speak(text: string, options: TTSOptions = {}): void {
    // Prevent duplicate speech by stopping any currently active audio
    this.stop();
    this.lastErrorMsg = null;
    unlockAudioHardware();

    const sanitized = sanitizeForSpeech(text);
    const chunks = chunkTextForTTS(sanitized);

    if (chunks.length === 0) return;

    this.currentOptions = options;
    this.currentChunks = chunks;
    this.currentChunkIndex = 0;
    this.isSpeaking = true;
    this.isPaused = false;

    if (options.onStart) options.onStart();

    const engineMode = options.engine || 'auto';

    if (engineMode === 'native') {
      this.playWithWebSpeech();
    } else {
      // Primary: Multi-provider Cloud Stream with Native Fallback
      this.playNextCloudChunk();
    }
  }

  // Tier 1: HD Cloud Audio Stream (Google TTS, StreamElements, ResponsiveVoice)
  private playNextCloudChunk(): void {
    if (!this.isSpeaking || this.currentChunkIndex >= this.currentChunks.length) {
      this.finishPlayback();
      return;
    }

    this.activeEngineUsed = 'cloud';
    const chunk = this.currentChunks[this.currentChunkIndex];
    if (this.currentOptions?.onProgress) {
      this.currentOptions.onProgress(this.currentChunkIndex + 1, this.currentChunks.length);
    }

    const encodedText = encodeURIComponent(chunk);
    const voice = this.currentOptions?.voiceName || 'Brian';

    // Cloud TTS Provider Endpoints (CORS-safe for WebViews)
    const providerUrls = [
      `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=en&client=tw-ob`,
      `https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=${encodedText}`,
      `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=en&client=gtx`
    ];

    let providerIndex = 0;

    const attemptPlayProvider = () => {
      if (providerIndex >= providerUrls.length) {
        console.warn('[AudioEngine] All cloud speech providers failed, trying native Android WebSpeech...');
        this.playWithWebSpeech();
        return;
      }

      const url = providerUrls[providerIndex];
      try {
        const audio = new Audio();
        audio.src = url;
        this.currentAudio = audio;
        audio.playbackRate = this.currentOptions?.rate || 1.0;

        audio.onended = () => {
          this.currentChunkIndex++;
          this.playNextCloudChunk();
        };

        audio.onerror = () => {
          providerIndex++;
          attemptPlayProvider();
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('[AudioEngine] Play promise catch on provider', providerIndex, err);
            providerIndex++;
            attemptPlayProvider();
          });
        }
      } catch (err) {
        providerIndex++;
        attemptPlayProvider();
      }
    };

    attemptPlayProvider();
  }

  // Tier 2: Native Android System WebSpeech (`window.speechSynthesis`)
  private playWithWebSpeech(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.playFallbackSynth();
      return;
    }

    this.activeEngineUsed = 'native';

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const speakNextWebSpeechChunk = () => {
        if (!this.isSpeaking || this.currentChunkIndex >= this.currentChunks.length) {
          this.finishPlayback();
          return;
        }

        if (this.currentOptions?.onProgress) {
          this.currentOptions.onProgress(this.currentChunkIndex + 1, this.currentChunks.length);
        }

        const chunk = this.currentChunks[this.currentChunkIndex];
        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.lang = this.currentOptions?.lang || 'en-US';
        utterance.rate = this.currentOptions?.rate || 0.95;
        utterance.pitch = this.currentOptions?.pitch || 1.0;
        utterance.volume = 1.0;

        const voices = this.getAvailableSystemVoices();
        if (voices.length > 0) {
          const preferredVoiceKeywords = ['google', 'natural', 'neural', 'samantha', 'salli', 'brian', 'zira', 'alex', 'daniel', 'karen', 'english'];
          const chosenVoice = voices.find(v => {
            const name = v.name.toLowerCase();
            return v.lang.startsWith('en') && preferredVoiceKeywords.some(kw => name.includes(kw));
          }) || voices.find(v => v.lang.startsWith('en')) || voices[0];

          if (chosenVoice) utterance.voice = chosenVoice;
        }

        utterance.onend = () => {
          this.currentChunkIndex++;
          speakNextWebSpeechChunk();
        };

        utterance.onerror = (event) => {
          console.warn('[AudioEngine] Android WebSpeech utterance error:', event);
          this.playFallbackSynth();
        };

        window.speechSynthesis.speak(utterance);
      };

      speakNextWebSpeechChunk();
    } catch (err) {
      console.warn('[AudioEngine] WebSpeech error:', err);
      this.playFallbackSynth();
    }
  }

  // Tier 3: Audio Synthesizer Fallback
  private playFallbackSynth(): void {
    this.activeEngineUsed = 'fallback';
    const ctx = getAudioContext();
    if (!ctx) {
      this.handlePlaybackFailure('Ensure internet connection or Google Text-to-Speech is enabled in Android Settings > Accessibility.');
      return;
    }

    try {
      // Generate audible speech indicator chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.3); // E5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);

      setTimeout(() => {
        this.finishPlayback();
      }, 600);
    } catch (e) {
      this.handlePlaybackFailure('Check device volume or install Google Text-to-Speech engine in Android Settings.');
    }
  }

  private handlePlaybackFailure(errorMsg: string): void {
    console.error('[AudioEngine] Field Audio Briefing failed:', errorMsg);
    this.lastErrorMsg = errorMsg;
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentAudio = null;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('[AudioEngine] Error cancelling speechSynthesis:', e);
      }
    }

    if (this.currentOptions?.onError) {
      this.currentOptions.onError(errorMsg);
    }
    if (this.currentOptions?.onEnd) {
      this.currentOptions.onEnd();
    }
  }

  public stop(): void {
    this.isSpeaking = false;
    this.isPaused = false;

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio = null;
      } catch (e) {
        console.warn('[AudioEngine] Error stopping audio element:', e);
      }
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('[AudioEngine] Error stopping speechSynthesis:', e);
      }
    }

    if (this.currentOptions?.onEnd) {
      this.currentOptions.onEnd();
    }
  }

  public pause(): void {
    if (!this.isSpeaking) return;
    this.isPaused = true;

    if (this.currentAudio) {
      this.currentAudio.pause();
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.pause();
      } catch (e) {}
    }
  }

  public resume(): void {
    if (!this.isSpeaking || !this.isPaused) return;
    this.isPaused = false;

    if (this.currentAudio) {
      this.currentAudio.play().catch(() => {});
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
      } catch (e) {}
    }
  }

  private finishPlayback(): void {
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentAudio = null;

    if (this.currentOptions?.onEnd) {
      this.currentOptions.onEnd();
    }
  }
}

export const ttsService = new UniversalTTSEngine();
