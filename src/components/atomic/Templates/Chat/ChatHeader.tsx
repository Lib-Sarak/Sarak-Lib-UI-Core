import React from 'react';
import { Bot, Sparkles, Settings2, Trash2 } from 'lucide-react';

interface ChatHeaderProps {
  label: string;
  mode: 'auto' | 'manual';
  setMode: (mode: 'auto' | 'manual') => void;
  clearChat: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ label, mode, setMode, clearChat }) => (
  <header className="flex items-center justify-between px-6 py-4 border-b border-theme bg-white/5" style={{ padding: 'calc(var(--theme-pad) / 1.5) var(--theme-pad)' }}>
    <div className="flex items-center" style={{ gap: 'calc(var(--theme-gap) / 2)' }}>
      <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/20">
        <Bot size={20} className="text-white" />
      </div>
      <div>
        <h2 className="text-sm font-bold tracking-tight text-white uppercase" style={{ fontWeight: 'var(--heading-weight)' }}>{label}</h2>
        <p className="text-2xs text-slate-400 font-medium tracking-widest">Agnostic Interface • Sarak Lib Engine</p>
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
);

