import React from 'react';
import { motion } from 'framer-motion';
import { useSarakUI } from '../SarakUIProvider';
import { 
    MessageSquare, Network, BarChart, 
    Zap, MousePointer2, Grid3X3, 
    Layers, Sliders, Sparkles 
} from 'lucide-react';

/**
 * EngineCustomizationTab v7.0
 * Specialized controls for Sarak Prime Engines (Chat, Flow, Charts).
 */
export const EngineCustomizationTab: React.FC = () => {
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

    const Control = ({ label, children }: any) => (
        <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1">{label}</label>
            {children}
        </div>
    );

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500 overflow-y-auto custom-scrollbar">
            
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
                                className={`py-3 rounded-xl border text-[9px] font-black uppercase transition-all ${design.chatBubbleStyle === opt.id ? 'bg-[var(--theme-primary)] border-transparent text-white shadow-lg' : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </Control>
                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase text-white/30">
                            <span>Velocidade de Digitação</span>
                            <span className="text-[var(--theme-primary)]">{design.chatAnimationSpeed || 0.05}s</span>
                        </div>
                        <input 
                            type="range" min="0" max="0.5" step="0.01" 
                            value={design.chatAnimationSpeed || 0.05}
                            onChange={(e) => update('chatAnimationSpeed', parseFloat(e.target.value))}
                            className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-[var(--theme-primary)]"
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
                                className={`py-3 rounded-xl border text-[9px] font-black uppercase transition-all ${design.flowGridStyle === opt.id ? 'bg-[var(--theme-primary)] border-transparent text-white shadow-lg' : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </Control>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase text-white/30">
                        <span>Raio das Nodes</span>
                        <span className="text-[var(--theme-primary)]">{design.flowNodeRadius || 12}px</span>
                    </div>
                    <input 
                        type="range" min="0" max="40" step="1" 
                        value={design.flowNodeRadius || 12}
                        onChange={(e) => update('flowNodeRadius', parseInt(e.target.value))}
                        className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-[var(--theme-primary)]"
                    />
                </div>
            </Section>

            {/* CHART ENGINE CONFIG */}
            <Section title="Chart Engine" icon={BarChart}>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 group">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Mostrar Grid de Fundo</span>
                        <span className="text-[8px] text-white/20 uppercase tracking-tighter italic">Visibilidade das linhas de referência</span>
                    </div>
                    <button 
                        onClick={() => update('chartShowGrid', !design.chartShowGrid)}
                        className={`w-10 h-5 rounded-full relative transition-all ${design.chartShowGrid ? 'bg-[var(--theme-primary)]' : 'bg-white/10'}`}
                    >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${design.chartShowGrid ? 'left-6' : 'left-1'}`} />
                    </button>
                </div>
                
                <div className="p-4 rounded-2xl bg-[var(--theme-primary)]/5 border border-[var(--theme-primary)]/10 flex items-start gap-4">
                    <Sparkles className="w-5 h-5 text-[var(--theme-primary)] shrink-0 mt-1" />
                    <p className="text-[9px] text-white/40 leading-relaxed uppercase font-medium">
                        As cores dos gráficos são herdadas automaticamente da paleta de cores primária e de identidade do sistema.
                    </p>
                </div>
            </Section>

            <div className="p-8 mt-auto">
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-indigo-400/60">Sovereign Engine v7.0</span>
                </div>
            </div>
        </div>
    );
};

export default EngineCustomizationTab;
