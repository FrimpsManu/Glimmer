import { StorySymbol, EmotionType, GeneratedStory, SupportedLanguage } from '../types';
import { getTranslation } from '../data/languages';

export interface StreamingResponse {
  content: string;
  isComplete: boolean;
  error?: string;
}

export interface StreamingCallbacks {
  onChunk: (chunk: string, fullContent: string) => void;
  onComplete: (story: GeneratedStory) => void;
  onError: (error: string) => void;
}

// OpenAI API configuration
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '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';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export class StreamingAIService {
  private static abortController: AbortController | null = null;

  /**
   * Generate story with streaming response
   */
  static async generateStreamingStory(
    symbols: StorySymbol[], 
    emotion: EmotionType, 
    language: SupportedLanguage = 'en',
    callbacks: StreamingCallbacks
  ): Promise<void> {
    // Cancel any existing request
    this.cancelCurrentRequest();
    
    this.abortController = new AbortController();
    
    try {
      const prompt = this.buildStoryPrompt(symbols, emotion, language);
      
      // Check if we should use mock streaming
      if (OPENAI_API_KEY === 'your-openai-api-key' || !OPENAI_API_KEY.startsWith('sk-')) {
        await this.generateMockStreamingStory(symbols, emotion, language, callbacks);
        return;
      }

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert children\'s storyteller specializing in inclusive, accessible stories for children who communicate through visual symbols.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 400,
          temperature: 0.8,
          frequency_penalty: 0.3,
          presence_penalty: 0.3,
          stream: true, // Enable streaming
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      await this.processStreamingResponse(response, symbols, emotion, callbacks);
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Story generation cancelled');
        return;
      }
      
      console.error('Streaming story generation error:', error);
      
      // Fallback to mock streaming
      try {
        await this.generateMockStreamingStory(symbols, emotion, language, callbacks);
      } catch (fallbackError) {
        callbacks.onError('Failed to generate story. Please try again.');
      }
    }
  }

  /**
   * Process streaming response from OpenAI
   */
  private static async processStreamingResponse(
    response: Response,
    symbols: StorySymbol[],
    emotion: EmotionType,
    callbacks: StreamingCallbacks
  ): Promise<void> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body reader available');
    }

    const decoder = new TextDecoder();
    let fullContent = '';
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              // Stream complete
              const story = this.createStoryObject(fullContent, symbols, emotion);
              callbacks.onComplete(story);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                fullContent += content;
                callbacks.onChunk(content, fullContent);
              }
            } catch (parseError) {
              // Skip invalid JSON lines
              continue;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Generate mock streaming story for development
   */
  private static async generateMockStreamingStory(
    symbols: StorySymbol[],
    emotion: EmotionType,
    language: SupportedLanguage,
    callbacks: StreamingCallbacks
  ): Promise<void> {
    const fullStory = this.generateMockStory(symbols, emotion, language);
    const words = fullStory.split(' ');
    let currentContent = '';

    // Simulate streaming by sending words one by one
    for (let i = 0; i < words.length; i++) {
      // Check if cancelled
      if (this.abortController?.signal.aborted) {
        return;
      }

      const word = words[i];
      currentContent += (i === 0 ? '' : ' ') + word;
      
      callbacks.onChunk(word + (i < words.length - 1 ? ' ' : ''), currentContent);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    }

    // Complete the story
    const story = this.createStoryObject(currentContent, symbols, emotion);
    callbacks.onComplete(story);
  }

  /**
   * Generate mock story content
   */
  private static generateMockStory(symbols: StorySymbol[], emotion: EmotionType, language: SupportedLanguage): string {
    const sceneData = this.interpretSymbols(symbols);
    
    const templates = {
      en: {
        happy: `Once upon a time, there was a wonderful adventure waiting to unfold! ${sceneData.characters ? `Our friend ${sceneData.characters.split(',')[0]}` : 'A cheerful child'} discovered something amazing today. ${sceneData.settings ? `In the beautiful ${sceneData.settings.split(',')[0]}` : 'In a magical place'}, they found ${sceneData.objects ? sceneData.objects.split(',')[0] : 'something special'}. With joy in their heart, they ${sceneData.actions ? sceneData.actions.split(',')[0] : 'started a wonderful journey'}. The sun was shining, birds were singing, and everything felt perfect. What a beautiful day for new discoveries and happy memories!`,
        calm: `In a peaceful, quiet place, everything was just right. ${sceneData.characters ? `A gentle ${sceneData.characters.split(',')[0]}` : 'A calm friend'} was enjoying a serene moment. ${sceneData.settings ? `The ${sceneData.settings.split(',')[0]}` : 'This special place'} was filled with soft, comfortable feelings. Slowly and peacefully, they ${sceneData.actions ? sceneData.actions.split(',')[0] : 'took time to rest'}. The world around them was quiet and safe, with gentle breezes and warm sunlight. It was the perfect time to breathe deeply, feel grateful, and enjoy the simple beauty of the moment.`,
        silly: `What a wonderfully silly day this was! ${sceneData.characters ? `Our funny friend ${sceneData.characters.split(',')[0]}` : 'A playful character'} was ready for some giggles! ${sceneData.settings ? `At the amusing ${sceneData.settings.split(',')[0]}` : 'In a funny place'}, something hilarious was about to happen. They decided to ${sceneData.actions ? sceneData.actions.split(',')[0] : 'do something silly'} in the most ridiculous way possible! Everyone started laughing and having the most wonderful time. Sometimes the silliest moments make the very best memories!`
      }
    };

    const languageTemplates = templates[language] || templates.en;
    return languageTemplates[emotion] || languageTemplates.happy;
  }

  /**
   * Interpret symbols into scene data
   */
  private static interpretSymbols(symbols: StorySymbol[]): any {
    const characters = symbols.filter(s => s.category === 'characters');
    const actions = symbols.filter(s => s.category === 'actions');
    const places = symbols.filter(s => s.category === 'places');
    const objects = symbols.filter(s => s.category === 'objects');
    const emotions = symbols.filter(s => s.category === 'emotions');
    
    return {
      characters: characters.map(c => c.semanticMeaning || c.label).join(', '),
      actions: actions.map(a => a.semanticMeaning || a.label).join(', '),
      settings: places.map(p => p.semanticMeaning || p.label).join(', '),
      objects: objects.map(o => o.semanticMeaning || o.label).join(', '),
      emotions: emotions.map(e => e.semanticMeaning || e.label).join(', '),
    };
  }

  /**
   * Build story prompt
   */
  private static buildStoryPrompt(symbols: StorySymbol[], emotion: EmotionType, language: SupportedLanguage): string {
    const sceneData = this.interpretSymbols(symbols);
    
    const languageInstructions = {
      en: "Write the story in English.",
      fr: "Écrivez l'histoire en français avec un vocabulaire simple et approprié pour les enfants.",
      es: "Escribe la historia en español con vocabulario simple y apropiado para niños.",
      de: "Schreibe die Geschichte auf Deutsch mit einfachem und kinderfreundlichem Wortschatz."
    };
    
    const emotionInstructions = {
      happy: "Create an uplifting, joyful story that celebrates friendship and positive experiences.",
      excited: "Write an energetic, adventurous story full of discovery and wonder.",
      calm: "Generate a peaceful, soothing story perfect for relaxation.",
      sad: "Write a gentle story that acknowledges difficult feelings but ends with comfort and hope.",
      angry: "Create a story that helps process frustration through problem-solving and understanding.",
      scared: "Write a story that transforms fear into courage and shows how to be brave.",
      surprised: "Generate an exciting story full of unexpected positive discoveries.",
      silly: "Create a playful, funny story full of humor and lighthearted moments.",
      neutral: "Write a balanced, engaging story appropriate for children."
    };

    return `You are a professional children's storyteller creating stories for nonverbal children who communicate through visual symbols.

STORY ELEMENTS PROVIDED:
- Characters: ${sceneData.characters || 'Create a child-friendly character'}
- Actions: ${sceneData.actions || 'Include age-appropriate activities'}
- Settings: ${sceneData.settings || 'Choose a safe, imaginative location'}  
- Objects: ${sceneData.objects || 'Include relevant story props'}
- Emotions: ${sceneData.emotions || 'Show emotional growth'}

MOOD: ${emotion.toUpperCase()}
INSTRUCTION: ${emotionInstructions[emotion]}
LANGUAGE: ${languageInstructions[language]}

REQUIREMENTS:
- Length: 150-250 words, perfect for 2-3 minutes of reading
- Age: Appropriate for ages 3-8
- Language: Simple, clear sentences with descriptive but not complex vocabulary
- Safety: Absolutely no scary, violent, or inappropriate content
- Structure: Clear beginning, middle, and satisfying end
- Engagement: Include sensory details (colors, sounds, textures)
- Emotional arc: Show character growth and positive resolution

Create a magical, heartwarming story that incorporates these elements naturally. Make it interactive by including moments where the child might imagine themselves in the story.

STORY:`;
  }

  /**
   * Create story object
   */
  private static createStoryObject(content: string, symbols: StorySymbol[], emotion: EmotionType): GeneratedStory {
    return {
      id: `story-${Date.now()}`,
      title: this.generateTitle(symbols, emotion),
      content: content.trim(),
      scenes: [{
        id: `scene-${Date.now()}`,
        symbols,
        emotion,
        order: 0,
      }],
      createdAt: new Date(),
      mood: emotion,
    };
  }

  /**
   * Generate story title
   */
  private static generateTitle(symbols: StorySymbol[], emotion: EmotionType): string {
    const characters = symbols.filter(s => s.category === 'characters');
    const places = symbols.filter(s => s.category === 'places');
    
    const characterName = characters.length > 0 ? characters[0].label : 'Friend';
    const placeName = places.length > 0 ? places[0].label : 'Adventure';
    
    const titleTemplates = {
      happy: `${characterName}'s Happy ${placeName}`,
      excited: `${characterName}'s Amazing Adventure`,
      calm: `${characterName}'s Peaceful Day`,
      sad: `${characterName} Finds Comfort`,
      silly: `${characterName}'s Silly Story`,
      scared: `${characterName} Becomes Brave`,
      surprised: `${characterName}'s Big Surprise`,
      angry: `${characterName} Learns to Share`,
      neutral: `${characterName}'s Story`,
    };

    return titleTemplates[emotion] || `${characterName}'s Adventure`;
  }

  /**
   * Cancel current streaming request
   */
  static cancelCurrentRequest(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Check if currently generating
   */
  static isGenerating(): boolean {
    return this.abortController !== null;
  }
}