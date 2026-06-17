import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { SarakUIProvider } from '../../../core/Provider/SarakUIProvider';
import { PreviewCanvas } from '../../../features/DesignEngine/Canvas/PreviewCanvas';

// Configuração Básica do SarakUIProvider para os testes
const mockConfig: any = {
    brand: { name: 'Test Brand', type: 'system' },
    design: {
        mode: 'light',
        navigationStyle: 'sidebar',
        spacingBase: 4,
        borderRadius: 8,
        animationSpeed: 'normal'
    }
};

test.use({ viewport: { width: 1200, height: 800 } });

test('Jornada 1: Boot do Motor Visual', async ({ mount }) => {
    // Monta o SarakUIProvider com o Canvas dentro
    const component = await mount(
        <SarakUIProvider config={mockConfig}>
            <div style={{ padding: '2rem', background: 'var(--theme-base)', height: '100vh' }}>
                <PreviewCanvas {...({} as any)} />
            </div>
        </SarakUIProvider>
    );

    // O Canvas deve aparecer na tela
    await expect(component).toBeVisible();

    // Uma verificação de que o DesignScope injetou CSS real no DOM do navegador Chromium
    // Vamos procurar por um painel mockado ou algum elemento que o PreviewCanvas carrega
    await expect(component.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
});
