import React from 'react';
import { Globe } from 'lucide-react';
import { useGlimmerStore } from '../store/useGlimmerStore';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { SupportedLanguage } from '../types';

export const LanguageSelector: React.FC = () => {
  const { preferences, setLanguage } = useGlimmerStore();

  const handleLanguageChange = (language: SupportedLanguage) => {
    setLanguage(language);
    
    // Provide feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    // Announce language change for screen readers
    const announcement = `Language changed to ${SUPPORTED_LANGUAGES.find(l => l.code === language)?.name}`;
    const ariaLive = document.createElement('div');
    ariaLive.setAttribute('aria-live', 'polite');
    ariaLive.className = 'sr-only';
    ariaLive.textContent = announcement;
    document.body.appendChild(ariaLive);
    setTimeout(() => document.body.removeChild(ariaLive), 1000);
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2 mb-4">
        <Globe className="w-5 h-5 text-primary-500" />
        <h3 className={`font-semibold text-gray-700 dark:text-gray-300 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
          Language / Langue / Idioma / Sprache
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SUPPORTED_LANGUAGES.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`
              p-4 rounded-xl border-2 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary-500
              ${preferences.language === language.code
                ? 'bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/50 dark:to-secondary-900/50 border-primary-400 dark:border-primary-500 scale-105 shadow-md'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:scale-102'
              }
              ${preferences.accessibility.reducedMotion ? 'hover:scale-100 scale-100' : ''}
            `}
            aria-pressed={preferences.language === language.code}
            aria-label={`Select ${language.name} language`}
          >
            <div className="text-center">
              <div className={`${preferences.accessibility.largeText ? 'text-3xl' : 'text-2xl'} mb-2`}>
                {language.flag}
              </div>
              <div className={`font-semibold text-gray-800 dark:text-gray-200 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                {language.name}
              </div>
              {preferences.language === language.code && (
                <div className="mt-2">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mx-auto animate-pulse"></div>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Current Language Indicator */}
      <div className="mt-4 text-center">
        <div className={`inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-full ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
          <span className="text-2xl">
            {SUPPORTED_LANGUAGES.find(l => l.code === preferences.language)?.flag}
          </span>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Current: {SUPPORTED_LANGUAGES.find(l => l.code === preferences.language)?.name}
          </span>
        </div>
      </div>
    </div>
  );
};