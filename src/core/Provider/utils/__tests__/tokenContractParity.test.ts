// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { auditTokenContract, TokenContractDrift } from '../validation';
import { sarakGetDefaultDesignState } from '../../../Design/master-map';
import { SARAK_ALL_THEMES } from '../../../Design/presets/themes/all';
import { CARD_PRESETS, CARD_TEXTURE_PRESETS } from '../../../Design/presets/components/cards';
import { BUTTON_PRESETS, BUTTON_STYLE_PRESETS } from '../../../Design/presets/components/buttons';
import { INPUT_PRESETS } from '../../../Design/presets/components/inputs';
import { TYPOGRAPHY_PRESETS } from '../../../Design/presets/components/typography';
import { MEDIA_PRESETS, TEXTURE_PRESETS } from '../../../Design/presets/components/atmosphere';

/**
 * Gate anti-regressão (Spec 40.4 L1/L3): audita TODO valor shippado pela lib
 * (defaults do MASTER_DESIGN_MAP + os 18 `GLOBAL_THEMES` + os presets parciais de
 * componente) contra o contrato do próprio token (`auditTokenContract`, mesma
 * função que `validateDesign` usa em runtime). Falha o build se algum default ou
 * tema/preset shippado cair fora do próprio contrato — impede que um tema novo
 * (ou uma mudança de enum) reintroduza o drift em silêncio (o console só mostra o
 * que o boot toca; esta suíte é exaustiva).
 *
 * `SARAK_REFERENCE_THEMES` (`presets/themes/reference.ts`) não entra à parte: é
 * um subconjunto de `GLOBAL_THEMES` (`minimalist-airy` + `sarak-sovereign`), já
 * coberto abaixo.
 *
 * LIMITES DECLARADOS (R18) — o que este teste NÃO vê:
 * 1. Julga só o que a lib embarca (defaults, temas, presets). Tema do consumidor e tema salvo passam por
 *    `validateDesign` em runtime, que CORTA — não acusa.
 * 2. Faixa numérica é conferida por `[min, max]`; a grade do `step` de tema não (o slider encaixa na
 *    grade, o valor declarado é desenhado como está). O padrão do schema na grade é de `panel-contract:check`.
 * 3. Valor de tema é julgado contra o próprio token; que ele combine com os demais (hover sem contraste,
 *    sidebar mais larga que o máximo do vizinho) é de `verify_contrast`/`verify_diversity`.
 */
describe('Contrato de tokens — defaults/temas/presets shippados (Spec 40.4)', () => {
    const sources: Array<{ fonte: string; design: Record<string, unknown> }> = [
        { fonte: 'defaults (MASTER_DESIGN_MAP)', design: sarakGetDefaultDesignState() as Record<string, unknown> },
        ...SARAK_ALL_THEMES.map((theme) => ({ fonte: `tema:${theme.id}`, design: theme.design })),
        ...CARD_PRESETS.map((p) => ({ fonte: `preset-card:${p.id}`, design: p.design as Record<string, unknown> })),
        ...CARD_TEXTURE_PRESETS.map((p) => ({ fonte: `preset-card-textura:${p.id}`, design: p.design as Record<string, unknown> })),
        ...BUTTON_PRESETS.map((p) => ({ fonte: `preset-botao:${p.id}`, design: p.design as Record<string, unknown> })),
        ...BUTTON_STYLE_PRESETS.map((p) => ({ fonte: `preset-botao-estilo:${p.id}`, design: p.design as Record<string, unknown> })),
        ...INPUT_PRESETS.map((p) => ({ fonte: `preset-input:${p.id}`, design: p.design as Record<string, unknown> })),
        ...TYPOGRAPHY_PRESETS.map((p) => ({ fonte: `preset-tipografia:${p.id}`, design: p.design as Record<string, unknown> })),
        ...MEDIA_PRESETS.map((p) => ({ fonte: `preset-midia:${p.id}`, design: p.design as Record<string, unknown> })),
        ...TEXTURE_PRESETS.map((p) => ({ fonte: `preset-textura:${p.id}`, design: p.design as Record<string, unknown> })),
    ];

    it('nenhum default/tema/preset shippado cai fora do contrato do próprio token', () => {
        const drift: TokenContractDrift[] = sources.flatMap(({ fonte, design }) => auditTokenContract(fonte, design));

        if (drift.length > 0) {
            const report = drift
                .map((d) => `  - [${d.fonte}] "${d.token}" = ${JSON.stringify(d.valor)} (${d.motivo})`)
                .join('\n');
            throw new Error(`Drift de contrato encontrado (${drift.length}):\n${report}`);
        }

        expect(drift).toEqual([]);
    });
});

describe('o contrato numérico é ACUSADO, não cortado em silêncio', () => {
    it('PLANTADO: valor acima do máximo, abaixo do mínimo e ponto responsivo fora da faixa são achados', () => {
        const drift = auditTokenContract('tema:plantado', {
            motionDurationFast: 9,
            zIndexTooltip: 100,
            borderRadius: { mob: 8, tab: 10, desk: 9999 },
        });
        expect(drift.map((d) => d.token).sort()).toEqual(['borderRadius', 'motionDurationFast', 'zIndexTooltip']);
        expect(drift.every((d) => d.motivo.includes('fora de min/max'))).toBe(true);
    });

    it('PASSA: o limite exato e a intenção "desligado" que a faixa oferece', () => {
        expect(auditTokenContract('tema:ok', { motionDurationFast: 0, btnBorderRadius: 120, identityTracking: 4 })).toEqual([]);
    });
});
