import React, { useRef } from 'react';
import { Globe, Move, Maximize } from 'lucide-react';
import { Section, SelectControl, SliderControl } from '../components/DesignControls';

interface BrandingSectionProps {
    draft: any;
    updateDraft: (key: string, value: any) => void;
    activeSection: string | null;
    setActiveSection: (id: string | null) => void;
    showToast: (type: 'success' | 'warning', message: string) => void;
}

export const BrandingSection: React.FC<BrandingSectionProps> = ({ draft, updateDraft, activeSection, setActiveSection, showToast }) => {
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
            <Section id="brand-identity" icon={Globe} title="Identidade da Marca" activeSection={activeSection} onToggle={setActiveSection}>
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
            </Section>

            <Section id="brand-metrics" icon={Maximize} title="Posicionamento & Escala" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl label="Posição Logo" options={[{id: 'left', label: 'Esquerda'}, {id: 'center', label: 'Centro'}]} value={draft.logoPosition} onChange={(v: any) => updateDraft('logoPosition', v)} />
                    <SliderControl label="Escala Logo" value={draft.logoScale} min={0.5} max={2.5} step={0.1} onChange={(v: any) => updateDraft('logoScale', v)} />
                </div>
            </Section>
        </>
    );
};
