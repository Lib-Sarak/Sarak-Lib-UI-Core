// @vitest-environment node
// Teste do PRÓPRIO GATE aprofundado: nome registrado no barril não é prova
// de que o consumidor alcança o componente — ele precisa RESOLVER para o valor. Caso
// PLANTADO que reproduz o defeito medido (export explícito sombreando `export *`, o
// mesmo modo de falha que deixou `SarakNavItem` inalcançável) e o caso CONFORME em que
// a mesma checagem libera — a prova de que a regra morde, não só de que passa hoje.
//
// Um `ts.Program` custa caro mesmo sobre um projeto minúsculo (a base é sempre
// `lib.d.ts` inteiro) — por isso os quatro cenários (conforme/plantado/ausente/
// colisão) moram no MESMO projeto sintético e pagam UM `ts.createProgram` só, num
// `beforeAll`. Construir um programa por `it()` fez este arquivo estourar o timeout
// default sob a suíte completa (contenção de CPU entre os workers `forks`).
import fs from 'fs';
import os from 'os';
import path from 'path';
import ts from 'typescript';
import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import {
    resolveIndexExports,
    resolvesToComponentValue,
    runBarrelParityCheck,
    DEFAULT_COMPONENT_ROOTS,
} from '../check-barrel-parity.mjs';
import { BARREL_VALUE_EXCLUSIONS } from '../../../allowlists/barrelExclusions.mjs';

/** Opções mínimas para montar um `ts.Program` sobre um projeto sintético — sem JSX. */
const FIXTURE_COMPILER_OPTIONS = {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    esModuleInterop: true,
    skipLibCheck: true,
    strict: false,
};

function makeFixtureProject(files) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-barrel-parity-'));
    for (const [relPath, content] of Object.entries(files)) {
        const full = path.join(root, relPath);
        fs.mkdirSync(path.dirname(full), { recursive: true });
        fs.writeFileSync(full, content, 'utf8');
    }
    return root;
}

describe('resolveIndexExports / resolvesToComponentValue — mecanismo por type checker', () => {
    let root;
    let componentRoots;
    let resolved;

    beforeAll(() => {
        root = makeFixtureProject({
            // CONFORME: componente na raiz certa, sem sombreamento nenhum.
            'components/Alpha.ts': [
                'export interface AlphaProps { label: string }',
                'export const Alpha = (props: AlphaProps) => null;',
            ].join('\n'),
            // PLANTADO: `Beta` existe como VALOR, mas um export explícito de TIPO
            // sombreia o `export *` — a mesma classe de defeito de `SarakNavItem`.
            'components/Beta.ts': 'export const Beta = () => null;',
            'components/BetaType.ts': 'export interface Beta { id: string }',
            // Colisão de nome: `Delta` resolve para um VALOR real, mas DECLARADO
            // fora das raízes de componente — não é o componente, é um intruso.
            'outside/Intruder.ts': "export const Delta = 'not-a-component';",
            'index.ts': [
                "export * from './components/Alpha';",
                "export * from './components/Beta';",
                "export type { Beta } from './components/BetaType';",
                "export { Delta } from './outside/Intruder';",
            ].join('\n'),
        });
        componentRoots = [path.join(root, 'components')];
        resolved = resolveIndexExports(path.join(root, 'index.ts'), FIXTURE_COMPILER_OPTIONS);
    }, 30000);

    afterAll(() => {
        if (root) fs.rmSync(root, { recursive: true, force: true });
    });

    it('CONFORME: sem sombreamento, o nome resolve para VALOR declarado na raiz de componente — LIBERA', () => {
        expect(resolved.get('Alpha')?.isValue).toBe(true);
        expect(resolvesToComponentValue('Alpha', resolved, componentRoots)).toBe(true);
    });

    it('PLANTADO: export explícito de TIPO sombreia o export * — resolve só para TIPO, REPROVA', () => {
        expect(resolved.get('Beta')?.isValue).toBe(false);
        expect(resolvesToComponentValue('Beta', resolved, componentRoots)).toBe(false);
    });

    it('REPROVA: nome ausente do barril (nenhum export daquele nome)', () => {
        expect(resolved.has('Gamma')).toBe(false);
        expect(resolvesToComponentValue('Gamma', resolved, componentRoots)).toBe(false);
    });

    it('REPROVA: colisão de nome — o valor resolvido existe, mas foi declarado FORA das raízes de componente', () => {
        expect(resolved.get('Delta')?.isValue).toBe(true);
        expect(resolvesToComponentValue('Delta', resolved, componentRoots)).toBe(false);
    });
});

describe('check-barrel-parity — repositório real', () => {
    // Monta um `ts.Program` real sobre `src/index.ts` inteiro (~5-7 s local; mais sob
    // contenção de CPU da suíte completa) — custo medido do mecanismo, documentado no
    // cabeçalho R18 do gate. Calculado UMA vez e reusado pelas duas asserções abaixo.
    let resolvedRealIndex;
    beforeAll(() => {
        resolvedRealIndex = resolveIndexExports(path.resolve('src/index.ts'));
    }, 60000);

    it('todo componente consumidor-facing resolve para o VALOR (não só está registrado) — 0 faltas', () => {
        const result = runBarrelParityCheck({ resolvedExports: resolvedRealIndex });
        expect(result.missingValues).toEqual([]);
        expect(result.staleValueExclusions).toEqual([]);
    });

    it('SarakMenuItem — o caso concreto que motivou este gate — resolve para o componente, não para o tipo SarakNavItem', () => {
        expect(resolvedRealIndex.get('SarakMenuItem')?.isValue).toBe(true);
        expect(resolvesToComponentValue('SarakMenuItem', resolvedRealIndex, DEFAULT_COMPONENT_ROOTS)).toBe(true);
        // O tipo antigo (SarakNavItem) continua vivo, como TIPO — fora do escopo desta verificação.
        expect(resolvedRealIndex.get('SarakNavItem')?.isValue).toBe(false);
    });

    it('nenhuma exclusão de valor sem motivo — toda entrada de BARREL_VALUE_EXCLUSIONS carrega razão escrita', () => {
        for (const [name, reason] of Object.entries(BARREL_VALUE_EXCLUSIONS)) {
            expect(reason, `exclusão "${name}" sem motivo escrito`).toBeTruthy();
        }
    });
});
