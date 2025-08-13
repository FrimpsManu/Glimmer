import React, { useState, useEffect } from 'react';
import { Trophy, Target, Sparkles, RefreshCw, Star } from 'lucide-react';
import { StorySymbol, SymbolCategory } from '../types';
import { useGlimmerStore } from '../store/useGlimmerStore';
import { symbolLibrary } from '../data/symbols';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'count' | 'category' | 'emotion' | 'mystery';
  requirement: any;
  reward: string;
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
}

const DAILY_CHALLENGES: Challenge[] = [
  {
    id: 'animal-adventure',
    title: 'Animal Adventure',
    description: 'Create a story with exactly 3 different animals',
    type: 'count',
    requirement: { category: 'animals', count: 3 },
    reward: '🏆 Animal Expert',
    difficulty: 'easy',
    icon: '🐾'
  },
  {
    id: 'emotion-journey',
    title: 'Emotional Journey',
    description: 'Tell a story that includes both happy and sad emotions',
    type: 'category',
    requirement: { categories: ['emotions'], emotions: ['happy', 'sad'] },
    reward: '💝 Heart Storyteller',
    difficulty: 'medium',
    icon: '❤️'
  },
  {
    id: 'mystery-box',
    title: 'Mystery Box Challenge',
    description: 'Create a story using these exact symbols',
    type: 'mystery',
    requirement: { symbols: [] }, // Will be populated randomly
    reward: '🎁 Mystery Master',
    difficulty: 'hard',
    icon: '📦'
  },
  {
    id: 'place-explorer',
    title: 'World Explorer',
    description: 'Visit 2 different places in your story',
    type: 'count',
    requirement: { category: 'places', count: 2 },
    reward: '🗺️ Explorer Badge',
    difficulty: 'easy',
    icon: '🌍'
  },
  {
    id: 'action-packed',
    title: 'Action Hero',
    description: 'Include 4 different actions in your adventure',
    type: 'count',
    requirement: { category: 'actions', count: 4 },
    reward: '⚡ Action Star',
    difficulty: 'medium',
    icon: '💪'
  }
];

export const StoryChallenges: React.FC = () => {
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const { currentScene, preferences, addSymbolToScene } = useGlimmerStore();

  useEffect(() => {
    // Load completed challenges from localStorage
    const saved = localStorage.getItem('glimmer-completed-challenges');
    if (saved) {
      setCompletedChallenges(JSON.parse(saved));
    }

    // Set daily challenge
    generateDailyChallenge();
  }, []);

  useEffect(() => {
    // Check progress on current challenge
    if (currentChallenge) {
      const newProgress = checkChallengeProgress(currentChallenge, currentScene);
      setProgress(newProgress);
      
      // Auto-complete challenge when progress reaches 100%
      if (newProgress >= 100 && !completedChallenges.includes(currentChallenge.id)) {
        setTimeout(() => {
          completeChallenge();
        }, 1000); // Small delay for better UX
      }
    }
  }, [currentScene, currentChallenge]);

  const generateDailyChallenge = () => {
    const today = new Date().toDateString();
    const savedChallenge = localStorage.getItem(`glimmer-daily-challenge-${today}`);
    
    if (savedChallenge) {
      const parsed = JSON.parse(savedChallenge);
      // For mystery box, ensure symbols are properly loaded
      if (parsed.type === 'mystery' && (!parsed.requirement.symbols || parsed.requirement.symbols.length === 0)) {
        parsed.requirement.symbols = getRandomSymbols(4);
      }
      setCurrentChallenge(parsed);
    } else {
      // Generate new daily challenge
      const availableChallenges = DAILY_CHALLENGES.filter(
        c => !completedChallenges.includes(c.id)
      );
      
      if (availableChallenges.length === 0) {
        // Reset if all completed
        setCompletedChallenges([]);
        localStorage.removeItem('glimmer-completed-challenges');
      }
      
      const challengesToUse = availableChallenges.length > 0 ? availableChallenges : DAILY_CHALLENGES;
      const randomChallenge = { ...challengesToUse[Math.floor(Math.random() * challengesToUse.length)] };
      
      // For mystery box, add random symbols
      if (randomChallenge.type === 'mystery') {
        const randomSymbols = getRandomSymbols(4);
        randomChallenge.requirement.symbols = randomSymbols;
      }
      
      setCurrentChallenge(randomChallenge);
      localStorage.setItem(`glimmer-daily-challenge-${today}`, JSON.stringify(randomChallenge));
    }
  };

  const getRandomSymbols = (count: number): StorySymbol[] => {
    const shuffled = [...symbolLibrary].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const checkChallengeProgress = (challenge: Challenge, symbols: StorySymbol[]): number => {
    switch (challenge.type) {
      case 'count':
        const categorySymbols = symbols.filter(s => s.category === challenge.requirement.category);
        const uniqueSymbols = [...new Set(categorySymbols.map(s => s.label))]; // Count unique symbols only
        return Math.min(100, (uniqueSymbols.length / challenge.requirement.count) * 100);
      
      case 'category':
        if (challenge.requirement.emotions) {
          const hasEmotions = challenge.requirement.emotions.every((emotion: string) =>
            symbols.some(s => s.label.toLowerCase().includes(emotion.toLowerCase()))
          );
          return hasEmotions ? 100 : 0;
        }
        return 0;
      
      case 'mystery':
        const requiredSymbols = challenge.requirement.symbols;
        if (!requiredSymbols || requiredSymbols.length === 0) return 0;
        const matchingSymbols = requiredSymbols.filter((reqSymbol: StorySymbol) =>
          symbols.some(s => s.id === reqSymbol.id)
        );
        return (matchingSymbols.length / requiredSymbols.length) * 100;
      
      default:
        return 0;
    }
  };

  const completeChallenge = () => {
    if (currentChallenge && progress >= 100) {
      const newCompleted = [...completedChallenges, currentChallenge.id];
      setCompletedChallenges(newCompleted);
      localStorage.setItem('glimmer-completed-challenges', JSON.stringify(newCompleted));
      
      // Show celebration
      showCelebration();
      
      // Generate new challenge
      setTimeout(() => {
        // Clear current challenge first, then generate new one
        setCurrentChallenge(null);
        setProgress(0);
        setTimeout(() => {
          generateDailyChallenge();
        }, 500);
      }, 3000);
    }
  };

  const showCelebration = () => {
    // Create celebration overlay
    const celebration = document.createElement('div');
    celebration.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in';
    celebration.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-2xl animate-bounce-gentle">
        <div class="text-6xl mb-4">🎉</div>
        <h3 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">Challenge Complete!</h3>
        <p class="text-lg text-gray-600 dark:text-gray-300 mb-4">${currentChallenge?.reward}</p>
        <div class="flex justify-center space-x-1">
          <div class="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
          <div class="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
      </div>
    `;
    
    document.body.appendChild(celebration);
    setTimeout(() => document.body.removeChild(celebration), 3000);
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }
  };

  const addMysterySymbol = (symbol: StorySymbol) => {
    addSymbolToScene(symbol);
  };

  if (!currentChallenge) return null;

  return (
    <div className={`
      bg-gradient-to-r from-yellow-50 to-orange-50 
      dark:from-yellow-900/20 dark:to-orange-900/20 
      rounded-xl p-6 border-2 border-yellow-200 dark:border-yellow-700
      shadow-lg backdrop-blur-sm
    `}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <Sparkles className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <h3 className={`font-bold text-yellow-700 dark:text-yellow-300 ${preferences.accessibility.largeText ? 'text-xl' : 'text-lg'}`}>
              Daily Challenge
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{currentChallenge.icon}</span>
              <span className={`
                px-2 py-1 rounded-full text-xs font-semibold
                ${currentChallenge.difficulty === 'easy' ? 'bg-green-100 text-green-800' : 
                  currentChallenge.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'}
              `}>
                {currentChallenge.difficulty}
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={generateDailyChallenge}
          className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
          aria-label="Get new challenge"
        >
          <RefreshCw className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
        </button>
      </div>

      {/* Challenge Details */}
      <div className="space-y-4">
        <div>
          <h4 className={`font-semibold text-gray-800 dark:text-gray-200 mb-2 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
            {currentChallenge.title}
          </h4>
          <p className={`text-gray-600 dark:text-gray-400 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
            {currentChallenge.description}
          </p>
        </div>

        {/* Mystery Box Symbols */}
        {currentChallenge.type === 'mystery' && currentChallenge.requirement.symbols && (
          <div className="space-y-2">
            <p className={`font-medium text-gray-700 dark:text-gray-300 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
              Use these symbols:
            </p>
            <div className="flex flex-wrap gap-2">
              {currentChallenge.requirement.symbols.map((symbol: StorySymbol) => (
                <button
                  key={symbol.id}
                  onClick={() => addMysterySymbol(symbol)}
                  className={`
                    p-3 rounded-lg bg-white dark:bg-gray-800 border-2 border-yellow-200 dark:border-yellow-700
                    hover:border-yellow-400 dark:hover:border-yellow-500 hover:scale-105
                    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500
                    ${currentScene.some(s => s.label === symbol.label) ? 'bg-yellow-100 dark:bg-yellow-900/50 border-yellow-400' : ''}
                  `}
                  aria-label={`Add ${symbol.label} to story`}
                >
                  <div className="text-center">
                    <div className={`${preferences.accessibility.largeText ? 'text-2xl' : 'text-xl'} mb-1`}>
                      {symbol.value}
                    </div>
                    <div className={`text-xs font-medium text-gray-600 dark:text-gray-400`}>
                      {symbol.label}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`font-medium text-gray-700 dark:text-gray-300 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
              Progress
            </span>
            <span className={`font-bold text-yellow-600 dark:text-yellow-400 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -skew-x-12 animate-shimmer"></div>
            </div>
          </div>
        </div>

        {/* Complete Button */}
        {progress >= 100 && (
          <button
            onClick={completeChallenge}
            disabled={completedChallenges.includes(currentChallenge.id)}
            className={`
              w-full flex items-center justify-center space-x-2 py-3 px-4
              bg-gradient-to-r from-green-500 to-green-600
              hover:from-green-600 hover:to-green-700
              disabled:from-gray-400 disabled:to-gray-500
              text-white font-bold rounded-xl shadow-lg
              transition-all duration-200 hover:scale-105
              focus:outline-none focus:ring-2 focus:ring-green-400
              animate-pulse-slow
              disabled:cursor-not-allowed disabled:hover:scale-100
            `}
          >
            <Star className="w-5 h-5" />
            <span>
              {completedChallenges.includes(currentChallenge.id) ? 'Completed!' : `Claim Reward: ${currentChallenge.reward}`}
            </span>
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Challenges Completed: <span className="font-bold text-yellow-600 dark:text-yellow-400">{completedChallenges.length}</span>
          </span>
          <div className="flex items-center space-x-1">
            {[...Array(Math.min(5, completedChallenges.length))].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};