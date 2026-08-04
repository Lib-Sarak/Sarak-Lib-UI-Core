import { describe, it, expect } from 'vitest';
import { getDefaultDesignState, MASTER_DESIGN_MAP } from '../master-map';

/**
 * REDE DE CARACTERIZAÇÃO de `getDefaultDesignState()` — plan-07, item 6.
 *
 * Sete `id` de token estavam declarados em DOIS schemas ao mesmo tempo
 * ([[04-contrato-de-tokens-e-paridade]] §2.2). O estado default é um objeto indexado
 * por `id` (`master-map.ts:90-96`), então a **última** declaração vencia a primeira —
 * por ordem no array, não por intenção.
 *
 * Este teste foi escrito ANTES da desduplicação e capturou o valor que vencia. Ele
 * não julga se o vencedor era o certo: ele prova que **a desduplicação não mudou o
 * comportamento observável**. É a única forma de remover uma declaração duplicada sem
 * apostar — e a razão de a plan exigir caracterização antes do conserto.
 */

const IDS_ANTES_DUPLICADOS = [
    'bgBaseColor',
    'cardBackgroundColor',
    'cardBorderColor',
    'colorBgBody',
    'colorBgLayer1',
    'colorBgLayer2',
    'zIndexModal',
] as const;

describe('getDefaultDesignState — caracterização dos 7 ids antes duplicados', () => {
    const estado = getDefaultDesignState() as Record<string, unknown>;

    it('todos os 7 ids continuam presentes no estado default', () => {
        for (const id of IDS_ANTES_DUPLICADOS) {
            expect(estado, `"${id}" sumiu do estado default`).toHaveProperty(id);
            expect(estado[id], `"${id}" ficou indefinido`).toBeDefined();
        }
    });

    it('o valor vencedor de cada um é EXATAMENTE o de antes da desduplicação', () => {
        // Capturado em 2026-08-03, com as duplicatas ainda no lugar.
        expect({
            bgBaseColor: estado.bgBaseColor,
            cardBackgroundColor: estado.cardBackgroundColor,
            cardBorderColor: estado.cardBorderColor,
            colorBgBody: estado.colorBgBody,
            colorBgLayer1: estado.colorBgLayer1,
            colorBgLayer2: estado.colorBgLayer2,
            zIndexModal: estado.zIndexModal,
        }).toMatchSnapshot();
    });

    it('cada id passou a ter UMA única declaração no MASTER_DESIGN_MAP', () => {
        const ocorrencias = new Map<string, string[]>();
        for (const componente of MASTER_DESIGN_MAP.components) {
            for (const token of componente.tokens) {
                if (!ocorrencias.has(token.id)) ocorrencias.set(token.id, []);
                ocorrencias.get(token.id)?.push(componente.id);
            }
        }

        const duplicados = [...ocorrencias.entries()]
            .filter(([, onde]) => onde.length > 1)
            .map(([id, onde]) => `${id} → ${onde.join(' + ')}`);

        expect(duplicados, `ids declarados em mais de um schema:\n  ${duplicados.join('\n  ')}`).toEqual([]);
    });

    it('nenhum alias de CSS var foi PERDIDO na desduplicação', () => {
        // A lição que custou 3 snapshots: `getAllDesignTokens()` NÃO deduplica, então as
        // duas declarações de um id duplicado eram emitidas — e os `cssVars` de cada uma
        // iam para o DOM. Caracterizar só o `defaultValue` não bastava: desduplicar é
        // FUNDIR a união de aliases e flags, não escolher um lado.
        const aliases = new Set(
            MASTER_DESIGN_MAP.components.flatMap((c) => c.tokens.flatMap((t) => t.cssVars ?? [])),
        );

        // Aliases que só existiam na declaração removida — se algum sumir, alguma
        // superfície do consumidor deixa de receber cor/medida em silêncio.
        for (const alias of ['--theme-body', '--bg-body', '--sarak-bg-base', '--theme-card-bg']) {
            expect(aliases, `alias "${alias}" sumiu do dicionário`).toContain(alias);
        }
    });

    it('o token que emite variantes cromáticas continua marcado', () => {
        const cardBg = MASTER_DESIGN_MAP.components
            .flatMap((c) => c.tokens)
            .find((t) => t.id === 'cardBackgroundColor');

        // `generateVariants` vivia na declaração de `cards.ts`, que foi a removida.
        // Sem ele, as 51 variantes (`-rgb`, `-bg`, `-10`…`-50`, `-hover`, …) somem.
        expect(cardBg?.generateVariants).toBe(true);
    });

    it('a contagem bruta bate com a de ids únicos', () => {
        const bruto = MASTER_DESIGN_MAP.components.reduce((total, c) => total + c.tokens.length, 0);
        const unicos = new Set(MASTER_DESIGN_MAP.components.flatMap((c) => c.tokens.map((t) => t.id))).size;

        // Era 416 bruto para 409 únicos — a diferença de 7 ERA a duplicação.
        expect(bruto).toBe(unicos);
    });
});
