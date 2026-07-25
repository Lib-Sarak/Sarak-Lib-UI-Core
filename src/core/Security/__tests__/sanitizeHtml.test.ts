import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '../sanitizeHtml';

describe('sanitizeHtml (Spec 40 — canal centralizado de sanitização)', () => {
    it('remove <script> de um payload de XSS', () => {
        const out = sanitizeHtml('<p>oi</p><script>alert(1)</script>');
        expect(out).toContain('oi');
        expect(out.toLowerCase()).not.toContain('<script');
        expect(out).not.toContain('alert(1)');
    });

    it('neutraliza handlers de evento on*', () => {
        const out = sanitizeHtml('<img src=x onerror="alert(1)">');
        expect(out.toLowerCase()).not.toContain('onerror');
    });

    it('neutraliza URLs javascript: em links', () => {
        const out = sanitizeHtml('<a href="javascript:alert(1)">x</a>');
        expect(out.toLowerCase()).not.toContain('javascript:');
    });

    it('preserva HTML benigno', () => {
        const out = sanitizeHtml('<strong>negrito</strong> e <em>itálico</em>');
        expect(out).toContain('<strong>');
        expect(out).toContain('<em>');
    });
});
