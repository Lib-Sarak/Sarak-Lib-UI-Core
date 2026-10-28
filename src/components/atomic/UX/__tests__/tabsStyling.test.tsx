import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
    TabLeading,
    TabTrailing,
    tabItemClassName,
    tabItemStyle,
    tabsListClassName,
    tabsListStyle,
} from '../tabsStyling';

describe('tabsStyling', () => {
    it('a lista sublinhada ganha borda inferior e a lista em pílulas ganha fundo', () => {
        expect(tabsListClassName('underlined')).toContain('border-b');
        expect(tabsListClassName('pills')).toContain('bg-theme-tint');
        expect(tabsListClassName('enclosed', 'extra')).toContain('extra');
    });

    it('o espaçamento da lista sai de token por variante', () => {
        expect(tabsListStyle('underlined')?.gap).toContain('--sarak-layout-gap-md');
        expect(tabsListStyle('pills')?.padding).toContain('--sarak-layout-gap-md');
        expect(tabsListStyle('enclosed')?.gap).toContain('--sarak-layout-gap-md');
    });

    it('o raio do item vem do token de botão e o item neutraliza caixa alta do átomo', () => {
        expect(tabItemStyle('pills').borderRadius).toContain('--sarak-btn-border-radius');
        expect(tabItemStyle('underlined').borderRadius).toBe('0px');
        expect(tabItemStyle('enclosed').textTransform).toBe('none');
    });

    it('a classe do item muda com ativo, desabilitado e largura total', () => {
        expect(tabItemClassName('underlined', true, false, false)).toContain('text-[var(--theme-primary)]');
        expect(tabItemClassName('underlined', false, false, false)).toContain('text-[var(--theme-muted)]');
        expect(tabItemClassName('pills', false, true, true)).toContain('cursor-not-allowed');
        expect(tabItemClassName('pills', false, false, true)).toContain('flex-1');
    });

    it('o indicador de pílula e o sublinhado só existem na aba ativa da variante certa', () => {
        const pill = render(<TabLeading variant="pills" isActive icon={<i data-testid="icone" />} />);
        expect(pill.container.querySelector('.-z-10')).not.toBeNull();
        expect(pill.getByTestId('icone')).toBeTruthy();

        const inactive = render(<TabLeading variant="pills" isActive={false} />);
        expect(inactive.container.querySelector('.-z-10')).toBeNull();

        expect(render(<TabTrailing variant="underlined" isActive />).container.firstElementChild).not.toBeNull();
        expect(render(<TabTrailing variant="underlined" isActive={false} />).container.firstElementChild).toBeNull();
        expect(render(<TabTrailing variant="pills" isActive />).container.firstElementChild).toBeNull();
    });
});
