---
tipo: "spec"
titulo: "Engine Declarativa e Motor de Manifestos"
dominio: "Sarak-Lib-UI-Core (Lógica / Híbrida)"
status: "🟢 Consolidado"
prioridade: "Máxima"
tags: ["spec", "engine", "manifest", "low-code", "datastore", "events"]
relacionados: ["00-manifesto-arquitetural-ui-core", "07-plano-diretor-engine-declarativa"]
---

# 1. Visão Geral
Este documento define a arquitetura central funcional da Sarak-Lib-UI-Core. A transição para um **Agnostic UI Engine** exige que a biblioteca não apenas estilize componentes, mas interprete um arquivo JSON (Manifesto) e o transforme numa aplicação viva. 
O **Sarak Manifest Renderer** atua como o cérebro que avalia a gramática dos nós, gerencia estados reativos, processa laços de repetição (loops) e trafega eventos entre a interface visual estática e a lógica de negócios externa.

# 2. Regras de Negócio (Camadas da Engine)

## 2.1 A Gramática (Manifest Node & Registry)
- **ManifestNode:** Toda folha da UI é um nó na árvore. O nó suporta propriedades estáticas (`props`), eventos interativos (`actions`), e diretivas de controle (`renderIf`, `renderFor`, `responsive`). A tipagem deve ser estrita (Zero Any).
- **Component Registry Resolver:** Uma tabela de mapeamento que converte as strings do JSON (ex: `"type": "SarakCard"`) no componente React executável. Se o componente não for encontrado na camada `atomic/`, o motor engatilha um "Fallback Not Found Component" local, impedindo a quebra da página.

## 2.2 O Estado Global (Sarak DataStore)
O motor depende de uma árvore de estado local reativa (conceito análogo a Redux/Zustand), injetada e consumida em tempo real.
- **Store Declarativa:** O JSON pode declarar fontes de dados (endpoints HTTP estáticos) que hidratam a store antes da renderização.
- **Persistência (Local Storage):** Atributos anotados com `persistState` mantêm sincronia bidirecional transparente com a API do Storage do navegador.
- **Binding Bidirecional:** Para inputs em formulários, a Engine assegura que `model: "user.name"` aplique atualizações na Store sem precisar de *onChange* hardcoded no Front-End.

## 2.3 Motores Lógicos (Data-Binding, Evaluator e Loops)
- **Motor de Interpolação e Pipes:** Analisa strings do JSON (ex: `{{user.balance | currency}}`) e realiza substituição *in loco* consultando a DataStore. Formatações como `date`, `currency` ou `lowercase` são processadas nativamente pela gramática.
- **Motor de Repetição (RenderFor):** Ao encontrar `renderFor: "{{users}}"`, a Engine isola a subárvore e cria N clones. O escopo local (`{{item}}` ou `{{index}}`) é gerado internamente e não contamina o estado global.
- **Avaliador Condicional (Safe Eval):** Responsável por diretivas como `renderIf` ou `disabledIf`. Toda expressão injetada (ex: `"{{role}} === 'ADMIN'"`) roda num ambiente isolado, bloqueando acesso imperativo (como invocar `window` ou `alert`).

## 2.4 Barramento e Eventos (Dispatcher)
- **Central Dispatcher:** A chave `actions` de um nó é um **array plano** de `Action` (`ActionList`) — não um objeto mapeando nomes de evento (`onClick`/`onSubmit`) para arrays. A própria Engine decide qual evento do DOM dispara a cadeia (`onClick` em botões, `onChange` em campos com `model`), com base na natureza do nó, não numa chave declarada no JSON. A Engine possui handlers nativos para `api_call` (via fetch dinâmico — os campos `endpoint`/`method`/`body`/`params` vivem dentro de `payload`, ex.: `{"type": "api_call", "payload": {"endpoint": "/x", "method": "POST"}}`), `navigate` (alteração de rota via adaptador importado), `mutate_state` e `trigger_toast`.
- **Tratamento de Erros e Error Boundaries:** Se uma requisição de `api_call` falhar, ou uma subárvore quebrar, a Engine entra em *Fallback* visual isolado, ou dispara a diretiva `onError` presente no JSON.

# 3. Contratos e Composição Shell
- **Contrato do Importador:** Sistemas externos (Next.js, Vite) alimentam a Engine enviando o objeto JSON, callbacks (para interceptar navegação) e tokens de Auth. O *Renderer* expõe Props estritas documentando estas necessidades.
- **Composição de Shell:** A Engine entende a hierarquia de `Shell > Layout > View`, permitindo que um Menu lateral não seja remontado ao transitar de página dentro da própria aplicação guiada pelo JSON.

# 4. Plano de Testes (Gate Funcional)
## Unitários
- [x] Testar os parsers: o motor de *Data Binding* extrai e resolve *Pipes* sem ferir a regex padrão.
- [x] O *Safe Evaluator* processa strings puras sem expor funções injetadas ao escopo global (prevenção de XSS).
- [x] O *Repeater Engine* cria clones sem sobrepor chaves `key` no React.

## Contrato/API
- [x] Todas as interfaces lógicas do manifesto (`ManifestNode`, `Action`, `PipeType`) aderem estritamente à política de Zero Any do sistema.
- [x] Auditoria "Conferência Funcional": Garantia estática (script de varredura) que valida se a árvore JSON inserida pelo usuário não possui chaves órfãs ou ciclos infinitos na configuração (Spec 34).

## E2E
- [x] Testar o ciclo completo do `Dispatcher`: Clicar em botão aciona evento estático -> Dispara mutate state -> Atualiza variável de template -> Re-renderiza o componente limpo e rápido.
