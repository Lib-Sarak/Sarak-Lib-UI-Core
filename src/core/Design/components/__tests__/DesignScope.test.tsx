import React, { useContext } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DesignScope } from '../DesignScope';
import { useDesignVariables } from '../../hooks/useDesignVariables';
import { DesignOverrideContext } from '../../../Provider/SarakUIProvider';
import type { SarakDesignState } from '../../../Provider/types';

// Mock dos hooks e componentes
vi.mock('../../hooks/useDesignVariables', () => ({
    useDesignVariables: vi.fn()
}));

vi.mock('../SarakBackgroundRenderer', () => ({
    SarakBackgroundRenderer: ({ imageUrl, opacity, blur, blendMode, mode }: any) => (
        <div 
            data-testid="background-renderer"
            data-image={imageUrl}
            data-opacity={opacity}
            data-blur={blur}
            data-blend={blendMode}
            data-mode={mode}
        />
    )
}));

// Componente para testar o contexto injetado
const ContextTester = () => {
    const design = useContext(DesignOverrideContext);
    return <div data-testid="context-tester">{JSON.stringify(design)}</div>;
};

describe('DesignScope', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        vi.mocked(useDesignVariables).mockReturnValue({
            variables: { '--custom-var': '10px' } as any,
            attributes: { 'data-custom-attr': 'test' } as any,
            responsiveCSS: '.mock-class { color: red; }'
        });
    });

    it('renderiza os filhos (children) corretamente', () => {
        render(
            <DesignScope design={{ mode: 'dark' }}>
                <div data-testid="child-element">Hello World</div>
            </DesignScope>
        );

        expect(screen.getByTestId('child-element')).toBeInTheDocument();
        expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('injeta variáveis CSS e atributos retornados por useDesignVariables', () => {
        const { container } = render(
            <DesignScope design={{ mode: 'dark' }}>
                <div />
            </DesignScope>
        );

        const scopeDiv = container.firstChild as HTMLElement;
        expect(scopeDiv).toHaveStyle('--custom-var: 10px');
        expect(scopeDiv.getAttribute('data-custom-attr')).toBe('test');
    });

    it('injeta o bloco de estilo responsivo', () => {
        const { container } = render(
            <DesignScope design={{ mode: 'dark' }}>
                <div />
            </DesignScope>
        );

        const styleElement = container.querySelector('style');
        expect(styleElement).toBeInTheDocument();
        expect(styleElement?.innerHTML).toBe('.mock-class { color: red; }');
    });

    it('passa as propriedades de background corretamente para SarakBackgroundRenderer', () => {
        const mockDesign = {
            mode: 'light',
            globalBackgroundImageUrl: 'image.png',
            globalBackgroundOpacity: 0.5,
            globalBackgroundBlur: '10px',
            globalBackgroundBlendMode: 'multiply'
        };

        render(
            <DesignScope design={mockDesign as unknown as SarakDesignState}>
                <div />
            </DesignScope>
        );

        const bgRenderer = screen.getByTestId('background-renderer');
        expect(bgRenderer).toHaveAttribute('data-image', 'image.png');
        expect(bgRenderer).toHaveAttribute('data-opacity', '0.5');
        expect(bgRenderer).toHaveAttribute('data-blur', '10px');
        expect(bgRenderer).toHaveAttribute('data-blend', 'multiply');
        expect(bgRenderer).toHaveAttribute('data-mode', 'light');
    });

    it('disponibiliza o design através do DesignOverrideContext', () => {
        const mockDesign = { mode: 'dark', id: 'theme-1' };

        render(
            <DesignScope design={mockDesign}>
                <ContextTester />
            </DesignScope>
        );

        const tester = screen.getByTestId('context-tester');
        expect(tester.textContent).toBe(JSON.stringify(mockDesign));
    });

    it('appends extra dom safe props and custom className to the wrapper div', () => {
        const { container } = render(
            <DesignScope design={{ mode: 'dark' }} className="my-custom-class" data-test="custom">
                <div />
            </DesignScope>
        );

        const scopeDiv = container.firstChild as HTMLElement;
        expect(scopeDiv).toHaveClass('sarak-design-scope');
        expect(scopeDiv).toHaveClass('my-custom-class');
        expect(scopeDiv).toHaveClass('dark'); // Since mode is dark
        expect(scopeDiv).toHaveAttribute('data-test', 'custom');
    });
});
