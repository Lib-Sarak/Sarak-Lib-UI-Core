import React from 'react';
import { motion } from 'framer-motion';
import { GalleryItem } from './GalleryItem';
import { THEME_EFFECTS } from '../../../../constants/design-tokens';
import { LAYOUTS, BASE_PRESETS } from '../../../../constants/theme-models';
import { DESIGN_MANIFEST, UIContext } from '../../../../core/Provider/SarakUIProvider';
import { MockDashboard, MockChat, MockLogs, MockSettings, MockComponents, MockTypography } from '../MockApps';

interface PresetsGalleryProps {
    tokens: any;
    onUpdateDraft: (key: string, value: any) => void;
    activePreviewApp?: string;
}

// --- CSS SANDBOX HELPER ---
const getPresetVariables = (presetTokens: any) => {
    const vars: any = {};
    
    Object.entries(presetTokens).forEach(([key, value]) => {
        const config = (DESIGN_MANIFEST as any)[key];
        if (config) {
            const transformedValue = config.transform ? config.transform(value) : value;
            const isObject = typeof transformedValue === 'object' && transformedValue !== null;
            
            if (config.vars) {
                config.vars.forEach((varName: string) => {
                    if (isObject) {
                        Object.entries(transformedValue).forEach(([subKey, subVal]) => {
                            if (subKey === 'main') vars[varName] = subVal;
                            else if (subKey === 'factor') vars['--font-size-factor'] = subVal;
                            else if (subKey === 'rgb') vars['--theme-primary-rgb'] = subVal;
                            else if (subKey === 'hover') vars['--theme-primary-hover'] = subVal;
                            else if (subKey === 'active') vars['--theme-primary-active'] = subVal;
                            else if (subKey === 'focus') vars['--theme-primary-focus'] = subVal;
                            else if (subKey === 'gap') vars['--theme-gap-scaled'] = subVal;
                            else if (subKey === 'pad') vars['--theme-pad-scaled'] = subVal;
                            else if (subKey === 'margin') vars['--theme-margin-scaled'] = subVal;
                            else if (subKey === 'radius') vars['--theme-radius-scaled'] = subVal;
                            else if (subKey === 'base' && key === 'fluidScaling') vars['--theme-font-size-base'] = subVal;
                            else if (subKey === 'px' && key === 'fontScale') vars[varName] = subVal;
                            else vars[`${varName}-${subKey}`] = subVal;
                        });
                    } else {
                        vars[varName] = `${transformedValue}${config.unit || ''}`;
                    }
                });
            }
        }
    });

    // Theme Derived Fallbacks
    const isLight = presetTokens.mode === 'light';
    vars['--theme-bg'] = isLight ? '#f1f5f9' : '#020617';
    vars['--theme-card'] = isLight ? 'rgba(255,255,255,0.7)' : 'rgba(30,41,59,0.7)';
    vars['--theme-border'] = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)';
    vars['--theme-title'] = isLight ? '#0f172a' : '#f8fafc';
    vars['--theme-main'] = isLight ? '#475569' : '#94a3b8';
    vars['--theme-muted'] = isLight ? '#94a3b8' : '#64748b';
    vars['--radius-theme'] = `${presetTokens.borderRadius || 12}px`;
    vars['--theme-gap'] = `${presetTokens.layoutGap || 20}px`;
    vars['--texture-opacity'] = presetTokens.atmosphereNoiseOpacity || '0.15';

    return vars;
};

const PresetSpecimen: React.FC<{ 
    preset: any, 
    activeApp: string 
}> = ({ preset, activeApp }) => {
    const vars = React.useMemo(() => getPresetVariables(preset), [preset]);
    
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
        <div 
            className={`w-full h-full relative overflow-hidden bg-[var(--theme-bg)] transition-all duration-500 ${preset.mode === 'dark' ? 'dark' : 'light'}`}
            style={vars as any}
            data-surface={preset.surfaceMaterial || 'glass'}
            data-geometric={preset.isGeometricCut || '0'}
            data-border={preset.borderType || 'standard'}
            data-shadow-orientation={preset.shadowOrientation || 'top-down'}
            data-shadow-color-mode={preset.shadowColorMode || 'black'}
        >
            {/* Texture Layer - Forced Visibility for Preview */}
            {preset.texture && preset.texture !== 'none' && (
                <div 
                    className={`absolute inset-0 pointer-events-none SarakAtmosphereLayer texture-${preset.texture}`} 
                    style={{ zIndex: 1, opacity: vars['--texture-opacity'] || 0.15 }}
                />
            )}

            {/* Content Area Scaled Down - Optimized Aspect Ratio */}
            <div className="absolute inset-0 origin-top-left overflow-hidden z-10" style={{ transform: 'scale(0.333)', width: '300.3%', height: '300.3%' }}>
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
        </div>
    );
};

export const PresetsGallery: React.FC<PresetsGalleryProps> = ({ tokens, onUpdateDraft, activePreviewApp = 'dashboard' }) => {
    
    const handleSelect = (id: string) => {
        const presetKey = Object.keys(BASE_PRESETS).find(k => k.toLowerCase() === id.toLowerCase());
        const preset = presetKey ? (BASE_PRESETS as any)[presetKey] : null;

        if (!preset) return;
        
        Object.entries(preset).forEach(([key, val]) => {
             onUpdateDraft(key, val);
        });
        onUpdateDraft('layout', id);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-10 overflow-y-auto custom-scrollbar h-full bg-[#050505]">
            {Object.values(LAYOUTS).map((layout: any) => {
                const presetKey = Object.keys(BASE_PRESETS).find(k => k.toLowerCase() === layout.id.toLowerCase());
                const preset = (BASE_PRESETS as any)[presetKey!];
                
                if (!preset) return null;

                return (
                    <GalleryItem 
                        key={layout.id}
                        title={layout.name}
                        description={layout.description}
                        isActive={tokens.layout === layout.id}
                        onClick={() => handleSelect(layout.id)}
                    >
                        {/* 16:9 Aspect Ratio Container */}
                        <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/5 bg-[#0a0a0a]">
                            <PresetSpecimen 
                                preset={preset} 
                                activeApp={activePreviewApp} 
                            />
                        </div>
                    </GalleryItem>
                );
            })}
        </div>
    );
};
