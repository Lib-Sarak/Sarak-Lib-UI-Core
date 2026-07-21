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
   - **Card de ação genérico:** `SarakActionCard` é 100% dirigido por dado — `mapping.title`/`subtitle`/`description`/`icon` + `mapping.details` (aponta para um campo do item com array `[{label, value}]`, JÁ FORMATADO pelo consumidor — a Sarak não faz aritmética/formatação de domínio) para o painel expansível; `actionLabel` troca o texto do botão (default `"Executar"`). **Pendente (Spec 42):** `SarakCardGrid`/`SarakCoreCard` (variante `"classic"`, a default do grid) ainda têm campos de domínio herdados (`price_in`/`price_out`/`context`) no tipo público — generalização planejada, ainda não executada; prefira `SarakActionCard` (via `variant: "action"` no `SarakCardGrid`, ou standalone) quando o card precisar ser 100% genérico hoje.
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
   - **Fluxo obrigatório de 3 passos para toda personalização (Spec 40 — achado real de teste de instalação):** (1) muda um valor num campo do painel (fica em rascunho/sandbox, não aplicado ainda); (2) clica em **"Commit [N]. <Categoria> (contagem)"** — o botão de commit DA PRÓPRIA CATEGORIA expandida — para gravar aquele grupo de tokens; (3) só então clica em **"Aplicar Alterações Globais"**. Mudar o valor e ir direto para "Aplicar Alterações Globais", pulando o passo 2, não reflete a mudança na tela real — o rótulo de estado continua "SALVAR" (sujo). O "Commit por categoria" não está em nenhum lugar óbvio da UI além do próprio botão dentro da categoria expandida; procure por ele antes de reportar que a personalização "não fez nada".
   - **Temas padrão da biblioteca são READ-ONLY — personalizar exige "Salvar como Novo Tema" (esperado, não é bug):** os temas embutidos (origem `script`) não podem ser sobrescritos. Depois do passo 3 acima (Commit + Aplicar), se o tema ativo for um tema padrão, abre um modal "Salvar Novo Tema" (também dispara para qualquer tema com alterações não salvas, `isDirty`) em vez de aplicar nada visualmente ainda. Só depois de nomear e confirmar o novo tema (banco de dados) é que ele passa a existir e pode ser ativado/aplicado. Avise o usuário destes passos ANTES de personalizar um tema padrão — descobrir o fluxo completo por exploração cega foi um achado real de duas rodadas de teste de instalação.
4. **Bindings reservados**
   - `{{$route}}` — rota ativa injetada pelo host (para estado ativo de navegação, breadcrumbs, `renderIf` por rota).
   - `{{$event}}` — valor emitido pelo componente no evento que disparou as `actions` (ex.: a rota clicada no `SarakShellNav`, o valor digitado num input). Disponível SÓ dentro de `actions`.
5. **Motores de Lógica (Control Flow)**
   - **Condicionais:** `"renderIf": "{{user.isLogged}}"` (Safe Evaluator — sem acesso a `window`/globais). `disabledIf` desabilita sem remover.
   - **Repetição:** `"renderFor": { "source": "{{minhaLista}}" }` — clona a subárvore com escopo local `{{item}}`/`{{index}}` (é um OBJETO com `source`, não uma string crua).
6. **Data Binding & Pipes**
   - `"label": "Olá, {{user.name | capitalize}}!"` — pipes após `|` (lista oficial no catálogo). Fallback: `{{valor || 'padrão'}}`.
   - **Formulários:** `model: { "path": "form.campo" }` faz two-way binding; `validation: [...]` valida (erros aparecem após touch/submit); `form` agrupa o escopo.
   - **O exemplo que BARRA o submit (padrão canônico, Spec 28)** — três peças têm que estar juntas para o gate de validação funcionar: um nó com `form: { "id": "..." }` envolvendo os campos, cada campo com `model.path` **e** `validation`, e o botão de submit com `"submit": true` **no topo da ação** `api_call` (o motor também aceita `payload.submit` como alias — leniente por causa de um erro real de autoria — mas o topo é o lugar canônico e o que os exemplos usam):
     ```json
     {
       "type": "SarakFlex",
       "form": { "id": "cadastro", "resetOn": "submitSuccess" },
       "props": { "direction": "column", "gap": "spacing-md" },
       "children": [
         {
           "type": "SarakInput",
           "model": { "path": "cliente.nome" },
           "validation": [
             { "rule": "required", "message": "Informe o nome." },
             { "rule": "minLength", "value": 3 }
           ],
           "props": { "label": "Nome" }
         },
         {
           "type": "SarakButton",
           "props": { "children": "Salvar" },
           "actions": [
             { "type": "api_call", "submit": true, "payload": { "endpoint": "/api/clientes", "method": "POST" } },
             { "type": "trigger_toast", "payload": { "message": "Salvo!", "variant": "success" } }
           ]
         }
       ]
     }
     ```
     Com `"submit": true`, o payload do `api_call` vem AUTOMATICAMENTE dos `model` do form-escopo — **não passe `params` à mão** aqui. Se algum campo estiver inválido, o motor BARRA o envio (nenhum `api_call` dispara), revela os erros nos campos e nada é enviado — nenhum toast de sucesso falso. Contraste com o exemplo `params: "{{form}}"` do item 7 (Eventos e Ações): aquele NÃO valida (lê o estado cru); use-o só quando o form não tem NENHUM campo com `validation`.
   - **Shape de uma regra de `validation`** (tabela completa e sempre atual: seção "Regras de `validation`" de `docs/manifest-catalog.md`):
     - `{ "rule": "required" }` — dispensa `value`.
     - `{ "rule": "minLength", "value": 3 }` / `{ "rule": "maxLength", "value": 120 }` — `value` numérico.
     - `{ "rule": "pattern", "value": "^[0-9]{5}$" }` — `value` é a fonte de um regex.
     - `{ "rule": "type", "value": "email" }` — `value` é `"email" | "url" | "numero"`.
     - Todas aceitam `"message": "..."` opcional (custom); sem ela, usa o default em pt-BR. `rule` desconhecida ou `value` ausente/inválido para a regra gera `console.warn` com o exemplo correto e a regra é IGNORADA (não derruba a tela — as demais regras do mesmo campo continuam validando).
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
   - `api_call` só lê `endpoint`/`method`/`params` de dentro de `payload`. **O corpo é `params`, não `body`** (`body` não existe e é ignorado). Com `"submit": true` (no topo da ação, ou `payload.submit` como alias), o payload vem dos `model` do form e a validação BARRA o envio se houver erro — ver o exemplo canônico completo no item 6 (Formulários).
   - Exemplo (salvar e avisar) — **SEM validação de formulário** (não usa `submit`/form-escopo; `params: "{{form}}"` lê o estado cru tal como está, mesmo com campos vazios):
     ```json
     "actions": [
       { "type": "api_call", "payload": { "endpoint": "/api/save", "method": "POST", "params": "{{form}}" } },
       { "type": "trigger_toast", "payload": { "message": "Salvo com sucesso!", "variant": "success" } }
     ]
     ```
     **Use isto SÓ quando o form não tem nenhum campo com `validation`.** Para qualquer formulário com `validation`, use o exemplo canônico do item 6 (`"submit": true` + sem `params` manual) — é o único jeito que barra o envio inválido. Se um `api_call` disparar dentro de um form-escopo com erro SEM `submit` reconhecido, o motor agora BLOQUEIA a chamada e avisa no console (deixou de ser silencioso).
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
     ```json
     // ❌ ERRADO: form COM `validation` usando `params: "{{form}}"` sem "submit" reconhecido — o
     // motor BLOQUEIA a chamada e avisa no console (deixou de ser silencioso), mas o certo aqui
     // é o exemplo canônico do item 6: "submit": true no topo da ação, sem `params` manual.
     "actions": [{ "type": "api_call", "payload": { "endpoint": "/api/save", "method": "POST", "params": "{{form}}" } }]
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
- **Formulário com `validation`, sempre `submit: true` (regra dura, item 6, Spec 28):** nunca use `params` manual (`"{{form}}"` ou individual) num formulário que tem algum campo com `validation` — o motor BLOQUEIA e avisa no console se um `api_call` disparar dentro de um form-escopo com erro sem `submit` reconhecido. `"submit": true` no topo da ação (aceito também em `payload.submit`) é o único caminho que valida antes de enviar e monta o payload automaticamente dos `model`.

## Referências
- `docs/manifest-catalog.md` / `docs/manifest-catalog.json` — catálogo GERADO (types, props, ações, pipes, diretivas).
- Spec 11 (`11-engine-declarativa-e-manifestos.md`) — gramática estrita do manifesto.
- Spec 12 (`12-modelo-de-seguranca-e-acessibilidade.md`) — Safe Eval, sanitização, aria.
- Spec 08 §6.2-b (`08-consumo-externo-e-integracao.md`) — receita canônica de autenticação (login/sessão/401/logout).
