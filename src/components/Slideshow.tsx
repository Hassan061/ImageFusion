import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/slideshowStore';

export default function Slideshow() {
  const { images, settings, getRandomImageIndex, getRandomNamePermutation } = useStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentName, setCurrentName] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying || images.length === 0) return;

    const imageInterval = setInterval(() => {
      setCurrentImageIndex(getRandomImageIndex());
    }, settings.imageTransitionSpeed);

    const textInterval = setInterval(() => {
      setCurrentName(getRandomNamePermutation());
    }, settings.textTransitionSpeed);

    return () => {
      clearInterval(imageInterval);
      clearInterval(textInterval);
    };
  }, [isPlaying, images.length, settings.imageTransitionSpeed, settings.textTransitionSpeed, getRandomImageIndex, getRandomNamePermutation]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsPlaying(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p className="text-xl">No images uploaded yet. Drag and drop images to start.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <img
            src={images[currentImageIndex]}
            alt="Slideshow"
            className="w-full h-full object-contain"
            style={{
              maxWidth: settings.imageWidth,
              maxHeight: settings.imageHeight,
              objectFit: settings.imageFit,
            }}
          />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentName}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute w-full text-center text-white text-4xl font-bold"
          style={{
            top: settings.namePosition === 'top' ? '10%' :
                  settings.namePosition === 'center' ? '50%' : '90%',
          }}
        >
          {currentName}
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => setIsPlaying(prev => !prev)}
          className="px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
    </div>
  );
} 