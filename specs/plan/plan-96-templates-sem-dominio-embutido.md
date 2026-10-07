---
tipo: "plan"
titulo: "Tirar o domínio de dentro dos templates: dado e texto vêm do host"
objetivo: "Fazer nenhum componente da lib conhecer URL, cliente HTTP, rota de dominio, texto fixo em portugues ou conceito de um produto, de modo que os templates sirvam a qualquer sistema"
dominio: "Sarak-Lib-UI-Core / Templates / Genericidade"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "templates", "genericidade", "i18n", "auth", "dados"]
relacionados: ["[[03-superficie-publica]]", "[[10-seguranca-e-acessibilidade]]", "[[08-identidade-do-host-e-zero-marca]]", "[[003-remocao-backend-proprio]]"]
depende_de: ""
retida_por: ""
destino_sintese: "arquitetura/03-superficie-publica.md + specs/10-seguranca-e-acessibilidade.md + specs/08-identidade-do-host-e-zero-marca.md + specs/00-regras-e-invariantes.md"
---

# 1. Objetivo

Um sistema qualquer usa `SarakTable`, `SarakForm`, `SarakStats`, `SarakChart` e `SarakAuthScreen` com **o
seu** dado, **o seu** fetch, **o seu** idioma e **a sua** marca: nenhum template da lib busca em URL, conhece
rota de domínio, carrega texto fixo em português nem conceito de um produto.

# 2. Contexto

**Decisão do dono (2026-10-03):** a lib é genérica e vai ser adotada aos poucos em qualquer tipo de sistema;
nada específico de um sistema entra. Medido em 2026-10-02, no `login-completo` (que consome a lib) e no Cripto
(que vai consumir):

| # | O que está embutido | Onde |
|---|---|---|
| 1 | **Um cliente HTTP interno com rotas de domínio.** `axios` com `baseURL = '/api'`, mais `apiKeysApi` (`/orchestrator/keys`), `usageApi`, `modelCatalogApi` e um `authApi` (`/auth/login`, `/auth/me`, `/auth/change-password`) — dentro de `src/`, contra a R32 | `src/shared/services/api.ts:22,70-185` |
| 2 | **Dez templates e hooks buscam por ele** quando recebem `endpoint`: `SarakChart`, `SarakForm`, `SarakManagementGrid`, `useCardGridState`, `useChartData`, `useFormData`, `useManagementGrid`, `useSarakStatsData`, `useSarakTableData` (e um do Discovery, que a `plan-94` remove). Num host com token em memória e fetch próprio, nenhum deles serve: o login só aproveitou `SarakStats` com `data` | `git grep -l "shared/services/api'" -- src` |
| 3 | **`SarakForm` não tem `onSubmit`**: exige `endpoint` e envia pelo cliente interno | `src/components/atomic/Templates/SarakForm.tsx:4,17` |
| 4 | **`SarakAuthScreen` carrega um produto**: textos fixos em português ("Login do Sistema", "Criação de Conta", "Verificação MFA", "ENTRAR COMO MASTER", "Acessar Sistema", "Ou continue com"), o conceito "Master", os selos "Secure"/"Neural", o subtítulo "Sovereign SSO Protocol" no botão social, `url("/noise.png")` buscado na raiz do host, cores fixas (`bg-blue-600`, `text-white`), `autoComplete` errado (`off` no e-mail, `new-password` no login), alternância "Primeiro Acesso" incondicional, e a cor do erro decidida por `error.includes('tentativas')` | `src/components/atomic/Templates/components/AuthForm.tsx:67-166` · `AuthFormFields.tsx:45-128` · `AuthHero.tsx:28,70-74` · `AuthSocialLogin.tsx:28` · `src/components/atomic/Buttons/SarakSocialButton.tsx:68,120` |
| 5 | **`SarakStats` supõe o dado de um produto**: `isActive`, `status === 'active'`, `error_details`; valor `> 1000` vira `1.2k` à força; ícone fixo `Activity`; `0` renderiza em branco (`String(x \|\| '')`); em erro devolve `null` | `src/components/atomic/Templates/SarakStats.tsx:42-62,92,99` |
| 6 | **`SarakTable` só renderiza `String(row[col])`** com caso especial para booleano ("Ativo/Inativo"); impõe título, busca, atualizar e uma coluna de ação com botão **sem `onClick`**; `text-white` fixo | `src/components/atomic/Templates/SarakTable.tsx:55-103,189-210` |
| 7 | **Gráficos com dado inventado**: o candlestick fabrica OHLC de `item.v` (`[v-10, v+10, v-20, v+20]`); o boxplot desenha três linhas fixas | `src/components/engines/charts/SubEngines/builders/statisticalCharts.ts:20-45` |
| 8 | **Textos fixos em português em átomos**: `SarakDataEmpty` ("Nenhum dado encontrado."), `SarakTable` (seis), `SarakAlert` ("Fechar aviso"), `SarakSpinner` ("Carregando"), `SarakToast` ("Fechar notificação") — nenhum passa pelo catálogo `useLibraryText` | `SarakDataEmpty.tsx:17` · `SarakTable.tsx:63-225` · `SarakAlert.tsx:94` · `SarakSpinner.tsx:10` · `SarakToast.tsx` |
| 9 | A R32 diz "gate pleno" e a `10-seguranca` §3.1 diz que o gate não existe — e `auditor_authcoupling` existe e **não vê** o `authApi` de `api.ts` | `specs/specs/00-regras-e-invariantes.md` (R32) · `specs/specs/10-seguranca-e-acessibilidade.md:294` · `gates/scripts/audit/auditor_authcoupling.mjs` |

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `src/shared/services/api.ts` — **removido**, com os tipos que só ele usava.
- Os templates e hooks do item 2: `endpoint` e o fetch interno saem; o dado entra por `data` **ou** por uma
  função do host (`load: () => Promise<T>` / `onSubmit`), e o estado de carregamento/erro continua existindo.
- `src/components/atomic/Templates/components/Auth*.tsx`, `SarakAuthScreen.tsx`,
  `src/components/atomic/Buttons/SarakSocialButton.tsx` — textos pelo catálogo, sem conceito de produto, sem
  marca, sem recurso buscado na raiz do host, `autoComplete` correto, alternâncias opcionais por prop.
- `SarakStats.tsx`, `SarakTable.tsx`, `SarakDataEmpty.tsx`, `SarakAlert.tsx`, `SarakSpinner.tsx`, `SarakToast.tsx` —
  os itens 5, 6 e 8 (sem adicionar capacidade nova; isso é da `plan-97` e da `plan-98`).
- `src/components/engines/charts/SubEngines/builders/statisticalCharts.ts` — candlestick aceita OHLC
  (`open`/`high`/`low`/`close`) e boxplot aceita os cinco valores; sem dado, não desenha.
- `src/components/atomic/Templates/SarakChat.tsx` e `src/components/atomic/Templates/Chat/useSarakChat.ts`, com os
  testes. *(Emenda do revisor, 2026-10-06: o inventário do item 2 contou só quem importava `api.ts`, e o chat faz
  `fetch` direto em `/api${endpoint}` e `/api${modelsEndpoint}`.)* `endpoint` e `modelsEndpoint` saem; o envio e a
  lista de modelos vêm de funções do host, como nos outros templates.
- `src/core/i18n/**` — as chaves novas, nos idiomas do catálogo.
- `gates/scripts/audit/auditor_authcoupling.mjs` — o escopo passa a cobrir rota de autenticação em qualquer
  arquivo de `src/`, com fixture.
- `package.json` — `axios` sai dos peers se ninguém mais o usar.
- `docs/migracoes.md`; `docs/component-catalog.*`, `sarak-ui/`, `sarak-dev/`, `dist/` regenerados.

## 3.2 Fora (o que NÃO pode ser tocado)

- **Capacidade nova de componente** (célula customizada, paginação com resumo, KPI com delta, confirmação,
  modal com tamanhos): são das `plan-97` e `plan-98`.
- O motor de gráficos além dos dois builders do item 7.
- O Provider e a persistência (`plan-93`); o cromo ([[018-um-cromo-so-e-o-consumidor-e-dono-das-rotas]]); os ícones (`plan-95`).
- Qualquer tela, fluxo ou texto de domínio (login, cripto, ERP) — a lib não ganha nada deles.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` | R12 (zero-marca), R32 (indiferente à autenticação), R16 (zero-gambiarra no consumidor), R18 |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | §3.1 (autenticação é do host), §3.2 (rede é do host), §3.6 (tradução) — e a divergência com a R32 a corrigir |
| Spec fixa | `specs/specs/08-identidade-do-host-e-zero-marca.md` | o que conta como marca vazando |
| Spec fixa | `specs/adr/003-remocao-backend-proprio.md` | a decisão de a lib não ter backend — o cliente HTTP interno é resíduo dela |
| Spec fixa | `specs/arquitetura/03-superficie-publica.md` | §6.3 (templates de dado: `data` vence `endpoint` — muda) e §4.3 (nomes) |
| Spec fixa | `specs/specs/03-versionamento-e-release.md` | §3 (remover `endpoint` é MAJOR) e §5 |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` | §3.2 — mock só de I/O externo |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `ui-refatorar-componente` | mudar assinatura publicada |
| **Skill** | `test-unitario` | os testes |
| Código | `src/core/i18n/useLibraryText.ts` · `catalog.ts` | como um texto é lido e em quantos idiomas |
| Código | os arquivos de §3.1 | ler antes de editar |

# 5. Instruções de execução

1. **A porta de dado**: todo template que buscava por `endpoint` passa a aceitar `data` **ou** `load` (função
   do host que devolve o dado); `SarakForm` ganha `onSubmit`. O cliente interno e `api.ts` saem. Teste por
   template: com `load` que rejeita, o estado de erro aparece; com `data`, nenhuma chamada acontece.
2. **`SarakAuthScreen` genérico**: textos pelo catálogo; o rótulo de cada botão e título é prop com default
   traduzido; "Master", "Neural", "Secure", "Sovereign SSO Protocol" e o `noise.png` saem; cadastro, MFA e
   social são opt-in por prop; `autoComplete` padrão do navegador (`username`/`current-password`); a
   gravidade do erro vem de uma prop, não do texto.
3. **`SarakStats` sem produto**: nenhuma suposição sobre as chaves do dado; `0` renderiza `0`; nada vira
   `1.2k` por conta própria; em erro, renderiza o estado de erro.
4. **`SarakTable` sem produto**: nada de "Ativo/Inativo"; sem botão sem ação; sem `text-white`; título,
   busca e atualizar opcionais.
5. **Gráficos honestos**: candlestick e boxplot desenham o dado recebido; sem dado, estado vazio.
6. **Textos**: os cinco átomos do item 8 lêem do catálogo. Teste: com outro idioma, o texto muda.
7. **O gate de acoplamento de autenticação** passa a ver rota de autenticação em qualquer arquivo de `src/`
   (fixture: um `api.get('/auth/me')` solto). A divergência entre R32 e a `10-seguranca` §3.1 vai para a
   síntese.
8. `docs/migracoes.md`: nota MAJOR — `endpoint` sai, `load`/`onSubmit` entram; `axios` deixa de ser peer; o
   que mudou no `SarakAuthScreen`.
9. `npm run build` · `npm run guide` · `npm run catalog` · `npm run dev-kit` · `npx tsc --noEmit` ·
   `npx vitest run` · `npm run audit` → verdes; `npm run zero-brand:check` verde.

# 6. Critérios de aceite

- [ ] `src/shared/services/api.ts` não existe; `git grep -n "axios\|baseURL\|/api'" -- src` → vazio; e
      `git grep -nE "\bfetch\(|XMLHttpRequest|'/api" -- src ':!**/__tests__/**'` → vazio *(emenda de 2026-10-06)*.
- [ ] Nenhum template tem prop `endpoint`; cada um tem `data` ou `load`; `SarakForm` tem `onSubmit` (testes).
- [ ] `git grep -n -E "\b(Master|Neural|Secure)\b|Sovereign SSO|noise\.png|tentativas" -- src/components ':!**/__tests__/**'`
      → vazio. *(Emenda de 2026-10-06: a forma anterior, com `-i`, casava nomes de token como `textColorMaster`.)*
- [ ] Teste: `SarakStats` com `{ total: 0 }` renderiza `0`; com `{ total: 1500 }` renderiza `1500`.
- [ ] Teste: `SarakTable` sem `onAction` não renderiza botão de ação.
- [ ] Teste: candlestick com `{ open, high, low, close }` desenha esses valores.
- [ ] Teste por átomo do item 8: o texto muda com o idioma.
- [ ] O gate de acoplamento acusa a fixture e passa sobre a base.
- [ ] `docs/migracoes.md` tem a nota; `npm run zero-brand:check`, `build`, `tsc`, `vitest` verdes; `audit`
      sem regressão.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` novo — o `auditor_authcoupling` (R32) é alargado; a genericidade dos textos é teste de
módulo.

- `git status` + `git diff --stat` → só §3.1.
- Os `grep` dos critérios 1 e 3.
- Mutação do gate com a fixture → acusa.
- Rodar isolados os testes dos critérios 2, 4, 5, 6 e 7; `npx vitest run` inteiro.
- `node gates/scripts/contrato/check-minor-no-removal.mjs` → o que saiu bate com a nota.
- `npm run build` · `npm run zero-brand:check` · `npx tsc --noEmit` · `npm run audit`.

# 8. Destino da síntese

**Destino:** `arquitetura/03-superficie-publica.md + specs/10-seguranca-e-acessibilidade.md + specs/08-identidade-do-host-e-zero-marca.md + specs/00-regras-e-invariantes.md`

- **`03-superficie-publica`** §6.3 reescrita — *o dado vem do host*: `data` ou `load`; nenhum template faz
  rede; `SarakForm` entrega por `onSubmit`.
- **`10-seguranca`** §3.1 e §3.2 — a lib não tem cliente HTTP; a divergência sobre o gate da R32 corrigida
  (o gate existe e o que ele cobre).
- **`08-identidade-do-host`** — o template de autenticação não carrega marca nem conceito de produto.
- **`00-regras`** R32 — estado e vão atualizados; R12 — o que o gate de marca passou a ver, se mudou.

> A síntese é ato do **revisor** ([[00-prompt-revisor]]), e o gatilho é do **usuário**: o revisor propõe ao
> aprovar e espera autorização. Esta seção apenas a prepara.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

### Execução 2026-10-06 — executor

**Snapshot inicial do worktree, antes da primeira edição:**

```text
 M .githooks/pre-commit
 M browser-tests/cromo-css-real.spec.ts
 M browser-tests/fixtures/harness-entry.tsx
 M dist/BUILD_INFO.json
 D dist/CustomizationPanelImpl-TD5QJZKF.js
 D dist/SarakChartEngine-ZKWQD5BS.js
 D dist/SarakChatEngine-7GJL3SMW.js
 D dist/SarakDataTableImpl-5LQB3X5U.js
 D dist/SarakFlowEngine-QMGFMJII.js
 D dist/SarakMarkdownRendererImpl-6XUKS42C.js
 D dist/SarakPDFViewerImpl-XB6C2TYB.js
 D dist/chunk-3CYFDN7B.js
 D dist/chunk-CADFV2YB.js
 D dist/chunk-GOWKBNQR.js
 D dist/chunk-RMINFRSJ.js
 D dist/chunk-SYLK4T4N.js
 D dist/chunk-VNV4TOKQ.js
 M dist/index.cjs
 M dist/index.d.cts
 M dist/index.d.ts
 M dist/index.js
 M dist/sarak-scoped.css
 M dist/sarak.css
 M src/buildInfo.ts
 M src/core/Design/catalog/partitions/body_size.json
 M src/core/Design/catalog/partitions/cards_engine.json
 M src/core/Design/catalog/partitions/colors_and_atmosphere.json
 M src/core/Design/catalog/partitions/components_base.json
 M src/core/Design/catalog/partitions/mode.json
 M src/core/Design/catalog/partitions/navigation_style.json
 M src/core/Design/catalog/partitions/typography.json
 M src/features/DesignEngine/Main/ThemeCustomizationTab.tsx
 M src/features/DesignEngine/Main/__tests__/ThemeCustomizationTab.test.tsx
 M src/features/DesignEngine/Main/components/ThemePillarsList.tsx
 M src/features/DesignEngine/Main/components/ThemeSidebarContent.tsx
 M src/features/DesignEngine/Main/components/ThemeSidebarHeader.tsx
 M src/features/DesignEngine/Main/components/__tests__/ThemePillarsList.test.tsx
 M src/features/DesignEngine/Main/components/__tests__/ThemeSidebarContent.test.tsx
 M src/features/DesignEngine/Main/components/__tests__/ThemeSidebarHeader.test.tsx
 M src/features/DesignEngine/Main/hooks/__tests__/usePreviewUIState.test.ts
 M src/features/DesignEngine/Main/hooks/__tests__/useThemeCustomizationData.test.ts
 M src/features/DesignEngine/Main/hooks/usePreviewUIState.ts
 M src/features/DesignEngine/Main/hooks/useThemeCustomizationData.ts
?? .claude/settings.local.json
?? dist/CustomizationPanelImpl-SWKIUO45.js
?? dist/SarakChartEngine-QYOJXLDH.js
?? dist/SarakChatEngine-LNELOEXK.js
?? dist/SarakDataTableImpl-LJADJFDV.js
?? dist/SarakFlowEngine-7O5GH5VE.js
?? dist/SarakMarkdownRendererImpl-6ZU6LZTQ.js
?? dist/SarakPDFViewerImpl-DAPI56Z4.js
?? dist/chunk-3INA6FPW.js
?? dist/chunk-4HYDPXYQ.js
?? dist/chunk-POZ4YM4H.js
?? dist/chunk-U64V3LQX.js
?? dist/chunk-YILVDEH2.js
?? dist/chunk-Z3ADDYF3.js
?? src/features/DesignEngine/Main/components/ThemeImpactList.tsx
```

**Implementado:** removido o cliente interno e os `endpoint` dos templates/hook no escopo; dados, carregamento,
salvamento e ações vêm do host por props/callbacks. A autenticação passou a ser login-only por padrão, com
cadastro/MFA/social opt-in, rótulos traduzidos e sem marca/fluxos de produto. Os átomos de feedback usam o
catálogo; tabela, estatísticas e gráficos não inventam domínio nem dados. O gate R32 cobre `src/`, axios saiu
dos peers, e a nota MAJOR foi acrescentada dentro de `## 8.0.0 — um cromo por aplicação`. Artefatos públicos
foram regenerados pelos scripts oficiais.

**Verificações:** `npx tsc --noEmit` passou; testes focados passaram (52 arquivos/169 testes, depois 4/16 e
1/7 após ajustes). `npm run zero-brand:check` passou. `npm run build` passou integralmente após regenerar
catalog, guide e dev-kit. A suíte global `npx vitest run` não produziu relatório após vários minutos repetindo
avisos de CSS; foi interrompida e fica registrada como incompleta, sem ser tratada como falha de arquivo
específico.

**Pendências de auditoria e escopo:** `npm run audit` termina com código 1 por `--x` (o auditor não informa
arquivo), `ThemeImpactList.tsx` sem teste na execução paralela plan-99 e `<input>` nativo em
`SarakMultiSelect.tsx`/`SarakUploader.tsx` fora desta plan. As violações que a primeira auditoria apontou nos
arquivos desta execução foram corrigidas; o segundo audit não aponta mais hardcode nem violação de Clean Code
nos templates alterados. A busca restrita aos templates ainda encontra endpoints em `SarakChat` e texto
Sovereign em `SarakCoreCard`/snapshot, fora do escopo; não foram alterados. Nenhum arquivo de plan-99, plan-89
ou `.githooks/pre-commit` foi modificado por esta execução.


## Resumo da execução — 2026-10-06 — correção da reprovação

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
Fotografia da execução original, preservada para cobrir a execução inteira:

```text
 M .githooks/pre-commit
 M browser-tests/cromo-css-real.spec.ts
 M browser-tests/fixtures/harness-entry.tsx
 M dist/BUILD_INFO.json
 D dist/CustomizationPanelImpl-TD5QJZKF.js
 D dist/SarakChartEngine-ZKWQD5BS.js
 D dist/SarakChatEngine-7GJL3SMW.js
 D dist/SarakDataTableImpl-5LQB3X5U.js
 D dist/SarakFlowEngine-QMGFMJII.js
 D dist/SarakMarkdownRendererImpl-6XUKS42C.js
 D dist/SarakPDFViewerImpl-XB6C2TYB.js
 D dist/chunk-3CYFDN7B.js
 D dist/chunk-CADFV2YB.js
 D dist/chunk-GOWKBNQR.js
 D dist/chunk-RMINFRSJ.js
 D dist/chunk-SYLK4T4N.js
 D dist/chunk-VNV4TOKQ.js
 M dist/index.cjs
 M dist/index.d.cts
 M dist/index.d.ts
 M dist/index.js
 M dist/sarak-scoped.css
 M dist/sarak.css
 M src/buildInfo.ts
 M src/core/Design/catalog/partitions/body_size.json
 M src/core/Design/catalog/partitions/cards_engine.json
 M src/core/Design/catalog/partitions/colors_and_atmosphere.json
 M src/core/Design/catalog/partitions/components_base.json
 M src/core/Design/catalog/partitions/mode.json
 M src/core/Design/catalog/partitions/navigation_style.json
 M src/core/Design/catalog/partitions/typography.json
 M src/features/DesignEngine/Main/ThemeCustomizationTab.tsx
 M src/features/DesignEngine/Main/__tests__/ThemeCustomizationTab.test.tsx
 M src/features/DesignEngine/Main/components/ThemePillarsList.tsx
 M src/features/DesignEngine/Main/components/ThemeSidebarContent.tsx
 M src/features/DesignEngine/Main/components/ThemeSidebarHeader.tsx
 M src/features/DesignEngine/Main/components/__tests__/ThemePillarsList.test.tsx
 M src/features/DesignEngine/Main/components/__tests__/ThemeSidebarContent.test.tsx
 M src/features/DesignEngine/Main/components/__tests__/ThemeSidebarHeader.test.tsx
 M src/features/DesignEngine/Main/hooks/__tests__/usePreviewUIState.test.ts
 M src/features/DesignEngine/Main/hooks/__tests__/useThemeCustomizationData.test.ts
 M src/features/DesignEngine/Main/hooks/usePreviewUIState.ts
 M src/features/DesignEngine/Main/hooks/useThemeCustomizationData.ts
?? .claude/settings.local.json
?? dist/CustomizationPanelImpl-SWKIUO45.js
?? dist/SarakChartEngine-QYOJXLDH.js
?? dist/SarakChatEngine-LNELOEXK.js
?? dist/SarakDataTableImpl-LJADJFDV.js
?? dist/SarakFlowEngine-7O5GH5VE.js
?? dist/SarakMarkdownRendererImpl-6ZU6LZTQ.js
?? dist/SarakPDFViewerImpl-DAPI56Z4.js
?? dist/chunk-3INA6FPW.js
?? dist/chunk-4HYDPXYQ.js
?? dist/chunk-POZ4YM4H.js
?? dist/chunk-U64V3LQX.js
?? dist/chunk-YILVDEH2.js
?? dist/chunk-Z3ADDYF3.js
?? src/features/DesignEngine/Main/components/ThemeImpactList.tsx
```

**O que foi feito**
- Removi `endpoint` e `modelsEndpoint` de `SarakChatProps` e passei `onSend`/`loadModels` ao hook — `src/components/atomic/Templates/SarakChat.tsx:17-22,32-37` — o host passa a controlar o envio e a lista de modelos.
- Defini o contrato público do envio e do modelo — `src/components/atomic/Templates/Chat/types.ts:1-25` — incluindo callback para tokens incrementais.
- Troquei os dois `fetch` por callbacks do host; loader ausente mantém a lista vazia, e rejeição do envio mantém a mensagem de erro e limpa `isLoading` — `src/components/atomic/Templates/Chat/useSarakChat.ts:11,34-53,90-119,120-131`.
- Acrescentei testes de loader ausente, carregamento de modelos, streaming e rejeição — `src/components/atomic/Templates/Chat/__tests__/useSarakChat.test.ts:19-67`.
- Acrescentei a migração do chat na subseção MAJOR existente — `docs/migracoes.md:128-130` — sem criar versão.
- Corrigi a execução anterior e registrei seus arquivos, critérios e evidências neste bloco, sem reescrever o resumo anterior — `specs/plan/plan-96-templates-sem-dominio-embutido.md:246-379`.

**Arquivos alterados**
| Arquivo(s) | Natureza | O que mudou |
|---|---|---|
| `src/shared/services/api.ts` | removido | Retirado o cliente HTTP interno. |
| `package.json`; `package-lock.json` | alterados | Removido `axios` dos peers e atualizado o lockfile. |
| `src/components/atomic/Templates/hooks/useCardGridState.ts`; `useChartData.ts`; `useFormData.ts`; `useManagementGrid.ts`; `useSarakStatsData.ts`; `useSarakTableData.ts` | alterados | Dados e operações passam a vir do host; erros e carregamento permanecem no template. |
| `src/components/atomic/Templates/SarakCardGrid.tsx`; `SarakChart.tsx`; `SarakForm.tsx`; `SarakManagementGrid.tsx`; `SarakStats.tsx`; `SarakTable.tsx`; `SarakTableCards.tsx`; `SarakTableProps.ts`; `SarakTableErrorState.tsx` | alterados/criado | Removidas rotas e ações inventadas; dados, callbacks, erros e rótulos são genéricos. |
| `src/components/atomic/Templates/SarakAuthScreen.tsx`; `components/AuthForm.tsx`; `components/AuthFormFields.tsx`; `components/AuthHero.tsx`; `components/AuthSocialLogin.tsx`; `src/components/atomic/Buttons/SarakSocialButton.tsx` | alterados | Autenticação login-only por padrão, recursos opt-in, rótulos do catálogo e sem produto embutido. |
| `src/components/atomic/Templates/Chat/types.ts`; `SarakChat.tsx`; `Chat/useSarakChat.ts` | alterados | API do chat por `onSend`/`loadModels`, sem `fetch` nem rotas internas. |
| `src/components/atomic/Templates/components/ManagementGroupCard.tsx` | alterado | Valores e ações permanecem genéricos e dependem do host. |
| `src/components/atomic/Feedback/SarakAlert.tsx`; `SarakDataEmpty.tsx`; `SarakSpinner.tsx`; `SarakToast.tsx` | alterados | Textos acessíveis e estados vazios usam o catálogo. |
| `src/core/i18n/catalog.ts`; `catalogEntries.part4.ts`; `catalogEntries.part5.ts` | alterado/criados | Acrescentadas traduções para dados, formulários, feedback, autenticação e ações de gestão. |
| `src/components/atomic/Templates/__tests__/SarakAuthScreen.test.tsx`; `SarakCardGrid.data.test.tsx`; `SarakCardGrid.test.tsx`; `SarakChart.test.tsx`; `SarakForm.test.tsx`; `SarakManagementGrid.test.tsx`; `SarakStats.test.tsx`; `SarakTable.data.test.tsx`; `SarakTable.responsive.test.tsx`; `SarakTable.test.tsx`; `SarakTableCards.test.tsx`; `__snapshots__/SarakChart.test.tsx.snap` | alterados | Cobertos contratos do host, dados verdadeiros, ausência de ações inventadas e comportamento genérico. |
| `src/components/atomic/Templates/__tests__/SarakTableErrorState.test.tsx`; `Chat/__tests__/useSarakChat.test.ts` | criados/alterado | Testados erros/retry, loader ausente, modelos do host, streaming e rejeição de envio. |
| `src/components/atomic/Templates/hooks/__tests__/useCardGridState.test.ts`; `useChartData.test.ts`; `useFormData.test.ts`; `useManagementGrid.test.ts`; `useSarakStatsData.test.ts`; `useSarakTableData.test.ts` | alterados | Testadas as funções de dados e submissão fornecidas pelo host. |
| `src/components/atomic/Buttons/__tests__/SarakSocialButton.test.tsx`; `src/components/atomic/Feedback/__tests__/SarakAlert.test.tsx`; `SarakDataEmpty.test.tsx`; `SarakSpinner.test.tsx`; `SarakToast.test.tsx` | alterados | Testados rótulos, acessibilidade e troca de idioma. |
| `src/components/engines/charts/SubEngines/builders/statisticalCharts.ts`; `__tests__/builders.characterization.test.ts`; `__tests__/__snapshots__/builders.characterization.test.ts.snap` | alterados | Candlestick e boxplot recebem valores reais; sem dado, série vazia. |
| `gates/scripts/audit/auditor_authcoupling.mjs`; `gates/scripts/audit/__tests__/auditor_authcoupling.test.mjs` | alterados | Gate R32 verifica `src/` e cobre fixture de rota de autenticação. |
| `docs/migracoes.md` | alterado | Adicionadas notas MAJOR dos templates e do chat dentro de `8.0.0`. |
| `docs/component-catalog.json`; `docs/component-catalog.md`; `sarak-ui/GUIA-FRONTEND.md`; `sarak-ui/START-HERE.md`; `sarak-ui/VERSION`; `sarak-ui/catalog.json`; `sarak-ui/docs/migracoes.md` | regenerados | Saídas dos comandos `catalog` e `guide`. |
| `src/core/Provider/buildInfo.ts`; `dist/BUILD_INFO.json`; `dist/index.cjs`; `dist/index.d.cts`; `dist/index.d.ts`; `dist/index.js`; `dist/sarak-scoped.css`; `dist/sarak.css`; `dist/styles/_atmosphere.css`; `dist/styles/_surfaces.css`; bundles `dist/CustomizationPanelImpl-WZ7GZZU5.js`, `SarakChartEngine-WAE3XLGP.js`, `SarakChatEngine-AQOHUTB3.js`, `SarakDataTableImpl-4BFSRLJS.js`, `SarakFlowEngine-QU3HDZ4R.js`, `SarakMarkdownRendererImpl-RCSZK7VT.js`, `SarakPDFViewerImpl-VRZL3XIE.js` e `dist/chunk-3VIZEMMC.js`, `chunk-DHKA6EP4.js`, `chunk-KG74GCLT.js`, `chunk-KY6P224Q.js`, `chunk-NNZE66YG.js`, `chunk-XDRIPYC5.js` | gerados | Atualizados pelo build; bundles hash antigos foram removidos pelo próprio comando. |
| `specs/plan/plan-96-templates-sem-dominio-embutido.md` | alterado | Status e dois blocos append-only de execução; veredito preservado. |

**Verificações executadas**
- `npx tsc --noEmit` → exit 0 após as alterações do chat.
- `npx vitest run 'src/components/atomic/Templates/Chat' 'src/components/atomic/Templates/__tests__/SarakChat.test.tsx'` → 7 arquivos, 10 testes passaram.
- `npx vitest run --exclude 'src/features/DesignEngine/Main/components/__tests__/**' --exclude 'browser-tests/**'` → interrompido após mais de quatro minutos sem resumo, repetindo avisos de CSS; incompleto.
- `git grep -nE "axios|baseURL|/api'" -- src ':!**/__tests__/**'` → 0 ocorrências; `src/shared/services/api.ts` ausente.
- `git grep -nE "\bfetch\(|XMLHttpRequest|'/api" -- src ':!**/__tests__/**'` → 0 ocorrências.
- `git grep -nE "endpoint|modelsEndpoint" -- src/components/atomic/Templates ':!**/__tests__/**'` → 0 ocorrências.
- `git grep -nE '\b(Master|Neural|Secure)\b|Sovereign SSO|noise\.png|tentativas' -- src/components ':!**/__tests__/**'` → 0 ocorrências.
- `npm run catalog` → 96 componentes; `npm run guide` → 99 componentes, 430 tokens, 117 ícones; `npm run dev-kit` → 96 componentes públicos, 430 tokens, 30 gates.
- `npm run build` → exit 0; catálogo/guide/barrel/marca, tipos públicos, prefixo, porta de ícones, kit-names e CSS passaram. Antes do build, `Get-CimInstance Win32_Process` retornou contagem zero para `vitest`/`tsup`.
- `npm run audit` não foi repetido nesta correção. A execução anterior terminou com falhas fora destes achados; detalhes estão no resumo executor anterior e no veredito.

**Critérios de aceite**
- [x] 1 — módulo removido e buscas de cliente, `fetch`, `XMLHttpRequest` e `/api` sem ocorrências; evidência: saídas de `git grep` acima.
- [x] 2 — nenhum `endpoint`/`modelsEndpoint` em templates; evidência: busca com 0 ocorrências e testes de host dos templates executados na rodada original.
- [x] 3 — busca corrigida por palavra completa vazia em `src/components`; evidência: saída acima.
- [x] 4 — `SarakStats` preserva `0` e `1500`; evidência: `src/components/atomic/Templates/__tests__/SarakStats.test.tsx:28-31` e suíte focada anterior (52 arquivos, 169 testes).
- [x] 5 — tabela não inventa botão de ação; evidência: `src/components/atomic/Templates/__tests__/SarakTable.data.test.tsx:55-63` e suíte focada anterior (52 arquivos, 169 testes).
- [x] 6 — candlestick mapeia OHLC do host e série sem dados fica vazia; evidência: `src/components/engines/charts/SubEngines/builders/__tests__/builders.characterization.test.ts:55-60` e suíte focada anterior (52 arquivos, 169 testes).
- [x] 7 — átomos mudam o texto com `config.language: 'en'`; evidência: testes `SarakAlert`, `SarakDataEmpty`, `SarakSpinner` e `SarakToast` executados na suíte focada anterior (52 arquivos, 169 testes).
- [x] 8a — nota MAJOR e build, TypeScript e zero-brand verdes; evidência: `docs/migracoes.md:112-130`, build final exit 0 e `zero-brand:check` com 412 arquivos.
- [ ] 8b — suíte Vitest integral e audit verdes após esta correção; motivo: a suíte filtrada não concluiu, e o audit anterior apontou ocorrências fora dos achados; o veredito registra que o revisor obteve 390 arquivos/2197 testes antes desta correção.

**Decisões e suposições**
- `onSend` recebe mensagem, anexos, modo, modelo selecionado e limite de tokens; o host trata o transporte e chama `onToken` para manter a renderização incremental.
- `loadModels` é opcional; sem ele, a lista fica vazia e nenhuma requisição é iniciada.
- O teste amplo excluiu `src/features/DesignEngine/Main/components/__tests__/**` e `browser-tests/**` para respeitar as duas execuções concorrentes.

**Achados fora do escopo (não corrigidos)**
- A última auditoria registrada antes desta correção apontou `ThemeImpactList.tsx` sem teste (plan-99), dois inputs nativos em `SarakMultiSelect.tsx`/`SarakUploader.tsx` e uma variável `--x` sem caminho no relatório. Não foram alterados nem lidos os arquivos concorrentes.

**Pendências / riscos**
- A suíte Vitest ampla não concluiu após a correção do chat; os 7 arquivos/10 testes do chat passaram.
- `npm run audit` não foi reexecutado; as falhas externas da rodada anterior permanecem sem confirmação de estado atual.
---

# 10. Veredito

## Veredito — 2026-10-06 — 🔴 Reprovado

**Antes de gravar:** a §10 foi relida no disco e estava vazia.

**O que está certo, e foi verificado por mim, na árvore integrada:**
- **Critério 1:** `src/shared/services/api.ts` não existe; `git grep -n "axios\|baseURL\|/api'" -- src` → vazio;
  `axios` saiu dos peers do `package.json`.
- **Critério 3:** vazio na forma corrigida, sem nenhuma palavra de produto renderizada. A forma antiga casava
  `textColorMaster` e comentários (defeito da plan, emendado).
- **Testes:** há caso para cada template com `data` sem chamada, `load` que carrega e `load` que rejeita
  (`SarakForm` envia por `onSubmit`); `SarakStats` preserva `0` e valores grandes; `SarakTable` não inventa
  botão de ação; o candlestick usa o OHLC do host e o boxplot não fabrica dado; cada átomo do item 8 traduz pelo
  idioma ativo; o `auditor_authcoupling` acusa a fixture `api.get('/auth/me')` em `src/core` (7/7) e passa sobre
  a base.
- **Nota MAJOR:** subseção `###` dentro de `## 8.0.0`.
- **`npx vitest run`:** **390 arquivos, 2197 testes verdes**. A suíte que o executor viu travar não travou aqui.
- `npx tsc --noEmit` → 0. Verdes: `catalog`, `guide`, `dev-kit`, `barrel`, `zero-brand`, `kit-names`,
  `token-types`, `icon-port`, `class-merge`, `gate-limits`, `trail-citation`, `section-pointers`, `build-info`
  e `deep-import`.
- `check-audit-baseline --with-tsc`: a única regressão (`auditor_coverage.orfaos` 0 → 1) é o `ThemeImpactList.tsx`,
  da `plan-99`, reaberta por isso. Não é desta.

**Achados — a correção é exclusivamente estes:**

1. **O `SarakChat` ainda busca em URL**, contra o objetivo (§1: *"nenhum template da lib busca em URL"*):
   `src/components/atomic/Templates/Chat/useSarakChat.ts:32` (`fetch(`/api${modelsEndpoint}`)`) e `:114`
   (`fetch(`/api${endpoint}`)`). Ele ficou fora do inventário da plan, que contou só quem importava o `api.ts`.
   A §3.1 foi **emendada nesta data** para incluí-lo. Faça como nos outros templates: `endpoint` e
   `modelsEndpoint` saem, e o envio e a lista de modelos vêm de funções do host. Mantenha o estado de
   carregamento e erro, com teste para `send` que rejeita e para lista de modelos ausente. Acrescente o chat à
   nota de `docs/migracoes.md`. Critério 1 emendado: o `grep` de `fetch(` e `'/api` em `src/` fica vazio.
2. **O resumo não segue a §5 do prompt do executor.** Falta a tabela de arquivos alterados, faltam os
   critérios de aceite um a um com a evidência (`arquivo:linha` ou saída), e as verificações vêm sem números
   ("testes focados passaram (52 arquivos/169 testes, depois 4/16 e 1/7)" não diz quais). Escreva um bloco
   novo (append-only), no formato da §5, cobrindo a execução inteira e esta correção.

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-06 (correção 1) — 🟢 Aprovado

**Antes de gravar:** a §10 foi relida no disco: só o bloco de reprovação desta data, escrito por este revisor.

**Achado 1 (o `SarakChat` buscava em URL) — fechou.**
- `SarakChat` recebe `onSend` e `loadModels` do host (`Chat/types.ts`: `SarakChatOnSend`, `SarakChatModelLoader`).
- Medido por mim, com resultado vazio:
  - `git grep -nE "\bfetch\(|XMLHttpRequest|'/api|axios|baseURL" -- src ':!**/__tests__/**'`;
  - `endpoint|modelsEndpoint` em `src/components`.
- `useSarakChat.test.ts` cobre loader ausente (nenhuma requisição), carga de modelos, envio com tokens em fluxo e
  envio rejeitado (erro visível, `isLoading` limpo).
- A nota do chat está em `docs/migracoes.md`, dentro da subseção da 8.0.0.

**Achado 2 (formato do resumo) — fechou.** O bloco novo traz a tabela de arquivos da execução inteira, os
critérios um a um com `arquivo:linha` e as verificações com números.

**Verificação integrada**, rodada por mim com as plans 96 e 99 entregues e a 89 (lote 2) em correção na mesma
árvore:
- `npx tsc --noEmit` → 0;
- `check-audit-baseline --with-tsc` → igual ao baseline;
- critério 3 (forma emendada) → vazio;
- `npx vitest run` → **392 arquivos** (todos os que o `vitest list --filesOnly` descobre), **2207 de 2209**.

As **duas falhas são da `plan-89`, lote 2**, e não desta plan:
- `check-chrome-token-parity.test.mjs` ainda espera `layoutDensity` e `maxContentWidth` em `ORPHAN_TOKENS`;
- o snapshot de `PreviewCanvas.test.tsx` mudou só pelo estilo novo da região de conteúdo do cromo
  (`width: 100%; max-width: 1440px; margin-inline: auto`).

Nenhuma falha toca arquivo desta plan.

**Conclusão:** a plan está concluída. Commit **por caminho**. A síntese vai para `arquitetura/03-superficie-publica.md`
(§6.3), `specs/10-seguranca-e-acessibilidade.md` (§3.1, §3.2), `specs/08-identidade-do-host-e-zero-marca.md` e
`specs/00-regras-e-invariantes.md` (R32), com a autorização do dono. Mais um destino que a plan não declarou e
o diff exige: `specs/13-instalacao-e-atualizacao.md` §2.3, onde `axios` ainda consta entre as peers obrigatórias.

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
