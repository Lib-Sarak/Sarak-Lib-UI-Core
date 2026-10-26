import React from 'react';
import { createRoot } from 'react-dom/client';
import { SarakDesignScope } from '../../src/core/Design/components/DesignScope';
import { SarakTypography } from '../../src/components/atomic/Atoms/SarakTypography';
import { sarakSovereignTheme } from '../../src/core/Design/presets/themes/sarak-sovereign';
import { cyberpunkneonTheme } from '../../src/core/Design/presets/themes/cyberpunk-neon';
import { minimalistAiry } from '../../src/core/Design/presets/themes/minimalist-airy';

const themes = [sarakSovereignTheme, cyberpunkneonTheme, minimalistAiry];
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('plan-123-color-hierarchy-entry: #root ausente no harness.');

createRoot(rootElement).render(
    <main>
        {themes.map((theme) => (
            <SarakDesignScope key={theme.id} data-color-theme={theme.id} design={theme.design}>
                <SarakTypography variant="h1" data-color-role="title">Título da página</SarakTypography>
                <SarakTypography variant="body" color="subtitle" as="p" data-color-role="subtitle">Subtítulo</SarakTypography>
                <SarakTypography variant="body" color="emphasis" as="p" data-color-role="emphasis">Destaque</SarakTypography>
                <SarakTypography variant="body" data-color-role="body">Texto corrido</SarakTypography>
            </SarakDesignScope>
        ))}
    </main>,
);
