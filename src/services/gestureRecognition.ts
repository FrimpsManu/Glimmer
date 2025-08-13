import { StorySymbol } from '../types';

// Gesture recognition using MediaPipe Hands
export class GestureRecognitionService {
  private hands: any = null;
  private camera: any = null;
  private isInitialized = false;
  private onGestureCallback: ((gesture: string, confidence: number) => void) | null = null;

  /**
   * Initialize gesture recognition
   */
  async initialize(): Promise<boolean> {
    try {
      // Dynamic import to avoid loading if not used
      const { Hands } = await import('@mediapipe/hands');
      const { Camera } = await import('@mediapipe/camera_utils');

      this.hands = new Hands({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      this.hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.hands.onResults(this.onResults.bind(this));
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.warn('Gesture recognition not available:', error);
      return false;
    }
  }

  /**
   * Start gesture recognition from camera
   */
  async startCamera(): Promise<boolean> {
    if (!this.isInitialized) return false;

    try {
      const videoElement = document.createElement('video');
      videoElement.style.display = 'none';
      document.body.appendChild(videoElement);

      const { Camera } = await import('@mediapipe/camera_utils');
      this.camera = new Camera(videoElement, {
        onFrame: async () => {
          await this.hands.send({ image: videoElement });
        },
        width: 640,
        height: 480
      });

      await this.camera.start();
      return true;
    } catch (error) {
      console.error('Camera access failed:', error);
      return false;
    }
  }

  /**
   * Process hand landmarks and detect gestures
   */
  private onResults(results: any) {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      const gesture = this.classifyGesture(landmarks);
      
      if (gesture && this.onGestureCallback) {
        this.onGestureCallback(gesture.name, gesture.confidence);
      }
    }
  }

  /**
   * Classify hand gesture based on landmarks
   */
  private classifyGesture(landmarks: any[]): { name: string; confidence: number } | null {
    // Simple gesture classification
    const fingerTips = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky
    const fingerPips = [3, 6, 10, 14, 18];
    
    let extendedFingers = 0;
    
    // Check which fingers are extended
    for (let i = 1; i < 5; i++) {
      if (landmarks[fingerTips[i]].y < landmarks[fingerPips[i]].y) {
        extendedFingers++;
      }
    }
    
    // Thumb check (different axis)
    if (landmarks[fingerTips[0]].x > landmarks[fingerPips[0]].x) {
      extendedFingers++;
    }

    // Classify gestures
    switch (extendedFingers) {
      case 0:
        return { name: 'fist', confidence: 0.8 };
      case 1:
        return { name: 'point', confidence: 0.8 };
      case 2:
        return { name: 'peace', confidence: 0.8 };
      case 5:
        return { name: 'open_hand', confidence: 0.8 };
      default:
        return null;
    }
  }

  /**
   * Set gesture callback
   */
  setGestureCallback(callback: (gesture: string, confidence: number) => void) {
    this.onGestureCallback = callback;
  }

  /**
   * Stop gesture recognition
   */
  stop() {
    if (this.camera) {
      this.camera.stop();
    }
  }
}

export const gestureService = new GestureRecognitionService();