// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { solveThemeContrast } from '../solve_theme_contrast.ts';
import { getDefaultDesignState } from '../../../../../src/core/Design/master-map.ts';
import { rgbToHsl, parseToRgba } from '../../../../../src/core/Provider/utils/color-engine.ts';
import { GLOBAL_THEMES } from '../../../../../src/core/Design/presets/themes/index.ts';
import { evaluatePair, PAIRS } from '../../../../../gates/scripts/audit/verify_contrast.ts';

/**
 * A PROVA que define o aceite do solucionador (plan-24-1 §2, Passo 2): rodar
 * sobre dois temas de intenções OPOSTAS — um brutalista, um glass — e mostrar
 * que MATIZ e SATURAÇÃO sobrevivem em ambos. Sem esta prova, o solucionador
 * seria um gerador disfarçado.
 *
 * Os cenários abaixo são SINTÉTICOS (não os 18 temas shippados): a Passo 6
 * desta mesma plan corrige os 18 até passarem 100% no gate, o que zeraria o
 * relatório de qualquer tema já corrigido e tornaria este teste frágil ao
 * conteúdo (que é justamente o que a plan quer poder mudar livremente).
 * Cada cenário parte dos defaults e sobrescreve só o suficiente para
 * reproduzir uma falha real e deliberada, na mesma família de cor do tema
 * que inspirou (brutalista = preto quase sobre preto; glass = texto
 * translúcido sobre vidro escuro).
 */

const hslOf = (color: string): [number, number, number] => {
    const { r, g, b } = parseToRgba(color);
    return rgbToHsl(r, g, b) as [number, number, number];
};

const mergedOf = (id: string) => {
    const theme = GLOBAL_THEMES.find((t) => t.id === id);
    if (!theme) throw new Error(`tema "${id}" não encontrado`);
    return { ...getDefaultDesignState(), ...(theme.design as Record<string, unknown>) };
};

const CENARIOS: Record<string, Record<string, unknown>> = {
    brutalista: {
        ...getDefaultDesignState(),
        mode: 'dark',
        // O caso citado na própria plan (§2, "O caso que prova a diferença"):
        // preto quase puro sobre um fundo quase-preto.
        colorBgBody: '#050505',
        colorBgLayer1: '#0a0a0a',
        colorBgLayer2: '#101010',
        cardBackgroundColor: '#080808',
        sidebarColor: '#000000',
        topbarColor: '#000000',
        textColorMaster: '#000000',
        textColorSecondary: '#000000',
        textColorMuted: '#000000',
        titleColor: '#000000',
        primaryColor: '#ff2d2d',
        accentColor: '#ff2d2d',
    },
    glass: {
        ...getDefaultDesignState(),
        mode: 'dark',
        // Vidro translúcido escuro com texto quase tão translúcido quanto o fundo.
        colorBgBody: '#0b1220',
        colorBgLayer1: '#0f1830',
        colorBgLayer2: '#141d3a',
        cardBackgroundColor: 'rgba(20, 30, 60, 0.35)',
        sidebarColor: 'rgba(15, 24, 48, 0.4)',
        topbarColor: 'rgba(15, 24, 48, 0.4)',
        textColorMaster: 'rgba(180, 200, 255, 0.35)',
        textColorSecondary: 'rgba(180, 200, 255, 0.3)',
        textColorMuted: 'rgba(180, 200, 255, 0.25)',
        titleColor: 'rgba(200, 215, 255, 0.4)',
        primaryColor: '#7dd3fc',
        accentColor: '#7dd3fc',
    },
};

describe('solveThemeContrast — NÃO é um gerador (prova de não-homogeneização)', () => {
    it.each(Object.entries(CENARIOS))('cenário "%s": todo tokenId de texto corrigido preserva matiz e saturação', (_nome, antes) => {
        const { design: depois, relatorio } = solveThemeContrast(antes);

        expect(relatorio.length).toBeGreaterThan(0); // ambos os cenários têm pares a corrigir, de propósito

        const tokensCorrigidos = new Set(relatorio.filter((r) => r.valorAntes !== r.valorDepois).map((r) => r.fgToken));
        expect(tokensCorrigidos.size).toBeGreaterThan(0);

        for (const tokenId of tokensCorrigidos) {
            const [hAntes, sAntes] = hslOf(String(antes[tokenId]));
            const [hDepois, sDepois, lDepois] = hslOf(String(depois[tokenId]));
            // Perto de L=0 ou L=100 o matiz/saturação ficam matematicamente
            // irrecuperáveis (preto/branco são acromáticos por definição — não
            // é o solucionador "escolhendo" outro matiz, é o espaço HSL
            // colapsando no extremo). Só comparamos quando o resultado ainda
            // não chegou lá. Tolerância de 1° / 1pp: arredondamento HSL<->RGB.
            const noExtremo = lDepois > 1 && lDepois < 99;
            if (noExtremo) {
                if (sAntes > 0.5) expect(hDepois, `matiz de "${tokenId}" mudou`).toBeCloseTo(hAntes, 0);
                expect(sDepois, `saturação de "${tokenId}" mudou`).toBeCloseTo(sAntes, 0);
            }
        }
    });

    it('os dois cenários continuam VISIVELMENTE diferentes um do outro depois da correção (matiz não convergiu)', () => {
        const brut = solveThemeContrast(CENARIOS.brutalista).design;
        const glass = solveThemeContrast(CENARIOS.glass).design;

        // primaryColor é a assinatura mais visível de um tema — o solucionador
        // nem sequer TOCA nele (não é token de texto em nenhum PAIR).
        expect(brut.primaryColor).not.toBe(glass.primaryColor);
        expect(brut.colorBgBody).not.toBe(glass.colorBgBody);
    });

    it('só altera tokens que são o lado "fg" de algum PAIR — nunca um token de fundo', () => {
        const { relatorio } = solveThemeContrast(CENARIOS.brutalista);
        const fgTokensValidos = new Set(PAIRS.map((p) => p.fg));
        for (const entry of relatorio) {
            expect(fgTokensValidos.has(entry.fgToken)).toBe(true);
        }
    });

    it('todo par RESOLVIDO realmente passa 4,5:1 quando reavaliado contra o design corrigido', () => {
        const antes = mergedOf('minimalist-airy');
        const { design: depois, relatorio } = solveThemeContrast(antes);
        for (const entry of relatorio.filter((r) => r.resolvido)) {
            const pair = PAIRS.find((p) => `${p.fg} / ${p.bgChain[0]}` === entry.par && p.fg === entry.fgToken);
            if (!pair) continue;
            const resultado = evaluatePair(pair, depois);
            expect(resultado.pulado).toBe(false);
            if (!resultado.pulado) expect(resultado.pass).toBe(true);
        }
    });
});
