import React from 'react';

import { SarakIcon } from "../../Icon/SarakIcon";
import { SarakButton, SarakIconButton } from '../../Buttons';

interface ChatHeaderProps {
  label: string;
  mode: 'auto' | 'manual';
  setMode: (mode: 'auto' | 'manual') => void;
  clearChat: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ label, mode, setMode, clearChat }) => (
  <header className="flex items-center justify-between border-b border-[var(--border-color,rgba(255,255,255,0.1))] bg-[var(--text-muted,rgba(255,255,255,0.4))]/5" style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) / 1.5) var(--sarak-layout-gap-md,16px)' }}>
    <div className="flex items-center" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 2)' }}>
      <div className="bg-gradient-to-br from-[var(--sarak-shadow-glow,rgba(0,242,255,0.05))] to-[var(--sarak-primary-color,#00f2ff)] rounded-lg shadow-lg shadow-[var(--sarak-shadow-glow,rgba(0,242,255,0.05))]" style={{ padding: 'var(--sarak-layout-gap-sm, 8px)' }}>
        <SarakIcon name="Bot" size={20} className="text-[var(--sarak-primary-color,#00f2ff)]" />
      </div>
      <div>
        <h2 className="text-sm font-bold tracking-tight text-[var(--color-theme-title,#ffffff)] uppercase" style={{ fontWeight: 'var(--sarak-h1-weight,900)' }}>{label}</h2>
        <p className="text-2xs text-[var(--text-muted,rgba(255,255,255,0.4))] font-medium tracking-widest">Agnostic Interface • Chat Engine</p>
      </div>
    </div>

    <div className="flex items-center" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 4)' }}>
      <SarakButton 
        onClick={() => setMode(mode === 'auto' ? 'manual' : 'auto')}
        variant={mode === 'auto' ? 'success' : 'primary'}
        className="rounded-full shadow-lg"
      >
        {mode === 'auto' ? <SarakIcon name="Sparkles" size={14} /> : <SarakIcon name="Settings2" size={14} />}
        {mode === 'auto' ? 'Selector Inteligente' : 'Modo Manual'}
      </SarakButton>
      
      <SarakIconButton 
        onClick={clearChat} 
        icon={<SarakIcon name="Trash2" size={18} />}
        variant="ghost"
        className="hover:bg-[var(--sarak-status-error-color-bg,rgba(239,68,68,0.15))] hover:text-[var(--sarak-status-error-color,#ef4444)]"
      />
    </div>
  </header>
);
