import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SarakInput } from '../SarakInput';
import { SarakSelect } from '../SarakSelect';
import { SarakTextarea } from '../SarakTextarea';
import { sarakGetAllDesignTokens } from '../../../../core/Design/master-map';

const LEGACY_PADDING_READER = 'py-[var(--sarak-input-padding,16px)]';
const SARAK_INPUT_PADDING_READER = 'py-[var(--sarak-input-padding-vertical,var(--sarak-input-padding,16px))]';
const HORIZONTAL_PADDING_READER = 'pl-[var(--sarak-input-padding-horizontal,16px)]';
const PX_PER_REM = 16;

describe('inputPadding — eixos explícitos com compatibilidade vertical', () => {
    it('SarakInput lê as variáveis vertical e horizontal', () => {
        render(<SarakInput placeholder="nome" />);
        const input = screen.getByPlaceholderText('nome');
        expect(input.className).toContain(SARAK_INPUT_PADDING_READER);
        expect(input.className).toContain(HORIZONTAL_PADDING_READER);
        expect(input.className).toContain('pr-[var(--sarak-input-padding-horizontal,16px)]');
    });

    it('SarakSelect lê a variável do token no padding vertical', () => {
        render(<SarakSelect aria-label="opção"><option value="a">A</option></SarakSelect>);
        expect(screen.getByRole('combobox').className).toContain(LEGACY_PADDING_READER);
    });

    it('SarakTextarea lê a variável do token só no eixo vertical', () => {
        render(<SarakTextarea aria-label="texto" />);
        const className = screen.getByRole('textbox').className;
        expect(className).toContain(LEGACY_PADDING_READER);
        expect(className).toContain('px-4');
    });

    it('o schema declara eixo, padrão e variáveis públicas de cada token', () => {
        const tokens = sarakGetAllDesignTokens();
        const vertical = tokens.find((item) => item.id === 'inputPadding');
        const horizontal = tokens.find((item) => item.id === 'inputPaddingHorizontal');

        expect(vertical?.defaultValue).toBe(PX_PER_REM);
        expect(vertical?.cssVars).toEqual(['--sarak-input-padding-vertical', '--sarak-input-padding']);
        expect(horizontal?.defaultValue).toBe(PX_PER_REM);
        expect(horizontal?.cssVars).toEqual(['--sarak-input-padding-horizontal']);
    });
});
