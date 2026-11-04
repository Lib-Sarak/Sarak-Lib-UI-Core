import React from 'react';
import { createRoot } from 'react-dom/client';
import { SarakUIProvider } from '../../src/core/Provider/SarakUIProvider';
import { CustomizationPanel } from '../../src/features/DesignEngine/Library/CustomizationPanel/CustomizationPanelImpl';
import { SarakButton } from '../../src/components/atomic/Buttons/SarakButton';

const searchParams = new URLSearchParams(window.location.search);
const isEmbedded = searchParams.get('modo') === 'embarcado';

declare global {
    interface Window {
        /** Quantas transições o navegador iniciou desde o último zero — `transitionrun` é o que a troca de tema não pode causar. */
        __transitionRuns: number;
        /** As primeiras transições iniciadas, para entender de onde vêm. */
        __transitionLog: string[];
    }
}

window.__transitionRuns = 0;
window.__transitionLog = [];
document.addEventListener('transitionrun', (event) => {
    window.__transitionRuns += 1;
    if (window.__transitionLog.length < 400) {
        const el = event.target as HTMLElement;
        window.__transitionLog.push(`${el.tagName}.${String(el.className).slice(0, 50)}|${event.propertyName}|switching=${document.documentElement.getAttribute('data-sarak-theme-switching')}`);
    }
}, true);

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('troca-de-tema-entry: #root ausente no harness.');

/** `?css=escopado`: a folha do Modo Embarcado no lugar da global, antes de a cena nascer. */
const swapToScopedStylesheet = async (): Promise<void> => {
    if (searchParams.get('css') !== 'escopado') return;
    const link = document.querySelector<HTMLLinkElement>('link[rel="stylesheet"]');
    if (!link) return;
    await new Promise<void>((resolve) => {
        link.addEventListener('load', () => resolve(), { once: true });
        link.addEventListener('error', () => resolve(), { once: true });
        link.href = './sarak-scoped.css';
    });
};

const Scene: React.FC = () => (
    <SarakUIProvider
        initialTheme="sarak-sovereign"
        options={{ fonts: 'none', persistence: { strategy: 'hybrid', storageKey: 'troca-de-tema' }, ...(isEmbedded ? { mode: 'embedded' as const } : {}) }}
    >
        <div data-testid="troca-de-tema-host" style={{ width: '1600px', height: '900px' }}>
            <CustomizationPanel />
        </div>
        <SarakButton data-probe="botao-de-prova">Botão de prova</SarakButton>
    </SarakUIProvider>
);

void swapToScopedStylesheet().then(() => createRoot(rootElement).render(<Scene />));
