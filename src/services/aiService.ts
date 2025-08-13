import { StorySymbol, EmotionType, GeneratedStory, SupportedLanguage } from '../types';
import { getTranslation } from '../data/languages';

// OpenAI API configuration (placeholder - replace with real keys)
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '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';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Content safety filter keywords
const INAPPROPRIATE_CONTENT_FILTERS = [
  'violence', 'death', 'scary', 'dangerous', 'hurt', 'blood', 'weapon'
];

export class AIStoryService {
  /**
   * Convert symbol sequence into structured scene data
   */
  static interpretSymbols(symbols: StorySymbol[]): string {
    const characters = symbols.filter(s => s.category === 'characters');
    const actions = symbols.filter(s => s.category === 'actions');
    const places = symbols.filter(s => s.category === 'places');
    const objects = symbols.filter(s => s.category === 'objects');
    const emotions = symbols.filter(s => s.category === 'emotions');
    
    return {
      characters: characters.map(c => c.semanticMeaning || c.label).join(', '),
      actions: actions.map(a => a.semanticMeaning || a.label).join(', '),
      settings: places.map(p => p.semanticMeaning || p.label).join(', '),
      objects: objects.map(o => o.semanticMeaning || o.label).join(', '),
      emotions: emotions.map(e => e.semanticMeaning || e.label).join(', '),
    };
  }

  /**
   * Build GPT-4 prompt for story generation
   */
  static buildStoryPrompt(symbols: StorySymbol[], emotion: EmotionType, language: SupportedLanguage = 'en'): string {
    const sceneData = this.interpretSymbols(symbols);
    
    const languageInstructions = {
      en: "Write the story in English.",
      fr: "Écrivez l'histoire en français avec un vocabulaire simple et approprié pour les enfants.",
      es: "Escribe la historia en español con vocabulario simple y apropiado para niños.",
      de: "Schreibe die Geschichte auf Deutsch mit einfachem und kinderfreundlichem Wortschatz."
    };
    
    const emotionInstructions = {
      happy: "Create an uplifting, joyful story that celebrates friendship and positive experiences.",
      excited: "Write an energetic, adventurous story full of discovery and wonder.",
      calm: "Generate a peaceful, soothing story perfect for relaxation.",
      sad: "Write a gentle story that acknowledges difficult feelings but ends with comfort and hope.",
      angry: "Create a story that helps process frustration through problem-solving and understanding.",
      scared: "Write a story that transforms fear into courage and shows how to be brave.",
      surprised: "Generate an exciting story full of unexpected positive discoveries.",
      silly: "Create a playful, funny story full of humor and lighthearted moments.",
      neutral: "Write a balanced, engaging story appropriate for children."
    };

    return `You are a professional children's storyteller creating stories for nonverbal children who communicate through visual symbols.

STORY ELEMENTS PROVIDED:
- Characters: ${sceneData.characters || 'Create a child-friendly character'}
- Actions: ${sceneData.actions || 'Include age-appropriate activities'}
- Settings: ${sceneData.settings || 'Choose a safe, imaginative location'}  
- Objects: ${sceneData.objects || 'Include relevant story props'}
- Emotions: ${sceneData.emotions || 'Show emotional growth'}

MOOD: ${emotion.toUpperCase()}
INSTRUCTION: ${emotionInstructions[emotion]}
LANGUAGE: ${languageInstructions[language]}

REQUIREMENTS:
- Length: 150-250 words, perfect for 2-3 minutes of reading
- Age: Appropriate for ages 3-8
- Language: Simple, clear sentences with descriptive but not complex vocabulary
- Safety: Absolutely no scary, violent, or inappropriate content
- Structure: Clear beginning, middle, and satisfying end
- Engagement: Include sensory details (colors, sounds, textures)
- Emotional arc: Show character growth and positive resolution

Create a magical, heartwarming story that incorporates these elements naturally. Make it interactive by including moments where the child might imagine themselves in the story.

STORY:`;
  }

  /**
   * Generate story using OpenAI GPT-4
   */
  static async generateStory(symbols: StorySymbol[], emotion: EmotionType, language: SupportedLanguage = 'en'): Promise<string> {
    try {
      const prompt = this.buildStoryPrompt(symbols, emotion, language);
      
      // For development, return a mock story
      if (OPENAI_API_KEY === 'your-openai-api-key' || !OPENAI_API_KEY.startsWith('sk-')) {
        return this.generateMockStory(symbols, emotion, language);
      }

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert children\'s storyteller specializing in inclusive, accessible stories for children who communicate through visual symbols.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 400,
          temperature: 0.8,
          frequency_penalty: 0.3,
          presence_penalty: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const generatedStory = data.choices[0].message.content.trim();

      // Apply content safety filter
      return this.filterContent(generatedStory);
      
    } catch (error) {
      console.error('Story generation error:', error);
      // Fallback to mock story on API error
      return this.generateMockStory(symbols, emotion, language);
    }
  }

  /**
   * Generate a mock story for development/fallback
   */
  static generateMockStory(symbols: StorySymbol[], emotion: EmotionType, language: SupportedLanguage = 'en'): string {
    const sceneData = this.interpretSymbols(symbols);
    
    const templates = {
      en: {
        happy: `Once upon a time, there was a wonderful adventure waiting to unfold! ${sceneData.characters ? `Our friend ${sceneData.characters.split(',')[0]}` : 'A cheerful child'} discovered something amazing today. ${sceneData.settings ? `In the beautiful ${sceneData.settings.split(',')[0]}` : 'In a magical place'}, they found ${sceneData.objects ? sceneData.objects.split(',')[0] : 'something special'}. With joy in their heart, they ${sceneData.actions ? sceneData.actions.split(',')[0] : 'started a wonderful journey'}. The sun was shining, birds were singing, and everything felt perfect. What a beautiful day for new discoveries and happy memories!`,
        calm: `In a peaceful, quiet place, everything was just right. ${sceneData.characters ? `A gentle ${sceneData.characters.split(',')[0]}` : 'A calm friend'} was enjoying a serene moment. ${sceneData.settings ? `The ${sceneData.settings.split(',')[0]}` : 'This special place'} was filled with soft, comfortable feelings. Slowly and peacefully, they ${sceneData.actions ? sceneData.actions.split(',')[0] : 'took time to rest'}. The world around them was quiet and safe, with gentle breezes and warm sunlight. It was the perfect time to breathe deeply, feel grateful, and enjoy the simple beauty of the moment.`,
        silly: `What a wonderfully silly day this was! ${sceneData.characters ? `Our funny friend ${sceneData.characters.split(',')[0]}` : 'A playful character'} was ready for some giggles! ${sceneData.settings ? `At the amusing ${sceneData.settings.split(',')[0]}` : 'In a funny place'}, something hilarious was about to happen. They decided to ${sceneData.actions ? sceneData.actions.split(',')[0] : 'do something silly'} in the most ridiculous way possible! Everyone started laughing and having the most wonderful time. Sometimes the silliest moments make the very best memories!`
      },
      fr: {
        happy: `Il était une fois, une merveilleuse aventure qui attendait de se dérouler ! ${sceneData.characters ? `Notre ami ${sceneData.characters.split(',')[0]}` : 'Un enfant joyeux'} a découvert quelque chose d'incroyable aujourd'hui. ${sceneData.settings ? `Dans le magnifique ${sceneData.settings.split(',')[0]}` : 'Dans un lieu magique'}, ils ont trouvé ${sceneData.objects ? sceneData.objects.split(',')[0] : 'quelque chose de spécial'}. Avec de la joie dans leur cœur, ils ${sceneData.actions ? sceneData.actions.split(',')[0] : 'ont commencé un merveilleux voyage'}. Le soleil brillait, les oiseaux chantaient, et tout semblait parfait. Quelle belle journée pour de nouvelles découvertes et de joyeux souvenirs !`,
        calm: `Dans un endroit paisible et tranquille, tout était parfait. ${sceneData.characters ? `Un doux ${sceneData.characters.split(',')[0]}` : 'Un ami calme'} profitait d'un moment serein. ${sceneData.settings ? `Le ${sceneData.settings.split(',')[0]}` : 'Cet endroit spécial'} était rempli de sentiments doux et confortables. Lentement et paisiblement, ils ${sceneData.actions ? sceneData.actions.split(',')[0] : 'ont pris le temps de se reposer'}. Le monde autour d'eux était calme et sûr, avec de douces brises et un soleil chaud.`,
        silly: `Quelle journée merveilleusement amusante ! ${sceneData.characters ? `Notre ami rigolo ${sceneData.characters.split(',')[0]}` : 'Un personnage joueur'} était prêt pour quelques rires ! ${sceneData.settings ? `Dans l'amusant ${sceneData.settings.split(',')[0]}` : 'Dans un endroit drôle'}, quelque chose d'hilarant allait se passer. Ils ont décidé de ${sceneData.actions ? sceneData.actions.split(',')[0] : 'faire quelque chose de rigolo'} de la façon la plus ridicule possible !`
      },
      es: {
        happy: `Había una vez, ¡una maravillosa aventura esperando desarrollarse! ${sceneData.characters ? `Nuestro amigo ${sceneData.characters.split(',')[0]}` : 'Un niño alegre'} descubrió algo increíble hoy. ${sceneData.settings ? `En el hermoso ${sceneData.settings.split(',')[0]}` : 'En un lugar mágico'}, encontraron ${sceneData.objects ? sceneData.objects.split(',')[0] : 'algo especial'}. Con alegría en su corazón, ${sceneData.actions ? sceneData.actions.split(',')[0] : 'comenzaron un viaje maravilloso'}. El sol brillaba, los pájaros cantaban, y todo se sentía perfecto. ¡Qué hermoso día para nuevos descubrimientos y recuerdos felices!`,
        calm: `En un lugar pacífico y tranquilo, todo estaba perfecto. ${sceneData.characters ? `Un gentil ${sceneData.characters.split(',')[0]}` : 'Un amigo tranquilo'} estaba disfrutando un momento sereno. ${sceneData.settings ? `El ${sceneData.settings.split(',')[0]}` : 'Este lugar especial'} estaba lleno de sentimientos suaves y cómodos. Lenta y pacíficamente, ${sceneData.actions ? sceneData.actions.split(',')[0] : 'tomaron tiempo para descansar'}. El mundo a su alrededor era silencioso y seguro, con brisas suaves y sol cálido.`,
        silly: `¡Qué día tan maravillosamente tonto fue este! ${sceneData.characters ? `Nuestro amigo divertido ${sceneData.characters.split(',')[0]}` : 'Un personaje juguetón'} estaba listo para algunas risas. ${sceneData.settings ? `En el divertido ${sceneData.settings.split(',')[0]}` : 'En un lugar gracioso'}, algo divertidísimo estaba a punto de pasar. ¡Decidieron ${sceneData.actions ? sceneData.actions.split(',')[0] : 'hacer algo tonto'} de la manera más ridícula posible!`
      },
      de: {
        happy: `Es war einmal ein wunderbares Abenteuer, das darauf wartete, sich zu entfalten! ${sceneData.characters ? `Unser Freund ${sceneData.characters.split(',')[0]}` : 'Ein fröhliches Kind'} entdeckte heute etwas Erstaunliches. ${sceneData.settings ? `In dem schönen ${sceneData.settings.split(',')[0]}` : 'An einem magischen Ort'} fanden sie ${sceneData.objects ? sceneData.objects.split(',')[0] : 'etwas Besonderes'}. Mit Freude im Herzen ${sceneData.actions ? sceneData.actions.split(',')[0] : 'begannen sie eine wunderbare Reise'}. Die Sonne schien, Vögel sangen, und alles fühlte sich perfekt an. Was für ein schöner Tag für neue Entdeckungen und glückliche Erinnerungen!`,
        calm: `An einem friedlichen, ruhigen Ort war alles genau richtig. ${sceneData.characters ? `Ein sanfter ${sceneData.characters.split(',')[0]}` : 'Ein ruhiger Freund'} genoss einen ruhigen Moment. ${sceneData.settings ? `Der ${sceneData.settings.split(',')[0]}` : 'Dieser besondere Ort'} war voller weicher, gemütlicher Gefühle. Langsam und friedlich ${sceneData.actions ? sceneData.actions.split(',')[0] : 'nahmen sie sich Zeit zum Ausruhen'}. Die Welt um sie herum war still und sicher, mit sanften Brisen und warmem Sonnenlicht.`,
        silly: `Was für ein wunderbar alberner Tag das war! ${sceneData.characters ? `Unser lustiger Freund ${sceneData.characters.split(',')[0]}` : 'Ein verspielter Charakter'} war bereit für etwas Gekicher! ${sceneData.settings ? `An dem amüsanten ${sceneData.settings.split(',')[0]}` : 'An einem lustigen Ort'} sollte etwas Urkomisches passieren. Sie beschlossen, ${sceneData.actions ? sceneData.actions.split(',')[0] : 'etwas Albernes zu tun'} auf die lächerlichste Art und Weise!`
      }
    };
      

    const languageTemplates = templates[language] || templates.en;
    return languageTemplates[emotion] || languageTemplates.happy;
  }

  /**
   * Apply content safety filters
   */
  static filterContent(story: string): string {
    let filteredStory = story;
    
    // Check for inappropriate content
    const lowerStory = story.toLowerCase();
    const hasInappropriateContent = INAPPROPRIATE_CONTENT_FILTERS.some(filter => 
      lowerStory.includes(filter)
    );
    
    if (hasInappropriateContent) {
      console.warn('Content filter triggered, generating safe fallback story');
      return "Once upon a time, there was a wonderful friend who loved to explore and discover new things. They went on a magical adventure filled with kindness, laughter, and joy. Along the way, they made new friends and learned that every day brings something special to smile about. And they lived happily, surrounded by love and wonder!";
    }
    
    return filteredStory;
  }

  /**
   * Create a complete GeneratedStory object
   */
  static async createStory(symbols: StorySymbol[], emotion: EmotionType, language: SupportedLanguage = 'en'): Promise<GeneratedStory> {
    const content = await this.generateStory(symbols, emotion, language);
    
    return {
      id: `story-${Date.now()}`,
      title: this.generateTitle(symbols, emotion, language),
      content,
      scenes: [{
        id: `scene-${Date.now()}`,
        symbols,
        emotion,
        order: 0,
      }],
      createdAt: new Date(),
      mood: emotion,
    };
  }

  /**
   * Generate a story title based on symbols and emotion
   */
  static generateTitle(symbols: StorySymbol[], emotion: EmotionType, language: SupportedLanguage = 'en'): string {
    const characters = symbols.filter(s => s.category === 'characters');
    const places = symbols.filter(s => s.category === 'places');
    
    const characterName = characters.length > 0 ? characters[0].label : 'Friend';
    const placeName = places.length > 0 ? places[0].label : 'Adventure';
    
    const titleTemplates = {
      en: {
        happy: `${characterName}'s Happy ${placeName}`,
        excited: `${characterName}'s Amazing Adventure`,
        calm: `${characterName}'s Peaceful Day`,
        sad: `${characterName} Finds Comfort`,
        silly: `${characterName}'s Silly Story`,
        scared: `${characterName} Becomes Brave`,
        surprised: `${characterName}'s Big Surprise`,
        angry: `${characterName} Learns to Share`,
        neutral: `${characterName}'s Story`,
      },
      fr: {
        happy: `Le Joyeux ${placeName} de ${characterName}`,
        excited: `L'Incroyable Aventure de ${characterName}`,
        calm: `La Journée Paisible de ${characterName}`,
        sad: `${characterName} Trouve du Réconfort`,
        silly: `L'Histoire Rigolote de ${characterName}`,
        scared: `${characterName} Devient Courageux`,
        surprised: `La Grande Surprise de ${characterName}`,
        angry: `${characterName} Apprend à Partager`,
        neutral: `L'Histoire de ${characterName}`,
      },
      es: {
        happy: `El Feliz ${placeName} de ${characterName}`,
        excited: `La Increíble Aventura de ${characterName}`,
        calm: `El Día Tranquilo de ${characterName}`,
        sad: `${characterName} Encuentra Consuelo`,
        silly: `La Historia Tonta de ${characterName}`,
        scared: `${characterName} Se Vuelve Valiente`,
        surprised: `La Gran Sorpresa de ${characterName}`,
        angry: `${characterName} Aprende a Compartir`,
        neutral: `La Historia de ${characterName}`,
      },
      de: {
        happy: `${characterName}s Glücklicher ${placeName}`,
        excited: `${characterName}s Erstaunliches Abenteuer`,
        calm: `${characterName}s Friedlicher Tag`,
        sad: `${characterName} Findet Trost`,
        silly: `${characterName}s Alberne Geschichte`,
        scared: `${characterName} Wird Mutig`,
        surprised: `${characterName}s Große Überraschung`,
        angry: `${characterName} Lernt zu Teilen`,
        neutral: `${characterName}s Geschichte`,
      }
    };

    const languageTemplates = titleTemplates[language] || titleTemplates.en;
    return languageTemplates[emotion] || `${characterName}'s Adventure`;
  }
}