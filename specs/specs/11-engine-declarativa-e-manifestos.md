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
- **ManifestNode:** Toda folha da UI é um nó na árvore. O nó suporta propriedades estáticas (`props`), eventos interativos (`actions`), diretivas de controle (`renderIf`, `renderFor`, `responsive`) e regiões nomeadas (`slots` — cada slot é renderizado e entregue ao componente como a prop ReactNode homônima). Conteúdo textual pode vir em `props.children` (interpolável); `children` estruturais têm prioridade. A tipagem deve ser estrita (Zero Any).
- **Component Registry Resolver:** Uma tabela de mapeamento que converte as strings do JSON (ex: `"type": "SarakCard"`) no componente React executável. Se o componente não for encontrado na camada `atomic/`, o motor engatilha um "Fallback Not Found Component" local, impedindo a quebra da página.
- **Gate de Paridade do Registry (causa-raiz do plug-and-play):** todo componente exportado publicamente ou vivo em `atomic/` DEVE estar no `NATIVE_COMPONENTS` ou declarado com motivo em `manifestExclusions.ts`; ids legados do Discovery precisam de `type` equivalente. O teste exaustivo `RegistryParity.test.tsx` (R1/R2/R3) derruba o build em caso de silêncio — componente novo não pode nascer inalcançável.
- **Catálogo GERADO:** `npm run catalog` deriva `docs/manifest-catalog.{json,md}` do código (types→props reais, ações, pipes, diretivas); `catalog:check` roda no build. É a fonte da verdade dos consumidores (skills `ui-integra-escrever-manifesto`/`ui-auditoria-manifesto`) — nunca documentação manual. Desde a Spec 22, o catálogo também documenta a seção "Tokens e valores permitidos" (espaçamento/variantes/CSS vars) e a `ui-auditoria-manifesto` valida VALORES contra ela, não só chaves.

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
- **Central Dispatcher:** A chave `actions` de um nó é um **array plano** de `Action` (`ActionList`) — não um objeto mapeando nomes de evento (`onClick`/`onSubmit`) para arrays. A própria Engine decide qual evento do DOM dispara a cadeia (`onClick` em botões, `onChange` em campos com `model` e em componentes emissores de valor), com base na natureza do nó, não numa chave declarada no JSON. Handlers nativos (catálogo gerado): `api_call` (os campos lidos de dentro de `payload` são `endpoint`, `method` e `params` — o corpo da requisição é `params`, **não** `body`; `body` não existe no contrato e é silenciosamente ignorado. Ex.: `{"type": "api_call", "payload": {"endpoint": "/x", "method": "POST", "params": "{{form}}"}}`), `navigate` (via adaptador importado), `mutate_state`, `trigger_toast`, `open_modal`, `open_drawer` e `close_modal`/`close_drawer`/`close_overlay`.
- **Binding `{{$event}}`:** o valor emitido pelo componente no evento que disparou a cadeia fica disponível às ações como `{{$event}}` (ex.: a rota clicada num `SarakShellNav`, o valor digitado num campo). Cliques de botão não produzem `$event`.
- **Feedback zero-config:** os hosts de `trigger_toast` e `open_modal`/`open_drawer` (SarakToastProvider/SarakOverlayProvider) são montados automaticamente pelo `SarakUIProvider` — as ações de feedback funcionam na instalação canônica sem nenhum Provider extra do consumidor.
- **Tratamento de Erros e Error Boundaries:** Se uma requisição de `api_call` falhar, ou uma subárvore quebrar, a Engine entra em *Fallback* visual isolado, ou dispara a diretiva `onError` presente no JSON.

# 3. Contratos e Composição Shell
- **Contrato do Importador:** Sistemas externos (Next.js, Vite) alimentam a Engine enviando o objeto JSON (`payload`), o estado (`dataStore`), os interceptors (`networkInterceptor`/`routerInterceptor`), a rota ativa (`route`) e, quando houver rotas lazy, o carregador (`manifestLoader: (id) => Promise<nó>`). O *Renderer* expõe Props estritas documentando estas necessidades.
- **Composição de Shell:** A Engine entende a hierarquia de `Shell > Layout > View` (`shell` + `routes` na raiz), permitindo que um Menu lateral não seja remontado ao transitar de página dentro da própria aplicação guiada pelo JSON.
- **Rota como dado (`{{$route}}`):** a rota ativa injetada pelo host é chave RESERVADA do escopo global de binding — navegação com estado ativo, breadcrumbs e `renderIf` por rota são 100% declaráveis. O átomo `SarakShellNav` (menu com grupos/marca/estado ativo) fecha a paridade com o shell legado da Spec 04 usando o par `activeRoute: "{{$route}}"` + ação `navigate` com `{{$event}}`.
- **Rotas lazy:** `routes: { "/x": { "lazy": "id" } }` resolve via `manifestLoader` com cache por id; sem loader ou em falha, degrada para Fallback VISÍVEL (nunca silencioso).
- **Design Engine como dado:** o painel de personalização (Spec 01) é o `type` nativo `CustomizationPanel` (Camada 3 via `React.lazy` no Registry) — nenhum código React do consumidor é necessário para entregá-lo.

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
