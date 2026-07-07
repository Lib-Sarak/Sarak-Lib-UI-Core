import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { SarakUIProvider } from '../../../core/Provider/SarakUIProvider';
import { DesignScope } from '../../../core/Design/components/DesignScope';

import type { SarakDesignState } from '../../../core/Provider/types';
import type { SarakThemePayload } from '../../../core/Provider/types';

const mockTheme: Partial<SarakDesignState> = {
    mode: 'light',
    navigationStyle: 'sidebar',
    borderRadius: 16,
    primaryColor: '#ff0000' // O master-map usa a propriedade plana primaryColor
};

test.use({ viewport: { width: 800, height: 600 } });

test('Jornada 2: Injeção de CSS em Tempo Real no DOM (Chromium)', async ({ mount, page }) => {
    const component = await mount(
        <SarakUIProvider config={{ brand: { name: 'Test' } } as unknown as SarakThemePayload}>
            <DesignScope design={mockTheme as SarakDesignState}>
                <div data-testid="target-box" style={{ 
                    backgroundColor: 'var(--theme-primary)', 
                    borderRadius: 'var(--radius-theme)',
                    width: '20px', height: '20px'
                }}>Box</div>
            </DesignScope>
        </SarakUIProvider>
    );

    const box = component.getByTestId('target-box');
    await expect(box).toBeVisible();

    // Verifica se a injeção do CSS reflete as variáveis nativas processadas
    const color = await box.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const radius = await box.evaluate((el) => window.getComputedStyle(el).borderRadius);

    // No CSS Nativo do browser, a var(--theme-primary) deve ter se expandido para a cor definida (rgb 255 0 0)
    expect(color).toBe('rgb(255, 0, 0)');
    // O border radius deve ser 16px cravado
    expect(parseInt(radius || '0', 10)).toBe(16);
});
