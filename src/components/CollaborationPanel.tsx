import React, { useState, useEffect } from 'react';
import { Users, Share2, Copy, Check, Wifi, WifiOff, Crown } from 'lucide-react';
import { collaborationService, CollaborativeUser } from '../services/collaborationService';
import { useGlimmerStore } from '../store/useGlimmerStore';

export const CollaborationPanel: React.FC = () => {
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<CollaborativeUser[]>([]);
  const [isConnected, setIsConnected] = useState(true); // Always connected in mock mode
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const { preferences } = useGlimmerStore();

  useEffect(() => {
    // Initialize collaboration service
    const initCollaboration = async () => {
      const success = await collaborationService.initialize();
      if (success) {
        setupEventHandlers();
      }
    };

    initCollaboration();

    return () => {
      collaborationService.disconnect();
    };
  }, []);

  const setupEventHandlers = () => {
    collaborationService.setEventHandlers({
      onUserJoined: (user: CollaborativeUser) => {
        setConnectedUsers(prev => [...prev.filter(u => u.id !== user.id), user]);
        
        // Show notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
        notification.textContent = `${user.name} joined the story!`;
        document.body.appendChild(notification);
        setTimeout(() => document.body.removeChild(notification), 3000);
      },
      
      onUserLeft: (userId: string) => {
        const user = connectedUsers.find(u => u.id === userId);
        setConnectedUsers(prev => prev.filter(u => u.id !== userId));
        
        if (user) {
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
          notification.textContent = `${user.name} left the story`;
          document.body.appendChild(notification);
          setTimeout(() => document.body.removeChild(notification), 3000);
        }
      },
      
      onConnectionChange: (connected: boolean) => {
        // Mock mode is always connected
        setIsConnected(true);
      },
    });
  };

  const startCollaboration = async () => {
    try {
      const newSessionId = await collaborationService.createOrJoinSession();
      setSessionId(newSessionId);
      setIsCollaborating(true);
      setShowShareModal(true);
      
      // Add current user to the list
      const currentUser = collaborationService.getCurrentUser();
      setConnectedUsers([currentUser]);
      
    } catch (error) {
      console.error('Failed to start collaboration:', error);
    }
  };

  const joinSession = async (sessionIdToJoin: string) => {
    try {
      await collaborationService.createOrJoinSession(sessionIdToJoin);
      setSessionId(sessionIdToJoin);
      setIsCollaborating(true);
      
      const currentUser = collaborationService.getCurrentUser();
      setConnectedUsers([currentUser]);
      
    } catch (error) {
      console.error('Failed to join session:', error);
    }
  };

  const stopCollaboration = () => {
    collaborationService.leaveSession();
    setIsCollaborating(false);
    setSessionId(null);
    setConnectedUsers([]);
    setShowShareModal(false);
  };

  const copySessionLink = async () => {
    if (!sessionId) return;
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?session=${sessionId}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareSession = async () => {
    if (!sessionId) return;
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?session=${sessionId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Glimmer story!',
          text: 'Let\'s create a magical story together!',
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        copySessionLink();
      }
    } else {
      copySessionLink();
    }
  };

  // Check for session ID in URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlSessionId = urlParams.get('session');
    
    if (urlSessionId && !isCollaborating) {
      joinSession(urlSessionId);
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Collaboration Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Users className="w-5 h-5 text-primary-500" />
            {isConnected && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            )}
          </div>
          <div>
            <h3 className={`font-semibold text-gray-700 dark:text-gray-300 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
              Collaborate
            </h3>
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="w-3 h-3 text-green-500" />
              ) : (
                <WifiOff className="w-3 h-3 text-gray-400" />
              )}
              <span className={`text-xs ${isConnected ? 'text-green-600' : 'text-gray-400'}`}>
                {isConnected ? 'Connected' : 'Offline Mode'}
              </span>
            </div>
          </div>
        </div>

        {!isCollaborating ? (
          <button
            onClick={startCollaboration}
            className={`
              px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500
              hover:from-primary-600 hover:to-secondary-600
              text-white font-semibold shadow-lg
              transition-all duration-200 hover:scale-105
              focus:outline-none focus:ring-2 focus:ring-primary-400
              ${preferences.accessibility.largeText ? 'text-base px-6 py-3' : 'text-sm'}
            `}
          >
            Start Session
          </button>
        ) : (
          <button
            onClick={stopCollaboration}
            className={`
              px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600
              text-white font-semibold shadow-lg
              transition-all duration-200 hover:scale-105
              focus:outline-none focus:ring-2 focus:ring-red-400
              ${preferences.accessibility.largeText ? 'text-base px-6 py-3' : 'text-sm'}
            `}
          >
            End Session
          </button>
        )}
      </div>

      {/* Connected Users */}
      {isCollaborating && connectedUsers.length > 0 && (
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl p-4 border border-primary-200 dark:border-primary-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className={`font-semibold text-primary-700 dark:text-primary-300 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
              Story Creators ({connectedUsers.length})
            </h4>
            <button
              onClick={() => setShowShareModal(true)}
              className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
              aria-label="Share collaboration session"
            >
              <Share2 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </button>
          </div>

          <div className="space-y-2">
            {connectedUsers.map((user, index) => (
              <div
                key={user.id}
                className="flex items-center space-x-3 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
                  style={{ backgroundColor: user.color }}
                >
                  {index === 0 && <Crown className="w-4 h-4" />}
                  {index !== 0 && user.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className={`font-medium text-gray-800 dark:text-gray-200 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                    {user.name}
                    {index === 0 && (
                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Host
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Active</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && sessionId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className={`font-bold text-gray-800 dark:text-gray-200 mb-2 ${preferences.accessibility.largeText ? 'text-xl' : 'text-lg'}`}>
                Invite Others to Collaborate!
              </h3>
              <p className={`text-gray-600 dark:text-gray-400 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                Share this link so others can join your story session
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className={`text-gray-600 dark:text-gray-400 mb-2 font-medium ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                  Session ID:
                </p>
                <div className="font-mono text-lg font-bold text-center text-primary-600 dark:text-primary-400 bg-white dark:bg-gray-800 rounded-lg py-2">
                  {sessionId}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={shareSession}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>

                <button
                  onClick={copySessionLink}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>

              <button
                onClick={() => setShowShareModal(false)}
                className="w-full py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};