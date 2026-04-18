import React from 'react';
import { useSarak } from '../shared/contexts/SarakContext';
import { LAYOUTS } from '../constants/design-tokens';
import { Palette, ChevronRight, Check } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
    const { layout: theme, setLayout: setTheme } = useSarak();
    
    // Converte o objeto LAYOUTS em array para o seletor
    const layoutOptions = Object.values(LAYOUTS);

    
    const currentLayoutName = layoutOptions.find(l => l.id === theme)?.name || 'Default';

    return (
        <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                <Palette className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-medium text-white/70">{currentLayoutName}</span>
                <ChevronRight className="w-3 h-3 text-white/30 group-hover:rotate-90 transition-transform" />
            </button>
            
            {/* Dropdown de Temas */}
            <div className="absolute right-0 top-full mt-2 w-64 max-h-[400px] overflow-y-auto bg-[#0f0f11] border border-white/10 rounded-xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-[100] p-2 custom-scrollbar">
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 py-2 border-b border-white/5 mb-1">
                    Layouts Premium Matrix
                </div>
                {layoutOptions.map((layout) => (
                    <button
                        key={layout.id}
                        onClick={() => setTheme(layout.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                            theme === layout.id 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                        <div className="flex flex-col items-start">
                            <span>{layout.name}</span>
                            <span className="text-[10px] opacity-40 capitalize">{layout.class.replace('layout-', '')} • {layout.animation}</span>
                        </div>
                        {theme === layout.id && <Check className="w-4 h-4" />}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ThemeToggle;
