import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SarakUIProvider } from '@sarak/lib-ui-core';

const root = document.getElementById('root');
if (!root) throw new Error('tenant-provider-replacement-entry: #root ausente no harness.');

const TenantReplacement = () => {
    const [tenantId, setTenantId] = useState('tenant-a');
    const isTenantB = tenantId === 'tenant-b';
    const config = isTenantB
        ? {
            mode: 'dark' as const,
            systemName: 'Tenant B',
            primaryColor: '#7c3aed',
            shadowOrientation: 'dynamic',
            globalBackgroundImageUrl: 'https://example.test/tenant-b.png',
            globalBackgroundOpacity: 0.4,
        }
        : {
            mode: 'dark' as const,
            systemName: 'Tenant A',
            primaryColor: '#dc2626',
            shadowOrientation: 'top',
            globalBackgroundOpacity: 0,
        };

    return (
        <>
            <button type="button" onClick={() => setTenantId(isTenantB ? 'tenant-a' : 'tenant-b')}>
                Trocar tenant
            </button>
            <SarakUIProvider
                key={tenantId}
                config={config}
                options={{ fonts: 'none', persistence: { storageKey: 'tenant-replacement', tenantId } }}
            >
                <span>{tenantId}</span>
            </SarakUIProvider>
        </>
    );
};

createRoot(root).render(<TenantReplacement />);
