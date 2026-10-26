import React from 'react';
import { SarakScrim } from '../../atomic/Layouts/SarakScrim';
import type { FocusTrap } from '../../atomic/Modals/hooks/useFocusTrap';
import type { ChromeBackgroundStyle, ChromeBorderSide, ChromeBorderStyle } from '../../../core/Provider/useNavigationAppearance';
import { resolveChromeBackground, resolveChromeSurfaceBorderStyle } from './chromeStructuralStyles';
import { chromeNoiseLayerStyle } from './noiseTexture';

export interface ChromeMobileDrawerProps {
    isOpen: boolean;
    drawerId: string;
    onClose: () => void;
    closeLabel: string;
    onKeyDown: FocusTrap['handleTrap'];
    containerRef: FocusTrap['containerRef'];
    backgroundStyle: ChromeBackgroundStyle;
    borderSide: ChromeBorderSide;
    borderStyle: ChromeBorderStyle;
    children: React.ReactNode;
}

type ChromeMobileDrawerPanelProps = Omit<ChromeMobileDrawerProps, 'isOpen' | 'onClose' | 'closeLabel'>;

function createChromeMobileDrawerStyle({ backgroundStyle, borderSide, borderStyle }: ChromeMobileDrawerPanelProps): React.CSSProperties {
    return {
        width: 'var(--sarak-sidebar-width, 240px)',
        background: resolveChromeBackground(backgroundStyle, '--sarak-sidebar-bg', 'var(--theme-sidebar-bg, var(--bg-body, #06080d))'),
        ...resolveChromeSurfaceBorderStyle({
            side: borderSide,
            style: borderStyle,
            widthVariable: '--sarak-sidebar-border-width',
            colorVariable: '--sarak-sidebar-border-color',
            surface: 'sidebar',
            sidebarPosition: 'left',
        }),
        backdropFilter: 'blur(var(--sarak-sidebar-blur, 10px))',
        boxShadow: 'var(--sarak-sidebar-shadow, none)',
    };
}

function ChromeMobileDrawerPanel(props: ChromeMobileDrawerPanelProps): React.ReactElement {
    const { drawerId, onKeyDown, containerRef, backgroundStyle, children } = props;
    return (
        <aside
            id={drawerId}
            ref={containerRef}
            onKeyDown={onKeyDown}
            className="fixed inset-y-0 left-0 z-50 flex flex-col shrink-0 overflow-y-auto max-w-[85vw]"
            style={createChromeMobileDrawerStyle(props)}
        >
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none mix-blend-overlay"
                style={chromeNoiseLayerStyle('--sarak-sidebar-noise-opacity', backgroundStyle === 'texture')}
            />
            {children}
        </aside>
    );
}

export const ChromeMobileDrawer: React.FC<ChromeMobileDrawerProps> = (
    props: ChromeMobileDrawerProps,
): React.ReactElement | null => {
    if (!props.isOpen) return null;

    return (
        <>
            <SarakScrim onClose={props.onClose} ariaLabel={props.closeLabel} />
            <ChromeMobileDrawerPanel {...props} />
        </>
    );
};
