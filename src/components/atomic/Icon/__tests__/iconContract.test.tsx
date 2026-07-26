import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { SarakIcon } from '../SarakIcon';
import { IconMap } from '../IconMap';
import { ICON_NAMES, ICONE_DESCONHECIDO } from '../iconNames';
import { LUCIDE_ICONS } from '../families/lucideIcons';
import { PHOSPHOR_ICONS } from '../families/phosphorIcons';
import { TABLER_ICONS } from '../families/tablerIcons';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

/**
 * Contrato de ícones da Spec 41: nomes curados, paridade 1:1:1 entre as famílias e
 * degradação com aviso — nunca o acesso dinâmico ao barril que segurava ~1500 ícones.
 */
describe('Contrato de ícones (Spec 41 §2.2/§2.3)', () => {
    describe('paridade 1:1:1 entre as famílias', () => {
        it('toda família cobre exatamente os nomes de ICON_NAMES', () => {
            for (const familia of [LUCIDE_ICONS, PHOSPHOR_ICONS, TABLER_ICONS]) {
                expect(Object.keys(familia).sort()).toEqual([...ICON_NAMES].sort());
            }
        });

        it('o IconMap resolve os três componentes de cada nome', () => {
            for (const nome of ICON_NAMES) {
                const triple = IconMap[nome];
                expect(triple, `IconMap["${nome}"] ausente`).toBeDefined();
                expect(triple.lucide, `${nome}.lucide`).toBeTruthy();
                expect(triple.phosphor, `${nome}.phosphor`).toBeTruthy();
                expect(triple.tabler, `${nome}.tabler`).toBeTruthy();
            }
        });

        it('não há nome duplicado na lista pública', () => {
            expect(new Set(ICON_NAMES).size).toBe(ICON_NAMES.length);
        });
    });

    describe('resolução por família (token iconFamily)', () => {
        const renderComFamilia = (family: string, name: string) =>
            render(
                <SarakUIProvider config={{ mode: 'dark', iconFamily: family }}>
                    <SarakIcon name={name} size={16} />
                </SarakUIProvider>
            );

        it('lucide desenha no viewBox 24 (traço)', () => {
            const { container } = renderComFamilia('lucide', 'Check');
            expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 24 24');
        });

        it('phosphor desenha no viewBox 256 (preenchimento)', () => {
            const { container } = renderComFamilia('phosphor', 'Check');
            expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 256 256');
        });

        it('tabler desenha no viewBox 24', () => {
            const { container } = renderComFamilia('tabler', 'Check');
            expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 24 24');
        });
    });

    describe('nome desconhecido degrada com aviso, sem quebrar (postura da Spec 17)', () => {
        let warn: ReturnType<typeof vi.spyOn>;

        /** Só os avisos do átomo de ícone — o Provider emite outros, alheios a este contrato. */
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

        it('renderiza o ícone de aviso no lugar e não derruba a árvore', () => {
            const { container } = render(
                <SarakUIProvider config={{ mode: 'dark', iconFamily: 'lucide' }}>
                    <SarakIcon name="EsteIconeNaoExiste" size={16} />
                </SarakUIProvider>
            );

            expect(container.querySelector('svg')).toBeTruthy();
            expect(avisosDeIcone()).toHaveLength(1);
            expect(avisosDeIcone()[0]).toContain('EsteIconeNaoExiste');
            expect(avisosDeIcone()[0]).toContain(ICONE_DESCONHECIDO);
        });

        it('avisa uma única vez por nome, mesmo em vários renders', () => {
            const arvore = (
                <SarakUIProvider config={{ mode: 'dark' }}>
                    <SarakIcon name="OutroNomeInvalido" />
                    <SarakIcon name="OutroNomeInvalido" />
                </SarakUIProvider>
            );
            const { rerender } = render(arvore);
            rerender(arvore);

            expect(avisosDeIcone()).toHaveLength(1);
        });

        it('nome válido não emite aviso nenhum', () => {
            render(
                <SarakUIProvider config={{ mode: 'dark' }}>
                    <SarakIcon name="Settings" />
                </SarakUIProvider>
            );

            expect(avisosDeIcone()).toHaveLength(0);
        });
    });
});
