import React from 'react';
import { ChevronDown, RotateCcw, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * HelpTooltip (v12.0)
 * Tooltip premium com animação e suporte a descrições granulares.
 */
export const HelpTooltip: React.FC<{ label: string, description?: string }> = ({ label, description }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    
    return (
        <div className="relative inline-flex items-center">
            <button 
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
                onClick={() => setIsOpen(!isOpen)}
                className="text-white/20 hover:text-[var(--theme-primary)] transition-colors focus:outline-none p-1 rounded-full hover:bg-white/5 cursor-help"
            >
                <HelpCircle size={10} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-72 p-5 rounded-2xl bg-[#0f0f10] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[9999] pointer-events-none"
                    >
                        <div className="flex flex-col gap-2 relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)] shadow-[0_0_8px_var(--theme-primary)]" />
                                <span className="text-[10px] font-black uppercase text-white tracking-[0.2em]">{label}</span>
                            </div>
                            <div className="h-[1px] w-full bg-white/5" />
                            <p className="text-[10px] text-white/40 leading-relaxed uppercase font-medium">
                                {description || `Configuração granular para o parâmetro ${label.toLowerCase()} no ecossistema Sarak UI.`}
                            </p>
                        </div>
                        {/* Triângulo indicador */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-[#0f0f10]" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const SliderControl: React.FC<any> = ({ label, value, min = 0, max = 100, step = 1, onChange, suffix = '', unit = 'px' }) => (
    <div className="mb-3">
        <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1.5">
                {label}
                <HelpTooltip label={label} />
            </span>
            <span className="text-[10px] font-mono text-[var(--theme-primary)]">{value ?? 0}{suffix || unit}</span>
        </div>
        <input 
            type="range" min={min} max={max} step={step} value={value ?? 0} 
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[var(--theme-primary)]"
        />
    </div>
);

export const ColorControl: React.FC<any> = ({ label, value, onChange }) => {
    const [localColor, setLocalColor] = React.useState(value || '#000000');

    // Sincroniza localmente para evitar engasgos no draft
    const sanitizeColor = (color: any) => {
        if (typeof color !== 'string') return '#000000';
        if (color.startsWith('#')) return color;
        if (color.startsWith('rgba')) {
            const matches = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (matches) {
                const r = parseInt(matches[1]).toString(16).padStart(2, '0');
                const g = parseInt(matches[2]).toString(16).padStart(2, '0');
                const b = parseInt(matches[3]).toString(16).padStart(2, '0');
                return `#${r}${g}${b}`;
            }
        }
        if (color === 'transparent') return '#000000';
        return '#000000';
    };

    React.useEffect(() => {
        setLocalColor(value || '#000000');
    }, [value]);

    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 group transition-all hover:bg-white/10 hover:border-white/20">
            <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                    {label}
                    <HelpTooltip label={label} />
                </span>
                <span className="text-[9px] font-mono text-white/20 uppercase">{localColor}</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10 shadow-lg ring-1 ring-white/5">
                    <input 
                        type="color" 
                        value={sanitizeColor(localColor)} 
                        onChange={(e) => {
                            setLocalColor(e.target.value);
                            onChange(e.target.value);
                        }}
                        className="absolute inset-0 w-[200%] h-[200%] -top-[50%] -left-[50%] cursor-pointer border-none bg-transparent"
                    />
                    <div className="absolute inset-0 pointer-events-none ring-inset ring-1 ring-white/10" />
                </div>
            </div>
        </div>
    );
};

export const SwitchControl: React.FC<any> = ({ label, value, onChange, description }) => (
    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 group hover:bg-white/10 transition-all">
        <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                {label}
                <HelpTooltip label={label} description={description} />
            </span>
            {description && <span className="text-[9px] text-white/20 uppercase tracking-tighter italic">{description}</span>}
        </div>
        <button 
            onClick={() => onChange(!value)}
            className={`w-9 h-4.5 rounded-full relative transition-all ${value ? 'bg-[var(--theme-primary)]' : 'bg-white/10'}`}
        >
            <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all ${value ? 'left-5' : 'left-0.5'}`} />
        </button>
    </div>
);

export const SelectControl: React.FC<any> = ({ label, options, value, onChange, isFont = false }) => (
    <div className="mb-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1.5 mb-1.5">
            {label}
            <HelpTooltip label={label} />
        </span>
        <select 
            value={value ?? ''} 
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-[10px] font-bold focus:border-[var(--theme-primary)] focus:outline-none transition-all text-white/80"
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
    onToggleDual?: () => void,
    isDirty?: boolean,
    onReset?: () => void
}> = ({ icon: Icon, title, index, isOpen, onToggle, isDualView, onToggleDual, isDirty, onReset }) => (
    <div className={`w-full flex border-y border-white/5 transition-all ${isOpen ? 'bg-white/[0.03]' : 'bg-white/[0.01] hover:bg-white/[0.02]'}`}>
        <button 
            onClick={onToggle}
            className="flex-1 px-6 py-4 flex items-center justify-between group"
        >
            <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-2xs transition-all relative ${isOpen ? 'bg-[var(--theme-primary)] text-white shadow-[0_0_15px_rgba(var(--theme-primary-rgb),0.3)]' : 'bg-white/5 text-white/40'}`}>
                    {index}
                    {isDirty && !isOpen && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-[#0a0a0b] animate-pulse" />
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Icon size={12} className={`transition-all ${isOpen ? 'text-[var(--theme-primary)]' : 'text-white/20'}`} />
                    <h3 className={`text-2xs font-black uppercase tracking-[0.2em] transition-all ${isOpen ? 'text-white' : 'text-white/40'}`}>{title}</h3>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <AnimatePresence>
                    {isDirty && (
                        <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            onClick={(e) => { e.stopPropagation(); onReset?.(); }}
                            title="Descartar Alterações neste Pilar"
                            className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all active:scale-90"
                        >
                            <RotateCcw size={10} />
                        </motion.button>
                    )}
                </AnimatePresence>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--theme-primary)]' : 'text-white/20'}`} />
            </div>
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
                <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: activeSection === id ? 'auto' : 0, opacity: activeSection === id ? 1 : 0 }} 
                    exit={{ height: 0, opacity: 0 }} 
                    transition={{ duration: 0.3, ease: "circOut" }} 
                    className={`bg-black/20 ${activeSection === id ? 'overflow-visible' : 'overflow-hidden'}`}
                >
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

