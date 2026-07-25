import { describe, it, expect } from 'vitest';
import { auditTokenContract, TokenContractDrift } from '../validation';
import { getDefaultDesignState } from '../../../Design/master-map';
import { GLOBAL_THEMES } from '../../../Design/presets/themes';
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
 */
describe('Contrato de tokens — defaults/temas/presets shippados (Spec 40.4)', () => {
    const sources: Array<{ fonte: string; design: Record<string, unknown> }> = [
        { fonte: 'defaults (MASTER_DESIGN_MAP)', design: getDefaultDesignState() as Record<string, unknown> },
        ...GLOBAL_THEMES.map((theme) => ({ fonte: `tema:${theme.id}`, design: theme.design })),
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
