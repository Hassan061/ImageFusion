'use client';

import { useCallback, useRef, useEffect } from 'react';

type OpenAITTSettings = {
  model: 'tts-1' | 'tts-1-hd';
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed: number; // 0.25 to 4.0
};

const OPENAI_TTS_URL = 'https://api.openai.com/v1/audio/speech';

export const useOpenAITTS = (apiKey: string, settings: OpenAITTSettings | undefined) => {
  const audioRef = useRef<HTMLAudioElement | null>(null); // Ref to manage the audio element

  const speak = useCallback(async (text: string) => {
    console.log('[OpenAI TTS Hook] speak() called.');
    console.log('[OpenAI TTS Hook] Received API Key:', apiKey ? `'${apiKey.substring(0, 7)}...'` : 'Missing');
    console.log('[OpenAI TTS Hook] Received Settings:', settings);

    if (!apiKey) {
      console.warn('[OpenAI TTS Hook] Cannot speak: API Key is missing.');
      // TODO: Provide user feedback (e.g., toast notification)
      return;
    }

    if (!settings) {
      console.warn('[OpenAI TTS Hook] Cannot speak: OpenAI settings are missing.');
      return;
    }

    // Stop any currently playing audio from this hook
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src'); // Remove src to prevent potential replay
        audioRef.current = null;
    }

    console.log(`[OpenAI TTS Hook] Requesting TTS for: "${text}"`);
    try {
      // Ensure defaults are used if settings properties are missing
      const requestBody = {
        model: settings.model ?? 'tts-1', // Default to tts-1
        input: text,
        voice: settings.voice ?? 'alloy', // Default to alloy
        response_format: 'mp3', 
        speed: settings.speed ?? 1.0,   // Default to 1.0
      };
      
      console.log('[OpenAI TTS Hook] Sending request body:', requestBody);

      const response = await fetch(OPENAI_TTS_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody), // Use the prepared body with defaults
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: 'Failed to parse error response.'}));
        console.error('[OpenAI TTS Hook] API Error:', response.status, response.statusText, errorBody);
        // TODO: Provide user feedback about the error
        throw new Error(`OpenAI API Error: ${response.statusText} - ${errorBody?.error?.message || 'Unknown error'}`);
      }

      console.log('[OpenAI TTS Hook] Received audio response.');
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create and play audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio; // Store ref to the current audio

      audio.play().catch(err => {
          console.error('[OpenAI TTS Hook] Error playing audio:', err);
          // Often due to browser autoplay restrictions - may need user interaction first.
      });

      // Clean up the object URL when audio finishes or on error/component unmount
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
      console.error('[OpenAI TTS Hook] Failed to fetch or play TTS audio:', error);
      // TODO: Provide user feedback
    }
  }, [apiKey, settings]);

  // Cleanup function to stop audio if component unmounts while playing
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        console.log('[OpenAI TTS Hook] Cleaning up audio on unmount.');
        audioRef.current.pause();
        if (audioRef.current.src) {
             URL.revokeObjectURL(audioRef.current.src); // Ensure object URL is revoked
        }
        audioRef.current = null;
      }
    };
  }, []);

  return { speak };
}; 