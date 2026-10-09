import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MoreScreensMock } from '../MoreScreensMock';
import { ADDITIONAL_PREVIEW_SCREENS } from '../../previewScreens';
import { AtmosphereSchema } from '../../../../../core/Design/schema/atmosphere';
import { CardSchema } from '../../../../../core/Design/schema/cards';
import { ColorsSchema } from '../../../../../core/Design/schema/colors';
import { SystemSchema } from '../../../../../core/Design/schema/system';
import { TypographySchema } from '../../../../../core/Design/schema/typography';

const getSchemaDefaultValue = (cssVariableName: string): unknown => {
    const schemas = [AtmosphereSchema, CardSchema, ColorsSchema, SystemSchema, TypographySchema];
    return schemas.flatMap(({ tokens }) => tokens)
        .find((token) => token.cssVars?.includes(cssVariableName))?.defaultValue;
};

describe('MoreScreensMock', () => {
    it('mostra as oito telas secundárias com nomes humanos', () => {
        render(<MoreScreensMock selectPreviewApp={vi.fn()} />);

        expect(screen.getByRole('heading', { name: 'Mais telas' })).toBeInTheDocument();
        expect(screen.getAllByRole('button')).toHaveLength(8);
        ADDITIONAL_PREVIEW_SCREENS.forEach(({ label }) => {
            expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
        });
    });

    it('usa tokens visuais com os defaults definidos no schema', () => {
        render(<MoreScreensMock selectPreviewApp={vi.fn()} />);

        const main = screen.getByRole('main');
        const title = screen.getByRole('heading', { name: 'Mais telas' });
        const supportingText = screen.getByText('Escolha outra tela para continuar a prévia.');

        expect(main.className).toContain('--sarak-layout-gap-md');
        expect(getSchemaDefaultValue('--sarak-layout-gap-md')).toEqual({ mob: 16, tab: 20, desk: 24 });
        expect(main.className).toContain('--theme-bg,#050505');
        expect(getSchemaDefaultValue('--theme-bg')).toBe('#050505');
        expect(title.className).toContain('--sarak-type-scale-xl');
        expect(getSchemaDefaultValue('--sarak-type-scale-xl')).toBe(20);
        expect(supportingText.className).toContain('--sarak-type-scale-caption');
        expect(getSchemaDefaultValue('--sarak-type-scale-caption')).toBe(12);
        expect(supportingText.className).toContain('--theme-muted');
        expect(getSchemaDefaultValue('--theme-muted')).toBe('rgba(255, 255, 255, 0.4)');
    });

    it.each(ADDITIONAL_PREVIEW_SCREENS)('seleciona $label ao escolher a tela', ({ id, label }) => {
        const selectPreviewApp = vi.fn();
        render(<MoreScreensMock selectPreviewApp={selectPreviewApp} />);

        fireEvent.click(screen.getByRole('button', { name: label }));

        expect(selectPreviewApp).toHaveBeenCalledTimes(1);
        expect(selectPreviewApp).toHaveBeenCalledWith(id);
    });
});
