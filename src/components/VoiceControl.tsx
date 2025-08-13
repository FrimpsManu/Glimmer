import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { VoiceService } from '../services/voiceService';
import { useGlimmerStore } from '../store/useGlimmerStore';
import { StorySymbol } from '../types';

export const VoiceControl: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  
  const { 
    addSymbolToScene, 
    clearCurrentScene, 
    preferences,
    currentScene,
    setIsGenerating,
    setCurrentStory,
    currentStory,
    setIsPlaying
  } = useGlimmerStore();

  useEffect(() => {
    const supported = VoiceService.initialize();
    setIsSupported(supported);
  }, []);

  const handleVoiceResult = (symbol: StorySymbol | null, command: string) => {
    setLastCommand(command);
    
    if (symbol) {
      addSymbolToScene(symbol);
      setFeedback(`Added ${symbol.label}!`);
      
      // Provide haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
    } else {
      // Handle special commands
      if (command === 'clear') {
        clearCurrentScene();
        setFeedback('Cleared all symbols!');
      } else if (command === 'generate') {
        if (currentScene.length >= 2) {
          setFeedback('Generating story...');
          // Trigger story generation
          document.querySelector('[aria-label*="Generate story"]')?.dispatchEvent(new Event('click'));
        } else {
          setFeedback('Add more symbols first!');
        }
      } else if (command === 'play') {
        if (currentStory) {
          setFeedback('Playing story...');
          document.querySelector('[aria-label*="Play story"]')?.dispatchEvent(new Event('click'));
        } else {
          setFeedback('Generate a story first!');
        }
      } else {
        setFeedback(command.startsWith('No match') ? 'Try saying a character, animal, or place!' : command);
      }
    }

    // Clear feedback after 3 seconds
    setTimeout(() => setFeedback(''), 3000);
  };

  const toggleListening = () => {
    if (isListening) {
      VoiceService.stopListening();
      setIsListening(false);
      setFeedback('Voice control stopped');
    } else {
      const started = VoiceService.startListening(handleVoiceResult);
      if (started) {
        setIsListening(true);
        setFeedback('Listening... Try saying "add a dog" or "add a princess"');
      } else {
        setFeedback('Could not start voice recognition');
      }
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Voice Control Button */}
      <div className="flex items-center justify-center">
        <button
          onClick={toggleListening}
          className={`
            relative flex items-center space-x-3 px-6 py-4
            rounded-2xl font-bold transition-all duration-300
            focus:outline-none focus:ring-4 focus:ring-purple-400/50
            hover:scale-105 active:scale-95 shadow-lg
            ${isListening 
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/25 animate-pulse' 
              : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
            }
            ${preferences.accessibility.largeText ? 'text-lg px-8 py-5' : 'text-base'}
          `}
          aria-label={isListening ? 'Stop voice control' : 'Start voice control'}
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5" />
              <span>Stop Listening</span>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-ping"></div>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span>Voice Control</span>
            </>
          )}
        </button>
      </div>

      {/* Voice Feedback */}
      {feedback && (
        <div className={`
          text-center p-4 rounded-xl
          bg-gradient-to-r from-purple-50 to-purple-100 
          dark:from-purple-900/20 dark:to-purple-800/20
          border border-purple-200 dark:border-purple-700
          animate-fade-in
        `}>
          <div className="flex items-center justify-center space-x-2">
            <Volume2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <p className={`text-purple-700 dark:text-purple-300 font-medium ${preferences.accessibility.largeText ? 'text-lg' : 'text-sm'}`}>
              {feedback}
            </p>
          </div>
        </div>
      )}

      {/* Voice Commands Help */}
      {isListening && (
        <div className={`
          bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4
          border border-gray-200/50 dark:border-gray-700/50 shadow-lg
          animate-fade-in
        `}>
          <h4 className={`font-semibold text-gray-800 dark:text-gray-200 mb-3 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
            Try saying:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="space-y-1">
              <p className="text-purple-600 dark:text-purple-400 font-medium">Add Symbols:</p>
              <p className="text-gray-600 dark:text-gray-400">"Add a dog"</p>
              <p className="text-gray-600 dark:text-gray-400">"Add a princess"</p>
              <p className="text-gray-600 dark:text-gray-400">"Add a castle"</p>
            </div>
            <div className="space-y-1">
              <p className="text-purple-600 dark:text-purple-400 font-medium">Commands:</p>
              <p className="text-gray-600 dark:text-gray-400">"Clear all"</p>
              <p className="text-gray-600 dark:text-gray-400">"Generate story"</p>
              <p className="text-gray-600 dark:text-gray-400">"Play story"</p>
            </div>
          </div>
        </div>
      )}

      {/* Last Command Display */}
      {lastCommand && !isListening && (
        <div className="text-center">
          <p className={`text-gray-500 dark:text-gray-400 italic ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
            Last heard: "{lastCommand}"
          </p>
        </div>
      )}
    </div>
  );
};