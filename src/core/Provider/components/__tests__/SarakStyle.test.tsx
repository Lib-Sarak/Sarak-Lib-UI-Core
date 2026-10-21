import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SarakStyle, SarakStyleNonceContext } from '../SarakStyle';

describe('SarakStyle', () => {
    it('aplica o nonce herdado do Provider', () => {
        const { container } = render(
            <SarakStyleNonceContext.Provider value="provider-nonce">
                <SarakStyle id="provider-style">{'.provider { color: red; }'}</SarakStyle>
            </SarakStyleNonceContext.Provider>,
        );

        expect(container.querySelector('#provider-style')).toHaveAttribute('nonce', 'provider-nonce');
    });

    it('prioriza um nonce explícito do elemento', () => {
        const { container } = render(
            <SarakStyleNonceContext.Provider value="provider-nonce">
                <SarakStyle id="explicit-style" nonce="explicit-nonce">{'.explicit { color: blue; }'}</SarakStyle>
            </SarakStyleNonceContext.Provider>,
        );

        expect(container.querySelector('#explicit-style')).toHaveAttribute('nonce', 'explicit-nonce');
    });
});
