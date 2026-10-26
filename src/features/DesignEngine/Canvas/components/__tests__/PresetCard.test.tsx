import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as ComponentModule from '../PresetCard';
import { PresetCard } from '../PresetCard';
import { SarakThemePreset } from '../../../../../core/Design/presets/themes';

describe('PresetCard', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
    });

    it('renders the selected theme preview', () => {
        const dummyTheme = {
            id: 'test',
            name: 'Test Theme',
            design: {
                primaryColor: '#ff0000',
                surfaceColor: '#000000',
                mode: 'dark'
            }
        };
        const { container } = render(
            <PresetCard theme={dummyTheme as unknown as SarakThemePreset} currentMode="dark" onApply={() => {}} index={0} />
        );
        expect(container.querySelector('button')).toBeInTheDocument();
        expect(container.querySelector('h3')).toHaveTextContent('Test Theme');
        expect(container.querySelector('.h-48')).toBeInTheDocument();
    });

    it('a miniatura de tema usa a contraparte no modo efetivo', () => {
        const theme = {
            id: 'tema-claro',
            name: 'Tema Claro',
            design: { mode: 'dark', surfaceColor: '#101622' },
            contraparte: { surfaceColor: '#ffffff' },
        };
        const { container } = render(
            <PresetCard theme={theme as unknown as SarakThemePreset} currentMode="light" onApply={() => {}} index={0} />,
        );
        const previewSurface = container.querySelector('.h-48') as HTMLElement;

        expect(previewSurface.style.backgroundColor).toBe('rgb(255, 255, 255)');
    });

    it('mantém o nome legível e permite que ele quebre em cartões estreitos', () => {
        const theme = { id: 'tema-longo', name: 'Tema com nome comprido', design: { mode: 'dark' } };
        const { container } = render(
            <PresetCard theme={theme as unknown as SarakThemePreset} currentMode="dark" onApply={() => {}} index={0} />,
        );
        const themeName = container.querySelector('h3');

        expect(themeName).toHaveClass('min-w-0', 'break-words', 'text-[var(--sarak-type-scale-caption,12px)]');
    });

    it('cardShadowSpread é a OPACIDADE da sombra em % (o sentido do schema), não um desfoque em px', () => {
        const theme = { id: 't', name: 'T', design: { primaryColor: '#ff0000', mode: 'dark', cardShadowSpread: 40 } };
        const { container } = render(
            <PresetCard theme={theme as unknown as SarakThemePreset} currentMode="dark" onApply={() => {}} index={0} />
        );
        const shadows = Array.from(container.querySelectorAll<HTMLElement>('[style]')).map((el) => el.style.boxShadow).filter(Boolean);

        expect(shadows.some((value) => value.includes('40%'))).toBe(true);
        expect(shadows.some((value) => /(^|\s)40px/.test(value))).toBe(false);
    });

    it('a textura grid desenha a grade com a cor de borda: nenhuma cor no lugar de posição de parada', () => {
        const theme = { id: 't', name: 'T', design: { primaryColor: '#ff0000', mode: 'dark', cardTextureType: 'grid' } };
        const { container } = render(
            <PresetCard theme={theme as unknown as SarakThemePreset} currentMode="dark" onApply={() => {}} index={0} />
        );
        const layer = Array.from(container.querySelectorAll<HTMLElement>('[style]')).find((el) => el.style.backgroundImage.includes('linear-gradient'));

        expect(layer, 'o gradiente é válido (o CSSOM o aceitou)').toBeDefined();
        expect(layer!.getAttribute('style')).toMatch(/var\(--border-color,rgba\([^)]*\)\) var\(--sarak-border-width, 1px\), transparent/);
        expect(layer!.getAttribute('style')).not.toMatch(/\) var\(--border-color/);
    });
});
