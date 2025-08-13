import React from 'react';
import { Settings, Sparkles } from 'lucide-react';
import { useGlimmerStore } from '../store/useGlimmerStore';

interface HeaderProps {
  onSettingsClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  const { preferences } = useGlimmerStore();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className={`font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ${
              preferences.accessibility.largeText ? 'text-2xl' : 'text-xl'
            }`}>
              Glimmer
            </h1>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => {
              console.log('Settings button clicked');
              if (onSettingsClick) {
                onSettingsClick();
              }
            }}
            className={`
              p-2 rounded-lg bg-gray-100 hover:bg-gray-200 
              text-gray-600 hover:text-gray-800 
              transition-all duration-200 hover:scale-105
              focus:outline-none focus:ring-2 focus:ring-purple-400
              ${preferences.accessibility.largeText ? 'p-3' : 'p-2'}
            `}
            aria-label="Open settings"
          >
            <Settings className={`${preferences.accessibility.largeText ? 'w-6 h-6' : 'w-5 h-5'}`} />
          </button>
        </div>
      </div>
    </header>
  );
};