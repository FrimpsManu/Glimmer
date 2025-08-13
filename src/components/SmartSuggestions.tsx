import React, { useEffect, useState } from 'react';
import { Lightbulb, Plus, Sparkles } from 'lucide-react';
import { StorySymbol, SymbolCategory } from '../types';
import { useGlimmerStore } from '../store/useGlimmerStore';
import { symbolLibrary } from '../data/symbols';

interface SmartSuggestionsProps {
  currentSymbols: StorySymbol[];
}

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({ currentSymbols }) => {
  const [suggestions, setSuggestions] = useState<StorySymbol[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const { addSymbolToScene, preferences } = useGlimmerStore();

  // Smart suggestion logic
  useEffect(() => {
    if (currentSymbols.length === 0) {
      // Initial suggestions - start with characters
      const characterSuggestions = symbolLibrary
        .filter(s => s.category === 'characters')
        .slice(0, 3);
      setSuggestions(characterSuggestions);
      setIsVisible(false);
      return;
    }

    const newSuggestions = generateSmartSuggestions(currentSymbols);
    setSuggestions(newSuggestions);
    setIsVisible(true);
  }, [currentSymbols]);

  const generateSmartSuggestions = (symbols: StorySymbol[]): StorySymbol[] => {
    const categories = symbols.map(s => s.category);
    const suggestions: StorySymbol[] = [];

    // Rule-based suggestions
    const rules = [
      // If we have characters but no place, suggest places
      {
        condition: () => categories.includes('characters') && !categories.includes('places'),
        suggestions: () => symbolLibrary.filter(s => s.category === 'places').slice(0, 2)
      },
      
      // If we have characters and places but no actions, suggest actions
      {
        condition: () => categories.includes('characters') && categories.includes('places') && !categories.includes('actions'),
        suggestions: () => symbolLibrary.filter(s => s.category === 'actions').slice(0, 2)
      },
      
      // If we have a princess, suggest castle or magic items
      {
        condition: () => symbols.some(s => s.label.toLowerCase().includes('princess')),
        suggestions: () => symbolLibrary.filter(s => 
          s.label.toLowerCase().includes('castle') || 
          s.label.toLowerCase().includes('star') ||
          s.label.toLowerCase().includes('wizard')
        ).slice(0, 2)
      },
      
      // If we have animals, suggest food or nature
      {
        condition: () => categories.includes('animals'),
        suggestions: () => symbolLibrary.filter(s => 
          s.category === 'food' || 
          (s.category === 'places' && (s.label.toLowerCase().includes('forest') || s.label.toLowerCase().includes('home')))
        ).slice(0, 2)
      },
      
      // If we have food, suggest eating action
      {
        condition: () => categories.includes('food'),
        suggestions: () => symbolLibrary.filter(s => 
          s.label.toLowerCase().includes('eat')
        ).slice(0, 1)
      },
      
      // If story is getting long, suggest emotions
      {
        condition: () => symbols.length >= 4 && !categories.includes('emotions'),
        suggestions: () => symbolLibrary.filter(s => s.category === 'emotions').slice(0, 2)
      },
      
      // Weather suggestions for outdoor scenes
      {
        condition: () => symbols.some(s => 
          s.label.toLowerCase().includes('forest') || 
          s.label.toLowerCase().includes('beach') ||
          s.label.toLowerCase().includes('mountain')
        ),
        suggestions: () => symbolLibrary.filter(s => s.category === 'weather').slice(0, 2)
      }
    ];

    // Apply rules
    for (const rule of rules) {
      if (rule.condition()) {
        const ruleSuggestions = rule.suggestions();
        suggestions.push(...ruleSuggestions);
        if (suggestions.length >= 3) break;
      }
    }

    // If no specific rules matched, suggest complementary categories
    if (suggestions.length === 0) {
      const missingCategories: SymbolCategory[] = ['objects', 'emotions', 'weather'];
      const availableCategory = missingCategories.find(cat => !categories.includes(cat));
      
      if (availableCategory) {
        suggestions.push(...symbolLibrary.filter(s => s.category === availableCategory).slice(0, 3));
      }
    }

    // Remove duplicates and symbols already in the scene
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
      index === self.findIndex(s => s.id === suggestion.id) &&
      !symbols.some(existing => existing.id === suggestion.id)
    );

    return uniqueSuggestions.slice(0, 3);
  };

  const handleAddSuggestion = (symbol: StorySymbol) => {
    addSymbolToScene(symbol);
    
    // Provide feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    // Announce for screen readers
    const announcement = `Added suggested ${symbol.label} to your story`;
    const ariaLive = document.createElement('div');
    ariaLive.setAttribute('aria-live', 'polite');
    ariaLive.setAttribute('aria-atomic', 'true');
    ariaLive.className = 'sr-only';
    ariaLive.textContent = announcement;
    document.body.appendChild(ariaLive);
    setTimeout(() => document.body.removeChild(ariaLive), 1000);
  };

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <div className={`
      bg-gradient-to-r from-accent-50 to-primary-50 
      dark:from-accent-900/20 dark:to-primary-900/20 
      rounded-xl p-4 border border-accent-200 dark:border-accent-700
      animate-fade-in
      ${preferences.accessibility.reducedMotion ? 'animate-none' : ''}
    `}>
      {/* Header */}
      <div className="flex items-center space-x-2 mb-3">
        <div className="relative">
          <Lightbulb className="w-5 h-5 text-accent-500" />
          <Sparkles className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
        </div>
        <h3 className={`font-semibold text-accent-700 dark:text-accent-300 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
          Smart Suggestions
        </h3>
      </div>

      {/* Suggestion Text */}
      <p className={`text-accent-600 dark:text-accent-400 mb-3 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
        {getSuggestionText(currentSymbols)}
      </p>

      {/* Suggested Symbols */}
      <div className="flex space-x-3">
        {suggestions.map((symbol) => (
          <button
            key={symbol.id}
            onClick={() => handleAddSuggestion(symbol)}
            className={`
              group relative flex flex-col items-center p-3 
              bg-white dark:bg-gray-800 rounded-lg border-2 border-transparent
              hover:border-accent-300 dark:hover:border-accent-600
              hover:scale-105 active:scale-95
              transition-all duration-200 ease-out
              focus:outline-none focus:ring-2 focus:ring-accent-500
              ${preferences.accessibility.reducedMotion ? 'hover:scale-100 active:scale-100' : ''}
            `}
            title={`Add ${symbol.label} to your story`}
            aria-label={`Add suggested ${symbol.label} to story`}
          >
            {/* Plus Icon Overlay */}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <Plus className="w-3 h-3" />
            </div>
            
            {/* Symbol */}
            <div className={`${preferences.accessibility.largeText ? 'text-2xl' : 'text-xl'} mb-1`}>
              {symbol.value}
            </div>
            
            {/* Label */}
            <div className={`
              text-center font-medium text-gray-700 dark:text-gray-300
              ${preferences.accessibility.largeText ? 'text-sm' : 'text-xs'}
            `}>
              {symbol.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Helper function to generate contextual suggestion text
function getSuggestionText(symbols: StorySymbol[]): string {
  const categories = symbols.map(s => s.category);
  
  if (categories.includes('characters') && !categories.includes('places')) {
    return "Your character needs somewhere to go! Try adding a place:";
  }
  
  if (categories.includes('characters') && categories.includes('places') && !categories.includes('actions')) {
    return "What should your character do? Add an action:";
  }
  
  if (symbols.some(s => s.label.toLowerCase().includes('princess'))) {
    return "A princess story! These might fit perfectly:";
  }
  
  if (categories.includes('animals')) {
    return "Animal stories are fun! Consider adding:";
  }
  
  if (symbols.length >= 4 && !categories.includes('emotions')) {
    return "How should your characters feel? Add some emotions:";
  }
  
  return "Here are some symbols that might work well with your story:";
}