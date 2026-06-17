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
  <header className="flex items-center justify-between px-6 py-4 border-b border-theme bg-[var(--theme-muted)]/5" style={{ padding: 'calc(var(--theme-pad) / 1.5) var(--theme-pad)' }}>
    <div className="flex items-center" style={{ gap: 'calc(var(--theme-gap) / 2)' }}>
      <div className="p-2 bg-gradient-to-br from-[var(--theme-primary-focus)] to-[var(--theme-primary)] rounded-lg shadow-lg shadow-[var(--theme-primary-focus)]">
        <Bot size={20} className="text-[var(--theme-on-primary)]" />
      </div>
      <div>
        <h2 className="text-sm font-bold tracking-tight text-[var(--theme-title)] uppercase" style={{ fontWeight: 'var(--heading-weight)' }}>{label}</h2>
        <p className="text-2xs text-[var(--theme-muted)] font-medium tracking-widest">Agnostic Interface • Sarak Lib Engine</p>
      </div>
    </div>

    <div className="flex items-center" style={{ gap: 'calc(var(--theme-gap) / 4)' }}>
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
        className="hover:bg-[var(--theme-error-bg)] hover:text-[var(--theme-error)]"
      />
    </div>
  </header>
);
