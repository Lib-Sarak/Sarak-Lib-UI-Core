import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import SarakUIProvider from '../../../../../core/Provider/SarakUIProvider';
import { useSarakUI } from '../../../../../core/Provider/hooks/useSarakUI';

const PREFERENCES_KEY = 'sarak-ui-preferences-v1';

/** O design EFETIVO (o que o cromo lê): o tema, o `config` do administrador e a preferência gravada por cima. */
const EffectiveProbe: React.FC = () => {
    const { design } = useSarakUI();
    return <output data-testid="effective">{String(design.navigationStyle)}</output>;
};

const renderEffective = (config: Record<string, unknown>) => render(<SarakUIProvider config={config}><EffectiveProbe /></SarakUIProvider>);

describe('o interruptor da troca lateral/topo, no Provider real', () => {
    beforeEach(() => localStorage.removeItem(PREFERENCES_KEY));

    it('troca oferecida (no menu ⚙): a preferência gravada vence o administrador', async () => {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ navigationStyle: 'sidebar' }));
        renderEffective({ navigationStyle: 'topbar', preferenceNavigationStylePosition: 'menu' });
        await waitFor(() => expect(screen.getByTestId('effective')).toHaveTextContent('sidebar'));
    });

    it('interruptor desligado (`off`): a preferência já gravada não muda a orientação do administrador', async () => {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ navigationStyle: 'sidebar' }));
        renderEffective({ navigationStyle: 'topbar', preferenceNavigationStylePosition: 'off' });
        await waitFor(() => expect(screen.getByTestId('effective')).toHaveTextContent('topbar'));
        // a preferência continua no navegador (o administrador pode religar a troca): só deixa de valer.
        expect(localStorage.getItem(PREFERENCES_KEY)).toContain('"navigationStyle":"sidebar"');
    });
});
