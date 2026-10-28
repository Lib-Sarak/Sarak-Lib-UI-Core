---
tipo: "plan"
titulo: "Dar ao formulário seção com legenda, documentos brasileiros e campos de cadastro"
objetivo: "Fazer o formulário de CRUD do importador se compor só com a lib: SarakFormSection com legenda e colunas, prefixo e sufixo no SarakInput, SarakSelect com rótulo obrigatório, SarakDatePicker com limites, atalhos, digitação e limpar, CPF, CNPJ alfanumérico e CEP validados e formatados, e SarakAutocomplete por id com linha secundária e criar novo"
dominio: "Inputs / Formulário"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "rc.4", "formulario", "inputs", "erp"]
relacionados: ["[[anexos/rc4-contrato]]", "[[plan-128-idioma-unico-e-feedback-rico]]", "[[10-seguranca-e-acessibilidade]]"]
depende_de: "plan-128-idioma-unico-e-feedback-rico"
retida_por: ""
destino_sintese: "—"
---

# 1. Objetivo

Itens Formulário 1–6 do contrato entregues, com `SarakFormSection` público e Q1/Q5 na nota de migração.

# 2. Contexto

Contrato aceito: [`anexos/rc4-contrato.md`](anexos/rc4-contrato.md) §1.2, §1.5, §1.6, §2.8, §5 Q1 e Q5, §6. **Nomes, tipos e padrões
de lá são lei.**

O que a leitura revelou: `SarakInputProps extends InputHTMLAttributes` (`src/components/atomic/Inputs/SarakInput.tsx`) — por isso o
nome é `prefixText`/`suffixText` (o `prefix` do HTML é atributo RDFa e colidiria). `SarakSelect` tem `label` opcional
(`Inputs/SarakSelect.tsx`); no ERP, 49 usos sem rótulo (demanda 15). As máscaras estão em `Inputs/internal/mask.ts` (`0` = dígito;
presets `cpf`, `cnpj`, `phone`) e o campo em `Inputs/SarakMaskedInput.tsx` (teclado numérico por padrão). `SarakDatePicker` usa
`Inputs/internal/CalendarPanel.tsx` e emite ISO; o locale padrão já vem da `plan-128`. `SarakAutocompleteOption` tem só
`value`/`label` (`Inputs/SarakAutocomplete.tsx`). `SarakForm` (`Templates/SarakForm.tsx`) é gerado por `mapping`.

**CNPJ alfanumérico (Receita Federal, a partir de julho de 2026):** 12 primeiras posições alfanuméricas (A–Z, 0–9), 2 últimas
numéricas (DV); no cálculo do DV, cada caractere vale o código ASCII menos 48, com os mesmos pesos do módulo 11 do CNPJ numérico.
O numérico continua válido. Use um CNPJ alfanumérico de exemplo publicado pela Receita como caso de teste e cite a fonte no teste.

# 3. Escopo

## 3.1 Dentro
- `src/components/atomic/Inputs/` — `SarakInput`, `SarakSelect`, `SarakMaskedInput`, `internal/mask.ts`, `SarakDatePicker`,
  `internal/CalendarPanel.tsx`, `SarakAutocomplete` e seus testes; módulo puro novo de documentos (`sarakIsValidCpf`,
  `sarakIsValidCnpj`, `sarakFormatDocument`) e de atalhos de período, cada um com teste.
- `src/components/atomic/Templates/SarakFormSection.tsx` (novo, com teste) — ou em `Inputs/`, onde a skill `ui-novo-componente` indicar.
- `src/components/atomic/Templates/SarakForm.tsx` — só o JSDoc (não é para CRUD).
- Usos internos de `SarakSelect` sem `label` em `src/` que a Q1 quebrar no `tsc` (passam `label` + `hideLabel` quando não houver rótulo visível).
- `src/core/i18n/catalogEntries.forms.ts` · `src/index.ts` (acréscimo) · `docs/migracoes.md` (uma subseção na `## 8.0.0`: Q1, Q5).

## 3.2 Fora
- Motor de formulário tipado (contrato §6); `src/core/Manifest/` e o bloco `Form/` do renderer.
- Dependência nova (validação de documento é código próprio). Arquivos gerados.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contrato | `specs/plan/anexos/rc4-contrato.md` §1.2, §1.5, §1.6, §2.8, §5 Q1/Q5, **§9** | o que entregar e como verificar |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` | rótulo, `fieldset`/`legend`, `aria-invalid`, `aria-describedby` |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-novo-componente` · `ui-arquitetura-design` | sempre · componente novo com paridade · CSS por token |
| Código | arquivos de §2 | ler antes de editar |

# 5. Instruções de execução

1. Fotografe o worktree.
2. Documentos: `sarakIsValidCpf`, `sarakIsValidCnpj` (numérico e alfanumérico), `sarakFormatDocument`; preset `cep`; `cnpj` aceitando
   letra maiúscula nas 12 primeiras posições, com teclado de texto por padrão; `validate` no `blur`.
3. `SarakFormSection` (`<fieldset>`/`<legend>`, descrição por `aria-describedby`, colunas pelo `useSarakDevice()`, 1 no celular).
4. `SarakInput` `prefixText`/`suffixText`; `SarakSelect` com `label` obrigatório, `hideLabel` e `options`.
5. `SarakDatePicker`: `min`, `max`, `isDateDisabled` (dia desabilitado não é focável nem selecionável), `presets`, `allowTyping`
   (no `displayFormat`; inválida ou fora do limite marca `aria-invalid` sem emitir), `clearable`.
6. `SarakAutocomplete`: `description` na opção (lida pelo leitor de tela), `selection`/`onSelectionChange`, `onCreate`/`createLabel`.
7. JSDoc do `SarakForm`. Textos novos no `catalogEntries.forms.ts`, seis idiomas.
8. Subseção em `docs/migracoes.md`; `npm run barrel:check`; `npm run verify -- --tier=quick` uma vez, resumo colado (contrato §9).

# 6. Critérios de aceite

- [ ] CPF e CNPJ: válidos, DV errado, repetidos (`111.111.111-11`) e o alfanumérico publicado — testes puros.
- [ ] `SarakMaskedInput validate`: DV errado no `blur` → `aria-invalid` e mensagem ligada por `aria-describedby` — teste por papel.
- [ ] `SarakFormSection`: `group` com nome = legenda e descrição acessível — teste por papel.
- [ ] `SarakSelect` sem `label` não compila (teste de tipo com `@ts-expect-error`); `hideLabel` mantém o nome acessível — teste.
- [ ] `SarakDatePicker`: cada prop de §2.8 com teste; teclado no calendário pula dia desabilitado.
- [ ] `SarakAutocomplete`: seleção emite a opção (id em `value`), mostra `selection.label`, "Criar" chama `onCreate` com a busca — teste.
- [ ] Sem prop nova, comportamento da rc.3 (testes existentes passam sem alteração, salvo Q1/Q5, declarados).
- [ ] Resumo com a tabela item do contrato → teste.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum — comportamento provado por teste; a Q1 é cobrada pelo próprio `tsc`.

- `npx vitest run src/components/atomic/Inputs SarakFormSection SarakForm src/core/i18n` — uma vez.
- Diff lido contra o contrato; `git diff --stat` só com a §3.1. O `quick` do executor é aceito pelo resumo colado.

# 8. Destino da síntese

**Destino:** `—` — superfície documentada pelo catálogo gerado e pela nota de migração; nenhuma regra muda.

---

# 9. Resumo da execução

## Resumo da execução — 2026-10-28

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**

`git status --short` retornou `fatal: this operation must be run in a work tree`, portanto não foi possível obter a fotografia completa pedida pelo ritual. Como observação parcial inicial, `git ls-files -m` já mostrava alterações de outras tarefas em arquivos de layout, gráficos, Design Engine e catálogo de temas; havia também uma árvore não versionada `src/core/Design/palette`. Esses arquivos foram preservados. A mesma falha de Git voltou a ocorrer ao consultar o estado final.

**O que foi feito**

- Implementei as props de adornos do `SarakInput`, o rótulo obrigatório e as opções declarativas do `SarakSelect`, e atualizei os consumidores internos que precisavam de um rótulo acessível.
- Adicionei validação e formatação puras de CPF, CNPJ numérico/alfanumérico e CEP. O teste do exemplo oficial usa `12.ABC.345/01DE-35`, publicado pela [Receita Federal](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf).
- Implementei limites, atalhos, digitação e limpeza no `SarakDatePicker`, e seleção por id, descrição secundária e criação no `SarakAutocomplete`.
- Adicionei `SarakFormSection`, exportei a superfície pública, acrescentei mensagens nos seis idiomas e a nota Q1/Q5 em `docs/migracoes.md`.
- Ajustei a composição de classes do `SarakSelect` para usar `mergeSarakClasses` e removi a exceção obsoleta correspondente da allowlist.

**Arquivos alterados**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Inputs/SarakInput.tsx` | alterado | `prefixText`/`suffixText`, associação acessível e layout dos adornos. |
| `src/components/atomic/Inputs/SarakSelect.tsx` | alterado | `label` obrigatório, `hideLabel`, `options`, atributos acessíveis e composição de classes pelo helper. |
| `src/components/atomic/Inputs/SarakMaskedInput.tsx` | alterado | máscara de CNPJ alfanumérico e validação de CPF/CNPJ no blur. |
| `src/components/atomic/Inputs/SarakAutocomplete.tsx` | alterado | seleção controlada por opção/id, descrição secundária e ação de criação. |
| `src/components/atomic/Inputs/SarakDatePicker.tsx` | alterado | props e delegação do controle de limites, atalhos, digitação e limpeza. |
| `src/components/atomic/Inputs/internal/AutocompletePopup.tsx` | alterado | apresentação da descrição e ação para criar opção. |
| `src/components/atomic/Inputs/internal/autocompleteTypes.ts` | alterado | tipos de descrição e seleção do autocomplete. |
| `src/components/atomic/Inputs/internal/CalendarPanel.tsx` | alterado | limites, dias indisponíveis e navegação de teclado que os ignora. |
| `src/components/atomic/Inputs/internal/DatePickerView.tsx` | criado | subcomponentes visuais do date picker. |
| `src/components/atomic/Inputs/internal/useDatePickerController.ts` | criado | estado e handlers do date picker, inclusive texto e intervalo digitados. |
| `src/components/atomic/Inputs/internal/datePresets.ts` | criado | resolução de atalhos, parsing e validação de datas e intervalos. |
| `src/components/atomic/Inputs/internal/documents.ts` | criado | validação de CPF/CNPJ e formatação de documentos. |
| `src/components/atomic/Inputs/internal/inputCaret.ts` | alterado | contagem e reposicionamento do cursor para entradas alfanuméricas. |
| `src/components/atomic/Inputs/internal/useInputCaret.ts` | alterado | integração do cursor com a máscara alfanumérica. |
| `src/components/atomic/Inputs/internal/mask.ts` | alterado | tokens alfanuméricos, presets de CNPJ e CEP. |
| `src/components/atomic/Templates/SarakFormSection.tsx` | criado | seção de formulário com `fieldset`, `legend`, descrição e colunas responsivas. |
| `src/components/atomic/Templates/SarakForm.tsx` | alterado | atualização do JSDoc conforme a nova composição. |
| `src/components/atomic/Templates/SarakFilterSelect.tsx` | alterado | rótulos nos selects internos. |
| `src/components/atomic/Templates/cardGridParts.tsx` | alterado | rótulos nos selects internos. |
| `src/components/atomic/Templates/index.ts` | alterado | exportação de `SarakFormSection`. |
| `src/index.ts` | alterado | exportações públicas dos documentos e de `SarakFormSection`. |
| `src/core/i18n/catalogEntries.forms.ts` | alterado | mensagens de formulário nos seis idiomas. |
| `src/features/DesignEngine/Panels/LayoutTab.tsx` | alterado | rótulos acessíveis nos selects compactos. |
| `src/features/DesignEngine/components/controls/BasicControls.tsx` | alterado | rótulos acessíveis nos selects compactos. |
| `src/features/DesignEngine/Canvas/KitchenSinkPreview.tsx` | alterado | rótulos acessíveis nos selects do preview. |
| `src/features/DesignEngine/Canvas/Mocks/MockForms.tsx` | alterado | rótulos nos exemplos de formulário. |
| `gates/allowlists/classMergeExclusions.mjs` | alterado | remoção da exceção do `SarakSelect`, que passou a usar o helper central. |
| `docs/migracoes.md` | alterado | subseção de migração Q1/Q5 em `8.0.0`. |
| `src/components/atomic/Inputs/__tests__/SarakInput.test.tsx` | alterado | teste dos adornos e descrição acessível. |
| `src/components/atomic/Inputs/__tests__/SarakSelect.test.tsx` | alterado | teste do rótulo obrigatório, `hideLabel`, opções e estado acessível. |
| `src/components/atomic/Inputs/__tests__/SarakMaskedInput.test.tsx` | alterado | testes da máscara alfanumérica e validação no blur. |
| `src/components/atomic/Inputs/__tests__/SarakAutocomplete.test.tsx` | alterado | testes de seleção, descrição e criação. |
| `src/components/atomic/Inputs/__tests__/SarakDatePicker.test.tsx` | alterado | testes de limites, atalhos, digitação e limpeza. |
| `src/components/atomic/Inputs/internal/__tests__/CalendarPanel.test.tsx` | alterado | teste de navegação que pula dias desabilitados. |
| `src/components/atomic/Inputs/internal/__tests__/inputCaret.test.ts` | alterado | testes de cursor em máscara alfanumérica. |
| `src/components/atomic/Inputs/internal/__tests__/mask.test.ts` | alterado | testes de CNPJ alfanumérico e CEP. |
| `src/components/atomic/Inputs/internal/__tests__/documents.test.ts` | criado | testes puros de CPF, CNPJ, exemplo oficial e formatação. |
| `src/components/atomic/Inputs/internal/__tests__/datePresets.test.ts` | criado | testes puros de atalhos, parsing, limites e dias indisponíveis. |
| `src/components/atomic/Inputs/internal/__tests__/DatePickerView.test.tsx` | criado | testes de rótulo, erro, limpeza e digitação da view. |
| `src/components/atomic/Templates/__tests__/SarakFormSection.test.tsx` | criado | teste do nome do grupo e descrição acessível. |
| `specs/plan/plan-132-formulario.md` | alterado | status movido para `🟠 Em revisão` e este resumo acrescentado. |

**Verificações executadas**

- Suítes puras de `documents`, `datePresets`, `mask` e `inputCaret` → 4 arquivos passaram, 23 testes passaram.
- Suítes de componentes → não chegaram à coleta: o Vite não resolve `./contrast`, importado por `src/core/Design/palette/resolve.ts` na árvore não versionada já presente no worktree. O erro impediu executar os testes de UI.
- `npm run barrel:check` → passou; 110 componentes registrados, zero faltas no barril.
- `npm run verify -- --tier=quick` → executado uma vez, terminou com código 1 e 9 verificações falhas. As falhas de `tsc` e `audit:baseline -- --with-tsc` apontaram o tipo de ref do `CalendarPanel`; corrigi-o depois e `npx tsc --noEmit` passou. A falha `class-merge:check` era a exceção obsoleta causada pela composição do select; corrigi-a depois e `node gates/scripts/contrato/check-class-merge.mjs` passou.
- Permaneceram no resultado do `quick`: `catalog:check`, `token-types:check`, `plan-index:check`, `check-trail-citation`, `guide:check` e `dev-kit:check`. As verificações de catálogo, token, guia e kit reportaram artefatos gerados desatualizados, fora do escopo conforme rc.4 §9. `plan-index:check` reportou estados divergentes nas plans 119, 129, 130 e 131; o índice não foi editado por estar fora do escopo. `check-trail-citation` também falhou ao executar operações Git por causa do erro de worktree acima.
- Validador AST `padrao-typescript` → zero apontamentos nos 31 arquivos selecionados de componentes, helpers, catálogo e testes. A varredura mais ampla encontrou avisos estruturais em `SarakForm.tsx`, `LayoutTab.tsx`, `BasicControls.tsx`, `KitchenSinkPreview.tsx` e `MockForms.tsx`; não refatorei essas áreas porque a plan só autorizou JSDoc ou inclusão de rótulos nelas.

**Critérios de aceite**

- [x] CPF/CNPJ numérico e alfanumérico, dígitos inválidos, sequências repetidas e formatação — `documents.test.ts` (3 testes) e `mask.test.ts` (9 testes); suites puras aprovadas. O exemplo `12.ABC.345/01DE-35` tem fonte da Receita Federal citada no teste.
- [ ] Validação de CPF/CNPJ no blur com `aria-invalid` e erro associado — teste `marca CPF inválido no blur e associa o erro ao campo` em `SarakMaskedInput.test.tsx`; bloqueado antes da coleta pelo import `./contrast`.
- [ ] `SarakFormSection` expõe nome e descrição acessíveis — teste `expõe o título como nome do grupo e liga a descrição ao fieldset`; bloqueado antes da coleta pelo import `./contrast`.
- [ ] `SarakSelect` exige `label` e `hideLabel` preserva nome acessível — o `@ts-expect-error` do teste `não compila sem label` foi verificado por `tsc`; a verificação de UI ficou bloqueada antes da coleta pelo import `./contrast`.
- [ ] `SarakDatePicker` testa cada prop, inclusive navegação por teclado — os testes de componente estão escritos; as suites puras de atalhos e parsing passaram, mas os testes de componente ficaram bloqueados antes da coleta pelo import `./contrast`.
- [ ] `SarakAutocomplete` seleciona por id, exibe descrição e chama `onCreate` — testes escritos para seleção e criação; bloqueados antes da coleta pelo import `./contrast`.
- [ ] Compatibilidade da rc.3 sem props novas — testes existentes foram preservados, mas os testes de componente não puderam ser executados pelo mesmo bloqueio.
- [x] Resumo com a tabela item do contrato → teste — registrado acima, neste quadro de critérios.

**Decisões e suposições**

- Mantive o CNPJ em teclado de texto por padrão para permitir letras nas primeiras 12 posições; os DVs seguem numéricos.
- Usei `mergeSarakClasses` no select e retirei sua exceção da allowlist para satisfazer o contrato de composição sem silenciar o gate.
- Mantive arquivos gerados fora da alteração, conforme rc.4 §9; não criei dependências nem fiz commit.

**Achados fora do escopo (não corrigidos)**

- `src/core/Design/palette/resolve.ts` — a árvore compartilhada não versionada importa `./contrast`, que não foi encontrado; isso bloqueou a coleta dos testes de componentes.
- Artefatos reportados por `catalog:check`, `token-types:check`, `guide:check` e `dev-kit:check` — geração reservada ao fechamento/commit conforme rc.4 §9.
- `specs/00-indice.md` — o gate já reportava divergência de status para as plans 119, 129, 130 e 131. Não alterei o índice, que não está no escopo da plan.
- `SarakForm.tsx`, `LayoutTab.tsx`, `BasicControls.tsx`, `KitchenSinkPreview.tsx` e `MockForms.tsx` — a auditoria ampla registrou avisos em funções/tipagem/valores existentes além dos rótulos e JSDoc desta execução; não ampliei o escopo para refatorá-los.

**Pendências / riscos**

- Os testes React de `SarakInput`, `SarakSelect`, `SarakMaskedInput`, `SarakAutocomplete`, `SarakDatePicker`, `CalendarPanel`, `DatePickerView` e `SarakFormSection` dependem de corrigir ou disponibilizar o import `./contrast` da árvore compartilhada e devem ser executados pelo revisor.
- O `quick` permanece com 6 verificações não resolvidas, listadas acima; não foi repetido. A atualização do status desta plan pode exigir que o revisor sincronize o índice no fechamento.
- Não foi possível confirmar o diff/status total por `git status`/`git diff`, que retornaram `fatal: this operation must be run in a work tree`; a lista de arquivos nesta tabela reflete os arquivos trabalhados nesta execução.

---

# 10. Veredito

## Veredito — 2026-10-28 — 🔴 Reprovado (1 achado)

**Medido por mim**, pelo protocolo do contrato §9: o filtro da §7 rodou **no worktree compartilhado** (o `contrast.ts` já existe) —
**260/261**, a mesma falha nas duas rodadas. `npx tsc --noEmit` do projeto inteiro: **limpo** — a Q1 (`label` obrigatório) não deixou
uso interno quebrado. A leitura confere com o contrato §1.2, §1.5, §1.6, §2.8, Q1 e Q5: documentos com o exemplo oficial da Receita,
CNPJ em maiúscula e teclado de texto só para `cnpj` (`SarakMaskedInput.tsx:121`), `SarakFormSection` com `fieldset`/`legend`,
`SarakFilterSelect` com rótulo oculto do catálogo quando o consumidor não dá `label`. Aceitos os rótulos acrescentados em
`features/DesignEngine/` (cobertos pela §3.1, "usos internos que a Q1 quebrar") e a saída da exceção do `SarakSelect` em
`classMergeExclusions.mjs` (o gate passou a valer para ele, não foi afrouxado).

**Achado 1 — teste errado, nunca executado.** `SarakDatePicker.test.tsx:77` ("aplica um atalho customizado no calendário") monta o
componente **sem** `mode="range"` e espera `onChange` com o intervalo `['2026-01-01', '2026-01-07']`. No modo padrão (`single`), o
atalho de intervalo é reduzido à data inicial por desenho (`internal/datePresets.ts:92`) — o código está coerente; a asserção não. A
falha passou porque a suíte de componentes não carregou na sua sessão. **Correção:** o caso passa `mode: 'range'`; um caso irmão prova
que, em `single`, o mesmo atalho emite `'2026-01-01'`.

**Ambiente (não é achado):** `git status` falhou com *must be run in a work tree* também nesta sessão, como no lote 8 da `plan-119`;
o repositório está normal pelo lado do revisor. Vale conferir em que diretório o terminal do executor abre.

**Status: 🔵 Em correção.**

## Acréscimo ao veredito — 2026-10-28 — achado 2 (auditoria)

Medido pelo revisor (`check-audit-baseline.mjs` + `run_audit.mjs`), nos arquivos desta plan — o Anel 2 do commit bloqueia:
- `Inputs/SarakSelect.tsx:76` — Tailwind estrutural chumbado `pl-4`, `pr-10` (`auditor_hardcoded`).
- `Inputs/internal/useDatePickerController.ts` — sem teste 1:1 (`auditor_coverage`; esperado `internal/__tests__/useDatePickerController.test.ts`),
  e `:95` com 4 `useState`/`useEffect` (`auditor_cleancode`).
- `Inputs/internal/CalendarPanel.tsx` — 261 linhas (teto 250).
- `Inputs/SarakMaskedInput.tsx:99` — `else if` (`auditor_cleancode`: retorno antecipado).

**Correção:** os cinco, sem mudar comportamento; o espaçamento do select pelo token que já existe para o campo (a skill
`ui-arquitetura-design` diz qual). Prova: `node gates/scripts/release/check-audit-baseline.mjs` sem arquivo desta plan.

## Resumo da execução (correção 1 e 2) — 2026-10-28

**Resultado:** Concluído

**Estado do worktree ao iniciar**

`git status --short` retornou `fatal: this operation must be run in a work tree`. A consulta parcial `git ls-files -m` mostrou que a plan e `SarakDatePicker.test.tsx` já estavam modificados pela execução anterior; preservei o conteúdo existente e trabalhei nos dois arquivos dentro do escopo desta correção.

**O que foi feito**

- Corrigi o teste do preset de intervalo para declarar `mode: 'range'` e acrescentei o caso irmão que verifica a emissão de `'2026-01-01'` em `single`.
- Substituí o padding fixo do `SarakSelect` pelos tokens de padding horizontal do campo e espaçamento existente, preservando a reserva da seta; acrescentei teste dessas classes.
- Extraí o estado temporário de digitação do controller para um hook interno com três chamadas de estado/efeito no máximo e criei o teste 1:1 do `useDatePickerController`.
- Extraí a navegação de mês para `CalendarPanelMonthNavigation` com teste próprio; `CalendarPanel.tsx` passou de 261 para 231 linhas. O arquivo do controller ficou com 249 linhas após remover uma interface interna redundante.
- Substituí o `else if` do masked input por resolução da chave da mensagem de erro e atualização única do estado.

**Arquivos alterados**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Inputs/__tests__/SarakDatePicker.test.tsx` | alterado | modo `range` no caso de intervalo e teste irmão para `single`. |
| `src/components/atomic/Inputs/SarakSelect.tsx` | alterado | padding esquerdo/direito baseado em tokens do campo e de layout. |
| `src/components/atomic/Inputs/__tests__/SarakSelect.test.tsx` | alterado | teste de que o select consome os tokens de padding. |
| `src/components/atomic/Inputs/internal/useDatePickerController.ts` | alterado | hook dedicado para o rascunho digitado; tipagem interna reduzida para ficar abaixo de 250 linhas. |
| `src/components/atomic/Inputs/internal/__tests__/useDatePickerController.test.ts` | criado | teste 1:1 de digitação/blur e normalização de preset em modo `single`. |
| `src/components/atomic/Inputs/internal/CalendarPanel.tsx` | alterado | extração da navegação de mês, reduzindo o arquivo a 231 linhas. |
| `src/components/atomic/Inputs/internal/CalendarPanelMonthNavigation.tsx` | criado | companion de navegação anterior/próximo mês. |
| `src/components/atomic/Inputs/internal/__tests__/CalendarPanelMonthNavigation.test.tsx` | criado | teste do mês exibido e dos deslocamentos anterior/próximo. |
| `src/components/atomic/Inputs/SarakMaskedInput.tsx` | alterado | remoção do `else if`, preservando a validação no blur. |
| `specs/plan/plan-132-formulario.md` | alterado | status retornado a `🟠 Em revisão` e este resumo append-only. |

**Verificações executadas**

- `npx vitest run SarakDatePicker SarakSelect SarakMaskedInput CalendarPanel useDatePickerController` → 6 arquivos passaram, 39 testes passaram.
- `node gates/scripts/release/check-audit-baseline.mjs` → primeira execução apontou 1 regressão em `auditor_cleancode.mjs` após o controller atingir 255 linhas; removi 6 linhas de tipo interno redundante e executei o mesmo gate novamente. Resultado final: `[audit:baseline] igual ao baseline de 2026-10-12 — nenhuma regressão.` O comando foi executado sem passar nomes de arquivos.
- Uma execução de `npm run verify -- --tier=quick` iniciada sob a instrução anterior foi interrompida após a chegada do escopo atualizado; não teve resultado final e não foi retomada nesta correção.

**Critérios de aceite**

- [x] Achado 1 — o teste de intervalo executa em `range`; o teste irmão verifica a normalização em `single`; suíte focada aprovada.
- [x] Achado 2 — padding tokenizado, teste 1:1 do controller, extração da navegação com teste próprio, `CalendarPanel` abaixo de 250 linhas e sem `else if` no masked input; auditoria final igual ao baseline.

**Decisões e suposições**

- Mantive o espaço reservado para a seta do select em 40 px nos valores padrão: padding horizontal do campo (16 px), gap médio (16 px) e gap pequeno (8 px), todos por variáveis CSS existentes.
- A extração da navegação de mês é somente estrutural; preserva labels, ícones e deslocamentos de `-1` e `1`.
- A interface local removida do controller não era exportada; as props e o retorno público permanecem tipados por `DatePickerRuntimeState` e inferência TypeScript.

**Achados fora do escopo (não corrigidos)**

- Nenhum achado adicional foi tratado. `git status --short` continua sem funcionar neste terminal (`must be run in a work tree`), como já registrado no veredito; isso não impediu os testes focados nem a auditoria solicitada.

**Pendências / riscos**

- Nenhuma pendência nos achados 1 e 2. A primeira execução do gate revelou a regressão de tamanho introduzida pela extração e a execução final confirmou o baseline limpo.

## Veredito — 2026-10-28 — correção 1 e 2 — 🟢 Aprovada

**Achado 1 fechado:** o caso de atalho de intervalo monta em `mode: 'range'`, e o caso irmão prova `'2026-01-01'` em `single`.
**Achado 2 fechado:** `SarakSelect` lê `--sarak-input-padding-horizontal` (token que já existe) com a reserva da seta por
`--sarak-layout-gap-*`; `useDatePickerController.ts` tem teste 1:1 e 248 linhas; `CalendarPanel.tsx` 231 linhas, com a navegação de
mês extraída e testada; `SarakMaskedInput` sem `else if`. **Medido por mim:** o filtro da correção, uma vez — **39/39 verdes**; e
`check-audit-baseline.mjs` no worktree inteiro — **igual ao baseline, nenhuma regressão**.

**Status: 🟢 Aprovada.** Destino `—`.
