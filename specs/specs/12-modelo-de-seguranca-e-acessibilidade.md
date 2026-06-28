---
tipo: "spec"
titulo: "Modelo de Segurança, Acessibilidade e Isolamento de Tema"
dominio: "Sarak-Lib-UI-Core (Arquitetura e Segurança)"
status: "🟢 Consolidado"
prioridade: "Alta"
tags: ["spec", "seguranca", "xss", "acessibilidade", "a11y", "tema", "isolamento"]
relacionados: ["11-engine-declarativa-e-manifestos"]
---

# 1. Visão Geral
A introdução do Manifest Renderer transforma a Sarak numa engine que processa e exibe dados oriundos de fontes externas (APIs, JSONs armazenados). Isso eleva criticamente o risco de vulnerabilidades, em especial *Cross-Site Scripting* (XSS) e vazamentos de estado global.
Este documento sela o contrato de confiança absoluta da biblioteca, definindo também como ela garante um padrão Ouro em Acessibilidade (A11y) e como o Tema (DesignScope) é blindado contra vazamentos.

# 2. Modelo de Segurança e Fronteira de Confiança (Zero-Trust)

A arquitetura adota a premissa de que **qualquer JSON ou dado injetado é nativamente hostil**.

## 2.1 Sanitização de HTML e Conteúdo Rico
Componentes como o Rich Text Editor (WYSIWYG) ou o Renderizador de Markdown são os maiores vetores de injeção.
- **Canal de Sanitização Estrito:** Todo conteúdo raw passa por um sanitizador (ex: `DOMPurify` ou API moderna restrita).
- **Bloqueio de Tags Executáveis:** Tags `<script>`, `<style>`, `<iframe>` e atributos que começam com `on` (ex: `onclick`, `onmouseover`) são sumariamente removidos antes de tocarem o DOM.
- **Proibição do `dangerouslySetInnerHTML` sem Filtro:** Nunca deve ser utilizado de forma direta com dados do Payload da Engine sem passar pela Allowlist do Sanitizador.

## 2.2 Blindagem da Engine (Safe Evaluator)
As diretivas dinâmicas (como `renderIf: "{{user.role}} === 'ADMIN'"`) exigem a avaliação de JavaScript.
- **Imunidade contra `eval()`:** A engine utiliza um interpretador de escopo fechado (Safe Eval). O código inserido no JSON nunca terá acesso aos objetos globais do navegador (`window`, `document`, `fetch`, `localStorage` nativo, `alert`). Ele apenas interage com o dicionário de variáveis liberado via `SarakDataStore`.

# 3. Contrato de Acessibilidade (A11y)
Como uma UI Core Agnostica, a Sarak é a base estrutural para qualquer software, logo a acessibilidade não é opcional.

## 3.1 Teclado e Foco (Focus Management)
- Nenhum componente visual atômico pode travar (*trap*) o foco do teclado (com exceção proposital de Modais abertos).
- A navegação completa (Drawers, Tabs, Dropdowns) deve ser viável apenas utilizando `Tab`, `Shift+Tab`, `Enter` e `Espaço` (Space).

## 3.2 Atributos ARIA (Accessible Rich Internet Applications)
- Componentes não-nativos (como custom Dropdowns ou Accordions) injetam automaticamente as tags `aria-expanded`, `aria-hidden` e `role` correspondentes com base nos *props* booleanos gerenciados pela Engine.
- Contrastes das cores de alerta (Erro, Sucesso, Info) devem garantir leitura conforme as normas WCAG (no mínimo nível AA), fiscalizados pela taxonomia do Design Engine.

# 4. Isolamento de Tema (DesignScope Bridge)
A injeção de tokens não pode afetar sistemas alheios caso a Sarak seja utilizada como um Widget (Micro-frontend) numa aplicação React existente.

- **Fronteira CSS (Scoped Styles):** Os tokens injetados (`--sx-color-*`) são definidos numa raiz específica do wrapper `SarakUIProvider` ou `DesignScope`, e não no `:root` global, garantindo que não colidam com bibliotecas como TailwindCSS nativa do projeto hospedeiro.
- **Vazamento Bloqueado:** Componentes da camada atômica não utilizam seletores de classe globais sujos (ex: `.btn { color: red }`). Todo estilo advém da extração das *CSS custom properties* que são injetadas estritamente no escopo da árvore gerenciada.

# 5. Plano de Testes (Quality Gate)
## Unitários
- [x] Passar strings com `<img src=x onerror=alert(1)>` num renderizador de texto deve resultar na completa neutralização do atributo `onerror`.
- [x] O *Safe Evaluator* deve lançar uma exceção de segurança (`ErrorBoundary` acionado) se o JSON tentar chamar `window.location`.
- [x] Todo componente focado pelo teclado ativa os delineadores visuais definidos no token `--sx-ring-focus`.
## Contrato/API
- N/A. (A barreira contra ataques ocorre antes de interagir com APIs).
## E2E
- [x] Uma auditoria Lighthouse (ou axe-core) pontua 100% de Acessibilidade no conjunto atômico base testado isoladamente no Sarak Canvas.
