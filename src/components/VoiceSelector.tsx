import React from 'react';
import { Volume2, Play, Pause, User, Users } from 'lucide-react';
import { NarratorVoice, SupportedLanguage } from '../types';
import { useGlimmerStore } from '../store/useGlimmerStore';
import { TextToSpeechService, AVAILABLE_VOICES, VoiceOption } from '../services/ttsService';

export const VoiceSelector: React.FC = () => {
  const { preferences, updatePreferences } = useGlimmerStore();
  const [playingVoice, setPlayingVoice] = React.useState<string | null>(null);
  const [selectedTab, setSelectedTab] = React.useState<'narrator' | 'user'>('user');

  const narratorVoices: Array<{
    id: NarratorVoice;
    name: string;
    description: string;
    personality: string;
    sampleText: string;
    color: string;
  }> = [
    {
      id: 'child-friendly',
      name: 'Cheerful Friend',
      description: 'Warm, energetic, and encouraging',
      personality: 'Like your best friend telling you a story',
      sampleText: 'Hi there! I\'m so excited to tell you this amazing story!',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      id: 'wise-elder',
      name: 'Wise Storyteller',
      description: 'Calm, knowing, and gentle',
      personality: 'Like a grandparent sharing wisdom',
      sampleText: 'Once upon a time, in a land filled with wonder and magic...',
      color: 'from-purple-400 to-indigo-500'
    },
    {
      id: 'adventure-guide',
      name: 'Adventure Guide',
      description: 'Bold, exciting, and dynamic',
      personality: 'Like an explorer leading you on a quest',
      sampleText: 'Are you ready for an incredible adventure? Let\'s go!',
      color: 'from-green-400 to-teal-500'
    },
    {
      id: 'gentle-parent',
      name: 'Gentle Parent',
      description: 'Soothing, nurturing, and comforting',
      personality: 'Like a loving parent at bedtime',
      sampleText: 'Let me tell you a beautiful story to help you dream sweetly.',
      color: 'from-pink-400 to-rose-500'
    },
    {
      id: 'magical-fairy',
      name: 'Magical Fairy',
      description: 'Mystical, enchanting, and whimsical',
      personality: 'Like a fairy from your favorite tale',
      sampleText: 'Sprinkle some magic dust and let the story begin!',
      color: 'from-cyan-400 to-blue-500'
    }
  ];

  const handleNarratorSelect = (voiceId: NarratorVoice) => {
    const newPreferences = {
      ...preferences,
      voiceSettings: {
        ...preferences.voiceSettings,
        narratorVoice: voiceId
      }
    };
    updatePreferences(newPreferences);
  };

  const handleUserVoiceSelect = (voiceId: string) => {
    const newPreferences = {
      ...preferences,
      voiceSettings: {
        ...preferences.voiceSettings,
        voice: voiceId
      }
    };
    updatePreferences(newPreferences);
  };

  const playUserVoiceSample = (voiceId: string) => {
    if (playingVoice === voiceId) {
      TextToSpeechService.stopAudio();
      setPlayingVoice(null);
      return;
    }

    setPlayingVoice(voiceId);
    TextToSpeechService.playVoiceSample(voiceId, preferences.language);
    
    // Estimate duration and reset playing state
    const voiceOption = AVAILABLE_VOICES.find(v => v.id === voiceId);
    if (voiceOption) {
      const duration = voiceOption.sampleText.length * 80;
      setTimeout(() => {
        setPlayingVoice(null);
      }, duration);
    }
  };
  const playNarratorSample = async (voice: typeof narratorVoices[0]) => {
    if (playingVoice === voice.id) {
      TextToSpeechService.stopAudio();
      setPlayingVoice(null);
      return;
    }

    setPlayingVoice(voice.id);
    
    // Simulate different voice characteristics
    const voiceSettings = {
      'child-friendly': { pitch: 1.2, speed: 1.1 },
      'wise-elder': { pitch: 0.8, speed: 0.9 },
      'adventure-guide': { pitch: 1.0, speed: 1.2 },
      'gentle-parent': { pitch: 1.1, speed: 0.8 },
      'magical-fairy': { pitch: 1.4, speed: 1.0 }
    };

    try {
      // In a real implementation, this would use different voice models
      TextToSpeechService.speakText(voice.sampleText, 'happy', preferences.language, preferences.voiceSettings.voice);
      
      // Estimate speech duration and reset playing state
      const duration = voice.sampleText.length * 80; // 80ms per character
      setTimeout(() => {
        setPlayingVoice(null);
      }, duration);
    } catch (error) {
      console.error('Error playing voice sample:', error);
      setPlayingVoice(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Volume2 className="w-5 h-5 text-primary-500" />
        <div>
          <h3 className={`font-semibold text-gray-700 dark:text-gray-300 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
            Voice Selection
          </h3>
          <p className={`text-gray-500 dark:text-gray-400 ${preferences.accessibility.largeText ? 'text-sm' : 'text-xs'}`}>
            Choose who reads your stories aloud
          </p>
        </div>
      </div>

      {/* Voice Type Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setSelectedTab('user')}
          className={`
            flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md font-medium transition-all duration-200
            ${selectedTab === 'user'
              ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }
          `}
        >
          <User className="w-4 h-4" />
          <span>Voice Selection</span>
        </button>
        <button
          onClick={() => setSelectedTab('narrator')}
          className={`
            flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md font-medium transition-all duration-200
            ${selectedTab === 'narrator'
              ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }
          `}
        >
          <Users className="w-4 h-4" />
          <span>AI Narrators</span>
        </button>
      </div>

      {/* Tab Content */}
      {selectedTab === 'user' && (
        <div className="space-y-4">
          <p className={`text-gray-600 dark:text-gray-400 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
            Choose from our collection of diverse, child-friendly voices. Click play to hear a sample!
          </p>

          {/* User Voice Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVAILABLE_VOICES.map((voice) => (
              <div
                key={voice.id}
                className={`
                  relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer
                  hover:scale-102 hover:shadow-lg
                  ${preferences.voiceSettings.voice === voice.id
                    ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 scale-105 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300'
                  }
                  ${preferences.accessibility.reducedMotion ? 'hover:scale-100 scale-100' : ''}
                `}
                onClick={() => handleUserVoiceSelect(voice.id)}
              >
                {/* Voice Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center shadow-lg
                    ${voice.gender === 'female' ? 'bg-gradient-to-r from-pink-400 to-rose-500' : 
                      voice.gender === 'male' ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                      'bg-gradient-to-r from-purple-400 to-purple-500'}
                  `}>
                    <span className="text-white text-xl">
                      {voice.gender === 'female' ? '👩' : voice.gender === 'male' ? '👨' : '🎭'}
                    </span>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playUserVoiceSample(voice.id);
                    }}
                    className={`
                      p-2 rounded-full transition-all duration-200
                      ${playingVoice === voice.id
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'
                      }
                      hover:scale-110 active:scale-95
                    `}
                    aria-label={`${playingVoice === voice.id ? 'Stop' : 'Play'} ${voice.name} sample`}
                  >
                    {playingVoice === voice.id ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Voice Info */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <h4 className={`font-bold text-gray-800 dark:text-gray-200 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
                      {voice.name}
                    </h4>
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${voice.gender === 'female' ? 'bg-pink-100 text-pink-700' : 
                        voice.gender === 'male' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'}
                    `}>
                      {voice.gender}
                    </span>
                  </div>
                  
                  <p className={`text-gray-600 dark:text-gray-400 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                    {voice.description}
                  </p>
                  
                  {/* Sample Text Preview */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-3">
                    <p className={`text-gray-600 dark:text-gray-400 text-xs mb-1 font-medium`}>
                      Sample:
                    </p>
                    <p className={`text-gray-800 dark:text-gray-200 ${preferences.accessibility.largeText ? 'text-sm' : 'text-xs'}`}>
                      "{voice.sampleText}"
                    </p>
                  </div>
                </div>

                {/* Selection Indicator */}
                {preferences.voiceSettings.voice === voice.id && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  </div>
                )}

                {/* Playing Indicator */}
                {playingVoice === voice.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-2xl flex items-center justify-center">
                    <div className="bg-white/90 dark:bg-gray-800/90 rounded-full px-4 py-2 shadow-lg">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-1 h-4 bg-primary-500 rounded-full animate-pulse"></div>
                          <div className="w-1 h-3 bg-secondary-500 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-1 h-4 bg-accent-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Playing...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'narrator' && (
        <div className="space-y-4">
          <p className={`text-gray-600 dark:text-gray-400 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
            AI narrator personalities for special storytelling experiences. Each has unique characteristics!
          </p>

          {/* Narrator Voice Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {narratorVoices.map((voice) => (
              <div
                key={voice.id}
                className={`
                  relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer
                  hover:scale-102 hover:shadow-lg
                  ${preferences.voiceSettings.narratorVoice === voice.id
                    ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 scale-105 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300'
                  }
                  ${preferences.accessibility.reducedMotion ? 'hover:scale-100 scale-100' : ''}
                `}
                onClick={() => handleNarratorSelect(voice.id)}
              >
                {/* Voice Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${voice.color} rounded-full flex items-center justify-center shadow-lg`}>
                    <Volume2 className="w-6 h-6 text-white" />
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playNarratorSample(voice);
                    }}
                    className={`
                      p-2 rounded-full transition-all duration-200
                      ${playingVoice === voice.id
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'
                      }
                      hover:scale-110 active:scale-95
                    `}
                    aria-label={`${playingVoice === voice.id ? 'Stop' : 'Play'} ${voice.name} sample`}
                  >
                    {playingVoice === voice.id ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Voice Info */}
                <div className="space-y-3">
                  <h4 className={`font-bold text-gray-800 dark:text-gray-200 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
                    {voice.name}
                  </h4>
                  
                  <p className={`text-gray-600 dark:text-gray-400 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                    {voice.description}
                  </p>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className={`text-gray-700 dark:text-gray-300 italic ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                      "{voice.personality}"
                    </p>
                  </div>

                  {/* Sample Text Preview */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-3">
                    <p className={`text-gray-600 dark:text-gray-400 text-xs mb-1 font-medium`}>
                      Sample:
                    </p>
                    <p className={`text-gray-800 dark:text-gray-200 ${preferences.accessibility.largeText ? 'text-sm' : 'text-xs'}`}>
                      "{voice.sampleText}"
                    </p>
                  </div>
                </div>

                {/* Selection Indicator */}
                {preferences.voiceSettings.narratorVoice === voice.id && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  </div>
                )}

                {/* Playing Indicator */}
                {playingVoice === voice.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-2xl flex items-center justify-center">
                    <div className="bg-white/90 dark:bg-gray-800/90 rounded-full px-4 py-2 shadow-lg">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-1 h-4 bg-primary-500 rounded-full animate-pulse"></div>
                          <div className="w-1 h-3 bg-secondary-500 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-1 h-4 bg-accent-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Playing...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Character Voices Toggle */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className={`font-medium text-gray-700 dark:text-gray-300 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
              Character Voices in Performance Mode
            </span>
            <p className={`text-gray-500 dark:text-gray-400 ${preferences.accessibility.largeText ? 'text-sm' : 'text-xs'}`}>
              Each story character gets their own unique voice during interactive performances
            </p>
          </div>
          <input
            type="checkbox"
            checked={preferences.voiceSettings.characterVoices}
            onChange={(e) => {
              const newPreferences = {
                ...preferences,
                voiceSettings: {
                  ...preferences.voiceSettings,
                  characterVoices: e.target.checked
                }
              };
              updatePreferences(newPreferences);
            }}
            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
          />
        </label>
      </div>

      {/* Current Selection Display */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-full px-6 py-3">
          <Volume2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <div className="text-center">
            <div className={`font-medium text-gray-700 dark:text-gray-300 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
              Current Voice: {AVAILABLE_VOICES.find(v => v.id === preferences.voiceSettings.voice)?.name || 'Emma (Child-Friendly Female)'}
            </div>
            <div className={`text-gray-500 dark:text-gray-400 ${preferences.accessibility.largeText ? 'text-sm' : 'text-xs'}`}>
              AI Narrator: {narratorVoices.find(v => v.id === preferences.voiceSettings.narratorVoice)?.name || 'Cheerful Friend'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};