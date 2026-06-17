import React, { RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, Send, Cpu, ChevronDown, FileIcon, X } from 'lucide-react';
import { Attachment, ModelRoute } from './types';
import { ModelPicker } from './ModelPicker';
import { SarakInput, SarakSlider } from '../../Inputs';
import { SarakButton, SarakIconButton } from '../../Buttons';

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
  <footer className="p-6 bg-gradient-to-t from-[var(--sx-color-surface-base)] via-transparent to-transparent">
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
              <div key={i} className="flex items-center gap-2 px-3 py-2 bg-[var(--sx-color-primary-surface)] border border-[var(--sx-color-border-base)] rounded-xl relative group/att">
                <FileIcon size={14} className="text-[var(--sx-color-primary-base)]" />
                <span className="text-xs font-medium text-[var(--sx-color-text-title)] max-w-[150px] truncate">{att.name}</span>
                <SarakIconButton 
                  onClick={() => removeAttachment(i)}
                  icon={<X size={12} />}
                  variant="ghost"
                  className="ml-1 p-1 hover:bg-[var(--sx-color-danger-surface)] hover:text-[var(--sx-color-danger-base)]"
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    <div className="flex flex-col gap-4">
      {mode === 'manual' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center" style={{ gap: 'var(--sx-spacing-md)' }}>
          <div className="relative">
            <SarakButton 
              onClick={() => setShowModelPicker(!showModelPicker)}
              variant="outline"
              className="text-left shadow-lg"
              style={{ gap: 'calc(var(--sx-spacing-md) / 1.5)' }}
            >
               <Cpu size={18} className="text-[var(--sx-color-primary-base)]" />
               <div className="flex flex-col">
                  <span className="text-2xs text-[var(--sx-color-text-muted)] uppercase font-bold tracking-tight leading-none mb-1">Modelo Manual Ativo</span>
                  <span className="text-xs font-semibold text-[var(--sx-color-text-title)]">{selectedRoute?.display_name || "Selecionar..."}</span>
               </div>
               <ChevronDown size={14} className={`text-[var(--sx-color-text-muted)] transition-transform ${showModelPicker ? 'rotate-180' : ''}`} />
            </SarakButton>

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

          <div className="flex-1 min-w-[120px] bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)] px-4 py-2 flex flex-col justify-center">
             <SarakSlider 
               min={128} max={16384} step={128} value={maxTokens} 
               onChange={(e) => setMaxTokens(parseInt(e.target.value))}
               className="w-full"
               label="Limit"
               valueLabel={maxTokens}
             />
          </div>
        </motion.div>
      )}

      <div className="relative group/input">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--sx-color-primary-base)] to-[var(--sx-color-primary-glow)] rounded-[var(--sx-radius-md)] blur opacity-10 group-hover/input:opacity-25 transition-opacity" style={{ transitionDuration: 'var(--animation-speed, 0.5s)' }}></div>
        <div className="relative flex items-center bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)] overflow-hidden shadow-sm pr-2 rounded-[var(--sx-radius-md)]">
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple accept="image/*" className="hidden" />
          
          <SarakIconButton 
            onClick={() => fileInputRef.current?.click()}
            icon={<Paperclip size={20} />}
            variant="ghost"
            className="ml-2"
          />

          <SarakInput 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={mode === 'auto' ? "Digite sua mensagem..." : "Configuração manual detectada..."}
            fullWidth
            className="border-none bg-transparent shadow-none"
          />
          
          <div className="pr-2 py-2 flex items-center">
              <SarakIconButton 
                onClick={handleSend}
                disabled={(!input.trim() && attachments.length === 0) || isLoading}
                icon={<Send size={20} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />}
                variant="primary"
                className="shadow-lg shadow-[var(--sx-color-primary-glow)] group/btn"
              />
          </div>
        </div>
      </div>
    </div>
    
    <p className="text-center text-2xs text-[var(--sx-color-text-muted)] mt-4 uppercase tracking-[0.3em] font-medium">
    </p>
  </footer>
);

