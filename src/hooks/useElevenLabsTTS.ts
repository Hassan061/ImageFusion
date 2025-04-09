'use client';

import { useCallback, useRef, useEffect } from 'react';

// Basic structure, might need refinement based on exact API options
type ElevenLabsSettings = {
  voiceId: string; // Required: ID of the voice to use
  model_id?: string; // Optional: e.g., 'eleven_multilingual_v2'
  // Add other settings like stability, similarity_boost if needed
};

// It's good practice to keep the key separate, but for simplicity in the hook:
// const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY; // Example using env vars

const ELEVENLABS_API_BASE_URL = 'https://api.elevenlabs.io/v1';

export const useElevenLabsTTS = (apiKey: string, settings: ElevenLabsSettings | undefined) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string) => {
    console.log('[ElevenLabs TTS Hook] speak() called.');
    console.log('[ElevenLabs TTS Hook] Received API Key:', apiKey ? `'${apiKey.substring(0, 2)}...${apiKey.substring(apiKey.length - 4)}'` : 'Missing');
    console.log('[ElevenLabs TTS Hook] Received Settings:', settings);

    if (!apiKey) {
      console.warn('[ElevenLabs TTS Hook] Cannot speak: API Key is missing.');
      return;
    }
    if (!settings?.voiceId) {
      console.warn('[ElevenLabs TTS Hook] Cannot speak: Voice ID is missing in settings.');
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current = null;
    }
    
    const apiUrl = `${ELEVENLABS_API_BASE_URL}/text-to-speech/${settings.voiceId}`;
    console.log(`[ElevenLabs TTS Hook] Requesting TTS from: ${apiUrl} for: "${text}"`);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg', // Expecting audio back
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: settings.model_id ?? 'eleven_monolingual_v1', // Default model
          // voice_settings: { // Example for more control
          //   stability: 0.5,
          //   similarity_boost: 0.75
          // }
        }),
      });

      if (!response.ok) {
        // Try to parse error json, otherwise use status text
        let errorDetails = response.statusText;
        try {
            const errorBody = await response.json();
            console.error('[ElevenLabs TTS Hook] API Error Body:', errorBody);
            errorDetails = errorBody?.detail?.message || errorBody?.detail || JSON.stringify(errorBody);
        } catch (e) {
             console.warn('[ElevenLabs TTS Hook] Could not parse error response body.');
        }
        console.error('[ElevenLabs TTS Hook] API Error:', response.status, errorDetails);
        throw new Error(`ElevenLabs API Error: ${response.status} - ${errorDetails}`);
      }

      console.log('[ElevenLabs TTS Hook] Received audio response.');
      const audioBlob = await response.blob();
      
      if (audioBlob.type !== 'audio/mpeg') {
           console.warn(`[ElevenLabs TTS Hook] Received unexpected content type: ${audioBlob.type}. Trying to play anyway.`);
      }
      
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.play().catch(err => {
        console.error('[ElevenLabs TTS Hook] Error playing audio:', err);
      });

      // Clean up
      audio.onended = () => {
        console.log('[ElevenLabs TTS Hook] Audio finished playing.');
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      audio.onerror = (e) => {
        console.error('[ElevenLabs TTS Hook] Audio element error:', e);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

    } catch (error) {
      console.error('[ElevenLabs TTS Hook] Failed to fetch or play TTS audio:', error);
    }
  }, [apiKey, settings]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        console.log('[ElevenLabs TTS Hook] Cleaning up audio on unmount.');
        audioRef.current.pause();
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
        }
        audioRef.current = null;
      }
    };
  }, []);

  return { speak };
}; 