---
tipo: "plan"
titulo: "Dar à tela um idioma só, declarado pelo sistema, e conteúdo rico ao feedback"
objetivo: "Fazer os textos da lib, a formatação de números e datas e o seletor de idioma seguirem uma fonte só, declarada pelo sistema importador e avisada a ele na troca, e aceitar conteúdo rico em confirm e SarakAlert"
dominio: "i18n / Provider / Feedback"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "rc.4", "i18n", "feedback"]
relacionados: ["[[anexos/rc4-contrato]]", "[[10-seguranca-e-acessibilidade]]", "[[12-kit-do-consumidor]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/10-seguranca-e-acessibilidade.md"
---

# 1. Objetivo

Com `options.i18n` declarado pelo sistema, trocar o idioma no seletor muda **junto** os textos da lib, os números, as moedas e os
nomes de mês, e chama o `onLanguageChange` do sistema; `confirm` e `SarakAlert` aceitam `ReactNode` na mensagem; o
`SarakFilterSelect` sai do catálogo de textos e aceita `{ label, value }`.

# 2. Contexto

Contrato aceito: [`anexos/rc4-contrato.md`](anexos/rc4-contrato.md) §1.8, §2.9 e §5 (Q3, Q4, Q6). **Os nomes, tipos e padrões de lá
são lei**; divergência só com aviso ao revisor antes.

O que a leitura revelou (não repita): o seletor (`src/components/atomic/Navigation/SarakShellLanguageSelector.tsx:59`) lista
`design.enabledLanguages` (do tema) e grava `updatePreferences({ language })`; os textos leem `design.language`
(`src/core/i18n/useLibraryText.ts:31`); `SarakValue` lê `preferences.language` (`src/components/atomic/Atoms/SarakValue.tsx:43`);
`resolveIntlLocale` cai no idioma do navegador (`src/shared/format/locale.ts`); `SarakDatePicker` sem `locale` usa o inglês do
`date-fns`. Os seis idiomas da lib estão em `src/core/i18n/languages.ts`.

**Esta plan vai primeiro e sozinha**: as plans 129 a 132 usam o hook dela e escrevem textos nos arquivos de catálogo que ela cria.

# 3. Escopo

## 3.1 Dentro
- `src/core/Provider/types.ts` (e o arquivo de opções, se for outro) — `options.i18n` (`SarakI18nOptions`).
- `src/core/i18n/` — `useSarakLanguage` (hook novo, com teste), a resolução única do idioma, o mapa idioma → locale, e os arquivos
  de catálogo **vazios** `catalogEntries.table.ts`, `catalogEntries.charts.ts`, `catalogEntries.layout.ts`, `catalogEntries.forms.ts`
  ligados em `catalog.ts`, mais `catalogEntries.feedback.ts` com os textos desta plan.
- `src/shared/format/` — o que for preciso para receber o locale resolvido.
- Componentes que formatam sem `locale` explícito: `Atoms/SarakValue.tsx`, `Inputs/SarakCurrencyInput.tsx`,
  `Inputs/SarakDatePicker.tsx` (locale do `date-fns` só dos seis idiomas da lib, importados um a um) e os demais que o grep do passo 4 achar.
- `src/components/atomic/Navigation/SarakShellLanguageSelector.tsx`.
- `src/components/atomic/Modals/SarakOverlayProvider.tsx` (e quem desenha a mensagem do confirm), `Feedback/SarakAlert.tsx`.
- `src/components/atomic/Templates/SarakFilterSelect.tsx`.
- `src/index.ts` — exports novos (só acréscimo).
- `docs/migracoes.md` — uma subseção na `## 8.0.0` (Q3, Q4, Q6 e `options.i18n`).
- Os testes de cada arquivo acima.

## 3.2 Fora
- Textos hardcoded da tabela ("Seleção", "Selecionar linha") — são da `plan-129`.
- Qualquer item do contrato que não seja §1.8, §2.9 (confirm, Alert, FilterSelect) e Q3/Q4/Q6.
- Arquivos gerados (`dist/`, `sarak-ui/`, `sarak-dev/`, `docs/component-catalog.*`).
- Traduzir texto do sistema importador: a lib não traduz o sistema.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contrato | `specs/plan/anexos/rc4-contrato.md` §1.8, §2.9, §5, **§9 (protocolo)** | o que entregar e como verificar |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` §3.6 | regra de texto e idioma da lib (R34) |
| Spec fixa | `specs/11-testes-e-cobertura.md` | forma dos testes |
| Contexto | `00-contexto.md` · `00-prompt-executor.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| Código | os arquivos de §2 | ler antes de editar |

# 5. Instruções de execução

1. Fotografe o worktree (`git status --short`).
2. Crie os cinco arquivos de catálogo de §3.1 e ligue-os em `catalog.ts`. Os quatro das outras plans nascem vazios e tipados.
3. Implemente `options.i18n` e `useSarakLanguage` como no contrato §1.8, com **uma** função de resolução usada por todos:
   `i18n.language` (controlado) > preferência gravada > `design.language` > `pt`. Com `language` controlado, a troca no seletor chama
   `onLanguageChange` e não grava preferência (o sistema é o dono). Sem `options.i18n`, tudo como na rc.3, salvo Q3.
4. `grep` em `src/components` por `toLocale`, `Intl.` e `sarakFormat` sem locale; ligue cada um ao `locale` do hook. Liste no resumo os
   arquivos achados e o que foi feito em cada.
5. Seletor: lista `i18n.languages` quando houver (rótulo do objeto, ou o nome conhecido pela parte primária, ou o código).
6. `SarakFilterSelect`, `SarakConfirmOptions.message`, `SarakAlertProps.message`: como §2.9.
7. Subseção em `docs/migracoes.md` com Q3, Q4, Q6 e o uso de `options.i18n` (exemplo do contrato).
8. `npm run verify -- --tier=quick` uma vez; cole o resumo (regras de leitura no contrato §9).

# 6. Critérios de aceite

- [ ] **Coerência medida:** um teste monta o Provider com `i18n: { languages: ['pt-BR','en-US'], language, onLanguageChange }`, troca
  pelo seletor e prova, na mesma tela: `onLanguageChange('en-US')` chamado, texto da lib em inglês, `SarakValue` de moeda no formato
  `en-US`, mês do `SarakDatePicker` em inglês.
- [ ] Sem `options.i18n`: o seletor lista a do tema (rc.3) e a formatação segue `design.language` (Q3) — teste.
- [ ] Idioma fora dos seis: textos em `pt`, formatação no código pedido — teste.
- [ ] `confirm` e `SarakAlert` desenham um `ReactNode` na mensagem; `title` segue nome acessível — teste por papel.
- [ ] `SarakFilterSelect`: opção inicial do catálogo no idioma; `{label,value}`; `label` como nome acessível — teste.
- [ ] Cada arquivo novo de código com o seu teste; nomes e tipos idênticos ao contrato.
- [ ] Resumo com a tabela item do contrato → teste.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum — comportamento provado por teste de componente.

- `npx vitest run src/core/i18n src/core/Provider src/shared/format src/components/atomic/Navigation src/components/atomic/Feedback src/components/atomic/Modals src/components/atomic/Atoms src/components/atomic/Inputs src/components/atomic/Templates/__tests__` — uma vez.
- Diff lido contra o contrato §1.8, §2.9, §5; `git diff --stat` só com a §3.1.
- O `quick` do executor é aceito pelo resumo colado (contrato §9).

# 8. Destino da síntese

**Destino:** `specs/10-seguranca-e-acessibilidade.md` §3.6 — texto pronto:

> **O idioma é do sistema.** O importador declara os idiomas em `options.i18n.languages` e o atual em `options.i18n.language`; a
> troca no seletor chama `onLanguageChange`. Textos da lib, formatação e seletor leem uma resolução só (`useSarakLanguage`):
> controlado > preferência gravada > `design.language` > `pt`. A lib não traduz o texto do sistema.

---

# 9. Resumo da execução

## Resumo da execução — 2026-10-27

**Resultado:** Concluído com pendências (só as falhas de arquivo gerado, por desenho — ver Pendências)

**Estado do worktree ao iniciar**
```
 M specs/00-backlog.md
 M specs/00-indice.md
 M specs/plan/plan-119-kit-de-importacao-aprendido-nos-importadores.md
?? specs/plan/anexos/rc4-contrato.md
?? specs/plan/plan-128-idioma-unico-e-feedback-rico.md
?? specs/plan/plan-129-tabela-financeira.md
?? specs/plan/plan-130-graficos-e-indicadores.md
?? specs/plan/plan-131-layout-e-cromo.md
?? specs/plan/plan-132-formulario.md
```

**O que foi feito**
- `src/core/i18n/types.ts` (novo) — `SarakI18nOptions`, `SarakI18nLanguage`; `options.i18n` ligado em `src/core/Provider/types.ts` (tipo importado de lá para não passar de 250 linhas).
- `src/core/i18n/resolveLanguage.ts` (novo) — a resolução única `resolveSarakLanguage` (controlado > preferência > `design.language` > `pt`), `toIntlLocale` (`pt` → `pt-BR`; inválido → `pt-BR`), `primaryLanguage`, `languageCode`. Sem `options.i18n` a fonte é só `design.language` (a rc.3); a preferência crua só entra quando `i18n` foi declarado.
- `src/core/i18n/useSarakLanguage.ts` (novo) — hook do contrato §1.8. `setLanguage` avisa `onLanguageChange` e só grava preferência quando `i18n.language` não é controlado.
- `src/core/i18n/dateFnsLocale.ts` (novo) — locales do `date-fns` dos seis idiomas, importados um a um; fora deles, `pt-BR`.
- `src/core/i18n/useLibraryText.ts` — `resolveLibraryLanguage` passa a usar a parte primária (`pt-BR` → `pt`); novo `useLibraryLanguage`; `useLibraryText` lê o hook único.
- `src/core/i18n/catalogEntries.{table,charts,layout,forms}.ts` (novos, vazios e tipados com `satisfies`) e `catalogEntries.feedback.ts` (chave `filterSelectAll`), ligados em `catalog.ts`.
- Formatação sem `locale` explícito: `Atoms/SarakValue.tsx` e `Inputs/SarakCurrencyInput.tsx` leem `useSarakLanguage().locale`; `Inputs/SarakDatePicker.tsx` usa `resolveDateFnsLocale(language)` quando não recebe `locale`.
- Os cinco leitores de `design.language` (`SarakCalendar.tsx`, `useGanttFormats.ts`, `KanbanCardContent.tsx`, `SarakDataFreshness.tsx`, `relativeTime.ts`) passam a `useLibraryLanguage()`.
- `Navigation/SarakShellLanguageSelector.tsx` — lista `options.i18n.languages` (rótulo do objeto, ou nome conhecido pela parte primária, ou o código); sem elas, a do tema; escolha por `setLanguage`; atual pela resolução única.
- `Templates/SarakFilterSelect.tsx` — opção inicial do catálogo, `placeholder` vale, `options` aceita `{label,value}`, `label` vira `aria-label`; exporta `SarakFilterSelectOption`.
- `Modals/SarakOverlayProvider.tsx` e `Feedback/SarakAlert.tsx` — `message: ReactNode` (o `<p>` virou `<div>`, pois o conteúdo pode ser bloco).
- `src/index.ts` — exports `SarakI18nOptions`, `SarakI18nLanguage`, `useSarakLanguage`, `SarakLanguageState` (acréscimo).
- `docs/migracoes.md` — subseção na `## 8.0.0` (Q3, Q4, Q6 e `options.i18n`).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/i18n/{types,resolveLanguage,useSarakLanguage,dateFnsLocale}.ts` | criado | resolução única, hook, locale do date-fns |
| `src/core/i18n/catalogEntries.{table,charts,layout,forms,feedback}.ts` | criado | catálogos (4 vazios; feedback com `filterSelectAll`) |
| `src/core/i18n/{catalog,useLibraryText}.ts` | alterado | liga os catálogos; idioma pela parte primária |
| `src/core/Provider/types.ts`, `src/index.ts` | alterado | `options.i18n`; exports novos |
| `Atoms/SarakValue`, `Inputs/SarakCurrencyInput`, `Inputs/SarakDatePicker` | alterado | locale do hook |
| `DataDisplay/{SarakCalendar,SarakGantt/useGanttFormats,SarakKanban/KanbanCardContent,relativeTime}`, `Templates/SarakDataFreshness` | alterado | `useLibraryLanguage` |
| `Navigation/SarakShellLanguageSelector.tsx` | alterado | lista e troca pela fonte única |
| `Templates/SarakFilterSelect.tsx` | alterado | catálogo, `{label,value}`, `label` |
| `Modals/SarakOverlayProvider.tsx`, `Feedback/SarakAlert.tsx` | alterado | `message: ReactNode` |
| `docs/migracoes.md` | alterado | subseção da plan-128 |
| `src/core/i18n/__tests__/{resolveLanguage,useSarakLanguage,idiomaUnico}.test.ts(x)` | criado | testes novos |
| testes de `SarakFilterSelect`, `SarakAlert`, `SarakOverlayProvider` | alterado | casos novos (o do FilterSelect substitui o smoke de módulo) |

**Verificações executadas**
- `npx vitest run src/core/i18n src/core/Provider src/shared/format src/components/atomic/{Navigation,Feedback,Modals,Atoms,Inputs,DataDisplay} src/components/atomic/Templates/__tests__` → 223 arquivos, 1504 testes, todos verdes (as pastas da §7 mais `DataDisplay`, que contém quatro arquivos tocados).
- `npm run verify -- --tier=quick` → OK: `tsc`, `audit:baseline --with-tsc`, `barrel:check`, Anel 0 (1494 linhas, 0 achados), `plan-index`, `trail-citation` e os demais. FALHAS: `catalog:check` e `guide:check` (ver Pendências).

**Critérios de aceite**
- [x] Coerência medida — `idiomaUnico.test.tsx` › "trocar no seletor muda juntos o texto da lib, a moeda e o mês, e avisa o sistema" (`onLanguageChange('en-US')`, "Light Mode", `R$ 1,234.50`, "march 2026").
- [x] Sem `options.i18n` — `idiomaUnico.test.tsx` › "sem options.i18n: o seletor lista a do tema e a formatação segue design.language (Q3)".
- [x] Idioma fora dos seis — `idiomaUnico.test.tsx` › "idioma fora dos seis…" e `resolveLanguage.test.ts` › "a parte primária alimenta o texto da lib…".
- [x] `confirm` e `SarakAlert` com `ReactNode` — `SarakOverlayProvider.test.tsx` › "confirm desenha um ReactNode…" (dialog por nome do `title`); `SarakAlert.test.tsx` › "desenha um ReactNode na mensagem…" (alert por nome).
- [x] `SarakFilterSelect` — `SarakFilterSelect.test.tsx` (4 casos: catálogo `All`/`Todos`, placeholder, `{label,value}`, `label` como nome acessível).
- [x] Arquivo novo de código com teste — `resolveLanguage.ts` e `dateFnsLocale.ts` em `resolveLanguage.test.ts`; `useSarakLanguage.ts` em `useSarakLanguage.test.tsx`; `types.ts` só tipos. Os cinco `catalogEntries.*` são dados, cobertos por `catalog.test.ts` (verde). Nomes e tipos conforme §1.8.
- [x] Tabela item → teste: abaixo.

| Item do contrato | Teste (arquivo) |
|---|---|
| §1.8 resolução controlado > preferência > tema > pt | `resolveSarakLanguage — a ordem da fonte única` (`resolveLanguage.test.ts`) |
| §1.8 `useSarakLanguage` (controlado / não controlado / sem i18n / sem Provider) | `useSarakLanguage.test.tsx` (4 casos) |
| §1.8 seletor lista `i18n.languages`; sem ela a do tema | `idiomaUnico.test.tsx` (casos 1 e 3) |
| §5 Q3 formatação e DatePicker seguem o idioma | `idiomaUnico.test.tsx` (casos 1 e 3) |
| §5 Q4 / §2.9 FilterSelect | `SarakFilterSelect.test.tsx` |
| §5 Q6 / §2.9 `confirm` e `SarakAlert` | `SarakOverlayProvider.test.tsx`, `SarakAlert.test.tsx` |

**Decisões e suposições**
- Sem Provider, `SarakValue`/`SarakCurrencyInput` agora formatam em `pt-BR` (antes: locale do navegador/`undefined`). É consequência direta da resolução terminar em `pt` e de Q3; os testes existentes seguem verdes.
- Sem `options.i18n` a resolução usa só `design.language` (que já embute a preferência oferecida pelo tema), para manter a rc.3; com `i18n` sem `language`, a preferência gravada vence o tema.
- `date-fns` não exporta `Locale` como tipo neste ambiente; usei `object`, igual ao `SarakDateLocale` que já existia.
- `message` do alert/overlay passou de `<p>` para `<div>` porque `ReactNode` pode trazer bloco (lista, parágrafo); mudança de marcação, sem teste existente quebrado.
- Pastas de teste: acrescentei `src/components/atomic/DataDisplay` às da §7, porque cinco arquivos dela foram tocados.

**Achados fora do escopo (não corrigidos)**
- `src/components/atomic/Templates/SarakChart.tsx:62` — `value.toLocaleString()` sem locale. O componente sai na plan-130 (Q7), então não foi tocado.
- Textos hardcoded da tabela (`Seleção`, `Selecionar linha`) seguem para a plan-129, como a §3.2 manda.

**Pendências / riscos**
- `npm run verify -- --tier=quick`: `catalog:check` (docs/component-catalog.* defasado, por causa do `SarakFilterSelect`, `message` e props novas) e `guide:check` (5 arquivos de `sarak-ui/`) falham porque são gerados e o contrato §9 manda não tocá-los; regeneram no fechamento (`npm run guide` / build).
- Não rodei a suíte completa, o build nem o navegador (são do revisor, §9).
- Nada foi commitado.

---

# 10. Veredito

## Veredito — 2026-10-27 — 🔴 Reprovado (1 achado)

**Verificado por mim**, pelo protocolo do contrato §9: os testes da §7 (mais `DataDisplay`, como o executor fez) rodaram uma vez —
**1504/1504 verdes**, o mesmo número relatado. O `quick` do executor foi aceito pelo resumo colado; as falhas de `catalog:check` e
`guide:check` são de arquivo gerado, por desenho (o §9 do contrato passou a nomear o `catalog:check` também). O diff confere com o
contrato §1.8, §2.9 e §5: `options.i18n`, `useSarakLanguage`, a resolução única, o seletor, `SarakFilterSelect`, `message: ReactNode`
e os exports. A nota de migração está na `## 8.0.0`.

**Achado 1 — cinco componentes formatam pelo idioma dos textos, não pelo locale.** `SarakCalendar.tsx:79-82,93`,
`SarakGantt/useGanttFormats.ts:21-25`, `SarakKanban/KanbanCardContent.tsx:39`, `Templates/SarakDataFreshness.tsx:16` e
`DataDisplay/relativeTime.ts:32` passam ao `Intl` o valor de `useLibraryLanguage()` — um dos seis idiomas da lib (`pt`, `en`…),
não o `locale` de `useSarakLanguage()`. Medido: com o sistema em `en-GB`, o `SarakValue` escreve `27 Oct` e o prazo do Kanban
`Oct 27` na mesma tela; com `ja-JP`, o calendário sai em português (`outubro`) e o valor em japonês (`10月`). Viola a Q3 ("um idioma
só na tela") e o critério de coerência da §6, que o teste atual não pega porque usa `en-US`, onde as duas fontes coincidem.
**Correção:** nesses cinco, `Intl`/`toLocale*` recebem `useSarakLanguage().locale`; `useLibraryLanguage()` fica só para os textos do
catálogo. O comentário de `relativeTime.ts:38` e o JSDoc de `useLibraryText` (que ainda citam `design.language` e
`useSarakUIOptional`) passam a dizer a fonte real. Um caso em `idiomaUnico.test.tsx` com `en-GB` prova que `SarakValue`, o prazo do
Kanban e o mês do `SarakCalendar` saem no mesmo formato.

**Observação (não bloqueia):** `dateFnsLocale.ts` importa seis locales do `date-fns` de forma estática. Só o `SarakDatePicker` o
importa, então não pesa no boot de quem não usa o componente; o custo é medido no build do fechamento.

**Status: 🔵 Em correção.**

---

## Resumo da execução (correção 1) — 2026-10-27

**Resultado:** Concluído

**Achado 1 — cinco componentes formatavam pelo idioma dos textos.** Corrigido: `Intl`/`toLocale*` recebem `useSarakLanguage().locale`; `useLibraryLanguage()` ficou só no catálogo de textos (e o `useLibraryText` a usa por dentro).
- `DataDisplay/SarakCalendar/SarakCalendar.tsx` — `useCalendarFormats` usa `locale` (os quatro `Intl.DateTimeFormat`; `capitalizeFirst` recebe o `locale`).
- `DataDisplay/SarakGantt/useGanttFormats.ts` — `buildGanttFormats(locale)` e o hook leem `locale`.
- `DataDisplay/SarakKanban/KanbanCardContent.tsx` — `toLocaleDateString(locale, …)`; o texto do prazo segue no catálogo.
- `Templates/SarakDataFreshness.tsx` — `Intl.DateTimeFormat(locale, …)`.
- `DataDisplay/relativeTime.ts` — `formatRelativeTime(value, locale)`, `useRelativeTime` lê `locale`; comentários dizem a fonte real.
- `core/i18n/useLibraryText.ts` — JSDoc de `useLibraryText` e `useLibraryLanguage` corrigidos (sem `design.language`/`useSarakUIOptional`; dizem que número e data usam o `locale`).
- Teste: `core/i18n/__tests__/idiomaUnico.test.tsx` › "Formatação de data pelo locale…" — `en-GB` (`31 Dec` no `SarakValue` e no prazo do Kanban, `October 2026` no calendário, `Due` em inglês) e `ja-JP` (`2026年10月`, sem `outubro`).

**Verificações executadas**
- `npx vitest run src/core/i18n SarakCalendar SarakGantt useGanttFormats SarakKanban SarakDataFreshness relativeTime` → 27 arquivos, 203 testes, verdes.
- `npm run verify -- --tier=quick` → `tsc`, `audit:baseline --with-tsc` e Anel 0 (1665 linhas, 0 achados) OK; `catalog:check` e `guide:check` falham (arquivos gerados, por desenho — contrato §9).
- `git status --short` depois, idêntico ao de antes da correção (só mudaram os arquivos acima, já alterados pela execução original).

**Decisões e suposições:** os testes existentes de `buildGanttFormats('pt')`/`formatRelativeTime(…, 'pt')` continuam válidos, pois o parâmetro agora é um locale e `pt` é um locale válido.

**Achados fora do escopo (não corrigidos):** nenhum novo.

**Pendências / riscos:** a observação sobre o peso estático dos locales do `date-fns` fica para o build do fechamento. Nada commitado.

## Veredito — 2026-10-27 — correção 1 — 🟢 Aprovada

**Achado 1 fechado.** Os cinco componentes passam `useSarakLanguage().locale` ao `Intl`/`toLocale*` (`SarakCalendar.tsx:80-83`,
`useGanttFormats.ts:21-25`, `KanbanCardContent.tsx:40`, `SarakDataFreshness.tsx:17`, `relativeTime.ts:32`); `useLibraryLanguage()` só
alimenta o catálogo de textos (`useLibraryText.ts:25,34`). No calendário, `formats.language` recebe o `locale` (`:79`) — o nome ficou,
o valor é o certo. O caso `en-GB`/`ja-JP` de `idiomaUnico.test.tsx` prova a coerência que faltava. **Medido por mim:** só o filtro da
correção, uma vez — **203/203 verdes** (contrato §9). O `quick` do executor foi aceito pelo resumo colado.

**Commit:** o gancho de commit roda `catalog:check`, `guide:check` e `dev-kit:check`; por isso os geradores rodam logo antes do commit
(o §9 do contrato passou a dizer isso). O `dist/` fica para o fechamento.

**Status: 🟢 Aprovada.** Síntese em [[10-seguranca-e-acessibilidade]] §3.6 (texto na §8), quando o dono autorizar.
