/**
 * Universal High-Performance Text-to-Speech (TTS) Service
 * Guarantees audio playback across Web Browsers, Android WebViews, Capacitor APKs, and iOS.
 */

export interface TTSOptions {
  rate?: number; // 0.8 to 1.5
  pitch?: number; // 0.8 to 1.2
  lang?: string; // Default 'en-US'
  engine?: 'auto' | 'cloud' | 'native'; // 'auto' tries Cloud Audio Stream first, then WebSpeech
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (errorMsg: string) => void;
  onProgress?: (chunkIndex: number, totalChunks: number) => void;
}

// Clean and sanitize text for crystal clear pronunciation
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

// Split text into natural chunks for optimal streaming and speech synthesis
export const chunkTextForTTS = (text: string, maxLen = 130): string[] => {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLen) {
      currentChunk += sentence + ' ';
    } else {
      if (currentChunk.trim()) chunks.push(currentChunk.trim());
      // Handle ultra-long sentences without punctuation
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
  private activeEngineUsed: 'cloud' | 'native' = 'cloud';

  public isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  public getActiveEngineName(): string {
    return this.activeEngineUsed === 'cloud' 
      ? 'HD Cloud Audio Stream' 
      : 'Native Device WebSpeech';
  }

  // Primary method to speak text
  public speak(text: string, options: TTSOptions = {}): void {
    this.stop(); // Stop any currently playing audio

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
      // Default auto strategy: try Cloud Stream first for guaranteed Android APK support
      this.playNextCloudChunk();
    }
  }

  // Strategy A: Cloud MP3 Stream via standard HTML5 Audio element
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
    const lang = this.currentOptions?.lang || 'en';
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${lang}&client=tw-ob`;

    try {
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;
      audio.playbackRate = this.currentOptions?.rate || 1.0;

      audio.onended = () => {
        this.currentChunkIndex++;
        this.playNextCloudChunk();
      };

      audio.onerror = (e) => {
        console.warn('Cloud Audio TTS error, falling back to WebSpeech native:', e);
        // Fallback to WebSpeech if network or URL is blocked
        this.playWithWebSpeech();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio play catch error, falling back to WebSpeech:', err);
          this.playWithWebSpeech();
        });
      }
    } catch (err) {
      console.warn('HTMLAudioElement creation error, falling back to WebSpeech:', err);
      this.playWithWebSpeech();
    }
  }

  // Strategy B: Web Speech API (window.speechSynthesis)
  private playWithWebSpeech(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (this.currentOptions?.onError) {
        this.currentOptions.onError('Text-to-speech is not supported on this device.');
      }
      this.finishPlayback();
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

        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          const preferredVoice = voices.find(v => v.lang.startsWith('en') && (
            v.name.includes('Google') || 
            v.name.includes('Natural') || 
            v.name.includes('Samantha') || 
            v.name.includes('Android') ||
            v.name.includes('English')
          )) || voices.find(v => v.lang.startsWith('en'));

          if (preferredVoice) utterance.voice = preferredVoice;
        }

        utterance.onend = () => {
          this.currentChunkIndex++;
          speakNextWebSpeechChunk();
        };

        utterance.onerror = (event) => {
          console.warn('WebSpeech chunk error:', event);
          this.currentChunkIndex++;
          if (this.currentChunkIndex < this.currentChunks.length) {
            speakNextWebSpeechChunk();
          } else {
            this.finishPlayback();
          }
        };

        window.speechSynthesis.speak(utterance);
      };

      speakNextWebSpeechChunk();
    } catch (err) {
      console.error('WebSpeech error:', err);
      if (this.currentOptions?.onError) {
        this.currentOptions.onError('Speech synthesis failed.');
      }
      this.finishPlayback();
    }
  }

  // Stop playback completely
  public stop(): void {
    this.isSpeaking = false;
    this.isPaused = false;

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
      this.currentAudio.play();
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
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
