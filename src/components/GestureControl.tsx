import React, { useState, useEffect } from 'react';
import { Hand, Camera, CameraOff, Zap } from 'lucide-react';
import { gestureService } from '../services/gestureRecognition';
import { useGlimmerStore } from '../store/useGlimmerStore';
import { symbolLibrary } from '../data/symbols';

export const GestureControl: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const { addSymbolToScene, preferences } = useGlimmerStore();

  useEffect(() => {
    // Check if gesture recognition is supported
    const checkSupport = async () => {
      const supported = await gestureService.initialize();
      setIsSupported(supported);
    };
    checkSupport();
  }, []);

  useEffect(() => {
    if (isActive) {
      gestureService.setGestureCallback(handleGesture);
    }
  }, [isActive]);

  const handleGesture = (gesture: string, gestureConfidence: number) => {
    setCurrentGesture(gesture);
    setConfidence(gestureConfidence);

    // Map gestures to actions
    if (gestureConfidence > 0.7) {
      switch (gesture) {
        case 'point':
          // Add a random character
          const characters = symbolLibrary.filter(s => s.category === 'characters');
          if (characters.length > 0) {
            const randomChar = characters[Math.floor(Math.random() * characters.length)];
            addSymbolToScene(randomChar);
          }
          break;
        case 'peace':
          // Add a happy emotion
          const happySymbol = symbolLibrary.find(s => s.label === 'Happy');
          if (happySymbol) addSymbolToScene(happySymbol);
          break;
        case 'open_hand':
          // Add a place
          const places = symbolLibrary.filter(s => s.category === 'places');
          if (places.length > 0) {
            const randomPlace = places[Math.floor(Math.random() * places.length)];
            addSymbolToScene(randomPlace);
          }
          break;
        case 'fist':
          // Add an action
          const actions = symbolLibrary.filter(s => s.category === 'actions');
          if (actions.length > 0) {
            const randomAction = actions[Math.floor(Math.random() * actions.length)];
            addSymbolToScene(randomAction);
          }
          break;
      }

      // Provide haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
    }
  };

  const toggleGestureControl = async () => {
    if (!isActive) {
      const started = await gestureService.startCamera();
      if (started) {
        setIsActive(true);
      }
    } else {
      gestureService.stop();
      setIsActive(false);
      setCurrentGesture('');
      setConfidence(0);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Toggle Button */}
      <button
        onClick={toggleGestureControl}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold shadow-lg
          transition-all duration-200 hover:scale-105
          focus:outline-none focus:ring-2 focus:ring-purple-400
          ${isActive 
            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse' 
            : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
          }
          ${preferences.accessibility.largeText ? 'text-lg px-6 py-3' : 'text-base'}
        `}
        aria-label={isActive ? 'Stop gesture control' : 'Start gesture control'}
      >
        {isActive ? (
          <>
            <CameraOff className="w-5 h-5" />
            <span>Stop Gestures</span>
          </>
        ) : (
          <>
            <Hand className="w-5 h-5" />
            <span>Gesture Control</span>
          </>
        )}
      </button>

      {/* Gesture Status */}
      {isActive && (
        <div className={`
          bg-gradient-to-r from-purple-50 to-purple-100 
          dark:from-purple-900/20 dark:to-purple-800/20
          rounded-xl p-4 border border-purple-200 dark:border-purple-700
          animate-fade-in
        `}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Camera className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className={`font-semibold text-purple-700 dark:text-purple-300 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
                Gesture Recognition Active
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 dark:text-green-400">Live</span>
            </div>
          </div>

          {/* Current Gesture */}
          {currentGesture && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`font-medium text-purple-700 dark:text-purple-300 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                  Detected: {currentGesture.replace('_', ' ')}
                </span>
                <span className={`font-bold text-purple-600 dark:text-purple-400 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                  {Math.round(confidence * 100)}%
                </span>
              </div>
              <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${confidence * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Gesture Guide */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">👉</span>
              <span className="text-purple-600 dark:text-purple-400">Point → Add Character</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">✌️</span>
              <span className="text-purple-600 dark:text-purple-400">Peace → Add Happy</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">✋</span>
              <span className="text-purple-600 dark:text-purple-400">Open → Add Place</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">✊</span>
              <span className="text-purple-600 dark:text-purple-400">Fist → Add Action</span>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="text-center">
        <p className={`text-gray-500 dark:text-gray-400 italic ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
          🔒 Camera data is processed locally and never stored
        </p>
      </div>
    </div>
  );
};