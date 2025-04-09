'use client';

import { useCallback, useRef, useEffect } from 'react';

type OpenAITTSettings = {
  model: 'tts-1' | 'tts-1-hd';
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed: number; // 0.25 to 4.0
};

const OPENAI_TTS_URL = 'https://api.openai.com/v1/audio/speech';

export const useOpenAITTS = (apiKey: string, settings: OpenAITTSettings | undefined) => {
  const audioRef = useRef<HTMLAudioElement | null>(null); // Ref for playing audio directly via speak()

  // New function to fetch audio data as Blob
  const getAudioBlob = useCallback(async (text: string): Promise<Blob> => {
    console.log('[OpenAI TTS Hook] getAudioBlob() called.');
    console.log('[OpenAI TTS Hook] Received API Key:', apiKey ? `'${apiKey.substring(0, 7)}...'` : 'Missing');
    console.log('[OpenAI TTS Hook] Received Settings:', settings);

    if (!apiKey) {
      console.warn('[OpenAI TTS Hook] Cannot get audio blob: API Key is missing.');
      throw new Error('API Key is missing');
    }
    if (!settings) {
      console.warn('[OpenAI TTS Hook] Cannot get audio blob: OpenAI settings are missing.');
      throw new Error('OpenAI settings are missing');
    }

    // Ensure defaults are used if settings properties are missing
    const requestBody = {
      model: settings.model ?? 'tts-1', 
      input: text,
      voice: settings.voice ?? 'alloy', 
      response_format: 'mp3', 
      speed: settings.speed ?? 1.0,
    };
    
    console.log('[OpenAI TTS Hook] Sending request body for blob:', requestBody);

    const response = await fetch(OPENAI_TTS_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody), 
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: 'Failed to parse error response.'}));
      console.error('[OpenAI TTS Hook] API Error fetching blob:', response.status, response.statusText, errorBody);
      throw new Error(`OpenAI API Error: ${response.statusText} - ${errorBody?.error?.message || 'Unknown error'}`);
    }

    console.log('[OpenAI TTS Hook] Received audio blob response.');
    const audioBlob = await response.blob();
    return audioBlob;

  }, [apiKey, settings]);

  // Existing speak function - now potentially uses getAudioBlob
  const speak = useCallback(async (text: string) => {
    console.log('[OpenAI TTS Hook] speak() called.');
    // Stop any currently playing audio from this hook
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src'); 
        audioRef.current = null;
    }

    try {
      const audioBlob = await getAudioBlob(text); // Reuse getAudioBlob logic
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create and play audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio; 

      audio.play().catch(err => {
          console.error('[OpenAI TTS Hook] Error playing audio:', err);
      });

      // Clean up
      audio.onended = () => {
        console.log('[OpenAI TTS Hook] Audio finished playing.');
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      audio.onerror = (e) => {
        console.error('[OpenAI TTS Hook] Audio element error:', e);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

    } catch (error) {
      console.error('[OpenAI TTS Hook] Failed to fetch or play TTS audio via speak():', error);
      // TODO: Provide user feedback
    }
  }, [getAudioBlob]); // Depends on getAudioBlob now

  // Cleanup function (remains the same)
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        console.log('[OpenAI TTS Hook] Cleaning up audio on unmount.');
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