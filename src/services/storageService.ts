import { createClient } from '@supabase/supabase-js';
import { GeneratedStory, UserPreferences } from '../types';

// Supabase configuration (placeholder - replace with real values)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://lljckdrdublmzcemvorx.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsamNrZHJkdWJsbXpjZW12b3J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NzMxNjMsImV4cCI6MjA3MDI0OTE2M30.vFUSBaY36JSOer0Vxuc2ZHD7rp9d1_4FxrZW9cJuhTU';
// Check if Supabase is properly configured
const isSupabaseConfigured = SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  SUPABASE_URL.startsWith('https://') && 
  SUPABASE_ANON_KEY.length > 20 &&
  SUPABASE_URL.includes('supabase.co') &&
  SUPABASE_ANON_KEY.startsWith('eyJ');
const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Log configuration status
if (isSupabaseConfigured) {
  console.log('✅ Supabase configured successfully');
} else {
  console.log('⚠️ Supabase not configured, using local storage fallback');
}

export class StorageService {
  /**
   * Save story to Supabase (with local fallback)
   */
  static async saveStory(story: GeneratedStory): Promise<void> {
    try {
      // Try Supabase first
      if (supabase) {
        const { error } = await supabase
          .from('stories')
          .insert([
            {
              id: story.id,
              title: story.title,
              content: story.content,
              scenes: story.scenes,
              created_at: story.createdAt.toISOString(),
              mood: story.mood,
              audio_url: story.audioUrl,
            }
          ]);

        if (error) throw error;
      } else {
        // Fallback to localStorage
        console.log('Using local storage for story saving (Supabase not configured)');
        this.saveStoryLocally(story);
      }
    } catch (error) {
      console.warn('Supabase error, falling back to local storage:', error);
      this.saveStoryLocally(story);
    }
  }

  /**
   * Load stories from Supabase (with local fallback)
   */
  static async loadStories(): Promise<GeneratedStory[]> {
    try {
      // Try Supabase first
      if (supabase) {
        const { data, error } = await supabase
          .from('stories')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        return data?.map(story => ({
          id: story.id,
          title: story.title,
          content: story.content,
          scenes: story.scenes,
          createdAt: new Date(story.created_at),
          mood: story.mood,
          audioUrl: story.audio_url,
        })) || [];
      } else {
        // Fallback to localStorage
        console.log('Using local storage for story loading (Supabase not configured)');
        return this.loadStoriesLocally();
      }
    } catch (error) {
      console.warn('Supabase error, falling back to local storage:', error);
      return this.loadStoriesLocally();
    }
  }

  /**
   * Load a specific story by ID from Supabase (with local fallback)
   */
  static async loadStoryById(storyId: string): Promise<GeneratedStory | null> {
    try {
      // Try Supabase first
      if (supabase) {
        const { data, error } = await supabase
          .from('stories')
          .select('*')
          .eq('id', storyId)
          .single();

        if (error) throw error;

        return data ? {
          id: data.id,
          title: data.title,
          content: data.content,
          scenes: data.scenes,
          createdAt: new Date(data.created_at),
          mood: data.mood,
          audioUrl: data.audio_url,
        } : null;
      } else {
        // Fallback to localStorage
        console.log('Using local storage for story loading by ID (Supabase not configured)');
        return this.loadStoryByIdLocally(storyId);
      }
    } catch (error) {
      console.warn('Supabase error, falling back to local storage:', error);
      return this.loadStoryByIdLocally(storyId);
    }
  }

  /**
   * Delete story from Supabase (with local fallback)
   */
  static async deleteStory(storyId: string): Promise<void> {
    try {
      // Try Supabase first
      if (supabase) {
        const { error } = await supabase
          .from('stories')
          .delete()
          .eq('id', storyId);

        if (error) throw error;
      } else {
        // Fallback to localStorage
        console.log('Using local storage for story deletion (Supabase not configured)');
        this.deleteStoryLocally(storyId);
      }
    } catch (error) {
      console.warn('Supabase error, falling back to local storage:', error);
      this.deleteStoryLocally(storyId);
    }
  }

  /**
   * Save user preferences
   */
  static async savePreferences(preferences: UserPreferences): Promise<void> {
    try {
      localStorage.setItem('glimmer-preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }

  /**
   * Load user preferences
   */
  static async loadPreferences(): Promise<UserPreferences | null> {
    try {
      const stored = localStorage.getItem('glimmer-preferences');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading preferences:', error);
      return null;
    }
  }

  /**
   * Local storage methods (fallback)
   */
  private static saveStoryLocally(story: GeneratedStory): void {
    try {
      const existingStories = this.loadStoriesLocally();
      const updatedStories = [story, ...existingStories.filter(s => s.id !== story.id)];
      localStorage.setItem('glimmer-stories', JSON.stringify(updatedStories));
    } catch (error) {
      console.error('Error saving story locally:', error);
    }
  }

  private static loadStoriesLocally(): GeneratedStory[] {
    try {
      const stored = localStorage.getItem('glimmer-stories');
      if (!stored) return [];
      
      const stories = JSON.parse(stored);
      return stories.map((story: any) => ({
        ...story,
        createdAt: new Date(story.createdAt),
      }));
    } catch (error) {
      console.error('Error loading stories locally:', error);
      return [];
    }
  }

  private static loadStoryByIdLocally(storyId: string): GeneratedStory | null {
    try {
      const existingStories = this.loadStoriesLocally();
      const story = existingStories.find(s => s.id === storyId);
      return story || null;
    } catch (error) {
      console.error('Error loading story by ID locally:', error);
      return null;
    }
  }

  private static deleteStoryLocally(storyId: string): void {
    try {
      const existingStories = this.loadStoriesLocally();
      const updatedStories = existingStories.filter(s => s.id !== storyId);
      localStorage.setItem('glimmer-stories', JSON.stringify(updatedStories));
    } catch (error) {
      console.error('Error deleting story locally:', error);
    }
  }

  /**
   * Export story as text file
   */
  static exportStoryAsText(story: GeneratedStory): void {
    try {
      const textContent = `${story.title}\n\nCreated: ${story.createdAt.toLocaleString()}\nMood: ${story.mood}\n\n${story.content}`;
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting story:', error);
    }
  }

  /**
   * Clear all local data (for privacy)
   */
  static clearAllData(): void {
    try {
      localStorage.removeItem('glimmer-stories');
      localStorage.removeItem('glimmer-preferences');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
}