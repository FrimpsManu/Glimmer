import { StorySymbol } from '../types';

export const symbolLibrary: StorySymbol[] = [
  // Characters
  { id: 'char-1', type: 'emoji', value: '👧', category: 'characters', label: 'Girl', semanticMeaning: 'young girl character' },
  { id: 'char-2', type: 'emoji', value: '👦', category: 'characters', label: 'Boy', semanticMeaning: 'young boy character' },
  { id: 'char-3', type: 'emoji', value: '👩', category: 'characters', label: 'Woman', semanticMeaning: 'adult woman character' },
  { id: 'char-4', type: 'emoji', value: '👨', category: 'characters', label: 'Man', semanticMeaning: 'adult man character' },
  { id: 'char-5', type: 'emoji', value: '👵', category: 'characters', label: 'Grandma', semanticMeaning: 'elderly woman grandmother' },
  { id: 'char-6', type: 'emoji', value: '👴', category: 'characters', label: 'Grandpa', semanticMeaning: 'elderly man grandfather' },
  { id: 'char-7', type: 'emoji', value: '🧙‍♀️', category: 'characters', label: 'Wizard', semanticMeaning: 'magical wizard character' },
  { id: 'char-8', type: 'emoji', value: '👸', category: 'characters', label: 'Princess', semanticMeaning: 'princess royal character' },

  // Animals
  { id: 'animal-1', type: 'emoji', value: '🐶', category: 'animals', label: 'Dog', semanticMeaning: 'friendly dog pet' },
  { id: 'animal-2', type: 'emoji', value: '🐱', category: 'animals', label: 'Cat', semanticMeaning: 'cute cat pet' },
  { id: 'animal-3', type: 'emoji', value: '🐰', category: 'animals', label: 'Rabbit', semanticMeaning: 'hopping rabbit bunny' },
  { id: 'animal-4', type: 'emoji', value: '🦁', category: 'animals', label: 'Lion', semanticMeaning: 'brave lion king' },
  { id: 'animal-5', type: 'emoji', value: '🐘', category: 'animals', label: 'Elephant', semanticMeaning: 'big gentle elephant' },
  { id: 'animal-6', type: 'emoji', value: '🦋', category: 'animals', label: 'Butterfly', semanticMeaning: 'beautiful flying butterfly' },
  { id: 'animal-7', type: 'emoji', value: '🐦', category: 'animals', label: 'Bird', semanticMeaning: 'singing bird flying' },

  // Actions
  { id: 'action-1', type: 'emoji', value: '🏃', category: 'actions', label: 'Run', semanticMeaning: 'running fast movement' },
  { id: 'action-2', type: 'emoji', value: '🎭', category: 'actions', label: 'Play', semanticMeaning: 'playing acting performance' },
  { id: 'action-3', type: 'emoji', value: '💤', category: 'actions', label: 'Sleep', semanticMeaning: 'sleeping resting dreaming' },
  { id: 'action-4', type: 'emoji', value: '🍽️', category: 'actions', label: 'Eat', semanticMeaning: 'eating meal food' },
  { id: 'action-5', type: 'emoji', value: '🎨', category: 'actions', label: 'Create', semanticMeaning: 'creating art painting' },
  { id: 'action-6', type: 'emoji', value: '📚', category: 'actions', label: 'Read', semanticMeaning: 'reading books learning' },
  { id: 'action-7', type: 'emoji', value: '🎵', category: 'actions', label: 'Sing', semanticMeaning: 'singing music melody' },

  // Places
  { id: 'place-1', type: 'emoji', value: '🏠', category: 'places', label: 'Home', semanticMeaning: 'cozy home house' },
  { id: 'place-2', type: 'emoji', value: '🌳', category: 'places', label: 'Forest', semanticMeaning: 'magical forest trees' },
  { id: 'place-3', type: 'emoji', value: '🏰', category: 'places', label: 'Castle', semanticMeaning: 'fairy tale castle' },
  { id: 'place-4', type: 'emoji', value: '🏫', category: 'places', label: 'School', semanticMeaning: 'school building learning' },
  { id: 'place-5', type: 'emoji', value: '🏖️', category: 'places', label: 'Beach', semanticMeaning: 'sunny beach ocean' },
  { id: 'place-6', type: 'emoji', value: '⛰️', category: 'places', label: 'Mountain', semanticMeaning: 'tall mountain adventure' },
  { id: 'place-7', type: 'emoji', value: '🌌', category: 'places', label: 'Space', semanticMeaning: 'outer space stars' },

  // Objects
  { id: 'obj-1', type: 'emoji', value: '⚽', category: 'objects', label: 'Ball', semanticMeaning: 'playful ball game' },
  { id: 'obj-2', type: 'emoji', value: '🎁', category: 'objects', label: 'Gift', semanticMeaning: 'special present gift' },
  { id: 'obj-3', type: 'emoji', value: '🌟', category: 'objects', label: 'Star', semanticMeaning: 'shining magical star' },
  { id: 'obj-4', type: 'emoji', value: '🗝️', category: 'objects', label: 'Key', semanticMeaning: 'important key unlock' },
  { id: 'obj-5', type: 'emoji', value: '📱', category: 'objects', label: 'Phone', semanticMeaning: 'communication phone call' },
  { id: 'obj-6', type: 'emoji', value: '🚗', category: 'objects', label: 'Car', semanticMeaning: 'driving car travel' },

  // Emotions
  { id: 'emotion-1', type: 'emoji', value: '😊', category: 'emotions', label: 'Happy', semanticMeaning: 'feeling happy joyful' },
  { id: 'emotion-2', type: 'emoji', value: '😢', category: 'emotions', label: 'Sad', semanticMeaning: 'feeling sad crying' },
  { id: 'emotion-3', type: 'emoji', value: '😡', category: 'emotions', label: 'Angry', semanticMeaning: 'feeling angry mad' },
  { id: 'emotion-4', type: 'emoji', value: '😨', category: 'emotions', label: 'Scared', semanticMeaning: 'feeling scared afraid' },
  { id: 'emotion-5', type: 'emoji', value: '😲', category: 'emotions', label: 'Surprised', semanticMeaning: 'feeling surprised amazed' },
  { id: 'emotion-6', type: 'emoji', value: '🤔', category: 'emotions', label: 'Thinking', semanticMeaning: 'thinking wondering curious' },
  { id: 'emotion-7', type: 'emoji', value: '😴', category: 'emotions', label: 'Sleepy', semanticMeaning: 'feeling sleepy tired' },

  // Food
  { id: 'food-1', type: 'emoji', value: '🍎', category: 'food', label: 'Apple', semanticMeaning: 'red apple fruit' },
  { id: 'food-2', type: 'emoji', value: '🍪', category: 'food', label: 'Cookie', semanticMeaning: 'sweet cookie treat' },
  { id: 'food-3', type: 'emoji', value: '🍰', category: 'food', label: 'Cake', semanticMeaning: 'birthday cake celebration' },
  { id: 'food-4', type: 'emoji', value: '🥛', category: 'food', label: 'Milk', semanticMeaning: 'glass of milk drink' },
  { id: 'food-5', type: 'emoji', value: '🍕', category: 'food', label: 'Pizza', semanticMeaning: 'delicious pizza meal' },

  // Weather
  { id: 'weather-1', type: 'emoji', value: '☀️', category: 'weather', label: 'Sun', semanticMeaning: 'bright sunny day' },
  { id: 'weather-2', type: 'emoji', value: '🌧️', category: 'weather', label: 'Rain', semanticMeaning: 'rainy weather drops' },
  { id: 'weather-3', type: 'emoji', value: '⛈️', category: 'weather', label: 'Storm', semanticMeaning: 'thunderstorm lightning' },
  { id: 'weather-4', type: 'emoji', value: '🌈', category: 'weather', label: 'Rainbow', semanticMeaning: 'beautiful rainbow colors' },
  { id: 'weather-5', type: 'emoji', value: '❄️', category: 'weather', label: 'Snow', semanticMeaning: 'white snow winter' },
];

export const getCategorizedSymbols = () => {
  const categories: Record<string, StorySymbol[]> = {};
  
  symbolLibrary.forEach(symbol => {
    if (!categories[symbol.category]) {
      categories[symbol.category] = [];
    }
    categories[symbol.category].push(symbol);
  });
  
  return categories;
};