import { beforeAll, describe, expect, it } from 'vitest';
import { SIDEBAR_PRESETS } from '../layout';
import { sarakLoadThemePreset } from '../../themes/registry';
import { findThemeEntry, replaceDesignChoice, recomposeDesignChoices } from '../../../../Provider/utils/designChoices';

const SOVEREIGN = 'sarak-sovereign';
const preset = (id: string) => SIDEBAR_PRESETS.find((entry) => entry.id === id)!;

describe('presets da barra lateral', () => {
    beforeAll(async () => { await sarakLoadThemePreset(SOVEREIGN); });

    it('a Compacta traz o tom Superfície da lateral, que a separa da Limpa', () => {
        expect(preset('sidebar-compact').design.sidebarTone).toBe('surface');
        expect(preset('sidebar-clean').design.sidebarTone).toBeUndefined();
    });

    it('aplicada a Compacta, a lateral pinta o fundo de superfície e não o neutro', () => {
        const theme = findThemeEntry(undefined, SOVEREIGN)!;
        const draft = recomposeDesignChoices({}, theme) as unknown as Record<string, unknown>;
        const applied = Object.entries(preset('sidebar-compact').design).reduce(
            (current, [key, value]) => replaceDesignChoice(current as unknown as Record<string, unknown>, { [key]: value }, theme) as unknown as Record<string, unknown>,
            draft,
        );
        const neutral = replaceDesignChoice(draft, { sidebarTone: 'neutral' }, theme) as unknown as Record<string, unknown>;
        expect(applied.sidebarTone).toBe('surface');
        expect(applied.sidebarColor).toBeDefined();
        expect(applied.sidebarColor).not.toBe(neutral.sidebarColor);
    });
});
