import React, { useState } from 'react';
import { Palette, Layout, Globe, Settings, Keyboard, Zap } from 'lucide-react';
import { ThemeCustomizationTab } from '../Main/ThemeCustomizationTab';
import { LayoutTab } from '../Panels/LayoutTab';
import { LanguageTab } from '../Panels/LanguageTab';
import { ShortcutsTab } from '../Panels/ShortcutsTab';
import { AdvancedTab } from '../Panels/AdvancedTab';
import { EngineCustomizationTab } from '../Panels/EngineCustomizationTab';

type TabId = 'themes' | 'layout' | 'engines' | 'language' | 'shortcuts' | 'advanced';

/**
 * CustomizationPanel (v5.4)
 * Single resilient and self-adjusting configuration center.
 */
export const CustomizationPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabId>('themes');

    const tabs = [
        { id: 'themes', label: 'Themes & Aesthetics', icon: Palette },
        { id: 'layout', label: 'Structure & Layout', icon: Layout },
        { id: 'engines', label: 'Advanced Engines', icon: Zap },
        { id: 'language', label: 'Language & Translation', icon: Globe },
        { id: 'shortcuts', label: 'System Shortcuts', icon: Keyboard },
        { id: 'advanced', label: 'Engine & Discovery', icon: Settings },
    ];

    return (
        <div className="flex flex-col h-full animate-in fade-in zoom-in duration-500 overflow-hidden">
            {/* Header & Tabs Navigation */}
            <div className="p-8 pb-4 shrink-0">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 mb-6 uppercase tracking-tighter">
                    Customization Center
                </h2>
                
                <div className="flex gap-2 border-b border-white/5 pb-px overflow-x-auto no-scrollbar scroll-smooth">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabId)}
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

            {/* Sub-Components Viewport (With Resilient Scroll) */}
            <div className="flex-grow overflow-y-auto custom-scrollbar p-8 pt-0">
                <div className="min-h-full bg-black/20 rounded-3xl border border-white/5 flex flex-col backdrop-blur-sm shadow-2xl overflow-hidden">
                    {activeTab === 'themes' && <ThemeCustomizationTab />}
                    {activeTab === 'layout' && <LayoutTab />}
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

