import React, { RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, Send, Cpu, ChevronDown, FileIcon, X } from 'lucide-react';
import { Attachment, ModelRoute } from './types';
import { ModelPicker } from './ModelPicker';

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  attachments: Attachment[];
  removeAttachment: (idx: number) => void;
  handleSend: () => void;
  isLoading: boolean;
  mode: 'auto' | 'manual';
  availableModels: ModelRoute[];
  selectedRoute: ModelRoute | null;
  setSelectedRoute: (route: ModelRoute) => void;
  showModelPicker: boolean;
  setShowModelPicker: (show: boolean) => void;
  modelSearch: string;
  setModelSearch: (search: string) => void;
  maxTokens: number;
  setMaxTokens: (val: number) => void;
  fileInputRef: RefObject<HTMLInputElement>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input, setInput, attachments, removeAttachment, handleSend, isLoading,
  mode, availableModels, selectedRoute, setSelectedRoute,
  showModelPicker, setShowModelPicker, modelSearch, setModelSearch,
  maxTokens, setMaxTokens, fileInputRef, handleFileSelect
}) => (
  <footer className="p-6 bg-gradient-to-t from-slate-900 via-transparent to-transparent">
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
              <ModelPicker 
                availableModels={availableModels}
                selectedRoute={selectedRoute}
                setSelectedRoute={setSelectedRoute}
                modelSearch={modelSearch}
                setModelSearch={setModelSearch}
                setShowModelPicker={setShowModelPicker}
              />
            )}
          </div>

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
      Sarak Orchestrator • Hybrid Model Router
    </p>
  </footer>
);
