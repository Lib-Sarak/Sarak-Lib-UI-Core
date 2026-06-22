---
tipo: "spec"
titulo: "Error Boundaries e Fallbacks as Data"
dominio: "Sarak-Lib-UI-Core (Lógica e Dados)"
status: "🟢 Implementado"
prioridade: "Média"
tags: ["spec", "logic", "error-handling", "fallback"]
relacionados: []
---

# 1. Visão Geral
Em aplicações onde a UI é montada dinamicamente via JSON, um pequeno erro (ex: uma API que retorna `undefined` onde se esperava um Array) pode derrubar a árvore do React inteira gerando uma Tela Branca da Morte. Esta Spec define o isolamento de quebras via Boundaries e a renderização de telas de recuperação (Fallbacks).

# 2. Regras de Negócio
- **Regra 1: Isolamento de Falhas (Error Boundaries):** O componente raiz `<SarakManifestRenderer />` e componentes perigosos (como `SarakDataGrid` e `SarakRepeater`) devem ser abraçados individualmente por um componente de Error Boundary do React.
- **Regra 2: Fallback Dinâmico:** Quando um Boundary pegar um erro, ele não exibirá um texto duro de sistema. Ele buscará no próprio JSON a chave global `fallbackErrorUI` (que também é um objeto de componentes Sarak) e a renderizará.
- **Regra 3: Tratamento de Eventos (Event Errors):** Falhas decorrentes de uma ação de botão (`api_call`) não derrubam a renderização, mas disparam os eventos listados em `onError: []` configurado localmente no nó do botão.
- **Regra 4: Log Silencioso:** Qualquer erro de motor capturado deve fazer log limpo no console informando a chave JSON exata (`nodeId` ou `path`) que causou a pane, acelerando o debug para o importador.

# 3. Critérios de Aceite
- [ ] Forçar um erro fatal dentro de um cartão (`SarakCard`) renderiza apenas a tela de Fallback no lugar daquele cartão específico, não quebrando a barra lateral e a navbar.
- [ ] Um `api_call` com erro de CORS não quebra a interface, engatilha a array de ações em `onError` corretamente.

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** forçar um erro de sintaxe interno simulado e garantir que a classe de `ErrorBoundary` chame a sub-rotina de Fallback Visual com os dados originais do JSON.

## Testes de Contrato (API)
- [ ] N/A.

## Testes E2E (Integração)
- [ ] Provocar pane desconectando do backend no meio da renderização JSON, verificando a preservação do esqueleto mestre (Header e Layout) na página web.
