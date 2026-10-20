import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as ComponentModule from '../AuthHero';
import { AuthHero } from '../AuthHero';
import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';

describe('AuthHero', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
        // TODO: Injetar testes de montagem profunda caso o componente cresça em complexidade
    });

    it('usa a variável arbitrária de borda no quadro da marca', () => {
        const { container } = render(
            <SarakUIProvider>
                <AuthHero branding={{ name: 'Sarak' }} />
            </SarakUIProvider>
        );
        const brandFrame = container.querySelector('.w-24.h-24') as HTMLElement;

        expect(brandFrame.className).toContain('border-[var(--border-color,rgba(255,255,255,0.09))]');
        expect(brandFrame.className).not.toContain(')]-border');
    });
});
