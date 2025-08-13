import { StorySymbol, GeneratedStory } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface CollaborationEvent {
  type: 'symbol_added' | 'symbol_removed' | 'symbol_reordered' | 'emotion_changed' | 'story_generated' | 'user_joined' | 'user_left';
  payload: any;
  userId: string;
  timestamp: number;
  eventId: string;
}

export interface CollaborativeUser {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  isActive: boolean;
  joinedAt: number;
}

export interface CollaborativeSession {
  id: string;
  symbols: StorySymbol[];
  emotion: string;
  users: CollaborativeUser[];
  story?: GeneratedStory;
  createdAt: number;
  lastActivity: number;
}

class CollaborationService {
  private sessionId: string | null = null;
  private userId: string;
  private userName: string;
  private userColor: string;

  // Event callbacks
  private onSessionUpdate: ((session: CollaborativeSession) => void) | null = null;
  private onUserJoined: ((user: CollaborativeUser) => void) | null = null;
  private onUserLeft: ((userId: string) => void) | null = null;
  private onCursorMove: ((userId: string, cursor: { x: number; y: number }) => void) | null = null;
  private onConnectionChange: ((connected: boolean) => void) | null = null;

  constructor() {
    this.userId = this.generateUserId();
    this.userName = this.generateUserName();
    this.userColor = this.generateUserColor();
  }

  /**
   * Initialize collaboration service
   */
  async initialize(): Promise<boolean> {
    console.log('🔧 Using mock collaboration service');
    this.setupMockCollaboration();
    return true;
  }

  /**
   * Setup mock collaboration for development
   */
  private setupMockCollaboration() {
    // Simulate other users joining occasionally
    setTimeout(() => {
      const mockUser: CollaborativeUser = {
        id: 'mock-user-1',
        name: 'Demo User',
        color: '#10b981',
        isActive: true,
        joinedAt: Date.now(),
      };
      this.onUserJoined?.(mockUser);
      
      // Simulate user leaving after 30 seconds
      setTimeout(() => {
        this.onUserLeft?.(mockUser.id);
      }, 30000);
    }, 5000);
  }

  /**
   * Create or join a collaboration session
   */
  async createOrJoinSession(sessionId?: string): Promise<string> {
    this.sessionId = sessionId || this.generateSessionId();
    console.log(`Mock collaboration session: ${this.sessionId}`);
    return this.sessionId;
  }

  /**
   * Leave current session
   */
  leaveSession() {
    console.log('Left mock collaboration session');
    this.sessionId = null;
  }

  /**
   * Broadcast symbol addition
   */
  addSymbol(symbol: StorySymbol, index: number) {
    console.log('Mock: Symbol added', symbol.label);
  }

  /**
   * Broadcast symbol removal
   */
  removeSymbol(symbolId: string) {
    console.log('Mock: Symbol removed', symbolId);
  }

  /**
   * Broadcast symbol reordering
   */
  reorderSymbols(startIndex: number, endIndex: number) {
    console.log('Mock: Symbols reordered', startIndex, endIndex);
  }

  /**
   * Broadcast emotion change
   */
  changeEmotion(emotion: string) {
    console.log('Mock: Emotion changed', emotion);
  }

  /**
   * Update cursor position
   */
  updateCursor(x: number, y: number) {
    console.log('Mock: Cursor updated', x, y);
  }

  /**
   * Generate unique user ID
   */
  private generateUserId(): string {
    const stored = localStorage.getItem('glimmer-user-id');
    if (stored) return stored;
    
    const newId = uuidv4();
    localStorage.setItem('glimmer-user-id', newId);
    return newId;
  }

  /**
   * Generate user name
   */
  private generateUserName(): string {
    const stored = localStorage.getItem('glimmer-user-name');
    if (stored) return stored;
    
    const adjectives = ['Creative', 'Magical', 'Wonderful', 'Amazing', 'Brilliant', 'Fantastic'];
    const nouns = ['Storyteller', 'Artist', 'Dreamer', 'Creator', 'Writer', 'Explorer'];
    
    const name = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
    localStorage.setItem('glimmer-user-name', name);
    return name;
  }

  /**
   * Generate user color
   */
  private generateUserColor(): string {
    const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return uuidv4().substring(0, 8);
  }

  /**
   * Get current user info
   */
  getCurrentUser(): CollaborativeUser {
    return {
      id: this.userId,
      name: this.userName,
      color: this.userColor,
      isActive: true,
      joinedAt: Date.now(),
    };
  }

  /**
   * Check if connected
   */
  isConnectedToSession(): boolean {
    return this.sessionId !== null;
  }

  /**
   * Get session ID
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Set event callbacks
   */
  setEventHandlers(handlers: {
    onSessionUpdate?: (session: CollaborativeSession) => void;
    onUserJoined?: (user: CollaborativeUser) => void;
    onUserLeft?: (userId: string) => void;
    onCursorMove?: (userId: string, cursor: { x: number; y: number }) => void;
    onConnectionChange?: (connected: boolean) => void;
  }) {
    this.onSessionUpdate = handlers.onSessionUpdate || null;
    this.onUserJoined = handlers.onUserJoined || null;
    this.onUserLeft = handlers.onUserLeft || null;
    this.onCursorMove = handlers.onCursorMove || null;
    this.onConnectionChange = handlers.onConnectionChange || null;
  }

  /**
   * Cleanup
   */
  disconnect() {
    console.log('Mock collaboration disconnected');
    this.sessionId = null;
  }
}

export const collaborationService = new CollaborationService();