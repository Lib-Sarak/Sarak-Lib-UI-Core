/** @vitest-environment node */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SarakScopeRoot } from '../../../Provider/components/SarakScopeRoot';

describe('SarakScopeRoot no servidor', () => {
    it('renderiza o selo sem Provider e sem document global', () => {
        expect(typeof document).toBe('undefined');

        const markup = renderToStaticMarkup(
            <SarakScopeRoot mode="embedded">
                <span>conteúdo</span>
            </SarakScopeRoot>,
        );

        expect(markup).toContain('data-sarak-build-info=');
        expect(markup).toContain('<span>conteúdo</span>');
    });
});
