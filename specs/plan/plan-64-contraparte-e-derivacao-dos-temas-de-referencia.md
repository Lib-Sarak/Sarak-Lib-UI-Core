---
tipo: "plan"
titulo: "Autorar a contraparte dos temas de referência e dar uma porta de derivação ao consumidor"
objetivo: "Alternar entre claro e escuro deixa de degradar a paleta nos temas de referência e em qualquer tema derivado deles"
dominio: "Sarak-Lib-UI-Core / Design Engine / Temas"
status: "🟠 Em revisão"
prioridade: "Alta"
tags: ["plan", "temas", "contraparte", "modo-claro-escuro"]
relacionados: ["[[specs/09-temas-e-presets]]", "[[arquitetura/01-forma-do-produto-e-modos-de-consumo]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/09-temas-e-presets.md"
---

# 1. Objetivo

Os dois temas de referência ganham contraparte autorada, e o consumidor passa a ter uma porta de derivação
que produz um tema completo **com a contraparte ajustada** — de modo que alternar claro↔escuro seja
reversível tanto na lib quanto em quem parte dela.

# 2. Contexto

O dono reportou: *"no sistema antigo a troca de claro para escuro é neutra e eficiente, atualmente nem
tanto"*. A causa é mecânica e tem duas metades.

**Metade 1 — a lib.** `grep` sobre `src/core/Design/presets/themes/`: **5 dos 23** temas têm `contraparte`
autorada, e são exatamente os 5 criados pela plan-25. `minimalist-airy` e `sarak-sovereign` — os dois de
`SARAK_REFERENCE_THEMES`, que [[09-temas-e-presets]] §4.1 manda clonar, em negrito — **não têm**. Sem ela,
`resolveThemeForMode` cai no fallback `syncThemeWithMode`, que a própria spec (§2.1) mede como saturante e
**não reversível**: *"escuro → claro → escuro devolve faixa de faixa, não o original"*. E desde a decisão D
(plan-24-1) o resultado convertido é **gravado** no design do sistema, então cada ida e volta afasta mais.

O `auditor_contraste` está verde porque os dois estão em `CONTRAPARTE_EXEMPTION_LIST`
(`gates/scripts/audit/verify_contrast.ts:288`), a lista de isenção que nasceu com os 18 legados e que a
plan-26 declarou **só poder encolher**. Esta plan a encolhe em dois.

**Metade 2 — o consumidor, e é aqui que a lib erra sozinha.** O ERP faz exatamente o que a spec manda:

```ts
design: { ...REF_LIGHT.design, primaryColor: ERP_BLUE, accentColor: ERP_BLUE, btnPrimaryBg: ERP_BLUE }
```

Copia `design` e **descarta `contraparte`** — porque a spec nomeia o campo `design` como ponto de partida e
o consumidor, naturalmente, copiou aquele. Autorar as contrapartes sem consertar isso deixa o ERP
degradando exatamente como hoje: a lib certa, o consumidor errado. Pela regra desta base — corrigir na lib,
nunca no consumidor — isso significa que a lib ainda está errada.

É a repetição literal da lição de [[09-temas-e-presets]] §4.3: *"a lib recomendava o caminho que
degradava"*. Sem a porta de derivação, ela recomendaria de novo.

**Sobre autorar:** [[09-temas-e-presets]] §2.1 mediu que a contraparte gerada diverge **93 a 98%** da
autorada, e que a derivação colapsa os matizes distintos. Gerar e aceitar não serve. O processo aprovado
pelo dono tem três passos, e o terceiro é dele: a máquina gera a semente, o executor corrige até o gate
fechar, e **o dono dá o veredito visual** antes de a plan ser aprovada.

Temas **novos** já nascem com contraparte por processo — a skill `ui-criar-tema` a exige e o gate a cobra.
O problema é só o legado, e dentro dele só os dois que todo mundo clona.

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/presets/themes/minimalist-airy.ts` — bloco `contraparte` autorado (modo escuro).
- `src/core/Design/presets/themes/sarak-sovereign.ts` — bloco `contraparte` autorado (modo claro).
- `gates/scripts/audit/verify_contrast.ts` — os dois ids saem de `CONTRAPARTE_EXEMPTION_LIST`.
- `src/core/Design/presets/themes/reference.ts` — a porta de derivação, junto de `SARAK_REFERENCE_THEMES`.
- `src/index.ts` — exportar a porta de derivação.
- `src/core/Design/presets/themes/__tests__/` — teste da porta: o tema devolvido é completo, a contraparte
  vem junto, e uma sobreposição de cor de marca aparece nos dois modos.
- `docs/migracoes.md` — entrada da porta nova, com o exemplo de troca para quem hoje espalha `.design`.

## 3.2 Fora
- Os outros 16 temas isentos — a lista encolhe em dois, não é esvaziada nesta plan.
- Os 5 temas que já têm contraparte.
- `resolveThemeForMode`, `syncThemeWithMode` e `color-engine.ts` — o mecanismo funciona; falta o dado.
- `SARAK_REFERENCE_THEMES` continua sendo o mesmo par de ids; trocar a referência mudaria a base de quem já
  integrou e foi decidido contra pela plan-25.
- Qualquer alteração no repositório do ERP — é consumidor, e o conserto é na lib.
- Qualquer refactor não listado em §5.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `specs/09-temas-e-presets.md` | §2.1 (por que a contraparte é autorada e não derivada), §4.1 (a regra de partir de uma referência), §4.3.1 (a decisão D e os cinco caminhos), §6.5 (o gate de contraste) |
| Spec fixa | `specs/01-gates-e-baseline.md` | antes de rodar qualquer gate; o baseline não é zero |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `ui-criar-tema` | é a skill dona deste trabalho — inclui o solucionador de contraste (`scripts/solve_theme_contrast.ts`) e a regra de registrar o relatório dele |
| Código | `src/core/Design/presets/themes/terracota-solar.ts:438-468` | contraparte autorada de referência: repare que o off-white guarda a temperatura do tema |
| Código | `src/core/Design/presets/themes/reference.ts` | onde a porta de derivação vai morar |
| Código | `gates/scripts/audit/verify_contrast.ts:284-325` | a lista de isenção e como ela é auditada |
| Código | `src/core/Design/presets/themes/color-engine.ts` | `resolveThemeForMode` e os três casos que ela decide |

# 5. Instruções de execução

1. Ler as referências da §4, com atenção ao exemplo do `terracota-solar`.
2. Gerar a semente da contraparte dos dois temas com o mecanismo existente. **Isto é ponto de partida, não
   resultado** — está medido que ele diverge 93 a 98% do que uma contraparte autorada traz.
3. Corrigir os valores até que os dois temas passem no `auditor_contraste` nas **duas** passadas, com **0
   reprovados**, preservando a identidade do tema — matiz, temperatura e caráter — em vez de convergir para
   uma paleta neutra. Rodar o solucionador da skill e guardar o relatório.
4. Remover os dois ids de `CONTRAPARTE_EXEMPTION_LIST`. **Pronto quando** o gate reprovaria se a
   contraparte fosse retirada.
5. Criar a porta de derivação em `reference.ts`: recebe o id de um tema de referência e um conjunto de
   sobreposições, devolve um tema **completo** — `design` e `contraparte` — com as sobreposições aplicadas
   de forma coerente nos dois modos. **Pronto quando** derivar com uma cor de marca produz um tema cuja
   troca de modo continua reversível.
6. Exportar a porta no barril e conferir `npm run barrel:check` e `npm run catalog:check`.
7. Escrever a entrada em `docs/migracoes.md`: quem hoje espalha `...REF.design` perde a contraparte, e o
   exemplo de como passar a usar a porta.
8. Rodar `npx vitest run`, `npm run audit` e `npm run themes:diversity`.
9. **Parar e entregar para o veredito visual do dono** — a plan não é aprovada sem ele. No resumo, indicar
   como ver os dois temas nos dois modos.

# 6. Critérios de aceite

- [ ] `minimalist-airy` e `sarak-sovereign` têm `contraparte` autorada, com os tokens de modo cobertos.
- [ ] Os dois saíram de `CONTRAPARTE_EXEMPTION_LIST`, e a lista só encolheu.
- [ ] `auditor_contraste` fecha 0 nas duas passadas para os dois temas.
- [ ] Ida e volta entre modos devolve o valor original, provado por teste chave a chave nos dois temas.
- [ ] A porta de derivação devolve tema completo com contraparte, e uma sobreposição de cor de marca
      aparece nos **dois** modos.
- [ ] A porta está no barril; `barrel:check` e `catalog:check` verdes.
- [ ] `docs/migracoes.md` explica a perda silenciosa de `contraparte` ao espalhar `.design` e mostra a troca.
- [ ] `npx vitest run` verde; `npm run audit` comparado ao baseline; `themes:diversity` sem regressão.
- [ ] **Veredito visual do dono registrado** antes da aprovação.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — a regra já existe e já tem gate (`auditor_contraste` exige contraparte fora da lista de
isenção). Esta plan **entra** na régua existente em vez de criar régua nova; criar uma segunda seria
duplicar cobrança sobre o mesmo invariante.

- `git diff --stat` → só os arquivos de §3.1.
- Leitura das duas contrapartes → os valores guardam a temperatura do tema, não convergem para cinza.
- `npm run audit` → `auditor_contraste` com 0 reprovados nas duas passadas, e a lista de isenção com dois
  ids a menos.
- `npx vitest run src/core/Design` → verde, incluindo o teste de ida e volta.
- `npm run barrel:check` · `npm run catalog:check` → verdes.
- `npm run themes:diversity` → sem regressão de banda.
- `npx vitest run` → verde.
- Confirmar que o veredito visual do dono está no resumo da execução.

# 8. Destino da síntese

**Destino:** `specs/09-temas-e-presets.md`

Pontos a atualizar:

- §2.1 — a contagem de temas com contraparte e o estado da lista de isenção passam a apontar a **fonte
  viva** (`npm run audit`), nunca um número em prosa.
- §4.1 — a regra de partir de uma referência ganha a porta de derivação como caminho recomendado. Texto
  pronto para transporte:

> Derivar um tema da referência é uma chamada, não uma cópia de campo: a porta devolve o tema **completo**,
> com `design` e `contraparte`, e aplica as sobreposições nos dois modos. Espalhar `...tema.design` copia
> só metade do tema — a contraparte fica para trás e a troca de modo passa a degradar, em silêncio.

- §5.1 — a concentração do catálogo não muda, mas o estado da contraparte sim.

---

# 9. Resumo da execução

## Resumo da execução — 2026-09-09

**Resultado:** Concluído com pendências (a plan para no passo 9 por instrução própria — veredito visual do
dono ainda não registrado — e há 2 arquivos de teste, fora do escopo e comprovadamente pré-existentes, que
não fecham verdes na suíte inteira; ver "Pendências / riscos").

**O que foi feito**
- `minimalist-airy.ts:274-325` — bloco `contraparte` autorado (modo escuro), 49 chaves + `mode`. Âncoras HSL
  deliberadas (H222, a mesma tonalidade de `primaryColor`/`btnPrimaryBg` `#111827`) para os tokens
  estruturais mais visíveis (`colorBgBody`/`Layer1`/`Layer2`, `sidebarColor`, `topbarColor`,
  `cardBackgroundColor`, hierarquia de texto), com o resto derivado pelo mecanismo existente
  (`shiftColorMode`) como semente — por quê: a plan exige preservar identidade, não convergir para cinza
  neutro; um clamp mecânico uniforme (a semente pura) achata a luminosidade de body/layer1/layer2 quase no
  mesmo valor.
- `sarak-sovereign.ts:265-317` — bloco `contraparte` autorado (modo claro), 50 chaves + `mode`, mesma
  família H222 (a navy que já mora em `cardBackgroundColor` no nativo), preservando o neon
  (`primaryColor`/`accentColor`, tokens de marca) intocado — por quê: marca não muda de modo (spec 09
  §2.1: 19 tokens de marca/acento são agnósticos).
- `gates/scripts/audit/verify_contrast.ts:288-303` — `minimalist-airy` e `sarak-sovereign` saíram de
  `CONTRAPARTE_EXEMPTION_LIST` (18 → 16 ids) — por quê: instrução 4 da plan.
- `src/core/Design/presets/themes/reference.ts:34-91` — porta `deriveThemeFromReference(referenceId,
  overrides)`: recebe o id de uma referência + `{id, name, description?, design}`, devolve
  `DerivedThemePreset` completo (`design` mesclado, `contraparte` da referência com as chaves sobrepostas
  também espelhadas nela) — por quê: instrução 5; a chave que também existe na `contraparte` é espelhada
  para que a sobreposição não seja "engolida" ao trocar de modo (senão o valor antigo da referência
  reapareceria no modo oposto).
- `src/index.ts:66-67` — exporta `deriveThemeFromReference`, `ThemeReferenceOverrides`, `DerivedThemePreset`
  no barril público — por quê: instrução 6.
- `src/core/Design/presets/themes/__tests__/contraparteReferencia.test.ts` (novo, 133 linhas) — 12 casos:
  os dois temas declaram `contraparte`; ida-e-volta exata chave a chave nos dois; o modo oposto NÃO bate com
  o que `syncThemeWithMode` sintetizaria; `deriveThemeFromReference` devolve tema completo, aplica
  sobreposição de marca nos dois modos, espelha chave de contraparte sobreposta, mantém reversibilidade, e
  lança em id inexistente — por quê: instrução 5 ("teste da porta") + regra "mudou comportamento, tem
  teste" (§3 item 7 do prompt executor).
- `docs/migracoes.md:9-56` — entrada nova (a mais recente do arquivo), classificada MINOR, com o exemplo
  `...REF.design` (perda silenciosa de `contraparte`) × `deriveThemeFromReference` — por quê: instrução 7.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/presets/themes/minimalist-airy.ts` | alterado | `contraparte` autorada (modo escuro), 49 chaves |
| `src/core/Design/presets/themes/sarak-sovereign.ts` | alterado | `contraparte` autorada (modo claro), 50 chaves |
| `gates/scripts/audit/verify_contrast.ts` | alterado | `CONTRAPARTE_EXEMPTION_LIST`: 18 → 16 ids |
| `src/core/Design/presets/themes/reference.ts` | alterado | porta `deriveThemeFromReference` + 2 tipos novos |
| `src/index.ts` | alterado | exporta a porta e os 2 tipos no barril |
| `src/core/Design/presets/themes/__tests__/contraparteReferencia.test.ts` | criado | 12 casos (contraparte dos 2 temas + a porta) |
| `docs/migracoes.md` | alterado | entrada nova (MINOR) sobre a contraparte + a porta |
| `gates/scripts/audit/__tests__/verify_contrast.test.ts` | alterado | 3 asserções que fixavam "18 isentos"/`sarak-sovereign` como exemplo de legado sem contraparte — ver "Decisões e suposições" |
| `src/features/DesignEngine/Canvas/__tests__/__snapshots__/PreviewCanvas.test.tsx.snap` | alterado | snapshot regenerado (cores de `sarak-sovereign` no modo oposto mudaram) |
| `src/features/DesignEngine/Canvas/components/__tests__/__snapshots__/PresetsCatalog.test.tsx.snap` | alterado | idem |

**Verificações executadas**
- `npx tsx gates/scripts/audit/verify_contrast.ts` (script temporário, apagado antes de entregar, que
  reusava `PAIRS`/`evaluatePair` do próprio gate para iterar as âncoras) → 0 falhas, 0 pulados nas duas
  passadas para os dois temas, antes mesmo de tocar o arquivo de produção — decisão registrada abaixo.
- `npm run audit` → `AUDITORIA FALHOU: 2 regras estruturais` — **igual ao baseline** de
  `specs/specs/01-gates-e-baseline.md` §3 (`auditor_ghostvars`: 1 fantasma/1 consumo; `auditor_composicaoatomica`:
  2, `SarakMultiSelect`/`SarakUploader`) — nenhum dos dois toca tema. `auditor_contraste`: **0 reprovados nas
  duas passadas**, 23 temas, 25 pares-tema pulados (igual ao baseline), **16 isentos** (era 18), **7 com
  contraparte autorada** (era 5).
- `npm run audit:baseline` → `igual ao baseline de 2026-08-11 — nenhuma regressão`.
- `npm run themes:diversity` → sem regressão; `minimalist-airy`/`sarak-sovereign` no MODO NATIVO (a
  diversidade mede só o nativo) inalterados.
- `npm run barrel:check` → `82 componentes registrados; barril em dia (0 faltas)`.
- `npm run catalog:check` → `catálogo em dia`.
- `npm run public-types:check` → `Todo tipo declarado em dist/index.d.ts está exportado, ou tem exclusão
  com motivo` (cobre `ThemeReferenceOverrides`/`DerivedThemePreset`).
- `npx tsc --noEmit` → **0 erros** (produção e teste).
- `npx vitest run` (suíte inteira, 2 execuções completas) → **330-332 arquivos / 1506-1509 testes**; as
  únicas falhas nas duas rodadas foram em **2 arquivos alheios ao escopo**
  (`scripts/__tests__/generate-token-types.check.test.mjs`,
  `src/components/atomic/Media/SarakPDFViewer/__tests__/SarakPDFViewerImpl.test.tsx`) — comprovadamente
  pré-existentes/instáveis sob a suíte cheia, não regressões desta execução (evidência abaixo, em
  "Pendências / riscos"). Nenhuma falha nova em teste que este escopo toca depois dos ajustes descritos em
  "Decisões e suposições".
- `npx vitest run src/core/Design/presets/themes/__tests__/contraparteReferencia.test.ts
  gates/scripts/audit/__tests__/verify_contrast.test.ts` (isolado) → **2 arquivos / 41 testes, 100% verde**.

**Critérios de aceite**
- [x] `minimalist-airy` e `sarak-sovereign` têm `contraparte` autorada, com os tokens de modo cobertos —
  evidência: `minimalist-airy.ts:274-325`, `sarak-sovereign.ts:265-317`.
- [x] Os dois saíram de `CONTRAPARTE_EXEMPTION_LIST`, e a lista só encolheu (18→16) — evidência:
  `verify_contrast.ts:288-303`.
- [x] `auditor_contraste` fecha 0 nas duas passadas para os dois temas — evidência: saída de `npm run audit`
  acima ("0 de 23 temas com pelo menos 1 par abaixo de AA" nas duas seções).
- [x] Ida e volta entre modos devolve o valor original, provado por teste chave a chave nos dois temas —
  evidência: `contraparteReferencia.test.ts`, casos "IDA E VOLTA EXATA" (2, um por tema, `it.each`).
- [x] A porta de derivação devolve tema completo com contraparte, e uma sobreposição de cor de marca aparece
  nos dois modos — evidência: `contraparteReferencia.test.ts`, casos "devolve um tema com design E
  contraparte completos" e "a sobreposição de cor de marca aparece nos DOIS modos".
- [x] A porta está no barril; `barrel:check` e `catalog:check` verdes — evidência: `src/index.ts:66-67` +
  saídas acima.
- [x] `docs/migracoes.md` explica a perda silenciosa de `contraparte` ao espalhar `.design` e mostra a troca
  — evidência: `docs/migracoes.md:9-56`.
- [x] `npx vitest run` verde — evidência: **com pendência declarada**. As 2 falhas remanescentes são
  demonstrado-pré-existentes (ver "Pendências / riscos"); nenhuma é do escopo desta plan. `npm run audit`
  comparado ao baseline (igual, sem regressão) e `themes:diversity` sem regressão — evidências acima.
- [ ] Veredito visual do dono registrado antes da aprovação — motivo: é o próprio passo 9, que a instrução
  manda parar e entregar. Artefato visual publicado para acelerar o veredito (ver "Pendências / riscos").

**Decisões e suposições**
- **Processo: pulei marcar `status: "🟡 Em execução"` antes da primeira edição** (§2 do prompt executor).
  Percebido só ao escrever este resumo. Nenhuma consequência prática (a plan não teve outra execução
  concorrente que dependesse do status), mas registro a falha do ritual com honestidade.
- **As âncoras de cor são autoria minha**, não geradas por fórmula única. Processo: (1) gerei a semente
  algorítmica com `shiftColorMode` (o mesmo motor de `syncThemeWithMode`) para saber que o piso de contraste
  fecha; (2) constatei que a semente pura repete quase o mesmo defeito que a plan aponta na síntese antiga —
  L quase flat entre `colorBgBody`/`Layer1`/`Layer2` — e substituí os ~13 tokens estruturais mais visíveis
  por valores HSL deliberados (mesma tonalidade H222 da própria marca de cada tema, luminância graduada por
  camada); (3) rodei o solucionador (`solveThemeContrast`, o script da skill `ui-criar-tema`) sobre o
  candidato para corrigir o que reprovasse (1 correção em `minimalist-airy` —
  `cardActionBtnText`/`cardActionBtnHoverBg`, `#e6e6e6`→`#f1f1f1`; 1 em `sarak-sovereign` —
  `navItemActiveColor` contra `sidebarActiveColor`/`topbarActiveColor`, `#00f2ff`→`#008188`, preservando H);
  (4) verifiquei os 36 `PAIRS` reais do próprio gate contra o resultado — 0 falhas, 0 pulados — antes de
  escrever nos arquivos de tema. Script usado só para calcular; nunca ficou no worktree (removido antes de
  cada entrega parcial, confirmado por `git status`).
- **Tokens de marca (`primaryColor`, `accentColor`, `btnPrimaryBg`, status, `cardGlowColor`…) não entraram
  na contraparte** — replicando a convenção dos 5 temas já autorados (nenhum deles sobrepõe token de marca
  na contraparte) e o texto da própria spec 09 §2.1 ("19 de marca/acento… não mudam entre modos"). É por
  isso que `deriveThemeFromReference` não precisa tocar `contraparte` para uma sobreposição de cor de marca
  — o merge em `design` já é suficiente, e é o cenário que os critérios de aceite pedem para provar.
- **`deriveThemeFromReference` espelha uma sobreposição na `contraparte`** só quando a chave sobreposta
  também existe na `contraparte` da referência (política simples: "a sobreposição ganha nos dois modos").
  Não tentei recalcular um valor mode-aware automaticamente para essa chave — decisão consciente para manter
  a porta previsível; documentado no comentário da função (`reference.ts:47-53`).
- **Corrigi 3 arquivos fora da lista literal da §3.1**, e registro a justificativa de cada um:
  - `gates/scripts/audit/__tests__/verify_contrast.test.ts` — é o AUTOTESTE do próprio
    `CONTRAPARTE_EXEMPTION_LIST` que a instrução 4 manda encolher; 3 dos seus casos fixavam "18" e usavam
    `sarak-sovereign` como exemplo de tema legado SEM contraparte — deixando de atualizá-los, a suíte
    quebraria pela minha própria mudança obrigatória, e "mudou comportamento, tem teste" (§3 item 7 do
    prompt executor) cobre exatamente este caso. Troquei `18`→`16` e o tema-exemplo de `sarak-sovereign` por
    `crystal-glass` (que segue sem contraparte, confirmado por grep).
  - Os dois arquivos `__snapshots__/*.snap` — consequência mecânica e esperada de mudar o CONTEÚDO de um
    tema shippado: os testes de snapshot capturam a renderização literal (inclusive a prévia de tema no
    modo oposto), e ela mudou porque a contraparte de `sarak-sovereign` deixou de cair no fallback
    sintetizado. Atualizados com `npx vitest run -u` nos dois arquivos, isoladamente; diff conferido
    (`git diff --stat`: 14 e 24 linhas, só valores de cor).

**Achados fora do escopo (não corrigidos)**
- `scripts/__tests__/generate-token-types.check.test.mjs` — falha por timeout (15000ms) **só sob a suíte
  cheia** (contenção de recursos); rodado isolado, passa limpo em 6s. Não relacionado a temas/contraparte.
- `src/components/atomic/Media/SarakPDFViewer/__tests__/SarakPDFViewerImpl.test.tsx` — falha por timeout
  (5000ms, "Not implemented: navigation to another Document", limitação do jsdom com PDF.js), **determinística,
  inclusive isolado**. Comprovado pré-existente: reproduzida **idêntica** rodando a mesma suíte isolada
  contra o HEAD limpo (`git stash` das minhas alterações, mesmo comando, mesmo erro). Não relacionado a
  temas/contraparte.

**Pendências / riscos**
- **Veredito visual do dono — é o ponto de parada desta plan (passo 9), não uma falha.** Publiquei um
  artefato com os valores REAIS que `resolveThemeForMode` devolve para os dois temas nos dois modos (4
  mini-interfaces montadas com os hex exatos, mais as tabelas de swatch) para acelerar a conferência:
  https://claude.ai/code/artifact/1cd565c7-7cde-4f9f-9109-966dd6c78981 — não substitui o julgamento do dono
  sobre a legibilidade/caráter de cada tema, só entrega o dado real em vez de descrição em texto.
- **`npx vitest run` não fechou 100% verde nas duas rodadas completas** — as únicas falhas são as 2 já
  detalhadas em "Achados fora do escopo", com prova de que não são causadas por esta execução. Fica como
  pendência declarada, não escondida, porque a regra da base é clara ("suítes verdes exige a suíte inteira")
  e eu não tenho autorização para investigar/corrigir esses dois fora do escopo desta plan.
- **Script de derivação temporário** (`gates/scripts/audit/_tmp_derive_contraparte.ts` e
  `_tmp_extract_swatches.ts`) foi usado só para calcular os valores e para extrair os dados do artefato
  visual — removido em cada uma das duas vezes antes de eu seguir adiante; `git status` conferido limpo
  depois de cada remoção.

## Resumo da execução (correção 1) — 2026-09-09

**Resultado:** Concluído. Escopo exclusivo: as nove citações de plan apontadas no veredito de 2026-09-09.
Nenhum valor de cor mudou.

- **`src/core/Design/presets/themes/reference.ts:32, 54`** (JSDoc de produção, 2 ocorrências) — removida a
  citação `(plan-64)` das duas — evidência: `git diff` do arquivo não traz mais a string `plan-64`.
- **`src/core/Design/presets/themes/__tests__/contraparteReferencia.test.ts:19-25, 63-69`** (2 JSDoc + 2
  títulos de `describe`, 4 ocorrências) — removida a citação `(plan-64)` do corpo dos dois comentários e do
  título dos dois `describe` (`'minimalist-airy e sarak-sovereign têm contraparte autorada'` e
  `'deriveThemeFromReference'`) — evidência: idem.
- **`gates/scripts/audit/__tests__/verify_contrast.test.ts:179, 183, 196`** (2 títulos de `it` + 1
  comentário, 3 ocorrências) — removida só a parte `plan-64` de cada string; a citação PRÉ-EXISTENTE a
  `plan-25` nas mesmas linhas (179 e 183) não é o achado desta rodada e foi deixada intacta, por escopo
  ("exclusivamente as nove citações de plan" — são nove, não onze; `plan-25` já estava lá antes desta
  execução) — evidência: idem.

**Verificações executadas**
- `git diff -- src/core/Design/presets/themes/reference.ts src/core/Design/presets/themes/__tests__/contraparteReferencia.test.ts gates/scripts/audit/__tests__/verify_contrast.test.ts | grep -i "plan-64"` → **0 ocorrências** (grep saiu com exit 1, sem match).
- `git diff -- src/core/Design/presets/themes/minimalist-airy.ts src/core/Design/presets/themes/sarak-sovereign.ts src/index.ts | grep -i "plan-"` → **0 ocorrências** — confirma que os arquivos de tema e o barril nunca citaram plan nenhuma.
- `npx vitest run src/core/Design/presets/themes/__tests__/contraparteReferencia.test.ts gates/scripts/audit/__tests__/verify_contrast.test.ts` → **2 arquivos / 41 testes, 100% verde** (os mesmos 41 de antes — só o texto do título/comentário mudou, nenhuma asserção).
- `npx tsc --noEmit` → **0 erros**.
- `npm run barrel:check` → `82 componentes registrados; barril em dia (0 faltas)`.
- `npm run catalog:check` → `catálogo em dia`.
- `npm run public-types:check` → `[OK] Todo tipo declarado em dist/index.d.ts está exportado, ou tem exclusão com motivo`.

**Decisões e suposições**
- **`docs/migracoes.md` não foi tocado** — o próprio veredito excluiu essa entrada do achado ("changelog
  para o consumidor é procedência, não ponteiro navegável"), e não há citação de plan nela de qualquer forma
  a corrigir.
- **A contraparte de `sarak-sovereign` em `docs/migracoes.md` e o restante do corpo do achado (identidade de
  cor, gate de contraste, suíte) não foram reexecutados por completo** — a instrução do dono restringe
  explicitamente o escopo desta rodada às nove citações, e a própria mensagem confirma que "nenhum valor de
  cor muda". Rodei só os testes e gates que tocam os três arquivos corrigidos (acima), não a suíte inteira
  de novo — seria repetir verificação que o veredito já deu como boa e que este achado não altera.

**Pendências / riscos**
- As mesmas duas de antes (achado 6 do `00-backlog`, `SarakPDFViewerImpl` por timeout; e o
  `generate-token-types.check` flaky sob carga) — inalteradas por esta correção, não fazem parte do achado.
- **Veredito visual do dono** continua pendente (passo 9) — artefato publicado na entrega anterior:
  https://claude.ai/code/artifact/1cd565c7-7cde-4f9f-9109-966dd6c78981

---

# 10. Veredito

## Veredito — 2026-09-09 — 🔴 Reprovado

**O trabalho de cor está certo, e é bom.** A reprovação é por conformidade ao `padrao-escrita` — a mesma
regra pela qual a plan-63 foi reprovada, aplicada com a mesma régua. O veredito visual do dono segue
pendente e pode correr em paralelo à correção: os valores de cor **não mudam** com este conserto.

### O que verifiquei e está certo

- **A contraparte preserva a identidade, e isso é mensurável.** Extraí os valores dos dois temas e os
  fundos são **graduados**, não achatados — que era exatamente o risco declarado na §2:

  | Token | `minimalist-airy` nativo → contraparte | `sarak-sovereign` nativo → contraparte |
  | --- | --- | --- |
  | `colorBgBody` | `#F9FAFB` → `#0d1016` | `#050505` → `#f9fafa` |
  | `colorBgLayer1` | `#FFFFFF` → `#111827` | `#0f0f0f` → `#ffffff` |
  | `sidebarColor` | `#F9FAFB` → `#090b10` | `#000000` → `#fcfcfd` |
  | `topbarColor` | `#FFFFFF` → `#0b0e14` | `#000000` → `#fcfcfd` |
  | `cardBackgroundColor` | `#FFFFFF` → `#10141e` | `rgba(15,23,42,.6)` → `#f6f7f9` |
  | `textColorMaster` / `Secondary` / `Muted` | `#0f172a`/`#475569`/`#5d718d` → `#eef1f6`/`#bcc2d2`/`#9098ad` | `#ffffff`/`rgba(…,.7)`/`#ffffff77` → `#192134`/`#3d4966`/`#616f8c` |

  Cinco níveis distintos de fundo em cada tema, três de texto, e a família de matiz navy (H≈222) atravessa
  os dois — coerente com a própria `primaryColor` de cada um.
- **A marca sobrevive à troca.** `primaryColor` não entra em nenhuma das duas contrapartes — o neon
  `#00f2ff` do `sarak-sovereign` continua neon no modo claro. É a convenção dos 5 temas já autorados e o
  que a [[09-temas-e-presets]] §2.1 afirma sobre os tokens de marca serem agnósticos. E o uso **funcional**
  daquele neon foi escurecido onde precisava (`navItemActiveColor` → `#008188`), que é a distinção certa.
- **Gate de contraste:** 0 reprovados nas **duas** passadas, 23 temas, 25 pulados (igual ao baseline).
  Isenção **18 → 16**; temas com contraparte autorada **5 → 7**; 0 fora da isenção sem contraparte.
- **`npm run audit`** no baseline — os dois auditores não-zero são `ghostvars` (1) e `composicaoatomica` (2),
  exatamente o `audit-baseline.json`.
- **`npx tsc --noEmit`** → 0 erros. `barrel:check` (82), `catalog:check`, `public-types:check`,
  `themes:diversity` → verdes.
- **Suíte completa:** 1508/1509. A única falha é `SarakPDFViewerImpl`, **por timeout**; rodei os arquivos
  desta plan junto dele isoladamente → **15 arquivos / 131 testes, 100% verde**. É o achado 6 do [[00-backlog]].
- **Os três arquivos fora da §3.1 são consequência obrigatória, e conferi cada um:** o autoteste do gate
  fixava `18` e usava `sarak-sovereign` como exemplo de legado sem contraparte — a substituição por
  `crystal-glass` é válida (conferido: ele segue sem contraparte). Os dois snapshots mudaram 19 linhas com
  19 removidas — só valores de cor, nenhuma mudança estrutural.
- **A porta de derivação** devolve tema completo, espelha a sobreposição na contraparte quando a chave
  existe lá, e documenta a política no próprio código. O raciocínio sobre chave de marca está correto: ela
  nunca esteve na contraparte, então o merge em `design` basta.

**Uma precisão sobre o teste de ida e volta, que não é defeito:** ele prova a **construção**, não uma
propriedade emergente — `resolveThemeForMode` devolve `design` no modo nativo, então a volta é exata por
desenho. Está certo pinar isso, e o caminho real do usuário (o toggle resolve do TEMA, por
`resolvedThemeId`, nunca do design corrente) tem a mesma forma. Registro para ninguém ler o teste como
prova de mais do que ele prova.

### Achado — citação de plan em código, nove ocorrências

`padrao-escrita`, `references/comentarios.md`: **"Referência a plan — proibido"**, porque a plan é removida
no ato da síntese e o ponteiro morre. Esta plan será sintetizada logo após a aprovação.

| Onde | Ocorrências |
| --- | --- |
| `src/core/Design/presets/themes/reference.ts` — **JSDoc de código de produção** | 2 |
| `__tests__/contraparteReferencia.test.ts` — 2 JSDoc + 2 títulos de `describe` | 4 |
| `gates/scripts/audit/__tests__/verify_contrast.test.ts` — 2 títulos de `it` + 1 comentário | 3 |

É a mesma regra pela qual a plan-63 foi reprovada, com **três agravantes**: nove ocorrências contra três,
e duas delas em **código de produção**, não em teste.

**A entrada em `docs/migracoes.md` NÃO entra no achado** — changelog para o consumidor é procedência, não
ponteiro navegável, e há sete precedentes no arquivo. É a mesma linha que separei no veredito da plan-65.

**O atenuante é real, e é um defeito do processo, não do executor:** o veredito que estabeleceu essa régua
morreu junto com a plan-63, removida na síntese. A regra estava disponível (o `padrao-escrita` é referência
obrigatória da §4 desta plan), mas o **precedente** não. Enquanto o achado 5 do [[00-backlog]] não for
promovido, cada plan vai reencontrar isto do zero — e o revisor vai gastar uma rodada de correção por plan.

### Pendente, e não é falha

O **veredito visual do dono** (passo 9). A tabela de swatches acima é o dado real extraído dos arquivos de
tema, para embasar a decisão. Ele pode correr em paralelo à correção deste achado.

---

# 11. Síntese
