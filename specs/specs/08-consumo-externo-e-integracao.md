# 08. Consumo Externo e Integração da Sarak-Lib-UI-Core

Este manifesto estabelece as regras e o contrato de uso da biblioteca **Sarak-Lib-UI-Core** quando incorporada por sistemas externos, como o Site Earendel (Next.js), Agentes Locais ou backends em Python.

## 0. Modos de Consumo (App vs. Embarcado)

A biblioteca atende **dois** modos de consumo. O modo é declarado em `SarakUIOptions.mode` e o default é `'app'` — consumidores existentes não precisam mudar nada.

| | **Modo App** (`mode: 'app'`, default) | **Modo Embarcado** (`mode: 'embedded'`) |
|---|---|---|
| **Cenário** | O sistema NASCE com a lib; 100% da interface vem do manifesto | O sistema JÁ tem frontend próprio; a lib renderiza ilhas por rota/região |
| **Papel do Provider** | Dono da página | Cidadão da página |
| **CSS** | `dist/sarak.css` injetado automaticamente no `<head>` ao importar o módulo (§2) | `dist/sarak-scoped.css`, importado pelo consumidor; preflight e utilities confinados a `.sarak-scope` |
| **Design tokens** | Vars e `data-*` no `document.documentElement` + `body` | Vars e `data-*` no container da ilha (mesmo mecanismo do `DesignScope`) |
| **`document.title` / favicon** | Sincronizados com `systemName`/branding | **Intocados** — são do host |
| **Fontes globais** | Injetadas no `<head>` | Não injetadas (a ilha herda a tipografia do host); opt-in via `embedded.injectGlobalFonts` |
| **`NoiseOverlay` / mídia de fundo global** | Renderizados sobre o viewport | Não renderizados (cobririam o front do host) |
| **Sequestro do `SovereignThemeInjector`** | Ancorado em `body.light`/`body.dark` | Ancorado em `.sarak-scope` (não repinta as classes Tailwind do host) |
| **Toasts / overlays** | Portal em `document.body` | Portal em `document.body` **+ classe de escopo** — continuam estilizados fora da árvore da ilha |

### 0.1 Instalação do Modo Embarcado
```tsx
import '@sarak/lib-ui-core/dist/sarak-scoped.css'; // obrigatório (substitui a injeção automática)

<SarakUIProvider options={{ mode: 'embedded' }}>
    <SarakManifestRenderer payload={ilha} dataStore={store} route={rotaAtiva} />
</SarakUIProvider>
```
O Provider materializa um `<div class="sarak-scope">` ao redor dos filhos: é ele que ancora o CSS e recebe os tokens.

**Anti-flash (recomendado):** marque o documento com `<html data-sarak-ui-mode="embedded">`. A injeção automática de CSS roda na IMPORTAÇÃO do módulo, antes de qualquer Provider montar; com a marcação ela nem acontece. Sem ela o Provider remove o stylesheet global ao montar (avisando no console em dev), mas pode haver um flash do host re-estilizado antes disso.

### 0.2 Limites declarados
- **N Renderers sob 1 Provider embarcado** é o padrão suportado (cada um com seu `dataStore`).
- **N Providers embarcados na mesma página está FORA do suporte** — disputariam a mesma classe de escopo e o mesmo stylesheet.
- A variante escopada é gerada no build (`npm run build:css:scoped` → `scripts/build-scoped-css.mjs`), que reescreve os seletores de `dist/sarak.css` sobre a AST do lightningcss. `@keyframes`, `@font-face` e `@property` permanecem globais de propósito: são registros sem seletor e não alteram nenhum elemento do host.
- **Gates:** `src/core/Provider/__tests__/EmbeddedMode.test.tsx` (não-vazamento no DOM), `scopeCss.test.ts` (confinamento dos seletores) e `src/core/Provider/__e2e__/EmbeddedNoLeak.spec.tsx` (não-vazamento bidirecional em Chromium — exige `npm run build` antes).

## 1. Exportação Estrita (O Contrato Público)
A Sarak UI Core não permite "Deep Imports" por consumidores externos (ex: `import Button from 'sarak-lib-ui-core/src/components/atomic/Button'`). Toda a exportação da biblioteca é mediada através do arquivo `src/index.ts`.
- O que estiver em `src/index.ts` é garantido pela retrocompatibilidade (Contrato).
- O que não estiver em `src/index.ts` é considerado módulo interno e pode mudar a qualquer momento sem aviso prévio.

## 2. Injeção de Estilos (CSS) — Automática
O `SarakUIProvider` injeta o stylesheet compilado da Sarak UI Core sozinho, em runtime, assim que o módulo é importado (um `<style id="sarak-ui-core-styles">` no `<head>`, gerado pelo build via `scripts/inject-css.mjs` — placeholder `SARAK_CSS` de `src/core/Provider/__sarakCss.ts` substituído pelo CSS real de `dist/sarak.css`). **Nenhum import manual de CSS é necessário** para o caso comum (SPA/Vite/CRA).

Sem este mecanismo, os componentes não teriam forma geométrica, pois o Tailwind interno não seria processado no consumidor — por isso ele é parte do contrato público, não uma conveniência opcional.

**Exceção (SSR/Next.js):** a injeção via JS só ocorre depois que o bundle do cliente executa, o que pode gerar um flash de conteúdo sem estilo (FOUC) durante SSR. Para evitar isso, o consumidor PODE, opcionalmente, importar o CSS manualmente no ponto de entrada renderizado no servidor:
```tsx
import '@sarak/lib-ui-core/dist/sarak.css'; // opcional: só para SSR sem FOUC
```
Se a injeção automática falhar por qualquer motivo (ex.: bundler removendo o side-effect via tree-shaking agressivo), o `SarakUIProvider` avisa via `console.error` em desenvolvimento, apontando esse mesmo import manual como correção.

## 3. O SarakUIProvider é Obrigatório
O consumidor nunca deve tentar invocar componentes atômicos complexos que dependam de variáveis dinâmicas (quase todos) sem abraçar a árvore do React com o `SarakUIProvider`.
O Provider é o único canal aprovado para estabelecer o estado de UI. Qualquer tentativa de aplicar design tokens puramente via strings (ignorando o Provider) resultará num sistema quebradiço.

**Zero-config de feedback:** o Provider monta automaticamente os hosts de toast e overlay (`SarakToastProvider`/`SarakOverlayProvider`) — as ações declarativas `trigger_toast`, `open_modal` e `open_drawer` funcionam na instalação canônica sem nenhum passo extra. O consumidor NÃO deve montá-los manualmente.

## 3.1 Contrato de Alcançabilidade (Instalação Completa)
A instalação plug-and-play é um CONTRATO verificado por gates automatizados na própria lib:
- **Gate de paridade do Registry** (`src/core/Manifest/__tests__/RegistryParity.test.tsx`): todo componente público/atômico é resolvível via `"type"` no manifesto ou excluído com motivo declarado (`manifestExclusions.ts`); ids legados do Discovery exigem `type` equivalente. Silêncio = build vermelho.
- **Catálogo gerado** (`docs/manifest-catalog.{json,md}` — `npm run catalog`, conferido no build por `catalog:check`): a lista oficial de types, props, ações, pipes e diretivas disponível ao consumidor. As skills de integração leem DESTE catálogo, nunca de memória.
- Shell, navegação (`SarakShellNav` + bindings reservados `{{$route}}`/`{{$event}}`), rotas (inclusive lazy via `manifestLoader`) e o painel do Design Engine (`CustomizationPanel`) são todos alcançáveis por JSON — zero código React do lado do consumidor.
- **Template de instalação** (`templates/app-starter.manifest.json`, também exportado como `SARAK_STARTER_MANIFEST`): todo consumidor começa deste manifesto, que já entrega shell + navegação + **a rota `/design` com o Design Engine** — a personalização visual carrega desde o primeiro boot, como parte inseparável do módulo. O gate `StarterManifest.test.tsx` garante que o template é válido, 100% resolvível no Registry e nunca perde a aba de Design Engine. Anotações de autor são permitidas em qualquer nó via `$comment` (ignorada pelo motor).
- **Scaffolder oficial (Spec 21):** `npx @sarak/lib-ui-core init` materializa todo este contrato de instalação de uma vez (peerDeps gravadas, template, CSS, skills copiadas) — a skill `ui-integra-consumidor` o orquestra em vez de ditar arquivo por arquivo.

## 4. Integração com Python (FastAPI/Scripts)
Agentes locais ou rotas Node.js externas não renderizam componentes visuais (React), porém podem interagir com as funções exportadas em `backend/node/backend-node.ts` (ex: acessar chaves do catálogo, extrair definições JSON de Design Systems para alimentar APIs LLMs, etc).
Sistemas backend Python devem consultar os dados gerados em `dist/catalog/` ou consumir endpoints Node que utilizam as funções expostas do motor.

## 5. Prevenção de Colisão (Prefixing)
Todos os tokens expostos pela biblioteca utilizam os prefixos reais `--sarak-*`/`--theme-*` nas suas variáveis CSS nativas (ex: `--sarak-color-background-base`), sempre emitidos com fallback. O namespace `--sx-*` é proibido (variável-fantasma — não é emitido por nenhuma fonte da engine).
Esta regra existe para garantir que o consumidor (ex: Tailwind nativo do Site Earendel) não sofra colisão e sobreponha indevidamente as regras fundamentais do motor Sarak.

## 6. Fronteira de Confiança (Spec 40 — Segurança)
O `SarakManifestRenderer` **executa um manifesto JSON autorado por usuário ou IA**. Por isso a Sarak trata o `payload` (manifesto) e o `dataStore` como **não confiáveis por padrão**. A divisão de responsabilidades é explícita — sem suposição implícita:

### 6.1 O que a Sarak garante (do lado da biblioteca)
- **Sanitização centralizada:** todo HTML/Markdown rico passa por um único canal (`sanitizeHtml`, baseado em DOMPurify). É **proibido** `dangerouslySetInnerHTML` com conteúdo externo fora desse canal. *(Única exceção: o `<style>` de `responsiveCSS` do `DesignScope`, que é CSS gerado pela própria engine, não conteúdo externo.)*
- **Avaliação sem `eval`:** `renderIf`/`disabledIf` usam um *Safe Evaluator* (Spec 26) que **falha fechado** — sem acesso a `window`/`document`/globais; expressão fora da gramática retorna `false`.
- **Interpolação escapada:** `{{...}}` (Spec 24) coage a `string`/primitivo; nunca concatena HTML cru executável.
- **Limites anti-DoS:** profundidade máxima de aninhamento (`MAX_NESTING_DEPTH`) e teto de itens em `renderFor` (`MAX_RENDERFOR_ITEMS`) impedem manifestos hostis de travar o navegador.

### 6.2 O que o importador DEVE prover (do lado do consumidor)
- **Autenticação e segredos:** a Sarak **nunca** embute tokens nem chama a rede diretamente. O `networkInterceptor` é o canal de rede do `SarakManifestRenderer` — o importador injeta auth (headers/cookies), faz a chamada e devolve os dados.
- **Roteamento:** o `routerInterceptor`/`NavigateFn` é responsabilidade do importador (ex.: o router do Next.js). A Sarak reage à rota, não controla a URL.
- **Design Agent — removido (Spec 23):** o chat de IA do Design Engine (`options.designAgent`/`DesignAgentChatCard`/`agent-design-operator`) saiu da biblioteca; deixou de ser contrato público.
- **Validação de origem do manifesto:** garantir que o JSON vem de uma fonte legítima e aplicar CSP/CORS no nível do app — a sanitização da Sarak é defesa em profundidade, não substitui o controle de origem.

### 6.2-b Autenticação é porta (Spec 20)
A lib **não autentica ninguém** — o mesmo princípio da porta de persistência (Spec 19), aplicado à identidade. Ela **renderiza** a tela de login (`SarakAuthScreen`, `type` nativo) e entrega credenciais ao host por um canal declarativo; o provider de auth (backend próprio, Supabase Auth, Cognito, Keycloak, JWT caseiro…) é 100% decisão do consumidor.

**`SarakAuthScreen` é autocontido:** nenhum callback é obrigatório. Campos (`username`/`password`/`mfaCode`) e alternância de modo (`isRegistering`/`mfaStep`) vivem em estado interno por padrão — controláveis via prop quando o host quiser (ex.: `mfaStep: "{{auth.mfaRequired}}"` lido do DataStore). O único canal que o manifesto precisa injetar é `actions` (a Engine liga `onChange` automaticamente — mesmo mecanismo do `SarakShellNav`): toda interação de negócio (submit, social login, "esqueci a senha", master login, alternar registro) emite um evento estruturado `{{$event}} = { intent, username?, password?, mfaCode?, isRegistering?, provider? }`.

**Receita canônica (login → sessão → rota protegida → logout):**
```json
{
  "schemaVersion": 1,
  "type": "SarakFlex",
  "children": [
    {
      "type": "SarakAuthScreen",
      "renderIf": "!{{session.isLogged}}",
      "props": { "error": "{{session.error}}" },
      "actions": [
        { "type": "api_call", "payload": { "endpoint": "/auth/login", "method": "POST", "params": "{{$event}}", "into": "session" } }
      ],
      "onError": [
        { "type": "mutate_state", "payload": { "path": "session.error", "value": "Credenciais inválidas" } }
      ]
    },
    {
      "type": "SarakFlex",
      "renderIf": "{{session.isLogged}}",
      "children": [
        { "type": "SarakButton", "props": { "children": "Sair" },
          "actions": [
            { "type": "mutate_state", "payload": { "path": "session", "value": { "isLogged": false } } },
            { "type": "navigate", "payload": { "to": "/login" } }
          ]
        }
      ]
    }
  ]
}
```
- O `api_call` de login sobe `$event` inteiro (`params`) para o endpoint que o HOST decide; a resposta cai em `session` via `into` — é lá que o host escolhe guardar `token`/`isLogged`/o que quiser (a Sarak só faz o merge no DataStore, nunca inspeciona o shape).
- `renderIf`/`{{session.isLogged}}` reage à mudança de estado automaticamente (sem shell/rotas — funciona igual com `shell`+`routes` reais, gateando qual rota monta).
- **Sessão autenticada em requisições subsequentes:** o `networkInterceptor` do host injeta `Authorization` a partir de onde quer que tenha guardado o token (variável de módulo, cookie httpOnly lido no servidor, etc. — nunca é a Sarak quem decide isso).
- **401 → redirect:** trate isso DENTRO do `networkInterceptor` (ele é só uma função) — em caso de 401, o host chama seu próprio `routerInterceptor`/limpa a sessão antes de rejeitar a promise. A Sarak não sabe o que é um 401; só recebe o erro e roda `onError`/`disabledIf`, como qualquer outra falha de rede.
- **Logout declarativo:** `mutate_state` zera a fatia da sessão + `navigate` pede o redirect — o host decide o que "zerar sessão" significa de verdade (revogar no backend, limpar cookie, etc.) reagindo à própria action de `navigate`/observando o DataStore.

**Gate anti-acoplamento (Spec 20 §2.3):** `src/` nunca importa SDK de provider de auth nem lê token de storage diretamente — verificado por `AuthCouplingGate.test.ts`. Achado real corrigido nesta spec: dois hooks legados (`shared/services/api.ts`, `Chat/useSarakChat.ts`) liam `localStorage` num esquema de chaves fixo (`${system}_token`/`sarak_token`/`auth_token`) — arquitetura "Sarak Matrix" anterior ao contrato `networkInterceptor`, removida.

**Nota de migração (breaking change silencioso):** consumidores que dependiam dessa injeção automática (`${system}_token`/`sarak_token`/`auth_token`) devem passar a compor o header `Authorization` no próprio host — interceptor axios próprio (se ainda usam `shared/services/api.ts`/`useSarakChat.ts` diretamente) ou `networkInterceptor` (caminho declarativo). Sem esse ajuste, endpoints que exigem auth nesses templates passam a responder 401 sem aviso. Impacto conhecido: **Sarak-MyService**.
