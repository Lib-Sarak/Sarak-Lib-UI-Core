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

1. **A Raiz do Nó (ManifestNode)**
   - Todo JSON começa com um nó. A chave obrigatória é `type` (ex.: `"type": "SarakGrid"`). O array `children` aninha sub-nós.
   - **Conteúdo textual:** `"props": { "children": "texto" }` renderiza o texto (interpolável). `children` estruturais (array de nós) têm prioridade sobre `props.children`.
   - **Slots nomeados:** componentes com regiões ReactNode (ex.: `SarakAnalyticalPage` com `navBar`/`mainContent`/`sidePanel`, `SarakSplitPane` com `leftPane`/`rightPane`) são preenchidos via `"slots": { "nomeDaRegiao": { ...nó... } }` — cada slot vira a prop homônima.
2. **Propriedades Visuais (Props)**
   - Estilo entra em `"props": {}` usando apenas tokens de design válidos (ex.: `"gap": "spacing-md"`). **Jamais** valores hardcoded (`15px`, `#FF0000`).
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
   - **Repetição:** `"renderFor": "{{minhaLista}}"` — clona a subárvore com escopo local `{{item}}`/`{{index}}`.
6. **Data Binding & Pipes**
   - `"label": "Olá, {{user.name | capitalize}}!"` — pipes após `|` (lista oficial no catálogo). Fallback: `{{valor || 'padrão'}}`.
   - **Formulários:** `model: { "path": "form.campo" }` faz two-way binding; `validation: [...]` valida (erros aparecem após touch/submit); `form` agrupa o escopo.
   - **Fonte de dados:** `source: { "endpoint": "/api/x" }` hidrata o estado antes de renderizar (passa pelo `networkInterceptor` do host).
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
8. **Resiliência e persistência**
   - `onError: [...]` — cadeia disparada quando uma ação falha; `fallbackErrorUI` na raiz — tela de recuperação global (Spec 27).
   - `persistState: { "key": "..." }` — sincroniza a fatia com o localStorage (Spec 28).
   - `responsive: { "md": {...}, "lg": {...} }` — sobreposição de props por breakpoint (Spec 16).
   - `theme` / `aria` — escopo de tema (DesignScope) e atributos de acessibilidade como dado.

## Regras de Ouro e Segurança
- **Proibição do TSX:** telas não misturam componentes React no código do consumidor. Tudo é JSON.
- **Isolamento de Escopo (No-Eval):** expressões `{{ }}` rodam em ambiente restrito. **Nunca** tente acessar `window`, `document` ou funções globais no JSON.
- **Catálogo primeiro:** antes de entregar a tela, confira cada `type` e prop contra `docs/manifest-catalog.md`; depois valide com a skill `ui-auditoria-manifesto`.

## Referências
- `docs/manifest-catalog.md` / `docs/manifest-catalog.json` — catálogo GERADO (types, props, ações, pipes, diretivas).
- Spec 11 (`11-engine-declarativa-e-manifestos.md`) — gramática estrita do manifesto.
- Spec 12 (`12-modelo-de-seguranca-e-acessibilidade.md`) — Safe Eval, sanitização, aria.
