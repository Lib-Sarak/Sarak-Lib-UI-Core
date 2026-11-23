// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { getPersonality } from '../../components/personalities';
import { SARAK_ALL_THEMES } from '../all';

/** Os tokens de barra que a Personalidade mais próxima do caráter do tema entrega a ele. */
const BAR_KEYS = [
    'sidebarTone', 'topbarTone', 'sidebarActiveItemStyle', 'topbarActiveItemStyle', 'sidebarBorderSide', 'sidebarBorderStyle', 'sidebarBorderWidth',
    'topbarBorderSide', 'topbarBorderStyle', 'topbarBorderWidth',
] as const;

/** O tema padrão (referência de quem clona, 09 §5.2) mantém os padrões do schema: não tem Personalidade. */
const SCHEMA_DEFAULT_THEME = 'sarak-sovereign';

const CLOSEST_PERSONALITY: Readonly<Record<string, string>> = {
    'corporate-ledger': 'corporate', 'high-contrast': 'corporate', 'golden-hour': 'executive',
    'blueprint-protocol': 'technical', 'industrial-terminal': 'technical', 'minimalist-airy': 'modern', 'kinetic-flow': 'modern', 'playful-pastel': 'modern',
    'neumorphic-mobile': 'soft', 'organic-clay': 'soft', 'editorial-ink': 'editorial', 'neo-brutalism': 'brutalist',
    'aurora-veil': 'glass', 'nebula-space': 'glass', 'data-terminal': 'erp', 'cyberpunk-neon': 'operations', 'cyber-retro-wave': 'operations',
    'sarak-sovereign-classic': 'corporate', 'cyberpunk-neon-classic': 'operations', 'industrial-terminal-classic': 'erp', 'cyber-retro-wave-classic': 'glass',
    'nature-breeze': 'soft', 'neo-brutalism-classic': 'brutalist', 'dot-matrix-elegant': 'executive',
};

/**
 * Os temas resgatados seguem a anatomia da barra antiga (09 §5): item ativo com a barra luminosa e a moldura em cartão. Nesses
 * dois tokens eles não espelham a Personalidade mais próxima; o resto da barra (tons, bordas dos topos) segue o contrato.
 */
const RESCUED_ANATOMY_THEMES: ReadonlySet<string> = new Set([
    'sarak-sovereign-classic', 'cyberpunk-neon-classic', 'industrial-terminal-classic', 'cyber-retro-wave-classic',
    'nature-breeze', 'neo-brutalism-classic', 'dot-matrix-elegant',
]);
const ANATOMY_KEYS: ReadonlySet<string> = new Set(['sidebarActiveItemStyle', 'sidebarBorderSide']);

describe('temas embarcados — as barras têm o caráter de uma Personalidade', () => {
    it('todo tema embarcado tem uma Personalidade mais próxima declarada aqui, e nenhuma sobra', () => {
        expect(SARAK_ALL_THEMES.map((theme) => theme.id).filter((id) => id !== SCHEMA_DEFAULT_THEME).sort()).toEqual(Object.keys(CLOSEST_PERSONALITY).sort());
        Object.values(CLOSEST_PERSONALITY).forEach((key) => expect(getPersonality(`personality-${key}`), key).toBeDefined());
    });

    it.each(SARAK_ALL_THEMES.filter((theme) => theme.id !== SCHEMA_DEFAULT_THEME).map((theme) => [theme.id, theme] as const))('%s declara os tons, o item ativo e a borda da Personalidade', (id, theme) => {
        const personality = getPersonality(`personality-${CLOSEST_PERSONALITY[id]}`)!;
        const design = theme.design as Record<string, unknown>;
        BAR_KEYS.filter((key) => key in personality.design && !(RESCUED_ANATOMY_THEMES.has(id) && ANATOMY_KEYS.has(key))).forEach((key) => expect(design[key], `${id}.${key}`).toEqual((personality.design as Record<string, unknown>)[key]));
        expect(design.sidebarTone).toBe(personality.design.sidebarTone);
        expect(design.topbarTone).toBe(personality.design.topbarTone);
    });

    it.each([...RESCUED_ANATOMY_THEMES])('%s declara o item ativo com a barra luminosa e a borda da moldura', (id) => {
        const design = SARAK_ALL_THEMES.find((theme) => theme.id === id)!.design as Record<string, unknown>;
        expect(design.sidebarActiveItemStyle).toBe('bar');
        expect(design.sidebarBorderSide).not.toBe('none');
        expect(design.userAvatarStyle).toBe('icon');
    });

    it.each([...RESCUED_ANATOMY_THEMES])('%s não grava a cor de ícone, de rótulo nem de título de seção da barra (a paleta calcula)', (id) => {
        const theme = SARAK_ALL_THEMES.find((candidate) => candidate.id === id)!;
        for (const block of [theme.design, theme.contraparte] as Array<Record<string, unknown> | undefined>) {
            for (const key of ['sidebarIconColor', 'sidebarItemTextColor', 'sidebarCategoryColor']) expect(block?.[key], `${id}.${key}`).toBeUndefined();
        }
    });

    it('o tema padrão segue com os padrões do schema nas barras', () => {
        const design = SARAK_ALL_THEMES.find((theme) => theme.id === SCHEMA_DEFAULT_THEME)!.design as Record<string, unknown>;
        expect([design.sidebarTone, design.topbarTone, design.sidebarLogoPlacement, design.sidebarActiveItemStyle, design.topbarActiveItemStyle]).toEqual(['neutral', 'neutral', 'top', 'bar', 'bar']);
    });

    it('o conjunto usa os cinco tons, e `neutral` não é mais o único', () => {
        const designs = SARAK_ALL_THEMES.map((theme) => theme.design as Record<string, unknown>);
        expect(new Set(designs.flatMap((design) => [design.sidebarTone, design.topbarTone]))).toEqual(new Set(['neutral', 'surface', 'primary', 'secondary', 'inverse']));
        const withPersonality = SARAK_ALL_THEMES.filter((theme) => theme.id !== SCHEMA_DEFAULT_THEME).map((theme) => theme.design as Record<string, unknown>);
        expect(withPersonality.filter((design) => design.sidebarTone === 'neutral' && design.topbarTone === 'neutral').length).toBeLessThanOrEqual(3);
    });

    it('nenhum tema escreve cor de barra para contornar o tom; a cor que já declarava segue declarada', () => {
        SARAK_ALL_THEMES.filter((theme) => theme.id !== SCHEMA_DEFAULT_THEME).forEach((theme) => {
            const personality = getPersonality(`personality-${CLOSEST_PERSONALITY[theme.id]}`)!;
            expect('sidebarColor' in personality.design).toBe(false);
            expect('topbarColor' in personality.design).toBe(false);
        });
    });
});
