'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useStore } from '@/store/slideshowStore';

export default function Settings() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSettings } = useStore();

  const handleChange = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value });
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
                  Transition Speed (ms)
                </label>
                <input
                  type="number"
                  value={settings.transitionSpeed}
                  onChange={(e) => handleChange('transitionSpeed', parseInt(e.target.value))}
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 