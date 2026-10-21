import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as ComponentModule from '../SarakChatEngine';
import SarakChatEngine from '../SarakChatEngine';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

describe('SarakChatEngine', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
        // TODO: Injetar testes de montagem profunda caso o componente cresça em complexidade
    });

    it('aiGlowColor: o indicador de "pensando" lê --sarak-ai-glow, com a primária do tema como reserva', () => {
        const { container } = render(
            <SarakUIProvider config={{}}>
                <SarakChatEngine messages={[]} onSendMessage={() => undefined} isLoading />
            </SarakUIProvider>,
        );
        const glowing = container.querySelectorAll('[class*="--sarak-ai-glow,var(--theme-primary)"]');

        // avatar do assistente (fundo + ícone) e os três pontos
        expect(glowing.length).toBeGreaterThanOrEqual(4);
    });
});
