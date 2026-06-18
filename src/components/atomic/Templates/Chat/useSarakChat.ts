import { useState, useRef, useEffect } from 'react';
import { Message, Attachment, ModelRoute } from './types';

export const useSarakChat = (endpoint: string, modelsEndpoint?: string) => {
  const [state, setState] = useState({
    messages: [] as Message[],
    input: '',
    attachments: [] as Attachment[],
    isLoading: false,
    isProcessingFiles: false,
    mode: 'auto' as 'auto' | 'manual',
    availableModels: [] as ModelRoute[],
    selectedRoute: null as ModelRoute | null,
    showModelPicker: false,
    modelSearch: '',
    maxTokens: 2048
  });

  const updateState = (updates: Partial<typeof state>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

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
          updateState({
              availableModels: data,
              selectedRoute: (data.length > 0 && !state.selectedRoute) ? data[0] : state.selectedRoute
          });
        }
      } catch (err) {
        console.error("Erro ao carregar modelos:", err);
      }
    };
    fetchModels();
  }, [modelsEndpoint, state.selectedRoute]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages]);

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
    updateState({ attachments: [...state.attachments, ...newFiles] });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    updateState({ attachments: state.attachments.filter((_, i) => i !== index) });
  };

  const handleSend = async () => {
    if ((!state.input.trim() && state.attachments.length === 0) || state.isLoading) return;

    const userContent = state.input.trim();
    const userMessage: Message = { role: 'user', content: userContent || (state.attachments.length > 0 ? "[Anexo]" : "") };
    
    updateState({ 
        messages: [...state.messages, userMessage],
        input: '',
        isLoading: true
    });

    const assistantPlaceholder: Message = { 
      role: 'assistant', 
      content: '', 
      metadata: { model: state.mode === 'manual' ? state.selectedRoute?.model : 'Selecionando...' } 
    };
    
    // Precisamos de um estado local forte para as mensagens durante o stream
    let currentMessages = [...state.messages, userMessage, assistantPlaceholder];
    updateState({ messages: currentMessages });
    
    const assistantIndex = currentMessages.length - 1;

    try {
      updateState({ isProcessingFiles: true });
      const blocks: any[] = [];
      if (userContent) blocks.push({ text: userContent });

      for (const att of state.attachments) {
        if (att.type.startsWith('image/')) {
          const b64 = await toBase64(att.file);
          blocks.push({ image_url: { url: b64 } });
        }
      }
      updateState({ isProcessingFiles: false, attachments: [] });

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
          mode: state.mode,
          manual_model: state.mode === 'manual' ? state.selectedRoute?.model : undefined,
          manual_provider: state.mode === 'manual' ? state.selectedRoute?.provider : undefined,
          max_tokens: state.maxTokens
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
                  currentMessages = [...currentMessages];
                  currentMessages[assistantIndex] = {
                      ...currentMessages[assistantIndex],
                      content: fullContent
                  };
                  updateState({ messages: currentMessages });
                  continue;
                }
                
                if (payload.error) {
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
      currentMessages = [...currentMessages];
      currentMessages[assistantIndex] = {
          role: 'assistant',
          content: `❌ Erro na Orquestração: ${err.message}`
      };
      updateState({ messages: currentMessages });
    } finally {
      updateState({ isLoading: false, isProcessingFiles: false });
    }
  };

  const clearChat = () => {
    if (confirm("Deseja limpar o histórico desta sessão?")) {
      updateState({ messages: [] });
    }
  };

  return {
    messages: state.messages,
    input: state.input,
    setInput: (v: string) => updateState({ input: v }),
    attachments: state.attachments,
    isLoading: state.isLoading,
    isProcessingFiles: state.isProcessingFiles,
    mode: state.mode,
    setMode: (v: 'auto' | 'manual') => updateState({ mode: v }),
    availableModels: state.availableModels,
    selectedRoute: state.selectedRoute,
    setSelectedRoute: (v: ModelRoute | null) => updateState({ selectedRoute: v }),
    showModelPicker: state.showModelPicker,
    setShowModelPicker: (v: boolean) => updateState({ showModelPicker: v }),
    modelSearch: state.modelSearch,
    setModelSearch: (v: string) => updateState({ modelSearch: v }),
    maxTokens: state.maxTokens,
    setMaxTokens: (v: number) => updateState({ maxTokens: v }),
    scrollRef,
    fileInputRef,
    handleFileSelect,
    removeAttachment,
    handleSend,
    clearChat
  };
};
