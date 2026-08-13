import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as ComponentModule from '../SarakCardGrid';
import { SarakCardGrid } from '../SarakCardGrid';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

describe('SarakCardGrid', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
        // TODO: Injetar testes de montagem profunda caso o componente cresça em complexidade
    });

    // plan-41: `cardsGrid`/`headerRow` usam classe `@min-[…]` (container query), que só
    // ativa com um ancestral `container-type`. jsdom não avalia container query —
    // prova só que a raiz PLANTA `@container` (a query casar é prova de browser real,
    // plan-40).
    it('planta @container na raiz — ancestral do grid de cards e do cabeçalho responsivo', () => {
        const { container } = render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakCardGrid endpoint="/mock" label="Mock" />
            </SarakUIProvider>
        );

        expect(container.querySelector('[class*="@container"]')).not.toBeNull();
    });
});
