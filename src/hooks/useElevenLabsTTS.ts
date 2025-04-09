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

  // New function to fetch audio data as Blob
  const getAudioBlob = useCallback(async (text: string): Promise<Blob> => {
    console.log('[ElevenLabs TTS Hook] getAudioBlob() called.');
    console.log('[ElevenLabs TTS Hook] Received API Key:', apiKey ? `'${apiKey.substring(0, 2)}...${apiKey.substring(apiKey.length - 4)}'` : 'Missing');
    console.log('[ElevenLabs TTS Hook] Received Settings:', settings);

    if (!apiKey) {
      console.warn('[ElevenLabs TTS Hook] Cannot get audio blob: API Key is missing.');
      throw new Error('API Key is missing');
    }
    if (!settings?.voiceId) {
      console.warn('[ElevenLabs TTS Hook] Cannot get audio blob: Voice ID is missing in settings.');
      throw new Error('Voice ID is missing in settings');
    }

    const apiUrl = `${ELEVENLABS_API_BASE_URL}/text-to-speech/${settings.voiceId}`;
    console.log(`[ElevenLabs TTS Hook] Requesting blob from: ${apiUrl} for: "${text}"`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg', 
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: text,
        model_id: settings.model_id ?? 'eleven_monolingual_v1', 
        // voice_settings: { ... } // Add if needed
      }),
    });

    if (!response.ok) {
      let errorDetails = response.statusText;
      try {
          const errorBody = await response.json();
          console.error('[ElevenLabs TTS Hook] API Error Body (Blob Request):', errorBody);
          errorDetails = errorBody?.detail?.message || errorBody?.detail || JSON.stringify(errorBody);
      } catch (e) {
           console.warn('[ElevenLabs TTS Hook] Could not parse error response body (Blob Request).');
      }
      console.error('[ElevenLabs TTS Hook] API Error fetching blob:', response.status, errorDetails);
      throw new Error(`ElevenLabs API Error: ${response.status} - ${errorDetails}`);
    }

    console.log('[ElevenLabs TTS Hook] Received audio blob response.');
    const audioBlob = await response.blob();
    
    // Optional: Check blob type if needed, though API should return correct type
    // if (audioBlob.type !== 'audio/mpeg') {
    //      console.warn(`[ElevenLabs TTS Hook] Received unexpected blob type: ${audioBlob.type}.`);
    // }
    
    return audioBlob;

  }, [apiKey, settings]);

  // Existing speak function - uses getAudioBlob
  const speak = useCallback(async (text: string) => {
    console.log('[ElevenLabs TTS Hook] speak() called.');
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current = null;
    }

    try {
      const audioBlob = await getAudioBlob(text); // Reuse blob fetching logic
      
      if (audioBlob.type !== 'audio/mpeg') {
           console.warn(`[ElevenLabs TTS Hook] Received unexpected content type via speak(): ${audioBlob.type}. Trying to play anyway.`);
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
      console.error('[ElevenLabs TTS Hook] Failed to fetch or play TTS audio via speak():', error);
    }
  }, [getAudioBlob]); // Depends on getAudioBlob now

  // Cleanup on unmount (remains the same)
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

  return { speak, getAudioBlob }; // Return both functions
}; 