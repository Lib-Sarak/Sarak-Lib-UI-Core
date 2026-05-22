import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, FileJson, Info, ExternalLink, Code, Terminal } from 'lucide-react';

/**
 * TemplatesTab (v13.0)
 * Central de integração e exportação de manifestos para sistemas host.
 */
export const TemplatesTab: React.FC = () => {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const templates = [
        {
            id: 'industrial',
            name: 'Industrial Sovereign',
            description: 'O padrão Sarak: técnico, preciso e de alta performance.',
            config: {
                version: "13.0.0",
                config: {
                    colorPrimary: "#00f2ff",
                    colorSecondary: "#7000ff",
                    bgBase: "#0a0a0c",
                    cardBg: "rgba(15, 23, 42, 0.6)",
                    cardRadius: 12,
                    h1Size: 48,
                    motionEaseMain: "cubic-bezier(0.4, 0, 0.2, 1)"
                }
            }
        },
        {
            id: 'glass',
            name: 'Crystal Glass',
            description: 'Focado em profundidade óptica e transparências luxuosas.',
            config: {
                version: "13.0.0",
                config: {
                    glassBlur: 25,
                    glassSaturation: 1.8,
                    glassSpecularity: 0.2,
                    cardInnerGlowWidth: 1,
                    h1Weight: 300
                }
            }
        },
        {
            id: 'cyber',
            name: 'Cyber Neon',
            description: 'Contraste agressivo e brilho intenso para interfaces futuristas.',
            config: {
                version: "13.0.0",
                config: {
                    colorPrimary: "#ff00ff",
                    colorSecondary: "#00ffff",
                    bgBase: "#050505",
                    h1Glow: "0 0 20px rgba(255,0,255,0.5)"
                }
            }
        }
    ];

    const handleCopy = (id: string, config: any) => {
        navigator.clipboard.writeText(JSON.stringify(config, null, 2));
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="flex flex-col h-full bg-[#080809] text-white/90 p-5 overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="mb-8">
                <div className="text-xs font-black tracking-widest uppercase mb-1">
                    Templates & <span className="text-[var(--theme-primary)]">Manifest</span>
                </div>
                <p className="text-[8px] text-white/30 font-medium uppercase tracking-[0.2em]">
                    Integração Host
                </p>
            </div>

            {/* Quick Guide - Stacked for Sidebar */}
            <div className="flex flex-col gap-4 mb-8">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-3 text-[var(--theme-primary)]">
                        <Terminal size={14} />
                        <div className="text-[9px] font-black uppercase tracking-widest">Guia Rápido</div>
                    </div>
                    <ul className="space-y-2">
                        {[
                            'Copie o JSON abaixo.',
                            'Passe para o DesignProvider.',
                            'Use a classe .sarak-design-scope.'
                        ].map((item, i) => (
                            <li key={i} className="flex gap-2 text-[9px] text-white/40 font-medium">
                                <span className="text-[var(--theme-primary)] font-black">{i + 1}.</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Template Grid - Single Column */}
            <div className="flex flex-col gap-4">
                {templates.map((template) => (
                    <div key={template.id} className="group bg-white/[0.02] border border-white/5 hover:border-white/10 p-5 rounded-2xl transition-all">
                        <div className="flex flex-col gap-3 mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <FileJson size={12} className="text-[var(--theme-primary)]" />
                                    <div className="text-[10px] font-black uppercase tracking-tight">{template.name}</div>
                                </div>
                                <p className="text-[9px] text-white/30">{template.description}</p>
                            </div>
                            <button 
                                onClick={() => handleCopy(template.id, template.config)}
                                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                    copiedId === template.id 
                                    ? 'bg-emerald-500 text-white' 
                                    : 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white'
                                }`}
                            >
                                {copiedId === template.id ? <Check size={10} /> : <Copy size={10} />}
                                {copiedId === template.id ? 'Copiado!' : 'Copiar JSON'}
                            </button>
                        </div>

                        <div className="relative">
                            <pre className="bg-black/40 rounded-xl p-4 text-[8px] font-mono text-white/20 overflow-x-auto border border-white/5 max-h-[120px] custom-scrollbar">
                                {JSON.stringify(template.config, null, 2)}
                            </pre>
                        </div>
                    </div>
                ))}
            </div>

            {/* External Links */}
            <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <a href="#" className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-[var(--theme-primary)] transition-all">
                        <Code size={10} /> Docs
                    </a>
                    <a href="#" className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-[var(--theme-primary)] transition-all">
                        <ExternalLink size={10} /> GitHub
                    </a>
                </div>
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/10">Sarak v13.0</span>
            </div>
        </div>
    );
};
