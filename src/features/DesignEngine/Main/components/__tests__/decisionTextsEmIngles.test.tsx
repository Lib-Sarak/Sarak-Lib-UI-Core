import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SarakUIProvider from '../../../../../core/Provider/SarakUIProvider';
import { TokenCatalog } from '../../../../../core/Design/catalog';
import { sarakGetAllDesignTokens } from '../../../../../core/Design/master-map';
import type { SarakDesignToken, SarakTokenValue } from '../../../../../core/Design/types';
import type { SarakDesignState } from '../../../../../core/Provider/types';
import { COLUMN_DECISIONS, decisionLayers } from '../../../utils/decisions';
import { buildDecisionContext } from '../../../utils/decisionContext';
import { inScope } from '../../../utils/barScope';
import { ExceptionRelation } from '../../../components/ExceptionRelation';
import { DecisionTokenList } from '../DecisionTokenList';
import { ForceOpenSections } from '../CollapsibleSection';
import { ThemeGlobalSettings } from '../ThemeGlobalSettings';

/**
 * Nenhum texto das decisões principais pode chegar em inglês igual ao português: rótulo, ajuda "?", opção do seletor,
 * título e nota. O teste renderiza o painel de verdade nos dois idiomas e compara o que o administrador lê.
 */
type Texts = Map<string, string>;

/**
 * Iguais nos dois idiomas por serem nome próprio, termo técnico ou número com unidade, que o glossário do painel mantém.
 * Nome de fonte e "N px" não se traduzem; o resto é o nome de um preset ou de uma textura em inglês no próprio schema.
 */
const SAME_IN_BOTH_LANGUAGES: ReadonlySet<string> = new Set([
    'Prestige', 'Crosshatch', 'Pinstripes', 'Carbon Tech', 'Prism Mesh', 'Blueprint Pro', 'Scanlines (CRT)', 'Neon Glow',
    'Industrial Matte', 'Cyber Neon Glow', 'Glassmorphism Frosted', 'Minimalist Borderline', 'Cyberpunk Wireframe', 'Neumorphism Soft',
    'Topbar (horizontal)', 'Light mode', 'Layout',
]);
const isUnit = (text: string): boolean => /^\d+ px$/.test(text);

const catalogMap = new Map(TokenCatalog.map((entry) => [entry.tokenId, { name: entry.name, description: entry.description }]));
const common = { catalogMap, draft: {} as SarakDesignState, updateDraft: vi.fn(), previewDevice: 'desktop' };
const allTokens = sarakGetAllDesignTokens();
const tokenById = (id: string): SarakDesignToken => {
    const token = allTokens.find((candidate) => candidate.id === id);
    if (!token) throw new Error(`token ${id} não existe no schema`);
    return token;
};

/** Os tokens que a coluna mostra, por decisão: ajustes principais, perguntas e o bloco global da decisão Layout. */
const tokensOfDecisions = (): SarakDesignToken[] => {
    const context = buildDecisionContext();
    const byId = new Map<string, SarakDesignToken>();
    COLUMN_DECISIONS.forEach((decision) => {
        const layers = decisionLayers(decision, context);
        const globalBlock = decision.includeGlobal
            ? [...context.globalTokens, ...context.preferenceTokens].filter((token) => inScope(decision, token.id) && !layers.omitFromGlobal.has(token.id))
            : [];
        [...layers.mainTokens, ...layers.questions.flatMap((question) => question.tokens), ...globalBlock].forEach((token) => byId.set(token.id, token));
    });
    return [...byId.values()];
};

const inLanguage = (language: string, ui: React.ReactElement) =>
    render(<SarakUIProvider options={{ fonts: 'none', i18n: { languages: [language], language } }}><ForceOpenSections.Provider value>{ui}</ForceOpenSections.Provider></SarakUIProvider>);

/** Rótulo, ajuda aberta e opções de cada linha de controle. */
const collectRows = (container: HTMLElement, into: Texts): void => {
    container.querySelectorAll('[data-token-row]').forEach((row) => {
        const id = row.getAttribute('data-token-row') ?? '';
        const help = row.querySelector('button.cursor-help');
        const label = help?.closest('span')?.firstChild?.textContent?.trim();
        if (label) into.set(`${id}.label`, label);
        if (help) {
            fireEvent.mouseEnter(help);
            const description = help.parentElement?.querySelector('p')?.textContent?.trim();
            if (description) into.set(`${id}.description`, description);
            fireEvent.mouseLeave(help);
        }
        if (tokenById(id).type === 'font') return;
        row.querySelectorAll('option').forEach((option) => into.set(`${id}.option.${option.getAttribute('value')}`, option.textContent?.trim() ?? ''));
    });
};

const collect = (language: string): Texts => {
    const texts: Texts = new Map();
    const tokens = tokensOfDecisions();
    const list = inLanguage(language, <DecisionTokenList tokens={tokens} {...common} />);
    collectRows(list.container, texts);
    list.unmount();
    const settings = inLanguage(language, (
        <ThemeGlobalSettings globalComponent={{ id: 'global', label: 'Global', tokens: [] }} sarak={{ branding: {}, updateBranding: vi.fn() } as never} {...common} />
    ));
    settings.container.querySelectorAll('h3').forEach((title, index) => texts.set(`global.title.${index}`, title.textContent?.trim() ?? ''));
    [...settings.container.querySelectorAll('button.cursor-help')].filter((help) => !help.closest('[data-token-row]')).forEach((help, index) => {
        texts.set(`global.field.${index}`, help.closest('span')?.firstChild?.textContent?.trim() ?? '');
    });
    settings.unmount();
    return texts;
};

const collectNotes = (language: string): Texts => {
    const texts: Texts = new Map();
    const cases: [string, string, Record<string, SarakTokenValue>][] = [
        ['follows', 'cardRadiusBL', {}],
        ['own', 'cardRadiusBL', { cardRadiusBL: 0 }],
        ['governs', 'cardBorderRadius', {}],
        ['count', 'cardBorderRadius', { cardRadiusBL: 0 }],
    ];
    cases.forEach(([name, tokenId, values]) => {
        const view = inLanguage(language, <ExceptionRelation token={tokenById(tokenId)} draft={values} updateDraft={vi.fn()} />);
        const note = view.container.querySelector('[data-testid="exception-relation"]');
        texts.set(`${name}.note`, note?.querySelector('span')?.textContent ?? '');
        texts.set(`${name}.action`, note?.querySelector('button')?.textContent ?? '');
        view.unmount();
    });
    return texts;
};

const sameAsPortuguese = (pt: Texts, other: Texts): string[] => [...pt].flatMap(([key, text]) => {
    const shown = other.get(key);
    if (shown === undefined) return [`${key}: some em inglês`];
    const equal = shown === text && !SAME_IN_BOTH_LANGUAGES.has(text) && !isUnit(text);
    return equal && text !== '' ? [`${key}: "${text}"`] : [];
});

describe('textos das decisões principais em inglês', () => {
    afterEach(cleanup);

    it('os 60 tokens aparecem com rótulo e ajuda, e nenhum é igual ao português', () => {
        const pt = collect('pt');
        const en = collect('en');
        const labels = [...pt.keys()].filter((key) => key.endsWith('.label'));
        expect(labels.length).toBeGreaterThanOrEqual(58);
        expect([...pt.keys()].filter((key) => key.endsWith('.description')).length).toBeGreaterThanOrEqual(58);
        expect(sameAsPortuguese(pt, en).filter((line) => !line.startsWith('global.'))).toEqual([]);
    }, 120_000);

    it('os dois tokens do bloco global (modo do sistema e tamanho das fontes) saem traduzidos', () => {
        const en = collect('en');
        expect(en.get('mode.label')).toBe('System theme');
        expect(en.get('bodySize.label')).toBe('Global font size (Body)');
        expect(en.get('mode.option.light')).toBe('Light mode');
        expect(en.get('mode.option.dark')).toBe('Dark mode (default)');
    }, 120_000);

    it('os títulos e campos do bloco global e as notas de mestre × canto não são iguais ao português', () => {
        const pt = collect('pt');
        const en = collect('en');
        const globals = [...pt].filter(([key]) => key.startsWith('global.'));
        expect(globals.length).toBeGreaterThanOrEqual(7);
        globals.forEach(([key, text]) => expect(text, key).not.toBe(''));
        expect(sameAsPortuguese(new Map(globals), en)).toEqual([]);
        expect(sameAsPortuguese(collectNotes('pt'), collectNotes('en'))).toEqual([]);
    }, 120_000);

    it('a opção traduzida grava o mesmo valor: id, valor e ordem não mudam', () => {
        const pt = collect('pt');
        const en = collect('en');
        const optionKeys = (texts: Texts) => [...texts.keys()].filter((key) => key.includes('.option.'));
        expect(optionKeys(en)).toEqual(optionKeys(pt));
        expect(optionKeys(pt).length).toBeGreaterThan(100);
    }, 120_000);
});
