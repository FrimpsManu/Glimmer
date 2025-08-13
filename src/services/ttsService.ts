import { EmotionType, SupportedLanguage } from '../types';

// ElevenLabs API configuration (placeholder - replace with real keys)
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || 'your-elevenlabs-api-key';
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

// Available voice options for users to choose from
export interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  age: 'child' | 'adult' | 'elderly';
  description: string;
  sampleText: string;
}

export const AVAILABLE_VOICES: VoiceOption[] = [
  {
    id: 'female-child-friendly',
    name: 'Emma (Child-Friendly Female)',
    gender: 'female',
    age: 'adult',
    description: 'Warm, nurturing female voice perfect for storytelling',
    sampleText: 'Hello! I love telling magical stories to wonderful children like you!'
  },
  {
    id: 'male-adventure',
    name: 'Oliver (Adventure Male)',
    gender: 'male', 
    age: 'adult',
    description: 'Energetic male voice great for adventure stories',
    sampleText: 'Ready for an amazing adventure? Let\'s explore magical worlds together!'
  },
  {
    id: 'female-gentle',
    name: 'Luna (Gentle Female)',
    gender: 'female',
    age: 'adult', 
    description: 'Soft, calming female voice ideal for bedtime stories',
    sampleText: 'Let me tell you a peaceful story to help you dream sweetly.'
  },
  {
    id: 'male-wise',
    name: 'Grandpa Joe (Wise Male)',
    gender: 'male',
    age: 'elderly',
    description: 'Wise, grandfatherly voice for meaningful tales',
    sampleText: 'Gather around, young ones, for I have a wonderful story to share.'
  },
  {
    id: 'female-playful',
    name: 'Zoe (Playful Female)',
    gender: 'female',
    age: 'adult',
    description: 'Fun, energetic female voice for silly stories',
    sampleText: 'Oh my goodness, this is going to be the silliest story ever!'
  },
  {
    id: 'male-calm',
    name: 'Sam (Calm Male)',
    gender: 'male',
    age: 'adult',
    description: 'Peaceful, steady male voice for relaxing stories',
    sampleText: 'Take a deep breath and let this calming story wash over you.'
  }
];
export class TextToSpeechService {
  private static audioContext: AudioContext | null = null;
  private static currentAudio: HTMLAudioElement | null = null;

  /**
   * Initialize Web Audio API context
   */
  private static getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  /**
   * Convert emotion to voice parameters
   */
  private static getVoiceSettings(emotion: EmotionType) {
    const settings = {
      happy: { stability: 0.3, similarity_boost: 0.8, style: 0.9, speed: 1.1 },
      excited: { stability: 0.2, similarity_boost: 0.9, style: 1.0, speed: 1.2 },
      calm: { stability: 0.8, similarity_boost: 0.6, style: 0.3, speed: 0.9 },
      sad: { stability: 0.9, similarity_boost: 0.7, style: 0.2, speed: 0.8 },
      angry: { stability: 0.4, similarity_boost: 0.8, style: 0.8, speed: 1.0 },
      scared: { stability: 0.6, similarity_boost: 0.7, style: 0.5, speed: 0.9 },
      surprised: { stability: 0.3, similarity_boost: 0.9, style: 0.9, speed: 1.15 },
      silly: { stability: 0.2, similarity_boost: 0.8, style: 1.0, speed: 1.3 },
      neutral: { stability: 0.5, similarity_boost: 0.7, style: 0.5, speed: 1.0 },
    };
    
    return settings[emotion] || settings.neutral;
  }

  /**
   * Generate speech using ElevenLabs API
   */
  static async generateSpeech(text: string, emotion: EmotionType = 'neutral', language: SupportedLanguage = 'en'): Promise<string> {
    try {
      // For development, use Web Speech API fallback
      if (ELEVENLABS_API_KEY === 'your-elevenlabs-api-key') {
        return this.generateSpeechFallback(text, emotion, language);
      }

      const voiceSettings = this.getVoiceSettings(emotion);
      
      const response = await fetch(`${ELEVENLABS_API_URL}/pNInz6obpgDQGcFmaJgB`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ELEVENLABS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: voiceSettings,
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
      
    } catch (error) {
      console.error('TTS generation error:', error);
      // Only attempt fallback if we haven't already tried it
      if (ELEVENLABS_API_KEY !== 'your-elevenlabs-api-key') {
        try {
          return await this.generateSpeechFallback(text, emotion, language);
        } catch (fallbackError) {
          console.error('TTS fallback also failed:', fallbackError);
          throw new Error('Both primary and fallback TTS methods failed');
        }
      } else {
        // Re-throw the original error if fallback was already attempted
        throw error;
      }
    }
  }

  /**
   * Fallback TTS using Web Speech API
   */
  private static generateSpeechFallback(text: string, emotion: EmotionType, language: SupportedLanguage = 'en'): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      try {
        // Create a temporary audio element to simulate file URL
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configure voice based on emotion
        const emotionSettings = this.getVoiceSettings(emotion);
        utterance.rate = emotionSettings.speed;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        // Set language
        const languageMap = {
          en: 'en-US',
          fr: 'fr-FR', 
          es: 'es-ES',
          de: 'de-DE'
        };
        utterance.lang = languageMap[language] || 'en-US';

        // Try to find a child-friendly voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice =>
          voice.lang.startsWith(languageMap[language]) &&
          (voice.name.toLowerCase().includes('female') || 
           voice.name.toLowerCase().includes('child'))
        ) || voices[0];
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        // For the interface compatibility, we'll resolve with a placeholder
        // In a real implementation, you'd need to record the audio or use a different approach
        utterance.onend = () => {
          resolve('web-speech-synthesis-placeholder');
        };

        utterance.onerror = (error) => {
          reject(error);
        };

        speechSynthesis.speak(utterance);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Play generated audio
   */
  static async playAudio(audioUrl: string, onEnd?: () => void): Promise<void> {
    try {
      // Stop any currently playing audio
      this.stopAudio();

      if (audioUrl === 'web-speech-synthesis-placeholder') {
        // For Web Speech API, we don't have a URL to play
        // The speech was already spoken in generateSpeechFallback
        if (onEnd) onEnd();
        return;
      }

      this.currentAudio = new Audio(audioUrl);
      
      this.currentAudio.addEventListener('ended', () => {
        if (onEnd) onEnd();
      });

      this.currentAudio.addEventListener('error', (error) => {
        console.error('Audio playback error:', error);
        if (onEnd) onEnd();
      });

      await this.currentAudio.play();
    } catch (error) {
      console.error('Audio play error:', error);
      if (onEnd) onEnd();
    }
  }

  /**
   * Stop currently playing audio
   */
  static stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    
    // Also stop speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }

  /**
   * Check if audio is currently playing
   */
  static isPlaying(): boolean {
    return this.currentAudio ? !this.currentAudio.paused : false;
  }

  /**
   * Speak text directly using Web Speech API (for immediate feedback)
   */
  static speakText(text: string, emotion: EmotionType = 'neutral', language: SupportedLanguage = 'en', selectedVoiceId?: string): void {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const emotionSettings = this.getVoiceSettings(emotion);
    
    utterance.rate = emotionSettings.speed;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Set language
    const languageMap = {
      en: 'en-US',
      fr: 'fr-FR',
      es: 'es-ES', 
      de: 'de-DE'
    };
    utterance.lang = languageMap[language] || 'en-US';

    // Find user-selected voice or appropriate fallback
    const voices = speechSynthesis.getVoices();
    
    let selectedVoice = null;
    
    if (selectedVoiceId) {
      const voiceOption = AVAILABLE_VOICES.find(v => v.id === selectedVoiceId);
      if (voiceOption) {
        // Try to find a matching system voice based on user selection
        selectedVoice = voices.find(voice =>
          voice.lang.startsWith(languageMap[language]) &&
          (
            (voiceOption.gender === 'female' && voice.name.toLowerCase().includes('female')) ||
            (voiceOption.gender === 'male' && voice.name.toLowerCase().includes('male')) ||
            voice.name.toLowerCase().includes(voiceOption.gender)
          )
        );
      }
    }
    
    // Fallback to appropriate voice if user selection not found
    if (!selectedVoice) {
      selectedVoice = voices.find(voice =>
        voice.lang.startsWith(languageMap[language]) &&
        (voice.name.toLowerCase().includes('female') ||
         voice.name.toLowerCase().includes('child'))
      ) || voices[0];
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    speechSynthesis.speak(utterance);
  }

  /**
   * Get available system voices filtered by language and preferences
   */
  static getAvailableSystemVoices(language: SupportedLanguage = 'en'): SpeechSynthesisVoice[] {
    if (!('speechSynthesis' in window)) {
      return [];
    }

    const languageMap = {
      en: 'en-US',
      fr: 'fr-FR',
      es: 'es-ES',
      de: 'de-DE'
    };

    const voices = speechSynthesis.getVoices();
    return voices.filter(voice => 
      voice.lang.startsWith(languageMap[language])
    );
  }

  /**
   * Play voice sample for selection
   */
  static playVoiceSample(voiceId: string, language: SupportedLanguage = 'en'): void {
    const voiceOption = AVAILABLE_VOICES.find(v => v.id === voiceId);
    if (voiceOption) {
      this.speakText(voiceOption.sampleText, 'neutral', language, voiceId);
    }
  }
}