import React, { RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, Send, Cpu, ChevronDown, FileIcon, X } from 'lucide-react';
import { Attachment, ModelRoute } from './types';
import { ModelPicker } from './ModelPicker';
import { SarakInput, SarakSlider } from '../../Inputs';
import { SarakButton, SarakIconButton } from '../../Buttons';
import { useStructuralStyles } from '../../hooks/useStructuralStyles';

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
}) => {
  const { getFlexStyles } = useStructuralStyles();
  const modeStack = getFlexStyles('column', undefined, undefined, 'var(--sarak-layout-gap-md,16px)');
  const modelLabelStack = getFlexStyles('column', undefined, undefined, '0px');
  const tokenSliderStack = getFlexStyles('column', undefined, 'center', '0px');

  return (
  <footer className="bg-gradient-to-t from-[var(--color-theme-card,#1e293b)] via-transparent to-transparent" style={{ padding: 'var(--sarak-layout-gap-lg, 24px)' }}>
    <AnimatePresence>
      {attachments.length > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-x-auto custom-scrollbar-h"
          style={{ marginBottom: 'var(--sarak-layout-gap-md,16px)' }}
        >
          <div className="flex" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)', paddingTop: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)', paddingBottom: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)' }}>
            {attachments.map((att, i) => (
              <div key={i} className="flex items-center bg-[var(--sarak-primary-color-bg,rgba(59,130,246,0.1))] border border-[var(--border-color,#334155)] rounded-xl relative group/att" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)', padding: 'var(--sarak-layout-gap-sm, 8px) calc(var(--sarak-layout-gap-md,16px) * 0.75)' }}>
                <FileIcon size={14} className="text-[var(--sarak-primary-color,#3b82f6)]" />
                <span className="text-xs font-medium text-[var(--color-theme-title,#ffffff)] max-w-[150px] truncate">{att.name}</span>
                <SarakIconButton
                  onClick={() => removeAttachment(i)}
                  icon={<X size={12} />}
                  variant="ghost"
                  className="hover:bg-[var(--sarak-status-error-color-bg,rgba(239,68,68,0.1))] hover:text-[var(--sarak-status-error-color,#ef4444)]"
                  style={{ marginLeft: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)', padding: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)' }}
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    <div className={modeStack.className} style={modeStack.style}>
      {mode === 'manual' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center" style={{ gap: 'var(--sarak-layout-gap-md,16px)' }}>
          <div className="relative">
            <SarakButton 
              onClick={() => setShowModelPicker(!showModelPicker)}
              variant="outline"
              className="text-left shadow-lg"
              style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 1.5)' }}
            >
               <Cpu size={18} className="text-[var(--sarak-primary-color,#3b82f6)]" />
               <div className="flex" style={modelLabelStack.style}>
                  <span className="text-2xs text-[var(--text-muted,#94a3b8)] uppercase font-bold tracking-tight leading-none" style={{ marginBottom: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)' }}>Modelo Manual Ativo</span>
                  <span className="text-xs font-semibold text-[var(--color-theme-title,#ffffff)]">{selectedRoute?.display_name || "Selecionar..."}</span>
               </div>
               <ChevronDown size={14} className={`text-[var(--text-muted,#94a3b8)] transition-transform ${showModelPicker ? 'rotate-180' : ''}`} />
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

          <div className={`flex-1 min-w-[120px] bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] ${tokenSliderStack.className}`} style={{ ...tokenSliderStack.style, padding: 'var(--sarak-layout-gap-sm, 8px) var(--sarak-layout-gap-md,16px)' }}>
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
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--sarak-primary-color,#3b82f6)] to-[var(--sarak-shadow-glow,rgba(59,130,246,0.5))] rounded-[var(--sarak-card-radius,12px)] blur opacity-10 group-hover/input:opacity-25 transition-opacity" style={{ transitionDuration: 'var(--duration-normal, 0.3s)' }}></div>
        <div className="relative flex items-center bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] overflow-hidden shadow-sm rounded-[var(--sarak-card-radius,12px)]" style={{ paddingRight: 'var(--sarak-layout-gap-sm, 8px)' }}>
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple accept="image/*" className="hidden" />

          <SarakIconButton
            onClick={() => fileInputRef.current?.click()}
            icon={<Paperclip size={20} />}
            variant="ghost"
            style={{ marginLeft: 'var(--sarak-layout-gap-sm, 8px)' }}
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
          
          <div className="flex items-center" style={{ paddingRight: 'var(--sarak-layout-gap-sm, 8px)', paddingTop: 'var(--sarak-layout-gap-sm, 8px)', paddingBottom: 'var(--sarak-layout-gap-sm, 8px)' }}>
              <SarakIconButton 
                onClick={handleSend}
                disabled={(!input.trim() && attachments.length === 0) || isLoading}
                icon={<Send size={20} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />}
                variant="primary"
                className="shadow-lg shadow-[var(--sarak-shadow-glow,rgba(59,130,246,0.5))] group/btn"
              />
          </div>
        </div>
      </div>
    </div>
    
    <p className="text-center text-2xs text-[var(--text-muted,#94a3b8)] uppercase tracking-[0.3em] font-medium" style={{ marginTop: 'var(--sarak-layout-gap-md,16px)' }}>
    </p>
  </footer>
  );
};

