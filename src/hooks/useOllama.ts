
import { useState, useCallback, useEffect } from 'react';

interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
}

export const useOllama = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [availableModels, setAvailableModels] = useState<OllamaModel[]>([]);
  const [selectedModel, setSelectedModel] = useState('llama2');
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);

  const checkConnection = useCallback(async () => {
    setIsCheckingConnection(true);
    try {
      const response = await fetch('http://localhost:11434/api/tags', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsConnected(true);
        setAvailableModels(data.models || []);
        
        // Set default model if none selected and models are available
        if (!selectedModel && data.models && data.models.length > 0) {
          setSelectedModel(data.models[0].name);
        }
      } else {
        setIsConnected(false);
        setAvailableModels([]);
      }
    } catch (error) {
      console.error('Error checking Ollama connection:', error);
      setIsConnected(false);
      setAvailableModels([]);
    } finally {
      setIsCheckingConnection(false);
    }
  }, [selectedModel]);

  const processWithOllama = useCallback(async (input: string): Promise<string> => {
    try {
      if (!isConnected) {
        return `Ollama is not connected. Please ensure:
        
1. Ollama is installed and running locally
2. Run: ollama serve
3. Download a model: ollama pull ${selectedModel}
4. Ollama is accessible at http://localhost:11434

Once setup is complete, try your question again.`;
      }

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: `You are an AI assistant. Answer all questions in a short, clear, and direct manner. Avoid unnecessary explanations and only provide the most useful information. Keep answers under 2–3 sentences unless absolutely necessary. Question: ${input}`,
          stream: false,
          options: {
            temperature: 0.2,
            top_p: 0.9,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      
      let cleanResponse = data.response || 'I could not process your request.';
      
      // Light cleaning while preserving complete answers
      cleanResponse = cleanResponse
        .replace(/^\s*(Well,|So,|Actually,)\s*/gi, '')
        .trim();

      return cleanResponse || 'I could not generate a response.';
      
    } catch (error) {
      console.error('Error connecting to Ollama:', error);
      
      return `Cannot connect to Ollama. Please ensure:
      
1. Ollama is installed and running locally
2. Run: ollama serve
3. Download a model: ollama pull ${selectedModel}
4. Ollama is accessible at http://localhost:11434

Once setup is complete, try your question again.`;
    }
  }, [isConnected, selectedModel]);

  // Check connection on component mount and periodically
  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [checkConnection]);

  return {
    isConnected,
    availableModels,
    selectedModel,
    setSelectedModel,
    isCheckingConnection,
    checkConnection,
    processWithOllama
  };
};
