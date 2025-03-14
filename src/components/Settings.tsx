'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cog6ToothIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useStore } from '@/store/slideshowStore';

export default function Settings() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSettings, images, clearImages } = useStore();

  const handleChange = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value });
  };

  const handleClearImages = () => {
    if (window.confirm('Are you sure you want to clear all images? This action cannot be undone.')) {
      clearImages();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all"
      >
        <Cog6ToothIcon className="w-6 h-6 text-white" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-8 bg-black/80 backdrop-blur-sm p-6 rounded-lg w-80"
          >
            <h3 className="text-xl font-semibold mb-4 text-white">Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Image Transition Speed (ms)
                </label>
                <input
                  type="number"
                  value={settings.imageTransitionSpeed}
                  onChange={(e) => handleChange('imageTransitionSpeed', parseInt(e.target.value))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Text Transition Speed (ms)
                </label>
                <input
                  type="number"
                  value={settings.textTransitionSpeed}
                  onChange={(e) => handleChange('textTransitionSpeed', parseInt(e.target.value))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Transition Effect
                </label>
                <select
                  value={settings.transitionEffect}
                  onChange={(e) => handleChange('transitionEffect', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">None</option>
                  <option value="fade">Fade</option>
                  <option value="slide">Slide</option>
                  <option value="zoom">Zoom</option>
                </select>
              </div>

              {settings.transitionEffect !== 'none' && (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Transition Duration (seconds)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="1"
                    value={settings.transitionDuration}
                    onChange={(e) => handleChange('transitionDuration', parseFloat(e.target.value))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-white/50 mt-1">
                    Controls the speed of transition effects (0.1 - 1.0 seconds)
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Name Position
                </label>
                <select
                  value={settings.namePosition}
                  onChange={(e) => handleChange('namePosition', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="top">Top</option>
                  <option value="center">Center</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Image Fit
                </label>
                <select
                  value={settings.imageFit}
                  onChange={(e) => handleChange('imageFit', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="contain">Contain (show full image)</option>
                  <option value="cover">Cover (fill screen, may crop)</option>
                  <option value="fill">Fill (stretch to fit)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Width
                  </label>
                  <input
                    type="number"
                    value={settings.imageWidth}
                    onChange={(e) => handleChange('imageWidth', parseInt(e.target.value))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Height
                  </label>
                  <input
                    type="number"
                    value={settings.imageHeight}
                    onChange={(e) => handleChange('imageHeight', parseInt(e.target.value))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Clear Images Button */}
            {images.length > 0 && (
              <div className="mt-6 pt-4 border-t border-white/10">
                <button
                  onClick={handleClearImages}
                  className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 text-sm opacity-60 hover:opacity-100 transition-all"
                >
                  <TrashIcon className="w-4 h-4" />
                  Clear All Images
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 