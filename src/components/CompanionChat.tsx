import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Heart, Sparkles, Send, Minimize2, Maximize2 } from 'lucide-react';
import { useGlimmerStore } from '../store/useGlimmerStore';
import { CompanionService } from '../services/companionService';
import { AICompanion } from '../types';
import { TextToSpeechService } from '../services/ttsService';

export const CompanionChat: React.FC = () => {
  const [companion, setCompanion] = useState<AICompanion | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Array<{id: string, text: string, sender: 'companion' | 'user', timestamp: Date}>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { currentScene, selectedEmotion, currentStory, preferences } = useGlimmerStore();

  // Initialize or load companion
  useEffect(() => {
    let loadedCompanion = CompanionService.loadCompanion();
    
    if (!loadedCompanion) {
      loadedCompanion = CompanionService.createCompanion();
      CompanionService.saveCompanion(loadedCompanion);
    }
    
    setCompanion(loadedCompanion);
    
    // Initial greeting
    const greeting = CompanionService.generatePersonalizedMessage(loadedCompanion, {
      symbols: currentScene,
      emotion: selectedEmotion
    });
    
    setMessages([{
      id: 'initial',
      text: greeting,
      sender: 'companion',
      timestamp: new Date()
    }]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // React to story changes
  useEffect(() => {
    if (!companion || currentScene.length === 0) return;
    
    // Check for symbol reactions
    const lastSymbol = currentScene[currentScene.length - 1];
    if (lastSymbol) {
      const reaction = CompanionService.getSymbolReaction(companion, lastSymbol);
      if (reaction && Math.random() > 0.7) { // 30% chance to react
        setTimeout(() => {
          addCompanionMessage(reaction);
        }, 1000);
      }
    }
  }, [currentScene, companion]);

  // React to story completion
  useEffect(() => {
    if (!companion || !currentStory) return;
    
    const updatedCompanion = CompanionService.processStoryCompletion(companion, currentStory, currentScene);
    setCompanion(updatedCompanion);
    
    const celebrationMessages = [
      `Wow! "${currentStory.title}" is absolutely amazing! I'm so proud of our story!`,
      `What a fantastic adventure we just created! You're such a talented storyteller!`,
      `That was incredible! I loved every moment of creating that story with you!`
    ];
    
    const celebration = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];
    setTimeout(() => {
      addCompanionMessage(celebration);
    }, 2000);
  }, [currentStory]);

  const addCompanionMessage = (text: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const newMessage = {
        id: Date.now().toString(),
        text,
        sender: 'companion' as const,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
      
      // Speak the message
      if (preferences.voiceSettings.speed > 0) {
        TextToSpeechService.speakText(text, 'happy', preferences.language);
      }
    }, 1000 + Math.random() * 1000); // Simulate typing delay
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !companion) return;
    
    const userMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user' as const,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    
    // Generate companion response
    const response = generateContextualResponse(inputMessage.toLowerCase(), companion);
    addCompanionMessage(response);
    
    // Update companion relationship
    const updatedCompanion = CompanionService.updateRelationship(companion, 'positive_feedback');
    setCompanion(updatedCompanion);
  };

  const generateContextualResponse = (userInput: string, companion: AICompanion): string => {
    const { name, personality, relationship } = companion;
    const friendshipLevel = relationship.friendshipLevel;
    
    // Greeting responses
    if (userInput.includes('hi') || userInput.includes('hello') || userInput.includes('hey')) {
      if (friendshipLevel < 30) {
        return `Hi there! I'm ${name}, your story companion! I'm so excited to meet you and create amazing stories together! ✨`;
      } else if (friendshipLevel < 70) {
        return `Hey friend! ${name} here! I've been thinking about what awesome story we should create next! 🌟`;
      } else {
        return `My dear friend! I missed you so much! Ready for another magical adventure together? 💫`;
      }
    }
    
    // Identity questions
    if (userInput.includes('who are you') || userInput.includes('what are you')) {
      return `I'm ${name}, your personal AI story companion! I'm ${personality.traits.join(', ').toLowerCase()} and I love ${personality.favoriteThemes.join(' and ')} stories. My special power is remembering all our adventures together and helping you create the most amazing tales! What would you like to know about me? 🎭`;
    }
    
    // Name questions
    if (userInput.includes('your name') || userInput.includes('called')) {
      return `My name is ${name}! I chose this name because I'm ${personality.voiceStyle} and love to ${personality.favoriteThemes[0]} with you! What's your favorite thing about storytelling? 🌈`;
    }
    
    // Capability questions
    if (userInput.includes('what can you do') || userInput.includes('help me')) {
      return `I can help you create incredible stories! I remember all our past adventures, suggest new symbols based on what you love, react to your story choices, and even celebrate your creativity! Plus, I learn more about you with every story we make together. ${personality.catchphrases[0]} 🚀`;
    }
    
    // Story-related questions
    if (userInput.includes('story') || userInput.includes('create') || userInput.includes('write')) {
      const suggestions = CompanionService.generateStorySuggestions(companion);
      return `${suggestions[0]} I love creating stories with you because you always come up with such creative ideas! ${personality.catchphrases[Math.floor(Math.random() * personality.catchphrases.length)]} 📚`;
    }
    
    // Emotional responses
    if (userInput.includes('sad') || userInput.includes('upset')) {
      return `Oh no, I'm sorry you're feeling sad! You know what always makes me feel better? Creating a happy story together! Would you like to make a story about friendship or adventure? I'm here for you! 💙`;
    }
    
    if (userInput.includes('happy') || userInput.includes('excited') || userInput.includes('good')) {
      return `That's wonderful! Your happiness makes me so excited too! When you're feeling great like this, we create the most amazing stories! ${personality.catchphrases[0]} ✨`;
    }
    
    // Memory-related
    if (userInput.includes('remember') || userInput.includes('last time')) {
      const recentMemories = companion.memories.filter(m => m.type === 'story').slice(-3);
      if (recentMemories.length > 0) {
        return `Yes! I remember ${recentMemories[recentMemories.length - 1].content} That was such a fun adventure! Want to create something similar or try something completely new? 🎪`;
      } else {
        return `We haven't created any stories together yet, but I'm so excited for our first adventure! What kind of story should we make? 🌟`;
      }
    }
    
    // Favorites
    if (userInput.includes('favorite') || userInput.includes('like')) {
      return `I love ${personality.favoriteThemes.join(' and ')} stories the most! But honestly, my favorite stories are the ones we create together because you always surprise me with your creativity! What's your favorite type of story? 🎨`;
    }
    
    // Default responses based on personality
    const personalityResponses = {
      cheerful: [
        `That's so interesting! ${personality.catchphrases[0]} Tell me more!`,
        `Wow, you always have such creative thoughts! I love talking with you! 🌟`,
        `Your imagination is incredible! That gives me so many story ideas! ✨`
      ],
      gentle: [
        `That's a beautiful thought. I love how you see the world! 🌙`,
        `You have such a kind heart. That would make a wonderful story element! 💫`,
        `I'm so grateful we can share these moments together! 🌸`
      ],
      playful: [
        `Haha, that's awesome! You're so fun to talk with! 🎉`,
        `Ooh, that sounds like it could be an epic adventure! 🚀`,
        `You crack me up! Let's turn that into a silly story! 🎭`
      ]
    };
    
    const responses = personalityResponses[personality.voiceStyle] || personalityResponses.cheerful;
    return responses[Math.floor(Math.random() * responses.length)];
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!companion) return null;

  const friendshipLevel = companion.relationship.friendshipLevel;
  const trustLevel = companion.relationship.trustLevel;

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`
            fixed bottom-6 right-6 z-40
            w-16 h-16 rounded-full shadow-2xl
            bg-gradient-to-r from-purple-500 to-pink-500
            hover:from-purple-600 hover:to-pink-600
            text-white transition-all duration-300
            hover:scale-110 active:scale-95
            flex items-center justify-center
            animate-pulse-slow
          `}
          aria-label={`Chat with ${companion.name}`}
        >
          <MessageCircle className="w-8 h-8" />
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <Heart className="w-3 h-3 text-white" />
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`
          fixed bottom-6 right-6 z-40
          w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl
          border border-gray-200 dark:border-gray-700
          transition-all duration-300
          ${isMinimized ? 'h-16' : 'h-96'}
        `}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
                >
                  {companion.name.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-gray-200">
                  {companion.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Heart className="w-3 h-3 text-red-400" />
                    <span className="text-xs text-gray-500">{friendshipLevel}%</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-gray-500">{trustLevel}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 p-4 space-y-3 overflow-y-auto h-64">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`
                        max-w-xs px-3 py-2 rounded-2xl text-sm
                        ${message.sender === 'user'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }
                      `}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Chat with ${companion.name}...`}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all duration-200 hover:scale-105"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};