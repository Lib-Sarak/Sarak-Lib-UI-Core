// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { buildViteConfig } from '../viteConfig.mjs';

describe('buildViteConfig (starter padrão — Spec 45, sem backend)', () => {
    it('embute a porta do frontend, sem proxy (não há backend para apontar)', () => {
        const output = buildViteConfig({ answers: { frontendPort: 5173 } });
        expect(output).toContain('port: 5173');
        expect(output).not.toContain('proxy');
        expect(output).not.toContain("'/api'");
    });

    it('respeita porta customizada', () => {
        const output = buildViteConfig({ answers: { frontendPort: 4173 } });
        expect(output).toContain('port: 4173');
    });

    it('inclui manualChunks separando só vendor-react, sem tocar em @sarak/lib-ui-core (Spec 40 §2.2)', () => {
        const output = buildViteConfig({ answers: { frontendPort: 5173 } });
        expect(output).toContain('manualChunks');
        expect(output).toContain("'vendor-react'");
        // Armadilha medida na prática: agrupar @sarak/lib-ui-core (ou "resto de
        // node_modules") funde de volta os chunks lazy internos da lib — não repetir.
        expect(output).not.toContain("'sarak-ui-core'");
        expect(output).not.toContain("'vendor'");
    });
});
