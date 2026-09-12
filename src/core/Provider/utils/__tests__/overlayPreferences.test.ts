import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { overlayPreferences } from '../overlayPreferences';
import { useDesignVariables } from '../../../Design/hooks/useDesignVariables';
import type { SarakDesignState, ThemeEntry } from '../../types';

// Contraparte AUTORADA mínima, no mesmo formato de um tema real (`GLOBAL_THEMES`)
// — só os tokens que carregam modo, como a spec 09 §2.1 descreve (55 de 423).
const temaComContraparte: ThemeEntry = {
    id: 'tema-de-teste',
    design: { mode: 'light', colorBgBody: '#f9f5f1', primaryColor: '#e11d48' },
    contraparte: { mode: 'dark', colorBgBody: '#0e0a06' } as Partial<SarakDesignState>,
};

describe('overlayPreferences', () => {
    it('sem preferência nenhuma, o design não muda', () => {
        const design = { mode: 'light', colorBgBody: '#fff' } as unknown as SarakDesignState;
        const result = overlayPreferences(design, {}, undefined, 'light');
        expect(result).toEqual(design);
    });

    describe('colorMode — só os tokens que carregam modo mudam, contra o modo NATIVO da entrada', () => {
        it('pedir o modo em que o tema já está devolve EXATAMENTE o design do tema', () => {
            const design = { ...temaComContraparte.design, navigationStyle: 'sidebar' } as unknown as SarakDesignState;
            const result = overlayPreferences(design, { colorMode: 'light' }, temaComContraparte, 'light');
            expect(result).toEqual(design);
        });

        it('pedir o modo OPOSTO aplica só os tokens da contraparte — o resto do design atual sobrevive', () => {
            const design = {
                ...temaComContraparte.design,
                navigationStyle: 'sidebar', // customização do administrador — NÃO carrega modo
                primaryColor: '#e11d48', // idem — cor de marca não está na contraparte
                globalBackgroundImageUrl: '/assets/fundo.png', // idem
            } as unknown as SarakDesignState;

            const result = overlayPreferences(design, { colorMode: 'dark' }, temaComContraparte, 'light');

            expect(result.mode).toBe('dark');
            expect(result.colorBgBody).toBe('#0e0a06'); // valor AUTORADO da contraparte
            // Nada que a contraparte não declara pode mudar.
            expect(result.navigationStyle).toBe('sidebar');
            expect(result.primaryColor).toBe('#e11d48');
            expect(result.globalBackgroundImageUrl).toBe('/assets/fundo.png');
        });

        it('tema salvo pelo painel no modo OPOSTO ao nativo + usuário pede o NATIVO → restaura a paleta nativa', () => {
            // O design AO VIVO já está no modo oposto (é o que o toggle do painel produz:
            // recarrega o tema inteiro na contraparte) — cenário diferente do teste acima,
            // onde o design ao vivo ainda estava no nativo.
            const designSalvoNoOposto = {
                ...temaComContraparte.contraparte,
                navigationStyle: 'sidebar', // customização que não carrega modo — não pode se mexer
            } as unknown as SarakDesignState;

            const result = overlayPreferences(designSalvoNoOposto, { colorMode: 'light' }, temaComContraparte, 'light');

            // Restaura os valores NATIVOS (de `theme.design`) — nunca reaplica a contraparte.
            expect(result.mode).toBe('light');
            expect(result.colorBgBody).toBe('#f9f5f1');
            expect(result.navigationStyle).toBe('sidebar');
        });

        it('uma personalização que NÃO carrega modo sobrevive à troca, mesmo repetida (ida e volta)', () => {
            const design = { ...temaComContraparte.design, primaryColor: '#custom' } as unknown as SarakDesignState;
            const ida = overlayPreferences(design, { colorMode: 'dark' }, temaComContraparte, 'light');
            expect(ida.primaryColor).toBe('#custom');
            const volta = overlayPreferences(ida as unknown as SarakDesignState, { colorMode: 'light' }, temaComContraparte, 'light');
            expect(volta.primaryColor).toBe('#custom');
            expect(volta.mode).toBe('light');
            expect(volta.colorBgBody).toBe('#f9f5f1'); // restaurado do nativo, não repetiu a contraparte
        });

        it('colorMode: "system" acompanha o `systemColorScheme` resolvido pelo SO', () => {
            const design = { ...temaComContraparte.design } as unknown as SarakDesignState;
            const result = overlayPreferences(design, { colorMode: 'system' }, temaComContraparte, 'dark');
            expect(result.mode).toBe('dark');
        });

        describe('pedir o modo em que o design JÁ ESTÁ é sempre um no-op — nenhuma chave de modo se mexe', () => {
            it('com o tema no modo NATIVO, uma chave de modo personalizada sobrevive', () => {
                const design = { ...temaComContraparte.design, colorBgBody: '#fff7ed' } as unknown as SarakDesignState;
                const result = overlayPreferences(design, { colorMode: 'light' }, temaComContraparte, 'light');
                expect(result.colorBgBody).toBe('#fff7ed'); // não volta para o valor de catálogo
                expect(result.mode).toBe('light');
            });

            it('com o tema SALVO NO MODO OPOSTO, uma chave de modo personalizada sobrevive', () => {
                const design = { ...temaComContraparte.contraparte, colorBgBody: '#111111' } as unknown as SarakDesignState;
                const result = overlayPreferences(design, { colorMode: 'dark' }, temaComContraparte, 'light');
                expect(result.colorBgBody).toBe('#111111'); // não volta para o valor da contraparte
                expect(result.mode).toBe('dark');
            });

            it('pelo modo "sistema" resolvendo para o modo atual, uma chave de modo personalizada sobrevive', () => {
                const design = { ...temaComContraparte.design, colorBgBody: '#fff7ed' } as unknown as SarakDesignState;
                const result = overlayPreferences(design, { colorMode: 'system' }, temaComContraparte, 'light');
                expect(result.colorBgBody).toBe('#fff7ed');
                expect(result.mode).toBe('light');
            });
        });

        it('sem tema rastreável, cai no fallback sintetizado (`syncThemeWithMode`)', () => {
            const design = { mode: 'dark', textColorMaster: '#ffffff' } as unknown as SarakDesignState;
            const result = overlayPreferences(design, { colorMode: 'light' }, undefined, 'light');
            expect(result.mode).toBe('light');
        });

        it('sem contraparte na entrada, também cai no fallback sintetizado', () => {
            const temaSemContraparte: ThemeEntry = { id: 'legado', design: { mode: 'dark' } };
            const design = { mode: 'dark', textColorMaster: '#ffffff' } as unknown as SarakDesignState;
            const result = overlayPreferences(design, { colorMode: 'light' }, temaSemContraparte, 'light');
            expect(result.mode).toBe('light');
        });

        it('preferência de modo NÃO OFERECIDA (token no design = "off") é ignorada', () => {
            const design = { ...temaComContraparte.design, preferenceModePosition: 'off' } as unknown as SarakDesignState;
            const result = overlayPreferences(design, { colorMode: 'dark' }, temaComContraparte, 'light');
            expect(result.mode).toBe('light'); // permanece no nativo — a preferência não se aplicou
        });
    });

    it('navigationStyle sobrepõe o token do tema, quando oferecida', () => {
        const design = { navigationStyle: 'sidebar', preferenceNavigationStylePosition: 'pinned' } as unknown as SarakDesignState;
        const result = overlayPreferences(design, { navigationStyle: 'topbar' }, undefined, 'light');
        expect(result.navigationStyle).toBe('topbar');
    });

    it('navCollapsed sobrepõe `isNavHidden` (oferecida por padrão de fábrica)', () => {
        const design = { isNavHidden: false } as unknown as SarakDesignState;
        const result = overlayPreferences(design, { navCollapsed: true }, undefined, 'light');
        expect(result.isNavHidden).toBe(true);
    });

    it('language sobrepõe o idioma do tema, quando oferecida', () => {
        const design = { language: 'pt', preferenceLanguagePosition: 'menu' } as unknown as SarakDesignState;
        const result = overlayPreferences(design, { language: 'en-US' }, undefined, 'light');
        expect(result.language).toBe('en-US');
    });

    describe('fontSize — escala relativa sobre `bodySize` (o token que de fato chega à tela)', () => {
        const OFERECIDA = { preferenceFontSizePosition: 'pinned' };

        it('"md" é EXATAMENTE a base do tema — nenhuma mudança', () => {
            const design = { bodySize: '14px', ...OFERECIDA } as unknown as SarakDesignState;
            const result = overlayPreferences(design, { fontSize: 'md' }, undefined, 'light');
            expect(result.bodySize).toBe('14px');
        });

        it('"lg" sobe um degrau a partir da base', () => {
            const design = { bodySize: '16px', ...OFERECIDA } as unknown as SarakDesignState;
            const result = overlayPreferences(design, { fontSize: 'lg' }, undefined, 'light');
            expect(result.bodySize).toBe('18px');
        });

        it('"sm" desce um degrau a partir da base', () => {
            const design = { bodySize: '16px', ...OFERECIDA } as unknown as SarakDesignState;
            const result = overlayPreferences(design, { fontSize: 'sm' }, undefined, 'light');
            expect(result.bodySize).toBe('14px');
        });

        it('clampa no topo da escala — não estoura além de "20px"', () => {
            const design = { bodySize: '20px', ...OFERECIDA } as unknown as SarakDesignState;
            const result = overlayPreferences(design, { fontSize: 'lg' }, undefined, 'light');
            expect(result.bodySize).toBe('20px');
        });

        it('clampa no piso da escala — não estoura além de "12px"', () => {
            const design = { bodySize: '12px', ...OFERECIDA } as unknown as SarakDesignState;
            const result = overlayPreferences(design, { fontSize: 'sm' }, undefined, 'light');
            expect(result.bodySize).toBe('12px');
        });

        it('afirma a VARIÁVEL CSS emitida, não só o valor da sobreposição', () => {
            const design = { mode: 'dark', bodySize: '14px', ...OFERECIDA } as unknown as SarakDesignState;
            const result = overlayPreferences(design, { fontSize: 'lg' }, undefined, 'light');

            const { result: vars } = renderHook(() => useDesignVariables(result as unknown as Record<string, unknown>));
            expect(vars.current.variables['--theme-font-size-base']).toBe('16px');
            expect(vars.current.variables['--sarak-body-size']).toBe('16px');
        });
    });

    it('preferência não oferecida (qualquer uma, token "off" no design) é ignorada mesmo quando salva', () => {
        const design = {
            navigationStyle: 'sidebar',
            isNavHidden: false,
            bodySize: '16px',
            language: 'pt',
            preferenceNavigationStylePosition: 'off',
            preferenceNavCollapsePosition: 'off',
            preferenceFontSizePosition: 'off',
            preferenceLanguagePosition: 'off',
        } as unknown as SarakDesignState;

        const result = overlayPreferences(
            design,
            { navigationStyle: 'topbar', navCollapsed: true, fontSize: 'lg', language: 'en' },
            undefined,
            'light',
        );
        expect(result).toEqual(design);
    });
});
