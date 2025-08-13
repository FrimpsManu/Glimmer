import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Star, Music, Play, ArrowRight, Volume2 } from 'lucide-react';
import { useGlimmerStore } from '../store/useGlimmerStore';
import { MusicService } from '../services/musicService';
import { TextToSpeechService } from '../services/ttsService';

export const WelcomeExperience: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [floatingElements, setFloatingElements] = useState<Array<{id: number, emoji: string, x: number, y: number}>>([]);
  const { preferences, updatePreferences } = useGlimmerStore();

  // Check if user has seen welcome before
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('glimmer-welcome-seen');
    if (hasSeenWelcome) {
      setShowWelcome(false);
    } else {
      // Start welcome music
      initializeWelcomeMusic();
      generateFloatingElements();
    }
  }, []);

  const initializeWelcomeMusic = async () => {
    try {
      const initialized = await MusicService.initialize();
      if (initialized) {
        setMusicEnabled(true);
        // Start playing welcome background music
        await startWelcomeMusic();
      }
    } catch (error) {
      console.log('Music not available, continuing without sound');
    }
  };

  const startWelcomeMusic = async () => {
    try {
      // Create a special welcome story for music generation
      const welcomeStory = {
        id: 'welcome-music',
        title: 'Welcome to Glimmer',
        content: 'Welcome to the magical world of storytelling!',
        scenes: [],
        createdAt: new Date(),
        mood: 'happy' as const
      };

      const musicSettings = {
        enabled: true,
        volume: 0.2, // Gentle background volume
        fadeInOut: true,
        adaptToStory: false
      };

      // Start playing gentle background music
      await MusicService.playStoryMusic(welcomeStory, musicSettings);
      console.log('🎵 Welcome background music started');
    } catch (error) {
      console.error('Failed to start welcome music:', error);
    }
  };

  const stopWelcomeMusic = () => {
    MusicService.stopMusic();
    setMusicEnabled(false);
  };

  const generateFloatingElements = () => {
    const emojis = ['✨', '🌟', '⭐', '💫', '🎭', '🎨', '🎪', '🎠', '🎡', '🎢', '🦄', '🌈', '🎈', '🎁', '🧸'];
    const elements = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setFloatingElements(elements);
  };

  const welcomeSteps = [
    {
      title: "Welcome to Glimmer! ✨",
      subtitle: "Where Stories Come to Life",
      content: "Get ready for the most magical storytelling adventure ever! With Glimmer, you can create amazing stories using just pictures and emojis!",
      action: "Let's Begin!",
      background: "from-purple-400 via-pink-400 to-red-400",
      icon: <Sparkles className="w-16 h-16 text-white animate-pulse" />,
      animation: "animate-bounce-gentle"
    },
    {
      title: "Create with Symbols! 🎭",
      subtitle: "No Writing Required",
      content: "Choose characters, places, actions, and emotions by simply clicking on colorful symbols. Watch as AI turns your choices into beautiful stories!",
      action: "Show Me How!",
      background: "from-blue-400 via-cyan-400 to-teal-400",
      icon: <Heart className="w-16 h-16 text-white animate-pulse" />,
      animation: "animate-wiggle"
    },
    {
      title: "Listen & Watch! 🎵",
      subtitle: "Stories That Come Alive",
      content: "Every story gets its own voice narration and magical animations! Choose from different narrator personalities and watch your symbols dance!",
      action: "Sounds Amazing!",
      background: "from-green-400 via-emerald-400 to-teal-400",
      icon: <Music className="w-16 h-16 text-white animate-pulse" />,
      animation: "animate-bounce"
    },
    {
      title: "Ready to Create? 🚀",
      subtitle: "Your Adventure Awaits",
      content: "You're all set! Start by choosing your favorite characters and places. Remember, there are no wrong choices - every story is perfect because it's yours!",
      action: "Start Creating!",
      background: "from-yellow-400 via-orange-400 to-red-400",
      icon: <Star className="w-16 h-16 text-white animate-spin" />,
      animation: "animate-pulse"
    }
  ];

  const currentStepData = welcomeSteps[currentStep];

  const handleNext = () => {
    if (currentStep < welcomeSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      
      // Play sound effect
      TextToSpeechService.speakText("Next!", 'excited', preferences.language);
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    // Mark welcome as seen
    localStorage.setItem('glimmer-welcome-seen', 'true');
    
    // Stop welcome music
    MusicService.stopMusic();
    
    // Play completion sound
    TextToSpeechService.speakText("Welcome to Glimmer! Let's create amazing stories together!", 'excited', preferences.language);
    
    // Celebration animation
    setIsAnimating(true);
    setTimeout(() => {
      setShowWelcome(false);
    }, 2000);
  };

  const handleSkip = () => {
    localStorage.setItem('glimmer-welcome-seen', 'true');
    MusicService.stopMusic();
    setShowWelcome(false);
  };

  if (!showWelcome) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Animated Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentStepData.background} transition-all duration-1000`}>
        {/* Floating Elements */}
        {floatingElements.map((element) => (
          <div
            key={element.id}
            className="absolute text-2xl opacity-60 animate-float-up pointer-events-none"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              animationDelay: `${element.id * 0.2}s`,
              animationDuration: `${4 + Math.random() * 2}s`
            }}
          >
            {element.emoji}
          </div>
        ))}

        {/* Animated Shapes */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse-slow"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-white/15 rounded-full animate-bounce-gentle"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-white/5 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-28 h-28 bg-white/20 rounded-full animate-wiggle"></div>

        {/* Ripple Effects */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 border-2 border-white/20 rounded-full animate-ripple"></div>
          <div className="absolute w-128 h-128 border-2 border-white/10 rounded-full animate-ripple-delayed"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <div className="max-w-2xl w-full">
          {/* Welcome Card */}
          <div className={`
            bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 text-center
            transform transition-all duration-700 ${currentStepData.animation}
            border border-white/50
          `}>
            {/* Progress Dots */}
            <div className="flex justify-center space-x-3 mb-8">
              {welcomeSteps.map((_, index) => (
                <div
                  key={index}
                  className={`
                    w-3 h-3 rounded-full transition-all duration-300
                    ${index <= currentStep 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-125' 
                      : 'bg-gray-300'
                    }
                  `}
                />
              ))}
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {currentStepData.icon}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <h1 className={`font-bold text-gray-800 ${preferences.accessibility.largeText ? 'text-4xl' : 'text-3xl'}`}>
                {currentStepData.title}
              </h1>
              
              <h2 className={`font-semibold text-purple-600 ${preferences.accessibility.largeText ? 'text-xl' : 'text-lg'}`}>
                {currentStepData.subtitle}
              </h2>
              
              <p className={`text-gray-600 leading-relaxed max-w-lg mx-auto ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
                {currentStepData.content}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-4 mt-10">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className={`
                    px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300
                    text-gray-700 font-semibold transition-all duration-200
                    hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400
                    ${preferences.accessibility.largeText ? 'text-lg px-8 py-4' : 'text-base'}
                  `}
                >
                  Back
                </button>
              )}

              <button
                onClick={handleNext}
                className={`
                  relative flex items-center space-x-3 px-8 py-4
                  bg-gradient-to-r from-purple-500 via-pink-500 to-red-500
                  hover:from-purple-600 hover:via-pink-600 hover:to-red-600
                  text-white font-bold rounded-2xl shadow-xl
                  transition-all duration-300 hover:scale-110 active:scale-95
                  focus:outline-none focus:ring-4 focus:ring-purple-400/50
                  overflow-hidden group
                  ${preferences.accessibility.largeText ? 'text-xl px-10 py-5' : 'text-lg'}
                `}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative z-10">{currentStepData.action}</span>
                {currentStep === welcomeSteps.length - 1 ? (
                  <Star className="w-6 h-6 relative z-10 animate-spin" />
                ) : (
                  <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
                )}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
              </button>
            </div>

            {/* Skip Option */}
            <button
              onClick={handleSkip}
              className={`
                mt-6 text-gray-500 hover:text-gray-700 transition-colors
                underline decoration-dotted underline-offset-4
                ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}
              `}
            >
              Skip Introduction
            </button>

            {/* Music Toggle */}
            {musicEnabled && (
              <div className="mt-6 flex items-center justify-center space-x-2">
                <Volume2 className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-600">
                  Welcome music is playing
                </span>
                <button
                  onClick={() => MusicService.stopMusic()}
                  className="text-xs text-purple-600 hover:text-purple-800 underline"
                >
                  Turn off
                </button>
              </div>
            )}
          </div>

          {/* Feature Preview Cards */}
          {currentStep === 1 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
              {[
                { emoji: '👧', label: 'Characters', color: 'from-pink-400 to-rose-500' },
                { emoji: '🏰', label: 'Places', color: 'from-blue-400 to-indigo-500' },
                { emoji: '🎭', label: 'Actions', color: 'from-green-400 to-emerald-500' }
              ].map((item, index) => (
                <div
                  key={index}
                  className={`
                    bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center
                    transform hover:scale-105 transition-all duration-300
                    shadow-lg hover:shadow-xl
                    animate-fade-in
                  `}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center shadow-lg`}>
                    <span className="text-2xl">{item.emoji}</span>
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">{item.label}</h3>
                </div>
              ))}
            </div>
          )}

          {/* Voice Preview */}
          {currentStep === 2 && (
            <div className="mt-8 animate-fade-in">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg">
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                    <Volume2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-8 bg-purple-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-6 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-8 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-4 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                  </div>
                </div>
                <button
                  onClick={() => TextToSpeechService.speakText("Hello! I'm your story narrator. I can't wait to read your amazing stories out loud!", 'excited', preferences.language)}
                  className="flex items-center space-x-2 mx-auto px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <Play className="w-5 h-5" />
                  <span>Hear Sample Voice</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Completion Animation */}
      {currentStep === welcomeSteps.length - 1 && isAnimating && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Celebration Confetti */}
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-float-up opacity-80"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
          
          {/* Success Message */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl animate-bounce-gentle">
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Glimmer!</h2>
                <p className="text-gray-600">Let the storytelling magic begin!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Elements */}
      <div className="absolute bottom-8 left-8 right-8 pointer-events-none">
        <div className="flex justify-center space-x-8">
          {['🎭', '🎨', '🎵', '✨', '🌟'].map((emoji, index) => (
            <div
              key={index}
              className={`
                text-4xl animate-bounce opacity-70
                ${currentStep === index ? 'scale-125 opacity-100' : ''}
              `}
              style={{
                animationDelay: `${index * 0.2}s`,
                animationDuration: '2s'
              }}
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>

      {/* Glimmer Logo Animation */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-white/90 to-white/70 rounded-2xl shadow-2xl flex items-center justify-center backdrop-blur-sm border border-white/50">
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              G
            </span>
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
          <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-pink-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Sound Waves Animation */}
      {musicEnabled && (
        <div className="absolute top-1/2 left-8 transform -translate-y-1/2">
          <div className="flex items-end space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-white/60 rounded-full animate-pulse"
                style={{
                  height: `${20 + Math.random() * 30}px`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Magic Sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${1 + Math.random()}s`
            }}
          >
            <Sparkles className="w-4 h-4 text-white/80" />
          </div>
        ))}
      </div>
    </div>
  );
};