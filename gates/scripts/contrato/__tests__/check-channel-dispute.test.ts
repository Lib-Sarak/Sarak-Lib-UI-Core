// @vitest-environment node
// Teste do PRÓPRIO GATE `channel-dispute:check`: casos PLANTADOS que ele PEGA (variável nos dois canais, valor
// que não é o declarado, variável inline órfã na troca de tema) e os que ele DEIXA PASSAR (o motor e o escritor
// reais), mais o repositório real.
import { describe, expect, it } from 'vitest';
import { sarakGetAllDesignTokens, sarakGetDefaultDesignState } from '../../../../src/core/Design/master-map';
import {
    buildFromHook,
    buildScenarios,
    findChannelDisputes,
    findOrphanWrites,
    responsiveByPoint,
    type EngineBuild,
    type InjectionWriter,
    type SchemaToken,
} from '../check-channel-dispute';
import { SARAK_ALL_THEMES } from '../../../../src/core/Design/presets/themes/all';

const tokens = sarakGetAllDesignTokens() as unknown as SchemaToken[];
const defaults = sarakGetDefaultDesignState() as unknown as Record<string, unknown>;

describe('o motor real, no repositório', () => {
    it('nenhum par mestre + exceção tem variável nos dois canais ou valor que não é o declarado', () => {
        expect(findChannelDisputes(tokens, defaults)).toEqual([]);
    });

    it('nenhuma troca de tema (sintética ou entre os temas entregues) deixa variável órfã', () => {
        const themes = SARAK_ALL_THEMES.map((theme) => ({ id: theme.id, design: theme.design as Record<string, unknown> }));
        expect(findOrphanWrites(buildScenarios(defaults, themes))).toEqual([]);
    });
});

describe('(i) um canal por variável', () => {
    it('PLANTADO: o mestre volta a escrever o canto inline sobre o canto responsivo → dois canais', () => {
        const regressed: EngineBuild = (design) => {
            const out = buildFromHook(design);
            return { ...out, variables: { ...out.variables, '--sarak-card-radius-tl': '20px' } };
        };
        const found = findChannelDisputes(tokens, defaults, regressed);
        expect(found.some((item) => item.kind === 'dois-canais' && item.variable === '--sarak-card-radius-tl')).toBe(true);
    });

    it('PLANTADO: a exceção declarada não chega à variável do canto → valor errado', () => {
        const dropsCorner: EngineBuild = (design) => {
            const out = buildFromHook(design);
            const variables = { ...out.variables };
            delete variables['--sarak-card-radius-tl'];
            return { ...out, variables, responsiveCSS: out.responsiveCSS.replace(/--sarak-card-radius-tl:[^;]*;/g, '') };
        };
        const found = findChannelDisputes(tokens, defaults, dropsCorner);
        expect(found.some((item) => item.kind === 'valor-errado' && item.variable === '--sarak-card-radius-tl')).toBe(true);
    });

    it('PASSA: o motor que escreve cada nome por um canal só', () => {
        expect(findChannelDisputes(tokens, defaults, buildFromHook)).toEqual([]);
    });

    it('lê os três pontos do CSS na ordem em que o motor monta (raiz, tablet, desktop)', () => {
        const css = ':root {\n  --a: 1px;\n}\n@media (min-width: 768px) {\n  :root {\n  --a: 2px;\n  }\n}\n@media (min-width: 1024px) {\n  :root {\n  --a: 3px;\n  }\n}';
        const points = responsiveByPoint(css);
        expect([points.mob['--a'], points.tab['--a'], points.desk['--a']]).toEqual(['1px', '2px', '3px']);
    });
});

describe('(ii) variável inline órfã', () => {
    const scenarios = buildScenarios(defaults, []);

    it('PLANTADO: um escritor que não limpa o tema anterior deixa o canto escalar para trás', () => {
        const neverCleans: InjectionWriter = (host, variables, attributes) => {
            Object.entries(variables).forEach(([name, value]) => host.style.setProperty(name, value));
            Object.entries(attributes).forEach(([name, value]) => host.setAttribute(name, value));
        };
        const found = findOrphanWrites(scenarios, neverCleans);
        expect(found.length).toBeGreaterThan(0);
        expect(found[0].names).toContain('--sarak-card-radius-tl');
    });

    it('PASSA: o escritor real limpa o que o tema novo não escreve', () => {
        expect(findOrphanWrites(scenarios)).toEqual([]);
    });
});
