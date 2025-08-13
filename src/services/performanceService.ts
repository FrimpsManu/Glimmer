import { StoryPerformance, PerformanceCharacter, PerformanceScene, DialogueLine, InteractiveElement, CharacterVoice, EmotionType, GeneratedStory, StorySymbol } from '../types';
import { TextToSpeechService } from './ttsService';
import { v4 as uuidv4 } from 'uuid';

export class PerformanceService {
  private static currentPerformance: StoryPerformance | null = null;
  private static isPerforming = false;
  private static currentSceneIndex = 0;
  private static currentDialogueIndex = 0;
  private static onPerformanceUpdate: ((data: any) => void) | null = null;

  /**
   * Character voice configurations
   */
  private static characterVoices: Record<CharacterVoice, { pitch: number; speed: number; style: string }> = {
    'child-hero': { pitch: 1.2, speed: 1.1, style: 'energetic and brave' },
    'wise-mentor': { pitch: 0.8, speed: 0.9, style: 'calm and knowing' },
    'friendly-animal': { pitch: 1.3, speed: 1.2, style: 'playful and warm' },
    'magical-creature': { pitch: 1.4, speed: 1.0, style: 'mystical and enchanting' },
    'villain-reformed': { pitch: 0.9, speed: 1.0, style: 'dramatic but kind' },
    'narrator-classic': { pitch: 1.0, speed: 1.0, style: 'storytelling and engaging' }
  };

  /**
   * Create interactive performance from story
   */
  static createPerformance(story: GeneratedStory, symbols: StorySymbol[]): StoryPerformance {
    const characters = this.extractCharacters(story, symbols);
    const scenes = this.createPerformanceScenes(story, characters);
    const interactiveElements = this.generateInteractiveElements(scenes);

    const performance: StoryPerformance = {
      id: uuidv4(),
      storyId: story.id,
      characters,
      scenes,
      interactiveElements,
      createdAt: new Date()
    };

    this.currentPerformance = performance;
    return performance;
  }

  /**
   * Extract characters from story and symbols
   */
  private static extractCharacters(story: GeneratedStory, symbols: StorySymbol[]): PerformanceCharacter[] {
    const characterSymbols = symbols.filter(s => s.category === 'characters' || s.category === 'animals');
    const characters: PerformanceCharacter[] = [];

    // Add main characters from symbols
    characterSymbols.forEach((symbol, index) => {
      const voiceTypes: CharacterVoice[] = ['child-hero', 'friendly-animal', 'wise-mentor', 'magical-creature'];
      characters.push({
        id: `char-${symbol.id}`,
        name: symbol.label,
        voice: voiceTypes[index % voiceTypes.length],
        personality: this.generatePersonality(symbol),
        visualDescription: `A ${symbol.semanticMeaning || symbol.label}`,
        dialogueStyle: this.generateDialogueStyle(symbol)
      });
    });

    // Add narrator if no characters
    if (characters.length === 0) {
      characters.push({
        id: 'narrator',
        name: 'Narrator',
        voice: 'narrator-classic',
        personality: ['wise', 'engaging', 'storytelling'],
        visualDescription: 'The story narrator',
        dialogueStyle: 'descriptive and engaging'
      });
    }

    return characters;
  }

  /**
   * Generate personality traits for character
   */
  private static generatePersonality(symbol: StorySymbol): string[] {
    const personalityMap: Record<string, string[]> = {
      'characters': ['brave', 'kind', 'curious', 'adventurous'],
      'animals': ['loyal', 'playful', 'wise', 'protective'],
      'default': ['friendly', 'helpful', 'positive', 'encouraging']
    };

    return personalityMap[symbol.category] || personalityMap.default;
  }

  /**
   * Generate dialogue style for character
   */
  private static generateDialogueStyle(symbol: StorySymbol): string {
    const styleMap: Record<string, string> = {
      'Girl': 'cheerful and confident',
      'Boy': 'enthusiastic and brave',
      'Princess': 'elegant and kind',
      'Dog': 'loyal and excited',
      'Cat': 'clever and independent',
      'Lion': 'noble and strong',
      'default': 'warm and friendly'
    };

    return styleMap[symbol.label] || styleMap.default;
  }

  /**
   * Create performance scenes with dialogue
   */
  private static createPerformanceScenes(story: GeneratedStory, characters: PerformanceCharacter[]): PerformanceScene[] {
    const sentences = story.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const scenes: PerformanceScene[] = [];
    
    // Group sentences into scenes (every 2-3 sentences)
    for (let i = 0; i < sentences.length; i += 3) {
      const sceneSentences = sentences.slice(i, i + 3);
      const dialogue = this.convertToDialogue(sceneSentences, characters);
      
      scenes.push({
        id: `scene-${i}`,
        order: Math.floor(i / 3),
        setting: this.extractSetting(sceneSentences.join('. ')),
        characters: characters.map(c => c.id),
        dialogue,
        interactivePrompts: this.generateScenePrompts(sceneSentences, characters)
      });
    }

    return scenes;
  }

  /**
   * Convert narrative text to character dialogue
   */
  private static convertToDialogue(sentences: string[], characters: PerformanceCharacter[]): DialogueLine[] {
    const dialogue: DialogueLine[] = [];
    
    sentences.forEach((sentence, index) => {
      const character = characters[index % characters.length];
      const isNarration = sentence.toLowerCase().includes('once upon') || 
                         sentence.toLowerCase().includes('there was') ||
                         sentence.toLowerCase().includes('and so');
      
      if (isNarration) {
        // Use narrator voice
        const narrator = characters.find(c => c.voice === 'narrator-classic') || characters[0];
        dialogue.push({
          characterId: narrator.id,
          text: sentence.trim(),
          emotion: 'neutral',
          pauseAfter: 1000
        });
      } else {
        // Convert to character speech
        const characterSpeech = this.convertToCharacterSpeech(sentence.trim(), character);
        dialogue.push({
          characterId: character.id,
          text: characterSpeech,
          emotion: this.detectEmotion(sentence),
          pauseAfter: 800,
          interactivePrompt: index === sentences.length - 1 ? 'What happens next?' : undefined
        });
      }
    });

    return dialogue;
  }

  /**
   * Convert narrative to character speech
   */
  private static convertToCharacterSpeech(text: string, character: PerformanceCharacter): string {
    // Simple conversion - make it more personal and direct
    let speech = text;
    
    // Replace third person with first person
    speech = speech.replace(/he |she |they /gi, 'I ');
    speech = speech.replace(/his |her |their /gi, 'my ');
    speech = speech.replace(/him |her |them /gi, 'me ');
    
    // Add character personality
    if (character.personality.includes('brave')) {
      speech = `${speech} I'm ready for this adventure!`;
    } else if (character.personality.includes('wise')) {
      speech = `${speech} This teaches us something important.`;
    } else if (character.personality.includes('playful')) {
      speech = `${speech} This is so much fun!`;
    }
    
    return speech;
  }

  /**
   * Detect emotion from text
   */
  private static detectEmotion(text: string): EmotionType {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('happy') || lowerText.includes('joy') || lowerText.includes('smile')) return 'happy';
    if (lowerText.includes('sad') || lowerText.includes('cry') || lowerText.includes('tear')) return 'sad';
    if (lowerText.includes('angry') || lowerText.includes('mad') || lowerText.includes('furious')) return 'angry';
    if (lowerText.includes('scared') || lowerText.includes('afraid') || lowerText.includes('frightened')) return 'scared';
    if (lowerText.includes('excited') || lowerText.includes('amazing') || lowerText.includes('wonderful')) return 'excited';
    if (lowerText.includes('surprised') || lowerText.includes('wow') || lowerText.includes('incredible')) return 'surprised';
    
    return 'neutral';
  }

  /**
   * Extract setting from text
   */
  private static extractSetting(text: string): string {
    const settings = ['forest', 'castle', 'home', 'school', 'beach', 'mountain', 'space', 'garden'];
    const lowerText = text.toLowerCase();
    
    for (const setting of settings) {
      if (lowerText.includes(setting)) {
        return setting;
      }
    }
    
    return 'magical place';
  }

  /**
   * Generate interactive prompts for scene
   */
  private static generateScenePrompts(sentences: string[], characters: PerformanceCharacter[]): string[] {
    const prompts = [
      `What do you think ${characters[0]?.name || 'our hero'} should do next?`,
      'How would you feel in this situation?',
      'What would you say to help?',
      'Can you make the sound this character would make?',
      'Show me how you would move like this character!'
    ];
    
    return [prompts[Math.floor(Math.random() * prompts.length)]];
  }

  /**
   * Generate interactive elements
   */
  private static generateInteractiveElements(scenes: PerformanceScene[]): InteractiveElement[] {
    const elements: InteractiveElement[] = [];
    
    scenes.forEach((scene, index) => {
      // Add choice element
      elements.push({
        id: `choice-${index}`,
        type: 'choice',
        prompt: 'What should happen next?',
        options: [
          'Continue the adventure',
          'Take a different path',
          'Meet a new friend'
        ]
      });
      
      // Add emotion check
      elements.push({
        id: `emotion-${index}`,
        type: 'emotion-check',
        prompt: 'How does this part make you feel?'
      });
    });
    
    return elements;
  }

  /**
   * Start performance mode
   */
  static async startPerformance(performance: StoryPerformance, callbacks: {
    onSceneStart?: (scene: PerformanceScene) => void;
    onDialogue?: (dialogue: DialogueLine, character: PerformanceCharacter) => void;
    onInteractive?: (element: InteractiveElement) => void;
    onComplete?: () => void;
  }): Promise<void> {
    this.isPerforming = true;
    this.currentSceneIndex = 0;
    this.currentDialogueIndex = 0;
    
    for (const scene of performance.scenes) {
      if (!this.isPerforming) break;
      
      callbacks.onSceneStart?.(scene);
      
      for (const dialogue of scene.dialogue) {
        if (!this.isPerforming) break;
        
        const character = performance.characters.find(c => c.id === dialogue.characterId);
        if (character) {
          callbacks.onDialogue?.(dialogue, character);
          await this.speakDialogue(dialogue, character);
          
          if (dialogue.interactivePrompt) {
            const interactiveElement: InteractiveElement = {
              id: `interactive-${Date.now()}`,
              type: 'voice-response',
              prompt: dialogue.interactivePrompt
            };
            callbacks.onInteractive?.(interactiveElement);
            await this.waitForInteraction();
          }
        }
      }
      
      // Scene interactive prompts
      for (const prompt of scene.interactivePrompts) {
        if (!this.isPerforming) break;
        
        const interactiveElement: InteractiveElement = {
          id: `prompt-${Date.now()}`,
          type: 'voice-response',
          prompt
        };
        callbacks.onInteractive?.(interactiveElement);
        await this.waitForInteraction();
      }
    }
    
    callbacks.onComplete?.();
    this.isPerforming = false;
  }

  /**
   * Speak dialogue with character voice
   */
  private static async speakDialogue(dialogue: DialogueLine, character: PerformanceCharacter): Promise<void> {
    const voiceConfig = this.characterVoices[character.voice];
    
    // Use TTS with character-specific settings
    TextToSpeechService.speakText(
      dialogue.text,
      dialogue.emotion,
      'en' // TODO: Use user's language preference
    );
    
    // Wait for speech duration + pause
    const estimatedDuration = dialogue.text.length * 80; // 80ms per character
    await new Promise(resolve => setTimeout(resolve, estimatedDuration + (dialogue.pauseAfter || 0)));
  }

  /**
   * Wait for user interaction
   */
  private static async waitForInteraction(): Promise<void> {
    return new Promise(resolve => {
      // Wait for 3 seconds or until user responds
      setTimeout(resolve, 3000);
    });
  }

  /**
   * Stop performance
   */
  static stopPerformance(): void {
    this.isPerforming = false;
    TextToSpeechService.stopAudio();
  }

  /**
   * Get current performance
   */
  static getCurrentPerformance(): StoryPerformance | null {
    return this.currentPerformance;
  }

  /**
   * Check if currently performing
   */
  static isCurrentlyPerforming(): boolean {
    return this.isPerforming;
  }

  /**
   * Get available character voices
   */
  static getAvailableVoices(): Array<{ id: CharacterVoice; name: string; description: string }> {
    return [
      { id: 'child-hero', name: 'Brave Hero', description: 'Energetic and courageous voice' },
      { id: 'wise-mentor', name: 'Wise Guide', description: 'Calm and knowing voice' },
      { id: 'friendly-animal', name: 'Animal Friend', description: 'Playful and warm voice' },
      { id: 'magical-creature', name: 'Magic Being', description: 'Mystical and enchanting voice' },
      { id: 'villain-reformed', name: 'Reformed Villain', description: 'Dramatic but kind voice' },
      { id: 'narrator-classic', name: 'Story Narrator', description: 'Classic storytelling voice' }
    ];
  }
}