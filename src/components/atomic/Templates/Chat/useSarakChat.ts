import { useState, useRef, useEffect } from 'react';
import { Message, Attachment, ModelRoute } from './types';

export const useSarakChat = (endpoint: string, modelsEndpoint?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [availableModels, setAvailableModels] = useState<ModelRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<ModelRoute | null>(null);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [modelSearch, setModelSearch] = useState('');
  const [maxTokens, setMaxTokens] = useState(2048);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchModels = async () => {
      if (!modelsEndpoint) return;
      try {
        const system = (window as any).__SARAK_SYSTEM__ || 'global';
        const token = localStorage.getItem(`${system}_token`) || 
                      localStorage.getItem('sarak_token') || 
                      localStorage.getItem('auth_token');

        const res = await fetch(`/api${modelsEndpoint}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });
        if (res.ok) {
          const data = await res.json();
          setAvailableModels(data);
          if (data.length > 0 && !selectedRoute) {
            setSelectedRoute(data[0]);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar modelos:", err);
      }
    };
    fetchModels();
  }, [modelsEndpoint]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).map(f => ({
      file: f,
      name: f.name,
      type: f.type
    }));
    setAttachments(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    const userContent = input.trim();
    const userMessage: Message = { role: 'user', content: userContent || (attachments.length > 0 ? "[Anexo]" : "") };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantPlaceholder: Message = { 
      role: 'assistant', 
      content: '', 
      metadata: { model: mode === 'manual' ? selectedRoute?.model : 'Selecionando...' } 
    };
    
    setMessages(prev => [...prev, assistantPlaceholder]);
    const assistantIndex = messages.length + 1;

    try {
      setIsProcessingFiles(true);
      const blocks: any[] = [];
      if (userContent) blocks.push({ text: userContent });

      for (const att of attachments) {
        if (att.type.startsWith('image/')) {
          const b64 = await toBase64(att.file);
          blocks.push({ image_url: { url: b64 } });
        }
      }
      setIsProcessingFiles(false);
      setAttachments([]);

      const system = (window as any).__SARAK_SYSTEM__ || 'global';
      const token = localStorage.getItem(`${system}_token`) || 
                    localStorage.getItem('sarak_token') || 
                    localStorage.getItem('auth_token');

      const response = await fetch(`/api${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          blocks: blocks,
          mode: mode,
          manual_model: mode === 'manual' ? selectedRoute?.model : undefined,
          manual_provider: mode === 'manual' ? selectedRoute?.provider : undefined,
          max_tokens: maxTokens
        })
      });

      if (!response.ok) throw new Error(`Falha na conexão: ${response.statusText}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') break;

              try {
                const payload = JSON.parse(data);
                if (payload.token) {
                  fullContent += payload.token;
                  setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[assistantIndex] = {
                      ...newMsgs[assistantIndex],
                      content: fullContent
                    };
                    return newMsgs;
                  });
                } else if (payload.error) {
                   throw new Error(payload.error);
                }
              } catch (e) {
                // Silenciando erro de chunk parcial SSE
              }
            }
          }
        }
      }

    } catch (err: any) {
      console.error("Erro no Chat Lab Stream:", err);
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[assistantIndex] = {
          role: 'assistant',
          content: `❌ Erro na Orquestração: ${err.message}`
        };
        return newMsgs;
      });
    } finally {
      setIsLoading(false);
      setIsProcessingFiles(false);
    }
  };

  const clearChat = () => {
    if (confirm("Deseja limpar o histórico desta sessão?")) {
      setMessages([]);
    }
  };

  return {
    messages,
    input,
    setInput,
    attachments,
    isLoading,
    isProcessingFiles,
    mode,
    setMode,
    availableModels,
    selectedRoute,
    setSelectedRoute,
    showModelPicker,
    setShowModelPicker,
    modelSearch,
    setModelSearch,
    maxTokens,
    setMaxTokens,
    scrollRef,
    fileInputRef,
    handleFileSelect,
    removeAttachment,
    handleSend,
    clearChat
  };
};
