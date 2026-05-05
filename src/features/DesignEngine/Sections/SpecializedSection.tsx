import React from 'react';
import { Shield, Lock, Cpu, QrCode } from 'lucide-react';
import { Section, SelectControl, SliderControl } from '../components/DesignControls';

interface SpecializedSectionProps {
    draft: any;
    updateDraft: (key: string, value: any) => void;
    activeSection: string | null;
    setActiveSection: (id: string | null) => void;
}

export const SpecializedSection: React.FC<SpecializedSectionProps> = ({ draft, updateDraft, activeSection, setActiveSection }) => {
    return (
        <>
            <Section id="security-system" icon={Shield} title="Soberania & Segurança" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SliderControl 
                        label="Raio de Borda Segura" 
                        value={draft.securityBorderRadius || 16} 
                        min={0} 
                        max={40} 
                        onChange={(v: any) => updateDraft('securityBorderRadius', v)} 
                        suffix="px" 
                    />
                    <SliderControl 
                        label="Tamanho QR Core" 
                        value={draft.qrSize || 180} 
                        min={120} 
                        max={300} 
                        onChange={(v: any) => updateDraft('qrSize', v)} 
                        suffix="px" 
                    />
                </div>
                
                <div className="mt-4 flex gap-4">
                    <button 
                        onClick={() => updateDraft('securityShieldGlow', !draft.securityShieldGlow)}
                        className={`flex-1 py-2 rounded-lg text-3xs font-black uppercase transition-all border ${draft.securityShieldGlow ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/10 text-white/40'}`}
                    >
                        Shield Glow
                    </button>
                    <SliderControl 
                        label="Velocidade Pulso" 
                        value={draft.securityPulseSpeed || 2} 
                        min={0.5} 
                        max={5} 
                        step={0.1} 
                        onChange={(v: any) => updateDraft('securityPulseSpeed', v)} 
                        suffix="s"
                    />
                </div>
            </Section>

            <Section id="auth-experience" icon={Lock} title="Experiência de Acesso" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl 
                        label="Densidade Auth" 
                        options={[
                            {id: 'compact', label: 'Compacta'}, 
                            {id: 'centered', label: 'Centralizada'}, 
                            {id: 'split', label: 'Dividida (Split)'}
                        ]} 
                        value={draft.authDensity || 'centered'} 
                        onChange={(v: any) => updateDraft('authDensity', v)} 
                    />
                    <div className="flex items-end pb-1">
                        <button 
                            onClick={() => updateDraft('authNoiseEnabled', !draft.authNoiseEnabled)}
                            className={`w-full py-3 rounded-lg text-3xs font-black uppercase transition-all border ${draft.authNoiseEnabled ? 'bg-[var(--theme-primary)] border-transparent text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                        >
                            Ruído em Auth
                        </button>
                    </div>
                </div>
            </Section>

            <Section id="system-performance" icon={Cpu} title="Performance & Sistema" activeSection={activeSection} onToggle={setActiveSection}>
                <SelectControl 
                    label="Modo de Operação" 
                    options={[
                        {id: 'balanced', label: 'Equilibrado'}, 
                        {id: 'high-performance', label: 'Alta Performance'}, 
                        {id: 'eco-mode', label: 'Modo Econômico (Sem Blur)'}
                    ]} 
                    value={draft.performanceMode || 'balanced'} 
                    onChange={(v: any) => updateDraft('performanceMode', v)} 
                />
            </Section>
        </>
    );
};
