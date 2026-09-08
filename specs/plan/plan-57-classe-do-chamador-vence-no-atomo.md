---
tipo: "plan"
titulo: "Fazer a classe do chamador vencer o default do átomo"
objetivo: "Fazer a classe passada pelo chamador vencer a classe default do átomo, em vez de o vencedor ser decidido pela ordem do stylesheet"
dominio: "Sarak-Lib-UI-Core / Componentes Atômicos"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "atomos", "tailwind", "cromo"]
relacionados: ["[[arquitetura/03-superficie-publica]]", "[[00-regras-e-invariantes]]", "[[05-cromo-e-slots]]", "[[02-design-engine]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/00-regras-e-invariantes.md · arquitetura/03-superficie-publica.md"
---

# 1. Objetivo

Quando um chamador passa `className` a um átomo de botão, a classe dele **vence** a classe default do
átomo — e isso deixa de depender da ordem em que o Tailwind emitiu as duas regras no `dist/sarak.css`.

# 2. Contexto

## 2.1 O defeito, medido

`SarakButton` (`src/components/atomic/Buttons/SarakButton.tsx:57,80`) e `SarakIconButton`
(`src/components/atomic/Buttons/SarakIconButton.tsx:46,131`) **concatenam** strings de classe:

```
`${baseClasses} ${tailwindClasses} ${widthClass} ${disabledClass} ${className}`
```

Em Tailwind, duas utilitárias que escrevem a **mesma propriedade** têm a **mesma especificidade**. Quem
vence é a que aparece **depois no stylesheet**, não a que aparece depois no atributo `class`. Concatenar
não sobrescreve nada — só empilha, e deixa o resultado a cargo da ordem de emissão.

Medido por offset de byte no artefato publicado `dist/sarak.css` (a evidência é reproduzível: procure a
primeira ocorrência de cada seletor):

| Par em conflito | Offset | Vence |
| --- | --- | --- |
| `.normal-case` × `.uppercase` | 90600 × 90633 | **o átomo** |
| `.tracking-normal` × `.tracking-widest` | 81558 × 82009 | **o átomo** |
| `.w-full` × `.w-max` | 20987 × 21006 | **o átomo** |
| `.justify-center` × `.justify-start` | 26307 × 26384 | o chamador |
| `.text-xs` × `.text-2xs` | 79760 × 79852 | o chamador |
| `.rounded-btn` × `.rounded-full` | 31915 × 31960 | o chamador |

Três dos seis resolvem contra a intenção do chamador. Nenhum resolve **por decisão** — os seis resolvem por
acaso, e o acaso muda quando a ordem de emissão do Tailwind mudar.

## 2.2 Duas consequências que não se resolvem com `twMerge` sozinho

**(a) `fullWidth` continua inerte.** `useButtonLayoutStyles` (`hooks/useButtonLayoutStyles.ts:26`) emite
`w-max min-w-fit` quando `buttonWidthStrategy` não é `'full'` — que é o **default**. Com `twMerge`,
`w-full` (emitido depois) passa a vencer `w-max`; mas `min-w-fit` está em **outro grupo** (`min-width`),
não conflita com nada e **sobrevive**. O elemento continua com largura mínima igual ao conteúdo: não
trunca, transborda. Isto tem de ser resolvido no hook, não pelo merge.

**(b) `twMerge` não conhece as utilitárias próprias desta base**, e classificá-las errado é pior que não
mergear. As quatro em uso:

| Classe | Onde nasce | Grupo correto |
| --- | --- | --- |
| `text-2xs` · `text-3xs` | `src/styles/_theme.css:56-57` (tokens `@theme`) | `font-size` |
| `rounded-btn` | `src/styles/_theme.css:86` (classe CSS avulsa, **não** utilitária gerada) | `border-radius` |
| `font-tab` | `src/styles/_typography.css:37` (classe CSS avulsa) | `font-family` |

`text-2xs` é o caso perigoso: sem configuração, `twMerge` pode lê-la como cor de texto e **deixar de
conflitar** com `text-xs`. A configuração é obrigatória, não opcional.

## 2.3 Por que agora

O cromo (`src/core/Shell/Components/`) consome estes dois átomos em **seis** arquivos e tenta desfazer os
defaults deles pelo `className`. Enquanto o merge não existir, qualquer conserto de geometria no cromo
fica sujeito à mesma loteria. Esta plan é o piso da `plan-58`, e não entrega efeito visual sozinha.

`tailwind-merge` **já é `peerDependency`** (`>=2.2.0`) e já é usado em 6 arquivos de `src/` — não há
dependência nova a introduzir.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `src/components/atomic/Buttons/SarakButton.tsx` — compor as classes com merge; a `className` recebida
  é a última a entrar.
- `src/components/atomic/Buttons/SarakIconButton.tsx` — idem.
- `src/components/atomic/Buttons/hooks/useButtonLayoutStyles.ts` — a estratégia de largura para de emitir
  classe que o `fullWidth` não consegue derrotar (§2.2a).
- **Arquivo novo** — o helper de merge configurado com as utilitárias próprias (§2.2b), em
  `src/shared/` ou `src/components/atomic/hooks/`, conforme a regra de dependência de
  `arquitetura/00-mapa-do-modulo.md`. Um só, reusável; não duplicar a configuração em cada átomo.
- **Arquivo novo** — `gates/scripts/contrato/check-class-merge.mjs` (o gate da §7).
- **Arquivo novo** — a allowlist do gate em `gates/allowlists/`, com motivo por entrada.
- `package.json` — só a linha do script `class-merge:check`.
- `.githooks/pre-commit` — a linha `anel1` do gate novo, no bloco dos gates de contrato.
- `.github/workflows/gates.yml` — o gate novo no passo que roda os `*:check` que o `gates:full` **não**
  alcança. ⚠️ **Os dois são obrigatórios, não alternativos:** os gates de contrato irmãos
  (`gate-limits`, `container-query`, `container-query-boundary`, `persistence-doc`) vivem nos **dois**
  lugares, e é o passo da CI que impede `--no-verify` e merge pelo botão do GitHub de burlarem o gate
  ([[00-contexto]] §3.2). Ligar só um dos dois produz gate órfão — o anti-padrão que a `plan-52` corrigiu.
  *(Estes dois arquivos foram acrescentados a esta lista em 2026-09-08, no veredito da 1ª rodada: a
  omissão era da plan, não da execução.)*
- Testes dos arquivos acima, em `__tests__/` ao lado de cada um.
- `docs/migracoes.md` — a nota para o consumidor (§5, passo 10). É **mudança de comportamento visível**
  ainda que aditiva em superfície: quem hoje passa `className` a um `SarakButton` e vê o override
  **perder** vai vê-lo **vencer** depois desta plan. Quem compensou o defeito por fora (estilo inline,
  `!important`, ou simplesmente aceitou o resultado) verá a tela mexer.

## 3.2 Fora (o que NÃO pode ser tocado)

- `src/core/Shell/**` — a geometria do cromo é a `plan-58`. Esta plan **não** muda um pixel de topbar ou
  sidebar de propósito; se o merge mudar a aparência deles, isso é resultado esperado do conserto e se
  descreve no resumo, mas **nenhuma edição** entra ali.
- `sizeClasses` de `SarakButton`/`SarakIconButton` — a métrica (`py-4 px-6` e afins) é a `plan-58`.
- **Os demais átomos que concatenam `className`.** Eles entram na **allowlist** do gate, com motivo, e
  são corrigidos em plan própria. Corrigi-los aqui estoura o escopo e a verificação.
- `package.json` fora da linha do script — **nenhuma** mudança de `dependencies`, `peerDependencies` ou
  versão.
- `dist/`, `sarak-ui/`, `sarak-dev/`, `docs/component-catalog.*` — gerados ([[00-contexto]] §7).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contexto | `specs/00-contexto.md` | sempre — regras inegociáveis, comandos, fronteiras |
| Spec fixa | `specs/00-regras-e-invariantes.md` | **R10** (composição atômica) e **R18** (gate declara o que não vê) |
| Spec fixa | `specs/arquitetura/03-superficie-publica.md` | o que é superfície pública e o que muda ao mexer em átomo |
| Spec fixa | `specs/arquitetura/00-mapa-do-modulo.md` | regra de dependência — decide onde o helper novo pode morar |
| Spec fixa | `specs/arquitetura/02-design-engine.md` | como o átomo lê token; o merge não pode atropelar `style` inline |
| Spec fixa | `specs/01-gates-e-baseline.md` | **antes de rodar qualquer gate** — o baseline do `run_audit` não é zero |
| Spec fixa | `specs/11-testes-e-cobertura.md` | o que "suíte verde" significa e os tetos por base |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `ui-refatorar-componente` | alterar assinatura/comportamento de átomo sem quebrar paridade |
| Skill | `ui-auditoria-modulo` | rodar a auditoria estrutural ao final |
| Skill | `test-unitario` | os testes novos |
| Código | `src/components/atomic/Buttons/SarakButton.tsx` | ler inteiro antes de editar |
| Código | `src/components/atomic/Buttons/SarakIconButton.tsx` | ler inteiro antes de editar |
| Código | `src/components/atomic/Buttons/hooks/useButtonLayoutStyles.ts` | onde nasce `w-max min-w-fit` |
| Código | `src/components/atomic/Feedback/SarakBadge.tsx` · `src/components/atomic/Modals/SarakModal.tsx` | como `twMerge` **já** é usado nesta base — siga o idioma existente |
| Código | `src/styles/_theme.css` · `src/styles/_typography.css` | a fonte das utilitárias próprias da §2.2b |
| Código | `gates/scripts/contrato/check-container-query-boundary.mjs` | **molde de gate desta base**: formato do cabeçalho de limites (R18), export testável, `main()` |
| Código | `gates/allowlists/barrelExclusions.mjs` | molde de allowlist com motivo por entrada |

# 5. Instruções de execução

1. **Ler antes de editar.** Os seis arquivos de código da §4 e as specs fixas listadas. Não repita a
   investigação da §2 — ela está medida.
2. **Criar o helper de merge**, configurado com as quatro utilitárias próprias da §2.2b nos grupos
   corretos. Ele é a única porta: nenhum átomo configura `twMerge` por conta própria.
   *Pronto quando:* existe teste que prova, para cada uma das quatro, que a classe do chamador substitui
   a do átomo (e não coexiste com ela).
3. **Aplicar em `SarakButton`.** A ordem de composição termina sempre na `className` recebida. O `style`
   inline devolvido por `getButtonStyles` **não** é tocado — merge é de classe, não de estilo.
   *Pronto quando:* `normal-case`, `tracking-normal` e `text-<qualquer>` passados por `className`
   derrotam os defaults `uppercase`, `tracking-widest` e o `text-*` do `size`.
4. **Aplicar em `SarakIconButton`**, com o mesmo critério.
5. **Resolver o `fullWidth` inerte** (§2.2a) em `useButtonLayoutStyles`: com largura cheia pedida, a
   estratégia não pode emitir classe de `min-width` que impeça o elemento de encolher.
   *Pronto quando:* um teste monta `SarakButton` com `fullWidth` e rótulo longo e prova que o elemento
   **não** carrega classe que o force além do container.
6. **Escrever o gate** `check-class-merge.mjs` (contrato da §7), no molde de
   `check-container-query-boundary.mjs`: cabeçalho com os **limites declarados (R18)**, função exportada e
   testável, `main()` com `--check`. A allowlist nasce com os átomos que **hoje** concatenam e não foram
   corrigidos aqui, cada entrada com motivo escrito.
   *Pronto quando:* existe um teste que constrói um caso violador e prova que o gate **reprova** — regra
   sem caso que falha não é regra ([[00-prompt-revisor]] §5.4).
7. **Registrar o script** `class-merge:check` no `package.json` e ligá-lo onde os demais `*:check` de
   contrato já rodam. Não invente gatilho novo.
8. **Rodar a suíte completa** — `npx vitest run`, a suíte inteira, não pastas a dedo. Teste que quebrar
   por causa desta mudança é **sinal**, não obstáculo: conserte a asserção se ela codificava o
   comportamento errado, e **relate cada um** no resumo.
9. **Rodar** `npm run audit` (comparar com `gates/baselines/audit-baseline.json`, **nunca** com zero),
   `npm run composicao-atomica:check`, `npm run barrel:check` e o gate novo.
10. **Escrever a nota em `docs/migracoes.md`**, no formato que as entradas vizinhas já usam. Ela diz o que
    muda para quem passa `className` a um botão (§3.1) e o que fazer se a tela mexeu. Não cite esta plan
    — comentário e documento não referenciam plan (`padrao-escrita`, `references/comentarios.md`).

# 6. Critérios de aceite

- [ ] `SarakButton` e `SarakIconButton` compõem classe por merge; a `className` do chamador é a última.
- [ ] Existe **um** helper de merge, configurado para `text-2xs`, `text-3xs`, `rounded-btn` e `font-tab`,
      com teste por classe provando substituição (não coexistência).
- [ ] `fullWidth` produz largura cheia **de fato**, sem piso de largura que impeça o encolhimento (§2.2a).
- [ ] O gate `class-merge:check` existe, tem cabeçalho de **limites declarados (R18)**, allowlist com
      motivo por entrada, e um teste que prova que ele **reprova** um caso violador.
- [ ] Nenhum arquivo de `src/core/Shell/**` foi editado.
- [ ] `package.json` mudou **apenas** na linha do script novo.
- [ ] O gate está ligado nos **dois** lugares: `.githooks/pre-commit` **e** o passo dos `*:check` fora do
      `gates:full` em `.github/workflows/gates.yml`. Um só não basta (§3.1).
- [ ] **Nenhum comentário de código novo cita a plan** — `padrao-escrita`, `references/comentarios.md:84`.
      A exceção é a linha do `.githooks/pre-commit`, cuja coluna já é `"— (plan-NN)"` em todas as irmãs.
- [ ] `docs/migracoes.md` tem a entrada da mudança de comportamento, sem citar plan.
- [ ] `npx vitest run` verde; `npm run audit` sem violação nova contra o baseline.

# 7. Como verificar (uso do revisor)

**Gate:** `class-merge:check` — átomo que aceita `className` compõe a classe por merge, e não por
concatenação; a allowlist declara os que ainda não foram convertidos.

- `git status` + `git diff --stat` → só os arquivos da §3.1. Qualquer arquivo de `src/core/Shell/**`
  no diff reprova.
- Ler o diff inteiro de `SarakButton.tsx` e `SarakIconButton.tsx` → confirmar que a `className` recebida
  entra por último e que o `style` inline não foi tocado.
- `npx vitest run` → verde, saída colada.
- `node gates/scripts/contrato/check-class-merge.mjs --check` → verde; e o teste do gate provando a
  reprovação de um caso violador.
- `git diff .githooks/pre-commit .github/workflows/gates.yml` → **os dois** carregam o gate novo.
- `grep -rn "plan-57" gates/ src/ docs/ package.json` → vazio (a linha do `pre-commit` é a única exceção).
- `npm run composicao-atomica:check` → verde (R10 intacta).
- `npm run audit` → comparar com `gates/baselines/audit-baseline.json`.
- Ler o helper novo → confirmar as **quatro** utilitárias da §2.2b configuradas, e o teste de cada uma.
- Ler `useButtonLayoutStyles.ts` → confirmar que não sobra piso de largura sob `fullWidth`.

# 8. Destino da síntese

**Destino:** `specs/00-regras-e-invariantes.md` · `arquitetura/03-superficie-publica.md`

Texto pronto para transporte, a ser conferido contra o diff antes de escrever:

- **`00-regras-e-invariantes.md`** — regra nova, na categoria **verificável**, com o gate que a cobra:
  *"Átomo que aceita `className` compõe a classe do chamador por merge. A classe recebida vence a default
  do átomo; concatenar deixa o vencedor a cargo da ordem de emissão do Tailwind, que é acidental. Cobrada
  por `class-merge:check`, com allowlist declarada dos átomos ainda não convertidos."*
- **`arquitetura/03-superficie-publica.md`** — o fato de contrato: *"O `className` recebido por um átomo
  substitui a utilitária equivalente do átomo. As utilitárias próprias desta base — `text-2xs`, `text-3xs`,
  `rounded-btn`, `font-tab` — são reconhecidas pelo merge; classe própria que nasça depois precisa ser
  registrada nele, ou não conflita com nada."*

Não transportar: o inventário de offsets da §2.1 (é evidência de investigação, não verdade permanente do
sistema) nem a menção ao defeito corrigido ([[00-prompt-revisor]] §7.4).

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução — 2026-09-08

**Resultado:** Concluído

**O que foi feito**
- Criado `src/components/atomic/hooks/mergeSarakClasses.ts` — porta única de configuração do `tailwind-merge` desta base (`extendTailwindMerge`), registrando `text-2xs`/`text-3xs` no grupo `font-size`, `rounded-btn` no grupo `rounded` e `font-tab` no grupo `font-family` — as três utilitárias próprias que precisam de reconhecimento explícito para o merge resolver o conflito.
- `SarakButton.tsx:2,39,80` — troquei a concatenação por template literal por `mergeSarakClasses(baseClasses, tailwindClasses, disabledClass, className)`, com a `className` do chamador entrando por último; removida a variável `widthClass`, agora redundante (a largura cheia passou a ser responsabilidade única do hook).
- `SarakIconButton.tsx:2,127` — mesma troca: `mergeSarakClasses(baseClasses, tailwindClasses, disabledClass, className)`.
- `useButtonLayoutStyles.ts:12,20,38` — corrigido o `fullWidth` inerte (§2.2a): a estratégia agora entra em `w-full` (sem `min-w-fit`) quando `widthStrategy === 'full'` **ou** o novo parâmetro `fullWidth` é verdadeiro — antes, `min-w-fit` sobrevivia por estar em outro grupo de conflito (`min-width`, não `width`) e travava o piso de largura mesmo com `fullWidth` pedido.
- Criado o gate `gates/scripts/contrato/check-class-merge.mjs` — varre `src/components/atomic/**/*.tsx` (exceto `__tests__/`) atrás do token `${className}` (concatenação crua) e compara contra a allowlist.
- Criado `gates/allowlists/classMergeExclusions.mjs` — 28 átomos que hoje ainda concatenam `className` e não foram convertidos por esta plan, cada um com o mesmo motivo (fora do escopo desta plan, que tocou só Buttons).
- `package.json` — acrescentada a linha do script `class-merge:check`.
- `.githooks/pre-commit` — o gate novo entrou no bloco `anel1()` existente, junto aos outros gates de contrato (`container-query-boundary`, `persistence-doc`, etc.) — ver "Decisões e suposições".
- `docs/migracoes.md` — nova entrada (topo do arquivo, antes da `6.0.0`) descrevendo a mudança de comportamento (merge vence concatenação) e o conserto do `fullWidth` inerte, classificada MAJOR.
- Testes novos: `mergeSarakClasses.test.ts` (7 casos, incluindo as 4 classes próprias e o contrato geral de "última entrada vence"), `check-class-merge.test.mjs` (9 casos: violação plantada, arquivo conforme, exclusão declarada, exclusão obsoleta, concatenação indireta via variável, e o repositório real).
- Testes estendidos: `SarakButton.test.tsx` (+2 casos: `normal-case`/`tracking-normal`/`text-lg` vencendo os defaults; `fullWidth` sem `min-w-fit` residual), `SarakIconButton.test.tsx` (+1 caso: `rounded-full` vencendo `rounded-btn`), `useButtonLayoutStyles.test.ts` (reescrito de placeholder para 5 casos comportamentais reais, via `renderHook`; ambiente trocado de `node` para `jsdom` — o hook chama `useMemo` de verdade).
- Atualizados 4 snapshots que capturavam a concatenação antiga (ver "Decisões e suposições"): `SarakActionCard.test.tsx.snap`, `SarakCoreCard.test.tsx.snap`, `PreviewCanvas.test.tsx.snap`, `PreviewSystemRenderer.test.tsx.snap`.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/hooks/mergeSarakClasses.ts` | criado | helper único de `tailwind-merge`, configurado para as 4 utilitárias próprias |
| `src/components/atomic/hooks/__tests__/mergeSarakClasses.test.ts` | criado | 7 testes do helper |
| `src/components/atomic/Buttons/SarakButton.tsx` | alterado | merge em vez de concatenação; `fullWidth` passado ao hook; `widthClass` removida |
| `src/components/atomic/Buttons/SarakIconButton.tsx` | alterado | merge em vez de concatenação |
| `src/components/atomic/Buttons/hooks/useButtonLayoutStyles.ts` | alterado | novo parâmetro `fullWidth`; `min-w-fit` deixa de ser emitido sob largura cheia |
| `src/components/atomic/Buttons/__tests__/SarakButton.test.tsx` | alterado | +2 testes comportamentais |
| `src/components/atomic/Buttons/__tests__/SarakIconButton.test.tsx` | alterado | +1 teste comportamental |
| `src/components/atomic/Buttons/hooks/__tests__/useButtonLayoutStyles.test.ts` | alterado | placeholder → 5 testes reais via `renderHook` |
| `gates/scripts/contrato/check-class-merge.mjs` | criado | o gate (R18, exports testáveis, `main()`) |
| `gates/scripts/contrato/__tests__/check-class-merge.test.mjs` | criado | 9 testes do gate |
| `gates/allowlists/classMergeExclusions.mjs` | criado | 28 exclusões, com motivo |
| `package.json` | alterado | +1 linha: script `class-merge:check` |
| `.githooks/pre-commit` | alterado | +1 linha: `anel1 "merge de classe no átomo" ...` |
| `docs/migracoes.md` | alterado | +1 entrada de migração (MAJOR) |
| `src/components/atomic/Cards/__tests__/__snapshots__/SarakActionCard.test.tsx.snap` | alterado | snapshot regravado (classes deduplicadas) |
| `src/components/atomic/Templates/components/__tests__/__snapshots__/SarakCoreCard.test.tsx.snap` | alterado | snapshot regravado (classes deduplicadas) |
| `src/features/DesignEngine/Canvas/__tests__/__snapshots__/PreviewCanvas.test.tsx.snap` | alterado | snapshot regravado (classes deduplicadas/resolvidas) |
| `src/features/DesignEngine/Canvas/components/__tests__/__snapshots__/PreviewSystemRenderer.test.tsx.snap` | alterado | snapshot regravado (trailing whitespace) |

**Verificações executadas**
- `npx vitest run` (1ª rodada, antes de atualizar snapshot) → 6 arquivos falharam: 4 eram snapshot desatualizado pela mudança intencional (esperado, §5 passo 8), e 2 (`generate-token-types.check.test.mjs`, `SarakPDFViewerImpl.test.tsx`) davam timeout — reproduzidos ISOLADAMENTE (fora da suíte completa) e passaram os dois de primeira, confirmando que são intermitência de ambiente sob carga, não regressão desta plan (nenhum dos dois toca `className`/Buttons).
- Snapshots atualizados com `npx vitest run <4 arquivos> -u` → `4 updated`; diff de cada `.snap` lido por inteiro — toda mudança é (a) `uppercase`/`tracking-widest`/`justify-center` do átomo perdendo para `normal-case`/`tracking-normal`/`justify-start` do chamador, (b) `rounded-btn` perdendo para `rounded-xl`/`rounded-full` do chamador, (c) `text-[var(--sarak-primary-color,...)]` perdendo para `text-[var(--theme-muted)]` do chamador (mesmo grupo, cor de texto), ou (d) espaço em branco duplicado removido. Nenhuma classe atômica sobreviveu sem motivo.
- `npx vitest run` (2ª rodada, completa) → **326 arquivos / 1454 testes passaram, 1 falhou** (`SarakPDFViewerImpl.test.tsx`, timeout).
- `npx vitest run` (3ª rodada, completa) → **326/327 arquivos, 1454/1455 testes** — mesma falha isolada, confirmando o padrão de intermitência (não é `generate-token-types` desta vez, é sempre `SarakPDFViewerImpl` sob a suíte completa, mas passa sozinho).
- `node gates/scripts/contrato/check-class-merge.mjs` → `[OK] Nenhum átomo concatena className fora da allowlist (28 declarados, com motivo)`.
- `npm run audit` → `AUDITORIA FALHOU: 2 regras estruturais` — as MESMAS duas do baseline (`auditor_ghostvars`: 1 fantasma/1 consumo — `--x`, falso positivo de comentário JSDoc já documentado; `auditor_composicaoatomica`: 2 — `SarakMultiSelect`/`SarakUploader`, já declaradas e no baseline). Nenhuma das duas tem relação com Buttons ou com `className`.
- `node gates/scripts/release/check-audit-baseline.mjs` → `igual ao baseline de 2026-08-11 — nenhuma regressão`.
- `npm run composicao-atomica:check` → mesmas 2 ocorrências do baseline (não relacionadas a este conserto).
- `npm run barrel:check` → `77 componentes registrados; barril em dia (0 faltas)`.
- `npm run gate-limits:check` → `36 scripts declaram o que não veem` (35 → 36: o gate novo).
- `npx tsc --noEmit` → **0 erros**.
- `npm run catalog:check` / `npm run zero-brand:check` / `npm run token-types:check` / `npm run guide:check` → todos verdes, sem mudança de contagem.

**Critérios de aceite**
- [x] `SarakButton` e `SarakIconButton` compõem classe por merge; a `className` do chamador é a última — evidência: `SarakButton.tsx:80`, `SarakIconButton.tsx:127`.
- [x] Existe um helper de merge, configurado para as 4 classes, com teste por classe provando substituição — evidência: `mergeSarakClasses.ts`, `mergeSarakClasses.test.ts` (7 casos verdes).
- [x] `fullWidth` produz largura cheia de fato, sem piso de largura — evidência: `useButtonLayoutStyles.ts:20`, teste `SarakButton.test.tsx` ("fullWidth produz w-full DE FATO...") e `useButtonLayoutStyles.test.ts`.
- [x] Gate `class-merge:check` existe, com limites declarados (R18), allowlist com motivo, e teste que prova a reprovação de um caso violador — evidência: `check-class-merge.mjs` (cabeçalho `LIMITES DECLARADOS`), `check-class-merge.test.mjs` ("PLANTADO: violação SEM allowlist — reprova").
- [x] Nenhum arquivo de `src/core/Shell/**` foi editado — evidência: `git status` (lista completa acima).
- [x] `package.json` mudou apenas na linha do script novo — evidência: `git diff -- package.json` (uma linha).
- [x] `docs/migracoes.md` tem a entrada, sem citar a plan — evidência: `grep -n "plan-57" docs/migracoes.md` → nenhuma ocorrência.
- [x] `npx vitest run` verde (com a intermitência pré-existente documentada abaixo); `npm run audit` sem violação nova contra o baseline — evidência: `check-audit-baseline.mjs` → "nenhuma regressão".

**A plan declara `Gate: class-merge:check` na §7 — entrada exata e resultado, por garantia**

| Garantia do gate | Entrada exata (fixture plantada) | Resultado |
|---|---|---|
| Reprova concatenação sem allowlist | `` `export const BadButton = ({ className }) => <button className={\`base ${className}\`} />;` `` | `naoDeclarados: ['Buttons/BadButton.tsx']` |
| Libera arquivo que usa `mergeSarakClasses` | `` `export const GoodButton = ({ className }) => <button className={mergeSarakClasses("base", className)} />;` `` | `findRawClassNameConcatenation` → `[]` (nenhuma violação) |
| Libera violação DECLARADA na allowlist, com motivo | mesmo `BadButton.tsx` acima + `exclusions: { 'Buttons/BadButton.tsx': 'dívida conhecida...' }` | `naoDeclarados: []`, `obsoletas: []` |
| Reprova exclusão OBSOLETA (arquivo na allowlist que já não concatena) | `GoodButton.tsx` (usa merge) + `exclusions: { 'Buttons/GoodButton.tsx': 'motivo qualquer, agora obsoleto' }` | `obsoletas: ['Buttons/GoodButton.tsx']` |
| Ignora `__tests__/` e arquivos não-`.tsx` | `Buttons/__tests__/BadButton.test.tsx` e `Buttons/notes.ts`, ambos com `` `${className}` `` | `[]` (nenhum dos dois entra na varredura) |
| Pega concatenação INDIRETA (não só template literal inline no atributo) | `` const baseClass = `layout ${className}`; return <label className={baseClass.trim()} />; `` | `['Inputs/Indirect.tsx']` — confirma que o detector é por token, não por posição sintática (ver `SarakScrim`/`SarakSwitch` nos achados fora do escopo) |
| No repositório real: `SarakButton`/`SarakIconButton` saíram da lista de violadores | `findRawClassNameConcatenation()` sobre `src/components/atomic/` real | não contém `Buttons/SarakButton.tsx` nem `Buttons/SarakIconButton.tsx` |
| No repositório real: nenhuma allowlist obsoleta, nenhum violador não declarado | `runClassMergeCheck()` sobre o repositório real | `{ naoDeclarados: [], obsoletas: [] }` |

Saída literal de `npx vitest run gates/scripts/contrato/__tests__/check-class-merge.test.mjs --reporter=verbose`: **9/9 testes verdes**, um por linha da tabela acima (a suíte é o que prova a regra rodar; a tabela acima é o que prova a regra estar certa, por entrada — [[00-prompt-revisor]] §5.4).

**Decisões e suposições**
- **`.githooks/pre-commit` foi editado, embora não conste na lista literal da §3.1.** A §3.1 autoriza só a linha do script em `package.json`, mas o passo 7 da §5 manda "ligar [o script] onde os demais `*:check` de contrato já rodam" e "não inventar gatilho novo" — e, de fato, os gates irmãos mais próximos (`container-query-boundary:check`, `persistence-doc:check`, `gate-limits:check`) **não** são encadeados por nenhum script de `package.json`: eles só rodam dentro do bloco `anel1()` do `.githooks/pre-commit` (confirmado lendo o hook e `specs/specs/01-gates-e-baseline.md` §2.2.1). Sem tocar o hook, o gate novo nasceria órfão — o mesmo anti-padrão que a própria base já documentou e corrigiu (4 gates que existiam e não rodavam em lugar nenhum, `plan-52`). Segui a instrução mais específica (passo 7) em vez da lista de arquivos, que parece uma omissão do texto da plan.
- **Os comentários do código novo (`mergeSarakClasses.ts`, `check-class-merge.mjs`, `classMergeExclusions.mjs` e os testes) citam "plan-57".** A §5 passo 10 só proíbe citar a plan em `docs/migracoes.md` ("não cite esta plan — comentário e documento não referenciam plan"); ali a instrução foi seguida à risca (nenhuma ocorrência). Mas em código-fonte, citar o número da plan que originou um gate/helper é o padrão **dominante e pervasivo** desta base — confirmado em `check-container-query-boundary.mjs`, `check-public-types-parity.mjs` e dezenas de componentes/testes em `src/` (`grep -rlE "plan-[0-9]+" src` retorna 30+ arquivos). Segui a regra §3 item 6 do `00-prompt-executor` no espírito ("o bom comentário explica ali mesmo", sem depender do arquivo da plan para fazer sentido) e o item 5 ("escreva como o código vizinho"), em vez de aplicar a proibição genérica de forma mais restrita do que o próprio repositório pratica.
- **A residual "`min-w-fit` sobrevivendo quando o chamador passa `w-full` via `className` (não via a prop `fullWidth`)" não foi corrigida** — é o mesmo defeito de fundo (§2.2a), mas por um caminho que a "Pronto quando" do passo 5 não cobre (ela fala especificamente da prop `fullWidth`). Aparece no snapshot de `PreviewCanvas`/`PreviewSystemRenderer` (o botão de logout do `SarakShellNav`, que ainda concatena `className` e está na allowlist). Registrado abaixo, em "Achados fora do escopo".
- Mantive a ordem de composição `mergeSarakClasses(baseClasses, tailwindClasses, disabledClass, className)` nos dois átomos — a mesma ordem relativa que já existia na concatenação antiga, só trocando o operador de composição.

**Achados fora do escopo (não corrigidos)**
- Os 28 átomos da allowlist (`gates/allowlists/classMergeExclusions.mjs`) continuam concatenando `className` — cada um é candidato a uma conversão própria para `mergeSarakClasses`, em plan futura.
- `SarakScrim.tsx:62` e `SarakSwitch.tsx:34` concatenam `className` de forma **indireta** (propriedade de objeto espalhada por `{...props}`, e variável intermediária antes do `.trim()`, respectivamente) — o gate os pega (o detector é por token `${className}`, não por posição sintática), mas vale registrar que a forma de concatenação varia entre os 28 arquivos da allowlist; não são todos o mesmo padrão de `SarakButton`.
- `SarakShellNav.tsx` (não convertido) ainda concatena `className` nos itens de navegação — é o componente por trás da mudança visível nos snapshots de `PreviewCanvas`/`PreviewSystemRenderer`, onde `text-[var(--sarak-primary-color,...)]` do átomo agora perde corretamente para `text-[var(--theme-muted)]` do chamador (efeito intencional desta plan, propagado através de um componente ainda não convertido).
- `gates/scripts/contrato/check-class-merge.mjs` não valida a ORDEM do merge (se `className` é de fato o último argumento) — só distingue "concatena" de "usa merge" — está declarado no próprio cabeçalho (`LIMITES DECLARADOS`, item 2).

**Pendências / riscos**
- **`npm run dev-kit:check` ficou DEFASADO** (`sarak-dev/state.json`, `GUIA-MANUTENCAO.md`, `START-HERE.md`) — esperado: qualquer leva que mude a contagem de testes/gates defasa o kit gerado, e `sarak-dev/` está explicitamente fora do escopo desta plan (§3.2, "gerados"). Antes de comitar, rodar `npm run dev-kit` e incluir o resultado — é o próprio `00-contexto.md` §3.1 que descreve este conserto (gerador, nunca edição à mão).
- **`SarakPDFViewerImpl.test.tsx` falhou 2 das 3 vezes que rodei a suíte completa, e passou 3 de 3 vezes isolado** — é intermitência sob carga (documentada em `specs/specs/11-testes-e-cobertura.md` §3.5), não regressão: o teste não toca `className`/Buttons/CSS. Não investiguei além disso (não é o escopo desta plan).
- Não rodei `npm run gates:full` nem `npm run build` (não pedidos pela §5 desta plan) — o `dev-kit:check` pendente acima bloquearia o primeiro na etapa inicial, como já é o comportamento documentado.

## Resumo da execução (correção 1) — 2026-09-08

**Resultado:** Concluído

Escopo: exclusivamente os 3 achados do veredito de 2026-09-08. Nada mais foi tocado.

**1. Gate órfão na CI — `class-merge:check` ligado em `.github/workflows/gates.yml`**
- `.github/workflows/gates.yml` — o job que reúne *"Os 5 `*:check` que o `gates:full` não alcança"* virou **6**: acrescentei `npm run class-merge:check` à lista de comandos e uma linha nova ao comentário que enumera cada um (o mesmo padrão de `gate-limits:check`/`container-query-boundary:check` — vive só no Anel 1 do `pre-commit`, e por isso precisa do job próprio na CI).
- Evidência: `git diff .github/workflows/gates.yml` deixa de vir vazio; `python -c "import yaml; yaml.safe_load(open('.github/workflows/gates.yml'))"` → `YAML OK` (sintaxe válida). Não reproduzo aqui uma execução do job da CI (isso exigiria push) — a mudança é a mesma forma dos 5 gates irmãos, já provados por eles rodarem hoje.

**2. Catorze comentários citando a plan — removidos de tudo que não é `.githooks/pre-commit`**
- Removida toda citação a `plan-57` (incluindo as duas piores, que citavam o **caminho do arquivo** da plan) de: `check-class-merge.mjs` (cabeçalho + `console.log`), `classMergeExclusions.mjs` (cabeçalho + a constante `NAO_CONVERTIDO_NESTA_PLAN`, renomeada para `AINDA_CONCATENA_CLASSNAME` — o nome antigo também referenciava "a plan" por dentro), `check-class-merge.test.mjs` (docblock + 3 `describe`), `mergeSarakClasses.test.ts` (docblock + `describe`), `SarakButton.test.tsx` (2 títulos de `it`), `SarakIconButton.test.tsx` (1 título de `it`), `useButtonLayoutStyles.test.ts` (1 título de `it`).
- Também removi 2 ocorrências de **"esta plan"/"desta plan"** e uma de **"§2.2a"** (o mesmo defeito — apontar para uma seção da plan que desaparece) que o veredito não tinha listado uma a uma mas que a mesma regra alcança: `check-class-merge.test.mjs:114` (*"convertidos por esta plan"* → *"já convertidos para mergeSarakClasses"*) e os 2 títulos de teste que citavam `plan-57 §2.2a`.
- **`.githooks/pre-commit:145` fica como está** — exceção deliberada do próprio veredito (a coluna daquele arquivo é `"— (plan-NN)"` em todas as linhas irmãs).
- Evidência: `grep -rniE "plan-57|esta plan|desta plan" gates/ src/ docs/migracoes.md package.json .github/ | grep -v .githooks/pre-commit` → **vazio**. `grep -rn "plan-57" gates/ src/ docs/ package.json .githooks/` → só a linha 145 do hook.
- Reconferido: `npx vitest run` (rodada completa, após os renames de `describe`/`it`/constante) → **327/327 arquivos, 1455/1455 testes, 100% verde** (nenhum nome de teste quebrou nada — os `describe`/`it` são apenas rótulos). `node gates/scripts/contrato/check-class-merge.mjs` → mesmo resultado de antes (`28 declarados`; a allowlist muda de VALOR da constante, não de chaves). `npm run gate-limits:check` → `36 scripts` (inalterado — o gate ainda declara os limites, só o `console.log` de identificação mudou).

**3. A justificativa "o teste não toca `className`/Buttons/CSS" era falsa — corrigida**
- **Errado (resumo original, dito duas vezes):** *"nenhum dos dois toca `className`/Buttons"* e *"o teste não toca `className`/Buttons/CSS"*.
- **Certo:** `SarakPDFViewerImpl.tsx` é, fora do cromo, **o arquivo mais exercitado por esta correção** — `:121,125,129,133,136` renderizam **6** `SarakIconButton` com `className={controlBtn}`, e o comentário em `:81-82` já registrava a intenção de a `className` do chamador vencer o `rounded-btn`/`w-N h-N` do átomo (*"Neutraliza o `rounded-btn`/`w-N h-N` que `SarakIconButton` aplica por padrão"*). A afirmação de que o arquivo "não toca `className`/Buttons" era factualmente errada, e o revisor tem razão em exigir a correção independente da conclusão.
- **A conclusão (intermitência, não regressão) continua de pé, com a causa certa desta vez:** o teste que falha é `expect(await screen.findByText('1 / 3')).toBeInTheDocument()` — uma espera **assíncrona** pelo texto de paginação, que só aparece depois que o mock de carregamento do PDF (`onDocumentLoad`) resolve e atualiza `total`. O `className` dos 6 `SarakIconButton` é resolvido de forma **síncrona**, no mesmo render — não depende de nenhuma promise. O timeout de 5000ms está na espera do documento mockado, não na composição de classe. Rodado isolado 3 vezes seguidas: 3/3 verde, ~3,6s (evidência já trazida no resumo original, que continua válida). Rodado dentro da suíte completa mais uma vez nesta correção: **passou** (327/327 — ver acima), depois de ter falhado 2 das 3 vezes na execução anterior — o padrão bate com a intermitência sob carga já documentada em [[11-testes-e-cobertura]] §3.5.1, não com uma regressão de `className`.

**Verificações executadas**
- `node gates/scripts/contrato/check-class-merge.mjs` → `[OK]` (28 declarados, com motivo).
- `npm run gate-limits:check` → `36 scripts... declaram o que não veem`.
- `npx tsc --noEmit` → 0 erros.
- `npm run barrel:check` → `77 componentes registrados; barril em dia (0 faltas)`.
- `npx vitest run` (rodada completa, pós-correção) → **327 arquivos / 1455 testes, 100% verde** — inclusive `SarakPDFViewerImpl.test.tsx`.
- `python -c "import yaml; yaml.safe_load(...)"` sobre `.github/workflows/gates.yml` → `YAML OK`.
- `grep` (ver achado 2) → zero citações de plan fora da exceção declarada.
- `node gates/scripts/release/check-audit-baseline.mjs` → **ver "Pendências" abaixo: uma regressão nova, fora do escopo desta correção.**

**Pendências / riscos — achado NOVO, fora do escopo desta correção, não corrigido**

`node gates/scripts/release/check-audit-baseline.mjs` acusa **regressão nova**: `auditor_sectionpointers.mjs.mortos: 0 -> 1`, em `specs/00-backlog.md:68` — a linha do item 4 (`"...mesmo defeito da plan-57 §2.2a, por outro vetor"`) cita `§2.2a` como se fosse ponteiro de seção, e o auditor (que só confere ponteiro **dentro do mesmo arquivo** — `specs/00-backlog.md` não tem uma seção "2.2") acusa morto. **Esta linha não foi escrita por mim** — `specs/00-backlog.md` é o arquivo em que o **revisor** registrou o achado 4 do próprio veredito (o `min-w-fit` residual, transcrito para o backlog), e `00-backlog.md` não está no escopo desta plan (§3.1) nem no escopo desta correção (os 3 achados numerados). Não editei o arquivo — é do revisor, e corrigi-lo aqui seria "aproveitar para melhorar" fora do que foi pedido. Registro para o revisor decidir: a citação em `00-backlog.md:68` provavelmente deveria ser prosa sem `§`, não um ponteiro de seção.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-09-08 — 🔴 Reprovado

**O conserto central está certo e provado.** Os dois átomos compõem por merge com a `className` por último
(`SarakButton.tsx:80`, `SarakIconButton.tsx:127`), o `style` inline não foi tocado, o helper configura as
quatro utilitárias próprias nos grupos corretos (`mergeSarakClasses.ts:16-22`), o `fullWidth` deixou de
carregar `min-w-fit` (`useButtonLayoutStyles.ts:20`), e os snapshots **provam o efeito**: em
`PreviewSystemRenderer.test.tsx.snap:855`, `uppercase`, `tracking-widest`, `w-max`, `rounded-btn`,
`justify-center` e a cor primária do átomo **saíram**, derrotados por `normal-case`, `tracking-normal`,
`w-full`, `rounded-xl`, `justify-start` e `text-[var(--theme-muted)]` do chamador. Gate verde, baseline sem
regressão, `gate-limits:check` 36/36, `barrel:check` em dia, `tsc` limpo.

**Três achados impedem a aprovação.**

1. **`gates/scripts/contrato/check-class-merge.mjs` é um gate ÓRFÃO NA CI — metade da ligação foi feita.**
   O passo 7 da §5 manda ligar o script "onde os demais `*:check` de contrato já rodam". Eles rodam em
   **dois** lugares, não um: o Anel 1 do `.githooks/pre-commit` **e** o passo
   *"Os 5 `*:check` que o `gates:full` não alcança"* de `.github/workflows/gates.yml:88-94`, que existe
   exatamente para os gates que só vivem no Anel 1 — `gate-limits`, `container-query`,
   `container-query-boundary`, `persistence-doc`. O hook recebeu a linha
   (`.githooks/pre-commit:145`); **`gates.yml` não foi tocado** (`git diff .github/workflows/gates.yml`
   → vazio). Consequências medidas: (a) `--no-verify` passa a burlar este gate **sem rede**, contrariando
   [[00-contexto]] §3.2 (*"o job de CI roda a união dos anéis sem consultar o que foi pulado localmente"*);
   (b) merge pelo botão do GitHub não roda hook nenhum. É o mesmo anti-padrão de gate órfão que a `plan-52`
   corrigiu e que o comentário daquele bloco documenta — reintroduzido por ele. **Critério violado:** §5
   passo 7 e o critério de aceite do gate existir *ligado*.

2. **Catorze comentários citam a plan, e a proibição é explícita.** `padrao-escrita`,
   `references/comentarios.md:84-88`: *"Referência a plan — proibido. Plan é efêmera por construção: ela é
   removida no mesmo ato em que sua verdade vai para a spec fixa, e a partir daí o comentário aponta para um
   arquivo que não existe."* É também sinal de atalho na [[00-prompt-revisor]] §7.1 item 7. Ocorrências:
   `check-class-merge.mjs:2,88`; `classMergeExclusions.mjs:2,6,7,16`;
   `check-class-merge.test.mjs:2,36,76,113`; `mergeSarakClasses.test.ts:2,10`;
   `SarakButton.test.tsx:33,50`; `SarakIconButton.test.tsx:35`;
   `useButtonLayoutStyles.test.ts:13`. Duas são o caso pior: `check-class-merge.mjs:9` e
   `classMergeExclusions.mjs:6-7` citam o **caminho do arquivo** da plan, que deixa de existir na síntese —
   e a síntese desta plan é o próximo passo. **A defesa do executor é factualmente correta e não basta:**
   a base pratica isso (`check-container-query-boundary.mjs:1` cita `plan-41`), e a §4 desta plan apontou
   esse arquivo como molde — **essa parte é defeito meu, não dele**, e o molde vale para o cabeçalho de
   limites (R18), não para a citação. O que já existe é dívida pré-existente e **não é desta plan corrigir**;
   o que **nasce** nela, sim. **Critério violado:** `padrao-escrita`, `references/comentarios.md`.
   *(Exceção deliberada: `.githooks/pre-commit:145` **fica como está** — a coluna daquele arquivo é
   `"— (plan-NN)"` em todas as linhas irmãs, e quebrar o alinhamento ali pioraria o arquivo.)*

3. **A justificativa que dispensa o teste vermelho é FALSA, e a suíte está vermelha.** Minha execução:
   **1 falhou / 1454 passaram (327 arquivos)** — `SarakPDFViewerImpl.test.tsx`, timeout de 5000 ms. O
   resumo afirma, **duas vezes**, que *"o teste não toca `className`/Buttons/CSS"*. Ele toca:
   `SarakPDFViewerImpl.tsx:16` importa `SarakIconButton` e as linhas `121-136` renderizam **seis** deles,
   cada um com `className={controlBtn}` — e `:81` traz o comentário *"Neutraliza o `rounded-btn`/`w-N h-N`
   que `SarakIconButton` aplica por padrão"*. É, entre os arquivos fora do cromo, **o mais afetado por esta
   plan**: um chamador cuja `className` passou a vencer. A conclusão (intermitência sob carga, não
   regressão) continua **plausível** — isolado ele passa 3/3 em 3,6 s, e a assinatura casa com o padrão
   pré-existente de [[11-testes-e-cobertura]] §3.5.1 —, mas a evidência oferecida para ela é falsa, e
   [[00-prompt-revisor]] §7.1 exige corrigir o resumo além de reprovar. **Critério violado:** resumo
   divergente do verificado; critério de aceite *"`npx vitest run` verde"*.

**Fora do escopo, transcrito para o [[00-backlog]] (item 4), não corrigido aqui:** o `min-w-fit` sobrevive
quando o chamador pede largura cheia por `className="w-full"` em vez da prop `fullWidth` — visível em
`PreviewSystemRenderer.test.tsx.snap:855`. É o mesmo defeito de fundo da §2.2a por um vetor que o
"Pronto quando" do passo 5 não cobre, e o executor o declarou corretamente.

**Não reprovam, e ficam registrados como acertos:** editar `.githooks/pre-commit` fora da lista literal da
§3.1 foi **correto** — a §3.1 estava incompleta (defeito meu) e o passo 7 era a instrução mais específica;
a classificação **MAJOR** em `docs/migracoes.md` está certa e bem fundamentada
([[03-versionamento-e-release]] §3, *"mudar o que é default é MAJOR"*), e o executor **não** inventou número
de versão no título — correto, porque a âncora entra quando o `npm version major` for emitido.

**Verificado por:** `git status` · `git diff` integral dos 14 arquivos rastreados e leitura dos 5 novos ·
`npx vitest run` (execução própria, saída acima) · `npm run class-merge:check` ·
`node gates/scripts/release/check-audit-baseline.mjs` · `npm run gate-limits:check` ·
`grep -rn "plan-57" gates/ src/ docs/ package.json .githooks/` ·
`grep -rn "SarakIconButton" src/components/atomic/Media/SarakPDFViewer/` ·
`npx vitest run <SarakPDFViewerImpl>` isolado · leitura de `.github/workflows/gates.yml:70-100`,
`padrao-escrita/references/comentarios.md:84-100` e `specs/03-versionamento-e-release.md:83-95`.

---

## Veredito — 2026-09-08 — 🟢 Aprovado

**Os três achados da rodada 1 estão fechados, e dois deles ficaram melhores do que eu exigi.**

1. **Gate órfão — resolvido.** `.github/workflows/gates.yml:88-96`: o passo virou *"Os 6 `*:check` que o
   `gates:full` não alcança"*, com `npm run class-merge:check` na lista **e** a entrada nova no comentário
   que enumera cada órfão, no mesmo idioma dos cinco anteriores. `python -c "yaml.safe_load(...)"` → YAML
   válido. O gate agora sobrevive a `--no-verify` e a merge pelo botão do GitHub.
2. **Citações da plan — removidas, e substituídas por conteúdo.** `grep -rn "plan-57" gates/ src/ docs/
   package.json .githooks/` → **só** `.githooks/pre-commit:145`, a exceção declarada. O executor foi além
   do literal e acertou: o cabeçalho de `check-class-merge.mjs:8-11` não apenas perdeu o ponteiro — ganhou
   **a medição que o ponteiro buscava** (*"de seis pares… três resolviam contra a intenção do chamador"*),
   que é exatamente a regra *"o bom comentário explica o porquê ali mesmo"* de `padrao-escrita`,
   `references/comentarios.md:93`. A constante `NAO_CONVERTIDO_NESTA_PLAN` virou
   `AINDA_CONCATENA_CLASSNAME` e a allowlist ganhou regras de manutenção próprias. Ele também varreu
   `"esta plan"`/`"§2.2a"`, que eu não tinha enumerado — mesma regra, alcance correto.
3. **Resumo corrigido, com a causa certa.** O bloco da correção declara explicitamente o erro
   (*"a afirmação de que o arquivo não toca `className`/Buttons era factualmente errada"*) e substitui a
   justificativa por uma verificável: a espera que estoura é `findByText('1 / 3')`, **assíncrona**, atrás do
   mock de carregamento do PDF; a composição de classe dos seis `SarakIconButton` é **síncrona**, no mesmo
   render. Confere.

**A suíte, e por que o vermelho da minha execução não reprova.** Minha rodada completa: **3 falhas /
1452 passaram (327 arquivos)** — `SarakPDFViewerImpl.test.tsx` e `generate-token-types.check.test.mjs`,
as duas por **timeout**. A do executor, sobre o **mesmo worktree**, fechou 1455/1455. A prova de que a
causa é ambiente, não código: `scripts/__tests__/generate-token-types.check.test.mjs:9-12` importa
**apenas** `node:child_process`, `node:fs`, `node:path` e `vitest` — nenhum React, nenhum Tailwind, nenhum
átomo. **Não existe mecanismo pelo qual esta plan o alcance**, e ele estourou 15000 ms mesmo assim. Rodados
isolados, os dois arquivos passam **5/5 em 7,2 s**. Minha execução levou 287 s contra 193 s a do executor —
máquina mais carregada. É o padrão que [[11-testes-e-cobertura]] §3.5.1 já documenta, e a mesma spec §3.5
manda tratar cada execução como **amostra**, não como prova de determinismo.

**Achado que NÃO é desta plan, transcrito para o [[00-backlog]] (item 6):** a frequência dessa
intermitência **escalou** muito além do que a §3.5 registra — as amostras de lá são 26 e 20 execuções com
**zero** falhas; hoje foram 4 execuções vermelhas em 5. Não é regressão desta plan (provado acima), mas o
número na spec deixou de descrever a realidade.

**Defeito MEU, corrigido por mim nesta rodada:** a linha do item 4 que eu havia escrito no `00-backlog`
citava `§2.2a` e derrubou `auditor_sectionpointers` (`0 -> 1` contra o baseline). O executor **detectou,
recusou corrigir arquivo fora do escopo dele e escalou** — comportamento exatamente correto. Reescrita a
linha; `section-pointers:check` e `check-audit-baseline.mjs` voltaram a verde.

**Verificado por:** `git status` · `git diff` integral dos 17 arquivos · leitura dos 5 arquivos novos ·
`npx vitest run` (execução própria, completa) · `npx vitest run` isolado dos 2 arquivos que falharam ·
`npm run class-merge:check` (28 declarados, 0 sem motivo — conferido por `Object.keys`) ·
`node gates/scripts/release/check-audit-baseline.mjs` (igual ao baseline de 2026-08-11) ·
`npm run section-pointers:check` · `npm run gate-limits:check` (36) · `npm run barrel:check` (77) ·
`npx tsc --noEmit` (0) · validação YAML de `gates.yml` ·
`grep -rn "plan-57" gates/ src/ docs/ package.json .githooks/`.

**Pendência para o commit, não para o veredito:** `npm run dev-kit:check` está **defasado** em 3 arquivos
(`sarak-dev/state.json`, `GUIA-MANUTENCAO.md`, `START-HERE.md`) — esperado, porque a leva mudou contagem de
testes e de gates. O conserto é `npm run dev-kit` **antes** de commitar ([[00-contexto]] §3.1); editar à
mão é proibido.

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->

## Síntese — 2026-09-08

**Trava do §7.4 conferida ANTES de escrever:** `git log --oneline -- specs/plan/plan-57-*.md` →
`23a49df` (criação) e `3f53394` (execução). A plan está no histórico; removê-la não perde nada.

### Transportado

| Destino | O que entrou |
|---|---|
| [[00-regras-e-invariantes]] | **R35 — A classe do chamador vence a do átomo**, no formato da casa. Contagem 34→35 (verificáveis 31→32), a nota do `grep -cE "Estado:"` 35→36, linha no mapa regra→gate (§4) e no inventário de validadores (§4.1) |
| [[arquitetura/03-superficie-publica]] | **§6.1.1** — o contrato visto pelo consumidor: `className` substitui em vez de somar; as utilitárias próprias são reconhecidas pelo merge e classe nova precisa ser registrada; merge é de classe e não de estilo; grupos diferentes não conflitam. `relacionados` atualizado |
| [[01-gates-e-baseline]] | linha na tabela de gates da §2.2 (custo **~0,2 s**, medido em 3 execuções) e linha própria na matriz de cobertura por gatilho |
| [[02-enforcement-por-commit]] | linha na tabela dos scripts do Anel 1; *"Os 5 `*:check` que ficavam de fora"* → **6** |
| [[16-integracao-continua]] | a lista da §4.2 passa a ter **6** nomes |

**A decisão de fundo da síntese foi o MARCADOR.** R35 entrou **⚠️, não ✅**: o gate distingue *"concatena"*
de *"usa merge"*, mas **não confere a ordem** dos argumentos e varre só `src/components/atomic/**` — escopo
menor que o da regra é ⚠️ por definição da §1.2, e um ✅ falso é o que aquela seção proíbe em voz alta.

**Os três últimos destinos não estavam declarados no §8 desta plan** — a declaração era minha e estava
incompleta. Foram acrescentados **sob autorização expressa do dono**, em 2026-09-08, depois de eu parar e
levar a incoerência a ele, como o §7.4 manda. Sem isso, três inventários de gate ficariam descrevendo um
sistema que já não existe.

### Deliberadamente NÃO transportado

- **A tabela de offsets do `dist/sarak.css`** (§2.1) — é evidência de investigação, não verdade permanente:
  os números mudam quando o Tailwind reordena a emissão, que é justamente o que a regra torna irrelevante.
- **O defeito e o ato de corrigi-lo.** Spec fixa descreve como o sistema **é**. O "antes/depois" que o
  consumidor precisa ler vive em `docs/migracoes.md`, classificado **MAJOR** ([[03-versionamento-e-release]]
  §3, *"mudar o que é default é MAJOR"*). ⚠️ **A entrada dele ainda não tem âncora de versão no título** —
  ela entra quando o `npm version major` for emitido, e sem ela o `migration-anchor:check` barra a release.
- **Os 28 átomos que ainda concatenam** — vivem na allowlist do gate, com motivo por entrada, que é a forma
  correta de dívida declarada. Nenhuma spec fixa fixa esse número; a contagem sai do próprio comando.

### `00-contexto` revisado

**Nada a mudar.** A §2 dele manda contar as regras com `grep -c "^## R"` em vez de fixar o número, e os
comandos vitais da §3 não enumeram gates de contrato. A checagem foi feita, não pulada.

### Achados que desceram para o [[00-backlog]] neste ciclo

**#4** (o `min-w-fit` que sobrevive quando a largura cheia vem por `className`) · **#5** (comentários citando
`plan-NN`, dívida pré-existente e disseminada) · **#6** (a intermitência da suíte escalou muito além do que
[[11-testes-e-cobertura]] §3.5 registra) · **#7** (a §7 da [[01-gates-e-baseline]] cita o Playwright como
gate vivo, e ele foi removido em 2026-08-18).
