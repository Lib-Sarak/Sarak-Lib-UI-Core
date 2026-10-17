import { describe, expect, it } from 'vitest';
import { classify, commandsFor, isMetadataOnly, isThemeFile } from '../verify-changes.mjs';

describe('verify-changes — o nível mínimo que cobre a mudança', () => {
    it('só documento: roda o índice e os kits, sem suíte', () => {
        const tier = classify(['specs/00-contexto.md', 'docs/migracoes.md', 'sarak-ui/catalog.json']);
        expect(tier).toBe('docs');
        expect(commandsFor(tier).some(([, args]) => args.includes('vitest'))).toBe(false);
    });

    it('só arquivos de tema (e o catálogo gerado): nível themes, sem tsc nem suíte completa', () => {
        const tier = classify(['src/core/Design/presets/themes/aurora-veil.ts', 'src/core/Design/presets/themes/catalog.generated.ts', 'specs/arquitetura/02-design-engine.md']);
        expect(tier).toBe('themes');
        const flat = commandsFor(tier).map(([cmd, args]) => `${cmd} ${args.join(' ')}`).join('\n');
        expect(flat).toContain('themes:diversity');
        expect(flat).not.toContain('tsc');
    });

    it('infraestrutura de tema não é "tema": volta para full', () => {
        expect(isThemeFile('src/core/Design/presets/themes/loaders.ts')).toBe(false);
        expect(isThemeFile('src/core/Design/presets/themes/registry.ts')).toBe(false);
        expect(classify(['src/core/Design/presets/themes/loaders.ts'])).toBe('full');
    });

    it('metadado de schema (só as quatro chaves) é schema-meta; qualquer outra linha, full', () => {
        const diffs = { 'src/core/Design/schema/cards.ts': ["+            kind: 'aesthetic',", "+            usage: 'Desenha algo.',"] };
        expect(classify(['src/core/Design/schema/cards.ts', 'src/core/Provider/generated/design-token-docs.json'], (f) => diffs[f] ?? [])).toBe('schema-meta');
        const bad = { 'src/core/Design/schema/cards.ts': ["+            kind: 'aesthetic',", "-            defaultValue: 0.1,", "+            defaultValue: 0.2,"] };
        expect(classify(['src/core/Design/schema/cards.ts'], (f) => bad[f] ?? [])).toBe('full');
    });

    it('código de produto, gate ou script: full', () => {
        expect(classify(['src/components/atomic/Cards/SarakActionCard.tsx'])).toBe('full');
        expect(classify(['specs/x.md', 'gates/scripts/contrato/check-x.mjs'])).toBe('full');
        expect(classify(['package.json'])).toBe('full');
    });

    it('nada alterado: nenhum comando', () => {
        expect(classify([])).toBe('none');
        expect(commandsFor('none')).toEqual([]);
    });

    it('isMetadataOnly aceita as quatro chaves e linha em branco, e recusa o resto', () => {
        expect(isMetadataOnly(["+  modeDependent: true,", '+', "+  interactsWith: ['a'],"])).toBe(true);
        expect(isMetadataOnly(["+  label: 'x',"])).toBe(false);
    });

    it('quick = full sem a suíte (o que o executor roda antes de entregar)', () => {
        const flat = (tier) => commandsFor(tier).map(([cmd, args]) => `${cmd} ${args.join(' ')}`);
        expect(flat('quick').some((c) => c.includes('vitest'))).toBe(false);
        expect(flat('quick').some((c) => c.includes('audit:baseline'))).toBe(true);
        expect(flat('quick').some((c) => c.includes('token-reader:check'))).toBe(true);
        expect(flat('full').length).toBe(flat('quick').length + 1);
    });
});
