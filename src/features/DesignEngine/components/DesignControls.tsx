import React from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SliderControl: React.FC<any> = ({ label, value, min, max, step = 1, onChange, suffix = '' }) => (
    <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
            <span className="text-2xs font-black uppercase tracking-widest text-white/40">{label}</span>
            <span className="text-2xs font-mono text-[var(--theme-primary)]">{value ?? 0}{suffix}</span>
        </div>
        <input 
            type="range" min={min} max={max} step={step} value={value ?? 0} 
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[var(--theme-primary)]"
        />
    </div>
);

export const SelectControl: React.FC<any> = ({ label, options, value, onChange, isFont = false }) => (
    <div className="mb-4">
        <span className="text-2xs font-black uppercase tracking-widest text-white/40 block mb-2">{label}</span>
        <select 
            value={value ?? ''} 
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-xs font-bold focus:border-[var(--theme-primary)] focus:outline-none transition-all text-white/80"
            style={isFont ? { fontFamily: value } : {}}
        >
            {(options || []).map((opt: any) => (
                <option key={opt.id || opt} value={opt.id || opt} className="bg-[#0a0a0b]">
                    {typeof opt === 'object' ? (opt.label || opt.name || opt.id) : opt}
                </option>
            ))}
        </select>
    </div>
);

export const CategoryLabel: React.FC<{ 
    icon: any, 
    title: string, 
    index: number, 
    isOpen: boolean, 
    onToggle: () => void,
    isDualView?: boolean,
    onToggleDual?: () => void
}> = ({ icon: Icon, title, index, isOpen, onToggle, isDualView, onToggleDual }) => (
    <div className={`w-full flex border-y border-white/5 transition-all ${isOpen ? 'bg-white/[0.03]' : 'bg-white/[0.01] hover:bg-white/[0.02]'}`}>
        <button 
            onClick={onToggle}
            className="flex-1 px-6 py-4 flex items-center justify-between"
        >
            <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-2xs transition-all ${isOpen ? 'bg-[var(--theme-primary)] text-white shadow-[0_0_15px_rgba(var(--theme-primary-rgb),0.3)]' : 'bg-white/5 text-white/40'}`}>
                    {index}
                </div>
                <div className="flex items-center gap-2">
                    <Icon size={12} className={`transition-all ${isOpen ? 'text-[var(--theme-primary)]' : 'text-white/20'}`} />
                    <h3 className={`text-2xs font-black uppercase tracking-[0.2em] transition-all ${isOpen ? 'text-white' : 'text-white/40'}`}>{title}</h3>
                </div>
            </div>
            <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--theme-primary)]' : 'text-white/20'}`} />
        </button>
        
        {isOpen && onToggleDual && (
            <button 
                onClick={(e) => { e.stopPropagation(); onToggleDual(); }}
                title="Ativar/Desativar Split View"
                className={`px-4 border-l border-white/5 flex items-center justify-center transition-all ${isDualView ? 'text-[var(--theme-primary)] bg-white/5' : 'text-white/10 hover:text-white/30'}`}
            >
                <div className="relative">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="M12 3v18" className={isDualView ? 'opacity-100' : 'opacity-20'} />
                    </svg>
                    {isDualView && <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[var(--theme-primary)] rounded-full animate-pulse" />}
                </div>
            </button>
        )}
    </div>
);

export const Section: React.FC<{ id: string, icon: any, title: string, activeSection: string | null, onToggle: (id: string | null) => void, children: React.ReactNode }> = ({ id, icon: Icon, title, activeSection, onToggle, children }) => (
    <div className="border-b border-white/5 last:border-0">
        <button onClick={() => onToggle(activeSection === id ? null : id)} className="w-full py-4 flex items-center justify-between hover:bg-white/[0.02] transition-all px-6 group">
            <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg transition-all ${activeSection === id ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-white/30 group-hover:text-white/60'}`}><Icon size={14} /></div>
                <span className={`text-2xs font-black uppercase tracking-[0.2em] transition-all ${activeSection === id ? 'text-white' : 'text-white/30 group-hover:text-white/60'}`}>{title}</span>
            </div>
            <ChevronDown size={14} className={`transition-transform duration-300 ${activeSection === id ? 'rotate-180 text-[var(--theme-primary)]' : 'text-white/20'}`} />
        </button>
        <AnimatePresence>
            {activeSection === id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "circOut" }} className="overflow-hidden bg-black/20">
                    <div className="p-6 pt-2">{children}</div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

export const ToggleControl: React.FC<{ label: string, active: boolean, onClick: () => void }> = ({ label, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
            active 
                ? 'bg-[var(--theme-primary)]/10 border-[var(--theme-primary)]/30 text-white' 
                : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/[0.08]'
        }`}
    >
        <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-4 rounded-full relative transition-all ${active ? 'bg-[var(--theme-primary)]' : 'bg-white/10'}`}>
            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${active ? 'left-4.5' : 'left-0.5'}`} />
        </div>
    </button>
);

