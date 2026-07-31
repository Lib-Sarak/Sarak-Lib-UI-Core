# Prompts de Execução — Campanha "Reescrita da Base de Specs"

> **Este arquivo foi ESVAZIADO e reescrito em 2026-07-27.** O conteúdo anterior (prompts P8–P50 do ciclo de implementação 16→51, todos concluídos) está preservado no git. A campanha atual é OUTRA: **reescrever a base de especificações inteira** para refletir o ESTADO REAL do código, esvaziando o `specs/plan/`.

Cada bloco abaixo é um prompt **COMPLETO e autocontido** para iniciar uma tarefa **numa conversa nova** (agente sem contexto anterior). Copie e cole o bloco inteiro. A numeração (`P0`, `P1`…) corresponde ao item do Roteiro de Execução.

---

## Por que esta campanha existe

A base de specs está **defasada e desorganizada**. O código mudou muito e as specs não acompanharam:

- O **renderizador de páginas por manifesto** (`src/core/Manifest/`, "arquitetura #2") foi **REMOVIDO** (Spec 46) — confirmado por `Test-Path src/core/Manifest` = `False` e grep de `SarakManifestRenderer|NATIVE_COMPONENTS` em `src/` = **0 ocorrências**. Mas 4 specs ainda o descrevem como vigente.
- O **backend próprio** foi **REMOVIDO** (Spec 44) — `Test-Path backend` = `False`. Mas `arquitetura/09` ainda documenta `router.py`, `models.py` e a tabela `ui_core.custom_themes`.
- O `specs/plan/` acumulou **45 arquivos** (plano + log histórico) que precisam ser **sintetizados** nas categorias definitivas e **esvaziados**.
- `specs/adr/` **não existe** — todas as viradas (manifesto-only falhou, remoção do #2, remoção do backend, remoção do Design Agent, composição apps-separados) estão registradas só em log de execução.

**Objetivo final:** qualquer agente, lendo `specs/`, entende e sabe TUDO que precisa para alterar o módulo com segurança.

## O princípio inegociável desta campanha

> **O CÓDIGO É A FONTE DA VERDADE.** Onde a spec antiga contradiz o código, o **código vence** — sem exceção, sem negociação, sem "mas a spec dizia".
>
> Toda afirmação estrutural numa spec nova tem de ser **confirmada por `arquivo:linha`**. Se você não conseguiu confirmar, ou a afirmação sai, ou entra como pergunta em DIVERGÊNCIAS. **Não invente estado.**

## As 4 categorias de destino

| Pasta | O que é | Natureza |
| --- | --- | --- |
| `specs/arquitetura/` | Visão **MACRO**: as camadas, a forma do produto, as arquiteturas vigentes, o Design Engine como central, os modos de consumo | Documento **vivo** |
| `specs/adr/` | **(A CRIAR)** Registros de **DECISÃO**: as viradas e o porquê | Documento **imutável** |
| `specs/specs/` | Specs **DEFINITIVAS** de feature + regra (cada tópico uma spec) | Documento **vivo** |
| `specs/plan/` | Plano **TRANSITÓRIO** — será **ESVAZIADO** na Fase 6 | Descartável |

---

# REGRAS COMUNS A TODOS OS PROMPTS

Estas regras estão embutidas em cada bloco, mas valem sempre:

### 1. Preparação obrigatória (nesta ordem)
1. Acione a skill **`ui-contexto-repositorio`** — sempre primeiro.
2. Leia **este arquivo inteiro** (`specs/plan/00-prompts-execucao.md`) — o mapa da campanha.
3. Leia `specs/_templates/` (`template-adr.md`, `template-arquitetura.md`, `template-spec.md`) — o **formato é obrigatório**, incluindo o bloco YAML frontmatter.
4. Estude (não execute o fluxo de edição) a skill **`sarak:spec-write`** — o padrão de escrita de spec. Para ADR, também **`sarak:spec-fundacao`**.
5. Leia **o material-fonte listado na sua tarefa**, inteiro.
6. **CONFIRME NO CÓDIGO** cada afirmação que for escrever.

### 2. Frontmatter obrigatório
Todo documento novo nasce com o YAML do template correspondente. Nada de campo inventado. `status` honesto (`🟢 Vigente` / `🟢 Aceito` / `🟡 Em Progresso`), `dominio` preenchido, `relacionados` com WikiLinks reais.

### 3. Não apague nada de `specs/` antes da Fase 6
Os arquivos antigos são **material-fonte** de tarefas posteriores e alvo de referências cruzadas. **Marque, não delete.** A remoção é uma tarefa só, no fim (P25). Os nomes novos são **distintos** dos antigos de propósito — não há colisão, os dois convivem até a Fase 6.

### 4. Não transcreva fonte viva
Lista de tokens, de componentes, de props, de ícones: **jamais** copiada para dentro de markdown. Aponte para a fonte gerada (`docs/component-catalog.json`, `sarak-ui/catalog.json`, `getAllDesignTokens()`, `getScaffold()`). Cópia estática = a próxima mudança de código já a torna mentira.

### 5. O BASELINE dos gates (memorize — foi MEDIDO em 2026-07-27)

`run_audit.mjs` **NÃO está em 0**. Este é o baseline exato; **qualquer coisa diferente disto é regressão sua**:

| Gate | Comando | Baseline |
| --- | --- | --- |
| `run_audit` | `node .agents/skills/ui-auditoria-modulo/scripts/run_audit.mjs` | ❌ **exit 1 — 2 regras vermelhas** |
| ↳ `auditor_hardcoded` | | **1 violação:** `src/components/atomic/Atoms/SarakTypography.tsx:39` → `var(--sarak-h1-ls, -1px)` (fallback negativo). Estrutural líquido = **0** |
| ↳ `auditor_ghostvars` | | **3 consumos:** `--token`, `--sarak-button-radius`, `--sarak-shell-brand-logo-size` |
| ↳ typescript / coverage / arquitetura / cleancode / paridade / presets | | ✅ **6 verdes** (409/409/409 tokens; 120 itens de tema/preset) |
| `barrel:check` | `npm run barrel:check` | ✅ **81 componentes, 0 faltas** — ⚠️ **atualizado em 2026-07-29 (P26):** era 78; `components/engines/**` entrou no escopo de varredura e os 3 engines públicos passaram a ser contados |
| `catalog:check` | `npm run catalog:check` | ✅ em dia |
| `zero-brand:check` | `npm run zero-brand:check` | ✅ **361 arquivos, 0 violações** — ⚠️ **atualizado em 2026-07-29 (P26):** era 363; a contagem é de arquivos VARRIDOS e caiu com a remoção do `SarakVisualEngine`/`PaletteSelector`. O número que importa é o de violações (0) |
| `guide:check` | `npm run guide:check` | ✅ **kit em dia (6 arquivos)** |
| `dev-kit:check` | `npm run dev-kit:check` | ✅ **kit em dia (3 arquivos, 0 ponteiros mortos)** — ⚠️ **gate NOVO, criado em 2026-07-31 (P23)**. Reprova por defasagem **e** por ponteiro morto na prosa do `sarak-dev/`. Fora do `build`, dentro do `gates:full` |
| suíte completa | `npx vitest run` | ✅ **274 arquivos / 889 testes, 100% verde** (~159s). ⚠️ **Atualizado em 2026-07-31 (P23):** era 273/877; o gerador do `sarak-dev/` trouxe **1 arquivo / 12 testes** novos. Histórico anterior — **P26:** caiu de 275/879 para 273/877 — a remoção do `SarakVisualEngine`/`PaletteSelector` levou junto os **2 arquivos / 2 testes** de fumaça deles. Histórico anterior — **P20-A:** era 281/901; a remoção do `Template-Ts/` tirou **6 arquivos / 22 testes** que não eram da lib e que só passavam por causa de um `node_modules/` local não versionado. **O número caiu e o sinal subiu** — este verde vale em qualquer clone. Histórico anterior: 890 com **1 falha ambiental** (`packageManager.test.mjs`) até o **P11-D** (→ 891) e o **P12-C** (+`tagComparison.test.mjs`, → 901). Detalhe em `specs/specs/01-gates-e-baseline.md` §3.1 e §3.2 |
| `tsc` | `npx tsc --noEmit` | ❌ **14 erros** — 10 em teste, **4 em produção** (`useStructuralStyles.ts:30,71,94`; `ThemeCustomizationTab.tsx:86`). **Não é gate hoje.** |
| `build` + DTS | `npm run build` | encadeia catalog→barrel→zero-brand→guide→tsup→css→scoped→copy→inject→build-info |
| `package:check` | `npm run package:check` | roda no `prepublishOnly`; exige `dist/` buildado |

**Tarefas que só escrevem markdown não podem mover nenhum número acima.** Se moveram, algo saiu errado.

### 6. Regra de DIVERGÊNCIA (crítica — leia duas vezes)

> Se você encontrar **qualquer coisa divergente deste plano** — o código não bate com o que o plano afirma, o material-fonte aponta para algo que não existe, o escopo proposto não fecha, dois documentos disputam o mesmo conteúdo, ou você acha que a categoria de destino está errada:
>
> **PARE. NÃO DECIDA SOZINHO. NÃO CONTORNE.**
>
> Registre a divergência na seção `DIVERGÊNCIAS` do seu relatório com: (a) o que o plano diz, (b) o que o código/realidade mostra (com `arquivo:linha`), (c) as opções que você vê, (d) sua recomendação. E **peça aprovação explícita** antes de seguir.
>
> Obstáculo se **REGISTRA**, não se contorna. Foi assim que o Selo da Onda funcionou e é assim aqui.

### 7. O RELATÓRIO DE ENTREGA (formato obrigatório — é o que será revisado)

Toda tarefa termina com um relatório nesta estrutura:

```
## 1. ENTREGA
Arquivos criados/alterados: <caminho> (<n> linhas) — um por linha.

## 2. RASTREABILIDADE
Tabela: | Afirmação estrutural do documento | Comprovação (arquivo:linha) |
Toda seção normativa precisa de pelo menos uma linha aqui.

## 3. MATERIAL-FONTE CONSUMIDO
Tabela: | Arquivo de origem | O que foi migrado | O que foi DESCARTADO e por quê |
(o "descartado" é tão importante quanto o migrado — é onde mora a defasagem)

## 4. GATES
Saída NUMÉRICA de cada gate rodado, comparada com o baseline da §5.
Explicite: "baseline exato" ou "mudou: <o quê e por quê>".

## 5. DIVERGÊNCIAS
Conforme a §6. "Nenhuma" é resposta válida — mas só se for verdade.

## 6. NÃO FEITO
O que ficou de fora do escopo e por quê. Silêncio aqui é proibido.
```

### 8. Ao terminar cada tarefa
1. Marque o checkbox no Roteiro de Execução **deste arquivo**.
2. Adicione uma entrada em `specs/plan/00-progresso.md` (formato definido lá) — o log segue vivo até a Fase 6.
3. **NÃO COMMITE sem autorização explícita do dono.**

### 9. Fronteiras globais (valem para toda a campanha)
- **NÃO** faça deploy, publish, `npm version`, tag ou push.
- **NÃO** altere código-fonte, exceto onde a tarefa mandar explicitamente (só P11, P12 e P23 tocam código/config).
- **NÃO** "aproveite para corrigir" o baseline do `run_audit` — os 4 itens são dívida conhecida e documentada; corrigi-los é outra spec, fora desta campanha.
- **NÃO** invente numeração, nome de arquivo ou categoria diferente da que o prompt fixa.

### 10. 🔒 A EXCEÇÃO DESTE ARQUIVO — só sai daqui o que foi EXECUTADO

> **Regra absoluta, acima de qualquer tarefa deste plano — inclusive do P25.**
>
> **Deste arquivo só se remove conteúdo cujo checkbox está `[x]`.** Qualquer item com checkbox `[ ]` — tarefa, prompt, briefing, decisão pendente, achado sem rota fechada — **NUNCA é removido.** Não por limpeza, não por "esvaziar o plan", não por achar que já não serve.

**Por quê.** Este arquivo não é só registro do que passou: ele é a **única fonte executável do que ainda vai acontecer**. Os prompts das próximas etapas, as 13 decisões do dono e os 21 achados de auditoria existem aqui e no `00-progresso.md` — e o `00-progresso.md` também sai no P25. Apagar uma etapa não executada não "limpa o plano": **destrói trabalho que ninguém fez ainda e que ninguém vai lembrar de refazer.**

**Como isso muda o P25.** A tarefa dele **não é "esvaziar"** — é:

| | |
| --- | --- |
| **REMOVER** | o que está `[x]` — executado, revisado, e cujo conteúdo vivo já foi migrado para `arquitetura/`, `adr/` ou `specs/` |
| **MIGRAR** | o que está `[ ]` — vai íntegro para o `specs/plan/00-prompts-execucao.md` novo, junto do briefing da Campanha 2 |

Se ao rodar o P25 sobrar qualquer item aberto — uma tarefa que foi pulada, um achado sem rota, uma decisão que o dono não tomou — ele **acompanha** a migração. O plano novo nasce com a pendência visível, não com ela apagada.

**Regra de conferência (obrigatória no P25):** conte os checkboxes `[ ]` ANTES de remover qualquer coisa, e prove ao fim que **todos** aparecem no arquivo novo. Diferença de um é falha de entrega.

---

# REGISTRO DE DECISÕES DO DONO

Decisões tomadas em conversa, com data. **Nenhum agente re-litiga o que está aqui.** Se você acha que uma delas está errada, isso é DIVERGÊNCIA — registra e pergunta; não decide por conta.

| # | Decisão | Data | Consequência |
| --- | --- | --- | --- |
| **D1** | **`atomic/Tables/` fica como está.** A categoria não tem componente (só `hooks/useTableLayoutStyles.ts`), mas **não é obsoleta**: o hook é importado por `Templates/SarakTable.tsx:18` e é `structuralConsumer` de dois tokens (`schema/tables.ts:25` e `:40`, espelhados em `components_base.json:110,126`). Apagar quebraria a paridade estrutural. As três alternativas (mover o hook, mover o componente, reorganizar) custam mais que a anomalia. | 2026-07-28 | **Sem tarefa.** Fica documentada em `00-mapa-do-modulo` §9 |
| **D2** | **Engines: apagar o barril órfão, expor Chat+Flow, remover Visual, ampliar o gate.** | 2026-07-28 | **P26** |
| **D3** | **Versão renumerada para `1.0.0`.** | 2026-07-27 | ✅ executado no P12 |
| **D4** | **Distribuição: tags + `#semver:` como caminho RECOMENDADO; `github:` puro segue SUPORTADO.** Opção (A). Nenhum consumidor existente precisa mexer no `package.json` dele no dia em que a tag nasce; quem pina por commit (reprodutibilidade) continua podendo; e a decisão é reversível — deprecar `github:` puro depois é fácil, desforçar uma migração não é. | 2026-07-28 | **P12-C** |
| **D5** | **Emissão de tag: semi-automática, com BLOQUEIO no push.** O gatilho é *"o artefato publicado mudou"*, não *"houve commit"*. O nível do bump é **decidido por humano**, não derivado de mensagem de commit. | 2026-07-28 | **P12-C** |
| **D6** | **O `Sarak-MyService` é OBSOLETO.** Deixa de ser consumidor de referência. | 2026-07-28 | Varreduras de consumidor real passam a considerar só o **ERP**. ⚠️ Impacta o **P15**: o modo Shell-host (#1) perde o consumidor real que o justificou na regra de corte do ADR-001 — a spec do Shell tem de registrar isso como fato, sem decidir nada |
| **D7** | **`Template-Ts/` SAI do repositório.** É um template de backend de chat (`template-chat-ts`: express/supabase/pg), **85 arquivos versionados**, sem nenhuma referência na lib, invisível para todos os gates exceto a suíte — onde produz **falso verde** (passa só por causa de um `node_modules/` local não versionado). Princípio do dono: *"esta é uma biblioteca genérica e não deve depender de nenhum módulo."* | 2026-07-28 | **P20-A**, antes do P20 |
| **D8** | **Anel 3 → `pre-push`: PROMOVER, mas só a SUÍTE, e só depois do D7.** `npm run build` e `package:check` ficam FORA de hook para sempre — o motivo (2) da §4 (o build MUTA a árvore de trabalho) não expira. | 2026-07-28 | **P27**, depois do P20-A |
| **D9** | **CI ganha FASE PRÓPRIA, depois de esvaziar o `specs/plan/`.** É o único item que resolve a classe inteira de "verde que depende da máquina" — o `$HOME` de um runner limpo não tem lockfile solto nem `node_modules` de projeto alheio. | 2026-07-28 | **Campanha 2, Fase A** |
| **D10** | **Registry: NÃO agora.** O `#semver:` + tag já entrega o `npm update`. O ganho que falta é **tirar o `dist/` do git** — e ele só compensa quando houver consumidor fora da órbita do dono. | 2026-07-28 | Registrado; sem tarefa |
| **D11** | **Ciclo de atualização do consumidor precisa de dois comandos**, refletindo a única fronteira que importa em semver: `sarak-ui update` (dentro da faixa, seguro) e `sarak-ui update --latest` (ATRAVESSA o major, mostrando quantos majors pula + as entradas de `docs/migracoes.md` entre as duas versões, e pedindo confirmação). "Subir uma versão de cada vez" **não existe** no npm e não faz sentido: dentro do major todas as versões prometem a mesma compatibilidade. | 2026-07-28 | **Campanha 2, Fase D** |
| **D12** | **As quebras de contrato acumuladas são agrupadas num ÚNICO major.** `CustomizationPanel` lazy, dedup do `SarakTabs` e o destino dos ids legados do Discovery saem juntos numa `2.0.0`, com uma entrada só em `docs/migracoes.md`. Três releases breaking separadas custariam três migrações ao consumidor. | 2026-07-28 | **Campanha 2, Fase C** |

| **D13** | **O ERP é o ÚNICO consumidor real, e a importação é LOCAL por enquanto.** `ERP/packages/ui-kit/package.json` declara `"@sarak/lib-ui-core": "file:../../../../Biblioteca/Sarak-Lib-UI-Core"`. As duas pontas estão em desenvolvimento simultâneo — por isso `file:`; **a importação por `github:` vem depois**. O ERP é o ambiente onde o dono valida na prática o que muda aqui. | 2026-07-28 | **P28** (atualizar e revalidar), e revalidação obrigatória na **Campanha 2, Fase C** |

> ### 📌 Fatos do ERP que quem executar o P28 precisa saber (medidos em 2026-07-29)
> - **É workspace pnpm, sem ambiguidade:** `pnpm-lock.yaml`, `pnpm-workspace.yaml` e `packageManager: "pnpm@11.17.0"`.
> - **Modo `file:` = cópia no store.** Rebuildar a lib **NÃO** chega ao ERP sozinho. Arquivo existente reescrito propaga por hardlink; arquivo **adicionado/removido não** — e o `tsup` gera chunks com **hash no nome** (`chunk-MV2BQG5R.js`), que mudam a cada build. Sem reinstalar, o `dist/index.js` do ERP passa a importar chunks que a cópia dele não tem.
> - **Comando validado** (`packageManager.mjs:111-121`, `validated: true`, medido no próprio ERP): `pnpm install --force --filter <nome-do-pacote>`.
> - ⚠️ **NUNCA `npm install` ali.** Foi isso que quebrou um consumidor pnpm na Spec 51 — o npm entra no `node_modules/.pnpm/` e tenta rodar o `prepare` de pacote de terceiro.
> - ⚠️ **`pnpm` pode não estar no PATH.** Aconteceu em 2026-07-29: `CommandNotFoundException`. O campo `packageManager` **declara** o gerenciador, não o instala — quem materializa é o **corepack** (presente em `C:\Program Files\nodejs\corepack.cmd`), e o shim dele é apagado quando o Node é atualizado. **Declarado ≠ invocável.**
>   - ⚠️ **CORRIGIDO no P28 (2026-07-29):** `corepack enable pnpm` **FALHA nesta máquina** com `EPERM: operation not permitted, open 'C:\Program Files\nodejs\pnpm'` — ele escreve em `Program Files` e exige terminal elevado. **O caminho que funciona sem elevação é `corepack pnpm <args>`**, que resolve a mesma `pnpm@11.17.0` declarada, só não cria o shim. Use-o.
> - ~~**O ERP NÃO tem `sarak:check` nem `sarak:update` instalados**~~ — ⚠️ **FATO CORRIGIDO no P28 (2026-07-29): o ERP TEM `sarak:check`**, em `packages/ui-kit/package.json:15` (`node node_modules/@sarak/lib-ui-core/bin/sarak-ui.mjs check || true`). O que **não existe é o FIO**: nenhum `predev` o invoca — o `predev` da raiz é o `matar-portas-dev.mjs` próprio, e os 4 apps `web` têm só `dev`/`build`/`test`. O comando existe e nunca dispara sozinho, o que é **pior que não existir**: dá a impressão de que o ciclo de aviso está montado. Ligar o fio é **Campanha 2, Fase D** — não se faz no P28.

| **D14** | **O ERP ganha uma FASE DE ALINHAMENTO própria, executada ENTRE o P25 e a Fase A da Campanha 2.** A auditoria do P28 achou **8 defeitos estruturais no ERP** (não na lib). Enquanto eles existirem, o ERP é um instrumento de medição pouco confiável: o `pnpm install` sempre sai `exit 1`, os 4 apps `web` **não são projetos do workspace**, e a atualização da lib só chega neles por *junction* manual — ou seja, **funcionou por acidente favorável**. Antes de a Campanha 2 começar a mexer na biblioteca, o instrumento que valida essas mudanças precisa ser confiável. | 2026-07-30 | **Campanha 2, Fase 0** |

> ### ⚠️ Mudança no destino do `specs/plan/`
> O plano original dizia "`specs/plan/` será ESVAZIADO". Isso continua verdade **para esta campanha** — mas o `plan/` não morre: ele é **reciclado**. O `specs/README.md` (reescrito no P0) já descreve o modelo certo: *plano transitório, com data de morte, esvaziado ao fim de cada campanha*.
>
> O **P25** passa a ter duas obrigações: (1) apagar tudo o que é da Campanha 1 e (2) **semear** o `specs/plan/00-prompts-execucao.md` da **Campanha 2** a partir do briefing no fim deste documento. Sem isso, o briefing da Campanha 2 morreria junto com o arquivo que o carrega.

> **Por que D5 não é auto-tag em todo commit:** neste repositório todo trabalho acontece direto na `main` — "tag a cada commit na main" produziria centenas de tags e o semver viraria contador de build; a faixa `^1.0.0` do consumidor resolveria para algo novo quase todo dia e "minor" deixaria de significar coisa alguma.
>
> **E por que o nível não sai da mensagem de commit:** os cinco commits mais recentes deste repositório são **todos `feat:`** — inclusive os que REMOVERAM capacidade e os que corrigiram bug. As mensagens são geradas por agentes e não carregam intenção de release. Uma heurística sobre elas diria `minor` sempre, e um dia diria `minor` numa mudança breaking. **Tag errada é pior que tag ausente**, porque o consumidor confia na faixa.
>
> **O problema real nunca foi "não sei tagear", foi "esqueci"** — 0 tags em 330 commits, e um consumidor preso 4 commits atrás por semanas. Bloqueio resolve esquecimento sem tirar a decisão de quem entende o impacto.

---

# ROTEIRO DE EXECUÇÃO (ordem única — de cima para baixo, um item por vez)

### Fase 0 — Fundação da nova base
- [x] **P0** — Criar `specs/adr/`, reescrever `specs/INDEX.md` e `specs/README.md`

### Fase 1 — ADRs (o "por quê": registram o passado e destravam a limpeza)
- [x] **P1** — ADR 001–004: as três arquiteturas + as três remoções
- [x] **P2** — ADR 005–007: modelo oficial, zero-marca, distribuição por Git

### Fase 2 — Arquitetura (a visão macro)
- [x] **P3** — `arquitetura/01-forma-do-produto-e-modos-de-consumo.md`
- [x] **P4** — `arquitetura/00-mapa-do-modulo.md`
- [x] **P5** — `arquitetura/04-contrato-de-tokens-e-paridade.md`
- [x] **P6** — `arquitetura/02-design-engine.md`
- [x] **P7** — `arquitetura/03-superficie-publica.md`
- [x] **P8** — `arquitetura/05-build-e-distribuicao.md`
- [x] **P8-C** — Correção da Fase 2 (3 edições pontuais nos docs `03` e `04`) — *achados da revisão*

### Fase 3 — Regras, gates, enforcement e versão *(as duas únicas fases que mexem em código antes da 5)*
- [x] **P9** — `specs/00-regras-e-invariantes.md` (o contrato único)
- [x] **P10** — `specs/01-gates-e-baseline.md`
- [x] **P11** — `specs/02-enforcement-por-commit.md` **+ IMPLEMENTAR o pipeline de pre-commit**
- [x] **P12** — `specs/03-versionamento-e-release.md` **+ RENUMERAR para `1.0.0`**
- [x] **P11-D** — Tornar `packageManager.test.mjs` HERMÉTICO *(dívida aberta pelo P11; pré-requisito do P12-C)*
- [x] **P12-C** — **Releases com tag**: ADR-008 + ritual automatizado + bloqueio no push + `v1.0.0` *(decisões D4/D5)* — ⚠️ tag `v1.0.0` criada **local**; push pendente de autorização do dono

> **Fase 3 CONCLUÍDA em 2026-07-28.** Próximo: **Fase 4** (P13–P20), cujas 8 tarefas são independentes entre si.

### Fase 4 — Specs de feature e regra
- [x] **P13** — `specs/09-temas-e-presets.md`
- [x] **P14** — `specs/10-seguranca-e-acessibilidade.md`
- [x] **P15** — `specs/04-shell-e-discovery.md`
- [x] **P16** — `specs/05-cromo-e-slots.md`
- [x] **P17** — `specs/07-responsividade-e-multidispositivo.md`
- [x] **P18** — `specs/06-painel-de-customizacao-e-preview.md`
- [x] **P19** — `specs/08-identidade-do-host-e-zero-marca.md`
- [x] **P20-A** — **Remover `Template-Ts/` do repositório** *(decisão D7)* — 85 arquivos versionados removidos; suíte 281/901 → **275/879**, verde e agora independente de estado local
- [x] **P20** — `specs/11-testes-e-cobertura.md`

> **Fase 4 CONCLUÍDA em 2026-07-29.** Próximo: **Fase 4.5** (P26, P27). O P27 está **destravado** — o P20-A era o pré-requisito dele.
>
> ⚠️ **14 achados novos** foram registrados nas specs desta fase (**nenhum corrigido**, conforme a fronteira da §9 — 7 deles são afirmações do material-fonte que o código NÃO sustenta). Os dois que eu recomendaria priorizar: **`AdvancedTab` chamando `localStorage.clear()`** (apaga a origem inteira do consumidor, `06-painel-de-customizacao-e-preview` §9.5) e **`src/shared/` fora do escopo do `auditor_coverage`** (3 arquivos sem teste, 2 deles críticos, `11-testes-e-cobertura` §6.1). Lista completa em `00-progresso.md`.
>
> 🔓 **Duas perguntas abertas para o dono**, registradas nas specs e **não decididas**: (a) o destino dos ids legados `mx-customization`/`personalization` registrados por efeito colateral de import (`04-shell-e-discovery` §7.1 — candidato ao major único da D12); (b) se as 5 abas inalcançáveis do `CustomizationPanel` **voltam** ou **saem** (`06-painel-de-customizacao-e-preview` §9.3).

### Fase 4.5 — Fechamento da superfície pública e do enforcement *(mexe em código; roda ANTES dos kits, para o kit documentar a superfície final)*
- [x] **P26** — Engines: apagar o barril órfão · expor Chat+Flow · remover Visual · ampliar o `barrel:check` *(decisão D2)* — `barrel:check` 78 → **81**; boot +0,3 KB (custo zero, como previsto); suíte 275/879 → **273/877** verde
- [x] **P27** — Promover o **Anel 3 (suíte) a `pre-push`** *(decisão D8 — depende do P20-A)* — só a suíte, só `main`, só quando a faixa toca código; anel de release roda primeiro (barato antes de caro); custo **169–179 s**. `build`/`package:check` **fora de hook, decisão fechada**
- [x] **P28** — **Atualizar e revalidar o ERP** *(decisão D13)* — aprovado pelo dono e executado em 2026-07-29. ERP saiu de `libVersion 3.0.0` (26/07) para **1.1.0**; `tsc` + `vite build` **verdes nos 4 apps**; **zero rastro versionado** no repositório dele. Delta de contrato = 0, como o diagnóstico previu

> **Fase 4.5 CONCLUÍDA em 2026-07-29** (P26, P27, P28). Próximo: **Fase 5** (P21, P22, P23) — os dois kits, agora escritos sobre uma superfície pública que parou de mudar e um consumidor real revalidado.

### Fase 5 — Habilitação (os dois kits)
- [x] **P21** — `specs/12-kit-do-consumidor.md`
- [x] **P22** — `specs/13-instalacao-e-atualizacao.md`
- [x] **P23** — `specs/14-artefatos-do-mantenedor.md` **+ CRIAR o kit `sarak-dev/` + gate `dev-kit:check`** — kit de 3 arquivos, `state.json` derivado por AST, gate com caça a **ponteiro morto**; `sarak-dev/` fora do tarball (provado nos dois sentidos); suíte 273/877 → **274/889**

> **Fase 5 CONCLUÍDA em 2026-07-31** (P21, P22, P23). Próximo: **Fase 6** (P24, P25).
>
> ⚠️ **Achado que muda o escopo da Campanha 2 (Fase B):** `src/core/Provider/generated/design-token-ids.ts` está **defasado em 105 tokens** (304 no tipo público × 409 no catálogo) e o gerador dele (`scripts/generate-token-types.ts`) **não está registrado em nenhum script nem hook**. Consequência de segunda ordem: o `sarak-ui/catalog.json` publica `designTokens.count = 304` ao consumidor, que é **falso**. Detalhe em `specs/specs/14-artefatos-do-mantenedor.md` §7.1.

### Fase 6 — Fechamento
- [ ] **P24** — Reconciliar as skills do mantenedor com o código real
- [ ] **P25** — Remover o que está `[x]` · **MIGRAR o que está `[ ]`** (§10) · remover as specs aposentadas · **SEMEAR o plano da Campanha 2**

### 🔜 CAMPANHA 2 — Adequação do sistema *(briefing no fim deste documento; vira plano executável no P25)*
> Primeiro corrigimos e limpamos as specs (Campanha 1). **Depois** adequamos o sistema ao que ficou escrito.
> 🔒 **O escopo da Campanha 1 está FECHADO** (decisão do dono, 2026-07-29): os **21 achados** das auditorias vão TODOS para cá. Nenhum é consertado lá.
- **Fase 0** — **Alinhamento do ERP** *(D14)* — entre o P25 e a Fase A
- **Fase A** — Integração contínua *(D9)*
- **Fase B** — Quitação do baseline + lacunas de gate
- **Fase F** — Achados de comportamento *(inclui o `localStorage.clear()`)*
- **Fase C** — Limpeza do contrato público → `2.0.0` *(D12)*
- **Fase D** — Ciclo de atualização do consumidor *(D11)*
- **Fase E** — E2E no pipeline

> **Nota de numeração:** o número no NOME do arquivo é ordem de **leitura**, não de **execução**. `arquitetura/01` sai antes de `arquitetura/00` de propósito — a forma do produto é pré-requisito do mapa.

---

# FASE 0 — FUNDAÇÃO

## P0 — Criar `specs/adr/` e reescrever os índices

```
Você vai preparar o terreno da campanha "Reescrita da Base de Specs" da Sarak-Lib-UI-Core. É a tarefa de FUNDAÇÃO: cria a categoria que falta e conserta os dois índices, que hoje mentem.

Preparação: (1) acione `ui-contexto-repositorio`; (2) leia `specs/plan/00-prompts-execucao.md` INTEIRO (o mapa da campanha, as regras comuns, o baseline e a regra de DIVERGÊNCIA); (3) leia `specs/INDEX.md`, `specs/README.md` e `specs/_templates/*`.

CONTEXTO — os dois defeitos confirmados:
- `specs/INDEX.md` documenta uma pasta `adr/` que NÃO EXISTE no repositório.
- `specs/README.md` diz, em letras garrafais, que planos de implementação não devem existir "em NENHUM LUGAR dentro do projeto" — enquanto `specs/plan/` tem 45 arquivos. A contradição confunde todo agente que entra.

TAREFA:
- T1: CRIAR a pasta `specs/adr/` com um `README.md` curto explicando: o que é um ADR neste repositório, que é documento IMUTÁVEL (decisão errada não se edita — cria-se um ADR novo que a substitui, via `substitui`/`substituido_por` do frontmatter), a convenção de nome (`NNN-kebab-case.md`, 3 dígitos) e o link para `_templates/template-adr.md`.
- T2: REESCREVER `specs/INDEX.md` como o mapa real das 4 categorias, com uma frase por categoria e a ordem de leitura recomendada para um agente que chega agora (arquitetura → adr → specs). Deixe um marcador explícito de que a lista completa de documentos será preenchida ao longo da campanha (a base ainda está sendo escrita).
- T3: REESCREVER `specs/README.md` para descrever o fluxo REAL deste repositório: as 4 pastas, o que entra em cada uma, quem é vivo e quem é imutável, e a regra do `plan/` — que aqui É usado (é um plano transitório, com data de morte, esvaziado ao fim de cada campanha), ao contrário do texto genérico atual. Registre que o histórico de execução vive no git e no `00-progresso.md` enquanto a campanha durar.

FRONTEIRAS: não crie nenhum ADR ainda (é P1/P2); não apague nem edite nenhuma spec de `arquitetura/` ou `specs/`; não toque em `plan/` além do checkbox e do progresso; não altere código.

GATES: nenhum código foi tocado — rode `npm run guide:check` e `npm run catalog:check` só para confirmar que continuam verdes (prova de que nada vazou).

ENTREGUE: o RELATÓRIO DE ENTREGA no formato da §7 das regras comuns. Marque o checkbox de P0 e registre em `00-progresso.md`. NÃO commite sem autorização.
```

---

# FASE 1 — ADRs

## P1 — ADR 001 a 004: as três arquiteturas e as três remoções

```
Você vai escrever QUATRO ADRs na Sarak-Lib-UI-Core, registrando as decisões estruturais que a base de specs nunca formalizou. ADR = documento IMUTÁVEL: contexto, decisão, consequências. É o "por quê", não o "como".

Preparação: (1) acione `ui-contexto-repositorio`; (2) leia `specs/plan/00-prompts-execucao.md` INTEIRO; (3) estude `sarak:spec-fundacao` e `sarak:spec-write` (formato) + `specs/_templates/template-adr.md`; (4) leia o material-fonte listado em cada ADR abaixo, INTEIRO; (5) CONFIRME no código cada remoção antes de escrevê-la.

FORMATO: cada ADR usa o `template-adr.md` (frontmatter completo: `tipo: adr`, `titulo`, `status: "🟢 Aceito"`, `tags`, `relacionados`), com as 3 seções: Contexto e Problema · Decisão · Consequências (Positivas / Negativas-Trade-offs). Curto e denso — 1 a 2 páginas cada. Data da decisão no corpo.

ENTREGAR (4 arquivos em `specs/adr/`):

- `001-tres-arquiteturas.md` — "As três arquiteturas e por que sobraram duas".
  Contexto: a lib carregou SIMULTANEAMENTE três arquiteturas em `src/core/` — #1 módulos-plugin (Shell+Discovery), #2 renderizador de páginas por manifesto (Manifest), #3 componentes atômicos + Provider + Design Engine — e ninguém tinha isso escrito; a descoberta veio da auditoria de 2026-07-22.
  Decisão: assumir #1 + #3 como o produto; remover só o #2 e o backend.
  FONTE: `plan/00-indice.md` (Princípio vigente + os dois blocos "Histórico"), `plan/00-progresso.md` (entradas de 2026-07-22 e 2026-07-24), `plan/43-design-system-primeiro.md`.
  ESCOPO: só o enquadramento — cada remoção tem ADR próprio (não repita o conteúdo deles).

- `002-remocao-motor-manifesto.md` — "Remoção do renderizador de páginas por manifesto (#2)".
  Contexto: a tese "100% via manifesto, zero React no consumidor" FALHOU empiricamente (o Teste Real bateu em 4 paredes numa tela simples); o motivo é ESTRUTURAL, não de implementação — renderizador declarativo genérico é reconstruir uma linguagem em JSON, e o gap nunca fecha. Ninguém usava o #2.
  Decisão: remover `src/core/Manifest/` inteiro e toda a superfície (Dispatcher/actions, pipes, `renderIf`/`renderFor`/`responsive`, `NATIVE_COMPONENTS`, gate `RegistryParity`, catálogo de manifesto, templates, skills do #2).
  CONFIRME e CITE no ADR: `src/core/Manifest/` não existe; grep de `SarakManifestRenderer|NATIVE_COMPONENTS|core/Manifest` em `src/` = 0.
  Consequência a registrar: o ferramental do #3 (gate `barrel:check`, gerador `npm run catalog`) tinha sido construído EM CIMA do Registry do #2 e precisou ser re-apontado para AST do código-fonte ANTES da remoção (`scripts/publicComponents.mjs`).
  FONTE: `plan/46-remover-motor-de-manifesto.md`, `plan/40-teste-real.md`, `specs/specs/11-engine-declarativa-e-manifestos.md`, `specs/arquitetura/07-plano-diretor-engine-declarativa.md`.

- `003-remocao-backend-proprio.md` — "Remoção do backend próprio — tema é dado no código do consumidor".
  Contexto: a lib mantinha um backend Node (`backend/`, 2º build tsup, `dist/backend-node`, drivers pg/better-sqlite3, endpoints de tema/branding) — passivo de segurança e de manutenção numa biblioteca de FRONT.
  Decisão: remover o backend; temas viram JSON no código do consumidor (`customThemes`), a seleção vai para `localStorage`, o painel EXPORTA JSON, e a lib nunca faz fetch/POST para servidor próprio.
  CONFIRME e CITE: `backend/` não existe; `validateDesign` em `src/core/Provider/utils/validation.ts` é a fronteira que substituiu a validação server-side.
  Consequências a registrar: supersede a "porta de persistência" (plan/19); `options.endpoints.branding` removido é BREAKING CHANGE conhecido para o `Sarak-MyService`; `specs/arquitetura/09` §4/§5/§6 (router.py, models.py, tabela `ui_core.custom_themes`, contrato REST) passou a descrever código inexistente.
  FONTE: `plan/44-temas-json-e-persistencia.md`, `plan/19-porta-de-persistencia-ui.md`, `specs/arquitetura/09-pipeline-criacao-aplicacao-tema.md`, `specs/specs/08-consumo-externo-e-integracao.md` §4.

- `004-remocao-design-agent.md` — "Remoção do Design Agent (agente LLM embarcado)".
  Contexto/Decisão: o agente de geração de temas (`agent-design-operator/`, ~131 arquivos, `options.designAgent`, `DesignAgentChatCard`, hooks e tipos públicos) saiu da biblioteca; deixou de ser contrato público.
  Consequências: BREAKING CHANGE (o MyService injetava `designAgent`); o sub-plano de specs 01–07 do Design Agent foi cancelado; a porta NÃO foi mantida.
  FONTE: `plan/23-remocao-design-agent.md`, `plan/01-auditoria-cobertura-componentes.md` (frontmatter cancelado), `specs/specs/08-consumo-externo-e-integracao.md` §6.2.

FRONTEIRAS: ADR registra DECISÃO, não implementação — não descreva como o motor de manifesto funcionava (ele morreu; quem quiser, git); não proponha nada novo; não edite nenhuma spec existente; não apague nada; não toque em código. Se um material-fonte afirmar algo que o código contradiz, o CÓDIGO VENCE e a divergência vai para o relatório.

GATES: nenhum código tocado — confirme `catalog:check`/`guide:check` verdes.

ENTREGUE: o RELATÓRIO DE ENTREGA (§7). Na RASTREABILIDADE, cada remoção afirmada precisa da prova (grep/Test-Path com a saída). Marque o checkbox de P1 e registre em `00-progresso.md`. NÃO commite sem autorização.
```

---

## P2 — ADR 005 a 007: modelo oficial, zero-marca, distribuição

```
Você vai escrever TRÊS ADRs na Sarak-Lib-UI-Core, fechando o registro das decisões estruturais. Mesmo formato e mesmas regras do P1 (leia `specs/plan/00-prompts-execucao.md` INTEIRO antes — regras comuns, baseline, regra de DIVERGÊNCIA).

Preparação: (1) `ui-contexto-repositorio`; (2) este arquivo inteiro; (3) `specs/_templates/template-adr.md` + skill `sarak:spec-fundacao`; (4) o material-fonte de cada ADR; (5) CONFIRME no código.

ENTREGAR (3 arquivos em `specs/adr/`):

- `005-modelo-modulos-plugin-e-apps-separados.md` — "Modelo módulos-plugin oficial e a composição apps-separados".
  Contexto: depois da queda do manifesto-only, o mantenedor oficializou o modelo que o único consumidor real já usava (#1: o host registra módulos e o `SarakShell` resolve navegação). A auditoria de um segundo consumidor real (monorepo React puro, apps separados por deploy) mostrou que existe um SEGUNDO modo legítimo (#3: a lib entra como `ui-kit` de componentes + tokens + Design Engine central, SEM `SarakShell` como host).
  Decisão: reconhecer os DOIS modos, partilhando o mesmo núcleo (Provider + tokens + central). Consequência direta: o cromo é POR-APP (`SarakAppChrome`, apresentacional, sem host/registro) e a central atinge todas as telas por catálogo de temas compartilhado (código) + `localStorage` mesma-origem (seleção).
  CONFIRME e CITE: `registerSarakModule`/`registerLocalComponent` em `src/core/Discovery/registry.ts`; `SarakAppChrome` em `src/components/Layout/SarakAppChrome.tsx` (o comentário de cabeçalho explica a lacuna que ele fecha); `persistence.crossTabSync` em `src/core/Provider/types.ts`.
  Registre também o VEREDITO empírico: o Teste Real foi APROVADO em 2026-07-25 e foi ele que liberou a remoção do #2.
  FONTE: `plan/43`, `plan/40` (v5), `plan/40.1`, `plan/40.2`, `RELATORIO-TESTE-REAL.md`, `RELATORIO-INSTALACAO-CONSOLIDADO.md`.
  ESCOPO: a DECISÃO de composição. O "como usar cada modo" é `arquitetura/01` (P3) — não antecipe.

- `006-zero-marca-soberania-host.md` — "A lib nunca estampa a própria marca".
  Contexto: a biblioteca sobrescrevia o `document.title` do host com a própria marca por causa de defaults, e vários componentes que o consumidor EMBUTE no produto dele renderizavam literais de marca da lib. Foram encontrados 5 sinks reais (2 além do reportado inicialmente: a FONTE do `brand.name` no Shell e o widget de usuário).
  Decisão: título, favicon e qualquer rótulo de marca são SEMPRE do importador; a lib só age por OPT-IN; defaults de identidade nascem AUSENTES; e a regra é cobrada por um gate.
  CONFIRME e CITE: `scripts/check-zero-brand.mjs` (o gate, com sua allowlist de painéis internos), `SarakBrandingState` em `src/core/Provider/types.ts` (campos de identidade opcionais), `docs/identidade-do-host.md`.
  FONTE: `plan/47-soberania-identidade-host.md`, `plan/49-erradicar-marca-lib-componentes.md`, `docs/identidade-do-host.md`, `docs/migracoes.md`.

- `007-distribuicao-por-git.md` — "Distribuição por Git, sem registry npm".
  Contexto: o pacote é instalado por `github:` ou `file:`/`link:`, nunca publicado em registry. Consequência MEDIDA, não teórica: `npm install` vira no-op quando a `version` não muda, e o consumidor fica para trás EM SILÊNCIO. Dois incidentes reais: um consumidor preso 4 commits atrás por semanas; e um build stale no store do pnpm que REPROVOU uma spec por engano (o código estava correto).
  Decisão: manter a distribuição por Git enquanto o módulo estiver em desenvolvimento, e compensar o que ela não dá — identidade de build verificável (`dist/BUILD_INFO.json`), comando de atualização explícito, e aviso ativo no terminal do consumidor (`sarak-ui check --notify` no `predev`).
  Registre EXPLICITAMENTE: "sempre a mais atual" é SOB COMANDO; automático exigiria registry + semver.
  CONFIRME e CITE: `package.json` (`bin`, `files`, ausência de `publishConfig`), `dist/BUILD_INFO.json` (incl. a nota sobre `baseCommit` ser sempre 1 commit atrás), `bin/scaffold/checkUpdate/**`, e o fato medido de que `git tag` retorna VAZIO (zero tags em 329 commits).
  FONTE: `plan/39-importacao-e-atualizacao.md`, `plan/51-aviso-de-atualizacao-e-cli-do-consumidor.md`.
  ⚠️ ESCOPO: este ADR registra a decisão de DISTRIBUIÇÃO. A política de NÚMERO de versão (a renumeração para 1.0.0) é decisão separada e mora na spec de versionamento (P12) — mencione que existe, não a resolva aqui.

FRONTEIRAS: as mesmas do P1. Não proponha adotar registry/tags — isso é opção aberta do dono, registrada em P12, não decisão sua.

GATES: nenhum código tocado — confirme `catalog:check`/`guide:check` verdes.

ENTREGUE: o RELATÓRIO DE ENTREGA (§7). Marque o checkbox de P2 e registre em `00-progresso.md`. NÃO commite sem autorização.
```

---

# FASE 2 — ARQUITETURA

## P3 — `arquitetura/01-forma-do-produto-e-modos-de-consumo.md`

```
Você vai escrever o documento de arquitetura MAIS IMPORTANTE da Sarak-Lib-UI-Core: o que a biblioteca É hoje. Ele substitui `specs/specs/00-manifesto-arquitetural-ui-core.md` (que ainda descreve o Registry do motor de manifesto como "ponto de composição oficial" — código removido) e o "Princípio vigente" que hoje mora enterrado no `plan/00-indice.md`.

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO; (3) `specs/_templates/template-arquitetura.md` + skill `sarak:spec-write`; (4) os ADRs 001–005 recém-escritos em `specs/adr/` (este documento APONTA para eles, nunca repete o porquê); (5) o material-fonte abaixo; (6) o código.

DESTINO: `specs/arquitetura/01-forma-do-produto-e-modos-de-consumo.md` (frontmatter `tipo: arquitetura`, `status: "🟢 Vigente"`).

CONTEÚDO:
- O que a lib É: base de front React+TS, SEM backend, distribuída como `@sarak/lib-ui-core`, composta de #1 (Shell/Discovery) + #3 (átomos + Provider + Design Engine central).
- O que foi REMOVIDO e o ponteiro para o ADR de cada remoção (#2 → ADR-002; backend → ADR-003; Design Agent → ADR-004). UMA linha cada — o porquê está no ADR.
- A FRONTEIRA LAYOUT × LOOK: o importador POSSUI o layout (registra seus módulos / escreve seus apps, React livre); a base POSSUI o look (o Design Engine é a central; qualquer marcação que use os tokens públicos responde à troca de tema; marcação hardcoded fora do contrato NÃO é tematizada). Esta é a frase que mais evita mal-entendido — escreva-a com cuidado.
- Os DOIS MODOS DE CONSUMO, lado a lado, com critério de escolha explícito:
  · Modo Shell-host (#1) — `SarakUIProvider` + `SarakShell` + `registerSarakModule`/`registerLocalComponent`; a lib é dona do layout e da navegação. CITE `src/core/Discovery/registry.ts` e o exemplo mínimo do `README.md`.
  · Modo ui-kit + central (#3) — o consumidor tem os próprios apps; a lib entra como kit de componentes + tokens + Design Engine; cromo por-app via `SarakAppChrome`; sincronização entre apps por `localStorage` mesma-origem (`persistence.crossTabSync`, default true). CITE `src/components/Layout/SarakAppChrome.tsx` e `src/core/Provider/types.ts`.
- O EIXO ORTOGONAL `mode: 'app' | 'embedded'` — deixe EXPLÍCITO que é outro eixo (dono da página), não um terceiro modo de consumo. Tabela app × embarcado: CSS (injeção automática × `sarak-scoped.css`), onde os tokens são ancorados, `document.title`/favicon, fontes globais, overlays de página inteira, escopo do `SovereignThemeInjector`. Registre o limite declarado: N Renderers/ilhas sob 1 Provider embarcado é suportado; N Providers embarcados na mesma página NÃO é. CITE `src/core/Provider/SarakUIProvider.tsx` e `src/core/Provider/scope.ts`.
- Consumo por outras linguagens/agentes: não há endpoint; quem precisa dos dados do Design System lê o catálogo estático publicado (`docs/component-catalog.json`).

MATERIAL-FONTE: `specs/specs/00-manifesto-arquitetural-ui-core.md` (reescrever), `specs/specs/08-consumo-externo-e-integracao.md` §0/§0.1/§0.2/§4 (fatiar), `plan/00-indice.md` (o "Princípio vigente" e os dois "Histórico"), `plan/43`, `plan/24`, `plan/40` §1.1, `README.md`.

FRONTEIRAS: nada de API de componente (é `arquitetura/03`, P7); nada de mecanismo do Design Engine (é `arquitetura/02`, P6); nada de receita de instalação (é P22); NÃO repita o porquê das remoções (é ADR). Não apague `specs/specs/00-*` nem `08-*` — a remoção é P25.

GATES: nenhum código tocado — `catalog:check`/`guide:check` verdes.

ENTREGUE: o RELATÓRIO DE ENTREGA (§7). Critério de aceite a demonstrar: "um agente escolhe corretamente entre os dois modos de consumo lendo SÓ este documento" — mostre como o texto entrega isso. Marque o checkbox de P3 e registre em `00-progresso.md`. NÃO commite sem autorização.
```

---

## P4 — `arquitetura/00-mapa-do-modulo.md`

```
Você vai escrever o MAPA TOPOGRÁFICO real da Sarak-Lib-UI-Core: onde cada coisa mora, como se chama e o que pode importar o quê. Ele substitui `specs/arquitetura/00-mapa-topografica-modulo.md`, que está defasado (lista 5 das 14 categorias atômicas e descreve uma pasta `features/DesignEngine/api` "com integração ao Agent LLM" — removido).

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO; (3) `specs/_templates/template-arquitetura.md`; (4) `arquitetura/01` (P3, já pronto); (5) VARRA `src/` de verdade — a árvore que você escrever tem de bater 1:1 com o filesystem.

DESTINO: `specs/arquitetura/00-mapa-do-modulo.md`.

CONTEÚDO:
- A árvore REAL de `src/`, em bloco de código, com uma linha de responsabilidade por pasta: `core/{Provider,Design,Discovery,Shell,Security}`, `components/{atomic,engines,Layout}`, `features/DesignEngine`, `shared/`, `styles/`, `effects/`, `constants/`, `types/`. As 14 categorias atômicas REAIS (Atoms, Buttons, Cards, DataDisplay, Feedback, Icon, Inputs, Layouts, Media, Modals, Navigation, Tables, Templates, UX) — confirme a lista varrendo a pasta, não copiando daqui.
- As 3 CAMADAS e a regra de dependência, com o gate que a cobra: `src/components` NÃO importa `features/`; `src/core` NÃO importa `features/` (inversão de dependência). CITE `.agents/skills/ui-auditoria-modulo/scripts/auditor_arquitetura.mjs` (é ele que cobra, por AST).
- A convenção de HOOKS CONTROLADORES: cada categoria de átomo tem sua pasta `hooks/` onde vive o controlador de estilo (`useCardLayoutStyles`, `useButtonLayoutStyles`, `useTableLayoutStyles`, `useModalLayoutStyles`) + os transversais em `components/atomic/hooks/` (`useStructuralStyles` e seus companions `.gap.ts`/`.presets.ts`, `useAtomicStyles`). Explique POR QUE eles existem (é onde o hardcode estrutural é legítimo, fora do `.tsx` que o auditor varre) e a regra do arquivo companion quando o hook cresce.
- Nomenclatura: componentes `PascalCase` com prefixo `Sarak` para peças públicas; hooks `camelCase` com `use`; utils/scripts `kebab-case`/`snake_case`; tokens de design em CSS sempre `--sarak-*` ou `--theme-*` COM FALLBACK (namespace `--sx-*` PROIBIDO — variável-fantasma); props estruturais `camelCase`.
- Onde alocar o quê: uma tabela de decisão curta ("é visual e burro → `components/atomic/<Categoria>`; tem estado/negócio → `features/`; é infraestrutura agnóstica de UI → `core/`; é casca de app → `components/Layout/`").
- As pastas fora de `src/` que fazem parte do módulo: `scripts/` (gates e geradores), `bin/` (CLI do consumidor), `docs/` (gerados + guias), `sarak-ui/` (kit do consumidor, gerado), `.agents/skills/` (as skills do mantenedor), `.githooks/`.

MATERIAL-FONTE: `specs/arquitetura/00-mapa-topografica-modulo.md` (reescrever), `specs/arquitetura/00-base-typescript.md` (aposentar — salve só o que ainda for verdade; ele fala de eslint/prettier que este repo NÃO usa), `specs/specs/03-padrao-e-taxonomia-biblioteca-atomica.md` §1.1 (fronteiras), `specs/arquitetura/04-paridade-cinco-camadas.md` §5 (regra do companion), o filesystem.

FRONTEIRAS: mapa é estrutura, não comportamento — não descreva o que cada componente FAZ; não liste componente por componente (isso é o catálogo gerado); não invente pasta que não existe; se achar pasta órfã/morta, NÃO apague — registre em DIVERGÊNCIAS.

GATES: nenhum código tocado — `catalog:check`/`guide:check` verdes.

ENTREGUE: o RELATÓRIO DE ENTREGA (§7). Critério de aceite: toda pasta de `src/` aparece com dono e regra, e a árvore descrita bate com o filesystem (mostre a varredura). Marque o checkbox de P4 e registre em `00-progresso.md`. NÃO commite sem autorização.
```

---

## P5 — `arquitetura/04-contrato-de-tokens-e-paridade.md`

```
Você vai escrever o documento que define o CONTRATO DE TOKENS da Sarak-Lib-UI-Core — o dicionário do Design System e o que "paridade" significa HOJE. É pré-requisito do documento do Design Engine (P6), por isso vem antes.

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO; (3) `specs/_templates/template-arquitetura.md`; (4) `arquitetura/00`/`01` (P3/P4, prontos); (5) o material-fonte; (6) RODE `node .agents/skills/ui-auditoria-modulo/scripts/run_audit.mjs` e use os NÚMEROS REAIS da saída (não os do material antigo).

DESTINO: `specs/arquitetura/04-contrato-de-tokens-e-paridade.md`.

CONTEÚDO:
- O DICIONÁRIO: 28 schemas em `src/core/Design/schema/*.ts` → `MASTER_DESIGN_MAP` (`src/core/Design/master-map.ts`) → tokens roteados por `src/core/Design/catalog/theme_table_mapping.json` para as partições de `catalog/partitions/*.json`. CONFIRME os números com `verify_parity` (a auditoria reporta 409/409/409 — e imprime uma linha final com 416; registre a divergência de contagem em DIVERGÊNCIAS, não a esconda).
- Uma chave só é REAL se existir nas 3 fontes. Fora disso, é inexistente.
- As DUAS ALAVANCAS: Valor (vira `var(--sarak-<kebab-id>, fallback)` no DOM) × Estrutural (lida em JS pelo Hook Controlador; marcada com `structuralConsumer` no schema e `consumerHook` na partição). Explique que a lista estrutural é FECHADA e que a fonte é `getStructuralTokens()` — NÃO transcreva a tabela de tokens; aponte para a função.
- As FONTES VIVAS e o mandamento de nunca copiá-las: `getAllDesignTokens()`, `getDefaultDesignState()`, `getDomainMap()` (bySchema × byColumn), `getScaffold(domain?)` (Preset = fatia, Tema = tudo), `upgradeThemePayload` (`legacyValue`).
- O CONTRATO DE VALOR — `validateDesign` (`src/core/Provider/utils/validation.ts`): domínio de chaves FECHADO (tokens do catálogo + `PAYLOAD_EXTRA_KEYS` + `DESIGN_MANIFEST`), valor tipado por `token.type` (number/slider com clamp, boolean, select com enum, color com `COLOR_PATTERN`, responsivo `{desk,tab,mob}`), bloqueio de breakout CSS (`[<>{};]`), e o comportamento: chave/valor fora do contrato é DESCARTADO com `console.warn` — nunca injetado. Explique por que isto é o que torna `localStorage` e um JSON de tema escrito à mão seguros POR CONSTRUÇÃO.
- `auditTokenContract` como a versão PURA da mesma checagem (usada em gate/teste, sem efeito colateral) — e por que auditoria e runtime nunca divergem.
- O NAMESPACE: `--sarak-*` / `--theme-*`, SEMPRE com fallback; `--sx-*` proibido; toda var consumida precisa de fonte emissora real. CITE `auditor_ghostvars.mjs`.
- TOKENS SEMÂNTICOS de espaçamento: `resolveToken` (`src/core/Design/resolveToken.ts`) — `spacing-xs..xl` → CSS Var com fallback, passthrough de CSS já válido, e warn com sugestão (Levenshtein) + degradação para o default quando o autor inventa um valor.
- O QUE "PARIDADE" SIGNIFICA HOJE: seja preciso e honesto. Verificado por script: Schema ↔ theme_table_mapping ↔ Partições do catálogo (`verify_parity.ts`, via `auditor_paridade`). Verificado por outros gates, como camadas de ALCANCE: barril público (`barrel:check`) e catálogo gerado (`catalog:check`). ⚠️ A antiga "6ª camada = Registry do Manifesto" MORREU com o #2 — diga isso explicitamente, porque a skill `ui-novo-componente` ainda a exige.
- Anti-drift de tema/preset: `auditor_presets` compara os temas e presets shippados contra o `getScaffold()` vivo (120 itens auditados hoje) e reprova chave órfã.

MATERIAL-FONTE: `specs/arquitetura/04-paridade-cinco-camadas.md` (reescrever), `specs/arquitetura/09-pipeline-criacao-aplicacao-tema.md` §2/§2.2/§2.3/§2.4 (migrar) — ⚠️ §4/§5/§6 desse arquivo descrevem o BACKEND REMOVIDO (router.py, models.py, tabela `ui_core.custom_themes`, contrato REST): NÃO migre, registre como descartado; `plan/40.4-reconciliacao-contrato-tokens.md`, `plan/16-tokens-semanticos-e-validacao-de-valores.md`, `specs/arquitetura/05-diretriz-zero-any-e-foundation.md` §3 (Foundation Design State).

FRONTEIRAS: não transcreva lista de tokens; não descreva o pipeline de injeção (é P6); não descreva a UI do painel (é P18); não corrija o baseline do `run_audit`.

GATES: nenhum código tocado — mas RODE `run_audit` e reporte a saída (você precisa dela para os números do documento). Deve bater com o baseline da §5.

ENTREGUE: o RELATÓRIO DE ENTREGA (§7). Critério de aceite: os números do documento são os da execução, e a redefinição da "6ª camada" está explícita. Marque o checkbox de P5 e registre em `00-progresso.md`. NÃO commite sem autorização.
```

---

## P6 — `arquitetura/02-design-engine.md`

```
Você vai escrever o documento do MOTOR: como um objeto `design` plano vira tela na Sarak-Lib-UI-Core. É o coração do produto.

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO; (3) `specs/_templates/template-arquitetura.md`; (4) `arquitetura/04` (P5, pronto — este documento APONTA para ele para tudo que é dicionário/contrato de token, nunca repete); (5) o material-fonte; (6) o código de `src/core/Provider/**` e `src/core/Design/**`.

DESTINO: `specs/arquitetura/02-design-engine.md`.

CONTEÚDO:
- O PIPELINE completo, em diagrama e em prosa: entrada (`customThemes` / `initialTheme` / `activeThemeId` / `config` / `localStorage`) → `useDesignManager` → `validateDesign` → estado → `useDesignVariables` (gera as CSS Vars + aliases de `cssVars`) → `DesignInjector` (aplica em `documentElement`/`body` no modo app, ou no container da ilha no embarcado) → CSS de verdade, consumido com fallback. Em paralelo, a Alavanca Estrutural: o mesmo `design` lido em JS pelos Hooks Controladores, devolvendo `{className, style}`.
- O PROVIDER como orquestrador: a ordem real dos gerenciadores em `SarakUIProvider.tsx` (registry → merge de temas → design → branding → drafting → efeitos globais → guarda de stylesheet) e o que cada um faz. Explique `EMPTY_CUSTOM_THEMES` e o guard de `useDesignSync` — é a correção de um LOOP DE RENDER INFINITO real (referência estável de `customThemes` + `activeThemeId`); registre o padrão para não voltar.
- DRAFTING / live preview: `useSarakDrafting`, `draftDesign`, `isDrafting`, `lockDrafting`, e a diferença entre `applyConfig` (respeita rascunho) e `applyConfigRaw` (canal direto).
- ISOLAMENTO: `DesignScope` (micro-provider que injeta variáveis restritas a uma subárvore — usado no preview e no modo embarcado), `SarakScopeRoot`, `SarakPortalScope` (overlays fora da árvore continuam estilizados), `SovereignThemeInjector` e sua ancoragem por modo.
- ATMOSFERA E MÍDIA: `SarakBackgroundRenderer` + `useMediaLuminance` — o processamento híbrido de luminância (canvas off-screen 50x50 com `willReadFrequently`, transferência do buffer para um Web Worker, equação HSP, limiar 127.5, timeout de 500ms com fallback síncrono, degradação graciosa em bloqueio de CORS). ⚠️ Registre a NOTA DE DISTRIBUIÇÃO: o worker é INLINE via Blob URL DE PROPÓSITO — `new Worker(new URL(...))` é resolvido estaticamente pelo bundler do CONSUMIDOR e quebrava o build de quem importa a lib. Isso é decisão, não gosto.
- PERSISTÊNCIA (sem backend): `localStorage` via `useDesignStorageSync`, `storageKey`, `crossTabSync` (evento `storage` → revalida → reaplica), `onThemeChange` como porta "traga sua persistência", `strictBackendSync` e o que ele ainda significa. Aponte para ADR-003.
- INJEÇÃO DE CSS: `injectSarakStyles(SARAK_CSS)` roda na IMPORTAÇÃO do módulo (antes de qualquer Provider montar), `useSarakStylesheetGuard` confere no modo app e DESFAZ o CSS global no embarcado. Aponte para `arquitetura/05` (P8) para o lado do build.

MATERIAL-FONTE: `specs/arquitetura/01-arquitetura-motor-tema-design-engine.md` (reescrever), `specs/arquitetura/02-processamento-luminancia-hibrido.md` (FUNDIR como seção), `specs/arquitetura/09-pipeline-criacao-aplicacao-tema.md` §3/§7 (migrar; §4/§5/§6 são do backend removido — descartar), `plan/44-temas-json-e-persistencia.md`, `plan/43` §5.1 (o loop infinito), `plan/24` (comportamento por modo).

FRONTEIRAS: dicionário/contrato de token é `arquitetura/04` — APONTE, não repita; a UI do painel é P18; os temas em si são P13; nada de REST/endpoint/backend em lugar nenhum deste documento.

GATES: nenhum código tocado — `catalog:check`/`guide:check` verdes.

ENTREGUE: o RELATÓRIO DE ENTREGA (§7). Critério de aceite: o diagrama ponta-a-ponta é reprodutível nos arquivos citados e NENHUM passo menciona backend. Marque o checkbox de P6 e registre em `00-progresso.md`. NÃO commite sem autorização.
```

---

## P7 — `arquitetura/03-superficie-publica.md`

```
Você vai escrever o documento da SUPERFÍCIE PÚBLICA da Sarak-Lib-UI-Core: o que a lib expõe, como isso é cobrado, e quais fronteiras de bundle existem.

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO; (3) `specs/_templates/template-arquitetura.md`; (4) `arquitetura/00`/`04` (prontos); (5) o material-fonte; (6) `src/index.ts`, `scripts/publicComponents.mjs`, `scripts/check-barrel-parity.mjs`, `scripts/barrelExclusions.mjs`, `scripts/componentCatalog.mjs`.

DESTINO: `specs/arquitetura/03-superficie-publica.md`.

CONTEÚDO:
- O BARRIL ÚNICO `src/index.ts` é o contrato: o que está nele tem retrocompatibilidade; o que não está é interno e muda sem aviso. DEEP IMPORTS são proibidos por contrato.
- Como a superfície é DERIVADA hoje: `scripts/publicComponents.mjs` varre por AST as categorias de `src/components/atomic/**` (seguindo o barril `index.ts` da categoria quando existe, resolvendo `export *` em cadeia; varrendo `.tsx` de RAIZ quando não existe) + `src/components/Layout/**`. ⚠️ Registre a limitação conhecida: categoria SEM barril só tem a RAIZ varrida — componente em subpasta escapa do gate.
- O gate `barrel:check`: cobra componente E seu tipo `<Nome>Props`, e também derruba EXCLUSÃO OBSOLETA (nome na allowlist que já está exportado ou não existe mais). A allowlist (`barrelExclusions.mjs`) exige MOTIVO escrito — silêncio é proibido.
- O CATÁLOGO GERADO (`npm run catalog` → `docs/component-catalog.{json,md}`, conferido por `catalog:check` no build): componentes + props reais + tokens de espaçamento semânticos + CSS Variables públicas. É a fonte da verdade dos consumidores. ⚠️ Registre que ele SUCEDEU o antigo `manifest-catalog` e que a superfície de autoria de JSON (actions, pipes, diretivas) morreu com o #2.
- A TAXONOMIA por categoria, com uma linha de propósito cada (Atoms, Buttons, Cards, DataDisplay, Feedback, Icon, Inputs, Layouts, Media, Modals, Navigation, Tables, Templates, UX) + `engines/` (charts/chat/flows/visuals, wrappers de abstração sobre libs pesadas, 100% pintados por token) + `Layout/` (o cromo). NÃO liste componente por componente.
- A REGRA DA COMPOSIÇÃO ATÔMICA: proibido `<button>`/`<input>`/`<select>` cru dentro de template/componente pré-montado — tem de consumir `SarakButton`/`SarakInput`. O descumprimento causa vazamento de especificidade (o template fica preso na variável global e ignora a paridade atômica).
- FRONTEIRAS DE BUNDLE — a parte MEDIDA, com os números reais: o chunk de boot do consumidor caiu 3203,6 KB → 1533,6 KB (−52,1%). Registre as três dimensões e o veredito de cada uma: (a) acesso DINÂMICO ao barril `lucide-react` impedia tree-shaking → 789,2 KB → 56,5 KB (−92,8%) ao passar pelo `IconMap` curado; (b) hipótese "deps de ícone estão no dist" REFUTADA — o tsup externaliza `dependencies` sozinho; (c) hipótese "`export *` custa" REFUTADA — saída byte a byte idêntica; a causa real era `SarakChartEngine` exportado EAGER, anulando um `React.lazy` que já existia (echarts+recharts+zrender+lodash ≈ 2,9 MB no boot de TODO consumidor). Derive a REGRA: nada pesado sai eager do barril; componente pesado vive atrás de fronteira lazy.
- Contrato de nomes de ícone (`IconMap`, 100 nomes) e o `console.warn` em nome fora dele.
- DÍVIDAS NOMEADAS (registre, não conserte): `SarakTabs` DUPLICADO e incompatível (`Layouts/SarakTabs` com `items/defaultActiveId` × `UX/SarakTabs` com `tabs/activeTab/onChange`) — hoje só o de `UX/` é público e o outro é excluído do `export *`; e a DIVERGÊNCIA DE CONTAGEM da superfície (`barrel:check` reporta 78 componentes; `sarak-ui/VERSION` e o catálogo do kit reportam 85) — apure de onde vem a diferença e documente-a; se não conseguir apurar, vai para DIVERGÊNCIAS.

MATERIAL-FONTE: `specs/specs/03-padrao-e-taxonomia-biblioteca-atomica.md` §3 (taxonomia), `specs/specs/10-taxonomia-estendida-e-responsividade.md` §2 (taxonomia estendida — ⚠️ a §3 dele é responsividade e vai para P17), `specs/arquitetura/03-arquitetura-motores-especiais.md` (reescrever), `specs/specs/08-consumo-externo-e-integracao.md` §1/§5, `plan/41-piso-de-bundle-barris-de-icone.md`, `plan/40.1` §L1, `plan/42`, `plan/30`.

FRONTEIRAS: regras de estilo/hardcode são P9 (regras) — aqui só a regra de EXPOSIÇÃO; não conserte o `SarakTabs` duplicado; não mexa em `barrelExclusions.mjs`.

GATES: nenhum código tocado — rode `barrel:check` e `catalog:check` e reporte os números (você precisa deles).

ENTREGUE: o RELATÓRIO DE ENTREGA (§7). Marque o checkbox de P7 e registre em `00-progresso.md`. NÃO commite sem autorização.
```

---

## P8 — `arquitetura/05-build-e-distribuicao.md`

```
Você vai escrever o documento de BUILD, EMPACOTAMENTO E DISTRIBUIÇÃO da Sarak-Lib-UI-Core: como o artefato é produzido e o que ele contém.

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO; (3) `specs/_templates/template-arquitetura.md`; (4) ADR-007 (distribuição por Git, pronto); (5) `package.json` INTEIRO, `scripts/*.mjs`, `bin/sarak-ui.mjs`.

DESTINO: `specs/arquitetura/05-build-e-distribuicao.md`.

CONTEÚDO:
- O PIPELINE `npm run build` na ORDEM EXATA, com o papel de cada etapa e por que a ordem importa: `catalog:check` → `barrel:check` → `zero-brand:check` → `guide:check` → `build:js` (tsup ESM+CJS+DTS+shims+minify, com a lista de `--external`) → `build:css` (Tailwind CLI sobre `src/styles/sarak-base.css`) → `build:css:scoped` (lightningcss reescrevendo seletores para `.sarak-scope`) → `copy-base-css` → `inject-css` (substitui o placeholder `SARAK_CSS` de `src/core/Provider/__sarakCss.ts` pelo CSS real) → `generate-build-info`. Deixe explícito que os 4 gates rodam ANTES de compilar — build vermelho por documentação defasada é intencional.
- ⚠️ Registre a armadilha MEDIDA: o tsup EXTERNALIZA `dependencies` sozinho; um harness que só espelha a lista `--external` MENTE sobre o que está no bundle. Meça o `dist/`, não a flag.
- O CONTRATO DO PACOTE: campo `files` (`dist`, `bin` sem `__tests__`, `docs`, `sarak-ui`), `exports` (raiz + `./sarak.css` + `./sarak-scoped.css` + `./sarak-base.css`), `main`/`module`/`types`/`style`, `bin`. E o gate `package:check` (`scripts/check-package-contents.mjs`): roda `npm pack --dry-run --json` e cobra DUAS coisas — a lista de PROIBIDOS (`src/` SEM EXCEÇÃO, `specs/`, `playwright/`, snapshots, configs e arquivos de teste) e a lista de OBRIGATÓRIOS (os arquivos que o `init`/`check`/`refresh` do consumidor leem do pacote instalado, mais o kit `sarak-ui/`). Explique por que ausência ali é tão grave quanto excesso.
- DEPENDÊNCIAS: as 3 `dependencies` reais (`@phosphor-icons/react`, `@tabler/icons-react`, `dompurify`) × as `peerDependencies` (React, Tailwind v4 e as libs pesadas) — e a razão da divisão.
- CSS ZERO-CONFIG: a injeção automática é parte do CONTRATO PÚBLICO, não conveniência (sem ela os componentes não têm forma geométrica, porque o Tailwind interno não é processado no consumidor). A exceção SSR/Next (FOUC) e o import manual opcional. O `console.error` em dev quando a injeção falha.
- IDENTIDADE DE BUILD: `dist/BUILD_INFO.json` (`baseCommit`, `builtAt`, `libVersion`). ⚠️ Registre a armadilha: `baseCommit` é SEMPRE 1 commit atrás (auto-referência é impossível — o hash de um commit não pode conter a si mesmo); para saber se está atualizado use `sarak:check` ou o `resolved` do lock, NUNCA o `BUILD_INFO`.
- O CLI `bin/sarak-ui.mjs` e seus subcomandos (`init`/`check`/`refresh`) — só o mapa; o fluxo do consumidor é P22.

MATERIAL-FONTE: `package.json`, `scripts/**`, `specs/specs/08-consumo-externo-e-integracao.md` §2 (migrar), `plan/29-robustez-instalacao-pacote.md`, `plan/39-importacao-e-atualizacao.md` §2.2, `plan/24` (CSS escopado), `plan/41` (a armadilha do tsup).

FRONTEIRAS: a política de VERSÃO é P12 — aqui só o mecanismo (de onde o número sai e para onde ele se propaga); o kit do consumidor é P21; o fluxo de instalação/atualização é P22; NÃO rode `npm run build` para "testar" a menos que precise — e se rodar, não commite o `dist/`.

GATES: nenhum código tocado. Se rodar `npm run build` para conferir o encadeamento, reporte; caso contrário, `catalog:check`/`guide:check`/`barrel:check` bastam.

ENTREGUE: o RELATÓRIO DE ENTREGA (§7). Critério de aceite: cada linha do script `build` tem explicação e dono. Marque o checkbox de P8 e registre em `00-progresso.md`. NÃO commite sem autorização.
```

---

## P8-C — Correção da Fase 2 (3 edições pontuais)

> **Contexto para quem lê o roteiro:** a revisão da Fase 2 reverificou as medições por conta própria e aprovou os seis documentos. Encontrou **dois números errados e um achado subdimensionado**, todos no mesmo par de arquivos. É uma tarefa de edição cirúrgica — **markdown apenas**, nenhum código, nenhum gate novo.

```
Você vai aplicar TRÊS correções pontuais nos documentos da Fase 2 da Sarak-Lib-UI-Core. Elas vieram da revisão independente, que reverificou as medições e achou dois números errados e um achado subdimensionado. Os seis documentos foram APROVADOS — isto é acerto de precisão, não reescrita.

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO (regras comuns, baseline, regra de DIVERGÊNCIA); (3) leia os dois documentos-alvo INTEIROS antes de editar: `specs/arquitetura/03-superficie-publica.md` e `specs/arquitetura/04-contrato-de-tokens-e-paridade.md`.

⚠️ REGRA DESTA TAREFA: **confirme cada número você mesmo antes de escrever.** Não copie os números deste prompt de olhos fechados — se a sua medição divergir da minha, isso é uma DIVERGÊNCIA e você para.

CORREÇÃO 1 — `04-contrato-de-tokens-e-paridade.md` §6: o número de sufixos está errado.
O texto diz "expandida com 17 sufixos gerados". São **18**. Confirme lendo `GENERATED_SUFFIXES` em `.agents/skills/ui-auditoria-modulo/scripts/auditor_ghostvars.mjs`: 8 sufixos nomeados (`-rgb`, `-bg`, `-border`, `-text`, `-hover`, `-active`, `-light`, `-glow`) + 10 numéricos (`-10` a `-100`). Corrija o número.

CORREÇÃO 2 — `04-contrato-de-tokens-e-paridade.md` §2.1 e §2.2: a distribuição por coluna soma 416, não 409.
A tabela de §2.1 anuncia 409 nos três totais e, logo abaixo, lista a distribuição por coluna — que **soma 416**. Quem soma a lista não chega ao total e fica sem saber qual dos dois está errado (nenhum está).
- Em §2.1, acrescente a nota de rodapé: a soma das colunas é 416 porque sete ids são roteados para DUAS colunas cada; o total de ids únicos é 409. Aponte para §2.2.
- Em §2.2, acrescente a prova nova: **a duplicação de schema PROPAGA para o roteamento de persistência.** `src/core/Design/catalog/theme_table_mapping.json` tem **416 entradas brutas para 409 ids únicos** — os mesmos sete ids da tabela de §2.2 aparecem em duas colunas. Confirme você mesmo somando os arrays do JSON e deduplicando. Isso REFORÇA o achado; não o substitui.

CORREÇÃO 3 — `03-superficie-publica.md` §8: o achado dos engines é maior do que está escrito.
O texto registra que `SarakFlowEngine` não está no barril. Verdade, mas incompleto: das QUATRO categorias de `src/components/engines/`, apenas `charts/` é alcançável. Confirme rodando o coletor do próprio repositório (`collectExportedNames('src/index.ts')` de `scripts/publicComponents.mjs`) e checando os quatro nomes: `SarakChartEngine` está no barril; `SarakFlowEngine`, `SarakChatEngine` e `SarakVisualEngine` NÃO estão.
Reescreva a dívida para refletir o tamanho real: não é uma peça esquecida, é **uma pasta inteira fora do contrato público**. Mantenha o registro de que `barrel:check` não pega isso porque `engines/` está fora do escopo de varredura (o mecanismo já está descrito na §3 do próprio documento — aponte para ela). Mantenha o "não apurado — registrado para decisão": a escolha entre "interno de propósito" e "lacuna de exposição" é do dono.

FRONTEIRAS: **não toque em código, CSS, script, gate ou `README.md`** — nada além dos dois arquivos markdown citados. Não reescreva seções que não foram apontadas. Não corrija nenhum dos sete achados registrados nos documentos (eles têm rota própria: P9, P10 e P24). Não mexa nos ADRs nem nos outros quatro documentos da Fase 2.

GATES: nenhum código tocado — rode `npm run catalog:check` e `npm run guide:check` só para provar que nada vazou. Devem sair idênticos ao baseline.

ENTREGUE: o RELATÓRIO DE ENTREGA (§7), com a seção 2 (RASTREABILIDADE) trazendo a SUA medição de cada um dos três números (18 sufixos; 416 bruto × 409 únicos no `theme_table_mapping.json`; os quatro engines com presença/ausência no barril). Marque o checkbox de P8-C e registre em `00-progresso.md`. NÃO commite sem autorização.
```

---

# REGISTRO — os 7 achados da Fase 2 e para onde cada um foi roteado

A Fase 2 produziu sete achados que **não são erros dos documentos** — são defeitos e ambiguidades do próprio módulo, encontrados enquanto ele era documentado. Todos estão registrados nos documentos onde foram achados. **Nenhum foi corrigido**, e nenhum deve ser corrigido de passagem.

Esta tabela é a rota oficial. Se você é um agente executando P9, P10 ou P24, os itens marcados com o seu prompt são **escopo seu**.

| # | Achado | Onde está registrado | Rota |
| --- | --- | --- | --- |
| 1 | `src/components/atomic/Tables/` é categoria **sem componente** (só `hooks/useTableLayoutStyles.ts`); `SarakTable.tsx` mora em `Templates/` e importa cruzando a fronteira de categoria; `grep "atomic/Tables"` = 0 | `00-mapa-do-modulo` §9 | **P10** (dívida) + **decisão do dono** (mover é mexer em imports e testes; "qual é a categoria certa" é decisão de taxonomia) |
| 2 | Dois usos VIVOS de `--sx-*` — o namespace declarado proibido — em `src/styles/_utilities.css:80` e `:89`, como fallback de 2º nível que resolve para vazio. O `auditor_ghostvars` não pega porque varre só `components/` e `features/` | `00-mapa-do-modulo` §6.1 e `04-contrato-de-tokens-e-paridade` §6 | **P10** (dívida + **lacuna de cobertura do gate**). O conserto tem duas metades — as 2 linhas de CSS **e** o escopo do auditor; mexer em gate durante a campanha contamina o baseline, então vira spec própria |
| 3 | `CustomizationPanel` sai **eager** do barril (`src/index.ts:50`) e ainda é importado eager pelo efeito colateral de `:119-125` — contraria a regra derivada da campanha de bundle | `03-superficie-publica` §8 | **P9** (nomear como violação conhecida da regra "nada pesado eager") + **P10** (dívida). Tornar lazy muda o tipo público para `LazyExoticComponent` = **breaking change** |
| 4 | **Três das quatro** categorias de `src/components/engines/` estão fora do barril (`flows`, `chat`, `visuals`); só `charts` é alcançável | `03-superficie-publica` §8 (após P8-C) | **P9** (registrar) + **decisão do dono**: interno de propósito (e a taxonomia diz isso) OU lacuna de exposição |
| 5 | `README.md:18` manda o consumidor instalar `pg` como peerDependency — o driver saiu com o backend | `05-build-e-distribuicao` §4 | **P24** (escopo ampliado: mesma classe de ponteiro morto das skills) |
| 6 | `upgradeThemePayload` (`master-map.ts:148`) declara `partialMode` e nunca o usa | `04-contrato-de-tokens-e-paridade` §5 | **P10** (dívida) |
| 7 | `verify_parity.ts` mora em `ui-novo-componente/scripts/`, não em `ui-auditoria-modulo/` | `04-contrato-de-tokens-e-paridade` §8.1 | **Fechado.** Era imprecisão de um relatório de revisão; o plano nunca afirmou o caminho errado e o documento já registra o certo |

> **Regra que vale para os sete:** achado registrado não é achado resolvido, mas também não é achado esquecido. Quem executar P9, P10 ou P24 **tem de fechar os itens da sua linha** — e quem não conseguir fechar registra em DIVERGÊNCIAS, nunca em silêncio.

---

# FASE 3 — REGRAS, GATES, ENFORCEMENT E VERSÃO

## P9 — `specs/00-regras-e-invariantes.md` (o contrato único)

```
Você vai escrever a spec MAIS CITADA da Sarak-Lib-UI-Core: o contrato ÚNICO com TODAS as regras e invariantes do módulo. Hoje elas estão espalhadas por 7 documentos diferentes, algumas em duplicata e algumas contraditórias.

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO; (3) `specs/_templates/template-spec.md` + skill `sarak:spec-write`; (4) os 6 documentos de `specs/arquitetura/` já escritos (P3–P8) — as regras APONTAM para eles, não os repetem; (5) TODO o material-fonte abaixo.

DESTINO: `specs/specs/00-regras-e-invariantes.md`.

FORMATO DE CADA REGRA (obrigatório, sem exceção):
  **Rn — <nome curto da regra>**
  · Enunciado (uma frase imperativa)
  · Por quê (o dano concreto que ela evita — de preferência um dano que JÁ ACONTECEU)
  · Certo × Errado (exemplo mínimo de código)
  · **Cobrada por:** <gate exato + comando> — ou **"nenhum (conduta)"**, honestamente

⚠️ O campo "Cobrada por" é o coração desta spec. Regra sem gate é regra que só existe se alguém lembrar — e o leitor precisa saber disso. NÃO invente gate.

AS REGRAS A COBRIR (no mínimo — se achar outra no material, inclua e sinalize):
1. **3 camadas estritas** — `components/` ⊅ `features/`; `core/` ⊅ `features/`. Cobrada por `auditor_arquitetura.mjs`.
2. **Zero Hardcode** — nada de hex/px/rem/em nem Tailwind ESTRUTURAL (`p-4`, `gap-4`, `flex-col`, grid) no `.tsx` dos átomos; tudo vem de token via Hook Controlador. Documente os 3 BALDES do auditor (Corrigir/duro = reprova; Tolerado = hairlines ≤2px, permanente; Deduzido = proporção de ícone `w-N`/`h-N`, `w-full`/`h-full`, alinhamento `items-*`/`justify-*`, permanente) e as EXCEÇÕES DE POLÍTICA permanentes (cor de marca de TERCEIRO, ex. o hex do Google num botão social, não é tokenizável; grid sem token 1:1 vira PRESET NOMEADO no companion do hook, nunca carve-out do auditor; componentes de `internal/` deliberadamente desacoplados do Provider, ex. `CalendarPanel`, podem usar valor estrutural inline). Documente também as LIMITAÇÕES do detector, para ninguém "corrigir o código para contorná-las": template literal interpolado escapa; `_` em valor arbitrário de shadow escapa; `sanitizeFallbacks` NÃO aceita fallback negativo — a convenção é `calc(var(--token, <positivo>) * -1)`.
3. **Zero Any** — proibido `any`, `@ts-ignore` e `as any`; alternativas em ordem: tipo/interface próprio → genérico restrito para utilitário comprovadamente paramétrico → `unknown` + type guard SÓ na fronteira dinâmica real. `@ts-expect-error` só com documentação e contrato externo inevitável. Cobrada por `auditor_typescript.mjs`.
4. **Paridade** — token nasce nas 3 fontes ou não existe. Aponte para `arquitetura/04`. Cobrada por `auditor_paridade`/`verify_parity.ts`.
5. **Zero chave órfã em tema/preset** — cobrada por `auditor_presets`.
6. **Contrato de tokens** — valor dentro do enum/faixa/tipo do token; fora disso é descartado com warn. Cobrada por `validateDesign` (runtime) + `tokenContractParity.test.ts` (gate).
7. **Fallback sempre + namespace** — toda CSS Var consumida com fallback; `--sarak-*`/`--theme-*` apenas; `--sx-*` PROIBIDO; toda var precisa de emissor real. Cobrada por `auditor_ghostvars.mjs`.
8. **Cobertura 1:1** — todo componente/hook tem `__tests__/<nome>.test.{ts,tsx}` ao lado. Cobrada por `auditor_coverage.mjs`.
9. **Clean Code** — ≤250 linhas por arquivo (exceto temas/schemas/master-map), sem `else if`, ≤3 `useState`/`useEffect` por função, aninhamento de `if` ≤2. Cobrada por `auditor_cleancode.mjs`.
10. **Composição atômica obrigatória** — proibido HTML nativo cru em template/pré-montado; e proibido `switch`/`<style>` de roteamento de design no JSX (vai para Hook Controlador). Cobrada por: nenhum gate — CONDUTA.
11. **Configuração × Expansão** — a árvore de decisão completa: a chave já existe no dicionário? → Configuração (só dado, nenhum arquivo de `src/` tocado). Não existe? → Expansão (paridade + código). Traga a tabela de cenários. Cobrada por: nenhum gate — CONDUTA.
12. **Zero-marca** — a lib NUNCA estampa a própria marca. Cobrada por `zero-brand:check`.
13. **Identidade do host é do importador** — título/favicon/marca só por OPT-IN. Cobrada por testes; sem gate próprio.
14. **Barril completo** — componente consumidor-facing exportado + seu `<Nome>Props`; exclusão só com motivo escrito. Cobrada por `barrel:check`.
15. **Nada pesado eager no barril** — componente pesado atrás de fronteira lazy. Cobrada por: nenhum gate — CONDUTA (com o número medido: −52% de boot). 
16. **Zero-gambiarra** — o consumidor NUNCA precisa escrever CSS/media query para consertar comportamento da lib; buraco na lib vira demanda na lib, não workaround no importador. Cobrada por: nenhum gate — CONDUTA.
17. **Não transcrever fonte viva** — lista de token/componente/ícone nunca é copiada para markdown. Cobrada por `catalog:check`/`guide:check` (para os artefatos gerados).

⚠️ ACHADOS DA FASE 2 QUE SÃO ESCOPO SEU (ver "REGISTRO — os 7 achados da Fase 2" acima):
- **Achado 3 — a regra 15 já está sendo violada pela própria lib.** `CustomizationPanel` sai EAGER do barril (`src/index.ts:50`) e ainda é importado eager pelo efeito colateral de `:119-125`. Ao escrever a regra 15, registre esta violação NOMEADA junto com ela, com o custo (o painel inteiro do Design Engine no caminho crítico de todo consumidor) e o motivo de não ter sido corrigida (tornar lazy muda o tipo público para `LazyExoticComponent` = breaking change, exige decisão). Regra com violação conhecida e declarada é honesta; regra que finge estar cumprida é ficção.
- **Achado 4 — a regra 14 (barril completo) tem um vão.** Três das quatro categorias de `src/components/engines/` (`flows`, `chat`, `visuals`) não estão no barril, e o `barrel:check` não pega porque `engines/` está fora do escopo de varredura. Registre como limite CONHECIDO da regra 14 — não invente a decisão (interno de propósito × lacuna de exposição é do dono).

MATERIAL-FONTE: `specs/spec-any-eradication.md` (FUNDIR), `specs/arquitetura/05-diretriz-zero-any-e-foundation.md` §2 (FUNDIR), `specs/arquitetura/08-gate-auditoria-hardcode-e-variaveis.md` §3/§4 (as regras; os gates vão para P10), `specs/specs/03-padrao-e-taxonomia-biblioteca-atomica.md` §2 (Regras 1–5), `specs/specs/09-expansao-vs-configuracao.md` (FUNDIR inteiro), `specs/arquitetura/04-paridade-cinco-camadas.md` §4/§5, `plan/41` (regra 15), `plan/47`/`plan/49` (regras 12/13), os 8 auditores em `.agents/skills/ui-auditoria-modulo/scripts/`.

FRONTEIRAS: aqui é O QUE VALE, não COMO RODAR (isso é P10) nem QUANDO RODAR (P11). Não crie regra nova que não esteja no material ou no código. Se duas fontes se contradisserem, o CÓDIGO decide e a contradição vai para DIVERGÊNCIAS.

GATES: nenhum código tocado — `catalog:check`/`guide:check` verdes.

ENTREGUE: o RELATÓRIO DE ENTREGA (§7). Critério de aceite: TODA regra citada em qualquer outro documento da base está aqui, e cada uma tem "Cobrada por" honesto. Marque o checkbox de P9 e registre em `00-progresso.md`. NÃO commite sem autorização.
```

---

## P10 — `specs/01-gates-e-baseline.md`

```
Você vai escrever a spec dos GATES da Sarak-Lib-UI-Core: o que cada um garante, como rodar, como ler a saída, e qual é o BASELINE exato. É o documento que impede a próxima pessoa de acusar regressão onde há dívida conhecida.

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO; (3) `specs/_templates/template-spec.md`; (4) `specs/specs/00-regras-e-invariantes.md` (P9, pronto — cada gate aqui aponta para a(s) regra(s) que ele cobra); (5) LEIA os 8 auditores e os 5 scripts de check, um por um; (6) RODE TODOS os gates e use a SUA saída.

DESTINO: `specs/specs/01-gates-e-baseline.md`.

CONTEÚDO:
- CATÁLOGO DE GATES — uma entrada por gate, com: comando exato, o que garante, qual regra de `00-regras-e-invariantes` ele cobra, como ler a saída (o que é FAIL e o que é só relatório), e o custo aproximado em tempo.
  · `run_audit.mjs` — o agregador dos 8: `auditor_hardcoded` (com a reconciliação em 3 baldes na saída), `auditor_ghostvars` (cruza todo `var(--x)` consumido contra o registro real de variáveis emitidas — hoje 14.179), `auditor_typescript`, `auditor_coverage`, `auditor_arquitetura`, `auditor_cleancode`, `auditor_paridade` (→ `verify_parity.ts`), `auditor_presets` (→ `verify_presets.ts`).
  · `barrel:check`, `catalog:check`, `zero-brand:check`, `guide:check`, `package:check`.
  · `npm run build` (os 4 gates encadeados + DTS).
  · `npx vitest run` — a suíte COMPLETA. ⚠️ Registre a regra dura: "suítes verdes" exige a suíte INTEIRA; rodar pasta a dedo esconde snapshot de terceiros que quebrou.
  · `npx tsc --noEmit` — e a verdade incômoda: NÃO está em nenhum pipeline e NÃO está verde.
  · Playwright CT (`npm run test-ct`) e os `__e2e__` — existem e estão FORA de qualquer automação.
- A TABELA DE BASELINE, com data de medição e a regra de leitura: "compare com o baseline, NUNCA espere 0". Reproduza o baseline da §5 deste plano, mas com a SUA execução (se divergir do que está escrito aqui, isso é uma DIVERGÊNCIA de primeira ordem — reporte antes de escrever).
- DÍVIDA TÉCNICA CONHECIDA — item a item, com `arquivo:linha`, por que ainda existe e o que seria preciso para fechá-la:
  · hardcode: `SarakTypography.tsx:39` — fallback negativo (limitação do `sanitizeFallbacks`; a convenção `calc(... * -1)` resolveria).
  · ghostvars: `--token`, `--sarak-button-radius`, `--sarak-shell-brand-logo-size` — LOCALIZE cada consumo no código e registre. ⚠️ Nota conhecida: `--sarak-button-radius` é ghost; o token real de raio de card é `--sarak-card-radius`. Confirme antes de afirmar.
  · `tsc`: os 4 erros de produção (`useStructuralStyles.ts:30,71,94` — `ResponsiveValue<number>` não aceito por um helper que só aceita `string|number`; `ThemeCustomizationTab.tsx:86` — união de tipo de toast incompatível) e os 10 de teste.
  · Ghost vars históricas do `backlog_cobertura.md` que ainda procedem (ex.: `--sarak-shadow-glow` existe só como alias estático em `src/styles/_theme.css`, fora do pipeline dinâmico; `--sarak-sidebar-active`/`--sarak-topbar-active` — quebra de nome vs `*-active-color`). VERIFIQUE cada uma contra o código atual antes de trazer: várias podem já ter sido corrigidas.
  · ⚠️ **ACHADOS DA FASE 2 — escopo seu** (ver "REGISTRO — os 7 achados da Fase 2" acima). Cada um entra na dívida com `arquivo:linha`, causa e o que fecharia:
    - **Achado 2 (o mais grave — é lacuna de COBERTURA do gate, não só dívida):** dois usos VIVOS de `--sx-*`, o namespace declarado proibido, em `src/styles/_utilities.css:80` e `:89` (`var(--sarak-range-active-bg, var(--sx-color-primary-base))`). Como ninguém emite `--sx-color-primary-base`, o fallback de 2º nível resolve para VAZIO. O `auditor_ghostvars` **não acusa** porque varre só `src/components` e `src/features` — `src/styles/` é tratado como FONTE emissora, nunca como consumidora. Documente as duas metades do conserto (as 2 linhas de CSS **e** ampliar o escopo do auditor) e por que ele não é feito aqui: mexer em gate durante a campanha move o baseline que esta própria spec está fixando.
    - **Achado 3:** `CustomizationPanel` eager no barril (`src/index.ts:50` + efeito colateral `:119-125`) — dívida de bundle; conserto é breaking change de tipo.
    - **Achado 1:** `src/components/atomic/Tables/` é categoria sem componente (só `hooks/`), com `SarakTable.tsx` em `Templates/` importando o hook cruzando a fronteira; `grep "atomic/Tables"` = 0.
    - **Achado 6:** `upgradeThemePayload` (`master-map.ts:148`) tem `partialMode` declarado e nunca usado.
    Para cada um, registre TAMBÉM se ele é ou não visível em algum gate hoje — é essa coluna que revela o que o conjunto de gates não vê.
- A REGRA DE ORDEM DE CORREÇÃO ("raiz primeiro"): ao corrigir um consumo fantasma compartilhado, corrija a fonte compartilhada (hook controlador) ANTES dos consumidores individuais.
- A REGRA ANTI-AFROUXAMENTO: NUNCA relaxar a allowlist de um auditor para mascarar violação real; NUNCA excluir pasta do escopo do auditor para baixar a contagem.

MATERIAL-FONTE: `specs/arquitetura/08-gate-auditoria-hardcode-e-variaveis.md` (REESCREVER — é a melhor fonte, mas cobre só 2 dos 8), `.agents/skills/ui-auditoria-modulo/**`, `scripts/check-*.mjs`, `plan/backlog_cobertura.md` (Parte 1 — Ghost Vars; FILTRE o que ainda procede), `plan/15-revisao-marcadores-todo.md`, `package.json` (scripts), `vitest.config.ts`.

FRONTEIRAS: **NÃO CORRIJA NENHUM ITEM DO BASELINE.** Sua tarefa é documentá-lo com precisão cirúrgica; corrigir é outra spec, fora desta campanha. Não crie gate novo (o hook é P11). Não mude configuração de teste.

GATES: rode TODOS e cole a saída no relatório — este é o único prompt onde a saída dos gates É a entrega.

ENTREGUE: o RELATÓRIO DE ENTREGA (§7). Critério de aceite: rodar os comandos do documento reproduz exatamente o baseline escrito, e cada item de dívida tem `arquivo:linha`. Marque o checkbox de P10 e registre em `00-progresso.md`. NÃO commite sem autorização.
```

---

## P11 — `specs/02-enforcement-por-commit.md` + IMPLEMENTAR o pipeline

```
⚠️ ESTA TAREFA MEXE EM CÓDIGO/CONFIG. Leia as fronteiras com atenção.

Você vai escrever a spec de ENFORCEMENT POR COMMIT da Sarak-Lib-UI-Core **e implementar o pipeline de verdade**. Hoje existem 12+ gates que só rodam se alguém lembrar: o `pre-commit` instalado só faz varredura de segredos e regeneração de índice, e NÃO EXISTE CI (`.github/` ausente). Decisão do dono: **todo commit passa por um pipeline de validação**.

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO (esp. o baseline da §5); (3) `specs/_templates/template-spec.md`; (4) `specs/specs/00-regras-e-invariantes.md` e `specs/specs/01-gates-e-baseline.md` (P9/P10, prontos — são a entrada desta tarefa); (5) LEIA `.githooks/pre-commit`, `.githooks/config.json`, `.githooks/verificar_commit.py`; (6) estude a skill `sarak:git-verificacao-commit` (o padrão de gate de commit do ecossistema) e `sarak:git-revisao-diff`.

FATO CONFIRMADO A PRESERVAR: `git config core.hooksPath` já aponta para `.githooks/` e `.git/hooks/` está VAZIO — o hook versionado é o que roda. NÃO quebre o gate de segredos que já existe; ele é o primeiro estágio e continua bloqueando.

DESTINO (spec): `specs/specs/02-enforcement-por-commit.md`.
DESTINO (implementação): `.githooks/pre-commit` (estender) + o que for preciso em `scripts/` e `package.json`.

DESENHO EXIGIDO — três anéis, por CUSTO e por CONSEQUÊNCIA:
- **Anel 1 — BLOQUEIA (pre-commit, rápido, ~segundos):** os gates que hoje estão VERDES e devem continuar verdes para sempre — `barrel:check`, `catalog:check`, `zero-brand:check`, `guide:check`. Verde é a única saída aceitável; vermelho = commit barrado.
- **Anel 2 — BLOQUEIA SÓ EM REGRESSÃO (pre-commit):** `run_audit.mjs`, que tem baseline NÃO-ZERO. Compare a saída contra um **baseline VERSIONADO em arquivo** (proponha o formato e o caminho — algo como `.githooks/audit-baseline.json`, com a contagem por auditor). Igual ao baseline = passa com aviso; PIOR que o baseline = BLOQUEIA; MELHOR que o baseline = passa e AVISA que o baseline precisa ser atualizado (com o comando para atualizá-lo). Nunca "corrija" o baseline sozinho.
- **Anel 3 — pre-push ou manual (caro):** suíte completa `npx vitest run` (~136s), `npm run build`, `package:check`. Decida e JUSTIFIQUE o que entra em `pre-push` e o que fica manual — commit não pode custar 2 minutos.
- **`tsc --noEmit`:** hoje tem 14 erros e não é gate. Trate-o como o Anel 2 (baseline de contagem) OU deixe fora com justificativa escrita. **Escolha uma e explique** — não deixe ambíguo.

REQUISITOS DA IMPLEMENTAÇÃO:
- **Escopo por staged quando fizer sentido:** se o commit não toca `src/`, `scripts/`, `docs/` nem `sarak-ui/`, os gates de UI podem ser pulados (commit de documentação não paga o preço). Implemente essa detecção com `git diff --cached --name-only` e DOCUMENTE exatamente quando cada anel é pulado.
- **Mensagem acionável:** ao bloquear, dizer QUAL regra foi violada (referenciando `00-regras-e-invariantes` pelo número da regra), QUAL arquivo, e QUAL comando roda para ver o detalhe. Mensagem genérica é falha de entrega.
- **Confirmação positiva:** quando passa, imprimir uma linha por anel confirmando o que foi validado (o dono pediu "confirma regra aplicada", não só "acusa violação").
- **Idempotência e instalação:** um comando/script que garante `core.hooksPath` setado e o hook executável, seguro de rodar mais de uma vez. Documente para quem clona o repo do zero.
- **Escape auditável:** `--no-verify` existe e não dá para impedir; documente que o uso é excepcional e o que se espera de quem usa (rodar os gates depois).
- **Windows + Git Bash:** o hook atual é `sh` e roda em Git Bash. Mantenha compatível; nada de PowerShell-ismo dentro do hook.
- **CI:** `.github/` NÃO EXISTE. **NÃO crie CI nesta tarefa.** Registre na spec, numa seção "Opção em aberto", o que um CI acrescentaria (rodar o Anel 3 em PR) e deixe a decisão para o dono.

PROVA OBRIGATÓRIA (sem isto a entrega não é aceita) — demonstre, com saída real:
1. Um commit LIMPO passa, e o hook imprime a confirmação de cada anel.
2. Um commit que QUEBRA o barril (ex.: comentar um export consumidor-facing em `src/index.ts`) é BLOQUEADO, com a mensagem acionável. **Reverta a quebra depois** — ela é só o teste.
3. Um commit que PIORA o `run_audit` (ex.: introduzir um `p-4` num átomo) é BLOQUEADO pelo Anel 2. **Reverta depois.**
4. Um commit só de markdown NÃO paga o custo dos gates de UI.
5. O gate de SEGREDOS continua funcionando (não regrediu).

FRONTEIRAS: não altere nenhum auditor nem nenhum script de check existente (só ORQUESTRE); não "conserte" o baseline; não crie CI; não instale dependência nova (husky/lint-staged NÃO — o repo já tem `core.hooksPath` versionado, que é mais simples e não adiciona `node_modules` ao caminho crítico); não commite as quebras de teste.

GATES: todos, antes e depois — o baseline da §5 tem de ficar IDÊNTICO ao fim (você não mudou código de produção).

ENTREGUE: o RELATÓRIO DE ENTREGA (§7), com a seção 4 (GATES) contendo as 5 provas acima com saída real do terminal. Marque o checkbox de P11 e registre em `00-progresso.md`. NÃO commite sem autorização.
```

---

## P12 — `specs/03-versionamento-e-release.md` + RENUMERAR para `1.0.0`

```
⚠️ ESTA TAREFA MEXE EM CÓDIGO/CONFIG. A decisão de versão JÁ FOI TOMADA pelo dono — você a executa, não a rediscute.

Você vai escrever a spec de VERSIONAMENTO E RELEASE da Sarak-Lib-UI-Core e **renumerar a biblioteca para `1.0.0`**.

DECISÃO DO DONO (2026-07-27, registrada): **renumerar de `3.0.0` para `1.0.0`.** O `3.0.0` era herança sem significado — nunca houve 1.x nem 2.x com release, o pacote nunca foi publicado em registry, e a `version` ficou IMÓVEL por 15+ commits que alteraram o `package.json`. "Esta é a v1" é a realidade do produto; o número passa a dizer a verdade.

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO; (3) `specs/_templates/template-spec.md`; (4) ADR-007 (`specs/adr/007-distribuicao-por-git.md`) e `arquitetura/05` (P8) — prontos; (5) MAPEIE, por grep, TODOS os lugares onde `3.0.0` aparece como versão da lib.

DESTINO (spec): `specs/specs/03-versionamento-e-release.md`.
DESTINO (implementação): `package.json` + tudo que deriva dele.

TAREFA A — A RENUMERAÇÃO:
- Altere `package.json` → `"version": "1.0.0"`.
- REGENERE (não edite à mão) tudo que deriva: `dist/BUILD_INFO.json` (`libVersion`) via `npm run build`/`scripts/generate-build-info.mjs`; `sarak-ui/VERSION` (`libVersion=`) e o carimbo dentro de `sarak-ui/START-HERE.md` via `npm run guide`. ⚠️ `guide:check` VAI FICAR VERMELHO até você regenerar — isso é esperado e é a prova de que o gate funciona.
- Verifique se algum teste, script ou fixture assume `3.0.0` — corrija o que for legítimo, reporte o que for suspeito.
- Registre a mudança em `docs/migracoes.md` explicando que é uma RENUMERAÇÃO de identidade (não uma regressão de capacidade), que nada foi removido, e que consumidores que resolvem por `github:`/`file:` não são afetados (a resolução é por commit/caminho, não por semver).

TAREFA B — A SPEC:
- A política a partir de `1.0.0`: o que caracteriza MAJOR (quebra do contrato público — o barril, os tipos exportados, o nome/semântica de token, o comportamento default), MINOR (capacidade nova retrocompatível) e PATCH. Amarre "contrato público" à definição de `arquitetura/03` — o barril é o contrato.
- A FONTE ÚNICA do número: `package.json` → propaga para `BUILD_INFO.libVersion` e `sarak-ui/VERSION` por GERADOR, nunca à mão. Documente que editar um derivado à mão é bug (e que `guide:check` pega).
- `docs/migracoes.md` como o registro obrigatório de todo breaking change do contrato público, com o formato de entrada (antes/depois + como migrar) e a regra: breaking change sem entrada lá = entrega incompleta.
- O RITUAL DE RELEASE de hoje, honestamente: `npm run build` → `package:check` (via `prepublishOnly`) → commit do `dist/` → o consumidor atualiza SOB COMANDO (`sarak:update`). Sem publish, sem tag.
- ⚠️ SEÇÃO "OPÇÕES EM ABERTO (decisão do dono, NÃO decididas)": registre, sem escolher, que (a) hoje há **ZERO tags git** em 329 commits, e adotar `git tag vX.Y.Z` a cada release faria a version significar algo verificável; (b) publicar em registry (npm privado / GitHub Packages) resolveria a raiz de o `npm install` ser no-op — a causa dos dois incidentes reais documentados no ADR-007. Apresente prós/contras de cada uma. **Não implemente nenhuma das duas.**

FRONTEIRAS: **NÃO rode `npm version`** (ele cria tag e commit — a decisão de tag NÃO foi tomada); edite o campo diretamente. NÃO publique, NÃO tague, NÃO faça push. NÃO renumere nada além da versão da lib (o `kitSchemaVersion`, o `schema_version` do design state e as versões internas de componentes, ex.: `MASTER_DESIGN_MAP.version = '13.0.0'`, são OUTRAS coisas — não toque, e diga por quê na spec).

GATES: `npm run guide` (regenerar) → `guide:check` verde; `npm run build` (regenera `BUILD_INFO`) → verde; `package:check`; suíte COMPLETA `npx vitest run` (280/890 — se algum teste assumia `3.0.0`, ele aparece aqui); `run_audit` no baseline exato.

ENTREGUE: o RELATÓRIO DE ENTREGA (§7), com um grep de `3.0.0` no repositório mostrando o antes e o depois (o que sobrou e por quê — `package-lock.json` e `dist/` regenerados contam). Marque o checkbox de P12 e registre em `00-progresso.md`. NÃO commite sem autorização.
```

---

## P11-D — Tornar o `packageManager.test.mjs` HERMÉTICO

> **Por que existe:** a suíte não fecha 100% verde nesta máquina, e a causa não é o código da lib. Isso bloqueou uma decisão de arquitetura no P11 (o Anel 3 ficou manual em vez de `pre-push`) e vai bloquear o `preversion` do P12-C. É a menor tarefa da campanha com o maior efeito destravante.

```
Você vai consertar UM teste não-hermético na Sarak-Lib-UI-Core. Tarefa pequena, cirúrgica e com efeito destravante grande.

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO (regras comuns, baseline, regra de DIVERGÊNCIA); (3) `specs/specs/01-gates-e-baseline.md` §3.1 e `specs/specs/02-enforcement-por-commit.md` §4 — os dois documentam este defeito e a consequência dele; (4) leia `bin/scaffold/packageManager.mjs` e `bin/scaffold/__tests__/packageManager.test.mjs` INTEIROS.

O DEFEITO, reproduzido e confirmado em 2026-07-28:
`packageManager.test.mjs > detectPackageManager (Spec 51 — L2) > "sem nenhum sinal, o default é npm"` falha com `source: 'lockfile'` onde espera `'default'`.
Causa: o teste cria um `tmpDir` sob o diretório temporário do SO e espera que `detectPackageManager` não encontre lockfile nenhum. Mas a função sobe a árvore até a raiz do volume — comportamento CORRETO, e testado de propósito em outro caso do mesmo arquivo (monorepo). Numa máquina com um `package-lock.json` solto no `$HOME` (é o caso desta), a subida acha um lockfile de verdade e a detecção acerta. **O código está certo; o teste é que assume um ambiente.**

⚠️ REGRA DURA: **o comportamento de produção NÃO muda.** Subir a árvore até achar o lockfile é a feature (é o caso monorepo da Spec 51). Se a sua correção alterar o que `detectPackageManager` faz em uso real, ela está errada.

TAREFA:
- T1: REPRODUZA primeiro. Rode o teste isolado e confirme a falha; confirme a existência do lockfile ancestral. Se NÃO falhar na sua máquina, PARE — sem reprodução não há conserto, e o relatório vira "não reproduzi", que é resposta legítima.
- T2: TORNE O TESTE HERMÉTICO. Escolha e JUSTIFIQUE a abordagem; as duas que vejo:
  (a) dar a `detectPackageManager` uma **fronteira de parada** opcional (ex.: um `stopAt`/`boundary` que a busca não ultrapassa), usada só pelo teste — a produção continua sem fronteira, subindo até a raiz;
  (b) isolar o `tmpDir` num caminho comprovadamente sem lockfile ancestral, criado e limpo pelo próprio teste.
  Prefiro (a): torna a hermeticidade uma propriedade do contrato da função, não da sorte do sistema de arquivos — mas a escolha é sua, desde que justificada e desde que a T3 passe.
- T3: PROVE A HERMETICIDADE. O teste tem de passar **com** e **sem** um lockfile ancestral. Demonstre os dois cenários: rode como está (com o lockfile do `$HOME` presente) e demonstre o caso oposto de forma verificável.
- T4: Se a sua correção tocar `packageManager.mjs`, os OUTROS 11 testes do arquivo continuam verdes — inclusive o de monorepo, que depende de subir a árvore.

FRONTEIRAS: não mexa em nenhum outro teste; não altere o comportamento de produção; não delete o `package-lock.json` do `$HOME` (não é seu, e "consertar" o ambiente em vez do teste deixa o defeito de pé para o próximo); não instale dependência; não promova o Anel 3 a `pre-push` (isso é decisão do P12-C).

GATES: suíte COMPLETA `npx vitest run` — o alvo aqui é **280 arquivos / 890 testes, 100% verde**, e essa é a prova de que a tarefa terminou. Mais `run_audit` (baseline exato), `barrel:check`, `catalog:check`, `zero-brand:check`, `guide:check`.

ENTREGUE: o RELATÓRIO DE ENTREGA (§7). A seção 4 (GATES) tem de conter a saída da suíte ANTES (1 falha) e DEPOIS (0 falhas), e a seção 2 (RASTREABILIDADE) a prova dos dois cenários da T3. Marque o checkbox de P11-D, registre em `00-progresso.md` e ATUALIZE a linha da suíte na §5 deste plano e a §3.1 de `01-gates-e-baseline.md` (o defeito deixou de existir). NÃO commite sem autorização.
```

---

## P12-C — Releases com tag: ADR-008 + ritual automatizado + `v1.0.0`

> ⚠️ **MEXE EM CÓDIGO E CRIA UMA TAG NO REPOSITÓRIO.** É a segunda maior tarefa da campanha. As decisões **D4** e **D5** já estão tomadas — você as implementa, não as rediscute.

```
Você vai implementar o ciclo de release por TAG da Sarak-Lib-UI-Core, e registrar a decisão que o motiva. Hoje o repositório tem 0 tags em 330 commits, e é isso que faz `npm install` ser no-op para o consumidor.

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO — esp. o REGISTRO DE DECISÕES DO DONO (D4 e D5) e as regras comuns; (3) `specs/adr/007-distribuicao-por-git.md` e `specs/adr/README.md` (o protocolo de substituição); (4) `specs/specs/03-versionamento-e-release.md` e `specs/specs/02-enforcement-por-commit.md` INTEIROS — os dois vão ser alterados; (5) `bin/scaffold/checkUpdate/**` (o aviso da Spec 51, que você vai evoluir); (6) `package.json`.

⚠️ PRÉ-REQUISITO: o **P11-D** tem de estar concluído (suíte 100% verde). Se ainda houver a falha ambiental, o `preversion` não pode incluir a suíte e a entrega fica pela metade. Confirme antes de começar; se não estiver, PARE e reporte.

A DESCOBERTA QUE MOTIVA TUDO: o npm resolve faixa semver contra TAGS de um repositório git — `"@sarak/lib-ui-core": "github:Lib-Sarak/Sarak-Lib-UI-Core#semver:^1.0.0"`. Com tags, `npm update` passa a resolver para a tag compatível mais recente: o mesmo comportamento de um registry, SEM registry. O ADR-007 afirmou que "automático exigiria registry + semver" — isso era meia verdade, e é o que este trabalho corrige.

ENTREGAR — cinco frentes:

L1 · ADR-008 (`specs/adr/008-releases-com-tag-e-semver-em-git.md`)
Registra: o que mudou em relação ao ADR-007 e por quê; a decisão D4 (`#semver:` RECOMENDADO, `github:` puro SUPORTADO) com a justificativa de assimetria de risco; a decisão D5 (emissão semi-automática com bloqueio, nível decidido por humano) com as DUAS evidências que a sustentam — "tag a cada commit na main" produziria centenas de tags num repositório que trabalha direto na main, e os 5 commits mais recentes são TODOS `feat:` (inclusive remoções e correções), o que inviabiliza derivar o nível da mensagem. ADR é IMUTÁVEL: preencha `substitui`/`substituido_por` ligando 007 e 008, e mude o `status` do 007 conforme o protocolo do `adr/README.md`. O 007 continua correto sobre o que se sabia em 26/07 — não o reescreva.

L2 · O RITUAL, via ganchos nativos do npm (zero dependência nova)
Ligue os três ganchos de `npm version`, respeitando a ordem em que o npm os executa:
  · `preversion` (ANTES do bump) — os gates. Falhou, não versiona. Inclua a suíte (P11-D fez isso ser possível).
  · `version` (DEPOIS do bump, ANTES do commit) — regenera `dist/` e `sarak-ui/` com a versão nova e faz `git add` deles. É isto que corrige um defeito estrutural real: hoje o `dist/` é commitado SEPARADO do bump, e é daí que nasce a defasagem. Com o gancho, o artefato regenerado entra no MESMO commit que a tag aponta.
  · `postversion` — `git push --follow-tags`.
Formato de tag: `vX.Y.Z`. Documente que o `baseCommit` do `BUILD_INFO` continua um passo atrás (auto-referência é impossível — ADR-007) e que isso PAROU DE IMPORTAR, porque a identidade passou a ser a tag.

L3 · O BLOQUEIO (decisão D5) — um anel de `pre-push`
Gatilho: push para `main` **E** o artefato publicado mudou desde a última tag **E** não há tag nova → BLOQUEIA, com mensagem acionável mandando rodar o comando de release. Reuse a assinatura de inventário de `dist/` + `sarak-ui/` que a Spec 51 já construiu (`bin/scaffold/checkUpdate/localDependency.mjs`) — não reimplemente. Commit que só mexe em `specs/` não muda artefato, não pede tag, não incomoda ninguém. Ao bloquear, SUGIRA o nível lendo os commits desde a última tag — **sugestão, nunca decisão**: quem escolhe é o humano.
⚠️ CONSEQUÊNCIA ESTRUTURAL: `specs/specs/02-enforcement-por-commit.md` passa a ter um anel que **não é por commit, é por push**. Amplie o TÍTULO e o ESCOPO da spec para cobrir os dois (é o mesmo pipeline, mesma instalação de hook, mesma filosofia de anéis — separar criaria duas specs que se referenciam o tempo todo) e acrescente `'pre-push'` a `HOOK_FILES` em `scripts/install-hooks.mjs`.

L4 · `sarak-ui check` por TAG
Troque a comparação de commit por comparação de tag: `git ls-remote --tags` → maior tag semver × versão instalada. O encanamento já existe desde a Spec 51 (`predev`, silêncio quando em dia, bloco destacado quando há novidade, SEMPRE exit 0, tolerante a offline) — isto é upgrade da lógica de comparação, não peça nova. O aviso passa a dizer `v1.0.0 → v1.1.0` em vez de dois hashes. Preserve o suporte ao modo `file:`/`link:` (lá não há tag — a assinatura de inventário continua sendo o mecanismo).

L5 · A TAG `v1.0.0` + a PROVA
  · Crie a tag `v1.0.0` no commit que carrega a versão 1.0.0.
  · ⚠️ **PROVE o `#semver:` num consumidor real** — a regra da Spec 51 vale aqui e não é negociável: *comando não executado de verdade não entra.* Instale num projeto descartável usando `#semver:^1.0.0`, taggeie uma versão nova, rode `npm update` e mostre resolver. Documentação da npm NÃO é prova. Se não conseguir provar, o `#semver:` NÃO entra no kit como instrução — vira "não validado" e você reporta.
  · Atualize `specs/specs/03-versionamento-e-release.md`: a seção "OPÇÕES EM ABERTO" morre; entram a decisão tomada, o ritual, o formato de tag e o que o consumidor escreve no `package.json` dele. Nota em `docs/migracoes.md`.
  · O kit (`sarak-ui/`) documenta `#semver:` como RECOMENDADO e `github:` puro como SUPORTADO — nunca como errado.

FRONTEIRAS: não publique em registry; não crie CI; não force nenhum consumidor a migrar (D4 é explícita); não altere nenhum auditor; não derive o nível do bump automaticamente (D5 é explícita); não instale dependência nova; não reescreva o ADR-007.

GATES: `npm run gates:full` verde (build + package:check + suíte); `run_audit` no baseline exato; `barrel:check`, `catalog:check`, `zero-brand:check`, `guide:check`; e o hook de push exercitado nos DOIS cenários (artefato mudou sem tag → bloqueia; só markdown → passa), com saída real.

ENTREGUE: o RELATÓRIO DE ENTREGA (§7). A seção 4 tem de conter: a saída dos dois cenários do hook de push, a saída do `npm version` num release de teste, e **a prova do `#semver:` no consumidor real** (comandos e saídas). Marque o checkbox de P12-C e registre em `00-progresso.md`. NÃO faça push nem publique sem autorização explícita do dono — inclusive da tag.
```

---

# FASE 4 — SPECS DE FEATURE E REGRA

> As 8 tarefas desta fase são independentes entre si e podem ser executadas em qualquer ordem interna, mas **todas dependem da Fase 2 e da Fase 3** (elas apontam para arquitetura e para o contrato de regras).

## P13 — `specs/09-temas-e-presets.md`

```
Você vai escrever a spec de TEMAS E PRESETS da Sarak-Lib-UI-Core: tema como DADO.

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO; (3) `specs/_templates/template-spec.md`; (4) `arquitetura/02` e `arquitetura/04` (prontos — aponte, não repita); (5) o material-fonte; (6) `src/core/Design/presets/**`, `src/core/Design/utils/themeAxes.ts`.

DESTINO: `specs/specs/09-temas-e-presets.md`.

CONTEÚDO:
- O CONTRATO `ThemePreset` = `{ id, name, description, design }`, onde `design` é `Record<tokenId, valor>` e a lista de `tokenId` válidos é DERIVADA do código (`getAllDesignTokens()`), nunca estática.
- PRESET × TEMA são a MESMA primitiva, diferindo só na amplitude: preset preenche a fatia de um domínio, tema preenche tudo. `getScaffold(domain?)` é o gabarito vivo dos dois.
- O CATÁLOGO SHIPPADO: confirme e reporte os números reais (temas em `presets/themes/`, presets de componente em `presets/components/`; a auditoria hoje reporta 120 itens = 18 temas + 102 presets). `SARAK_REFERENCE_THEMES` (o par recomendado claro+escuro, que difere em modo/cromo/fonte DE PROPÓSITO) e `getThemePreset(id)`.
- OS EIXOS DE COMPLETUDE — `THEME_AXES`, `findMissingThemeAxes`, `warnOnIncompleteTheme`. Explique a origem: um consumidor real montou um tema só com COR e concluiu que "fonte e cromo não mudam". A regra derivada: **parta de um tema de referência completo e customize poucos valores; não monte um tema do zero.**
- CICLO DE VIDA: criar (derivar de referência) → validar (`validateDesign` descarta fora do contrato) → aplicar (`activeThemeId` controlado × `initialTheme` semente — e a diferença de contrato de estabilidade de referência entre os dois) → persistir (`localStorage` + `crossTabSync`) → exportar (o painel exporta o conjunto COMPLETO de tokens, pronto para colar em `customThemes`).
- ANTI-DRIFT: `auditor_presets` compara todo tema/preset shippado contra o `getScaffold()` vivo. E `tokenContractParity.test.ts` + `shippedThemesConsoleClean.test.ts` — o gate nascido de uma auditoria que achou 117 violações em 21 tokens (não a amostra de 9 que aparecia no console). Registre a lição: amostra de console NÃO é auditoria.
- `generate_themes.ts` consome `getScaffold()` ao vivo, não um template hardcoded.
- BACKLOG NOMEADO (registre como backlog, não como plano): expansão/hospedagem de mídias de atmosfera (`plan/12`) e o enriquecimento de presets visuais que a spec 06 antiga propunha e que só foi feito em parte.

MATERIAL-FONTE: `specs/specs/06-presets-engine.md` (REESCREVER — ⚠️ o status "🔴 A Implementar" é FALSO: `ButtonPresetPreview`, `InputPresetPreview` e `PresetsCatalog` existem; confirme e corrija), `plan/44-temas-json-e-persistencia.md`, `plan/40.4-reconciliacao-contrato-tokens.md`, `plan/12-expansao-midias-atmosfera.md` (backlog), `specs/arquitetura/09` §2.4, `docs/temas-cromo-e-multidispositivo.md` §1.

FRONTEIRAS: dicionário/paridade é `arquitetura/04`; motor é `arquitetura/02`; UI do painel é P18. Não transcreva a lista de temas nem de tokens.

GATES: nenhum código tocado — rode `run_audit` (para os números de `auditor_presets`) e reporte.

ENTREGUE: o RELATÓRIO DE ENTREGA (§7). Critério de aceite: um tema novo criado seguindo a spec passa `auditor_presets` e `validateDesign` sem um único warn — descreva o passo a passo que garante isso. Marque o checkbox de P13 e registre em `00-progresso.md`. NÃO commite sem autorização.
```

---

## P14 — `specs/10-seguranca-e-acessibilidade.md`

```
Você vai escrever a spec de SEGURANÇA, FRONTEIRAS E ACESSIBILIDADE da Sarak-Lib-UI-Core: o que a lib garante × o que o host DEVE prover.

⚠️ ATENÇÃO ESPECIAL: a spec antiga (`specs/specs/12`) foi escrita quando a lib EXECUTAVA um manifesto JSON autorado por usuário/IA. Esse motor NÃO EXISTE MAIS. Metade das garantias antigas (Safe Evaluator, `renderIf`, interpolação escapada, limites anti-DoS de `renderFor`) morreu com ele. A superfície hostil de hoje é OUTRA: **o JSON de TEMA** (vindo de `localStorage`, de `customThemes` ou de um arquivo exportado) e o **conteúdo rico** renderizado pelos componentes de mídia.

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO; (3) `specs/_templates/template-spec.md`; (4) ADR-002/003 e `arquitetura/01`/`02` (prontos); (5) o material-fonte; (6) `src/core/Security/sanitizeHtml.ts`, `src/core/Provider/utils/validation.ts`, `src/core/Provider/scope.ts`, `src/components/atomic/Modals/hooks/useFocusTrap.ts`.

DESTINO: `specs/specs/10-seguranca-e-acessibilidade.md`.

CONTEÚDO:
- O QUE A LIB GARANTE:
  · **Tema não-confiável tratado como dado hostil** — `validateDesign` com domínio de chaves fechado, valor tipado por token, e o `CSS_BREAKOUT_PATTERN` (`[<>{};]`) que impede escapar de uma declaração CSS ou de uma tag `<style>`. `COLOR_PATTERN` rejeita `url()` (vetor clássico de SSRF/injeção em valor de cor). Chave desconhecida = descartada com warn. **Esta é a garantia central hoje** — dê a ela o destaque que a spec antiga dava ao Safe Evaluator.
  · **Sanitização única de conteúdo rico** — `sanitizeHtml` (DOMPurify) como CANAL ÚNICO; `dangerouslySetInnerHTML` proibido com conteúdo externo fora dele; a única exceção documentada (o `<style>` de CSS responsivo gerado pela própria engine no `DesignScope`). Componentes afetados: `SarakRichText`, `SarakMarkdownRenderer`.
  · **Isolamento** — modo embarcado confina preflight e utilities em `.sarak-scope`; portais de overlay recebem a classe de escopo; `@keyframes`/`@font-face`/`@property` permanecem globais DE PROPÓSITO (são registros sem seletor e não alteram elemento do host). Gates: `EmbeddedMode.test.tsx`, `scopeCss.test.ts`, `EmbeddedNoLeak.spec.tsx` (este exige `npm run build` antes).
  · **A11y** — foco/teclado (nenhum átomo prende foco, exceto modal aberto por design — `useFocusTrap`), navegação completa por `Tab`/`Shift+Tab`/`Enter`/`Espaço`/`ESC`, ARIA automático nos não-nativos (`aria-expanded`/`aria-current`/`role`), contraste WCAG AA nas cores de status, e o token de anel de foco.
- O QUE O HOST DEVE PROVER (a fronteira, explicitamente):
  · **Autenticação e sessão** — a lib NÃO autentica ninguém. `SarakAuthScreen` RENDERIZA a tela de acesso (componente React autocontido: campos e alternância de modo em estado interno, controláveis por prop) e entrega os dados ao host; provider, token, storage e refresh são 100% decisão do consumidor. ⚠️ Registre o gate anti-acoplamento e a mudança real: `src/` não importa SDK de auth nem lê token de storage — dois hooks legados que liam `localStorage` num esquema de chaves fixo foram REMOVIDOS, o que é um breaking change silencioso para quem dependia da injeção automática de `Authorization`.
  · **Rede** — a lib nunca chama a rede por conta própria e nunca embute segredo.
  · **Roteamento** — a lib reage à rota, não controla a URL.
  · **Origem e CSP/CORS** — validar de onde vem um JSON de tema é do host; a validação da lib é defesa em profundidade, não controle de origem.
  · **Persistência** — `onThemeChange` é a porta; a lib não sincroniza com servidor nenhum.

MATERIAL-FONTE: `specs/specs/12-modelo-de-seguranca-e-acessibilidade.md` (REESCREVER — descarte tudo que é do motor removido), `specs/specs/08-consumo-externo-e-integracao.md` §6/§6.1/§6.2/§6.2-b (fatiar; ⚠️ a receita declarativa de login em JSON está MORTA — descarte, mas preserve o PRINCÍPIO), `plan/20-fronteira-de-autenticacao.md`, `plan/24-modo-embarcado-adocao-incremental.md`, `plan/44` (validação no load).

FRONTEIRAS: NENHUMA cláusula pode falar de manifesto, `renderIf`, Safe Evaluator, `renderFor`, Dispatcher ou pipes — tudo removido. Se o material-fonte trouxer, DESCARTE e registre no relatório. Não invente garantia que o código não dá.

GATES: nenhum código tocado — `catalog:check`/`guide:check` verdes.

ENTREGUE: o RELATÓRIO DE ENTREGA (§7). Critério de aceite: cada garantia aponta para o arquivo que a implementa, e a seção 3 do relatório lista tudo que foi descartado por ser do #2. Marque o checkbox de P14 e registre em `00-progresso.md`. NÃO commite sem autorização.
```

---

## P15 — `specs/04-shell-e-discovery.md`

```
Você vai escrever a spec do SHELL E DISCOVERY da Sarak-Lib-UI-Core — o modo de consumo #1 (módulos-plugin), onde a lib é o host.

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO; (3) `specs/_templates/template-spec.md`; (4) ADR-005 e `arquitetura/01` (prontos); (5) `src/core/Shell/**` e `src/core/Discovery/**` INTEIROS.

DESTINO: `specs/specs/04-shell-e-discovery.md`.

CONTEÚDO:
- O CONTRATO DE REGISTRO: `registerLocalComponent(id, Component)` + `registerSarakModule({id, label, icon, category?, priority?, description?})`, a resolução ESTRITA (id do módulo === chave do componente), o `subscribeToRegistry` (discovery passiva), e a VALIDAÇÃO com warn (falta `label`/`icon`/componente) × o erro crítico (falta `id`).
- SOBERANIA DE INSTÂNCIA: o registro vive em `window.__SARAK_REGISTRY_*` de propósito — duas cópias da lib (link local + `node_modules`) compartilham o mesmo registro. Explique o problema que isso resolve e o risco que aceita.
- O SHELL: `SarakShell` sob `SarakUIProvider`; navegação por `design.navigationStyle` (sidebar / topbar / dock / glass — CONFIRME as variantes reais no código); `SidebarNav`/`TopbarNav`/`DockNav`/`ShellContent`; os widgets (`ShellUserWidget`, `ShellSearchWidget`, `ShellThemeToggle`, `ShellLanguageSelector`); o ErrorBoundary por módulo (falha de um módulo não derruba a casca); `useShellDiagnostics`/`useDimensionGuard`/`useVisualSafetyGate` (o que cada guarda protege).
- O CROMO DO SHELL consome tokens do Design Engine (`--sarak-topbar-*`/`--sarak-sidebar-*`) — trocar o tema muda a casca. Aponte para P16 (o cromo SEM host) e deixe a diferença cristalina: `SarakShell` é HOST (renderiza o módulo ativo do Discovery); `SarakAppChrome` é APRESENTACIONAL (renderiza `children`).
- `DynamicRenderer`, `useModuleDiscovery`, `useSarakRouter`, `useEndpointResolver` — o que cada um faz e quando o consumidor toca neles.
- ⚠️ DÍVIDA A REGISTRAR (não corrigir): `src/index.ts` executa `registerLocalComponent('mx-customization', CustomizationPanel)` e `('personalization', ...)` como EFEITO COLATERAL DE IMPORT. São ids legados do Discovery. Documente que existem, o que fazem, e registre a pergunta "mantém ou remove?" para o dono.

⚠️ FATO NOVO QUE MUDA O ENQUADRAMENTO (decisão D6, 2026-07-28): **o `Sarak-MyService` é OBSOLETO.** Ele era o consumidor real que justificou o modo Shell-host (#1) na regra de corte do ADR-001 ("só permanece o que tem consumidor real provado"). Registre isto como FATO na spec, com honestidade: o modo #1 existe, funciona, está coberto por teste — e hoje **não tem consumidor real conhecido**. **NÃO decida nada** sobre o futuro dele (manter × depreciar × remover é decisão do dono, e exige uma varredura de consumidores que esta spec não faz). Escrever a spec como se o MyService ainda o sustentasse seria repetir exatamente o erro que esta campanha existe para corrigir.

MATERIAL-FONTE: `specs/specs/04-estrutura-shell-discovery.md` (REESCREVER), `plan/43-design-system-primeiro.md` §3.1 (a API pública do modelo), `plan/18-shell-consome-design-engine.md` (os tokens de cromo — ⚠️ a parte que fala do `ShellRouterNode`/shell do MANIFESTO está morta; só a parte de tokens sobrevive), `README.md`.

FRONTEIRAS: nada de cromo apresentacional (P16); nada de manifesto/`ShellRouterNode`; nada de responsividade em detalhe (P17, aponte).

GATES: nenhum código tocado — `catalog:check`/`guide:check` verdes.

ENTREGUE: o RELATÓRIO DE ENTREGA (§7). Critério de aceite: o exemplo mínimo de registro roda como escrito (confira contra o `README.md` e o starter do `init`). Marque o checkbox de P15 e registre em `00-progresso.md`. NÃO commite sem autorização.
```

---

## P16 — `specs/05-cromo-e-slots.md`

```
Você vai escrever a spec do CROMO APRESENTACIONAL da Sarak-Lib-UI-Core — `SarakAppChrome` e seus slots de extensão. É a casca do modo de consumo #3 (ui-kit + central), onde a lib NÃO é host.

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO; (3) `specs/_templates/template-spec.md`; (4) ADR-005 e `arquitetura/01` (prontos); (5) `src/components/Layout/SarakAppChrome.tsx`, `SarakAppChromeMobile.tsx`, `chrome/ChromeFrame.tsx`, `chrome/ChromeSlots.tsx`, `chrome/navItem.ts`, `src/components/atomic/Navigation/SarakShellNav.tsx`.

DESTINO: `specs/specs/05-cromo-e-slots.md`.

CONTEÚDO:
- POR QUE ELE EXISTE: os tokens de cromo (`--sarak-topbar-*`/`--sarak-sidebar-*`) ficavam SEM CONSUMIDOR num consumidor de apps separados, porque o único consumidor era o `SarakShell`, que é HOST. Resultado prático: "topbar/sidebar não aparecem". `SarakAppChrome` fecha isso — 100% apresentacional, cada app renderiza o seu, sem registro e sem Discovery.
- O CONTRATO: `children` (a tela), `brand`, `navItems` (`SarakNavItem = {id,label,icon?,href,active?}` — ícone first-class, precedência sobre `nav`), `nav`+`activeRoute` (modelo declarativo legado), `onNavigate` (o host decide COMO navegar — redirect de página, router local, o que for), `navigationStyle: 'sidebar'|'topbar'|'auto'` (o `auto` segue `design.navigationStyle` — trocar o tema troca a orientação do cromo).
- OS 8 SLOTS (`logo`, `topbarStart`, `topbarEnd`, `sidebarHeader`, `sidebarFooter`, `banner`, `footer`, `decoration`), com a REGRA DE GEOMETRIA (banner = primeira faixa full-width, footer = última) e a REGRA DE DEGRADAÇÃO por modo (sem barra superior, `topbarStart/End` migram para topo/rodapé da sidebar; no celular as regiões de sidebar migram para o drawer — nada some). `topbarEnd` é alias de `topbarActions` e vence quando ambos vêm. `decoration` é ornamento: `aria-hidden` + sem captura de foco/toque.
- PRINCÍPIO: **a lib dá a REGIÃO, o consumidor dá o CONTEÚDO** (slot é `ReactNode`; a lib não presume o que vai dentro). Slots são ADITIVOS e OPCIONAIS — ausente = região não renderiza.
- OS DOIS NÍVEIS de "adicionar imagem/animação": (a) fundo/atmosfera GLOBAL por tema (Design Engine) × (b) conteúdo por REGIÃO via slot. Eles COMPLEMENTAM, não competem.
- ⚠️ A ALTURA PRÓPRIA (`minHeight: 100dvh`) e o BUG DE BROWSER real que a originou: o cromo é a casca do app e não pode depender de o host setar `html/body/#root { height:100% }`; sem altura definida o `h-full` colapsa, a nav é recortada por `overflow` e "a sidebar some" enquanto o conteúdo ainda aparece. Documente — é a classe de bug que volta.
- ZERO HARDCODE: toda cor/medida do cromo vem de token com fallback.

MATERIAL-FONTE: `plan/40.1-correcoes-importacao.md` §L2, `plan/40.2-correcoes-importacao-r2.md` §L1/§L3, `plan/48-slots-extensao-layout-chrome.md`, `plan/18` (tokens de cromo), `docs/temas-cromo-e-multidispositivo.md` §2, `docs/extensibilidade-de-layout.md`.

FRONTEIRAS: o reflow por dispositivo (tablet→topbar compacta, celular→hambúrguer+drawer) pertence a P17 — mencione e APONTE, não detalhe; o Shell host é P15; não proponha slot novo.

GATES: nenhum código tocado — rode `catalog:check` e confirme que os 8 slots aparecem no catálogo gerado (é a prova de que o contrato está publicado).

ENTREGUE: o RELATÓRIO DE ENTREGA (§7). Marque o checkbox de P16 e registre em `00-progresso.md`. NÃO commite sem autorização.
```

---

## P17 — `specs/07-responsividade-e-multidispositivo.md`

```
Você vai escrever a spec de RESPONSIVIDADE E MULTIDISPOSITIVO da Sarak-Lib-UI-Core — o contrato zero-config.

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO; (3) `specs/_templates/template-spec.md`; (4) `specs/specs/05-cromo-e-slots.md` (P16, pronto); (5) `src/core/Provider/DeviceProvider.tsx`, `src/core/Design/breakpoints.ts`, `src/core/Design/resolveResponsiveValue.ts`, `src/components/Layout/SarakHidden.tsx`, e os componentes densos que colapsam.

DESTINO: `specs/specs/07-responsividade-e-multidispositivo.md`.

CONTEÚDO:
- O PRINCÍPIO: **layout multidispositivo é POR PADRÃO (zero-config)**. O consumidor NÃO escreve CSS nem media query para as telas adaptarem; onde quiser refinar, passa `ResponsiveValue<T>` — que nunca é obrigatório. Isto é a regra "zero-gambiarra" aplicada: se o consumidor precisou escrever CSS para consertar um componente da lib, é bug DA LIB.
- BREAKPOINTS: celular `< 768px`, tablet `768–1023px`, desktop `≥ 1024px` — confirme os valores em `breakpoints.ts` e registre que são tokens do tema (`breakpointTablet`/`breakpointDesktop`), não número chumbado no consumidor.
- `useSarakDevice` — ⚠️ e a LIÇÃO ARQUITETURAL que ele carrega, que é o item mais valioso desta spec: a detecção é **SELF-CONTAINED no hook** (cada consumidor lê o viewport direto), e o contexto transporta APENAS o override. A versão anterior centralizava o ESTADO detectado num contexto e falhava de duas formas: (1) estado inicial `'desktop'` corrigido só por efeito pós-montagem = FLASH de desktop antes de virar hambúrguer; (2) se o build fragmentasse o módulo do contexto entre chunks, Provider e consumidor liam identidades diferentes e o consumidor ficava preso em `'desktop'`. Registre isso como padrão a não repetir.
- `DeviceProvider overrideDevice` — para o Gêmeo Digital/preview e testes; desliga a detecção real.
- `ResponsiveValue<T>` + `resolveResponsiveValue`/`isResponsiveValue`, e o suporte a valor responsivo `{desk,tab,mob}` nos tokens físicos (validado eixo a eixo, com clamp, por `validateDesign`).
- `SarakHidden on={[...]}` — ocultar por dispositivo sem CSS.
- A TABELA DO CONTRATO — o que adapta sozinho, por dispositivo: `SarakAppChrome` (celular = barra + hambúrguer + drawer acessível com `aria-expanded`/foco/ESC; tablet = topbar compacta; desktop = sidebar OU topbar por `navigationStyle`), `SarakGrid` (1 coluna no celular), `SarakFlex` (quebra em linhas), `SarakSplitPane` (empilha), `SarakDataTable` (colapsa para `SarakDataCards`, com opt-out `responsive={false}`), `SarakTable` (colapsa para `SarakTableCards`), slots do cromo. CONFIRME cada linha no código antes de escrever.
- ⚠️ O QUE **NÃO** ADAPTA — registre EXPLICITAMENTE (silêncio é proibido): `SarakManagementGrid` e a primitiva headless `SarakDataGrid` não têm colapso mobile próprio. Diga por que ficou de fora (nenhum consumidor real os exigiu no mobile) e que entram em spec dedicada quando exigidos.
- BACKLOG: Container Queries reais no Gêmeo Digital (o "Tier B" nunca feito de `plan/10`).
- ⚠️ ARMADILHA DE VALIDAÇÃO a registrar: a reprovação do cromo mobile numa rodada foi **BUILD STALE**, não bug — o código estava certo, a cópia instalada no consumidor é que era velha (a `version` imóvel fez o pnpm não recopiar o `file:`). Regra derivada: **teste que usa `overrideDevice` NÃO exercita a detecção real**; valide o caminho real e confirme o build antes de acusar bug.

MATERIAL-FONTE: `plan/40.3-multidispositivo-por-padrao.md` (incl. a correção P21.3-C), `specs/specs/10-taxonomia-estendida-e-responsividade.md` §3 (⚠️ a diretiva `responsive` do manifesto está MORTA — descarte; o que vive é `ResponsiveValue` + `useSarakDevice`), `plan/10-responsividade-gemeo-digital.md` (backlog Tier B), `docs/temas-cromo-e-multidispositivo.md` §3/§4.

FRONTEIRAS: nada de diretiva JSON; não prometa adaptação que o código não faz — a tabela tem de ser verificada componente a componente.

GATES: nenhum código tocado — `catalog:check`/`guide:check` verdes.

ENTREGUE: o RELATÓRIO DE ENTREGA (§7). Critério de aceite: cada linha da tabela de contrato tem teste correspondente identificado, e a lista do que NÃO adapta é explícita. Marque o checkbox de P17 e registre em `00-progresso.md`. NÃO commite sem autorização.
```

---

## P18 — `specs/06-painel-de-customizacao-e-preview.md`

```
Você vai escrever a spec do PAINEL DE CUSTOMIZAÇÃO e do AMBIENTE DE PREVIEW da Sarak-Lib-UI-Core — a camada `features/` do Design Engine.

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO; (3) `specs/_templates/template-spec.md`; (4) `arquitetura/02` e `specs/09-temas-e-presets.md` (prontos); (5) `src/features/DesignEngine/**` INTEIRO.

DESTINO: `specs/specs/06-painel-de-customizacao-e-preview.md`.

CONTEÚDO:
- O QUE É: `CustomizationPanel` (a peça pública, exportada no barril) e o `MasterControlPanel`/`ThemeCustomizationTab` por dentro. É a ÚNICA feature em `src/features/` — explique por que ela vive lá (tem estado, lógica e orquestração; não é átomo).
- A FOLKSONOMIA DINÂMICA — o ponto mais interessante da arquitetura: o painel NÃO tem categorias hardcoded. Os pilares vêm de `config/design-pillars.json`, a semântica vem das tags das partições do catálogo, e `buildDynamicGroups`/`dynamic-categories.ts` cruza isso com o `MASTER_DESIGN_MAP` para DESENHAR abas, seções e controles sozinho. Ninguém monta formulário à mão: o Schema injeta o DADO, o Catálogo injeta a SEMÂNTICA, o algoritmo cruza, a UI só itera.
- CONTROLES POLIMÓRFICOS: `TokenControl`/`DynamicTokenControl` escolhem o input pelo `token.type` (`ColorControl`, sliders, selects, `MediaUploaderControl`…).
- DRAFT × PERSISTIDO: alteração entra no rascunho e reflete INSTANTANEAMENTE no preview escopado; a gravação é explícita. Aponte para o drafting em `arquitetura/02`.
- EXPORTAR JSON (`Main/utils/exportTheme.ts`): exporta o conjunto COMPLETO de tokens, pronto para colar em `customThemes`. ⚠️ Registre que isto SUBSTITUIU o antigo "salvar tema no banco" (ADR-003) — nenhuma menção a persistência server-side pode sobreviver nesta spec.
- O GÊMEO DIGITAL / PREVIEW (`Canvas/`): `PreviewCanvas` + `DesignScope` (barreira de CSS, injeta as variáveis do rascunho só naquela subárvore — nada vaza para o host), simulação de viewport por `previewDevice` (Desktop/Tablet/Mobile, via `DeviceProvider overrideDevice` + escala/constraint de largura), e a modularidade dos mocks (`DashboardMock` montado de sub-peças, para simular a paridade atômica de verdade). Os catálogos visuais (`AtmosphereCatalog`, `CardsCatalog`, `PresetsCatalog`, `TypographyCatalog`, `ButtonsCatalog`, `InputsCatalog`).
- DOGFOODING: o próprio painel obedece à regra de composição atômica (usa `SarakButton`/`SarakInput`, não HTML cru).
- ⚠️ Registre a dívida conhecida: o painel tem um dos 4 erros de `tsc` de produção (`ThemeCustomizationTab.tsx:86` — união de tipo de toast). Documente, não corrija.
- ALLOWLIST DO ZERO-MARCA: os painéis internos do Design Engine são a ferramenta de autoria DA LIB e estão fora da varredura de marca — explique por que isso é legítimo e onde a allowlist vive.

MATERIAL-FONTE: `specs/specs/01-painel-customizacao-temas.md` (REESCREVER — ⚠️ a "Regra 0" fala de `type` nativo do Manifest Engine e do gate `RegistryParity`: MORTA, descarte), `specs/specs/02-ambiente-sandboxing-preview.md` (FUNDIR como seção), `specs/arquitetura/04-paridade-cinco-camadas.md` §3 (folksonomia), `plan/44` (export JSON), `plan/14-visibilidade-aba-design-engine.md` (⚠️ APOSENTADA — o mecanismo proposto é do shell legado; registre a decisão de não fazer).

FRONTEIRAS: motor é `arquitetura/02`; temas são P13; não corrija o erro de `tsc`.

GATES: nenhum código tocado — `catalog:check`/`guide:check` verdes.

ENTREGUE: o RELATÓRIO DE ENTREGA (§7). Critério de aceite: NENHUMA menção a "salvar tema no banco"; o caminho export→`customThemes` está descrito ponta a ponta. Marque o checkbox de P18 e registre em `00-progresso.md`. NÃO commite sem autorização.
```

---

## P19 — `specs/08-identidade-do-host-e-zero-marca.md`

```
Você vai escrever a spec de IDENTIDADE DO HOST E ZERO-MARCA da Sarak-Lib-UI-Core.

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO; (3) `specs/_templates/template-spec.md`; (4) ADR-006 (pronto — a DECISÃO está lá; aqui é o COMO); (5) `src/core/Provider/hooks/useBrandingManager.ts`, `useSarakUIEffects.ts`, `src/core/Provider/types.ts` (`SarakBrandingState`), `scripts/check-zero-brand.mjs`, `docs/identidade-do-host.md`.

DESTINO: `specs/specs/08-identidade-do-host-e-zero-marca.md`.

CONTEÚDO:
- A REGRA: identidade da página é SEMPRE do importador. Zero-config = a lib NÃO escreve `document.title`, NÃO troca favicon, NÃO exibe marca. É **opt-in, não opt-out**.
- AS DUAS PORTAS e a precedência: `options.branding.initial.tabName` > `config.systemName`. Do mais específico (nome da aba) para o mais genérico (nome do sistema, que também alimenta o rótulo de marca no cromo). Sem nenhuma, a lib não escreve — ponto.
- FONTE ÚNICA: um só efeito decide `document.title`. ⚠️ Registre por que isso importa: antes havia DOIS setters disputando, e o resultado dependia da ordem de execução dos effects. Padrão a não repetir.
- Favicon por `logoBase64` (data URI ou URL); sem ele, o `<link rel="icon">` do host fica intocado.
- COMPORTAMENTO POR MODO: no embarcado a lib **NUNCA** toca em título/favicon — nem com valor fornecido. A ilha não é dona da página.
- `SarakBrandingState`: quais campos são IDENTIDADE (`companyName`, `tabName`, `logoBase64` — nascem AUSENTES) e qual é só RÓTULO DE UI (`loginName`, com default genérico). A distinção é o coração da regra.
- O GATE `zero-brand:check` (`scripts/check-zero-brand.mjs`): varre por AST (só `StringLiteral`/`JsxText` — não comentário, não identificador), com allowlist COMENTADA dos painéis internos do Design Engine. Explique como adicionar à allowlist e por que a barra é alta.
- OS SINKS HISTÓRICOS — a lição: a primeira rodada fechou a FONTE (defaults de branding) e a IDENTIDADE DA PÁGINA, mas os SINKS hardcoded ficaram, e o vazamento apenas MUDOU DE STRING ("Sarak OS" → "Sarak Lib"). Uma segunda rodada achou 5 sinks, sendo 2 além dos reportados (incluindo a FONTE do `brand.name` no Shell). Regra derivada: **fechar a fonte não fecha o sink; grep por UMA string não é auditoria de marca.** Liste os componentes que foram neutralizados e a regra de fallback (marca do consumidor → rótulo genérico de função → NUNCA `'Sarak …'`, e nunca heading vazio).
- BACKLOG: gestão de brand mais ampla (upload de logo, brandbook, cores de marca) — `plan/13`, nunca executada. Registre como backlog, com o cuidado de não violar a regra zero-marca.

MATERIAL-FONTE: `plan/47-soberania-identidade-host.md`, `plan/49-erradicar-marca-lib-componentes.md`, `plan/13-revisao-e-upload-de-brand.md` (backlog), `docs/identidade-do-host.md`, `docs/migracoes.md` (as duas entradas).

FRONTEIRAS: não altere código nem a allowlist; a decisão está no ADR-006, não a rediscuta.

GATES: nenhum código tocado — rode `zero-brand:check` e reporte os números (363 arquivos, 0 violações no baseline).

ENTREGUE: o RELATÓRIO DE ENTREGA (§7). Marque o checkbox de P19 e registre em `00-progresso.md`. NÃO commite sem autorização.
```

---

## P20-A — Remover `Template-Ts/` do repositório

> ⚠️ **MEXE NO REPOSITÓRIO (deleção).** É pré-requisito do P20: enquanto o `Template-Ts/` estiver aqui, qualquer número de suíte que a spec de testes escrever é falso.

```
Você vai remover do repositório da Sarak-Lib-UI-Core um subprojeto que não pertence a ele. Decisão D7, já tomada — execute, não rediscuta.

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO (regras comuns, baseline, decisão D7); (3) `specs/specs/01-gates-e-baseline.md` §3.2 — o achado completo, com a saída real do clone limpo; (4) estude `sarak:code-limpeza-projeto` (o fluxo de remoção com HITL e grep antes de deletar).

O QUE É (confirme antes de apagar): `Template-Ts/` é `template-chat-ts` — um template de BACKEND de chat (express, @supabase/supabase-js, pg, zod, cors, dotenv). **85 arquivos versionados**: 48 em `src/`, **27 em `dist/`** (saída compilada, commitada), 6 testes, `tsconfig.json`, `package.json`, `package-lock.json`, `.env.example`. Entrou num commit só: `c43293e chore: setup Template-Ts and agents structure`.

POR QUE SAI — o princípio do dono: *"esta é uma biblioteca genérica e não deve depender de nenhum módulo."* E os fatos: nada na lib o referencia; ele já é PROIBIDO no tarball (`scripts/check-package-contents.mjs:14`); o `tsc` não o compila (`tsconfig.json` tem `"include": ["src"]`); nenhum dos 8 auditores o vê. O único gate que o enxerga é a **suíte** — e lá ele passa por causa de um `Template-Ts/node_modules/` **local e não versionado**. Num clone limpo, 3 arquivos falham. É verde que depende de estado que não viaja no git.

TAREFA:
- T1: CONFIRMAR o isolamento ANTES de apagar. Grep por `Template-Ts` em todo o repositório, fora do próprio diretório. O esperado é achar SÓ: `scripts/check-package-contents.mjs` (lista de proibidos), `specs/specs/01-gates-e-baseline.md` §3.2 e `specs/arquitetura/05-build-e-distribuicao.md` §3. **Qualquer outra referência é DIVERGÊNCIA — pare e reporte.**
- T2: REMOVER o diretório inteiro (os 85 arquivos versionados; o `node_modules/` local não é rastreado e some junto). O histórico permanece no git — registre o commit de referência (`c43293e`) para quem quiser recuperar.
- T3: DECIDIR o que fazer com a entrada `'Template-Ts/'` na lista de proibidos de `check-package-contents.mjs`. Argumente e escolha: mantê-la é uma trava barata contra o diretório voltar; removê-la é coerente com "não existe mais". **Recomendo MANTER**, com o motivo escrito ao lado — o gate já tem o hábito de recusar exclusão obsoleta, e uma linha comentada custa menos que o diretório reaparecer sem ninguém notar.
- T4: ATUALIZAR `specs/specs/01-gates-e-baseline.md` §3.2 — de achado aberto para **RESOLVIDO**, com a data, o número da suíte ANTES e DEPOIS, e a lição preservada (*a suíte varria um projeto alheio e ninguém via, porque o único gate que o alcançava era o que ele enganava*). Mesmo tratamento que a §3.1 recebeu.
- T5: CONFERIR se `vitest.config.ts` precisa de ajuste. **Provavelmente não** — sumindo o diretório, o `include` default para de achá-lo. **NÃO acrescente exclusão** de um caminho que não existe mais: seria exatamente a regra 2 da §6 (*nunca excluir pasta do escopo de um auditor*) aplicada ao contrário.

FRONTEIRAS: não mexa em nenhum outro diretório; não altere `vitest.config.ts` sem que a T5 prove necessidade; não `git rm` (só remoção de arquivo — o commit é decisão do dono); não corrija nenhum item do baseline de auditoria; não instale nem desinstale dependência.

GATES: suíte COMPLETA `npx vitest run` — o número tem de CAIR (saem os 6 arquivos de teste do Template-Ts) e continuar **100% verde**; `run_audit` no baseline exato; `barrel:check`, `catalog:check`, `zero-brand:check`, `guide:check`; `npm run build` e `package:check` (o tarball não pode mudar — o diretório já era proibido nele).

ENTREGUE: o RELATÓRIO DE ENTREGA (§7), com o grep da T1 (a prova que autoriza a deleção), a contagem da suíte antes e depois, e a decisão da T3 justificada. Marque o checkbox de P20-A, registre em `00-progresso.md` e ATUALIZE a linha da suíte na §5 deste plano. NÃO commite sem autorização.
```

---

## P20 — `specs/11-testes-e-cobertura.md`

```
Você vai escrever a spec de TESTES E COBERTURA da Sarak-Lib-UI-Core.

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO; (3) `specs/_templates/template-spec.md`; (4) `specs/specs/01-gates-e-baseline.md` (P10, pronto); (5) `vitest.config.ts`, `vitest.setup.ts`, `playwright.config.ts`, `playwright-ct.config.ts`, `auditor_coverage.mjs`; (6) RODE `npx vitest run` e use os SEUS números.

DESTINO: `specs/specs/11-testes-e-cobertura.md`.

CONTEÚDO:
- A REGRA DE COBERTURA 1:1 e sua forma EXATA: `auditor_coverage.mjs` exige `__tests__/<nome>.test.tsx` ao lado de todo `.tsx` (e `.test.ts`/`.test.tsx` para todo `.ts` que comece com `use`) em `components/`, `features/` e `core/`. Ignora `index*`, `Mocks/` e `__tests__/`. Registre a consequência prática: **arquivo novo nasce com teste ou o gate reprova** — e que isso força extração quando um arquivo cresce.
- ESTRATÉGIA: teste na BORDA PÚBLICA (comportamento, via `@testing-library/react`; proibido testar método privado); MOCK RESTRITO (só I/O de rede, dependência pesada de terceiro irrelevante ao render, ou o contexto global em teste de átomo); prioridade ao motor stateful.
- OS GATES-TESTE ESPECIAIS (teste que é gate de arquitetura, não de comportamento) — liste e explique cada um: `BarrelParity.test.ts` e `ZeroBrand.test.ts` (reusam os scripts de check), `tokenContractParity.test.ts`, `shippedThemesConsoleClean.test.ts`, `EmbeddedMode.test.tsx`, `scopeCss.test.ts`, `AuthCouplingGate.test.ts` (confirme quais ainda existem antes de listar).
- A CONFIGURAÇÃO E O PORQUÊ DELA: `environment: 'jsdom'`, `globals: true`, `pool: 'forks'` e `execArgv: ['--max-old-space-size=8192']`. ⚠️ Registre a história: a suíte completa caía por OOM; a causa-raiz foi um LOOP INFINITO DE REFETCH (dependência de objeto inline num hook de dados), e o agravante foi o Vitest 4 ter removido `poolOptions` e IGNORÁ-LO EM SILÊNCIO — a configuração "correta" não estava fazendo nada. Duas lições permanentes.
- O ESCOPO EXCLUÍDO do vitest: `**/__e2e__/**` e `**/*.spec.ts(x)` — porque são Playwright, não Vitest.
- ⚠️ A REGRA DURA: "suítes verdes" exige `npx vitest run` INTEIRO. Rodar pasta a dedo esconde snapshot de terceiro que quebrou.
- ⚠️ **TESTE NÃO-HERMÉTICO — registre como defeito de teste, com destaque.** `bin/scaffold/__tests__/packageManager.test.mjs > "sem nenhum sinal, o default é npm"` depende do ambiente: ele cria um `tmpDir` sob o diretório temporário do SO e espera que `detectPackageManager` não ache lockfile nenhum subindo a árvore — mas a subida vai até a raiz do volume (comportamento CORRETO e testado de propósito em outro caso), então um `package-lock.json` solto no `$HOME` faz o teste falhar por motivo alheio ao repositório. Confirmado nesta máquina em 2026-07-28. **Consequência real, não teórica:** foi essa fragilidade que impediu o Anel 3 de virar `pre-push` bloqueante em P11. Documente o defeito, a condição que o dispara, e o que o tornaria hermético (fixar uma fronteira de parada da subida no teste, ou isolar o `tmpDir` fora de qualquer ancestral com lockfile). **NÃO conserte aqui** — é código de teste; registre como dívida com dono e caminho.
- E2E — o estado HONESTO: Playwright CT está instalado (`npm run test-ct`, `playwright/index.tsx`) e existem specs em `src/core/Provider/__e2e__/` e `src/features/DesignEngine/__e2e__/`; algumas EXIGEM `npm run build` antes. Mas **nada disso roda em pipeline automático**. Registre como LACUNA, não como plano concluído — a spec antiga listava jornadas E2E como "próximo passo" desde sempre.
- Números do baseline: 280 arquivos / 890 testes, 100% verde, ~136s. E a meta de cobertura declarada (~80%) com a ferramenta que a mede (`@vitest/coverage-v8`) — confirme se ela é de fato medida hoje ou se é só uma intenção; diga a verdade.

MATERIAL-FONTE: `specs/specs/05-cobertura-de-testes.md` (REESCREVER — ⚠️ o "Panorama Atual" lista componentes do Design Agent e mocks que podem não existir mais; VERIFIQUE cada um antes de trazer), `vitest.config.ts`, `plan/00-progresso.md` (a entrada do OOM/vitest 4), `auditor_coverage.mjs`.

FRONTEIRAS: não escreva teste novo; não mude configuração de teste; não prometa E2E — descreva o que existe.

GATES: rode a suíte COMPLETA e reporte os números; demais gates no baseline.

ENTREGUE: o RELATÓRIO DE ENTREGA (§7). Critério de aceite: o número declarado é o da SUA execução, e a lacuna de E2E aparece como lacuna. Marque o checkbox de P20 e registre em `00-progresso.md`. NÃO commite sem autorização.
```

---

# FASE 4.5 — FECHAMENTO DA SUPERFÍCIE PÚBLICA

## P26 — Engines: barril órfão, exposição e corte

> ⚠️ **MEXE EM CÓDIGO.** Roda ANTES dos kits (Fase 5), para que o kit documente a superfície final. Decisão **D2** já tomada — implemente, não rediscuta.

```
Você vai fechar a superfície pública de `src/components/engines/` na Sarak-Lib-UI-Core. A auditoria da Fase 2 achou que três das quatro categorias de engine são inalcançáveis pelo consumidor; a investigação mostrou que os três casos têm status DIFERENTES e pedem ações diferentes.

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO (regras comuns, baseline, decisão D2); (3) `specs/arquitetura/03-superficie-publica.md` §3, §7 e §8 — o mecanismo do gate, as fronteiras lazy e a dívida registrada; (4) `specs/specs/00-regras-e-invariantes.md` R14 e R15; (5) leia `src/components/engines/**` INTEIRO, `src/index.ts` e `scripts/publicComponents.mjs`.

O DIAGNÓSTICO CONFIRMADO (reconfirme antes de agir):
| Engine | Uso interno | No barril | Ação |
| `SarakChartEngine` | — | ✅ via `engines/charts/index.tsx` | é o PADRÃO a copiar |
| `SarakChatEngine`  | ✅ `core/Discovery/components/ContractRenderer.tsx:67` | ❌ | EXPOR |
| `SarakFlowEngine`  | ✅ `ContractRenderer.tsx:9` | ❌ | EXPOR |
| `SarakVisualEngine`| ❌ nenhum | ❌ | REMOVER |
E o achado que explica a confusão: `src/components/engines/index.ts` — que declara os quatro atrás de `React.lazy` — **não é importado por ninguém**. O `ContractRenderer` importa direto dos arquivos; o `src/index.ts` importa de `engines/charts`. É código morto que produz leitura errada da arquitetura.

TAREFA (L1–L4):

- **L1 · Apagar `src/components/engines/index.ts`.** Confirme por grep que ninguém importa (incluindo `PaletteSelector` e `LazyEngineWrapper`, que ele reexporta — se alguém depender por esse caminho, re-aponte para o arquivo real ANTES de apagar).

- **L2 · Expor `SarakChatEngine` e `SarakFlowEngine`** replicando o padrão de `engines/charts/index.tsx`: barril próprio por categoria, `lazy` + `LazyEngineWrapper` (Suspense INTERNO, para o consumidor não precisar declarar `Suspense`), tipo `Props` exportado, e o export nomeado em `src/index.ts`. **Custo de boot tem de ser ZERO** — é a lição medida da Spec 41: o pecado nunca foi expor, foi expor *eager*. MEÇA o `dist/` antes e depois e prove que não mudou de forma relevante.

- **L3 · Remover `SarakVisualEngine`** (regra de corte do ADR-001: só permanece o que tem consumidor real provado).
  ⚠️ **PRÉ-CONDIÇÃO — varredura de consumidor real:** grep no **ERP Earendel**. O `Sarak-MyService` está OBSOLETO (decisão D6) e **não** entra na varredura. Se o ERP usar, a decisão se inverte sozinha: ele vira caso L2 (expor) e você reporta a inversão. Remova também o que só existia para ele (`engines/visuals/index.ts`, e avalie `PaletteSelector` — se ninguém usar, cai junto; se alguém usar, fica e você registra por quê).

- **L4 · Ampliar o escopo do `barrel:check` para `components/engines/**`.** Sem isso o vão volta na próxima adição — é exatamente a lição da §4.3 de `01-gates-e-baseline`: gate com escopo menor que a regra deixa a regra violada em silêncio. Ajuste `collectPublicComponentNames()` em `scripts/publicComponents.mjs` e confirme que o gate passa a ver os engines. Se a ampliação acusar algo além dos engines, PARE e reporte — não amplie a allowlist para silenciar.

DEPOIS: atualize `specs/arquitetura/03-superficie-publica.md` (§6 taxonomia — as categorias de engine deixam de ser 4; §8 — a dívida dos engines deixa de existir e vira registro do que foi feito) e `docs/migracoes.md` se `SarakVisualEngine` for removido (não era público, mas o registro é barato e o arquivo é o histórico do contrato).

FRONTEIRAS: não mexa nos outros achados (P10 já os registrou); não torne o `CustomizationPanel` lazy (breaking change de tipo, decisão separada); não corrija o baseline; não instale dependência.

GATES: `barrel:check` (com o escopo NOVO), `catalog:check` (os engines expostos entram no catálogo gerado — confirme), `zero-brand:check`, `guide:check`, `npm run build` (DTS), suíte COMPLETA, `package:check`, `run_audit` no baseline exato. Mais a medição de bundle antes/depois da L2.

ENTREGUE: o RELATÓRIO DE ENTREGA (§7), com: a varredura do ERP (a prova que autoriza ou cancela a L3), a medição de bundle da L2, e a saída do `barrel:check` mostrando o escopo ampliado. Marque o checkbox de P26 e registre em `00-progresso.md`. NÃO commite sem autorização.
```

---

## P27 — Promover o Anel 3 (suíte) a `pre-push`

> ⚠️ **MEXE EM CÓDIGO.** Depende do **P20-A** (sem ele, o push trava por projeto alheio). Decisão **D8** já tomada.

```
Você vai promover a suíte de testes a gate de push na Sarak-Lib-UI-Core, fechando uma decisão que ficou pendente desde o P11.

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO (regras comuns, decisão D8); (3) `specs/specs/02-enforcement-por-commit.md` INTEIRA — esp. a §4 (a decisão de deixar o Anel 3 manual, com os motivos numerados) e o **caminho de promoção** que ela já registra; (4) `.githooks/pre-push` e `scripts/check-release-tag.mjs` (o anel de push que o P12-C instalou — você vai CONVIVER com ele, não substituí-lo); (5) `scripts/install-hooks.mjs`.

⚠️ PRÉ-REQUISITO: o **P20-A** tem de estar concluído. Enquanto o `Template-Ts/` estiver no repositório, a suíte não fecha verde num clone limpo e um `pre-push` bloqueante travaria todo push por um projeto que não é da lib. Confirme; se não estiver, PARE e reporte.

O QUE MUDA — e o que NÃO muda:
- **PROMOVER: só a suíte** (`npx vitest run`). Os motivos (1) e (2) da §4 tinham validades diferentes, e só um expirou:
  · motivo (1) *"a suíte tem falha dependente do ambiente"* → **caiu** (P11-D fechou a §3.1; P20-A fecha a §3.2);
  · motivo (2) *"`npm run build` MUTA a árvore de trabalho"* → **NÃO expira nunca.** Um hook que regenera `dist/` no meio de um push faz o push sair com uma árvore diferente da que foi validada.
- **`npm run build` e `package:check` ficam FORA de hook, permanentemente.** Registre isso na spec como decisão fechada, não como pendência — para ninguém "completar" o Anel 3 depois achando que faltou.

TAREFA:
- L1: acrescentar a suíte ao `.githooks/pre-push`, **convivendo** com o anel de release (`check-release-tag.mjs`). Decida e JUSTIFIQUE a ordem: a suíte é cara (~165 s) e o anel de release é instantâneo — rodar o barato primeiro devolve o "não" mais rápido, que é o que respeita quem está do outro lado do terminal.
- L2: o gate vale só para push de `main`? Ou para qualquer branch? **Decida e justifique.** O anel de release já filtra `refs/heads/main`; a suíte tem outro caráter — quebrar teste em branch de trabalho é normal, e bloquear atrapalharia. Minha inclinação: **só `main`**, mesmo critério do anel de release. Mas argumente.
- L3: mensagem acionável no bloqueio, no mesmo padrão dos outros anéis: qual regra, qual comando reproduz, onde está a dívida tolerada.
- L4: atualizar `scripts/install-hooks.mjs` se preciso (o `pre-push` já deve estar em `HOOK_FILES` desde o P12-C — confirme).
- L5: reescrever a §4 de `02-enforcement-por-commit.md`: o Anel 3 deixa de ser "manual" e passa a ser "suíte no push; build e package:check fora de hook, por decisão". Preserve o histórico do porquê — a seção é instrutiva, não some.

PROVA OBRIGATÓRIA (com saída real): (1) push com a suíte verde passa; (2) push com um teste quebrado de propósito é BLOQUEADO com a mensagem acionável — **e reverta a quebra depois**; (3) o anel de release continua funcionando nos dois cenários dele (artefato mudou sem tag → bloqueia; só markdown → passa); (4) meça o custo total do `pre-push` e registre — se passar de ~3 min, reporte, porque hook caro é hook contornado.

FRONTEIRAS: não coloque `build` nem `package:check` no hook (motivo (2), permanente); não altere nenhum auditor; não mexa no `pre-commit`; não corrija o baseline; não faça push de verdade.

GATES: suíte COMPLETA verde; `run_audit` no baseline exato; `barrel:check`, `catalog:check`, `zero-brand:check`, `guide:check`.

ENTREGUE: o RELATÓRIO DE ENTREGA (§7), com as 4 provas e as justificativas de L1 e L2. Marque o checkbox de P27 e registre em `00-progresso.md`. NÃO commite sem autorização.
```

---

## P28 — Atualizar e revalidar o ERP

> ⚠️ **ESTA TAREFA TOCA UM REPOSITÓRIO FORA DESTE.** O ERP é o único consumidor real (decisão **D13**) e é onde o dono valida na prática. **Nada é executado lá antes de aprovação explícita** — a tarefa começa apresentando um plano e PARANDO.
>
> **Quando roda:** ao fim da Fase 4.5, depois de P20-A/P26/P27 — quando a superfície pública já parou de mudar, mas ANTES de a Fase 5 documentar os kits. Assim o kit é escrito com um consumidor real já revalidado.

```
Você vai atualizar o ERP Earendel — o único consumidor real da Sarak-Lib-UI-Core — e revalidar que as mudanças desta campanha não o quebraram. ⚠️ ISTO TOCA UM REPOSITÓRIO FORA DA LIB. Leia a regra de HITL abaixo antes de qualquer coisa.

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO — esp. a decisão **D13** e o bloco "📌 Fatos do ERP que quem executar o P28 precisa saber"; (3) `specs/specs/13-instalacao-e-atualizacao.md` (se o P22 já rodou) e `bin/scaffold/packageManager.mjs` §`localRefreshCommand`; (4) `docs/migracoes.md` — todas as entradas desde a última versão que o ERP tinha.

═══ REGRA DE HITL — INEGOCIÁVEL ═══
Esta tarefa tem DUAS metades, separadas por uma parada obrigatória.

**METADE 1 — DIAGNOSTICAR (read-only). Não escreva NADA no ERP.**
**PARE. Apresente o relatório em TEXTO** (contexto · o que será tocado · o que pode quebrar · recomendação) e **AGUARDE aprovação explícita do dono.** Não use popup interativo — relatório em texto, como o resto desta campanha.
**METADE 2 — EXECUTAR.** Só depois do "sim".

Se em qualquer ponto da metade 2 aparecer algo que não estava no diagnóstico, **PARE de novo** e reporte. É repositório de produção do dono; surpresa não se resolve por conta.
═══════════════════════════════════

## METADE 1 — DIAGNÓSTICO (read-only)

- D1: CONFIRMAR o estado do ERP: o `file:` em `packages/ui-kit/package.json`, o `name` real do pacote (é ele que vai no `--filter`), e qual `libVersion` está instalada hoje (`node_modules/@sarak/lib-ui-core/dist/BUILD_INFO.json`).
- D2: CONFIRMAR se o `pnpm` é **invocável** (`Get-Command pnpm`) — não basta estar declarado em `packageManager`. Se não estiver, o caminho preparado do projeto é `corepack enable pnpm`. **Declarado ≠ invocável**; em 2026-07-29 isso custou um `CommandNotFoundException` ao dono.
- D3: LEVANTAR o delta: entre a `libVersion` instalada no ERP e a atual da lib, o que mudou de contrato público? Cruze `docs/migracoes.md` + as mudanças desta campanha. Atenção especial ao **P26**: `SarakVisualEngine` pode ter sido REMOVIDO e `SarakChatEngine`/`SarakFlowEngine` passaram a ser públicos. **Grep no ERP** por cada nome afetado.
- D4: LISTAR o que a atualização pode quebrar, com `arquivo:linha` do ERP. Se o delta for zero, diga isso — "nada quebra" é resultado legítimo e é o mais provável, já que o P26 varreu o ERP antes de remover.
- D5: MONTAR o plano de execução: o comando exato, o que será verificado depois, e como reverter (o `pnpm-lock.yaml` do ERP e a cópia anterior no store).

**⇒ PARE AQUI. Relatório em texto + aguardar o "sim".**

## METADE 2 — EXECUÇÃO (só após aprovação)

- E1: reinstalar com o comando **validado**: `pnpm install --force --filter <nome-do-pacote>` na raiz do monorepo do ERP. ⚠️ **NUNCA `npm install`** ali — foi isso que quebrou um consumidor pnpm na Spec 51.
- E2: CONFERIR que a cópia foi refeita de verdade: `node_modules/@sarak/lib-ui-core/dist/BUILD_INFO.json` tem de trazer a `libVersion` e o `baseCommit` novos. Se continuar na versão velha, a reinstalação não pegou — PARE e reporte, não tente contornar.
- E3: verificar tipos e build de CADA app `web` do ERP que consome o `ui-kit` (`tsc` + build). Erro de tipo aqui é o sinal mais barato de quebra de contrato.
- E4: se algo quebrar, **conserte na LIB, não no ERP** — é a regra que governou o Teste Real inteiro: *se o consumidor precisou escrever CSS, fiar token à mão ou montar andaime só para a lib funcionar, é defeito da lib.* Contorno no importador é proibido; o achado volta como tarefa na lib.
- E5: entregar ao dono a lista do que ELE precisa validar no browser — a lib não decide que a tela está certa.

FRONTEIRAS: não commite nada no ERP (é repositório dele; o commit é decisão dele); não instale `pnpm` global sem autorização (muda a versão que gerou o lockfile — prefira `corepack enable`); não altere código de negócio do ERP; não migre o ERP para `github:`/`#semver:` (D13 diz que a importação local é deliberada enquanto as duas pontas estão em desenvolvimento); não instale o `sarak:check` no ERP nesta tarefa (é Fase D da Campanha 2).

GATES: **na LIB** — nada deve ter mudado: `run_audit` no baseline, `barrel:check`, `catalog:check`, `zero-brand:check`, `guide:check`, suíte completa. **No ERP** — `tsc` e build verdes em cada app que consome o `ui-kit`.

ENTREGUE: o RELATÓRIO DE ENTREGA (§7) com as duas metades separadas, o `BUILD_INFO` antes e depois (a prova de que a cópia foi refeita), a saída do `tsc`/build de cada app, e a lista de validação de browser para o dono. Marque o checkbox de P28 e registre em `00-progresso.md`. NÃO commite em NENHUM dos dois repositórios sem autorização.
```

---

# FASE 5 — HABILITAÇÃO (OS DOIS KITS)

## P21 — `specs/12-kit-do-consumidor.md`

```
Você vai escrever a spec do KIT DO CONSUMIDOR (`sarak-ui/`) da Sarak-Lib-UI-Core — o artefato que viaja no pacote e ensina o importador a usar a lib.

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO; (3) `specs/_templates/template-spec.md`; (4) `arquitetura/03`/`05` (prontos); (5) `sarak-ui/**` INTEIRO, `scripts/generate-consumer-kit.mjs`, `scripts/consumer-kit/**`, `scripts/catalogAst.mjs`.

DESTINO: `specs/specs/12-kit-do-consumidor.md`.

CONTEÚDO:
- O QUE É: pasta `sarak-ui/` na raiz do pacote, shippada no install, que o importador encontra em `node_modules/@sarak/lib-ui-core/sarak-ui/`. Conteúdo: `START-HERE.md`, `GUIA-FRONTEND.md` (o documento único de autoria — 4 topologias + todos os casos), `skill/` (a `ui-integra-consumidor` versão consumidor), `templates/` (esqueletos copiáveis), `catalog.json` (gerado), `VERSION` (carimbo).
- O PRINCÍPIO CENTRAL: **nunca escrever à mão o que muda.** A PROSA (regras, topologias, como-fazer) é estável e editada à mão; toda LISTA (componentes, props, tokens, CSS Vars, ícones, contrato de responsividade, slots) é DERIVADA por AST, reusando o MESMO pipeline do `npm run catalog` (`catalogAst.mjs` fatiado de propósito) — sem reimplementar travessia.
- A REGRA Nº 1 DO CONSUMIDOR: **leia o catálogo, não assuma.** Nome inexistente não quebra a tela — ele silenciosamente não faz nada, que é pior. Explique por que essa é a regra número um.
- O GATE `guide:check`: regenera e compara; kit defasado = build vermelho. Consequência: **é impossível publicar uma versão cujo kit não bata com a API.**
- O CARIMBO (`VERSION` + `kitHash`) e como o consumidor sabe que suas cópias movidas ficaram velhas.
- OS 3 MOVIMENTOS de instalação (guia → `specs/` do consumidor; skill → `.claude/skills/` e `.agents/skills/`; kit inteiro → raiz do projeto) e por que são CÓPIAS, não recortes.
- INTEGRAÇÃO: o `init` copia o kit; o `sarak:update` refresca as cópias movidas (`refreshKit.mjs`); `package:check` EXIGE o kit no tarball (publicar sem ele = publicar sem instruções).
- GENERICIDADE: o kit não cita nenhum consumidor específico — o gate/processo confere isso (grep de nome de consumidor = 0).
- O LOOP DE COMPLETUDE: o aceite do kit é o dono construir um MÓDULO NOVO seguindo só ele; cada buraco achado vira seção nova no guia, NUNCA gambiarra no importador. ⚠️ Registre que este aceite ainda está PENDENTE.
- ⚠️ ACHADO A REGISTRAR: a geração do kit já pegou 5 JSDoc de props que descreviam o motor de manifesto REMOVIDO e vazavam para o catálogo do consumidor. Lição: JSDoc é superfície pública quando o catálogo é gerado por AST.

MATERIAL-FONTE: `plan/50-kit-de-uso-do-consumidor.md`, `plan/22-skills-de-consumo-golden-path.md`, `plan/51` §L4, `sarak-ui/START-HERE.md`, `scripts/consumer-kit/**`.

FRONTEIRAS: não duplique o conteúdo do `GUIA-FRONTEND.md` — a spec define o CONTRATO do artefato, não reescreve o guia; não regenere o kit; o fluxo de instalação/atualização é P22.

GATES: nenhum código tocado — rode `guide:check` e reporte.

ENTREGUE: o RELATÓRIO DE ENTREGA (§7). Marque o checkbox de P21 e registre em `00-progresso.md`. NÃO commite sem autorização.
```

---

## P22 — `specs/13-instalacao-e-atualizacao.md`

```
Você vai escrever a spec de INSTALAÇÃO, SCAFFOLDER E CICLO DE ATUALIZAÇÃO da Sarak-Lib-UI-Core — o caminho do importador, ponta a ponta.

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO; (3) `specs/_templates/template-spec.md`; (4) ADR-007, `arquitetura/05` e `specs/12-kit-do-consumidor.md` (prontos); (5) `bin/**` INTEIRO (`sarak-ui.mjs`, `scaffold/`, `scaffold/checkUpdate/`, `scaffold/refreshKit/`, `scaffold/generators/`).

DESTINO: `specs/specs/13-instalacao-e-atualizacao.md`.

CONTEÚDO:
- INSTALAÇÃO: o comando (`npm install github:...`), a exigência de haver um `package.json` na raiz ANTES (achado real: sem ele o install falha de forma confusa), as peerDependencies, e o CSS que NÃO precisa ser importado.
- O SCAFFOLDER `npx sarak-ui init`: o que ele gera hoje — starter padrão (Provider + Shell + Design Engine + módulo de exemplo REGISTRADO), Vite puro, SEM backend. Registre que as 3 stacks antigas (vite-express / next / frontend-only) COLAPSARAM numa só, e por quê. Os geradores (`mainTsx`, `viteConfig`, `indexHtml`, `tsconfig`, `packageJsonFields`, `exampleModule`) e o merge não-destrutivo de `package.json`. Achados reais a preservar: `@types/react`/`@types/react-dom` faltavam no starter; a landing default caía no Design Engine em vez do módulo de exemplo (`defaultModuleId`).
- O CLI DE SUBCOMANDOS: `init` / `check` / `refresh`. Comando desconhecido diz QUAL não existe; `--help` real; guard de TTY; scripts não vazam caminho interno.
- O AVISO DE ATUALIZAÇÃO — o coração desta spec: `sarak-ui check --notify` ligado pelo `init` como `predev`, de modo que o aviso aparece a cada `npm run dev`. Silencioso quando em dia; bloco destacado quando há versão nova; **SEMPRE exit 0** (nunca quebra o dev do consumidor); tolerante a offline.
- OS DOIS MODOS DE DEPENDÊNCIA e por que ambos precisam de tratamento: (a) git spec (compara commit remoto × instalado); (b) `file:`/`link:` (rebuildar a lib NÃO chega ao consumidor e nada avisa). ⚠️ Registre o achado técnico: comparar CONTEÚDO não bastava no modo `file:` porque o **pnpm HARDLINKA** — rebuild de arquivo existente propaga sozinho, e só arquivo ADICIONADO/REMOVIDO delata a cópia velha; por isso a assinatura inclui o INVENTÁRIO de `dist/` + `sarak-ui/`.
- MULTI-GERENCIADOR: detecção de npm/pnpm/yarn e o comando de atualização correspondente. ⚠️ REGRA DURA a registrar: **comando não executado de verdade não entra** — foi DEDUZIR comando que quebrou o repositório de um consumidor real (npm entrou no store do pnpm).
- MONOREPO: o `check` sobe a árvore atrás do lock.
- `sarak:update` = atualizar a lib + refrescar as cópias movidas do kit (`refreshKit`), tocando SÓ o que já existe nos caminhos conhecidos.
- ⚠️ A ARMADILHA DO `BUILD_INFO`: `baseCommit` é sempre 1 commit atrás (auto-referência impossível). Para "estou atualizado?", use `sarak:check` — NUNCA o `BUILD_INFO`.
- O PRINCÍPIO: "sempre a mais atual" é SOB COMANDO; automático exigiria registry + semver (ADR-007).

MATERIAL-FONTE: `plan/21-scaffolder-init.md`, `plan/45-scaffolder-react-e-skills.md`, `plan/29-robustez-instalacao-pacote.md`, `plan/39-importacao-e-atualizacao.md`, `plan/51-aviso-de-atualizacao-e-cli-do-consumidor.md`, `plan/22-skills-de-consumo-golden-path.md`, `bin/**`.

FRONTEIRAS: não altere o `bin/`; não rode `init` num projeto real; o kit é P21; o build é `arquitetura/05`.

GATES: nenhum código tocado — `catalog:check`/`guide:check` verdes. Se quiser validar o CLI, rode `node bin/sarak-ui.mjs --help` (inócuo) e reporte.

ENTREGUE: o RELATÓRIO DE ENTREGA (§7). Marque o checkbox de P22 e registre em `00-progresso.md`. NÃO commite sem autorização.
```

---

## P23 — `specs/14-artefatos-do-mantenedor.md` + CRIAR o kit `sarak-dev/`

```
⚠️ ESTA TAREFA MEXE EM CÓDIGO/CONFIG (cria gerador + gate). É a última entrega de capacidade da campanha.

Você vai escrever a spec dos ARTEFATOS DO MANTENEDOR da Sarak-Lib-UI-Core **e criar o artefato**. Hoje existe um kit excelente para quem CONSUME a lib (`sarak-ui/`) e NADA equivalente para quem a EDITA — e a consequência é medível: as skills do mantenedor MENTEM.

O PROBLEMA CONFIRMADO (cite no relatório, com a prova):
- `.agents/skills/ui-novo-componente/SKILL.md` manda registrar todo componente novo na "6ª camada" (`src/core/Manifest/Registry/nativeComponents.ts`) e rodar `RegistryParity.test.tsx` — **os dois foram REMOVIDOS**; e manda regenerar `docs/manifest-catalog.{json,md}`, que hoje se chama `component-catalog`.
- `.agents/skills/ui-novo-pipe/SKILL.md` é 100% sobre o motor de manifesto removido (pipes de data binding) — **obsoleta inteira**.
- `.agents/skills/ui-contexto-repositorio/SKILL.md` manda ler `specs/specs/07-agente-llm-design-e-expansao-estrutural.md` — **arquivo inexistente**.
É exatamente a classe de defeito que o kit do consumidor resolveu do outro lado: documentação escrita à mão que envelhece em silêncio.

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO; (3) TODA a base nova já escrita (`specs/adr/`, `specs/arquitetura/`, `specs/specs/`) — este artefato é o ÍNDICE OPERACIONAL dela; (4) `scripts/generate-consumer-kit.mjs` + `scripts/consumer-kit/**` + `scripts/catalogAst.mjs` — o padrão a espelhar; (5) todas as skills em `.agents/skills/ui-*`.

DESTINO (spec): `specs/specs/14-artefatos-do-mantenedor.md`.
DESTINO (artefato): pasta `sarak-dev/` na raiz + gerador `npm run dev-kit` + gate `npm run dev-kit:check`.

DESENHO EXIGIDO — mesmo princípio do `sarak-ui/`: **nunca escrever à mão o que muda.**
- **PROSA ESTÁVEL (à mão):** `START-HERE.md` (para quem chega a este repositório: leia nesta ordem — regras → arquitetura → a spec do que vai mexer) e `GUIA-MANUTENCAO.md` com os fluxos de trabalho reais: adicionar/remover token (paridade), criar componente atômico novo (categoria, barril, props tipadas, teste 1:1, catálogo), criar tema e preset, mexer no cromo, rodar e LER os gates, e a árvore Configuração × Expansão. Cada fluxo APONTA para a spec dona — não a reescreve.
- **ESTADO GERADO (`state.json`, por AST — reusando `catalogAst.mjs`, sem reimplementar travessia):** contagem e lista de schemas de design; contagem de tokens; categorias atômicas existentes; componentes públicos; gates registrados (nome + comando, lidos do `package.json` e do `run_audit.mjs`); e o **BASELINE ATUAL** dos auditores. É isto que impede o guia de envelhecer.
- **GATE `dev-kit:check`:** regenera e compara (família de `guide:check`). Deve falhar se o guia citar um caminho, gate ou script que **não existe** — essa checagem de PONTEIRO MORTO é o requisito mais importante da tarefa, porque é exatamente o defeito que as skills têm hoje.
- **EMPACOTAMENTO:** `sarak-dev/` é INTERNO. **NÃO** entra no campo `files` do `package.json` e **NÃO** pode aparecer no tarball. Adicione-o à lista de PROIBIDOS de `scripts/check-package-contents.mjs` e prove com `npm pack --dry-run`.
- **AS SKILLS `ui-*` passam a CONSUMIR o `state.json`**, não a duplicá-lo. Nesta tarefa você só ESTABELECE o contrato e o artefato; a reconciliação das skills é P24.

FRONTEIRAS: NÃO reescreva as skills aqui (é P24); NÃO duplique o pipeline AST (reuse); NÃO shippe o `sarak-dev/` no pacote; NÃO invente conteúdo de fluxo — cada passo tem de estar comprovado nas specs já escritas ou no código; NÃO instale dependência nova.

GATES: `dev-kit:check` (novo) verde; `guide:check` verde (o kit do CONSUMIDOR não pode ter sido afetado); `catalog:check`; `barrel:check`; `package:check` provando que `sarak-dev/` NÃO está no tarball; suíte COMPLETA `npx vitest run`; `run_audit` no baseline exato.

PROVA OBRIGATÓRIA: quebre de propósito um ponteiro no `GUIA-MANUTENCAO.md` (cite um script inexistente) e mostre o `dev-kit:check` VERMELHO; depois conserte e mostre verde.

ENTREGUE: o RELATÓRIO DE ENTREGA (§7), com a prova acima e o `npm pack --dry-run` provando a exclusão. Marque o checkbox de P23 e registre em `00-progresso.md`. NÃO commite sem autorização.
```

---

# FASE 6 — FECHAMENTO

## P24 — Reconciliar as skills do mantenedor com o código real

```
Você vai reconciliar as skills do mantenedor da Sarak-Lib-UI-Core (`.agents/skills/ui-*`) com o código real e com a base de specs recém-escrita. Hoje várias delas instruem agentes a fazer coisas IMPOSSÍVEIS (mexer em arquivos removidos, rodar gates que não existem, ler specs inexistentes).

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO; (3) TODA a base nova (`specs/adr/`, `specs/arquitetura/`, `specs/specs/`) + o `sarak-dev/state.json` (P23); (4) estude a skill `sarak:meta-create-skill` (o padrão oficial de skill do ecossistema) e `sarak:meta-verificacao-base` (caça ponteiro órfão); (5) LEIA as 10 skills de `.agents/skills/` INTEIRAS.

⚠️ FATO ESTRUTURAL A CONFIRMAR ANTES DE EDITAR: `.claude/skills` é um SYMLINK para `.agents/skills` — **não há cópia a espelhar**; editar `.agents/` já basta. Confirme e reporte; se mudou, PARE e registre em DIVERGÊNCIAS.

DEFEITOS JÁ MAPEADOS (confirme cada um antes de agir):
- `ui-novo-componente`: manda registrar no `NATIVE_COMPONENTS` (`src/core/Manifest/Registry/`) — REMOVIDO; manda rodar `RegistryParity.test.tsx` — REMOVIDO; cita `docs/manifest-catalog.{json,md}` — hoje é `component-catalog`. A "6ª camada" precisa ser redefinida como barril + catálogo (ver `arquitetura/04`).
- `ui-novo-pipe`: 100% sobre o motor de manifesto removido. **Proposta: APOSENTAR a skill inteira.**
- `ui-contexto-repositorio`: manda ler `specs/specs/07-agente-llm-design-e-expansao-estrutural.md` (inexistente) e outras specs que a campanha renomeou; a lista de leitura obrigatória tem de apontar para a base NOVA.
- `ui-integra-consumidor`: é a skill do CONSUMIDOR, espelhada aqui a partir de `sarak-ui/skill/`. Ela é GERADA pelo `guide` — **não a edite à mão**; verifique se é cópia fiel e registre.
- `ui-auditoria-modulo`, `ui-arquitetura-design`, `ui-criar-tema`, `ui-criar-preset`, `ui-refatorar-componente`: audite cada uma contra o código e contra as specs novas; corrija ponteiros e contagens defasadas.
- ⚠️ **ESCOPO AMPLIADO — `README.md` da raiz entra nesta tarefa** (achado 5 da Fase 2). Ele é o primeiro texto que um consumidor lê e tem a mesma classe de defeito das skills: ponteiro morto. Confirmado: `README.md:18` manda instalar **`pg`** no comando de peerDependencies, mas o driver saiu junto com o backend próprio (ADR-003) e `pg` não está mais em `peerDependencies`. Audite o `README.md` INTEIRO contra o código — comando de instalação, lista de dependências, exemplo de consumo, comandos de build, e a seção "Guia Rápido para Agentes IA" (que cita skills que P24 pode estar aposentando na mesma rodada) — e corrija o que estiver morto. Trate-o como o artefato consumidor-facing que ele é.

TAREFA:
- T1: AUDITAR as 10 skills — para cada uma, tabela: ponteiro citado × existe? × ação (manter / corrigir / aposentar).
- T2: CORRIGIR as skills que têm conserto, apontando para a base nova (`specs/specs/00-regras-e-invariantes.md`, `specs/specs/01-gates-e-baseline.md`, `specs/arquitetura/*`, `sarak-dev/`). Mantenha o formato de skill do `meta-create-skill` (frontmatter `name`/`description`, seções, checklist).
- T3: APOSENTAR o que não tem conserto. ⚠️ **Aposentar = propor.** Traga a recomendação e o impacto; **peça aprovação explícita ANTES de apagar qualquer skill.**
- T4: garantir que nenhuma skill duplique conteúdo que agora vive numa spec — skill ORQUESTRA e APONTA; spec DEFINE.

FRONTEIRAS: não crie skill nova; não edite `ui-integra-consumidor` à mão (é gerada); não apague nada sem aprovação explícita; não altere código-fonte da lib.

GATES: `dev-kit:check` (as skills alimentam/consomem o estado do mantenedor); `guide:check` (se `ui-integra-consumidor` for tocada, ele acusa); `catalog:check`; `run_audit` no baseline.

ENTREGUE: o RELATÓRIO DE ENTREGA (§7), com a tabela de auditoria da T1 completa (10 skills × ponteiros). Marque o checkbox de P24 e registre em `00-progresso.md`. NÃO commite sem autorização.
```

---

## P25 — Esvaziar `specs/plan/` e remover as specs aposentadas

```
⚠️ TAREFA DESTRUTIVA. É a ÚLTIMA da campanha e só roda com TODAS as anteriores concluídas e revisadas. Se qualquer checkbox de P0 a P24 estiver aberto, PARE.

🔒 LEIA A §10 DAS REGRAS COMUNS ANTES DE QUALQUER COISA — "só sai daqui o que foi EXECUTADO". Sua tarefa **não é esvaziar**: é REMOVER o que está `[x]` e MIGRAR o que está `[ ]`. Conte os checkboxes abertos ANTES de tocar em nada e prove, ao fim, que todos aparecem no arquivo novo. **Diferença de um é falha de entrega.** Apagar etapa não executada não limpa o plano — destrói trabalho que ninguém fez ainda.

Você vai fechar a campanha "Reescrita da Base de Specs" da Sarak-Lib-UI-Core: esvaziar o `specs/plan/` e remover as specs aposentadas, agora que o conteúdo vivo foi migrado.

Preparação: (1) `ui-contexto-repositorio`; (2) `specs/plan/00-prompts-execucao.md` INTEIRO — esp. o Roteiro (todos os checkboxes) e o mapa DE→PARA; (3) a base nova COMPLETA; (4) estude `sarak:spec-atualizar` §5 (a etapa de limpeza é HITL por definição — nunca apague sem consentimento).

⚠️ REGRA DE OURO DESTA TAREFA: **NADA é apagado sem que o conteúdo vivo esteja provadamente migrado.** Para cada arquivo que você propuser remover, mostre ONDE o conteúdo dele foi parar (documento novo + seção). Se não achar destino, o arquivo NÃO é removido — vira DIVERGÊNCIA.

TAREFA:
- T1: AUDITORIA DE MIGRAÇÃO — tabela completa de todos os 45 arquivos de `specs/plan/` + os 22 de `specs/arquitetura/` e `specs/specs/`, com: arquivo → classificação (MIGRADO / HISTÓRICO / ÓRFÃO) → destino provado (documento + seção) ou motivo. Arquivos de HISTÓRICO PURO (`00-progresso.md`, `00-prompts-execucao.md`, os dois `RELATORIO-*.md`) não precisam de destino — o dono decidiu que ficam preservados no git.
- T2: VARREDURA DE REFERÊNCIAS ÓRFÃS — grep por links para `specs/plan/*`, para as specs antigas e para arquivos removidos, em TODO o repositório (specs novas, skills, `docs/`, `sarak-ui/`, `README.md`, `CLAUDE.md`, `.agents/index.md`, código). ⚠️ Já conhecido: `plan/00-indice.md` linka `11-enriquecimento-presets-visuais.md`, que NÃO EXISTE. Toda referência órfã tem de ser corrigida ou removida ANTES do apagamento — link quebrado é dívida que sobrevive ao git.
- T3: APRESENTAR O PLANO DE REMOÇÃO e **PARAR PARA APROVAÇÃO** (HITL obrigatório): lista exata do que será apagado, agrupada, com a contagem. **Não apague nada antes do "sim" explícito.**
- T4: após aprovação — remover os arquivos aprovados de `specs/plan/` e as specs aposentadas de `specs/arquitetura/`/`specs/specs/`.
- T5: ATUALIZAR os índices: `specs/INDEX.md` com a lista FINAL e completa dos documentos das 4 categorias; `specs/README.md` conferido; `specs/adr/README.md` com o índice dos 7 ADRs.
- T6: FECHAMENTO — a última entrada de `00-progresso.md` antes de ele sair: o resumo da campanha (o que existia, o que passou a existir, o que foi aposentado e por quê).
- T7: ⚠️ **SEMEAR A CAMPANHA 2 — esta tarefa NÃO termina com o `plan/` vazio.** Antes de apagar este arquivo, transcreva o **BRIEFING DA CAMPANHA 2** (a última seção deste documento) para um `specs/plan/00-prompts-execucao.md` NOVO, com: o cabeçalho da campanha nova, as **REGRAS COMUNS** (§1–§9 — copie da Campanha 1, atualizando o baseline para o estado real ao fim do P25), o **REGISTRO DE DECISÕES DO DONO** (D1–D12, que continuam valendo), o roteiro das 5 fases e o briefing de cada uma. Os **prompts** de cada fase da Campanha 2 NÃO são escritos aqui — eles nascem quando o dono for executar cada fase, como aconteceu nesta.
  **Por que:** o `plan/` é transitório **por campanha**, não para sempre — é o modelo que o `specs/README.md` (reescrito no P0) descreve. Apagar este arquivo sem semear o próximo mataria junto todo o trabalho de decisão registrado nas D1–D13.
  ⚠️ **A transcrição INCLUI a `Fase 0 — Alinhamento do ERP` (decisão D14) como PRIMEIRO item do roteiro da Campanha 2** — ela roda entre este P25 e a Fase A, e os 8 defeitos do ERP só existem escritos aqui.
  ⚠️ **A transcrição INCLUI, obrigatoriamente:** a seção **"Os 21 achados da Campanha 1 — e onde cada um entra"** (a tabela de roteamento inteira, com os `arquivo:linha`), **a tabela dos 6 achados da Fase 5** (itens 22–27, acrescentada em 2026-07-31), a **REGRA DE ESCOPO** que fecha a Campanha 1, e as **6 fases (A, B, F, C, D, E)** com o escopo de cada uma. Os achados só existem hoje neste arquivo e no `00-progresso.md` — e o `00-progresso.md` também sai no P25. **Perder a tabela de roteamento é perder 27 achados de auditoria que custaram três rodadas para encontrar.** Confira, ao fim, que cada um dos **27** aparece no arquivo novo.

FRONTEIRAS: não apague nada não aprovado; não apague `specs/_templates/`; não toque em código-fonte, `docs/`, `sarak-ui/` ou `sarak-dev/` além de corrigir referências órfãs; **não `git rm` — apenas remoção de arquivo** (o commit é decisão do dono); não faça push.

GATES: TODOS, ao final, no baseline exato — `run_audit`, `barrel:check`, `catalog:check`, `zero-brand:check`, `guide:check`, `dev-kit:check`, `npm run build`, suíte COMPLETA, `package:check`. Uma campanha de documentação que moveu um número de gate falhou em algum lugar.

ENTREGUE: o RELATÓRIO DE ENTREGA (§7), com a tabela de migração da T1 COMPLETA (é a prova de que nada de vivo foi perdido) e o resultado da varredura da T2 (referências órfãs: encontradas × corrigidas). Registre o estado final: `specs/plan/` vazio, `specs/adr/` com 7 ADRs, `specs/arquitetura/` com 6, `specs/specs/` com 15. NÃO commite sem autorização.
```

---

# BRIEFING DA CAMPANHA 2 — ADEQUAÇÃO DO SISTEMA

> **Esta seção é a semente do próximo plano.** O **P25 (T7)** a transcreve para um `specs/plan/00-prompts-execucao.md` novo antes de apagar este arquivo. Aqui há **briefing**, não prompt — os prompts nascem quando o dono for executar cada fase.
>
> **A ordem das duas campanhas é uma decisão, não acaso:** *primeiro corrigimos e limpamos as specs; depois adequamos o sistema ao que ficou escrito.* Adequar antes de escrever seria consertar contra um alvo que ainda se movia.

**Ponto de partida:** a base de specs está escrita e verdadeira, o `specs/plan/` foi esvaziado da Campanha 1, e o sistema tem uma dívida **inteiramente documentada e nenhuma paga**. A Campanha 1 mediu; a Campanha 2 conserta.

> ## 🔒 REGRA DE ESCOPO — o escopo da Campanha 1 está FECHADO
>
> Decisão do dono (2026-07-29): **nenhum achado é consertado na Campanha 1.** A Campanha 1 tem uma fronteira só — *escrever a base de specs* — e ela não cresce. Achado encontrado enquanto se escreve é **registrado e roteado para cá**, nunca resolvido de passagem.
>
> Isso vale inclusive para o achado mais grave da campanha (o `localStorage.clear()`), que hoje é **código inalcançável** — e é justamente essa inalcançabilidade que torna adiá-lo seguro.
>
> As três tarefas de código que ficaram na Campanha 1 (**P20-A**, **P26**, **P27**) estavam no plano **antes** dos achados e são pré-requisito do que vem depois: sem elas o kit documentaria uma superfície que ia mudar e a suíte não seria sinal confiável. Não são exceção à regra; são escopo original.

---

# Os 27 achados da Campanha 1 — e onde cada um entra

> **21 até a Fase 4.5; +6 na Fase 5** (P21/P22/P23, 2026-07-31). A tabela da Fase 5 está no fim
> desta seção.

Duas rodadas de auditoria produziram achados que **não são erros das specs**: são defeitos e ambiguidades do módulo, encontrados justamente porque alguém foi conferir no código em vez de copiar do material antigo. Todos estão registrados nos documentos e no `00-progresso.md`. **Nenhum foi corrigido.**

Esta é a rota oficial. Quem executar uma fase desta campanha **fecha os itens da sua linha**; o que não conseguir fechar vira DIVERGÊNCIA, nunca silêncio.

## Da Fase 2 (7 achados)

| Achado | Rota |
| --- | --- |
| `--sx-*` vivo em `_utilities.css:80,89` + `auditor_ghostvars` não varre `styles/` | **Fase B** |
| `upgradeThemePayload(partialMode)` — parâmetro morto | **Fase B** |
| `CustomizationPanel` sai **eager** do barril | **Fase C** |
| 3 das 4 categorias de `engines/` fora do barril | ✅ **P26** (Campanha 1 — escopo original) |
| `README.md` mandando instalar `pg` | ✅ **P24** (Campanha 1 — escopo original) |
| `atomic/Tables/` categoria sem componente | ✅ **fechado** por decisão D1 — fica como está |
| Local do `verify_parity.ts` | ✅ **fechado** — era imprecisão de relatório |

## Da Fase 4 (14 achados)

**Grupo 1 — Bugs de comportamento → Fase F** *(nova)*

| Achado | Gravidade |
| --- | --- |
| **`AdvancedTab.tsx:21` chama `localStorage.clear()`** — apaga a ORIGEM inteira do consumidor (token de sessão, preferências, tudo), não só as chaves da lib, e recarrega a página. O `confirm()` promete "configurações visuais". **Hoje é inalcançável** (o `AdvancedTab` é importado e nunca renderizado) | 🔴 **o único capaz de destruir dado de terceiro** |
| `isGlass` é ramo morto que renderizaria nav nenhuma — só é inalcançável porque `validateDesign` descarta o valor | 🟡 |
| `focusRingWidth` ignorado pela regra global de foco | 🟡 |
| Token de breakpoint move só 1 dos 3 caminhos de responsividade | 🟡 |
| `SarakTable` sem opt-out de colapso mobile (o `SarakDataTable` tem `responsive={false}`) | 🟡 inconsistência de API |

**Grupo 2 — Lacunas de gate → Fase B**

| Achado |
| --- |
| `src/shared/` **fora do escopo** do `auditor_coverage` (`:52-60`): 3 arquivos sem teste, incluindo `useSarakRouter` e `api.ts`. Gate verde, regra violada |
| **O gate anti-acoplamento de auth NÃO EXISTE** — `plan/20` o previu, se marcou concluída, e nenhum arquivo `AuthCoupling*` foi criado. *(É a prova mais limpa de por que esta campanha existiu: uma spec declarou um gate entregue e o gate nunca existiu.)* |
| Cobertura em % — `@vitest/coverage-v8` instalado e **nunca medido** |
| 5 sinks de `dangerouslySetInnerHTML`, não "uma exceção" — auditar se os 5 são legítimos (CSS gerado pela engine) ou se algum é vetor real |

**Grupo 3 — Pipeline e medição → Fase E**

| Achado |
| --- |
| `playwright.config.ts:7` aponta `testDir: './e2e'` — **a pasta não existe**; `playwright test` não acha nada. As specs E2E reais vivem em `src/**/__e2e__/` |
| Contraste **WCAG AA não é medido em lugar nenhum** — a lib não pode prometê-lo sem medir (axe-core na CI) |

**Grupo 4 — Já resolvidos pela própria reescrita** *(sem ação de código)*

| Achado | Por que fecha |
| --- | --- |
| "A lib nunca controla a URL" era falso (`useSarakRouter.ts:49,51` fazem `pushState`/`replaceState`) | a spec nova registra o comportamento real |
| Status falso na spec antiga de presets | a spec nova corrigiu |

## Da Fase 5 (6 achados — P21/P22/P23, 2026-07-31)

⚠️ **O P25 tem de transcrever esta seção junto das outras.** São 6 achados NOVOS; com eles a
campanha fecha em **27**, não 21.

| # | Achado | Rota |
| --- | --- | --- |
| 22 | 🔴 **`src/core/Provider/generated/design-token-ids.ts` DEFASADO em 105 tokens** (304 no tipo público × 409 no catálogo) — e o gerador `scripts/generate-token-types.ts` **não está em script nem hook nenhum**. Nenhum gate acusa: o `auditor_paridade` cruza schema × mapping × partições, e o tipo gerado **não é uma das três fontes**. Efeito colateral grave: o `sarak-ui/catalog.json` publica `designTokens.count = 304` ao consumidor, que é **falso**. Detalhe em `specs/specs/14-artefatos-do-mantenedor.md` §7.1 | **Fase B** — conserto em DUAS metades: regenerar **e** registrar o gerador num pipeline, senão apodrece de novo |
| 23 | **`sarak-ui/templates/` está fora de todo gate de conteúdo**: não está no plano de saída do `guide:check` (que confere 6 arquivos, nenhum deles template) e o `tsconfig` não o compila (`include: ['src']`). O `package:check` só cobra **presença de caminho**. Um template citando componente removido sai verde em tudo | **Fase B** (lacuna de gate) |
| 24 | **O `main.tsx` que todo consumidor novo recebe cita o `Sarak-MyService`** (`bin/scaffold/generators/mainTsx.mjs:37-40`), OBSOLETO por D6 e inacessível ao importador. Mesma classe dos 5 JSDoc do motor removido: comentário que viaja para o consumidor é documentação pública | **Fase B** (higiene de superfície) |
| 25 | **Ponteiro morto em `bin/scaffold/context.mjs:5-10`** — afirma que `templates/app-starter.manifest.json` "segue publicado (`SARAK_STARTER_MANIFEST`)". Medido: a pasta `templates/` **não existe** e o símbolo tem **0 ocorrências** fora do próprio comentário | **Fase B** |
| 26 | **Nenhum teste automatizado exercita um `install` de verdade.** As provas ponta a ponta de npm/pnpm/yarn foram feitas à mão, uma vez, e nenhum gate as repete. Idem para o `check --notify` no `predev` — o comando que mais executa na vida do importador é o menos coberto | **Fase A/E** (CI é o único lugar onde isso cabe) |
| 27 | **`chromeSlots` gerado conta 9 para as 8 regiões** documentadas: `topbarActions`, alias legado de `topbarEnd`, é prop opcional de `ReactNode` e o coletor captura por TIPO, não por semântica. Não é erro — é imprecisão de derivação | **Fase C** (sai junto do dedup do contrato público) |

## ⚠️ O acoplamento que muda a ordem de execução

**`localStorage.clear()` e "as 6 abas inalcançáveis" são o mesmo problema visto de dois lados.**

O `CustomizationPanel` importa 7 componentes de aba e renderiza **um** (`CustomizationPanel.tsx:3-9` × `:40`). Uma das abas mortas é justamente o `AdvancedTab`, que contém o `localStorage.clear()`.

Consequência: **"restaurar as abas" ATIVA a perda de dados.** A ordem é obrigatória e não é negociável:

1. **Primeiro** consertar o `clear()` para apagar só as chaves da lib (o `storageKey` do Provider).
2. **Depois** decidir se as abas voltam ou saem.

Decidir na ordem inversa é a única forma de transformar código morto em bug de produção.

---

---

## Fase 0 — Alinhamento do ERP *(decisão D14)* ⚠️ REPOSITÓRIO DE FORA

> **Roda ENTRE o P25 e a Fase A.** É a primeira coisa da Campanha 2, e a única que não toca a biblioteca.

**Problema.** O ERP é o **único consumidor real** e, por isso, o **instrumento de medição** desta campanha inteira — é nele que a Fase C vai provar que um `2.0.0` migra. A auditoria do P28 (2026-07-29/30) achou 8 defeitos estruturais nele, e o mais desconfortável é este: **a atualização da lib chegou aos 4 apps por acidente favorável** (*junction* manual), não porque o gerenciador a levou. Um instrumento que funciona por acidente não serve para validar mudança de contrato.

**Quem executa.** O dono disse que corrige direto (2026-07-30). Se um agente executar, vale o **mesmo protocolo do P28**: diagnóstico read-only → relatório em texto → aprovação → execução. Nada é escrito no ERP sem "sim".

### A ordem é obrigatória — o passo 2 derruba o install se o 1 não vier antes

**0.1 · Blindar o `_template`** *(faça primeiro)*
`Modulos/_template/web/package.json` tem `"name": "@erp/<modulo>-web"` — **placeholder literal**. Hoje é inofensivo porque `_template` está fora do workspace. Corrigir o 0.2 o coloca dentro, e um `name` com `<modulo>` **derruba o `pnpm install`**. Excluir do glob (`!Modulos/_template/*`) ou dar um nome válido.

**0.2 · O glob do workspace não casa com a pasta real** 🔴 *o item central*
`pnpm-workspace.yaml:6-7` declara `'modulos/*/web'` e `'modulos/*/api'`; a pasta é **`Modulos/`**. O NTFS é case-insensitive para abrir arquivo, mas o glob compara **string** — não casa.
Efeito: os 4 apps `web` e as `api` **não são projetos do workspace** (`pnpm ls -r` vê 5: raiz + 2 `adapters` + 2 `packages`); `--filter @erp/conector-web` → *"No projects matched"*.
⚠️ **Bomba de portabilidade:** os 5 scripts `dev:*-web`/`dev:conector-api` do root usam `--prefix modulos/...` minúsculo. Windows resolve; **Linux não**. Qualquer CI do ERP quebra no primeiro dia.
Corrigir isto **resolve 0.6 e 0.7 de tabela**.

**0.3 · `allowBuilds` com placeholder literal**
`pnpm-workspace.yaml:11-12`: `better-sqlite3: set this to true or false` e `esbuild: idem` — strings onde se espera booleano → **todo install termina `exit 1`** (`ERR_PNPM_IGNORED_BUILDS`). Efeito prático hoje é nulo (o binário do esbuild vem das `optionalDependencies`), e é exatamente por isso que é insidioso: **install que sempre sai vermelho treina a ignorar o vermelho.**

**0.4 · Convenção de nome de módulo**
`Contratos`/`Projetos`/`Propostas` capitalizados; `conector`/`_template` minúsculos. Escolher uma e aplicar — senão o 0.2 volta em outra forma.

**0.5 · `conector:build` e `conector:test` são provavelmente no-op**
Usam `turbo run … --filter=@erp/conector-*`, e o turbo lê o mesmo workspace do pnpm. Sem os apps como projetos (0.2), o filtro não casa nada e o comando **sai 0 sem rodar**. Vale para `npm run test` do root também.
*Inferência derivada do 0.2 — CONFIRMAR rodando e vendo quantos pacotes o turbo reporta.*

**0.6 · `sarak:check` existe e nunca dispara**
`packages/ui-kit/package.json:15`, com `|| true`, e nenhum `predev` o invoca. **Pior que não existir** — parece montado.
⚠️ Ao ligar: o `predev` do root já é ocupado (`matar-portas-dev.mjs`) — **encadear, não substituir**. O `|| true` pode sair (o `check` já é `exit 0` por contrato).
⚠️ **Sobreposição declarada:** a **Fase D** também mexe no ciclo de aviso, mas do lado da LIB (`sarak-ui update`). O fio no ERP é aqui; a Fase D revisita se o comando mudar. Fica registrado para não haver trabalho dobrado.

**0.7 · Junctions manuais como único elo**
`Modulos/*/web/node_modules/@erp/ui-kit` existe nos 4 — acoplamento **fora do gerenciador**. Foi o que fez a atualização do P28 chegar neles; e é o que pode ser apagado por um install que recrie `node_modules`, sem nada acusar até um build falhar. **Corrigir 0.2 elimina a necessidade** (o pnpm passa a linkar sozinho).

**0.8 · O ADR 009 do ERP nunca foi superado**
Ele registra a **remoção** do Sarak; o Sarak foi **reintroduzido** como `packages/ui-kit` (Teste Real / Spec 40) e o ADR novo ficou como *"follow-up do dono, não gate"* — nunca feito. É um ADR vigente que descreve o oposto do código: o mesmo defeito que esta campanha passou seis fases corrigindo do lado da lib. ADR é imutável — cria-se um novo com `substitui`/`substituido_por` e o 009 vira `🔴 Substituído`.

### Fora de escopo desta fase — registrado para não confundir

- **`file:` exigir `pnpm install --force` após cada rebuild** não é defeito: é o preço da escolha deliberada da **D13**, e desaparece quando o ERP migrar para `github:…#semver:^1.x`. **Não "consertar".**
- **`pnpm` não invocável** é da **máquina**, não do ERP: `corepack enable pnpm` falha com `EPERM` em `Program Files`. Hoje o caminho é `corepack pnpm <args>`; definitivo é terminal elevado ou `corepack enable --install-directory <pasta já no seu PATH>`.

**Ordem sugerida:** `0.1 → 0.2 → 0.3 → 0.5 → 0.6 → 0.4 → 0.8`. Os dois primeiros provavelmente resolvem três problemas com uma edição.

**Spec a criar:** nenhuma **nesta** base — os oito itens são do repositório do ERP. Do lado da lib, só a atualização do bloco "📌 Fatos do ERP" e da **D13**, quando 0.2/0.7 mudarem a topologia.
**Aceite:** `pnpm install` sai **0**; `pnpm ls -r` lista os 4 apps `web`; `--filter @erp/conector-web` casa; os builds funcionam **sem** junction manual; e `npm run sarak:check` dispara sozinho num `npm run dev`.

---

## Fase A — Integração contínua *(decisão D9)*

**Problema.** Duas vezes nesta campanha um "verde" foi falso por causa da máquina: um `package-lock.json` solto no `$HOME` derrubava um teste (§3.1), e um `node_modules/` não versionado fazia 6 arquivos de um projeto alheio passarem (§3.2). Nenhum gate local pega essa classe — por definição, o ambiente local é o problema. **`.github/` não existe** neste repositório.

**Escopo.** Rodar num ambiente limpo o que não cabe em hook: suíte completa, `npm run build`, `package:check`, e o `run_audit` comparado ao baseline versionado. Cobrar quem usou `--no-verify` — hoje esse escape é invisível.

**Spec a criar:** `specs/specs/15-integracao-continua.md`.
**Também atualiza:** `02-enforcement-por-commit.md` (a §9 "opção em aberto" morre) e `01-gates-e-baseline.md` (onde cada gate roda).
**Aceite:** um PR com teste quebrado é reprovado pela automação, não pela memória de alguém; e a suíte roda num `$HOME` que não é o do dono.

---

## Fase B — Quitação do baseline de auditoria

**Problema.** `run_audit` não está em zero, e **nenhuma tarefa da Campanha 1 conserta isso** — ela documentou a dívida com precisão e não agendou pagamento. Baseline permanente deixa de ser dívida e vira norma.

**Escopo, item a item** (o detalhe com `arquivo:linha` está em `01-gates-e-baseline.md`):
- `--sx-*` vivo em `_utilities.css:80` e `:89` **+ ampliar o escopo do `auditor_ghostvars` para `src/styles/`** — as duas metades juntas, senão o conserto de um lado não é cobrado pelo outro. ⚠️ Ao ampliar o escopo, **ampliar o registro junto**: o auditor não lê `useDesignVariables.ts`, e escopo maior sem registro maior produz **acusação falsa** (§4.3.c).
- `--sarak-button-radius` → o token real é `--sarak-btn-border-radius` (erro de grafia).
- `--sarak-shell-brand-logo-size` → não existe token nenhum: é **Expansão** (criar nas 3 fontes), não renomeação.
- `--token` → **NÃO corrigir.** É falso positivo dentro de um JSDoc; trocar a grafia do comentário baixaria o número sem consertar nada. É maquiagem, e a §6 a proíbe por escrito.
- `SarakTypography.tsx:39` → fallback negativo; a convenção é `calc(var(--token, <positivo>) * -1)`.
- **`tsc`: os 4 erros de PRODUÇÃO** (`useStructuralStyles.ts:30,71,94` — `ResponsiveValue<number>` recusado por um helper que só aceita `string|number`; `ThemeCustomizationTab.tsx:86` — união de tipo de toast). Os 10 de teste entram depois.
- `upgradeThemePayload(partialMode)` — parâmetro morto.
- **Os 7 ids de token duplicados**, no schema **e** no roteamento de persistência — 4 em duas colunas diferentes (ambiguidade real) e 3 repetidos na mesma coluna (redundância literal). São dois defeitos sob o mesmo sintoma; consertar muda **qual definição vence** em `getDefaultDesignState()`, então exige caracterização antes.

**Escopo adicional — as LACUNAS DE GATE achadas na Fase 4** (grupo 2 da tabela acima). São diferentes dos itens acima: ali o gate acusa e ninguém consertou; aqui **o gate não acusa**, e é o gate que precisa mudar.
- **`src/shared/` fora do escopo do `auditor_coverage`** (`:52-60` varre só `components`/`features`/`core`): 3 arquivos sem teste, incluindo `useSarakRouter` e `api.ts`. Ampliar o escopo **e** escrever os testes que faltam — ampliar sem cobrir só troca verde por vermelho.
- **Criar o gate anti-acoplamento de auth**, ou registrar por escrito que ele não vai existir. `plan/20` o declarou entregue e ele nunca foi criado; a spec nova já registra o fato, mas a decisão de construí-lo continua aberta.
- **Medir cobertura em %** — `@vitest/coverage-v8` está instalado e nunca foi usado. Ou se mede e se declara o piso, ou se remove a dependência e se para de prometer.
- **Auditar os 5 sinks de `dangerouslySetInnerHTML`** (`DesignScope:54`, `DesignInjector:173`, `SovereignThemeInjector:116`, `PreviewCanvas:181`, `MasterControlPanel:199`) — confirmar um por um que é CSS gerado pela engine, e não conteúdo que atravessa fronteira. Onde for legítimo, o motivo fica escrito ao lado.

**Spec a criar:** nenhuma. Atualiza `01-gates-e-baseline.md` (o baseline encolhe), `11-testes-e-cobertura.md` (escopo de cobertura e o piso em %), `10-seguranca-e-acessibilidade.md` (os 5 sinks auditados) e `.githooks/audit-baseline.json` — via `npm run audit:baseline -- --write`, **junto do conserto que o justificou**, nunca sozinho.
**Aceite:** cada item fechado com o baseline regravado no mesmo commit; e o `--token` continua no baseline, com o motivo escrito.

---

## Fase C — Limpeza do contrato público → `2.0.0` *(decisão D12)*

**Problema.** Três quebras de contrato estão paradas porque cada uma, sozinha, custaria uma migração ao consumidor.

**Escopo — as três saem juntas, num único major:**
- **`CustomizationPanel` lazy.** Hoje sai *eager* do barril (`src/index.ts:50`) e ainda é importado eager pelo efeito colateral de `:119-125` — é o painel inteiro do Design Engine no caminho crítico de todo consumidor. Tornar lazy muda o tipo público para `LazyExoticComponent`.
- **Dedup do `SarakTabs`.** Dois componentes, mesmo nome, APIs incompatíveis (`items`/`defaultActiveId` × `tabs`/`activeTab`/`onChange`). Exige decidir qual API sobrevive.
- **Os 2 ids legados do Discovery** (`mx-customization`, `personalization`), registrados por efeito colateral de import: manter ou remover.

**Specs:** atualiza `arquitetura/03-superficie-publica.md` (as três dívidas da §8 morrem) e **exige uma entrada única em `docs/migracoes.md`** cobrindo as três, com antes/depois e como migrar. Avalie se a decisão de API do `SarakTabs` merece **ADR** — se sobreviver uma e morrer outra, sim.
**Aceite:** `npm version major` → `2.0.0` com uma nota de migração só; e o consumidor atravessa o major uma vez, não três.
⚠️ **Revalidação do ERP é OBRIGATÓRIA aqui** (decisão D13) — é a única fase da Campanha 2 que quebra contrato público de propósito, e o ERP é o único consumidor real. Reuse o protocolo do **P28**: diagnóstico read-only → relatório em texto → aprovação do dono → execução. Um major que não foi provado no consumidor real é um major que ninguém sabe se migra.

---

## Fase D — Ciclo de atualização do consumidor *(decisão D11)*

**Problema.** O consumidor é avisado de que há versão nova (`sarak-ui check`, desde a Spec 51/ADR-008), mas não tem comando para agir. Dentro da faixa ele descobre sozinho que é `npm update`; **atravessar um major** exige editar o `package.json` à mão, sem ninguém dizer o que quebra.

**Escopo:**
- `sarak-ui update` — atualiza **dentro da faixa**, com o comando do gerenciador detectado. ⚠️ Regra da Spec 51: **comando não executado de verdade não entra.**
- `sarak-ui update --latest` — **ATRAVESSA o major**: mostra quantos majors pula, imprime as entradas de `docs/migracoes.md` **entre a versão instalada e a nova**, pede confirmação e só então reescreve a faixa no `package.json`. O caminho seguro é um comando; o caminho que quebra é um comando **com o que quebra na tela**.
- **Corrigir o filtro de faixa** (`tagComparison.mjs:54-59`): hoje lê só o MAJOR, então `~1.2.0` é tratado como `^1.2.0` e o consumidor recebe aviso de um `v1.9.0` que o `npm update` nunca vai lhe dar — aviso permanente, exatamente o ruído que a Spec 51 combate. Capturar o minor e filtrar por major+minor quando a faixa for `~`. Corrigir também o rótulo que imprime `(^N)` para quem escreveu `~`.

**Specs:** atualiza `13-instalacao-e-atualizacao.md` (criada no P22) e o `sarak-ui/GUIA-FRONTEND.md` §2.7.
**Aceite:** provado num consumidor real de cada gerenciador — dentro da faixa e atravessando um major, com a nota de migração aparecendo antes da confirmação.

---

## Fase E — E2E no pipeline

**Problema.** Playwright CT está instalado (`npm run test-ct`) e existem specs em `src/core/Provider/__e2e__/` e `src/features/DesignEngine/__e2e__/` — **nada disso roda em automação nenhuma**, e algumas exigem `npm run build` antes. A Campanha 1 registrou como lacuna; ninguém fechou.

**Escopo.** Levar E2E para a CI da Fase A (é o único lugar onde o `build` prévio não atrapalha, porque lá a árvore é descartável). Definir quais jornadas são bloqueantes e quais são informativas.

**Escopo adicional — os achados da Fase 4** (grupo 3 da tabela acima):
- **`playwright.config.ts:7` aponta `testDir: './e2e'` e a pasta NÃO EXISTE.** As specs E2E reais vivem em `src/**/__e2e__/`. Hoje `playwright test` sai verde sem rodar nada — **o pior tipo de verde**, porque é indistinguível de sucesso. Corrigir o `testDir` é a primeira linha desta fase, antes de qualquer jornada nova.
- **Contraste WCAG AA não é medido em lugar nenhum.** A spec de segurança e acessibilidade registra o contrato; nada o verifica. Ou entra medição real (axe-core na CI, sobre o conjunto atômico) ou a promessa de nível AA sai do texto. **A lib não pode prometer o que não mede** — e prometer sem medir é a mesma classe de defeito do gate de auth que nunca existiu.

**Spec:** atualiza `11-testes-e-cobertura.md` (a lacuna vira cobertura), `10-seguranca-e-acessibilidade.md` (o contrato de a11y passa a ter verificação) e `15-integracao-continua.md`.
**Aceite:** o não-vazamento do modo embarcado — hoje só verificável à mão — passa a ser cobrado a cada PR; e `playwright test` deixa de sair verde sem executar nada.
**Depende de:** Fase A.

---

## Fase F — Achados de comportamento *(nova; grupo 1 da tabela de achados)*

**Problema.** Cinco defeitos de comportamento que nenhum gate vê, achados ao escrever as specs da Fase 4. Nenhum deles é falha de documentação — são o código fazendo coisa diferente do que promete.

**Escopo, em ordem obrigatória:**

**F1 · `localStorage.clear()` — PRIMEIRO, e sozinho.**
`AdvancedTab.tsx:21` apaga a **origem inteira** do consumidor e recarrega a página, enquanto o `confirm()` promete "TODAS as configurações visuais". Token de sessão, preferências, carrinho — tudo o que o importador guardou naquela origem. Conserto: remover **apenas as chaves da lib** (o `storageKey` do Provider), e alinhar o texto do `confirm()` ao que de fato acontece.
Hoje é **inalcançável** — o `AdvancedTab` é importado (`CustomizationPanel.tsx:7`) e nunca renderizado. É por isso que adiar foi seguro; é por isso também que **não pode ser adiado mais uma vez** sem antes fechar F2.

**F2 · As 6 abas inalcançáveis — decisão do dono, DEPOIS de F1.**
O `CustomizationPanel` importa 7 abas e renderiza 1 (`:3-9` × `:40`). As outras 6 estão no bundle e fora de alcance. Restaurar a navegação **ativa** o `clear()` — daí a ordem. As opções: restaurar a navegação (depois de F1), ou remover os imports mortos (menos bundle, menos superfície).

**F3 · `isGlass` é ramo morto** que renderizaria nav nenhuma. Só é inalcançável porque `validateDesign` descarta o valor — ou seja, está protegido **por acidente**, não por desenho. Ou o ramo passa a funcionar, ou sai.

**F4 · `focusRingWidth` ignorado** pela regra global de foco. Token que existe, é validado, e não move nada — é um `--sx-*` com outra roupa: promessa sem emissor.

**F5 · Token de breakpoint move só 1 dos 3 caminhos** de responsividade. Trocar o token não muda o comportamento nos outros dois, o que quebra a promessa "breakpoints são tokens do tema" do contrato de responsividade.

**F6 · `SarakTable` sem opt-out de colapso mobile**, enquanto o `SarakDataTable` tem `responsive={false}`. Inconsistência de API entre dois componentes irmãos.

**Spec:** nenhuma nova. Atualiza `06-painel-de-customizacao-e-preview.md` (F1/F2), `07-responsividade-e-multidispositivo.md` (F5/F6), `04-shell-e-discovery.md` (F3) e `00-regras-e-invariantes.md` se F4 virar regra de token sem consumidor. **F1 e F6 exigem entrada em `docs/migracoes.md`** (mudam comportamento observável).
**Aceite:** F1 com teste que prova que uma chave alheia sobrevive ao reset; F5 com teste nos três caminhos; e cada item com o gate que passaria a pegá-lo, ou a declaração de que nenhum pega.

---

## Ordem sugerida e o porquê

```
0 (ERP)  →  A (CI)  →  B (baseline)  →  F (comportamento)  →  C (2.0.0)  →  D (update)  →  E (E2E)
```

**0 antes de tudo** porque o ERP é o **instrumento de medição** desta campanha — é nele que a Fase C vai provar que um `2.0.0` migra de verdade. Hoje esse instrumento funciona por acidente (junction manual) e grita vermelho a cada install. Validar quebra de contrato contra um consumidor assim é evidência fraca. E é a única fase que não toca a biblioteca, então não compete com nada.

**A primeiro** porque é o único item que torna todos os outros verificáveis: sem ambiente limpo, cada conserto continua sendo validado na máquina que já provou duas vezes que mente. **B antes de F** porque consertar comportamento com a auditoria vermelha impede distinguir regressão nova de dívida velha. **F antes de C** porque `F1` (o `localStorage.clear()`) e `F2` (as abas) são pré-requisito de qualquer decisão sobre o painel, e a Fase C mexe justamente no `CustomizationPanel`. **C depois de B e F** porque quebrar contrato com auditoria vermelha e comportamento duvidoso mistura três fontes de risco no mesmo release. **E por último** porque depende de A e é a única que pode esperar sem custo.

> **Se você só puder fazer duas fases:** **A** (para os números pararem de mentir) e **F1** (o único achado da campanha inteira capaz de destruir dado de terceiro).

---

# APÊNDICE — Estado final esperado da base

Ao fim da campanha, `specs/` fica assim:

```
specs/
├── INDEX.md                    # mapa das 4 categorias (reescrito em P0, finalizado em P25)
├── README.md                   # como usar o diretório (reescrito em P0)
├── _templates/                 # intocado
├── adr/                        # 7 ADRs + README  (imutáveis)
│   ├── 001-tres-arquiteturas.md
│   ├── 002-remocao-motor-manifesto.md
│   ├── 003-remocao-backend-proprio.md
│   ├── 004-remocao-design-agent.md
│   ├── 005-modelo-modulos-plugin-e-apps-separados.md
│   ├── 006-zero-marca-soberania-host.md
│   └── 007-distribuicao-por-git.md
├── arquitetura/                # 6 documentos macro  (vivos)
│   ├── 00-mapa-do-modulo.md
│   ├── 01-forma-do-produto-e-modos-de-consumo.md
│   ├── 02-design-engine.md
│   ├── 03-superficie-publica.md
│   ├── 04-contrato-de-tokens-e-paridade.md
│   └── 05-build-e-distribuicao.md
├── specs/                      # 15 specs definitivas  (vivas)
│   ├── 00-regras-e-invariantes.md
│   ├── 01-gates-e-baseline.md
│   ├── 02-enforcement-por-commit.md
│   ├── 03-versionamento-e-release.md
│   ├── 04-shell-e-discovery.md
│   ├── 05-cromo-e-slots.md
│   ├── 06-painel-de-customizacao-e-preview.md
│   ├── 07-responsividade-e-multidispositivo.md
│   ├── 08-identidade-do-host-e-zero-marca.md
│   ├── 09-temas-e-presets.md
│   ├── 10-seguranca-e-acessibilidade.md
│   ├── 11-testes-e-cobertura.md
│   ├── 12-kit-do-consumidor.md
│   ├── 13-instalacao-e-atualizacao.md
│   └── 14-artefatos-do-mantenedor.md
└── plan/                       # VAZIO
```

E, fora de `specs/`, a campanha deixa três capacidades novas:
- **`.githooks/pre-commit` estendido** — o pipeline de validação a cada commit (P11).
- **`version: 1.0.0`** propagada da fonte única para todos os derivados (P12).
- **`sarak-dev/` + `dev-kit:check`** — o kit do mantenedor, dinâmico como o do consumidor (P23).
