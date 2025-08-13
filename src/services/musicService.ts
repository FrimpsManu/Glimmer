import * as Tone from 'tone';
import { EmotionType, GeneratedStory } from '../types';

export interface MusicTrack {
  id: string;
  emotion: EmotionType;
  duration: number;
  instruments: string[];
  tempo: number;
  key: string;
  audioUrl?: string;
}

export interface MusicSettings {
  enabled: boolean;
  volume: number;
  fadeInOut: boolean;
  adaptToStory: boolean;
}

export class MusicService {
  private static synth: Tone.PolySynth | null = null;
  private static currentTrack: MusicTrack | null = null;
  private static isPlaying = false;
  private static currentLoop: Tone.Loop | null = null;
  private static masterVolume: Tone.Volume | null = null;

  /**
   * Initialize the music service
   */
  static async initialize(): Promise<boolean> {
    try {
      // Initialize Tone.js
      await Tone.start();
      
      // Create master volume control
      this.masterVolume = new Tone.Volume(-10).toDestination();
      
      // Create polyphonic synthesizer
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: 'triangle'
        },
        envelope: {
          attack: 0.1,
          decay: 0.3,
          sustain: 0.3,
          release: 1
        }
      }).connect(this.masterVolume);

      console.log('🎵 Music service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize music service:', error);
      return false;
    }
  }

  /**
   * Generate dynamic music based on story emotion
   */
  static generateMusicTrack(emotion: EmotionType, storyLength: number): MusicTrack {
    const musicConfig = this.getEmotionMusicConfig(emotion);
    const duration = Math.max(60, storyLength * 0.8); // Estimate based on story length
    
    return {
      id: `track-${Date.now()}`,
      emotion,
      duration,
      instruments: musicConfig.instruments,
      tempo: musicConfig.tempo,
      key: musicConfig.key,
    };
  }

  /**
   * Get music configuration for each emotion
   */
  private static getEmotionMusicConfig(emotion: EmotionType) {
    const configs = {
      happy: {
        instruments: ['piano', 'strings', 'bells'],
        tempo: 120,
        key: 'C major',
        chords: ['C', 'F', 'G', 'Am'],
        melody: [261.63, 293.66, 329.63, 349.23, 392.00], // C D E F G
        rhythm: [1, 0.5, 0.5, 1, 1],
      },
      excited: {
        instruments: ['drums', 'brass', 'electric'],
        tempo: 140,
        key: 'D major',
        chords: ['D', 'G', 'A', 'Bm'],
        melody: [293.66, 329.63, 369.99, 392.00, 440.00], // D E F# G A
        rhythm: [0.5, 0.5, 0.25, 0.25, 1],
      },
      calm: {
        instruments: ['flute', 'harp', 'pad'],
        tempo: 70,
        key: 'F major',
        chords: ['F', 'Bb', 'C', 'Dm'],
        melody: [349.23, 392.00, 440.00, 466.16, 523.25], // F G A Bb C
        rhythm: [2, 1, 1, 2, 2],
      },
      sad: {
        instruments: ['cello', 'piano', 'rain'],
        tempo: 60,
        key: 'D minor',
        chords: ['Dm', 'Bb', 'F', 'C'],
        melody: [293.66, 329.63, 349.23, 392.00, 440.00], // D E F G A
        rhythm: [2, 1, 1, 2, 1],
      },
      silly: {
        instruments: ['xylophone', 'kazoo', 'bongos'],
        tempo: 160,
        key: 'G major',
        chords: ['G', 'C', 'D', 'Em'],
        melody: [392.00, 440.00, 493.88, 523.25, 587.33], // G A B C D
        rhythm: [0.25, 0.25, 0.5, 0.25, 0.75],
      },
      scared: {
        instruments: ['strings', 'timpani', 'whisper'],
        tempo: 80,
        key: 'A minor',
        chords: ['Am', 'F', 'C', 'G'],
        melody: [220.00, 246.94, 261.63, 293.66, 329.63], // A B C D E
        rhythm: [1, 0.5, 1.5, 1, 2],
      },
      surprised: {
        instruments: ['bells', 'harp', 'chimes'],
        tempo: 100,
        key: 'E major',
        chords: ['E', 'A', 'B', 'C#m'],
        melody: [329.63, 369.99, 415.30, 440.00, 493.88], // E F# G# A B
        rhythm: [0.5, 0.25, 0.25, 1, 1],
      },
      angry: {
        instruments: ['drums', 'bass', 'distortion'],
        tempo: 110,
        key: 'E minor',
        chords: ['Em', 'Am', 'B', 'C'],
        melody: [329.63, 369.99, 392.00, 440.00, 493.88], // E F# G A B
        rhythm: [0.5, 0.5, 1, 0.5, 1],
      },
      neutral: {
        instruments: ['piano', 'strings'],
        tempo: 90,
        key: 'C major',
        chords: ['C', 'Am', 'F', 'G'],
        melody: [261.63, 293.66, 329.63, 349.23, 392.00], // C D E F G
        rhythm: [1, 1, 1, 1, 2],
      },
    };

    return configs[emotion] || configs.neutral;
  }

  /**
   * Play dynamic music for story
   */
  static async playStoryMusic(story: GeneratedStory, settings: MusicSettings): Promise<void> {
    if (!settings.enabled || !this.synth || !this.masterVolume) {
      return;
    }

    try {
      // Stop any current music
      this.stopMusic();

      // Set volume
      this.masterVolume.volume.value = Tone.gainToDb(settings.volume);

      // Generate and play track
      const track = this.generateMusicTrack(story.mood, story.content.length);
      this.currentTrack = track;
      
      await this.playGeneratedTrack(track, settings);
      
    } catch (error) {
      console.error('Error playing story music:', error);
    }
  }

  /**
   * Play generated music track
   */
  private static async playGeneratedTrack(track: MusicTrack, settings: MusicSettings): Promise<void> {
    if (!this.synth) return;

    const config = this.getEmotionMusicConfig(track.emotion);
    
    // Set tempo
    Tone.Transport.bpm.value = config.tempo;
    
    // Create chord progression
    const chordProgression = this.createChordProgression(config.chords, config.rhythm);
    
    // Create melody line
    const melodyLine = this.createMelodyLine(config.melody, config.rhythm);
    
    // Create ambient layer
    const ambientLayer = this.createAmbientLayer(track.emotion);
    
    // Start the musical loop
    this.currentLoop = new Tone.Loop((time) => {
      // Play chord progression
      chordProgression.forEach((chord, index) => {
        const chordTime = time + index * Tone.Time('4n').toSeconds();
        this.playChord(chord.notes, chord.duration, chordTime);
      });
      
      // Play melody
      melodyLine.forEach((note, index) => {
        const noteTime = time + index * Tone.Time('8n').toSeconds();
        this.synth?.triggerAttackRelease(note.frequency, note.duration, noteTime);
      });
      
    }, '4m'); // Loop every 4 measures

    // Start transport and loop
    this.currentLoop.start(0);
    Tone.Transport.start();
    this.isPlaying = true;

    // Fade in if enabled
    if (settings.fadeInOut) {
      this.masterVolume?.volume.rampTo(Tone.gainToDb(settings.volume), 2);
    }
  }

  /**
   * Create chord progression
   */
  private static createChordProgression(chords: string[], rhythm: number[]) {
    const chordMap: Record<string, number[]> = {
      'C': [261.63, 329.63, 392.00], // C E G
      'F': [349.23, 440.00, 523.25], // F A C
      'G': [392.00, 493.88, 587.33], // G B D
      'Am': [220.00, 261.63, 329.63], // A C E
      'D': [293.66, 369.99, 440.00], // D F# A
      'Bb': [233.08, 293.66, 349.23], // Bb D F
      'Em': [329.63, 392.00, 493.88], // E G B
      'Dm': [293.66, 349.23, 440.00], // D F A
    };

    return chords.map((chord, index) => ({
      notes: chordMap[chord] || chordMap['C'],
      duration: rhythm[index % rhythm.length] + 's',
    }));
  }

  /**
   * Create melody line
   */
  private static createMelodyLine(notes: number[], rhythm: number[]) {
    return notes.map((frequency, index) => ({
      frequency,
      duration: rhythm[index % rhythm.length] + 's',
    }));
  }

  /**
   * Create ambient layer based on emotion
   */
  private static createAmbientLayer(emotion: EmotionType) {
    const ambientConfigs = {
      happy: { type: 'birds', volume: 0.1 },
      calm: { type: 'water', volume: 0.15 },
      excited: { type: 'energy', volume: 0.2 },
      sad: { type: 'rain', volume: 0.1 },
      silly: { type: 'bounce', volume: 0.15 },
      scared: { type: 'wind', volume: 0.1 },
      surprised: { type: 'sparkle', volume: 0.12 },
      angry: { type: 'thunder', volume: 0.1 },
      neutral: { type: 'gentle', volume: 0.08 },
    };

    return ambientConfigs[emotion] || ambientConfigs.neutral;
  }

  /**
   * Play chord
   */
  private static playChord(notes: number[], duration: string, time: number): void {
    if (!this.synth) return;
    
    notes.forEach(note => {
      this.synth?.triggerAttackRelease(note, duration, time);
    });
  }

  /**
   * Stop music playback
   */
  static stopMusic(): void {
    if (this.currentLoop) {
      this.currentLoop.stop();
      this.currentLoop.dispose();
      this.currentLoop = null;
    }
    
    Tone.Transport.stop();
    Tone.Transport.cancel();
    this.isPlaying = false;
    this.currentTrack = null;
  }

  /**
   * Pause/Resume music
   */
  static toggleMusic(): boolean {
    if (this.isPlaying) {
      Tone.Transport.pause();
      this.isPlaying = false;
    } else {
      Tone.Transport.start();
      this.isPlaying = true;
    }
    return this.isPlaying;
  }

  /**
   * Set music volume
   */
  static setVolume(volume: number): void {
    if (this.masterVolume) {
      this.masterVolume.volume.value = Tone.gainToDb(Math.max(0.01, volume));
    }
  }

  /**
   * Check if music is currently playing
   */
  static isMusicPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Get current track info
   */
  static getCurrentTrack(): MusicTrack | null {
    return this.currentTrack;
  }

  /**
   * Generate ambient soundscape
   */
  static async generateAmbientSounds(emotion: EmotionType): Promise<void> {
    if (!this.synth) return;

    const ambientSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 2, decay: 1, sustain: 0.3, release: 2 }
    }).connect(this.masterVolume);

    const ambientConfigs = {
      happy: () => this.playBirdsong(ambientSynth),
      calm: () => this.playWaterSounds(ambientSynth),
      excited: () => this.playEnergeticAmbient(ambientSynth),
      sad: () => this.playRainSounds(ambientSynth),
      silly: () => this.playBouncyAmbient(ambientSynth),
      scared: () => this.playWindSounds(ambientSynth),
      surprised: () => this.playSparkleAmbient(ambientSynth),
      angry: () => this.playThunderAmbient(ambientSynth),
      neutral: () => this.playGentleAmbient(ambientSynth),
    };

    const playAmbient = ambientConfigs[emotion] || ambientConfigs.neutral;
    playAmbient();
  }

  /**
   * Ambient sound generators
   */
  private static playBirdsong(synth: Tone.Synth): void {
    const birdNotes = [523.25, 587.33, 659.25, 698.46]; // C5, D5, E5, F5
    
    const birdLoop = new Tone.Loop((time) => {
      const note = birdNotes[Math.floor(Math.random() * birdNotes.length)];
      synth.triggerAttackRelease(note, '0.1', time);
    }, '2n');
    
    birdLoop.start(0);
  }

  private static playWaterSounds(synth: Tone.Synth): void {
    const waterLoop = new Tone.Loop((time) => {
      const frequency = 100 + Math.random() * 200;
      synth.triggerAttackRelease(frequency, '0.5', time);
    }, '1n');
    
    waterLoop.start(0);
  }

  private static playEnergeticAmbient(synth: Tone.Synth): void {
    const energyNotes = [440.00, 493.88, 523.25, 587.33]; // A4, B4, C5, D5
    
    const energyLoop = new Tone.Loop((time) => {
      energyNotes.forEach((note, index) => {
        synth.triggerAttackRelease(note, '0.1', time + index * 0.1);
      });
    }, '1n');
    
    energyLoop.start(0);
  }

  private static playRainSounds(synth: Tone.Synth): void {
    const rainLoop = new Tone.Loop((time) => {
      for (let i = 0; i < 5; i++) {
        const frequency = 200 + Math.random() * 300;
        const delay = Math.random() * 0.5;
        synth.triggerAttackRelease(frequency, '0.05', time + delay);
      }
    }, '2n');
    
    rainLoop.start(0);
  }

  private static playBouncyAmbient(synth: Tone.Synth): void {
    const bounceNotes = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    const bounceLoop = new Tone.Loop((time) => {
      bounceNotes.forEach((note, index) => {
        synth.triggerAttackRelease(note, '0.2', time + index * 0.15);
      });
    }, '4n');
    
    bounceLoop.start(0);
  }

  private static playWindSounds(synth: Tone.Synth): void {
    const windLoop = new Tone.Loop((time) => {
      const frequency = 80 + Math.random() * 120;
      synth.triggerAttackRelease(frequency, '1', time);
    }, '1n');
    
    windLoop.start(0);
  }

  private static playSparkleAmbient(synth: Tone.Synth): void {
    const sparkleNotes = [659.25, 783.99, 987.77, 1174.66]; // E5, G5, B5, D6
    
    const sparkleLoop = new Tone.Loop((time) => {
      const note = sparkleNotes[Math.floor(Math.random() * sparkleNotes.length)];
      synth.triggerAttackRelease(note, '0.3', time);
    }, '8n');
    
    sparkleLoop.start(0);
  }

  private static playThunderAmbient(synth: Tone.Synth): void {
    const thunderLoop = new Tone.Loop((time) => {
      // Low rumble
      synth.triggerAttackRelease(60, '2', time);
      // Occasional crack
      if (Math.random() > 0.7) {
        synth.triggerAttackRelease(1000, '0.1', time + 0.5);
      }
    }, '2n');
    
    thunderLoop.start(0);
  }

  private static playGentleAmbient(synth: Tone.Synth): void {
    const gentleNotes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    
    const gentleLoop = new Tone.Loop((time) => {
      const note = gentleNotes[Math.floor(Math.random() * gentleNotes.length)];
      synth.triggerAttackRelease(note, '1', time);
    }, '2n');
    
    gentleLoop.start(0);
  }

  /**
   * Adapt music to story progression
   */
  static adaptMusicToStoryProgress(progressPercentage: number): void {
    if (!this.masterVolume || !this.currentTrack) return;

    // Gradually increase complexity as story progresses
    const complexity = progressPercentage / 100;
    
    // Adjust tempo slightly
    const baseTempo = this.getEmotionMusicConfig(this.currentTrack.emotion).tempo;
    const newTempo = baseTempo + (complexity * 10);
    Tone.Transport.bpm.value = newTempo;
    
    // Adjust volume based on story climax
    let volumeMultiplier = 1;
    if (progressPercentage > 70 && progressPercentage < 90) {
      // Climax - slightly louder
      volumeMultiplier = 1.2;
    } else if (progressPercentage > 90) {
      // Resolution - fade out
      volumeMultiplier = 0.8;
    }
    
    const currentVolume = this.masterVolume.volume.value;
    this.masterVolume.volume.rampTo(currentVolume * volumeMultiplier, 1);
  }

  /**
   * Create music visualization data
   */
  static getMusicVisualizationData(): { frequency: number; amplitude: number }[] {
    if (!this.isPlaying || !this.currentTrack) return [];

    // Generate mock visualization data based on current emotion
    const config = this.getEmotionMusicConfig(this.currentTrack.emotion);
    const data: { frequency: number; amplitude: number }[] = [];
    
    config.melody.forEach((freq, index) => {
      data.push({
        frequency: freq,
        amplitude: 0.3 + Math.random() * 0.7
      });
    });
    
    return data;
  }

  /**
   * Get available music styles
   */
  static getAvailableMusicStyles(): Array<{ id: string; name: string; description: string; emotions: EmotionType[] }> {
    return [
      {
        id: 'orchestral',
        name: 'Orchestral',
        description: 'Rich, cinematic soundscapes with strings and brass',
        emotions: ['excited', 'happy', 'surprised']
      },
      {
        id: 'ambient',
        name: 'Ambient',
        description: 'Gentle, atmospheric sounds perfect for calm stories',
        emotions: ['calm', 'neutral', 'sad']
      },
      {
        id: 'playful',
        name: 'Playful',
        description: 'Fun, bouncy melodies for silly adventures',
        emotions: ['silly', 'happy', 'excited']
      },
      {
        id: 'mysterious',
        name: 'Mysterious',
        description: 'Intriguing soundscapes for suspenseful moments',
        emotions: ['scared', 'surprised', 'neutral']
      },
      {
        id: 'emotional',
        name: 'Emotional',
        description: 'Touching melodies that tug at heartstrings',
        emotions: ['sad', 'happy', 'calm']
      }
    ];
  }

  /**
   * Cleanup resources
   */
  static dispose(): void {
    this.stopMusic();
    
    if (this.synth) {
      this.synth.dispose();
      this.synth = null;
    }
    
    if (this.masterVolume) {
      this.masterVolume.dispose();
      this.masterVolume = null;
    }
  }
}