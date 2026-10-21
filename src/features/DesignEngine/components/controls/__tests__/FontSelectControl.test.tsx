import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SarakUIProvider from '../../../../../core/Provider/SarakUIProvider';
import { FONT_OPTIONS } from '../../../../../core/Design/schema/typography';
import type { SarakCustomFont } from '../../../../../core/Provider/types';
import { FontSelectControl } from '../FontSelectControl';

const custom: SarakCustomFont[] = [{ family: 'Seletor Sans', category: 'Sans-Serif', files: [{ url: '/s.woff2', weight: 400 }] }];
const HOST_VALUE = "'Seletor Sans', sans-serif";

const Control: React.FC<{ onChange?: (value: string) => void }> = ({ onChange = vi.fn() }) => (
    <FontSelectControl label="Fonte de Títulos" options={FONT_OPTIONS} value="'Inter', sans-serif" onChange={onChange} />
);

describe('FontSelectControl — o seletor de fonte do painel', () => {
    it('lista a família do host registrada no Provider, e gravá-la entrega o valor do registro', () => {
        const onChange = vi.fn();
        render(<SarakUIProvider options={{ fonts: { custom } }}><Control onChange={onChange} /></SarakUIProvider>);
        expect(screen.getByRole('option', { name: 'Seletor Sans [Sans-Serif]' })).toBeInTheDocument();
        fireEvent.change(screen.getByRole('combobox'), { target: { value: HOST_VALUE } });
        expect(onChange).toHaveBeenCalledWith(HOST_VALUE);
    });

    it('sem fonte registrada (ou fora do Provider), só as opções do schema', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const { unmount } = render(<SarakUIProvider><Control /></SarakUIProvider>);
        expect(screen.getAllByRole('option')).toHaveLength(FONT_OPTIONS.length);
        unmount();
        render(<Control />);
        expect(screen.getAllByRole('option')).toHaveLength(FONT_OPTIONS.length);
        expect(screen.queryByRole('option', { name: /Seletor Sans/ })).toBeNull();
    });
});
