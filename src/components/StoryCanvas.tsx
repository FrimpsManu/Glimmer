import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Trash2, Sparkles } from 'lucide-react';
import { useGlimmerStore } from '../store/useGlimmerStore';
import { DraggableSymbol } from './DraggableSymbol';
import { EmotionSelector } from './EmotionSelector';
import { SmartSuggestions } from './SmartSuggestions';
import { StoryChallenges } from './StoryChallenges';
import { CustomSymbolDrawing } from './CustomSymbolDrawing';

export const StoryCanvas: React.FC = () => {
  const { 
    currentScene, 
    removeSymbolFromScene, 
    clearCurrentScene, 
    preferences,
    isStreaming 
  } = useGlimmerStore();

  const handleRemoveSymbol = (symbolId: string) => {
    removeSymbolFromScene(symbolId);
    
    // Provide feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
  };


  const handleClearAll = () => {
    clearCurrentScene();
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* Story Challenges */}
        <StoryChallenges />

        {/* Custom Symbol Drawing */}
        <CustomSymbolDrawing />

        {/* Canvas Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-6 h-6 text-bubblegum-500" />
            <h2 className={`font-bold text-gray-900 dark:text-white ${preferences.accessibility.largeText ? 'text-xl' : 'text-lg'}`}>
              Your Story Canvas
            </h2>
          </div>
          
          {currentScene.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={isStreaming}
              className={`
                flex items-center space-x-2 px-4 py-2 
                bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300
                hover:bg-red-200 dark:hover:bg-red-800
                rounded-lg transition-colors
                focus:outline-none focus:ring-2 focus:ring-red-500
                disabled:opacity-50 disabled:cursor-not-allowed
                ${preferences.accessibility.largeText ? 'text-lg px-6 py-3' : 'text-sm'}
              `}
              aria-label="Clear all symbols from canvas"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Story Canvas Area */}
        <div 
          className={`
            min-h-[240px] p-8 rounded-2xl border-2 border-dashed
            bg-gradient-to-br from-sky-50/50 via-white to-bubblegum-50/40
            dark:from-primary-900/20 dark:via-gray-900/50 dark:to-secondary-900/20
            border-sky-200/50 dark:border-primary-600/60
            transition-all duration-500 backdrop-blur-sm
            hover:border-bubblegum-300/60 dark:hover:border-primary-500/80
            hover:shadow-lg hover:shadow-bubblegum-200/15
            ${preferences.accessibility.highContrast 
              ? 'border-gray-900 dark:border-gray-100' 
              : ''
            }
          `}
          role="region"
          aria-label="Story composition area"
        >
          {currentScene.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-bubblegum-300 to-sky-300 rounded-full blur-xl opacity-25 animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-r from-bubblegum-100/80 to-sky-100/70 dark:from-primary-900 dark:to-secondary-900 rounded-full flex items-center justify-center shadow-lg border border-white/50">
                  <Sparkles className="w-10 h-10 text-bubblegum-500 animate-pulse-slow" />
                </div>
              </div>
              <h3 className={`font-bold bg-gradient-to-r from-bubblegum-500 to-sky-500 bg-clip-text text-transparent mb-3 ${preferences.accessibility.largeText ? 'text-2xl' : 'text-xl'}`}>
                Start Your Story!
              </h3>
              <p className={`text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
                Choose symbols from below to build your magical story. 
                <span className="font-semibold text-bubblegum-600 dark:text-primary-400">Click on characters, places, actions, and emotions</span> to add them here.
              </p>
              <div className="flex space-x-2 mt-4 opacity-60">
                <div className="w-2 h-2 bg-bubblegum-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-sunshine-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          ) : (
            // Symbol Display
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                {currentScene.map((symbol, index) => (
                  <DraggableSymbol
                    key={`${symbol.id}-${index}`}
                    symbol={symbol}
                    index={index}
                    onRemove={handleRemoveSymbol}
                  />
                ))}
              </div>
              
              {/* Smart Suggestions */}
              <SmartSuggestions currentSymbols={currentScene} />
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <EmotionSelector />
              </div>
            </div>
          )}
        </div>

        {/* Story Stats */}
        {currentScene.length > 0 && (
          <div className="bg-gradient-to-r from-white to-sky-50/30 dark:from-gray-800 dark:to-gray-700 rounded-xl p-5 border border-sky-200/30 dark:border-gray-700/50 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gradient-to-r from-bubblegum-400 to-sky-400 rounded-full shadow-sm"></div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Story Elements: <span className="text-bubblegum-600 dark:text-primary-400">{currentScene.length}</span>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Ready to generate:</span>
                <span className="text-lg">
                  {currentScene.length >= 2 ? '✨' : '⏳'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};