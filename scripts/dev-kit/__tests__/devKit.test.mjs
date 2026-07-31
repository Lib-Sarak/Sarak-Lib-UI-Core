/**
 * Testes do kit do MANTENEDOR (Spec 14).
 *
 * O foco é a caça a PONTEIRO MORTO — o requisito que justifica o artefato existir. Um
 * verificador de ponteiro tem duas formas de falhar, e as duas são cobertas aqui:
 * deixar passar o morto (o defeito que as skills tiveram por meses) e acusar o vivo
 * (o falso-positivo que faz o autor abandonar a crase e cegar o gate).
 */
import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { collectPointers, findDeadPointers } from '../deadPointers.mjs';
import { buildDevState } from '../buildDevState.mjs';

const SCRIPTS = { 'dev-kit:check': 'node scripts/generate-dev-kit.mjs --check', audit: 'node x.mjs' };

describe('collectPointers — o que é verificável e o que não é', () => {
    it('acha caminho, gate e comando node, com a linha certa', () => {
        const md = ['veja `src/index.ts`', 'rode `npm run audit`', 'ou `node scripts/catalogAst.mjs`'].join('\n');
        expect(collectPointers(md)).toEqual([
            { tipo: 'caminho', alvo: 'src/index.ts', bruto: 'src/index.ts', linha: 1 },
            { tipo: 'gate', alvo: 'audit', bruto: 'npm run audit', linha: 2 },
            {
                tipo: 'caminho',
                alvo: 'scripts/catalogAst.mjs',
                bruto: 'node scripts/catalogAst.mjs',
                linha: 3,
            },
        ]);
    });

    it('IGNORA glob e metavariável — verificador que adivinha produz falso-positivo', () => {
        const md = 'em `src/components/atomic/<Categoria>` ou `src/**/__tests__`';
        expect(collectPointers(md)).toEqual([]);
    });

    it('ignora prosa livre e nome de símbolo em crase', () => {
        expect(collectPointers('o `MASTER_DESIGN_MAP` e o `SarakButton` são coisas do código')).toEqual([]);
    });

    it('normaliza `arquivo:linha`, faixa de linhas e barra final', () => {
        const alvos = collectPointers('`src/index.ts:50` `src/index.ts:119-125` `src/core/` `./src/index.ts`').map(
            (p) => p.alvo,
        );
        expect(alvos).toEqual(['src/index.ts', 'src/index.ts', 'src/core', 'src/index.ts']);
    });
});

describe('findDeadPointers — acusa o morto, poupa o vivo', () => {
    it('acusa caminho inexistente com arquivo e linha', () => {
        const mortos = findDeadPointers({ 'g.md': 'abra `src/core/Manifest/Registry/nativeComponents.ts`' }, {
            scripts: SCRIPTS,
        });
        expect(mortos).toHaveLength(1);
        expect(mortos[0]).toMatchObject({ arquivo: 'g.md', linha: 1, tipo: 'caminho' });
        expect(mortos[0].motivo).toContain('não existe no disco');
    });

    it('acusa gate que não é script do package.json', () => {
        const mortos = findDeadPointers({ 'g.md': 'rode `npm run registry:parity`' }, { scripts: SCRIPTS });
        expect(mortos).toHaveLength(1);
        expect(mortos[0]).toMatchObject({ tipo: 'gate' });
        expect(mortos[0].motivo).toContain('registry:parity');
    });

    it('NÃO acusa caminho e gate que existem de verdade', () => {
        const md = 'veja `src/index.ts` e `scripts/catalogAst.mjs`, e rode `npm run dev-kit:check`';
        expect(findDeadPointers({ 'g.md': md }, { scripts: SCRIPTS })).toEqual([]);
    });

    it('a prosa REAL do kit não tem ponteiro morto (é o gate rodando sobre si mesmo)', () => {
        const arquivos = {
            'sarak-dev/START-HERE.md': fs.readFileSync('sarak-dev/START-HERE.md', 'utf-8'),
            'sarak-dev/GUIA-MANUTENCAO.md': fs.readFileSync('sarak-dev/GUIA-MANUTENCAO.md', 'utf-8'),
        };
        expect(findDeadPointers(arquivos)).toEqual([]);
    });
});

describe('buildDevState — estado DERIVADO, nunca digitado', () => {
    const state = buildDevState();

    it('traz as quatro contagens de token lado a lado', () => {
        const { mapeamento, particoes, tipoPublico } = state.design.tokens;
        expect(mapeamento.idsUnicos).toBe(particoes.tokens);
        expect(mapeamento.entradasBrutas).toBeGreaterThanOrEqual(mapeamento.idsUnicos);
        expect(tipoPublico.ids).toBeGreaterThan(0);
    });

    it('deriva categorias e componentes públicos do filesystem/AST', () => {
        expect(state.componentes.categoriasAtomicas).toContain('Buttons');
        expect(state.componentes.categoriasDeEngine).toContain('charts');
        expect(state.componentes.publicos.count).toBe(state.componentes.publicos.nomes.length);
        expect(state.componentes.publicos.nomes).toContain('SarakAppChrome');
    });

    it('os gates saem dos scripts REAIS do package.json — lista à mão não sobreviveria a um gate novo', () => {
        const nomes = state.gates.map((gate) => gate.nome);
        expect(nomes).toContain('npm run dev-kit:check');
        expect(nomes).toContain('npm run barrel:check');
        expect(state.auditores).toHaveLength(8);
    });

    it('o baseline vem do arquivo versionado, não de uma cópia no gerador', () => {
        expect(state.baseline.medidoEm).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(Object.keys(state.baseline.metricas)).toHaveLength(state.auditores.length);
    });
});
