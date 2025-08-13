import React, { useState } from 'react';
import { X, Volume2, Type, Palette, Globe, Moon, Sun, Zap, Heart, Settings } from 'lucide-react';
import { useGlimmerStore } from '../store/useGlimmerStore';
import { LanguageSelector } from './LanguageSelector';
import { VoiceSelector } from './VoiceSelector';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { SupportedLanguage } from '../types';

interface AccessibilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({ isOpen, onClose }) => {
  const { preferences, updatePreferences } = useGlimmerStore();
  const [activeTab, setActiveTab] = useState<'display' | 'audio' | 'interaction' | 'language'>('display');

  if (!isOpen) return null;

  const handleThemeChange = (theme: 'light' | 'dark') => {
    updatePreferences({
      theme
    });
  };

  const handleAccessibilityChange = (key: string, value: any) => {
    updatePreferences({
      accessibility: {
        ...preferences.accessibility,
        [key]: value
      }
    });
  };

  const handleLanguageChange = (language: SupportedLanguage) => {
    updatePreferences({
      language
    });
  };

  const handleVoiceSettingsChange = (key: string, value: any) => {
    updatePreferences({
      voiceSettings: {
        ...preferences.voiceSettings,
        [key]: value
      }
    });
  };

  const handleMusicSettingsChange = (key: string, value: any) => {
    updatePreferences({
      musicSettings: {
        ...preferences.musicSettings,
        [key]: value
      }
    });
  };

  const tabs = [
    { id: 'display', label: 'Display', icon: <Palette className="w-4 h-4" /> },
    { id: 'audio', label: 'Audio', icon: <Volume2 className="w-4 h-4" /> },
    { id: 'interaction', label: 'Interaction', icon: <Zap className="w-4 h-4" /> },
    { id: 'language', label: 'Language', icon: <Globe className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`font-bold text-gray-800 dark:text-white ${preferences.accessibility.largeText ? 'text-2xl' : 'text-xl'}`}>
                Settings
              </h2>
              <p className={`text-gray-600 dark:text-gray-400 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                Customize your Glimmer experience
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex-1 flex items-center justify-center space-x-2 py-4 px-6
                font-medium transition-colors
                ${activeTab === tab.id
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'display' && (
            <div className="space-y-6">
              {/* Theme Selection */}
              <div>
                <h3 className={`font-semibold text-gray-800 dark:text-white mb-3 ${preferences.accessibility.largeText ? 'text-xl' : 'text-lg'}`}>
                  Theme
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
                    { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> }
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => handleThemeChange(theme.value as any)}
                      className={`
                        flex items-center justify-center space-x-2 p-3 rounded-xl
                        border-2 transition-all duration-200
                        ${preferences.theme === theme.value
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
                        }
                      `}
                    >
                      {theme.icon}
                      <span className="font-medium">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Size */}
              <div>
                <h3 className={`font-semibold text-gray-800 dark:text-white mb-3 ${preferences.accessibility.largeText ? 'text-xl' : 'text-lg'}`}>
                  Text Size
                </h3>
                <div className="flex items-center space-x-4">
                  <Type className="w-5 h-5 text-gray-500" />
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.accessibility.largeText}
                      onChange={(e) => handleAccessibilityChange('largeText', e.target.checked)}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Use larger text for better readability
                    </span>
                  </label>
                </div>
              </div>

              {/* High Contrast */}
              <div>
                <h3 className={`font-semibold text-gray-800 dark:text-white mb-3 ${preferences.accessibility.largeText ? 'text-xl' : 'text-lg'}`}>
                  Visual Contrast
                </h3>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.accessibility.highContrast}
                    onChange={(e) => handleAccessibilityChange('highContrast', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    Enable high contrast mode for better visibility
                  </span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-6">
              {/* Voice Settings */}
              <div>
                <h3 className={`font-semibold text-gray-800 dark:text-white mb-3 ${preferences.accessibility.largeText ? 'text-xl' : 'text-lg'}`}>
                  Voice Speed
                </h3>
                <div className="flex items-center space-x-4">
                  <span className={`text-gray-700 dark:text-gray-300 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                    Slow
                  </span>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={preferences.voiceSettings.speed}
                    onChange={(e) => handleVoiceSettingsChange('speed', parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className={`text-gray-700 dark:text-gray-300 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                    Fast
                  </span>
                </div>
                <div className="text-center mt-2">
                  <span className={`text-purple-600 dark:text-purple-400 font-medium ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                    {preferences.voiceSettings.speed.toFixed(1)}x
                  </span>
                </div>
              </div>

              {/* Music Settings */}
              <div>
                <h3 className={`font-semibold text-gray-800 dark:text-white mb-3 ${preferences.accessibility.largeText ? 'text-xl' : 'text-lg'}`}>
                  Background Music
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.musicSettings.enabled}
                      onChange={(e) => handleMusicSettingsChange('enabled', e.target.checked)}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Enable background music
                    </span>
                  </label>
                  
                  {preferences.musicSettings.enabled && (
                    <div className="ml-8 space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-gray-700 dark:text-gray-300 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                            Volume
                          </span>
                          <span className={`text-purple-600 dark:text-purple-400 font-medium ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                            {Math.round(preferences.musicSettings.volume * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={preferences.musicSettings.volume}
                          onChange={(e) => handleMusicSettingsChange('volume', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.musicSettings.adaptToStory}
                          onChange={(e) => handleMusicSettingsChange('adaptToStory', e.target.checked)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className={`text-gray-600 dark:text-gray-400 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                          Adapt music to story mood
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Voice Selection */}
              <div>
                <h3 className={`font-semibold text-gray-800 dark:text-white mb-3 ${preferences.accessibility.largeText ? 'text-xl' : 'text-lg'}`}>
                  Voice Selection
                </h3>
                <VoiceSelector />
              </div>
            </div>
          )}

          {activeTab === 'interaction' && (
            <div className="space-y-6">
              {/* Reduced Motion */}
              <div>
                <h3 className={`font-semibold text-gray-800 dark:text-white mb-3 ${preferences.accessibility.largeText ? 'text-xl' : 'text-lg'}`}>
                  Motion & Animation
                </h3>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.accessibility.reducedMotion}
                    onChange={(e) => handleAccessibilityChange('reducedMotion', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    Reduce motion and animations
                  </span>
                </label>
              </div>

              {/* Keyboard Navigation */}
              <div>
                <h3 className={`font-semibold text-gray-800 dark:text-white mb-3 ${preferences.accessibility.largeText ? 'text-xl' : 'text-lg'}`}>
                  Navigation
                </h3>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.accessibility.keyboardNavigation}
                    onChange={(e) => handleAccessibilityChange('keyboardNavigation', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    Enhanced keyboard navigation support
                  </span>
                </label>
              </div>

              {/* Screen Reader */}
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.accessibility.screenReader}
                    onChange={(e) => handleAccessibilityChange('screenReader', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    Screen reader optimizations
                  </span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'language' && (
            <div className="space-y-6">
              <LanguageSelector />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <p className={`text-gray-600 dark:text-gray-400 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
              Settings are saved automatically
            </p>
            <button
              onClick={onClose}
              className={`
                bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 
                text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-purple-400
                ${preferences.accessibility.largeText ? 'px-8 py-3 text-lg' : 'px-6 py-2 text-base'}
              `}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};