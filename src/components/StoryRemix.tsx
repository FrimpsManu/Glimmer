import React, { useState } from 'react';
import { Shuffle, Sparkles, Wand2 } from 'lucide-react';
import { EmotionType, GeneratedStory } from '../types';
import { useGlimmerStore } from '../store/useGlimmerStore';
import { AIStoryService } from '../services/aiService';
import { TextToSpeechService } from '../services/ttsService';
import { StorageService } from '../services/storageService';

const REMIX_EMOTIONS: Array<{ type: EmotionType; emoji: string; label: string; description: string }> = [
  { type: 'silly', emoji: '🤪', label: 'Silly', description: 'Make it funny and playful' },
  { type: 'excited', emoji: '🤩', label: 'Exciting', description: 'Add adventure and energy' },
  { type: 'calm', emoji: '😌', label: 'Peaceful', description: 'Make it soothing and gentle' },
  { type: 'surprised', emoji: '😲', label: 'Surprising', description: 'Add unexpected twists' },
  { type: 'happy', emoji: '😊', label: 'Joyful', description: 'Fill it with happiness' },
];

interface StoryRemixProps {
  originalStory: GeneratedStory;
}

export const StoryRemix: React.FC<StoryRemixProps> = ({ originalStory }) => {
  const [isRemixing, setIsRemixing] = useState(false);
  const [selectedRemixEmotion, setSelectedRemixEmotion] = useState<EmotionType>('silly');
  
  const { 
    setCurrentStory, 
    addSavedStory, 
    preferences,
    setIsGenerating 
  } = useGlimmerStore();

  const handleRemixStory = async () => {
    if (isRemixing) return;

    setIsRemixing(true);
    setIsGenerating(true);

    try {
      // Use the same symbols but different emotion
      const originalSymbols = originalStory.scenes[0]?.symbols || [];
      const remixedStory = await AIStoryService.createStory(originalSymbols, selectedRemixEmotion);
      
      // Update title to indicate it's a remix
      const remixTitle = `${originalStory.title} (${selectedRemixEmotion} remix)`;
      const finalStory = { ...remixedStory, title: remixTitle };
      
      setCurrentStory(finalStory);
      
      // Save the remixed story
      await StorageService.saveStory(finalStory);
      addSavedStory(finalStory);
      
      // Generate new audio
      const audioUrl = await TextToSpeechService.generateSpeech(finalStory.content, selectedRemixEmotion);
      const updatedStory = { ...finalStory, audioUrl };
      setCurrentStory(updatedStory);
      
      // Provide feedback
      const announcement = `Story remixed with ${selectedRemixEmotion} emotion!`;
      const ariaLive = document.createElement('div');
      ariaLive.setAttribute('aria-live', 'polite');
      ariaLive.className = 'sr-only';
      ariaLive.textContent = announcement;
      document.body.appendChild(ariaLive);
      setTimeout(() => document.body.removeChild(ariaLive), 2000);
      
    } catch (error) {
      console.error('Error remixing story:', error);
      
      // Show error message
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      errorDiv.textContent = 'Sorry, there was an error remixing your story. Please try again.';
      document.body.appendChild(errorDiv);
      setTimeout(() => document.body.removeChild(errorDiv), 5000);
    } finally {
      setIsRemixing(false);
      setIsGenerating(false);
    }
  };

  return (
    <div className={`
      bg-gradient-to-r from-accent-50 to-orange-50 
      dark:from-accent-900/20 dark:to-orange-900/20 
      rounded-xl p-6 border border-accent-200 dark:border-accent-700
      shadow-lg backdrop-blur-sm
    `}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="relative">
          <Shuffle className="w-6 h-6 text-accent-500" />
          <Sparkles className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
        </div>
        <div>
          <h3 className={`font-bold text-accent-700 dark:text-accent-300 ${preferences.accessibility.largeText ? 'text-xl' : 'text-lg'}`}>
            Story Remix
          </h3>
          <p className={`text-accent-600 dark:text-accent-400 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
            Same symbols, completely different story!
          </p>
        </div>
      </div>

      {/* Emotion Selection */}
      <div className="space-y-4">
        <p className={`text-accent-700 dark:text-accent-300 font-medium ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
          Choose a new emotion for your story:
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {REMIX_EMOTIONS.map((emotion) => (
            <button
              key={emotion.type}
              onClick={() => setSelectedRemixEmotion(emotion.type)}
              disabled={isRemixing}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-accent-500
                disabled:opacity-50 disabled:cursor-not-allowed
                ${selectedRemixEmotion === emotion.type
                  ? 'bg-accent-100 dark:bg-accent-900/50 border-accent-400 dark:border-accent-500 scale-105 shadow-md'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-accent-300 dark:hover:border-accent-600 hover:scale-102'
                }
                ${preferences.accessibility.reducedMotion ? 'hover:scale-100 scale-100' : ''}
              `}
              aria-pressed={selectedRemixEmotion === emotion.type}
            >
              <div className="text-center">
                <div className={`${preferences.accessibility.largeText ? 'text-2xl' : 'text-xl'} mb-2`}>
                  {emotion.emoji}
                </div>
                <div className={`font-semibold text-gray-800 dark:text-gray-200 mb-1 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                  {emotion.label}
                </div>
                <div className={`text-gray-600 dark:text-gray-400 ${preferences.accessibility.largeText ? 'text-sm' : 'text-xs'}`}>
                  {emotion.description}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Remix Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={handleRemixStory}
            disabled={isRemixing}
            className={`
              relative flex items-center space-x-3 px-8 py-4
              bg-gradient-to-r from-accent-500 to-orange-500
              hover:from-accent-600 hover:to-orange-600
              disabled:from-gray-400 disabled:to-gray-500
              text-white font-bold rounded-xl shadow-lg
              transition-all duration-300 group overflow-hidden
              focus:outline-none focus:ring-4 focus:ring-accent-400/50
              hover:scale-105 active:scale-95 hover:shadow-xl
              disabled:cursor-not-allowed disabled:hover:scale-100
              ${preferences.accessibility.largeText ? 'text-lg px-10 py-5' : 'text-base'}
            `}
            aria-label={isRemixing ? 'Remixing story, please wait' : `Remix story with ${selectedRemixEmotion} emotion`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <Wand2 className={`${isRemixing ? 'animate-spin' : 'group-hover:rotate-12'} transition-transform duration-300 w-5 h-5`} />
            <span className="relative z-10">
              {isRemixing ? 'Remixing...' : 'Remix Story'}
            </span>
            {!isRemixing && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
            )}
          </button>
        </div>

        {/* Info Text */}
        <div className="text-center">
          <p className={`text-gray-600 dark:text-gray-400 italic ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
            Your symbols will stay the same, but the story will be completely different!
          </p>
        </div>
      </div>
    </div>
  );
};