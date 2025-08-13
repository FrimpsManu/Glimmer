import React, { useEffect, useState } from 'react';
import { StorySymbol } from '../types';
import { useGlimmerStore } from '../store/useGlimmerStore';

interface EnhancedAnimationsProps {
  symbols: StorySymbol[];
  isPlaying: boolean;
  currentWordIndex: number;
}

export const EnhancedAnimations: React.FC<EnhancedAnimationsProps> = ({
  symbols,
  isPlaying,
  currentWordIndex
}) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; emoji: string }>>([]);
  const { preferences } = useGlimmerStore();

  // Generate floating particles
  useEffect(() => {
    if (!isPlaying || preferences.accessibility.reducedMotion) return;

    const interval = setInterval(() => {
      const newParticle = {
        id: Date.now() + Math.random(),
        x: Math.random() * 100,
        y: 100,
        emoji: ['✨', '⭐', '🌟', '💫', '🎭', '🎨'][Math.floor(Math.random() * 6)]
      };
      
      setParticles(prev => [...prev.slice(-10), newParticle]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isPlaying, preferences.accessibility.reducedMotion]);

  // Clean up old particles
  useEffect(() => {
    const cleanup = setTimeout(() => {
      setParticles(prev => prev.slice(-5));
    }, 5000);

    return () => clearTimeout(cleanup);
  }, [particles]);

  if (preferences.accessibility.reducedMotion) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute text-2xl animate-float-up opacity-70"
          style={{
            left: `${particle.x}%`,
            bottom: `${particle.y}%`,
            animation: 'float-up 4s ease-out forwards',
          }}
        >
          {particle.emoji}
        </div>
      ))}

      {/* Symbol Glow Effects */}
      {isPlaying && symbols.map((symbol, index) => {
        const isActive = Math.floor(currentWordIndex / Math.ceil(100 / symbols.length)) === index;
        
        return isActive ? (
          <div
            key={`glow-${symbol.id}-${index}`}
            className="absolute inset-0 bg-gradient-to-r from-primary-400/20 via-secondary-400/20 to-accent-400/20 rounded-xl animate-pulse-glow"
          />
        ) : null;
      })}

      {/* Ripple Effects */}
      {isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 border-2 border-primary-400/30 rounded-full animate-ripple"></div>
          <div className="absolute w-48 h-48 border-2 border-secondary-400/20 rounded-full animate-ripple-delayed"></div>
        </div>
      )}
    </div>
  );
};