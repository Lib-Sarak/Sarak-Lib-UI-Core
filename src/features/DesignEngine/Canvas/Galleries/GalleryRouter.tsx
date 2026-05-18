import React from 'react';
import { CardsGallery } from './CardsGallery';
import { OverlaysGallery } from './OverlaysGallery';
import { AtmosphereGallery } from './AtmosphereGallery';
import { TypographyGallery } from './TypographyGallery';
import { AnimationsGallery } from './AnimationsGallery';
import { BrandingGallery } from './BrandingGallery';
import { VisualsGallery } from './VisualsGallery';
import { ComponentsGallery } from './ComponentsGallery';
import { DashboardGallery } from './DashboardGallery';
import { ChatGallery } from './ChatGallery';
import { VisualizationGallery } from './VisualizationGallery';
import { LayoutGallery } from './LayoutGallery';
import { PresetsGallery } from './PresetsGallery';
import { AdvancedGallery } from './AdvancedGallery';

interface GalleryRouterProps {
    activeCategory: string;
    activeSectionId?: string | null;
    tokens: any;
    onUpdateDraft: (key: string, value: any) => void;
    activePreviewApp?: string;
    customThemes?: any[];
}

/**
 * GalleryRouter (v3.0 - Unified)
 * 
 * Roteador de galerias sem aliases duplicados.
 * Cada subcategoria aponta para uma única galeria canônica.
 */
export const GalleryRouter: React.FC<GalleryRouterProps> = ({ activeCategory, activeSectionId, tokens, onUpdateDraft, activePreviewApp, customThemes }) => {

    switch (activeCategory) {
        case 'brand':
        case 'branding':
            return <BrandingGallery tokens={tokens} onUpdateDraft={onUpdateDraft} />;

        case 'typography':
        case 'fonts':
            return <TypographyGallery tokens={tokens} onUpdateDraft={onUpdateDraft} />;

        case 'surfaces':
        case 'cards':
            if (activeSectionId === 'overlays') {
                return <OverlaysGallery tokens={tokens} onUpdateDraft={onUpdateDraft} />;
            }
            if (activeSectionId === 'atmosphere') {
                return <AtmosphereGallery tokens={tokens} onUpdateDraft={onUpdateDraft} />;
            }
            return <CardsGallery tokens={tokens} onUpdateDraft={onUpdateDraft} />;

        case 'interaction':
        case 'animations':
            return <AnimationsGallery tokens={tokens} onUpdateDraft={onUpdateDraft} />;

        case 'navigation':
        case 'layout':
            return <LayoutGallery tokens={tokens} onUpdateDraft={onUpdateDraft} />;

        case 'systems':
        case 'presets':
            return <PresetsGallery tokens={tokens} onUpdateDraft={onUpdateDraft} activePreviewApp={activePreviewApp} customThemes={customThemes} />;

        case 'visuals':
            return <VisualsGallery tokens={tokens} onUpdateDraft={onUpdateDraft} />;

        case 'components':
            return <ComponentsGallery tokens={tokens} onUpdateDraft={onUpdateDraft} />;

        case 'dashboard':
            return <DashboardGallery tokens={tokens} />;

        case 'chats':
            return <ChatGallery tokens={tokens} onUpdateDraft={onUpdateDraft} />;

        case 'visuals-3d':
            return <VisualizationGallery tokens={tokens} />;

        case 'advanced':
        case 'matrix':
            return <AdvancedGallery tokens={tokens} onUpdateDraft={onUpdateDraft} />;

        default:
            return (
                <div className="flex items-center justify-center h-full text-white/20 uppercase tracking-[0.3em] font-black text-xs">
                    Selecione uma categoria para explorar variações
                </div>
            );
    }
};
