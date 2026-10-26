import React from 'react';
import { PreviewCanvasLayout, type PreviewCanvasLayoutProps } from './PreviewCanvasLayout';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { usePreviewApps } from './hooks/usePreviewApps';
import { useInspector } from './hooks/useInspector';
import { useDeviceStyles } from './hooks/useDeviceStyles';
import { usePreviewContextValue, useApplyPreset } from './hooks/useDesignOperations';
import { PreviewSystemRenderer } from './components/PreviewSystemRenderer';
import { getPreviewLayoutPreset } from './panelResponsive.presets';
import type { SarakDesignState, SarakUIContextType, SarakUIOptions } from '../../../core/Provider/types';
import type { SarakTokenValue } from '../../../core/Design/types';

interface PreviewCanvasProps {
    previewDevice: 'desktop' | 'tablet' | 'smartphone';
    previewLayoutId: string;
    activePreviewApp: string;
    selectPreviewApp: (appId: string) => void;
    previewAnimationStyle: string;
    config: SarakUIOptions;
    previewPrimaryColor: string;
    mode: 'light' | 'dark';
    draftMode: 'light' | 'dark';
    draftTokens: Partial<SarakDesignState>;
    activeSectionId?: string | null;
    onUpdateDraft: (key: string, value: SarakTokenValue) => void;
    isDualView?: boolean;
    isPreviewStacked?: boolean;
    sarak: SarakUIContextType;
    onInspectComponent?: (schemaId: string) => void;
    onApplyFullTheme?: (design: Partial<SarakDesignState>, themeId?: string) => void;
    onCloseGallery?: () => void;
}

interface PreviewCanvasModelState {
    design: Partial<SarakDesignState>;
    contextValue: SarakUIContextType;
    tokens: Partial<SarakDesignState>;
    apps: Record<string, React.ReactNode>;
    deviceStyles: ReturnType<typeof useDeviceStyles>;
    isInspecting: boolean;
    setIsInspecting: (value: boolean) => void;
    isGalleryStacked: boolean;
    layoutPreset: ReturnType<typeof getPreviewLayoutPreset>;
    onApplyPreset: ReturnType<typeof useApplyPreset>;
}

const createPreviewCanvasLayoutProps = (
    props: PreviewCanvasProps,
    state: PreviewCanvasModelState,
): PreviewCanvasLayoutProps => {
    const previewContent = (
        <PreviewSystemRenderer
            sarak={props.sarak}
            tokens={state.tokens}
            isDualView={props.isDualView}
            previewDevice={props.previewDevice}
            activePreviewApp={props.activePreviewApp}
            selectPreviewApp={props.selectPreviewApp}
            apps={state.apps}
        />
    );

    return {
        design: state.design,
        contextValue: state.contextValue,
        previewDevice: props.previewDevice,
        targetWidth: state.deviceStyles.targetWidth,
        deviceAspectRatio: state.deviceStyles.deviceAspectRatio,
        getDeviceFrameStyles: state.deviceStyles.getDeviceFrameStyles,
        isDualView: props.isDualView,
        isGalleryStacked: state.isGalleryStacked,
        isInspecting: state.isInspecting,
        setIsInspecting: state.setIsInspecting,
        mode: props.mode,
        draftMode: props.draftMode,
        sarak: props.sarak,
        onApplyPreset: state.onApplyPreset,
        onApplyFullTheme: props.onApplyFullTheme,
        onCloseGallery: props.onCloseGallery,
        previewContent,
        layoutPreset: state.layoutPreset,
    };
};

const usePreviewCanvasModel = (props: PreviewCanvasProps): PreviewCanvasLayoutProps => {
    const parentContext = useSarakUI();
    const tokens = React.useMemo(() => ({ ...props.draftTokens }), [props.draftTokens]);
    const design = React.useMemo(
        () => ({ ...tokens, globalBackgroundImageUrl: undefined }),
        [tokens],
    );
    const { isInspecting, setIsInspecting } = useInspector(props.onInspectComponent);
    const contextValue = usePreviewContextValue(parentContext, tokens, props.onUpdateDraft) as SarakUIContextType;
    const apps = usePreviewApps(tokens, props.config, props.previewAnimationStyle, props.selectPreviewApp);
    const deviceStyles = useDeviceStyles(props.previewDevice, tokens);
    const isGalleryStacked = Boolean(props.isDualView && props.isPreviewStacked);
    const layoutPreset = getPreviewLayoutPreset(isGalleryStacked);
    const onApplyPreset = useApplyPreset(props.onUpdateDraft, props.onApplyFullTheme);

    return createPreviewCanvasLayoutProps(props, {
        design,
        contextValue,
        tokens,
        apps,
        deviceStyles,
        isInspecting,
        setIsInspecting,
        isGalleryStacked,
        layoutPreset,
        onApplyPreset,
    });
};

export const PreviewCanvas = (props: PreviewCanvasProps): React.ReactElement => {
    const model = usePreviewCanvasModel(props);
    return <PreviewCanvasLayout {...model} />;
};
