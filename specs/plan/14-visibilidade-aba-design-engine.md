---
tipo: "spec"
titulo: "Controle de Visibilidade da Aba Design Engine"
dominio: "Arquitetura / Integração / Provider"
status: "🔴 Planejamento Inicial"
prioridade: "Alta"
tags: ["spec", "integration", "provider", "visibility", "design-engine"]
relacionados: ["08-consumo-externo-e-integracao"]
---

# 1. Visão Geral e Descrição do Problema

A biblioteca Sarak UI Core não apenas fornece os átomos visuais, mas também exporta nativamente a sua ferramenta de autoria (O Painel/Aba do Design Engine). 

Atualmente, quando o sistema consumidor (ex: Site Earendel ou outro painel) importa e encapsula a aplicação com os provedores e layouts da Sarak, a aba do Design Engine é criada e fica visível por padrão. O problema arquitetural reside no fato de que **o sistema importador não possui um mecanismo nativo para ocultar essa aba**. 

Em um ambiente de produção real, apenas usuários administradores (ou desenvolvedores) devem ter acesso à aba do Design Engine. Para o usuário final padrão, ela deve ser completamente invisível.

# 2. Desafio Arquitetural

Precisamos garantir que a Aba do Design Engine esteja **sempre presente e disponível** no bundle quando o módulo for baixado (permitindo que o sistema ative-a quando necessário), mas com o controle de visibilidade estritamente nas mãos da aplicação consumidora (Inversão de Controle).

Isso impede vazamentos de UI administrativa para usuários comuns e dá flexibilidade aos projetos que utilizam a biblioteca apenas para consumir o layout, sem expor o motor de temas.

# 3. Solução Proposta (Configuração via Provider/Props)

Para resolver isso respeitando o padrão "Zero Hardcode" e mantendo a responsabilidade no lugar certo, a solução deve ocorrer na fronteira de inicialização da biblioteca.

## 3.1. Injeção de Propriedade de Configuração
O componente raiz de layout ou o `SarakUIProvider` deve ser refatorado para aceitar uma nova propriedade booleana de configuração, por exemplo: `showDesignEngineTab` (ou `enableDesignEngine`).

```tsx
// Exemplo de como o sistema importador consumiria a biblioteca:
<SarakUIProvider 
   themePayload={currentTheme} 
   showDesignEngineTab={user.role === 'admin'} // Controle dinâmico externo
>
   <App />
</SarakUIProvider>
```

## 3.2. Renderização Condicional Interna
Dentro do repositório da Sarak UI Core, o componente responsável por renderizar a Sidebar/Navegação (ex: `AppShell` ou `Sidebar`) fará a checagem dessa propriedade oriunda do Contexto Global.
- Se `true`: Renderiza o botão/aba do Design Engine normalmente.
- Se `false`: Oculta o botão de acesso à aba da interface.

*Nota de Segurança:* Ocultar a aba no Frontend é apenas uma camada de UX (User Experience). O backend do consumidor sempre deverá validar permissões antes de salvar qualquer Payload enviado pela Engine.

# 4. Critérios de Aceite para Futura Implementação
- [ ] O `SarakUIProvider` (ou o Layout Base exportado) recebe uma propriedade tipada para controle de visibilidade da aba do Design Engine.
- [ ] Quando a propriedade for `false` (ou não for passada, dependendo do fallback padrão decidido), a aba de Design desaparece completamente da UI.
- [ ] O sistema consumidor consegue alternar essa visibilidade dinamicamente (ex: ativando via uma flag no painel de controle deles).
- [ ] O bundle final continua contendo a aba para garantir que ela apareça instantaneamente se o estado mudar para `true`.

# 5. Mecanismo Real de Integração (não é um "Sidebar" genérico — use isto)

A aba do Design Engine não é um item de nav hardcoded — ela é um **módulo descoberto dinamicamente**. `src/index.ts` já faz `registerLocalComponent('mx-customization', CustomizationPanel)` e `registerLocalComponent('personalization', CustomizationPanel)`. A lista de módulos visíveis (inclusive a navegação que os exibe) vem de `useModuleDiscovery` (`src/shared/hooks/useModuleDiscovery.ts`), que **já tem um mecanismo de filtro** — `DEMO_BLACKLIST`, baseado em `design?.moduleBlacklist !== 'none'` (linhas 26-30). A solução mais simples e consistente com o padrão já existente é **estender esse mesmo filtro**, não criar um segundo mecanismo de visibilidade em paralelo.

## 5.1. Decisão de Default (resolvida — pode executar)
`showDesignEngineTab` deve ter **default `true`** (não `false`). Motivo: o `Sarak-MyService` (consumidor real já em produção nesta base) hoje não passa essa prop e espera ver a aba — um default `false` quebraria silenciosamente esse comportamento existente para qualquer consumidor que ainda não tenha migrado. Quem precisa esconder (a ameaça real descrita na Seção 1: usuário final não deve ver a aba) passa `false` explicitamente para os papéis não-admin.

## 5.2. Código de Referência

```ts
// src/core/Provider/types.ts — adicionar em SarakUIOptions (mesmo nível de designAgent, persistence, etc.)
export interface SarakUIOptions {
    // ... campos existentes ...
    showDesignEngineTab?: boolean; // default true — ver Seção 5.1 desta spec
}
```

```ts
// src/shared/hooks/useModuleDiscovery.ts — estender o filtro já existente, não criar um novo
export const useModuleDiscovery = (isEnabled: boolean = true) => {
    const { registeredModules, isHydrated, design, options } = useSarakUI(); // + options

    const formattedModules = useMemo(() => {
        if (!isHydrated) return [];

        const all = getRegisteredModules();
        const displayModules = (all.length > 0 ? all : registeredModules) as Partial<DiscoveredModule>[];

        const isStandardMode = design?.moduleBlacklist !== 'none';
        const DEMO_BLACKLIST = isStandardMode ? ['grid-system', 'blueprint-test', 'demo-ui', 'debug-module'] : [];

        // NOVO: esconde o Design Engine quando explicitamente desativado — default true (Seção 5.1)
        const showDesignEngine = options?.showDesignEngineTab !== false;
        const DESIGN_ENGINE_IDS = ['mx-customization', 'personalization'];

        return displayModules
            .filter((mod) => mod.id && !DEMO_BLACKLIST.includes(mod.id))
            .filter((mod) => showDesignEngine || !DESIGN_ENGINE_IDS.includes(mod.id!)) // NOVO
            .sort((a, b) => (b.priority || 0) - (a.priority || 0))
            // ... resto inalterado ...
    }, [registeredModules, isHydrated, design?.moduleBlacklist, options?.showDesignEngineTab]); // + dependência nova

    // ... resto inalterado ...
};
```

Isso automaticamente esconde a aba de qualquer navegação que já consome `useModuleDiscovery` (é a fonte única da lista de módulos) — não precisa alterar `SarakShell`/`useSarakShell.ts` separadamente, eles já consomem o resultado filtrado.

# 6. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** `useModuleDiscovery` incluir `mx-customization`/`personalization` na lista quando `options.showDesignEngineTab` é `true` ou `undefined` (default).
- [ ] **Deve** `useModuleDiscovery` excluir `mx-customization`/`personalization` quando `options.showDesignEngineTab` é `false`, mantendo todos os outros módulos.

## Testes de Contrato (API)
- *N/A* — mudança de tipo em `SarakUIOptions`, sem I/O de rede.

## Testes E2E (Integração)
- [ ] Fluxo feliz: `SarakUIProvider` sem `showDesignEngineTab` → aba aparece normalmente (comportamento atual preservado).
- [ ] Fluxo de ocultação: `SarakUIProvider options={{ showDesignEngineTab: false }}` → aba não aparece em nenhuma navegação, e a rota `/mx-customization` (se acessada diretamente por URL) não deveria renderizar o painel — validar esse caso extra, não só a ausência do item de nav.
