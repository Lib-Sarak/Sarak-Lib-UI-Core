// @vitest-environment node
// Teste do PRÓPRIO GATE `fonts:check` e do passo de cópia que o alimenta. A saída real do passo (as 41 famílias, a
// partir de `node_modules`) vai para um diretório temporário FORA do repositório; sobre ela o gate PASSA, e cada
// mutação o derruba: remover um arquivo, remover uma licença, estourar o orçamento, esvaziar um arquivo, família
// nova na lista sem arquivo, arquivo órfão e manifesto ausente.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { THEME_FONTS } from '../../../../src/core/Design/schema/typography';
import { FAMILY_MARK } from '../../../../scripts/fonts/thirdPartyFonts';
import { embedFonts } from '../../../../scripts/embed-fonts';
import {
    FAMILY_BUDGET_BYTES,
    TOTAL_BUDGET_BYTES,
    checkFonts,
    readSnapshot,
    type FontsSnapshot,
} from '../check-fonts';

const MODULES = path.resolve('node_modules');
const EXPECTED_FAMILIES = THEME_FONTS.length - 1;
let outDir: string;
let fontsDir: string;

beforeAll(() => {
    outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-fonts-'));
    fontsDir = embedFonts({ outDir, modulesDir: MODULES }).fontsDir;
});

afterAll(() => {
    fs.rmSync(outDir, { recursive: true, force: true });
});

const fresh = (): FontsSnapshot => readSnapshot(fontsDir);
const codes = (snapshot: FontsSnapshot, budget?: { totalBytes: number; familyBytes: number }): string[] =>
    checkFonts(snapshot, budget).map((violation) => violation.code);

describe('fonts:check — o que ele deixa passar', () => {
    it('a saída real do passo de cópia passa, com 1 família por opção do painel (menos a do sistema)', () => {
        const snapshot = fresh();
        expect(checkFonts(snapshot)).toEqual([]);
        expect(Object.keys(snapshot.manifest!.families)).toHaveLength(EXPECTED_FAMILIES);
    });

    it('o peso real cabe nos orçamentos (total e por família)', () => {
        const snapshot = fresh();
        const total = Object.values(snapshot.diskFiles).reduce((sum, bytes) => sum + bytes, 0);
        expect(total).toBeLessThanOrEqual(TOTAL_BUDGET_BYTES);
        expect(Math.max(...Object.values(snapshot.diskFiles))).toBeLessThanOrEqual(FAMILY_BUDGET_BYTES);
    });
});

describe('fonts:check — mutações que ele PEGA', () => {
    it('remover um arquivo do disco', () => {
        const snapshot = fresh();
        const victim = Object.keys(snapshot.diskFiles)[0];
        fs.copyFileSync(path.join(fontsDir, victim), path.join(outDir, 'backup.woff2'));
        fs.rmSync(path.join(fontsDir, victim));
        try {
            expect(codes(fresh())).toEqual(['file-missing']);
        } finally {
            fs.copyFileSync(path.join(outDir, 'backup.woff2'), path.join(fontsDir, victim));
        }
        expect(checkFonts(fresh())).toEqual([]);
    });

    it('remover a licença de uma família', () => {
        const snapshot = fresh();
        const start = snapshot.thirdParty.indexOf(`\n${FAMILY_MARK}Inter\n`);
        const end = snapshot.thirdParty.indexOf(`\n${FAMILY_MARK}`, start + 1);
        const without = snapshot.thirdParty.slice(0, start) + snapshot.thirdParty.slice(end);
        expect(codes({ ...snapshot, thirdParty: without })).toEqual(['license-missing']);
    });

    it('esvaziar o texto da licença de uma família', () => {
        const snapshot = fresh();
        const start = snapshot.thirdParty.indexOf(`\n${FAMILY_MARK}Lato\n`);
        const end = snapshot.thirdParty.indexOf(`\n${FAMILY_MARK}`, start + 1);
        const hollow = `${snapshot.thirdParty.slice(0, start)}\n${FAMILY_MARK}Lato\n${snapshot.thirdParty.slice(end)}`;
        expect(codes({ ...snapshot, thirdParty: hollow })).toEqual(['license-missing']);
    });

    it('estourar o orçamento total', () => {
        const snapshot = fresh();
        const padded = { ...snapshot, diskFiles: { ...snapshot.diskFiles, 'extra.woff2': TOTAL_BUDGET_BYTES } };
        expect(codes(padded)).toEqual(expect.arrayContaining(['total-over-budget', 'file-orphan']));
        expect(codes(snapshot, { totalBytes: 1_000_000, familyBytes: FAMILY_BUDGET_BYTES })).toEqual(['total-over-budget']);
    });

    it('estourar o teto de uma família', () => {
        const snapshot = fresh();
        const heaviest = Math.max(...Object.values(snapshot.diskFiles));
        const violations = checkFonts(snapshot, { totalBytes: TOTAL_BUDGET_BYTES, familyBytes: heaviest - 1 });
        expect(violations.map((violation) => violation.code)).toEqual(['family-over-budget']);
        expect(violations[0].family).toBe('Merriweather');
    });

    it('arquivo vazio, arquivo órfão e família sem entrada no manifesto', () => {
        const snapshot = fresh();
        const victim = Object.keys(snapshot.diskFiles)[0];
        expect(codes({ ...snapshot, diskFiles: { ...snapshot.diskFiles, [victim]: 0 } })).toEqual(['file-empty']);
        expect(codes({ ...snapshot, diskFiles: { ...snapshot.diskFiles, 'solto.woff2': 10 } })).toEqual(['file-orphan']);
        expect(codes({ ...snapshot, families: [...snapshot.families, 'Fonte Nova'] })).toEqual(['family-missing']);
    });

    it('família no manifesto que saiu de THEME_FONTS e manifesto ausente', () => {
        const snapshot = fresh();
        expect(codes({ ...snapshot, families: snapshot.families.slice(1) })).toEqual(['family-extra']);
        expect(codes({ ...snapshot, manifest: null })).toEqual(['manifest-missing']);
    });
});

describe('fonts:check — o espelho em JS que o carregador lê (`font-manifest.ts`)', () => {
    it('face a menos, peso trocado, família a mais ou a menos e URL que não aponta o arquivo derrubam', () => {
        const snapshot = fresh();
        const lato = snapshot.runtime.Lato;
        const withoutInter = Object.fromEntries(Object.entries(snapshot.runtime).filter(([family]) => family !== 'Inter'));
        const mutate = (runtime: FontsSnapshot['runtime']) => codes({ ...snapshot, runtime });
        expect(mutate({ ...snapshot.runtime, Lato: { ...lato, faces: lato.faces.slice(1) } })).toEqual(['runtime-drift']);
        expect(mutate({ ...snapshot.runtime, Lato: { ...lato, faces: lato.faces.map((face, index) => (index ? face : { ...face, weight: '500' })) } })).toEqual(['runtime-drift']);
        expect(mutate({ ...snapshot.runtime, 'Fonte Nova': lato })).toEqual(['runtime-drift']);
        expect(mutate({ ...snapshot.runtime, Lato: { ...lato, faces: lato.faces.map((face) => ({ ...face, url: 'file:///x/fonts/outro.woff2' })) } })).toEqual(['runtime-drift']);
        expect(mutate(withoutInter)).toEqual(['runtime-drift']);
    });
});

describe('passo de cópia — o que o manifesto declara', () => {
    it('só latin, só wght nas variáveis e só pesos com arquivo nas estáticas', () => {
        const { families } = fresh().manifest!;
        for (const entry of Object.values(families)) {
            expect(entry.subsets).toEqual(['latin']);
            expect(entry.files.every((file) => file.subset === 'latin')).toBe(true);
        }
        expect(Object.keys(families.Inter.axes)).toEqual(['wght']);
        expect(families.Inter.files).toHaveLength(1);
        expect(families.Fraunces.files).toHaveLength(1);
        expect(families['VT323'].weights).toEqual([400]);
        expect(families['Space Mono'].weights).toEqual([400, 700]);
        expect(families.Lato.weights).toEqual([300, 400, 700, 900]);
        expect(families.Poppins.weights).toEqual([300, 400, 500, 600, 700, 800, 900]);
    });

    it('soma os 1.690.020 B medidos no anexo do catálogo (41 famílias, latin upright)', () => {
        const total = Object.values(fresh().diskFiles).reduce((sum, bytes) => sum + bytes, 0);
        expect(total).toBe(1_690_020);
    });
});
