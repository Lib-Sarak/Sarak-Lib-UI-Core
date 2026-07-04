import React from 'react';
import { motion } from 'framer-motion';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { 
    MessageSquare, Network, BarChart, 
    Zap, MousePointer2, Grid3X3, 
    Layers, Sliders, Sparkles, HelpCircle
} from 'lucide-react';
import { HelpTooltip } from '../components/DesignControls';
import { SarakSlider, SarakSwitch } from '../../../components/atomic/Inputs';

import { SarakThemePayload } from '../../../core/Provider/types';

/**
 * EngineCustomizationTab v7.0
 * Specialized controls for Sarak Prime Engines (Chat, Flow, Charts).
 */
export const EngineCustomizationTab: React.FC = () => {
    const sarak = useSarakUI();
    const { applyConfig, ...design } = sarak;

    const update = (key: keyof SarakThemePayload, val: string | number | boolean) => applyConfig({ [key]: val } as Partial<SarakThemePayload>);

    const Section = ({ title, icon: Icon, children }: { title: string, icon: React.ElementType, children: React.ReactNode }) => (
        <div className="p-6 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]">
                    <Icon size={16} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[var(--sarak-tracking-tight,0.2em)] italic text-white/90">{title}</h3>
            </div>
            <div className="space-y-6">{children}</div>
        </div>
    );

    const Control = ({ label, children }: { label: string, children: React.ReactNode }) => (
        <div className="space-y-2">
            <label className="text-2xs font-black uppercase tracking-widest text-white/30 ml-1 flex items-center gap-2">
                {label}
                <HelpTooltip label={label} />
            </label>
            {children}
        </div>
    );

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500 overflow-y-auto custom-scrollbar-sidebar">
            
            {/* CHAT ENGINE CONFIG */}
            <Section title="Chat Engine" icon={MessageSquare}>
                <Control label="Estilo de Bolha">
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: 'glass', label: 'Glass' },
                            { id: 'solid', label: 'Solid' },
                            { id: 'minimal', label: 'Minimal' }
                        ].map(opt => (
                            <button 
                                key={opt.id}
                                onClick={() => update('chatBubbleStyle', opt.id)}
                                className={`py-3 rounded-xl border text-2xs font-black uppercase transition-all ${design.chatBubbleStyle === opt.id ? 'bg-[var(--theme-primary)] border-transparent text-white shadow-lg' : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </Control>
                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-2xs font-black uppercase text-white/30 mb-2">
                            <span>Velocidade de Digitação</span>
                        </div>
                        <SarakSlider 
                            min={0} max={0.5} step={0.01} 
                            value={design.chatAnimationSpeed || 0.05}
                            valueLabel={`${design.chatAnimationSpeed || 0.05}s`}
                            onChange={(e) => update('chatAnimationSpeed', parseFloat(e.target.value))}
                        />
                    </div>
                </div>
            </Section>

            {/* FLOW ENGINE CONFIG */}
            <Section title="Flow Engine" icon={Network}>
                <Control label="Estilo do Grid">
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: 'dots', label: 'Dots (Standard)' },
                            { id: 'lines', label: 'Lines (Technical)' }
                        ].map(opt => (
                            <button 
                                key={opt.id}
                                onClick={() => update('flowGridStyle', opt.id)}
                                className={`py-3 rounded-xl border text-2xs font-black uppercase transition-all ${design.flowGridStyle === opt.id ? 'bg-[var(--theme-primary)] border-transparent text-white shadow-lg' : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </Control>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-2xs font-black uppercase text-white/30 mb-2">
                        <span>Raio das Nodes</span>
                    </div>
                    <SarakSlider 
                        min={0} max={40} step={1} 
                        value={design.flowNodeRadius || 12}
                        valueLabel={`${design.flowNodeRadius || 12}px`}
                        onChange={(e) => update('flowNodeRadius', parseInt(e.target.value))}
                    />
                </div>
            </Section>

            {/* CHART ENGINE CONFIG */}
            <Section title="Chart Engine" icon={BarChart}>
                <Control label="Tipo de Visualização">
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: 'line', label: 'Lines' },
                            { id: 'bar', label: 'Bars' },
                            { id: 'pie', label: 'Pie/Donut' },
                            { id: 'radar', label: 'Radar' },
                            { id: 'scatter', label: 'Scatter' },
                            { id: 'heatmap', label: 'Heatmap' },
                            { id: 'gauge', label: 'Gauge' }
                        ].map(opt => (
                            <button 
                                key={opt.id}
                                onClick={() => update('chartType', opt.id)}
                                className={`py-3 rounded-xl border text-2xs font-black uppercase transition-all ${design.chartType === opt.id ? 'bg-[var(--theme-primary)] border-transparent text-white shadow-lg' : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </Control>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 group">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[var(--sarak-type-scale2xs,10px)] font-black uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                            Mostrar Grid de Fundo
                            <HelpTooltip label="Mostrar Grid de Fundo" description="Ativa ou desativa a visualização das linhas de referência nos gráficos (Chart Engine)." />
                        </span>
                        <span className="text-3xs text-white/20 uppercase tracking-tighter italic">Visibilidade das linhas de referência</span>
                    </div>
                    <SarakSwitch 
                        checked={design.chartShowGrid}
                        onChange={() => update('chartShowGrid', !design.chartShowGrid)}
                    />
                </div>
                
                <div className="p-4 rounded-2xl bg-[var(--theme-primary)]/5 border border-[var(--theme-primary)]/10 flex items-start gap-4">
                    <Sparkles className="w-5 h-5 text-[var(--theme-primary)] shrink-0 mt-1" />
                    <p className="text-2xs text-white/40 leading-relaxed uppercase font-medium">
                        As cores e estilos são sincronizados dinamicamente com o Sarak Design Engine v7.5.
                    </p>
                </div>
            </Section>

            <div className="p-8 mt-auto">
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                    <span className="text-3xs font-black uppercase tracking-[var(--sarak-tracking-wider,0.4em)] text-indigo-400/60">Sovereign Engine v7.0</span>
                </div>
            </div>
        </div>
    );
};

export default EngineCustomizationTab;

