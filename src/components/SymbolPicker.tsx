import React from 'react';
import { StorySymbol, SymbolCategory } from '../types';
import { useGlimmerStore } from '../store/useGlimmerStore';
import { getCategorizedSymbols } from '../data/symbols';

const CATEGORY_LABELS: Record<SymbolCategory, string> = {
  characters: '👥 People',
  animals: '🐾 Animals',
  actions: '⚡ Actions',
  places: '🏛️ Places',
  objects: '🎯 Objects',
  emotions: '😊 Feelings',
  food: '🍎 Food',
  weather: '🌤️ Weather',
};

export const SymbolPicker: React.FC = () => {
  const { activeCategory, setActiveCategory, addSymbolToScene, preferences } = useGlimmerStore();
  const categorizedSymbols = getCategorizedSymbols();
  const categories = Object.keys(categorizedSymbols) as SymbolCategory[];

  const handleSymbolClick = (symbol: StorySymbol) => {
    addSymbolToScene(symbol);
    
    // Provide haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    // Announce symbol for screen readers
    const announcement = `Added ${symbol.label} to your story`;
    const ariaLive = document.createElement('div');
    ariaLive.setAttribute('aria-live', 'polite');
    ariaLive.setAttribute('aria-atomic', 'true');
    ariaLive.className = 'sr-only';
    ariaLive.textContent = announcement;
    document.body.appendChild(ariaLive);
    setTimeout(() => document.body.removeChild(ariaLive), 1000);
  };

  return (
    <div className="bg-white/95 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-lg border border-neutral-200/30 dark:border-gray-700/50 overflow-hidden">
      {/* Category Tabs */}
      <div className="bg-gradient-to-r from-sky-50/60 to-bubblegum-50/40 dark:from-gray-800 dark:to-gray-700 border-b border-sky-200/30 dark:border-gray-700/50">
        <nav 
          className="flex flex-wrap gap-2 p-6"
          role="tablist"
          aria-label="Symbol categories"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              role="tab"
              aria-selected={activeCategory === category}
              aria-controls={`panel-${category}`}
              className={`
                px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-primary-500
                relative overflow-hidden group
                ${activeCategory === category
                  ? 'bg-gradient-to-r from-bubblegum-400 to-sky-400 text-white shadow-lg scale-105 shadow-bubblegum-500/20'
                  : 'bg-white/95 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-bubblegum-50 hover:to-sky-50 dark:hover:bg-primary-900/50 hover:scale-105 shadow-sm backdrop-blur-sm border border-white/50'
                }
                ${preferences.accessibility.largeText ? 'text-lg px-6 py-3' : ''}
              `}
            >
              {activeCategory === category && !preferences.accessibility.reducedMotion && (
                <div className="absolute inset-0 bg-gradient-to-r from-sunshine-300/20 to-mint-300/20 animate-pulse rounded-xl"></div>
              )}
              <span className="relative z-10">
              {CATEGORY_LABELS[category]}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Symbol Grid */}
      <div 
        id={`panel-${activeCategory}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeCategory}`}
        className="p-4"
      >
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
          {categorizedSymbols[activeCategory]?.map((symbol) => (
            <button
              key={symbol.id}
              onClick={() => handleSymbolClick(symbol)}
              className={`
                aspect-square rounded-2xl border-2 border-transparent
                bg-gradient-to-br from-white/90 to-sky-50/60 dark:from-gray-800 dark:to-gray-700
                hover:from-bubblegum-50/70 hover:to-sky-50/70 dark:hover:from-primary-900/50 dark:hover:to-secondary-900/50
                hover:border-bubblegum-200/60 dark:hover:border-primary-600
                hover:scale-110 active:scale-95 hover:shadow-lg
                transition-all duration-300 ease-out
                focus:outline-none focus:ring-2 focus:ring-bubblegum-400/50
                flex items-center justify-center relative group
                shadow-sm hover:shadow-md hover:shadow-bubblegum-200/30
                ${preferences.accessibility.largeText ? 'text-2xl' : 'text-xl'}
                ${preferences.accessibility.highContrast 
                  ? 'border-gray-900 dark:border-gray-100' 
                  : ''
                }
              `}
              title={symbol.label}
              aria-label={`Add ${symbol.label} to story`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-bubblegum-300/0 to-sky-300/0 group-hover:from-bubblegum-300/10 group-hover:to-sky-300/8 rounded-2xl transition-all duration-300"></div>
              <span 
                className="select-none pointer-events-none relative z-10 group-hover:scale-110 transition-transform duration-200"
                aria-hidden="true"
              >
                {symbol.value}
              </span>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-sunshine-400 to-accent-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center shadow-lg">
                <span className="text-white text-xs font-bold">+</span>
              </div>
              {/* Invisible label for screen readers */}
              <span className="sr-only">{symbol.label}</span>
            </button>
          ))}
        </div>

        {/* Empty State */}
        {!categorizedSymbols[activeCategory]?.length && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No symbols available in this category yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};