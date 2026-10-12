import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useDesignVariables } from '../useDesignVariables';
import { sarakGetDefaultDesignState } from '../../master-map';
import { validateDesign } from '../../../Provider/utils/validation';
import type { SarakDesignState } from '../../../Provider/types';

/**
 * Uma variável, um dono: o mestre de raio chega ao canto não declarado, a exceção declarada vence só no canto
 * dela, e as semânticas que dividiam um nome têm cada uma o seu. O navegador confirma o computado
 * (`browser-tests/variavel-com-dono.spec.ts`); aqui se prova o que o motor ESCREVE.
 */
const build = (overrides: Record<string, unknown>) =>
    renderHook(() => useDesignVariables({ ...sarakGetDefaultDesignState(), ...overrides })).result.current;

/** Os valores que um `--x` recebe no CSS responsivo, na ordem de emissão (mob, tab, desk, e os escopos de dispositivo). */
const responsiveValues = (css: string, name: string): string[] =>
    css.split('\n')
        .map((line) => line.trim())
        .filter((line) => line.startsWith(`${name}:`))
        .map((line) => line.slice(name.length + 1).replace(/;$/, '').trim());

const MASTER = { mob: 20, tab: 20, desk: 20 };

describe('raio mestre + canto exceção', () => {
    it('o mestre sozinho escreve os quatro cantos, e o canto no padrão não escreve nada', () => {
        const { responsiveCSS, variables } = build({ cardBorderRadius: MASTER });
        for (const corner of ['tl', 'tr', 'bl', 'br']) {
            const values = responsiveValues(responsiveCSS, `--sarak-card-radius-${corner}`);
            expect(values.length).toBeGreaterThan(0);
            expect(new Set(values)).toEqual(new Set(['20px']));
            expect(variables[`--sarak-card-radius-${corner}`]).toBeUndefined();
        }
    });

    it('o padrão do canto passa pela validação (chaves reordenadas) e continua sem escrever', () => {
        const validated = validateDesign({ ...sarakGetDefaultDesignState(), cardBorderRadius: MASTER }) as unknown as Record<string, unknown>;
        const { responsiveCSS } = build(validated);
        expect(new Set(responsiveValues(responsiveCSS, '--sarak-card-radius-tl'))).toEqual(new Set(['20px']));
    });

    it('o canto declarado escreve depois do mestre, só no canto dele', () => {
        const { responsiveCSS } = build({ cardBorderRadius: MASTER, cardRadiusTL: { mob: 0, tab: 0, desk: 0 } });
        const tl = responsiveValues(responsiveCSS, '--sarak-card-radius-tl');
        expect(tl.slice(0, 2)).toEqual(['20px', '0px']);
        expect(new Set(responsiveValues(responsiveCSS, '--sarak-card-radius-tr'))).toEqual(new Set(['20px']));
    });

    it('vale igual para o botão', () => {
        const { responsiveCSS } = build({ btnBorderRadius: { mob: 30, tab: 30, desk: 30 }, btnRadiusBR: { mob: 4, tab: 4, desk: 4 } });
        expect(new Set(responsiveValues(responsiveCSS, '--sarak-btn-radius-tl'))).toEqual(new Set(['30px']));
        expect(responsiveValues(responsiveCSS, '--sarak-btn-radius-br').slice(0, 2)).toEqual(['30px', '4px']);
    });

    it('MUTAÇÃO: um canto escalar declarado vence o mestre também no inline (tema que declara o canto)', () => {
        const { variables } = build({ cardBorderRadius: MASTER, cardRadiusTR: 7 });
        expect(variables['--sarak-card-radius-tr']).toBe('7px');
    });
});

describe('nomes próprios das semânticas que dividiam uma variável', () => {
    it('--theme-surface é a cor de superfície; o fundo do cartão é --sarak-card-bg e --theme-card', () => {
        const { variables } = build({ surfaceColor: '#123456', cardBackgroundColor: '#654321' });
        expect(variables['--theme-surface']).toBe('#123456');
        expect(variables['--surface-color']).toBe('#123456');
        expect(variables['--sarak-card-bg']).toBe('#654321');
        expect(variables['--theme-card']).toBe('#654321');
    });

    it('--radius-theme é o raio do sistema; o do cartão é --sarak-card-radius', () => {
        const { responsiveCSS } = build({ borderRadius: { mob: 5, tab: 5, desk: 5 }, cardBorderRadius: MASTER });
        expect(new Set(responsiveValues(responsiveCSS, '--radius-theme'))).toEqual(new Set(['5px']));
        expect(new Set(responsiveValues(responsiveCSS, '--sarak-card-radius'))).toEqual(new Set(['20px']));
    });

    it('--theme-gap é do espaçamento do sistema e --theme-border-width é da espessura do sistema', () => {
        const { responsiveCSS, variables } = build({ layoutGap: { mob: 3, tab: 3, desk: 3 }, cardPaddingMd: { mob: 9, tab: 9, desk: 9 }, borderWidth: 2, cardBorderWidth: 5 });
        expect(new Set(responsiveValues(responsiveCSS, '--theme-gap'))).toEqual(new Set(['3px']));
        expect(variables['--theme-border-width']).toBe('2px');
        expect(variables['--sarak-card-border-width']).toBe('5px');
    });

    it('--sarak-bg-base é do bgBaseColor; --sarak-bg-body é do colorBgBody', () => {
        const { variables } = build({ colorBgBody: '#101010', bgBaseColor: '#202020' });
        expect(variables['--sarak-bg-base']).toBe('#202020');
        expect(variables['--sarak-bg-body']).toBe('#101010');
    });

    it('--theme-card-border não é mais a cor da borda do cartão (que é --sarak-card-border-color)', () => {
        const { variables } = build({ cardBackgroundColor: '#654321', cardBorderColor: '#abcdef' });
        expect(variables['--sarak-card-border-color']).toBe('#abcdef');
        expect(variables['--theme-card-border']).not.toBe('#abcdef');
    });
});

describe('todo nome lido existe', () => {
    it('os canais r, g, b do fundo do corpo e da barra lateral são emitidos', () => {
        const { variables } = build({ colorBgBody: '#102030', sidebarColor: '#405060' });
        expect(variables['--sarak-bg-body-rgb']).toBe('16, 32, 48');
        expect(variables['--sarak-sidebar-bg-rgb']).toBe('64, 80, 96');
    });
});

describe('o raio do sistema responsivo sobrevive à validação', () => {
    it('borderRadius responsivo do tema não vira o escalar 12', () => {
        const validated = validateDesign({ ...sarakGetDefaultDesignState(), borderRadius: { mob: 5, tab: 6, desk: 7 } } as unknown as SarakDesignState) as unknown as Record<string, unknown>;
        expect(validated.borderRadius).toEqual({ mob: 5, tab: 6, desk: 7 });
    });
});

describe('token de texto: o CSS distingue "declarado" de none pelo atributo', () => {
    it('cardShadow emite o atributo data-sx-card-shadow com o valor declarado', () => {
        const { result } = renderHook(() => useDesignVariables({ ...sarakGetDefaultDesignState(), cardShadow: '0 0 4px red' }));

        expect(result.current.attributes['data-sx-card-shadow']).toBe('0 0 4px red');
        expect(result.current.variables['--sarak-card-shadow']).toBe('0 0 4px red');
    });

    it('sem cardShadow declarada o atributo é none (o padrão do token)', () => {
        const { result } = renderHook(() => useDesignVariables(sarakGetDefaultDesignState()));

        expect(result.current.attributes['data-sx-card-shadow']).toBe('none');
    });
});

describe('texto sobre cor sólida: o motor escolhe o de maior contraste', () => {
    const on = (overrides: Record<string, unknown>) => build(overrides).variables;

    it('cor clara recebe texto escuro e cor escura recebe texto claro, em cada status', () => {
        const light = on({ statusErrorColor: '#fde047', statusSuccessColor: '#0b1020', statusWarningColor: '#ffff00', statusInfoColor: '#101830', secondaryColor: '#ffffff' });

        expect(light['--sarak-on-error']).toBe('#020617');
        expect(light['--sarak-on-success']).toBe('#ffffff');
        expect(light['--sarak-on-warning']).toBe('#020617');
        expect(light['--sarak-on-info']).toBe('#ffffff');
        expect(light['--sarak-on-secondary']).toBe('#020617');
    });

    it('a primária também segue o contraste: --theme-on-primary', () => {
        expect(on({ primaryColor: '#ffeb3b' })['--theme-on-primary']).toBe('#020617');
        expect(on({ primaryColor: '#1a237e' })['--theme-on-primary']).toBe('#ffffff');
    });

    it('a bolha do usuário translúcida compõe sobre o corpo antes de escolher', () => {
        const dark = on({ mode: 'dark', colorBgBody: '#050505', chatUserBg: 'rgba(255, 255, 255, 0.05)' });
        const light = on({ mode: 'light', colorBgBody: '#ffffff', chatUserBg: 'rgba(0, 0, 0, 0.05)' });

        expect(dark['--sarak-on-chat-user']).toBe('#ffffff');
        expect(light['--sarak-on-chat-user']).toBe('#020617');
    });

    it('--sarak-on-surface é o texto de maior contraste sobre o corpo, nos dois modos', () => {
        expect(on({ mode: 'dark', colorBgBody: '#0d1016' })['--sarak-on-surface']).toBe('#ffffff');
        expect(on({ mode: 'light', colorBgBody: '#f9fafb' })['--sarak-on-surface']).toBe('#020617');
    });

    it('cor que não é literal (var, color-mix) não emite a variável: a reserva do componente vale', () => {
        const variables = on({ statusErrorColor: 'var(--theme-primary)' });

        expect(variables['--sarak-on-error']).toBeUndefined();
    });
});
