import React, { useState } from 'react';
import { Palette, Layout, Globe, Settings } from 'lucide-react';
import { ThemeCustomizationTab } from './ThemeCustomization/ThemeCustomizationTab';
import LanguageSettingsModal from './LanguageSettingsModal';
import { useSarak } from '@sarak/lib-shared';

type TabId = 'themes' | 'layout' | 'language' | 'advanced';

export const CustomizationPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabId>('themes');
    const { isLanguageModalOpen, setIsLanguageModalOpen } = useSarak();

    const tabs = [
        { id: 'themes', label: 'Temas & Estética', icon: Palette },
        { id: 'layout', label: 'Estrutura & Layout', icon: Layout },
        { id: 'language', label: 'Idioma & Tradução', icon: Globe },
        { id: 'advanced', label: 'Engine & SDT', icon: Settings },
    ];

    return (
        <div className="flex flex-col h-full max-h-[85vh] animate-in fade-in zoom-in duration-500 overflow-hidden">
            {/* Header & Tabs */}
            <div className="p-8 pb-4 shrink-0">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 mb-6 uppercase tracking-tighter">
                    Central de Customização
                </h2>
                
                <div className="flex gap-2 border-b border-white/5 pb-px">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id as TabId);
                                    if (tab.id === 'language') setIsLanguageModalOpen(true);
                                }}
                                className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all duration-300 ${activeTab === tab.id 
                                    ? 'border-blue-500 text-blue-400 bg-blue-500/5' 
                                    : 'border-transparent text-white/40 hover:text-white/60 hover:bg-white/5'}`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-grow overflow-hidden p-8 pt-0">
                <div className="h-full bg-black/20 rounded-3xl border border-white/5 overflow-hidden flex flex-col">
                    {activeTab === 'themes' && <ThemeCustomizationTab />}
                    {activeTab === 'layout' && (
                        <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                            <Layout className="w-12 h-12 text-white/10" />
                            <h3 className="text-lg font-bold">Configurações de Layout</h3>
                            <p className="text-white/40 max-w-md">Em breve: Personalização avançada de Sidebars, Topbars e grids dinâmicos.</p>
                        </div>
                    )}
                    {activeTab === 'language' && (
                        <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                            <Globe className="w-12 h-12 text-white/10" />
                            <h3 className="text-lg font-bold">Idioma & Tradução</h3>
                            <p className="text-white/40 max-w-md">O modal de idiomas está aberto para configuração.</p>
                            <button 
                                onClick={() => setIsLanguageModalOpen(true)}
                                className="px-6 py-2 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg"
                            >
                                Abrir Modal de Idiomas
                            </button>
                        </div>
                    )}
                    {activeTab === 'advanced' && (
                        <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                            <Settings className="w-12 h-12 text-white/10" />
                            <h3 className="text-lg font-bold">Engine & SDT</h3>
                            <p className="text-white/40 max-w-md">Versão atual: Sovereign Design Token (SDT) v1.0. Gerencie os parâmetros base do motor aqui.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Language Modal (Portal) */}
            {isLanguageModalOpen && <LanguageSettingsModal isOpen={isLanguageModalOpen} onClose={() => setIsLanguageModalOpen(false)} />}
        </div>
    );
};

export default CustomizationPanel;
