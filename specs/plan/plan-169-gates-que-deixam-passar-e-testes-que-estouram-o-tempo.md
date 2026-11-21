---
tipo: "plan"
titulo: "Fechar os pontos cegos de quatro gates, gerar a tabela de temas do guia e acabar com os testes que estouram o tempo sob carga"
objetivo: "Fazer o auditor de hardcode, o chrome-token-parity e o zero-brand verem o que hoje deixam passar, tirar o rastro de plan da 01-gates-e-baseline, gerar a tabela de arquétipos do guia a partir do catálogo de temas e deixar a suíte de unidade verde sob a carga do npm version"
dominio: "Qualidade / Gates e suíte"
status: "🔴 A executar"
prioridade: "Média"
tags: ["plan", "gates", "suite", "guia", "release-9-0-0"]
relacionados: ["[[01-gates-e-baseline]]", "[[05-cromo-e-slots]]", "[[09-temas-e-presets]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/01-gates-e-baseline.md + specs/05-cromo-e-slots.md"
---

# 1. Objetivo

Os gates acusam o que hoje passa sem ser visto. A tabela de temas do guia do importador sai do gerador. A suíte de unidade fica verde
sob a carga do `npm version`: o `preversion` roda `coverage:check`, que é a suíte inteira, e um teste que estoura o tempo derruba a
release depois de uns 40 minutos.

# 2. Contexto

Seis itens do backlog, promovidos pelo dono em 2026-11-21 para entrar antes da tag 9.0.0. Nenhum lote precisa de build nem de
navegador, então esta plan roda em paralelo com a 167, a 168 e a 170.

| # | Ponto cego | Onde |
|---|---|---|
| 10 | A coluna *Cobra* da tabela de gates cita a plan de origem entre parênteses; o `trail-citation:check` não lê spec | `specs/specs/01-gates-e-baseline.md` §2.2 |
| 21 | O `auditor_hardcoded` só varre `.tsx`: classe com medida literal num `.ts` (como `kanbanLayout.ts` e `calendarLayout.ts`) passa | `gates/scripts/audit/auditor_hardcoded.mjs` |
| 22 | O `chrome-token-parity:check` varre só `schema/navigation.ts` e parte de `system.ts`: token de cromo em `schema/global.ts` (como `mobileNavigationStyle`) passa sem o consumidor provado | `gates/scripts/contrato/check-chrome-token-parity.mjs` |
| 84 | O `zero-brand:check` procura só três frases fixas: a marca d'água "SARAK TWIN" passou | `gates/scripts/contrato/check-zero-brand.mjs` |
| 77 | A tabela de arquétipos de tema do guia é escrita à mão: tema novo ou removido a deixa velha, e os 7 temas resgatados não estão nela | `sarak-ui/GUIA-FRONTEND.md` § "Escolha a base pela marca", gerado por `scripts/generate-consumer-kit.mjs` |
| 89 | Testes de unidade passam de 5 s sob carga e passam sozinhos: `src/core/Design/palette/__tests__/switch-glass-border.test.ts` (falha também no `HEAD`), `PaletteGallery.registry.test.tsx`, `src/core/Design/presets/themes/__tests__/compose.test.ts` e `BarSample.test.tsx` | os quatro testes |

**Regra comum.** Alargar um gate pode acusar violação que já existe.
- Violação que é do código, corrige-se no código.
- Uma exceção legítima (como a condição de container query, que não pode ser `var()`) vira isenção explícita no gate, com o motivo
  escrito.
- Nenhuma violação nova entra no baseline.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `specs/specs/01-gates-e-baseline.md` — só a coluna *Cobra* da §2.2 (lote 1).
- `gates/scripts/audit/auditor_hardcoded.mjs`, `gates/scripts/contrato/check-chrome-token-parity.mjs`,
  `gates/scripts/contrato/check-zero-brand.mjs` e os testes deles (lote 2).
- Os arquivos de `src/` em que os gates alargados acharem violação do código, só para corrigi-la (lote 2). Se passar de 10 arquivos,
  pare e traga ao revisor.
- `scripts/generate-consumer-kit.mjs` e os gerados de `sarak-ui/` (lote 3).
- Os quatro testes do #89 (lote 4).

## 3.2 Fora (o que NÃO pode ser tocado)

- O baseline da auditoria (`gates/`): nenhuma violação nova entra nele.
- O tempo padrão de teste do vitest para a suíte inteira. O conserto é por teste.
- Os arquivos das plans 167, 168 e 170: `src/styles/_elements.css`, `SarakTitleCard.tsx`, `src/components/engines/charts/`,
  `src/core/i18n/`, `DecisionTokenList.tsx`, os componentes do cromo e `browser-tests/`.
- Qualquer refactor não listado em §5.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/01-gates-e-baseline.md` | o que cada gate cobra |
| Spec fixa | `specs/specs/05-cromo-e-slots.md` §2.4.1 | os tokens de cromo e o consumidor provado |
| Spec fixa | `specs/specs/09-temas-e-presets.md` §5 | o catálogo de temas que a tabela do guia lista |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `ui-auditoria-modulo` | os auditores |
| Código | `gates/scripts/audit/auditor_hardcoded.mjs` | o filtro de extensão |
| Código | `gates/scripts/contrato/check-chrome-token-parity.mjs` | o escopo de schema |
| Código | `gates/scripts/contrato/check-zero-brand.mjs` | `BRAND_LITERALS` |
| Código | `scripts/generate-consumer-kit.mjs` | o gerador do guia |

# 5. Instruções de execução

Os lotes são independentes e podem rodar em qualquer ordem.

**Lote 1 — #10.** Na coluna *Cobra* da §2.2, cada "(plan-N)" vira a regra, a spec ou o ADR que o gate cobra. Se não houver um, a
citação sai. Conte as citações antes e depois.

**Lote 2 — #21, #22, #84.**

2.1. `auditor_hardcoded` passa a varrer `.ts` também. A condição de container query é isenção explícita, com o motivo.

2.2. `chrome-token-parity` cobre todo token de cromo, em qualquer arquivo de `schema/`. Se o escopo tiver de ter limite, ele fica escrito
no cabeçalho do gate e na [[05-cromo-e-slots]] §2.4.1.

2.3. `zero-brand` procura a marca por padrão, e não por lista de frases. "SARAK TWIN" é reprovado, e o nome do pacote e os prefixos
técnicos (`sarak-`, `--sarak-`, `Sarak` em nome de componente) são isenção explícita.

2.4. Para cada gate, faça um teste de mutação que planta o caso que passava (classe com medida em `.ts`, token de cromo em `global.ts`
sem consumidor, uma marca nova em texto visível) e veja o gate reprovar.

2.5. Para cada violação que os gates alargados acharem: corrija no código ou isente com motivo, e liste no resumo.

**Lote 3 — #77.** O gerador monta a tabela de arquétipos a partir do catálogo de temas. Um tema novo entra nela sem mexer no guia, e o
`guide:check` reprova a tabela velha.

**Lote 4 — #89.**

4.1. Meça o tempo de cada um dos quatro testes sozinho e sob a carga da suíte inteira (`npx vitest run`).

4.2. Conserte a causa por teste: o laço sobre 78 paletas × 2 modos, a montagem repetida, a espera. Não basta só subir o tempo. Se algum
precisar de tempo próprio, o valor fica no teste, com o motivo.

4.3. Prova: `npm run coverage:check` verde duas vezes seguidas.

**Verificação, em cada lote:** `npm run verify -- --tier=quick`, os gates tocados e `check-audit-baseline --with-tsc`.

# 6. Critérios de aceite

- [ ] Nenhuma "(plan-N)" na coluna *Cobra* da §2.2.
- [ ] Os três gates reprovam o caso que antes passava (mutação no resumo), com as isenções escritas.
- [ ] Toda violação achada pelos gates alargados corrigida ou isenta com motivo; nada novo no baseline.
- [ ] Tabela de arquétipos gerada, com os 7 temas resgatados; o `guide:check` reprova a tabela velha.
- [ ] Os quatro testes do #89 verdes sob carga; `coverage:check` verde duas vezes seguidas.
- [ ] `tsc` 0 e Anel 1 verde.

# 7. Como verificar (uso do revisor)

**Gate:** os três gates alargados, o `guide:check` e o `coverage:check`.

- `git diff --stat` → só os arquivos de §3.1.
- Mutação dos três gates numa cópia fora do repositório: cada um reprova o caso plantado.
- `npm run coverage:check` → verde.
- Anel 1, `check-audit-baseline --with-tsc` e Anel 0 sobre as linhas adicionadas.

# 8. Destino da síntese

**Destino:** `specs/01-gates-e-baseline.md + specs/05-cromo-e-slots.md`

- **01:** o que cada gate alargado cobra agora, com as isenções, e a regra de que tempo de teste se conserta por teste.
- **05 §2.4.1:** o escopo do `chrome-token-parity`.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->
