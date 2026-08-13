import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as ComponentModule from '../ExpandableCard';
import { ExpandableCard } from '../ExpandableCard';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

describe('ExpandableCard', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
        // TODO: Injetar testes de montagem profunda caso o componente cresça em complexidade
    });

    // plan-41: `bodyPadding`/`headerMargin` (getResponsiveSpacingStyles) usam classe
    // `@min-[…]` (container query) DENTRO do `createPortal` (renderiza em
    // `document.body`, fora da subárvore da raiz do card — um `@container` na raiz do
    // card não ajudaria). jsdom não avalia container query — prova só que o overlay
    // portalado PLANTA `@container` como ancestral (a query casar é prova de browser
    // real, plan-40).
    it('planta @container no overlay portalado — ancestral do padding/margin responsivos', () => {
        render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <ExpandableCard title="Card de teste">
                    <div>conteúdo</div>
                </ExpandableCard>
            </SarakUIProvider>
        );

        fireEvent.click(screen.getByTitle('Expandir Tela Cheia'));

        // `[class*="@container"]`, não `.fixed.inset-0`: o Provider também injeta um
        // efeito de ruído global com `fixed inset-0` (z-[9999]) — o overlay do portal
        // (o nosso, z-[99999]) precisa ser distinguido pela classe que plantamos.
        expect(document.body.querySelector('[class*="@container"]')).not.toBeNull();
    });
});
