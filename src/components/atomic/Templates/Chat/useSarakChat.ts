import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import type {
  Attachment,
  Message,
  ModelRoute,
  SarakChatModelLoader,
  SarakChatOnSend,
  SarakChatSendRequest,
} from './types';

export const useSarakChat = (onSend: SarakChatOnSend, loadModels?: SarakChatModelLoader) => {
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
    if (!loadModels) return;

    let isActive = true;
    void loadModels()
      .then((models) => {
        if (!isActive) return;
        setState((current) => ({
          ...current,
          availableModels: models,
          selectedRoute: current.selectedRoute ?? models[0] ?? null,
        }));
      })
      .catch((error: unknown) => {
        if (isActive) console.error('Erro ao carregar modelos:', error);
      });

    return () => {
      isActive = false;
    };
  }, [loadModels]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages]);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
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

    const assistantPlaceholder: Message = { 
      role: 'assistant', 
      content: '', 
      metadata: { model: state.mode === 'manual' ? state.selectedRoute?.model : 'Selecionando...' } 
    };

    let currentMessages = [...state.messages, userMessage, assistantPlaceholder];
    const assistantIndex = currentMessages.length - 1;
    const request: SarakChatSendRequest = {
      message: userContent,
      attachments: state.attachments.map((attachment) => attachment.file),
      mode: state.mode,
      model: state.mode === 'manual' ? state.selectedRoute : null,
      maxTokens: state.maxTokens,
    };

    updateState({
      messages: currentMessages,
      input: '',
      isLoading: true,
      isProcessingFiles: request.attachments.length > 0,
      attachments: [],
    });

    try {
      let fullContent = '';
      await onSend(request, (token) => {
        if (!token) return;
        fullContent += token;
        currentMessages = [...currentMessages];
        currentMessages[assistantIndex] = {
          ...currentMessages[assistantIndex],
          content: fullContent,
        };
        updateState({ messages: currentMessages });
      });
    } catch (err: unknown) {
      console.error("Erro no Chat Lab Stream:", err);
      currentMessages = [...currentMessages];
      currentMessages[assistantIndex] = {
          role: 'assistant',
          content: `❌ Erro na Orquestração: ${err instanceof Error ? err.message : String(err)}`
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
