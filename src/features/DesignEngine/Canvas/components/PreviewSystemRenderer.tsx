import React from 'react';
import { SarakAppChrome, type SarakNavItem } from '../../../../components/Layout/SarakAppChrome';
import { SarakDeviceProvider } from '../../../../core/Provider/DeviceProvider';
import { SarakDesignScope } from '../../../../core/Design/components/DesignScope';
import type { SarakUIContextType, SarakDesignState } from '../../../../core/Provider/types';
import { useContainerScale } from '../hooks/useContainerScale';
import {
    isAdditionalPreviewScreen,
    MAIN_PREVIEW_SCREENS,
    MORE_PREVIEW_SCREEN_ID,
} from '../previewScreens';

export interface PreviewSystemRendererProps {
    useSystemDesign?: boolean;
    sarak: SarakUIContextType;
    tokens: Partial<SarakDesignState>;
    isDualView?: boolean;
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
    previous.useSystemDesign === next.useSystemDesign &&
    previous.previewDevice === next.previewDevice &&
    previous.isDualView === next.isDualView &&
    previous.activePreviewApp === next.activePreviewApp;

function createNavigationItems(
    apps: PreviewSystemRendererProps['apps'],
    activePreviewApp: string,
): SarakNavItem[] {
    const mainScreenItems = MAIN_PREVIEW_SCREENS
        .filter(({ id }) => Object.prototype.hasOwnProperty.call(apps, id))
        .map(({ id, label }) => ({
            id,
            label,
            href: `/${id}`,
            active: activePreviewApp === id,
        }));

    if (!Object.prototype.hasOwnProperty.call(apps, MORE_PREVIEW_SCREEN_ID)) return mainScreenItems;

    return [
        ...mainScreenItems,
        {
            id: MORE_PREVIEW_SCREEN_ID,
            label: 'Mais telas',
            href: `/${MORE_PREVIEW_SCREEN_ID}`,
            active: activePreviewApp === MORE_PREVIEW_SCREEN_ID || isAdditionalPreviewScreen(activePreviewApp),
        },
    ];
}

function createNavigationHandler(
    apps: PreviewSystemRendererProps['apps'],
    selectPreviewApp: PreviewSystemRendererProps['selectPreviewApp'],
): (route: string) => void {
    return (route: string): void => {
        const appId = route.slice(1);
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
    const { activeDesign, previewDevice, containerRef, scale, navigationItems, onNavigate, activeApp } = props;

    return (
        <SarakDeviceProvider overrideDevice={previewDevice}>
            <SarakDesignScope
                design={activeDesign}
                className={`@container sarak-device-${previewDevice} w-full h-full flex flex-col overflow-hidden relative isolate ${activeDesign.texture && activeDesign.texture !== 'none' ? 'texture-active' : ''}`}
                data-sx-texture={activeDesign.texture}
            >
                <div
                    ref={containerRef}
                    className="absolute inset-0 z-0"
                    style={{ backgroundColor: activeDesign.globalBackgroundImageUrl ? 'transparent' : 'var(--sarak-bg-base)' }}
                />
                <div
                    className="absolute inset-0 origin-top-left overflow-hidden z-10"
                    style={{ width: `${(100 / scale).toFixed(2)}%`, height: `${(100 / scale).toFixed(2)}%`, transform: `scale(${scale})` }}
                >
                    <SarakAppChrome
                        brand={{ name: activeDesign.systemName || 'Sarak Preview' }}
                        navItems={navigationItems}
                        onNavigate={onNavigate}
                        style={{ width: '100%', height: '100%' }}
                    >
                        {activeApp}
                    </SarakAppChrome>
                </div>
            </SarakDesignScope>
        </SarakDeviceProvider>
    );
};

function PreviewSystemRendererImpl(props: PreviewSystemRendererProps): React.ReactElement {
    const {
        useSystemDesign = false,
        sarak,
        tokens,
        isDualView,
        previewDevice,
        activePreviewApp,
        selectPreviewApp,
        apps,
    } = props;
    const activeDesign = useSystemDesign ? (sarak?.design || {}) : tokens;
    const { containerRef, scale } = useContainerScale(isDualView ? 0.75 : 0.95);
    const navigationItems = React.useMemo<SarakNavItem[]>(
        () => createNavigationItems(apps, activePreviewApp),
        [apps, activePreviewApp],
    );
    const activeApp = apps[activePreviewApp] ?? Object.values(apps)[0] ?? null;
    const navigateToApp = React.useMemo(
        () => createNavigationHandler(apps, selectPreviewApp),
        [apps, selectPreviewApp],
    );

    return <PreviewDeviceSurface
        activeDesign={activeDesign}
        previewDevice={previewDevice}
        containerRef={containerRef}
        scale={scale}
        navigationItems={navigationItems}
        onNavigate={navigateToApp}
        activeApp={activeApp}
    />;
}

export const PreviewSystemRenderer = React.memo(PreviewSystemRendererImpl, arePreviewPropsEqual);
