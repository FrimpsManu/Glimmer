import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Share2, Palette } from 'lucide-react';
import { VisualStorybook as VisualStorybookType, StoryPage } from '../services/visualStoryService';
import { useGlimmerStore } from '../store/useGlimmerStore';

interface VisualStorybookProps {
  visualStory: VisualStorybookType;
  onClose: () => void;
}

export const VisualStorybook: React.FC<VisualStorybookProps> = ({ visualStory, onClose }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const { preferences } = useGlimmerStore();
  
  const currentPage = visualStory.pages[currentPageIndex];
  const totalPages = visualStory.pages.length;

  const nextPage = () => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const prevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const goToPage = (index: number) => {
    setCurrentPageIndex(index);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Palette className="w-8 h-8" />
              <div>
                <h2 className={`font-bold ${preferences.accessibility.largeText ? 'text-2xl' : 'text-xl'}`}>
                  📚 {visualStory.title}
                </h2>
                <p className={`opacity-90 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
                  Interactive Visual Storybook
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {/* TODO: Implement download */}}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Download storybook"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => {/* TODO: Implement share */}}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Share storybook"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Storybook Content */}
        <div className="flex flex-col h-full max-h-[calc(95vh-120px)]">
          {/* Page Display */}
          <div className="flex-1 relative overflow-hidden">
            {currentPage && (
              <div 
                className="w-full h-full bg-cover bg-center relative flex items-center justify-center p-8"
                style={{ 
                  backgroundImage: `url(${currentPage.backgroundImage})`,
                  minHeight: '500px'
                }}
              >
                {/* Background Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20"></div>
                
                {/* Visual Elements */}
                {currentPage.visualElements.map((element) => (
                  <div
                    key={element.id}
                    className={`
                      absolute transition-all duration-1000
                      ${element.animation === 'fade-in' ? 'animate-fade-in' : ''}
                      ${element.animation === 'bounce' ? 'animate-bounce-gentle' : ''}
                      ${element.animation === 'glow' ? 'animate-pulse-glow' : ''}
                      ${element.animation === 'float' ? 'animate-float-up' : ''}
                    `}
                    style={{
                      left: `${element.position?.x || 50}%`,
                      top: `${element.position?.y || 50}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    {/* Placeholder for visual element */}
                    <div className="w-24 h-24 bg-white/80 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
                      <span className="text-2xl">
                        {element.type === 'character' ? '👤' : 
                         element.type === 'object' ? '🎯' : 
                         element.type === 'effect' ? '✨' : '🏛️'}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Page Text */}
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
                    <p className={`
                      text-gray-800 dark:text-gray-200 leading-relaxed text-center
                      ${preferences.accessibility.largeText ? 'text-xl leading-loose' : 'text-lg leading-8'}
                    `}>
                      {currentPage.text}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4">
            <div className="flex items-center justify-between">
              {/* Previous Button */}
              <button
                onClick={prevPage}
                disabled={currentPageIndex === 0}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg
                  bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400
                  text-white font-semibold transition-colors
                  disabled:cursor-not-allowed
                  ${preferences.accessibility.largeText ? 'text-lg px-6 py-3' : 'text-base'}
                `}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Previous</span>
              </button>

              {/* Page Indicators */}
              <div className="flex items-center space-x-2">
                <span className={`text-gray-600 dark:text-gray-400 font-medium ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                  Page {currentPageIndex + 1} of {totalPages}
                </span>
                <div className="flex space-x-1 mx-4">
                  {visualStory.pages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToPage(index)}
                      className={`
                        w-3 h-3 rounded-full transition-all duration-200
                        ${index === currentPageIndex 
                          ? 'bg-blue-500 scale-125' 
                          : 'bg-gray-300 dark:bg-gray-600 hover:bg-blue-300'
                        }
                      `}
                      aria-label={`Go to page ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={nextPage}
                disabled={currentPageIndex === totalPages - 1}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg
                  bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400
                  text-white font-semibold transition-colors
                  disabled:cursor-not-allowed
                  ${preferences.accessibility.largeText ? 'text-lg px-6 py-3' : 'text-base'}
                `}
              >
                <span>Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Art Style Info */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-4">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-indigo-500" />
              <span className={`text-indigo-700 dark:text-indigo-300 font-medium ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                Art Style: {visualStory.artStyle.charAt(0).toUpperCase() + visualStory.artStyle.slice(1)}
              </span>
            </div>
            <div className="text-gray-400">•</div>
            <span className={`text-gray-600 dark:text-gray-400 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
              Created: {visualStory.createdAt.toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};