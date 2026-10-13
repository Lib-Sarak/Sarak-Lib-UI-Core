// @vitest-environment node
// Teste do PRÓPRIO GATE `panel-contract:check`: casos PLANTADOS que ele PEGA (padrão fora da faixa ou da
// grade, valor de tema cortado em silêncio, tipo do schema sem controle, opção com id ≠ value) e os que ele
// DEIXA PASSAR (faixa implícita do painel, `id` igual ao `value`, ponto responsivo dentro da faixa), mais o
// repositório real.
import { describe, expect, it } from 'vitest';
import {
    buildReport,
    dynamicBranches,
    readControlSources,
    registryKeys,
    schemaTypes,
    type ControlSources,
} from '../check-panel-contract';
import type { SarakDesignToken } from '../../../../src/core/Design/types';

const slider = (patch: Partial<SarakDesignToken>): SarakDesignToken => ({
    id: 'tokenDeTeste', label: 'Teste', type: 'slider', defaultValue: 10, ...patch,
});

const realControls = readControlSources();
const run = (tokens: SarakDesignToken[], controls: ControlSources = realControls) =>
    buildReport({ tokens, sources: [], controls });

describe('(i) padrão dentro da faixa e da grade que o painel desenha', () => {
    it('PLANTADO: padrão acima do máximo declarado', () => {
        const report = run([slider({ defaultValue: 50, constraints: { min: 0, max: 20 } })]);
        expect(report.defaults.map((d) => d.motivo)).toEqual(['fora de [0, 20]']);
    });

    it('PLANTADO: padrão abaixo do mínimo (sidebarMaxWidth mob 280 < 300)', () => {
        const report = run([slider({ defaultValue: { mob: 280, tab: 350, desk: 450 }, isResponsive: true, constraints: { min: 300, max: 600 } })]);
        expect(report.defaults).toEqual([expect.objectContaining({ axis: 'mob', value: 280 })]);
    });

    it('PLANTADO: sem faixa declarada o painel desenha 0..100 — 9000 fica fora (zIndexToast)', () => {
        const report = run([slider({ type: 'number', defaultValue: 9000 })]);
        expect(report.defaults.map((d) => d.motivo)).toEqual(['fora de [0, 100]']);
    });

    it('PLANTADO: padrão fora da grade do passo (identityTracking −0,025 num passo de 0,01)', () => {
        const report = run([slider({ defaultValue: -0.025, constraints: { min: -0.1, max: 0.5, step: 0.01 } })]);
        expect(report.defaults).toHaveLength(1);
        expect(report.defaults[0].motivo).toContain('grade do passo 0.01');
    });

    it('PASSA: padrão na faixa e na grade; ponto responsivo dentro da faixa; faixa implícita 0..100', () => {
        const report = run([
            slider({ defaultValue: 0.5, constraints: { min: 0, max: 2, step: 0.5 } }),
            slider({ id: 'b', defaultValue: { mob: 8, tab: 10, desk: 12 }, isResponsive: true, constraints: { min: 0, max: 40 } }),
            slider({ id: 'c', defaultValue: 42 }),
        ]);
        expect(report.defaults).toEqual([]);
    });
});

describe('(ii) valor de tema dentro do contrato numérico', () => {
    const themed = (design: Record<string, unknown>) =>
        buildReport({ tokens: [], sources: [{ fonte: 'tema:plantado', design }], controls: realControls }).themes;

    it('PLANTADO: duração acima do máximo era cortada em silêncio para a borda — agora é achado', () => {
        // `motionDurationFast` aceita de 0 a 0,5; 9 estava sendo mostrado como 0,5.
        expect(themed({ motionDurationFast: 9 }).map((d) => d.token)).toEqual(['motionDurationFast']);
    });

    it('PLANTADO: raio 9999 numa faixa que acaba em 120 (a "pílula" que o tema escrevia e a validação cortava)', () => {
        expect(themed({ btnBorderRadius: 9999 }).map((d) => d.token)).toEqual(['btnBorderRadius']);
    });

    it('PLANTADO: um ponto responsivo fora da faixa basta', () => {
        expect(themed({ borderRadius: { mob: 8, tab: 10, desk: 9999 } }).map((d) => d.token)).toEqual(['borderRadius']);
    });

    it('PASSA: o máximo e o mínimo exatos, e o valor "desligado" que a faixa agora oferece', () => {
        expect(themed({ btnBorderRadius: 120, motionDurationFast: 0, motionDurationSlow: 0.35, identityTracking: 4 })).toEqual([]);
    });
});

describe('(iii) todo tipo do schema tem controle', () => {
    it('lê a união, os ramos do despachante e as chaves do registro', () => {
        expect(schemaTypes("export type SarakTokenValueType = 'number' | 'color' | 'text';")).toEqual(['number', 'color', 'text']);
        expect([...dynamicBranches("switch (t) { case 'slider': case 'number': return 1; default: return 2; }")]).toEqual(['slider', 'number']);
        const registry = "export const ControlRegistry: Record<string, X> = {\n    color: (props) => 1,\n    text: (props) => 2\n};\nconst fora = {\n    outro: (props) => 3\n};";
        expect([...registryKeys(registry)]).toEqual(['color', 'text']);
    });

    it('PLANTADO: tipo na união sem ramo no despachante e sem entrada no registro', () => {
        const controls: ControlSources = {
            types: "export type SarakTokenValueType = 'number' | 'text';",
            dynamic: "switch (token.type) { case 'number': return 1; }",
            registry: "export const ControlRegistry = {\n    number: (props) => 1\n};",
        };
        expect(run([], controls).controls).toEqual([
            'tipo "text" sem ramo no DynamicTokenControl',
            'tipo "text" sem entrada no ControlRegistry',
        ]);
    });

    it('PASSA: tipo com ramo e entrada', () => {
        const controls: ControlSources = {
            types: "export type SarakTokenValueType = 'number';",
            dynamic: "case 'number':",
            registry: "export const ControlRegistry = {\n    number: (props) => 1\n};",
        };
        expect(run([], controls).controls).toEqual([]);
    });
});

describe('(iv) a opção grava o que a validação confere', () => {
    const select = (options: Array<{ id?: string; value?: string; label: string }>): SarakDesignToken => ({
        id: 'peso', label: 'Peso', type: 'select', defaultValue: '900', constraints: { options },
    });

    it('PLANTADO: id "black" com value "900" (o controle gravava "black" e a validação conferia "900")', () => {
        const report = run([select([{ id: 'black', value: '900', label: 'Black' }])]);
        expect(report.options).toEqual([{ token: 'peso', id: 'black', value: '900' }]);
    });

    it('PASSA: id igual ao value, ou só um dos dois', () => {
        const report = run([select([{ id: '900', value: '900', label: 'Black' }, { id: 'left', label: 'E' }, { value: 'x', label: 'X' }])]);
        expect(report.options).toEqual([]);
    });
});

describe('o repositório real', () => {
    it('padrões na faixa, temas dentro do contrato, todo tipo com controle, opções coerentes', () => {
        const report = buildReport();
        expect(report.defaults).toEqual([]);
        expect(report.themes).toEqual([]);
        expect(report.controls).toEqual([]);
        expect(report.options).toEqual([]);
        expect(report.checked.types).toBeGreaterThanOrEqual(10);
    });
});
