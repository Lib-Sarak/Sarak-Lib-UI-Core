import { describe, expect, it } from 'vitest';
import { LIBRARY_TEXT_CATALOG } from '../../../../core/i18n/catalog';
import type { SarakLibraryLanguage } from '../../../../core/i18n/catalog.types';
import { DECISION_TOKEN_IDS, decisionTokenTextKey } from '../../../../core/i18n/catalogEntries.decisionTokens';
import { TokenCatalog } from '../../../../core/Design/catalog';
import { COLUMN_DECISIONS, decisionLayers } from '../decisions';
import { buildDecisionContext } from '../decisionContext';
import { inScope } from '../barScope';

const LANGUAGES: readonly SarakLibraryLanguage[] = ['pt', 'en', 'es', 'fr', 'de', 'it'];
const catalog = LIBRARY_TEXT_CATALOG as Record<string, Record<SarakLibraryLanguage, string> | undefined>;

/** Ajustes principais, perguntas e o bloco global que a decisão Layout mostra (preferências e o que as perguntas não cobrem). */
const mainDecisionTokenIds = (): string[] => {
    const context = buildDecisionContext();
    return [...new Set(COLUMN_DECISIONS.flatMap((decision) => {
        const layers = decisionLayers(decision, context);
        const globalBlock = decision.includeGlobal
            ? [...context.globalTokens, ...context.preferenceTokens].filter((token) => inScope(decision, token.id) && !layers.omitFromGlobal.has(token.id))
            : [];
        return [...layers.mainTokens.map((token) => token.id), ...layers.questionTokenIds, ...globalBlock.map((token) => token.id)];
    }))].sort();
};

describe('textos dos ajustes principais das decisões', () => {
    it('registra em catálogo os tokens de todas as decisões principais e perguntas', () => {
        const expected = mainDecisionTokenIds();
        expect(DECISION_TOKEN_IDS.slice().sort()).toEqual(expected);
        expect(expected).toHaveLength(61);
    });

    it('o bloco global da decisão Layout entra na lista: modo do sistema e tamanho global das fontes têm texto', () => {
        expect(mainDecisionTokenIds()).toEqual(expect.arrayContaining(['mode', 'bodySize']));
    });

    it('cada token alcançado tem nome e descrição não vazios nos seis idiomas', () => {
        const missing: string[] = [];
        mainDecisionTokenIds().forEach((tokenId) => {
            (['name', 'description'] as const).forEach((field) => {
                const key = decisionTokenTextKey(tokenId, field);
                LANGUAGES.forEach((language) => {
                    if (!catalog[key]?.[language]?.trim()) missing.push(`${tokenId}.${field}.${language}`);
                });
            });
        });
        expect(missing).toEqual([]);
    });

    it('português preserva o texto atual do catálogo de tokens', () => {
        const current = new Map(TokenCatalog.map((entry) => [entry.tokenId, entry]));
        mainDecisionTokenIds().forEach((tokenId) => {
            const source = current.get(tokenId);
            if (!source) return;
            expect(catalog[decisionTokenTextKey(tokenId, 'name')]?.pt).toBe(source.name);
            expect(catalog[decisionTokenTextKey(tokenId, 'description')]?.pt).toBe(source.description);
        });
    });

    it('o rótulo de es, fr, de e it não é cópia do inglês', () => {
        const copied: string[] = [];
        mainDecisionTokenIds().forEach((tokenId) => {
            const name = catalog[decisionTokenTextKey(tokenId, 'name')];
            (['es', 'fr', 'de', 'it'] as const).forEach((language) => {
                if (name?.[language]?.trim().toLowerCase() === name?.en?.trim().toLowerCase()) copied.push(`${tokenId}.${language}`);
            });
        });
        expect(copied).toEqual([]);
    });

    it('a descrição de cada idioma diz o que o ajuste faz: não repete o nome e não é igual à de outro idioma', () => {
        const weak: string[] = [];
        mainDecisionTokenIds().forEach((tokenId) => {
            const name = catalog[decisionTokenTextKey(tokenId, 'name')];
            const description = catalog[decisionTokenTextKey(tokenId, 'description')];
            LANGUAGES.forEach((language) => {
                const text = description?.[language]?.trim().toLowerCase() ?? '';
                const ownName = name?.[language]?.trim().toLowerCase() ?? '';
                const withoutName = text.replace(ownName, '').replace(/[^\p{L}]/gu, '');
                if (language !== 'pt' && text.includes(ownName)) weak.push(`${tokenId}.${language}: contém o nome`);
                if (withoutName.length < 20) weak.push(`${tokenId}.${language}: curta demais`);
                LANGUAGES.filter((other) => other > language && description?.[other]?.trim().toLowerCase() === text).forEach((other) => weak.push(`${tokenId}.${language}=${other}`));
            });
        });
        expect(weak).toEqual([]);
    });
});
