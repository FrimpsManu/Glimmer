import React, { useState, useEffect } from 'react';
import { Music, Volume2, VolumeX, Play, Pause, SkipForward, Settings } from 'lucide-react';
import { MusicService, MusicSettings, MusicTrack } from '../services/musicService';
import { useGlimmerStore } from '../store/useGlimmerStore';
import { GeneratedStory } from '../types';

interface MusicControlsProps {
  story?: GeneratedStory;
  isStoryPlaying?: boolean;
}

export const MusicControls: React.FC<MusicControlsProps> = ({ story, isStoryPlaying }) => {
  const [musicSettings, setMusicSettings] = useState<MusicSettings>({
    enabled: false,
    volume: 0.3,
    fadeInOut: true,
    adaptToStory: true,
  });
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [visualizationData, setVisualizationData] = useState<{ frequency: number; amplitude: number }[]>([]);
  
  const { preferences } = useGlimmerStore();

  // Initialize music service
  useEffect(() => {
    const initMusic = async () => {
      const success = await MusicService.initialize();
      setIsInitialized(success);
    };
    initMusic();

    return () => {
      MusicService.dispose();
    };
  }, []);

  // Auto-play music when story starts playing
  useEffect(() => {
    if (story && isStoryPlaying && musicSettings.enabled && isInitialized) {
      handlePlayMusic();
    } else if (!isStoryPlaying) {
      handleStopMusic();
    }
  }, [story, isStoryPlaying, musicSettings.enabled, isInitialized]);

  // Update visualization data
  useEffect(() => {
    if (isMusicPlaying) {
      const interval = setInterval(() => {
        const data = MusicService.getMusicVisualizationData();
        setVisualizationData(data);
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isMusicPlaying]);

  const handlePlayMusic = async () => {
    if (!story || !isInitialized) return;

    try {
      await MusicService.playStoryMusic(story, musicSettings);
      setIsMusicPlaying(true);
      setCurrentTrack(MusicService.getCurrentTrack());
    } catch (error) {
      console.error('Error playing music:', error);
    }
  };

  const handleStopMusic = () => {
    MusicService.stopMusic();
    setIsMusicPlaying(false);
    setCurrentTrack(null);
    setVisualizationData([]);
  };

  const handleToggleMusic = () => {
    if (isMusicPlaying) {
      handleStopMusic();
    } else {
      handlePlayMusic();
    }
  };

  const handleVolumeChange = (volume: number) => {
    const newSettings = { ...musicSettings, volume };
    setMusicSettings(newSettings);
    MusicService.setVolume(volume);
  };

  const handleSettingsChange = (key: keyof MusicSettings, value: boolean | number) => {
    const newSettings = { ...musicSettings, [key]: value };
    setMusicSettings(newSettings);
    
    // Save to localStorage
    localStorage.setItem('glimmer-music-settings', JSON.stringify(newSettings));
  };

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('glimmer-music-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMusicSettings(parsed);
      } catch (error) {
        console.error('Error loading music settings:', error);
      }
    }
  }, []);

  if (!isInitialized) {
    return null; // Don't show controls if music isn't supported
  }

  return (
    <div className="space-y-4">
      {/* Main Music Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Music className="w-5 h-5 text-purple-500" />
            {isMusicPlaying && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            )}
          </div>
          <div>
            <h3 className={`font-semibold text-gray-700 dark:text-gray-300 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
              Dynamic Soundtrack
            </h3>
            <p className={`text-gray-500 dark:text-gray-400 ${preferences.accessibility.largeText ? 'text-sm' : 'text-xs'}`}>
              AI-generated music that matches your story
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Music settings"
          >
            <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={musicSettings.enabled}
              onChange={(e) => handleSettingsChange('enabled', e.target.checked)}
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className={`font-medium text-gray-700 dark:text-gray-300 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
              Enable Music
            </span>
          </label>
        </div>
      </div>

      {/* Music Settings Panel */}
      {showSettings && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700 animate-fade-in">
          <h4 className={`font-semibold text-purple-700 dark:text-purple-300 mb-4 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
            🎵 Music Settings
          </h4>
          
          <div className="space-y-4">
            {/* Volume Control */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`font-medium text-gray-700 dark:text-gray-300 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                  Volume
                </label>
                <span className={`text-purple-600 dark:text-purple-400 font-bold ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                  {Math.round(musicSettings.volume * 100)}%
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <VolumeX className="w-4 h-4 text-gray-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={musicSettings.volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <Volume2 className="w-4 h-4 text-gray-600" />
              </div>
            </div>

            {/* Music Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={musicSettings.fadeInOut}
                  onChange={(e) => handleSettingsChange('fadeInOut', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className={`text-gray-700 dark:text-gray-300 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                  Fade In/Out
                </span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={musicSettings.adaptToStory}
                  onChange={(e) => handleSettingsChange('adaptToStory', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className={`text-gray-700 dark:text-gray-300 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                  Adapt to Story
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Current Track Display */}
      {musicSettings.enabled && currentTrack && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center shadow-lg
                ${currentTrack.emotion === 'happy' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                  currentTrack.emotion === 'calm' ? 'bg-gradient-to-r from-blue-400 to-teal-500' :
                  currentTrack.emotion === 'excited' ? 'bg-gradient-to-r from-pink-400 to-red-500' :
                  currentTrack.emotion === 'silly' ? 'bg-gradient-to-r from-purple-400 to-pink-500' :
                  'bg-gradient-to-r from-gray-400 to-gray-500'}
              `}>
                <Music className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className={`font-semibold text-gray-800 dark:text-gray-200 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                  {currentTrack.emotion.charAt(0).toUpperCase() + currentTrack.emotion.slice(1)} Soundtrack
                </h4>
                <p className={`text-gray-500 dark:text-gray-400 ${preferences.accessibility.largeText ? 'text-sm' : 'text-xs'}`}>
                  {currentTrack.key} • {currentTrack.tempo} BPM • {currentTrack.instruments.join(', ')}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleMusic}
              className={`
                p-2 rounded-lg transition-all duration-200 hover:scale-105
                ${isMusicPlaying
                  ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200'
                  : 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 hover:bg-green-200'
                }
              `}
              aria-label={isMusicPlaying ? 'Pause music' : 'Play music'}
            >
              {isMusicPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
          </div>

          {/* Music Visualization */}
          {isMusicPlaying && visualizationData.length > 0 && !preferences.accessibility.reducedMotion && (
            <div className="flex items-end justify-center space-x-1 h-12 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-2">
              {visualizationData.slice(0, 20).map((data, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-t from-purple-500 to-indigo-500 rounded-sm transition-all duration-100"
                  style={{
                    width: '3px',
                    height: `${Math.max(4, data.amplitude * 32)}px`,
                    animationDelay: `${index * 50}ms`
                  }}
                />
              ))}
            </div>
          )}

          {/* Music Info */}
          <div className="mt-3 text-center">
            <p className={`text-gray-600 dark:text-gray-400 italic ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
              🎼 Music dynamically generated to match your story's emotion and pace
            </p>
          </div>
        </div>
      )}

      {/* Music Styles Info */}
      {musicSettings.enabled && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4">
          <h4 className={`font-semibold text-indigo-700 dark:text-indigo-300 mb-3 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
            🎨 Available Music Styles
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MusicService.getAvailableMusicStyles().map((style) => (
              <div key={style.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                <h5 className={`font-medium text-gray-800 dark:text-gray-200 mb-1 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                  {style.name}
                </h5>
                <p className={`text-gray-600 dark:text-gray-400 mb-2 ${preferences.accessibility.largeText ? 'text-sm' : 'text-xs'}`}>
                  {style.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {style.emotions.map((emotion) => (
                    <span
                      key={emotion}
                      className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium"
                    >
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};