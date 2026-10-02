---
tipo: "plan"
titulo: "Prefixar com Sarak todo nome exportado pelo barril público"
objetivo: "Todo nome que o consumidor importa da lib carrega o prefixo da biblioteca, e um gate impede que um nome sem prefixo volte a entrar no barril"
dominio: "Sarak-Lib-UI-Core / Superfície pública"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "barril", "contrato-publico", "nomenclatura", "major", "gate"]
relacionados: ["[[arquitetura/03-superficie-publica]]", "[[specs/00-regras-e-invariantes]]", "[[specs/01-gates-e-baseline]]", "[[specs/03-versionamento-e-release]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/arquitetura/03-superficie-publica.md · specs/specs/00-regras-e-invariantes.md · specs/specs/01-gates-e-baseline.md"
---

# 1. Objetivo

Todo nome exportado pelo barril público começa por `Sarak`, `SARAK_`, `use` ou `sarak`, conforme a sua
espécie; um gate cobra a convenção a cada build, e a nota de migração diz ao consumidor como se chamava
cada nome antes.

# 2. Contexto

**Por que agora:** a lib está sendo importada num ERP novo, e o agente que a integra relatou que nomes
genéricos no barril (`FilterDescriptor`, `Message`, `CatalogItem`) são difíceis de distinguir dos tipos
locais do projeto dele. O ERP é o **único** consumidor e é ajustado junto com a lib, então este é o momento
mais barato de quebrar a API. Cada mês que passa encarece a mesma mudança.

**O que a leitura mediu** (revisor, 2026-09-19, sobre `dist/index.d.ts` da `6.3.0`):

- 298 nomes exportados. **116 estão fora da convenção** — 71 tipos, 22 valores (componentes, constantes) e
  23 funções.
- Entre os valores sem prefixo há **componentes públicos**: `ExpandableCard`, `ImageCard`, `FilterSelect`,
  `HelpButton`, `SocialButton` e os quatro widgets `Shell*`.
- Entre as funções há nomes de altíssima chance de colisão no projeto consumidor: `reorder`, `moveCard`,
  `widthOf`, `computeOffsets`.
- **Não há nenhuma colisão** entre um nome renomeado pela regra da §5 e um nome que já existe no barril.
  Conferido nome a nome, com o mapeamento mecânico aplicado.

> ⚠️ **A medição acima é de 2026-09-19, sobre o `dist/` da `6.3.0` — e o terreno mudou.** Entre essa data e
> 2026-10-01 entraram **dez** componentes públicos (`SarakSpinner`, `SarakFieldError`, `SarakCard` com as
> três peças, `SarakAlert`, `SarakAvatar`, `SarakDivider`, `SarakMaskedInput`, `SarakCurrencyInput`,
> `SarakAutocomplete`), mais os tipos deles. **Conferi um a um (2026-10-01): todos já nascem conformes** —
> nenhum nome novo entra na lista a renomear. Então os 116 fora da convenção não cresceram; o que mudou foi o
> total de exportados. **Não confie nos números: refaça a contagem**, como a §5 item 1 manda.
>
> E um deslocamento que você precisa saber: o `CatalogItem` (um dos nomes a renomear) **mudou de arquivo** —
> hoje é declarado em `src/components/atomic/Templates/SarakCatalogGridProps.ts` e reexportado pelo
> `SarakCatalogGrid.tsx`, por causa da extração da leva 3 de JSDoc. A renomeação toca os dois.

**A convenção existe e vale pela metade.** A skill `ui-novo-componente` já manda prefixar componente
público, mas metade da superfície nasceu antes disso, e não há gate. Regra que vale pela metade não é
cobrável — é por isso que a plan entrega regra **e** gate na mesma entrega.

**O major não é novo.** A `6.3.0` é a versão publicada e o `docs/migracoes.md` já tem entradas tituladas
`7.0.0` esperando a próxima release. Esta mudança entra nesse mesmo major; não se cria outro.

**Nenhum comportamento muda.** É renomeação de identificadores públicos, mais um gate. Nenhum componente
ganha, perde ou altera prop.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `src/index.ts` — o barril, e os exports nomeados que citarem nome antigo.
- `src/**` — a declaração de cada nome público renomeado, o arquivo que o abriga (quando o nome do arquivo
  segue o do componente) e **todos os usos internos** do nome, inclusive em `__tests__/`.
- `gates/allowlists/*.mjs` — entradas que citem nome antigo.
- `gates/scripts/contrato/check-public-prefix.mjs` — **criar**, o gate novo.
- `gates/scripts/contrato/__tests__/check-public-prefix.test.mjs` — **criar**, o teste do gate.
- `package.json` — o script `prefix:check` e a inclusão dele na cadeia do `build`.
- `docs/migracoes.md` — a entrada da migração.
- `.agents/skills/**` — referências a nome antigo no texto das skills locais.
- **`scripts/` que PROCURA ou EMITE nome público** *(extensão autorizada pelo revisor em 2026-10-01, com
  a linha medida de cada um)*. Gerador que escreve nome público é parte da superfície; deixá-lo fora torna a
  plan inexecutável, porque o artefato gerado volta ao nome antigo no primeiro `npm run build`:
  - `scripts/generate-token-types.ts` — emite o tipo no arquivo gerado (`:44`, `:67`, `:80-81`);
  - `scripts/catalogAst.mjs:163` — procura `'ICON_NAMES'` por literal;
  - `scripts/consumer-kit/collectKitSources.mjs:49,58` — procura `'THEME_PRESET_IDS'` e `'getThemePreset'`
    por literal;
  - `scripts/consumer-kit/buildKitCatalog.mjs:77` e `scripts/consumer-kit/renderAppendix.mjs:60,92` —
    escrevem o nome do tipo na **prosa do kit** que o consumidor lê;
  - `scripts/generate_themes.ts:52,54` — emite `import { ThemePreset }` e a anotação de tipo no tema gerado.

  **A regra, para não precisar de outra rodada:** qualquer arquivo de `scripts/` que case nome público por
  **literal de string** ou que **escreva** nome público (em código gerado ou em prosa do kit) entra no escopo
  pela mesma necessidade — relate no resumo cada um que você tocar, com a linha.
- Artefatos **gerados**, por regeneração e nunca à mão: `docs/component-catalog.{json,md}`, `sarak-ui/`,
  `sarak-dev/`, `dist/`, `src/core/Provider/generated/`.

- `scripts/generate-token-types.ts` — alinhar os tipos e imports emitidos ao nome público
  `SarakResponsiveValue`, substituto de `ResponsiveValue`.

- **Os demais `scripts/` que CONSOMEM nome público renomeado — autorizado pelo revisor em 2026-10-01.** A
  linha acima já abria `scripts/` para esta exata razão, e nomear só um arquivo foi omissão minha: estes leem
  a fonte procurando o nome **antigo** e quebram a build por isso. São eles, com a linha medida:
  `scripts/catalogAst.mjs:163` (`ICON_NAMES` → `SARAK_ICON_NAMES`) ·
  `scripts/consumer-kit/collectKitSources.mjs:49,58` (`THEME_PRESET_IDS`, `getThemePreset`) ·
  `scripts/consumer-kit/buildKitCatalog.mjs:77` · `scripts/consumer-kit/renderAppendix.mjs:60,92` ·
  `scripts/generate_themes.ts:52,54`. **Só a linha que nomeia um export renomeado** — isto não é licença
  geral sobre `scripts/`, e qualquer outra mudança ali é achado.

- `.claude/skills/**` — symlink para `.agents/skills/**`; `ls -ld` e `stat` confirmam o mesmo inode
  (`55732045389018309`) para `solve_theme_contrast.test.ts`. Não há segunda cópia física nem segundo teste.
  O Git, porém, rastreia 17 caminhos nos dois prefixos (modo `100644`): ao alterar um deles, indexe ambos os
  caminhos. Os demais arquivos são rastreados apenas sob `.agents/`.

## 3.2 Fora (o que NÃO pode ser tocado)

- `specs/**` — inclusive as specs que citam nome antigo. São do revisor, e entram na síntese.
- O **consumidor** (o ERP). A lib não conserta o importador; quem o orienta é a nota de migração.
- Nomes **internos** que o barril não exporta. Esta plan é sobre a superfície pública, e só.
- Qualquer mudança de comportamento, de prop ou de assinatura que não seja o nome.
- `package.json` fora do que a §3.1 permite — nada de `version`, nada de dependência nova.
- **Escrever no Git** — nem `git add`, nem `commit`, nem `stash`. A entrega fica no worktree e o resumo vai
  na §9; o commit é do dono. *(Vai repetido aqui porque duas tarefas desta mesma fila indexaram os próprios
  arquivos e travaram commits do dono.)*

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/arquitetura/03-superficie-publica.md` | o contrato do barril, o `barrel:check` e o que ele não vê |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` | R14 (barril), R17 (não transcrever fonte viva), R18 (todo gate declara o que não vê) |
| Spec fixa | `specs/specs/01-gates-e-baseline.md` | como ler a saída de cada gate, e o baseline do `audit` (que **não** é zero) |
| Spec fixa | `specs/specs/03-versionamento-e-release.md` | por que remover nome do barril é major, e o que a nota de migração precisa ter |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| Skill | `padrao-escrita` · `padrao-typescript` | sempre |
| Skill | `ui-refatorar-componente` | é a skill de alterar assinatura pública sem quebrar a paridade das três fontes |
| Código | `gates/scripts/contrato/check-public-types-parity.mjs` | o gate mais próximo do novo: lê os nomes de `dist/index.d.ts` e é o molde a copiar |
| Código | `gates/scripts/contrato/check-barrel-parity.mjs` | a disciplina de allowlist com motivo escrito (§4.1 da spec de superfície) |
| Código | `gates/scripts/contrato/check-gate-limits.mjs` | o marcador de limites que o gate novo precisa ter para passar no `gate-limits:check` |
| Código | `.githooks/pre-commit` · `package.json` (cadeia `build` e `gates:full`) | onde os gates são ligados |

# 5. Instruções de execução

1. **Rode `npm run build` ANTES de derivar qualquer coisa.** Medido em 2026-10-01: o `dist/` versionado
   está **defasado** — não conhece `SarakAlert`, `SarakAvatar`, `SarakDivider`, `SarakMaskedInput`,
   `SarakCurrencyInput` nem `SarakAutocomplete`. Derivar a lista do `dist/` velho é medir o passado, que é
   exatamente o limite que você vai declarar no cabeçalho do gate novo (item 6).

   **Depois** derive a lista, não a copie de lugar nenhum: os nomes públicos saem da última linha de
   `dist/index.d.ts` (o `export { … }` agrupado). Nenhuma lista de nomes é escrita à mão nesta plan, de
   propósito (R17).

2. **Aplique o mapeamento mecânico**, sem inventar nome bonito:

   | Espécie | Convenção | Renomeação |
   |---|---|---|
   | Componente, tipo, interface (PascalCase) | começa com `Sarak` | `Foo` → `SarakFoo` |
   | Constante (SCREAMING_SNAKE) | começa com `SARAK_` | `FOO_BAR` → `SARAK_FOO_BAR` |
   | Hook | começa com `use` | já conforme — **não mexa** |
   | Demais funções (camelCase) | contém `Sarak` | `foo` → `sarakFoo`. Função que **já** contém `Sarak` no meio do nome (`getSarakModule`, `registerSarakModule`) **já é conforme** — não mexa |

   O tipo de props acompanha o componente: `FooProps` → `SarakFooProps`, que é o que o `barrel:check`
   cobra junto com o valor.

3. **Renomeie o arquivo junto com o componente**, quando o arquivo leva o nome dele
   (`Cards/ExpandableCard.tsx` → `Cards/SarakExpandableCard.tsx`), inclusive o teste 1:1 ao lado. Cuidado
   com o Windows: renomeação que só muda caixa precisa de dois passos no git.

4. **Troque todos os usos internos** do nome antigo, em `src/`, nos testes e nas skills de `.agents/`.
   Ao terminar, nenhum nome antigo sobra como identificador fora de `docs/migracoes.md`.

5. **Se algum nome precisar ficar sem prefixo**, registre-o na allowlist do gate novo **com o motivo
   escrito ao lado**, na mesma disciplina do `barrelExclusions.mjs`. Silêncio não passa. A expectativa é
   que a lista nasça **vazia**: se você achar que precisa de entrada, diga o porquê no resumo.

6. **Crie o gate `check-public-prefix.mjs`**, no molde do `check-public-types-parity.mjs`:
   - lê os nomes exportados de `dist/index.d.ts`;
   - reprova (`exit 1`) nomeando cada nome fora da convenção e a espécie dele;
   - reprova também **entrada obsoleta de allowlist** — nome listado que já está conforme, ou que não
     existe mais, como o `barrel:check` faz;
   - declara no cabeçalho, no formato que o `gate-limits:check` reconhece, o que ele **não** vê — no
     mínimo: que ele lê o artefato construído e não a fonte, então `dist/` velho o faz medir o passado;
     e que ele julga o **nome**, nunca se o nome é bom.

7. **Ligue o gate** como `prefix:check` no `package.json` e insira-o na cadeia do `build`, **logo depois
   do `public-types:check`** — que é o ponto onde o `dist/` já existe. Não o coloque no `pre-commit`, pelo
   mesmo motivo que o `public-types:check` não está lá.

8. **Escreva o teste do gate** ao lado dele. Ele precisa ter, no mínimo, **um caso que FALHA** por nome sem
   prefixo e um que passa; mais um caso de allowlist obsoleta.

9. **Escreva a entrada em `docs/migracoes.md`**, titulada com `7.0.0` por extenso (é o que o
   `migration-anchor:check` exige). Ela traz a tabela **nome antigo → nome novo**, completa, e a frase que
   diz ao consumidor que nenhum comportamento mudou junto.

10. **Regenere os artefatos** e commite o resultado da geração:
    `npm run catalog` · `npm run guide` · `npm run dev-kit` · `npm run build`. Nenhum arquivo gerado é
    editado à mão.

11. **Rode e leia:** `npm run build` (que já encadeia `barrel:check`, `catalog:check`, `guide:check`,
    `public-types:check` e agora o `prefix:check`), `npm run audit` **comparado ao baseline**, `npm run
    gate-limits:check` e `npx vitest run` inteiro.

# 6. Critérios de aceite

- [ ] `npm run prefix:check` passa, e a allowlist dele está vazia — ou cada entrada tem motivo escrito.
- [ ] O gate reprova de verdade: renomear um nome público de volta ao formato antigo derruba o
      `prefix:check` com `exit 1`, nomeando o nome. Mostrado no resumo com a saída real.
- [ ] Entrada obsoleta na allowlist do gate novo também derruba o gate (caso mostrado).
- [ ] `npm run gate-limits:check` verde — o gate novo declara os próprios limites.
- [ ] Nenhum nome antigo sobra como identificador em `src/`, `gates/`, `scripts/` e `.agents/`; as únicas
      ocorrências são o texto de `docs/migracoes.md`.
- [ ] `barrel:check`, `catalog:check`, `guide:check`, `dev-kit:check` e `public-types:check` verdes, com os
      gerados regenerados e commitados.
- [ ] `docs/migracoes.md` tem a entrada com `7.0.0` no título e a tabela completa de nome antigo → novo.
- [ ] `npm run audit` **no baseline** (não em zero) e `npx vitest run` inteiro verde.
- [ ] Nenhuma mudança de comportamento: nenhuma prop criada, removida ou alterada no diff.

# 7. Como verificar (uso do revisor)

**Gate:** `prefix:check` — todo nome exportado pelo barril público segue a convenção de prefixo da §5,
com allowlist que exige motivo escrito e que se autolimpa.

- `git status` + `git diff --stat` → só os caminhos da §3.1; **nada** em `specs/`.
- `npm run build` → a cadeia inteira verde, inclusive o `prefix:check` novo.
- **Mutação 1:** renomear um nome público de volta ao formato antigo → `prefix:check` cai nomeando-o.
  Restaurar byte a byte.
- **Mutação 2:** pôr na allowlist um nome que já está conforme → o gate cai por entrada obsoleta.
- **Mutação 3:** apagar o bloco de limites do cabeçalho do gate novo → `gate-limits:check` cai.
- Derivar de `dist/index.d.ts` a lista de exportados e conferir, por script, que **nenhum** nome escapa da
  convenção — a mesma medição da §2, agora esperando 0.
- Conferir que a tabela de `docs/migracoes.md` cobre **todos** os nomes que o diff renomeou, sem sobra nem
  falta.
- `npx vitest run` inteiro e `npm run audit` contra `gates/baselines/audit-baseline.json`.
- `grep -rnE "plan-[0-9]+|veredito"` nos arquivos da entrega, rastreados e não rastreados.

# 8. Destino da síntese

**Destino:** `arquitetura/03-superficie-publica.md` · `specs/00-regras-e-invariantes.md` ·
`specs/01-gates-e-baseline.md`

- **`arquitetura/03`**: seção nova, junto do `barrel:check` e do `public-types:check` — a convenção de
  prefixo por espécie de nome, a allowlist com motivo e por que ela existe (o consumidor distingue o que é
  da lib do que é dele). Sem transcrever lista de nomes.
- **`specs/00-regras-e-invariantes`**: regra nova, na categoria das **verificáveis**, com o gate que a
  cobra; e a linha do inventário de quem executa o quê (§4.1).
- **`specs/01-gates-e-baseline`**: a linha do `prefix:check` na tabela de onde cada gate roda (§2.2.1) e o
  vão dele na matriz de cobertura — ele lê o artefato construído, não a fonte.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

## 2026-10-01 — execução e resultados

- **Implementação e superfície:** aplicadas as renomeações públicas previstas. A tabela de migração tem
  **114 pares únicos**; a conferência contra `dist/index.d.ts` encontrou 0 nomes novos ausentes. A medição
  inicial de 116 incluía indevidamente `getSarakModule` e `registerSarakModule`: ambos já contêm `Sarak` no
  meio do nome, portanto são conformes pela regra da §5 item 2 e não entram nos 114.
- **Geradores em `scripts/` ajustados, com as linhas da alteração:** `generate-token-types.ts:44,67,80-81`
  emite `SarakResponsiveValue` e `SarakDesignTokens`; `DesignTokenId` na linha 81 permanece interno, fora do
  barril. `catalogAst.mjs:140,161,163` coleta `SARAK_ICON_NAMES`; `consumer-kit/collectKitSources.mjs:22,
  37,47-49,51,58,148,153` coleta `SARAK_THEME_PRESET_IDS`, `sarakGetThemePreset` e
  `SarakResponsiveValue`; `consumer-kit/buildKitCatalog.mjs:77` e `consumer-kit/renderAppendix.mjs:60,92`
  escrevem os nomes públicos atuais na prosa do kit; `generate_themes.ts:52,54` emite `SarakThemePreset`.
  A varredura AST por nomes antigos em literais de `scripts/` terminou com 0 ocorrências.
- **Geração e build:** `npm run catalog`, `npm run guide` e `npm run dev-kit` concluíram; o kit reportou
  102 componentes, 427 tokens e 100 ícones. `npm run build` completo passou, incluindo os tipos gerados,
  `barrel:check`, `catalog:check`, `guide:check`, `public-types:check` e `prefix:check` (331 exports).
  `gate-limits:check` também passou: `[OK] Os 39 scripts de gates/scripts/ declaram o que não veem.`
  Os checks finais de catálogo, guia, kit dev, barrel, tipos públicos e prefixo passaram; `dev-kit:check`
  confirmou 3 arquivos e 0 ponteiros mortos.
- **Suíte:** `npx vitest run --maxWorkers=4` terminou verde: **407/407 arquivos; 2.121/2.121 testes**
  (596,68 s). Antes disso, uma execução completa padrão teve 6 falhas em 4 arquivos e outra limitada a
  quatro workers teve uma falha intermitente em `useAutocompleteSearch`; esse arquivo isolado passou 3/3,
  e a execução completa final passou sem retries.
- **Audit:** `npm run audit` saiu 1: reportou a variável fantasma `--x` e duas violações R10 já conhecidas,
  em `SarakMultiSelect.tsx:113` e `SarakUploader.tsx:113`. `npm run audit:baseline` saiu 0 e informou
  `[audit:baseline] igual ao baseline de 2026-08-11 — nenhuma regressão.`
- **Mutações da §7 (saídas reais, todas restauradas):**
  1. `SarakAccept` → `Accept` no export de `dist/index.d.ts`: `prefix:check` saiu 1 com
     `[ERROR] Accept (PascalCase) não segue a convenção de prefixo.`
  2. Exceção conforme `SarakButton` adicionada à allowlist: `prefix:check` saiu 1 com
     `[ERROR] Exceção obsoleta em publicPrefixExclusions.mjs: SarakButton.`
  3. Bloco de limites removido do gate novo: `gate-limits:check` saiu 1 com
     `[ERROR] 1 de 39 scripts SEM bloco de limite declarado:` e
     `- gates/scripts/contrato/check-public-prefix.mjs`.
- **Symlink e índice Git:** `.claude/skills/` aponta para `.agents/skills/`; a alteração do teste
  `solve_theme_contrast.test.ts` é uma só no filesystem. Esse teste tem registros duplicados no índice e foi
  indexado pelos dois caminhos (`.agents/` e `.claude/`), com blobs iguais; não foi criado commit.

**Aguardando veredito do revisor na §10.**

## Resumo da execução (correção 1) — 2026-10-01

**Resultado:** Concluído

**O que foi feito**
- Limpei as 13 citações de rastro apontadas por R36 nos arquivos de código, mantendo as explicações técnicas dos comentários.
- `src/index.ts:39,47,93,145,157,160,177` — removidas as notas de procedência das linhas de export; os exports permaneceram intactos.
- `gates/scripts/audit/verify_contrast.ts:361` — mantida a explicação de que a segunda passada usa a contraparte autorada quando existe.
- `src/components/atomic/Buttons/SarakSocialButton.tsx:32` — mantida a justificativa de que o botão social usa legitimamente um botão nativo.
- `src/components/atomic/Cards/SarakExpandableCard.tsx:88` e `src/components/atomic/Cards/__tests__/SarakExpandableCard.test.tsx:13,18` — mantida a explicação de por que `@container` precisa ser plantado dentro do portal e de que jsdom não avalia a query.
- `src/components/atomic/Navigation/SarakShellThemeToggle.tsx:24` — mantida a explicação de que a preferência controla o modo sem reescrever o design do sistema.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `gates/scripts/audit/verify_contrast.ts` | alterado | Removida a citação de execução do rótulo da segunda passada. |
| `src/index.ts` | alterado | Removidas sete citações inline, sem mudar os exports. |
| `src/components/atomic/Buttons/SarakSocialButton.tsx` | alterado | Removida a citação, preservando a justificativa do botão nativo. |
| `src/components/atomic/Cards/SarakExpandableCard.tsx` | alterado | Removida a citação, preservando a razão para posicionar `@container` no portal. |
| `src/components/atomic/Cards/__tests__/SarakExpandableCard.test.tsx` | alterado | Removidas duas citações, preservando a limitação do jsdom e a necessidade de browser real. |
| `src/components/atomic/Navigation/SarakShellThemeToggle.tsx` | alterado | Reescrita a explicação da preferência sem a referência de execução. |
| `specs/plan/plan-82-prefixo-sarak-em-toda-a-superficie-publica.md` | alterado | Acrescentado este resumo; status final `🟠 Em revisão`. |

**Verificações executadas**
- `npm run trail-citation:check` → exit 0. Saída final:
  ```text
  --- check-trail-citation (R36) ---
  [OK] Nenhuma linha adicionada cita plan, veredito ou achado de veredito.
  ```
- `npm run trail-citation:check -- --staged` → exit 0 no índice atual. Saída: `[OK] Nenhuma linha adicionada cita plan, veredito ou achado de veredito.` As correções ficaram fora do índice, conforme a instrução de não escrever no Git.
- `npm run build` → primeira tentativa no sandbox recebeu `Acesso negado` ao resolver os shims do `tsup`; a repetição autorizada com acesso ampliado terminou em exit 0. Saídas dos checks e etapas finais:
  ```text
  [token-types:check] design-token-ids.ts em dia (427 tokens).
  [catalog:check] catálogo em dia.
  [barrel:check] 96 componentes registrados; barril em dia (0 faltas).
  [zero-brand:check] 431 arquivo(s) varrido(s); zero marca da lib fora da allowlist.
  [guide:check] kit em dia (6 arquivos).
  [OK] "exports" só expõe a raiz e subcaminhos de CSS — nenhuma porta de deep import.
  ESM Build success in 666ms
  CJS Build success in 667ms
  DTS Build success in 12264ms
  [OK] Todo tipo declarado em dist/index.d.ts está exportado, ou tem exclusão com motivo.
  [prefix:check] 331 nomes exportados seguem a convenção; allowlist em dia.
  Done in 427ms
  [build-scoped-css] dist/sarak-scoped.css gerado (219.5 KB, escopo ".sarak-scope").
  [copy-base-css] src/styles/*.css copiado para dist/styles/ (export público "./sarak-base.css").
  [inject-css] CSS injetado em dist/chunk-BJTUFETG.js (197.2 KB, 1 ocorrência(s)).
  [inject-css] CSS injetado em dist/index.cjs (197.2 KB, 1 ocorrência(s)).
  [generate-build-info] dist/BUILD_INFO.json — baseCommit 2296a3a, builtAt 2026-10-01T23:22:26.118Z.
  ```
- `npx vitest run --maxWorkers=4` → exit 0; suíte integral verde. Saída final:
  ```text
  Test Files  407 passed (407)
       Tests  2121 passed (2121)
   Duration  376.97s (transform 15.15s, setup 78.31s, import 541.50s, tests 168.07s, environment 584.06s)
  ```
  Durante a execução apareceram avisos GLib e `Could not parse CSS stylesheet`; nenhum teste falhou.
- `npm run audit:baseline -- --with-tsc` → exit 0: `[audit:baseline] igual ao baseline de 2026-08-11 — nenhuma regressão.`

**Critérios de aceite**
- [x] As 13 linhas deixam de citar o rastro de execução — evidência: `npm run trail-citation:check` terminou com 0 violações.
- [x] `npm run build`, suíte completa e baseline com `tsc` concluíram com exit 0.

**Decisões e suposições**
- O arquivo lido estava com status `🔵 Em correção` e a §10 continha apenas o marcador vazio, embora o pedido descreva status `🟠 Em revisão` e um veredito datado. Usei o achado específico fornecido na mensagem; o status foi devolvido a `🟠 Em revisão`.
- O PowerShell bloqueia `npm.ps1`; os comandos foram executados por `npm.cmd`/`npx.cmd`, com os mesmos scripts e argumentos solicitados.

**Achados fora do escopo (não corrigidos)**
- Nenhum.

**Pendências / riscos**
- A execução `--staged` verificou o índice existente, não as alterações desta correção, que permaneceram fora do índice conforme instruído. O gate padrão verificou as linhas do worktree e passou; ao preparar o commit, o dono deve incluir essas correções no staging para que o Anel 1 as avalie.
- Releitura final após as verificações: a §10 já continha `## Veredito — 2026-10-01 — 🔴 Reprovado` e o achado tratado aqui. Não editei o veredito; a primeira leitura, antes das edições, havia mostrado o marcador sem o bloco.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito — 2026-10-01 — 🔴 Reprovado

**Um achado só. Todo o resto está verificado e aprovado — não se refaz nada além do item 1.**

**O que eu medi, de forma independente:**

| Trava | Resultado |
|---|---|
| Lista derivada por script meu de `dist/index.d.ts` | **331 nomes exportados, 0 fora da convenção** |
| Tabela de migração × diff real | comparei a superfície do `HEAD` (315 nomes) com a atual (331): **saíram 114**, entraram 130, e **os 114 antigos aparecem todos** em `docs/migracoes.md`. Dos 130 novos, 16 são os componentes entregues hoje (não são renomeações); **130 − 16 = 114** — bijeção exata, sem sobra nem falta |
| Mutação 1 — nome revertido ao formato antigo | `violations: [{name:"ExpandableCard", species:"PascalCase", conforms:false}]` — nomeia nome **e** espécie |
| Mutação 2 — allowlist com nome já conforme | `staleExclusions: ["SarakButton"]` |
| Allowlist com nome inexistente | `staleExclusions: ["NomeFantasma"]` — autolimpa, como a §5 item 6 exigia |
| Allowlist sem motivo | `missingReasons: ["ExpandableCard"]` — silêncio não passa |
| Nome fora da convenção **com** motivo na allowlist | passa — a porta de saída funciona |
| Mutação 3 — bloco de limites apagado | `gate-limits` cai nomeando o arquivo |
| Limites declarados (R18) | três, e o primeiro é o certo: *"um `dist/` desatualizado faz a verificação medir o passado"* — a armadilha que esta própria plan sofreu |
| Ligação do gate | `prefix:check` no `package.json` e na cadeia do `build` **logo depois** do `public-types:check`, como o item 7 pedia |
| Suíte inteira | **407/407 arquivos, 2121/2121 testes** |
| `audit:baseline --with-tsc` | igual ao baseline de 2026-08-11 |
| `prefix` · `barrel` 96/0 · `catalog` · `guide` · `dev-kit` · `public-types` · `gate-limits` (39 scripts) · `class-merge` | verdes |
| Reconciliação 116 → 114 | aceita: `getSarakModule` e `registerSarakModule` já contêm `Sarak`, e a §5 item 2 os declara conformes — nunca deveriam estar na contagem |
| Escopo | 305 arquivos, todos dentro da §3.1 (incluindo os seis de `scripts/` que autorizei, cada um com a linha medida). Em `specs/` só a própria plan e o índice, que são **meus** |

### O achado

1. **`npm run trail-citation:check` está vermelho: 13 linhas adicionadas citam o rastro de execução (R36).**
   As citações são **pré-existentes**, mas a renomeação reescreveu as linhas, e o gate conta linha
   adicionada — é a regra funcionando como pretendida (quem toca a linha, limpa a citação de passagem):

   - `src/index.ts:39, 47, 93, 145, 157, 160, 177` — `// plan-45`
   - `src/components/atomic/Cards/SarakExpandableCard.tsx:88` e o teste dele `:13, :18` — `plan-41`, `plan-40`
   - `src/components/atomic/Buttons/SarakSocialButton.tsx:32` — `(plan-19)`
   - `src/components/atomic/Navigation/SarakShellThemeToggle.tsx:25` — `(plan-24-1 §2.8)`
   - `gates/scripts/audit/verify_contrast.ts:361` — `plan-26`

   **Por que bloqueia:** o Anel 1 do `pre-commit` roda esse gate com `--staged`, e essas 13 linhas estarão no
   índice — o commit do dono cai. Está dentro do escopo: a §3.1 já entrega essas linhas (são as declarações
   dos nomes renomeados), e remover a citação de uma linha que já está sendo reescrita não é trabalho novo.
   Preserve o que cada comentário explica; some apenas a referência ao rastro.


## Veredito — 2026-10-02 (correção 1) — 🟢 Aprovado

**O achado único fechou, e o risco dele não se concretizou.** O `trail-citation:check` está verde, e li as 13
linhas uma a uma: só a procedência saiu, a explicação técnica ficou em todas — `@container` plantado no
portal, o botão social que legitimamente é botão, a preferência que controla o modo sem reescrever o design,
a contraparte autorada na segunda passada do contraste. Era o risco real desta correção (limpar a citação
levando o porquê junto) e não aconteceu.

**Escopo da correção, conferido por carimbo de tempo:** só os seis arquivos das 13 linhas mudaram depois das
20:00, mais o `src/core/Provider/generated/design-token-ids.ts`, que é **gerado** e voltou do `npm run build`
— previsto na §3.1. Nada mais.

**Verificação final, toda minha:**

| Trava | Resultado |
|---|---|
| `npx vitest run` inteiro | 2120 de 2121. O único vermelho é `check-class-merge.test.mjs`, que **passa isolado: 9/9** — intermitência do achado 5 do [[00-backlog]], com falha de asserção sob carga, e não da entrega |
| `audit:baseline --with-tsc` | igual ao baseline de 2026-08-11 |
| `prefix:check` | **331 nomes conformes, allowlist em dia** |
| `barrel` 96/0 · `catalog` · `guide` · `dev-kit` · `public-types` | verdes |
| `gate-limits` | **39** scripts declaram o que não veem — o gate novo entre eles |
| `class-merge` · `zero-brand` (431 arquivos) · `token-types` (427 tokens) | verdes |
| `trail-citation` | verde |

**O que foi verificado na rodada anterior e continua valendo:** a lista derivada por script próprio do
`dist/index.d.ts` (331 exportados, 0 fora da convenção); a **bijeção exata** da tabela de migração (114
antigos saíram, 114 novos entraram, os 114 antigos todos em `docs/migracoes.md`, e os 16 nomes novos fora da
tabela são os componentes entregues no dia, que não são renomeações); as três mutações da §7 mais os três
cenários extras de allowlist (obsoleta, inexistente, sem motivo), todos reprovando como deviam; e o
`prefix:check` ligado na cadeia do `build` logo depois do `public-types:check`.

**Critérios de aceite: os nove atendidos**, com a allowlist do gate nascendo **vazia**, como a §5 item 5
esperava — nenhum nome precisou de exceção.

**Fora do escopo, registrado:** o `npm run audit` bruto segue com a dívida do baseline (`--x` e os dois
`<input>` crus de `SarakMultiSelect`/`SarakUploader`); nada disso é desta entrega.

**Liberado para commit** — 305 arquivos, uma entrega só.

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese, imediatamente antes da remoção da plan. -->
