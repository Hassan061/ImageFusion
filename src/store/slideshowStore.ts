import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NameTuple {
  firstName: string;
  lastName: string;
}

interface SlideshowState {
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
  };
  addImage: (image: string) => void;
  removeImage: (index: number) => void;
  clearImages: () => void;
  addName: (firstName: string, lastName: string) => void;
  removeName: (index: number) => void;
  updateSettings: (settings: Partial<SlideshowState['settings']>) => void;
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
  }
};

export const useStore = create<SlideshowState>()(
  persist(
    (set, get) => ({
      images: [],
      names: DEFAULT_NAMES,
      settings: DEFAULT_SETTINGS,
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
          settings: { ...state.settings, ...newSettings },
        })),
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
        settings: state.settings,
      }),
    }
  )
);