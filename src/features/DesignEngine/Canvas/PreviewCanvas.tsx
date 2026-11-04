import React from 'react';
import { PreviewCanvasLayout, type PreviewCanvasLayoutProps } from './PreviewCanvasLayout';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { usePreviewApps } from './hooks/usePreviewApps';
import { useInspector } from './hooks/useInspector';
import { useDeviceStyles } from './hooks/useDeviceStyles';
import { usePreviewContextValue } from './hooks/useDesignOperations';
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
    draftTokens: Partial<SarakDesignState>;
    activeSectionId?: string | null;
    onUpdateDraft: (key: string, value: SarakTokenValue) => void;
    sarak: SarakUIContextType;
    onInspectComponent?: (schemaId: string) => void;
    onApplyFullTheme?: (design: Partial<SarakDesignState>, themeId?: string) => void;
    /** O que a espiada compõe por cima do rascunho na prévia; `null` ou omitido = o rascunho puro. */
    peekTokens?: Partial<SarakDesignState> | null;
}

interface PreviewCanvasModelState {
    design: Partial<SarakDesignState>;
    previewTokens: Partial<SarakDesignState>;
    contextValue: SarakUIContextType;
    tokens: Partial<SarakDesignState>;
    apps: Record<string, React.ReactNode>;
    deviceStyles: ReturnType<typeof useDeviceStyles>;
    isInspecting: boolean;
    setIsInspecting: (value: boolean) => void;
    layoutPreset: ReturnType<typeof getPreviewLayoutPreset>;
}

const createPreviewCanvasLayoutProps = (
    props: PreviewCanvasProps,
    state: PreviewCanvasModelState,
): PreviewCanvasLayoutProps => {
    const previewContent = (
        <PreviewSystemRenderer
            sarak={props.sarak}
            tokens={state.previewTokens}
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
        isInspecting: state.isInspecting,
        setIsInspecting: state.setIsInspecting,
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
    // A espiada só vale para a prévia grande; o contexto e a coluna seguem o rascunho, senão tudo recolore ao passar o mouse.
    const previewTokens = React.useMemo(
        () => (props.peekTokens ? { ...tokens, ...props.peekTokens } : tokens),
        [tokens, props.peekTokens],
    );
    const contextValue = usePreviewContextValue(parentContext, tokens, props.onUpdateDraft) as SarakUIContextType;
    const apps = usePreviewApps(previewTokens, props.config, props.previewAnimationStyle, props.selectPreviewApp);
    const deviceStyles = useDeviceStyles(props.previewDevice, tokens);
    const layoutPreset = getPreviewLayoutPreset();

    return createPreviewCanvasLayoutProps(props, {
        design,
        previewTokens,
        contextValue,
        tokens,
        apps,
        deviceStyles,
        isInspecting,
        setIsInspecting,
        layoutPreset,
    });
};

export const PreviewCanvas = (props: PreviewCanvasProps): React.ReactElement => {
    const model = usePreviewCanvasModel(props);
    return <PreviewCanvasLayout {...model} />;
};
