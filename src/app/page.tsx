'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  PlayIcon,
  PauseIcon,
  PhotoIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from '@heroicons/react/24/solid';
import { useStore } from '@/store/slideshowStore';
import NameManager from '@/components/NameManager';
import Settings from '@/components/Settings';
import Onboarding from '@/components/Onboarding';

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentName, setCurrentName] = useState('');
  // State to toggle entire UI visibility
  const [uiHidden, setUIHidden] = useState(false);
  // State to toggle slider controls panel visibility
  const [showSliders, setShowSliders] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);

  const {
    images,
    names,
    settings,
    addImage,
    getRandomImageIndex,
    getRandomNamePermutation,
    updateSettings,
    clearImages
  } = useStore();

  // Update the current name
  const updateCurrentName = () => {
    if (names.length === 0) return;
    setCurrentName(getRandomNamePermutation());
  };

  // Initialize with a random name
  useEffect(() => {
    if (names.length > 0 && currentName === '') {
      updateCurrentName();
    }
  }, [names, currentName]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      for (const file of acceptedFiles) {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Set canvas size to target dimensions
            canvas.width = settings.imageWidth;
            canvas.height = settings.imageHeight;

            // Calculate scaling to maintain aspect ratio
            const scale = Math.min(
              canvas.width / img.width,
              canvas.height / img.height
            );

            // Calculate position to center the image
            const x = (canvas.width - img.width * scale) / 2;
            const y = (canvas.height - img.height * scale) / 2;

            // Draw the image
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

            // Convert to base64 and add to store
            addImage(canvas.toDataURL('image/jpeg', 0.8));
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    multiple: true
  });

  // Image transition effect
  useEffect(() => {
    let imageInterval: ReturnType<typeof setInterval>;
    if (isPlaying && images.length > 0) {
      imageInterval = setInterval(() => {
        setCurrentIndex(getRandomImageIndex());
      }, settings.imageTransitionSpeed);
    }
    return () => clearInterval(imageInterval);
  }, [isPlaying, images.length, settings.imageTransitionSpeed, getRandomImageIndex]);

  // Text transition effect
  useEffect(() => {
    let textInterval: ReturnType<typeof setInterval>;
    if (isPlaying && names.length > 0) {
      textInterval = setInterval(() => {
        updateCurrentName();
      }, settings.textTransitionSpeed);
    }
    return () => clearInterval(textInterval);
  }, [isPlaying, names, settings.textTransitionSpeed]);

  // Keyboard shortcuts: Space to play/pause, F to toggle UI visibility
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      } else if (e.code === 'KeyF') {
        setUIHidden(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  // Close slider panel if clicking outside of it
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sliderRef.current && !sliderRef.current.contains(e.target as Node)) {
        setShowSliders(false);
      }
    };
    if (showSliders) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSliders]);

  const getTransitionVariants = () => {
    switch (settings.transitionEffect) {
      case 'none':
        return {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 1 }
        };
      case 'slide':
        return {
          initial: { x: '100%', opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: '-100%', opacity: 0 }
        };
      case 'zoom':
        return {
          initial: { scale: 1.2, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0.8, opacity: 0 }
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
    }
  };

  const getPositionClass = () => {
    switch (settings.namePosition) {
      case 'top':
        return 'items-start pt-8';
      case 'bottom':
        return 'items-end pb-8';
      default:
        return 'items-center';
    }
  };

  const getImageFitClass = () => {
    switch (settings.imageFit) {
      case 'contain':
        return 'object-contain';
      case 'cover':
        return 'object-cover';
      case 'fill':
        return 'object-fill';
      default:
        return 'object-contain';
    }
  };

  return (
    <main className="min-h-screen relative">
      {/* Slideshow Container */}
      <div className="fixed inset-0 bg-black">
        {/* Image Container */}
        <AnimatePresence mode={settings.transitionEffect === 'none' ? 'sync' : 'wait'}>
          {images.length > 0 && (
            <motion.div
              key={`image-${currentIndex}`}
              {...getTransitionVariants()}
              transition={{
                duration: settings.transitionEffect === 'none' ? 0 : Math.max(0.1, settings.transitionDuration),
                ease: "easeInOut"
              }}
              className="absolute inset-0"
            >
              <img
                src={images[currentIndex]}
                alt={`Slide ${currentIndex + 1}`}
                className={`w-full h-full ${getImageFitClass()}`}
                style={{
                  maxWidth: `${settings.imageWidth}px`,
                  maxHeight: `${settings.imageHeight}px`,
                  margin: '0 auto'
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text Container */}
        <AnimatePresence mode="wait">
          {names.length > 0 && currentName && (
            <motion.div
              key={`text-${currentName}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: Math.max(0.1, settings.transitionDuration * 0.5),
                ease: "easeInOut"
              }}
              className={`absolute inset-0 flex justify-center ${getPositionClass()}`}
            >
              <div className="bg-black/50 backdrop-blur-sm px-8 py-4 rounded-lg">
                <h2 className="text-4xl font-bold text-white">
                  {currentName}
                </h2>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Onboarding - Show when no images */}
      {images.length === 0 && <Onboarding />}

      {/* UI Elements (only show if UI is not hidden) */}
      <AnimatePresence>
        {!uiHidden && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Name Manager */}
            <NameManager />

            {/* Top Right Controls */}
            <div className="fixed top-8 right-8 z-20 flex flex-col items-end space-y-4">
              {/* Upload Button */}
              <div
                {...getRootProps()}
                className={`bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all ${
                  isDragActive ? 'bg-blue-500/20 ring-2 ring-blue-500' : ''
                }`}
                title="Upload Images"
              >
                <input {...getInputProps()} />
                <PhotoIcon className="w-6 h-6 text-white" />
              </div>
              
              {/* Button to toggle slider panel */}
              <button
                onClick={() => setShowSliders(prev => !prev)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all"
                title="Show Sliders"
              >
                <span className="text-white text-sm">Sliders</span>
              </button>
            </div>

            {/* Slider Controls Panel */}
            {showSliders && (
              <div ref={sliderRef} className="fixed top-24 right-8 z-20 bg-white/10 p-4 rounded-lg backdrop-blur-sm text-white w-64 space-y-3">
                <div>
                  <label className="block text-sm">
                    Image Transition Speed (ms): {settings.imageTransitionSpeed}
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="3000"
                    step="100"
                    value={settings.imageTransitionSpeed}
                    onChange={(e) =>
                      updateSettings({ imageTransitionSpeed: parseInt(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm">
                    Text Transition Speed (ms): {settings.textTransitionSpeed}
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="3000"
                    step="100"
                    value={settings.textTransitionSpeed}
                    onChange={(e) =>
                      updateSettings({ textTransitionSpeed: parseInt(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm">
                    Image Width (px): {settings.imageWidth}
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="3840"
                    step="10"
                    value={settings.imageWidth}
                    onChange={(e) =>
                      updateSettings({ imageWidth: parseInt(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm">
                    Image Height (px): {settings.imageHeight}
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="2160"
                    step="10"
                    value={settings.imageHeight}
                    onChange={(e) =>
                      updateSettings({ imageHeight: parseInt(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-20">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all"
              >
                {isPlaying ? (
                  <PauseIcon className="w-6 h-6 text-white" />
                ) : (
                  <PlayIcon className="w-6 h-6 text-white" />
                )}
              </button>
              {/* Immersive icon toggles UI visibility */}
              <button
                onClick={() => setUIHidden(prev => !prev)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all"
                title="Toggle UI"
              >
                {uiHidden ? (
                  <ArrowsPointingInIcon className="w-6 h-6 text-white" />
                ) : (
                  <ArrowsPointingOutIcon className="w-6 h-6 text-white" />
                )}
              </button>
            </div>

            {/* Return the Settings widget at the bottom right */}
            <div className="fixed bottom-8 right-8 z-20">
              <Settings />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
