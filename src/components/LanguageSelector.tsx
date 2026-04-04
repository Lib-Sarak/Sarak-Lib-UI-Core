import React from 'react';
import { useSarak, LANGUAGES } from '@sarak/lib-shared';
import { Globe, Check, ChevronDown } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
    const { language, setLanguage } = useSarak();
    
    const currentLang = LANGUAGES.find(l => l.id === language) || LANGUAGES[0];

    return (
        <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-white/70 uppercase">{currentLang.sigla}</span>
                <ChevronDown className="w-3 h-3 text-white/30 group-hover:rotate-180 transition-transform" />
            </button>
            
            {/* Dropdown de Idiomas */}
            <div className="absolute right-0 top-full mt-2 w-56 max-h-[400px] overflow-y-auto bg-[#0f0f11] border border-white/10 rounded-xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-[100] p-2 custom-scrollbar">
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 py-2 border-b border-white/5 mb-1">
                    Tradução Matrix AI
                </div>
                {LANGUAGES.map((lang) => (
                    <button
                        key={lang.id}
                        onClick={() => setLanguage(lang.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                            language === lang.id 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                        </div>
                        {language === lang.id && <Check className="w-3 h-3" />}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LanguageSelector;
