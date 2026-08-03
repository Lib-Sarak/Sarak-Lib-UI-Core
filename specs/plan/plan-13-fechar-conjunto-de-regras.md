---
tipo: "plan"
titulo: "Fechar o conjunto de regras — tudo que se cobra aqui vira regra numerada"
dominio: "Sarak-Lib-UI-Core / Governança / Regras"
status: "🟢 Aprovada"
prioridade: "Máxima"
tags: ["plan", "regras", "contrato", "gates", "conduta"]
relacionados: ["[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]", "[[02-enforcement-por-commit]]", "[[15-divida-conhecida]]"]
depende_de: ""
destino_sintese: "specs/00-regras-e-invariantes.md"
---

> **Plan de documentação — executada pelo REVISOR.** Só toca `specs/`, e o executor tem proibição explícita de
> criar ou editar spec ([[00-prompt-executor]] §7.3). Desvio previsto em `00-contexto` §5.
>
> 🔒 **NENHUM GATE É CRIADO AQUI.** Esta plan escreve regra. Construir a verificação é a `plan-12`, e é a ordem
> que o dono fixou em 2026-08-01: *"devemos ter todas as regras formadas, para então criar a verificação"*.

# 1. Objetivo

O `00-regras-e-invariantes.md` passa a conter **tudo que este repositório cobra** — as 13 regras que hoje são
cobradas por gate ou teste **sem estar escritas em lugar nenhum** ganham número, e as 3 que dependem de olho
humano ficam separadas numa categoria própria, em vez de misturadas com as verificáveis.

# 2. Contexto

O levantamento de 2026-08-02 (feito no código: `package.json`, `.githooks/`, `scripts/`, os testes-gate) achou
o inverso do problema que se caçava:

- **17 regras escritas.** Dessas, **4 sem verificação nenhuma**, **5 com gate mais estreito que a própria
  regra** e **2 cobertas só por teste**.
- **13 regras vivas e NÃO escritas.** Cinco delas **já têm gate rodando hoje** — `package:check`,
  `audit:baseline`, `check-release-tag`, o Anel 0 de segredos e o `dev-kit:check`. Ou seja: **o repositório
  bloqueia commit e push por regras que não estão no contrato.**

O `check-release-tag` é o exemplo que dói: ele barrou um push do dono em 2026-08-02 imprimindo *"Regra
violada"* — e a regra que ele cobra não existe na spec. Um gate que reprova citando uma regra inexistente é
tão ruim quanto uma regra sem gate: nos dois casos o leitor não consegue chegar do bloqueio ao contrato.

**Decisões do dono (2026-08-02), que esta plan aplica:**

1. **O que é conduta fica numa categoria "regras de conduta"**, separada.
2. **O que dá para verificar por script tem gate** — construído depois, na `plan-12`, e integrado ao CI/CD.
3. As 13 não escritas **viram regra numerada** — inclusive `tsc` verde, que **nasce violada** (14 erros), e os
   dois contratos com o consumidor (deep import · contrato de saída do CLI).

# 3. Escopo

## 3.1 Dentro
- `specs/specs/00-regras-e-invariantes.md` — reestruturação em duas categorias + as 13 regras novas
- `specs/specs/01-gates-e-baseline.md` — a coluna "Cobrada por" reconciliada com a numeração nova
- `specs/00-indice.md` — o estado desta plan e o da `plan-06` (§7 abaixo)

## 3.2 Fora
- ⛔ **Criar, ampliar ou alterar qualquer gate.** Nem um. Isso é a `plan-12`.
- ⛔ **Renumerar regra existente.** `R14` é `R14` para sempre — o `.githooks/pre-commit:68-71` imprime os
  números na mensagem de bloqueio, e há citação em skills, specs e no próprio código. **Numeração é
  identidade**, exatamente como a das plans.
- ⛔ Corrigir qualquer violação que a regra nova revele. Regra nasce descrevendo o que **é**.
- ⛔ `src/`, `scripts/`, `bin/`, `.githooks/`.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/00-regras-e-invariantes.md` | o alvo — e o formato de 4 partes da §1.1, que as regras novas seguem |
| Spec fixa | `specs/01-gates-e-baseline.md` | o que cada gate garante e o baseline real |
| Spec fixa | `specs/02-enforcement-por-commit.md` | os anéis; é onde R20/R21/R22 já vivem como comportamento |
| Spec fixa | `specs/15-divida-conhecida.md` §4 | os 5 gates ausentes + 4 ampliações — insumo da `plan-12`, não desta |
| Código | `scripts/check-*.mjs` · `.githooks/*` · os testes-gate | **a fonte**: a regra se escreve a partir do que o script cobra, não do contrário |

# 5. A numeração decidida

**Numeração preservada; as novas entram a partir de R18.** Total: **32 regras — 29 verificáveis, 3 de conduta.**

## 5.1 As 3 regras de conduta — categoria própria

Saem da lista principal e entram numa seção `# Regras de conduta`, com a razão de **cada uma** não ter gate.
**Decisão do dono (2026-08-02): estas três são conduta e não entram em gate.**

| # | Regra | Por que não tem gate |
|---|---|---|
| R11 | Configuração × Expansão | O sintoma é indireto (aparece como R2). Não há como um script saber a **intenção** da mudança |
| R15 | Nada pesado sai eager do barril | Exigiria medir bundle no pipeline. **Violada hoje de forma declarada** (`CustomizationPanel`) |
| R16 | Zero-gambiarra no consumidor | Por definição, o gate teria de rodar **no repositório do consumidor** |

> **R10 saiu da conduta** *(decisão do dono, 2026-08-02)*: um detector de `<button>`/`<input>`/`<select>` cru em
> `.tsx` é determinístico e barato. Ela passa a **⏳**, e o gate é trabalho da `plan-12`.

## 5.2 As 15 regras novas — R18 a R32

| # | Enunciado (uma linha) | Verificação hoje | O que a plan-12 fará |
|---|---|---|---|
| **R18** | **Todo gate declara o que NÃO vê** — escopo e exclusões escritos no código do gate; ampliar escopo sem ampliar o registro é regressão | nenhuma | **gate novo** — varrer os scripts de gate por bloco de limites declarado |
| **R19** | O tarball leva só o publicável: **`src/` e config de teste nunca**, e tudo que o `init` precisa ler | ✅ `package:check` | já existe — só nomear |
| **R20** | O baseline de auditoria **não regride** | ✅ `audit:baseline` (Anel 2) | já existe — só nomear |
| **R21** | Mudou o artefato publicado (`dist/` + `sarak-ui/`) → **exige tag nova** | ✅ `check-release-tag.mjs` (pre-push) | já existe — só nomear |
| **R22** | **Zero segredo** no que vai para o commit | ✅ Anel 0 (`verificar_commit.py`) | já existe — só nomear |
| **R23** | **Zero ponteiro morto** na documentação gerada (caminho, `npm run`, comando) | ✅ `dev-kit:check` | **ampliar** — hoje só varre `sarak-dev/`; falta `§N.N` (achado 29) |
| **R24** | O CSS da lib **não vaza no host** em modo embarcado (preflight e regra de elemento escopados) | 🧪 `scopeCss.test.ts` | nomear o teste como gate da regra |
| **R25** | Os temas shippados **bootam sem ruído de console** | 🧪 `shippedThemesConsoleClean.test.ts` | idem |
| **R26** | **Paridade nome ↔ catálogo de ícones** | 🧪 `iconCatalogParity` · `iconContract` | idem |
| **R27** | O consumidor **nunca precisa de deep import** — a superfície é o barril e o campo `exports` | 📄 contrato (`arquitetura/03` §2) | **gate novo** |
| **R28** | **Contrato de saída do CLI:** `check --notify` sai sempre **0**; o modo normal sai **1** se defasado | 📄 contrato (`specs/13` §5.1) | **gate novo** — custou uma rodada na plan-04 por não existir |
| **R29** | **Todo artefato gerado bate com a fonte** | ⚠️ 3 de 5 (`catalog`, `guide`, `dev-kit`) | **ampliar** — falta `design-token-ids.ts` (105 tokens de deriva) e `manifest.ts` |
| **R30** | **O TypeScript compila** (`tsc --noEmit` limpo) | ❌ **14 erros, 4 em produção** | **gate novo — NASCE VIOLADA**, com baseline declarado |
| **R31** | **Contraste AA nos 18 temas shippados** — sem promessa para tema do consumidor | ❌ **0 cálculos** de contraste em `src/` | **gate novo** — ver §7.1; pode nascer vermelho |
| **R32** | **A lib é indiferente ao sistema de autenticação** — constrói a tela, entrega o evento | 📄 prática, não escrita | **gate novo** — ver §7.2; **1 violação, roteada à plan-09** |

> ⚠️ **R30 nasce vermelha, e isso é deliberado** *(decisão do dono, 2026-08-02)*. Escrevê-la como regra é o que
> transforma 14 erros de "coisa que a gente sabe" em dívida com dono e prazo. A plan-12 decide se o gate entra
> com baseline (como o `audit:baseline`) ou só depois da quitação.

## 5.3 O que muda nas 17 existentes

**Nenhum enunciado é reescrito.** Só a coluna "Cobrada por" é reconciliada, e os 5 vãos conhecidos passam a
estar declarados na própria linha da regra, não só numa nota de rodapé:

| # | O que se acrescenta |
|---|---|
| R4 | O **tipo gerado não é uma das 3 fontes** — a deriva de 105 tokens vive nesse vão (vira alvo de R29) |
| R5 | Ganha **segundo gate**: `verify_theme_parity.ts`, que existe e **nada invoca** (completude por tema) |
| R6 | Gate nomeado: `tokenContractParity.test.ts` — deixa de ser "só teste" |
| R7 | O gate **não vê `src/styles/`**, e a regra está sendo violada lá (2 usos de `--sx-*`) |
| R8 | O gate **não vê `src/shared/`** |
| R13 | Gates nomeados: `HostIdentity.test.tsx` · `EmbeddedMode.test.tsx` |
| R14 | O gate **não vê subpasta de categoria** |
| R17 | Cobre **só artefato gerado**; a metade "prosa manual" fica declarada como não coberta |

# 6. Instruções de execução

1. **Reestruturar `00-regras-e-invariantes.md` em duas categorias:** `# 2. Regras verificáveis` (26) e
   `# 3. Regras de conduta` (4). Manter a numeração; mover R10, R11, R15 e R16 para a segunda, **cada uma com o
   motivo de não ter gate escrito na própria linha**.
2. **Escrever R18–R30** no formato de 4 partes da §1.1 (enunciado · por quê · certo × errado · cobrada por).
   O "por quê" de cada uma sai do **dano real já registrado** — não invente justificativa.
3. **Para cada regra nova cujo gate já existe (R19–R23), ler o script antes de escrever** e descrever o que ele
   **de fato** cobra, com `arquivo:linha`. Regra escrita a partir do que se imagina que o gate faz é como esta
   base chegou aqui.
4. **Reconciliar o mapa regra → gate** (§3 da spec) e a §3.1 (validador × executor) com a numeração nova.
5. **Marcar, em cada regra, o estado da verificação** com um vocabulário fixo: ✅ *gate pleno* · ⚠️ *gate com
   escopo menor que a regra* · ⏳ *gate a construir (plan-12)* · 🔴 *conduta*.
6. **Atualizar `01-gates-e-baseline.md`** para que cada gate cite o número da regra que cobra — é o caminho de
   volta que o `check-release-tag` não tinha quando bloqueou o push.
7. **Não corrigir nada.** Regra nova que nasce violada (R30, R7, R15) é declarada violada.

# 7. As quatro pendências — TODAS decididas em 2026-08-02

Nada aqui fica em aberto para o executor. As quatro perguntas de regra que vinham da triagem (`plan-03`) foram
respondidas pelo dono e **entram na spec já decididas**:

| Pergunta | Decisão |
|---|---|
| R10 vira verificável? | **Sim.** Sai da conduta, vira ⏳ (§5.1) |
| A lib promete WCAG AA? | **Caminho do meio → R31** (§7.1) |
| Acoplamento de auth vira regra? | **Sim → R32** (§7.2) |
| Cobertura em % vira gate? | **Sim**, com **piso móvel** (§7.3) |

## 7.1 R31 — Contraste AA nos temas de referência

**Enunciado.** Os **18 temas shippados** garantem contraste **WCAG AA** (4,5:1 texto normal · 3:1 texto grande)
nos pares texto/fundo que produzem. A lib **não promete AA** para tema escrito pelo consumidor.

**Por quê.** A `specs/10` §2.4d já registrava metade disto: *"o tema é dado do consumidor; prometer AA exigiria
a lib recusar valores dele, o que contradiz o contrato de tema"*. Está certo — e não cobre os 18 temas que **são
da lib**, entregues como ponto de partida. O item 5.2 daquela spec admite: *"a lib não sabe dizer se os 18
passam AA"*. R31 fecha essa metade, e só ela.

**Estado.** ⏳ — há **0 cálculos de razão de contraste** em `src/`. O `useMediaLuminance.ts` mede luminância de
mídia para escolher cor de texto; **não é** contraste WCAG. O gate é da `plan-12`, e **pode nascer vermelho**:
ninguém mediu os 18.

## 7.2 R32 — A lib é indiferente ao sistema de autenticação

**Enunciado.** A lib **constrói a tela** de autenticação e **entrega o evento**. Nenhum componente lê ou escreve
credencial, token ou sessão, e **nenhum impõe rota, verbo ou payload de autenticação** ao importador.

**Por quê.** O achado 14 procurava um gate `AuthCoupling` que **nunca existiu** (0 arquivos). Medindo o código
em 2026-08-02, a regra já era a prática — `shared/services/api.ts:7-13` diz em voz alta *"a Sarak NUNCA lê nem
escreve token de autenticação"*, e o `SarakAuthScreen` só emite `onSubmit`. **Com uma exceção**, ver abaixo.

**O gate não pode ser burro.** Proibir `fetch`/`axios` em `src/components/` derrubaria **12 arquivos legítimos**:
os templates de dados (`SarakTable`, `SarakChart`, `SarakForm`, `SarakManagementGrid`, …) recebem um `endpoint`
e são **agnósticos** sobre o que existe atrás dele. O que se cobra é outra coisa: **sinks de credencial**
(`localStorage`/`sessionStorage`/`cookie`/`Authorization`) e **rota de autenticação embutida**
(`/mfa`, `/login`, `/oauth`, `/token`).

> 🔴 **R32 nasce com uma violação, e ela já tem destino.** `useSecurityOrchestratorState.ts:22-68` chama
> `GET {endpoint}/mfa/status`, `/mfa/setup`, `POST /mfa/enable` e `/mfa/disable`: a lib **dita o protocolo de
> autenticação do importador**. O `SarakSecurityOrchestrator` é **público** (`Templates/index.ts:14` →
> `src/index.ts:98`), então remover é quebra de contrato. **Decisão do dono (2026-08-02): remover** — e o lugar
> é a `plan-09`, no major. Aqui só se escreve a regra.

## 7.3 R8 ganha segundo gate — cobertura em %, com piso móvel

`@vitest/coverage-v8` está em `package.json:100` e **nenhum script o invoca**. Vira gate, pelo mesmo mecanismo
do `audit:baseline`: **mede agora, grava como piso, e o piso só sobe.** Cobertura que cai reprova; cobertura que
sobe regrava o piso.

**Por que piso móvel e não alvo fixo.** Um teto arbitrário (80%) reprova no primeiro dia e ensina a ignorar o
vermelho — que é exatamente o defeito que o `allowBuilds` com placeholder causou no ERP. O 1:1 do R8 continua
sendo a regra principal; o % é a segunda rede, e mede outra coisa: **o quanto** de cada arquivo o teste cobre.

# 8. Critérios de aceite

- [ ] `00-regras-e-invariantes.md` com **duas categorias** e **32 regras** — 29 verificáveis, 3 de conduta.
- [ ] R18–R30 escritas no formato de 4 partes, cada uma com "cobrada por" **verdadeiro** (gate real, teste real,
      ou ⏳ declarado).
- [ ] **Nenhuma regra existente renumerada.** `grep -c "^## R" ` bate com a soma, e R1–R17 mantêm o número.
- [ ] Cada uma das 3 regras de conduta traz **o motivo de não ter gate** na própria linha.
- [ ] Os 5 vãos de escopo (R4, R7, R8, R14, R17) declarados **na linha da regra**, não só em nota.
- [ ] `01-gates-e-baseline.md`: todo gate cita o número da regra que cobra.
- [ ] **Zero gate criado, ampliado ou alterado** nesta execução.
- [ ] R31 e R32 escritas; as 4 decisões da §7 refletidas na spec (R10 fora da conduta, piso móvel em R8).

# 9. Como verificar

- `grep -c "^## R" specs/specs/00-regras-e-invariantes.md` → **32**
- `grep -nE "^## R(11|15|16)" ` → as três dentro da seção `Regras de conduta`; **R10 fora dela**
- `grep -nE "^## R(1|2|3|4|5|6|7|8|9|12|13|14|17) " ` → números preservados, enunciados inalterados
- Para cada R19–R23: abrir o script citado e confirmar que a regra descreve o que ele cobra
- `git diff --stat` → **só** `specs/` — nenhum `src/`, `scripts/`, `.githooks/`
- `npm run audit` → baseline inalterado (nada de código foi tocado)

# 10. Destino da síntese

**Destino:** `specs/00-regras-e-invariantes.md`

A plan **é** a síntese: o conteúdo nasce direto na spec fixa, como foi na `plan-03`. O que sobra para depois é a
`plan-12`, que consome a coluna ⏳ desta spec como lista de trabalho.

---

# 11. Resumo da execução

<!-- Preenchido pelo EXECUTOR (aqui: o revisor). Append-only. -->

## Resumo da execução — 2026-08-02

**Resultado:** Concluído

**O que foi feito**

- `specs/specs/00-regras-e-invariantes.md` reestruturado em **duas categorias**: `# 2. Regras verificáveis`
  (29) e `# 3. Regras de conduta` (3) — antes havia uma seção única `# 2. As regras` com 17.
- **R18–R32 escritas** (15 regras novas), cada uma no formato de 4 partes da §1.1. Para cada uma cujo gate
  já existe, **o script foi lido antes** e a regra descreve o que ele de fato cobra, com `arquivo:linha`:
  `check-package-contents.mjs` (R19), `check-audit-baseline.mjs` (R20), `check-release-tag.mjs` (R21),
  `verificar_commit.py` + `.githooks/config.json` (R22), `dev-kit/deadPointers.mjs` (R23).
- **§1.2 nova — vocabulário fixo de estado** (✅ gate pleno · ⚠️ escopo menor que a regra · ⏳ a construir ·
  🔴 conduta), e **§1.3 nova** com a contagem por estado. Toda regra abre com o seu marcador.
- **R10, R11, R15 e R16 mudaram de categoria mantendo o número.** R10 foi para `# 2` como ⏳ (decisão do
  dono, §5.1 da plan); R11, R15 e R16 foram para `# 3`, **cada uma com o motivo de não ter gate na própria
  linha**, e a §3 declara o critério de admissão ("um script não consegue decidir" ≠ "ninguém construiu").
- **Os vãos de escopo declarados na linha da própria regra**, não em nota: R4 (o tipo gerado não é uma das
  3 fontes — 304×409), R7 (não vê `src/styles/` nem `src/core/`, e o `--sx-*` está vivo lá), R8 (não vê
  `src/shared/`), R14 (subpasta de categoria), R17 (só o gerado), R23, R29, R30.
- **R8.1 acrescentada** — cobertura em % com **piso móvel** (§7.3 da plan), como sub-seção de R8, ⏳.
- **§4 (mapa regra → gate)** refeita com coluna **Estado** e as 32 linhas; **§4.1** (validador × executor)
  ganhou as linhas de `check-package-contents`, `check-audit-baseline`, `check-release-tag`,
  `verificar_commit.py` e da suíte, mais `@vitest/coverage-v8` como segunda linha ⏳.
- **§5 ("o que esta spec admite sobre si mesma")** passou de 3 para 5 admissões, com os números novos.
- `specs/specs/01-gates-e-baseline.md`: **todo gate passou a citar a regra que cobra** — inclusive os três
  que não estavam no catálogo de contrato (`audit:baseline` → R20/R30, `release:check` → R21, Anel 0 → R22),
  o `package:check` (que tinha `—` na coluna *Cobra*) → R19, a suíte → R6/R13/R24/R25/R26, o `tsc` → R30, e
  o Playwright, que **declara não cobrar regra nenhuma**. A tabela do baseline (§3) leva o número no nome do
  gate, e ganhou 3 linhas para os gates que não estavam nela.
- `specs/00-indice.md`: status desta plan → `🟠 Em revisão`, e nota registrando que **o escopo da `plan-06`
  encolheu** — as quatro perguntas de regra que ela herdaria viraram R10 ⏳, R31, R32 e R8.1 aqui.

**Arquivos alterados**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `specs/specs/00-regras-e-invariantes.md` | alterado | Reescrito em 2 categorias; +15 regras (R18–R32); §1.2/§1.3 novas; §4 e §5 refeitas |
| `specs/specs/01-gates-e-baseline.md` | alterado | Todo gate cita a regra; +3 gates catalogados; §2.4/§2.5/§2.6 nomeiam a regra; +1 critério de aceite |
| `specs/00-indice.md` | alterado | Status desta plan → 🟠; nota do encolhimento de escopo da `plan-06` |
| `specs/plan/plan-13-fechar-conjunto-de-regras.md` | alterado | `status` e este resumo |

⚠️ `specs/00-indice.md` e `specs/plan/plan-09-contrato-publico-2-0-0.md` **já estavam modificados no
worktree** antes desta execução (trabalho anterior do revisor, não commitado). O `plan-09` **não foi
tocado** aqui.

**Verificações executadas**

- `grep -c "^## R" specs/specs/00-regras-e-invariantes.md` → **32**
- Contagem por seção: `# 2. Regras verificáveis` → **29**; `# 3. Regras de conduta` → **3**
- `grep -nE "^## R(11|15|16) "` → linhas 820 · 844 · 870, **todas depois** do `# 3` (linha 814).
  `## R10` na linha **322**, dentro do `# 2` — fora da conduta, como decidido
- `grep -nE "^## R(1|2|3|4|5|6|7|8|9|12|13|14|17) "` → os 13 números preservados, enunciados inalterados
- `npx tsc --noEmit` → **14 erros**, sendo 3 em `useStructuralStyles.ts:30,71,94` + 1 em
  `ThemeCustomizationTab.tsx:86` (produção) e 10 em teste. **Medido nesta entrega**, não copiado — é o
  número que R30 declara
- `npm run audit` → `AUDITORIA FALHOU: 2 regras estruturais` — **o baseline documentado**, inalterado
- `npm run audit:baseline` → `igual ao baseline de 2026-07-28 — nenhuma regressão`
- `git diff --stat` → **só `specs/`**; nenhum `src/`, `scripts/`, `bin/` ou `.githooks/`

**Critérios de aceite**

- [x] Duas categorias e 32 regras (29 verificáveis, 3 de conduta) — evidência: contagem por seção acima
- [x] R18–R30 no formato de 4 partes, com "cobrada por" verdadeiro — **e também R31/R32**, que a §8 exige
- [x] Nenhuma regra renumerada; R1–R17 mantêm o número — evidência: `grep` acima
- [x] Cada regra de conduta traz o motivo de não ter gate na própria linha — R11 (intenção não é
      verificável), R15 (exigiria medir bundle, e o `build` está fora de hook por decisão), R16 (o gate
      teria de rodar no repositório do consumidor)
- [x] Os 5 vãos (R4, R7, R8, R14, R17) declarados na linha da regra — mais R23, R29 e R30, que o
      vocabulário da §1.2 classifica igual
- [x] `01-gates-e-baseline.md`: todo gate cita o número da regra
- [x] Zero gate criado, ampliado ou alterado — `git diff` não toca `scripts/`, `.githooks/` nem `.agents/`
- [x] R31 e R32 escritas; as 4 decisões da §7 refletidas (R10 ⏳ fora da conduta, R31, R32, R8.1 piso móvel)

**Decisões e suposições**

1. **Papel.** Esta plan declara execução pelo **revisor** (§0 e `00-contexto` §5); o usuário mandou
   executá-la pelo prompt do **executor**. Executada aplicando a disciplina do executor — `status`
   marcado antes da primeira edição, resumo append-only, **nada commitado**.
2. **Contradição interna da plan, resolvida pela §5/§8.** A §6.1 manda montar `# 2` com **26** e `# 3` com
   **4**, movendo **R10** para a conduta. Isso contradiz a §5.1 ("R10 **saiu** da conduta"), a §5
   ("32 — 29 verificáveis, 3 de conduta"), a §8 ("as 3 regras de conduta") e a §9 ("**R10 fora dela**").
   **Três lugares contra um: segui 29/3, com R10 em `# 2` como ⏳.**
3. **Mesma classe, §6.2:** ela diz "escrever R18–R30", enquanto a §5.2 lista **R18–R32** e a §8 exige R31 e
   R32 escritas. **Escrevi R18–R32.**
4. **R29 — `manifest.ts` não entrou.** A §5.2 diz que falta cobrir `design-token-ids.ts` e `manifest.ts`.
   Conferido no arquivo: `src/core/Provider/manifest.ts` é **escrito à mão** (`DESIGN_MANIFEST`, "Sovereign
   Design Manifest v10.1"), **não tem marca de gerado e não há gerador para ele** em `scripts/`. O único
   arquivo de `src/` com a marca `ARQUIVO GERADO AUTOMATICAMENTE` é o `design-token-ids.ts`. Escrever a
   regra sobre ele seria inventar escopo. **O 5º artefato gerado sem `--check` é `dist/BUILD_INFO.json`**
   (`generate-build-info.mjs`), e a divergência está declarada dentro da própria R29.
5. **Teste que roda na suíte foi classificado ✅, não como uma quinta categoria.** A §6.5 fixa quatro
   marcadores; o 🧪 da §5.2 é vocabulário da tabela da plan, não da spec. A suíte **bloqueia** no Anel 3 do
   `pre-push`, então regra coberta por teste que roda nela tem verificação automática de fato — e a linha
   sempre nomeia o arquivo do teste. Está escrito em voz alta na §1.2.
6. **Os "vãos" viraram 8, não 5.** Os 5 nomeados pela plan continuam nomeados; ao aplicar o vocabulário aos
   gates recém-escritos, R23 (só `sarak-dev/`, sem `§N.N`), R29 (3 de 5 geradores) e R30 (contagem, não
   verde) caem no mesmo ⚠️ pela mesma definição. Classificar de outro modo seria usar duas réguas.
7. **`plan-06` no índice: só nota, sem mudar status nem posição.** A §3.1 põe "o estado da `plan-06`" no
   escopo remetendo à "§7 abaixo", mas a §7 não especifica alteração alguma no índice. Interpretação
   conservadora: registrei **o que a §7 de fato produz** — o encolhimento do escopo dela, agora que as
   quatro perguntas de regra estão respondidas — e **não** mexi em status, ordem nem dependência.

**Achados fora do escopo (não corrigidos)**

O escopo (§3.1) é de **três** arquivos. A mudança de 17 → 32 regras deixou estas referências desatualizadas:

- `specs/00-contexto.md:65-66` — "as **17 regras** … (**11 têm gate, 6 são conduta**)". Hoje: 32, com
  15 ✅ · 8 ⚠️ · 6 ⏳ · 3 🔴. Também `:201` ("As 17 regras") — sugestão: plan nova ou `/spec-atualizar`.
- `specs/specs/15-divida-conhecida.md:122` ("antes de as **17 regras** estarem fechadas") e `:132`
  (achado 14: "**NENHUMA das 17** fala de auth"). O achado 14 agora **tem** regra: **R32**. Os achados 15 e
  18 idem — viraram **R8.1** e **R31**. As três linhas da §4.1 daquela spec precisam apontar para a regra.
- `specs/plan/plan-06-auditoria-cobertura-gates.md:18,57,66,139` — a plan inteira fala em mapear "as 17
  regras"; o produto dela agora são **32**, e as quatro perguntas de regra saíram do escopo dela.
- `specs/plan/plan-12-construcao-dos-gates.md:40` — "12 dos 21 achados vivos não violavam regra nenhuma
  **das 17**". Continua verdadeiro como registro histórico, mas a fila ⏳ que a `plan-12` consome agora tem
  **6 gates a construir + 8 ampliações**, não a lista antiga.
- `specs/plan/plan-03-*.md` e a §2 desta plan citam "17" como **estado da época** — são registro histórico
  append-only, **não são defeito**.

**Pendências / riscos**

- **Nada foi corrigido, de propósito** (§6.7 da plan). R30, R7 e R32 **nascem violadas** e a spec declara
  cada violação. Quem rodar `tsc` vai continuar vendo 14 erros; isso é o esperado.
- **Nenhum gate foi criado, ampliado ou alterado.** As 6 regras ⏳ e as 8 ⚠️ são a lista de trabalho que a
  `plan-12` consome — está consolidada na §4 e na §4.1 da spec.
- **Risco de deriva de contagem:** os números "32 / 29 / 3 / 15 / 8 / 6" aparecem na §1.3, na §5 e na §6 da
  spec. Regra nova sem atualizar os três lugares faz a spec mentir sobre si mesma — é a versão interna do
  que R17 proíbe. Não há gate para isso (é o próprio caso que R23 não cobre: prosa manual).

---

# 12. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito — 2026-08-02 — 🟢 Aprovado

**Aprovado, e com uma inversão de papéis que precisa ficar registrada: as três divergências que a execução
declarou eram todas defeitos MEUS na plan. As três foram resolvidas na direção certa.**

### Reproduzi tudo

| Critério | O que eu medi |
|---|---|
| Escopo | `git status` → só `specs/`. Zero `src/`, `scripts/`, `.githooks/` |
| Contagem | `grep -c "^## R"` → **32** |
| Categorias | `# 2. Regras verificáveis` (`:60`) com **29** · `# 3. Regras de conduta` (`:814`) com **3** |
| R10 fora da conduta | `:322` — dentro da §2, como decidido |
| R11 · R15 · R16 | `:820` · `:844` · `:870` — dentro da §3 |
| Numeração preservada | `git diff` mostra **zero** enunciado de R1–R17 reescrito; os dois `-## R` do diff são **R11 e R17 trocando de posição**, não de texto |
| `tsc` | **14 erros, 4 em produção** — contei eu, bate com R30 |
| Baseline | `npm run audit:baseline` → *"igual ao baseline de 2026-07-28 — nenhuma regressão"* |
| `01-gates-e-baseline` | **35 citações** de regra; cada gate aponta o número que cobra |

**A amostragem que mais importa — a regra foi escrita a partir do script, não do imaginado.** Conferi R19
contra `scripts/check-package-contents.mjs`: `:85` é de fato o `npm pack --dry-run --json`; `:9-24` tem
exatamente **6** prefixos proibidos; `:33-75` tem exatamente **31** caminhos obrigatórios. Os três números da
spec batem com o código. Era a instrução mais fácil de fingir que se cumpriu, e ela foi cumprida.

### As três divergências — todas minhas

1. **§6.1 contradizia §5.1, §5, §8 e §9.** Ela mandava *"26 verificáveis / 4 conduta, com R10 na conduta"*, e
   as outras quatro seções diziam 29/3 com R10 fora. Eu corrigi §5.1 e §5 depois da sua decisão e **não
   propaguei para as instruções de execução**. Seguir a maioria coerente foi o certo.
2. **§6.2 dizia "escrever R18–R30"**, enquanto §5.2 lista R18–**R32** e §8 exige R31/R32. Mesma causa: patch
   que não desceu até as instruções.
3. **`manifest.ts` não é gerado.** Eu o pus no alvo de R29 por suposição. Medido: é fonte escrita à mão, que o
   `catalogAst.mjs:167` **lê** — o `parse('core/Provider/manifest.ts')` prova o contrário do que eu afirmei. E
   a execução ainda achou o 5º artefato gerado real: `dist/BUILD_INFO.json`.

> **A causa é a mesma das duas rodadas da plan-04:** eu editei uma spec em partes e não reconciliei o
> documento inteiro. Três vezes agora. Vale como regra de conduta minha: *plan editada é plan relida do começo
> ao fim antes de sair.*

### Um achado da execução que corrige a MINHA tabela

A plan-13 §5.2 declarava R30 com *"verificação: ❌ nenhuma"*. **Falso.** A execução leu o Anel 2 e descobriu
que ele **já cobra a contagem** de `tsc` contra `tsc.erros` do baseline quando o staged tem `.ts`/`.tsx` — o
que impede o número de subir de 14, sem exigir zero. A spec registra isso corretamente. R30 não nasce sem
rede; nasce com rede parcial e declarada.

### Resíduos — meus, corrigidos nesta ação

O §3.1 da plan não listava `00-contexto`, `15-divida-conhecida`, `plan-06` nem `plan-12`. A execução os
declarou como achados fora do escopo, corretamente. **Como são meus, corrigi agora:**

- `00-contexto.md:65-66,201` — *"as 17 regras (11 têm gate, 6 são conduta)"* → **32 regras, 29 verificáveis e
  3 de conduta**, com o vocabulário de estado.
- `15-divida-conhecida.md` §4 — os achados **14, 15 e 18** diziam *"NENHUMA regra"*. Agora apontam **R32**,
  **R8.1** e **R31**, com a nota de que o que falta neles é só o gate.
- `plan-06` — deixou de mandar mapear "as 17 regras"; agora são as **29 verificáveis**, e as 3 de conduta ficam
  explicitamente fora (não têm gate por decisão, não por omissão).

**Destino da síntese:** `specs/00-regras-e-invariantes.md` — a plan **era** a síntese, e está escrita.

**Liberado: pode commitar.**
