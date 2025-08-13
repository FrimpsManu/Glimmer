import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { X } from 'lucide-react';
import { StorySymbol } from '../types';
import { useGlimmerStore } from '../store/useGlimmerStore';

interface DraggableSymbolProps {
  symbol: StorySymbol;
  index: number;
  onRemove: (symbolId: string) => void;
}

export const DraggableSymbol: React.FC<DraggableSymbolProps> = ({ 
  symbol, 
  index, 
  onRemove 
}) => {
  const { reorderSymbolsInScene, preferences } = useGlimmerStore();

  const [{ isDragging }, drag] = useDrag({
    type: 'symbol',
    item: { id: symbol.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'symbol',
    hover: (item: { id: string; index: number }) => {
      if (item.index !== index) {
        reorderSymbolsInScene(item.index, index);
        item.index = index;
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const ref = React.useRef<HTMLDivElement>(null);
  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`
        relative group cursor-move transition-all duration-200
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100'}
        ${isOver ? 'scale-105' : 'scale-100'}
        ${preferences.accessibility.reducedMotion ? 'transition-none' : ''}
      `}
      role="button"
      aria-label={`${symbol.label} story element, position ${index + 1}`}
      tabIndex={0}
    >
      {/* Symbol Container */}
      <div className={`
        relative p-4 rounded-xl bg-white dark:bg-gray-800 
        border-2 border-primary-200 dark:border-primary-700
        shadow-md hover:shadow-lg
        ${preferences.accessibility.highContrast 
          ? 'border-gray-900 dark:border-gray-100' 
          : ''
        }
      `}>
        {/* Symbol */}
        <div className={`text-center ${preferences.accessibility.largeText ? 'text-3xl' : 'text-2xl'}`}>
          {symbol.value}
        </div>
        
        {/* Label */}
        <div className={`
          text-center mt-2 font-medium text-gray-700 dark:text-gray-300
          ${preferences.accessibility.largeText ? 'text-base' : 'text-xs'}
        `}>
          {symbol.label}
        </div>

        {/* Remove Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(symbol.id);
          }}
          className={`
            absolute -top-2 -right-2 w-6 h-6 
            bg-red-500 text-white rounded-full 
            opacity-0 group-hover:opacity-100
            hover:bg-red-600 transition-all duration-200
            focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-400
            flex items-center justify-center
            ${preferences.accessibility.reducedMotion ? 'opacity-100' : ''}
          `}
          aria-label={`Remove ${symbol.label} from story`}
        >
          <X className="w-3 h-3" />
        </button>

        {/* Position Indicator */}
        <div className={`
          absolute -bottom-1 -left-1 w-6 h-6
          bg-primary-500 text-white text-xs
          rounded-full flex items-center justify-center
          font-bold shadow-md
          ${preferences.accessibility.largeText ? 'w-8 h-8 text-sm' : ''}
        `}>
          {index + 1}
        </div>
      </div>

      {/* Drag Handle Visual Indicator */}
      <div className={`
        absolute top-1 right-1 w-4 h-4
        opacity-0 group-hover:opacity-50
        transition-opacity duration-200
        ${preferences.accessibility.reducedMotion ? 'opacity-50' : ''}
      `}>
        <div className="grid grid-cols-2 gap-0.5 w-full h-full">
          <div className="bg-gray-400 rounded-sm"></div>
          <div className="bg-gray-400 rounded-sm"></div>
          <div className="bg-gray-400 rounded-sm"></div>
          <div className="bg-gray-400 rounded-sm"></div>
        </div>
      </div>
    </div>
  );
};