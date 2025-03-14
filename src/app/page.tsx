'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { PlayIcon, PauseIcon, PhotoIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, TrashIcon } from '@heroicons/react/24/solid';
import { useStore } from '@/store/slideshowStore';
import NameManager from '@/components/NameManager';
import Settings from '@/components/Settings';
import Onboarding from '@/components/Onboarding';

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
    multiple: true,
    onDragEnter: () => {},
    onDragOver: () => {},
    onDragLeave: () => {}
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

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      updateSettings({ isFullscreen: true });
    } else {
      document.exitFullscreen();
      updateSettings({ isFullscreen: false });
    }
  };

  // Handle fullscreen change event
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        updateSettings({ isFullscreen: false });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [updateSettings]);

  // Update keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  // Handle clear images
  const handleClearImages = () => {
    if (window.confirm('Are you sure you want to clear all images? This action cannot be undone.')) {
      clearImages();
      setCurrentIndex(0);
    }
  };

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
                duration: settings.transitionEffect === 'none' ? 0 : settings.transitionDuration,
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
                duration: settings.transitionDuration * 0.5,
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

      {/* UI Elements - Only show when not in fullscreen */}
      <AnimatePresence>
        {!settings.isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Name Manager */}
            <NameManager />

            {/* Upload Button */}
            <div
              {...getRootProps()}
              className={`fixed top-8 right-8 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all z-20 ${
                isDragActive ? 'bg-blue-500/20 ring-2 ring-blue-500' : ''
              }`}
              title="Upload Images"
            >
              <input {...getInputProps()} />
              <PhotoIcon className="w-6 h-6 text-white" />
            </div>

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
              <button
                onClick={toggleFullscreen}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all"
              >
                {settings.isFullscreen ? (
                  <ArrowsPointingInIcon className="w-6 h-6 text-white" />
                ) : (
                  <ArrowsPointingOutIcon className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
} 