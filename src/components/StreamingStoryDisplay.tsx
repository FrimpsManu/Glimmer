import React, { useState, useEffect } from 'react';
import { Pause, Square } from 'lucide-react';
import { useGlimmerStore } from '../store/useGlimmerStore';

interface StreamingStoryDisplayProps {
  content: string;
  isStreaming: boolean;
  onCancel: () => void;
}

export const StreamingStoryDisplay: React.FC<StreamingStoryDisplayProps> = ({
  content,
  isStreaming,
  onCancel
}) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const { preferences } = useGlimmerStore();

  const words = content.split(' ');

  useEffect(() => {
    setDisplayedContent(content);
    setCurrentWordIndex(words.length);
  }, [content]);

  // Typing animation effect
  useEffect(() => {
    if (!isStreaming) return;

    const timer = setInterval(() => {
      setCurrentWordIndex(prev => {
        if (prev >= words.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isStreaming, words.length]);

  const displayWords = words.slice(0, currentWordIndex);

  return (
    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50/40 via-white to-secondary-50/30 dark:from-primary-900/30 dark:via-gray-800 dark:to-secondary-900/30 p-6 border-b border-gray-200/30 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full animate-ping opacity-75"></div>
            </div>
            <h3 className={`font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent ${preferences.accessibility.largeText ? 'text-xl' : 'text-lg'}`}>
              {isStreaming ? 'Creating Your Story...' : 'Story Complete!'}
            </h3>
          </div>
          
          {isStreaming && (
            <button
              onClick={onCancel}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-xl
                bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300
                hover:bg-red-200 dark:hover:bg-red-800
                transition-all duration-200 hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-red-400
                ${preferences.accessibility.largeText ? 'text-base px-6 py-3' : 'text-sm'}
              `}
              aria-label="Cancel story generation"
            >
              <Square className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Progress Bar */}
        {isStreaming && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-gray-600 dark:text-gray-400 font-medium ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                Progress
              </span>
              <span className={`text-primary-600 dark:text-primary-400 font-bold ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                {Math.round((currentWordIndex / Math.max(words.length, 1)) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300 relative overflow-hidden"
                style={{ width: `${(currentWordIndex / Math.max(words.length, 1)) * 100}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -skew-x-12 animate-shimmer"></div>
              </div>
            </div>
          </div>
        )}

        {/* Story Text */}
        <div className={`
          leading-relaxed text-gray-800 dark:text-gray-200 min-h-[200px]
          ${preferences.accessibility.largeText ? 'text-xl leading-loose' : 'text-lg leading-8'}
        `}>
          {displayWords.map((word, index) => (
            <span
              key={index}
              className={`
                transition-all duration-300
                ${index === currentWordIndex - 1 && isStreaming
                  ? 'text-primary-600 dark:text-primary-400 font-semibold bg-primary-100 dark:bg-primary-900/30 px-1 rounded animate-pulse' 
                  : 'text-gray-800 dark:text-gray-200'
                }
              `}
            >
              {word}{' '}
            </span>
          ))}
          
          {/* Typing Cursor */}
          {isStreaming && (
            <span className="inline-block w-0.5 h-6 bg-primary-500 animate-pulse ml-1"></span>
          )}
        </div>

        {/* Streaming Stats */}
        {isStreaming && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Words generated: {currentWordIndex}</span>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-1 h-4 bg-primary-400 rounded-full animate-pulse"></div>
                  <div className="w-1 h-3 bg-secondary-400 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1 h-4 bg-accent-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span>AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};