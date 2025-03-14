'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, TrashIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useStore } from '@/store/slideshowStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const { settings, updateSettings, images, clearImages } = useStore();
  const router = useRouter();

  const handleChange = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value });
  };

  const handleClearImages = () => {
    if (window.confirm('Are you sure you want to clear all images? This action cannot be undone.')) {
      clearImages();
    }
  };

  // Handle escape key to exit settings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.push('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'transitions', label: 'Transitions' },
    { id: 'advanced', label: 'Advanced' },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/" className="mr-4 p-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/20 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* General Tab */}
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold mb-4">Slideshow Timing</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
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
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Text Transition Speed (ms)
                    </label>
                    <input
                      type="number"
                      value={settings.textTransitionSpeed}
                      onChange={(e) => handleChange('textTransitionSpeed', parseInt(e.target.value))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold mb-4">Display Options</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
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
                    <label className="block text-sm font-medium text-white/70 mb-2">
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
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Image Dimensions</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Width (px)
                    </label>
                    <input
                      type="number"
                      value={settings.imageWidth}
                      onChange={(e) => handleChange('imageWidth', parseInt(e.target.value))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Height (px)
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

          {/* Transitions Tab */}
          {activeTab === 'transitions' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold mb-4">Transition Effects</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
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
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Transition Duration (seconds)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="1"
                        value={settings.transitionDuration}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          // Ensure value is at least 0.1 seconds
                          handleChange('transitionDuration', Math.max(0.1, value));
                        }}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-white/50 mt-1">
                        Controls the speed of transition effects (0.1 - 1.0 seconds)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold mb-4">Data Management</h2>
                <div className="p-4 border border-red-500/30 bg-red-500/10 rounded-lg">
                  <h3 className="text-lg font-medium text-red-400 mb-2">Danger Zone</h3>
                  <p className="text-white/70 mb-4">
                    These actions cannot be undone. Please be certain.
                  </p>
                  
                  {images.length > 0 && (
                    <button
                      onClick={handleClearImages}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                      Clear All Images ({images.length})
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Settings button at bottom right */}
      <Link
        href="/"
        className="fixed bottom-8 right-8 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all z-20"
        title="Back to Slideshow"
      >
        <Cog6ToothIcon className="w-6 h-6 text-white" />
      </Link>

      {/* Keyboard shortcut hint */}
      <div className="fixed bottom-8 left-8 text-white/40 text-sm">
        Press <kbd className="px-2 py-1 bg-white/10 rounded">Esc</kbd> to exit settings
      </div>
    </div>
  );
} 