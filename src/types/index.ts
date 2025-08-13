export interface StorySymbol {
  id: string;
  type: 'emoji' | 'icon' | 'custom';
  value: string;
  category: SymbolCategory;
  label: string;
  semanticMeaning?: string;
}

export type SymbolCategory = 
  | 'characters' 
  | 'actions' 
  | 'places' 
  | 'objects' 
  | 'emotions' 
  | 'weather' 
  | 'food'
  | 'animals';

export interface StoryScene {
  id: string;
  symbols: StorySymbol[];
  emotion?: EmotionType;
  order: number;
}

export interface GeneratedStory {
  id: string;
  title: string;
  content: string;
  scenes: StoryScene[];
  createdAt: Date;
  audioUrl?: string;
  mood: EmotionType;
}

export type EmotionType = 
  | 'happy' 
  | 'excited' 
  | 'calm' 
  | 'sad' 
  | 'angry' 
  | 'scared' 
  | 'surprised' 
  | 'silly'
  | 'neutral';

export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de';

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  flag: string;
  voice?: string;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  reducedMotion: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: SupportedLanguage;
  accessibility: AccessibilitySettings;
  voiceSettings: {
    speed: number;
    pitch: number;
    voice: string; // User-selected voice ID
    narratorVoice: NarratorVoice;
    characterVoices: boolean;
  };
  musicSettings: {
    enabled: boolean;
    volume: number;
    fadeInOut: boolean;
    adaptToStory: boolean;
  };
  storyModes: string[];
  companion?: AICompanion;
  therapeuticMode?: TherapeuticSettings;
  visualMode?: VisualStorySettings;
}

export type NarratorVoice = 'child-friendly' | 'wise-elder' | 'adventure-guide' | 'gentle-parent' | 'magical-fairy';

export interface TherapeuticSettings {
  enabled: boolean;
  focusAreas: TherapeuticFocus[];
  intensityLevel: 'gentle' | 'moderate' | 'focused';
  progressTracking: boolean;
}

export type TherapeuticFocus = 
  | 'emotional-regulation'
  | 'social-skills'
  | 'anxiety-management'
  | 'self-confidence'
  | 'communication'
  | 'trauma-processing';

export interface VisualStorySettings {
  enabled: boolean;
  artStyle: ArtStyle;
  animationLevel: 'none' | 'simple' | 'full';
  characterConsistency: boolean;
}

export type ArtStyle = 'cartoon' | 'watercolor' | 'realistic' | 'storybook' | 'minimalist';

export interface StoryPerformance {
  id: string;
  storyId: string;
  characters: PerformanceCharacter[];
  scenes: PerformanceScene[];
  interactiveElements: InteractiveElement[];
  createdAt: Date;
}

export interface PerformanceCharacter {
  id: string;
  name: string;
  voice: CharacterVoice;
  personality: string[];
  visualDescription: string;
  dialogueStyle: string;
}

export type CharacterVoice = 
  | 'child-hero'
  | 'wise-mentor'
  | 'friendly-animal'
  | 'magical-creature'
  | 'villain-reformed'
  | 'narrator-classic';

export interface PerformanceScene {
  id: string;
  order: number;
  setting: string;
  characters: string[];
  dialogue: DialogueLine[];
  interactivePrompts: string[];
  visualElements?: VisualElement[];
}

export interface DialogueLine {
  characterId: string;
  text: string;
  emotion: EmotionType;
  pauseAfter?: number;
  interactivePrompt?: string;
}

export interface InteractiveElement {
  id: string;
  type: 'choice' | 'voice-response' | 'action' | 'emotion-check';
  prompt: string;
  options?: string[];
  expectedResponse?: string;
  therapeuticValue?: TherapeuticFocus;
}

export interface VisualElement {
  id: string;
  type: 'character' | 'background' | 'object' | 'effect';
  description: string;
  style: ArtStyle;
  position?: { x: number; y: number };
  animation?: AnimationType;
}

export type AnimationType = 'fade-in' | 'slide-in' | 'bounce' | 'glow' | 'float' | 'none';

export interface TherapeuticStoryData {
  id: string;
  storyId: string;
  focusArea: TherapeuticFocus;
  objectives: string[];
  progressMarkers: ProgressMarker[];
  adaptiveElements: AdaptiveElement[];
  outcomes: TherapeuticOutcome[];
}

export interface ProgressMarker {
  id: string;
  description: string;
  achieved: boolean;
  timestamp?: Date;
  notes?: string;
}

export interface AdaptiveElement {
  trigger: string;
  adaptation: string;
  therapeuticReason: string;
}

export interface TherapeuticOutcome {
  session: Date;
  engagement: number; // 1-10
  emotionalResponse: EmotionType[];
  skillsDemonstrated: string[];
  notes: string;
}
export interface AICompanion {
  id: string;
  name: string;
  personality: CompanionPersonality;
  relationship: CompanionRelationship;
  memories: CompanionMemory[];
  preferences: CompanionPreferences;
  createdAt: Date;
  lastInteraction: Date;
}

export interface CompanionPersonality {
  traits: string[];
  voiceStyle: 'cheerful' | 'wise' | 'playful' | 'gentle' | 'adventurous';
  favoriteThemes: string[];
  catchphrases: string[];
}

export interface CompanionRelationship {
  trustLevel: number; // 0-100
  friendshipLevel: number; // 0-100
  sharedAdventures: number;
  favoriteMemories: string[];
}

export interface CompanionMemory {
  id: string;
  type: 'story' | 'preference' | 'emotion' | 'achievement';
  content: string;
  importance: number; // 0-10
  timestamp: Date;
  associatedStoryId?: string;
}

export interface CompanionPreferences {
  favoriteSymbols: string[];
  preferredEmotions: EmotionType[];
  dislikedElements: string[];
  learningGoals: string[];
}