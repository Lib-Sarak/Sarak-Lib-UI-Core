// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { MEDIA_PRESETS, TEXTURE_PRESETS, ATMOSPHERE_PRESETS } from '../atmosphere';

/**
 * Invariante: nenhum preset shippado de atmosfera depende de servidor de terceiro.
 * Não há gate dedicado para isto — este teste é a régua.
 */
describe('MEDIA_PRESETS — nenhum preset shippado aponta para servidor de terceiro', () => {
    const THIRD_PARTY_URL = /^https?:\/\//i;

    it('nenhum valor de design carrega esquema http/https', () => {
        const offenders = ATMOSPHERE_PRESETS.flatMap((preset) =>
            Object.entries(preset.design)
                .filter(([, value]) => typeof value === 'string' && THIRD_PARTY_URL.test(value))
                .map(([key, value]) => `${preset.id}.${key}=${String(value)}`)
        );

        expect(offenders).toEqual([]);
    });

    it('os quatro ids legados continuam no catálogo, agora com atmosfera gerada em CSS', () => {
        const legacyIds = ['bg-kinetic-flow', 'bg-stellar-nebula', 'bg-cyber-grid-img', 'bg-dark-cinematic'];

        for (const id of legacyIds) {
            const preset = MEDIA_PRESETS.find((p) => p.id === id);
            expect(preset).toBeDefined();
            expect(preset?.design.globalBackgroundImageUrl).toBe('');
            expect(preset?.design.texture).toBeTruthy();
            expect(preset?.design.texture).not.toBe('none');
        }
    });

    it('todo preset de mídia com textura usa um valor existente em TEXTURE_PRESETS', () => {
        const knownTextures = new Set(TEXTURE_PRESETS.map((p) => p.design.texture));

        for (const preset of MEDIA_PRESETS) {
            if (preset.design.texture) {
                expect(knownTextures.has(preset.design.texture)).toBe(true);
            }
        }
    });
});
