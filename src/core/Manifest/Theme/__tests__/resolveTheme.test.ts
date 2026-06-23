import { describe, it, expect, afterEach, vi } from 'vitest';
import { resolveTheme } from '../resolveTheme';
import { GLOBAL_THEMES } from '../../../Design/presets/themes';
import { EMPTY_STATE } from '../../nodes/context';

const cyberpunk = GLOBAL_THEMES.find((theme) => theme.id === 'cyberpunk-neon');

describe('resolveTheme (Spec 42 — ponte de tema por região)', () => {
    afterEach(() => vi.restoreAllMocks());

    it('aplica um preset nomeado sobre o tema herdado (Regra 1)', () => {
        const design = resolveTheme('cyberpunk-neon', EMPTY_STATE, EMPTY_STATE, null);
        expect(design).toMatchObject(cyberpunk!.design);
    });

    it('mescla um override parcial só nas chaves declaradas sobre o herdado (Regra 3)', () => {
        const inherited = { primaryColor: '#111111', secondaryColor: '#222222' };
        const design = resolveTheme({ secondaryColor: '#ff0000' }, EMPTY_STATE, EMPTY_STATE, inherited);
        // chave declarada sobrepõe; chave herdada não-declarada permanece.
        expect(design.secondaryColor).toBe('#ff0000');
        expect(design.primaryColor).toBe('#111111');
    });

    it('preset desconhecido falha fechado: mantém o tema herdado (resiliência)', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const inherited = { primaryColor: '#abcdef' };
        const design = resolveTheme('preset-inexistente', EMPTY_STATE, EMPTY_STATE, inherited);
        expect(design).toEqual(inherited);
    });

    it('resolve um binding "{{designTheme}}" para o preset via estado global (Regra 4)', () => {
        const global = { designTheme: 'cyberpunk-neon' };
        const design = resolveTheme('{{designTheme}}', EMPTY_STATE, global, null);
        expect(design.primaryColor).toBe(cyberpunk!.design.primaryColor);
    });

    it('interpola valores-string com binding dentro de um override parcial', () => {
        const global = { brand: '#00ff41' };
        const design = resolveTheme({ primaryColor: '{{brand}}' }, EMPTY_STATE, global, null);
        expect(design.primaryColor).toBe('#00ff41');
    });
});
