import { GeneratedStory, StorySymbol, EmotionType } from '../types';

export interface AnalyticsData {
  totalStories: number;
  favoriteEmotions: Record<EmotionType, number>;
  symbolUsage: Record<string, number>;
  sessionDuration: number;
  creativityScore: number;
  engagementMetrics: {
    storiesPerSession: number;
    averageStoryLength: number;
    uniqueSymbolsUsed: number;
    collaborationTime: number;
  };
  learningProgress: {
    vocabularyGrowth: number;
    emotionalRange: number;
    narrativeComplexity: number;
  };
}

export class AnalyticsService {
  private sessionStart: number = Date.now();
  private events: Array<{
    type: string;
    timestamp: number;
    data: any;
  }> = [];

  /**
   * Track story creation
   */
  trackStoryCreated(story: GeneratedStory, symbols: StorySymbol[]) {
    this.events.push({
      type: 'story_created',
      timestamp: Date.now(),
      data: {
        storyId: story.id,
        mood: story.mood,
        symbolCount: symbols.length,
        wordCount: story.content.split(' ').length,
        categories: [...new Set(symbols.map(s => s.category))],
        uniqueSymbols: symbols.length,
      }
    });

    this.saveToStorage();
  }

  /**
   * Track symbol usage
   */
  trackSymbolUsed(symbol: StorySymbol) {
    this.events.push({
      type: 'symbol_used',
      timestamp: Date.now(),
      data: {
        symbolId: symbol.id,
        category: symbol.category,
        label: symbol.label,
      }
    });
  }

  /**
   * Track collaboration events
   */
  trackCollaboration(eventType: 'session_started' | 'user_joined' | 'user_left', data: any) {
    this.events.push({
      type: `collaboration_${eventType}`,
      timestamp: Date.now(),
      data
    });
  }

  /**
   * Calculate creativity score
   */
  calculateCreativityScore(): number {
    const stories = this.events.filter(e => e.type === 'story_created');
    if (stories.length === 0) return 0;

    const uniqueSymbols = new Set();
    const uniqueEmotions = new Set();
    const uniqueCategories = new Set();
    let totalComplexity = 0;

    stories.forEach(story => {
      story.data.categories.forEach((cat: string) => uniqueCategories.add(cat));
      uniqueEmotions.add(story.data.mood);
      totalComplexity += story.data.symbolCount * story.data.categories.length;
    });

    // Creativity score based on diversity and complexity
    const diversityScore = (uniqueCategories.size / 8) * 40; // Max 8 categories
    const emotionalRangeScore = (uniqueEmotions.size / 9) * 30; // Max 9 emotions
    const complexityScore = Math.min((totalComplexity / stories.length) / 20, 1) * 30;

    return Math.round(diversityScore + emotionalRangeScore + complexityScore);
  }

  /**
   * Generate comprehensive analytics
   */
  generateAnalytics(): AnalyticsData {
    const stories = this.events.filter(e => e.type === 'story_created');
    const symbols = this.events.filter(e => e.type === 'symbol_used');
    
    // Emotion frequency
    const emotionCounts: Record<string, number> = {};
    stories.forEach(story => {
      const mood = story.data.mood;
      emotionCounts[mood] = (emotionCounts[mood] || 0) + 1;
    });

    // Symbol usage
    const symbolUsage: Record<string, number> = {};
    symbols.forEach(symbol => {
      const label = symbol.data.label;
      symbolUsage[label] = (symbolUsage[label] || 0) + 1;
    });

    // Session metrics
    const sessionDuration = Date.now() - this.sessionStart;
    const avgStoryLength = stories.length > 0 
      ? stories.reduce((sum, s) => sum + s.data.wordCount, 0) / stories.length 
      : 0;

    return {
      totalStories: stories.length,
      favoriteEmotions: emotionCounts as Record<EmotionType, number>,
      symbolUsage,
      sessionDuration,
      creativityScore: this.calculateCreativityScore(),
      engagementMetrics: {
        storiesPerSession: stories.length,
        averageStoryLength: Math.round(avgStoryLength),
        uniqueSymbolsUsed: Object.keys(symbolUsage).length,
        collaborationTime: this.getCollaborationTime(),
      },
      learningProgress: {
        vocabularyGrowth: this.calculateVocabularyGrowth(),
        emotionalRange: Object.keys(emotionCounts).length,
        narrativeComplexity: this.calculateNarrativeComplexity(),
      }
    };
  }

  /**
   * Get collaboration time
   */
  private getCollaborationTime(): number {
    const collabEvents = this.events.filter(e => e.type.startsWith('collaboration_'));
    // Simple calculation - time between first and last collaboration event
    if (collabEvents.length < 2) return 0;
    return collabEvents[collabEvents.length - 1].timestamp - collabEvents[0].timestamp;
  }

  /**
   * Calculate vocabulary growth
   */
  private calculateVocabularyGrowth(): number {
    const symbols = this.events.filter(e => e.type === 'symbol_used');
    const uniqueSymbolsOverTime = new Set();
    let growth = 0;
    
    symbols.forEach(symbol => {
      if (!uniqueSymbolsOverTime.has(symbol.data.label)) {
        uniqueSymbolsOverTime.add(symbol.data.label);
        growth++;
      }
    });
    
    return growth;
  }

  /**
   * Calculate narrative complexity
   */
  private calculateNarrativeComplexity(): number {
    const stories = this.events.filter(e => e.type === 'story_created');
    if (stories.length === 0) return 0;
    
    const avgSymbolsPerStory = stories.reduce((sum, s) => sum + s.data.symbolCount, 0) / stories.length;
    const avgCategoriesPerStory = stories.reduce((sum, s) => sum + s.data.categories.length, 0) / stories.length;
    
    return Math.round((avgSymbolsPerStory * avgCategoriesPerStory) / 2);
  }

  /**
   * Save analytics to localStorage
   */
  private saveToStorage() {
    try {
      localStorage.setItem('glimmer-analytics', JSON.stringify(this.events));
    } catch (error) {
      console.warn('Failed to save analytics:', error);
    }
  }

  /**
   * Load analytics from localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('glimmer-analytics');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load analytics:', error);
    }
  }

  /**
   * Export analytics data
   */
  exportData(): string {
    const analytics = this.generateAnalytics();
    return JSON.stringify(analytics, null, 2);
  }
}

export const analyticsService = new AnalyticsService();