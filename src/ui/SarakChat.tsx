import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  Cpu, 
  Trash2, 
  Settings2,
  Sparkles,
  Paperclip,
  X,
  FileIcon,
  Search,
  AlertTriangle,
  ChevronDown,
  Check,
  Terminal,
  Zap
} from 'lucide-react';

interface ModelRoute {
  model: string;
  provider: string;
  display_name: string;
  capabilities: string[];
  tier: string;
  score?: number;
}

interface Attachment {
  file: File;
  name: string;
  type: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    model?: string;
    provider?: string;
    reasoning?: string;
  };
}

interface SarakChatProps {
  endpoint: string;
  modelsEndpoint?: string;
  label?: string;
}

export const SarakChat: React.FC<SarakChatProps> = ({ 
  endpoint, 
  modelsEndpoint = '/llm-test-chat/models', // Fallback para compatibilidade legada
  label = 'Sarak AI Chat Lab'
}) => {
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
        const token = localStorage.getItem('sarak_token') || localStorage.getItem('auth_token');
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

      const token = localStorage.getItem('sarak_token') || localStorage.getItem('auth_token');
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
                console.warn("Erro ao processar chunk SSE:", e);
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

  return (
    <div className="flex flex-col h-[600px] bg-theme-card border-theme group/chat transition-all rounded-theme" style={{ transitionDuration: 'var(--animation-speed, 0.5s)' }}>
      {/* HEADER SECTION */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-theme bg-white/5" style={{ padding: 'calc(var(--theme-pad) / 1.5) var(--theme-pad)' }}>
        <div className="flex items-center" style={{ gap: 'calc(var(--theme-gap) / 2)' }}>
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/20">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-white uppercase" style={{ fontWeight: 'var(--heading-weight)' }}>{label}</h2>
            <p className="text-[10px] text-slate-400 font-medium tracking-widest">Agnostic Interface • Sarak Matrix v6.5</p>
          </div>
        </div>

        <div className="flex items-center" style={{ gap: 'calc(var(--theme-gap) / 4)' }}>
          <button 
            onClick={() => setMode(mode === 'auto' ? 'manual' : 'auto')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              mode === 'auto' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
            }`}
            style={{ transitionDuration: 'var(--animation-speed, 0.3s)' }}
          >
            {mode === 'auto' ? <Sparkles size={14} /> : <Settings2 size={14} />}
            {mode === 'auto' ? 'Selector Inteligente' : 'Modo Manual'}
          </button>
          
          <button onClick={clearChat} className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors text-slate-500" style={{ transitionDuration: 'var(--animation-speed, 0.3s)' }}>
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      {/* MESSAGES AREA */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth flex flex-col"
        style={{ padding: 'var(--theme-pad, 1.5rem)', gap: 'var(--theme-gap, 1.5rem)' }}
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in zoom-in duration-700">
            <div className="w-20 h-20 bg-theme-card border-theme flex items-center justify-center mb-2 relative group/terminal">
               <div className="absolute inset-0 bg-indigo-500/20 rounded-3xl blur-2xl opacity-0 group-hover/terminal:opacity-100 transition-opacity"></div>
              <Terminal size={36} className="text-indigo-400 relative z-10" />
            </div>
            <h3 className="text-lg font-medium text-slate-200">Visão da Matrix Inicializada</h3>
            <p className="text-sm text-slate-500 max-w-sm">
              Inicie um teste agora. Envie textos ou imagens para processamento via contrato universal.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`} style={{ gap: 'calc(var(--theme-gap) / 2)' }}>
              <div className="flex items-center gap-2 px-1">
                {msg.role === 'assistant' ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                       <Bot size={12} className="text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sarak Matrix Agent</span>
                  </div>
                ) : (
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Requisitante</span>
                )}
              </div>

              <div className={`p-4 rounded-theme shadow-xl border ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white border-blue-500/30' 
                  : 'bg-theme-card border-theme text-slate-200'
              }`} style={{ padding: 'calc(var(--theme-pad) / 1.5)' }}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>

              {msg.metadata && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {msg.metadata.model && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-[10px] font-mono text-slate-400">
                      <Cpu size={10} className="text-indigo-400" />
                      {msg.metadata.model}
                    </div>
                  )}
                  {msg.metadata.reasoning && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-[10px] font-medium text-slate-500 italic">
                      <Search size={10} />
                      {msg.metadata.reasoning}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none shadow-sm">
              <div className="flex gap-1.5">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
              </div>
              {isProcessingFiles && <p className="text-[8px] mt-2 font-mono text-slate-500 uppercase tracking-widest animate-pulse">Codificando Imagens...</p>}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER & INPUT */}
      <footer className="p-6 bg-gradient-to-t from-slate-900 via-transparent to-transparent">
        {/* ATTACHMENTS PREVIEW */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 overflow-x-auto custom-scrollbar-h"
            >
              <div className="flex gap-2 py-1">
                {attachments.map((att, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl relative group/att">
                    <FileIcon size={14} className="text-indigo-400" />
                    <span className="text-xs font-medium text-slate-300 max-w-[150px] truncate">{att.name}</span>
                    <button 
                      onClick={() => removeAttachment(i)}
                      className="ml-1 p-1 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-all text-slate-500"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-4">
          {/* MANUAL CONTROLS */}
          {mode === 'manual' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center" style={{ gap: 'var(--theme-gap, 1rem)' }}>
              <div className="relative">
                <button 
                  onClick={() => setShowModelPicker(!showModelPicker)}
                  className="flex items-center px-4 py-2.5 rounded-theme bg-theme-card border-theme hover:bg-white/10 transition-all text-left shadow-lg"
                  style={{ gap: 'calc(var(--theme-gap) / 1.5)' }}
                >
                   <Cpu size={18} className="text-indigo-400" />
                   <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight leading-none mb-1">Modelo Manual Ativo</span>
                      <span className="text-xs font-semibold text-slate-200">{selectedRoute?.display_name || "Selecionar..."}</span>
                   </div>
                   <ChevronDown size={14} className={`text-slate-500 transition-transform ${showModelPicker ? 'rotate-180' : ''}`} />
                </button>

                {showModelPicker && (
                  <div className="absolute bottom-full left-0 mb-3 w-80 bg-[#0f0f13] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden z-50">
                    <div className="p-3">
                      <div className="relative mb-3">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          type="text"
                          placeholder="Pesquisar modelos..."
                          value={modelSearch}
                          onChange={(e) => setModelSearch(e.target.value)}
                          className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-indigo-500/50 text-slate-200"
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto custom-scrollbar pr-1">
                        {availableModels
                          .filter(m => m.display_name.toLowerCase().includes(modelSearch.toLowerCase()))
                          .map((m, idx) => (
                          <button
                            key={idx}
                            onClick={() => { setSelectedRoute(m); setShowModelPicker(false); }}
                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all mb-1 ${
                              selectedRoute?.model === m.model ? 'bg-indigo-600/20 text-indigo-400' : 'hover:bg-white/5 text-slate-400'
                            }`}
                          >
                            <div className="flex flex-col items-start overflow-hidden">
                              <span className="text-xs font-bold truncate w-full">{m.display_name}</span>
                              <span className="text-[9px] opacity-60 uppercase tracking-tighter">{m.provider}</span>
                            </div>
                            {selectedRoute?.model === m.model && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* TKN SLIDER */}
              <div className="flex-1 min-w-[120px] bg-theme-card border-theme px-4 py-2 flex flex-col justify-center">
                 <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase mb-1">
                    <span>Limit</span>
                    <span className="text-indigo-400 font-mono">{maxTokens}</span>
                 </div>
                 <input 
                   type="range" min="128" max="16384" step="128" value={maxTokens} 
                   onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                   className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                 />
              </div>
            </motion.div>
          )}

          {/* MAIN INPUT BAR */}
          <div className="relative group/input">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-theme blur opacity-10 group-hover/input:opacity-25 transition-opacity" style={{ transitionDuration: 'var(--animation-speed, 0.5s)' }}></div>
            <div className="relative flex items-center bg-theme-card border-theme overflow-hidden shadow-sm pr-2 rounded-theme">
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple accept="image/*" className="hidden" />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="ml-2 p-3.5 text-slate-500 hover:text-indigo-400 hover:bg-white/5 rounded-xl transition-all"
              >
                <Paperclip size={20} />
              </button>

              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={mode === 'auto' ? "Digite sua mensagem..." : "Configuração manual detectada..."}
                className="flex-1 bg-transparent px-4 py-4 text-sm text-slate-200 focus:outline-none placeholder:text-slate-600"
              />
              
              <button 
                onClick={handleSend}
                disabled={(!input.trim() && attachments.length === 0) || isLoading}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed group/btn shadow-lg shadow-indigo-500/20"
              >
                <Send size={20} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
        
        <p className="text-center text-[9px] text-slate-600 mt-4 uppercase tracking-[0.3em] font-medium">
          Sarak Matrix Orchestrator • Hybrid Model Router
        </p>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
        .custom-scrollbar-h::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar-h::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-h::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
};
