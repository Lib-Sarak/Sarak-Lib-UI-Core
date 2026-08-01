---
tipo: "plan"
titulo: "Adequar as skills locais ao fluxo SDD"
dominio: "Governança de Specs (SDD) / Inteligência local"
status: "🔴 A executar"
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

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
