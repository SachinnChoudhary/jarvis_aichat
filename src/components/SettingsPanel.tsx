
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SettingsPanelProps {
  isConnected: boolean;
  availableModels: Array<{ name: string; size: number; modified_at: string }>;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  isCheckingConnection: boolean;
  onRefreshConnection: () => void;
}

const SettingsPanel = ({
  isConnected,
  availableModels,
  selectedModel,
  setSelectedModel,
  isCheckingConnection,
  onRefreshConnection
}: SettingsPanelProps) => {
  const formatModelSize = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  return (
    <Card className="bg-black/20 backdrop-blur-xl border-white/10 p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Ollama Settings</h3>
          <Button
            onClick={onRefreshConnection}
            disabled={isCheckingConnection}
            size="sm"
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <RefreshCw className={`h-4 w-4 ${isCheckingConnection ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
          {isConnected ? (
            <>
              <Wifi className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-400">Connected</p>
                <p className="text-xs text-slate-400">Ollama is running locally</p>
              </div>
            </>
          ) : (
            <>
              <WifiOff className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-sm font-medium text-red-400">Disconnected</p>
                <p className="text-xs text-slate-400">Ollama is not accessible</p>
              </div>
            </>
          )}
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Model</label>
          <Select
            value={selectedModel}
            onValueChange={setSelectedModel}
            disabled={!isConnected || availableModels.length === 0}
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              {availableModels.map((model) => (
                <SelectItem
                  key={model.name}
                  value={model.name}
                  className="text-white hover:bg-slate-800"
                >
                  <div className="flex flex-col">
                    <span>{model.name}</span>
                    <span className="text-xs text-slate-400">
                      {formatModelSize(model.size)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {availableModels.length === 0 && isConnected && (
            <p className="text-xs text-yellow-400">
              No models found. Run: ollama pull llama2
            </p>
          )}
        </div>

        {/* Model Info */}
        {selectedModel && isConnected && (
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs text-blue-300">
              Active Model: <span className="font-medium">{selectedModel}</span>
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SettingsPanel;
