import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Filter, RotateCcw, Save, Check, AlertCircle, 
    ChevronRight, ChevronDown, Layers, Palette, Layout, Type
} from 'lucide-react';
import { MASTER_DESIGN_MAP } from '../../../core/Design/master-map';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { useDesignDraft } from '../hooks/useDesignDraft';
import { SarakInput } from '../../../components/atomic/Inputs';

import { SarakTokenValue, DesignToken } from '../../../core/Design/types';

/**
 * MasterControlPanel (v13.0) - A Planilha Mestra do Sarak UI
 * 
 * Uma interface centralizada de 100% de cobertura que exibe todos os tokens 
 * em formato de catálogo/planilha para auditoria e configuração em massa.
 */
export const MasterControlPanel: React.FC = () => {
    const sarak = useSarakUI();
    const { draft, isDirty, isComponentDirty, updateDraft, handleApplyToSystem, resetToken } = useDesignDraft(sarak);
    const draftRecord = draft as Record<string, SarakTokenValue>;
    
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // 1. Processamento de Dados (Planilha)
    const allTokens = useMemo(() => {
        const tokens: (DesignToken & { pilarName: string, pilarId: string })[] = [];
        MASTER_DESIGN_MAP.components.forEach(comp => {
            comp.tokens.forEach(token => {
                tokens.push({
                    ...token,
                    pilarName: comp.label,
                    pilarId: comp.id
                });
            });
        });
        return tokens;
    }, []);

    // 2. Filtros e Busca
    const filteredTokens = useMemo(() => {
        return allTokens.filter(t => {
            const matchesSearch = t.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 t.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory ? t.pilarId === activeCategory : true;
            return matchesSearch && matchesCategory;
        });
    }, [allTokens, searchQuery, activeCategory]);

    const categories = useMemo(() => {
        return MASTER_DESIGN_MAP.components.map(c => ({ id: c.id, label: c.label }));
    }, []);

    return (
        <div className="flex flex-col h-full bg-[var(--color-theme-card,#1e293b)] text-white/90">
            {/* Header de Gestão - Compacto para Sidebar */}
            <div className="p-4 border-b border-white/5 bg-black/40">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-[var(--sarak-type-scale2xs,10px)] font-black tracking-widest uppercase text-white/30">
                        Catálogo de <span className="text-[var(--theme-primary)]">Tokens</span>
                    </div>
                </div>

                {/* Filtros Compactos */}
                <div className="flex flex-col gap-3">
                    <div className="mb-2">
                        <SarakInput 
                            placeholder="BUSCAR..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            leftIcon={<Search className="w-4 h-4" />}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        <button 
                            onClick={() => setActiveCategory(null)}
                            className={`px-3 py-2 rounded-lg text-[var(--sarak-type-scale-tiny,8px)] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${!activeCategory ? 'bg-white/10 border-white/10 text-white' : 'bg-transparent border-white/5 text-white/20 hover:bg-white/5'}`}
                        >
                            Todos
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-3 py-2 rounded-lg text-[var(--sarak-type-scale-tiny,8px)] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeCategory === cat.id ? 'bg-white/10 border-white/10 text-white' : 'bg-transparent border-white/5 text-white/20 hover:bg-white/5'}`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* A Tabela / Planilha - Otimizada para Sidebar */}
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                <div className="w-full border border-white/5 rounded-xl overflow-hidden bg-white/[0.01]">
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="px-3 py-3 text-[var(--sarak-type-scale-tiny,8px)] font-black uppercase tracking-widest text-white/20 w-[45%]">Token</th>
                                <th className="px-3 py-3 text-[var(--sarak-type-scale-tiny,8px)] font-black uppercase tracking-widest text-white/20 w-[40%]">Valor</th>
                                <th className="px-3 py-3 text-[var(--sarak-type-scale-tiny,8px)] font-black uppercase tracking-widest text-white/20 w-[15%] text-right"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTokens.map((token, idx) => (
                                <tr key={token.id} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${idx % 2 === 0 ? 'bg-black/10' : 'bg-transparent'}`}>
                                    <td className="px-3 py-3 overflow-hidden">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[var(--sarak-type-scale3xs,9px)] font-black uppercase tracking-tight truncate">{token.label}</span>
                                            <code className="text-[var(--sarak-type-scale-micro,7px)] text-white/10 font-mono tracking-tighter truncate">{token.id}</code>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3">
                                        <div className="flex items-center gap-2">
                                            {/* Editor Dinâmico baseado no Tipo - Versão Ultra Compacta */}
                                            {token.type === 'color' && (
                                                <div className="flex items-center gap-2 flex-1">
                                                    <div 
                                                        className="w-5 h-5 shrink-0 rounded border border-white/10" 
                                                        style={{ backgroundColor: String(draftRecord[token.id] || token.defaultValue) }} 
                                                    />
                                                    <input 
                                                        type="text" 
                                                        value={String(draftRecord[token.id] || token.defaultValue)} 
                                                        onChange={(e) => updateDraft(token.id, e.target.value)}
                                                        className="bg-transparent border-none text-[var(--sarak-type-scale-tiny,8px)] font-mono text-white/40 focus:outline-none w-full"
                                                    />
                                                </div>
                                            )}
                                            {token.type === 'slider' && (
                                                <div className="flex items-center gap-2 flex-1">
                                                    <input 
                                                        type="range" 
                                                        min={token.constraints?.min ?? 0}
                                                        max={token.constraints?.max ?? 100}
                                                        step={token.constraints?.step ?? 1}
                                                        value={Number(draftRecord[token.id] ?? token.defaultValue)}
                                                        onChange={(e) => updateDraft(token.id, Number(e.target.value))}
                                                        className="flex-1 accent-[var(--theme-primary)] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                                    />
                                                    <span className="text-[var(--sarak-type-scale-tiny,8px)] font-black text-white/20 w-6 text-right">
                                                        {String(draftRecord[token.id] ?? token.defaultValue)}
                                                    </span>
                                                </div>
                                            )}
                                            {token.type === 'select' && (
                                                <select 
                                                    value={String(draftRecord[token.id] ?? token.defaultValue)}
                                                    onChange={(e) => updateDraft(token.id, e.target.value)}
                                                    className="bg-white/5 border border-white/10 rounded-md py-1 px-2 text-[var(--sarak-type-scale-tiny,8px)] font-black uppercase tracking-widest focus:outline-none w-full"
                                                >
                                                    {(token.constraints?.options || token.options || []).map((opt: { id?: string; value?: string; label?: string; name?: string } | string) => {
                                                        const optId = typeof opt === 'object' ? (opt.id !== undefined ? opt.id : (opt.value !== undefined ? opt.value : '')) : opt;
                                                        const optLabel = typeof opt === 'object' ? (opt.label || opt.name || optId) : opt;
                                                        return (
                                                            <option key={optId} value={optId} className="bg-[var(--color-theme-card, #1e293b)]">{optLabel}</option>
                                                        );
                                                    })}
                                                </select>
                                            )}
                                            {(token.type === 'text' || token.type === 'string') && (
                                                <input 
                                                    type="text" 
                                                    value={String(draftRecord[token.id] ?? token.defaultValue)}
                                                    onChange={(e) => updateDraft(token.id, e.target.value)}
                                                    className="bg-white/5 border border-white/10 rounded-md py-1 px-2 text-[var(--sarak-type-scale-tiny,8px)] font-bold focus:outline-none w-full"
                                                />
                                            )}
                                            {token.type === 'boolean' && (
                                                <button 
                                                    onClick={() => updateDraft(token.id, !draftRecord[token.id])}
                                                    className={`w-10 h-5 rounded-full relative transition-all ${draftRecord[token.id] ? 'bg-[var(--theme-primary)]' : 'bg-white/10'}`}
                                                >
                                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${draftRecord[token.id] ? 'left-6' : 'left-1'}`} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 text-right">
                                        <button 
                                            onClick={() => resetToken(token.id)}
                                            title="Reset"
                                            className="p-2 rounded-lg hover:bg-white/5 text-white/10 hover:text-white transition-all"
                                        >
                                            <RotateCcw size={10} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: var(--sarak-scroll-width, 6px);
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: var(--sarak-scroll-radius, 10px);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}} />
        </div>
    );
};
