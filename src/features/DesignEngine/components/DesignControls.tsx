import React, { useState } from 'react';
import { ChevronDown, RotateCcw, HelpCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { SarakSlider, SarakSwitch, SarakSelect, SarakInput } from '../../../components/atomic/Inputs';

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
                className="text-[var(--theme-muted)] hover:text-[var(--theme-primary)] transition-colors focus:outline-none p-1 rounded-full hover:bg-[var(--theme-layer)] cursor-help"
            >
                <HelpCircle size={10} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-72 p-5 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[9999] pointer-events-none"
                    >
                        <div className="flex flex-col gap-2 relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)] shadow-[0_0_8px_var(--theme-primary)]" />
                                <span className="text-[10px] font-black uppercase text-[var(--theme-text)] tracking-[0.2em]">{label}</span>
                            </div>
                            <div className="h-[1px] w-full bg-[var(--theme-border)]" />
                            <p className="text-[10px] text-[var(--theme-muted)] leading-relaxed uppercase font-medium">
                                {description || `Configuração granular para o parâmetro ${label.toLowerCase()} no ecossistema Sarak UI.`}
                            </p>
                        </div>
                        {/* Triângulo indicador */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-[var(--theme-surface)]" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const SliderControl: React.FC<any> = ({ label, description, value, min = 0, max = 100, step = 1, onChange, suffix = '', unit = 'px' }) => (
    <div className="mb-3">
        <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-muted)] flex items-center gap-1.5">
                {label}
                <HelpTooltip label={label} description={description} />
            </span>
            <span className="text-[10px] font-mono text-[var(--theme-primary)]">{value ?? 0}{suffix || unit}</span>
        </div>
        <SarakSlider 
            min={min} 
            max={max} 
            step={step} 
            value={value ?? 0} 
            valueLabel={`${value ?? 0}${suffix || unit}`}
            onChange={(e) => onChange(parseFloat(e.target.value))}
        />
    </div>
);

export const ColorControl: React.FC<any> = ({ label, description, value, onChange }) => {
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
        <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--theme-layer)] border border-[var(--theme-border)] group transition-all hover:bg-[var(--theme-border)]">
            <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-muted)] flex items-center gap-1.5">
                    {label}
                    <HelpTooltip label={label} description={description} />
                </span>
                <span className="text-[9px] font-mono text-[var(--theme-muted)] uppercase">{localColor}</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[var(--theme-border)] shadow-lg ring-1 ring-[var(--theme-layer)]">
                    <input 
                        type="color" 
                        value={sanitizeColor(localColor)} 
                        onChange={(e) => {
                            setLocalColor(e.target.value);
                            onChange(e.target.value);
                        }}
                        className="absolute inset-0 w-[200%] h-[200%] -top-[50%] -left-[50%] cursor-pointer border-none bg-transparent"
                    />
                    <div className="absolute inset-0 pointer-events-none ring-inset ring-1 ring-[var(--theme-border)]" />
                </div>
            </div>
        </div>
    );
};

export const SwitchControl: React.FC<any> = ({ label, value, onChange, description }) => (
    <SarakSwitch 
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        label={
            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                {label}
                <HelpTooltip label={label} description={description} />
            </span>
        }
    />
);

export const SelectControl: React.FC<any> = ({ label, description, options, value, onChange, isFont = false }) => (
    <div className="mb-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-muted)] flex items-center gap-1.5 mb-1.5">
            {label}
            <HelpTooltip label={label} description={description} />
        </span>
        <SarakSelect 
            value={value ?? ''} 
            onChange={(e) => onChange(e.target.value)}
            style={isFont ? { fontFamily: value } : {}}
        >
            {(options || []).map((opt: any) => {
                const optId = typeof opt === 'object' ? (opt.id !== undefined ? opt.id : (opt.value !== undefined ? opt.value : '')) : opt;
                const optLabel = typeof opt === 'object' ? (opt.label || opt.name || optId) : opt;
                return (
                    <option key={optId} value={optId}>
                        {optLabel}
                    </option>
                );
            })}
        </SarakSelect>
    </div>
);


export const InputControl: React.FC<any> = ({ label, description, value, onChange, type = 'text', placeholder = '' }) => (
    <div className="mb-3">
        <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-muted)] flex items-center gap-1.5">
                {label}
                <HelpTooltip label={label} description={description} />
            </span>
        </div>
        <SarakInput 
            type={type}
            value={value ?? ''} 
            placeholder={placeholder}
            onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) : e.target.value)}
        />
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
    onReset?: () => void,
    onApply?: () => void,
    pillarId?: string
}> = ({ icon: Icon, title, index, isOpen, onToggle, isDualView, onToggleDual, isDirty, onReset, onApply, pillarId }) => (
    <div className={`w-full flex border-y border-[var(--theme-border)] transition-all ${isOpen ? 'bg-[var(--theme-layer)]' : 'bg-transparent hover:bg-[var(--theme-surface)]'}`}>
    <div 
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggle();
            }
        }}
        className="flex-1 px-6 py-4 flex items-center justify-between group cursor-pointer outline-none focus:bg-[var(--theme-layer)]"
    >
        <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-2xs transition-all relative ${isOpen ? 'bg-[var(--theme-primary)] text-white shadow-[0_0_15px_rgba(var(--theme-primary-rgb),0.3)]' : 'bg-[var(--theme-layer)] text-[var(--theme-muted)]'}`}>
                {index}
                {isDirty && !isOpen && (
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[var(--theme-primary)] rounded-full border-2 border-[var(--theme-bg)] animate-pulse" />
                )}
            </div>
            <div className="flex items-center gap-2">
                <Icon size={12} className={`transition-all ${isOpen ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-muted)]'}`} />
                <span className={`text-2xs font-black uppercase tracking-[0.2em] transition-all ${isOpen ? 'text-[var(--theme-text)]' : 'text-[var(--theme-muted)]'}`}>{title}</span>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <AnimatePresence>
                {isDirty && (
                    <div className="flex items-center gap-2">
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
                        
                        <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            onClick={(e) => { e.stopPropagation(); onApply?.(); }}
                            title={`Aplicar apenas o pilar ${title} ao sistema`}
                            className="px-3 py-1.5 rounded-lg bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)] hover:text-white text-[9px] font-black uppercase tracking-tighter transition-all active:scale-95 flex items-center gap-1.5"
                        >
                            <span>Commit {title}</span>
                        </motion.button>
                    </div>
                )}
            </AnimatePresence>
            <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--theme-primary)]' : 'text-[var(--theme-muted)]'}`} />
        </div>
    </div>
        
        {isOpen && onToggleDual && (
            <button 
                onClick={(e) => { e.stopPropagation(); onToggleDual(); }}
                title="Ativar/Desativar Split View"
                className={`px-4 border-l border-[var(--theme-border)] flex items-center justify-center transition-all ${isDualView ? 'text-[var(--theme-primary)] bg-[var(--theme-layer)]' : 'text-[var(--theme-muted)] hover:text-[var(--theme-text)]'}`}
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
    <div className="border-b border-[var(--theme-border)] last:border-0">
        <button onClick={() => onToggle(activeSection === id ? null : id)} className="w-full py-4 flex items-center justify-between hover:bg-[var(--theme-surface)] transition-all px-6 group">
            <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg transition-all ${activeSection === id ? 'bg-[var(--theme-primary)] text-white' : 'bg-[var(--theme-layer)] text-[var(--theme-muted)] group-hover:text-[var(--theme-text)]'}`}><Icon size={14} /></div>
                <span className={`text-2xs font-black uppercase tracking-[0.2em] transition-all ${activeSection === id ? 'text-[var(--theme-text)]' : 'text-[var(--theme-muted)] group-hover:text-[var(--theme-text)]'}`}>{title}</span>
            </div>
            <ChevronDown size={14} className={`transition-transform duration-300 ${activeSection === id ? 'rotate-180 text-[var(--theme-primary)]' : 'text-[var(--theme-muted)]'}`} />
        </button>
        <AnimatePresence>
            {activeSection === id && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: activeSection === id ? 'auto' : 0, opacity: activeSection === id ? 1 : 0 }} 
                    exit={{ height: 0, opacity: 0 }} 
                    transition={{ duration: 0.3, ease: "circOut" }} 
                    className={`bg-[var(--theme-layer)] ${activeSection === id ? 'overflow-visible' : 'overflow-hidden'}`}
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
                ? 'bg-[var(--theme-primary)]/10 border-[var(--theme-primary)]/30 text-[var(--theme-primary)]' 
                : 'bg-[var(--theme-layer)] border-[var(--theme-border)] text-[var(--theme-muted)] hover:bg-[var(--theme-border)]'
        }`}
    >
        <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-4 rounded-full relative transition-all ${active ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-border)]'}`}>
            <div className={`absolute top-0.5 w-3 h-3 bg-[var(--theme-surface)] rounded-full transition-all ${active ? 'left-4.5' : 'left-0.5'}`} />
        </div>
    </button>
);

export const MediaUploaderControl: React.FC<any> = ({ label, description, value, onChange }) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const { onMediaUpload } = useSarakUI();
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Se houver Injeção de Dependência via Context, delegamos o upload para o host
        if (onMediaUpload) {
            try {
                setIsUploading(true);
                const publicUrl = await onMediaUpload(file);
                onChange(publicUrl);
            } catch (error) {
                console.error('Falha no upload de mídia externo:', error);
                alert('Erro ao enviar o arquivo.');
            } finally {
                setIsUploading(false);
            }
            return;
        }

        // Fallback: Conversão em Base64 apenas para arquivos pequenos (Limite ~2MB de segurança)
        if (file.size > 2 * 1024 * 1024) {
            alert('Sem um Storage em nuvem configurado, o arquivo não pode exceder 2MB. Configure o onMediaUpload no SarakUIProvider.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            onChange(dataUrl);
        };
        reader.readAsDataURL(file);
    };

    // Sanitiza o valor caso venha do formato antigo de texto CSS (ex: url("..."))
    const rawValue = typeof value === 'string' ? value.replace(/^url\(["']?/, '').replace(/["']?\)$/, '') : value;
    const isVideo = rawValue?.includes('video') || rawValue?.endsWith('.webm') || rawValue?.endsWith('.mp4');

    return (
        <div className="mb-3">
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-muted)] flex items-center gap-1.5">
                    {label}
                    <HelpTooltip label={label} description={description} />
                </span>
            </div>
            <div className="flex items-center gap-3">
                <div 
                    onClick={() => !isUploading && inputRef.current?.click()}
                    className={`w-12 h-12 rounded-lg border border-dashed border-[var(--theme-border)] hover:border-[var(--theme-primary)] flex items-center justify-center bg-[var(--theme-layer)] cursor-pointer transition-all hover:bg-[var(--theme-border)] overflow-hidden shrink-0 relative ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    {isUploading ? (
                        <Loader2 className="w-5 h-5 text-[var(--theme-primary)] animate-spin" />
                    ) : rawValue ? (
                        isVideo ? (
                            <video src={rawValue} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                        ) : (
                            <img src={rawValue} alt="Preview" className="w-full h-full object-contain p-1" />
                        )
                    ) : (
                        <div className="text-[20px] font-light text-[var(--theme-muted)]">+</div>
                    )}
                </div>
                <div className="flex-1 flex items-center gap-2">
                    <button 
                        onClick={() => !isUploading && inputRef.current?.click()}
                        disabled={isUploading}
                        className={`text-[9px] font-bold uppercase tracking-wider px-3 py-2 bg-[var(--theme-layer)] hover:bg-[var(--theme-border)] rounded-md text-[var(--theme-text)] transition-all border border-[var(--theme-border)] shadow-sm ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isUploading ? 'Enviando...' : 'Fazer Upload'}
                    </button>
                    {rawValue && !isUploading && (
                        <button 
                            onClick={() => onChange(null)}
                            className="text-[9px] font-bold uppercase tracking-wider px-3 py-2 hover:bg-amber-500/10 hover:text-amber-500 rounded-md text-[var(--theme-muted)] transition-all"
                        >
                            Remover
                        </button>
                    )}
                </div>
            </div>
            <input 
                type="file" 
                ref={inputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*,video/webm,video/mp4" 
            />
        </div>
    );
};


