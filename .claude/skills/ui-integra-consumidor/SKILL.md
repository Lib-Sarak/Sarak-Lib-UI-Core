---
name: ui-integra-consumidor
description: Instala e acopla o motor SarakManifestRenderer (@sarak/lib-ui-core) num sistema consumidor (Next.js/React/FastAPI), do zero — npm install, peerDependencies, SarakUIProvider, DataStore e Interceptors. Use quando o usuário pedir para baixar/instalar/importar a biblioteca Sarak UI (ex.: "baixe a biblioteca Sarak-UI <link>, ela será responsável por toda a renderização do sistema"), iniciar a infraestrutura do front-end com a Lib, ou plugar o motor de renderização declarativa num projeto novo. NÃO acione proativamente.
---

# Skill: Integrar Consumidor (Infraestrutura)

Skill responsável pela instalação plug-and-play do Motor Declarativo (Sarak-Lib-UI-Core) no projeto cliente, garantindo a inicialização do `SarakManifestRenderer`, `SarakDataStore` e `Interceptors`.

## Quando usar
- Quando o usuário informar que está num repositório que consumirá a `Sarak-Lib-UI-Core` e precisa acoplar o sistema (Engine) na raiz do projeto.
- Quando for necessário plugar roteamento do framework hospedeiro ou cabeçalhos de autenticação na Engine.
- Use APENAS quando o usuário solicitar explicitamente a instalação/integração inicial. NÃO acione proativamente.

## Workflow

1. **Entrevista de Instalação (HITL) — faça TODAS estas perguntas ANTES de tocar em qualquer arquivo**
   - **Stack do consumidor:** qual o framework/host (Next.js/React, Vite, Remix, etc.) e o backend, se houver (Node, Python/FastAPI, PHP)? Isso decide como o Design Agent é acoplado na Etapa 6.
   - **Design Agent (chat de IA) — incluir ou não?** Pergunte explicitamente: *"Quer habilitar o chat do Design Agent (a IA que gera e ajusta o tema por linguagem natural)?"*
     - Deixe claro que é **100% opcional e desacoplado**: `agent-design-operator` **não** é dependência de `@sarak/lib-ui-core` (importar a UI nunca o baixa), e `options.designAgent` é opcional. Sem ele, a UI funciona por inteiro — só o `DesignAgentChatCard` aparece como "Não configurado", sem tentar nenhum fetch.
     - **Se NÃO:** pule a Etapa 6 inteira — nenhuma infra de IA, nenhuma env var de LLM, nenhum microsserviço.
     - **Se SIM:** faça as perguntas de follow-up abaixo.
   - **(Só se for incluir o agente) Perguntas de follow-up:**
     - **Modo de deploy do agente:** acoplado ao backend Node do próprio consumidor (via `initDesignAgent()`) ou microsserviço Node isolado (porta 4000)? Backend Python/PHP força o microsserviço.
     - **Provider/model de LLM:** o agente exige `DESIGN_AGENT_LLM_PROVIDER` e `DESIGN_AGENT_LLM_MODEL` no ambiente do agente — o módulo não escolhe sozinho. Confirme que o usuário tem essas credenciais.
     - **Persistência do agente:** precisa de `DATABASE_URL` (histórico de conversa/temas). Confirme o banco.
   - **Banco de dados da UI (sempre, com ou sem agente):** o Design Engine persiste temas via `setupUIDatabase(connectionString)`. Suporta **Postgres** (`postgresql://...`) e **SQLite** (caminho de arquivo, ex.: `./database.sqlite`, ou `:memory:`) — o dialeto é detectado automaticamente pela própria connection string, sem parâmetro extra. Confirme com o usuário qual banco o projeto já usa e passe a connection string correspondente (ver `references/examples.md`). Se o projeto não tiver banco algum, é aceitável pular esta etapa — o Design Engine funciona sem persistência (fica em memória/local-storage).
2. **Instalação de Dependências**
   - **Ação:** Rode `npm install @sarak/lib-ui-core` (github install: `npm install github:Lib-Sarak/Sarak-Lib-UI-Core`) — depois instale TODAS as `peerDependencies` na mesma tacada, mesmo as que parecerem opcionais (a lib as usa internamente em componentes resolvíveis via manifesto; faltar uma quebra silenciosamente só quando aquele componente específico é usado):
     ```bash
     npm install framer-motion lucide-react recharts echarts echarts-for-react reactflow react-grid-layout react-markdown react-syntax-highlighter react-dropzone pdfjs-dist clsx tailwind-merge date-fns @tanstack/react-virtual axios pg tailwindcss
     ```
   - **NÃO** presuma que o `npm install` da lib traz essas dependências sozinho — são `peerDependencies` (o npm 7+ até auto-instala em `node_modules`, mas SEM registrar no `package.json` do consumidor; isso é frágil e não reproduzível em `npm ci`/lockfile estrito). Declare-as explicitamente.
   - **CSS:** não é preciso importar nenhum arquivo `.css` manualmente — a lib injeta seu stylesheet automaticamente ao ser importada (ver Etapa 5). Só monte o `<SarakUIProvider>`.
3. **Criação da Pasta Sarak-Engine (Isolamento)**
   - **Ferramenta:** `run_command`
   - **Ação:** Crie o diretório dedicado `Sarak-Engine/` na raiz do consumidor, que isolará os proxies, a store local e instâncias da biblioteca.
4. **Instanciação da DataStore e Interceptors**
   - **Ação:** Crie o arquivo de inicialização exportando uma instância isolada de `SarakDataStore`.
   - **Ação:** Configure o `networkInterceptor` (para injetar tokens JWT e cookies em chamadas de API geradas pela Sarak) e o `routerInterceptor` (para conectar o router do framework cliente, ex: `useRouter` do Next.js).
5. **Injeção do Manifest Renderer (a partir do TEMPLATE oficial)**
   - **Ação:** Copie o manifesto-starter distribuído pela lib — `node_modules/@sarak/lib-ui-core/templates/app-starter.manifest.json` — para o projeto do consumidor (ex.: `src/manifests/app.manifest.json`). Ele já traz shell + `SarakShellNav` + rota inicial + **a rota `/design` com o `CustomizationPanel` (Design Engine)**. Alternativa por import: `import { SARAK_STARTER_MANIFEST } from '@sarak/lib-ui-core'`.
   - **Regra do Design Engine:** a rota `/design` e o item "Design Engine" do menu fazem parte do contrato de instalação — todo consumidor nasce com a personalização visual carregada. NÃO os remova ao editar o manifesto; apenas acrescente as rotas do sistema.
   - **Ação:** Substitua o conteúdo estático da página/layout raiz ou crie um Ponto de Entrada base injetando o componente mestre: `<SarakManifestRenderer payload={jsonDaPagina} dataStore={store} networkInterceptor={apiHandler} routerInterceptor={routeHandler} route={rotaAtiva} />`, envolto por `<SarakUIProvider>`.
   - **`route` (app multi-página):** informe a rota ativa (do router do host) — o manifesto reage via `shell`/`routes` e o binding reservado `{{$route}}` (estado ativo da navegação). O host é dono da URL; a Sarak apenas reage.
   - **`manifestLoader` (opcional):** se o manifesto declarar rotas lazy (`"routes": { "/x": { "lazy": "id" } }`), injete `manifestLoader={(id) => Promise<nóJSON>}` (fetch do seu backend, import de arquivo, etc.). Sem loader, a rota lazy degrada para um Fallback visível.
   - **Feedback é zero-config:** `trigger_toast`/`open_modal`/`open_drawer` do manifesto já funcionam — o `SarakUIProvider` monta os hosts de toast/overlay sozinho. NÃO monte `SarakToastProvider`/`SarakOverlayProvider` manualmente.
   - **Design Engine via manifesto:** o painel de personalização é um `type` nativo — inclua uma rota com `{ "type": "CustomizationPanel" }` (e um item no `SarakShellNav`) para entregar a personalização visual completa ao usuário final. A persistência de temas usa o banco configurado na Etapa 1 (`setupUIDatabase`).
   - **CSS é automático:** importar `SarakUIProvider` já injeta o stylesheet completo em runtime (um `<style id="sarak-ui-core-styles">` no `<head>`) — nenhum import manual de CSS é necessário para o caso comum (SPA/Vite/CRA).
   - **Exceção (SSR/Next.js, opcional):** se quiser o CSS já presente no HTML gerado pelo servidor (evita um flash de conteúdo sem estilo no primeiro paint), importe manualmente `import '@sarak/lib-ui-core/dist/sarak.css';` no `layout.tsx`/`_app.tsx`. Isso é uma otimização, não um requisito — sem ele a UI funciona e se estiliza assim que o JS roda no cliente.
   - **Se, mesmo assim, a tela renderizar sem estilo:** o `SarakUIProvider` loga `console.error('[Sarak] CSS não detectado...')` em desenvolvimento quando a injeção automática falha (ex.: bundler removendo o side-effect via tree-shaking agressivo) — confira o console antes de investigar mais fundo.
6. **Integração do Design Agent (SÓ se o usuário optou por incluir na Etapa 1)**
   - Se o usuário respondeu "não" na Etapa 1, **NÃO execute esta etapa** — pule direto para a Etapa 7.
   - A Sarak nunca chama rede diretamente (Spec 08 §6.2) — o chat (`DesignAgentChatCard`) só funciona se o consumidor injetar `options.designAgent.sendPrompt` no `SarakUIProvider`. Sem isso, o card mostra "Não configurado" e não tenta nenhum fetch.
   - **Ação:** Implemente `sendPrompt: (input: DesignAgentPromptInput) => Promise<DesignAgentPromptResult>` (tipos exportados por `@sarak/lib-ui-core`) chamando o backend `agent-design-operator` a partir do SEU servidor (nunca do browser direto, para não expor credenciais):
     - **Node.js (Next.js/Express/Fastify):** `initDesignAgent()` (de `agent-design-operator`) retorna um Router Express já pronto (inicializa banco + carrega o catálogo). Acople-o na sua API e chame essa rota interna no `sendPrompt`.
     - **Python (FastAPI/Django) ou PHP:** rode o agente como microsserviço Node isolado (porta 4000); o `sendPrompt` (no seu backend, não no browser) faz a chamada HTTP para ele.
   - **⚠️ O `sendPrompt` é um ADAPTADOR — os formatos do agente e do Provider NÃO são iguais, é obrigatório traduzir os dois lados:**
     - **Entrada:** a UI te entrega `{ prompt, draftTokens }` (`DesignAgentPromptInput`). A rota `POST /prompt` do agente espera `{ prompt, session_id, mode?, base_theme? }` — **você** gera o `session_id` (por usuário/sessão). `mode: 'create' | 'patch'` e `base_theme` são opcionais e definidos no seu backend (não vêm no tipo público): use `mode: 'patch'` + `base_theme` (o tema atual completo) quando for alteração de um tema já existente; senão omita (default `create`).
     - **Saída:** a rota devolve `{ success, message, payload? }`. Mapeie para o contrato do Provider: `message` → `message`, **`payload` → `themePatch`** (nomes diferentes!). A `message` já vem pronta em linguagem natural — incluindo o aviso de fatias que não aplicaram — repasse como está. (O contrato público também aceita `componentPresets?`, hoje não emitido pela rota — deixe indefinido.)
   - **Ação:** Injete o resultado no Provider: `<SarakUIProvider options={{ designAgent: { sendPrompt } }}>`.
7. **Instalação das Skills de Consumo no repositório consumidor (OBRIGATÓRIA)**
   - O pacote embarca as próprias instruções: `node_modules/@sarak/lib-ui-core/.agents/skills/`. O agente do consumidor NÃO descobre skills dentro de `node_modules` — por isso esta etapa as instala no repositório dele.
   - **Ação:** Copie estas 2 skills para o `.agents/skills/` do consumidor (e espelhe em `.claude/skills/` se a estrutura existir):
     - `ui-integra-escrever-manifesto` — como compor telas 100% JSON (impede o erro clássico de escrever front fora do manifesto).
     - `ui-auditoria-manifesto` — validação estática do JSON contra o catálogo.
   - Exemplo (PowerShell): `Copy-Item node_modules/@sarak/lib-ui-core/.agents/skills/ui-integra-escrever-manifesto .agents/skills/ -Recurse -Force` (idem para a outra).
   - Se o consumidor tiver hook de auto-indexação do `.agents`, rode-o; senão, adicione as 2 entradas ao índice manualmente.
   - **Regra de atualização:** ao atualizar a lib (`npm update`), re-copie as skills — elas evoluem junto com o catálogo.
8. **Handoff (Ponto de Transição)**
   - **Ação:** Após a infraestrutura base estar acoplada e renderizando com sucesso o manifesto do template, informe ao usuário que a integração arquitetural terminou.
   - **Próximo Passo Obrigatório:** Oriente o usuário (ou você mesmo no próximo turno) a invocar a skill **`ui-integra-escrever-manifesto`** (agora instalada no repositório do consumidor) para construir as telas — ela usa o catálogo GERADO `node_modules/@sarak/lib-ui-core/docs/manifest-catalog.md` como fonte da verdade de `type`s e props.

## Regras (SRP - Responsabilidade Única)
- **NÃO** ensine ou tente montar telas, formulários ou laços de repetição (`renderFor`) nesta skill. O foco aqui é estrito: DevOps e Infraestrutura Front-end.
- **SEMPRE** garanta que o componente importado nas rotas seja o Renderizador Mestre, bloqueando a importação direta de componentes atômicos isolados pelo desenvolvedor (garantindo que tudo passe pelo JSON).

## Referências
**Artefatos do pacote (`node_modules/@sarak/lib-ui-core/`):**
- `templates/app-starter.manifest.json` — manifesto inicial oficial (shell + nav + rota `/design` do Design Engine). Também exportado como `SARAK_STARTER_MANIFEST`.
- `docs/manifest-catalog.md` / `.json` — catálogo GERADO de types/props/ações/pipes/diretivas (fonte da verdade; nunca escreva manifesto de memória).
- Exports de backend (`@sarak/lib-ui-core/backend/node`): `setupUIDatabase`, `createSarakUIExpressMiddleware` (Express/Node: 1 linha = `/api/ui/design|branding|themes`), `createDesignApiHandler`/`createBrandingApiHandler`/`createThemesApiHandler` (Next.js App Router).

**Skills (ordem do fluxo):**
- `ui-contexto-repositorio` — ambientação (se estiver trabalhando NA lib).
- **Esta skill** → instala a infraestrutura.
- `ui-integra-escrever-manifesto` — handoff obrigatório: compor as telas JSON.
- `ui-auditoria-manifesto` — validar o JSON contra o catálogo antes de entregar.

**Specs da Biblioteca Core:**
- Spec 08 (`08-consumo-externo-e-integracao.md`) — contrato de consumo: CSS automático, Provider obrigatório, §3.1 alcançabilidade/template, fronteira de confiança (interceptors).
- Spec 11 (`11-engine-declarativa-e-manifestos.md`) — gramática do manifesto/Registry/Dispatcher/shell+routes.
- Spec 01 (`01-painel-customizacao-temas.md`) — Design Engine (Regra 0: alcance via `{"type": "CustomizationPanel"}`).
- `references/examples.md` — exemplos práticos por stack (SPA/Vite, Next.js SSR, Express) incluindo persistência de temas.

**Ambiente (lições de instalação real):** `ts-node-dev` exige `typescript@^5` (v7 crasha); portas 3000/5173 ocupadas por processos node antigos causam teste contra código velho — libere-as antes de subir o dev.
