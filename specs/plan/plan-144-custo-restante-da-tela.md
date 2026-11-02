---
tipo: "plan"
titulo: "Eliminar o custo restante da troca de tema e o recálculo a cada movimento do mouse"
objetivo: "Fazer o movimento do mouse parar de recalcular a página inteira e a troca de tema chegar a até 300 ms numa máquina normal e 1,5 s com CPU quatro vezes mais lenta, tirando o recálculo da retirada da marca e o JavaScript repetido do painel"
dominio: "Design Engine / Painel de customização"
status: "🟠 Em revisão"
prioridade: "Alta"
tags: ["plan", "desempenho", "tema", "painel"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[11-testes-e-cobertura]]", "[[plan-139-painel-previas-reais]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/specs/06-painel-de-customizacao-e-preview.md"
---

# 1. Objetivo

Mover o mouse não custa nada, e a troca de tema chega à meta que a `plan-142` deixou aberta.

# 2. Contexto

A `plan-142` cortou de 70% a 89%. Medido pelo revisor em 2026-11-01 (galeria aberta, 2.057 elementos): tema ~1.000 ms na primeira troca, ~555 ms nas seguintes e 3.894 ms com CPU 4×. A meta segue em 300 ms e
1,5 s. O dono aceitou o resultado e pediu esta continuação, antes da `plan-139`, cuja prévia ao passar o mouse exige composição quase instantânea.

**Rotina de medição.** Monte o painel público (`SarakUIProvider` + `SarakCustomizationPanel`) em build de produção e, pelo Playwright com sessão CDP, leia `Performance.getMetrics` antes e depois do clique: `TaskDuration`,
`ScriptDuration`, `RecalcStyleDuration`, `LayoutDuration`, `RecalcStyleCount`. CPU lenta: `Emulation.setCPUThrottlingRate` com `rate: 4`. Espere a tela assentar antes de ler o fim.

**Já tentado e sem efeito:** duração de 0,01 ms em vez de `transition: none` piorou (a transição ainda é criada). Filtrar as variáveis das miniaturas ficou dentro do ruído.

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
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` §7.3 | orçamento por contagem |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` §4.1 | custo do rascunho |
| Teste | `browser-tests/troca-de-tema.spec.ts` | orçamento |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | sempre · CSS por token |

# 5. Instruções de execução

1. Fotografe o worktree. Meça o antes, com a rotina do §2, com **`dist/` exclusivo**.
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
- [ ] Tema em até 300 ms de CPU, e até 1,5 s com CPU 4×, medido pela rotina do §2. Se não der, diga o que falta, com número.
- [ ] Sem transição durante a troca; depois dela, hover e foco animam — `browser-tests/troca-de-tema.spec.ts` segue verde.
- [ ] Tetos baixados no spec de orçamento.
- [ ] `npm run cromo-css-real:check` verde inteiro.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo.

- `npx vitest run src/core/Provider src/core/Design src/features/DesignEngine` — uma vez.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` — uma vez.
- Medição independente, com a rotina do §2.
- O dono cronometra no ERP.

# 8. Destino da síntese

**Destino:** `specs/specs/06-painel-de-customizacao-e-preview.md` — §4.1: o custo por troca e a regra da marca. A variável removida vai em `docs/migracoes.md`, se for o caso.

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-01

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
```
 M src/core/Design/palette/__tests__/role-map.test.ts
 M src/core/Design/palette/__tests__/scale.test.ts
 M src/core/Design/palette/contrast.ts
 M src/core/Design/palette/role-map.ts
 M src/core/Design/palette/scale.ts
?? dist/*.js (chunks sem rastreio)
?? src/core/Design/palette/__tests__/three-bands.test.ts
```
(plan-143, não é desta tarefa; não toquei.)

**O que foi feito**
- `DesignInjector.tsx` (efeito do mousemove) — removida a escrita de `--mouse-x/--mouse-y` no `:root`. Busca em `src/`, `docs/`, `specs/`, `sarak-ui/`, `.agents/`: nenhum leitor (só a escrita, um teste e um comentário de gate). O ouvinte agora sai cedo se `data-sx-shadow-orientation` não é `dynamic`; com a luz dinâmica o comportamento é o mesmo.
- `useDesignDraftSync.ts:23` — a ponte painel→provedor passou de `useEffect` para `useLayoutEffect`: prévia e raiz mudam no mesmo quadro (antes, dois commits).
- `browser-tests/troca-de-tema.spec.ts` — caso novo "mover o mouse não recalcula o estilo da tela inteira" (Tracing do CDP, `UpdateLayoutTree.elementCount`), contagem de recálculos de tela inteira na troca, tetos baixados.
- `DesignInjector.test.tsx` e comentário de `check-channel-dispute.ts` — acompanham a remoção.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Provider/components/DesignInjector.tsx` | alterado | sem `--mouse-x/y`; luz só com `dynamic` |
| `src/features/DesignEngine/hooks/useDesignDraftSync.ts` | alterado | `useLayoutEffect` na ponte |
| `src/core/Provider/components/__tests__/DesignInjector.test.tsx` | alterado | `--mouse-x/y` ficam vazias |
| `gates/scripts/contrato/check-channel-dispute.ts` | alterado | só comentário |
| `browser-tests/troca-de-tema.spec.ts` | alterado | caso do mouse, recálculos de tela inteira, tetos |

**Verificações executadas**
- `npx vitest run src/core/Provider src/core/Design/hooks src/core/Design/components src/features/DesignEngine/hooks` → 88 arquivos, 735 testes verdes.
- `playwright test troca-de-tema.spec.ts` → 4 passed (8 execuções seguidas: 23–27 recálculos, 139–145 transições, 2 recálculos de tela inteira, mouse máx. 470 de 2.055 elementos).
- Mutação do mouse (DesignInjector do `HEAD`): vermelho nos dois modos, `Received: 2124`, esperado `< 1027`; restaurado.
- Mutação da ponte (`useEffect` de volta): spec de orçamento **continuou verde** — o spec não guarda a fusão dos commits (ver pendências).
- `npm run build` → verde. `npm run verify -- --tier=quick` → verde.
- `npx playwright test` (bateria inteira, `dist/` recém-gerado) → **saiu com código 4**; vi 139 casos `ok` e a saída foi cortada (`tail`), não tenho o total nem as falhas. Não declaro `cromo-css-real:check` verde.
- `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts` → feito; `dist/` não rastreado segue como estava.

Medição (build de produção do harness, galeria aberta, 2.055 elementos; `TaskDuration`; máquina com carga, ±30%). Antes = `HEAD` desta tarefa, depois = worktree:

| Cenário | Antes | Depois |
|---|---|---|
| Tema, normal (3 trocas) | 574 / 691 / 516 ms | 502 / 531 / 462 ms |
| Tema, CPU 4× | 4.173 / 4.067 / 3.324 ms | 3.269 / 3.232 / 2.766 ms |
| 20 movimentos de mouse, normal | 3.228 ms (estilo 1.432) | 461 ms (estilo 48) |
| 20 movimentos de mouse, CPU 4× | 13.319 ms (estilo 10.515) | 2.745 ms (estilo 301) |
| Recálculos de tela inteira na troca (trace) | 3 (2169/1703/2169 elementos) | 2 (2169/1706) |

**Critérios de aceite**
- [x] Mover o mouse não recalcula a árvore inteira — spec do mouse; mutação vermelha (2124) / verde (470).
- [ ] Tema em até 300 ms / 1,5 s com CPU 4× — NÃO: ~460–530 ms e ~2,8–3,3 s. Falta: a troca e a retirada da marca (2 recálculos de tela inteira, ~60–90 ms cada, `UpdateLayoutTree`), um `Layout` de ~55–60 ms no próprio clique, ~48 ms de hit test após o estilo, ~100 ms de JS (`mergeUIContextValue` 24 ms, `diffProperties` 14 ms) e commits de camadas (~16 ms por quadro).
- [x] Sem transição durante a troca; hover anima depois — mesmo spec, verde.
- [x] Tetos baixados — recálculos 35→32, transições 273→174 (maior medida + 20%).
- [ ] `cromo-css-real:check` verde inteiro — NÃO confirmado (código 4, ver acima).

**Decisões e suposições**
- `--mouse-x/y` removida, não condicionada: ninguém lê; a luz dinâmica (`--sarak-light-*`) é mantida. Não há contrato público documentado, então não escrevi em `docs/migracoes.md` (o item é condicional: "se a variável pública sair") — o revisor decide se quer a nota.
- Teto do caso do mouse em 50% da tela: o hover de um cartão visita 23%; a escrita antiga, 103%.
- A plan estava em `🔴` ao chegar; executei por confirmação explícita do usuário.
- Retirada da marca (passo 3): não eliminei. Alternativas pensadas e não implementadas: seletor sem descendente (todo `transition` precisa mudar de valor, então a árvore inteira recalcula), `display:none` (dois recálculos), `transition-duration: 0,01ms` (já medido pior na plan-142), adiar a retirada (o hover deixaria de animar e o CPU total não diminui). Só medi a variante atual.
- Passo 5 (perfil): feito (Tracing + Profiler); itens listados acima com número.

**Achados fora do escopo (não corrigidos)**
- O spec de orçamento não protege a fusão dos commits da prévia e da raiz: com `useEffect` de volta ele passa. A contagem manual de `UpdateLayoutTree` mostrou 3→2, mas a contagem dentro do spec deu ≤2 nos dois casos (a instrumentação difere). Precisa de um caso próprio.
- Um `Layout` de ~55 ms ocorre dentro do clique do cartão; não encontrei leitura forçada de geometria em JS (monkey-patch sem ocorrência) — origem não identificada.

**Pendências / riscos**
- Meta de 300 ms / 1,5 s não batida.
- Bateria `playwright` inteira terminou com código 4 e não li as falhas; reexecutar com saída completa e `dist/` exclusivo (plans 138/143 ainda em andamento no worktree).
- `useLayoutEffect` na ponte muda o momento em que o provedor recebe o rascunho (mesmo quadro). Suítes de DesignEngine/Provider passaram; não rodei a suíte completa.
- Medição ruidosa (máquina com carga); os números servem para ordem de grandeza.

---

# 10. Veredito

## Veredito — 2026-11-01 — técnica conferida, meta não atingida, decisão do dono

Numa cópia limpa, `HEAD` + 144, sem a 143: `npm run build` verde, suíte completa com 600 arquivos e 4.497 testes, bateria de navegador 455 de 455. O código 4 relatado no resumo não se repete.

Medição independente, rotina do §2, máquina livre, mesmo painel:

| Cenário | rc.4 | Depois da 142 | Agora |
|---|---|---|---|
| Tema, primeira troca | 3.467 ms | ~1.000 ms | 543 a 731 ms |
| Tema, troca seguinte | 2.290 ms | ~555 ms | ~435 ms |
| Tema, CPU 4× | 35.264 ms | 3.894 ms | 2.785 a 3.650 ms |
| Aplicar | 819 ms | ~337 ms | ~270 ms |
| Aplicar, CPU 4× | 15.678 ms | 2.089 ms | 1.605 ms |

Mover o mouse deixou de recalcular a tela: 20 movimentos foram de 3.228 ms a 461 ms, medido pelo executor. `--mouse-x`/`--mouse-y` não têm leitor em `src/`, `docs/`, `sarak-ui/` nem no ERP; sem nota em `docs/migracoes.md`.

A meta de 300 ms e 1,5 s **não** foi batida. O resto é o custo de recalcular 2 mil elementos duas vezes, proporcional ao tamanho da tela, e a galeria aberta conta nele. A `plan-140` tira a galeria de cima da prévia. Achado sem bloqueio: o spec não protege a
fusão dos commits (backlog #60).
