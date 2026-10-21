import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { injectSarakStyles } from '../injectStyles';

const STYLE_TAG_ID = 'sarak-ui-core-styles';

describe('injectSarakStyles (Spec 08 §2 — Instalação Zero-Config)', () => {
    beforeEach(() => {
        document.getElementById(STYLE_TAG_ID)?.remove();
    });

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

    it('aplica o nonce antes de anexar a tag ao head', () => {
        injectSarakStyles('body{color:red}', 'csp-nonce');

        expect(document.getElementById(STYLE_TAG_ID)).toHaveAttribute('nonce', 'csp-nonce');
    });

    it('substitui a folha sem nonce por outra já identificada quando o Provider fornece nonce', () => {
        injectSarakStyles('body{color:red}');
        const initialStyle = document.getElementById(STYLE_TAG_ID);

        injectSarakStyles('body{color:red}', 'csp-nonce');

        const nonceStyle = document.getElementById(STYLE_TAG_ID);
        expect(nonceStyle).not.toBe(initialStyle);
        expect(initialStyle).not.toBeInTheDocument();
        expect(nonceStyle).toHaveAttribute('nonce', 'csp-nonce');
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
