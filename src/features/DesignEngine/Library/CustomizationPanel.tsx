import React, { useState } from 'react';
import { Palette, Layout, Globe, Settings, Keyboard, Zap, Box } from 'lucide-react';
import { ThemeCustomizationTab } from '../Main/ThemeCustomizationTab';
import { LayoutTab } from '../Panels/LayoutTab';
import { LanguageTab } from '../Panels/LanguageTab';
import { ShortcutsTab } from '../Panels/ShortcutsTab';
import { AdvancedTab } from '../Panels/AdvancedTab';
import { EngineCustomizationTab } from '../Panels/EngineCustomizationTab';
import { HyperGranularityTab } from '../Panels/HyperGranularityTab';

type TabId = 'sovereignty' | 'engines' | 'language' | 'shortcuts' | 'advanced';

/**
 * CustomizationPanel (v6.0)
 * Central de Comando Unificada - Foco 100% em Soberania e Gêmeo Digital.
 */
export const CustomizationPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabId>('sovereignty');

    const tabs = [
        { id: 'sovereignty', label: 'Soberania de Design', icon: Box },
        { id: 'engines', label: 'Motores Específicos', icon: Zap },
        { id: 'language', label: 'Idioma & Tradução', icon: Globe },
        { id: 'shortcuts', label: 'Atalhos do Sistema', icon: Keyboard },
        { id: 'advanced', label: 'Motor & Descoberta', icon: Settings },
    ];

    return (
        <div className="flex flex-col h-full animate-in fade-in zoom-in duration-500 overflow-hidden">
            {/* Header & Tabs Navigation */}
            <div className="p-8 pb-4 shrink-0">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 uppercase tracking-tighter">
                        Central de Comando
                    </h2>
                    <div className="flex gap-2">
                        <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-[10px] font-black text-red-400 uppercase tracking-widest animate-pulse">
                            v13.9 - AUDIT ACTIVE
                        </div>
                        <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                            v12.0 Sovereign
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-2 border-b border-white/5 pb-2 overflow-x-auto custom-scrollbar-horizontal scroll-smooth">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all duration-300 whitespace-nowrap ${isActive 
                                    ? 'border-blue-500 text-blue-400 bg-blue-500/5' 
                                    : 'border-transparent text-white/40 hover:text-white/60 hover:bg-white/5'}`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                                <span className="text-2xs font-black uppercase tracking-widest">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Sub-Components Viewport (No outer scroll, let children manage) */}
            <div className="flex-grow p-8 pt-0 overflow-hidden">
                <div className="h-full bg-black/20 rounded-3xl border border-white/5 flex flex-col backdrop-blur-sm shadow-2xl overflow-hidden">
                    {activeTab === 'sovereignty' && <ThemeCustomizationTab />}
                    {activeTab === 'engines' && <EngineCustomizationTab />}
                    {activeTab === 'language' && <LanguageTab />}
                    {activeTab === 'shortcuts' && <ShortcutsTab />}
                    {activeTab === 'advanced' && <AdvancedTab />}
                </div>
            </div>
        </div>
    );
};

export default CustomizationPanel;

