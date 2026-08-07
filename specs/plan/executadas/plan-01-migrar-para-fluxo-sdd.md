---
tipo: "plan"
titulo: "Migrar a base de specs para o fluxo SDD"
dominio: "Governança de Specs (SDD)"
status: "⚪ Sintetizada"
prioridade: "Máxima"
tags: ["plan", "sdd", "migracao", "governanca"]
relacionados: ["[[00-contexto]]", "[[00-indice]]", "[[00-knowledge]]", "[[15-divida-conhecida]]"]
depende_de: ""
destino_sintese: "00-contexto.md · specs/15-divida-conhecida.md"
---

> **Plan de documentação — executada pelo REVISOR.** O executor tem proibição explícita de criar ou editar
> spec ([[00-prompt-executor]] §7.3, que nomeia `00-contexto` e `00-indice`). Desvio registrado em
> [[00-contexto]] §5.

# 1. Objetivo

A base de specs passa a operar no fluxo SDD — **uma plan por unidade de trabalho**, com fila, status e destino
de síntese declarados — e nenhum conteúdo vivo do modelo anterior se perde.

# 2. Contexto

O modelo anterior era **uma campanha em três arquivos fixos** em `plan/`: um plano executável com todas as
fases dentro (504 linhas), um log append-only (1.255 linhas / 431 KB) e um índice. A Campanha 1 fechou em
2026-08-01 e foi sintetizada nas 15 specs fixas + 8 ADRs.

O fluxo novo chegou em `specs/` com 5 arquivos `00-*` e 4 moldes em `_templates/`. Os três arquivos do modelo
antigo receberam o sufixo `-migrar`.

**A descoberta que reorganiza o trabalho:** os 31 achados da campanha **não tinham casa** no fluxo novo. Não
são plan (não são trabalho definido), não são spec fixa de regra, e não cabem em `00-contexto` §8, cujo teto
declarado é 200 linhas para o arquivo inteiro. Por isso esta plan cria uma spec fixa própria para eles.

# 3. Escopo

## 3.1 Dentro

- `specs/00-contexto.md` — preencher as 6 seções `<!-- PREENCHER -->`
- `specs/specs/15-divida-conhecida.md` — **criar**, com os 31 achados
- `specs/00-indice.md` — preencher a fila de execução
- `specs/plan/plan-NN-*.md` — criar as plans da fila
- `CLAUDE.md` — acrescentar o ponteiro para a base de specs (fecha o achado 31)
- **Remover:** `specs/INDEX.md`, `specs/README.md`, `specs/plan/00-*-migrar.md` (3 arquivos)

## 3.2 Fora

- **Todo `src/`, `scripts/`, `bin/`, `dist/`, `sarak-ui/`, `sarak-dev/`.** Esta plan não toca código.
- `specs/adr/`, `specs/arquitetura/` e as specs `00`–`14` — já sintetizadas, permanecem como estão.
- `.agents/skills/` — a adequação das skills é plan própria (a `ui-contexto-repositorio` fica **intacta** até lá).
- Os moldes `00-prompt-executor`, `00-prompt-revisor`, `00-knowledge` e `_templates/` — chegaram prontos.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Processo | `00-prompt-revisor` §3, §5 | define o que o revisor pode escrever |
| Processo | `00-prompt-executor` §7.3 | é por que esta plan é do revisor |
| Fonte | `specs/plan/00-prompts-execucao-migrar.md` | material dos 31 achados e das 8 fases |
| Fonte | `specs/README.md` §5, §"histórico", §"divergência" | as regras que precisam sobreviver |

# 5. Instruções de execução

1. Preencher `00-contexto.md` — identidade, regras inegociáveis, stack, roteamento, desvios, fronteiras, estado.
2. Criar `specs/specs/15-divida-conhecida.md` com os 31 achados, separados em abertos e fechados.
3. Absorver em `00-contexto` §2 e §5 as regras que só existiam em `specs/README.md`.
4. Criar as plans da fila, uma por unidade de trabalho, a partir das 8 fases do arquivo `-migrar`.
5. Preencher a fila de `00-indice.md`.
6. Acrescentar a `CLAUDE.md` o ponteiro duro para `specs/00-contexto.md`.
7. **Só então** remover os 5 arquivos, com destino provado item a item.
8. Rodar `npm run dev-kit:check` e `npm run guide:check` — a remoção não pode criar ponteiro morto.

> **Ordem obrigatória: o passo 7 é o último.** Os arquivos `-migrar` são a **fonte** das plans e da spec de
> dívida. Removê-los antes viola a regra "nada é apagado sem destino demonstrado" — que esta mesma plan está
> transportando para `00-contexto` §5.

# 6. Prompt de execução

*Não aplicável* — plan de documentação, executada pelo revisor na própria conversa em que foi escrita.

# 7. Critérios de aceite

- [x] `00-contexto.md` sem nenhum `<!-- PREENCHER -->` restante.
- [x] `specs/15-divida-conhecida.md` criado, com os 31 achados e numeração contínua.
- [x] As regras "código é fonte da verdade", "nunca transcreva fonte viva", "nada é apagado sem destino",
      "só sai o que foi executado" e "documento permanente não carrega histórico" vivas em `00-contexto`.
- [x] As 9 skills locais roteadas em `00-contexto` §4 — [[00-knowledge]] é universal e não as conhece.
- [ ] Uma plan por unidade de trabalho, criada a partir das 8 fases.
- [ ] `00-indice.md` com a fila completa; nenhuma linha aponta para arquivo inexistente.
- [ ] `CLAUDE.md` aponta para `specs/00-contexto.md`.
- [ ] Os 5 arquivos removidos, cada um com destino demonstrado.
- [ ] `dev-kit:check` e `guide:check` verdes; nenhum ponteiro morto novo.
- [ ] Nenhum arquivo de `src/`, `scripts/` ou `bin/` no diff.

# 8. Como verificar

- `grep -c "PREENCHER" specs/00-contexto.md` → `0`
- `git status --porcelain` → só `specs/`, `CLAUDE.md`; **nenhum** `src/`, `scripts/`, `bin/`, `dist/`
- `grep -rn "specs/INDEX.md\|specs/README.md" --include=*.md .` → só a skill `ui-contexto-repositorio`
  (que é da plan de adequação de skills, não desta)
- `npm run dev-kit:check` · `npm run guide:check` → verdes
- Cada linha de `00-indice` §1 → o arquivo apontado existe

# 9. Destino da síntese

**Destino:** `00-contexto.md` · `specs/15-divida-conhecida.md`

Os dois já são o produto direto desta plan — a síntese é a própria execução. Nada fica pendente para
`spec-atualizar`.

---

# 10. Resumo da execução

## Resumo da execução — 2026-08-01 (revisor)

**Feito até aqui:**

1. `specs/00-contexto.md` — 6 seções preenchidas. Absorvidas as 5 regras que só existiam em
   `specs/README.md`. As 9 skills locais roteadas na §4, com o aviso de que [[00-knowledge]] é universal e
   não as conhece.
2. `specs/specs/15-divida-conhecida.md` — criado. 31 achados: **22 abertos** em 6 categorias, **9 fechados**
   com o motivo. O acoplamento `localStorage.clear()` × abas mortas registrado como restrição de ordem.
3. Verificação de referências antes de qualquer remoção: única citação viva a `specs/INDEX.md` fora dos
   arquivos que morrem é `.agents/skills/ui-contexto-repositorio/SKILL.md:35`.

4. **11 plans criadas** em `specs/plan/`, uma por unidade de trabalho, a partir das 8 fases do arquivo
   `-migrar` mais as duas plans de governança (skills, triagem).
5. `00-indice.md` — fila preenchida com as 11, dependências e destinos.
6. `CLAUDE.md` — ponteiro duro para `specs/00-contexto.md` + os dois prompts + a fila. **Fecha o achado 31.**
7. **5 arquivos removidos**, cada um com destino demonstrado (tabela no veredito).
8. `npm run dev-kit` reexecutado — o kit do mantenedor deriva da estrutura de specs, que mudou.

**Nenhum arquivo de `src/`, `scripts/`, `bin/` ou `dist/` foi tocado.**

---

# 11. Veredito

## Veredito — 2026-08-01 — 🟢 Aprovado

Verificação direta no worktree, não por resumo.

### Destino de cada arquivo removido

| Removido | Destino demonstrado |
|---|---|
| `specs/INDEX.md` | mapa de categorias → `00-contexto` §3 e §4; ordem de leitura → `00-prompt-revisor` §2 |
| `specs/README.md` | 5 regras → `00-contexto` §2 e §5; o §`plan/` descrevia o modelo de campanha, **substituído** pelo SDD |
| `plan/00-indice-migrar.md` | substituído integralmente por `00-indice.md` (que tem legenda de status e histórico) |
| `plan/00-progresso-migrar.md` | log da campanha fechada, **já sintetizada** nas 15 specs fixas + 8 ADRs. Decisão do dono: limpar. Histórico no git |
| `plan/00-prompts-execucao-migrar.md` | 31 achados → `specs/15-divida-conhecida.md` · 8 fases → plans 03–11 · regras comuns → os dois prompts · baseline → `specs/01` |

### Gates — todos no baseline exato

| Gate | Resultado |
|---|---|
| `run_audit` | exit 1 · **2 regras** · 409/409/409 · 120 itens, 0 órfã — **baseline exato** |
| `barrel:check` | 81 componentes, 0 faltas |
| `zero-brand:check` | 361 arquivos, 0 violações |
| `catalog:check` · `guide:check` | em dia |
| `dev-kit:check` | 3 arquivos, **0 ponteiros mortos** (após regenerar) |

### Critérios conferidos

- `grep -c PREENCHER specs/00-contexto.md` → só a linha do próprio molde explicando o mecanismo; **0 placeholders**.
- `git status --porcelain` → **17 entradas**, todas em `specs/`, `CLAUDE.md`, `sarak-dev/` (gerado) e
  `.claude/settings.json`. **Nenhum `src/`, `scripts/`, `bin/` ou `dist/`.**
- Toda linha de `00-indice` §1 aponta para arquivo que **existe** — as 11 conferidas.
- Ponteiros a `specs/INDEX.md` e `specs/README.md` fora dos arquivos removidos: **um só**, em
  `.agents/skills/ui-contexto-repositorio/SKILL.md:35`. É escopo da **plan-02**, e está registrado lá.

### Achado fechado

**31** — a ponte `CLAUDE.md` → base de specs deixou de ser *soft*. Era o único que dependia de uma skill ser
acionada pela `description` em vez de um ponteiro duro. Sai de `15-divida-conhecida.md` na plan-03, que é quem
mexe naquele arquivo.

### Desvio registrado

Esta plan foi **escrita e executada pelo revisor**, conforme `00-contexto` §5. O executor tem proibição
explícita de criar ou editar spec (`00-prompt-executor` §7.3, que nomeia `00-contexto` e `00-indice`).

**Pode commitar.**

## Correção pós-veredito — 2026-08-01

Revisão do dono apontou duas falhas no `00-contexto.md` entregue. Ambas confirmadas e corrigidas:

1. **Lacuna de release.** A §3 listava `npm version` e a §7 o proibia, mas nada dizia **quando a tag é
   necessária**, **como escolher o nível** nem que o comando exige árvore limpa e publica sozinho. O agente
   descobria pelo `PUSH BLOQUEADO`. → **§3.1 criada**, com os 4 fatos e o ponteiro para `specs/03`; a §7 passou
   a referenciá-la.
2. **Número errado.** A §8 dizia "30 achados abertos"; `15-divida-conhecida.md` diz 31 numerados, 9 fechados —
   **22 abertos**. Os dois não podiam estar certos. → corrigido para 22, com a decomposição explícita.

A segunda é a mais instrutiva: é **exatamente a classe do achado 30** — número/ponteiro que envelhece sem
gate. Duas specs escritas na mesma entrega já divergiam. Registrado como pista para a `plan-06`: **contagens
declaradas que nenhum gate cruza contra a fonte.**

---

## Síntese — 2026-08-07

Sintetizada em: `specs/00-contexto.md` · `specs/specs/15-divida-conhecida.md`

Observações: esta plan era, por desenho (§9), a própria execução da síntese — foi escrita e executada pelo
revisor diretamente nas specs fixas de destino, sem produto intermediário. Verificado nesta passada de
`/spec-atualizar`: `00-contexto.md` §§1-8 preenchidas e `specs/15-divida-conhecida.md` criada com os 31 achados
(hoje refinados pelas plans 03/06/07/09/12 subsequentes). Nada foi deixado de fora.
