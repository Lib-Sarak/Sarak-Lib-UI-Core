import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as ComponentModule from '../MessageList';
import { MessageList } from '../MessageList';

describe('MessageList', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
        // TODO: Injetar testes de montagem profunda caso o componente cresça em complexidade
    });
});

describe('MessageList — aiGlowColor', () => {
    it('o indicador de "pensando" lê --sarak-ai-glow, com a primária como reserva', () => {
        const { container } = render(
            <MessageList messages={[]} isLoading isProcessingFiles={false} scrollRef={{ current: null }} />,
        );
        const dots = Array.from(container.querySelectorAll('div')).filter((el) => el.className.includes('w-1.5'));

        expect(dots).toHaveLength(3);
        for (const dot of dots) {
            expect(dot.className).toContain('bg-[var(--sarak-ai-glow,var(--sarak-primary-color,#3b82f6))]');
        }
    });
});
