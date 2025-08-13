import React from 'react';
import { Heart } from 'lucide-react';
import { EmotionType } from '../types';
import { useGlimmerStore } from '../store/useGlimmerStore';

const EMOTION_OPTIONS: Array<{ type: EmotionType; emoji: string; label: string; color: string }> = [
  { type: 'happy', emoji: '😊', label: 'Happy', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { type: 'excited', emoji: '🤩', label: 'Excited', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { type: 'calm', emoji: '😌', label: 'Calm', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { type: 'silly', emoji: '🤪', label: 'Silly', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { type: 'surprised', emoji: '😲', label: 'Surprised', color: 'bg-pink-100 text-pink-800 border-pink-300' },
  { type: 'sad', emoji: '😢', label: 'Sad', color: 'bg-gray-100 text-gray-800 border-gray-300' },
  { type: 'scared', emoji: '😨', label: 'Scared', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { type: 'neutral', emoji: '😐', label: 'Neutral', color: 'bg-green-100 text-green-800 border-green-300' },
];

export const EmotionSelector: React.FC = () => {
  const { selectedEmotion, setSelectedEmotion, preferences } = useGlimmerStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Heart className="w-5 h-5 text-primary-500" />
        <h3 className={`font-semibold text-gray-700 dark:text-gray-300 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
          How should your story feel?
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {EMOTION_OPTIONS.map((emotion) => (
          <button
            key={emotion.type}
            onClick={() => setSelectedEmotion(emotion.type)}
            className={`
              p-3 rounded-lg border-2 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary-500
              ${selectedEmotion === emotion.type 
                ? `${emotion.color} scale-105 shadow-md ring-2 ring-primary-400` 
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
              }
              ${preferences.accessibility.largeText ? 'p-4' : ''}
              ${preferences.accessibility.highContrast 
                ? 'border-gray-900 dark:border-gray-100' 
                : ''
              }
            `}
            aria-pressed={selectedEmotion === emotion.type}
            aria-label={`Set story emotion to ${emotion.label}`}
          >
            <div className="text-center">
              <div className={`${preferences.accessibility.largeText ? 'text-2xl' : 'text-xl'} mb-1`}>
                {emotion.emoji}
              </div>
              <div className={`font-medium ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'} ${selectedEmotion === emotion.type ? '' : 'text-gray-700 dark:text-gray-300'}`}>
                {emotion.label}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};