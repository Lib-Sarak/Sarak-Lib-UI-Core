# Agnostic Integration & Persistence (v10.2)

A `Sarak-Lib-UI-Core` foi projetada para ser uma biblioteca "Plug & Play" soberana. Isso significa que ela gerencia seu próprio estado interno e persistência, mas permite que a aplicação hospedeira (host) controle as chaves e os destinos dos dados.

## 1. Configuração do Provider (Bootstrapping)
Para integrar a biblioteca, o host deve envolver a aplicação com o `SarakUIProvider`.

```tsx
<SarakUIProvider 
  storageKey="my-app-design-system" // Chave customizada no localStorage
  manifest={myAppManifest}          // Registro de módulos locais
>
  <SarakShell>
    <AppRoutes />
  </SarakShell>
</SarakUIProvider>
```

## 2. Motor de Persistência Agnóstico
A biblioteca utiliza o hook `useDesignManager` para garantir que:
- **Independência de Chave**: O host decide onde os dados são salvos via `storageKey`.
- **Reactive Hydration**: A biblioteca lida automaticamente com a hidratação do `localStorage` no lado do cliente, evitando erros de SSR/Next.js.
- **Auto-Sync**: Mudanças aplicadas ao sistema são persistidas instantaneamente na chave configurada.

## 3. Integração Multi-Library
Ao importar a Sarak UI em diferentes projetos (ex: Forzy e Identity):
1. **Namespace Isolation**: Use chaves de armazenamento diferentes para evitar conflitos de tema entre aplicações.
2. **Global CSS Variables**: A biblioteca injeta variáveis no `:root` ou `body`. Certifique-se de que o host não possua seletores CSS que sobrescrevam estas variáveis com `!important`.
3. **Bridge Variables**: Utilize as bridge variables (ex: `--theme-sidebar-bg-rgb`) para integrar componentes legados do host ao sistema de cores da Sarak.

## 4. Fluxo de Aplicação (Draft vs System)
- **Draft State**: Alterações feitas no Design Engine são temporárias e armazenadas no estado reativo do rascunho.
- **Apply to System**: Somente ao clicar em "Aplicar ao Sistema", os dados do rascunho são transferidos para o gerenciador global e persistidos no `localStorage`.

---
**Sarak Engineering v10.2**
