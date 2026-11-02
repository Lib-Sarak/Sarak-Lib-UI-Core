import React from 'react';
import { UIContext } from '../../../core/Provider/SarakUIProvider';
import { SarakDesignScope } from '../../../core/Design/components/DesignScope';
import { SarakStyle } from '../../../core/Provider/components/SarakStyle';
import type { SarakDesignState, SarakUIContextType } from '../../../core/Provider/types';
import { LiveDraftPreviewFrame } from './components/LiveDraftPreviewFrame';
import type { PreviewLayoutPreset } from './panelResponsive.presets';

type PreviewDevice = 'desktop' | 'tablet' | 'smartphone';

export interface PreviewCanvasLayoutProps {
    design: Partial<SarakDesignState>;
    contextValue: SarakUIContextType;
    previewDevice: PreviewDevice;
    targetWidth: string | number;
    deviceAspectRatio: string | undefined;
    getDeviceFrameStyles: () => string;
    isInspecting: boolean;
    setIsInspecting: (value: boolean) => void;
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

const PreviewCanvasContent = (props: PreviewCanvasLayoutProps): React.ReactElement => (
    <div className="@container flex-1 w-full h-full flex flex-col gap-6 p-6 overflow-visible">
        <div
            data-testid="preview-layout"
            className={`flex-1 w-full min-h-0 flex gap-6 items-stretch overflow-y-auto overflow-x-hidden overscroll-contain ${props.layoutPreset.rowClassName}`}
        >
            <LiveDraftPreviewFrame
                previewDevice={props.previewDevice}
                targetWidth={props.targetWidth}
                deviceAspectRatio={props.deviceAspectRatio}
                getDeviceFrameStyles={props.getDeviceFrameStyles}
                isInspecting={props.isInspecting}
                setIsInspecting={props.setIsInspecting}
            >
                {props.previewContent}
            </LiveDraftPreviewFrame>
        </div>
    </div>
);

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
