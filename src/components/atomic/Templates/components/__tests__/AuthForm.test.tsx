import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';
import { AuthForm } from '../AuthForm';

describe('AuthForm', () => {
    it('aplica a cor de título ao nome da marca e ao cabeçalho do formulário', () => {
        render(
            <SarakUIProvider>
                <AuthForm
                    branding={{ name: 'Sarak' }}
                    isRegistering={false}
                    allowRegistration={false}
                    labels={{ authTitleLogin: 'Entrar' }}
                    setIsRegistering={vi.fn()}
                    mfaStep={false}
                    setMfaStep={vi.fn()}
                    username=""
                    setUsername={vi.fn()}
                    errorVariant="error"
                    onSubmit={vi.fn()}
                    showCredentials={false}
                />
            </SarakUIProvider>,
        );

        expect(screen.getByRole('heading', { level: 2 }).className).toContain('text-theme-title');
        expect(screen.getByRole('heading', { level: 3 }).className).toContain('text-theme-title');
    });
});
