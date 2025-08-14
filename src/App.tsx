import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SymbolPicker } from './components/SymbolPicker';
import { StoryCanvas } from './components/StoryCanvas';
import { StoryGenerator } from './components/StoryGenerator';
import { AccessibilitySettings } from './components/AccessibilitySettings';
import { CompanionChat } from './components/CompanionChat';
import { CompanionIntroduction } from './components/CompanionIntroduction';
import { WelcomeExperience } from './components/WelcomeExperience';
import { useGlimmerStore } from './store/useGlimmerStore';
import { StorageService } from './services/storageService';
import { CompanionService } from './services/companionService';
import { AICompanion } from './types';

const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    storyId: params.get('storyId'),
  };
};

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [showCompanionIntro, setShowCompanionIntro] = useState(false);
  const [companion, setCompanion] = useState<AICompanion | null>(null);
  const { preferences, updatePreferences, savedStories, addSavedStory } = useGlimmerStore();

  // ✅ Apply theme
  useEffect(() => {
    const root = document.documentElement;

    if (preferences.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [preferences.theme]); // ✅ Only depends on theme

  // ✅ Apply accessibility settings
  useEffect(() => {
    const root = document.documentElement;

    if (preferences.accessibility.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (preferences.accessibility.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    if (preferences.accessibility.largeText) {
      root.style.setProperty('--font-scale', '1.2');
    } else {
      root.style.setProperty('--font-scale', '1');
    }
  }, [
    preferences.accessibility.highContrast,
    preferences.accessibility.reducedMotion,
    preferences.accessibility.largeText
  ]);

  // Load saved preferences and stories
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const existingCompanion = CompanionService.loadCompanion();
        if (existingCompanion) {
          setCompanion(existingCompanion);
        } else {
          setShowCompanionIntro(true);
        }

        const { storyId } = getUrlParams();
        if (storyId) {
          const sharedStory = await StorageService.loadStoryById(storyId);
          if (sharedStory) {
            addSavedStory(sharedStory);
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }

        const savedPreferences = await StorageService.loadPreferences();
        if (savedPreferences) {
          updatePreferences(savedPreferences);
        }

        const stories = await StorageService.loadStories();
        stories.forEach(story => addSavedStory(story));
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [updatePreferences, addSavedStory]);

  const handleCompanionCreated = (newCompanion: AICompanion) => {
    setCompanion(newCompanion);
    setShowCompanionIntro(false);
  };

  // Accessibility keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!preferences.accessibility.keyboardNavigation) return;

      if (event.key === 'Escape' && showSettings) {
        setShowSettings(false);
      }

      if (event.altKey && event.key === 's') {
        event.preventDefault();
        setShowSettings(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [preferences.accessibility.keyboardNavigation, showSettings]);

  return (
    <div className={`
      min-h-screen bg-gradient-to-br from-sky-50/30 via-white to-bubblegum-50/20
      dark:from-gray-900 dark:via-gray-800 dark:to-primary-900/20
      transition-all duration-500 relative overflow-hidden
      ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}
    `}>
      <WelcomeExperience />

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20 dark:opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(155, 111, 255, 0.08) 0%, transparent 70%), 
                            radial-gradient(circle at 75% 75%, rgba(45, 212, 191, 0.06) 0%, transparent 70%),
                            radial-gradient(circle at 50% 10%, rgba(251, 146, 60, 0.04) 0%, transparent 80%)`,
        }}></div>
      </div>

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary-500 text-white px-4 py-2 rounded-lg"
      >
        Skip to main content
      </a>

      <Header onSettingsClick={() => {
        console.log('Opening settings menu');
        setShowSettings(true);
      }} />

      <main
        id="main-content"
        className="container mx-auto px-4 py-8 relative z-10"
        role="main"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <SymbolPicker />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-10">
            <section aria-label="Story composition area">
              <StoryCanvas />
            </section>
            <section aria-label="Story generation and playback">
              <StoryGenerator />
            </section>
          </div>
        </div>

        {savedStories.length > 0 && (
          <div className="mt-16 text-center">
            <div className="inline-flex items-center space-x-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <div className="w-2 h-2 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full animate-pulse"></div>
              <p className={`text-gray-600 dark:text-gray-400 font-medium ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
                You have <span className="font-bold text-primary-600 dark:text-primary-400">{savedStories.length}</span> saved {savedStories.length === 1 ? 'story' : 'stories'}
              </p>
            </div>
          </div>
        )}
      </main>

      {showSettings && (
        <AccessibilitySettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showCompanionIntro && (
        <CompanionIntroduction onComplete={handleCompanionCreated} />
      )}

      {companion && <CompanionChat />}

      <div className="sr-only">
        <p>Keyboard shortcuts: Alt+S to open settings, Escape to close modals</p>
      </div>
    </div>
  );
}

export default App;
