'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/store/slideshowStore'; // Uncommented
import { useFishAudioTTS } from '@/hooks/useFishAudioTTS'; // Uncommented hook import

// DEV ONLY: Pre-fill API Key for testing
const DEV_FISH_API_KEY = '2fa19361983e457397b9bb5adf1bc7a2';

export default function TestFishAudioPage() {
  console.log('[Test Page] Component Start'); // Earliest possible log
  const [apiKey, setApiKey] = useState('');
  const [textToSpeak, setTextToSpeak] = useState('Hello from the Fish Audio test page.');
  const { settings } = useStore(); // Uncommented
  const fishAudioSettings = settings.fishAudioSettings; // Use settings from store

  // Instantiate the hook - Uncommented
  const { speak } = useFishAudioTTS(apiKey, fishAudioSettings); // Pass store settings
  // Remove dummy speak function
  // const speak = (text: string) => console.log(`[Test Page] Dummy speak called with: ${text}`);

  // Load API key from sessionStorage on mount, pre-fill if needed
  useEffect(() => {
    console.log('[Test Page] Mount useEffect running');
    let storedKey = sessionStorage.getItem('fishApiKey');
    if (!storedKey && DEV_FISH_API_KEY) {
      console.log('[DEV Test Page] Pre-filling Fish API Key.');
      storedKey = DEV_FISH_API_KEY;
      sessionStorage.setItem('fishApiKey', storedKey);
    }
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  // Handle API key change
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    sessionStorage.setItem('fishApiKey', newKey);
  };

  // Handle Speak button click
  const handleSpeak = () => {
    console.log('[Test Page] Speak button clicked.');
    if (!textToSpeak) {
      console.warn('[Test Page] No text entered to speak.');
      return;
    }
    speak(textToSpeak); // Calls real hook's speak
  };

  console.log('[Test Page] Rendering. handleSpeak type:', typeof handleSpeak);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 space-y-6">
      <h1 className="text-3xl font-bold">Fish Audio TTS Test Page</h1>
      
      <div className="p-4 bg-gray-800 rounded-lg space-y-4">
        <h2 className="text-xl font-semibold">Configuration</h2>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            API Key (Stored in Session Storage)
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={handleApiKeyChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Fish Audio API Key"
          />
           {!apiKey && (
              <p className="text-xs text-yellow-400 mt-1">API Key is required to test.</p>
          )}
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Current Settings (Read Only from Store)</h3>
          <pre className="text-xs bg-gray-700 p-3 rounded overflow-x-auto">
            {JSON.stringify(fishAudioSettings, null, 2)} {/* Display store settings */}
          </pre>
        </div>
      </div>

      <div className="p-4 bg-gray-800 rounded-lg space-y-4">
        <h2 className="text-xl font-semibold">Test Input</h2>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Text to Speak
          </label>
          <textarea
            value={textToSpeak}
            onChange={(e) => setTextToSpeak(e.target.value)}
            rows={3}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter text..."
          />
        </div>
        <button
          onClick={handleSpeak}
          className={`px-5 py-2 rounded-lg transition-colors ${!apiKey || !textToSpeak ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          disabled={!apiKey || !textToSpeak}
        >
          Speak Text
        </button>
      </div>

      <p className="text-sm text-gray-400">
        Check the browser console for logs from `[Test Page]` and `[Fish Audio Hook]`.
      </p>
    </div>
  );
} 