---
tipo: "plan"
titulo: "Eliminar o custo restante da troca de tema e o recálculo a cada movimento do mouse"
objetivo: "Fazer o movimento do mouse parar de recalcular a página inteira e a troca de tema chegar a até 300 ms numa máquina normal e 1,5 s com CPU quatro vezes mais lenta, tirando o recálculo da retirada da marca e o JavaScript repetido do painel"
dominio: "Design Engine / Painel de customização"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "desempenho", "tema", "painel"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[11-testes-e-cobertura]]", "[[plan-139-painel-previas-reais]]"]
depende_de: "plan-142-desempenho-da-troca-de-tema"
retida_por: ""
destino_sintese: "specs/specs/06-painel-de-customizacao-e-preview.md"
---

# 1. Objetivo

Mover o mouse não custa nada, e a troca de tema chega à meta que a `plan-142` deixou aberta.

# 2. Contexto

A `plan-142` cortou de 70% a 89%. Medido pelo revisor em 2026-11-01 (galeria aberta, 2.057 elementos): tema ~1.000 ms na primeira troca, ~555 ms nas seguintes e 3.894 ms com CPU 4×. A meta segue em 300 ms e
1,5 s. O dono aceitou o resultado e pediu esta continuação, antes da `plan-139`, cuja prévia ao passar o mouse exige composição quase instantânea.

**O que sobra:**

1. **\`--mouse-x\` e \`--mouse-y\`.** `src/core/Provider/components/DesignInjector.tsx:94-95` escreve as duas no `:root` a cada movimento. Cada escrita invalida a árvore inteira: cerca de 130 ms medidos. **Nada em `src/` lê essas variáveis:**
   o único resultado da busca é a escrita. Afeta todo sistema que usa a lib, não só o painel.
2. **Retirada da marca.** Tirar `data-sarak-theme-switching` invalida `:root[...] *` e custa mais um recálculo completo. Com a marca do escopo, são 4 recálculos de árvore inteira por troca, de ~130 ms cada.
3. **Commits separados.** A prévia muda num commit e a raiz cerca de 300 ms depois: a troca acontece duas vezes.
4. **JavaScript do painel.** Na primeira troca: 112 ms de script e ~390 ms de estilo e layout, sobre 1.000 ms de CPU. O resto ainda não tem causa medida.

# 3. Escopo

## 3.1 Dentro
- `src/core/Provider/components/DesignInjector.tsx` e testes — o item 1.
- `src/core/Provider/utils/themeSwitchMark.ts`, `src/core/Design/hooks/useThemeSwitchFlag.ts`, `src/core/Design/components/DesignScope.tsx`, `src/styles/_motion.css` — a marca.
- `src/features/DesignEngine/hooks/`, `Main/`, `Canvas/` — só o que a medição apontar.
- `browser-tests/troca-de-tema.spec.ts` — baixar os tetos; caso novo do mouse.
- `docs/migracoes.md` — se a variável pública sair.

## 3.2 Fora
- Redesenho do painel (plans 139 a 141). Mudar o mecanismo de variáveis CSS. Transições fora da troca.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Plan | `specs/plan/plan-142-desempenho-da-troca-de-tema.md` §2 e §10 | a rotina de medição e o que já foi tentado |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` §4.1 | custo do rascunho |
| Teste | `browser-tests/troca-de-tema.spec.ts` | orçamento |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | sempre · CSS por token |

# 5. Instruções de execução

1. Fotografe o worktree. Meça o antes, com a rotina da plan-142, com **`dist/` exclusivo**.
2. **Mouse.** Procure `--mouse-x`/`--mouse-y` também em `docs/`, no guia, no catálogo, nos temas e nos importadores conhecidos. Se ninguém lê, remova a escrita e o ouvinte. Se a variável for contrato público, ela só escreve quando alguém pediu,
   e não no `:root`. Decida com a evidência e declare no resumo. Spec de navegador: mover o mouse 20 vezes não gera recálculo de estilo em toda a árvore.
3. **Marca.** Elimine o recálculo da retirada, com uma regra que não invalide `:root[...] *` ao sair ou uma forma de desligar transição que não exija mudar seletor de toda a árvore. Meça alternativas, sem deduzir.
4. **Uma troca só.** Prévia e raiz mudam no mesmo commit.
5. **Perfil.** Com CPU sem redução, use `Tracing` ou o Profiler do Chrome para achar o custo restante. Corrija o que render ganho e liste o resto, com número.
6. Baixe os tetos do spec de orçamento para o valor medido + 20%.
7. Meça o depois. Tabela no resumo.
8. `npm run build` e `npm run cromo-css-real:check` inteiro, uma vez, com `dist/` exclusivo. Depois: `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`.
9. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] Mover o mouse não recalcula a árvore inteira — navegador.
- [ ] Tema em até 300 ms de CPU, e até 1,5 s com CPU 4×, medido como na plan-142. Se não der, diga o que falta, com número.
- [ ] Sem transição durante a troca; depois dela, hover e foco animam — o spec da plan-142 segue verde.
- [ ] Tetos baixados no spec de orçamento.
- [ ] `npm run cromo-css-real:check` verde inteiro.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo.

- `npx vitest run src/core/Provider src/core/Design src/features/DesignEngine` — uma vez.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` — uma vez.
- Medição independente, com a rotina do §2 da plan-142.
- O dono cronometra no ERP.

# 8. Destino da síntese

**Destino:** `specs/specs/06-painel-de-customizacao-e-preview.md` — §4.1: o custo por troca e a regra da marca. A variável removida vai em `docs/migracoes.md`, se for o caso.

---

# 9. Resumo da execução

---

# 10. Veredito
