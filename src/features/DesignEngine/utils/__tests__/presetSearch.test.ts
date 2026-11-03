// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { ALL_COMPONENT_PRESETS } from '../../../../core/Design/presets/components/registry';
import { resolvePresetText } from '../../../../core/i18n/presetTexts';
import { LANGUAGES } from '../../../../core/i18n/languages';
import type { SarakLibraryLanguage } from '../../../../core/i18n/catalog.types';
import { findPresetHits } from '../searchGroups';

const LANGUAGE_IDS = LANGUAGES.map((language) => language.id) as SarakLibraryLanguage[];
const EVERY = Number.POSITIVE_INFINITY;

describe('busca de preset — achado pelo nome e pelos sinônimos', () => {
    it.each(LANGUAGE_IDS)('%s: todo preset é achado pelo próprio nome', (language) => {
        const lost = ALL_COMPONENT_PRESETS.filter((preset) => {
            const name = resolvePresetText(preset, language).name;
            return !findPresetHits(name, (candidate) => resolvePresetText(candidate, language).name, EVERY).some((hit) => hit.presetId === preset.id);
        });
        expect(lost.map((preset) => preset.id)).toEqual([]);
    });

    it('todo sinônimo declarado acha o preset dele', () => {
        const lost = ALL_COMPONENT_PRESETS.flatMap((preset) => (preset.keywords ?? [])
            .filter((word) => !findPresetHits(word, (candidate) => candidate.name, EVERY).some((hit) => hit.presetId === preset.id))
            .map((word) => `${preset.id}:${word}`));
        expect(lost).toEqual([]);
    });

    it('a busca devolve poucos resultados e leva à decisão do grupo', () => {
        const hits = findPresetHits('compacta', (preset) => preset.name);
        expect(hits.length).toBeGreaterThan(0);
        expect(hits.length).toBeLessThanOrEqual(8);
        expect(hits.every((hit) => ['fonts', 'shape', 'components', 'layout'].includes(hit.decisionId))).toBe(true);
    });
});
