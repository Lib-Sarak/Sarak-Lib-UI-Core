---
tipo: "spec"
titulo: "Design Engine como central de layout do sistema — temas JSON, aplica a todas as telas, sem backend"
dominio: "Design Engine / Temas / Persistência / Segurança / Empacotamento"
status: "🔴 Planejada (o CORAÇÃO do produto — a central de layout; remove o backend)"
prioridade: "Máxima"
tags: ["spec", "virada", "design-engine", "temas", "central-de-layout", "persistencia", "seguranca", "remocao-backend"]
relacionados: ["43-design-system-primeiro", "45-scaffolder-react-e-skills", "40-teste-real", "19-porta-de-persistencia-ui", "16-tokens-semanticos-e-validacao-de-valores"]
---

> **Contexto:** este é o objetivo declarado do produto (mantenedor, 2026-07-22): *"uma central de modificação do layout que se aplique ao sistema inteiro — aplicar a aba Design Engine na prática"*, com *"opção de que o importador crie temas em JSON e adicione ao código dele"*. E, sendo uma biblioteca de FRONT, **sem backend próprio** (o módulo não está em produção — o que não é usado se remove).

# 1. Visão Geral e Descrição do Problema

A central de layout (Design Engine) já existe (CustomizationPanel + o módulo nativo "personalization"), mas hoje pressupõe **backend próprio da lib** para persistir: `endpoints.branding` (fetch a um servidor), `backend/node/` (adapters pg/sqlite, REST, `setupUIDatabase`/`createSarakUIExpressMiddleware`), `backend/sarak_ui_core/` (Python), `dist/backend-node.*`, export `./backend/node`, 2º `tsup` no `build:js`, `pg`/`better-sqlite3`, e o `serverTs.mjs` do `init`.

Para uma biblioteca de front, carregar servidor é passivo de segurança (endpoint/banco/auth = superfície de ataque que não é da lib). E, com temas virando **dado no código do consumidor**, o backend perde função.

## 1.1 Três necessidades de persistência, separadas
| Persistir | Onde | Backend? |
|---|---|---|
| **Definição de tema/template** (o dev cria em JSON) | JSON no código do consumidor (prop do Provider) | Não — é código |
| **Seleção/ajuste do usuário final** (persistir no reload) | localStorage (`persistence.storageKey`, já existe) | Não |
| **Sync multi-dispositivo** (opcional) | backend do PRÓPRIO consumidor, via callback | Só se ele quiser, e é dele |

# 2. Regras de Negócio (Solução)

## 2.1 A central aplica ao sistema inteiro (o valor central)
- Garantir/testar que trocar tema ou template no Design Engine **repinta todas as telas** — os componentes Sarak e qualquer módulo/componente do importador que use os tokens (`var(--sarak-*)`). Mecanismo: as CSS vars no escopo do Provider (já existe via `DesignInjector`/`useDesignManager`). Documentar a regra: módulo com estilo hardcoded fora do contrato NÃO é atingido (Spec 43 §2.2).
- **Multi-template:** confirmar que o catálogo de templates/temas (multi-template) é trocável pela central e a troca atinge tudo.

## 2.2 Temas como JSON do consumidor (o pedido do usuário)
- Formalizar/documentar a prop **`customThemes`** do `SarakUIProvider` (já existe: `SarakUIProvider.tsx:85,101` — merge com `GLOBAL_THEMES`) como o caminho oficial: o dev cria arquivos JSON de tema no repo dele e passa `customThemes` + `defaultTheme`.
- Documentar o **schema de um tema** (chaves de token válidas + valores) no catálogo — o dev escreve tema conferindo o catálogo (regra dura de tokens estendida ao consumidor).

## 2.3 Validação/segurança do tema no load (a segurança de verdade)
- **Tema é DADO validado, nunca código.** Ao carregar QUALQUER tema (arquivo, `customThemes`, localStorage), validar contra o schema de tokens: **só chaves conhecidas, valores com tipo checado** (cor / número / enum). Valor fora do contrato → `console.warn` + descartado (postura Spec 16/17), nunca injetado. A validação vale independentemente da fonte — é o que torna localStorage e JSON-de-arquivo seguros por construção.
- Confirmar (grep + teste) que nenhum valor de tema chega a `dangerouslySetInnerHTML` ou a um `<style>` sem sanitização.

## 2.4 CustomizationPanel vira ferramenta de autoria (exporta JSON)
- O CustomizationPanel: **preview ao vivo via localStorage** + botão **"Exportar tema (JSON)"** que entrega o JSON para o dev colar num arquivo do repo. "Salvar novo tema" = exportar, não persistir em servidor.

## 2.5 Persistência da seleção do usuário final = localStorage (default)
- A escolha de tema/template/tweak do usuário final persiste em **localStorage** (reload mantém). A lógica de persistência vive na camada **Provider/Design** (`useDesignManager`/`useBrandingManager`) — nunca acoplada a `src/core/Manifest/Storage` (removido na Spec 46).
- **Porta opcional "traga sua persistência":** o `SarakUIProvider` expõe `initialTheme`/`onThemeChange` (callbacks) para o consumidor que quiser sync no backend DELE. A lib não ship servidor.

## 2.6 REMOVER o backend próprio (não rebaixar)
- Remover: `backend/node/`, `backend/sarak_ui_core/`, `backend/sql/`, a build `tsup backend/node/backend-node.ts` (2º comando do `build:js`), o export `./backend/node` + `typesVersions`, `dist/backend-node.*`, `pg`/`better-sqlite3` de peer/devDependencies (conferir que nada mais os usa), `endpoints.branding` como fetch a servidor (vira o callback de 2.5), e `bin/scaffold/generators/serverTs.mjs` + testes.
- Spec 19 (Porta de Persistência) marcada como superseded por esta (histórico preservado).
- Atualizar `check-package-contents.mjs`/`files`; `docs` de storage removidos/atualizados.
- **Sequência:** a persistência no Provider (2.5) tem que estar pronta ANTES de remover o backend, para o Design Engine não quebrar.

# 3. Critérios de Aceite
- [ ] Trocar tema/template na central repinta **todas** as telas (componentes Sarak + módulo do importador que usa tokens); teste de propagação.
- [ ] Dev cria tema em JSON e passa via `customThemes`; schema de tema no catálogo.
- [ ] Todo tema validado no load (só chaves/valores conhecidos; fora do contrato → warn + descartado); teste de que nenhum valor vira CSS/HTML cru.
- [ ] CustomizationPanel exporta JSON; preview via localStorage.
- [ ] Seleção do usuário final persiste em localStorage (camada Provider/Design); callbacks `initialTheme`/`onThemeChange`.
- [ ] Backend REMOVIDO por completo; `npm pack` sem backend; grep-zero do removido; Design Engine funciona sem servidor.
- [ ] Gates verdes: `catalog:check`, `npm run build` (sem o 2º tsup), `package:check`, `run_audit.mjs` sem regressão; MyService intacto.

# 4. Plano de Testes
- [ ] Propagação: trocar tema → componentes Sarak E um componente-de-token custom repintam.
- [ ] Validação: tema com chave desconhecida / tipo errado / string com `<script>`/CSS → descartado + warn; render seguro.
- [ ] Persistência: selecionar → reload → mantém (localStorage); `onThemeChange` chamado.
- [ ] Empacotamento: `npm pack --dry-run` sem `backend`/`dist/backend-node`; `build:js` só o tsup do front.
- [ ] Regressão: Design Engine (`/design`, multi-template) verde sem backend; MyService intacto.
