import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SarakSocialButton } from '../SarakSocialButton';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

describe('SarakSocialButton', () => {
    it('renderiza o elemento de marca entregue pelo consumidor', () => {
        render(
            <SarakUIProvider>
                <SarakSocialButton provider="google" icon={<svg data-testid="brand-mark" />} variant="glass" />
            </SarakUIProvider>,
        );

        expect(screen.getByTestId('brand-mark')).toBeInTheDocument();
        expect(screen.getByTitle('Continuar com google')).toBeInTheDocument();
    });

    it('encaminha ao consumidor o provedor acionado', () => {
        const onClick = vi.fn();
        render(
            <SarakUIProvider>
                <SarakSocialButton provider="github" icon={<svg />} variant="glass" onClick={onClick} />
            </SarakUIProvider>,
        );

        fireEvent.click(screen.getByTitle('Continuar com github'));
        expect(onClick).toHaveBeenCalledWith('github');
    });
});
