'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  PlayIcon,
  PauseIcon,
  PhotoIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon
} from '@heroicons/react/24/solid';
import { useStore } from '@/store/slideshowStore';
import NameManager from '@/components/NameManager';
import Settings from '@/components/Settings';
import Onboarding from '@/components/Onboarding';
import { useOpenAITTS } from '@/hooks/useOpenAITTS';

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentName, setCurrentName] = useState('');
  // State to toggle entire UI visibility
  const [uiHidden, setUIHidden] = useState(false);
  // State to toggle slider controls panel visibility
  const [showSliders, setShowSliders] = useState(false);
  // State for text dragging
  const [hasBeenDragged, setHasBeenDragged] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });
  const speechSynthRef = useRef<SpeechSynthesis | null>(null);
  // State to hold the API key read from sessionStorage
  const [openaiApiKey, setOpenaiApiKey] = useState<string>('');

  const {
    images,
    names,
    settings,
    addImage,
    removeImage,
    clearImages,
    updateSettings,
    getRandomNamePermutation,
    getRandomImageIndex
  } = useStore();

  // Get theme from settings
  const { theme } = settings;

  // Read OpenAI API key from sessionStorage when component mounts or ttsProvider changes
  useEffect(() => {
    if (settings.ttsProvider === 'openai') {
      const storedKey = sessionStorage.getItem('openaiApiKey');
      setOpenaiApiKey(storedKey || '');
    } else {
      // Clear the key state if OpenAI is not selected
      setOpenaiApiKey('');
    }
  }, [settings.ttsProvider]);

  // Instantiate the correct hook based on provider
  const { speak: speakWithOpenAI } = useOpenAITTS(openaiApiKey, settings.openaiSettings);

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

  // Initialize with a random image
  useEffect(() => {
    if (images.length > 0) {
      const randomIndex = getRandomImageIndex();
      setCurrentIndex(randomIndex === null ? -1 : randomIndex);
    }
  }, [images]);

  // Initialize browser speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthRef.current = window.speechSynthesis;
    }
    return () => {
      if (speechSynthRef.current) {
        speechSynthRef.current.cancel();
      }
    };
  }, []);

  // Speak the current name when it changes - UPDATED FOR OPENAI
  useEffect(() => {
    console.log(`[Speech Effect] Name: ${currentName}, Provider: ${settings.ttsProvider}, API Key State: ${openaiApiKey ? 'Set' : 'Empty'}`);

    if (!currentName || settings.isFullscreen) {
      console.log('[Speech Effect] Bailing out (no name or fullscreen).');
      // Ensure browser speech stops if we bail out
      if (speechSynthRef.current) {
         speechSynthRef.current.cancel();
      }
      // TODO: Need a way to stop ongoing OpenAI audio if bailing out
      return;
    }

    if (settings.ttsProvider === 'openai') {
      console.log('[Speech Effect] Provider is OpenAI.');
      // Cancel browser speech
      if (speechSynthRef.current) {
         speechSynthRef.current.cancel();
      }
      // Call OpenAI hook
      if (openaiApiKey) {
        console.log('[Speech Effect] Calling speakWithOpenAI...');
        speakWithOpenAI(currentName);
      } else {
        console.warn('[Speech Effect] OpenAI selected but API Key is missing.');
      }
    } else if (settings.ttsProvider === 'browser') {
      console.log('[Speech Effect] Provider is Browser.');
      // TODO: Need a way to stop ongoing OpenAI audio if switching to browser
      if (speechSynthRef.current && settings.speech?.enabled) {
        console.log('[Speech Effect] Browser speech enabled, speaking...');
        speechSynthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(currentName);
        utterance.rate = settings.speech?.rate ?? 1.0;
        utterance.pitch = settings.speech?.pitch ?? 1.0;
        utterance.volume = settings.speech?.volume ?? 1.0;
        speechSynthRef.current.speak(utterance);
      } else {
        console.log('[Speech Effect] Browser speech disabled or unavailable.');
        if (speechSynthRef.current) {
          speechSynthRef.current.cancel();
        }
      }
    }

  }, [currentName, settings.ttsProvider, settings.speech, settings.openaiSettings, settings.isFullscreen, openaiApiKey, speakWithOpenAI]);

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
        const randomIndex = getRandomImageIndex();
        setCurrentIndex(randomIndex === null ? -1 : randomIndex);
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      // Calculate delta from start position
      const deltaX = e.clientX - dragStartRef.current.mouseX;
      const deltaY = e.clientY - dragStartRef.current.mouseY;
      
      // Update position with the precise delta
      setTextPosition({
        x: dragStartRef.current.posX + deltaX,
        y: dragStartRef.current.posY + deltaY
      });
    };
    
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };
    
    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      
      const touch = e.touches[0];
      
      // Calculate delta from start position
      const deltaX = touch.clientX - dragStartRef.current.mouseX;
      const deltaY = touch.clientY - dragStartRef.current.mouseY;
      
      // Update position with the precise delta
      setTextPosition({
        x: dragStartRef.current.posX + deltaX,
        y: dragStartRef.current.posY + deltaY
      });
      
      // Prevent scrolling
      e.preventDefault();
    };
    
    const handleTouchEnd = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };
    
    // Add touch event listeners
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

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

  const toggleFullscreen = () => {
    if (typeof document !== 'undefined') {
      if (!settings.isFullscreen) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      updateSettings({ isFullscreen: !settings.isFullscreen });
    }
  };

  return (
    <main className="min-h-screen relative">
      {/* Slideshow Container */}
      <div className={`fixed inset-0 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
        {/* Image Container */}
        <AnimatePresence mode={settings.transitionEffect === 'none' ? 'sync' : 'wait'}>
          {images.length > 0 && currentIndex >= 0 ? (
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
          ) : (
            <motion.div
              key="blank-slide"
              {...getTransitionVariants()}
              transition={{
                duration: settings.transitionEffect === 'none' ? 0 : Math.max(0.1, settings.transitionDuration),
                ease: "easeInOut"
              }}
              className="absolute inset-0"
            >
              {/* This div will be black in dark mode and white in light mode */}
              <div className="w-full h-full" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text container with perfect manual positioning */}
        {currentName && (
          <div className="absolute inset-0 z-30 pointer-events-none">
            <div
              ref={textRef}
              className={`absolute px-8 py-4 rounded-lg select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${theme === 'dark' ? 'bg-black/50 backdrop-blur-sm' : 'bg-white/60 backdrop-blur-sm'}`}
              style={{
                pointerEvents: 'auto',
                left: hasBeenDragged ? `calc(50% + ${textPosition.x}px)` : '75%',  // Default to top right
                top: hasBeenDragged ? `calc(50% + ${textPosition.y}px)` : '25%', // Default to top right
                transform: isDragging ? 'translate(-50%, -50%) scale(1.02)' : 'translate(-50%, -50%)',
                boxShadow: isDragging ? '0 10px 25px rgba(0, 0, 0, 0.25)' : '0 4px 8px rgba(0, 0, 0, 0.1)',
                transition: 'box-shadow 0.2s, transform 0.2s',
                userSelect: 'none',
                touchAction: 'none'
              }}
              // Mouse down handler
              onMouseDown={(e) => {
                // Prevent default browser behavior
                e.preventDefault();
                
                // Mark as dragged if this is the first time
                if (!hasBeenDragged) {
                  setHasBeenDragged(true);
                  // Set initial position if dragging for the first time
                  setTextPosition({
                    x: textRef.current ? textRef.current.offsetWidth * 0.25 : 0,
                    y: textRef.current ? -textRef.current.offsetHeight * 1.25 : 0
                  });
                }
                
                // Store starting positions
                dragStartRef.current = {
                  mouseX: e.clientX,
                  mouseY: e.clientY,
                  posX: textPosition.x,
                  posY: textPosition.y
                };
                
                // Start dragging
                setIsDragging(true);
              }}
              // Touch start handler
              onTouchStart={(e) => {
                // Prevent scrolling
                e.preventDefault();
                
                // Mark as dragged if this is the first time
                if (!hasBeenDragged) {
                  setHasBeenDragged(true);
                  // Set initial position if dragging for the first time
                  setTextPosition({
                    x: textRef.current ? textRef.current.offsetWidth * 0.25 : 0,
                    y: textRef.current ? -textRef.current.offsetHeight * 1.25 : 0
                  });
                }
                
                // Only process first touch
                if (e.touches.length > 0) {
                  const touch = e.touches[0];
                  
                  // Store starting positions
                  dragStartRef.current = {
                    mouseX: touch.clientX,
                    mouseY: touch.clientY,
                    posX: textPosition.x,
                    posY: textPosition.y
                  };
                  
                  // Start dragging
                  setIsDragging(true);
                }
              }}
            >
              <AnimatePresence mode="wait">
                <motion.h2
                  key={currentName}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`font-bold whitespace-nowrap ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}
                  style={{ fontSize: `${settings.textSize}px` }}
                >
                  {currentName}
                </motion.h2>
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Persistent Exit Immersive Mode Button */}
        {uiHidden && (
          <div className="fixed top-4 right-4 z-50">
            <button
              onClick={() => setUIHidden(false)}
              className="p-2 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-sm transition-colors"
            >
              <ArrowsPointingInIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        )}
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
                className={`${settings.theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/10 hover:bg-black/20 text-gray-800'} backdrop-blur-sm p-3 rounded-full transition-all cursor-pointer ${isDragActive ? 'bg-blue-500/20 ring-2 ring-blue-500' : ''}`}
                title="Upload Images"
              >
                <input {...getInputProps()} />
                <PhotoIcon className="w-6 h-6" />
              </div>

              {/* Button to toggle slider panel */} 
              <button
                onClick={() => setShowSliders(prev => !prev)}
                className={`${settings.theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/10 hover:bg-black/20 text-gray-800'} backdrop-blur-sm p-3 rounded-full transition-all`}
                title="Show Sliders"
              >
                 {/* Replace Sliders text with an icon if desired */} 
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                 </svg>
              </button>
            </div>

            {/* Speech Indicator */}
            {currentName && settings.speech?.enabled && (
              <div className="fixed top-8 left-8 bg-white/10 backdrop-blur-sm p-3 rounded-full z-20">
                <SpeakerWaveIcon className="w-6 h-6 text-white" />
              </div>
            )}

            {/* Slider Controls Panel - Adjusted top position */}
            {showSliders && (
              <div 
                ref={sliderRef} 
                className={`fixed top-36 right-8 z-20 p-4 rounded-lg backdrop-blur-sm w-64 space-y-3 ${settings.theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-gray-800'}`}
              >
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
                    Text Size (px): {settings.textSize}
                  </label>
                  <input
                    type="range"
                    min="16"
                    max="100"
                    step="1"
                    value={settings.textSize}
                    onChange={(e) =>
                      updateSettings({ textSize: parseInt(e.target.value) })
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
                <div>
                  <label className="block text-sm">
                    Blank Image Probability: {Math.round(settings.blankImageProbability * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.blankImageProbability}
                    onChange={(e) =>
                      updateSettings({ blankImageProbability: parseFloat(e.target.value) })
                    }
                    className="w-full"
                  />
                  <p className="text-xs mt-1 opacity-70">
                    Experimental: Controls frequency of blank frames
                  </p>
                </div>
              </div>
            )}

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
              <button
                onClick={() => updateSettings({
                  speech: {
                    ...(settings.speech || { rate: 1.0, pitch: 1.0, volume: 1.0 }),
                    enabled: !settings.speech?.enabled
                  }
                })}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all"
                title={settings.speech?.enabled ? "Mute Speech" : "Enable Speech"}
              >
                {settings.speech?.enabled ? (
                  <SpeakerWaveIcon className="w-6 h-6 text-white" />
                ) : (
                  <SpeakerXMarkIcon className="w-6 h-6 text-white" />
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
