import { describe, it, expect, afterEach } from 'vitest';
import { injectSarakStyles } from '../injectStyles';

const STYLE_TAG_ID = 'sarak-ui-core-styles';

describe('injectSarakStyles (Spec 08 §2 — Instalação Zero-Config)', () => {
    afterEach(() => {
        document.getElementById(STYLE_TAG_ID)?.remove();
    });

    it('cria um <style> com o CSS recebido no head', () => {
        injectSarakStyles('body{color:red}');
        const tag = document.getElementById(STYLE_TAG_ID);
        expect(tag).not.toBeNull();
        expect(tag?.tagName).toBe('STYLE');
        expect(tag?.textContent).toBe('body{color:red}');
    });

    it('é idempotente — não duplica o <style> em chamadas repetidas', () => {
        injectSarakStyles('body{color:red}');
        injectSarakStyles('body{color:blue}');
        const tags = document.querySelectorAll(`#${STYLE_TAG_ID}`);
        expect(tags.length).toBe(1);
        // A primeira chamada vence; a segunda é ignorada pelo guard de `id`.
        expect(tags[0].textContent).toBe('body{color:red}');
    });

    it('não injeta nada quando o CSS é vazio', () => {
        injectSarakStyles('');
        expect(document.getElementById(STYLE_TAG_ID)).toBeNull();
    });
});
