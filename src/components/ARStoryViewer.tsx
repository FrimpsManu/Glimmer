import React, { useRef, useEffect, useState } from 'react';
import { Cuboid as Cube, Eye, RotateCcw, Maximize } from 'lucide-react';
import { GeneratedStory } from '../types';
import { useGlimmerStore } from '../store/useGlimmerStore';

interface ARStoryViewerProps {
  story: GeneratedStory;
}

export const ARStoryViewer: React.FC<ARStoryViewerProps> = ({ story }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isARMode, setIsARMode] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isSupported, setIsSupported] = useState(false);
  const { preferences } = useGlimmerStore();

  useEffect(() => {
    // Check for WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    setIsSupported(!!gl);
  }, []);

  useEffect(() => {
    if (isARMode && canvasRef.current) {
      initializeAR();
    }
  }, [isARMode]);

  const initializeAR = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Simple 3D scene setup (mock AR)
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Start animation loop
    animateScene(ctx, canvas);
  };

  const animateScene = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const animate = () => {
      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw 3D-like symbols floating in space
      story.scenes[0]?.symbols.forEach((symbol, index) => {
        const time = Date.now() * 0.001;
        const x = canvas.width / 2 + Math.cos(time + index) * 200;
        const y = canvas.height / 2 + Math.sin(time + index * 0.5) * 150;
        const scale = 1 + Math.sin(time + index) * 0.3;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.rotate(rotation.y * 0.01);
        
        // Draw symbol with 3D effect
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Shadow for depth
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillText(symbol.value, 2, 2);
        
        // Main symbol
        ctx.fillStyle = `hsl(${(index * 60) % 360}, 70%, 60%)`;
        ctx.fillText(symbol.value, 0, 0);
        
        ctx.restore();
      });

      // Draw story text in 3D space
      ctx.font = '16px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      const words = story.content.split(' ');
      words.slice(0, 20).forEach((word, index) => {
        const x = canvas.width / 2 + (index % 5 - 2) * 120;
        const y = canvas.height - 100 + Math.floor(index / 5) * 25;
        ctx.fillText(word, x, y);
      });

      if (isARMode) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isARMode) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setRotation({
      x: (y - rect.height / 2) / 10,
      y: (x - rect.width / 2) / 10,
    });
  };

  const resetView = () => {
    setRotation({ x: 0, y: 0 });
  };

  if (!isSupported) {
    return (
      <div className="text-center p-6 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <p className="text-gray-600 dark:text-gray-400">
          3D/AR viewing requires WebGL support
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toggle Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsARMode(!isARMode)}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold shadow-lg
            transition-all duration-200 hover:scale-105
            focus:outline-none focus:ring-2 focus:ring-cyan-400
            ${isARMode 
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
              : 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-600 hover:to-cyan-700'
            }
            ${preferences.accessibility.largeText ? 'text-lg px-6 py-3' : 'text-base'}
          `}
        >
          {isARMode ? (
            <>
              <Eye className="w-5 h-5" />
              <span>Exit 3D View</span>
            </>
          ) : (
            <>
              <Cube className="w-5 h-5" />
              <span>3D Story View</span>
            </>
          )}
        </button>

        {isARMode && (
          <div className="flex space-x-2">
            <button
              onClick={resetView}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Reset view"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => canvasRef.current?.requestFullscreen()}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* AR Canvas */}
      {isARMode && (
        <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl">
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            className="w-full h-96 cursor-move"
            style={{ background: 'linear-gradient(45deg, #1a1a2e, #16213e)' }}
          />
          
          {/* AR Overlay UI */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg">
            <p className="text-sm font-medium">{story.title}</p>
            <p className="text-xs opacity-75">Move mouse to rotate • Scroll to zoom</p>
          </div>
          
          {/* AR Controls */}
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <div className="bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-xs">
              Rotation: {Math.round(rotation.x)}°, {Math.round(rotation.y)}°
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {isARMode && (
        <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-4 border border-cyan-200 dark:border-cyan-700">
          <h4 className={`font-semibold text-cyan-700 dark:text-cyan-300 mb-2 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
            🌟 3D Story Experience
          </h4>
          <ul className={`text-cyan-600 dark:text-cyan-400 space-y-1 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
            <li>• Move your mouse to rotate the story in 3D space</li>
            <li>• Watch symbols float and dance around your story</li>
            <li>• Click fullscreen for an immersive experience</li>
            <li>• Each symbol has its own orbit and animation</li>
          </ul>
        </div>
      )}
    </div>
  );
};