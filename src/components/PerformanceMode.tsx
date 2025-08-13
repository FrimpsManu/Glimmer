import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Mic, Users, Theater, Volume2 } from 'lucide-react';
import { PerformanceService } from '../services/performanceService';
import { StoryPerformance, PerformanceCharacter, PerformanceScene, DialogueLine, InteractiveElement, CharacterVoice } from '../types';
import { useGlimmerStore } from '../store/useGlimmerStore';

interface PerformanceModeProps {
  performance: StoryPerformance;
  onClose: () => void;
}

export const PerformanceMode: React.FC<PerformanceModeProps> = ({ performance, onClose }) => {
  const [isPerforming, setIsPerforming] = useState(false);
  const [currentScene, setCurrentScene] = useState<PerformanceScene | null>(null);
  const [currentDialogue, setCurrentDialogue] = useState<DialogueLine | null>(null);
  const [currentCharacter, setCurrentCharacter] = useState<PerformanceCharacter | null>(null);
  const [interactiveElement, setInteractiveElement] = useState<InteractiveElement | null>(null);
  const [userResponse, setUserResponse] = useState('');
  const [sceneIndex, setSceneIndex] = useState(0);
  const { preferences } = useGlimmerStore();

  const startPerformance = async () => {
    setIsPerforming(true);
    
    await PerformanceService.startPerformance(performance, {
      onSceneStart: (scene) => {
        setCurrentScene(scene);
        setSceneIndex(performance.scenes.indexOf(scene));
      },
      onDialogue: (dialogue, character) => {
        setCurrentDialogue(dialogue);
        setCurrentCharacter(character);
      },
      onInteractive: (element) => {
        setInteractiveElement(element);
      },
      onComplete: () => {
        setIsPerforming(false);
        setCurrentScene(null);
        setCurrentDialogue(null);
        setCurrentCharacter(null);
        setInteractiveElement(null);
      }
    });
  };

  const stopPerformance = () => {
    PerformanceService.stopPerformance();
    setIsPerforming(false);
  };

  const handleUserResponse = () => {
    if (userResponse.trim()) {
      // Process user response
      console.log('User response:', userResponse);
      setUserResponse('');
      setInteractiveElement(null);
    }
  };

  const getCharacterVoiceDescription = (voice: CharacterVoice): string => {
    const descriptions = {
      'child-hero': '🦸 Brave & Energetic',
      'wise-mentor': '🧙 Calm & Wise',
      'friendly-animal': '🐾 Playful & Warm',
      'magical-creature': '✨ Mystical & Enchanting',
      'villain-reformed': '🎭 Dramatic & Kind',
      'narrator-classic': '📖 Classic Storyteller'
    };
    return descriptions[voice];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Theater className="w-8 h-8" />
              <div>
                <h2 className={`font-bold ${preferences.accessibility.largeText ? 'text-2xl' : 'text-xl'}`}>
                  🎭 Performance Mode
                </h2>
                <p className={`opacity-90 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
                  Interactive Story Theater
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Performance Stage */}
        <div className="p-6 space-y-6">
          {/* Characters Panel */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4">
            <h3 className={`font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center space-x-2 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
              <Users className="w-5 h-5" />
              <span>Story Characters</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {performance.characters.map((character) => (
                <div
                  key={character.id}
                  className={`
                    p-3 rounded-lg border-2 transition-all duration-300
                    ${currentCharacter?.id === character.id
                      ? 'border-purple-400 bg-purple-100 dark:bg-purple-900/50 scale-105 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }
                  `}
                >
                  <div className="text-center">
                    <div className={`font-bold text-gray-800 dark:text-gray-200 mb-1 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                      {character.name}
                    </div>
                    <div className={`text-purple-600 dark:text-purple-400 mb-2 ${preferences.accessibility.largeText ? 'text-sm' : 'text-xs'}`}>
                      {getCharacterVoiceDescription(character.voice)}
                    </div>
                    <div className="flex flex-wrap justify-center gap-1">
                      {character.personality.slice(0, 2).map((trait) => (
                        <span
                          key={trait}
                          className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Scene Display */}
          {currentScene && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold text-gray-800 dark:text-gray-200 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
                  Scene {sceneIndex + 1}: {currentScene.setting}
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {sceneIndex + 1} of {performance.scenes.length}
                </div>
              </div>

              {/* Current Dialogue */}
              {currentDialogue && currentCharacter && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-md">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {currentCharacter.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`font-semibold text-gray-800 dark:text-gray-200 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                          {currentCharacter.name}
                        </span>
                        <Volume2 className="w-4 h-4 text-purple-500 animate-pulse" />
                      </div>
                      <p className={`text-gray-700 dark:text-gray-300 leading-relaxed ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
                        "{currentDialogue.text}"
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-2 py-1 bg-${currentDialogue.emotion === 'happy' ? 'yellow' : currentDialogue.emotion === 'sad' ? 'blue' : 'gray'}-100 text-${currentDialogue.emotion === 'happy' ? 'yellow' : currentDialogue.emotion === 'sad' ? 'blue' : 'gray'}-700 rounded-full text-xs`}>
                          {currentDialogue.emotion}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((sceneIndex + 1) / performance.scenes.length) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Interactive Element */}
          {interactiveElement && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Mic className="w-5 h-5 text-green-500" />
                <h3 className={`font-semibold text-gray-800 dark:text-gray-200 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
                  Your Turn to Participate!
                </h3>
              </div>
              
              <p className={`text-gray-700 dark:text-gray-300 mb-4 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
                {interactiveElement.prompt}
              </p>

              {interactiveElement.type === 'choice' && interactiveElement.options && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {interactiveElement.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setUserResponse(option);
                        handleUserResponse();
                      }}
                      className={`
                        p-3 rounded-lg border-2 border-green-200 hover:border-green-400
                        bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20
                        transition-all duration-200 hover:scale-105
                        ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}
                      `}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {interactiveElement.type === 'voice-response' && (
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    placeholder="Type your response or speak aloud..."
                    className={`
                      flex-1 px-4 py-3 border border-green-300 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-green-500
                      ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}
                    `}
                    onKeyPress={(e) => e.key === 'Enter' && handleUserResponse()}
                  />
                  <button
                    onClick={handleUserResponse}
                    disabled={!userResponse.trim()}
                    className={`
                      px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400
                      text-white font-semibold rounded-lg transition-colors
                      ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}
                    `}
                  >
                    Respond
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Performance Controls */}
          <div className="flex items-center justify-center space-x-4">
            {!isPerforming ? (
              <button
                onClick={startPerformance}
                className={`
                  flex items-center space-x-3 px-8 py-4
                  bg-gradient-to-r from-purple-500 to-pink-500
                  hover:from-purple-600 hover:to-pink-600
                  text-white font-bold rounded-2xl shadow-lg
                  transition-all duration-300 hover:scale-105
                  ${preferences.accessibility.largeText ? 'text-lg px-10 py-5' : 'text-base'}
                `}
              >
                <Play className="w-6 h-6" />
                <span>Start Performance</span>
              </button>
            ) : (
              <button
                onClick={stopPerformance}
                className={`
                  flex items-center space-x-3 px-8 py-4
                  bg-gradient-to-r from-red-500 to-red-600
                  hover:from-red-600 hover:to-red-700
                  text-white font-bold rounded-2xl shadow-lg
                  transition-all duration-300 hover:scale-105
                  ${preferences.accessibility.largeText ? 'text-lg px-10 py-5' : 'text-base'}
                `}
              >
                <Square className="w-6 h-6" />
                <span>Stop Performance</span>
              </button>
            )}
          </div>

          {/* Performance Tips */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
            <h4 className={`font-semibold text-yellow-800 dark:text-yellow-300 mb-2 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
              🎭 Performance Tips:
            </h4>
            <ul className={`text-yellow-700 dark:text-yellow-400 space-y-1 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
              <li>• Listen to each character's unique voice</li>
              <li>• Participate when prompted - your voice matters!</li>
              <li>• Feel free to act out the story with gestures</li>
              <li>• Each character has their own personality - notice the differences!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};