// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { buildViteConfig, buildFrontendOnlyViteConfig } from '../viteConfig.mjs';

describe('buildViteConfig', () => {
    it('embute as portas do backend e do frontend no proxy', () => {
        const output = buildViteConfig({ answers: { backendPort: 3000, frontendPort: 5173 } });
        expect(output).toContain("port: 5173");
        expect(output).toContain("target: 'http://localhost:3000'");
        expect(output).toContain("'/api'");
    });

    it('respeita portas customizadas', () => {
        const output = buildViteConfig({ answers: { backendPort: 4001, frontendPort: 4173 } });
        expect(output).toContain('port: 4173');
        expect(output).toContain("http://localhost:4001");
    });

    it('inclui manualChunks separando só vendor-react, sem tocar em @sarak/lib-ui-core (Spec 40 §2.2)', () => {
        const output = buildViteConfig({ answers: { backendPort: 3000, frontendPort: 5173 } });
        expect(output).toContain('manualChunks');
        expect(output).toContain("'vendor-react'");
        // Armadilha medida na prática: agrupar @sarak/lib-ui-core (ou "resto de
        // node_modules") funde de volta os chunks lazy internos da lib — não repetir.
        expect(output).not.toContain("'sarak-ui-core'");
        expect(output).not.toContain("'vendor'");
    });
});

describe('buildFrontendOnlyViteConfig', () => {
    it('não gera proxy (backend é externo)', () => {
        const output = buildFrontendOnlyViteConfig({ answers: { frontendPort: 5173 } });
        expect(output).not.toContain('proxy');
        expect(output).toContain('port: 5173');
    });

    it('também inclui manualChunks (mesmo sem proxy)', () => {
        const output = buildFrontendOnlyViteConfig({ answers: { frontendPort: 5173 } });
        expect(output).toContain('manualChunks');
    });
});
