---
tipo: "spec"
titulo: "Artefatos do mantenedor — o kit `sarak-dev/` e o gate `dev-kit:check`"
dominio: "Sarak-Lib-UI-Core / Manutenção / Documentação viva / Gates"
status: "🟢 Vigente"
prioridade: "Alta"
tags: ["spec", "mantenedor", "kit", "documentacao-viva", "gate", "ponteiro-morto", "skills"]
relacionados: ["[[12-kit-do-consumidor]]", "[[01-gates-e-baseline]]", "[[00-regras-e-invariantes]]", "[[02-enforcement-por-commit]]"]
---

# 1. O problema, com a prova

A biblioteca tinha um kit excelente para quem a **consome** (`sarak-ui/`, [[12-kit-do-consumidor]])
e **nada equivalente** para quem a **edita**. A consequência não é teórica — é medível, e foi
medida:

| Skill | O que ela manda fazer | Realidade |
| --- | --- | --- |
| `ui-novo-componente` | registrar todo componente novo na "6ª camada", em **src/core/Manifest/Registry/nativeComponents.ts** | **REMOVIDO** (ADR-002) |
| `ui-novo-componente` | rodar o **RegistryParity.test.tsx** | **REMOVIDO** |
| `ui-novo-componente` | regenerar `docs/manifest-catalog.{json,md}` | hoje se chama `component-catalog` |
| `ui-novo-pipe` | 100% sobre pipes de data binding do motor de manifesto | **obsoleta inteira** |
| `ui-contexto-repositorio` | ler `specs/specs/07-agente-llm-design-e-expansao-estrutural.md` | **arquivo inexistente** |

> **É exatamente a classe de defeito que o kit do consumidor resolveu do outro lado:
> documentação escrita à mão que envelhece em silêncio.** A diferença é que, do lado do
> consumidor, um gate impede publicar kit defasado; do lado do mantenedor não havia gate nenhum,
> e por isso o apodrecimento durou meses sem que nada acendesse.

Esta spec fecha o vão: cria o artefato equivalente para dentro (`sarak-dev/`) e o gate que o
sustenta (`dev-kit:check`).

# 2. O artefato

```
sarak-dev/
├── START-HERE.md        prosa + carimbo injetado
├── GUIA-MANUTENCAO.md   prosa + Apêndice B injetado
└── state.json           100% gerado
```

**Três arquivos**, contra os seis do kit do consumidor. A diferença é proposital: o kit do
consumidor precisa ensinar a *escrever frontend* (guia longo, templates copiáveis, skill); este
precisa apenas **rotear** — as regras já existem, escritas, na base de specs.

## 2.1 O princípio, igual ao do outro kit

> **A PROSA descreve FLUXOS. Todo NÚMERO e toda LISTA são derivados do repositório.**

**Prosa** (muda quando a forma de trabalhar muda): a árvore Configuração × Expansão, os fluxos de
token/componente/tema/cromo/gate/commit, a ordem de leitura.

**Derivado** (muda a cada alteração do repositório): schemas, contagens de token, categorias
atômicas e de engine, componentes públicos, gates registrados, auditores, o baseline e o índice
da base de specs.

## 2.2 A regra nº 1 — a spec manda, o guia roteia

O `GUIA-MANUTENCAO.md` **não define regra nenhuma**. Cada fluxo aponta para a spec dona. Quando
os dois divergirem, **a spec vence**, e a divergência é defeito do kit.

Não é preferência estética: **duplicata envelhece, ponteiro não.** As skills apodreceram porque
duplicavam procedimento em vez de apontar para a fonte.

# 3. O `state.json` — o que é derivado, e de onde

Gerado por `scripts/dev-kit/buildDevState.mjs`, **reusando** `scripts/catalogAst.mjs`,
`scripts/publicComponents.mjs` e `scripts/consumer-kit/collectKitSources.mjs`. Nenhuma travessia
de AST nova foi escrita.

| Chave | Conteúdo | Fonte viva |
| --- | --- | --- |
| `design.schemaFiles` | 28 arquivos | `src/core/Design/schema/` |
| `design.masterMapVersion` | `13.0.0` | `src/core/Design/master-map.ts` |
| `design.tokens.mapeamento` | 13 colunas · 416 entradas brutas · **409 ids únicos** | `src/core/Design/catalog/theme_table_mapping.json` |
| `design.tokens.particoes` | 13 arquivos · 409 tokens | `src/core/Design/catalog/partitions/` |
| `design.tokens.tipoPublico` | 304 ids · 40 responsivos | `src/core/Provider/generated/design-token-ids.ts` |
| `componentes.categoriasAtomicas` | 14 | `src/components/atomic/` |
| `componentes.categoriasDeEngine` | 3 | `src/components/engines/` |
| `componentes.publicos` | **81** + a lista de nomes | `collectPublicComponentNames()` |
| `gates` | 9 entradas (nome + comando) | os `scripts` do `package.json` |
| `auditores` | os 8 | `run_audit.mjs` |
| `baseline` | o baseline versionado inteiro | `.githooks/audit-baseline.json` |
| `base` | ADRs · arquitetura · specs | `specs/adr/` · `specs/arquitetura/` · `specs/specs/` |
| `docs` | os guias shippados | `docs/` |

**Os gates são derivados, não listados.** O critério é o nome do script (`*:check`, `audit`,
`gates:full`) — acrescentar um gate ao `package.json` o coloca no kit sozinho, e é isso que
impede o catálogo de gates de virar uma lista que alguém esqueceu de atualizar.

## 3.1 Os quatro números de token lado a lado — de propósito

O `state.json` publica as **quatro** contagens de token juntas, e a divergência entre elas é
informação, não ruído:

- `mapeamento.entradasBrutas` (**416**) > `mapeamento.idsUnicos` (**409**) → sete ids roteados
  para mais de uma coluna. Achado conhecido, roteado à Campanha 2.
- `tipoPublico.ids` (**304**) < `idsUnicos` (**409**) → **o tipo público está defasado** (§7.1).

Um kit que publicasse um número só esconderia as duas coisas.

# 4. O gate `dev-kit:check`

```bash
npm run dev-kit         # regenera
npm run dev-kit:check   # confere
```

Como no kit do consumidor, **geração e conferência partilham a mesma função de plano**
(`scripts/dev-kit/buildDevKitOutputs.mjs`): o check compara exatamente o que a escrita gravaria.
Regra paralela é como um gate passa a dizer "em dia" sobre um arquivo que ninguém mais gera.

Ele reprova por **duas** razões independentes:

## 4.1 Defasagem

Algum número mudou e o kit não foi regenerado. Mesma família de `guide:check`.

## 4.2 Ponteiro morto — **o requisito central desta spec**

> **A prosa não pode citar caminho, gate ou script que não existe.**

`scripts/dev-kit/deadPointers.mjs` extrai de cada `.md` do kit os ponteiros **verificáveis** e
confere um a um:

| Tipo | Forma reconhecida | Verificação |
| --- | --- | --- |
| caminho | token em crase começando por `src/`, `scripts/`, `specs/`, `bin/`, `docs/`, `sarak-ui/`, `sarak-dev/`, `.agents/`, `.githooks/` | existe em disco? |
| gate | `npm run <script>` | o script existe no `package.json`? |
| comando | `node <caminho>` | o caminho existe em disco? |

Sufixo `:linha` e `:linha-linha` (a convenção `arquivo.ts:42`) e a barra final são normalizados
antes da verificação.

**O que NÃO é verificado, de propósito:** prosa livre, nome de símbolo, glob (`*`) e
metavariável (`<Categoria>`). O motivo é operacional, não de pureza:

> **Verificador que adivinha produz falso-positivo, e gate com falso-positivo é gate que se
> aprende a contornar.** Se o autor começar a evitar a crase para não brigar com o gate, o gate
> deixa de ver a prosa inteira — e perde exatamente o poder que justificava criá-lo.

**Corolário que virou convenção do guia:** caminho **removido** se cita em **negrito**, nunca em
crase. É por isso que o `GUIA-MANUTENCAO.md` fala do motor de manifesto sem crase — citá-lo em
crase derrubaria o gate, que é o comportamento correto.

## 4.3 O modo de escrita também reprova

`npm run dev-kit` escreve **primeiro** e reporta os ponteiros mortos **depois**, saindo com 1 se
houver algum. Quem está editando o guia quer o arquivo regenerado **e** a lista do que ficou
morto — não uma coisa ou outra.

# 5. Onde o gate roda

| Pipeline | Roda `dev-kit:check`? | Por quê |
| --- | --- | --- |
| `npm run gates:full` (→ `preversion`) | **Sim**, primeiro | É barato e é o análogo do `guide:check` para dentro. Publicar uma versão com documentação de mantenedor apodrecida é o defeito que esta spec existe para impedir. |
| `npm run build` | **Não** | O `build` produz o **artefato publicado**, e `sarak-dev/` não é publicado. Acoplar um gate de documentação interna ao pipeline do tarball juntaria duas coisas sem relação — e faria a publicação depender de algo que o consumidor nunca recebe. |
| `.githooks/pre-commit` | **Não** *(decisão em aberto)* | Não foi acrescentado nesta entrega para não mover o custo do commit sem medição. Fica registrado como opção. |

# 6. Empacotamento — `sarak-dev/` é INTERNO

**Não entra no `files` do `package.json`** e é **proibido no tarball**
(`scripts/check-package-contents.mjs`, lista de prefixos proibidos).

A dupla trava é deliberada, e o motivo está escrito no próprio gate: `sarak-dev/` publicaria o
**baseline de auditoria** e a **topografia interna** do repositório para todo importador. Estar
fora do `files` já bastaria hoje; a entrada na lista de proibidos garante que um `files` editado
por engano seja **acusado** em vez de publicado — o mesmo raciocínio que manteve a entrada
`Template-Ts/` depois de o diretório sumir.

Provado com `npm pack --dry-run` (§9).

# 7. Achados registrados por esta entrega

## 7.1 🔴 `design-token-ids.ts` está DEFASADO — e o gerador não está em pipeline nenhum

`src/core/Provider/generated/design-token-ids.ts` é um arquivo **gerado**, com cabeçalho
`ARQUIVO GERADO AUTOMATICAMENTE — NÃO EDITAR À MÃO` e a instrução de regenerar com
`scripts/generate-token-types.ts`.

**Medido nesta entrega:**

| Fonte | Tokens |
| --- | --- |
| `MASTER_DESIGN_MAP` / `theme_table_mapping.json` / `partitions/` | **409** |
| `SarakDesignTokens` (o tipo público gerado) | **304** |
| **Diferença** | **105 tokens ausentes do tipo** |

E a causa é estrutural, não distração: **`generate-token-types.ts` não está registrado em nenhum
script do `package.json` nem em nenhum hook.** Ele regenera só quando alguém lembra. O último
commit do arquivo gerado é de **2026-06-27**; o schema que o alimenta mudou em **2026-07-25**.

**Consequências, em ordem de gravidade:**

1. `DesignTokenId = keyof SarakDesignTokens` é a união que tipa o payload de tema. Enquanto o
   arquivo estiver defasado, **105 tokens legítimos são invisíveis ao TypeScript** para quem tipa
   um tema.
2. O **kit do consumidor publica o número errado**: `sarak-ui/catalog.json` → `designTokens.count`
   diz **304** porque lê essa mesma interface. O importador lê que existem 304 chaves válidas de
   `design` quando existem 409.
3. Nenhum gate acusa. O `auditor_paridade` cruza schema × mapping × partições — o **tipo gerado
   não é uma das três fontes**.

**NÃO corrigido aqui**, e o motivo é escopo, não conveniência: regenerar mudaria
`src/`, o `catalog.json` do consumidor e o carimbo do kit, com blast radius muito além do
mandato desta tarefa. **Roteado para a Fase B da Campanha 2**, junto das demais lacunas de gate —
e o conserto tem **duas** metades, como as outras dessa família: regenerar o arquivo **e**
registrar o gerador num pipeline, senão ele volta a apodrecer no mês seguinte.

## 7.2 A anomalia que o próprio kit expôs na primeira execução

Na primeira geração, o `dev-kit:check` reprovou com **dois** ponteiros mortos — e os dois foram
úteis:

- `specs/specs/14-artefatos-do-mantenedor.md` (esta spec, ainda não escrita) → **defeito real**,
  pego antes de existir;
- `src/components/atomic/<Categoria>` → **falso-positivo**, uma metavariável em crase.

O segundo produziu a regra do §4.2 (metavariável e glob são ignorados). Vale registrar que o
gate encontrou os dois na estreia: o requisito de ponteiro morto se pagou antes de o kit ficar
pronto.

# 8. As skills passam a CONSUMIR o `state.json`

Esta spec **estabelece o contrato**; a reconciliação das skills é outra tarefa (P24).

O contrato é: **skill ORQUESTRA e APONTA; spec DEFINE; `state.json` CONTA.** Nenhuma skill deve
mais carregar uma contagem, uma lista de categorias, um nome de gate ou um caminho que possa ser
lido daqui. Quando precisar de um número, a skill manda ler `sarak-dev/state.json`.

Isso não é elegância: a contagem duplicada é exatamente o que apodreceu, e uma skill que aponta
para o `state.json` fica em dia sozinha.

# 9. Critérios de Aceite

- [x] `sarak-dev/` existe com `START-HERE.md`, `GUIA-MANUTENCAO.md` e `state.json`.
- [x] `npm run dev-kit` gera; `npm run dev-kit:check` confere — mesma função de plano.
- [x] O `state.json` é 100% derivado, reusando o pipeline de AST existente (zero travessia nova).
- [x] O guia cobre os fluxos de token, componente, tema/preset, cromo, gates e commit/release, e
      cada um **aponta** para a spec dona em vez de reescrevê-la.
- [x] A árvore Configuração × Expansão é a §0 do guia.
- [x] O gate reprova por **defasagem** e por **ponteiro morto**, com mensagem por `arquivo:linha`.
- [x] `dev-kit:check` entra no `gates:full` (e, por ele, no `preversion`).
- [x] `sarak-dev/` fora do `files` **e** na lista de proibidos do `package:check`, provado com
      `npm pack --dry-run`.
- [ ] **As skills `ui-*` reescritas para consumir o `state.json`** — é o **P24**, não esta spec.

# 10. Plano de Testes (Quality Gate)

## Testes Unitários — `scripts/dev-kit/__tests__/devKit.test.mjs`
- [x] `collectPointers` acha caminho, gate e comando `node` em crase, com a linha correta.
- [x] `collectPointers` **ignora** glob, metavariável e prosa livre.
- [x] `collectPointers` normaliza `arquivo.ts:42` e a barra final.
- [x] `findDeadPointers` acusa caminho inexistente e script inexistente, e **não** acusa os reais.
- [x] `buildDevState` deriva do repositório: os quatro números de token, as categorias, os
      componentes públicos, os gates e o baseline.
- [x] O estado **não** contém contagem escrita à mão — os gates saem do `package.json` real.

## Gate de sistema
- [x] `npm run dev-kit:check` verde no repositório limpo.
- [x] Ponteiro quebrado de propósito → **exit 1** com `arquivo:linha` (prova no relatório do P23).
- [x] `npm run package:check` prova que `sarak-dev/` não está no tarball.

## Lacuna declarada
- [ ] **A prosa dos fluxos não é verificada além dos ponteiros.** O gate garante que o guia não
      cita o que não existe; **não** garante que o passo a passo continue correto. Um fluxo que
      ficasse obsoleto sem trocar de caminho sairia verde. Só a leitura humana pega isso — e é
      por isso que o §9 do guia manda quem encontrar a lacuna acrescentar o fluxo.
