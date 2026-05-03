import React from 'react';
import { motion } from 'framer-motion';
import { GalleryItem } from './GalleryItem';
import { CARD_VARIANTS, CardPreset } from '../../../../constants/cards-presets';
import { DESIGN_MANIFEST, UIContext, useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { 
    User, 
    MoreHorizontal,
    Shield,
    Wallet,
    Layers,
    Search,
    Bell,
    Settings,
    Activity
} from 'lucide-react';

interface CardsGalleryProps {
    tokens: any;
    onUpdateDraft: (key: string, value: any) => void;
}

import { DesignScope } from '../../../../core/Design/components/DesignScope';

const CardSpecimen: React.FC<{ preset: CardPreset, contentType: string, globalTokens: any }> = ({ preset, contentType, globalTokens }) => {
    const mergedTokens = React.useMemo(() => ({ ...globalTokens, ...preset.tokens }), [preset, globalTokens]);

    const renderContent = () => {
        switch (contentType) {
            case 'profile':
                return (
                    <div className="flex flex-col h-full">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 flex items-center justify-center">
                                <User className="text-[var(--theme-primary)]" size={20} />
                            </div>
                            <div>
                                <div className="text-xs font-black uppercase tracking-widest text-white">Sarak Identity</div>
                                <div className="text-[10px] text-white/40 uppercase font-bold">Premium Tier</div>
                            </div>
                            <MoreHorizontal className="ml-auto text-white/20" size={16} />
                        </div>
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="space-y-2">
                                    <div className="h-1.5 w-full bg-white/5 rounded-full" />
                                    <div className="h-1.5 w-2/3 bg-white/5 rounded-full" />
                                </div>
                            ))}
                        </div>
                        <button className="mt-auto w-full py-2 bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 text-[var(--theme-primary)] text-[9px] font-black uppercase tracking-widest rounded-lg">
                            Upgrade Vault
                        </button>
                    </div>
                );
            case 'chart':
                return (
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="text-xs font-black uppercase tracking-widest text-white">Analytics</div>
                                <div className="text-2xl font-black text-white tracking-tighter">$12,480</div>
                            </div>
                            <Activity size={20} className="text-[var(--theme-primary)]" />
                        </div>
                        <div className="flex-1 flex items-end gap-1 mt-2">
                            {[30, 50, 45, 90, 65, 80, 55, 40, 75, 60].map((h, i) => (
                                <div 
                                    key={i}
                                    className="flex-1 bg-[var(--theme-primary)]/20 rounded-t-sm"
                                    style={{ height: `${h}%` }}
                                />
                            ))}
                        </div>
                    </div>
                );
            case 'control':
                return (
                    <div className="flex flex-col h-full gap-4">
                        <div className="text-xs font-black uppercase tracking-widest text-white border-b border-white/5 pb-2">Control Panel</div>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { icon: Shield, label: 'Sec' },
                                { icon: Wallet, label: 'Fin' },
                                { icon: Bell, label: 'Not' },
                                { icon: Settings, label: 'Cfg' }
                            ].map((item, i) => (
                                <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-lg flex flex-col gap-2">
                                    <item.icon size={14} className="text-[var(--theme-primary)]" />
                                    <span className="text-[8px] font-black uppercase text-white/30">{item.label}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/5 rounded-lg mt-auto">
                            <Search size={12} className="text-white/20" />
                            <div className="h-1.5 flex-1 bg-white/5 rounded-full" />
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <DesignScope design={mergedTokens} className="w-full h-full p-6 relative overflow-hidden group z-10 transition-all duration-300">
            {/* Checkerboard Stress Background for Transparency Visibility */}
            <div className="absolute inset-4 rounded-xl overflow-hidden pointer-events-none opacity-20 z-0">
                <div className="absolute inset-0" style={{ 
                    backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', 
                    backgroundSize: '20px 20px' 
                }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-[var(--theme-primary)] blur-[80px] opacity-10 animate-pulse" />
            </div>

            <div className="bg-theme-card border-theme w-full h-full p-6 relative overflow-hidden group z-10 transition-all duration-300">
                <div className="relative z-10 h-full">
                    {renderContent()}
                </div>
            </div>
        </DesignScope>
    );
};

export const CardsGallery: React.FC<CardsGalleryProps> = ({ tokens, onUpdateDraft }) => {
    
    const handleSelect = (preset: CardPreset) => {
        Object.entries(preset.tokens).forEach(([key, val]) => {
             onUpdateDraft(key, val);
        });
    };

    return (
        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto custom-scrollbar h-full bg-[#020202]">
            {CARD_VARIANTS.map((preset, idx) => {
                const isActive = tokens.surfaceMaterial === preset.tokens.surfaceMaterial && 
                                tokens.borderRadius === preset.tokens.borderRadius &&
                                tokens.borderType === preset.tokens.borderType;

                const contentTypes = ['profile', 'chart', 'control'];
                const contentType = contentTypes[idx % 3];

                return (
                    <GalleryItem 
                        key={preset.id}
                        title={preset.name}
                        description={preset.description}
                        isActive={isActive}
                        onClick={() => handleSelect(preset)}
                    >
                        <div className="w-full h-[320px] rounded-2xl overflow-hidden bg-black/80 border border-white/5 shadow-2xl relative group">
                            <CardSpecimen 
                                preset={preset} 
                                contentType={contentType}
                                globalTokens={tokens}
                            />
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-sm pointer-events-none">
                                <div className="p-4 bg-[var(--theme-primary)] rounded-full text-white shadow-xl scale-90 group-hover:scale-100 transition-transform mb-4">
                                    <Layers size={28} />
                                </div>
                                <span className="text-2xs font-black uppercase tracking-[0.3em] text-white">Aplicar Material</span>
                            </div>
                        </div>
                    </GalleryItem>
                );
            })}
        </div>
    );
};
