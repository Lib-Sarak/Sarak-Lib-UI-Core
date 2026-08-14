// Teste do PRÓPRIO GATE (plan-43): sem ele, um identificador citado em
// docs/persistencia-de-tema.md podia ser renomeado na fonte sem que nada
// acusasse — o documento mentiria em silêncio. Casos PLANTADOS (uma fonte
// renomeada, um bloco ausente, um documento que parou de citar) que o gate
// PEGA, e o par saudável que ele DEIXA PASSAR — e, por fim, o repositório
// real, que precisa estar limpo hoje.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, expect, it, afterEach } from 'vitest';
import {
    IDENTIFIERS,
    extractBlock,
    checkSourceDeclares,
    checkDocMentionsIdentifiers,
} from '../check-persistence-doc-identifiers.mjs';

const scratchDirs = [];

function makeFixture(files) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-persistence-doc-'));
    scratchDirs.push(root);
    for (const [relPath, content] of Object.entries(files)) {
        const full = path.join(root, relPath);
        fs.mkdirSync(path.dirname(full), { recursive: true });
        fs.writeFileSync(full, content, 'utf8');
    }
    return root;
}

afterEach(() => {
    while (scratchDirs.length) {
        fs.rmSync(scratchDirs.pop(), { recursive: true, force: true });
    }
});

const HEALTHY_TYPES_TS = `
export interface SarakUIOptions {
    persistence?: {
        storageKey?: string;
        onSave?: (design: SarakThemePayload, activeThemeId?: string) => Promise<void> | void;
        onLoad?: () => Promise<SarakThemePayload> | SarakThemePayload;
    };
    theme?: {
        defaultTheme?: string;
        onSave?: (theme: ThemeEntry) => Promise<void> | void;
    };
}

export interface SarakUIContextType {
    design: SarakThemePayload;
    saveTheme: (theme: ThemeEntry) => Promise<void>;
}
`;

const HEALTHY_PROVIDER_PROPS_TS = `
export interface SarakUIProviderProps {
    customThemes?: unknown[];
}
`;

describe('extractBlock — plan-43', () => {
    it('extrai o bloco balanceado que começa no primeiro { após o padrão', () => {
        const content = 'a\npersistence?: {\n  onSave?: () => void;\n};\nb';
        const block = extractBlock(content, /persistence\?:\s*\{/);
        expect(block).toContain('onSave?:');
        expect(block?.startsWith('{')).toBe(true);
        expect(block?.endsWith('}')).toBe(true);
    });

    it('devolve null quando o padrão de abertura não casa', () => {
        expect(extractBlock('nada aqui', /persistence\?:\s*\{/)).toBeNull();
    });

    it('devolve null quando o bloco nunca fecha', () => {
        expect(extractBlock('persistence?: { onSave?: () => void;', /persistence\?:\s*\{/)).toBeNull();
    });
});

describe('checkSourceDeclares — plan-43', () => {
    it('não acusa nada num par de arquivos saudável (os 5 identificadores presentes)', () => {
        const root = makeFixture({
            'src/core/Provider/types.ts': HEALTHY_TYPES_TS,
            'src/core/Provider/providerProps.ts': HEALTHY_PROVIDER_PROPS_TS,
        });
        expect(checkSourceDeclares({ root })).toEqual([]);
    });

    it('PLANTADO: persistence.onSave renomeado — o gate acusa', () => {
        const root = makeFixture({
            'src/core/Provider/types.ts': HEALTHY_TYPES_TS.replace('onSave?: (design: SarakThemePayload', 'onSaveNovo?: (design: SarakThemePayload'),
            'src/core/Provider/providerProps.ts': HEALTHY_PROVIDER_PROPS_TS,
        });
        const problems = checkSourceDeclares({ root });
        expect(problems.some((p) => p.startsWith('persistence.onSave:'))).toBe(true);
        // theme.onSave usa o MESMO texto `onSave?:`, num bloco diferente — não é afetado.
        expect(problems.some((p) => p.startsWith('theme.onSave:'))).toBe(false);
    });

    it('PLANTADO: bloco persistence?: removido inteiro — onSave e onLoad são acusados juntos', () => {
        const root = makeFixture({
            'src/core/Provider/types.ts': HEALTHY_TYPES_TS.replace(/persistence\?:\s*\{[^]*?\};/, ''),
            'src/core/Provider/providerProps.ts': HEALTHY_PROVIDER_PROPS_TS,
        });
        const problems = checkSourceDeclares({ root });
        expect(problems.some((p) => p.startsWith('persistence.onSave:'))).toBe(true);
        expect(problems.some((p) => p.startsWith('persistence.onLoad:'))).toBe(true);
    });

    it('PLANTADO: customThemes removido de providerProps.ts — o gate acusa', () => {
        const root = makeFixture({
            'src/core/Provider/types.ts': HEALTHY_TYPES_TS,
            'src/core/Provider/providerProps.ts': 'export interface SarakUIProviderProps {}',
        });
        const problems = checkSourceDeclares({ root });
        expect(problems).toEqual(['customThemes: identificador não encontrado em src/core/Provider/providerProps.ts — foi renomeado ou removido?']);
    });

    it('PLANTADO: arquivo inteiro ausente — reporta o caminho que falta, não estoura', () => {
        const root = makeFixture({
            'src/core/Provider/types.ts': HEALTHY_TYPES_TS,
        });
        const problems = checkSourceDeclares({ root });
        expect(problems).toEqual(['customThemes: src/core/Provider/providerProps.ts não existe.']);
    });
});

describe('checkDocMentionsIdentifiers — plan-43', () => {
    it('não acusa nada quando o documento cita os 5 identificadores', () => {
        const root = makeFixture({
            'docs/persistencia-de-tema.md': [
                '# Persistência de tema',
                'Use `persistence.onSave` e `persistence.onLoad`.',
                'Temas criados: `theme.onSave`, devolvidos por `customThemes`.',
                'Internamente, `saveTheme` funde e entrega.',
            ].join('\n'),
        });
        const docFile = path.join(root, 'docs', 'persistencia-de-tema.md');
        expect(checkDocMentionsIdentifiers({ docFile, root })).toEqual([]);
    });

    it('PLANTADO: documento para de citar customThemes — o gate acusa', () => {
        const root = makeFixture({
            'docs/persistencia-de-tema.md': [
                '# Persistência de tema',
                'Use `persistence.onSave` e `persistence.onLoad`.',
                'Temas criados: `theme.onSave`.',
                'Internamente, `saveTheme` funde e entrega.',
            ].join('\n'),
        });
        const docFile = path.join(root, 'docs', 'persistencia-de-tema.md');
        const problems = checkDocMentionsIdentifiers({ docFile, root });
        expect(problems).toEqual(['customThemes: não citado em docs/persistencia-de-tema.md.']);
    });

    it('PLANTADO: documento ausente — acusa em vez de estourar', () => {
        const root = makeFixture({});
        const docFile = path.join(root, 'docs', 'persistencia-de-tema.md');
        const problems = checkDocMentionsIdentifiers({ docFile, root });
        expect(problems).toHaveLength(1);
        expect(problems[0]).toContain('não existe');
    });
});

describe('check-persistence-doc-identifiers — repositório real (plan-43)', () => {
    it('os 5 identificadores existem na superfície pública do repositório real', () => {
        expect(checkSourceDeclares()).toEqual([]);
    });

    it('os 5 identificadores continuam citados em docs/persistencia-de-tema.md do repositório real', () => {
        expect(checkDocMentionsIdentifiers()).toEqual([]);
    });

    it('a lista tem exatamente os 5 identificadores desta plan', () => {
        expect(IDENTIFIERS.map((id) => id.label)).toEqual([
            'persistence.onSave',
            'persistence.onLoad',
            'theme.onSave',
            'saveTheme',
            'customThemes',
        ]);
    });
});
