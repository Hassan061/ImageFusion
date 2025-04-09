'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, TrashIcon, Cog6ToothIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useStore, SlideshowState } from '@/store/slideshowStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useOpenAITTS } from '@/hooks/useOpenAITTS';
import { useElevenLabsTTS } from '@/hooks/useElevenLabsTTS';

// DEV ONLY: Pre-fill API Key for testing (Update for OpenAI if desired)
// const DEV_OPENAI_API_KEY = 'YOUR_DEV_OPENAI_KEY'; // Replace if needed
const DEV_OPENAI_API_KEY = ''; // Start empty by default
const DEV_ELEVENLABS_API_KEY = 'sk_9182c4205b49c91d4ea0e204636e8c401dcd9169bb2c703a'; // Add your dev key here

// ElevenLabs Voice IDs (Add more as needed)
// Find IDs: https://api.elevenlabs.io/v1/voices
const elevenLabsVoices = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel' },
  { id: '2EiwWnXFnvU5JabPnv8n', name: 'Clyde' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Antoni' },
  { id: 'SOYHLrjzK2X1ezoPC6cr', name: 'Thomas' },
  // Add more pre-made or cloned voice IDs here
];

// Define default settings objects locally to satisfy hook types
const defaultOpenAISettings = {
  model: 'tts-1' as const,
  voice: 'alloy' as const,
  speed: 1.0,
};

const defaultElevenLabsSettings = {
  voiceId: '21m00Tcm4TlvDq8ikWAM', // Default voice ID (e.g., Rachel)
  model_id: 'eleven_monolingual_v1',
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('speech'); // Default to speech tab
  // Locally manage OpenAI API key state
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState(''); // State for ElevenLabs key
  const { settings, updateSettings, images, clearImages } = useStore();
  const router = useRouter();

  // Instantiate TTS Hooks with defaults to satisfy types
  const { speak: testOpenAISpeech } = useOpenAITTS(
    openaiApiKey, 
    settings.openaiSettings ?? defaultOpenAISettings // Provide default if undefined
  );
  const { speak: testElevenLabsSpeech } = useElevenLabsTTS(
    elevenLabsApiKey, 
    settings.elevenLabsSettings ?? defaultElevenLabsSettings // Provide default if undefined
  ); 

  // Load API key from sessionStorage on mount, pre-fill if DEV key provided
  useEffect(() => {
    let storedOpenAIKey = sessionStorage.getItem('openaiApiKey');
    if (!storedOpenAIKey && DEV_OPENAI_API_KEY) {
      console.log('[DEV] Pre-filling OpenAI API Key for testing.');
      storedOpenAIKey = DEV_OPENAI_API_KEY;
      sessionStorage.setItem('openaiApiKey', storedOpenAIKey);
    }
    if (storedOpenAIKey) {
      setOpenaiApiKey(storedOpenAIKey);
    }

    let storedElevenLabsKey = sessionStorage.getItem('elevenLabsApiKey');
    if (!storedElevenLabsKey && DEV_ELEVENLABS_API_KEY) {
      storedElevenLabsKey = DEV_ELEVENLABS_API_KEY;
      sessionStorage.setItem('elevenLabsApiKey', storedElevenLabsKey);
    }
    if (storedElevenLabsKey) {
      setElevenLabsApiKey(storedElevenLabsKey);
    }
  }, []);

  // Handle API key change and save to sessionStorage
  const handleApiKeyChange = useCallback((keyType: 'openai' | 'elevenlabs', value: string) => {
    if (keyType === 'openai') {
      setOpenaiApiKey(value);
      sessionStorage.setItem('openaiApiKey', value);
    } else if (keyType === 'elevenlabs') {
      setElevenLabsApiKey(value);
      sessionStorage.setItem('elevenLabsApiKey', value);
    }
  }, []);

  // Handle nested settings update - Refined type handling
  const handleSettingChange = useCallback((key: string | keyof SlideshowState['settings'], value: any) => {
    // Ensure key is a string before attempting to split
    if (typeof key !== 'string') {
      console.warn(`handleSettingChange received non-string key: ${String(key)}`);
      return; 
    }

    const keyParts = key.split('.');
    const topLevelKey = keyParts[0] as keyof SlideshowState['settings'];
    const subKey = keyParts[1];

    if (topLevelKey === 'speech' && subKey) {
      updateSettings({ speech: { ...settings.speech, [subKey]: value } });
    } else if (topLevelKey === 'openaiSettings' && subKey) {
      const parsedValue = subKey === 'speed' ? parseFloat(value) : value;
      const currentSettings = settings.openaiSettings ?? defaultOpenAISettings;
      updateSettings({ openaiSettings: { ...currentSettings, [subKey]: parsedValue } });
    } else if (topLevelKey === 'elevenLabsSettings' && subKey) {
      const currentSettings = settings.elevenLabsSettings ?? defaultElevenLabsSettings;
      updateSettings({ elevenLabsSettings: { ...currentSettings, [subKey]: value } });
    } else if (keyParts.length === 1 && topLevelKey in settings) { // Check it's a valid top-level key
      updateSettings({ [topLevelKey]: value });
    } else {
      console.warn(`Attempted to update unhandled setting key: ${key}`);
    }
  }, [updateSettings, settings]);

  const handleClearImages = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all images? This action cannot be undone.')) {
      clearImages();
    }
  }, [clearImages]);

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
    { id: 'speech', label: 'Speech' },
    { id: 'advanced', label: 'Advanced' },
  ];

  // OpenAI Options
  const openaiModels = ['tts-1', 'tts-1-hd'];
  const openaiVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

  return (
    <div className={`min-h-screen ${settings.theme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-800'} p-6 pb-24`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/" className={`mr-4 p-2 rounded-full ${settings.theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/10'} transition-colors`}>
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        {/* Tabs */}
        <div className={`flex border-b ${settings.theme === 'dark' ? 'border-white/20' : 'border-gray-200'} mb-8`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? settings.theme === 'dark' ? 'text-white border-b-2 border-blue-500' : 'text-gray-800 border-b-2 border-blue-500'
                  : settings.theme === 'dark' ? 'text-white/50 hover:text-white/80' : 'text-gray-500 hover:text-gray-700'
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
                    <label className={`block text-sm font-medium ${settings.theme === 'dark' ? 'text-white/70' : 'text-gray-600'} mb-2`}>
                      Image Transition Speed (ms)
                    </label>
                    <input
                      type="number"
                      value={settings.imageTransitionSpeed}
                      onChange={(e) => handleSettingChange('imageTransitionSpeed', parseInt(e.target.value))}
                      className={`w-full ${
                        settings.theme === 'dark' 
                          ? 'bg-white/10 border-white/20 text-white focus:ring-blue-500' 
                          : 'bg-gray-50 border-gray-300 text-gray-800 focus:ring-blue-500'
                      } border rounded-lg px-4 py-2 focus:outline-none focus:ring-2`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${settings.theme === 'dark' ? 'text-white/70' : 'text-gray-600'} mb-2`}>
                      Text Transition Speed (ms)
                    </label>
                    <input
                      type="number"
                      value={settings.textTransitionSpeed}
                      onChange={(e) => handleSettingChange('textTransitionSpeed', parseInt(e.target.value))}
                      className={`w-full ${
                        settings.theme === 'dark' 
                          ? 'bg-white/10 border-white/20 text-white focus:ring-blue-500' 
                          : 'bg-gray-50 border-gray-300 text-gray-800 focus:ring-blue-500'
                      } border rounded-lg px-4 py-2 focus:outline-none focus:ring-2`}
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
                    <label className={`block text-sm font-medium ${settings.theme === 'dark' ? 'text-white/70' : 'text-gray-600'} mb-2`}>
                      Theme Mode
                    </label>
                    <select
                      value={settings.theme}
                      onChange={(e) => handleSettingChange('theme', e.target.value)}
                      className={`w-full ${
                        settings.theme === 'dark' 
                          ? 'bg-white/10 border-white/20 text-white focus:ring-blue-500' 
                          : 'bg-gray-50 border-gray-300 text-gray-800 focus:ring-blue-500'
                      } border rounded-lg px-4 py-2 focus:outline-none focus:ring-2`}
                    >
                      <option value="dark">Dark Mode</option>
                      <option value="light">Light Mode</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${settings.theme === 'dark' ? 'text-white/70' : 'text-gray-600'} mb-2`}>
                      Image Fit
                    </label>
                    <select
                      value={settings.imageFit}
                      onChange={(e) => handleSettingChange('imageFit', e.target.value)}
                      className={`w-full ${
                        settings.theme === 'dark' 
                          ? 'bg-white/10 border-white/20 text-white focus:ring-blue-500' 
                          : 'bg-gray-50 border-gray-300 text-gray-800 focus:ring-blue-500'
                      } border rounded-lg px-4 py-2 focus:outline-none focus:ring-2`}
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
                    <label className={`block text-sm font-medium ${settings.theme === 'dark' ? 'text-white/70' : 'text-gray-600'} mb-2`}>
                      Width (px)
                    </label>
                    <input
                      type="number"
                      value={settings.imageWidth}
                      onChange={(e) => handleSettingChange('imageWidth', parseInt(e.target.value))}
                      className={`w-full ${
                        settings.theme === 'dark' 
                          ? 'bg-white/10 border-white/20 text-white focus:ring-blue-500' 
                          : 'bg-gray-50 border-gray-300 text-gray-800 focus:ring-blue-500'
                      } border rounded-lg px-4 py-2 focus:outline-none focus:ring-2`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${settings.theme === 'dark' ? 'text-white/70' : 'text-gray-600'} mb-2`}>
                      Height (px)
                    </label>
                    <input
                      type="number"
                      value={settings.imageHeight}
                      onChange={(e) => handleSettingChange('imageHeight', parseInt(e.target.value))}
                      className={`w-full ${
                        settings.theme === 'dark' 
                          ? 'bg-white/10 border-white/20 text-white focus:ring-blue-500' 
                          : 'bg-gray-50 border-gray-300 text-gray-800 focus:ring-blue-500'
                      } border rounded-lg px-4 py-2 focus:outline-none focus:ring-2`}
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
                    <label className={`block text-sm font-medium ${settings.theme === 'dark' ? 'text-white/70' : 'text-gray-600'} mb-2`}>
                      Transition Effect
                    </label>
                    <select
                      value={settings.transitionEffect}
                      onChange={(e) => handleSettingChange('transitionEffect', e.target.value)}
                      className={`w-full ${
                        settings.theme === 'dark' 
                          ? 'bg-white/10 border-white/20 text-white focus:ring-blue-500' 
                          : 'bg-gray-50 border-gray-300 text-gray-800 focus:ring-blue-500'
                      } border rounded-lg px-4 py-2 focus:outline-none focus:ring-2`}
                    >
                      <option value="none">None</option>
                      <option value="fade">Fade</option>
                      <option value="slide">Slide</option>
                      <option value="zoom">Zoom</option>
                    </select>
                  </div>
                  
                  {settings.transitionEffect !== 'none' && (
                    <div>
                      <label className={`block text-sm font-medium ${settings.theme === 'dark' ? 'text-white/70' : 'text-gray-600'} mb-2`}>
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
                          handleSettingChange('transitionDuration', Math.max(0.1, value));
                        }}
                        className={`w-full ${
                          settings.theme === 'dark' 
                            ? 'bg-white/10 border-white/20 text-white focus:ring-blue-500' 
                            : 'bg-gray-50 border-gray-300 text-gray-800 focus:ring-blue-500'
                        } border rounded-lg px-4 py-2 focus:outline-none focus:ring-2`}
                      />
                      <p className={`text-xs ${settings.theme === 'dark' ? 'text-white/50' : 'text-gray-500'} mt-1`}>
                        Controls the speed of transition effects (0.1 - 1.0 seconds)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Speech Tab - Updated */}
          {activeTab === 'speech' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* TTS Provider Selection - Updated */}
              <div className="p-4 border border-white/10 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Text-to-Speech Provider</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  {/* Browser Default Radio */}
                  <label className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors w-full ${settings.ttsProvider === 'browser' ? 'bg-blue-500/20 border border-blue-500' : 'bg-white/5 hover:bg-white/10 border border-transparent'}`}>
                    <input
                      type="radio" name="ttsProvider" value="browser"
                      checked={settings.ttsProvider === 'browser'}
                      onChange={(e) => handleSettingChange('ttsProvider', e.target.value)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    Browser Default
                  </label>
                  {/* OpenAI Radio */}
                  <label className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors w-full ${settings.ttsProvider === 'openai' ? 'bg-blue-500/20 border border-blue-500' : 'bg-white/5 hover:bg-white/10 border border-transparent'}`}>
                    <input
                      type="radio" name="ttsProvider" value="openai" 
                      checked={settings.ttsProvider === 'openai'}
                      onChange={(e) => handleSettingChange('ttsProvider', e.target.value)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    OpenAI TTS
                  </label>
                  {/* ElevenLabs Radio */}
                  <label className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors w-full ${settings.ttsProvider === 'elevenlabs' ? 'bg-purple-500/20 border border-purple-500' : 'bg-white/5 hover:bg-white/10 border border-transparent'}`}>
                    <input
                      type="radio" name="ttsProvider" value="elevenlabs" 
                      checked={settings.ttsProvider === 'elevenlabs'}
                      onChange={(e) => handleSettingChange('ttsProvider', e.target.value)}
                      className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                    />
                    ElevenLabs TTS
                  </label>
                </div>
              </div>

              {/* Browser Default Settings (Keep as is) */}
              {settings.ttsProvider === 'browser' && (
                 <div className="p-4 border border-white/10 rounded-lg space-y-6">
                   <h2 className="text-xl font-semibold mb-4">Browser Speech Settings</h2>
                   <div className="mb-6">
                     <div className="flex items-center justify-between mb-4">
                       <label className={`text-sm font-medium ${settings.theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>
                         Enable Speech
                       </label>
                       <div className="relative inline-block w-12 align-middle select-none">
                         <input
                           type="checkbox"
                           name="enableSpeech"
                           id="enableSpeech"
                           className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                           checked={settings.speech.enabled}
                           onChange={(e) => handleSettingChange('speech', {
                             ...settings.speech,
                             enabled: e.target.checked
                           })}
                           style={{
                             transition: 'transform 0.3s ease-in-out',
                             transform: settings.speech.enabled ? 'translateX(100%)' : 'translateX(0)',
                             borderColor: settings.speech.enabled ? '#3b82f6' : '#d1d5db'
                           }}
                         />
                         <label
                           htmlFor="enableSpeech"
                           className="toggle-label block overflow-hidden h-6 rounded-full cursor-pointer"
                           style={{
                             background: settings.speech.enabled ? '#3b82f6' : (settings.theme === 'dark' ? '#374151' : '#e5e7eb')
                           }}
                         />
                       </div>
                     </div>
                     <p className={`text-xs ${settings.theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>
                       When enabled, names will be spoken aloud as they appear
                     </p>
                   </div>
                   
                   <div className="grid gap-6 md:grid-cols-2">
                     <div>
                       <label className={`block text-sm font-medium ${settings.theme === 'dark' ? 'text-white/70' : 'text-gray-600'} mb-2`}>
                         Speaking Rate
                       </label>
                       <div className="flex items-center gap-4">
                         <input
                           type="range"
                           min="0.5"
                           max="2"
                           step="0.1"
                           value={settings.speech.rate}
                           onChange={(e) => handleSettingChange('speech', {
                             ...settings.speech,
                             rate: parseFloat(e.target.value)
                           })}
                           className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                         />
                         <span className={`${settings.theme === 'dark' ? 'text-white' : 'text-gray-800'} w-10 text-center`}>
                           {settings.speech.rate.toFixed(1)}
                         </span>
                       </div>
                       <p className={`text-xs ${settings.theme === 'dark' ? 'text-white/50' : 'text-gray-500'} mt-1`}>
                         Adjusts how fast or slow the names are spoken
                       </p>
                     </div>
                     
                     <div>
                       <label className={`block text-sm font-medium ${settings.theme === 'dark' ? 'text-white/70' : 'text-gray-600'} mb-2`}>
                         Voice Pitch
                       </label>
                       <div className="flex items-center gap-4">
                         <input
                           type="range"
                           min="0.5"
                           max="2"
                           step="0.1"
                           value={settings.speech.pitch}
                           onChange={(e) => handleSettingChange('speech', {
                             ...settings.speech,
                             pitch: parseFloat(e.target.value)
                           })}
                           className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                         />
                         <span className={`${settings.theme === 'dark' ? 'text-white' : 'text-gray-800'} w-10 text-center`}>
                           {settings.speech.pitch.toFixed(1)}
                         </span>
                       </div>
                       <p className={`text-xs ${settings.theme === 'dark' ? 'text-white/50' : 'text-gray-500'} mt-1`}>
                         Adjusts how high or low the voice sounds
                       </p>
                     </div>
                     
                     <div className="md:col-span-2">
                       <label className={`block text-sm font-medium ${settings.theme === 'dark' ? 'text-white/70' : 'text-gray-600'} mb-2`}>
                         Volume
                       </label>
                       <div className="flex items-center gap-4">
                         <input
                           type="range"
                           min="0"
                           max="1"
                           step="0.1"
                           value={settings.speech.volume}
                           onChange={(e) => handleSettingChange('speech', {
                             ...settings.speech,
                             volume: parseFloat(e.target.value)
                           })}
                           className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                         />
                         <span className={`${settings.theme === 'dark' ? 'text-white' : 'text-gray-800'} w-10 text-center`}>
                           {(settings.speech.volume * 100).toFixed(0)}%
                         </span>
                       </div>
                     </div>
                   </div>
                   
                   <div className="mt-6">
                     <button
                       onClick={() => {
                         if (typeof window !== 'undefined' && window.speechSynthesis) {
                           // Cancel any ongoing speech
                           window.speechSynthesis.cancel();
                           
                           // Create a test utterance
                           const utterance = new SpeechSynthesisUtterance("This is a test of the speech settings");
                           
                           // Apply speech settings
                           utterance.rate = settings.speech.rate;
                           utterance.pitch = settings.speech.pitch;
                           utterance.volume = settings.speech.volume;
                           
                           // Speak the test phrase
                           window.speechSynthesis.speak(utterance);
                         }
                       }}
                       className={`px-4 py-2 ${
                         settings.theme === 'dark' 
                           ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                           : 'bg-blue-500 hover:bg-blue-600 text-white'
                       } rounded-lg transition-colors`}
                       disabled={!settings.speech.enabled}
                     >
                       Test Speech
                     </button>
                   </div>
                 </div>
              )}

              {/* OpenAI Settings Section */}
              {settings.ttsProvider === 'openai' && (
                <div className="p-4 border border-white/10 rounded-lg space-y-6">
                  <h2 className="text-xl font-semibold mb-4">OpenAI TTS Settings</h2>
                  {/* API Key Input */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      OpenAI API Key
                    </label>
                    <input
                      type="password"
                      value={openaiApiKey}
                      onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your OpenAI API Key (sk-...)"
                    />
                    <div className="flex items-start mt-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <InformationCircleIcon className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-300">
                        <strong>Security Warning:</strong> Key stored temporarily in browser session. Use a backend proxy for production.
                      </p>
                    </div>
                  </div>

                  {/* Model Selection */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Model</label>
                    <select
                      value={settings.openaiSettings?.model ?? 'tts-1'}
                      onChange={(e) => handleSettingChange('openai.model', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {openaiModels.map(model => <option key={model} value={model}>{model}</option>)}
                    </select>
                  </div>

                  {/* Voice Selection */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Voice</label>
                    <select
                      value={settings.openaiSettings?.voice ?? 'alloy'}
                      onChange={(e) => handleSettingChange('openai.voice', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {openaiVoices.map(voice => <option key={voice} value={voice}>{voice.charAt(0).toUpperCase() + voice.slice(1)}</option>)}
                    </select>
                  </div>
                  
                  {/* Speed Control */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Speed ({(settings.openaiSettings?.speed ?? 1.0).toFixed(2)}x)
                    </label>
                    <input
                      type="range" min="0.25" max="4.0" step="0.05"
                      value={settings.openaiSettings?.speed ?? 1.0}
                      onChange={(e) => handleSettingChange('openai.speed', e.target.value)} // Already parses float in handler
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  {/* Placeholder Test Button - Now Functional */}
                  <button
                    onClick={() => {
                      if (openaiApiKey && settings.openaiSettings) {
                        testOpenAISpeech("This is a test of the OpenAI TTS settings.");
                      }
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      openaiApiKey
                        ? (settings.theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white')
                        : 'bg-gray-600 text-white/50 cursor-not-allowed'
                    }`}
                    disabled={!openaiApiKey}
                    title={!openaiApiKey ? "Enter OpenAI API Key to enable" : "Test OpenAI TTS"}
                  >
                    Test OpenAI TTS
                  </button>
                </div>
              )}

              {/* ElevenLabs Settings Section */}
              {settings.ttsProvider === 'elevenlabs' && (
                <div className="p-4 border border-white/10 rounded-lg space-y-6">
                  <h2 className="text-xl font-semibold mb-4">ElevenLabs TTS Settings</h2>
                  {/* API Key Input */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      ElevenLabs API Key
                    </label>
                    <input
                      type="password"
                      value={elevenLabsApiKey} // Use elevenLabsApiKey state
                      onChange={(e) => handleApiKeyChange('elevenlabs', e.target.value)} // Use generic handler
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter your ElevenLabs API Key"
                    />
                    {/* Optional Security Warning */}
                    <div className="flex items-start mt-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <InformationCircleIcon className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-300">
                        <strong>Security Warning:</strong> Key stored temporarily in browser session.
                      </p>
                    </div>
                  </div>
                  
                  {/* Voice Selection */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Voice</label>
                    <select
                      value={settings.elevenLabsSettings?.voiceId ?? ''} // Use voiceId from settings
                      onChange={(e) => handleSettingChange('elevenLabsSettings.voiceId', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="" disabled>Select a voice</option>
                      {elevenLabsVoices.map(voice => (
                        <option key={voice.id} value={voice.id}>{voice.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-white/50 mt-1">
                      Find more voices or clone your own at ElevenLabs.
                    </p>
                  </div>
                  
                  {/* Optional: Model Selection (Add if needed) */}
                  {/* Optional: Stability/Clarity Settings (Add if needed) */}

                  {/* Test Button */}
                  <button
                    onClick={() => {
                      if (elevenLabsApiKey && settings.elevenLabsSettings?.voiceId) {
                        testElevenLabsSpeech("Testing Eleven Labs voice synthesis.");
                      }
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      elevenLabsApiKey && settings.elevenLabsSettings?.voiceId
                        ? (settings.theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white')
                        : 'bg-gray-600 text-white/50 cursor-not-allowed'
                    }`}
                    disabled={!elevenLabsApiKey || !settings.elevenLabsSettings?.voiceId}
                    title={!elevenLabsApiKey ? "Enter API Key" : !settings.elevenLabsSettings?.voiceId ? "Select a Voice" : "Test ElevenLabs TTS"}
                  >
                    Test ElevenLabs TTS
                  </button>
                </div>
              )}
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
                <div className={`p-4 border ${settings.theme === 'dark' ? 'border-red-500/30' : 'border-red-500'} bg-${settings.theme === 'dark' ? 'red-500/10' : 'red-500/20'} rounded-lg`}>
                  <h3 className={`text-lg font-medium ${settings.theme === 'dark' ? 'text-red-400' : 'text-red-600'} mb-2`}>Danger Zone</h3>
                  <p className={`text-${settings.theme === 'dark' ? 'white/70' : 'gray-600'} mb-4`}>
                    These actions cannot be undone. Please be certain.
                  </p>
                  
                  {images.length > 0 && (
                    <button
                      onClick={handleClearImages}
                      className={`flex items-center gap-2 px-4 py-2 ${settings.theme === 'dark' ? 'bg-red-500/20 hover:bg-red-500/30' : 'bg-red-500/10 hover:bg-red-500/20'} text-${settings.theme === 'dark' ? 'red-400' : 'red-600'} rounded-lg transition-colors`}
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
        className={`fixed bottom-8 right-8 ${settings.theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-50 hover:bg-gray-100'} backdrop-blur-sm p-3 rounded-full transition-all z-20`}
        title="Back to Slideshow"
      >
        <Cog6ToothIcon className="w-6 h-6 text-white" />
      </Link>

      {/* Keyboard shortcut hint */}
      <div className={`fixed bottom-8 left-8 text-${settings.theme === 'dark' ? 'white/40' : 'gray-500'} text-sm`}>
        Press <kbd className={`px-2 py-1 ${settings.theme === 'dark' ? 'bg-white/10' : 'bg-gray-50'} rounded`}>Esc</kbd> to exit settings
      </div>
    </div>
  );
} 