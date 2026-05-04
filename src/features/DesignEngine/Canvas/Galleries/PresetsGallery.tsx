import React from 'react';
import { motion } from 'framer-motion';
import { GalleryItem } from './GalleryItem';
import { THEME_EFFECTS } from '../../../../constants/design-tokens';
import { UIContext } from '../../../../core/Provider/SarakUIProvider';
import { MockDashboard, MockChat, MockLogs, MockSettings, MockComponents, MockTypography } from '../MockApps';
import { DesignScope } from '../../../../core/Design/components/DesignScope';
import { PRESETS_LIBRARY, GLOBAL_THEMES } from '../../../../core/Design/presets';

interface PresetsGalleryProps {
    tokens: any;
    onUpdateDraft: (key: string, value: any) => void;
    activePreviewApp?: string;
    customThemes?: any[];
}

const PresetSpecimen: React.FC<{ 
    preset: any, 
    activeApp: string 
}> = ({ preset, activeApp }) => {
    
    // Create an isolated context value for the preset preview
    const presetContextValue = React.useMemo(() => ({
        design: preset,
        ...preset,
        isHydrated: true,
        applyConfig: () => {},
        applyFullConfig: () => {},
        registeredModules: [],
        layouts: []
    }), [preset]);

    // Determine which mock to show
    const renderMock = () => {
        const props = { 
            tokens: preset, 
            config: {}, 
            animationVariants: THEME_EFFECTS.page, 
            animationStyle: 'none' 
        };
        
        switch (activeApp) {
            case 'chat': return <MockChat {...props} />;
            case 'logs': return <MockLogs {...props} />;
            case 'settings': return <MockSettings {...props} />;
            case 'components': return <MockComponents tokens={preset} />;
            case 'typography': return <MockTypography tokens={preset} />;
            default: return <MockDashboard {...props} />;
        }
    };

    return (
        <DesignScope design={preset} className="w-full aspect-video relative overflow-hidden bg-[var(--theme-bg)] transition-all duration-500">
            {/* Content Area Scaled Down - Optimized Aspect Ratio */}
            <div className="absolute inset-0 origin-top-left overflow-hidden z-10" style={{ transform: 'scale(0.3335)', width: '300%', height: '300%' }}>
                {/* Isolated Context for correct token propagation */}
                <UIContext.Provider value={presetContextValue as any}>
                    {/* Shell Simulation */}
                    <div className="flex h-full w-full">
                        {preset.navigationStyle === 'sidebar' && (
                            <aside className="w-[180px] bg-[var(--theme-card)] border-r border-[var(--theme-border)] p-8 flex flex-col gap-6 shrink-0 backdrop-blur-md">
                                <div className="w-10 h-10 rounded-xl bg-[var(--theme-primary)] shadow-lg shadow-[var(--theme-primary)]/20 mb-8" />
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="w-full h-4 rounded-lg bg-[var(--theme-muted)]/10" />
                                ))}
                            </aside>
                        )}
                        <main className="flex-1 p-12 overflow-hidden">
                            {renderMock()}
                        </main>
                    </div>
                </UIContext.Provider>
            </div>
        </DesignScope>
    );
};

export const PresetsGallery: React.FC<PresetsGalleryProps> = ({ tokens, onUpdateDraft, activePreviewApp = 'dashboard' }) => {
    
    const handleSelect = (id: string) => {
        const theme = GLOBAL_THEMES.find((t: any) => t.id === id);
        if (!theme) return;

        // Apply all tokens from the theme
        Object.entries(theme.tokens).forEach(([key, val]) => {
             onUpdateDraft(key, val);
        });
        
        // Mark the current layout ID
        onUpdateDraft('layout', id);
    };

    const themeEntries = GLOBAL_THEMES;
    
    // Split themes into categories if needed, for now all together
    const premiumThemes = themeEntries.filter((t: any) => t.id === 'quantum');
    const essentialThemes = themeEntries.filter((t: any) => t.id !== 'quantum');

    const renderGrid = (themes: any[]) => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {themes.map((theme) => (
                <GalleryItem 
                    key={theme.id}
                    title={theme.name}
                    description={theme.description}
                    isActive={tokens.layout === theme.id}
                    onClick={() => handleSelect(theme.id)}
                >
                    <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/5 bg-[#0a0a0a]">
                        <PresetSpecimen 
                            preset={theme.tokens} 
                            activeApp={activePreviewApp} 
                        />
                    </div>
                </GalleryItem>
            ))}
        </div>
    );

    return (
        <div className="flex flex-col gap-20 p-10 overflow-y-auto custom-scrollbar h-full bg-[#050505]">
            {/* Premium Section */}
            {premiumThemes.length > 0 && (
                <div className="space-y-8">
                    <div className="flex items-center gap-4 px-2">
                        <span className="text-xs font-black uppercase tracking-[0.4em] text-white/20 italic">Quantum & High Performance Models</span>
                        <div className="flex-1 h-[1px] bg-white/5" />
                    </div>
                    {renderGrid(premiumThemes)}
                </div>
            )}

            {/* Essential Section */}
            {essentialThemes.length > 0 && (
                <div className="space-y-8">
                    <div className="flex items-center gap-4 px-2">
                        <span className="text-xs font-black uppercase tracking-[0.4em] text-white/20 italic">Sovereign Industrial Models</span>
                        <div className="flex-1 h-[1px] bg-white/5" />
                    </div>
                    {renderGrid(essentialThemes)}
                </div>
            )}
        </div>
    );
};
