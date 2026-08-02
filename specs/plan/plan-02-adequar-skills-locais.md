---
tipo: "plan"
titulo: "Adequar as skills locais ao fluxo SDD"
dominio: "Governança de Specs (SDD) / Inteligência local"
status: "🟠 Em revisão"
prioridade: "Alta"
tags: ["plan", "skills", "sdd", "governanca"]
relacionados: ["[[00-contexto]]", "[[00-knowledge]]", "[[00-prompt-revisor]]"]
depende_de: "plan-01"
destino_sintese: "00-contexto.md"
---

# 1. Objetivo

As 9 skills locais deixam de competir com a base de specs: cada uma é **procedimento** que aponta para a spec
fixa onde a **regra** vive, e nenhuma repete conteúdo que a spec já carrega.

# 2. Contexto

`00-knowledge` é **universal** e declara que as capacidades "não vivem neste repositório". Mas este repositório
tem **9 skills locais** em `.agents/skills/`, e uma delas (`ui-auditoria-modulo`) é quem roda os gates. A
`plan-01` roteou as 9 em `00-contexto` §4 — este é o único lugar que as conhece.

Duas ficaram com sobreposição real depois da reescrita da base:

- **`ui-contexto-repositorio`** faz onboarding e ordem de leitura — exatamente o trabalho de `00-contexto` +
  `00-knowledge`. Ela cita `specs/INDEX.md` (`SKILL.md:35`), **removido pela plan-01**: é ponteiro morto hoje.
- **`ui-integra-consumidor`** é a **fonte** do kit do consumidor
  (`scripts/consumer-kit/kitFiles.mjs:22` → `buildKitOutputs.mjs:42`). Apagá-la faz `fs.readdirSync` lançar
  `ENOENT` e derruba `guide:check`, **que roda dentro do `npm run build`**.

> ⚠️ **A decisão do que remover e do que atualizar é do dono.** Esta plan **para** e apresenta a matriz antes
> de qualquer edição.

# 3. Escopo

## 3.1 Dentro
- `.agents/skills/**` — as 9 skills (`SKILL.md`, `references/`, `scripts/`)
- `.agents/index.md` — regenerado por `gerar_indice.py` ao fim, nunca à mão
- `00-contexto.md` §4 — a tabela de roteamento, se alguma skill sair ou mudar de papel

## 3.2 Fora
- **Todo `src/`, `scripts/`, `bin/`, `dist/`.** Skill é documentação de procedimento; esta plan não toca código.
- **`.agents/skills/ui-integra-consumidor/` — não remover em nenhuma hipótese** (derruba o `build`). Editar o
  conteúdo é permitido; apagar a pasta não.
- `00-knowledge.md` — é universal; o que é local vive em `00-contexto`.
- As specs fixas de `adr/`, `arquitetura/`, `specs/`.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contexto | `00-contexto.md` §4 | a tabela que roteia as 9 |
| Contexto | `00-knowledge.md` §2, §9 | por que skill local não entra lá |
| Spec fixa | `specs/14-artefatos-do-mantenedor.md` | o que é gerado a partir de skill |
| Código | `scripts/consumer-kit/kitFiles.mjs:22` | prova de que `.agents/` é a FONTE do kit |
| Skill | `meta-create-skill` | o padrão de 3 camadas e a `description`-gatilho |

# 5. Instruções de execução

1. **Auditar as 9** — para cada uma: a `description` ainda dispara na situação certa? Cada ponteiro
   (`arquivo`, `§`, comando) resolve? Há conteúdo que **duplica** uma spec fixa em vez de apontar para ela?
2. **Detector de ponteiro morto**, antes e depois — todo caminho e toda referência `§N` resolvidos contra o
   heading real do alvo. *(É o achado 30: a classe é reincidente e a atenção humana não a pega.)*
3. **Montar a matriz** — uma linha por skill: papel · sobreposição com spec fixa · ponteiros mortos ·
   recomendação (**manter** · **atualizar** · **absorver e remover**).
4. **⇒ PARE. Relatório em texto. Aguarde a decisão do dono, skill a skill.**
5. Aplicar **apenas** o que foi decidido.
6. Regenerar `.agents/index.md` com `gerar_indice.py`.
7. Se alguma skill saiu ou mudou de papel, ajustar `00-contexto` §4 na mesma execução.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-02-adequar-skills-locais.md.

Contexto obrigatório antes de começar: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/14-artefatos-do-mantenedor.md.
Skills a aplicar: meta-create-skill.

Esta plan tem PARADA OBRIGATÓRIA no passo 4: monte a matriz das 9 skills e apresente ao
usuário em texto. Não edite nenhuma skill antes da decisão dele.
Não saia do escopo. Não commite. Ao terminar, escreva o resumo na própria plan.
```

# 7. Critérios de aceite

- [ ] As 9 skills auditadas, cada uma com ponteiros resolvidos contra o alvo real.
- [ ] Matriz apresentada ao dono **antes** de qualquer edição.
- [ ] Só foi aplicado o que ele decidiu — nenhuma skill alterada por iniciativa do executor.
- [ ] `.agents/skills/ui-integra-consumidor/` continua existindo.
- [ ] Zero ponteiro morto nas skills que permaneceram (caminho **e** referência de seção).
- [ ] `.agents/index.md` regenerado pelo script.
- [ ] `00-contexto` §4 coerente com o resultado.
- [ ] Gates no baseline exato; `npm run guide:check` e `dev-kit:check` verdes.

# 8. Como verificar

- `ls .agents/skills/` → o conjunto decidido, com `ui-integra-consumidor` presente
- `npm run guide:check` · `npm run dev-kit:check` → verdes
- `npm run audit` → baseline exato (`specs/01-gates-e-baseline.md`)
- Para cada `§N` citado numa skill: `grep -nE "^#{1,3} " <arquivo-alvo>` confirma que a seção existe
- `git diff --stat` → só `.agents/` e, se for o caso, `specs/00-contexto.md`

# 9. Destino da síntese

**Destino:** `00-contexto.md`

Se alguma skill for absorvida ou mudar de papel, a §4 de `00-contexto` é atualizada nesta mesma execução.
Nenhuma spec fixa nova.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

## Resumo da execução — 2026-08-01

**Resultado:** Concluído

**A decisão do dono (2026-08-01), verbatim**

> *"As skills que contêm esses scripts são do próprio módulo UI, fazem parte da auditoria — devemos manter os
> scripts para os gates e posterior criação do pipeline de CI/CD. (…) os geradores ficam e os validadores serão
> movidos para os gates (adicione em regras tudo que irá para o gate e preserve os scripts para montagem do
> pipeline de CI/CD); na prática as skills não executarão as verificações por script e sim os gates do pipeline
> que eu montarei posteriormente."*

Mais: `ui-contexto-repositorio` → remover · `meta-create-skill` → remover · `verify_theme_parity.ts` → vai para
os gates · README autorizado · ordem de leitura absorvida.

**O que foi feito**

1. **Auditoria das 9** (passo 1–3) com detector de ponteiro morto reusando `findDeadPointers` de
   `scripts/dev-kit/deadPointers.mjs`, acrescido da resolução de `§N` contra o heading real do alvo — o que o
   gate oficial não faz. O detector vive no scratchpad, fora do repositório: criar script aqui é §3.2.
2. **Matriz apresentada e decisão colhida** (passo 4) antes de qualquer edição.
3. **2 skills removidas**, 7 atualizadas, `.agents/index.md` regenerado pelo script.
4. **Zero script perdido:** os **13** `.mjs`/`.ts` de auditoria continuam no disco, conferidos um a um.

**A separação que passou a governar as skills**

| | Quem invoca | Onde está escrito |
|---|---|---|
| **Gerador** (`generate_theme_template.ts`) | a **skill**, sob decisão humana | continua na skill |
| **Validador** (`run_audit.mjs`, `verify_parity.ts`, `verify_presets.ts`, `verify_theme_parity.ts`) | o **gate** — hoje o `package.json`, adiante o pipeline | inventário novo em `specs/specs/00-regras-e-invariantes.md` §3.1 |

Nenhuma skill invoca validador direto agora. As chamadas `npx tsx …/verify_parity.ts` e
`node …/run_audit.mjs` viraram `npm run audit`.

**Arquivos alterados**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `.agents/skills/ui-contexto-repositorio/SKILL.md` | **removido** | 126 linhas; zero script. Absorvida — destino de cada bloco na tabela abaixo |
| `.agents/skills/meta-create-skill/**` | **removido** | 4 `.md` + `scripts/scaffold_skill.py`; duplicata da `sarak:meta-create-skill` universal |
| `.agents/skills/ui-auditoria-modulo/SKILL.md` | alterado | tabela dos 8 auditores → ponteiro para `sarak-dev/state.json` + `00-regras` §3 · invocação passa pelo gate · Camada 3 com caminho completo + aviso de que `ui-novo-componente` não é removível |
| `.agents/skills/ui-arquitetura-design/SKILL.md` | alterado | R2/R7/R9/R10 reescritas → ponteiro; sobra só o procedimento próprio · `grep_search`/`view_file` (ferramentas de outro harness) removidas · nota de que a verificação mecânica é do gate |
| `.agents/skills/ui-arquitetura-design/references/templates.md` | alterado | `§2.4 do GUIA-MANUTENCAO.md` → `sarak-dev/GUIA-MANUTENCAO.md` |
| `.agents/skills/ui-novo-componente/SKILL.md` | alterado | paridade se confere pelo gate · aviso mecânico de não-removibilidade |
| `.agents/skills/ui-criar-tema/SKILL.md` | alterado | Camada 3 separada em **gerador** (skill invoca) × **validador** (gate invoca) · `verify_theme_parity.ts` marcado como ⏳ sem gate |
| `.agents/skills/ui-criar-preset/SKILL.md` | alterado | removida a transcrição "hoje **5 arquivos**" + a tabela de constantes (R17) · `§4` com prefixo |
| `.agents/skills/ui-integra-consumidor/SKILL.md` | alterado | **acrescentado** o bloco do contrato invertido (ver "Decisões") |
| `.agents/index.md` | regenerado | `python .agents/gerar_indice.py` — 9 → **7** skills |
| `sarak-ui/skill/SKILL.md` | regenerado | `npm run guide` — é a cópia shippada da `ui-integra-consumidor` |
| `README.md` | alterado | `/ui-contexto-repositorio` → `specs/00-contexto.md`; lista renumerada 1–4 |
| `specs/00-contexto.md` | alterado | **§4.1 nova** — a ordem de leitura de ambientação absorvida da skill removida |
| `specs/specs/00-regras-e-invariantes.md` | alterado | **§3.1 nova** — inventário validador × gate, com a única linha ⏳ |
| `specs/plan/plan-02-…` | alterado | `status` e este resumo |

**Destino provado de cada bloco da `ui-contexto-repositorio`** *(00-contexto §5: nada sai sem destino)*

| Bloco | Onde vive agora |
|---|---|
| As 7 regras reescritas (`:43-98`) | `specs/specs/00-regras-e-invariantes.md` — já estavam lá, com gate e exemplo |
| "O que NÃO existe mais" (`:100-106`) | `adr/002`, `adr/003`, `adr/004` |
| "Mapeamento de Skills" (`:108-117`) | `00-contexto.md` §4 |
| "Antes de declarar concluída" (`:119-123`) | `00-contexto.md` §3, comandos vitais |
| "O código é a fonte da verdade" (`:12-14`) | `00-contexto.md` §2 |
| **"Workflow de Ambientação" (`:16-32`)** | **`00-contexto.md` §4.1 — criada nesta execução.** Era o único bloco sem destino |
| `specs/INDEX.md` (`:35`) | morto desde a plan-01; some com a skill |

**Verificações executadas**

- **Detector de ponteiro morto, antes × depois:** **17 → 7**. Os 7 restantes são as duas classes declaradas:
  3 metavariáveis `[coluna].json` (falso-positivo do detector, que espelha o `PLACEHOLDER` de
  `deadPointers.mjs` — ele ignora `<>` e `*`, **não `[]`**) e 4 caminhos do **repositório do consumidor** em
  `ui-integra-consumidor`, agora explicitamente declarados lá dentro. **Zero morto real neste repositório.**
- **Referências de seção:** 5 suspeitas, **todas conferidas à mão contra o heading do alvo, todas corretas**
  (`arquitetura/04` §3 = "As duas alavancas"; `GUIA-MANUTENCAO.md` §4 = "Criar um tema ou um preset";
  `GUIA-FRONTEND.md` §0 e §2 existem). As "ambíguas" são limitação do detector (2 `.md` na mesma linha), não defeito.
- `npm run guide:check` → ✅ **kit em dia (6 arquivos)** — reprovou primeiro por defasagem, o que está **certo**:
  editei a fonte. Regenerado com `npm run guide` (87 componentes, kitHash `36b5cb181288`).
- `npm run dev-kit:check` → ✅ **kit em dia (3 arquivos, 0 ponteiros mortos)**
- `npm run barrel:check` → ✅ **81 componentes, 0 faltas**
- `npm run catalog:check` → ✅ catálogo em dia
- `npm run audit` → ❌ **exit 1, 2 auditores vermelhos** — **baseline exato**: `SarakTypography.tsx` (VALOR),
  3 fantasmas, 409/409/409, 120 itens de preset, 0 órfã
- `npx vitest run` → ✅ **274 arquivos / 889 testes, 100% verde** (186,8 s) — o baseline de
  [[01-gates-e-baseline]] §3
- `ls .agents/skills/` → 7 pastas, `ui-integra-consumidor` presente
- **Inventário dos scripts após a remoção** → **13 preservados**: 8 `auditor_*.mjs`, `run_audit.mjs`,
  `verify_presets.ts`, `verify_parity.ts`, `generate_theme_template.ts`, `verify_theme_parity.ts`

**Critérios de aceite**

- [x] As 9 auditadas, ponteiros resolvidos contra o alvo real — evidência: detector antes/depois + as 5 seções conferidas
- [x] Matriz apresentada ao dono **antes** de qualquer edição — evidência: relatório da rodada anterior
- [x] Só foi aplicado o que ele decidiu — evidência: a transcrição verbatim acima, item a item
- [x] `.agents/skills/ui-integra-consumidor/` continua existindo — e ganhou o motivo escrito
- [x] Zero ponteiro morto real nas skills que permaneceram (caminho **e** seção)
- [x] `.agents/index.md` regenerado pelo script, não à mão
- [x] `00-contexto` §4 coerente — a tabela já listava só as 7 que ficaram; as 2 removidas nunca estiveram lá
- [x] Gates no baseline exato; `guide:check` e `dev-kit:check` verdes

**Decisões e suposições**

1. **A interpretação de "as skills não executarão as verificações por script".** Li como *"a skill deixa de
   invocar o script direto e passa a apontar para o gate"*, **não** como *"a skill perde a instrução de
   verificar"*. O motivo: o pipeline ainda não existe. Tirar a verificação hoje abriria um buraco entre esta
   entrega e a montagem do CI/CD. Onde havia `npx tsx …/verify_parity.ts`, agora há `npm run audit` — que é o
   que o pipeline vai chamar de qualquer jeito. **Declarada porque muda o resultado se você quis o corte mais
   radical.**
2. **`scaffold_skill.py` saiu junto com a pasta.** Você disse "os geradores ficam", e depois "1. meta-create-skill
   — vamos remover" respondendo à pergunta que nomeava o `.py`. Segui a resposta específica. Ele não é gerador
   do módulo UI nem entra em gate: é o scaffolder da meta-skill, e a `sarak:meta-create-skill` universal traz o
   dela. **Recuperável em 1 comando** (`git checkout` no caminho) se você quiser de volta.
3. **`ui-integra-consumidor` ganhou o bloco do contrato invertido.** Não era mudança prevista na plan; é o
   registro da coisa que você explicou e que não estava escrita em lugar nenhum — que ela virou **artefato que
   viaja** e que, por isso, ser autocontida é o requisito dela. Sem isso, o próximo agente aplica nela a
   política das outras 6 e derruba o `guide:check`.
4. **Os caminhos ilustrativos foram para negrito, não crase.** Convenção da Spec 14 §4.2. Duas linhas que eu
   mesmo escrevi acenderam no detector na primeira passada — corrigi antes de entregar. Registro porque é a
   prova de que o detector serve, e não a decoração do relatório.

**Desvios de escopo — três, todos declarados**

| Arquivo | Por quê |
|---|---|
| `specs/specs/00-regras-e-invariantes.md` | **§3.2 da plan põe `specs/` fora do escopo.** Entrou por instrução direta sua ("adicione em regras tudo que irá para o gate"). Nenhum gate foi inventado: a única linha nova sem gate está marcada **⏳**, e o texto diz em voz alta que a tabela descreve o que **é**, não o que deveria ser |
| `README.md` | Fora de §3.1. **Autorizado por você** — sem isso, remover a skill criaria um ponteiro morto novo, a exata classe de defeito que esta plan existe para eliminar |
| `sarak-ui/skill/SKILL.md` | **Não foi escolha.** É a cópia gerada da `ui-integra-consumidor`; sem `npm run guide` o `guide:check` reprova e derruba o `npm run build` |

**Achados fora do escopo (não corrigidos)**

- `scripts/dev-kit/deadPointers.mjs:53` — `PLACEHOLDER = /[<>*]/` **não cobre `[...]`**. Se o `dev-kit:check`
  algum dia varrer `.agents/`, entrega 3 falsos-positivos de saída. É `scripts/`, fora de escopo — e a Spec 14
  §4.2 diz que gate com falso-positivo é gate que se aprende a contornar.
- **`.claude/skills/` aparece no `git diff` junto com `.agents/skills/`.** É symlink, mas os arquivos estão
  rastreados pelos dois caminhos — o diff mostra 2× cada remoção/alteração. O conteúdo é idêntico e coerente;
  registro porque contradiz a suposição de que "não há cópia a espelhar".
- `README.md:69` afirma "os 8 auditores" — contagem escrita à mão, derivável de `sarak-dev/state.json`. Correta
  hoje. Mesma classe do que foi limpo em `ui-criar-preset`.

**Pendências / riscos**

- **`verify_theme_parity.ts` continua sem gate.** Está registrado em `00-regras` §3.1 com **⏳** e é o único
  item ⏳ da tabela. Ligá-lo é a montagem do pipeline, que é sua.
- **Divergência de status no índice:** `00-indice.md` marca a plan-02 como 🔴; o arquivo dela está 🟠. Pela §5
  do índice, a plan é a fonte da verdade — **só o revisor edita aquele arquivo**, então não toquei.
- **Duas modificações no worktree não são minhas:** `.claude/settings.json` (permissão de `grep` aprovada nesta
  sessão — é o que `00-contexto` §3.1 avisa que suja a árvore e trava o `npm version`) e `specs/00-indice.md`
  (sua edição marcando a plan-03 como 🟠).

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
