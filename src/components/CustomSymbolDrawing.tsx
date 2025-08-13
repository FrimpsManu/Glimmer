import React, { useRef, useState, useEffect } from 'react';
import { Palette, Save, Trash2, Undo, Download } from 'lucide-react';
import { useGlimmerStore } from '../store/useGlimmerStore';
import { StorySymbol } from '../types';

export const CustomSymbolDrawing: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#8b5cf6');
  const [brushSize, setBrushSize] = useState(5);
  const [showDrawingTool, setShowDrawingTool] = useState(false);
  const [symbolName, setSymbolName] = useState('');
  const [drawingHistory, setDrawingHistory] = useState<ImageData[]>([]);
  const { addSymbolToScene, preferences } = useGlimmerStore();

  const colors = [
    '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', 
    '#ef4444', '#8b5cf6', '#6b7280', '#000000', '#ffffff'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Set canvas background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Save initial state
        saveToHistory(ctx);
      }
    }
  }, [showDrawingTool]);

  const saveToHistory = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setDrawingHistory(prev => [...prev.slice(-9), imageData]); // Keep last 10 states
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          saveToHistory(ctx);
        }
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory(ctx);
  };

  const undo = () => {
    if (drawingHistory.length > 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const newHistory = drawingHistory.slice(0, -1);
      const previousState = newHistory[newHistory.length - 1];
      
      ctx.putImageData(previousState, 0, 0);
      setDrawingHistory(newHistory);
    }
  };

  const saveCustomSymbol = () => {
    const canvas = canvasRef.current;
    if (!canvas || !symbolName.trim()) return;

    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL('image/png');
    
    // Create custom symbol
    const customSymbol: StorySymbol = {
      id: `custom-${Date.now()}`,
      type: 'custom',
      value: dataUrl,
      category: 'objects',
      label: symbolName.trim(),
      semanticMeaning: `custom drawn ${symbolName.trim()}`,
    };

    // Add to story
    addSymbolToScene(customSymbol);
    
    // Save to localStorage for future use
    const savedCustomSymbols = JSON.parse(localStorage.getItem('glimmer-custom-symbols') || '[]');
    savedCustomSymbols.push(customSymbol);
    localStorage.setItem('glimmer-custom-symbols', JSON.stringify(savedCustomSymbols));

    // Reset
    setSymbolName('');
    clearCanvas();
    setShowDrawingTool(false);

    // Provide feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }

    // Announce for screen readers
    const announcement = `Custom symbol "${symbolName}" created and added to story`;
    const ariaLive = document.createElement('div');
    ariaLive.setAttribute('aria-live', 'polite');
    ariaLive.className = 'sr-only';
    ariaLive.textContent = announcement;
    document.body.appendChild(ariaLive);
    setTimeout(() => document.body.removeChild(ariaLive), 2000);
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${symbolName || 'drawing'}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Toggle Button */}
      <button
        onClick={() => setShowDrawingTool(!showDrawingTool)}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-xl
          bg-gradient-to-r from-pink-500 to-purple-600
          hover:from-pink-600 hover:to-purple-700
          text-white font-semibold shadow-lg
          transition-all duration-200 hover:scale-105
          focus:outline-none focus:ring-2 focus:ring-pink-400
          ${preferences.accessibility.largeText ? 'text-lg px-6 py-3' : 'text-base'}
        `}
        aria-label="Open custom symbol drawing tool"
      >
        <Palette className="w-5 h-5" />
        <span>Draw Custom Symbol</span>
      </button>

      {/* Drawing Tool */}
      {showDrawingTool && (
        <div className={`
          bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl border-2 border-pink-200 dark:border-pink-700
          animate-fade-in
        `}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-bold text-gray-800 dark:text-gray-200 ${preferences.accessibility.largeText ? 'text-xl' : 'text-lg'}`}>
              Create Your Symbol
            </h3>
            <button
              onClick={() => setShowDrawingTool(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close drawing tool"
            >
              ✕
            </button>
          </div>

          {/* Symbol Name Input */}
          <div className="mb-4">
            <label className={`block font-medium text-gray-700 dark:text-gray-300 mb-2 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
              What is this symbol?
            </label>
            <input
              type="text"
              value={symbolName}
              onChange={(e) => setSymbolName(e.target.value)}
              placeholder="e.g., My Pet, Favorite Toy, etc."
              className={`
                w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200
                focus:outline-none focus:ring-2 focus:ring-pink-500
                ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}
              `}
            />
          </div>

          {/* Drawing Tools */}
          <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            {/* Color Palette */}
            <div className="flex items-center space-x-2">
              <span className={`font-medium text-gray-700 dark:text-gray-300 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                Color:
              </span>
              <div className="flex space-x-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setCurrentColor(color)}
                    className={`
                      w-8 h-8 rounded-full border-2 transition-all duration-200
                      ${currentColor === color ? 'border-gray-800 dark:border-gray-200 scale-110' : 'border-gray-300 dark:border-gray-600'}
                      hover:scale-110
                    `}
                    style={{ backgroundColor: color }}
                    aria-label={`Select ${color} color`}
                  />
                ))}
              </div>
            </div>

            {/* Brush Size */}
            <div className="flex items-center space-x-2">
              <span className={`font-medium text-gray-700 dark:text-gray-300 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                Size:
              </span>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 w-6">
                {brushSize}
              </span>
            </div>
          </div>

          {/* Canvas */}
          <div className="mb-4 flex justify-center">
            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-crosshair bg-white"
              style={{ touchAction: 'none' }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between space-x-2">
            <div className="flex space-x-2">
              <button
                onClick={undo}
                disabled={drawingHistory.length <= 1}
                className={`
                  flex items-center space-x-1 px-3 py-2 rounded-lg
                  bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400
                  ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}
                `}
                aria-label="Undo last drawing action"
              >
                <Undo className="w-4 h-4" />
                <span>Undo</span>
              </button>

              <button
                onClick={clearCanvas}
                className={`
                  flex items-center space-x-1 px-3 py-2 rounded-lg
                  bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300
                  hover:bg-red-200 dark:hover:bg-red-800
                  transition-colors focus:outline-none focus:ring-2 focus:ring-red-400
                  ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}
                `}
                aria-label="Clear canvas"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear</span>
              </button>

              <button
                onClick={downloadDrawing}
                className={`
                  flex items-center space-x-1 px-3 py-2 rounded-lg
                  bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300
                  hover:bg-blue-200 dark:hover:bg-blue-800
                  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400
                  ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}
                `}
                aria-label="Download drawing"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>

            <button
              onClick={saveCustomSymbol}
              disabled={!symbolName.trim()}
              className={`
                flex items-center space-x-2 px-6 py-2 rounded-lg
                bg-gradient-to-r from-green-500 to-green-600
                hover:from-green-600 hover:to-green-700
                disabled:from-gray-400 disabled:to-gray-500
                text-white font-semibold shadow-lg
                transition-all duration-200 hover:scale-105
                disabled:cursor-not-allowed disabled:hover:scale-100
                focus:outline-none focus:ring-2 focus:ring-green-400
                ${preferences.accessibility.largeText ? 'text-lg px-8 py-3' : 'text-base'}
              `}
              aria-label="Save custom symbol and add to story"
            >
              <Save className="w-5 h-5" />
              <span>Add to Story</span>
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className={`text-blue-700 dark:text-blue-300 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
              💡 <strong>Tip:</strong> Draw something meaningful to your child - their pet, favorite toy, or family member. 
              This makes the story more personal and engaging!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};