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
