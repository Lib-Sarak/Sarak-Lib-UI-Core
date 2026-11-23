import React from 'react';
import { Monitor } from 'lucide-react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { getPreviewLayoutPreset } from '../panelResponsive.presets';

interface LiveDraftPreviewFrameProps {
    previewDevice: 'desktop' | 'tablet' | 'smartphone';
    targetWidth: string | number;
    deviceAspectRatio: string | undefined;
    getDeviceFrameStyles: () => string;
    isInspecting: boolean;
    setIsInspecting: (value: boolean) => void;
    children: React.ReactNode;
}

const getDeviceViewportStyle = (
    previewDevice: LiveDraftPreviewFrameProps['previewDevice'],
    targetWidth: string | number,
    deviceAspectRatio: string | undefined,
): React.CSSProperties => {
    if (previewDevice === 'desktop') return { width: '100%', height: '100%' };

    return {
        width: 'min(' + targetWidth + ', 100%)',
        aspectRatio: deviceAspectRatio,
    };
};

const PreviewDeviceHardware = (props: {
    previewDevice: LiveDraftPreviewFrameProps['previewDevice'];
}): React.ReactElement | null => {
    const { previewDevice } = props;
    if (previewDevice === 'smartphone') {
        return (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[var(--color-theme-card,#101622)] rounded-b-[var(--sarak-device-phone-notch-radius,1rem)] z-[1000] flex items-center justify-center gap-2">
                <div className="w-12 h-1.5 rounded-full bg-theme-body/50"></div>
                <div className="w-2 h-2 rounded-full bg-[var(--color-theme-card,#101622)] shadow-inner border border-theme-text/5"></div>
            </div>
        );
    }

    if (previewDevice === 'tablet') {
        return (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-32 flex items-center justify-center z-[1000]">
                <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-2 h-2 rounded-full bg-[var(--color-theme-card,#101622)] shadow-inner border border-theme-text/5"></div>
            </div>
        );
    }

    return null;
};

const PreviewInspectionButton = (
    props: Pick<LiveDraftPreviewFrameProps, 'isInspecting' | 'setIsInspecting'>,
): React.ReactElement => {
    const text = useLibraryText();
    const inspectLabel = text('previewInspect');

    return (
        <button
            aria-label={inspectLabel}
            onClick={() => props.setIsInspecting(!props.isInspecting)}
            className={'absolute top-4 right-4 z-[9999] p-2 rounded-full backdrop-blur-md border shadow-2xl transition-all ' + (
                props.isInspecting
                    ? 'bg-[var(--theme-primary)] text-theme-on-primary border-[var(--theme-primary)] animate-pulse scale-110'
                    : 'bg-theme-body/40 border-theme-text/10 text-[var(--theme-primary)] hover:bg-theme-body/60 opacity-0 group-hover:opacity-100'
            )}
            style={props.isInspecting ? { backgroundColor: 'var(--theme-primary, #19e3f0)', borderColor: 'var(--theme-primary, #19e3f0)' } : {}}
            title="Modo de Inspeção (Selecionar elemento)"
        >
            <Monitor size={16} />
        </button>
    );
};

const PreviewInspectionOverlay = (props: { isInspecting: boolean }): React.ReactElement | null => {
    if (!props.isInspecting) return null;

    return (
        <div className="absolute inset-0 z-[9998] bg-[var(--theme-primary)]/5 cursor-crosshair pointer-events-none border-2 border-[var(--theme-primary)]/50 rounded-[var(--sarak-device-frame-radius,2rem)]">
            <div className="absolute top-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-theme-body/80 backdrop-blur border border-[var(--theme-primary)]/50 rounded-full text-theme-text text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(var(--theme-primary-rgb),0.3)]">
                <div className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-ping" />
                Clique em um componente para inspecionar
            </div>
        </div>
    );
};

const PreviewRenderedContent = (
    props: Pick<LiveDraftPreviewFrameProps, 'previewDevice' | 'children'>,
): React.ReactElement => (
    <div className={'relative sarak-device-' + props.previewDevice + ' min-h-0 w-full flex-1'}>
        {props.children}
    </div>
);

export const LiveDraftPreviewFrame = (props: LiveDraftPreviewFrameProps): React.ReactElement => {
    const layoutPreset = getPreviewLayoutPreset();
    const deviceViewportStyle = getDeviceViewportStyle(
        props.previewDevice,
        props.targetWidth,
        props.deviceAspectRatio,
    );
    const frameClassName = [
        'relative overflow-y-auto overflow-x-hidden overscroll-contain bg-[var(--theme-surface)]',
        'transition-all duration-[var(--sarak-motion-dur-slow,0.6s)] flex items-start justify-center group max-w-full',
        layoutPreset.frameClassName,
    ].join(' ');

    return (
        <div data-testid="live-preview-frame" className={frameClassName} style={layoutPreset.frameStyle}>
            {/* O botão é do painel, não da tela de amostra: fica no canto da moldura, fora do aparelho (tablet e celular). */}
            <PreviewInspectionButton isInspecting={props.isInspecting} setIsInspecting={props.setIsInspecting} />
            <div
                data-testid="device-viewport"
                className={'relative flex shrink-0 flex-col max-w-full ' + props.getDeviceFrameStyles()}
                style={deviceViewportStyle}
            >
                <PreviewDeviceHardware previewDevice={props.previewDevice} />
                <PreviewInspectionOverlay isInspecting={props.isInspecting} />
                <PreviewRenderedContent previewDevice={props.previewDevice}>
                    {props.children}
                </PreviewRenderedContent>
            </div>
        </div>
    );
};
