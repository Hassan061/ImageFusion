'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { PlayIcon, PauseIcon, PhotoIcon } from '@heroicons/react/24/solid';
import { useStore } from '@/store/slideshowStore';
import NameManager from '@/components/NameManager';
import Settings from '@/components/Settings';

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentName, setCurrentName] = useState('');
  const { 
    images, 
    names, 
    settings, 
    addImage, 
    getRandomImageIndex,
    getRandomNamePermutation 
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
    multiple: true,
    onDragEnter: () => {},
    onDragOver: () => {},
    onDragLeave: () => {}
  });

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && images.length > 0) {
      interval = setInterval(() => {
        // Get a random image
        setCurrentIndex(getRandomImageIndex());
        
        // Get a random name permutation
        updateCurrentName();
      }, settings.transitionSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, images.length, settings.transitionSpeed, getRandomImageIndex, names]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

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
        <AnimatePresence mode={settings.transitionEffect === 'none' ? 'sync' : 'wait'}>
          {images.length > 0 && (
            <motion.div
              key={currentIndex}
              {...getTransitionVariants()}
              transition={{ duration: settings.transitionEffect === 'none' ? 0 : 0.5 }}
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
              {names.length > 0 && currentName && (
                <div className={`absolute inset-0 flex justify-center ${getPositionClass()}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/50 backdrop-blur-sm px-8 py-4 rounded-lg"
                  >
                    <h2 className="text-4xl font-bold text-white">
                      {currentName}
                    </h2>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Name Manager */}
      <NameManager />

      {/* Settings */}
      <Settings />

      {/* Controls */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
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
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`fixed top-8 right-8 p-4 rounded-lg border-2 border-dashed transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600'
        }`}
      >
        <input {...getInputProps()} />
        <PhotoIcon className="w-8 h-8 text-gray-400" />
      </div>
    </main>
  );
} 