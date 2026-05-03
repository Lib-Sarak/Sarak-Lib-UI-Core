import React from 'react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { 
    Layers, 
    Box, 
    Maximize, 
    Palette, 
    Waves, 
    MousePointer2, 
    Sidebar, 
    Layout, 
    CreditCard 
} from 'lucide-react';

export const HyperGranularityTab: React.FC = () => {
    const sarak = useSarakUI();
    const { applyConfig, ...design } = sarak;

    const update = (key: string, val: any) => applyConfig({ [key]: val });

    const Section = ({ title, icon: Icon, children }: any) => (
        <div className="p-6 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]">
                    <Icon size={16} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] italic text-white/90">{title}</h3>
            </div>
            <div className="space-y-6">{children}</div>
        </div>
    );

    const GranularControl = ({ label, value, onChange, min = 0, max = 100, step = 1, unit = "px" }: any) => (
        <div className="space-y-3">
            <div className="flex justify-between items-center text-2xs font-black uppercase text-white/30">
                <span>{label}</span>
                <span className="text-[var(--theme-primary)]">{value}{unit}</span>
            </div>
            <input 
                type="range" min={min} max={max} step={step} 
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-[var(--theme-primary)]"
            />
        </div>
    );

    const ColorOverride = ({ label, value, onChange }: any) => (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 group">
            <span className="text-2xs font-black uppercase tracking-widest text-white/60">{label}</span>
            <input 
                type="color" 
                value={value || '#000000'} 
                onChange={(e) => onChange(e.target.value)}
                className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer"
            />
        </div>
    );

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500 overflow-y-auto custom-scrollbar">
            
            {/* HIERARCHICAL TOKENS: RADIUS */}
            <Section title="Hierarquia de Bordas" icon={Box}>
                <div className="grid grid-cols-1 gap-6">
                    <GranularControl 
                        label="Border Radius (SM)" 
                        value={design.borderRadius?.sm ?? 4} 
                        onChange={(val: number) => update('borderRadius', { ...design.borderRadius, sm: val })}
                        max={20}
                    />
                    <GranularControl 
                        label="Border Radius (MD)" 
                        value={design.borderRadius?.md ?? 8} 
                        onChange={(val: number) => update('borderRadius', { ...design.borderRadius, md: val })}
                        max={40}
                    />
                    <GranularControl 
                        label="Border Radius (LG)" 
                        value={design.borderRadius?.lg ?? 12} 
                        onChange={(val: number) => update('borderRadius', { ...design.borderRadius, lg: val })}
                        max={60}
                    />
                </div>
            </Section>

            {/* HIERARCHICAL TOKENS: GAP & PADDING */}
            <Section title="Espaçamento Atômico" icon={Maximize}>
                <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-4">
                        <label className="text-2xs font-black uppercase text-white/20">Layout Gaps</label>
                        <GranularControl 
                            label="Gap (SM)" 
                            value={design.layoutGap?.sm ?? 8} 
                            onChange={(val: number) => update('layoutGap', { ...design.layoutGap, sm: val })}
                            max={32}
                        />
                        <GranularControl 
                            label="Gap (MD)" 
                            value={design.layoutGap?.md ?? 16} 
                            onChange={(val: number) => update('layoutGap', { ...design.layoutGap, md: val })}
                            max={64}
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-2xs font-black uppercase text-white/20">Card Padding</label>
                        <GranularControl 
                            label="Padding (SM)" 
                            value={design.cardPadding?.sm ?? 12} 
                            onChange={(val: number) => update('cardPadding', { ...design.cardPadding, sm: val })}
                            max={48}
                        />
                        <GranularControl 
                            label="Padding (LG)" 
                            value={design.cardPadding?.lg ?? 32} 
                            onChange={(val: number) => update('cardPadding', { ...design.cardPadding, lg: val })}
                            max={96}
                        />
                    </div>
                </div>
            </Section>

            {/* LAYER SOVEREIGNTY: ATMOSPHERE */}
            <Section title="Atmosfera por Camada" icon={Waves}>
                <div className="grid grid-cols-1 gap-6">
                    <GranularControl 
                        label="Opacidade Noise (Sidebar)" 
                        value={design.sidebarNoiseOpacity ?? 0.08} 
                        onChange={(val: number) => update('sidebarNoiseOpacity', val)}
                        min={0} max={1} step={0.01} unit=""
                    />
                    <GranularControl 
                        label="Opacidade Noise (Topbar)" 
                        value={design.topbarNoiseOpacity ?? 0.08} 
                        onChange={(val: number) => update('topbarNoiseOpacity', val)}
                        min={0} max={1} step={0.01} unit=""
                    />
                    <GranularControl 
                        label="Opacidade Noise (Cards)" 
                        value={design.cardNoiseOpacity ?? 0.08} 
                        onChange={(val: number) => update('cardNoiseOpacity', val)}
                        min={0} max={1} step={0.01} unit=""
                    />
                </div>
            </Section>

            {/* LAYER SOVEREIGNTY: INTERACTION */}
            <Section title="Soberania de Interação" icon={MousePointer2}>
                <div className="space-y-8">
                    {/* Sidebar */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Sidebar size={12} className="text-white/20" />
                            <span className="text-2xs font-black uppercase text-white/20">Painel Lateral</span>
                        </div>
                        <ColorOverride 
                            label="Hover Color" 
                            value={design.sidebarHoverColor} 
                            onChange={(val: string) => update('sidebarHoverColor', val)} 
                        />
                        <ColorOverride 
                            label="Active Color" 
                            value={design.sidebarActiveColor} 
                            onChange={(val: string) => update('sidebarActiveColor', val)} 
                        />
                    </div>

                    {/* Topbar */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Layout size={12} className="text-white/20" />
                            <span className="text-2xs font-black uppercase text-white/20">Barra Superior</span>
                        </div>
                        <ColorOverride 
                            label="Hover Color" 
                            value={design.topbarHoverColor} 
                            onChange={(val: string) => update('topbarHoverColor', val)} 
                        />
                        <ColorOverride 
                            label="Active Color" 
                            value={design.topbarActiveColor} 
                            onChange={(val: string) => update('topbarActiveColor', val)} 
                        />
                    </div>

                    {/* Cards */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <CreditCard size={12} className="text-white/20" />
                            <span className="text-2xs font-black uppercase text-white/20">Cards Industriais</span>
                        </div>
                        <ColorOverride 
                            label="Hover Color" 
                            value={design.cardHoverColor} 
                            onChange={(val: string) => update('cardHoverColor', val)} 
                        />
                        <ColorOverride 
                            label="Active Color" 
                            value={design.cardActiveColor} 
                            onChange={(val: string) => update('cardActiveColor', val)} 
                        />
                    </div>
                </div>
            </Section>

            <div className="p-8 mt-auto">
                <div className="p-4 rounded-2xl bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 text-center">
                    <span className="text-3xs font-black uppercase tracking-[0.4em] text-[var(--theme-primary)]">Hyper-Granularity Engine v10.3</span>
                </div>
            </div>
        </div>
    );
};

export default HyperGranularityTab;
