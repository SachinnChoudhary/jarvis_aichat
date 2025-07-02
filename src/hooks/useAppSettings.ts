
import { useState, useEffect } from 'react';

interface AppSettings {
  // Voice settings
  selectedVoiceName: string;
  voiceSpeed: number;
  voicePitch: number;
  voiceVolume: number;
  autoSpeak: boolean;
  
  // Theme settings
  themeColor: string;
  darkMode: boolean;
  
  // General settings
  animationsEnabled: boolean;
  soundEffects: boolean;
}

const defaultSettings: AppSettings = {
  selectedVoiceName: 'Samantha',
  voiceSpeed: 0.85,
  voicePitch: 1.1,
  voiceVolume: 0.9,
  autoSpeak: true,
  themeColor: 'purple',
  darkMode: true,
  animationsEnabled: true,
  soundEffects: true,
};

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('ollama-voice-assistant-settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
      setAvailableVoices(englishVoices);
      
      // If selected voice is not available, pick the first available one
      if (englishVoices.length > 0 && !englishVoices.find(v => v.name === settings.selectedVoiceName)) {
        const preferredVoice = englishVoices.find(v => v.name.includes('Samantha')) || englishVoices[0];
        updateSetting('selectedVoiceName', preferredVoice.name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [settings.selectedVoiceName]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ollama-voice-assistant-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return {
    settings,
    availableVoices,
    updateSetting,
  };
};
