---
name: ui-integra-escrever-manifesto
description: Ensina a compor telas, componentes e lógicas construindo arquivos JSON válidos para o SarakManifestRenderer. Use ao criar ou editar páginas de interface num consumidor que já importou @sarak/lib-ui-core, ou logo após rodar a skill ui-integra-consumidor (Handoff). NÃO acione proativamente.
---

# Skill: Escrever Manifesto Declarativo (UI)

Skill responsável por transformar regras de negócio e rabiscos de interface em arquivos JSON estritamente tipados que a Engine da Sarak processará para desenhar telas reativas.

## Quando usar
- Sempre que o usuário pedir para "criar uma tela nova", "montar um modal", "construir um formulário" ou "desenhar uma tabela" num projeto consumidor que já tem a `Sarak-Lib-UI-Core` instalada.
- Quando precisar adicionar lógicas visuais (If, For) ou interações de botões (Eventos) num layout já existente.
- Use APENAS sob demanda. NÃO acione proativamente.

## Fonte da verdade DINÂMICA (consulte antes de escrever qualquer `type`)
O catálogo oficial de `type`s, props, ações, pipes e diretivas é **GERADO do código-fonte** e vive na biblioteca:
- `docs/manifest-catalog.md` (leitura humana/IA) e `docs/manifest-catalog.json` (máquina) — no repositório da lib e dentro do pacote instalado (`node_modules/@sarak/lib-ui-core/docs/`).
- **NUNCA invente um `type` ou um nome de prop de memória** — foi assim que nasceram os bugs de prop errada (`body` vs `params`, `text` vs `content`). Todo `type` fora do catálogo cai no Fallback visível; toda prop fora do catálogo é ignorada.
- O catálogo está sempre em dia por construção: `npm run catalog:check` roda no build da lib e o gate `RegistryParity.test.tsx` garante que todo componente é alcançável via `type` ou excluído com motivo.

## Workflow (Composição do JSON)

0. **Parta do template oficial** — a lib distribui `templates/app-starter.manifest.json` (também exportado como `SARAK_STARTER_MANIFEST`): shell + `SarakShellNav` + rota inicial + rota `/design` com o `CustomizationPanel`. Edite/acrescente rotas a partir dele. **A rota `/design` (Design Engine) é contrato de instalação — não a remova.** Anotações são permitidas em qualquer nó via chave `$comment` (ignorada pelo motor).
1. **A Raiz do Nó (ManifestNode)**
   - Todo JSON começa com um nó. A chave obrigatória é `type` (ex.: `"type": "SarakGrid"`). O array `children` aninha sub-nós.
   - **Conteúdo textual:** `"props": { "children": "texto" }` renderiza o texto (interpolável). `children` estruturais (array de nós) têm prioridade sobre `props.children`.
   - **Slots nomeados:** componentes com regiões ReactNode (ex.: `SarakAnalyticalPage` com `navBar`/`mainContent`/`sidePanel`, `SarakSplitPane` com `leftPane`/`rightPane`) são preenchidos via `"slots": { "nomeDaRegiao": { ...nó... } }` — cada slot vira a prop homônima.
2. **Propriedades Visuais (Props)**
   - Estilo entra em `"props": {}` usando apenas tokens de design válidos (ex.: `"gap": "spacing-md"`). **Jamais** valores hardcoded (`15px`, `#FF0000`).
   - **Regra dura de tokens:** use SOMENTE valores listados na seção **"Tokens e valores permitidos"** de `docs/manifest-catalog.md` (espaçamento `spacing-*`, variantes por componente, CSS vars públicas `--sarak-*`). Token/variant/var inventado (ex.: `--sarak-color-border`, `spacing-xs` fora do mapa, `variant: "h4"` que não existe) **não quebra a tela, mas também não aplica** — o resolutor emite `console.warn` e cai no fallback do Design Engine. Antes de escrever qualquer valor de `props`, confira-o contra o catálogo; nunca "invente por analogia" (foi assim que nasceram `--sarak-color-border`/`spacing-xxl`/`variant: h4`, todos inexistentes, num teste real de instalação).
3. **App completo: `shell` + `routes` (Spec 33)**
   - Um app multi-página declara na raiz: `"shell": { "topbar": {...}, "sidebar": {...}, "content": "<slot-rotas>" }` e `"routes": { "/rota": { ...nó... } }`. O host injeta a rota ativa via prop `route` do Renderer; o shell NÃO remonta na troca de rota.
   - **Navegação pronta:** use `SarakShellNav` na sidebar — menu com grupos, marca e estado ativo, 100% dados:
     ```json
     {
       "type": "SarakShellNav",
       "props": {
         "brand": { "name": "Meu Sistema" },
         "activeRoute": "{{$route}}",
         "items": [
           { "label": "Contratos", "icon": "FileText", "route": "/contratos" },
           { "label": "Design", "icon": "Palette", "route": "/design", "category": "Sistema" }
         ]
       },
       "actions": [{ "type": "navigate", "payload": { "to": "{{$event}}" } }]
     }
     ```
   - **Rota lazy:** `"routes": { "/pesada": { "lazy": "id-da-pagina" } }` — o host precisa injetar `manifestLoader={(id) => Promise<nó>}` no Renderer (ver ui-integra-consumidor). Sem loader, degrada para Fallback visível.
   - **Painel de personalização (Design Engine):** é um `type` como outro qualquer — `{ "type": "CustomizationPanel" }` numa rota (ex.: `/design`) entrega o painel completo.
4. **Bindings reservados**
   - `{{$route}}` — rota ativa injetada pelo host (para estado ativo de navegação, breadcrumbs, `renderIf` por rota).
   - `{{$event}}` — valor emitido pelo componente no evento que disparou as `actions` (ex.: a rota clicada no `SarakShellNav`, o valor digitado num input). Disponível SÓ dentro de `actions`.
5. **Motores de Lógica (Control Flow)**
   - **Condicionais:** `"renderIf": "{{user.isLogged}}"` (Safe Evaluator — sem acesso a `window`/globais). `disabledIf` desabilita sem remover.
   - **Repetição:** `"renderFor": { "source": "{{minhaLista}}" }` — clona a subárvore com escopo local `{{item}}`/`{{index}}` (é um OBJETO com `source`, não uma string crua).
6. **Data Binding & Pipes**
   - `"label": "Olá, {{user.name | capitalize}}!"` — pipes após `|` (lista oficial no catálogo). Fallback: `{{valor || 'padrão'}}`.
   - **Formulários:** `model: { "path": "form.campo" }` faz two-way binding; `validation: [...]` valida (erros aparecem após touch/submit); `form` agrupa o escopo.
   - **Fonte de dados — lista auto-carregada é o padrão OBRIGATÓRIO (nunca "botão Carregar"):** `source: { "endpoint": "/api/x", "into": "chave" }` hidrata o estado ANTES de renderizar (passa pelo `networkInterceptor` do host) e expõe o ciclo `loading`/`empty`/`error` via `states` — sempre declare os 3, nunca deixe o usuário acionar a carga manualmente. Exemplo completo (lista de dados — o padrão para toda tela que lista algo vindo de API):
     ```json
     {
       "type": "SarakFlex",
       "props": { "direction": "column", "gap": "spacing-md" },
       "source": {
         "endpoint": "/api/contratos",
         "method": "GET",
         "into": "contratos",
         "states": {
           "loading": { "type": "SarakSkeleton", "props": { "shape": "text", "rows": 4 } },
           "empty": { "type": "SarakDataEmpty", "props": { "message": "Nenhum contrato encontrado." } },
           "error": {
             "type": "SarakTypography",
             "props": { "variant": "body", "color": "secondary", "content": "Não foi possível carregar os contratos." }
           }
         }
       },
       "children": [
         {
           "type": "SarakFlex",
           "renderFor": { "source": "{{contratos}}" },
           "props": { "direction": "column", "gap": "spacing-sm" },
           "children": [
             { "type": "SarakTypography", "props": { "variant": "body", "content": "{{item.nome}}" } }
           ]
         }
       ]
     }
     ```
     `into: "contratos"` deposita o resultado no DataStore; o `renderFor` consome exatamente essa chave. Os 3 nós de `states` são o que a Engine mostra durante cada fase — sem eles, a Engine usa um Skeleton/Fallback mínimo genérico (aceitável só em protótipo, nunca em tela final).
7. **Eventos e Ações (Dispatcher)**
   - Interações são declaradas em `"actions": []` — **array plano**, nunca objeto com chaves de evento. A Engine decide o gatilho (`onClick` em botões, `onChange` em campos com `model`/componentes emissores).
   - Catálogo oficial de ações (gerado): `api_call`, `mutate_state`, `navigate`, `trigger_toast`, `open_modal`, `open_drawer`, `close_modal`, `close_drawer`, `close_overlay`.
   - **Feedback é zero-config:** `trigger_toast`/`open_modal`/`open_drawer` funcionam sem nenhum Provider extra — o `SarakUIProvider` monta os hosts sozinho.
   - `api_call` só lê `endpoint`/`method`/`params` de dentro de `payload`. **O corpo é `params`, não `body`** (`body` não existe e é ignorado). Com `"submit": true`, o payload vem dos `model` do form e a validação BARRA o envio se houver erro.
   - Exemplo (salvar e avisar):
     ```json
     "actions": [
       { "type": "api_call", "payload": { "endpoint": "/api/save", "method": "POST", "params": "{{form}}" } },
       { "type": "trigger_toast", "payload": { "message": "Salvo com sucesso!", "variant": "success" } }
     ]
     ```
   - **Erros comuns a evitar** (schemas que já causaram falha real — sem erro visível):
     ```json
     // ❌ ERRADO: "actions" como objeto, endpoint/method soltos
     "actions": { "onClick": [{ "type": "api_call", "endpoint": "/api/save", "method": "POST" }] }
     ```
     ```json
     // ❌ ERRADO: "body" em vez de "params" — o Dispatcher nunca lê "body", a API recebe {} vazio
     "actions": [{ "type": "api_call", "payload": { "endpoint": "/api/save", "method": "POST", "body": "{{formState}}" } }]
     ```
     ```json
     // ❌ ERRADO: botão "Carregar" + renderIf manual em vez de `source` com states — o padrão
     // OBRIGATÓRIO para listas é carga automática (item 6), nunca um clique para popular a tela.
     {
       "type": "SarakButton",
       "props": { "children": "Carregar contratos" },
       "actions": [{ "type": "api_call", "payload": { "endpoint": "/api/contratos", "into": "contratos" } }]
     }
     ```
8. **Resiliência e persistência**
   - `onError: [...]` — cadeia disparada quando uma ação falha; `fallbackErrorUI` na raiz — tela de recuperação global (Spec 27).
   - `persistState: { "key": "..." }` — sincroniza a fatia com o localStorage (Spec 28).
   - `responsive: { "md": {...}, "lg": {...} }` — sobreposição de props por breakpoint (Spec 16).
   - `theme` / `aria` — escopo de tema (DesignScope) e atributos de acessibilidade como dado.
9. **Autenticação é porta (Spec 20)** — a lib nunca autentica; só renderiza. `SarakAuthScreen` (`type` nativo) é autocontido — nenhum callback obrigatório, campos vivem em estado interno. `actions` + a Engine ligam `onChange` automaticamente (mesmo mecanismo do `SarakShellNav`): toda interação (submit/social/forgot/masterLogin/toggleRegister) emite `{{$event}} = { intent, username?, password?, mfaCode?, isRegistering?, provider? }`.
   ```json
   {
     "type": "SarakAuthScreen",
     "renderIf": "!{{session.isLogged}}",
     "props": { "error": "{{session.error}}" },
     "actions": [
       { "type": "api_call", "payload": { "endpoint": "/auth/login", "method": "POST", "params": "{{$event}}", "into": "session" } }
     ],
     "onError": [{ "type": "mutate_state", "payload": { "path": "session.error", "value": "Credenciais inválidas" } }]
   }
   ```
   - A resposta do login cai em `session` via `into` (o HOST decide o shape — token, flags, o que for); `renderIf: "{{session.isLogged}}"` gateia a rota protegida. Logout: `mutate_state` (zera a sessão) + `navigate` (pede o redirect) — dois `actions` num botão comum.
   - Sessão autenticada em chamadas seguintes e 401→redirect são resolvidos DENTRO do `networkInterceptor` do host (é só uma função) — a Sarak não sabe o que é um token nem um 401. Receita completa com exemplo de shell+rotas: Spec 08 §6.2-b.

## Regras de Ouro e Segurança
- **Proibição do TSX (front fora do manifesto é DEFEITO):** telas não misturam componentes React no código do consumidor. Tudo é JSON. Os ÚNICOS arquivos de front permitidos no consumidor são o plumbing do contrato (Spec 30): entry point com `SarakUIProvider`+`SarakManifestRenderer`, DataStore e os 2 interceptors — nada além disso. Criar componente/tela/CSS React no consumidor para "completar" a UI é violação do contrato de instalação.
- **Faltou componente? O caminho é a LIB, nunca o consumidor:** se a tela pede um `type` que não existe no catálogo, NÃO escreva React local — a demanda vai para a Sarak-Lib-UI-Core via skill `ui-novo-componente` (o gate de paridade garante que ele nasce manifestável). Para componente de negócio específico do consumidor (exceção rara e justificada), use `registerComponent(type, Componente)` da lib e siga renderizando pelo motor.
- **Isolamento de Escopo (No-Eval):** expressões `{{ }}` rodam em ambiente restrito. **Nunca** tente acessar `window`, `document` ou funções globais no JSON.
- **Catálogo primeiro:** antes de entregar a tela, confira cada `type` e prop contra `docs/manifest-catalog.md`; depois valide com a skill `ui-auditoria-manifesto`.
- **Só tokens do catálogo (regra dura, item 2):** todo valor de espaçamento/variant/CSS var vem da seção "Tokens e valores permitidos" — nunca por analogia ("parece que existe `spacing-xxl`"). Um valor fora da lista não quebra a build; degrada em silêncio (warn + fallback), o que é pior — a tela "funciona" com o token errado sem avisar visualmente.
- **Lista de dados sempre com `source`+`states` (regra dura, item 6):** nenhuma tela de listagem nasce com botão "Carregar"/"Buscar" manual — carga automática com os 3 estados é o único padrão aceito para telas finais.

## Referências
- `docs/manifest-catalog.md` / `docs/manifest-catalog.json` — catálogo GERADO (types, props, ações, pipes, diretivas).
- Spec 11 (`11-engine-declarativa-e-manifestos.md`) — gramática estrita do manifesto.
- Spec 12 (`12-modelo-de-seguranca-e-acessibilidade.md`) — Safe Eval, sanitização, aria.
- Spec 08 §6.2-b (`08-consumo-externo-e-integracao.md`) — receita canônica de autenticação (login/sessão/401/logout).
