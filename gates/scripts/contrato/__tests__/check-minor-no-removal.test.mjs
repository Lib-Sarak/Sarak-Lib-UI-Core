// @vitest-environment node
// Teste do PRÓPRIO GATE (plan-53): um caso que ele PEGA (minor removeu um
// nome do barril) e um que ele DEIXA PASSAR (major removeu — a 4.0.0 prova
// que major SEM remoção também é legítimo, então este gate nunca olha major).
import { describe, expect, it } from 'vitest';
import { checkNoRemovalOutsideMajor, parseExportedNames, parsePublicIconNames } from '../check-minor-no-removal.mjs';

const DTS_ANTES = "export { SarakButton, type SarakButtonProps, SarakInput, useSarakUI };\n";
const DTS_DEPOIS_SEM_INPUT = "export { SarakButton, type SarakButtonProps, useSarakUI };\n";
const DTS_DEPOIS_COM_ALIAS = "export { SarakButton, type SarakButtonProps, SarakKanbanImpl as SarakKanban, useSarakUI };\n";
const DTS_ICONS_ANTES = 'declare const SARAK_ICON_NAMES: readonly ["Check", "Chrome", "Github"];\nexport { SARAK_ICON_NAMES };\n';
const DTS_ICONS_DEPOIS = 'declare const SARAK_ICON_NAMES: readonly ["Check"];\nexport { SARAK_ICON_NAMES };\n';

describe('parseExportedNames', () => {
    it('extrai nomes de valor e de tipo (prefixo "type " descartado)', () => {
        expect(parseExportedNames(DTS_ANTES)).toEqual(
            new Set(['SarakButton', 'SarakButtonProps', 'SarakInput', 'useSarakUI']),
        );
    });

    it('resolve "X as Y" para o nome PÚBLICO (Y)', () => {
        expect(parseExportedNames(DTS_DEPOIS_COM_ALIAS).has('SarakKanban')).toBe(true);
        expect(parseExportedNames(DTS_DEPOIS_COM_ALIAS).has('SarakKanbanImpl')).toBe(false);
    });

    it('devolve conjunto vazio quando o arquivo não tem o bloco "export { ... }"', () => {
        expect(parseExportedNames('declare const x: number;\n')).toEqual(new Set());
    });
});

describe('parsePublicIconNames', () => {
    it('lê as entradas da tupla pública de ícones', () => {
        expect(parsePublicIconNames(DTS_ICONS_ANTES)).toEqual(new Set(['Check', 'Chrome', 'Github']));
    });

    it('ignora a tupla quando SARAK_ICON_NAMES não é exportado', () => {
        expect(parsePublicIconNames('declare const SARAK_ICON_NAMES: readonly ["Chrome"];\n')).toEqual(new Set());
    });
});

describe('checkNoRemovalOutsideMajor', () => {
    it('bloqueia MINOR que remove um nome do barril', () => {
        const r = checkNoRemovalOutsideMajor({
            previousVersion: '6.1.0',
            currentVersion: '6.2.0',
            previousDts: DTS_ANTES,
            currentDts: DTS_DEPOIS_SEM_INPUT,
        });
        expect(r.ok).toBe(false);
        expect(r.removed).toEqual(['SarakInput']);
    });

    it('bloqueia PATCH que remove um nome do barril', () => {
        const r = checkNoRemovalOutsideMajor({
            previousVersion: '6.1.0',
            currentVersion: '6.1.1',
            previousDts: DTS_ANTES,
            currentDts: DTS_DEPOIS_SEM_INPUT,
        });
        expect(r.ok).toBe(false);
    });

    it('bloqueia MINOR que remove nomes públicos da tupla SarakIconName', () => {
        const r = checkNoRemovalOutsideMajor({
            previousVersion: '6.1.0',
            currentVersion: '6.2.0',
            previousDts: DTS_ICONS_ANTES,
            currentDts: DTS_ICONS_DEPOIS,
        });
        expect(r).toMatchObject({ ok: false, removed: ['Chrome', 'Github'] });
    });

    it('libera MAJOR que remove um nome — a 4.0.0 não teria sido pega mesmo sem remoção nenhuma', () => {
        const r = checkNoRemovalOutsideMajor({
            previousVersion: '6.1.0',
            currentVersion: '7.0.0',
            previousDts: DTS_ANTES,
            currentDts: DTS_DEPOIS_SEM_INPUT,
        });
        expect(r).toMatchObject({ ok: true, skipped: true });
    });

    it('libera MINOR/PATCH sem remoção (só aditivo)', () => {
        const r = checkNoRemovalOutsideMajor({
            previousVersion: '6.1.0',
            currentVersion: '6.2.0',
            previousDts: DTS_ANTES,
            currentDts: 'export { SarakButton, type SarakButtonProps, SarakInput, SarakSelect, useSarakUI };\n',
        });
        expect(r).toEqual({ ok: true, skipped: false });
    });
});
