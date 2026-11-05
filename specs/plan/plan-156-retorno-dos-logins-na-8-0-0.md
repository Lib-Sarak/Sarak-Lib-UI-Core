---
tipo: "plan"
titulo: "Atender o retorno dos logins na 8.0.0"
objetivo: "Fazer a tela de autenticacao ser anunciada pelo leitor de tela, as notas de versao listarem todo token acrescentado ou removido, e o importador testar o painel e o overlay por alvos estaveis e documentados"
dominio: "Templates de autenticação / Versionamento / Kit do consumidor"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "acessibilidade", "migracoes", "tokens", "kit-do-consumidor", "testes-do-importador"]
relacionados: ["[[10-seguranca-e-acessibilidade]]", "[[03-versionamento-e-release]]", "[[12-kit-do-consumidor]]", "[[06-painel-de-customizacao-e-preview]]", "[[11-testes-e-cobertura]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/10-seguranca-e-acessibilidade.md + specs/03-versionamento-e-release.md + specs/12-kit-do-consumidor.md"
---

# 1. Objetivo

Depois desta plan, o importador:
- ouve, no leitor de tela, o nome de cada campo do `SarakAuthScreen`, o estado do botão de senha e o erro de credencial;
- lê em `docs/migracoes.md`, para cada versão, a lista exata dos tokens acrescentados, removidos ou com valor novo;
- testa o overlay de confirmação, a galeria de temas e os gestos do painel por alvos estáveis e documentados, sem depender do texto
  dos botões nem receber o aviso de CSS em todo teste jsdom.

# 2. Contexto

**Origem:** retorno de dois importadores (`Sarak-Lib-Login\login-completo` e `login-provedores`, 2026-11-05). Os dois publicam a `1.0.0`
deles com a `v8.0.0`. Nada aqui bloqueia essa publicação: o que esta plan entregar chega numa troca de tag. Os itens trazem o número
do retorno (R1…R12).

**O que o revisor mediu no código (2026-11-05), para o executor não repetir:**

| Item | Pedido | Estado medido |
|---|---|---|
| R1 | A11y do `SarakAuthScreen` | **Confirmado.** Em `AuthFormFields.tsx`, os três `<label>` (E-mail, Senha, MFA) não têm `htmlFor`, e os `SarakInput` não recebem `id`. O `SarakIconButton` do olho não tem `aria-label`. O catálogo de i18n não tem chave para "Mostrar senha"/"Ocultar senha". Em `AuthForm.tsx:109-122`, o bloco de `error` é um `div` sem `role` nem `aria-live`. Pedido já na rc.3 e não entregue. |
| R2 | Seção de tokens nas notas de versão | **Confirmado.** As entradas da 8.0.0 em `docs/migracoes.md` dizem "nenhum token acrescentado" por plan, mas a 8.0.0, vista desde a `v7.0.0`, acrescentou tokens (`sidebarTone`, `topbarTone`, `sidebarLogoPlacement`, `sidebarResizable`, `colorPalette`, `subtitleColor`, `emphasisColor`, entre outros). Nenhum gate confere a lista de tokens nas notas: o `migration-anchor:check` só confere a âncora de MAJOR, e o `minor-no-removal:check` só confere nomes do barril e ícones. |
| R3 | Versão da lib legível | **Já existe:** `SARAK_BUILD_INFO.libVersion`, exportado do barril (`src/index.ts:48`). Falta documentar. O `./package.json` não entra no `exports` (ver §3.2). |
| R4 | `useOverlay().confirm` com alvo de teste | **Confirmado.** `SarakConfirmOptions` (`src/components/atomic/Modals/SarakOverlayProvider.tsx:27-40`) tem `confirmLabel`, mas nenhum `data-testid`. |
| R5 | `data-theme-id` nos cartões da galeria; alvo do `SarakRadio` | **Confirmado.** Nenhum `data-theme-id` em `src/`. |
| R6 | Galeria não fecha ao escolher; dois "Fechar galeria" | **Não procede na 8.0.0** (corrigido pelo revisor em 2026-11-05): a galeria saiu do painel na 8.0.0 (`docs/migracoes.md`, "não encontra mais o botão **Abrir galeria**"); os temas são o grupo da decisão **Tema**. O único "Fechar galeria" do pacote é o do `SarakLightbox`. A documentar como tal no lote 4. |
| R7 | Salvar tema nomeado também ativa e persiste | A documentar. O caminho está em `useThemePersistenceHandlers`. |
| R8 | `SarakGrid` em pilha vertical | A documentar (JSDoc e guia). |
| R9 | Guia multi-tenant, de sem tenant para com tenant | A documentar. |
| R10 | Gestos do painel com rótulo e `data-testid` estáveis | **Confirmado.** Os únicos `data-testid` do painel (`src/features/DesignEngine`) são de amostra e de prévia. Nenhum está em `Abrir galeria`, `Aplicar (N)`, `Salvar tema`, `Novo tema`, `Apagar` ou `Exportar JSON`. |
| R11 | Aviso "[Sarak] CSS não detectado" em teste jsdom | **Confirmado.** `useSarakStylesheetGuard.ts:55-62` dá `console.error` sempre que `NODE_ENV !== 'production'` e a variável de CSS está vazia, como sempre acontece no jsdom. O `filterSarakTestConsoleLog` (`src/testing.ts:67`) filtra só o `Could not parse CSS stylesheet`. |
| R12 | Peers opcionais no build | **Já atendido, sem trabalho.** `dist/index.js` não tem import estático de `echarts`, `recharts`, `reactflow` nem `react-syntax-highlighter` (0 ocorrências). O `npm run build` termina com `test:optional-peers`, que monta um importador sem esses peers. |

**Nível da versão:** esta plan acrescenta props (`confirmTestId`, `cancelTestId`), chaves de i18n e atributos. Pelo critério de
[[03-versionamento-e-release]], o nível é **MINOR**, não patch. O nível é decidido na emissão, não aqui.

**Lotes.** A plan tem quatro lotes, cada um com veredito próprio, na ordem abaixo. O lote 1 é o essencial do retorno.

# 3. Escopo

## 3.1 Dentro

**Lote 1 — R1, acessibilidade do `SarakAuthScreen`**
- `src/components/atomic/Templates/components/AuthFormFields.tsx`: liga cada `<label>` ao seu campo e dá ao olho o nome traduzido,
  que alterna.
- `src/components/atomic/Templates/components/AuthForm.tsx`: o bloco de erro é anunciado.
- `src/core/i18n/` (o arquivo de catálogo onde moram as chaves `auth*`): duas chaves novas, nos seis idiomas.
- `src/components/atomic/Templates/__tests__/SarakAuthScreen.test.tsx`: os casos do critério de pronto.

**Lote 2 — R2, tokens nas notas de versão**
- Um script novo em `gates/scripts/contrato/`, que compara os tokens do schema (`src/core/Design/schema/`) entre a última tag `vX.Y.Z`
  e a árvore atual: acrescentados, removidos e com tipo ou gramática de valor novo.
- `package.json`: o script entra no `version`, ao lado de `migration-anchor:check` e `minor-no-removal:check`.
- `docs/migracoes.md`: uma seção nova, "8.0.0 — tokens acrescentados, removidos e com valor novo desde a 7.0.0", com a lista que o
  script produz. Cada linha traz o nome, o tipo e, quando houver, a gramática (`fluid` em `maxContentWidth`, a de `colorPalette`).
- O teste do script, no padrão dos demais gates de `gates/scripts/contrato/`.

**Lote 3 — R4, R5 (`data-theme-id`), R10 e R11: alvos estáveis para o teste do importador**
- `src/components/atomic/Modals/SarakOverlayProvider.tsx` e o componente que desenha a confirmação: `confirmTestId` e `cancelTestId`
  opcionais em `SarakConfirmOptions`, aplicados como `data-testid` nos dois botões.
- O componente que desenha os cartões de tema na galeria (procure a partir de `src/features/DesignEngine/Main/TemplatesTab.tsx`):
  `data-theme-id="<id do tema>"` em cada cartão.
- Os componentes do painel com os gestos de R10: `data-testid` estável em cada um, com os nomes da tabela do passo 9.
- `src/testing.ts`: `filterSarakTestConsoleLog` passa a filtrar também o aviso "[Sarak] CSS não detectado", e só ele.
- Os testes de cada mudança, ao lado dos testes existentes de cada componente.

**Lote 4 — R3, R5 (alvo do `SarakRadio`), R6, R7, R8, R9 e R10: documentação do kit**
- `sarak-ui/GUIA-FRONTEND.md` (fonte do guia, editada pelo caminho que o `npm run guide` usa; confira em `scripts/` qual é a fonte
  antes de editar) e `docs/persistencia-de-tema.md`.
- O JSDoc de `SarakGrid`.
- A skill `ui-integra-consumidor` (`.agents/skills/ui-integra-consumidor/`), só onde ela aponta o guia.

## 3.2 Fora
- **`./package.json` no `exports` (R3).** A versão já é legível por `SARAK_BUILD_INFO.libVersion`. Expor o `package.json` daria ao
  importador um segundo caminho para o mesmo dado. Só a documentação entra.
- **`sarakGetBuildInfo()`.** Mesma razão: `SARAK_BUILD_INFO` já é a constante.
- **Mudar o comportamento da galeria** (fechar ao escolher) ou **remover um dos dois "Fechar galeria"**. O pedido R6 é documentar.
- **Silenciar o aviso de CSS dentro da lib** (por exemplo, por `NODE_ENV === 'test'`). Ele é útil no teste da própria lib e do
  importador que monta o CSS. A supressão é opt-in, pelo filtro do subpath `testing`.
- **Reescrever entradas antigas de `docs/migracoes.md`.** A seção nova do lote 2 corrige a informação; as entradas existentes ficam
  como estão.
- `dist/`, `sarak-ui/` gerado, `sarak-dev/`, `docs/component-catalog.*`, `src/core/Provider/generated/`: são gerados. Rode os
  geradores; não edite à mão.
- Qualquer mudança visual no `SarakAuthScreen`.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contexto | `specs/00-contexto.md` | sempre |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | regra de a11y que o lote 1 cumpre |
| Spec fixa | `specs/specs/03-versionamento-e-release.md` §5 e a tabela de gates do `version` | onde o lote 2 se encaixa e o que os gates de hoje não veem |
| Spec fixa | `specs/specs/12-kit-do-consumidor.md` | o que o kit promete ao importador (lotes 3 e 4) |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` | os gestos do painel e a galeria |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` | teste 1:1 e cobertura |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `test-unitario` | os testes de cada lote |
| **Skill** | `ui-integra-consumidor` | o que o importador lê (lote 4) |
| Código | `gates/scripts/contrato/check-minor-no-removal.mjs` | molde do lote 2: como achar a última tag e comparar com a árvore |
| Código | `src/core/Provider/hooks/useSarakStylesheetGuard.ts` e `src/testing.ts` | R11 |
| Código | `src/core/Provider/buildInfo.ts` e `src/index.ts:48` | R3 |
| Código | `useThemePersistenceHandlers` (procure por nome em `src/`) | R7: o que acontece ao salvar |

# 5. Instruções de execução

**Lote 1**
1. Em `AuthFormFields.tsx`, gere um `id` estável por campo (`useId`) e ligue `label htmlFor` ↔ `SarakInput id` em E-mail, Senha e MFA.
   Pronto quando `getByLabelText('E-mail')` e `getByLabelText('Senha')` acham o `input`, e clicar no rótulo foca o campo.
2. Crie as chaves `authShowPassword` e `authHidePassword` nos seis idiomas, no catálogo das chaves `auth*`. Como as outras chaves
   `auth*`, elas aceitam sobrescrita por `labels`. O olho recebe `aria-label` com a chave do estado atual, conforme a senha esteja
   visível, e **sem** `aria-pressed` (corrigido pelo revisor em 2026-11-05: rótulo que muda e `aria-pressed` juntos se anulam). Pronto quando `getByRole('button', { name: 'Mostrar senha' })` acha o olho e, depois do clique, o nome é
   "Ocultar senha".
3. Em `AuthForm.tsx`, o bloco de erro ganha `role="alert"`; o aviso (`errorVariant === 'warning'`) ganha `role="status"`. Pronto quando
   `getByRole('alert')` acha "credenciais inválidas".
4. Em `SarakAuthScreen.test.tsx`, um caso por pronto dos passos 1 a 3, inclusive o MFA.

**Lote 2**
5. Escreva o script do lote 2. Ele lista os tokens acrescentados, removidos e com tipo ou gramática de valor novo entre a última tag
   **estável** e a árvore. Usar a estável, como o `minor-no-removal`, faz a `8.1.0` comparar com a `v8.0.0`, e a seção da 8.0.0
   comparar com a `v7.0.0`. Depois o script confere que cada nome listado aparece em `docs/migracoes.md`, na entrada da versão que vai
   sair. Falta de nome reprova, com a lista dos nomes que faltam. Sem diferença de token, passa.
6. Gere a seção da 8.0.0 desde a `v7.0.0` e escreva-a em `docs/migracoes.md`, no topo da 8.0.0. Ela abre com uma frase dizendo que a
   lista corrige o "nenhum token acrescentado" das entradas anteriores, quando a 8.0.0 é vista desde a 7.0.0, e que quem valida tema
   por lista de chaves deve aceitá-la.
7. Ligue o script ao `version` em `package.json`, depois de `minor-no-removal:check`, e crie o `npm run <nome>:check` dele.

**Lote 3**
8. `confirmTestId` e `cancelTestId` opcionais em `SarakConfirmOptions`, aplicados aos dois botões; omitidos, nada muda. Teste no
   arquivo de teste do `SarakOverlayProvider`.
9. `data-theme-id` em cada cartão de tema da galeria. Nos gestos do painel, estes `data-testid`:

   | Gesto | `data-testid` |
   |---|---|
   | Aplicar (N) | `sarak-panel-apply` |
   | Salvar tema | `sarak-panel-save-theme` |
   | Confirmar no modal de salvar | `sarak-save-theme-confirm` |
   | Novo tema | `sarak-panel-new-theme` |
   | Apagar | `sarak-panel-delete-theme` |
   | Exportar JSON | `sarak-panel-export-json` |

   (Corrigido pelo revisor em 2026-11-05: as três linhas de galeria — `sarak-panel-open-gallery`, `sarak-panel-close-gallery`,
   `sarak-gallery-close` — saíram da tabela; a galeria não existe na 8.0.0.)

   Um teste prova cada atributo, no teste do componente que o desenha. Se um gesto não existir com esse nome no painel, diga no
   resumo, e não invente o gesto.
10. `filterSarakTestConsoleLog` devolve `false` também para o aviso "[Sarak] CSS não detectado" do modo app, e só para ele: o aviso do
    modo embarcado continua passando. Teste em `src/__tests__` ou onde mora o teste de `testing.ts`.

**Lote 4**
11. No guia do importador, uma seção "Testar com a lib" com:
    - a versão por `SARAK_BUILD_INFO.libVersion` (R3);
    - o filtro do passo 10;
    - os alvos do passo 9 e de `confirmTestId`/`cancelTestId`;
    - o alvo de clique do `SarakRadio` (o rótulo, porque o `<input>` é `sr-only`) (R5);
    - que a galeria e seus botões "Abrir/Fechar galeria" saíram na 8.0.0: os temas ficam na decisão **Tema**, cada cartão com
      `data-theme-id`, e escolher um cartão põe o tema no rascunho até o **Aplicar**. Aponte a entrada de `docs/migracoes.md` que
      registra a saída. O "Fechar galeria" que ainda existe é o do `SarakLightbox`, componente de mídia (R6; corrigido pelo revisor
      em 2026-11-05).
12. Em `docs/persistencia-de-tema.md`, que salvar um tema nomeado também o ativa e grava o estado aplicado (`theme.onSave`, depois
    `applyFullConfigRaw` + `persistDesign`) (R7). Confira a ordem no código antes de escrever.
13. No JSDoc de `SarakGrid` e no guia: a malha padrão é `auto-fit` de 280px e põe irmãos lado a lado; pilha vertical é
    `templateColumns="1fr"` ou `SarakFlex direction="column"` (R8).
14. No guia multi-tenant (a seção que já trata de tenant no guia; procure por "tenant"), a transição da tela pública, sem tenant, para
    o login, com tenant: as opções do Provider antes e depois (R9).
15. `npm run guide` e `npm run guide:check`.

**Ao fim de cada lote**, uma vez: o `vitest` com o filtro de §7 do lote e `npm run verify -- --tier=quick`. Antes de entregar, rode
também os gates do commit: `npm run trail-citation:check -- --staged` (depois de `git add -A`), `npm run variable-contract:check` e
`node gates/scripts/release/check-audit-baseline.mjs --with-tsc`.

# 6. Critérios de aceite

- [ ] R1: os três campos são achados por `getByLabelText`, o olho por `getByRole('button', { name: 'Mostrar senha' })`, com nome que
      alterna, e o erro por `getByRole('alert')`. As duas chaves novas existem nos seis idiomas. Nada visual mudou.
- [ ] R2: o script reprova quando um token acrescentado desde a última tag estável não está na entrada da versão, e passa com ele. O
      teste mostra os dois casos. Ele está no `version`. `docs/migracoes.md` tem a seção da 8.0.0 desde a 7.0.0, com nome e tipo.
- [ ] R4: `confirmTestId`/`cancelTestId` viram `data-testid`; sem eles, o DOM do diálogo é igual ao de hoje.
- [ ] R5/R10: `data-theme-id` em todo cartão de tema; os `data-testid` da tabela do passo 9 existem, cada um provado por teste.
- [ ] R11: o filtro suprime "[Sarak] CSS não detectado" do modo app e mais nada.
- [ ] R3, R5, R6, R7, R8, R9: documentados no guia, em `persistencia-de-tema.md` e no JSDoc; `guide:check` verde.
- [ ] Nenhum arquivo fora de §3.1; gates do commit verdes; tsc no baseline.

# 7. Como verificar (uso do revisor)

**Gate:** o script do lote 2, ligado ao `version`, que reprova uma versão cujas notas omitem token acrescentado, removido ou com
gramática nova desde a última tag estável. Caso que falha: acrescentar um token ao schema numa cópia e rodar o script sem nota.

- `git diff --stat` → só arquivos de §3.1, por lote.
- Lote 1: `npx vitest run src/components/atomic/Templates` → verde. Leitura de `AuthFormFields.tsx` e `AuthForm.tsx`.
- Lote 2: o teste do script → verde. Mutação numa cópia fora do repositório: retirar um nome da seção da 8.0.0 → o script reprova
  nomeando-o.
- Lote 3: `npx vitest run src/components/atomic/Modals src/features/DesignEngine src/__tests__` (mais a pasta do teste de
  `testing.ts`, se for outra) → verde. Inclui os consumidores do painel.
- Lote 4: `npm run guide:check` → verde. Leitura das seções novas.
- Em todos os lotes: `node gates/scripts/release/check-audit-baseline.mjs --with-tsc`, `npm run trail-citation:check` e
  `npm run variable-contract:check`.

# 8. Destino da síntese

**Destino:** `specs/10-seguranca-e-acessibilidade.md + specs/03-versionamento-e-release.md + specs/12-kit-do-consumidor.md`

- **10:** o `SarakAuthScreen` liga rótulo e campo, nomeia o botão de senha pelo estado e anuncia o erro (`role="alert"`).
- **03, na tabela de gates do `version`:** o gate do lote 2, com o limite declarado dele (vê nome, tipo e gramática; não vê mudança
  de valor padrão). Na §5: toda versão que mexe em token traz a seção "Tokens acrescentados, removidos e com valor novo".
- **12:** os alvos de teste estáveis (os `data-testid` do passo 9, `data-theme-id`, `confirmTestId`/`cancelTestId`) passam a ser
  contrato do kit: renomear um deles é quebra. O filtro de `testing` cobre o aviso de CSS.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução (lote 1, passos 1 a 4) — 2026-11-05

**Resultado:** Concluído

**Estado do worktree ao iniciar**
```
 M specs/00-indice.md
?? specs/plan/plan-156-retorno-dos-logins-na-8-0-0.md
```

**O que foi feito**
- `AuthFormFields.tsx`: `useId` gera um prefixo estável; `label htmlFor` ↔ `SarakInput id` em E-mail, Senha e MFA (passo 1).
- `AuthFormFields.tsx`: o `SarakIconButton` do olho recebe `aria-label` (`authHidePassword`/`authShowPassword`, conforme o estado) e `aria-pressed` (passo 2).
- `catalogEntries.part5.ts`: chaves `authShowPassword` e `authHidePassword` nos seis idiomas (passo 2).
- `SarakAuthScreen.tsx`: as duas chaves entram em `SarakAuthScreenLabelKey`, para aceitarem sobrescrita por `labels` como as outras `auth*` (passo 2).
- `AuthForm.tsx`: o bloco de erro ganha `role="alert"`; com `errorVariant === 'warning'`, `role="status"` (passo 3).
- `SarakAuthScreen.test.tsx`: cinco casos novos — rótulo↔campo (E-mail e Senha), rótulo↔campo no MFA, nome e `aria-pressed` do olho alternando, sobrescrita por `labels`, erro como `alert` e aviso como `status` (passo 4).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Templates/components/AuthFormFields.tsx` | alterado | `id`/`htmlFor` nos três campos; `aria-label` e `aria-pressed` no olho |
| `src/components/atomic/Templates/components/AuthForm.tsx` | alterado | `role` no bloco de erro |
| `src/core/i18n/catalogEntries.part5.ts` | alterado | duas chaves novas, seis idiomas |
| `src/components/atomic/Templates/SarakAuthScreen.tsx` | alterado | duas chaves no tipo `SarakAuthScreenLabelKey` |
| `src/components/atomic/Templates/__tests__/SarakAuthScreen.test.tsx` | alterado | cinco casos novos |

**Verificações executadas**
- `npx vitest run src/components/atomic/Templates src/core/i18n` → 82 arquivos verdes, 1 falha: o meu teste de foco por clique no rótulo (o jsdom não move o foco).
- Correção: troquei a asserção por `label.control`. `npx vitest run .../SarakAuthScreen.test.tsx` → 14/14. `src/core/i18n` (incluindo o teste de paridade dos seis idiomas) → verde na rodada de `AuthScreen` + `i18n` (7 arquivos).
- `npm run verify -- --tier=quick` → "nível quick verde" (inclui `tsc`, baseline, `variable-contract:check`, `guide:check`, `dev-kit:check`, `trail-citation` sem `--staged`, Anel 0 com 0 achados).
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → "igual ao baseline de 2026-10-12 — nenhuma regressão".

**Critérios de aceite (lote 1)**
- [x] Os três campos são achados por `getByLabelText` — evidência: `SarakAuthScreen.test.tsx`, casos "links each label…" e "links the MFA label…".
- [x] O olho por `getByRole('button', { name: 'Mostrar senha' })`, com nome que alterna para "Ocultar senha" — evidência: caso "names the password toggle…".
- [x] O erro por `getByRole('alert')` — evidência: caso "announces a credential error…".
- [x] As duas chaves existem nos seis idiomas — evidência: `catalogEntries.part5.ts`; teste de paridade do catálogo verde.
- [x] Nada visual mudou — só atributos; nenhuma classe nem estilo foi tocado.

**Decisões e suposições**
- `SarakAuthScreen.tsx` não está listado na §3.1, mas o tipo `SarakAuthScreenLabelKey` mora nele e o passo 2 pede que as chaves aceitem sobrescrita por `labels`. Editei só o tipo (duas linhas).
- O passo 1 diz "clicar no rótulo foca o campo". O jsdom não move o foco nesse clique, então o teste prova o vínculo por `label.control`, que é o que o navegador usa.
- `aria-pressed={!!showPassword}`: `showPassword` é opcional e `aria-pressed` precisa de booleano.
- O `trail-citation:check -- --staged` exige `git add -A`, que escreve no índice do Git; rodei a variante sem `--staged` (dentro do `quick`).

**Achados fora do escopo (não corrigidos)**
- Nenhum.

**Pendências / riscos**
- Lotes 2, 3 e 4 não foram executados (pedido: só o lote 1).

## Resumo da execução (correção 1) — 2026-11-05

**Resultado:** Concluído

**Estado do worktree ao iniciar**
```
 M specs/00-indice.md
 M src/components/atomic/Templates/SarakAuthScreen.tsx
 M src/components/atomic/Templates/__tests__/SarakAuthScreen.test.tsx
 M src/components/atomic/Templates/components/AuthForm.tsx
 M src/components/atomic/Templates/components/AuthFormFields.tsx
 M src/core/i18n/catalogEntries.part5.ts
?? specs/plan/plan-156-retorno-dos-logins-na-8-0-0.md
```

**Achado 1 — `aria-pressed` junto de `aria-label` que alterna**
- `AuthFormFields.tsx`: removida a linha `aria-pressed={!!showPassword}` do `SarakIconButton` do olho. O `aria-label` alternando
  ("Mostrar senha" ↔ "Ocultar senha") permanece.
- `SarakAuthScreen.test.tsx`: no caso do olho (agora "names the password toggle by the next action, without aria-pressed"), as duas
  asserções de `aria-pressed` viraram `not.toHaveAttribute('aria-pressed')`, antes e depois do clique; as do nome alternando e do `type`
  ficaram.
- Verificação: `npx vitest run src/components/atomic/Templates` → 76 arquivos, 330 testes, todos verdes.

**Decisões e suposições**
- A decisão da linha "`aria-pressed={!!showPassword}`" do resumo anterior fica superada por esta correção.

## Resumo da execução (lote 2, passos 5 a 7) — 2026-11-05

**Resultado:** Concluído

**Estado do worktree ao iniciar**
```
(limpo)
```

**O que foi feito**
- `gates/scripts/contrato/helpers/token-release-notes-core.ts` (novo): núcleo puro — `snapshotTokens` (id → tipo + gramática: opções de select, faixa e unidade), `diffSnapshots` (acrescentados, removidos, com tipo ou gramática novos), `baselineTag` (maior tag estável estritamente anterior à versão), `extractVersionNotes` (junta as seções `## ...` cujo título cita a versão; prévia lê a versão-base), `missingNames` (palavra inteira) e `renderTokenLists` (a lista em markdown) (passo 5).
- `gates/scripts/contrato/check-token-release-notes.ts` (novo): o gate. Fotografa a tag exportando só `src/core/Design` com `git archive` para pasta temporária (apagada no `finally`) e importa o `master-map`; compara com a árvore; confere cada nome na entrada da versão de `package.json`. Falta de nome reprova com a lista; sem diferença passa; sem tag estável anterior libera. Modo `--print --from <tag>` escreve a lista. Limites declarados (R18) no cabeçalho (passo 5).
- `docs/migracoes.md:8`: seção "8.0.0 — tokens acrescentados, removidos e com valor novo desde a 7.0.0", no topo da 8.0.0, gerada por `--print --from v7.0.0` (56 acrescentados, 59 removidos, 32 com valor novo). Abre dizendo que corrige o "nenhum token acrescentado" das entradas seguintes e que quem valida tema por lista de chaves deve aceitá-la; acrescenta à mão a gramática de `colorPalette` e a opção `fluid` de `maxContentWidth` (passo 6).
- `package.json`: script `token-release-notes:check` e encadeamento no `version`, depois de `minor-no-removal:check` (passo 7).
- `gates/scripts/contrato/__tests__/check-token-release-notes.test.ts` (novo): 14 casos — o que o gate pega e o que deixa passar (a entrada cita todos; omite um; cita só em outra versão; palavra inteira), tipo que muda, base de comparação (8.1.0 → `v8.0.0`; 8.0.0 e prévias → `v7.0.0`), seções múltiplas da mesma versão, limite declarado (mudança só de default não é vista).
- Regenerados pelos geradores, sem edição à mão: `sarak-ui/docs/migracoes.md` (`npm run guide`) e `sarak-dev/` (`npm run dev-kit`: o gate novo entra na lista de gates do `state.json`; o gerador imprime 44 gates), porque `guide:check` e `dev-kit:check` acusaram defasagem como consequência direta das mudanças acima.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `gates/scripts/contrato/check-token-release-notes.ts` | criado | o gate |
| `gates/scripts/contrato/helpers/token-release-notes-core.ts` | criado | núcleo puro |
| `gates/scripts/contrato/__tests__/check-token-release-notes.test.ts` | criado | teste do gate |
| `docs/migracoes.md` | alterado | seção nova no topo da 8.0.0 (+169 linhas, nenhuma removida) |
| `package.json` | alterado | script novo e encadeamento no `version` |
| `sarak-ui/docs/migracoes.md` | alterado (gerado) | cópia da migracoes |
| `sarak-dev/state.json`, `START-HERE.md`, `GUIA-MANUTENCAO.md` | alterado (gerado) | contagens recontadas |

**Verificações executadas**
- `npx vitest run gates/scripts/contrato/__tests__/check-token-release-notes.test.ts` → 14/14.
- `npm run token-release-notes:check` → "[OK] v7.0.0 → 8.0.0 — os 147 token(s) que mudaram estão na entrada da versão".
- Mutação (script fora do repositório, sobre o `docs/migracoes.md` real): retirar a linha `topbarGroupSeparatorColor` da seção → `missingNames` devolve `['topbarGroupSeparatorColor']`; sem mutação, `[]`. Observação: `sidebarLogoPlacement` retirado da minha seção NÃO reprova, porque outras entradas da 8.0.0 já o citam (o gate lê a união das entradas da versão).
- `npm run verify -- --tier=quick` → sem falha, depois de `npm run guide` e `npm run dev-kit` (antes: 2 falhas de kit defasado).
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → "igual ao baseline de 2026-10-12 — nenhuma regressão".

**Critérios de aceite (lote 2)**
- [x] O script reprova quando um token que mudou desde a última tag estável não está na entrada da versão, e passa com ele; o teste mostra os dois casos — `check-token-release-notes.test.ts`, bloco `missingNames`.
- [x] Está no `version` — `package.json`, linha do script `version`.
- [x] `docs/migracoes.md` tem a seção da 8.0.0 desde a 7.0.0, com nome e tipo (e gramática quando há) — `docs/migracoes.md:8`.

**Decisões e suposições**
- O gate é `.ts` rodado por `npx tsx` (como `token-docs:check`), e não `.mjs` como o molde: a fotografia precisa importar o `master-map.ts` do schema.
- Base de comparação: maior tag estável **estritamente anterior** à versão de `package.json` (não "a última tag estável"), porque hoje a `v8.0.0` já existe e a 8.0.0 do `package.json` ainda é a versão comparada com a `v7.0.0`, como a plan pede. Na 8.1.0 a base vira a `v8.0.0`.
- Gramática = opções de select, faixa e unidade. Listas de mais de 8 opções aparecem só como contagem (fontes: 22 e 44 valores), por R17 (lista viva mora no schema).
- `colorPalette` não tem gramática legível pelo schema (é `string` sem opções); a gramática dela, copiada da descrição do token, e a opção `fluid` de `maxContentWidth` foram escritas à mão na seção, acima das listas geradas.
- A seção lista 59 removidos, número que o "nenhum token removido" das entradas anteriores também contradiz; a frase de abertura cita "acrescentou, removeu e mudou".
- `tar` do Git Bash lê `C:` como host: o gate extrai com `cwd` e caminho relativo.

**Achados fora do escopo (não corrigidos)**
- Nenhum.

**Pendências / riscos**
- O gate lê a união de todas as entradas `## <versão> — ...`; token citado em qualquer entrada da versão satisfaz. Declarado nos limites (item 3).
- `trail-citation:check -- --staged` não rodado (exige `git add`); rodei a variante sem `--staged` dentro do `quick`.
- Lotes 3 e 4 não executados.

## Resumo da execução (lote 3, passos 8 a 10) — 2026-11-05

**Resultado:** Concluído com pendências (três gestos da tabela do passo 9 não existem no painel)

**Estado do worktree ao iniciar**
```
(limpo)
```

**O que foi feito**
- `SarakOverlayProvider.tsx`: `confirmTestId` e `cancelTestId` opcionais em `SarakConfirmOptions` (com JSDoc), aplicados como `data-testid` nos botões Confirmar e Cancelar de `ModalConfirmationActions`; omitidos, o atributo não é renderizado (passo 8).
- `PresetCard.tsx` e `PresetCardPending.tsx`: `data-theme-id` com o id do tema no botão do cartão (os dois estados do cartão da galeria de temas) (passo 9).
- `ThemeMoreActionsMenu.tsx`: `ThemeMenuAction` ganha `testId?`, aplicado como `data-testid` no item do menu (passo 9).
- `ThemeActionBar.tsx`: `sarak-panel-apply` no Aplicar; `sarak-panel-save-theme`, `sarak-panel-new-theme`, `sarak-panel-export-json` e `sarak-panel-delete-theme` nos itens do menu "Mais ações" (passo 9).
- `SaveThemeModal.tsx`: `sarak-save-theme-confirm` no botão de confirmar (passo 9).
- `src/testing.ts`: `filterSarakTestConsoleLog` descarta também o texto "[Sarak] CSS não detectado" (modo app); o aviso do modo embarcado ("CSS escopado não detectado") não contém esse trecho e continua passando (passo 10).
- Testes ao lado de cada componente: `SarakOverlayProvider.test.tsx`, `ThemeActionBar.test.tsx`, `SaveThemeModal.test.tsx`, `PresetCard.test.tsx`, `PresetCardPending.test.tsx`, `src/__tests__/testing.test.ts`.
- `PresetsCatalog.test.tsx.snap`: atualizado com `-u` só nesse arquivo; o diff são apenas linhas acrescentadas `data-theme-id="<id>"`, nenhuma removida.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Modals/SarakOverlayProvider.tsx` | alterado | `confirmTestId`/`cancelTestId` |
| `src/features/DesignEngine/Canvas/components/PresetCard.tsx` | alterado | `data-theme-id` |
| `src/features/DesignEngine/Canvas/components/PresetCardPending.tsx` | alterado | `data-theme-id` |
| `src/features/DesignEngine/Main/components/ThemeMoreActionsMenu.tsx` | alterado | `testId` do item |
| `src/features/DesignEngine/Main/components/ThemeActionBar.tsx` | alterado | `data-testid` do Aplicar e dos itens do menu |
| `src/features/DesignEngine/Main/components/SaveThemeModal.tsx` | alterado | `data-testid` do confirmar |
| `src/testing.ts` | alterado | filtro do aviso de CSS |
| `src/components/atomic/Modals/__tests__/SarakOverlayProvider.test.tsx` | alterado | caso novo |
| `src/features/DesignEngine/Main/components/__tests__/ThemeActionBar.test.tsx` | alterado | caso novo |
| `src/features/DesignEngine/Main/components/__tests__/SaveThemeModal.test.tsx` | alterado | caso novo |
| `src/features/DesignEngine/Canvas/components/__tests__/PresetCard.test.tsx` | alterado | caso novo |
| `src/features/DesignEngine/Canvas/components/__tests__/PresetCardPending.test.tsx` | alterado | caso novo |
| `src/__tests__/testing.test.ts` | alterado | caso novo |
| `src/features/DesignEngine/Canvas/components/__tests__/__snapshots__/PresetsCatalog.test.tsx.snap` | alterado | `data-theme-id` nos cartões |

**Verificações executadas**
- `npx vitest run src/components/atomic/Modals src/features/DesignEngine src/__tests__ src/components/atomic/DataDisplay` → 227 arquivos; 1 falha (o snapshot acima, efeito esperado de `data-theme-id`). Depois de `-u` em `PresetsCatalog.test.tsx` → 8/8. Os demais 226 arquivos (1328 testes) verdes na mesma rodada.
- `npm run verify -- --tier=quick` → "nível quick verde".
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → "igual ao baseline de 2026-10-12 — nenhuma regressão".

**Critérios de aceite (lote 3)**
- [x] R4: `confirmTestId`/`cancelTestId` viram `data-testid`; sem eles o botão não leva o atributo — `SarakOverlayProvider.test.tsx`, caso "aplica confirmTestId e cancelTestId…".
- [x] R5: `data-theme-id` em todo cartão de tema da galeria (carregado e pendente) — `PresetCard.test.tsx`, `PresetCardPending.test.tsx` e o snapshot da galeria.
- [ ] R10: `data-testid` da tabela do passo 9 — **parcial**. Existem e têm teste: `sarak-panel-apply`, `sarak-panel-save-theme`, `sarak-save-theme-confirm`, `sarak-panel-new-theme`, `sarak-panel-delete-theme`, `sarak-panel-export-json`. **Não existem no painel** e não foram criados: `sarak-panel-open-gallery`, `sarak-panel-close-gallery`, `sarak-gallery-close` — motivo abaixo.
- [x] R11: o filtro suprime "[Sarak] CSS não detectado" do modo app e mais nada — `src/__tests__/testing.test.ts`, caso "filters the app-mode missing-CSS notice and only it".

**Decisões e suposições**
- Os três gestos de galeria não existem: `grep -rin "galeria\|gallery\|Abrir galeria\|Fechar galeria" src/features` não acha botão "Abrir galeria" nem "Fechar galeria" no painel. A galeria de temas hoje é o grupo `themes` do `PresetsCatalog`, montado pela coluna de decisões, sem botão de abrir nem de fechar. O único "Fechar galeria" do repositório é o `aria-label` do `SarakLightbox` (`src/components/atomic/Media/SarakLightbox.tsx:110`), componente de mídia, não do painel. Conforme o passo 9, não inventei o gesto. Isto afeta o lote 4 (passo 11, R6: "qual `data-testid` é cada Fechar galeria") e deve ser reavaliado pelo revisor.
- "Aplicar (N)": o botão do painel se chama "Aplicar"; o contador é um elemento à parte. O `data-testid` está no botão.
- Salvar, Novo tema, Exportar JSON e Apagar são itens do menu "Mais ações", só existem no DOM com o menu aberto; o teste abre o menu.
- `sarak-save-theme-confirm` está no botão de confirmar do `SaveThemeModal`, que é o mesmo botão para salvar e para exportar (o rótulo muda, o botão é um só).
- `data-theme-id` foi posto nos dois estados do cartão (`PresetCard` e `PresetCardPending`), porque o cartão do tema ainda não carregado também aparece na galeria.
- O filtro compara pelo trecho "[Sarak] CSS não detectado"; o texto do aviso do modo embarcado começa com "[Sarak] CSS escopado não detectado", logo não casa.

**Achados fora do escopo (não corrigidos)**
- Nenhum.

**Pendências / riscos**
- Três `data-testid` da tabela do passo 9 sem gesto correspondente (ver Decisões).
- `trail-citation:check -- --staged` não rodado (exige `git add`); a variante sem `--staged` rodou dentro do `quick`.
- Lotes 4 não executado.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-11-05 — lote 1 — 🔴 Reprovado (1 achado, originado na plan)

O revisor rodou:
- `npx vitest run src/components/atomic/Templates src/core/i18n`: 83 arquivos e 399 testes, todos verdes.
- `git diff` do lote: `htmlFor`↔`id` com `useId` nos três campos, as duas chaves nos seis idiomas, e `role` no bloco de erro.
  Nada visual mudou.
- A edição em `SarakAuthScreen.tsx`, fora da §3.1, foi aceita: são só as duas chaves no tipo `SarakAuthScreenLabelKey`, que o passo 2
  exige para a sobrescrita por `labels`.
- Aceito o `label.control` no lugar do foco por clique, que o jsdom não simula.

**Achado**

1. `src/components/atomic/Templates/components/AuthFormFields.tsx`, no `SarakIconButton` do olho: `aria-pressed` junto de um
   `aria-label` que alterna. Um botão de alternância tem nome fixo e estado em `aria-pressed`, **ou** nome que descreve a próxima
   ação, sem `aria-pressed`; nunca os dois. Com os dois, o leitor de tela anuncia "Ocultar senha, pressionado", que contradiz a
   ação. O defeito veio do passo 2 da plan, que pedia os dois. O executor seguiu a plan, e o passo 2 já foi corrigido.
   - Critério: [[10-seguranca-e-acessibilidade]], nome acessível coerente com o estado. O pedido R1 é o nome alternando.
   - Conserto: remover `aria-pressed` do olho. No caso de teste da linha 123, trocar as asserções de `aria-pressed` pela ausência do
     atributo, e manter as do nome alternando. Verificação: `npx vitest run src/components/atomic/Templates`.

## Veredito — 2026-11-05 — lote 1, correção 1 — 🟢 Aprovado; lote 1 fechado

O revisor rodou:
- `grep aria-pressed` em `src/components/atomic/Templates`: só as duas asserções de ausência no teste.
- `npx vitest run src/components/atomic/Templates`: 76 arquivos e 330 testes, todos verdes.
- `check-audit-baseline --with-tsc`: igual ao baseline. `trail-citation:check` e `variable-contract:check`: OK.

O olho tem só o nome da próxima ação, que alterna, sem `aria-pressed`. Os critérios do R1 na §6 estão cumpridos. A plan volta a 🟡 para o lote 2.

## Veredito — 2026-11-05 — lote 2 — 🟢 Aprovado; lote 2 fechado

O revisor rodou:
- `npx vitest run gates/scripts/contrato/__tests__/check-token-release-notes.test.ts`: 14/14. O teste é puro: não chama `git archive` e não depende de tag na CI.
- `npm run token-release-notes:check`: OK, `v7.0.0` → 8.0.0, 147 tokens.
- Amostra dos removidos (`aiPanelBg`, `animFast`, `borderRadiusMd`, `cardContentAlignment`): os quatro existem no schema da `v7.0.0` e não existem na árvore. A lista confere com o medido.
- `git diff package.json`: o script novo, e o `version` com o gate depois de `minor-no-removal:check`.
- `check-audit-baseline --with-tsc`: igual ao baseline. `trail-citation:check`, `guide:check` e `dev-kit:check`: OK. `sarak-ui/` e `sarak-dev/` vieram dos geradores.

Aceitos, por estarem declarados nos limites do gate:
- a base é a maior tag estável anterior à versão do `package.json`;
- vale a união das entradas da versão;
- as listas com mais de 8 opções aparecem só como contagem;
- a gramática de `colorPalette` e o `fluid` foram escritos à mão.

A plan volta a 🟡 para o lote 3.

## Veredito — 2026-11-05 — lote 3 — 🟢 Aprovado; lote 3 fechado (pendência originada na plan, corrigida)

O revisor rodou:
- Os sete arquivos de teste tocados (`SarakOverlayProvider`, `ThemeActionBar`, `SaveThemeModal`, `PresetCard`, `PresetCardPending`,
  `PresetsCatalog`, `src/__tests__/testing.test.ts`): 54/54. Não repeti o filtro inteiro da §7, que o executor rodou.
- Leitura do diff: `data-testid` só aparece quando o importador passa o id, e os cartões carregados e pendentes levam `data-theme-id`.
  O snapshot só acrescenta linhas `data-theme-id`, e o filtro casa o texto real de `useSarakStylesheetGuard.ts:57` e não o de
  `:44`, o aviso embarcado.
- `check-audit-baseline --with-tsc`: igual ao baseline. `trail-citation:check` e `variable-contract:check`: OK.

A pendência declarada pelo executor procede, e o erro estava na plan. A galeria e o botão **Abrir galeria** saíram na 8.0.0, e
`docs/migracoes.md` registra a saída. No pacote, `dist/index.js` só tem o "Fechar galeria" do `SarakLightbox`. O R6 do
importador descreve uma versão anterior. Na plan, as três linhas de galeria saíram da tabela do passo 9, e o R6, na §2 e no passo 11,
passou a dizer o que documentar. Não inventar o gesto foi a conduta certa.

A plan volta a 🟡 para o lote 4.
