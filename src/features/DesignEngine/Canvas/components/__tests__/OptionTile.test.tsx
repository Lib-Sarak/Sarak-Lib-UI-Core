import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OptionTile } from '../OptionTile';

describe('OptionTile', () => {
    it('mostra a amostra escondida do leitor de tela e o nome fora dela', () => {
        const { container } = render(
            <OptionTile name="Glass" description="Vidro fosco" onApply={() => {}} peekTokens={() => null}>
                <button type="button">botão real da amostra</button>
            </OptionTile>,
        );
        const sample = container.querySelector('[aria-hidden="true"]') as HTMLElement;

        expect(sample).toHaveTextContent('botão real da amostra');
        expect(sample.contains(screen.getByRole('heading', { name: 'Glass' }))).toBe(false);
        expect(screen.getByText('Vidro fosco')).toBeInTheDocument();
    });

    it('a opção é um único botão acessível pelo nome: o botão da amostra não aninha em outro botão', () => {
        const onApply = vi.fn();
        const { container } = render(
            <OptionTile name="Glass" onApply={onApply} peekTokens={() => null}><button type="button">amostra</button></OptionTile>,
        );
        expect(container.querySelector('button button')).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: 'Glass' }));
        expect(onApply).toHaveBeenCalledTimes(1);
    });

    it('o botão da opção usa p-0, a exceção do CSS global de hover e aperto de botão, para não pintar a amostra', () => {
        render(<OptionTile name="Glass" onApply={() => {}} peekTokens={() => null}><span /></OptionTile>);
        expect(screen.getByRole('button', { name: 'Glass' })).toHaveClass('p-0', 'absolute', 'inset-0');
    });

    it('sem descrição não desenha o parágrafo', () => {
        const { container } = render(<OptionTile name="Glass" onApply={() => {}} peekTokens={() => null}><span /></OptionTile>);
        expect(container.querySelector('p')).toBeNull();
    });
});
