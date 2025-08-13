import { GeneratedStory, StorySymbol, VisualElement, ArtStyle, AnimationType } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class VisualStoryService {
  private static readonly PLACEHOLDER_API = 'https://picsum.photos'; // Placeholder for demo
  
  /**
   * Generate visual storybook from story
   */
  static async generateVisualStorybook(
    story: GeneratedStory, 
    symbols: StorySymbol[], 
    artStyle: ArtStyle = 'storybook'
  ): Promise<VisualStorybook> {
    const pages = await this.createStoryPages(story, symbols, artStyle);
    const coverImage = await this.generateCoverImage(story, artStyle);
    
    return {
      id: uuidv4(),
      storyId: story.id,
      title: story.title,
      artStyle,
      coverImage,
      pages,
      createdAt: new Date()
    };
  }

  /**
   * Create visual pages from story content
   */
  private static async createStoryPages(
    story: GeneratedStory, 
    symbols: StorySymbol[], 
    artStyle: ArtStyle
  ): Promise<StoryPage[]> {
    const sentences = story.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const pages: StoryPage[] = [];
    
    // Group sentences into pages (2-3 sentences per page)
    for (let i = 0; i < sentences.length; i += 2) {
      const pageSentences = sentences.slice(i, i + 2);
      const pageText = pageSentences.join('. ').trim() + '.';
      
      const visualElements = await this.generatePageVisuals(pageText, symbols, artStyle);
      const backgroundImage = await this.generateBackgroundImage(pageText, artStyle);
      
      pages.push({
        id: `page-${i}`,
        pageNumber: Math.floor(i / 2) + 1,
        text: pageText,
        backgroundImage,
        visualElements,
        animations: this.generatePageAnimations(visualElements)
      });
    }
    
    return pages;
  }

  /**
   * Generate visual elements for a page
   */
  private static async generatePageVisuals(
    text: string, 
    symbols: StorySymbol[], 
    artStyle: ArtStyle
  ): Promise<VisualElement[]> {
    const elements: VisualElement[] = [];
    const lowerText = text.toLowerCase();
    
    // Find relevant symbols mentioned in text
    symbols.forEach((symbol, index) => {
      if (lowerText.includes(symbol.label.toLowerCase()) || 
          lowerText.includes(symbol.semanticMeaning?.toLowerCase() || '')) {
        
        elements.push({
          id: `element-${symbol.id}-${index}`,
          type: this.getElementType(symbol.category),
          description: this.generateVisualDescription(symbol, artStyle),
          style: artStyle,
          position: this.generatePosition(index, elements.length),
          animation: this.selectAnimation(symbol.category)
        });
      }
    });
    
    // Add contextual elements based on text content
    const contextualElements = this.generateContextualElements(text, artStyle);
    elements.push(...contextualElements);
    
    return elements;
  }

  /**
   * Get element type from symbol category
   */
  private static getElementType(category: string): 'character' | 'background' | 'object' | 'effect' {
    const typeMap: Record<string, 'character' | 'background' | 'object' | 'effect'> = {
      'characters': 'character',
      'animals': 'character',
      'places': 'background',
      'objects': 'object',
      'emotions': 'effect',
      'weather': 'effect',
      'food': 'object',
      'actions': 'effect'
    };
    
    return typeMap[category] || 'object';
  }

  /**
   * Generate visual description for symbol
   */
  private static generateVisualDescription(symbol: StorySymbol, artStyle: ArtStyle): string {
    const styleDescriptions = {
      cartoon: 'colorful cartoon-style',
      watercolor: 'soft watercolor painting',
      realistic: 'detailed realistic',
      storybook: 'whimsical storybook illustration',
      minimalist: 'simple minimalist design'
    };
    
    const styleDesc = styleDescriptions[artStyle];
    return `${styleDesc} ${symbol.semanticMeaning || symbol.label}`;
  }

  /**
   * Generate position for visual element
   */
  private static generatePosition(index: number, total: number): { x: number; y: number } {
    // Distribute elements across the page
    const positions = [
      { x: 20, y: 30 },  // Top left
      { x: 70, y: 25 },  // Top right
      { x: 15, y: 60 },  // Middle left
      { x: 75, y: 65 },  // Middle right
      { x: 45, y: 80 }   // Bottom center
    ];
    
    return positions[index % positions.length];
  }

  /**
   * Select animation for element
   */
  private static selectAnimation(category: string): AnimationType {
    const animationMap: Record<string, AnimationType> = {
      'characters': 'fade-in',
      'animals': 'bounce',
      'places': 'fade-in',
      'objects': 'slide-in',
      'emotions': 'glow',
      'weather': 'float',
      'food': 'bounce',
      'actions': 'glow'
    };
    
    return animationMap[category] || 'fade-in';
  }

  /**
   * Generate contextual visual elements
   */
  private static generateContextualElements(text: string, artStyle: ArtStyle): VisualElement[] {
    const elements: VisualElement[] = [];
    const lowerText = text.toLowerCase();
    
    // Add environmental elements based on text
    if (lowerText.includes('forest') || lowerText.includes('tree')) {
      elements.push({
        id: `context-trees-${Date.now()}`,
        type: 'background',
        description: `${artStyle} forest trees`,
        style: artStyle,
        position: { x: 0, y: 0 },
        animation: 'fade-in'
      });
    }
    
    if (lowerText.includes('castle') || lowerText.includes('palace')) {
      elements.push({
        id: `context-castle-${Date.now()}`,
        type: 'background',
        description: `${artStyle} fairy tale castle`,
        style: artStyle,
        position: { x: 50, y: 20 },
        animation: 'fade-in'
      });
    }
    
    if (lowerText.includes('magic') || lowerText.includes('sparkle')) {
      elements.push({
        id: `context-magic-${Date.now()}`,
        type: 'effect',
        description: `${artStyle} magical sparkles and stars`,
        style: artStyle,
        position: { x: 60, y: 40 },
        animation: 'glow'
      });
    }
    
    return elements;
  }

  /**
   * Generate background image for page
   */
  private static async generateBackgroundImage(text: string, artStyle: ArtStyle): Promise<string> {
    // In a real implementation, this would call an AI image generation API
    // For demo purposes, we'll use placeholder images
    
    const lowerText = text.toLowerCase();
    let imageQuery = 'fantasy-landscape';
    
    if (lowerText.includes('forest')) imageQuery = 'magical-forest';
    else if (lowerText.includes('castle')) imageQuery = 'fairy-tale-castle';
    else if (lowerText.includes('beach')) imageQuery = 'beautiful-beach';
    else if (lowerText.includes('mountain')) imageQuery = 'mountain-landscape';
    else if (lowerText.includes('home')) imageQuery = 'cozy-house';
    
    // Return placeholder image URL (in production, this would be AI-generated)
    return `${this.PLACEHOLDER_API}/800/600?random=${Date.now()}&blur=1`;
  }

  /**
   * Generate cover image for storybook
   */
  private static async generateCoverImage(story: GeneratedStory, artStyle: ArtStyle): Promise<string> {
    // Generate cover based on story title and mood
    return `${this.PLACEHOLDER_API}/600/800?random=${story.id}&blur=2`;
  }

  /**
   * Generate page animations
   */
  private static generatePageAnimations(elements: VisualElement[]): PageAnimation[] {
    return elements.map((element, index) => ({
      elementId: element.id,
      animation: element.animation || 'fade-in',
      delay: index * 200, // Stagger animations
      duration: 1000
    }));
  }

  /**
   * Export storybook as PDF (placeholder)
   */
  static async exportAsPDF(storybook: VisualStorybook): Promise<Blob> {
    // In a real implementation, this would generate a PDF
    // For demo, return a placeholder blob
    const pdfContent = `
      ${storybook.title}
      
      ${storybook.pages.map(page => 
        `Page ${page.pageNumber}: ${page.text}`
      ).join('\n\n')}
    `;
    
    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  /**
   * Get available art styles
   */
  static getAvailableArtStyles(): Array<{ id: ArtStyle; name: string; description: string }> {
    return [
      { id: 'cartoon', name: 'Cartoon', description: 'Colorful and playful cartoon style' },
      { id: 'watercolor', name: 'Watercolor', description: 'Soft, dreamy watercolor paintings' },
      { id: 'realistic', name: 'Realistic', description: 'Detailed, lifelike illustrations' },
      { id: 'storybook', name: 'Storybook', description: 'Classic children\'s book illustrations' },
      { id: 'minimalist', name: 'Minimalist', description: 'Simple, clean designs' }
    ];
  }
}

// Additional interfaces for visual storybook
export interface VisualStorybook {
  id: string;
  storyId: string;
  title: string;
  artStyle: ArtStyle;
  coverImage: string;
  pages: StoryPage[];
  createdAt: Date;
}

export interface StoryPage {
  id: string;
  pageNumber: number;
  text: string;
  backgroundImage: string;
  visualElements: VisualElement[];
  animations: PageAnimation[];
}

export interface PageAnimation {
  elementId: string;
  animation: AnimationType;
  delay: number;
  duration: number;
}