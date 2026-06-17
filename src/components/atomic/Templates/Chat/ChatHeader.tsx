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
  <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--sx-color-border-base)] bg-[var(--sx-color-text-muted)]/5" style={{ padding: 'calc(var(--sx-spacing-md) / 1.5) var(--sx-spacing-md)' }}>
    <div className="flex items-center" style={{ gap: 'calc(var(--sx-spacing-md) / 2)' }}>
      <div className="p-2 bg-gradient-to-br from-[var(--sx-color-primary-glow)] to-[var(--sx-color-primary-base)] rounded-lg shadow-lg shadow-[var(--sx-color-primary-glow)]">
        <Bot size={20} className="text-[var(--sx-color-primary-text)]" />
      </div>
      <div>
        <h2 className="text-sm font-bold tracking-tight text-[var(--sx-color-text-title)] uppercase" style={{ fontWeight: 'var(--heading-weight)' }}>{label}</h2>
        <p className="text-2xs text-[var(--sx-color-text-muted)] font-medium tracking-widest">Agnostic Interface • Sarak Lib Engine</p>
      </div>
    </div>

    <div className="flex items-center" style={{ gap: 'calc(var(--sx-spacing-md) / 4)' }}>
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
        className="hover:bg-[var(--sx-color-danger-surface)] hover:text-[var(--sx-color-danger-base)]"
      />
    </div>
  </header>
);
