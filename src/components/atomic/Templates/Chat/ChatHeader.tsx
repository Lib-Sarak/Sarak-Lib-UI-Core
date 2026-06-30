import React from 'react';
import { Bot, Sparkles, Settings2, Trash2 } from 'lucide-react';
import { SarakButton, SarakIconButton } from '../../Buttons';

interface ChatHeaderProps {
  label: string;
  mode: 'auto' | 'manual';
  setMode: (mode: 'auto' | 'manual') => void;
  clearChat: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ label, mode, setMode, clearChat }) => (
  <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color,#334155)] bg-[var(--text-muted,#94a3b8)]/5" style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) / 1.5) var(--sarak-layout-gap-md,16px)' }}>
    <div className="flex items-center" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 2)' }}>
      <div className="p-2 bg-gradient-to-br from-[var(--sarak-shadow-glow,rgba(59,130,246,0.5))] to-[var(--sarak-primary-color,#3b82f6)] rounded-lg shadow-lg shadow-[var(--sarak-shadow-glow,rgba(59,130,246,0.5))]">
        <Bot size={20} className="text-[var(--sarak-primary-color,#3b82f6)]" />
      </div>
      <div>
        <h2 className="text-sm font-bold tracking-tight text-[var(--color-theme-title,#ffffff)] uppercase" style={{ fontWeight: 'var(--sarak-h1-weight,700)' }}>{label}</h2>
        <p className="text-2xs text-[var(--text-muted,#94a3b8)] font-medium tracking-widest">Agnostic Interface • Sarak Lib Engine</p>
      </div>
    </div>

    <div className="flex items-center" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 4)' }}>
      <SarakButton 
        onClick={() => setMode(mode === 'auto' ? 'manual' : 'auto')}
        variant={mode === 'auto' ? 'success' : 'primary'}
        className="rounded-full shadow-lg"
      >
        {mode === 'auto' ? <Sparkles size={14} /> : <Settings2 size={14} />}
        {mode === 'auto' ? 'Selector Inteligente' : 'Modo Manual'}
      </SarakButton>
      
      <SarakIconButton 
        onClick={clearChat} 
        icon={<Trash2 size={18} />}
        variant="ghost"
        className="hover:bg-[var(--sarak-status-error-color-bg,rgba(239,68,68,0.1))] hover:text-[var(--sarak-status-error-color,#ef4444)]"
      />
    </div>
  </header>
);
