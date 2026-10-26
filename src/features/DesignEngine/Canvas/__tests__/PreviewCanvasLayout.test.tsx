import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PreviewCanvasLayout, type PreviewCanvasLayoutProps } from '../PreviewCanvasLayout';
import { getPreviewLayoutPreset } from '../panelResponsive.presets';
import type { SarakUIContextType } from '../../../../core/Provider/types';

vi.mock('../../../../core/Design/components/DesignScope', () => ({
    SarakDesignScope: (props: { children: ReactNode }): ReactNode => props.children,
}));

vi.mock('../../../../core/Provider/components/SarakStyle', () => ({
    SarakStyle: (): null => null,
}));

vi.mock('../components/PresetsCatalog', () => ({
    PresetsCatalog: (): null => null,
}));

vi.mock('../components/LiveDraftPreviewFrame', () => ({
    LiveDraftPreviewFrame: (): null => null,
}));

const createLayoutProps = (isStacked: boolean): PreviewCanvasLayoutProps => ({
    design: {},
    contextValue: {} as SarakUIContextType,
    previewDevice: 'desktop',
    targetWidth: '100%',
    deviceAspectRatio: undefined,
    getDeviceFrameStyles: () => '',
    isDualView: true,
    isGalleryStacked: isStacked,
    isInspecting: false,
    setIsInspecting: () => {},
    mode: 'light',
    draftMode: 'light',
    sarak: {} as SarakUIContextType,
    onApplyPreset: () => {},
    previewContent: null,
    layoutPreset: getPreviewLayoutPreset(isStacked),
});

describe('PreviewCanvasLayout', () => {
    it('mantém o dual-view responsivo ao espaço do container', () => {
        render(<PreviewCanvasLayout {...createLayoutProps(false)} />);

        const previewLayout = screen.getByTestId('preview-layout');
        expect(previewLayout.className).toContain('@min-[524px]:flex-row');
        expect(screen.getByTestId('catalog-preview-frame')).toBeInTheDocument();
    });

    it('dimensiona o quadro do catálogo pela área visível no modo empilhado', () => {
        render(<PreviewCanvasLayout {...createLayoutProps(true)} />);

        const previewLayout = screen.getByTestId('preview-layout');
        const catalogFrame = screen.getByTestId('catalog-preview-frame');
        expect(previewLayout.className).toContain('flex-col');
        expect(previewLayout.className).toContain('overflow-y-auto');
        expect(catalogFrame.style.height).toBe('calc(100% - 1.5rem)');
    });
});
