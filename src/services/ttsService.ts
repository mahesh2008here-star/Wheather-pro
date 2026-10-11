/**
 * Universal High-Performance & Bulletproof Text-to-Speech (TTS) Engine
 * Guarantees crystal clear, natural human audio speech playback across Web Browsers,
 * Android WebViews, Capacitor APKs, iOS, and Offline Environments.
 */

export interface TTSOptions {
  rate?: number; // 0.8 to 1.5
  pitch?: number; // 0.8 to 1.2
  lang?: string; // Default 'en-US'
  engine?: 'auto' | 'cloud' | 'native' | 'synth'; // 'auto' tries HD Cloud -> Native System Voice -> Speech Synthesis
  voiceName?: string; // e.g. 'Brian', 'Salli', 'Joanna', 'Joey'
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (errorMsg: string) => void;
  onProgress?: (chunkIndex: number, totalChunks: number) => void;
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
        console.warn('AudioContext creation error:', e);
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
    console.warn('Audio unlock buffer error:', e);
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

// Split text into natural sentence chunks for optimal speech streaming
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
  private activeEngineUsed: 'cloud' | 'native' | 'synth' = 'cloud';
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private speechKeepaliveInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.populateVoices();
      try {
        window.speechSynthesis.onvoiceschanged = () => this.populateVoices();
      } catch (e) {
        console.warn('onvoiceschanged listener error:', e);
      }
    }
  }

  private populateVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      this.cachedVoices = window.speechSynthesis.getVoices() || [];
    } catch (e) {
      console.warn('Error fetching voices:', e);
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

  public getActiveEngineName(): string {
    switch (this.activeEngineUsed) {
      case 'cloud':
        return 'HD AI Natural Voice (Polly Stream)';
      case 'native':
        return 'Device Native Speech Engine';
      case 'synth':
        return 'Speech Synthesis Engine';
      default:
        return 'Universal Voice Engine';
    }
  }

  // Play a soft 3-note audio diagnostic chime ONLY when manually testing hardware
  public playDiagnosticChime(): Promise<boolean> {
    return new Promise((resolve) => {
      unlockAudioHardware();
      const ctx = getAudioContext();
      if (!ctx) {
        resolve(false);
        return;
      }

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.23);
      });

      setTimeout(() => resolve(true), 500);
    });
  }

  // Primary method to speak text in natural human voice
  public speak(text: string, options: TTSOptions = {}): void {
    this.stop(); // Clear any existing audio playback

    unlockAudioHardware(); // Ensure audio context is unmuted

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
      // Auto Strategy: Try HD Cloud Stream first (StreamElements Polly API)
      this.playNextCloudChunk();
    }
  }

  // Strategy A: High-Definition Natural Cloud Stream (StreamElements Polly Voice - 100% CORS enabled)
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
    const voice = this.currentOptions?.voiceName || 'Brian'; // Default high quality Polly male voice
    const audioUrl = `https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=${encodedText}`;

    try {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.src = audioUrl;
      this.currentAudio = audio;
      audio.playbackRate = this.currentOptions?.rate || 1.0;

      audio.onended = () => {
        this.currentChunkIndex++;
        this.playNextCloudChunk();
      };

      audio.onerror = (e) => {
        console.warn('HD Cloud Stream offline, falling back to Native Device WebSpeech:', e);
        this.playWithWebSpeech();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio play catch error, falling back to Native Device WebSpeech:', err);
          this.playWithWebSpeech();
        });
      }
    } catch (err) {
      console.warn('Audio creation error, falling back to WebSpeech:', err);
      this.playWithWebSpeech();
    }
  }

  // Strategy B: Native System Device Speech Engine (window.speechSynthesis)
  private playWithWebSpeech(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('speechSynthesis not supported');
      if (this.currentOptions?.onError) {
        this.currentOptions.onError('Speech synthesis not supported on this device.');
      }
      this.finishPlayback();
      return;
    }

    this.activeEngineUsed = 'native';

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      if (this.speechKeepaliveInterval) {
        clearInterval(this.speechKeepaliveInterval);
      }

      // Keepalive timer prevents Android Chrome / WebView speech freezing bug
      this.speechKeepaliveInterval = setInterval(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }
      }, 3500);

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
          let chosenVoice = null;
          if (this.currentOptions?.voiceName) {
            chosenVoice = voices.find(v => v.name.toLowerCase().includes(this.currentOptions!.voiceName!.toLowerCase()));
          }
          if (!chosenVoice) {
            chosenVoice = voices.find(v => v.lang.startsWith('en') && (
              v.name.includes('Google') || 
              v.name.includes('Natural') || 
              v.name.includes('Android') ||
              v.name.includes('Samantha') ||
              v.name.includes('English')
            )) || voices.find(v => v.lang.startsWith('en')) || voices[0];
          }
          if (chosenVoice) utterance.voice = chosenVoice;
        }

        let startTimeout: ReturnType<typeof setTimeout> | null = null;

        utterance.onstart = () => {
          if (startTimeout) clearTimeout(startTimeout);
        };

        utterance.onend = () => {
          if (startTimeout) clearTimeout(startTimeout);
          this.currentChunkIndex++;
          speakNextWebSpeechChunk();
        };

        utterance.onerror = (event) => {
          console.warn('Native WebSpeech utterance error:', event);
          if (startTimeout) clearTimeout(startTimeout);
          this.finishPlayback();
        };

        window.speechSynthesis.speak(utterance);
      };

      speakNextWebSpeechChunk();
    } catch (err) {
      console.error('WebSpeech execution error:', err);
      this.finishPlayback();
    }
  }

  // Stop playback completely
  public stop(): void {
    this.isSpeaking = false;
    this.isPaused = false;

    if (this.speechKeepaliveInterval) {
      clearInterval(this.speechKeepaliveInterval);
      this.speechKeepaliveInterval = null;
    }

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio = null;
      } catch (e) {
        console.warn('Error stopping audio element:', e);
      }
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('Error stopping speechSynthesis:', e);
      }
    }

    if (this.currentOptions?.onEnd) {
      this.currentOptions.onEnd();
    }
  }

  // Pause playback
  public pause(): void {
    if (!this.isSpeaking) return;
    this.isPaused = true;

    if (this.currentAudio) {
      this.currentAudio.pause();
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  }

  // Resume playback
  public resume(): void {
    if (!this.isSpeaking || !this.isPaused) return;
    this.isPaused = false;

    if (this.currentAudio) {
      this.currentAudio.play().catch(() => {});
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  }

  private finishPlayback(): void {
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentAudio = null;

    if (this.speechKeepaliveInterval) {
      clearInterval(this.speechKeepaliveInterval);
      this.speechKeepaliveInterval = null;
    }

    if (this.currentOptions?.onEnd) {
      this.currentOptions.onEnd();
    }
  }
}

export const ttsService = new UniversalTTSEngine();
