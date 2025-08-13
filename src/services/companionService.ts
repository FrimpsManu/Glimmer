import { AICompanion, CompanionMemory, CompanionPersonality, CompanionRelationship, StorySymbol, EmotionType, GeneratedStory } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class CompanionService {
  private static readonly STORAGE_KEY = 'glimmer-ai-companion';
  
  /**
   * Create a new AI companion
   */
  static createCompanion(childName?: string): AICompanion {
    const personalities = [
      {
        name: 'Spark',
        traits: ['curious', 'encouraging', 'imaginative', 'patient'],
        voiceStyle: 'cheerful' as const,
        favoriteThemes: ['adventure', 'friendship', 'discovery'],
        catchphrases: ['What an amazing idea!', 'I love how creative you are!', 'Let\'s make this story magical!']
      },
      {
        name: 'Luna',
        traits: ['wise', 'gentle', 'mystical', 'caring'],
        voiceStyle: 'gentle' as const,
        favoriteThemes: ['magic', 'nature', 'dreams'],
        catchphrases: ['The stars whisper wonderful stories', 'Your imagination shines bright', 'Every story is a gift']
      },
      {
        name: 'Zephyr',
        traits: ['adventurous', 'bold', 'funny', 'energetic'],
        voiceStyle: 'playful' as const,
        favoriteThemes: ['action', 'comedy', 'exploration'],
        catchphrases: ['Ready for an epic adventure?', 'That\'s totally awesome!', 'Let\'s make this story legendary!']
      }
    ];

    const selectedPersonality = personalities[Math.floor(Math.random() * personalities.length)];
    
    return {
      id: uuidv4(),
      name: selectedPersonality.name,
      personality: selectedPersonality,
      relationship: {
        trustLevel: 20,
        friendshipLevel: 15,
        sharedAdventures: 0,
        favoriteMemories: []
      },
      memories: [
        {
          id: uuidv4(),
          type: 'emotion',
          content: `I'm so excited to meet ${childName || 'you'}! I can't wait to create amazing stories together.`,
          importance: 8,
          timestamp: new Date()
        }
      ],
      preferences: {
        favoriteSymbols: [],
        preferredEmotions: ['happy', 'excited'],
        dislikedElements: [],
        learningGoals: []
      },
      createdAt: new Date(),
      lastInteraction: new Date()
    };
  }

  /**
   * Load companion from storage
   */
  static loadCompanion(): AICompanion | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;
      
      const companion = JSON.parse(stored);
      // Convert date strings back to Date objects
      companion.createdAt = new Date(companion.createdAt);
      companion.lastInteraction = new Date(companion.lastInteraction);
      companion.memories = companion.memories.map((memory: any) => ({
        ...memory,
        timestamp: new Date(memory.timestamp)
      }));
      
      return companion;
    } catch (error) {
      console.error('Error loading companion:', error);
      return null;
    }
  }

  /**
   * Save companion to storage
   */
  static saveCompanion(companion: AICompanion): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(companion));
    } catch (error) {
      console.error('Error saving companion:', error);
    }
  }

  /**
   * Add memory to companion
   */
  static addMemory(companion: AICompanion, memory: Omit<CompanionMemory, 'id' | 'timestamp'>): AICompanion {
    const newMemory: CompanionMemory = {
      ...memory,
      id: uuidv4(),
      timestamp: new Date()
    };

    const updatedCompanion = {
      ...companion,
      memories: [...companion.memories, newMemory].slice(-50), // Keep last 50 memories
      lastInteraction: new Date()
    };

    this.saveCompanion(updatedCompanion);
    return updatedCompanion;
  }

  /**
   * Update relationship based on interaction
   */
  static updateRelationship(companion: AICompanion, interactionType: 'story_created' | 'positive_feedback' | 'long_session'): AICompanion {
    const relationship = { ...companion.relationship };
    
    switch (interactionType) {
      case 'story_created':
        relationship.sharedAdventures += 1;
        relationship.friendshipLevel = Math.min(100, relationship.friendshipLevel + 2);
        relationship.trustLevel = Math.min(100, relationship.trustLevel + 1);
        break;
      case 'positive_feedback':
        relationship.friendshipLevel = Math.min(100, relationship.friendshipLevel + 5);
        relationship.trustLevel = Math.min(100, relationship.trustLevel + 3);
        break;
      case 'long_session':
        relationship.trustLevel = Math.min(100, relationship.trustLevel + 2);
        break;
    }

    const updatedCompanion = {
      ...companion,
      relationship,
      lastInteraction: new Date()
    };

    this.saveCompanion(updatedCompanion);
    return updatedCompanion;
  }

  /**
   * Generate personalized message based on context
   */
  static generatePersonalizedMessage(companion: AICompanion, context: {
    symbols?: StorySymbol[];
    emotion?: EmotionType;
    storyCount?: number;
    lastStory?: GeneratedStory;
  }): string {
    const { personality, relationship, memories } = companion;
    const recentMemories = memories.slice(-10);
    
    // Relationship-based greetings
    const greetings = this.getRelationshipBasedGreetings(companion, relationship.friendshipLevel);
    
    // Context-aware suggestions
    let message = greetings[Math.floor(Math.random() * greetings.length)];
    
    if (context.symbols && context.symbols.length > 0) {
      const symbolTypes = context.symbols.map(s => s.category);
      const uniqueTypes = [...new Set(symbolTypes)];
      
      if (uniqueTypes.includes('animals')) {
        message += ` I see you love animal adventures! ${personality.catchphrases[0]}`;
      } else if (uniqueTypes.includes('characters') && uniqueTypes.includes('places')) {
        message += ` What an exciting combination of characters and places! This story is going to be amazing!`;
      }
    }
    
    // Add memory-based context
    const storyMemories = recentMemories.filter(m => m.type === 'story');
    if (storyMemories.length > 0 && Math.random() > 0.7) {
      message += ` Remember our last adventure? ${storyMemories[storyMemories.length - 1].content}`;
    }
    
    return message;
  }

  /**
   * Get relationship-based greetings
   */
  private static getRelationshipBasedGreetings(companion: AICompanion, friendshipLevel: number): string[] {
    const { name, personality } = companion;
    
    if (friendshipLevel < 30) {
      return [
        `Hi there! I'm ${name}, your story companion. I'm excited to get to know you!`,
        `Hello! ${name} here, ready to create some magical stories together!`,
        `Welcome! I'm ${name}, and I can't wait to see what amazing stories we'll make!`
      ];
    } else if (friendshipLevel < 70) {
      return [
        `Hey friend! ${name} here, ready for another awesome story adventure!`,
        `Hi buddy! I've been thinking about what story we should create next!`,
        `Hello my creative friend! ${name} is here and excited to see you again!`
      ];
    } else {
      return [
        `My dear friend! ${name} missed you so much! Ready for an epic story?`,
        `Best buddy! I've been dreaming up amazing story ideas just for you!`,
        `My wonderful storytelling partner! ${name} is thrilled you're back!`
      ];
    }
  }

  /**
   * Generate story suggestions based on companion knowledge
   */
  static generateStorySuggestions(companion: AICompanion): string[] {
    const { preferences, memories, personality } = companion;
    const suggestions: string[] = [];
    
    // Based on favorite symbols
    if (preferences.favoriteSymbols.length > 0) {
      suggestions.push(`How about a story with ${preferences.favoriteSymbols[0]}? I remember you love those!`);
    }
    
    // Based on personality themes
    const theme = personality.favoriteThemes[Math.floor(Math.random() * personality.favoriteThemes.length)];
    suggestions.push(`I'm in the mood for a ${theme} story today! What do you think?`);
    
    // Based on recent memories
    const recentStoryMemories = memories
      .filter(m => m.type === 'story')
      .slice(-3);
    
    if (recentStoryMemories.length > 0) {
      suggestions.push(`Want to continue the adventure from our last story?`);
    }
    
    return suggestions.slice(0, 3);
  }

  /**
   * Process story completion and update companion
   */
  static processStoryCompletion(companion: AICompanion, story: GeneratedStory, symbols: StorySymbol[]): AICompanion {
    // Add story memory
    let updatedCompanion = this.addMemory(companion, {
      type: 'story',
      content: `We created "${story.title}" together with ${symbols.length} symbols. It was ${story.mood}!`,
      importance: 7,
      associatedStoryId: story.id
    });

    // Update preferences based on symbols used
    const symbolLabels = symbols.map(s => s.label);
    const updatedPreferences = {
      ...updatedCompanion.preferences,
      favoriteSymbols: this.updateFavoriteSymbols(updatedCompanion.preferences.favoriteSymbols, symbolLabels)
    };

    updatedCompanion = {
      ...updatedCompanion,
      preferences: updatedPreferences
    };

    // Update relationship
    updatedCompanion = this.updateRelationship(updatedCompanion, 'story_created');

    return updatedCompanion;
  }

  /**
   * Update favorite symbols based on usage
   */
  private static updateFavoriteSymbols(current: string[], used: string[]): string[] {
    const symbolCounts: Record<string, number> = {};
    
    // Count current favorites
    current.forEach(symbol => {
      symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
    });
    
    // Add newly used symbols
    used.forEach(symbol => {
      symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
    });
    
    // Return top 10 most used symbols
    return Object.entries(symbolCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([symbol]) => symbol);
  }

  /**
   * Get companion's reaction to specific symbols
   */
  static getSymbolReaction(companion: AICompanion, symbol: StorySymbol): string | null {
    const { personality, preferences } = companion;
    
    if (preferences.favoriteSymbols.includes(symbol.label)) {
      return `Oh, ${symbol.label}! That's one of my favorites! ${personality.catchphrases[0]}`;
    }
    
    if (symbol.category === 'animals' && personality.favoriteThemes.includes('nature')) {
      return `I love animals! ${symbol.label} will make our story so much more interesting!`;
    }
    
    if (symbol.category === 'emotions' && symbol.label.toLowerCase() === 'happy') {
      return `Happy stories are the best! This is going to be wonderful!`;
    }
    
    return null;
  }
}