import { describe, expect, it } from 'vitest';
import { peekWithTones } from '../peekWithTones';

const theme = { design: { mode: 'dark', sidebarTone: 'neutral', topbarTone: 'surface', sidebarColor: '#112233' } as never };

describe('peekWithTones', () => {
    it('devolve a espiada como veio quando ela não tem tom', () => {
        const peek = { navigationStyle: 'topbar' } as never;
        expect(peekWithTones(peek, {}, theme)).toBe(peek);
    });

    it('devolve null e a espiada sem tema como vieram', () => {
        expect(peekWithTones(null, {}, theme)).toBeNull();
        const peek = { sidebarTone: 'primary' } as never;
        expect(peekWithTones(peek, {}, undefined)).toBe(peek);
    });

    it('com tom, o papel espiado vence a cor que o tema declara para a barra', () => {
        const draft = { mode: 'dark', sidebarTone: 'neutral', topbarTone: 'surface', sidebarColor: '#112233' } as never;
        const peeked = peekWithTones({ sidebarTone: 'primary', topbarTone: 'primary' } as never, draft, theme as never) as Record<string, unknown>;
        expect(peeked.sidebarTone).toBe('primary');
        expect(peeked.sidebarColor).not.toBe('#112233');
    });
});
