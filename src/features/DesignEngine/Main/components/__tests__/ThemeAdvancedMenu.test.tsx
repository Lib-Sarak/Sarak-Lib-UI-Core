import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ThemeAdvancedMenu } from '../ThemeAdvancedMenu';
import { TypographySchema } from '../../../../../core/Design/schema/typography';

const setup = (viewMode: 'preview' | 'catalog' | 'templates' | 'command-center' = 'preview') => {
    const setViewMode = vi.fn();
    const user = userEvent.setup();
    render(<ThemeAdvancedMenu viewMode={viewMode} setViewMode={setViewMode} />);
    return { setViewMode, user, trigger: screen.getByRole('button', { name: /Avançado/ }) };
};

describe('ThemeAdvancedMenu', () => {
    it('começa fechado e anuncia o menu no botão', () => {
        const { trigger } = setup();

        expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByRole('menu')).toBeNull();
    });

    it('abre com Enter e lista as três entradas mais a volta ao modo normal', async () => {
        const { trigger, user } = setup();

        trigger.focus();
        await user.keyboard('{Enter}');

        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        const names = screen.getAllByRole('menuitem').map((item) => item.textContent);
        expect(names).toEqual(['Tabela de tokens', 'Busca por pilar', 'Temas e JSON', 'Voltar ao modo normal']);
    });

    it('abre com Espaço e foca a primeira entrada', async () => {
        const { trigger, user } = setup();

        trigger.focus();
        await user.keyboard(' ');

        expect(screen.getByRole('menuitem', { name: 'Tabela de tokens' })).toHaveFocus();
    });

    it('as setas navegam com volta circular, Home e End', async () => {
        const { trigger, user } = setup();
        trigger.focus();
        await user.keyboard('{Enter}');

        await user.keyboard('{ArrowDown}');
        expect(screen.getByRole('menuitem', { name: 'Busca por pilar' })).toHaveFocus();
        await user.keyboard('{ArrowUp}{ArrowUp}');
        expect(screen.getByRole('menuitem', { name: 'Voltar ao modo normal' })).toHaveFocus();
        await user.keyboard('{Home}');
        expect(screen.getByRole('menuitem', { name: 'Tabela de tokens' })).toHaveFocus();
        await user.keyboard('{End}');
        expect(screen.getByRole('menuitem', { name: 'Voltar ao modo normal' })).toHaveFocus();
    });

    it('uma seta para cima na primeira entrada foca a última; uma para baixo, a segunda', async () => {
        const { trigger, user } = setup();
        trigger.focus();
        await user.keyboard('{Enter}');
        expect(screen.getByRole('menuitem', { name: 'Tabela de tokens' })).toHaveFocus();

        await user.keyboard('{ArrowUp}');
        expect(screen.getByRole('menuitem', { name: 'Voltar ao modo normal' })).toHaveFocus();

        await user.keyboard('{Home}{ArrowDown}');
        expect(screen.getByRole('menuitem', { name: 'Busca por pilar' })).toHaveFocus();
    });

    it('Esc fecha o menu e devolve o foco ao botão', async () => {
        const { trigger, user } = setup();
        trigger.focus();
        await user.keyboard('{Enter}');

        await user.keyboard('{Escape}');

        expect(screen.queryByRole('menu')).toBeNull();
        expect(trigger).toHaveFocus();
    });

    it.each([
        ['Tabela de tokens', 'catalog'],
        ['Busca por pilar', 'command-center'],
        ['Temas e JSON', 'templates'],
        ['Voltar ao modo normal', 'preview']
    ])('a entrada %s abre a tela %s e devolve o foco', async (label, mode) => {
        const { setViewMode, trigger, user } = setup('catalog');
        await user.click(trigger);

        await user.click(screen.getByRole('menuitem', { name: label }));

        expect(setViewMode).toHaveBeenCalledWith(mode);
        expect(screen.queryByRole('menu')).toBeNull();
        expect(trigger).toHaveFocus();
    });

    it('clicar fora fecha o menu', async () => {
        const { trigger, user } = setup();
        await user.click(trigger);

        await user.click(document.body);

        expect(screen.queryByRole('menu')).toBeNull();
    });

    it('marca a tela atual com aria-current', async () => {
        const { trigger, user } = setup('templates');
        await user.click(trigger);

        expect(screen.getByRole('menuitem', { name: 'Temas e JSON' })).toHaveAttribute('aria-current', 'page');
        expect(screen.getByRole('menuitem', { name: 'Busca por pilar' })).not.toHaveAttribute('aria-current');
    });

    it('usa degrau de tipografia com padrão de pelo menos 12 px', () => {
        const { trigger } = setup();

        const caption = TypographySchema.tokens.find(({ id }) => id === 'typeScaleCaption');
        expect(Number(caption?.defaultValue)).toBeGreaterThanOrEqual(12);
        expect(trigger.className).toContain('--sarak-type-scale-caption');
    });
});
