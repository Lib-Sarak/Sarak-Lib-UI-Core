import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SarakInput } from '../SarakInput';
import { SarakSelect } from '../SarakSelect';
import { SarakTextarea } from '../SarakTextarea';
import { sarakGetAllDesignTokens } from '../../../../core/Design/master-map';

const PADDING_READER = 'py-[var(--sarak-input-padding,1rem)]';
const PX_PER_REM = 16;

describe('inputPadding — o padding vertical do campo lê --sarak-input-padding', () => {
    it('SarakInput lê a variável do token no padding vertical', () => {
        render(<SarakInput placeholder="nome" />);
        expect(screen.getByPlaceholderText('nome').className).toContain(PADDING_READER);
    });

    it('SarakSelect lê a variável do token no padding vertical', () => {
        render(<SarakSelect aria-label="opção"><option value="a">A</option></SarakSelect>);
        expect(screen.getByRole('combobox').className).toContain(PADDING_READER);
    });

    it('SarakTextarea lê a variável do token só no eixo vertical', () => {
        render(<SarakTextarea aria-label="texto" />);
        const className = screen.getByRole('textbox').className;
        expect(className).toContain(PADDING_READER);
        expect(className).toContain('px-4');
    });

    it('o valor padrão do schema (px) é o que o fallback de 1rem desenhava', () => {
        const token = sarakGetAllDesignTokens().find((item) => item.id === 'inputPadding');
        expect(token?.defaultValue).toBe(PX_PER_REM);
    });
});
