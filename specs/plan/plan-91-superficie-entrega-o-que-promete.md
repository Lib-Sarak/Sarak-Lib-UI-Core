---
tipo: "plan"
titulo: "Fazer a superfície pública entregar o que o contrato dela promete"
objetivo: "Alinhar ao contrato publicado sete pontos em que a superfície pública promete uma coisa e entrega outra, com o erro de campo passando a ter uma forma só"
dominio: "Sarak-Lib-UI-Core / Superfície pública / Átomos e persistência"
status: "🔴 A executar"
prioridade: "Média"
tags: ["plan", "superficie-publica", "atomos", "persistencia", "i18n"]
relacionados: ["[[03-superficie-publica]]", "[[09-temas-e-presets]]", "[[10-seguranca-e-acessibilidade]]", "[[06-painel-de-customizacao-e-preview]]"]
depende_de: "plan-90-css-que-so-o-navegador-mede"
retida_por: ""
destino_sintese: "arquitetura/03-superficie-publica.md"
---

# 1. Objetivo

Sete pontos em que a lib promete uma coisa e entrega outra passam a cumprir o que está publicado — e o erro
de campo, que hoje tem duas formas visuais, passa a ter **uma**.

# 2. Contexto

Todos os itens foram conferidos contra o código em 2026-10-02. O que os une: **existe um contrato escrito —
numa spec, numa prop, num documento — e o comportamento diverge dele.** Todos são verificáveis em `jsdom`.

| # | A promessa | O que acontece | Onde |
|---|---|---|---|
| 1 | `onSave` recebe o conjunto de tokens **e o id do tema ativo** ([[09-temas-e-presets]] §4.4.2) | *"Aplicar Alterações Globais"* com tema do catálogo entrega o design novo com o id do tema **anterior**. `handleApplyToSystem` chama `persistDesign` **antes** de `setResolvedThemeId`, e `persistDesign` lê o id de uma ref que só se atualiza no render seguinte. A gravação automática corrige o par 1,5 s depois; quem fecha a aba nesse intervalo guarda o par errado (medido: `[design do minimalist-airy, "sarak-sovereign"]`) | `src/features/DesignEngine/hooks/useDesignDraft.ts:202-217` · `src/core/Provider/hooks/useDesignManager.ts:94-95` e `:130-145` |
| 2 | Template de dado sem `data` e sem `endpoint` não busca e não fica preso em carregamento ([[03-superficie-publica]] §6.3 — vale hoje para `SarakTable` e `SarakCardGrid`) | `SarakStats` fica em carregamento **para sempre**: o hook nasce com `loading: !initialData`, e o efeito não busca sem `endpoint` | `src/components/atomic/Templates/hooks/useSarakStatsData.ts:7` |
| 3 | A lib tem um componente de erro de campo, `SarakFieldError`: ícone + texto, `role="alert"`, id `${fieldId}-error` | **Nove** átomos têm a prop `error` e desenham o erro por conta própria, **só texto**, sem ícone e sem `role`. Um formulário que use os dois mostra duas formas | `src/components/atomic/Feedback/SarakFieldError.tsx` × `src/components/atomic/Inputs/` — `SarakInput`, `SarakSelect`, `SarakTextarea`, `SarakDatePicker`, `SarakMultiSelect`, `SarakRangeSlider`, `SarakRichText`, `SarakTimePicker`, `SarakUploader` |
| 4 | Os tokens de direção e alinhamento de cartão valem para os cartões | Valem para os quatro cartões de domínio, por `useCardLayoutStyles(design)`. O `SarakCard` composto usa `useSarakCardLayoutStyles()`, de nome quase igual: **não é hook**, não recebe `design` e devolve uma string constante. É defensável — as peças do cartão composto são explícitas —, mas não está escrito em lugar nenhum | `src/components/atomic/Cards/hooks/useSarakCardLayoutStyles.ts` · `src/components/atomic/Cards/SarakCard.tsx:17` |
| 5 | Todo texto da lib segue o idioma escolhido ([[10-seguranca-e-acessibilidade]] §3.6) | Três textos em português fixo: a categoria `'Sistema'` (é o que chega à tela no Shell), `'mínimo'`/`'máximo'` no rótulo acessível do intervalo, e `'Horário'` | `src/shared/hooks/useModuleDiscovery.ts:36` · `src/components/atomic/Inputs/SarakRangeSlider.tsx:106` e `:117` · `src/components/atomic/Inputs/SarakTimePicker.tsx:66` |
| 6 | O documento de extensibilidade lista os tokens do fundo global | Lista `globalBackgroundBlendMode`, que **saiu do schema** | `docs/extensibilidade-de-layout.md:54-55` |
| 7 | O parâmetro `useSystemDesign` promete o design **do sistema** | Lê `sarak.design`, que hoje inclui o rascunho. Nenhum ponto de chamada passa `true`: é código morto com nome enganoso | `src/features/DesignEngine/Canvas/PreviewCanvas.tsx:111-116` · `src/features/DesignEngine/Canvas/components/PreviewSystemRenderer.tsx:14`, `:54`, `:65`, `:87` |

**Decisão do dono (2026-10-02), item 3:** vence a forma do `SarakFieldError`. Os nove átomos passam a usá-lo
por dentro.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `src/features/DesignEngine/hooks/useDesignDraft.ts` e `src/core/Provider/hooks/useDesignManager.ts` —
  item 1. `src/core/Provider/types.ts`, se a assinatura de `persistDesign` precisar acompanhar.
- `src/components/atomic/Templates/hooks/useSarakStatsData.ts` — item 2.
- Os nove átomos de `src/components/atomic/Inputs/` listados acima — **só** a renderização do erro.
- `src/components/atomic/Cards/hooks/useSarakCardLayoutStyles.ts`, o teste dele e `SarakCard.tsx` — item 4.
- `src/shared/hooks/useModuleDiscovery.ts`, `SarakRangeSlider.tsx`, `SarakTimePicker.tsx` e o catálogo de
  textos em `src/core/i18n/` — item 5.
- `docs/extensibilidade-de-layout.md` — item 6.
- `PreviewCanvas.tsx` e `PreviewSystemRenderer.tsx` — item 7.
- Testes ao lado do que mudou (`__tests__/`), e os snapshots **dos nove átomos**.
- `dist/`, `sarak-ui/`, `sarak-dev/`, `docs/component-catalog.*` — regenerados. Nunca à mão.

## 3.2 Fora (o que NÃO pode ser tocado)

- **`SarakFieldError.tsx`** — é a forma que venceu; não muda.
- O layout do `SarakSelect` (invólucro, campo e seta) — foi da `plan-90`.
- A prop `error` em si: nome, tipo (`string`) e JSDoc ficam. Não nasce prop nova nos átomos.
- A gravação automática de `useDesignManager` e o atraso dela.
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

1. **Item 1.** Ao aplicar um tema do catálogo, a **primeira** chamada de `onSave` já recebe o design novo
   com o id do tema **que está sendo aplicado**. Teste de regressão na borda pública: aplicar um tema do
   catálogo e conferir os dois argumentos da primeira chamada.
2. **Item 2.** `SarakStats` sem `data` e sem `endpoint` termina o carregamento e não busca. Teste.
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
5. **Item 5.** Os três textos passam a vir do catálogo de textos, nos idiomas que ele oferece. Teste: com
   outro idioma, cada um muda.
6. **Item 6.** `docs/extensibilidade-de-layout.md` deixa de citar `globalBackgroundBlendMode`.
7. **Item 7.** O parâmetro `useSystemDesign` sai dos dois arquivos, com o ramo que ele alimentava.
8. `npm run build` — ele roda os gates de catálogo, barril, tipos públicos e prefixo.
9. `npm run dev-kit`. `npx tsc --noEmit` → zero erros. `npx vitest run` → verde. `npm run audit` contra o
   baseline → sem regressão.

# 6. Critérios de aceite

- [ ] **1** — teste prova que a primeira chamada de `onSave` após aplicar um tema do catálogo leva o design
      e o id **desse** tema.
- [ ] **2** — teste prova que `SarakStats` sem as duas props sai do carregamento e não chama a rede.
- [ ] **3** — `git grep -n "error && (" -- src/components/atomic/Inputs` não devolve nenhum `<p` de erro
      desenhado à mão; os nove átomos importam `SarakFieldError`; um teste por átomo prova o `role="alert"` e
      a associação por `aria-describedby`.
- [ ] **4** — nenhum arquivo de `src/` cita `useSarakCardLayoutStyles`; o comentário existe no ponto de uso.
- [ ] **5** — os três textos mudam com o idioma, provado por teste; nenhum dos três literais em português
      sobra nos arquivos.
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

Os itens 1, 5, 6 e 7 não deixam texto: o comportamento correto já está especificado ([[09-temas-e-presets]]
§4.4.2 e [[10-seguranca-e-acessibilidade]] §3.6), ou é limpeza.

> A síntese é ato do **revisor** ([[00-prompt-revisor]]), e o gatilho é do **usuário**: o revisor propõe ao
> aprovar e espera autorização. Esta seção apenas a prepara.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
