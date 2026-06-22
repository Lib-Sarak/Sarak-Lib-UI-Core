---
tipo: "spec"
titulo: "Dispatcher Central de Eventos e Ações"
dominio: "Sarak-Lib-UI-Core (Lógica e Dados)"
status: "🟢 Implementado"
prioridade: "Crítica"
tags: ["spec", "logic", "events", "actions"]
relacionados: []
---

# 1. Visão Geral
Este componente funciona como a medula espinhal da interatividade. Ele escuta os eventos gerados pelos botões e inputs (cliques, mudanças) e orquestra execuções de JavaScript reais baseando-se em definições passadas no JSON.

# 2. Regras de Negócio
- **Regra 1: Catálogo de Ações Padronizadas:** O Dispatcher deve suportar nativamente e imperativamente as ações do tipo: `api_call`, `navigate`, `mutate_state`, `trigger_toast`, `open_drawer/modal`.
- **Regra 2: Encadeamento de Ações:** O nó JSON `actions` é um *Array*. As ações devem ser executadas em ordem. Se uma ação for assíncrona (como `api_call`), a próxima ação só executará em caso de sucesso (promessa resolvida).
- **Regra 3: Tratamento de Throttle e Debounce:** Qualquer ação deve aceitar modificadores numéricos no JSON: `debounce: 300` (aguarda parada) ou `throttle: 500` (limita taxa de disparo).
- **Regra 4: Injeção de Contexto na API:** Quando a ação for `api_call`, o JSON deve permitir o uso de Data Binding no body/URL da requisição. (Ex: endpoint: `/users/{{user.id}}`).

# 3. Critérios de Aceite
- [ ] Um clique de botão executa a sequência: 1. `api_call` (Salva os dados) -> 2. `trigger_toast` (Avisa sucesso) -> 3. `navigate` (Redireciona a tela).
- [ ] Se o `api_call` falhar, as ações seguintes (Toast de sucesso e Navegação) são bloqueadas automaticamente.
- [ ] Uma barra de pesquisa configurada com `debounce: 1000ms` dispara apenas uma chamada de evento mesmo se o usuário digitar 10 caracteres rapidamente.

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** construir a URL final interpolando as chaves dinâmicas do payload antes de invocar a rotina de HTTP.
- [ ] **Deve** garantir a aplicação correta da trava de `Throttle` se o botão for alvo de *Double-Click*.

## Testes de Contrato (API)
- [ ] N/A. (A biblioteca não implementa as regras da API, apenas invoca um interceptador do Importador).

## Testes E2E (Integração)
- [ ] Fluxo Feliz: Testar visualmente a sequência assíncrona inteira disparada através do botão.
