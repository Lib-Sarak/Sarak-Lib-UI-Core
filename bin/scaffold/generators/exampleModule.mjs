/**
 * `src/modules/ExampleModule.tsx` — starter padrão (Spec 45): um módulo de
 * negócio de EXEMPLO, componente React comum registrado via
 * `registerSarakModule`/`registerLocalComponent` em `main.tsx`. Tematizado
 * automaticamente pela central (Design Engine) porque usa componentes Sarak —
 * é o contrato de tokens públicos (Spec 43 §3.3) em ação. Apague e crie os seus.
 */
export function buildExampleModuleTsx() {
    return `import React from 'react';
import { SarakTypography, SarakButton } from '@sarak/lib-ui-core';

/**
 * Módulo de exemplo. Um componente React comum — nada de manifesto/JSON aqui.
 * Ele responde à central de tema (Design Engine) porque usa componentes Sarak
 * (\`SarakTypography\`/\`SarakButton\`); um componente 100% seu responderia do
 * mesmo jeito usando os tokens públicos (\`var(--sarak-*)\`) diretamente.
 */
export const ExampleModule: React.FC = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sarak-layout-gap-md, 1rem)' }}>
            <SarakTypography variant="h1">Bem-vindo à Sarak UI</SarakTypography>
            <SarakTypography variant="body">
                Este é um módulo de exemplo, registrado via \`registerSarakModule\` em
                \`src/main.tsx\`. Edite este arquivo (ou crie outros em
                \`src/modules/\`) para montar suas próprias telas — registre cada uma
                do mesmo jeito.
            </SarakTypography>
            <SarakButton onClick={() => window.alert('Módulo de exemplo funcionando!')}>
                Testar ação
            </SarakButton>
        </div>
    );
};
`;
}
