---
tipo: "plan"
titulo: "Proteger a tela contra erro, avisar alterações não salvas e entregar a base que os consumidores reescrevem"
objetivo: "Fazer um erro de render ficar contido no bloco que falhou, um formulário alterado avisar antes de sair, a paginação gerar link real e o consumidor receber prontas a mensagem de erro, a utilidade de teste e os gates que faltam"
dominio: "Componentes / Resiliência e kit"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "rc.5", "resiliencia", "kit"]
relacionados: ["[[anexos/rc5-contrato]]", "[[10-seguranca-e-acessibilidade]]", "[[12-kit-do-consumidor]]", "[[16-integracao-continua]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/specs/12-kit-do-consumidor.md + specs/specs/10-seguranca-e-acessibilidade.md + specs/specs/16-integracao-continua.md"
---

# 1. Objetivo

Um defeito num componente não derruba a tela, nenhum formulário perde dado em silêncio, e os consumidores param de reescrever o básico.

# 2. Contexto

Análise do dono de 2026-11-02, que cruzou a superfície da lib, o que o ERP escreve à mão e 11 sistemas ativos.

- **Proteção de erro:** não há `getDerivedStateFromError` em `src/`, embora um histórico antigo cite error boundary. Confirme se existia e sumiu. Hoje um erro de render derruba a tela.
- **Alterações não salvas:** nada em `src/`, e nenhum sistema varrido trata. O `SarakForm` não avisa.
- **Paginação com link:** o ERP escreveu `LinkPagination` (`packages/ui-kit/src/LinkPagination.tsx`), e Login e Cripto têm a própria. `SarakPagination` não gera `href`.
- **Mensagem de erro:** cerca de 40 cópias de `errorMessage` no ERP.
- **Mock do kit:** 7 no ERP, um por módulo; `src/testing.ts` existe, mas não resolve isso.
- **Backlog #11:** nada garante que a lib não faz rede. **Backlog #59:** actions em Node 20 e `ubuntu-latest` mudam sem controle.

# 3. Escopo

## 3.1 Dentro
- Componente novo `SarakErrorBoundary`; `src/components/atomic/Navigation/SarakPagination.tsx`.
- `SarakForm`, `SarakFormSection` e um hook público de alterações não salvas.
- `src/testing.ts`, `src/shared/`, `gates/scripts/contrato/`, `.github/workflows/`.
- `src/index.ts`, `src/core/i18n/`, `docs/migracoes.md`, `sarak-ui/GUIA-FRONTEND.md`.

## 3.2 Fora
- Roteamento: a lib não navega ([[018-um-cromo-so-e-o-consumidor-e-dono-das-rotas]]). O bloqueio de saída recebe a integração do consumidor.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Anexo | `specs/plan/anexos/rc5-contrato.md` | superfície |
| Spec fixa | `specs/specs/12-kit-do-consumidor.md` | kit |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` §3.2 | a lib não faz rede |
| Spec fixa | `specs/specs/16-integracao-continua.md` | CI |
| **Skill** | `ui-novo-componente` · `padrao-escrita` + `padrao-typescript` | componente · sempre |

Caso real, fora deste repositório: no ERP, LinkPagination.tsx e errorMessage.ts, em packages/ui-kit/src.

# 5. Instruções de execução

1. Fotografe o worktree.
2. **`SarakErrorBoundary`.** `fallback`, `onError`, `resetKeys`. O padrão mostra mensagem do catálogo e "Tentar de novo". `SarakSection` e `SarakAppChrome` o usam por padrão, para o erro ficar no bloco.
3. **`useSarakUnsavedChanges({ isDirty, onBlock? })`.** Liga `beforeunload` e devolve uma confirmação pelo overlay para o consumidor ligar no roteador dele. `SarakForm` aceita `warnOnUnsaved`, padrão `false`.
4. **`SarakPagination`:** `getPageHref?: (page: number) => string`. Com ele, cada página é link real, com Ctrl+clique.
5. **`sarakErrorMessage(error, fallback?)`:** texto seguro de `Error`, string e resposta comum.
6. **Testes:** um `renderWithSarak` e o mock que dispensa os 7 do ERP.
7. **Gate de rede (#11):** `fetch`, `XMLHttpRequest`, `WebSocket`, `axios` em `src/` reprovam, com allowlist comentada. Tem caso que falha.
8. **CI (#59):** fixe `ubuntu-24.04` e suba as actions.
9. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] Erro de render fica no bloco, e "Tentar de novo" remonta — navegador.
- [ ] Formulário alterado avisa; `warnOnUnsaved` omitido não muda nada — teste.
- [ ] Com `getPageHref`, a página é `<a href>` — teste.
- [ ] Gate de rede falha no caso plantado.
- [ ] Catálogo e nota de migração.

# 7. Como verificar (uso do revisor)

**Gate:** rede sem leitor autorizado em `src/` reprova.

- Filtro dos arquivos tocados e `check-audit-baseline.mjs --with-tsc`.
- Mutação no gate.

# 8. Destino da síntese

**Destino:** `specs/specs/12-kit-do-consumidor.md`, `specs/specs/10-seguranca-e-acessibilidade.md` §3.2 e `specs/specs/16-integracao-continua.md`.

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-02

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
(limpo)

Durante a execução, a plan-152 entrou em paralelo no mesmo worktree: `SarakDataTable/**`, `DataDisplay/index.ts`, `SarakDocumentFrame.tsx`, `sarakPrint.ts`, `catalogEntries.table.ts`, `sarak-base.css` e `_print.css`. `src/index.ts`, `package.json` e os artefatos gerados têm trechos das duas. O status da plan-145 também mudou; é do revisor.

**O que foi feito**
- `src/components/atomic/Feedback/SarakErrorBoundary.tsx` (novo): `fallback` (nó ou função), `onError`, `resetKeys`. O padrão é `SarakAlert` com texto do catálogo e "Tentar de novo". Não existia em `src/`: o histórico mostra que existiu (`29d3dac3`) e saiu no passado, junto do motor de manifesto. `git log -S` confirma a passagem; o commit exato da remoção não foi isolado.
- `SarakSection.tsx:77`: o conteúdo fica num boundary, com `resetKeys={[loading]}`. Título e ações ficam fora dele.
- `chrome/ChromeContentRegion.tsx`: boundary no painel principal e no secundário, com `resetKeys={[activeRoute]}`; os três corpos do cromo passam `activeRoute`. Sem a chave, navegar pelo menu deixaria a tela nova presa no aviso.
- `Templates/hooks/useSarakUnsavedChanges.ts` (novo): `beforeunload` só com alteração pendente; devolve `confirmLeave()` pelo overlay; `onBlock(source)`.
- `hooks/useFormData.ts`: estado `baseline` (último valor carregado ou salvo) e `isDirty`, que compara como o campo exibe. `SarakForm.tsx`: `warnOnUnsaved`, padrão `false`.
- `SarakPagination.tsx`: `getPageHref`; páginas e setas viram `SarakLink`, com `onChange` no clique simples. A seta na ponta segue botão desabilitado.
- `src/shared/errors/sarakErrorMessage.ts` (novo).
- `src/shared/testing/sarakTestKit.tsx` (novo): `renderWithSarak` e `createSarakKitMock`, expostos por `src/testing.ts`.
- `gates/scripts/contrato/check-no-network.mjs` (novo), por AST, com allowlist vazia; `npm run network:check`; entra no passo de `*:check` de `gates.yml`.
- `gates.yml` e `install-tag.yml`: `ubuntu-24.04` nos 5 jobs; `checkout`, `setup-node` e `upload-artifact` em `@v7`, todos `using: node24`, conferidos nos `action.yml` das tags. As entradas que os workflows usam existem na v7.
- 10 chaves novas em `catalogEntries.feedback.ts`, nos 6 idiomas. `docs/migracoes.md`: entrada nova. `GUIA-FRONTEND.md`: §1.2 testes, §3.7 e §6. Regenerados `catalog`, `guide` e `dev-kit`.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Feedback/SarakErrorBoundary.tsx`, `__tests__/SarakErrorBoundary.test.tsx`, `Feedback/index.ts` | criado/alterado | componente, 13 casos e barril |
| `src/components/atomic/Templates/SarakSection.tsx`, `__tests__/SarakSection.test.tsx` | alterado | boundary no conteúdo e testes |
| `src/components/Layout/chrome/ChromeContentRegion.tsx`, `ChromeTopbarBody.tsx`, `ChromeSidebarBody.tsx`, `SarakAppChromeMobile.tsx`, `__tests__/SarakAppChrome.test.tsx` | alterado | boundary por painel, `activeRoute` e teste |
| `src/components/atomic/Templates/hooks/useSarakUnsavedChanges.ts`, `hooks/__tests__/useSarakUnsavedChanges.test.tsx` | criado | hook e teste |
| `src/components/atomic/Templates/hooks/useFormData.ts`, `SarakForm.tsx`, `__tests__/SarakForm.test.tsx` | alterado | `isDirty`, `warnOnUnsaved` e testes |
| `src/components/atomic/Navigation/SarakPagination.tsx`, `__tests__/SarakPagination.test.tsx` | alterado | `getPageHref` e testes |
| `src/shared/errors/sarakErrorMessage.ts`, `errors/__tests__/sarakErrorMessage.test.ts` | criado | função e teste |
| `src/shared/testing/sarakTestKit.tsx`, `testing/__tests__/sarakTestKit.test.tsx`, `src/testing.ts` | criado/alterado | render, mock e reexport |
| `src/index.ts` | alterado | `sarakErrorMessage`, hook e tipos (trecho meu; há trecho da plan-152) |
| `src/core/i18n/catalogEntries.feedback.ts` | alterado | 10 chaves |
| `gates/scripts/contrato/check-no-network.mjs`, `__tests__/check-no-network.test.mjs` | criado | gate e teste do gate |
| `package.json`, `package-lock.json` | alterado | `network:check`; `@testing-library/react` como peer opcional |
| `.github/workflows/gates.yml`, `install-tag.yml` | alterado | imagem, actions e o 17º `*:check` |
| `docs/migracoes.md`, `sarak-ui/GUIA-FRONTEND.md` | alterado | nota e guia |
| `docs/component-catalog.*`, `sarak-ui/*` (gerados), `sarak-dev/*` | alterado | regenerados, com o estado parcial da plan-152 |

**Verificações executadas**
- `npx vitest run` por filtro: Boundary, `Templates/hooks`, SarakForm, SarakSection, SarakPagination, `src/shared`, `src/__tests__/testing`, `src/core/i18n`, `check-no-network`, `check-gate-limits`, `src/components/Layout` → 523 testes, 520 ok e 3 falhas, todas de escrita do teste (um `await` que achatava a promessa; papel errado do item de navegação).
- Corrigidos, reexecutados `useSarakUnsavedChanges` e `SarakAppChrome.test.tsx` → 64 de 64.
- Consumidores: `src/components/atomic/Templates/__tests__`, `src/__tests__`, `check-barrel*`, `check-public*` → 198 de 198.
- `node gates/scripts/contrato/check-no-network.mjs` → `[OK] 671 arquivos de src/ varridos, sem rede (exceções declaradas: 0)`.
- `npm run barrel:check` → 112 componentes, 0 faltas.
- `npm run verify -- --tier=quick`, uma vez → **exit 1, 3 falhas, nenhuma em arquivo desta plan:**
  - `tsc --noEmit`: 5 erros, em `SarakDataTable/useDataTableColumns.ts:116` (2), `componenteQueLeOToken.test.tsx`, `SarakTableView.test.tsx` e `SarakTableViewParts.test.tsx`, que vêm do tipo `TableInteractionsResult` novo.
  - `audit:baseline --with-tsc`: bloqueado pelos 2 erros de produção acima.
  - `variable-contract:check`: 24+ linhas `var(--color-theme-title, #f2f6fb) — padrão: CanvasText`, causadas por `src/styles/_print.css:48`.
  - Os demais gates de contrato e o Anel 0 (3700 linhas, 0 achados) passaram.

**Gate: `network:check` — entrada exata e resultado (teste do próprio gate)**
- Reprova: `await fetch('/api')`, `window.fetch`, `globalThis.fetch`, `new XMLHttpRequest()`, `new WebSocket`, `new window.WebSocket`, `new EventSource`, `navigator.sendBeacon`, e `axios` por `import`, subcaminho, `export from`, `import()` e `require`.
- Passa (falso positivo que não pode ter): `fetch(url)` em comentário, JSDoc, string e JSX; `props.fetch()`, `client.fetch()`, `new client.WebSocket()`, `fetchData()`, `axios-mock-adapter`, `./axios`, `typeof fetch` em tipo.
- Caso plantado: `src/components/A.tsx` com `fetch('/api')` → `{ file, line: 1, use: 'fetch' }`. Allowlist obsoleta é acusada; `__tests__`, `.test` e `.d.ts` ficam fora.

**Critérios de aceite**
- [ ] Erro de render fica no bloco, e "Tentar de novo" remonta — **navegador é do revisor**. Em jsdom: `SarakErrorBoundary.test.tsx` (remontagem por contagem de montagem), `SarakSection.test.tsx`, `SarakAppChrome.test.tsx`.
- [x] Formulário alterado avisa; `warnOnUnsaved` omitido não muda nada — evidência: `SarakForm.test.tsx`, bloco `warnOnUnsaved`.
- [x] Com `getPageHref`, a página é `<a href>` — evidência: `SarakPagination.test.tsx`, bloco `getPageHref`, inclusive Ctrl+clique.
- [x] Gate de rede falha no caso plantado — evidência: `check-no-network.test.mjs`, caso MUTAÇÃO.
- [x] Catálogo e nota de migração — evidência: `sarak-ui/catalog.json` cita os 5 nomes; `docs/migracoes.md`, primeira entrada.

**Decisões e suposições**
- A plan chegou em 🔴, não em 🟡. Executei porque o dono a despachou diretamente nesta conversa.
- `renderWithSarak` é **assíncrona**. O `vitest.config` do consumidor importa `./testing` em Node; um import estático levaria a lib inteira e exigiria o Testing Library. Por isso os dois carregam por `import()` com especificador em variável, e a lib volta pelo próprio nome, o que dá um contexto só em ESM e CJS e não muda os chunks de `index.js`.
- `@testing-library/react` virou peer opcional, senão o pnpm estrito não o resolve de dentro do pacote. O contrato da rc.5 não listava isso.
- O mock se chama `createSarakKitMock`: o contrato só nomeava `renderWithSarak`. Cobre os dublês que o ERP escreve (`SarakDataTable`, `SarakChartEngine`, `SarakPDFViewer`), mais `overrides`.
- `sarakErrorMessage` barra `TypeError`, `ReferenceError` e similares, pois são defeito de código; o ERP mostrava o texto de rede para todo `TypeError`. Aqui só as 3 frases do `fetch` contam como rede. Fora do React não há idioma ativo: o padrão é `pt`, e `fallback` substitui inclusive o texto de rede.
- `SarakFormSection` não mudou. Está na §3.1, mas não guarda estado nem aparece na §5; quem compõe com ele usa o hook.
- `warnOnUnsaved` cobre só o fechamento da aba: `SarakForm` não tem como entregar `confirmLeave`. A rota interna usa o hook, conforme a §3.2.
- O gate entrou em `package.json` e `gates.yml`. `.githooks/pre-commit` não está na §3.1 e ficou de fora; hoje ele só roda na CI.
- Fora da lista da §5, o gate cobre também `EventSource` e `navigator.sendBeacon`: mesma classe, e a spec 10 §3.2 veda telemetria.

**Achados fora do escopo (não corrigidos)**
- `.github/workflows/gates.yml:73` ainda diz "Os SEIS `*:check`", já defasado antes desta plan.
- `specs/00-backlog.md` não tem linhas `| 11 |` nem `| 59 |` nesse formato: não confirmei as entradas, e a síntese precisa localizá-las.
- Um boundary em volta do cromo deixa de receber erro de tela, e o cromo não tem `onError` próprio. A saída está na nota de migração; uma prop no cromo seria decisão de contrato.

**Pendências / riscos**
- `quick` vermelho até a plan-152 fechar: os 3 itens acima são dela. Refazer `catalog`, `guide` e `dev-kit` depois dela, pois os gerados de agora carregam o estado parcial.
- Critério de navegador pendente, por ser do revisor.
- O build não rodou. Falta provar no pacote montado o `import()` por variável (`dist/testing.js`), `test:optional-peers` e `boot:measure`.
- As actions `@v7` e `ubuntu-24.04` só se provam no primeiro run de CI.
- Suíte completa não rodou, por instrução.

## Resumo da execução (correção 1) — 2026-11-02

**Resultado:** Bloqueado. O `npm run build` para em `public-types:check` por um tipo da `plan-152`, e a instrução manda parar e relatar. `status` segue em `🔵`.

**Achado 1 — critério sem evidência: escrito, não executado**
- Criados `browser-tests/erro-no-bloco.spec.ts` (5 casos) e `browser-tests/fixtures/erro-no-bloco-entry.tsx`.
- O spec lê o `dist/`, que está incompleto (ver Pendências). Não rodou: nenhum dos 5 casos tem resultado.

**Achado 2 — pacote: não provado, e o build achou 2 defeitos meus**
- 1ª rodada: `public-types:check` acusou 264 tipos. **Defeito meu:** o `import type { SarakUIProviderProps }` em `sarakTestKit.tsx` fez o tsup mover tipos para `dist/types-*.d.ts`, compartilhado entre os entries, e eles sumiram do `index.d.ts`. `tsc` e filtros não enxergam isso. Corrigido: o subpath de testes não importa tipo da lib, e `provider` passou a `SarakRenderProviderProps`, estrutural e exportada. Custo: `provider` perde a checagem das chaves do Provider.
- 2ª rodada: restaram 2 tipos, e não há mais `types-*.d.ts`. `SarakErrorBoundaryState`, **defeito meu**, corrigido com `export` em `SarakErrorBoundary.tsx:23`. `SarakCellBehavior` é da `plan-152`: `SarakDataTable/SarakCellContent.tsx:11`, sem exportação em `src/index.ts` e sem exclusão em `publicTypeExclusions.mjs`.
- Não medidos, porque o build parou antes: `test:optional-peers`, `boot:measure`, `dist/testing.js` em Node sem DOM e sem `@testing-library/react`, e `renderWithSarak` pelo pacote montado. Depois do `export`, o build não foi repetido: a falha da `plan-152` continua.

**Achado 3 — `gates.yml`: corrigido**
- `gates.yml:73` e `:102` não fixam mais o total ("Os SEIS" e "Os 17" saíram).

**Verificações executadas**
- `npm run build` × 2 → exit 1 nas duas, em `public-types:check` (264 tipos e 2 exclusões obsoletas; depois 2 tipos).
- `npx vitest run src/shared/testing .../SarakErrorBoundary` → 21 de 21.
- `npx tsc --noEmit` → 0 erros.

**Decisões e suposições**
- Não exportei `SarakCellBehavior`: `src/index.ts` está na §3.1, mas o tipo é da `plan-152`, e decidir entre exportar e excluir cabe a ela.
- Não contornei o gate rodando à mão os passos seguintes do build.

**Pendências / riscos**
- **`dist/` incompleto no worktree:** o `tsup --clean` rodou e o build parou antes do CSS. `dist/sarak.css` e `dist/sarak-scoped.css` não existem, e `git status dist` mostra 57 removidos, 8 alterados e 36 novos. **Qualquer spec de navegador, inclusive os da `plan-152`, mede um `dist/` sem CSS até o próximo build completo.** Não restaurei: é escrita no Git.
- Para retomar: a `plan-152` resolve `SarakCellBehavior`; então, numa rodada só, `npm run build`, `boot:measure`, o spec `erro-no-bloco` e a prova de `dist/testing.js` e `renderWithSarak` pelo pacote.

## Resumo da execução (correção 2) — 2026-11-02

**Resultado:** Bloqueado de novo. Itens 1 e 2 do veredito seguem sem evidência, e o `status` fica em `🔵`.

**Verificações executadas**
- `npm run build` (1ª) → exit 1 em `guide:check`: 4 arquivos defasados de `sarak-ui/`. Conserto do próprio gate: `npm run guide` (kitHash `0a753588ef27`). O veredito deixava a regeneração para depois da `plan-152`; rodei porque ela já está em `🟠` e o build não passa sem isso. `dev-kit` não foi refeito.
- `npm run build` (2ª) → exit 1 em `public-types:check`: `[ERROR] 1 tipo(s) ... SarakCellBehavior`. `SarakErrorBoundaryState` saiu da lista, e não há `types-*.d.ts`.
- Não rodaram, porque dependem do build: `test:optional-peers`, `boot:measure`, o spec `erro-no-bloco`, a prova de `dist/testing.js` e `renderWithSarak` pelo pacote.

**Causa:** `SarakCellBehavior` (`SarakDataTable/SarakCellContent.tsx:11`) segue sem export em `src/index.ts` e sem entrada em `gates/allowlists/publicTypeExclusions.mjs`. `plan-152` está em `🟠`, mas esse conserto não está no worktree.

**Decisões e suposições**
- Não exportei o tipo nem contornei o gate: a mesma decisão da correção 1.

**Pendências / riscos**
- `dist/` segue incompleto: sem `sarak.css`, com 57 removidos, 8 alterados e 36 novos em `git status dist`.

## Resumo da execução (correção 3) — 2026-11-02

**Resultado:** Concluído. Os itens 1 e 2 do veredito têm evidência; o item 3 fechou na correção 1. `SarakCellBehavior` agora é exportado por `SarakDataTable/index.ts:20`, trabalho da `plan-152`.

**Achado 1 — critério de navegador: atendido**
- `npx playwright test --config=browser-tests/playwright.config.ts browser-tests/erro-no-bloco.spec.ts` → **5 passed**, sobre o `dist/` deste build:
  - seção: o erro fica no bloco; título, ações e a seção vizinha seguem visíveis e clicáveis;
  - seção: nova tentativa sem conserto volta ao aviso; depois do conserto remonta (`Montado 1`);
  - cromo: o erro fica em `[data-sarak-content]`; a navegação e o rodapé da lateral seguem clicáveis;
  - cromo: "Tentar de novo" remonta a tela;
  - cromo: trocar `activeRoute` limpa o erro, e voltar à tela quebrada mostra o aviso de novo.
- Limite: mede `SarakSection` e o cromo em lateral a 1200 px. Os modos topo e celular usam o mesmo `ChromeContentRegion`, mas não foram medidos no navegador.

**Achado 2 — pacote: provado**
- `npm run build` → exit 0, com `dist/sarak.css` presente e só `index.d.ts` e `testing.d.ts` em `dist/*.d.ts`.
- `test:optional-peers`, dentro do build → 4 linhas `pass`: Vite 8 sem peers opcionais, Vitest jsdom, mutação do import nomeado e Vite 8 com todos os peers.
- `npm run boot:measure` → exit 0: boot de 388.1 KB gzip, teto de 390.0 KB; nenhum tema fora do padrão no fecho estático.
- Consumidor temporário fora do repositório, com o tarball de `npm pack` e o `node_modules` do repositório por junção, menos `@testing-library/react`:
  - ESM em Node: `document: undefined`, `window: undefined`; o Testing Library deu `ERR_MODULE_NOT_FOUND` na importação; `@sarak/lib-ui-core/testing` carregou com os 4 nomes; `filterSarakTestConsoleLog` funcionou; `renderWithSarak` sem o Testing Library rejeita com `ERR_MODULE_NOT_FOUND`.
  - CJS em Node (`dist/testing.cjs`): carregou com os mesmos 4 nomes.
- Mesmo consumidor com `@testing-library/react`, em Vitest jsdom, com `vitest.config` importando `./testing` → **3 de 3**: `renderWithSarak` usa o mesmo contexto do pacote que o teste importa (`useSarakUI().design` presente), repassa `provider`, e `createSarakKitMock` mantém `SarakButton` real e desenha o dublê de tabela.
- O consumidor temporário foi removido, e `node_modules/react` do repositório continua presente.

**Decisões e suposições**
- O script da prova ficou no scratchpad, não no repositório: a plan não pede um gate novo.

**Pendências / riscos**
- `renderWithSarak` foi executada só em ESM; em CJS foi provada apenas a carga do subpath.
- `dist/`, `src/buildInfo.ts` e `src/core/Provider/buildInfo.ts` foram regenerados pelo build e têm alterações no worktree.
- `catalog` e `dev-kit` não foram refeitos nesta rodada; o veredito os deixou para depois da `plan-152`.

## Resumo da execução (correção 4) — 2026-11-02

**Resultado:** Concluído.

**Achado 1 — `sarakTestKit.test.tsx` instável: corrigido**
- `src/shared/testing/__tests__/sarakTestKit.test.tsx`: `LIBRARY_LOAD_TIMEOUT_MS = 30_000` nos dois `describe`, o mesmo valor do `PreviewCanvas.test.tsx`. O tempo vale para todo o arquivo porque o caso que chega durante uma carga pendente também estoura, como mostraram as 3 falhas. O teto global não mudou.

**Verificações executadas**
- `npm run catalog` → 112 componentes, exit 0.
- `npm run guide` → 116 componentes, 424 tokens, 117 ícones, kitHash `74609fb93914`, exit 0.
- `npm run dev-kit` → 112 componentes públicos, 424 tokens, 43 gates, devKitHash `4f111488b4f4`, exit 0.
- Filtro da plan, o mesmo da 1ª execução (Boundary, `Templates/hooks`, SarakForm, SarakSection, SarakPagination, `src/shared`, `src/__tests__/testing`, `src/core/i18n`, `check-no-network`, `check-gate-limits`, `src/components/Layout`), duas vezes seguidas:
  - rodada 1 → 523 de 523; 1º caso do `sarakTestKit` em 4,2 s;
  - rodada 2 → 523 de 523; 1º caso do `sarakTestKit` em 5,6 s, acima do antigo limite de 5 s, o que confirma a causa.

**Decisões e suposições**
- `describe(nome, { timeout }, fn)` em vez de um número por caso: é um ponto só para o arquivo inteiro.

**Pendências / riscos**
- Os artefatos regenerados aqui e `dist/` são de builds diferentes: `dist/` não foi refeito depois desta rodada. Só o teste mudou em `src/`.

---

# 10. Veredito

## Veredito — 2026-11-02 — 🔴 Reprovado (falta a prova no navegador e no pacote)

O código está correto no que o revisor mediu. Filtro da plan: 228/228. `tsc`: 0 erros, com a `plan-152` já no worktree. Gate: um `src/` plantado à parte acusou `fetch` e `new WebSocket`, poupou comentário e `client.fetch()`, e a exceção sem ocorrência foi acusada. As tags `v7` das três actions existem no remoto. `SarakForm` fora do Provider segue funcionando, porque `useOverlay` degrada. O `activeRoute` que chega ao cromo é o resolvido, inclusive com `navItems`.

1. **Critério sem evidência.** "Erro de render fica no bloco, e 'Tentar de novo' remonta" pede navegador, e o resumo o deixou "do revisor". O revisor não escreve teste: não há spec, e o critério não está atendido. Crie um spec curto em `browser-tests/`: erro dentro de `SarakSection` e dentro de `SarakAppChrome`, em que o resto da tela segue visível e clicável, "Tentar de novo" remonta e trocar `activeRoute` limpa o erro.
2. **O pacote não foi provado.** Risco do próprio resumo. Depois de `npm run build`: `test:optional-peers`, `boot:measure` e a importação de `dist/testing.js` em Node sem DOM e sem `@testing-library/react` instalado no teste, além de `renderWithSarak` funcionando pelo pacote montado.
3. **`.github/workflows/gates.yml:73`** diz "Os SEIS `*:check`", no arquivo que a plan alterou. Corrija para não fixar o total em prosa.

**Verificação objetiva:** só isso. Regenerar `catalog`, `guide` e `dev-kit` fica para depois da `plan-152`.

## Veredito — 2026-11-02 — 🔴 Reprovado (teste instável)

Os itens 1 a 3 do veredito anterior estão fechados. Rodado pelo revisor: `erro-no-bloco` 5/5; `dist/testing.js` carrega em Node sem DOM, com os 4 nomes; `public-types:check` e `test:optional-peers` verdes. O `SarakTestKit` sem checagem das chaves do Provider é custo aceito: o erro aparece no próprio teste do consumidor.

1. **`src/shared/testing/__tests__/sarakTestKit.test.tsx` é instável.** Em três rodadas do filtro da plan, duas falharam: 3 e depois 1 teste, com `Test timed out in 5000ms`. Sozinho passa 8/8. A causa é a primeira importação da lib inteira sob carga, e isso derrubaria a suíte da CI e o `preversion`. Dê a esses casos um tempo explícito, como `PreviewCanvas.test.tsx` já faz, sem mudar o teto global.

**Verificação objetiva:** `npm run catalog`, `npm run guide` e `npm run dev-kit`, que ficaram pendentes, e o filtro da plan duas vezes seguidas. Sem suíte inteira e sem bateria.

## Veredito — 2026-11-02 — 🟢 Aprovado

`sarakTestKit.test.tsx` tem tempo explícito por `describe`, e o teto global não mudou. Filtro da plan rodado pelo revisor três vezes seguidas: 228/228 nas três. `catalog:check`, `guide:check` e `dev-kit:check` em dia. `erro-no-bloco` 5/5 e `dist/testing.js` em Node sem DOM foram medidos no veredito anterior, e só o teste mudou desde então.

O commit sai junto da `plan-152`.
