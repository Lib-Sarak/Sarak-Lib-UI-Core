import React, { useState } from 'react';
import { useSarak, LANGUAGES } from '@sarak/lib-shared';
import { Globe, Languages, Check, X, Search, Info, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LanguageTab: React.FC = () => {
    const { 
        language, setLanguage, 
        enabledLanguages, setEnabledLanguages,
        availableLanguages = LANGUAGES 
    } = useSarak();

    const [searchQuery, setSearchQuery] = useState("");

    const filteredLanguages = (availableLanguages || []).filter(lang => {
        if (!lang) return false;
        const name = (lang?.name || lang?.label || lang?.id || '').toString().toLowerCase();
        const query = (searchQuery || '').toLowerCase();
        return name.includes(query);
    });


    const toggleLanguage = (langId: string) => {
        if (enabledLanguages.includes(langId)) {
            if (enabledLanguages.length > 1) {
                setEnabledLanguages(enabledLanguages.filter((id: string) => id !== langId));
            }
        } else {
            if (enabledLanguages.length < 8) {
                setEnabledLanguages([...enabledLanguages, langId]);
            }
        }
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 overflow-hidden">
            {/* Header / Info */}
            <div className="p-8 pb-4 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="text-sm font-black uppercase tracking-widest text-white/90 italic">Motor de Localização</h3>
                        <p className="text-[10px] text-white/30 uppercase font-black tracking-tighter">Gerencie idiomas ativos e slots de tradução</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Lingua Principal */}
                    <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 space-y-4">
                        <div className="flex items-center gap-3">
                            <Globe className="w-4 h-4 text-blue-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Idioma do Sistema</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/5">
                            <span className="text-xs font-bold uppercase tracking-widest text-white/80">
                                {availableLanguages.find(l => l.id === language)?.name || language}
                            </span>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[8px] font-black text-emerald-400 uppercase">Ativo</span>
                            </div>
                        </div>
                    </div>

                    {/* Slots Ativos */}
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                        <div className="flex items-center gap-3">
                            <Languages className="w-4 h-4 text-white/40" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Slots de Tradução ({enabledLanguages.length}/8)</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            {enabledLanguages.map((id: string) => (
                                <div key={id} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/60 flex items-center gap-2">
                                    {id}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* List / Selection */}
            <div className="flex-grow overflow-hidden flex flex-col p-8 pt-0">
                <div className="flex items-center gap-4 mb-4 bg-white/5 border border-white/5 px-4 py-3 rounded-2xl group focus-within:border-blue-500/50 transition-all">
                    <Search className="w-4 h-4 text-white/20 group-focus-within:text-blue-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar idiomas..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-xs text-white/70 w-full placeholder:text-white/10 uppercase font-black tracking-widest"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto custom-scrollbar pr-2 pb-8">
                    {filteredLanguages.map((lang) => {
                        const isActive = language === lang.id;
                        const isEnabled = enabledLanguages.includes(lang.id);

                        return (
                            <div key={lang.id} className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col gap-4 group/lang ${isActive ? 'bg-blue-600/20 border-blue-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold uppercase tracking-widest text-white/80">{lang.name}</span>
                                        <span className="text-[9px] text-white/20 font-black uppercase italic">{lang.id}</span>
                                    </div>
                                    {isActive && <Check className="w-4 h-4 text-blue-400" />}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setLanguage(lang.id)}
                                        disabled={isActive}
                                        className={`flex-grow py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-white/20 hover:bg-blue-500 hover:text-white border border-transparent'}`}
                                    >
                                        Selecionar
                                    </button>
                                    
                                    <button
                                        onClick={() => toggleLanguage(lang.id)}
                                        className={`p-2 rounded-xl border transition-all ${isEnabled ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/5 text-white/10 hover:border-white/20'}`}
                                    >
                                        <Plus className={`w-3.5 h-3.5 transition-transform duration-300 ${isEnabled ? 'rotate-45 text-rose-400' : ''}`} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-black/40 flex items-center justify-center gap-4">
                <Info className="w-3.5 h-3.5 text-white/20" />
                <p className="text-[9px] text-white/20 uppercase font-black tracking-widest">
                    O Sarak OS sincroniza as traduções em tempo real entre todos os módulos ativos.
                </p>
            </div>
        </div>
    );
};

export default LanguageTab;
