import React, { useEffect, useState } from 'react';
import { StorySymbol } from '../types';
import { useGlimmerStore } from '../store/useGlimmerStore';
import { EnhancedAnimations } from './EnhancedAnimations';

interface AnimatedStoryDisplayProps {
  story: string;
  symbols: StorySymbol[];
  isPlaying: boolean;
}

export const AnimatedStoryDisplay: React.FC<AnimatedStoryDisplayProps> = ({
  story,
  symbols,
  isPlaying
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [activeSymbolIndex, setActiveSymbolIndex] = useState(-1);
  const { preferences } = useGlimmerStore();
  
  const words = story.split(' ');
  const wordsPerSymbol = Math.ceil(words.length / Math.max(symbols.length, 1));

  useEffect(() => {
    if (!isPlaying) {
      setCurrentWordIndex(0);
      setActiveSymbolIndex(-1);
      return;
    }

    const interval = setInterval(() => {
      setCurrentWordIndex(prev => {
        const next = prev + 1;
        
        // Update active symbol based on story progress
        const symbolIndex = Math.floor(next / wordsPerSymbol);
        setActiveSymbolIndex(Math.min(symbolIndex, symbols.length - 1));
        
        if (next >= words.length) {
          clearInterval(interval);
          return words.length;
        }
        return next;
      });
    }, 400); // Adjust speed as needed

    return () => clearInterval(interval);
  }, [isPlaying, words.length, wordsPerSymbol, symbols.length]);

  return (
    <div className="relative space-y-6">
      {/* Enhanced Background Animations */}
      <EnhancedAnimations 
        symbols={symbols}
        isPlaying={isPlaying}
        currentWordIndex={currentWordIndex}
      />

      {/* Animated Symbols */}
      <div className="relative flex justify-center items-center space-x-4 py-8 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl overflow-hidden">
        {symbols.map((symbol, index) => (
          <div
            key={`${symbol.id}-${index}`}
            className={`
              relative transition-all duration-500 ease-out z-10
              ${activeSymbolIndex === index 
                ? 'scale-125 animate-bounce-gentle transform-gpu' 
                : activeSymbolIndex > index 
                  ? 'scale-110 opacity-80' 
                  : 'scale-100 opacity-60'
              }
              ${preferences.accessibility.reducedMotion ? 'transition-none animate-none' : ''}
            `}
          >
            {/* Symbol Container */}
            <div className={`
              p-4 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg backdrop-blur-sm
              ${activeSymbolIndex === index 
                ? 'ring-4 ring-primary-400 shadow-xl shadow-primary-500/25' 
                : ''
              }
            `}>
              <div className={`text-center ${preferences.accessibility.largeText ? 'text-4xl' : 'text-3xl'}`}>
                {symbol.value}
              </div>
            </div>
            
            {/* Sparkle Effect */}
            {activeSymbolIndex === index && !preferences.accessibility.reducedMotion && (
              <>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                <div className="absolute -top-1 -left-1 w-4 h-4 bg-pink-400 rounded-full animate-ping opacity-50" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-60" style={{animationDelay: '1s'}}></div>
              </>
            )}
            
            {/* Symbol Label */}
            <div className={`
              text-center mt-2 font-medium text-gray-700 dark:text-gray-300
              ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}
              ${activeSymbolIndex === index ? 'text-primary-600 dark:text-primary-400' : ''}
            `}>
              {symbol.label}
            </div>
          </div>
        ))}
      </div>

      {/* Animated Text */}
      <div className={`
        leading-relaxed text-gray-800 dark:text-gray-200
        ${preferences.accessibility.largeText ? 'text-xl leading-loose' : 'text-lg leading-8'}
      `}>
        {words.map((word, index) => (
          <span
            key={index}
            className={`
              transition-all duration-300
              ${index < currentWordIndex 
                ? 'text-gray-800 dark:text-gray-200' 
                : index === currentWordIndex 
                  ? 'text-primary-600 dark:text-primary-400 font-semibold bg-primary-100 dark:bg-primary-900/30 px-1 rounded' 
                  : 'text-gray-400 dark:text-gray-600'
              }
            `}
          >
            {word}{' '}
          </span>
        ))}
      </div>

      {/* Progress Bar */}
      {isPlaying && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentWordIndex / words.length) * 100}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};