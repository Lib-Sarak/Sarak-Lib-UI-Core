import React, { useRef } from 'react';
import { Palette, Globe, Moon, Sun, AlertCircle, Plus, Check } from 'lucide-react';
import { Section, SelectControl, SliderControl } from '../components/DesignControls';
import { PRIMARY_COLORS } from '../../../constants/design-tokens';

interface IdentitySectionProps {
    draft: any;
    updateDraft: (key: string, value: any) => void;
    activeSection: string | null;
    setActiveSection: (id: string | null) => void;
    showToast: (type: 'success' | 'warning', message: string) => void;
}

export const IdentitySection: React.FC<IdentitySectionProps> = ({ draft, updateDraft, activeSection, setActiveSection, showToast }) => {
    const lightLogoInputRef = useRef<HTMLInputElement>(null);
    const darkLogoInputRef = useRef<HTMLInputElement>(null);

    const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>, target: 'logoUrl' | 'logoDarkUrl') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ['image/webp', 'image/svg+xml', 'image/png'];
        if (!validTypes.includes(file.type)) {
            showToast('warning', 'Formatos aceitos: SVG, WebP e PNG.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            updateDraft(target, event.target?.result as string);
            showToast('success', 'Asset importado!');
        };
        reader.readAsDataURL(file);
    };

    return (
        <>
            <Section id="color-core" icon={Palette} title="Cores & Tons" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-7 gap-2 mb-4">
                    {PRIMARY_COLORS.map((color, i) => (
                        <button key={i} onClick={() => updateDraft('primaryColor', color.value)} className={`w-full aspect-square rounded-full transition-all hover:scale-125 relative ${draft.primaryColor === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0c0c0d] scale-110' : 'opacity-80'}`} style={{ backgroundColor: color.value }}>
                            {draft.primaryColor === color.value && <Check size={10} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                        </button>
                    ))}
                    <div className="relative w-full aspect-square">
                        <input 
                            type="color" 
                            value={draft.primaryColor} 
                            onChange={(e) => updateDraft('primaryColor', e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="absolute inset-0 rounded-full border border-white/20 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-all">
                            <Plus size={10} className="text-white/40" />
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-3">Cor Primária (Sovereignty Color)</span>
                    <div className="flex flex-wrap gap-2.5">
                        {[
                            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', 
                            '#0ea5e9', '#f97316', '#22c55e', '#6366f1', '#141414', '#ffffff'
                        ].map(color => (
                            <button 
                                key={color}
                                onClick={() => updateDraft('primaryColor', color)}
                                className={`w-7 h-7 rounded-full border-2 transition-all transform hover:scale-110 active:scale-95 ${draft.primaryColor === color ? 'border-white scale-110 shadow-lg shadow-white/20' : 'border-transparent'}`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                </div>
            </Section>

            <Section id="branding" icon={Globe} title="Branding" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="mb-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20 block mb-2">Nome do Sistema</span>
                    <input 
                        type="text" value={draft.systemName} 
                        onChange={(e) => updateDraft('systemName', e.target.value)}
                        placeholder="Ex: Sarak Matrix"
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-[11px] font-bold focus:border-[var(--theme-primary)] focus:outline-none transition-all text-white/80"
                    />
                </div>

                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Logo (Light Mode)</span>
                        <button onClick={() => lightLogoInputRef.current?.click()} className="text-[8px] font-black uppercase text-[var(--theme-primary)] hover:underline">Importar Arquivo</button>
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="text" value={draft.logoUrl} 
                            onChange={(e) => updateDraft('logoUrl', e.target.value)}
                            placeholder="URL ou Base64..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-[11px] font-bold focus:border-[var(--theme-primary)] focus:outline-none transition-all text-white/80"
                        />
                        <input type="file" ref={lightLogoInputRef} onChange={(e) => handleFileImport(e, 'logoUrl')} className="hidden" accept=".webp,.svg,.png" />
                    </div>
                </div>

                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Logo (Dark Mode)</span>
                        <button onClick={() => darkLogoInputRef.current?.click()} className="text-[8px] font-black uppercase text-[var(--theme-primary)] hover:underline">Importar Arquivo</button>
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="text" value={draft.logoDarkUrl} 
                            onChange={(e) => updateDraft('logoDarkUrl', e.target.value)}
                            placeholder="URL ou Base64..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-[11px] font-bold focus:border-[var(--theme-primary)] focus:outline-none transition-all text-white/80"
                        />
                        <input type="file" ref={darkLogoInputRef} onChange={(e) => handleFileImport(e, 'logoDarkUrl')} className="hidden" accept=".webp,.svg,.png" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <SelectControl label="Posição Logo" options={[{id: 'left', label: 'Esquerda'}, {id: 'center', label: 'Centro'}]} value={draft.logoPosition} onChange={(v: any) => updateDraft('logoPosition', v)} />
                    <SliderControl label="Escala Logo" value={draft.logoScale} min={0.5} max={2.5} step={0.1} onChange={(v: any) => updateDraft('logoScale', v)} />
                </div>
            </Section>

            <Section id="appearance" icon={Moon} title="Aparência" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-2 mb-6">
                    <button onClick={() => updateDraft('mode', 'dark')} className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${draft.mode === 'dark' ? 'bg-[var(--theme-primary)]/10 border-[var(--theme-primary)] text-[var(--theme-primary)]' : 'bg-white/5 border-transparent text-white/20 hover:text-white'}`}>
                        <Moon size={16} /><span className="text-[8px] font-black uppercase">Dark Mode</span>
                    </button>
                    <button onClick={() => updateDraft('mode', 'light')} className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${draft.mode === 'light' ? 'bg-[var(--theme-primary)]/10 border-[var(--theme-primary)] text-[var(--theme-primary)]' : 'bg-white/5 border-transparent text-white/20 hover:text-white'}`}>
                        <Sun size={16} /><span className="text-[8px] font-black uppercase">Light Mode</span>
                    </button>
                </div>
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20 block">Tom de Voz (System Tone)</span>
                        <div className="group relative">
                            <AlertCircle size={10} className="text-white/40 cursor-help" />
                            <div className="absolute left-0 bottom-full mb-2 w-48 p-3 bg-[#1a1a1b] border border-white/10 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50">
                                <p className="text-[9px] leading-relaxed text-white/60">
                                    Define a personalidade da IA na interface. 
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1 p-1 bg-black/20 rounded-xl border border-white/5 mb-3">
                        {['formal', 'friendly', 'cyber'].map(tone => (
                            <button key={tone} onClick={() => updateDraft('systemTone', tone)} className={`py-2 rounded-lg text-[8px] font-black uppercase transition-all ${draft.systemTone === tone ? 'bg-[var(--theme-primary)] text-white shadow-lg' : 'text-white/20 hover:text-white/40'}`}>{tone}</button>
                        ))}
                    </div>
                </div>
            </Section>
        </>
    );
};
