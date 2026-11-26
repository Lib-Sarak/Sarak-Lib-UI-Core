import React from 'react';
import { useLibraryLanguage, useLibraryText, type LibraryTextFn } from '../../../../core/i18n/useLibraryText';
import { SarakAppChrome, type SarakChromeNotification, type SarakNavItem } from '../../../../components/Layout/SarakAppChrome';
import { SarakDeviceProvider } from '../../../../core/Provider/DeviceProvider';
import { SarakDesignScope } from '../../../../core/Design/components/DesignScope';
import type { SarakUIContextType, SarakDesignState } from '../../../../core/Provider/types';
import { SarakPortalFrameProvider, type PortalPoint, type SarakPortalFrame } from '../../../../core/Provider/portalFrame';
import { useContainerScale, type ContainerScaleRule } from '../hooks/useContainerScale';
import {
    isAdditionalPreviewScreen,
    MAIN_PREVIEW_SCREENS,
    MORE_PREVIEW_SCREEN_ID,
} from '../previewScreens';

export interface PreviewSystemRendererProps {
    sarak: SarakUIContextType;
    tokens: Partial<SarakDesignState>;
    previewDevice: 'desktop' | 'tablet' | 'smartphone';
    activePreviewApp: string;
    selectPreviewApp: (appId: string) => void;
    apps: Record<string, React.ReactNode>;
}

export const arePreviewPropsEqual = (
    previous: Readonly<PreviewSystemRendererProps>,
    next: Readonly<PreviewSystemRendererProps>,
): boolean =>
    previous.tokens === next.tokens &&
    previous.apps === next.apps &&
    previous.sarak === next.sarak &&
    previous.previewDevice === next.previewDevice &&
    previous.activePreviewApp === next.activePreviewApp;

/**
 * A largura da janela do sistema que a prévia desktop desenha (a de um monitor de 1.920 px, com folga para a maior largura
 * de conteúdo mais a barra lateral): a prévia reduz esse desenho para caber na moldura, e as três larguras de conteúdo
 * (1.000, 1.200 e 1.440 px) aparecem distintas. Tablet e celular desenham na largura do aparelho.
 */
export const PREVIEW_DESKTOP_SYSTEM_WIDTH = 1920;
const DESKTOP_SCALE_RULE: ContainerScaleRule = { referenceWidth: PREVIEW_DESKTOP_SYSTEM_WIDTH, minScale: 0.2, maxScale: 1 };

/**
 * Nada na prévia leva o navegador para fora do painel: a rota de exemplo (`#tela`) não existe no sistema de quem importa a lib.
 * O clique simples já é tratado pelo item; aqui caem o que sobra: âncora sem tratador, Ctrl/Cmd/Shift/Alt+clique, botão do meio
 * e o menu de contexto do navegador ("abrir em nova aba").
 */
const keepPreviewLinksInside = (event: React.MouseEvent<HTMLElement>): void => {
    const link = (event.target as Element).closest?.('a[href]');
    if (!link) return;
    const isPlainClick = event.type === 'click' && event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;
    if (isPlainClick && event.defaultPrevented) return;
    event.preventDefault();
};

/** O fundo da prévia: a cor de base e o gradiente do tema (as variáveis `--sarak-bg-*` do escopo), por baixo da textura e da vinheta. */
const previewBaseStyle = (globalBackgroundImageUrl: string | undefined): React.CSSProperties => ({
    zIndex: -2,
    backgroundColor: globalBackgroundImageUrl ? 'transparent' : 'var(--sarak-bg-base)',
    backgroundImage: 'var(--sarak-bg-tone-image), var(--sarak-bg-gradient-image)',
    backgroundSize: 'var(--sarak-bg-tone-size), var(--sarak-bg-gradient-size)',
    backgroundRepeat: 'var(--sarak-bg-tone-repeat), var(--sarak-bg-gradient-repeat)',
});

/** A prévia é amostra: usuário, sair e notificações de exemplo, sem efeito, para a barra mostrar o que o painel configura. */
const createSampleNotifications = (text: LibraryTextFn): SarakChromeNotification[] => [
    { id: 'sample-1', label: text('previewSampleNotificationOrder'), description: text('previewSampleNotificationOrderWhen') },
    { id: 'sample-2', label: text('previewSampleNotificationReport'), description: text('previewSampleNotificationReportWhen') },
    { id: 'sample-3', label: text('previewSampleNotificationInvite'), description: text('previewSampleNotificationInviteWhen') },
];
const noop = (): void => undefined;

function createNavigationItems(
    apps: PreviewSystemRendererProps['apps'],
    activePreviewApp: string,
    text: LibraryTextFn,
): SarakNavItem[] {
    const mainScreenItems = MAIN_PREVIEW_SCREENS
        .filter(({ id }) => Object.prototype.hasOwnProperty.call(apps, id))
        .map(({ id, labelKey }) => ({
            id,
            label: text(labelKey),
            href: `#${id}`,
            active: activePreviewApp === id,
        }));

    if (!Object.prototype.hasOwnProperty.call(apps, MORE_PREVIEW_SCREEN_ID)) return mainScreenItems;

    return [
        ...mainScreenItems,
        {
            id: MORE_PREVIEW_SCREEN_ID,
            label: text('previewMoreScreens'),
            href: `#${MORE_PREVIEW_SCREEN_ID}`,
            active: activePreviewApp === MORE_PREVIEW_SCREEN_ID || isAdditionalPreviewScreen(activePreviewApp),
        },
    ];
}

function createNavigationHandler(
    apps: PreviewSystemRendererProps['apps'],
    selectPreviewApp: PreviewSystemRendererProps['selectPreviewApp'],
): (route: string) => void {
    return (route: string): void => {
        const appId = route.replace(/^[#/]/, '');
        if (Object.prototype.hasOwnProperty.call(apps, appId)) selectPreviewApp(appId);
    };
}

interface PreviewDeviceSurfaceProps {
    activeDesign: Partial<SarakDesignState>;
    previewDevice: PreviewSystemRendererProps['previewDevice'];
    containerRef: ReturnType<typeof useContainerScale>['containerRef'];
    scale: number;
    navigationItems: SarakNavItem[];
    onNavigate: (route: string) => void;
    activeApp: React.ReactNode;
}

const PreviewDeviceSurface = (props: PreviewDeviceSurfaceProps): React.ReactElement => {
    const text = useLibraryText();
    const { activeDesign, previewDevice, containerRef, scale, navigationItems, onNavigate, activeApp } = props;
    const language = useLibraryLanguage();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `text` muda a cada render; o idioma é o que o faz mudar de fato.
    const sampleNotifications = React.useMemo(() => createSampleNotifications(text), [language]);
    const layerRef = React.useRef<HTMLDivElement | null>(null);
    const [portalNode, setPortalNode] = React.useState<HTMLDivElement | null>(null);
    // Popover do cromo (⚙, balão da navegação) abre dentro da camada reduzida: as coordenadas da janela viram as da camada.
    const portalFrame = React.useMemo<SarakPortalFrame>(() => ({
        container: portalNode,
        localize: (point: PortalPoint): PortalPoint => {
            const origin = layerRef.current?.getBoundingClientRect();
            if (!origin) return point;
            return { top: (point.top - origin.top) / scale, left: (point.left - origin.left) / scale };
        },
    }), [portalNode, scale]);

    return (
        <SarakDeviceProvider overrideDevice={previewDevice}>
            <SarakDesignScope
                design={activeDesign}
                className={`@container sarak-device-${previewDevice} w-full h-full flex flex-col overflow-y-auto overflow-x-hidden overscroll-contain relative isolate ${activeDesign.texture && activeDesign.texture !== 'none' ? 'texture-active' : ''}`}
                data-sx-texture={activeDesign.texture}
            >
                {/* O fundo da prévia e a medida da largura do contêiner. A camada fica ATRÁS da textura e da vinheta do escopo (z-index negativo) e leva o gradiente ela mesma: a pintura do escopo ficaria por baixo dela. */}
                <div ref={containerRef} className="absolute inset-0 z-0" style={previewBaseStyle(activeDesign.globalBackgroundImageUrl)} />
                <div
                    ref={layerRef}
                    className="absolute inset-0 origin-top-left overflow-y-auto overflow-x-hidden z-10"
                    onClick={keepPreviewLinksInside}
                    onAuxClick={keepPreviewLinksInside}
                    onContextMenu={keepPreviewLinksInside}
                    style={{ width: `${(100 / scale).toFixed(2)}%`, height: `${(100 / scale).toFixed(2)}%`, transform: `scale(${scale})` }}
                >
                    <SarakPortalFrameProvider value={portalFrame}>
                    <SarakAppChrome
                        brand={{ name: activeDesign.systemName || text('previewSampleSystem') }}
                        navItems={navigationItems}
                        onNavigate={onNavigate}
                        user={{ name: text('sampleTextName'), role: text('previewSampleRole') }}
                        logout={noop}
                        notifications={sampleNotifications}
                        onNotificationSelect={noop}
                        style={{ width: '100%', height: '100%' }}
                    >
                        {activeApp}
                    </SarakAppChrome>
                    </SarakPortalFrameProvider>
                    <div ref={setPortalNode} data-sarak-preview-portal="true" />
                </div>
            </SarakDesignScope>
        </SarakDeviceProvider>
    );
};

function PreviewSystemRendererImpl(props: PreviewSystemRendererProps): React.ReactElement {
    const {
        tokens,
        previewDevice,
        activePreviewApp,
        selectPreviewApp,
        apps,
    } = props;
    const text = useLibraryText();
    const language = useLibraryLanguage();
    const { containerRef, scale } = useContainerScale(0.95, previewDevice === 'desktop' ? DESKTOP_SCALE_RULE : null);
    const navigationItems = React.useMemo<SarakNavItem[]>(
        () => createNavigationItems(apps, activePreviewApp, text),
        // eslint-disable-next-line react-hooks/exhaustive-deps -- `text` muda a cada render; o idioma é o que o faz mudar de fato.
        [apps, activePreviewApp, language],
    );
    const activeApp = apps[activePreviewApp] ?? Object.values(apps)[0] ?? null;
    const navigateToApp = React.useMemo(
        () => createNavigationHandler(apps, selectPreviewApp),
        [apps, selectPreviewApp],
    );

    return <PreviewDeviceSurface
        activeDesign={tokens}
        previewDevice={previewDevice}
        containerRef={containerRef}
        scale={scale}
        navigationItems={navigationItems}
        onNavigate={navigateToApp}
        activeApp={activeApp}
    />;
}

export const PreviewSystemRenderer = React.memo(PreviewSystemRendererImpl, arePreviewPropsEqual);
