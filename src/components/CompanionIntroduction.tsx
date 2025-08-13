import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, Star, Gift } from 'lucide-react';
import { CompanionService } from '../services/companionService';
import { AICompanion } from '../types';
import { useGlimmerStore } from '../store/useGlimmerStore';

interface CompanionIntroductionProps {
  onComplete: (companion: AICompanion) => void;
}

export const CompanionIntroduction: React.FC<CompanionIntroductionProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [childName, setChildName] = useState('');
  const [selectedCompanion, setSelectedCompanion] = useState<AICompanion | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { preferences } = useGlimmerStore();

  const companions = [
    {
      name: 'Spark',
      personality: 'Curious and encouraging, loves adventure stories',
      color: 'from-yellow-400 to-orange-500',
      emoji: '✨',
      traits: ['Creative', 'Adventurous', 'Encouraging']
    },
    {
      name: 'Luna',
      personality: 'Wise and gentle, perfect for bedtime stories',
      color: 'from-purple-400 to-indigo-500',
      emoji: '🌙',
      traits: ['Wise', 'Gentle', 'Mystical']
    },
    {
      name: 'Zephyr',
      personality: 'Playful and energetic, loves funny stories',
      color: 'from-green-400 to-teal-500',
      emoji: '🌪️',
      traits: ['Playful', 'Energetic', 'Funny']
    }
  ];

  const handleCreateCompanion = async () => {
    if (!selectedCompanion) return;
    
    setIsCreating(true);
    
    // Simulate creation process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newCompanion = CompanionService.createCompanion(childName);
    // Override with selected personality
    const companionData = companions.find(c => c.name === selectedCompanion.name);
    if (companionData) {
      newCompanion.name = companionData.name;
    }
    
    CompanionService.saveCompanion(newCompanion);
    onComplete(newCompanion);
  };

  const steps = [
    // Step 0: Welcome
    <div key="welcome" className="text-center space-y-6">
      <div className="relative">
        <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-2xl">
          <Heart className="w-12 h-12 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>
      
      <div>
        <h2 className={`font-bold text-gray-800 dark:text-gray-200 mb-4 ${preferences.accessibility.largeText ? 'text-3xl' : 'text-2xl'}`}>
          Welcome to Glimmer! ✨
        </h2>
        <p className={`text-gray-600 dark:text-gray-400 leading-relaxed ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
          I'm here to help you create the most amazing stories! But first, let me introduce you to your very own AI story companion - a magical friend who will remember all your adventures and help make every story special.
        </p>
      </div>
      
      <button
        onClick={() => setStep(1)}
        className={`
          px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500
          hover:from-purple-600 hover:to-pink-600
          text-white font-bold rounded-2xl shadow-lg
          transition-all duration-300 hover:scale-105
          ${preferences.accessibility.largeText ? 'text-lg px-10 py-5' : 'text-base'}
        `}
      >
        Meet My Story Friend! 🎭
      </button>
    </div>,

    // Step 1: Name Input
    <div key="name" className="text-center space-y-6">
      <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center shadow-xl">
        <Gift className="w-10 h-10 text-white" />
      </div>
      
      <div>
        <h2 className={`font-bold text-gray-800 dark:text-gray-200 mb-4 ${preferences.accessibility.largeText ? 'text-2xl' : 'text-xl'}`}>
          What's Your Name?
        </h2>
        <p className={`text-gray-600 dark:text-gray-400 mb-6 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
          Your story companion wants to know what to call you!
        </p>
        
        <input
          type="text"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          placeholder="Enter your name..."
          className={`
            w-full max-w-xs mx-auto px-4 py-3 border-2 border-purple-200 
            rounded-xl text-center font-medium
            focus:outline-none focus:ring-4 focus:ring-purple-400/50 focus:border-purple-400
            ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}
          `}
          autoFocus
        />
      </div>
      
      <button
        onClick={() => setStep(2)}
        disabled={!childName.trim()}
        className={`
          px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500
          hover:from-blue-600 hover:to-purple-600
          disabled:from-gray-400 disabled:to-gray-500
          text-white font-bold rounded-2xl shadow-lg
          transition-all duration-300 hover:scale-105
          disabled:cursor-not-allowed disabled:hover:scale-100
          ${preferences.accessibility.largeText ? 'text-lg px-10 py-5' : 'text-base'}
        `}
      >
        Next Step! 🚀
      </button>
    </div>,

    // Step 2: Companion Selection
    <div key="selection" className="space-y-6">
      <div className="text-center">
        <h2 className={`font-bold text-gray-800 dark:text-gray-200 mb-4 ${preferences.accessibility.largeText ? 'text-2xl' : 'text-xl'}`}>
          Choose Your Story Companion! 🌟
        </h2>
        <p className={`text-gray-600 dark:text-gray-400 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
          Each companion has a unique personality and will grow with you!
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {companions.map((companion) => (
          <button
            key={companion.name}
            onClick={() => setSelectedCompanion(companion as any)}
            className={`
              p-6 rounded-2xl border-2 transition-all duration-300
              hover:scale-105 hover:shadow-xl
              ${selectedCompanion?.name === companion.name
                ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20 scale-105 shadow-xl'
                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
              }
            `}
          >
            <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${companion.color} rounded-full flex items-center justify-center shadow-lg`}>
              <span className="text-2xl">{companion.emoji}</span>
            </div>
            
            <h3 className={`font-bold text-gray-800 dark:text-gray-200 mb-2 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
              {companion.name}
            </h3>
            
            <p className={`text-gray-600 dark:text-gray-400 mb-4 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
              {companion.personality}
            </p>
            
            <div className="flex flex-wrap justify-center gap-2">
              {companion.traits.map((trait) => (
                <span
                  key={trait}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium"
                >
                  {trait}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
      
      <div className="text-center">
        <button
          onClick={handleCreateCompanion}
          disabled={!selectedCompanion || isCreating}
          className={`
            px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500
            hover:from-green-600 hover:to-teal-600
            disabled:from-gray-400 disabled:to-gray-500
            text-white font-bold rounded-2xl shadow-lg
            transition-all duration-300 hover:scale-105
            disabled:cursor-not-allowed disabled:hover:scale-100
            ${preferences.accessibility.largeText ? 'text-lg px-10 py-5' : 'text-base'}
            ${isCreating ? 'animate-pulse' : ''}
          `}
        >
          {isCreating ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating Your Companion...</span>
            </div>
          ) : (
            `Create ${selectedCompanion?.name || 'Companion'}! ✨`
          )}
        </button>
      </div>
    </div>
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
        
        {/* Step Content */}
        <div className="min-h-[400px] flex items-center justify-center">
          {steps[step]}
        </div>
      </div>
    </div>
  );
};