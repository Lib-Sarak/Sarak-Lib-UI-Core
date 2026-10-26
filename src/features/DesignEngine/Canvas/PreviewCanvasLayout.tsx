import React from 'react';
import { UIContext } from '../../../core/Provider/SarakUIProvider';
import { SarakDesignScope } from '../../../core/Design/components/DesignScope';
import { SarakStyle } from '../../../core/Provider/components/SarakStyle';
import type { SarakDesignState, SarakUIContextType } from '../../../core/Provider/types';
import { PresetsCatalog } from './components/PresetsCatalog';
import { LiveDraftPreviewFrame } from './components/LiveDraftPreviewFrame';
import type { PreviewLayoutPreset } from './panelResponsive.presets';

type PreviewDevice = 'desktop' | 'tablet' | 'smartphone';
type PresetHandler = React.ComponentProps<typeof PresetsCatalog>['onApplyPreset'];

export interface PreviewCanvasLayoutProps {
    design: Partial<SarakDesignState>;
    contextValue: SarakUIContextType;
    previewDevice: PreviewDevice;
    targetWidth: string | number;
    deviceAspectRatio: string | undefined;
    getDeviceFrameStyles: () => string;
    isDualView?: boolean;
    isGalleryStacked: boolean;
    isInspecting: boolean;
    setIsInspecting: (value: boolean) => void;
    mode: 'light' | 'dark';
    draftMode: 'light' | 'dark';
    sarak: SarakUIContextType;
    onApplyPreset: PresetHandler;
    onApplyFullTheme?: (design: Partial<SarakDesignState>, themeId?: string) => void;
    onCloseGallery?: () => void;
    previewContent: React.ReactNode;
    layoutPreset: PreviewLayoutPreset;
}

const PREVIEW_SCROLLBAR_CSS = `
.custom-scrollbar::-webkit-scrollbar {
    width: var(--sarak-scroll-width, 6px);
    height: var(--sarak-scroll-width, 6px);
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--sarak-scroll-thumb-color, #ffffff);
    border-radius: var(--sarak-scroll-radius, 10px);
    border: var(--sarak-scroll-padding, 2px) solid transparent;
    background-clip: padding-box;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: var(--theme-primary, #19e3f0);
    background-clip: padding-box;
    opacity: var(--sarak-scroll-thumb-hover-opacity, 0.5);
}`;

const PreviewCatalogFrame = (props: PreviewCanvasLayoutProps): React.ReactElement => (
    <div
        data-testid="catalog-preview-frame"
        className={`relative rounded-[var(--sarak-device-frame-radius,2rem)] border border-theme-border shadow-theme overflow-y-auto overflow-x-hidden overscroll-contain sarak-card transition-colors duration-[var(--sarak-motion-dur-slow,0.6s)] flex flex-col ${props.layoutPreset.frameClassName}`}
        style={props.layoutPreset.frameStyle}
    >
        <PresetsCatalog
            onApplyPreset={props.onApplyPreset}
            onApplyFullTheme={props.onApplyFullTheme}
            currentMode={props.mode}
            draftMode={props.draftMode}
            sarak={props.sarak}
            onClose={() => props.onCloseGallery?.()}
        />
    </div>
);

const PreviewDualView = (props: PreviewCanvasLayoutProps): React.ReactElement => (
    <>
        <LiveDraftPreviewFrame
            previewDevice={props.previewDevice}
            isPreviewStacked={props.isGalleryStacked}
            targetWidth={props.targetWidth}
            deviceAspectRatio={props.deviceAspectRatio}
            getDeviceFrameStyles={props.getDeviceFrameStyles}
            isInspecting={props.isInspecting}
            setIsInspecting={props.setIsInspecting}
        >
            {props.previewContent}
        </LiveDraftPreviewFrame>
        <PreviewCatalogFrame {...props} />
    </>
);

const PreviewSingleView = (props: PreviewCanvasLayoutProps): React.ReactElement => (
    <div
        className="relative h-full rounded-2xl border border-[var(--theme-border)] shadow-theme overflow-hidden bg-[var(--theme-surface)] transition-all duration-[var(--sarak-motion-dur-slow,0.6s)] mx-auto max-w-full"
        style={{ width: props.targetWidth }}
    >
        {props.previewContent}
    </div>
);

const PreviewCanvasContent = (props: PreviewCanvasLayoutProps): React.ReactElement => {
    const previewItems = props.isDualView
        ? <PreviewDualView {...props} />
        : <PreviewSingleView {...props} />;

    return (
        <div className="@container flex-1 w-full h-full flex flex-col gap-6 p-6 overflow-visible">
            <div
                data-testid="preview-layout"
                className={`flex-1 w-full min-h-0 flex gap-6 items-stretch overflow-y-auto overflow-x-hidden overscroll-contain ${props.layoutPreset.rowClassName}`}
            >
                {previewItems}
            </div>
        </div>
    );
};

export const PreviewCanvasLayout = (props: PreviewCanvasLayoutProps): React.ReactElement => (
    <SarakDesignScope
        design={props.design}
        className="w-full h-full flex flex-col relative overflow-auto bg-[var(--color-theme-bg,#06080d)] p-0 custom-scrollbar"
    >
        <UIContext.Provider value={props.contextValue}>
            <PreviewCanvasContent {...props} />
        </UIContext.Provider>
        <SarakStyle dangerouslySetInnerHTML={{ __html: PREVIEW_SCROLLBAR_CSS }} />
    </SarakDesignScope>
);
