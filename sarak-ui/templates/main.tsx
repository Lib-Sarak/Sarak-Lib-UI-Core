/**
 * TEMPLATE — wiring do app (`src/main.tsx`).
 *
 * Serve às 4 topologias do GUIA-FRONTEND.md §2. A diferença entre elas está em DUAS
 * linhas, marcadas com [TOPOLOGIA] abaixo:
 *   - de onde vêm `TEMAS`/`NAV` (deste app, ou do pacote compartilhado `ui-kit`);
 *   - se `persistence.storageKey` é compartilhada (para a troca de tema cruzar apps
 *     de mesma origem — topologias 2/3).
 *
 * Copie para `src/main.tsx`, ajuste os imports e apague o que não usar.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import {
    SarakUIProvider,
    SarakAppChrome,
    CustomizationPanel,
    type SarakNavItem,
} from '@sarak/lib-ui-core';

// [TOPOLOGIA] Monolito: importe de './themes' e './nav' (arquivos deste app).
// Monorepo / modular / microsserviço: importe do pacote compartilhado.
import { TEMAS } from './ui-kit/themes';
import { NAV } from './ui-kit/nav';

/**
 * Roteamento é SEU (este é o mínimo, sem dependência). Troque pelo seu roteador —
 * nada aqui é imposto pela biblioteca.
 */
function useRotaAtual(): [string, (rota: string) => void] {
    const [rota, setRota] = React.useState(() => window.location.pathname);
    React.useEffect(() => {
        const aoVoltar = () => setRota(window.location.pathname);
        window.addEventListener('popstate', aoVoltar);
        return () => window.removeEventListener('popstate', aoVoltar);
    }, []);
    const navegar = React.useCallback((destino: string) => {
        window.history.pushState({}, '', destino);
        setRota(destino);
    }, []);
    return [rota, navegar];
}

function Conteudo({ rota }: { rota: string }) {
    // A central de tema/layout: monte-a numa rota sua. É o Design Engine — quem a
    // abre ajusta os tokens ao vivo e exporta o tema em JSON.
    if (rota.startsWith('/design')) return <CustomizationPanel />;
    return <div>Sua tela aqui — veja `tela-exemplo.tsx`.</div>;
}

function App() {
    const [rota, navegar] = useRotaAtual();
    const itens: SarakNavItem[] = NAV.map((item) => ({ ...item, active: rota.startsWith(item.href) }));

    return (
        <SarakUIProvider
            customThemes={TEMAS}
            // `initialTheme` = SEMENTE: o usuário troca depois e não é forçado de volta.
            // Troque por `activeThemeId` só se o APP é quem decide o tema (por cliente/config).
            initialTheme={TEMAS[0].id}
            options={{
                persistence: {
                    // [TOPOLOGIA] Mesma chave em TODOS os apps de mesma origem faz a escolha
                    // do usuário atravessar (topologias 2 e 3). Num monolito, tanto faz.
                    storageKey: 'meu-sistema:design',
                    crossTabSync: true,
                },
                // A identidade da página é SUA. Só preencha se quiser que a lib gerencie
                // o nome da aba/logo; sem isto, o `<title>` do seu index.html é preservado.
                // branding: { initial: { tabName: 'Meu Sistema' } },
            }}
        >
            {/* Um cromo POR APP — apresentacional, sem host. Todos renderizam o mesmo NAV. */}
            <SarakAppChrome brand={{ name: 'Meu Sistema' }} navItems={itens} onNavigate={navegar}>
                <Conteudo rota={rota} />
            </SarakAppChrome>
        </SarakUIProvider>
    );
}

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
