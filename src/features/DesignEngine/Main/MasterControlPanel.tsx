import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Filter, RotateCcw, Save, Check, AlertCircle, 
    ChevronRight, ChevronDown, Layers, Palette, Layout, Type
} from 'lucide-react';
import { MASTER_DESIGN_MAP } from '../../../core/Design/master-map';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { useDesignDraft } from '../hooks/useDesignDraft';

/**
 * MasterControlPanel (v13.0) - A Planilha Mestra do Sarak UI
 * 
 * Uma interface centralizada de 100% de cobertura que exibe todos os tokens 
 * em formato de catálogo/planilha para auditoria e configuração em massa.
 */
export const MasterControlPanel: React.FC = () => {
    const sarak = useSarakUI();
    const { draft, updateDraft, handleApplyToSystem, isPillarDirty, resetToken } = useDesignDraft(sarak);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // 1. Processamento de Dados (Planilha)
    const allTokens = useMemo(() => {
        const tokens: any[] = [];
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
        <div className="flex flex-col h-full bg-[#080809] text-white/90">
            {/* Header de Gestão */}
            <div className="p-8 border-b border-white/5 bg-black/20">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter uppercase mb-1">
                            Painel de Controle <span className="text-[var(--theme-primary)]">Sarak</span>
                        </h1>
                        <p className="text-xs text-white/40 font-medium uppercase tracking-[0.2em]">Auditoria de 100% dos Ativos de Design</p>
                    </div>
                    
                    <button 
                        onClick={handleApplyToSystem}
                        className="flex items-center gap-3 px-8 py-4 bg-[var(--theme-primary)] text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_10px_30px_rgba(var(--theme-primary-rgb),0.3)] hover:scale-105 active:scale-95 transition-all"
                    >
                        <Save size={14} />
                        <span>Aplicar Mudanças ao Sistema</span>
                    </button>
                </div>

                {/* Filtros */}
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                        <input 
                            type="text" 
                            placeholder="BUSCAR TOKEN OU VARIÁVEL..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-xs font-bold tracking-widest uppercase focus:outline-none focus:border-[var(--theme-primary)]/50 transition-all"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                        <button 
                            onClick={() => setActiveCategory(null)}
                            className={`px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${!activeCategory ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/5 text-white/30 hover:bg-white/5'}`}
                        >
                            Todos
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeCategory === cat.id ? 'bg-white/10 border-white/20 text-white shadow-xl' : 'bg-transparent border-white/5 text-white/30 hover:bg-white/5'}`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* A Tabela / Planilha */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="w-full border border-white/5 rounded-3xl overflow-hidden bg-white/[0.01]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/30 w-1/4">Token / Identificador</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/30 w-1/4">Categoria</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/30 w-1/4">Valor Atual</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/30 w-[100px] text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTokens.map((token, idx) => (
                                <tr key={token.id} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${idx % 2 === 0 ? 'bg-black/10' : 'bg-transparent'}`}>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-black uppercase tracking-tight">{token.label}</span>
                                            <code className="text-[9px] text-white/20 font-mono tracking-tighter">{token.id}</code>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                                            <Layers size={10} className="text-white/20" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{token.pilarName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            {/* Editor Dinâmico baseado no Tipo */}
                                            {token.type === 'color' && (
                                                <div className="flex items-center gap-3">
                                                    <div 
                                                        className="w-8 h-8 rounded-lg border border-white/10 shadow-lg" 
                                                        style={{ backgroundColor: draft[token.id] || token.defaultValue }} 
                                                    />
                                                    <input 
                                                        type="text" 
                                                        value={draft[token.id] || token.defaultValue} 
                                                        onChange={(e) => updateDraft(token.id, e.target.value)}
                                                        className="bg-transparent border-none text-[10px] font-mono text-white/60 focus:outline-none w-24"
                                                    />
                                                </div>
                                            )}
                                            {token.type === 'slider' && (
                                                <div className="flex items-center gap-4 flex-1 max-w-[200px]">
                                                    <input 
                                                        type="range" 
                                                        min={token.constraints?.min ?? 0}
                                                        max={token.constraints?.max ?? 100}
                                                        step={token.constraints?.step ?? 1}
                                                        value={draft[token.id] ?? token.defaultValue}
                                                        onChange={(e) => updateDraft(token.id, Number(e.target.value))}
                                                        className="flex-1 accent-[var(--theme-primary)] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                                    />
                                                    <span className="text-[10px] font-black text-white/40 w-12 text-right">
                                                        {draft[token.id] ?? token.defaultValue}{token.unit || ''}
                                                    </span>
                                                </div>
                                            )}
                                            {token.type === 'select' && (
                                                <select 
                                                    value={draft[token.id] ?? token.defaultValue}
                                                    onChange={(e) => updateDraft(token.id, e.target.value)}
                                                    className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-[10px] font-black uppercase tracking-widest focus:outline-none"
                                                >
                                                    {token.constraints?.options?.map((opt: any) => (
                                                        <option key={opt.id} value={opt.id} className="bg-[#111]">{opt.label}</option>
                                                    ))}
                                                </select>
                                            )}
                                            {(token.type === 'text' || token.type === 'string') && (
                                                <input 
                                                    type="text" 
                                                    value={draft[token.id] ?? token.defaultValue}
                                                    onChange={(e) => updateDraft(token.id, e.target.value)}
                                                    className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-[10px] font-bold focus:outline-none w-full max-w-[150px]"
                                                />
                                            )}
                                            {token.type === 'boolean' && (
                                                <button 
                                                    onClick={() => updateDraft(token.id, !draft[token.id])}
                                                    className={`w-10 h-5 rounded-full relative transition-all ${draft[token.id] ? 'bg-[var(--theme-primary)]' : 'bg-white/10'}`}
                                                >
                                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${draft[token.id] ? 'left-6' : 'left-1'}`} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button 
                                            onClick={() => resetToken(token.id)}
                                            title="Resetar para o padrão do sistema"
                                            className="p-3 rounded-xl hover:bg-white/5 text-white/20 hover:text-white transition-all"
                                        >
                                            <RotateCcw size={14} />
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
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}} />
        </div>
    );
};
