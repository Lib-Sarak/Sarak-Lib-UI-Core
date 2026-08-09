import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as HookModule from '../useStructuralStyles';
import { useStructuralStyles } from '../useStructuralStyles';

describe('useStructuralStyles', () => {
    it('should export the hook correctly', () => {
        expect(HookModule).toBeDefined();
        // TODO: Escrever testes comportamentais para este hook
    });

    it('renderiza sem SarakUIProvider, com o default de grid aplicado (col-12)', () => {
        const Probe: React.FC = () => {
            const { getGridStyles } = useStructuralStyles();
            const { className } = getGridStyles();
            return React.createElement('span', { 'data-testid': 'grid-class' }, className);
        };
        expect(() => render(React.createElement(Probe))).not.toThrow();
        expect(screen.getByTestId('grid-class')).toHaveTextContent('grid-cols-1');
    });
});
