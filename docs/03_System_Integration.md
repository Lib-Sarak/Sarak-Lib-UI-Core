# 🔌 Sarak System Integration & Bootstrap Guide (v11.0)

Este documento detalha o processo de bootstrap técnico para inicializar a casca de interface (**`SarakShell`**), configurar o provedor de barramento de design (**`SarakUIProvider`**) e injetar componentes customizados no registro de descoberta do `@sarak/lib-ui-core`.

---

## 1. Inicializando o `SarakUIProvider`

O `SarakUIProvider` é o cérebro do estado visual do Sarak. Ele é encarregado de:
- Inicializar e hidratar o estado de tokens vigentes do sistema.
- Gerenciar o sandbox de personalização visual (*Drafting* vs. *System*).
- Carregar dinamicamente as fontes web otimizadas no cabeçalho do documento.
- Resolver e registrar os módulos do manifesto declarativo na memória soberana global.

### Integração Canônica
No ponto de entrada principal do seu frontend (ex: `src/main.tsx` ou `src/index.tsx`), envolva o aplicativo com o provedor:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { SarakUIProvider } from '@sarak/lib-ui-core';
import { AppBootstrap } from './AppBootstrap';

// Configurações e manifesto obtidos no guia de Manifestos
import mergedManifest from './manifests/merged';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SarakUIProvider options={{ manifest: mergedManifest }}>
      <AppBootstrap />
    </SarakUIProvider>
  </React.StrictMode>
);
```

---

## 2. Instanciando o `SarakShell` (Casca de Interface)

O `SarakShell` renderiza a moldura operacional da aplicação com base no layout configurado no tema ativo (suporta layouts `sidebar`, `topbar` e `dock`). Ele renderiza menus laterais, abas ativas, barras de cabeçalho, caixas globais de pesquisa avançada e animações de transição de telas automaticamente.

```tsx
import React from 'react';
import { SarakShell } from '@sarak/lib-ui-core';

export const AppBootstrap: React.FC = () => {
    // Simulação de sessão de usuário obtida da sua camada de autenticação
    const mockUser = {
        name: "Igor Sarak",
        email: "igor@sarak.io",
        avatar: "/assets/avatars/igor.png",
        role: "Administrator"
    };

    const handleLogout = () => {
        console.log("Encerrando sessão industrial...");
        localStorage.clear();
        window.location.reload();
    };

    return (
        <SarakShell 
            user={mockUser}
            logout={handleLogout}
            token={localStorage.getItem('token') || undefined}
            fallback={<div className="sarak-loader">Sincronizando Barramento Industrial...</div>}
        />
    );
};
```

---

## 3. O Canal de Resiliência: Registrando Componentes Customizados (`registerLocalComponent`)

Se você precisar que o seu sistema renderize uma tela complexa ou um formulário interativo sob medida que **não** possa ser puramente resolvido de forma declarativa pelo `DynamicRenderer`, o ecossistema Sarak permite o registro de componentes físicos locais ligados a um ID do manifesto.

### Como fazer:
1.  **Crie o Componente TSX Local no Host:**
    ```tsx
    // src/components/custom/MyCustomDashboard.tsx
    import React from 'react';

    export const MyCustomDashboard: React.FC = () => {
        return (
            <div className="p-6 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl">
                <h2 className="text-lg font-bold">Métrica Física Customizada</h2>
                <p className="text-sm text-[var(--theme-muted)]">Este componente possui lógica física embarcada localmente no host.</p>
            </div>
        );
    };
    ```

2.  **Registre o Componente no Bootstrap (Antes do Shell Montar):**
    Use o utilitário `registerLocalComponent` exportado pela biblioteca:
    ```tsx
    import { registerLocalComponent } from '@sarak/lib-ui-core';
    import { MyCustomDashboard } from './components/custom/MyCustomDashboard';

    // Registra o componente físico associando-o ao ID declarado no manifesto
    registerLocalComponent('mod-custom-dashboard', MyCustomDashboard);
    ```

3.  **Declare no Manifesto JSON:**
    No manifesto da aba correspondente, omita `visualContracts` e declare o `id` correspondente:
    ```json
    {
      "id": "mod-custom-dashboard",
      "label": "Painel de Bordo",
      "icon": "LayoutDashboard",
      "category": "Painéis",
      "priority": 10
    }
    ```

O componente [ShellContent.tsx](file:///c:/Users/Igor/Desktop/Sarak/X%20-%20Trabalho/Code/Biblioteca/Sarak-Lib-UI-Core/src/core/Shell/Components/ShellContent.tsx) interceptará o `id`, consultará o mapa de instâncias de componentes locais e renderizará o seu dashboard físico sob medida com prioridade sobre o motor de renderização dinâmico.

---

> [!TIP]
> Caso queira que o componente customizado se integre perfeitamente à estética de vidros e cortes geométricos do Design Engine, envolva o retorno HTML do seu componente com a classe `.sarak-card` ou utilize as propriedades expostas no guia de **[Design Engine e Tokens](./04_Design_Tokens.md)**.
