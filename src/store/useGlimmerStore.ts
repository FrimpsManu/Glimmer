import { create } from 'zustand';
import { StorySymbol, StoryScene, GeneratedStory, EmotionType, UserPreferences, SupportedLanguage, AICompanion } from '../types';
import { analyticsService } from '../services/analyticsService';

interface GlimmerStore {
  // Story composition state
  currentScene: StorySymbol[];
  allScenes: StoryScene[];
  selectedEmotion: EmotionType;
  
  // Generated stories
  currentStory: GeneratedStory | null;
  savedStories: GeneratedStory[];
  
  // UI state
  isGenerating: boolean;
  isPlaying: boolean;
  activeCategory: string;
  
  // User preferences
  preferences: UserPreferences;
  
  // AI Companion
  companion: AICompanion | null;
  
  // Collaboration state
  isCollaborating: boolean;
  collaborationSessionId: string | null;
  
  // Streaming state
  isStreaming: boolean;
  streamingContent: string;
  
  // Actions
  addSymbolToScene: (symbol: StorySymbol) => void;
  removeSymbolFromScene: (symbolId: string) => void;
  reorderSymbolsInScene: (startIndex: number, endIndex: number) => void;
  setSelectedEmotion: (emotion: EmotionType) => void;
  clearCurrentScene: () => void;
  
  // Story generation
  setIsGenerating: (loading: boolean) => void;
  setCurrentStory: (story: GeneratedStory | null) => void;
  addSavedStory: (story: GeneratedStory) => void;
  
  // Playback controls
  setIsPlaying: (playing: boolean) => void;
  
  // UI controls
  setActiveCategory: (category: string) => void;
  
  // Preferences
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  toggleTheme: () => void;
  setLanguage: (language: SupportedLanguage) => void;
  
  // Companion actions
  setCompanion: (companion: AICompanion | null) => void;
  
  // Collaboration actions
  setIsCollaborating: (collaborating: boolean) => void;
  setCollaborationSessionId: (sessionId: string | null) => void;
  
  // Streaming actions
  setIsStreaming: (streaming: boolean) => void;
  setStreamingContent: (content: string) => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'light',
  language: 'en',
  accessibility: {
    highContrast: false,
    largeText: false,
    screenReader: false,
    keyboardNavigation: true,
    reducedMotion: false,
  },
  voiceSettings: {
    speed: 1.0,
    pitch: 1.0,
    voice: 'female-child-friendly', // Default to female voice
    narratorVoice: 'child-friendly',
    characterVoices: true,
  },
  musicSettings: {
    enabled: false,
    volume: 0.3,
    fadeInOut: true,
    adaptToStory: true,
  },
  storyModes: ['adventure', 'bedtime', 'silly'],
  therapeuticMode: {
    enabled: false,
    focusAreas: [],
    intensityLevel: 'gentle',
    progressTracking: false,
  },
  visualMode: {
    enabled: false,
    artStyle: 'storybook',
    animationLevel: 'simple',
    characterConsistency: true,
  },
};

export const useGlimmerStore = create<GlimmerStore>((set, get) => ({
  // Initial state
  currentScene: [],
  allScenes: [],
  selectedEmotion: 'neutral',
  currentStory: null,
  savedStories: [],
  isGenerating: false,
  isPlaying: false,
  activeCategory: 'characters',
  preferences: defaultPreferences,
  companion: null,
  isCollaborating: false,
  collaborationSessionId: null,
  isStreaming: false,
  streamingContent: '',

  // Scene management actions
  addSymbolToScene: (symbol: StorySymbol) => set((state) => ({
    currentScene: [...state.currentScene, { ...symbol, id: `${symbol.id}-${Date.now()}` }]
  })),
  addSymbolToScene: (symbol: StorySymbol) => set((state) => {
    // Track symbol usage
    analyticsService.trackSymbolUsed(symbol);
    return {
      currentScene: [...state.currentScene, { ...symbol, id: `${symbol.id}-${Date.now()}` }]
    };
  }),

  removeSymbolFromScene: (symbolId: string) => set((state) => ({
    currentScene: state.currentScene.filter(symbol => symbol.id !== symbolId)
  })),

  reorderSymbolsInScene: (startIndex: number, endIndex: number) => set((state) => {
    const result = Array.from(state.currentScene);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return { currentScene: result };
  }),

  setSelectedEmotion: (emotion: EmotionType) => set({ selectedEmotion: emotion }),

  clearCurrentScene: () => set({ currentScene: [] }),

  // Story generation actions
  setIsGenerating: (isGenerating: boolean) => set({ isGenerating }),

  setCurrentStory: (story: GeneratedStory | null) => set({ currentStory: story }),

  addSavedStory: (story: GeneratedStory) => set((state) => ({
    savedStories: [story, ...state.savedStories]
  })),

  // Playback controls
  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),

  // UI controls
  setActiveCategory: (activeCategory: string) => set({ activeCategory }),

  // Preferences
  updatePreferences: (newPreferences: Partial<UserPreferences>) => set((state) => ({
    preferences: { ...state.preferences, ...newPreferences }
  })),

  toggleTheme: () => set((state) => ({
    preferences: {
      ...state.preferences,
      theme: state.preferences.theme === 'light' ? 'dark' : 'light'
    }
  })),

  setLanguage: (language: SupportedLanguage) => set((state) => ({
    preferences: {
      ...state.preferences,
      language
    }
  })),

  // Companion actions
  setCompanion: (companion: AICompanion | null) => set({ companion }),

  // Collaboration actions
  setIsCollaborating: (isCollaborating: boolean) => set({ isCollaborating }),
  
  setCollaborationSessionId: (collaborationSessionId: string | null) => set({ collaborationSessionId }),
  
  // Streaming actions
  setIsStreaming: (isStreaming: boolean) => set({ isStreaming }),
  
  setStreamingContent: (streamingContent: string) => set({ streamingContent }),
}));