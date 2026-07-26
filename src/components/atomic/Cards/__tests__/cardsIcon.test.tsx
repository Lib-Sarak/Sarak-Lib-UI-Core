import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { SarakActionCard } from '../SarakActionCard';
import { SarakTitleCard } from '../SarakTitleCard';
import { SarakCoreCard } from '../../Templates/components/SarakCoreCard';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

/**
 * Spec 41 §2.2: os cards resolvem `mapping.icon` pelo átomo `SarakIcon`/`IconMap`
 * curado — não mais por índice dinâmico no barril do `lucide-react`. Consequência
 * visível: o ícone do card passa a obedecer o token `iconFamily` do Design Engine.
 */
describe('Ícone dos cards pelo átomo SarakIcon (Spec 41 §2.2)', () => {
    const item = { id: '1', title: 'Contrato #1', desc: 'Em revisão' };
    const mappingValido = { title: 'title', subtitle: 'id', description: 'desc', icon: 'Activity' };

    const comFamilia = (family: string, node: React.ReactNode) =>
        render(<SarakUIProvider config={{ mode: 'dark', iconFamily: family }}>{node}</SarakUIProvider>);

    /** viewBox 24 = lucide/tabler (traço); 256 = phosphor (preenchimento). */
    const viewBoxes = (container: HTMLElement) =>
        [...container.querySelectorAll('svg')].map((svg) => svg.getAttribute('viewBox'));

    describe('nome válido respeita o token iconFamily', () => {
        it('SarakActionCard desenha lucide sob iconFamily lucide', () => {
            const { container } = comFamilia('lucide', <SarakActionCard item={item} mapping={mappingValido} />);
            expect(viewBoxes(container)).toContain('0 0 24 24');
        });

        it('SarakActionCard desenha phosphor sob iconFamily phosphor', () => {
            const { container } = comFamilia('phosphor', <SarakActionCard item={item} mapping={mappingValido} />);
            expect(viewBoxes(container)).toContain('0 0 256 256');
        });

        it('SarakTitleCard desenha phosphor sob iconFamily phosphor', () => {
            const { container } = comFamilia('phosphor', <SarakTitleCard item={item} mapping={mappingValido} />);
            expect(viewBoxes(container)).toContain('0 0 256 256');
        });

        it('SarakCoreCard (variante classic) desenha phosphor sob iconFamily phosphor', () => {
            const { container } = comFamilia(
                'phosphor',
                <SarakCoreCard item={item} mapping={mappingValido} variant="classic" />
            );
            expect(viewBoxes(container)).toContain('0 0 256 256');
        });
    });

    describe('nome fora do contrato degrada com aviso, sem quebrar o card', () => {
        let warn: ReturnType<typeof vi.spyOn>;

        const avisosDeIcone = (): string[] =>
            warn.mock.calls
                .map((call: unknown[]) => String(call[0]))
                .filter((texto: string) => texto.includes('[Sarak:Icon]'));

        beforeEach(() => {
            warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        });

        afterEach(() => {
            warn.mockRestore();
        });

        it.each([
            ['SarakActionCard', (mapping: Record<string, string>) => <SarakActionCard item={item} mapping={mapping} />],
            ['SarakTitleCard', (mapping: Record<string, string>) => <SarakTitleCard item={item} mapping={mapping} />],
            [
                'SarakCoreCard',
                (mapping: Record<string, string>) => <SarakCoreCard item={item} mapping={mapping} variant="classic" />,
            ],
        ])('%s renderiza o título e avisa, em vez de quebrar', (nome, montar) => {
            const { container } = comFamilia(
                'lucide',
                montar({ ...mappingValido, icon: `IconeInexistente${nome}` })
            );

            expect(container.textContent).toContain('Contrato #1');
            expect(container.querySelectorAll('svg').length).toBeGreaterThan(0);
            expect(avisosDeIcone().some((texto) => texto.includes(`IconeInexistente${nome}`))).toBe(true);
        });
    });
});
