import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import SarakUIProvider from '../../../../../core/Provider/SarakUIProvider';
import { BrandShortcut } from '../BrandShortcut';
import { TYPOGRAPHY_PRESETS } from '../../../../../core/Design/presets/components/typography';

const FIRST_PAIR = TYPOGRAPHY_PRESETS[0];

const renderBrand = () => {
    const props = {
        draft: { mode: 'dark', headingFont: FIRST_PAIR.design.headingFont, bodyFont: FIRST_PAIR.design.bodyFont } as never,
        appliedDesign: {},
        updateDraft: vi.fn(),
        onPeek: vi.fn(),
        setPendingBranding: vi.fn(),
        onGenerated: vi.fn(),
    };
    render(<SarakUIProvider><BrandShortcut {...props} /></SarakUIProvider>);
    return props;
};

describe('BrandShortcut', () => {
    it('abre vazio: sem nome, sem logo, com a cor e o par de fontes do rascunho, e não espia nada ainda', () => {
        const { onPeek } = renderBrand();

        expect(screen.getByLabelText('Nome da empresa')).toHaveValue('');
        expect(screen.getByLabelText('Estilo das fontes')).toHaveValue(FIRST_PAIR.id);
        expect(onPeek).not.toHaveBeenCalledWith(expect.objectContaining({ systemName: expect.anything() }));
    });

    it('cada campo faz a prévia reagir com nome, paleta e fontes — sem tocar no rascunho', async () => {
        const user = userEvent.setup();
        const { onPeek, updateDraft } = renderBrand();

        await user.type(screen.getByLabelText('Nome da empresa'), 'Acme');
        const otherPair = TYPOGRAPHY_PRESETS.find((preset) => preset.design.headingFont !== FIRST_PAIR.design.headingFont)!;
        fireEvent.change(screen.getByLabelText('Estilo das fontes'), { target: { value: otherPair.id } });

        await waitFor(() => expect(onPeek).toHaveBeenLastCalledWith(expect.objectContaining({ systemName: 'Acme', headingFont: otherPair.design.headingFont, colorPalette: expect.stringMatching(/^custom:analogous:#/) })));
        expect(updateDraft).not.toHaveBeenCalled();
    });

    it('"Gerar meu tema" grava paleta e fontes no rascunho, entrega o nome como marca pendente e encerra a espiada', async () => {
        const user = userEvent.setup();
        const { updateDraft, setPendingBranding, onGenerated, onPeek } = renderBrand();
        await user.type(screen.getByLabelText('Nome da empresa'), 'Acme');

        await user.click(screen.getByRole('button', { name: 'Gerar meu tema' }));

        await waitFor(() => expect(onGenerated).toHaveBeenCalledTimes(1));
        expect(updateDraft).toHaveBeenCalledWith('colorPalette', expect.stringMatching(/^custom:analogous:#/));
        expect(updateDraft).toHaveBeenCalledWith('headingFont', expect.any(String));
        expect(updateDraft).toHaveBeenCalledWith('bodyFont', expect.any(String));
        expect(setPendingBranding).toHaveBeenCalledWith({ companyName: 'Acme', logoBase64: null });
        expect(onPeek).toHaveBeenLastCalledWith(null);
    });
});
