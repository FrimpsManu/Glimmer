import { TherapeuticStoryData, TherapeuticFocus, ProgressMarker, AdaptiveElement, TherapeuticOutcome, GeneratedStory, StorySymbol, EmotionType } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class TherapeuticService {
  private static readonly STORAGE_KEY = 'glimmer-therapeutic-data';

  /**
   * Create therapeutic story adaptation
   */
  static createTherapeuticStory(
    story: GeneratedStory,
    symbols: StorySymbol[],
    focusArea: TherapeuticFocus
  ): TherapeuticStoryData {
    const objectives = this.generateObjectives(focusArea);
    const progressMarkers = this.createProgressMarkers(focusArea);
    const adaptiveElements = this.generateAdaptiveElements(story, focusArea);

    return {
      id: uuidv4(),
      storyId: story.id,
      focusArea,
      objectives,
      progressMarkers,
      adaptiveElements,
      outcomes: []
    };
  }

  /**
   * Generate therapeutic objectives based on focus area
   */
  private static generateObjectives(focusArea: TherapeuticFocus): string[] {
    const objectiveMap: Record<TherapeuticFocus, string[]> = {
      'emotional-regulation': [
        'Identify and name emotions in the story',
        'Practice coping strategies through character actions',
        'Recognize emotional triggers and responses',
        'Develop emotional vocabulary'
      ],
      'social-skills': [
        'Practice turn-taking in story dialogue',
        'Identify social cues and appropriate responses',
        'Explore friendship and cooperation themes',
        'Practice empathy through character perspectives'
      ],
      'anxiety-management': [
        'Identify worry thoughts in story scenarios',
        'Practice calming techniques with characters',
        'Build confidence through successful story outcomes',
        'Develop problem-solving strategies'
      ],
      'self-confidence': [
        'Celebrate character achievements and strengths',
        'Practice positive self-talk through dialogue',
        'Overcome challenges alongside story characters',
        'Recognize personal growth and progress'
      ],
      'communication': [
        'Practice expressing needs and wants clearly',
        'Use story symbols to communicate ideas',
        'Develop narrative and sequencing skills',
        'Expand vocabulary through story context'
      ],
      'trauma-processing': [
        'Create safe spaces for emotional expression',
        'Process difficult experiences through metaphor',
        'Build resilience through character strength',
        'Develop healthy coping mechanisms'
      ]
    };

    return objectiveMap[focusArea];
  }

  /**
   * Create progress markers for tracking
   */
  private static createProgressMarkers(focusArea: TherapeuticFocus): ProgressMarker[] {
    const markerMap: Record<TherapeuticFocus, string[]> = {
      'emotional-regulation': [
        'Child identifies emotions in story characters',
        'Child names their own emotions during story',
        'Child suggests coping strategies for characters',
        'Child demonstrates emotional vocabulary growth'
      ],
      'social-skills': [
        'Child engages in back-and-forth dialogue',
        'Child shows understanding of social situations',
        'Child demonstrates empathy for characters',
        'Child practices appropriate social responses'
      ],
      'anxiety-management': [
        'Child identifies worry situations in story',
        'Child practices calming techniques',
        'Child shows increased confidence in choices',
        'Child demonstrates problem-solving skills'
      ],
      'self-confidence': [
        'Child celebrates story achievements',
        'Child uses positive language about characters',
        'Child shows pride in story creation',
        'Child demonstrates increased self-advocacy'
      ],
      'communication': [
        'Child uses symbols to express complex ideas',
        'Child engages in extended storytelling',
        'Child asks questions about story elements',
        'Child demonstrates improved narrative skills'
      ],
      'trauma-processing': [
        'Child engages safely with story content',
        'Child expresses emotions through story',
        'Child shows resilience in story choices',
        'Child demonstrates healthy coping in narrative'
      ]
    };

    return markerMap[focusArea].map(description => ({
      id: uuidv4(),
      description,
      achieved: false
    }));
  }

  /**
   * Generate adaptive elements for therapeutic support
   */
  private static generateAdaptiveElements(story: GeneratedStory, focusArea: TherapeuticFocus): AdaptiveElement[] {
    const elements: AdaptiveElement[] = [];

    // Common adaptive elements
    elements.push({
      trigger: 'child shows distress',
      adaptation: 'Pause story and offer comfort, redirect to calming elements',
      therapeuticReason: 'Maintain emotional safety and regulation'
    });

    elements.push({
      trigger: 'child disengages',
      adaptation: 'Introduce more interactive elements or change story pace',
      therapeuticReason: 'Maintain engagement and therapeutic connection'
    });

    // Focus-specific adaptations
    switch (focusArea) {
      case 'emotional-regulation':
        elements.push({
          trigger: 'strong emotional response',
          adaptation: 'Pause to name and validate emotions, practice coping skills',
          therapeuticReason: 'Build emotional awareness and regulation skills'
        });
        break;

      case 'social-skills':
        elements.push({
          trigger: 'social situation in story',
          adaptation: 'Pause to discuss social cues and appropriate responses',
          therapeuticReason: 'Practice social understanding and skills'
        });
        break;

      case 'anxiety-management':
        elements.push({
          trigger: 'anxiety-provoking content',
          adaptation: 'Introduce calming character or positive resolution',
          therapeuticReason: 'Reduce anxiety and build coping strategies'
        });
        break;

      case 'trauma-processing':
        elements.push({
          trigger: 'trauma-related content',
          adaptation: 'Ensure safety, offer choice to continue or redirect',
          therapeuticReason: 'Maintain trauma-informed care principles'
        });
        break;
    }

    return elements;
  }

  /**
   * Record therapeutic outcome
   */
  static recordOutcome(
    therapeuticData: TherapeuticStoryData,
    engagement: number,
    emotionalResponse: EmotionType[],
    skillsDemonstrated: string[],
    notes: string
  ): TherapeuticStoryData {
    const outcome: TherapeuticOutcome = {
      session: new Date(),
      engagement,
      emotionalResponse,
      skillsDemonstrated,
      notes
    };

    const updatedData = {
      ...therapeuticData,
      outcomes: [...therapeuticData.outcomes, outcome]
    };

    this.saveTherapeuticData(updatedData);
    return updatedData;
  }

  /**
   * Update progress marker
   */
  static updateProgressMarker(
    therapeuticData: TherapeuticStoryData,
    markerId: string,
    achieved: boolean,
    notes?: string
  ): TherapeuticStoryData {
    const updatedMarkers = therapeuticData.progressMarkers.map(marker =>
      marker.id === markerId
        ? { ...marker, achieved, timestamp: new Date(), notes }
        : marker
    );

    const updatedData = {
      ...therapeuticData,
      progressMarkers: updatedMarkers
    };

    this.saveTherapeuticData(updatedData);
    return updatedData;
  }

  /**
   * Generate therapeutic story prompts
   */
  static generateTherapeuticPrompts(focusArea: TherapeuticFocus): string[] {
    const promptMap: Record<TherapeuticFocus, string[]> = {
      'emotional-regulation': [
        'How do you think the character is feeling right now?',
        'What could help the character feel better?',
        'Have you ever felt like this character?',
        'What would you tell the character about their feelings?'
      ],
      'social-skills': [
        'What should the character say to their friend?',
        'How can the characters work together?',
        'What would be a kind thing to do here?',
        'How do you think the other character feels?'
      ],
      'anxiety-management': [
        'What could help the character feel brave?',
        'What would you do if you were worried like this character?',
        'How can the character solve this problem?',
        'What makes you feel safe and calm?'
      ],
      'self-confidence': [
        'What is the character good at?',
        'How did the character show they were brave?',
        'What would you be proud of if you were this character?',
        'What makes this character special?'
      ],
      'communication': [
        'What is the character trying to say?',
        'How else could the character express this?',
        'What questions would you ask this character?',
        'How would you tell this part of the story?'
      ],
      'trauma-processing': [
        'The character is safe now. How do they feel?',
        'What helps the character feel strong?',
        'Who are the character\'s helpers and supporters?',
        'How does the character take care of themselves?'
      ]
    };

    return promptMap[focusArea];
  }

  /**
   * Get therapeutic insights from story session
   */
  static generateInsights(therapeuticData: TherapeuticStoryData): TherapeuticInsights {
    const recentOutcomes = therapeuticData.outcomes.slice(-5);
    const achievedMarkers = therapeuticData.progressMarkers.filter(m => m.achieved);
    
    const averageEngagement = recentOutcomes.length > 0
      ? recentOutcomes.reduce((sum, outcome) => sum + outcome.engagement, 0) / recentOutcomes.length
      : 0;

    const commonEmotions = this.getCommonEmotions(recentOutcomes);
    const skillsProgress = this.analyzeSkillsProgress(recentOutcomes);
    
    return {
      progressPercentage: (achievedMarkers.length / therapeuticData.progressMarkers.length) * 100,
      averageEngagement,
      commonEmotions,
      skillsProgress,
      recommendations: this.generateRecommendations(therapeuticData, averageEngagement),
      strengths: this.identifyStrengths(therapeuticData),
      areasForGrowth: this.identifyGrowthAreas(therapeuticData)
    };
  }

  /**
   * Get most common emotions from outcomes
   */
  private static getCommonEmotions(outcomes: TherapeuticOutcome[]): EmotionType[] {
    const emotionCounts: Record<string, number> = {};
    
    outcomes.forEach(outcome => {
      outcome.emotionalResponse.forEach(emotion => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });
    });

    return Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([emotion]) => emotion as EmotionType);
  }

  /**
   * Analyze skills progress
   */
  private static analyzeSkillsProgress(outcomes: TherapeuticOutcome[]): Record<string, number> {
    const skillCounts: Record<string, number> = {};
    
    outcomes.forEach(outcome => {
      outcome.skillsDemonstrated.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    return skillCounts;
  }

  /**
   * Generate therapeutic recommendations
   */
  private static generateRecommendations(
    therapeuticData: TherapeuticStoryData,
    averageEngagement: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (averageEngagement < 5) {
      recommendations.push('Consider shorter story sessions or more interactive elements');
      recommendations.push('Try incorporating the child\'s special interests into stories');
    }
    
    const unachievedMarkers = therapeuticData.progressMarkers.filter(m => !m.achieved);
    if (unachievedMarkers.length > 0) {
      recommendations.push(`Focus on: ${unachievedMarkers[0].description}`);
    }
    
    recommendations.push('Continue building on demonstrated strengths');
    recommendations.push('Celebrate progress and small victories');
    
    return recommendations;
  }

  /**
   * Identify strengths
   */
  private static identifyStrengths(therapeuticData: TherapeuticStoryData): string[] {
    const achievedMarkers = therapeuticData.progressMarkers.filter(m => m.achieved);
    return achievedMarkers.map(marker => marker.description);
  }

  /**
   * Identify growth areas
   */
  private static identifyGrowthAreas(therapeuticData: TherapeuticStoryData): string[] {
    const unachievedMarkers = therapeuticData.progressMarkers.filter(m => !m.achieved);
    return unachievedMarkers.slice(0, 3).map(marker => marker.description);
  }

  /**
   * Save therapeutic data to storage
   */
  private static saveTherapeuticData(data: TherapeuticStoryData): void {
    try {
      const existingData = this.loadAllTherapeuticData();
      const updatedData = existingData.filter(d => d.id !== data.id);
      updatedData.push(data);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error saving therapeutic data:', error);
    }
  }

  /**
   * Load all therapeutic data
   */
  static loadAllTherapeuticData(): TherapeuticStoryData[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading therapeutic data:', error);
      return [];
    }
  }

  /**
   * Get therapeutic focus areas
   */
  static getTherapeuticFocusAreas(): Array<{ id: TherapeuticFocus; name: string; description: string }> {
    return [
      { id: 'emotional-regulation', name: 'Emotional Regulation', description: 'Managing and expressing emotions healthily' },
      { id: 'social-skills', name: 'Social Skills', description: 'Building relationships and social understanding' },
      { id: 'anxiety-management', name: 'Anxiety Management', description: 'Coping with worry and building confidence' },
      { id: 'self-confidence', name: 'Self-Confidence', description: 'Building self-esteem and self-advocacy' },
      { id: 'communication', name: 'Communication', description: 'Expressing thoughts and needs effectively' },
      { id: 'trauma-processing', name: 'Trauma Processing', description: 'Healing and building resilience (with professional guidance)' }
    ];
  }
}

// Additional interface for therapeutic insights
export interface TherapeuticInsights {
  progressPercentage: number;
  averageEngagement: number;
  commonEmotions: EmotionType[];
  skillsProgress: Record<string, number>;
  recommendations: string[];
  strengths: string[];
  areasForGrowth: string[];
}