
import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import ParticleBackground from '@/components/ParticleBackground';
import VoiceVisualizer from '@/components/VoiceVisualizer';
import SettingsPanel from '@/components/SettingsPanel';
import SettingsModal from '@/components/SettingsModal';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { useOllama } from '@/hooks/useOllama';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useAppSettings } from '@/hooks/useAppSettings';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const { settings, availableVoices, updateSetting } = useAppSettings();
  
  const { 
    processWithOllama, 
    isConnected, 
    availableModels, 
    selectedModel, 
    setSelectedModel,
    isCheckingConnection,
    checkConnection
  } = useOllama();
  
  const { 
    isListening, 
    isSupported, 
    transcript, 
    startListening, 
    stopListening,
    audioLevel 
  } = useVoiceAssistant();

  const { speak, isSpeaking, stopSpeaking } = useTextToSpeech({
    voiceName: settings.selectedVoiceName,
    rate: settings.voiceSpeed,
    pitch: settings.voicePitch,
    volume: settings.voiceVolume,
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const addMessage = (type: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const processMessage = async (content: string, shouldSpeak: boolean = false) => {
    if (!content.trim()) return;
    
    addMessage('user', content);
    setIsProcessing(true);
    
    try {
      const response = await processWithOllama(content);
      addMessage('assistant', response);
      
      // Speak the response if it came from voice command and auto-speak is enabled
      if (shouldSpeak && settings.autoSpeak && response) {
        speak(response);
      }
    } catch (error) {
      const errorMessage = 'Sorry, I encountered an error processing your request.';
      addMessage('assistant', errorMessage);
      if (shouldSpeak && settings.autoSpeak) {
        speak(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      processMessage(textInput, false);
      setTextInput('');
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        processMessage(transcript, true);
      }
    } else {
      if (isSpeaking) {
        stopSpeaking();
      }
      startListening();
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  // Apply theme color classes based on settings
  const getThemeClasses = () => {
    const colorMap = {
      purple: 'from-purple-500 to-pink-500',
      blue: 'from-blue-500 to-cyan-500',
      green: 'from-green-500 to-emerald-500',
      orange: 'from-orange-500 to-red-500',
      teal: 'from-teal-500 to-blue-500',
    };
    return colorMap[settings.themeColor as keyof typeof colorMap] || colorMap.purple;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden ${settings.animationsEnabled ? 'transition-all duration-300' : ''}`}>
      <ParticleBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8 h-screen flex flex-col">
        {/* Header */}
        <div className="text-center mb-6 flex-shrink-0 flex items-center justify-between">
          <div className="flex-1">
            <h1 className={`text-3xl md:text-5xl font-bold bg-gradient-to-r ${getThemeClasses()} bg-clip-text text-transparent mb-2`}>
              Jarvis Voice Assistant
            </h1>
            <p className="text-slate-300 text-sm md:text-base">
              Powered by local AI models • Voice & Text Commands
            </p>
          </div>
          <div className="flex gap-2">
            <SettingsModal
              availableVoices={availableVoices}
              selectedVoiceName={settings.selectedVoiceName}
              onVoiceChange={(voice) => updateSetting('selectedVoiceName', voice)}
              voiceSpeed={settings.voiceSpeed}
              onVoiceSpeedChange={(speed) => updateSetting('voiceSpeed', speed)}
              voicePitch={settings.voicePitch}
              onVoicePitchChange={(pitch) => updateSetting('voicePitch', pitch)}
              voiceVolume={settings.voiceVolume}
              onVoiceVolumeChange={(volume) => updateSetting('voiceVolume', volume)}
              autoSpeak={settings.autoSpeak}
              onAutoSpeakChange={(enabled) => updateSetting('autoSpeak', enabled)}
              themeColor={settings.themeColor}
              onThemeColorChange={(color) => updateSetting('themeColor', color)}
              darkMode={settings.darkMode}
              onDarkModeChange={(enabled) => updateSetting('darkMode', enabled)}
              animationsEnabled={settings.animationsEnabled}
              onAnimationsChange={(enabled) => updateSetting('animationsEnabled', enabled)}
              soundEffects={settings.soundEffects}
              onSoundEffectsChange={(enabled) => updateSetting('soundEffects', enabled)}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col xl:flex-row gap-4 max-w-7xl mx-auto w-full min-h-0">
          {/* Chat Area - takes more space */}
          <Card className="flex-1 xl:flex-[2] bg-black/20 backdrop-blur-xl border-white/10 flex flex-col min-h-0">
            <div className="p-4 border-b border-white/10 flex-shrink-0">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                Conversation
                {isProcessing && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                )}
              </h2>
            </div>
            
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">
                    <div className="text-4xl mb-3">🎤</div>
                    <p className="text-base">Start a conversation by voice or text</p>
                    <p className="text-sm mt-1 text-slate-500">Ask me anything - I'm powered by Ollama</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          message.type === 'user'
                            ? `bg-gradient-to-r ${getThemeClasses()} text-white`
                            : 'bg-white/10 backdrop-blur-sm text-slate-100 border border-white/20'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" />
                        </div>
                        <span className="text-slate-300 text-sm">Processing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 flex-shrink-0">
              <form onSubmit={handleTextSubmit} className="flex gap-3">
                <Input
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20"
                  disabled={isProcessing}
                />
                <Button
                  type="submit"
                  size="icon"
                  className={`bg-gradient-to-r ${getThemeClasses()} hover:opacity-90`}
                  disabled={isProcessing || !textInput.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </Card>

          {/* Right Sidebar */}
          <div className="w-full xl:w-80 flex flex-col gap-4 flex-shrink-0">
            {/* Voice Control Panel */}
            <Card className="bg-black/20 backdrop-blur-xl border-white/10">
              <div className="p-4 text-center">
                <h2 className="text-lg font-semibold text-white mb-4">Voice Control</h2>
                
                {/* Voice Visualizer */}
                <div className="mb-6">
                  <VoiceVisualizer 
                    isListening={isListening} 
                    audioLevel={audioLevel}
                  />
                </div>

                {/* Voice Button */}
                <div className="mb-4">
                  <Button
                    onClick={handleVoiceToggle}
                    disabled={!isSupported || isProcessing}
                    className={`w-16 h-16 rounded-full text-white transition-all duration-300 ${
                      isListening
                        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse'
                        : `bg-gradient-to-r ${getThemeClasses()} hover:opacity-90`
                    }`}
                  >
                    {isListening ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                  </Button>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-slate-400">Status: </span>
                    <span className={`font-medium ${
                      isListening ? 'text-red-400' : isSpeaking ? 'text-blue-400' : 'text-green-400'
                    }`}>
                      {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Ready'}
                    </span>
                  </div>
                  
                  {transcript && (
                    <div className="bg-white/10 rounded-lg p-2 border border-white/20">
                      <p className="text-xs text-slate-400 mb-1">Live Transcript:</p>
                      <p className="text-sm text-white">{transcript}</p>
                    </div>
                  )}

                  {!isSupported && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-2">
                      <p className="text-red-300 text-sm">
                        Voice recognition not supported
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Ollama Settings Panel */}
            <SettingsPanel
              isConnected={isConnected}
              availableModels={availableModels}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              isCheckingConnection={isCheckingConnection}
              onRefreshConnection={checkConnection}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
