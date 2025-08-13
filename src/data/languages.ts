import { SupportedLanguage, LanguageConfig } from '../types';

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', voice: 'en-US' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', voice: 'fr-FR' },
  { code: 'es', name: 'Español', flag: '🇪🇸', voice: 'es-ES' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', voice: 'de-DE' },
];

export const TRANSLATIONS = {
  en: {
    // Header
    appTitle: 'Glimmer',
    appSubtitle: 'AI Storytelling for Kids',
    
    // Story Canvas
    storyCanvas: 'Your Story Canvas',
    clearAll: 'Clear All',
    startYourStory: 'Start Your Story!',
    chooseSymbols: 'Choose symbols from below to build your magical story.',
    clickSymbols: 'Click on characters, places, actions, and emotions to add them here.',
    storyElements: 'Story Elements',
    readyToGenerate: 'Ready to generate',
    
    // Emotions
    howShouldFeel: 'How should your story feel?',
    emotions: {
      happy: 'Happy',
      excited: 'Excited', 
      calm: 'Calm',
      sad: 'Sad',
      angry: 'Angry',
      scared: 'Scared',
      surprised: 'Surprised',
      silly: 'Silly',
      neutral: 'Neutral'
    },
    
    // Story Generation
    generateStory: 'Generate Story',
    creatingMagic: 'Creating Magic...',
    playStory: 'Play Story',
    pauseStory: 'Pause Story',
    addMoreSymbols: 'Add at least 2 symbols to create your story',
    
    // Voice Control
    voiceControl: 'Voice Control',
    listening: 'Listening...',
    stopListening: 'Stop Listening',
    tryCommands: 'Try saying:',
    addSymbols: 'Add Symbols:',
    commands: 'Commands:',
    
    // Smart Suggestions
    smartSuggestions: 'Smart Suggestions',
    suggestions: {
      needsPlace: 'Your character needs somewhere to go! Try adding a place:',
      needsAction: 'What should your character do? Add an action:',
      princessStory: 'A princess story! These might fit perfectly:',
      animalStory: 'Animal stories are fun! Consider adding:',
      needsEmotion: 'How should your characters feel? Add some emotions:',
      default: 'Here are some symbols that might work well with your story:'
    },
    
    // Story Remix
    storyRemix: 'Story Remix',
    sameSymbolsDifferent: 'Same symbols, completely different story!',
    chooseNewEmotion: 'Choose a new emotion for your story:',
    remixStory: 'Remix Story',
    remixing: 'Remixing...',
    
    // Categories
    categories: {
      characters: '👥 People',
      animals: '🐾 Animals', 
      actions: '⚡ Actions',
      places: '🏛️ Places',
      objects: '🎯 Objects',
      emotions: '😊 Feelings',
      food: '🍎 Food',
      weather: '🌤️ Weather'
    },
    
    // Settings
    settings: 'Settings',
    language: 'Language',
    selectLanguage: 'Select Language'
  },
  
  fr: {
    // Header
    appTitle: 'Glimmer',
    appSubtitle: 'Contes IA pour Enfants',
    
    // Story Canvas
    storyCanvas: 'Votre Toile d\'Histoire',
    clearAll: 'Tout Effacer',
    startYourStory: 'Commencez Votre Histoire !',
    chooseSymbols: 'Choisissez des symboles ci-dessous pour construire votre histoire magique.',
    clickSymbols: 'Cliquez sur les personnages, lieux, actions et émotions pour les ajouter ici.',
    storyElements: 'Éléments d\'Histoire',
    readyToGenerate: 'Prêt à générer',
    
    // Emotions
    howShouldFeel: 'Comment votre histoire devrait-elle se sentir ?',
    emotions: {
      happy: 'Joyeux',
      excited: 'Excité',
      calm: 'Calme', 
      sad: 'Triste',
      angry: 'En Colère',
      scared: 'Effrayé',
      surprised: 'Surpris',
      silly: 'Rigolo',
      neutral: 'Neutre'
    },
    
    // Story Generation
    generateStory: 'Générer l\'Histoire',
    creatingMagic: 'Création de Magie...',
    playStory: 'Lire l\'Histoire',
    pauseStory: 'Pause',
    addMoreSymbols: 'Ajoutez au moins 2 symboles pour créer votre histoire',
    
    // Voice Control
    voiceControl: 'Contrôle Vocal',
    listening: 'Écoute...',
    stopListening: 'Arrêter l\'Écoute',
    tryCommands: 'Essayez de dire :',
    addSymbols: 'Ajouter Symboles :',
    commands: 'Commandes :',
    
    // Smart Suggestions
    smartSuggestions: 'Suggestions Intelligentes',
    suggestions: {
      needsPlace: 'Votre personnage a besoin d\'un endroit où aller ! Essayez d\'ajouter un lieu :',
      needsAction: 'Que devrait faire votre personnage ? Ajoutez une action :',
      princessStory: 'Une histoire de princesse ! Ceux-ci pourraient parfaitement convenir :',
      animalStory: 'Les histoires d\'animaux sont amusantes ! Considérez ajouter :',
      needsEmotion: 'Comment vos personnages devraient-ils se sentir ? Ajoutez des émotions :',
      default: 'Voici des symboles qui pourraient bien fonctionner avec votre histoire :'
    },
    
    // Story Remix
    storyRemix: 'Remix d\'Histoire',
    sameSymbolsDifferent: 'Mêmes symboles, histoire complètement différente !',
    chooseNewEmotion: 'Choisissez une nouvelle émotion pour votre histoire :',
    remixStory: 'Remixer l\'Histoire',
    remixing: 'Remixage...',
    
    // Categories
    categories: {
      characters: '👥 Personnes',
      animals: '🐾 Animaux',
      actions: '⚡ Actions', 
      places: '🏛️ Lieux',
      objects: '🎯 Objets',
      emotions: '😊 Sentiments',
      food: '🍎 Nourriture',
      weather: '🌤️ Météo'
    },
    
    // Settings
    settings: 'Paramètres',
    language: 'Langue',
    selectLanguage: 'Sélectionner la Langue'
  },
  
  es: {
    // Header
    appTitle: 'Glimmer',
    appSubtitle: 'Cuentos IA para Niños',
    
    // Story Canvas
    storyCanvas: 'Tu Lienzo de Historia',
    clearAll: 'Limpiar Todo',
    startYourStory: '¡Comienza Tu Historia!',
    chooseSymbols: 'Elige símbolos de abajo para construir tu historia mágica.',
    clickSymbols: 'Haz clic en personajes, lugares, acciones y emociones para añadirlos aquí.',
    storyElements: 'Elementos de Historia',
    readyToGenerate: 'Listo para generar',
    
    // Emotions
    howShouldFeel: '¿Cómo debería sentirse tu historia?',
    emotions: {
      happy: 'Feliz',
      excited: 'Emocionado',
      calm: 'Tranquilo',
      sad: 'Triste', 
      angry: 'Enojado',
      scared: 'Asustado',
      surprised: 'Sorprendido',
      silly: 'Tonto',
      neutral: 'Neutral'
    },
    
    // Story Generation
    generateStory: 'Generar Historia',
    creatingMagic: 'Creando Magia...',
    playStory: 'Reproducir Historia',
    pauseStory: 'Pausar Historia',
    addMoreSymbols: 'Añade al menos 2 símbolos para crear tu historia',
    
    // Voice Control
    voiceControl: 'Control de Voz',
    listening: 'Escuchando...',
    stopListening: 'Dejar de Escuchar',
    tryCommands: 'Intenta decir:',
    addSymbols: 'Añadir Símbolos:',
    commands: 'Comandos:',
    
    // Smart Suggestions
    smartSuggestions: 'Sugerencias Inteligentes',
    suggestions: {
      needsPlace: '¡Tu personaje necesita un lugar a donde ir! Intenta añadir un lugar:',
      needsAction: '¿Qué debería hacer tu personaje? Añade una acción:',
      princessStory: '¡Una historia de princesa! Estos podrían encajar perfectamente:',
      animalStory: '¡Las historias de animales son divertidas! Considera añadir:',
      needsEmotion: '¿Cómo deberían sentirse tus personajes? Añade algunas emociones:',
      default: 'Aquí hay algunos símbolos que podrían funcionar bien con tu historia:'
    },
    
    // Story Remix
    storyRemix: 'Remix de Historia',
    sameSymbolsDifferent: '¡Mismos símbolos, historia completamente diferente!',
    chooseNewEmotion: 'Elige una nueva emoción para tu historia:',
    remixStory: 'Remixar Historia',
    remixing: 'Remixando...',
    
    // Categories
    categories: {
      characters: '👥 Personas',
      animals: '🐾 Animales',
      actions: '⚡ Acciones',
      places: '🏛️ Lugares', 
      objects: '🎯 Objetos',
      emotions: '😊 Sentimientos',
      food: '🍎 Comida',
      weather: '🌤️ Clima'
    },
    
    // Settings
    settings: 'Configuración',
    language: 'Idioma',
    selectLanguage: 'Seleccionar Idioma'
  },
  
  de: {
    // Header
    appTitle: 'Glimmer',
    appSubtitle: 'KI-Geschichten für Kinder',
    
    // Story Canvas
    storyCanvas: 'Deine Geschichte Leinwand',
    clearAll: 'Alles Löschen',
    startYourStory: 'Beginne Deine Geschichte!',
    chooseSymbols: 'Wähle Symbole unten aus, um deine magische Geschichte zu erstellen.',
    clickSymbols: 'Klicke auf Charaktere, Orte, Aktionen und Emotionen, um sie hier hinzuzufügen.',
    storyElements: 'Geschichte Elemente',
    readyToGenerate: 'Bereit zu generieren',
    
    // Emotions
    howShouldFeel: 'Wie soll sich deine Geschichte anfühlen?',
    emotions: {
      happy: 'Glücklich',
      excited: 'Aufgeregt',
      calm: 'Ruhig',
      sad: 'Traurig',
      angry: 'Wütend', 
      scared: 'Ängstlich',
      surprised: 'Überrascht',
      silly: 'Albern',
      neutral: 'Neutral'
    },
    
    // Story Generation
    generateStory: 'Geschichte Generieren',
    creatingMagic: 'Magie Erschaffen...',
    playStory: 'Geschichte Abspielen',
    pauseStory: 'Geschichte Pausieren',
    addMoreSymbols: 'Füge mindestens 2 Symbole hinzu, um deine Geschichte zu erstellen',
    
    // Voice Control
    voiceControl: 'Sprachsteuerung',
    listening: 'Zuhören...',
    stopListening: 'Aufhören Zuzuhören',
    tryCommands: 'Versuche zu sagen:',
    addSymbols: 'Symbole Hinzufügen:',
    commands: 'Befehle:',
    
    // Smart Suggestions
    smartSuggestions: 'Intelligente Vorschläge',
    suggestions: {
      needsPlace: 'Dein Charakter braucht einen Ort zum Hingehen! Versuche einen Ort hinzuzufügen:',
      needsAction: 'Was soll dein Charakter tun? Füge eine Aktion hinzu:',
      princessStory: 'Eine Prinzessinnengeschichte! Diese könnten perfekt passen:',
      animalStory: 'Tiergeschichten machen Spaß! Erwäge hinzuzufügen:',
      needsEmotion: 'Wie sollen sich deine Charaktere fühlen? Füge einige Emotionen hinzu:',
      default: 'Hier sind einige Symbole, die gut zu deiner Geschichte passen könnten:'
    },
    
    // Story Remix
    storyRemix: 'Geschichte Remix',
    sameSymbolsDifferent: 'Gleiche Symbole, völlig andere Geschichte!',
    chooseNewEmotion: 'Wähle eine neue Emotion für deine Geschichte:',
    remixStory: 'Geschichte Remixen',
    remixing: 'Remixen...',
    
    // Categories
    categories: {
      characters: '👥 Personen',
      animals: '🐾 Tiere',
      actions: '⚡ Aktionen',
      places: '🏛️ Orte',
      objects: '🎯 Objekte', 
      emotions: '😊 Gefühle',
      food: '🍎 Essen',
      weather: '🌤️ Wetter'
    },
    
    // Settings
    settings: 'Einstellungen',
    language: 'Sprache',
    selectLanguage: 'Sprache Auswählen'
  }
};

export const getTranslation = (language: SupportedLanguage, key: string): string => {
  const keys = key.split('.');
  let value: any = TRANSLATIONS[language];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || TRANSLATIONS.en[key] || key;
};