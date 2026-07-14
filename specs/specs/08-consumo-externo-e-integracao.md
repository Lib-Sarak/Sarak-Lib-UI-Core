# 08. Consumo Externo e Integração da Sarak-Lib-UI-Core

Este manifesto estabelece as regras e o contrato de uso da biblioteca **Sarak-Lib-UI-Core** quando incorporada por sistemas externos, como o Site Earendel (Next.js), Agentes Locais ou backends em Python.

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
- **Design Agent (`SarakUIOptions.designAgent`):** o chat de IA do Design Engine (`DesignAgentChatCard`) segue a mesma regra — é proibido `fetch`/URL fixa embutida no componente. O importador injeta `options.designAgent.sendPrompt: (input: DesignAgentPromptInput) => Promise<DesignAgentPromptResult>` no `SarakUIProvider`; sem essa função configurada, o card informa "Não configurado" e não tenta rede nenhuma. `sendPrompt` roda no servidor do consumidor (nunca no browser direto) e é quem decide como falar com o backend `agent-design-operator` (acoplado na mesma API Node ou como microsserviço à parte).
- **Validação de origem do manifesto:** garantir que o JSON vem de uma fonte legítima e aplicar CSP/CORS no nível do app — a sanitização da Sarak é defesa em profundidade, não substitui o controle de origem.
