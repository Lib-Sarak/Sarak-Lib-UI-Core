---
tipo: "plan"
titulo: "Ligar o rotulo de todo campo ao controle e traduzir os textos fixos dos atomos"
objetivo: "Fazer todo atomo de campo com label expor um nome acessivel ligado ao controle e tirar dos atomos os textos fixos em portugues, que passam a vir do catalogo de traducao"
dominio: "Componentes atomicos / Inputs / Acessibilidade / i18n"
status: "🟢 Aprovada"
prioridade: "Media"
tags: ["plan", "acessibilidade", "i18n", "inputs", "label"]
relacionados: ["[[03-superficie-publica]]", "[[10-seguranca-e-acessibilidade]]"]
depende_de: ""
retida_por: ""
destino_sintese: "arquitetura/03-superficie-publica.md"
---

# 1. Objetivo

Leitor de tela anuncia o rótulo de qualquer átomo de campo que recebeu `label`, e nenhum átomo de `Inputs/` ou
`Media/` mostra texto fixo em português: tudo o que a lib escreve sai do catálogo de tradução, no idioma do tema.

# 2. Contexto

[[03-superficie-publica]] §6.9 promete as duas coisas, e o código cumpre em parte (medido em 2026-10-10):

**Rótulo.** Só `SarakInput` e `SarakSelect` usam `<label htmlFor>`. `SarakDatePicker`, `SarakMultiSelect`,
`SarakTimePicker`, `SarakUploader` e `SarakRangeSlider` desenham o rótulo num `<span>` solto, sem ligação com o
controle. `SarakTextarea` e `SarakRichText` não têm a prop `label`. Nem todo átomo tem um elemento rotulável
nativo (o `SarakRichText` é um `contenteditable`; o `SarakMultiSelect` e o `SarakDatePicker` têm um gatilho
próprio): nesses, a ligação é por `aria-labelledby` (ou `aria-label`) no elemento que recebe o foco.

**Textos fixos** (item 19 do backlog, promovido nesta plan): `aria-label="Hora"`/`"Minuto"`
(`SarakTimePicker.tsx`), o `'range'` de reserva do rótulo acessível (`SarakRangeSlider.tsx`), `'Buscar...'`
(`SarakMultiSelect.tsx`, `SarakAutocomplete.tsx`), `` `Remover ${label}` `` (`SarakMultiSelect.tsx`),
`'Negrito'` e os outros comandos, `'URL do link:'` (`SarakRichText.tsx`), e a mensagem de falha do PDF
(`Media/SarakPDFViewer/usePdfDocument.ts`). O catálogo de tradução mora em `src/core/i18n/catalogEntries.part*.ts`
(lido por `useLibraryText`), e o `part5` já guarda as chaves de campo (`field*`, `range*`, `time*`).

# 3. Escopo

## 3.1 Dentro
- `src/components/atomic/Inputs/` — `SarakTextarea`, `SarakRichText`, `SarakDatePicker`, `SarakMultiSelect`, `SarakTimePicker`, `SarakUploader`, `SarakRangeSlider`, `SarakAutocomplete` e os testes deles.
- `src/components/atomic/Media/SarakPDFViewer/usePdfDocument.ts` — só a mensagem de erro.
- `src/core/i18n/catalogEntries.part*.ts` (chaves novas, nos idiomas que o catálogo já tem) e o que o gate de i18n exigir.
- Artefatos regenerados (`npm run catalog`, `npm run guide`).
- `docs/migracoes.md` — nota da prop `label` nova em `SarakTextarea`/`SarakRichText`, na seção da próxima versão.

## 3.2 Fora
- `SarakInput` e `SarakSelect` (já cumprem), o `SarakFieldError` (já cumpre).
- A interface do `SarakRichText` além do rótulo e dos textos (o `window.prompt` continua; só o texto dele traduz).
- Qualquer spec em `specs/`; o painel de autoria (`src/features/DesignEngine/`).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `arquitetura/03-superficie-publica.md` §6.9 | o contrato do campo: rótulo, erro, ícones, rótulos acessíveis |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` §3.6 | texto que a lib mostra, idioma, chave de tradução |
| Spec fixa | `specs/00-regras-e-invariantes.md` R12 e R34 | sem texto de marca; átomo renderiza sem Provider |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `test-unitario` | um teste por átomo tocado |
| **Skill** | `ui-novo-componente` | prop pública nova alcançando barril e catálogo |
| Código | `src/components/atomic/Inputs/SarakInput.tsx`, `SarakSelect.tsx` | o padrão de rótulo que já cumpre |
| Código | `src/core/i18n/useLibraryText.ts` e `catalogEntries.part5.ts` | como uma chave nova entra |

# 5. Instruções de execução

1. Em cada átomo da §3.1 com `label`: o controle que recebe o foco tem nome acessível igual ao rótulo — `<label htmlFor>` quando houver elemento rotulável, `aria-labelledby` quando não houver. `SarakTextarea` e `SarakRichText` ganham a prop `label`, no mesmo formato dos outros átomos.
2. Trocar cada texto fixo listado na §2 por uma chave do catálogo, com o mesmo texto em português e o equivalente nos outros idiomas que o catálogo já tem. Sem Provider, o átomo continua renderizando (R34).
3. Um teste por átomo: com `label`, `getByRole(..., { name: <rótulo> })` encontra o controle; e os textos aparecem traduzidos quando o idioma do design muda.
4. Regenerar catálogo e kit; acrescentar a nota de migração (prop nova, só aditiva).
5. Rodar a verificação da §7.

# 6. Critérios de aceite

- [ ] Nos 7 átomos (`Textarea`, `RichText`, `DatePicker`, `MultiSelect`, `TimePicker`, `Uploader`, `RangeSlider`), o controle com foco é encontrado por `getByRole` com o nome do `label`.
- [ ] `grep` dos textos da §2 em `src/components/atomic/` (fora de testes) → nenhum literal.
- [ ] Teste de troca de idioma em pelo menos um átomo por grupo (rótulo acessível, placeholder, mensagem).
- [ ] Item 19 removido do `00-backlog` pelo revisor no veredito (não é do executor).
- [ ] Suíte completa verde; `tsc` 0; `audit:baseline` sem regressão; catálogo, kit e barril em dia.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum — o invariante é de cada átomo e fica nos testes deles.

- `git diff --stat` → só a §3.1 e os gerados.
- `grep -rnE "\"Hora\"|\"Minuto\"|'Negrito'|URL do link|Buscar\.\.\.|Remover \\\$\{|Falha ao carregar" src/components/atomic --include=*.tsx --include=*.ts | grep -v __tests__` → vazio.
- Mutação: tirar o `htmlFor`/`aria-labelledby` de um átomo → o teste dele falha.
- `npx vitest run` · `npx tsc --noEmit` · `npm run audit:baseline` · `npm run catalog:check` · `guide:check` · `barrel:check`.

# 8. Destino da síntese

**Destino:** `arquitetura/03-superficie-publica.md`

Texto para a §6.9, substituindo a frase do rótulo, pronto para transporte:

> Os átomos de campo têm `label`, e o controle que recebe o foco tem esse nome acessível: por `<label htmlFor>`
> quando há elemento rotulável, por `aria-labelledby` quando não há (editor rico, gatilho próprio).

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

### Execução — 2026-10-10

- Estado inicial do ritual §2: worktree limpo antes da primeira edição.
- Rótulos visíveis agora nomeiam os controles de `SarakTextarea`, `SarakRichText`, `SarakDatePicker`, `SarakMultiSelect`, `SarakTimePicker`, `SarakUploader` e o grupo de `SarakRangeSlider`. Placeholders e textos internos passaram a usar o catálogo em `src/core/i18n/catalogEntries.part5.ts`, incluindo `SarakAutocomplete` e o fallback de erro do visualizador de PDF. A nota MINOR foi inserida em `## 8.0.0`.
- Testes de acessibilidade e tradução foram acrescentados aos testes dos componentes afetados.
- `npm run catalog`, `npm run guide`, `npm run catalog:check`, `npm run guide:check` e `npm run barrel:check` concluíram com sucesso. `git diff --check` não encontrou erro nos fontes/testes desta plan. O validador AST não apontou erro de parse; os avisos restantes de tamanho e hardcoded nos controles também aparecem no conteúdo de `HEAD`.
- `npx tsc --noEmit` ficou bloqueado por erros de sintaxe em `src/components/Layout/chrome/__tests__/useChromeDefaultWidgets.test.ts`, arquivo da execução paralela da plan 106; não foi aberto nem alterado.
- A suíte focada encerrou sem iniciar testes por `EPERM` ao renomear um arquivo temporário do cliente Vitest. A suíte integral permaneceu reportando `0 test` por vários minutos e foi interrompida sem trocar configuração ou repetir a execução. Não houve resultado de testes válido.
- `npm run audit:baseline` reprovou no estado compartilhado: encontrou regressões de hardcode, variáveis-fantasma e cobertura em arquivos de `Templates/` modificados em paralelo. A auditoria estrutural também marcou os inputs nativos já documentados como exceções/impasses de R10 em `SarakMultiSelect` e `SarakUploader`; nada fora do escopo foi alterado para contornar esses achados.
- `public-types:check` e os builds foram deixados para o revisor conforme instrução do usuário.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-10 — 🔴 Reprovado

**Como foi verificado:** como a árvore está compartilhada com a 106 e a 108 (que quebram `tsc` e `audit:baseline` por arquivos delas), a 105 foi validada **isolada**: cópia de `git archive HEAD` fora do repositório, com só os 19 arquivos desta plan (`Inputs/`, `Media/SarakPDFViewer/`, `catalogEntries.part5.ts`) e `node_modules` por junção. Nela: `audit:baseline` igual ao baseline; `tsc` com **1 erro**; os 9 arquivos de teste da plan → **4 falham, 3 testes falham** (56 passam). Lido o diff inteiro: rótulos ligados por `htmlFor`/`aria-labelledby` nos 7 átomos, textos fixos trocados por chaves com os seis idiomas, nota MINOR dentro da entrada `## 8.0.0` sem separador novo (`extractMigrationNotes` com `installedMajor: 7` a mostra). O código está certo; os achados são dos testes, que a execução nunca chegou a rodar (resumo: `EPERM` e suíte interrompida).

**Achados:**

1. `src/components/atomic/Media/SarakPDFViewer/__tests__/usePdfDocument.test.ts:4` — importa `../../../../core/Provider/SarakUIProvider`, que resolve para `src/components/core/…` (falta um nível: são cinco `../` até `src/`). Derruba o `tsc` (TS2307) e o arquivo de teste inteiro. Critério violado: `tsc` 0 e suíte verde.
2. `Inputs/__tests__/SarakAutocomplete.test.tsx` ("traduz o placeholder padrão…"), `SarakMultiSelect.test.tsx` ("traduz o placeholder e o rótulo de remoção dos chips") e `SarakRichText.test.tsx` ("nomeia o editor pelo rótulo visível e traduz os comandos…") trocam o idioma com `rerender` do `SarakUIProvider` passando outro `config` — e o Provider aplica `config` só ao montar, então o texto continua em português (`Expected Search... / Received Buscar...`; `Unable to find … "Remove Recursos Humanos"`; `… toolbar … "Formatting"`). O teste de idioma do `SarakTimePicker`, que monta de novo já em inglês, passa. Critério violado: "teste de troca de idioma em pelo menos um átomo por grupo" e suíte verde.

## Veredito — 2026-10-10 (rodada 2) — 🔴 Reprovado

**Verificado na mesma cópia isolada** (`HEAD` + os 19 arquivos da plan): os 9 arquivos de teste → **61/61 verdes**; `audit:baseline` igual ao baseline. **Mutação:** os 9 testes da plan contra o código do `HEAD` → os **12 testes novos falham** (rótulo ligado nos 7 átomos, troca de idioma em Autocomplete, MultiSelect, RichText, RangeSlider, TimePicker e o erro do PDF) e os 49 antigos passam. O achado 2 da rodada anterior está corrigido (provider novo em cada teste de idioma).

**Achado:**

1. `src/components/atomic/Media/SarakPDFViewer/__tests__/usePdfDocument.test.ts:33` — `React.createElement(SarakUIProvider, { config: { language: 'en' } }, children)` não compila: `TS2769 … Property 'children' is missing in type '{ config: { language: string; }; }' but required in type 'SarakUIProviderProps'`. O import foi corrigido, mas o `tsc` continua com 1 erro, no mesmo arquivo. Critério violado: `tsc` 0 (o mesmo do achado 1 anterior). O `tsc` roda sem o vitest — o `EPERM` não impede conferir isto.

## Veredito — 2026-10-10 (rodada 3) — 🟢 Aprovado

**Achado da rodada 2, conferido:** `usePdfDocument.test.ts` passa `children` nas props do `createElement`; validação isolada (`HEAD` + os 19 arquivos da plan): `tsc` 0, 61/61 testes, `audit:baseline` igual. A mutação da rodada 2 (12 testes novos falham contra o `HEAD`) continua valendo.

**Suíte completa, na árvore com as plans 105, 106 e 108 juntas:** `npx vitest run` → 438 arquivos e 2659 testes verdes (2026-10-10; uma primeira rodada teve 2 estouros de tempo em ganchos de testes que varrem o repositório, `kitGenerator` e `check-barrel-parity` — passaram sozinhos, e a repetição veio inteira verde). Na mesma árvore: `tsc` 0, `audit:baseline` igual ao baseline. `npm run build` oficial (rodado pelo revisor, com rede) e `npm run dev-kit`: `public-types:check`, `barrel:check`, `catalog:check`, `guide:check` e `dev-kit:check` em dia.

**Critérios de aceite:** todos atendidos — o controle com foco tem o nome do `label` nos 7 átomos; nenhum dos literais da §2 sobra em `src/components/atomic/`; troca de idioma testada por grupo; suíte, `tsc`, `audit:baseline`, catálogo, kit e barril. O item 19 já saiu do `00-backlog` (promovido nesta plan).
