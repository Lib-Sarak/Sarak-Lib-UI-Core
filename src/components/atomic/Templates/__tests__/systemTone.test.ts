import { describe, expect, it } from 'vitest';
import { SYSTEM_TONE_COLOR, SYSTEM_TONE_SHAPE, type SarakSystemTone } from '../systemTone';

const TONES: SarakSystemTone[] = ['success', 'error', 'warning', 'info', 'muted'];

describe('systemTone', () => {
    it('todo tom lê a cor do tema, com var() e sem valor fixo', () => {
        TONES.forEach((tone) => expect(SYSTEM_TONE_COLOR[tone]).toMatch(/^var\(--/));
    });

    it('cada tom tem uma forma própria, para o estado nunca depender só da cor', () => {
        const shapes = TONES.map((tone) => SYSTEM_TONE_SHAPE[tone]);

        expect(new Set(shapes).size).toBe(TONES.length);
    });
});
