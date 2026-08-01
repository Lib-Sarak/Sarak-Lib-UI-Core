---
tipo: "indice"
titulo: "Índice do plano transitório (specs/plan/)"
dominio: "Sarak-Lib-UI-Core — campanha em curso"
status: "🟢 Vigente"
prioridade: "Alta"
tags: ["indice", "plan", "campanha"]
relacionados: ["00-prompts-execucao", "00-progresso"]
---

# Índice do `specs/plan/`

**É o arquivo de entrada da pasta**: abra-o antes de executar qualquer item da campanha em curso.

## O que esta pasta é

`specs/plan/` é o **plano transitório**, com data de morte. Ele descreve **o trabalho**, nunca o produto — quem quer saber o que a lib *é* vai para `specs/arquitetura/`, `specs/adr/` e `specs/specs/`, nessa ordem (mapa em [`../INDEX.md`](../INDEX.md)).

Ao fim de cada campanha esta pasta é **esvaziada e resemeada**: sai o que foi executado, migra o que ficou aberto, e nasce o plano da campanha seguinte. É por isso que só existem três arquivos aqui, e sempre os mesmos três.

## Os três arquivos

| Arquivo | O que é | Natureza |
| --- | --- | --- |
| `00-indice.md` | Este arquivo — a porta de entrada da pasta. | Vivo |
| [`00-prompts-execucao.md`](./00-prompts-execucao.md) | **O plano executável.** Regras comuns, decisões do dono, roteiro de fases, briefing de cada uma e a tabela de achados com a rota de cada um. | Vivo |
| [`00-progresso.md`](./00-progresso.md) | **O log append-only.** Uma entrada por execução: o que foi feito, como, e o que ficou pendente. Nunca se edita entrada alheia; só se acrescenta. | Append-only |

## Campanha em curso

**Campanha 2 — "Adequação do Sistema"** (semeada em 2026-07-31, ao fim da Campanha 1).

> *Primeiro corrigimos e limpamos as specs (Campanha 1); depois adequamos o sistema ao que ficou escrito.*

A Campanha 1 ("Reescrita da Base de Specs", P0–P28) **está concluída**: ela produziu os 8 ADRs, os 6 documentos de arquitetura, as 15 specs definitivas e os dois kits (`sarak-ui/` e `sarak-dev/`). Ela **mediu** a dívida do sistema e não pagou nenhuma — de propósito. A Campanha 2 é o pagamento.

O roteiro das 8 fases, as 15 decisões do dono e os **29 achados** com a rota de cada um estão em [`00-prompts-execucao.md`](./00-prompts-execucao.md). O histórico integral da Campanha 1 está no git e em [`00-progresso.md`](./00-progresso.md).

## Antes de executar qualquer item (leitura obrigatória)

1. **Skill `ui-contexto-repositorio`** — acione primeiro, sempre.
2. **`sarak-dev/START-HERE.md`** — o índice operacional da base e o carimbo de estado do repositório.
3. **[`00-prompts-execucao.md`](./00-prompts-execucao.md)** inteiro — as regras comuns, o baseline e a regra de DIVERGÊNCIA.
4. **[`00-progresso.md`](./00-progresso.md)** — quem já executou o quê e o que ficou pendente.

## Ao terminar (obrigatório)

1. Marque o checkbox no roteiro de `00-prompts-execucao.md`.
2. Adicione uma entrada em `00-progresso.md`.
3. Rode `npm run dev-kit` se qualquer contagem do repositório mudou.
4. **Não commite sem autorização do dono.**

> ⚠️ **O `npm run audit` NÃO está em zero.** Compare com o baseline de `specs/specs/01-gates-e-baseline.md`, nunca com zero. Acusar regressão onde há dívida conhecida custa uma rodada inteira.
