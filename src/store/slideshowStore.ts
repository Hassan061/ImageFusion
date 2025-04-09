import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NameTuple {
  firstName: string;
  lastName: string;
}

// Define the settings structure for ElevenLabs
interface ElevenLabsSettings {
  voiceId: string; // Required Voice ID
  model_id?: string; // Optional Model ID
  // Add other potential settings like stability, similarity_boost, etc.
}

// Export the main state interface
export interface SlideshowState {
  images: string[];
  names: NameTuple[];
  settings: {
    imageWidth: number;
    imageHeight: number;
    imageFit: 'contain' | 'cover' | 'fill';
    imageTransitionSpeed: number;
    textTransitionSpeed: number;
    transitionEffect: 'none' | 'fade' | 'slide' | 'zoom';
    transitionDuration: number;  // Duration in seconds for transition effects
    namePosition: 'top' | 'center' | 'bottom';
    isFullscreen: boolean;
    theme: 'dark' | 'light';
    textSize: number; // Text size in pixels
    blankImageProbability: number; // Probability of showing a blank image (0-1)
    speech: {
      enabled: boolean;
      rate: number;
      pitch: number;
      volume: number;
    };
    ttsProvider: 'browser' | 'openai' | 'elevenlabs'; // Add elevenlabs as a provider
    openaiSettings?: { // Make optional in case not used
      model: 'tts-1' | 'tts-1-hd';
      voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
      speed: number; // 0.25 to 4.0
    };
    elevenLabsSettings?: ElevenLabsSettings; // Add settings for ElevenLabs
  };
  // We will store API keys in sessionStorage, not in the persisted state
  // elevenLabsApiKey: string | null; // Not persisted
  addImage: (image: string) => void;
  removeImage: (index: number) => void;
  clearImages: () => void;
  addName: (firstName: string, lastName: string) => void;
  removeName: (index: number) => void;
  updateSettings: (settings: Partial<SlideshowState['settings']>) => void;
  // setElevenLabsApiKey: (key: string | null) => void; // Action to set key (managed in component state + sessionStorage)
  getRandomImageIndex: () => number | null;
  getRandomNamePermutation: () => string;
}

// Default names
const DEFAULT_NAMES: NameTuple[] = [
  { firstName: "Emma", lastName: "Watson" },
  { firstName: "Claire", lastName: "Boucher" },
  { firstName: "Fadhel", lastName: "Shoubbar" },
  { firstName: "Mohammed", lastName: "Al Herz" },
  { firstName: "Kristen", lastName: "Stewart" },
  { firstName: "Zara", lastName: "Tatiana" },
  { firstName: "Shanice", lastName: "Hardie" },
  { firstName: "Hebah", lastName: "Al Shawarib" },
  { firstName: "Vanessa", lastName: "Hudgens" },
  { firstName: "Yasmine", lastName: "Curren" },
  { firstName: "Amy", lastName: "Sheridan" }
];

const MAX_IMAGES = 20; // Limit number of stored images
const DEFAULT_SETTINGS = {
  imageWidth: 633,
  imageHeight: 866,
  imageFit: 'contain' as const,
  imageTransitionSpeed: 1000,
  textTransitionSpeed: 2000,
  transitionEffect: 'none' as const,
  transitionDuration: 0.2,  // 200ms default for transition effects
  namePosition: 'top' as const,
  isFullscreen: false,
  theme: 'dark' as const,
  textSize: 36, // Default text size in pixels
  blankImageProbability: 0, // 0 probability of blank images by default
  speech: {
    enabled: true,
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0
  },
  ttsProvider: 'browser' as const, // Default to browser
  openaiSettings: {
    model: 'tts-1' as const,
    voice: 'alloy' as const,
    speed: 1.0,
  },
  elevenLabsSettings: { // Default ElevenLabs settings
    voiceId: '21m00Tcm4TlvDq8ikWAM', // Default to a common voice like "Rachel"
    model_id: 'eleven_monolingual_v1'
  }
};

export const useStore = create<SlideshowState>()(
  persist(
    (set, get) => ({
      images: [],
      names: DEFAULT_NAMES,
      settings: DEFAULT_SETTINGS,
      // elevenLabsApiKey: null, // Initial state for API key (managed locally)
      addImage: (image) =>
        set((state) => {
          // If we've reached the limit, remove the oldest image
          const newImages = [...state.images];
          if (newImages.length >= MAX_IMAGES) {
            newImages.shift();
          }
          return {
            images: [...newImages, image],
          };
        }),
      removeImage: (index) =>
        set((state) => ({
          images: state.images.filter((_, i) => i !== index),
        })),
      clearImages: () =>
        set(() => ({
          images: [],
        })),
      addName: (firstName, lastName) =>
        set((state) => ({
          names: [...state.names, { firstName, lastName }],
        })),
      removeName: (index) =>
        set((state) => ({
          names: state.names.filter((_, i) => i !== index),
        })),
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
            // Ensure nested objects are merged correctly
            ...(newSettings.speech && { speech: { ...state.settings.speech, ...newSettings.speech } }),
            // Ensure openaiSettings is merged correctly
            ...(newSettings.openaiSettings && { openaiSettings: { ...(state.settings.openaiSettings ?? {}), ...newSettings.openaiSettings } }),
            // Ensure elevenLabsSettings is merged correctly
            ...(newSettings.elevenLabsSettings && { elevenLabsSettings: { ...(state.settings.elevenLabsSettings ?? {}), ...newSettings.elevenLabsSettings } })
          }
        })),
      // setElevenLabsApiKey: (key) => set({ elevenLabsApiKey: key }), // Action managed locally
      getRandomImageIndex: () => {
        const state = get();
        const { settings, images } = state;
        
        if (images.length === 0) return 0;
        
        // Check if we should show a blank image based on probability
        if (settings.blankImageProbability > 0) {
          const random = Math.random();
          if (random < settings.blankImageProbability) {
            // Return null to indicate we should show a blank image
            return null;
          }
        }
        
        // Otherwise return a random image index as before
        return Math.floor(Math.random() * images.length);
      },
      getRandomNamePermutation: () => {
        const state = get();
        const { names } = state;
        
        if (names.length === 0) return "";
        
        // Randomly select first and last names
        const randomFirstNameIndex = Math.floor(Math.random() * names.length);
        const randomLastNameIndex = Math.floor(Math.random() * names.length);
        
        const firstName = names[randomFirstNameIndex].firstName;
        const lastName = names[randomLastNameIndex].lastName;
        
        return `${firstName} ${lastName}`;
      }
    }),
    {
      name: 'slideshow-storage',
      partialize: (state) => ({
        images: state.images,
        names: state.names,
        settings: {
          ...state.settings,
          // Exclude API keys from persisted state
          // Make settings objects optional in partial state if they can be undefined initially
          openaiSettings: state.settings.openaiSettings ? { ...state.settings.openaiSettings } : undefined,
          elevenLabsSettings: state.settings.elevenLabsSettings ? { ...state.settings.elevenLabsSettings } : undefined,
        }
      }),
    }
  )
);