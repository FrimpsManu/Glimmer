// Voice recognition service for hands-free symbol selection
import { StorySymbol } from '../types';
import { symbolLibrary } from '../data/symbols';

export class VoiceService {
  private static recognition: SpeechRecognition | null = null;
  private static isListening = false;
  private static onResultCallback: ((symbol: StorySymbol | null, command: string) => void) | null = null;

  /**
   * Initialize speech recognition
   */
  static initialize(): boolean {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return false;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      this.processVoiceCommand(transcript);
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    return true;
  }

  /**
   * Start listening for voice commands
   */
  static startListening(callback: (symbol: StorySymbol | null, command: string) => void): boolean {
    if (!this.recognition) {
      return false;
    }

    this.onResultCallback = callback;
    this.isListening = true;
    
    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      this.isListening = false;
      return false;
    }
  }

  /**
   * Stop listening
   */
  static stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Check if currently listening
   */
  static getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Process voice commands and find matching symbols
   */
  private static processVoiceCommand(transcript: string): void {
    console.log('Voice command:', transcript);

    // Handle special commands
    if (transcript.includes('clear') || transcript.includes('delete all')) {
      this.onResultCallback?.(null, 'clear');
      return;
    }

    if (transcript.includes('generate story') || transcript.includes('create story')) {
      this.onResultCallback?.(null, 'generate');
      return;
    }

    if (transcript.includes('play story') || transcript.includes('read story')) {
      this.onResultCallback?.(null, 'play');
      return;
    }

    // Find matching symbol
    const matchedSymbol = this.findMatchingSymbol(transcript);
    if (matchedSymbol) {
      this.onResultCallback?.(matchedSymbol, transcript);
    } else {
      // Try to find partial matches
      const partialMatch = this.findPartialMatch(transcript);
      if (partialMatch) {
        this.onResultCallback?.(partialMatch, transcript);
      } else {
        this.onResultCallback?.(null, `No match found for: ${transcript}`);
      }
    }
  }

  /**
   * Find exact symbol matches
   */
  private static findMatchingSymbol(transcript: string): StorySymbol | null {
    // Direct label matches
    const directMatch = symbolLibrary.find(symbol => 
      transcript.includes(symbol.label.toLowerCase())
    );
    if (directMatch) return directMatch;

    // Semantic meaning matches
    const semanticMatch = symbolLibrary.find(symbol => 
      symbol.semanticMeaning && transcript.includes(symbol.semanticMeaning.toLowerCase())
    );
    if (semanticMatch) return semanticMatch;

    // Common aliases
    const aliases: Record<string, string> = {
      'kid': 'Boy',
      'child': 'Girl',
      'house': 'Home',
      'tree': 'Forest',
      'puppy': 'Dog',
      'kitty': 'Cat',
      'bunny': 'Rabbit',
      'happy face': 'Happy',
      'sad face': 'Sad',
      'angry face': 'Angry',
      'scared face': 'Scared',
      'sun': 'Sun',
      'rain': 'Rain',
      'snow': 'Snow',
    };

    for (const [alias, label] of Object.entries(aliases)) {
      if (transcript.includes(alias)) {
        return symbolLibrary.find(s => s.label === label) || null;
      }
    }

    return null;
  }

  /**
   * Find partial matches for better UX
   */
  private static findPartialMatch(transcript: string): StorySymbol | null {
    // Category-based suggestions
    if (transcript.includes('character') || transcript.includes('person') || transcript.includes('people')) {
      return symbolLibrary.find(s => s.category === 'characters') || null;
    }
    
    if (transcript.includes('animal')) {
      return symbolLibrary.find(s => s.category === 'animals') || null;
    }
    
    if (transcript.includes('place') || transcript.includes('location')) {
      return symbolLibrary.find(s => s.category === 'places') || null;
    }
    
    if (transcript.includes('action') || transcript.includes('doing')) {
      return symbolLibrary.find(s => s.category === 'actions') || null;
    }
    
    if (transcript.includes('feeling') || transcript.includes('emotion')) {
      return symbolLibrary.find(s => s.category === 'emotions') || null;
    }

    return null;
  }
}