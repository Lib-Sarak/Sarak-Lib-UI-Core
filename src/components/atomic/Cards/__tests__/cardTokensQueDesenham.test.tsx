import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SarakCard } from '../SarakCard';
import { SarakCardHeader } from '../SarakCardHeader';
import { SarakCardFooter } from '../SarakCardFooter';
import { SarakActionCard } from '../SarakActionCard';
import { SarakSearchCard } from '../SarakSearchCard';
import { SarakTitleCard } from '../SarakTitleCard';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { CardTitleSchema } from '../../../../core/Design/schema/card-title';
import { useDesignVariables } from '../../../../core/Design/hooks/useDesignVariables';
import { renderHook } from '@testing-library/react';

/**
 * Prova de leitor: cada token do cartão que o painel oferece chega ao elemento que o rótulo
 * nomeia. O jsdom não computa `var()`/`color-mix`, então a prova aqui é sobre o que o
 * componente entrega (classe, `style`); o valor computado é de `browser-tests/`.
 */
const item = { id: '1', title: 'Contrato', desc: 'Descrição' };
const mapping = { title: 'title', subtitle: 'id', description: 'desc' };

describe('cabeçalho e rodapé do cartão', () => {
    it('o cabeçalho lê fundo, linha divisória e padding vertical dos tokens', () => {
        render(<SarakCardHeader>Título</SarakCardHeader>);
        const header = screen.getByText('Título').closest('header');
        expect(header?.className).toContain('var(--sarak-card-header-bg,transparent)');
        expect(header?.className).toContain('var(--sarak-card-header-border,transparent)');
        expect(header?.className).toContain('var(--sarak-card-header-padding,0px)');
    });

    it('o rodapé lê fundo e linha divisória dos tokens', () => {
        render(<SarakCardFooter>Ações</SarakCardFooter>);
        const footer = screen.getByText('Ações').closest('footer');
        expect(footer?.className).toContain('var(--sarak-card-footer-bg,transparent)');
        expect(footer?.className).toContain('var(--sarak-card-footer-border,transparent)');
    });

    it('o className do consumidor ainda sobrescreve o fundo do cabeçalho', () => {
        render(<SarakCardHeader className="bg-red-500">Título</SarakCardHeader>);
        const header = screen.getByText('Título').closest('header');
        expect(header).toHaveClass('bg-red-500');
        expect(header?.className).not.toContain('--sarak-card-header-bg');
    });
});

describe('botão de ação do SarakActionCard', () => {
    it('no estilo padrão o botão ganha a classe preenchida que lê fundo e texto', () => {
        render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakActionCard item={item} mapping={mapping} />
            </SarakUIProvider>,
        );
        const button = screen.getByText('Executar').closest('button');
        expect(button).toHaveClass('sarak-card-action-btn', 'sarak-card-action-btn--filled');
    });

    it('no estilo borderline o fundo transparente do estilo é preservado', () => {
        render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakActionCard item={item} mapping={mapping} design={{ btnStyleType: 'borderline' }} />
            </SarakUIProvider>,
        );
        const button = screen.getByText('Executar').closest('button');
        expect(button).toHaveClass('sarak-card-action-btn');
        expect(button).not.toHaveClass('sarak-card-action-btn--filled');
    });
});

describe('campo do SarakSearchCard', () => {
    it('a raiz do cartão carrega a classe que escopa placeholder, fundo e texto focados', () => {
        const { container } = render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakSearchCard item={item} />
            </SarakUIProvider>,
        );
        const root = container.querySelector('.sarak-search-card');
        expect(root).not.toBeNull();
        expect(root?.querySelector('input')).not.toBeNull();
    });
});

describe('cardTitleFontWeight — uma prova por opção', () => {
    const options = (CardTitleSchema.tokens.find((token) => token.id === 'cardTitleFontWeight')?.constraints?.options ?? [])
        .map((option) => String(option.value));

    it('o schema oferece as seis opções', () => {
        expect(options).toEqual(['300', '400', '500', '600', '700', '900']);
    });

    it.each(['300', '400', '500', '600', '700', '900'])('a opção %s vira o font-weight do título', (weight) => {
        render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakTitleCard item={item} mapping={mapping} design={{ cardTitleFontWeight: weight } as never} />
            </SarakUIProvider>,
        );
        expect(screen.getByRole('heading', { level: 4 })).toHaveStyle({ fontWeight: weight });
    });

    it.each(['300', '400', '500', '600', '700', '900'])('o motor emite a opção %s na variável que o título lê', (weight) => {
        const { result } = renderHook(() => useDesignVariables({ cardTitleFontWeight: weight }));
        expect(result.current.variables['--sarak-card-title-font-weight']).toBe(weight);
        expect(result.current.attributes['data-sx-card-title-font-weight']).toBe(weight);
    });

    it('sem a opção no design, o título cai na variável global do tema', () => {
        render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakTitleCard item={item} mapping={mapping} design={{}} />
            </SarakUIProvider>,
        );
        expect(screen.getByRole('heading', { level: 4 }).getAttribute('style')).toContain('var(--sarak-card-title-font-weight, 900)');
    });
});

describe('cartão interativo — o critério do hover (`data-sx-card-interactive`)', () => {
    it('SarakCard é contêiner por padrão: sem a marca, o CSS de hover não o alcança', () => {
        const { container } = render(<SarakCard>Painel</SarakCard>);
        expect(container.querySelector('.sarak-card')?.hasAttribute('data-sx-card-interactive')).toBe(false);
    });

    it('SarakCard com `interactive` é marcado como alvo do ponteiro', () => {
        const { container } = render(<SarakCard interactive>Clicável</SarakCard>);
        expect(container.querySelector('.sarak-card')?.getAttribute('data-sx-card-interactive')).toBe('true');
    });

    it('SarakTitleCard, que sempre subiu no hover, segue marcado', () => {
        const { container } = render(
            <SarakUIProvider><SarakTitleCard item={item} mapping={mapping} /></SarakUIProvider>,
        );
        expect(container.querySelector('.sarak-card')?.getAttribute('data-sx-card-interactive')).toBe('true');
    });

    it('SarakActionCard e SarakSearchCard (a superfície não é o alvo; há botão/campo dentro) não são marcados', () => {
        const { container } = render(
            <SarakUIProvider>
                <SarakActionCard item={item} mapping={mapping} />
                <SarakSearchCard item={item} />
            </SarakUIProvider>,
        );
        container.querySelectorAll('.sarak-card').forEach((card) => {
            expect(card.hasAttribute('data-sx-card-interactive')).toBe(false);
        });
    });
});
