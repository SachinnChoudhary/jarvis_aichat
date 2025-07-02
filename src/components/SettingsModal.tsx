import { useState, useEffect } from 'react';
import { Settings, Volume2, Palette, User, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface SettingsModalProps {
  // Voice Settings
  availableVoices: SpeechSynthesisVoice[];
  selectedVoiceName: string;
  onVoiceChange: (voiceName: string) => void;
  voiceSpeed: number;
  onVoiceSpeedChange: (speed: number) => void;
  voicePitch: number;
  onVoicePitchChange: (pitch: number) => void;
  voiceVolume: number;
  onVoiceVolumeChange: (volume: number) => void;
  autoSpeak: boolean;
  onAutoSpeakChange: (enabled: boolean) => void;
  
  // Theme Settings
  themeColor: string;
  onThemeColorChange: (color: string) => void;
  darkMode: boolean;
  onDarkModeChange: (enabled: boolean) => void;
  
  // Other Settings
  animationsEnabled: boolean;
  onAnimationsChange: (enabled: boolean) => void;
  soundEffects: boolean;
  onSoundEffectsChange: (enabled: boolean) => void;
}

const SettingsModal = ({
  availableVoices,
  selectedVoiceName,
  onVoiceChange,
  voiceSpeed,
  onVoiceSpeedChange,
  voicePitch,
  onVoicePitchChange,
  voiceVolume,
  onVoiceVolumeChange,
  autoSpeak,
  onAutoSpeakChange,
  themeColor,
  onThemeColorChange,
  darkMode,
  onDarkModeChange,
  animationsEnabled,
  onAnimationsChange,
  soundEffects,
  onSoundEffectsChange
}: SettingsModalProps) => {
  const [testText, setTestText] = useState("Hello, this is a test of the selected voice settings.");

  const themeColors = [
    { name: 'Purple', value: 'purple', gradient: 'from-purple-500 to-pink-500' },
    { name: 'Blue', value: 'blue', gradient: 'from-blue-500 to-cyan-500' },
    { name: 'Green', value: 'green', gradient: 'from-green-500 to-emerald-500' },
    { name: 'Orange', value: 'orange', gradient: 'from-orange-500 to-red-500' },
    { name: 'Teal', value: 'teal', gradient: 'from-teal-500 to-blue-500' },
  ];

  const testVoice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(testText);
      
      const selectedVoice = availableVoices.find(voice => voice.name === selectedVoiceName);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.rate = voiceSpeed;
      utterance.pitch = voicePitch;
      utterance.volume = voiceVolume;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] bg-slate-900 border-slate-700 text-white overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </SheetTitle>
          <SheetDescription className="text-slate-400">
            Customize your voice assistant experience
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Tabs defaultValue="voice" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800">
              <TabsTrigger value="voice" className="data-[state=active]:bg-slate-700">
                <Volume2 className="h-4 w-4 mr-2" />
                Voice
              </TabsTrigger>
              <TabsTrigger value="theme" className="data-[state=active]:bg-slate-700">
                <Palette className="h-4 w-4 mr-2" />
                Theme
              </TabsTrigger>
              <TabsTrigger value="general" className="data-[state=active]:bg-slate-700">
                <Sliders className="h-4 w-4 mr-2" />
                General
              </TabsTrigger>
            </TabsList>

            {/* Voice Settings */}
            <TabsContent value="voice" className="space-y-6 mt-6">
              <Card className="bg-slate-800 border-slate-700 p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Voice Settings</h3>
                
                {/* Voice Selection */}
                <div className="space-y-2 mb-4">
                  <Label className="text-slate-300">Voice</Label>
                  <Select value={selectedVoiceName} onValueChange={onVoiceChange}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {availableVoices.map((voice) => (
                        <SelectItem
                          key={voice.name}
                          value={voice.name}
                          className="text-white hover:bg-slate-700"
                        >
                          <div className="flex flex-col">
                            <span>{voice.name}</span>
                            <span className="text-xs text-slate-400">{voice.lang}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Voice Speed */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-slate-300">Speed</Label>
                    <span className="text-sm text-slate-400">{voiceSpeed.toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={[voiceSpeed]}
                    onValueChange={(value) => onVoiceSpeedChange(value[0])}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                {/* Voice Pitch */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-slate-300">Pitch</Label>
                    <span className="text-sm text-slate-400">{voicePitch.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[voicePitch]}
                    onValueChange={(value) => onVoicePitchChange(value[0])}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                {/* Voice Volume */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-slate-300">Volume</Label>
                    <span className="text-sm text-slate-400">{Math.round(voiceVolume * 100)}%</span>
                  </div>
                  <Slider
                    value={[voiceVolume]}
                    onValueChange={(value) => onVoiceVolumeChange(value[0])}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                {/* Auto Speak */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-slate-300">Auto Speak Voice Commands</Label>
                    <p className="text-xs text-slate-500">Automatically speak responses to voice commands</p>
                  </div>
                  <Switch
                    checked={autoSpeak}
                    onCheckedChange={onAutoSpeakChange}
                  />
                </div>

                {/* Test Voice */}
                <Button
                  onClick={testVoice}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Test Voice
                </Button>
              </Card>
            </TabsContent>

            {/* Theme Settings */}
            <TabsContent value="theme" className="space-y-6 mt-6">
              <Card className="bg-slate-800 border-slate-700 p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Theme Settings</h3>
                
                {/* Theme Colors */}
                <div className="space-y-2 mb-4">
                  <Label className="text-slate-300">Accent Color</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {themeColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => onThemeColorChange(color.value)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          themeColor === color.value
                            ? 'border-white'
                            : 'border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <div className={`h-6 w-full rounded bg-gradient-to-r ${color.gradient} mb-2`} />
                        <span className="text-sm text-white">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dark Mode */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Dark Mode</Label>
                    <p className="text-xs text-slate-500">Toggle between light and dark themes</p>
                  </div>
                  <Switch
                    checked={darkMode}
                    onCheckedChange={onDarkModeChange}
                  />
                </div>
              </Card>
            </TabsContent>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6 mt-6">
              <Card className="bg-slate-800 border-slate-700 p-4">
                <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
                
                {/* Animations */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-slate-300">Animations</Label>
                    <p className="text-xs text-slate-500">Enable UI animations and transitions</p>
                  </div>
                  <Switch
                    checked={animationsEnabled}
                    onCheckedChange={onAnimationsChange}
                  />
                </div>

                {/* Sound Effects */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-slate-300">Sound Effects</Label>
                    <p className="text-xs text-slate-500">Play sound effects for interactions</p>
                  </div>
                  <Switch
                    checked={soundEffects}
                    onCheckedChange={onSoundEffectsChange}
                  />
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsModal;
