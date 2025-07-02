
import { useState, useCallback, useRef } from 'react';

interface TextToSpeechConfig {
  voiceName?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export const useTextToSpeech = (config?: TextToSpeechConfig) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, customConfig?: TextToSpeechConfig) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Use custom config, then default config, then fallback values
      const finalConfig = { ...config, ...customConfig };
      
      // Configure voice settings
      utterance.rate = finalConfig.rate ?? 0.85;
      utterance.pitch = finalConfig.pitch ?? 1.1;
      utterance.volume = finalConfig.volume ?? 0.9;
      
      // Try to find the specified voice or fall back to Siri-like voices
      const voices = window.speechSynthesis.getVoices();
      
      let selectedVoice = null;
      
      // First try to find the specified voice
      if (finalConfig.voiceName) {
        selectedVoice = voices.find(voice => voice.name === finalConfig.voiceName);
      }
      
      // If no specific voice or voice not found, use Siri-like voices
      if (!selectedVoice) {
        const preferredVoiceNames = [
          'Samantha', // macOS default female voice
          'Alex', // macOS default male voice
          'Ava', // Enhanced quality voice
          'Allison', // Clear female voice
          'Susan', // Alternative female voice
          'Victoria', // British English female
          'Karen', // Australian English female
        ];
        
        // First try to find exact matches from preferred voices
        for (const voiceName of preferredVoiceNames) {
          selectedVoice = voices.find(voice => 
            voice.name.includes(voiceName) && voice.lang.startsWith('en')
          );
          if (selectedVoice) break;
        }
        
        // If no preferred voice found, look for high-quality English voices
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => 
            voice.lang.startsWith('en') && 
            (voice.name.includes('Premium') || 
             voice.name.includes('Enhanced') ||
             voice.name.includes('Natural') ||
             voice.name.includes('Neural'))
          );
        }
        
        // Fallback to any English voice
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
        }
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log(`Using voice: ${selectedVoice.name}`);
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, [config]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    speak,
    stopSpeaking,
    isSpeaking
  };
};
