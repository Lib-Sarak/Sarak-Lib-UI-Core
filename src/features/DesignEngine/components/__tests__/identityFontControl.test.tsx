import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrandingSchema } from '../../../../core/Design/schema/branding';
import { THEME_FONTS } from '../../../../core/Design/schema/typography';
import { SelectControl } from '../controls/BasicControls';

const token = () => {
    const found = BrandingSchema.tokens.find((item) => item.id === 'identityFontFamily');
    if (!found) throw new Error('identityFontFamily ausente do schema');
    return found;
};

describe('identityFontFamily — o controle do painel oferece fontes', () => {
    it('a lista traz o padrão (herdar a fonte de títulos) e todas as fontes do tema', () => {
        const options = token().constraints?.options ?? [];
        expect(options[0]?.id).toBe(token().defaultValue);
        expect(options.slice(1).map((option) => option.id)).toEqual(THEME_FONTS.map((font) => font.value));
    });

    it('com o valor padrão, o seletor marca o item do padrão em vez de abrir vazio', () => {
        const options = token().constraints?.options ?? [];
        render(<SelectControl label="Fonte do Logo" options={options} value={String(token().defaultValue)} onChange={() => undefined} isFont />);
        const select = screen.getByRole('combobox') as HTMLSelectElement;
        expect(select.value).toBe(String(token().defaultValue));
        expect(select.selectedOptions[0]?.textContent).toContain('padrão');
    });
});
