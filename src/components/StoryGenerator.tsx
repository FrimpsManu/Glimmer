import React, { useState } from 'react';
import { Wand2, Play, Pause, Download, RotateCcw } from 'lucide-react';
import { useGlimmerStore } from '../store/useGlimmerStore';
import { AnimatedStoryDisplay } from './AnimatedStoryDisplay';
import { StoryRemix } from './StoryRemix';
import { VoiceControl } from './VoiceControl';
import { CollaborationPanel } from './CollaborationPanel';
import { StreamingStoryDisplay } from './StreamingStoryDisplay';
import { QRCodeShare } from './QRCodeShare';
import { ARStoryViewer } from './ARStoryViewer';
import { PerformanceMode } from './PerformanceMode';
import { VisualStorybook } from './VisualStorybook';
import { TherapeuticDashboard } from './TherapeuticDashboard';
import { MusicControls } from './MusicControls';
import { PerformanceService } from '../services/performanceService';
import { VisualStoryService } from '../services/visualStoryService';
import { TherapeuticService } from '../services/therapeuticService';
import { StreamingAIService } from '../services/streamingAIService';
import { TextToSpeechService } from '../services/ttsService';
import { StorageService } from '../services/storageService';
import { getTranslation } from '../data/languages';

const getMoodGradient = (mood: string) => {
  // Add this helper function that was referenced but not defined
  switch (mood.toLowerCase()) {
    case 'happy':
      return 'from-yellow-400 to-orange-500';
    case 'sad':
      return 'from-blue-400 to-blue-600';
    case 'excited':
      return 'from-pink-400 to-red-500';
    case 'calm':
      return 'from-green-400 to-teal-500';
    default:
      return 'from-purple-400 to-indigo-500';
  }
};

export const StoryGenerator: React.FC = () => {
  const {
    currentScene,
    selectedEmotion,
    currentStory,
    isGenerating,
    isPlaying,
    isStreaming,
    streamingContent,
    setIsGenerating,
    setCurrentStory,
    setIsPlaying,
    setIsStreaming,
    setStreamingContent,
    addSavedStory,
    preferences,
  } = useGlimmerStore();
  
  const [showPerformanceMode, setShowPerformanceMode] = useState(false);
  const [showVisualStorybook, setShowVisualStorybook] = useState(false);
  const [showTherapeuticDashboard, setShowTherapeuticDashboard] = useState(false);
  const [currentPerformance, setCurrentPerformance] = useState(null);
  const [currentVisualStory, setCurrentVisualStory] = useState(null);
  const [currentTherapeuticData, setCurrentTherapeuticData] = useState(null);
  
  const t = (key: string) => getTranslation(preferences.language, key);

  const canGenerate = currentScene.length >= 2 && !isGenerating;

  const handleGenerateStory = async () => {
    if (!canGenerate) return;

    setIsStreaming(true);
    setStreamingContent('');
    
    try {
      await StreamingAIService.generateStreamingStory(
        currentScene,
        selectedEmotion,
        preferences.language,
        {
          onChunk: (chunk: string, fullContent: string) => {
            setStreamingContent(fullContent);
          },
          onComplete: async (story) => {
            setCurrentStory(story);
            setIsStreaming(false);
            
            // Save story
            await StorageService.saveStory(story);
            addSavedStory(story);
            
            // Generate audio
            try {
              const audioUrl = await TextToSpeechService.generateSpeech(story.content, selectedEmotion, preferences.language);
              const updatedStory = { ...story, audioUrl };
              setCurrentStory(updatedStory);
            } catch (audioError) {
              console.warn('Audio generation failed:', audioError);
            }
            
            // Announce completion for screen readers
            const announcement = `Story "${story.title}" has been generated and is ready to play`;
            const ariaLive = document.createElement('div');
            ariaLive.setAttribute('aria-live', 'polite');
            ariaLive.setAttribute('aria-atomic', 'true');
            ariaLive.className = 'sr-only';
            ariaLive.textContent = announcement;
            document.body.appendChild(ariaLive);
            setTimeout(() => document.body.removeChild(ariaLive), 2000);
          },
          onError: (error: string) => {
            setIsStreaming(false);
            console.error('Streaming story generation error:', error);
            
            // Show error message to user
            const errorDiv = document.createElement('div');
            errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
            errorDiv.textContent = error;
            document.body.appendChild(errorDiv);
            setTimeout(() => document.body.removeChild(errorDiv), 5000);
          }
        }
      );
      
    } catch (error) {
      console.error('Error generating story:', error);
      setIsStreaming(false);
      
      // Show error message to user
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      errorDiv.textContent = 'Sorry, there was an error creating your story. Please try again.';
      document.body.appendChild(errorDiv);
      setTimeout(() => document.body.removeChild(errorDiv), 5000);
    }
  };

  const handlePlayPause = async () => {
    if (!currentStory) return;

    if (isPlaying) {
      TextToSpeechService.stopAudio();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      
      if (currentStory.audioUrl) {
        await TextToSpeechService.playAudio(currentStory.audioUrl, () => {
          setIsPlaying(false);
        });
      } else {
        // Fallback to direct speech
        TextToSpeechService.speakText(currentStory.content, selectedEmotion, preferences.language, preferences.voiceSettings.voice);
        // Estimate duration and stop playing state
        setTimeout(() => {
          setIsPlaying(false);
        }, currentStory.content.length * 80); // Rough estimate: 80ms per character
      }
    }
  };

  const handleRegenerateStory = () => {
    if (currentStory && canGenerate) {
      setCurrentStory(null);
      setStreamingContent('');
      handleGenerateStory();
    }
  };

  const handleDownloadStory = () => {
    if (currentStory) {
      StorageService.exportStoryAsText(currentStory);
    }
  };

  const handleStartPerformance = () => {
    if (currentStory) {
      const performance = PerformanceService.createPerformance(currentStory, currentScene);
      setCurrentPerformance(performance);
      setShowPerformanceMode(true);
    }
  };

  const handleCreateVisualStory = async () => {
    if (currentStory) {
      try {
        const visualStory = await VisualStoryService.generateVisualStorybook(
          currentStory, 
          currentScene, 
          preferences.visualMode?.artStyle || 'storybook'
        );
        setCurrentVisualStory(visualStory);
        setShowVisualStorybook(true);
      } catch (error) {
        console.error('Error creating visual storybook:', error);
      }
    }
  };

  const handleOpenTherapeutic = () => {
    if (currentStory && preferences.therapeuticMode?.enabled) {
      const therapeuticData = TherapeuticService.createTherapeuticStory(
        currentStory,
        currentScene,
        preferences.therapeuticMode.focusAreas[0] || 'emotional-regulation'
      );
      setCurrentTherapeuticData(therapeuticData);
      setShowTherapeuticDashboard(true);
    }
  };

  const handleCancelGeneration = () => {
    StreamingAIService.cancelCurrentRequest();
    setIsStreaming(false);
    setStreamingContent('');
  };

  return (
    <div className="space-y-6">
      {/* Collaboration Panel */}
      <CollaborationPanel />
      
      {/* Voice Control */}
      <VoiceControl />

      {/* Music Controls */}
      <MusicControls story={currentStory || undefined} isStoryPlaying={isPlaying} />

      {/* Generation Button */}
      <div className="text-center">
        <button
          onClick={handleGenerateStory}
          disabled={!canGenerate || isStreaming}
          className={`
            relative inline-flex items-center space-x-4 px-10 py-5
            bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500
            hover:from-primary-600 hover:via-primary-700 hover:to-secondary-600
            disabled:from-gray-300 disabled:via-gray-400 disabled:to-gray-400
            text-white font-bold rounded-2xl shadow-xl
            transform transition-all duration-300
            hover:scale-105 active:scale-95 hover:shadow-2xl
            focus:outline-none focus:ring-4 focus:ring-primary-300/50
            disabled:cursor-not-allowed disabled:hover:scale-100
            overflow-hidden group
            ${preferences.accessibility.largeText ? 'text-xl px-10 py-5' : 'text-lg'}
            ${preferences.accessibility.reducedMotion ? 'transition-none hover:scale-100 active:scale-100' : ''}
            ${isStreaming ? 'animate-pulse' : ''}
          `}
          aria-label={isStreaming ? 'Generating story, please wait' : 'Generate story from your symbols'}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <Wand2 className={`${isStreaming ? 'animate-spin' : 'group-hover:rotate-12'} transition-transform duration-300 ${preferences.accessibility.largeText ? 'w-7 h-7' : 'w-6 h-6'}`} />
          <span className="relative z-10">
            {isStreaming ? t('creatingMagic') : t('generateStory')}
          </span>
          {!isStreaming && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-400 rounded-full animate-ping opacity-75"></div>
          )}
        </button>

        {!canGenerate && currentScene.length < 2 && (
          <p className={`mt-4 text-gray-600 dark:text-gray-400 font-medium ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
            {t('addMoreSymbols')}
          </p>
        )}
      </div>

      {/* Streaming Story Display */}
      {isStreaming && (
        <StreamingStoryDisplay
          content={streamingContent}
          isStreaming={isStreaming}
          onCancel={handleCancelGeneration}
        />
      )}

      {/* Story Display */}
      {currentStory && !isStreaming && (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          {/* Story Header */}
          <div className="bg-gradient-to-r from-primary-50/40 via-white to-secondary-50/30 dark:from-primary-900/30 dark:via-gray-800 dark:to-secondary-900/30 p-8 border-b border-neutral-200/30 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent ${preferences.accessibility.largeText ? 'text-3xl' : 'text-2xl'}`}>
                  {currentStory.title}
                </h3>
                <div className="flex items-center space-x-4 mt-3">
                  <span className={`text-gray-500 dark:text-gray-400 font-medium ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                    {currentStory.createdAt.toLocaleTimeString()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getMoodGradient(currentStory.mood)} text-white shadow-md`}>
                    {currentStory.mood}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRegenerateStory}
                  disabled={isStreaming}
                  className={`
                    p-3 rounded-xl bg-neutral-100/60 dark:bg-gray-700/80 backdrop-blur-sm
                    hover:bg-neutral-200/70 dark:hover:bg-gray-600 hover:scale-105
                    disabled:opacity-50 disabled:cursor-not-allowed
                    focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200
                    ${preferences.accessibility.largeText ? 'p-4' : ''}
                  `}
                  aria-label="Regenerate story"
                  title="Create a new version of this story"
                >
                  <RotateCcw className={`${preferences.accessibility.largeText ? 'w-5 h-5' : 'w-4 h-4'} ${isStreaming ? 'animate-spin' : ''}`} />
                </button>
                
                <button
                  onClick={handleDownloadStory}
                  className={`
                    p-3 rounded-xl bg-neutral-100/60 dark:bg-gray-700/80 backdrop-blur-sm
                    hover:bg-neutral-200/70 dark:hover:bg-gray-600 hover:scale-105
                    focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200
                    ${preferences.accessibility.largeText ? 'p-4' : ''}
                  `}
                  aria-label="Download story as text file"
                  title="Download story"
                >
                  <Download className={`${preferences.accessibility.largeText ? 'w-5 h-5' : 'w-4 h-4'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Story Content */}
          <div className="p-8">
            {/* Revolutionary Features Panel */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Performance Mode */}
              <button
                onClick={handleStartPerformance}
                className={`
                  p-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500
                  hover:from-purple-600 hover:to-pink-600
                  text-white font-semibold shadow-lg
                  transition-all duration-200 hover:scale-105
                  focus:outline-none focus:ring-2 focus:ring-purple-400
                  ${preferences.accessibility.largeText ? 'text-lg p-6' : 'text-base'}
                `}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">🎭</span>
                  <span>Performance Mode</span>
                </div>
                <p className="text-sm opacity-90">
                  Interactive theater with character voices
                </p>
              </button>

              {/* Visual Storybook */}
              <button
                onClick={handleCreateVisualStory}
                className={`
                  p-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500
                  hover:from-blue-600 hover:to-indigo-600
                  text-white font-semibold shadow-lg
                  transition-all duration-200 hover:scale-105
                  focus:outline-none focus:ring-2 focus:ring-blue-400
                  ${preferences.accessibility.largeText ? 'text-lg p-6' : 'text-base'}
                `}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">🎨</span>
                  <span>Visual Storybook</span>
                </div>
                <p className="text-sm opacity-90">
                  AI-generated illustrations & animations
                </p>
              </button>

              {/* Therapeutic Mode */}
              {preferences.therapeuticMode?.enabled && (
                <button
                  onClick={handleOpenTherapeutic}
                  className={`
                    p-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500
                    hover:from-green-600 hover:to-emerald-600
                    text-white font-semibold shadow-lg
                    transition-all duration-200 hover:scale-105
                    focus:outline-none focus:ring-2 focus:ring-green-400
                    ${preferences.accessibility.largeText ? 'text-lg p-6' : 'text-base'}
                  `}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">🧠</span>
                    <span>Therapeutic Mode</span>
                  </div>
                  <p className="text-sm opacity-90">
                    Guided emotional & social learning
                  </p>
                </button>
              )}
            </div>

            {/* Story Remix Option */}
            <div className="mb-8">
              <StoryRemix originalStory={currentStory} />
            </div>

            {/* AR Story Viewer */}
            <div className="mb-8">
              <ARStoryViewer story={currentStory} />
            </div>

            <AnimatedStoryDisplay
              story={currentStory.content}
              symbols={currentStory.scenes[0]?.symbols || []}
              isPlaying={isPlaying}
            />

            {/* QR Code Sharing */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className={`font-semibold text-gray-800 dark:text-gray-200 mb-4 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
                Share Your Story
              </h4>
              <QRCodeShare story={currentStory} />
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center space-x-6 mt-8">
              <button
                onClick={handlePlayPause}
                className={`
                  relative flex items-center space-x-3 px-8 py-4
                  bg-gradient-to-r from-secondary-500 to-secondary-600
                  hover:from-secondary-600 hover:to-secondary-700
                  text-white font-bold rounded-xl shadow-lg
                  transition-all duration-300 group overflow-hidden
                  focus:outline-none focus:ring-4 focus:ring-secondary-400/50
                  hover:scale-105 active:scale-95 hover:shadow-xl
                  ${preferences.accessibility.largeText ? 'px-10 py-5 text-lg' : 'text-base'}
                  ${isPlaying ? 'shadow-secondary-500/25' : ''}
                `}
                aria-label={isPlaying ? 'Pause story narration' : 'Play story narration'}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                {isPlaying ? (
                  <>
                    <Pause className="w-6 h-6 relative z-10" />
                    <span className="relative z-10">{t('pauseStory')}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 relative z-10" />
                    <span className="relative z-10">{t('playStory')}</span>
                  </>
                )}
                {isPlaying && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-400 rounded-full animate-ping opacity-75"></div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isStreaming && !streamingContent && (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-12">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-200 dark:border-primary-800"></div>
              <div className="absolute inset-0 inline-block animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-primary-500 border-r-secondary-500"></div>
            </div>
            <h3 className={`font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-3 ${preferences.accessibility.largeText ? 'text-2xl' : 'text-xl'}`}>
              {t('creatingMagic')}
            </h3>
            <p className={`text-gray-600 dark:text-gray-400 font-medium ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
              The AI is weaving together your symbols into a magical tale!
            </p>
            <button
              onClick={handleCancelGeneration}
              className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Cancel Generation
            </button>
            <div className="flex justify-center space-x-2 mt-6">
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-accent-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Mode Modal */}
      {showPerformanceMode && currentPerformance && (
        <PerformanceMode
          performance={currentPerformance}
          onClose={() => setShowPerformanceMode(false)}
        />
      )}

      {/* Visual Storybook Modal */}
      {showVisualStorybook && currentVisualStory && (
        <VisualStorybook
          visualStory={currentVisualStory}
          onClose={() => setShowVisualStorybook(false)}
        />
      )}

      {/* Therapeutic Dashboard Modal */}
      {showTherapeuticDashboard && currentTherapeuticData && (
        <TherapeuticDashboard
          therapeuticData={currentTherapeuticData}
          onClose={() => setShowTherapeuticDashboard(false)}
        />
      )}
    </div>
  );
};