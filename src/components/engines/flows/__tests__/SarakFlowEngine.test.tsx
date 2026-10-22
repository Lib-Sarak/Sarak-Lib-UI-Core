import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as ComponentModule from '../SarakFlowEngine';
import SarakFlowEngine from '../SarakFlowEngine';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

vi.mock('reactflow/dist/style.css', () => ({}));
vi.mock('reactflow', async () => {
    const ReactModule = await import('react');
    const FlowPart = ({ children, className }: { children?: React.ReactNode; className?: string }) =>
        ReactModule.createElement('div', { className }, children);
    return {
        default: FlowPart,
        Background: FlowPart,
        Controls: FlowPart,
        MiniMap: FlowPart,
        Panel: FlowPart,
        BackgroundVariant: { Dots: 'dots', Lines: 'lines' },
    };
});

describe('SarakFlowEngine', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
    });

    it('renderiza o motor quando o peer está instalado', () => {
        render(
            <SarakUIProvider config={{}}>
                <SarakFlowEngine nodes={[]} edges={[]} />
            </SarakUIProvider>,
        );

        expect(document.querySelector('.sarak-flow-instance')).not.toBeNull();
        expect(screen.queryByRole('alert')).toBeNull();
    });
});
