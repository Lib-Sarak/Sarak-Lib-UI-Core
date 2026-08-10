import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { SarakScrim } from '../SarakScrim';

describe('SarakScrim', () => {
    it('é um <button> nativo com o rótulo acessível recebido', () => {
        const { getByRole } = render(<SarakScrim onClose={() => {}} ariaLabel="Fechar menu" />);
        const scrim = getByRole('button', { name: 'Fechar menu' });
        expect(scrim.tagName).toBe('BUTTON');
        expect(scrim).toHaveAttribute('type', 'button');
        expect(scrim.tabIndex).not.toBe(-1);
    });

    it('clique chama onClose', () => {
        const onClose = vi.fn();
        const { getByRole } = render(<SarakScrim onClose={onClose} ariaLabel="Fechar menu" />);
        fireEvent.click(getByRole('button', { name: 'Fechar menu' }));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('cobre a tela cheia atrás do overlay (fixed inset-0)', () => {
        const { getByRole } = render(<SarakScrim onClose={() => {}} ariaLabel="Fechar menu" />);
        const scrim = getByRole('button', { name: 'Fechar menu' });
        expect(scrim.className).toContain('fixed');
        expect(scrim.className).toContain('inset-0');
    });

    describe('animate (opcional — plan-23)', () => {
        it('sem `animate`, continua um <button> puro, sem atributos de motion (default = comportamento de hoje)', () => {
            const { getByRole } = render(<SarakScrim onClose={() => {}} ariaLabel="Fechar menu" />);
            const scrim = getByRole('button', { name: 'Fechar menu' });
            expect(scrim.tagName).toBe('BUTTON');
            // framer-motion injeta um atributo `style` com transform/willChange quando é
            // um motion.button; sem `animate`, o elemento é o <button> nativo puro.
            expect(scrim.getAttribute('style')).not.toMatch(/transform|will-change/);
        });

        it('com `animate`, continua sendo <button> (motion.button renderiza a tag nativa) e aciona onClose', () => {
            const onClose = vi.fn();
            const { getByRole } = render(<SarakScrim animate onClose={onClose} ariaLabel="Fechar menu" />);
            const scrim = getByRole('button', { name: 'Fechar menu' });
            expect(scrim.tagName).toBe('BUTTON');
            fireEvent.click(scrim);
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('`style` do consumidor sobrepõe o fundo padrão, sem quebrar o `animate`', () => {
            const { getByRole } = render(
                <SarakScrim animate onClose={() => {}} ariaLabel="Fechar menu" style={{ background: 'rgb(1,2,3)' }} />,
            );
            const scrim = getByRole('button', { name: 'Fechar menu' });
            expect(scrim.getAttribute('style')).toContain('rgb(1, 2, 3)');
        });
    });

    describe('SarakAppChromeMobile — o único uso publicado hoje NÃO muda (plan-23, critério de aceite)', () => {
        it('chamado sem nenhuma prop de animação, continua um <button> estático idêntico ao de antes', () => {
            // Reproduz a chamada exata de SarakAppChromeMobile.tsx: só onClose + ariaLabel.
            const { getByRole } = render(<SarakScrim onClose={() => {}} ariaLabel="Fechar menu de navegação" />);
            const scrim = getByRole('button', { name: 'Fechar menu de navegação' });
            expect(scrim.tagName).toBe('BUTTON');
            expect(scrim).toHaveAttribute('type', 'button');
            expect(scrim.className).toContain('fixed');
            expect(scrim.className).toContain('inset-0');
            expect(scrim.getAttribute('style')).not.toMatch(/transform|will-change/);
        });
    });
});
