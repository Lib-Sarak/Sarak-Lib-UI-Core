import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as ComponentModule from '../AuthSocialLogin';
import { AuthSocialLogin } from '../AuthSocialLogin';
import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';

describe('AuthSocialLogin', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
        // TODO: Injetar testes de montagem profunda caso o componente cresça em complexidade
    });

    // plan-41: o grid de provedores usa `getGridStyles` — classe `@min-[…]`
    // (container query), que só ativa com um ancestral `container-type`. jsdom não
    // avalia container query — prova só que a raiz PLANTA `@container` (a query casar
    // é prova de browser real, plan-40).
    it('planta @container na raiz — ancestral do grid de provedores', () => {
        const { container } = render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <AuthSocialLogin socialConfig={{ enabled: true, display: 'full', providers: [{ id: 'google', variant: 'glass' }] }} />
            </SarakUIProvider>
        );

        expect(container.querySelector('[class*="@container"]')).not.toBeNull();
    });
});
