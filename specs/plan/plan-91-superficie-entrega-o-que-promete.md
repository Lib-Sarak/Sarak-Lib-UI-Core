---
tipo: "plan"
titulo: "Fazer a superfície pública entregar o que o contrato dela promete"
objetivo: "Alinhar ao contrato publicado os pontos em que a superfície pública promete uma coisa e entrega outra, com o erro de campo passando a ter uma forma só"
dominio: "Sarak-Lib-UI-Core / Superfície pública / Átomos e persistência"
status: "🟢 Aprovada"
prioridade: "Média"
tags: ["plan", "superficie-publica", "atomos", "persistencia", "i18n"]
relacionados: ["[[03-superficie-publica]]", "[[09-temas-e-presets]]", "[[10-seguranca-e-acessibilidade]]", "[[06-painel-de-customizacao-e-preview]]"]
depende_de: "plan-90-css-que-so-o-navegador-mede"
retida_por: ""
destino_sintese: "arquitetura/03-superficie-publica.md"
---

# 1. Objetivo

Os pontos em que a lib promete uma coisa e entrega outra passam a cumprir o que está publicado — e o erro
de campo, que hoje tem duas formas visuais, passa a ter **uma**.

# 2. Contexto

Todos os itens foram conferidos contra o código em 2026-10-02. O que os une: **existe um contrato escrito —
numa spec, numa prop, num documento — e o comportamento diverge dele.** Todos são verificáveis em `jsdom`.

| # | A promessa | O que acontece | Onde |
|---|---|---|---|
| 1 | *(saiu desta plan em 2026-10-03: o par design + id do tema é a `plan-93` inteira)* | — | — |
| 2 | ~~Template de dado sem `data` e sem `endpoint` não busca e não fica preso em carregamento ([[03-superficie-publica]] §6.3 — vale hoje para `SarakTable` e `SarakCardGrid`) | `SarakStats` fica em carregamento **para sempre**: o hook nasce com `loading: !initialData`, e o efeito não busca sem `endpoint` ~~ *(resolvido antes da execução — emenda de 2026-10-09: o hook só carrega quando recebe `load`, `useSarakStatsData.ts`; fora do escopo)* | — |
| 3 | A lib tem um componente de erro de campo, `SarakFieldError`: ícone + texto, `role="alert"`, id `${fieldId}-error` | **Nove** átomos têm a prop `error` e desenham o erro por conta própria, **só texto**, sem ícone e sem `role`. Um formulário que use os dois mostra duas formas | `src/components/atomic/Feedback/SarakFieldError.tsx` × `src/components/atomic/Inputs/` — `SarakInput`, `SarakSelect`, `SarakTextarea`, `SarakDatePicker`, `SarakMultiSelect`, `SarakRangeSlider`, `SarakRichText`, `SarakTimePicker`, `SarakUploader` |
| 4 | Os tokens de direção e alinhamento de cartão valem para os cartões | Valem para os quatro cartões de domínio, por `useCardLayoutStyles(design)`. O `SarakCard` composto usa `useSarakCardLayoutStyles()`, de nome quase igual: **não é hook**, não recebe `design` e devolve uma string constante. É defensável — as peças do cartão composto são explícitas —, mas não está escrito em lugar nenhum | `src/components/atomic/Cards/hooks/useSarakCardLayoutStyles.ts` · `src/components/atomic/Cards/SarakCard.tsx:17` |
| 5 | Todo texto da lib segue o idioma escolhido ([[10-seguranca-e-acessibilidade]] §3.6) | Textos em português fixo: `mínimo`/`máximo` no rótulo acessível do intervalo (`range` quando falta `label`), e `'Horário'` | `src/components/atomic/Inputs/SarakRangeSlider.tsx` (os dois `ariaLabel`) · `src/components/atomic/Inputs/SarakTimePicker.tsx` |
| 6 | O documento de extensibilidade lista os tokens do fundo global | Lista `globalBackgroundBlendMode`, que **saiu do schema** | `docs/extensibilidade-de-layout.md:54-55` |
| 7 | O parâmetro `useSystemDesign` promete o design **do sistema** | Lê `sarak.design`, que hoje inclui o rascunho. Nenhum ponto de chamada passa `true`: é código morto com nome enganoso. **O preview já foi reescrito para o cromo único e o parâmetro sobrou** | `src/features/DesignEngine/Canvas/PreviewCanvas.tsx:82-85` · `src/features/DesignEngine/Canvas/components/PreviewSystemRenderer.tsx:9`, `:98`, `:107` |
| 8 | `SarakInput` aceita `icon`, `leftIcon` e `rightIcon` | Renderiza **um** só (`icon`, senão `leftIcon`, senão `rightIcon`), num invólucro `pointer-events-none`. O ícone da direita nunca aparece quando há um à esquerda — é o que mata o "mostrar senha" do próprio template de autenticação (`AuthFormFields.tsx:79-88`), medido no `login-completo` | `src/components/atomic/Inputs/SarakInput.tsx:80,99` |
| 9 | Os átomos de campo têm `label` e ligam o erro ao controle | `SarakSelect` não tem `label`, e o `error` dele não vai para `aria-describedby`; o `login-completo` deixou 4 selects sem rótulo visível | `src/components/atomic/Inputs/SarakSelect.tsx:6-10` |
| 10 | ~~`SarakPDFViewer` funciona onde a lib está instalada~~ | *(saiu desta plan em 2026-10-09: o conserto exige decidir entre copiar o worker para o `dist/` e exigir `workerSrc` — decisão do dono, `00-backlog` item 18)* | — |
| 11 | Toda variável que deixa de ser emitida tem nota de migração | `--theme-text` deixou de ser emitida (o legado `Novo` a consome em três telas) e `docs/migracoes.md` não a menciona | `docs/migracoes.md` · `src/core/Design/hooks/useDesignVariables.ts` |

**Decisão do dono (2026-10-02), item 3:** vence a forma do `SarakFieldError`. Os nove átomos passam a usá-lo
por dentro.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- Os nove átomos de `src/components/atomic/Inputs/` listados acima — **só** a renderização do erro.
- `src/components/atomic/Cards/hooks/useSarakCardLayoutStyles.ts`, o teste dele e `SarakCard.tsx` — item 4.
- `SarakRangeSlider.tsx`, `SarakTimePicker.tsx` e o catálogo de textos em `src/core/i18n/` — item 5.
- `src/components/atomic/Inputs/SarakInput.tsx` — item 8 (os dois ícones renderizam; o da direita pode ser interativo).
- `src/components/atomic/Inputs/SarakSelect.tsx` — item 9 (`label` e `aria-describedby`).
- `docs/migracoes.md` — item 11 (a nota de `--theme-text`).
- `docs/extensibilidade-de-layout.md` — item 6.
- `PreviewCanvas.tsx` e `PreviewSystemRenderer.tsx` — item 7.
- Testes ao lado do que mudou (`__tests__/`), e os snapshots **dos nove átomos**.
- `dist/`, `sarak-ui/`, `sarak-dev/`, `docs/component-catalog.*` — regenerados. Nunca à mão.

## 3.2 Fora (o que NÃO pode ser tocado)

- **`SarakFieldError.tsx`** — é a forma que venceu; não muda.
- O layout do `SarakSelect` (invólucro, campo e seta) — foi da `plan-90`.
- A prop `error` em si: nome, tipo (`string`) e JSDoc ficam. Prop nova só a `label` do `SarakSelect` (item 9).
- O Provider e a persistência — `plan-93`.
- Os tokens de cartão e os quatro cartões de domínio.
- Outros textos fixos que apareçam pelo caminho — relate em *Achados fora do escopo*.
- Snapshot de qualquer componente que não seja um dos nove.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/arquitetura/03-superficie-publica.md` | §6 (taxonomia e composição atômica), §6.3 (templates de dado) e §6.4 (o contrato de valor dos átomos de escolha — o molde de como um contrato de átomo é escrito) |
| Spec fixa | `specs/specs/09-temas-e-presets.md` | §4.4.2 (o que `onSave` entrega) e §4.6 (o ciclo de salvar em runtime) |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | §2.4 (teclado, ARIA e o que é garantido) e §3.6 (tradução) |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` | o rascunho, a aplicação e o preview — itens 1 e 7 |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` | R10 (composição atômica), R34 (o átomo renderiza sem Provider), R35 |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` | §3 — teste na borda pública, mock restrito |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `test-unitario` | os testes dos itens 1, 2, 3 e 5 |
| **Skill** | `ui-refatorar-componente` | mudar a renderização de átomo publicado sem quebrar a paridade |
| Código | `src/components/atomic/Feedback/SarakFieldError.tsx` | o contrato do componente que os nove passam a usar |
| Código | `src/components/atomic/Inputs/SarakInput.tsx` | o padrão atual de `errorId` e `aria-describedby` |
| Código | `src/core/i18n/useLibraryText.ts` | como um texto da lib é lido |
| Código | `src/components/atomic/Templates/hooks/useSarakTableData.ts` | como o irmão já trata a ausência das duas props |

# 5. Instruções de execução

1. *(Item 1 saiu — `plan-93`.)*
2. *(Item 2 resolvido antes da execução — emenda de 2026-10-09; nada a fazer.)*
3. **Item 3.** Os nove átomos renderizam o erro por `SarakFieldError`. O que tem de continuar verdadeiro em
   cada um:
   - o id da mensagem é o mesmo que o controle referencia em `aria-describedby`;
   - `aria-invalid` segue como está;
   - sem `error`, nada é renderizado e nenhum espaço é reservado.
   Um teste por átomo: com `error`, há um `role="alert"` com o texto, e o controle o referencia. Atualize os
   snapshots dos nove — e só deles.
4. **Item 4.** `useSarakCardLayoutStyles` deixa de se chamar hook: o nome novo não começa com `use` e não se
   confunde com `useCardLayoutStyles`. Um comentário no ponto de uso diz por que o cartão composto não lê os
   tokens de direção e alinhamento.
5. **Item 5.** Os textos passam a vir do catálogo de textos, nos idiomas que ele oferece. Teste: com
   outro idioma, cada um muda.
6. **Item 6.** `docs/extensibilidade-de-layout.md` deixa de citar `globalBackgroundBlendMode`.
7. **Item 7.** O parâmetro `useSystemDesign` sai dos dois arquivos, com o ramo que ele alimentava (se ainda existir).
8. **Item 8.** `SarakInput` renderiza `leftIcon` e `rightIcon` ao mesmo tempo; o da direita aceita clique
   (é o que um "mostrar senha" precisa). Teste.
9. **Item 9.** `SarakSelect` ganha `label` (mesmo contrato do `SarakInput`) e liga o erro por `aria-describedby`. Teste.
10. *(Item 10 saiu desta plan em 2026-10-09 — `00-backlog` item 18.)*
11. **Item 11.** `docs/migracoes.md` ganha a nota de `--theme-text` na entrada do major em que ela saiu.
12. `npm run build` — ele roda os gates de catálogo, barril, tipos públicos e prefixo.
13. `npm run dev-kit`. `npx tsc --noEmit` → zero erros. `npx vitest run` → verde. `npm run audit` contra o
   baseline → sem regressão.

# 6. Critérios de aceite

- **2** — *(resolvido antes da execução; sem critério — emenda de 2026-10-09)*
- [ ] **3** — `git grep -n "error && (" -- src/components/atomic/Inputs` não devolve nenhum `<p` de erro
      desenhado à mão; os nove átomos importam `SarakFieldError`; um teste por átomo prova o `role="alert"` e
      a associação por `aria-describedby`.
- [ ] **4** — nenhum arquivo de `src/` cita `useSarakCardLayoutStyles`; o comentário existe no ponto de uso.
- [ ] **5** — os textos mudam com o idioma, provado por teste; nenhum literal em português sobra nos arquivos.
- [ ] **8** — `SarakInput` com `leftIcon` e `rightIcon` renderiza os dois; clique no da direita dispara (teste).
- [ ] **9** — `SarakSelect` com `label` renderiza o rótulo ligado ao controle; com `error`, `aria-describedby` aponta para a mensagem (teste).
- **10** — *(saiu desta plan; `00-backlog` item 18)*
- [ ] **11** — `grep -c -- "--theme-text" docs/migracoes.md` → 1, na entrada certa.
- [ ] **6** — `grep -c globalBackgroundBlendMode docs/extensibilidade-de-layout.md` → 0.
- [ ] **7** — `git grep -n useSystemDesign -- src` → vazio.
- [ ] Só os snapshots dos nove átomos mudaram.
- [ ] `npm run build`, `npx tsc --noEmit` e `npx vitest run` verdes; `npm run audit` sem regressão.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — cada item é comportamento observável de um módulo; a prova é teste do módulo.

- `git status` + `git diff --stat` → só os arquivos de §3.1.
- Leitura do diff dos nove átomos → só a renderização do erro mudou; a prop e o JSDoc não.
- **Os testes mordem?** Para os itens 1 e 2, exportar o `HEAD` para um diretório temporário e rodar lá os
  testes novos → falham.
- Os `grep` dos critérios 3, 4, 6 e 7.
- `git diff --stat -- "*.snap"` → só os nove.
- `npm run build` · `npx tsc --noEmit` · `npx vitest run` · `npm run audit` contra o baseline.

# 8. Destino da síntese

**Destino:** `arquitetura/03-superficie-publica.md`

- **§6.3** — os três templates de dado, sem nenhuma das duas props, não buscam e não ficam presos em
  carregamento. Texto pronto: *"Sem nenhuma das duas props, nenhum dos três busca nem fica preso em
  carregamento."*
- **§6 (subseção nova)** — o erro de campo tem uma forma só: todo átomo com a prop `error` o renderiza por
  `SarakFieldError`, com `role="alert"` e o id que o controle referencia em `aria-describedby`.
- **§6 (onde a taxonomia fala dos cartões)** — o cartão composto (`SarakCard` e peças) **não** lê os tokens
  de direção e alinhamento de cartão; quem os lê são os cartões de domínio.

Os itens 5, 6, 7, 8, 10 e 11 não deixam texto: o comportamento correto já está especificado ou é limpeza. O item 9
entra na subseção do erro de campo (todo átomo de campo tem `label` e liga o erro ao controle).

> A síntese é ato do **revisor** ([[00-prompt-revisor]]), e o gatilho é do **usuário**: o revisor propõe ao
> aprovar e espera autorização. Esta seção apenas a prepara.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução — 2026-10-09

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
```
 M docs/migracoes.md
 M sarak-ui/docs/migracoes.md
 M specs/arquitetura/02-design-engine.md
```
(Durante a execução, `specs/00-indice.md`, `specs/specs/11-testes-e-cobertura.md`, o `docs/migracoes.md` e a remoção de `plan-90` mudaram por ação do revisor/outras tarefas — não são meus. O status da plan chegou em 🔴, não 🟡; executei por ordem expressa do usuário.)

**O que foi feito**
- Item 2 — já resolvido antes da execução (emenda de 2026-10-09); nada feito.
- Item 3 — os nove átomos renderizam o erro por `SarakFieldError` (`SarakInput`, `SarakSelect`, `SarakTextarea`, `SarakDatePicker`, `SarakMultiSelect`, `SarakRangeSlider`, `SarakRichText`, `SarakTimePicker`, `SarakUploader`). `SarakTextarea`, `SarakRichText`, `SarakUploader` e `SarakSelect` ganharam `useId`, `aria-describedby` (e `aria-invalid` onde faltava). Prop `error` sem mudança de nome/tipo; JSDoc não alterado.
- Item 4 — `useSarakCardLayoutStyles` virou `compositeCardLayoutClassName` (`Cards/compositeCardLayoutClassName.ts`, teste em `Cards/__tests__/`); comentário no ponto de uso em `SarakCard.tsx`.
- Item 5 — chaves `rangeMinAriaLabel`, `rangeMaxAriaLabel`, `timeGroupAriaLabel` em `catalogEntries.part5.ts` (6 idiomas); `SarakRangeSlider` e `SarakTimePicker` leem por `useLibraryText`.
- Item 6 — `globalBackgroundBlendMode` saiu de `docs/extensibilidade-de-layout.md`.
- Item 7 — `useSystemDesign` removido de `PreviewCanvas.tsx` e `PreviewSystemRenderer.tsx` (o ramo virou `tokens`; a prop `sarak` do renderer ficou só no comparador do memo).
- Item 8 — `SarakInput`: `leftIcon` + `rightIcon` renderizam juntos (esquerda/direita), o da direita sem `pointer-events-none`; `icon` prevalece; um só segue o lado do tema. JSDoc das duas props atualizado (ficaria falso).
- Item 9 — `SarakSelect` ganha `label` (ligado por `htmlFor`/`id`); erro por `aria-describedby`. Sem `label` o DOM externo é o de antes (grupo só entra com rótulo); `id` só é gerado se houver rótulo ou erro.
- Item 10 — NÃO executado (ver Pendências).
- Item 11 — seção "A cor do texto principal sai em `--text-main`" no bloco do 8.0.0 de `docs/migracoes.md`, por substituição exata; `grep -c -- "--theme-text"` → 1.
- Regenerados por comando: `npm run catalog`, `guide`, `dev-kit`.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Inputs/Sarak{Input,Select,Textarea,DatePicker,MultiSelect,RangeSlider,RichText,TimePicker,Uploader}.tsx` | alterado | erro por `SarakFieldError`; ids/`aria-describedby`; itens 5, 8, 9 |
| `src/components/atomic/Inputs/__tests__/` (9 arquivos) | alterado | testes de erro por átomo, ícones, rótulo do Select, i18n |
| `src/core/i18n/catalogEntries.part5.ts` | alterado | 3 chaves novas |
| `src/components/atomic/Cards/{SarakCard.tsx,compositeCardLayoutClassName.ts}` + teste | alterado/criado | item 4 |
| `src/components/atomic/Cards/hooks/useSarakCardLayoutStyles.ts` + teste | removido | renomeados |
| `PreviewCanvas.tsx`, `PreviewSystemRenderer.tsx` | alterado | item 7 |
| `docs/extensibilidade-de-layout.md`, `docs/migracoes.md` | alterado | itens 6 e 11 |
| `docs/component-catalog.*`, `sarak-ui/*`, `sarak-dev/*` | regenerado | por comando |

**Verificações executadas**
- `npx vitest run` (completa, antes do ajuste final do Select) → 420/422 arquivos, 2499/2501 testes; 2 falhas: `PreviewCanvas` (snapshot, ver abaixo) e `LayoutTab` (snapshot do `SarakSelect`, corrigido depois restaurando o DOM sem rótulo; `Panels` + `SarakSelect.test` reexecutados → 8 arquivos, 25 testes verdes). Suíte completa NÃO reexecutada após esse ajuste.
- `npx tsc --noEmit` → 0 erros. `check-audit-baseline --with-tsc` → igual ao baseline, sem regressão.
- Gates do pre-commit rodados: barrel, catalog, zero-brand, guide, deep-import, gate-limits, container-query (2), persistence-doc, class-merge, icon-port, chrome-token-parity, trail-citation, `generate-token-types --check`, `dev-kit --check` → todos 0. `check-agent-git-write` não rodado (falha em sessão de agente por definição).

**Critérios de aceite**
- [x] 3 — nenhum `<p` de erro à mão nos nove; teste por átomo em `Inputs/__tests__/*.test.tsx` ("Erro de campo pelo SarakFieldError").
- [x] 4 — `git grep useSarakCardLayoutStyles -- src` vazio; comentário em `SarakCard.tsx`.
- [x] 5 — testes de idioma em `SarakRangeSlider.test.tsx` e `SarakTimePicker.test.tsx`; ressalva: `'Hora'`/`'Minuto'` (aria-label do TimePicker) e `'range'` (fallback) continuam literais.
- [x] 6 — grep → 0. [x] 7 — grep → vazio. [x] 11 — grep → 1.
- [x] 8 — `SarakInput.test.tsx` ("ícones"). [x] 9 — `SarakSelect.test.tsx`.
- [ ] 10 — não executado.
- [ ] "Só os snapshots dos nove mudaram" / vitest verde — nenhum snapshot dos nove existia/mudou; porém o snapshot de `PreviewCanvas` está VERMELHO por efeito do item 8 (o widget de busca passa `leftIcon` + `rightIcon` "CTRL K"; agora o atalho aparece). Não atualizei: ordem era só os nove.
- [ ] `npm run build` não rodado (a lista pedida não o incluía).

**Decisões e suposições**
- JSDoc de `error` em `SarakSelect`/`SarakTextarea` diz "não é associado por `aria-describedby`" e agora é falso; mantido por ordem expressa.
- `compositeCardLayoutClassName` fica em `Cards/` (fora de `hooks/`), por não ser hook.
- Item 11: o repositório mostra `--theme-text` como "no-op comprovado" desde antes da v4.0.0 (nunca resolveu, `_theme.css` já lia `--text-main`); não consegui provar em que major deixou de ser emitida, então a nota não afirma isso: diz que a lib não a emite e como migrar. Pôs-se no bloco do 8.0.0 (em curso).
- `SarakSelect` com rótulo envolve o campo num `SarakFormGroup` com largura `fit-content`/`100%`; sem rótulo o DOM é idêntico ao anterior.

**Achados fora do escopo (não corrigidos)**
- `SarakSelect.tsx` usa `useSarakUI()` (exige Provider) — viola R34; os testes montam com Provider.
- `SarakSelect`: a mensagem de erro fica dentro do invólucro da seta (caret centraliza sobre campo+erro), comportamento pré-existente.
- Literais em português remanescentes: `'Hora'`/`'Minuto'` (TimePicker), `'Buscar...'` (MultiSelect), `Remover ${label}`, `'Negrito'` etc. e `'URL do link:'` (RichText), `'Falha ao carregar PDF'`.
- `PreviewSystemRenderer`: a prop `sarak` ficou sem uso além do comparador do memo.

**Pendências / riscos**
- **Item 10 (PDF):** `usePdfDocument.ts` já usa `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)`; no `dist` isso resolve para `dist/pdfjs-dist/build/…`, que não existe. Entregar o worker "dentro do pacote" exige copiá-lo no build (fora do §3.1) e arrisca desencontro de versão com a peer `pdfjs-dist >=4`. Precisa de decisão do dono.
- **Snapshot `PreviewCanvas`** vermelho (item 8): decidir entre atualizá-lo (efeito desejado: atalho "CTRL K" visível) ou restringir o item. A mudança também altera o widget de busca para todo consumidor — merece nota em `docs/migracoes.md`.
- Suíte completa e `npm run build` a reexecutar após decisão.

## Resumo da execução (correção 1) — 2026-10-09

**Resultado:** Concluído

**Achado 1 — JSDoc de `error`.** `SarakSelect.tsx` e `SarakTextarea.tsx`: a frase agora diz que a mensagem é ligada ao campo por `aria-describedby` (pelo `SarakFieldError`), que também marca `aria-invalid`. Nome e tipo da prop intactos.

**Achado 2 — snapshot do `PreviewCanvas` + nota.** Diff lido antes de gravar: só entrou o `<div class="absolute right-3 ...">` com o atalho "CTRL K" e o campo passou de `pr-4` para `pr-11`. Atualizado com `npx vitest run -u src/features/DesignEngine/Canvas/__tests__/PreviewCanvas.test.tsx` (o vitest executou a suíte inteira apesar do filtro, mas `Snapshots 1 updated`; `git status -- "*.snap"` → só `PreviewCanvas.test.tsx.snap`). Frase acrescentada na minha seção de `docs/migracoes.md` ("O `SarakInput` passa a mostrar `leftIcon` e `rightIcon` juntos… o da direita é clicável"). `npm run guide`, `catalog` e `dev-kit` rodados depois.

**Achado 3 — R34 no `SarakSelect`.** `useSarakUI()` trocado por `useSarakUIOptional()?.design` (`SarakSelect.tsx`). Teste novo "sem Provider (R34)" em `SarakSelect.test.tsx`: monta sem `SarakUIProvider` e confere a borda `1px solid` do default.

**Achado 4 — verificações finais.**
- `npx vitest run` (inteira) → 422 arquivos, 2502 testes, todos verdes.
- `npm run build` → exit 0 (gates de barril, tipos públicos, prefixo, ícones, kit-names, CSS e BUILD_INFO passaram; nenhum check parou por edição da plan-103).
- `npx tsc --noEmit` → 0 erros; `check-audit-baseline --with-tsc` → igual ao baseline.

**Arquivos alterados nesta rodada:** `SarakSelect.tsx`, `SarakTextarea.tsx`, `SarakSelect.test.tsx`, `PreviewCanvas.test.tsx.snap`, `docs/migracoes.md`; regenerados `docs/component-catalog.*`, `sarak-ui/`, `sarak-dev/`, `dist/`.

**Estado do worktree ao iniciar a rodada:** o da execução anterior, mais `specs/00-backlog.md` modificado por outra mão (não é meu).

**Decisões e suposições:** o item 10 não foi feito, conforme a emenda.

**Pendências / riscos:** nenhum.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-09 — 🔴 Reprovado

**Conferido pelo revisor no código:** os nove átomos desenham o erro pelo `SarakFieldError` (2 ocorrências em cada:
import e uso); o falso hook virou `compositeCardLayoutClassName` fora de `hooks/`; o parâmetro morto
`useSystemDesign` saiu; `globalBackgroundBlendMode` saiu do documento; os rótulos do intervalo e do grupo de horário
saem do catálogo (`part5`); o `SarakInput` mostra os dois ícones; o `SarakSelect` tem `label` e liga o erro por
`aria-describedby`. A nota de `--theme-text` não afirma o que não foi provado (em que major deixou de ser emitida).

**Emenda (2026-10-09):** o **item 10** sai desta plan — o default do worker resolve relativo ao `dist/` em qualquer
instalação, e o conserto pede uma decisão do dono (copiar o worker no build ou exigir `workerSrc`):
`00-backlog` item 18. Os textos em português que sobraram fora do escopo: item 19.

**Achados**

1. **Dois JSDoc ficaram falsos.** `SarakSelect.tsx:15` e `SarakTextarea.tsx:9` dizem que o erro "não é associado
   por `aria-describedby`" — agora é (`:69` e `:55`). O §3.2 mantém nome, tipo e JSDoc da prop `error` para não
   mudar o contrato, não para deixar a documentação mentir: corrija as duas frases para o comportamento real.
2. **O snapshot do `PreviewCanvas` está vermelho por consequência direta do item 8** (o campo de busca do preview
   passa `leftIcon` + `rightIcon`, e o atalho "CTRL K" agora aparece). Autorizado atualizar esse snapshot, com o diff
   lido (só o ícone da direita aparecendo). A mudança chega a todo consumidor que passa os dois ícones: acrescente à
   sua seção de `docs/migracoes.md` uma frase dizendo que o `SarakInput` passa a mostrar `leftIcon` e `rightIcon`
   juntos (o da direita, clicável).
3. **R34 no `SarakSelect`.** `SarakSelect.tsx:42` chama `useSarakUI()`, que lança sem Provider — o arquivo foi editado
   nesta plan e os testes dele montam o Provider por isso. Troque por `useSarakUIOptional()?.design`, como o
   `SarakInput` e o `SarakTextarea`, com um teste do `SarakSelect` sem Provider.
4. **A verificação final não foi feita.** A suíte completa não foi repetida depois do ajuste do `SarakSelect`, e o
   `npm run build` não rodou (o §5 passo 12 o pede, e o build carrega o `public-types:check`). Rode os dois no fim.

Status: `🔵 Em correção`.

## Veredito — 2026-10-09 (correção 1) — 🟢 Aprovado

**Os quatro achados fecharam, conferidos no código:** (1) o JSDoc de `error` do `SarakSelect` e do `SarakTextarea`
descreve o comportamento real — a mensagem ligada ao campo por `aria-describedby`, pelo `SarakFieldError`; (2) o
snapshot do `PreviewCanvas` mudou só pelo atalho "CTRL K" à direita (`pr-4` → `pr-11`), e a nota de migração diz que
o `SarakInput` passa a mostrar os dois ícones, o da direita clicável; (3) `SarakSelect.tsx:44` lê o tema por
`useSarakUIOptional()?.design` (R34), com teste sem Provider; (4) pelo executor, suíte inteira 422/2502 verde,
`npm run build` com `public-types:check` verde, `tsc` 0 e baseline igual. Não repetidos pelo revisor: as mudanças
desta rodada são de JSDoc, de um hook trocado pelo da mesma família e de um snapshot com o diff descrito.

**Aviso, sem achado:** a frase nova atribui o `aria-invalid` ao `SarakFieldError` ("…pelo `SarakFieldError`, que
também marca `aria-invalid`"), mas quem marca é o próprio átomo (`SarakSelect.tsx:70`, `SarakTextarea.tsx:55`). O
efeito descrito é verdadeiro — o campo sai com `aria-invalid` —; a atribuição é que é imprecisa.

**A plan está completa** (itens 3 a 9 e 11; o 2 estava resolvido antes, e o 10 foi para o `00-backlog`, item 18).
Status: `🟢 Aprovada`. A síntese (destino §8) espera o commit e o seu sinal.

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
