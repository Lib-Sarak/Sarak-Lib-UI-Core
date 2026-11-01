---
tipo: "plan"
titulo: "Fazer a troca de tema levar menos de meio segundo"
objetivo: "Fazer a troca de tema e de modo terminar em até 300 ms numa máquina normal e em até 1,5 s com a CPU quatro vezes mais lenta, sem transição durante a troca e sem recálculo de estilo repetido, com um teste de navegador que impeça a lentidão de voltar"
dominio: "Design Engine / Painel de customização"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "desempenho", "tema", "painel"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[02-design-engine]]", "[[11-testes-e-cobertura]]", "[[plan-138-painel-ganhos-rapidos-fontes-paletas-e-acoes]]", "[[plan-139-painel-previas-reais]]"]
depende_de: "plan-136-cor-ancora-fundo-tingido-e-harmonia-visivel"
retida_por: ""
destino_sintese: "specs/specs/06-painel-de-customizacao-e-preview.md + specs/specs/11-testes-e-cobertura.md"
---

# 1. Objetivo

Trocar de tema deixa de parecer travado: a tela muda de uma vez, em até 300 ms numa máquina normal e em até 1,5 s com CPU 4× mais lenta.

# 2. Contexto

O dono cronometrou de 9 a 14 segundos para aplicar um tema no ERP. Presets aplicam rápido. O revisor reproduziu no painel real da tag
`v8.0.0-rc.4`, no Chromium, com 2.134 elementos, sem o ERP (2026-10-31):

| Cenário | CPU total | Script | Estilo | Layout | Recálculos de estilo |
|---|---|---|---|---|---|
| Trocar tema | 3.467 ms | 361 | **2.349** | 153 | 38 |
| Trocar tema, CPU 4× | 35.264 ms | 3.507 | **25.439** | 1.094 | 56 |
| Trocar tema, transições desligadas por CSS | 1.366 ms | 365 | **478** | 133 | 28 |
| Clicar em Aplicar | 819 ms | 450 | 147 | 8 | 21 |

Preset de card, para comparar: cerca de 500 ms (soma das tarefas longas).

**O custo é recálculo de estilo, não JavaScript.**

1. **Transição.** Um tema troca centenas de variáveis, e cada elemento com transição recalcula a cada quadro enquanto ela dura. Há 42 usos de
   `transition: all`/`transition-all` em `src/styles` e `src/components/atomic`. Desligar tudo cortou o estilo em 80% e o total em 60%.
2. **Variáveis repetidas (hipótese, não isolada).** 203 elementos da tela carregam variáveis no estilo inline. As miniaturas da galeria são a
   suspeita principal.
3. **Trabalho repetido no render.** `Canvas/components/PresetCard.tsx:38` recalcula `withThemePalette` e `useDesignVariables` a cada render,
   sem `useMemo`. `Main/components/PaletteSwatch.tsx` resolve a paleta nos dois modos a cada montagem. Uma paleta custa de 5 a 19 ms no Node.

**Decisão do dono (2026-10-31):** a troca é instantânea, sem o efeito suave.

**Medição.** Monte o painel público (`SarakUIProvider` + `SarakCustomizationPanel`) e, pelo Playwright com sessão CDP, leia
`Performance.getMetrics` antes e depois do clique: `TaskDuration`, `ScriptDuration`, `RecalcStyleDuration`, `LayoutDuration`,
`RecalcStyleCount`. CPU lenta: `Emulation.setCPUThrottlingRate` com `rate: 4`. Build de produção; espere a tela assentar antes de ler o fim.

# 3. Escopo

## 3.1 Dentro
- `src/core/Provider/` e `src/core/Design/hooks/` — o sinal de troca de tema em curso, no caminho que escreve as variáveis.
- `src/styles/` — a regra que desliga as transições durante a troca e os `transition: all` que forem trocados.
- `src/components/atomic/` — `transition-all` que forem trocados, sem mudar o que anima.
- `src/features/DesignEngine/Canvas/components/PresetCard.tsx` e os escopos do painel, com testes.
- `browser-tests/` — um spec novo de orçamento de recálculo, com fixture.
- Snapshots alterados por estas mudanças.

## 3.2 Fora
- Redesenho do painel (plans 138 a 141). `PaletteSwatch` fica com a `plan-138`, que o reescreve em paralelo.
- O cálculo de paleta e o formato dos temas (plan-136).
- Remover transição de hover, foco, abertura de modal ou drawer: fora da troca, tudo anima como antes.
- Trocar o mecanismo de variáveis CSS do Design Engine.
- `dist/`, `sarak-ui/`, `sarak-dev/` (gerados).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` §4, §4.1, §6.1 | rascunho e custo de aninhar `DesignScope` |
| Spec fixa | `specs/arquitetura/02-design-engine.md` | como as variáveis são emitidas e as camadas de CSS |
| Spec fixa | `specs/specs/09-temas-e-presets.md` §4.3.2 | tema sob demanda |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` §7.3 | medição em navegador |
| Código | `src/core/Provider/components/DesignInjector.tsx` · `src/core/Provider/SarakUIProvider.tsx` | onde as variáveis são escritas |
| Teste | `browser-tests/transicao-padrao-do-tema.spec.ts` | a transição do tema tem de seguir valendo fora da troca |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | sempre · CSS por token |

# 5. Instruções de execução

1. Fotografe o worktree. Meça o **antes**, como no §2, com a lib atual: tema, Aplicar, troca de modo; normal e CPU 4×. Tabela no resumo.
2. **Sem transição durante a troca.** Ao trocar tema, aplicar rascunho ou trocar o modo, a lib marca a raiz do escopo e uma regra de CSS desliga
   `transition` e `animation` de transição nos descendentes; a marca sai depois da pintura. Três armadilhas:
   - A marca tem de entrar **antes** de as variáveis mudarem. `DesignInjector` as escreve em efeito de layout, então a ordem precisa ser provada
     no navegador, e não deduzida.
   - `!important` inverte dentro de camadas de CSS. Prove que a regra vence no consumidor e no modo embarcado (`.sarak-scope` e portais).
   - Ajuste de um token só (arrastar slider) **não** entra nesse caminho.
3. Meça. Só depois decida quanto dos passos 4 a 6 ainda é preciso para bater a meta. Se a meta já foi batida, faça os passos 4 e 5 só onde o
   ganho medido aparecer, e diga no resumo o que ficou de fora.
4. **`transition: all`.** Troque pelas propriedades realmente animadas onde o efeito visual não mudar. Liste o que trocou.
5. **Variáveis repetidas.** Isole o custo das 203 ocorrências, com a galeria aberta e fechada. Se confirmado, cada miniatura leva só as variáveis que
   usa, e cartão fora da tela não redesenha (`content-visibility` ou renderização sob demanda). Sem mudar a aparência dela.
6. **Render.** `useMemo` em `PresetCard`, chaveado pelo tema e pelo modo.
7. **Orçamento no navegador.** Spec novo: trocar de tema com a galeria aberta fica abaixo de um teto de `RecalcStyleCount`, com o teto em constante
   nomeada (o valor medido + 20%), e com a CPU sem redução. **Não** afirme em milissegundos: tempo varia por máquina. Ao fim da troca, a transição
   computada de um botão volta ao valor do tema.
8. Meça o **depois** com a mesma rotina do passo 1. Tabela no resumo.
9. `npm run build` e `npm run cromo-css-real:check` inteiro, uma vez, com a linha final no resumo. Depois:
   `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`.
10. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] Troca de tema em até 300 ms de CPU, e até 1,5 s com CPU 4× — tabela do resumo, medida como no §2.
- [ ] Sem transição durante a troca; depois dela, hover e foco animam como antes — navegador.
- [ ] Vale no consumidor e no modo embarcado — navegador.
- [ ] Arrastar um slider não aciona a marca — teste.
- [ ] Spec de orçamento verde, e vermelho sem o conserto do passo 2 (mutação no resumo).
- [ ] `transicao-padrao-do-tema` verde sem alteração.
- [ ] `npm run cromo-css-real:check` verde inteiro.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo. O spec de orçamento roda no job `cromo-css-real`.

- `npx vitest run src/core/Provider src/core/Design src/features/DesignEngine src/components/atomic` — uma vez.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` — uma vez.
- Medição independente do revisor, sobre `dist/` gerado, com a rotina do §2.
- O dono cronometra no ERP: é a medida que abriu a plan.

# 8. Destino da síntese

**Destino:** `specs/specs/06-painel-de-customizacao-e-preview.md` + `specs/specs/11-testes-e-cobertura.md`.

- 06 §4.1: a troca de tema é instantânea, sem transição, e tem orçamento medido de recálculo de estilo.
- 11 §7.3: a família de casos do orçamento, e por que ela afirma contagem, não tempo.

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-01

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
(limpo)

**O que foi feito**
- `src/core/Provider/utils/themeSwitchMark.ts` (novo) — contagem de variáveis mudadas, corte `THEME_SWITCH_MIN_CHANGED_VARIABLES = 200` (medido: tema 557, modo 506, token isolado no máximo 49), escrita e retirada da marca `data-sarak-theme-switching` dois quadros depois.
- `src/core/Provider/components/DesignInjector.tsx` — marca a raiz (ilha + portais `.sarak-scope` no Embarcado) antes de escrever as variáveis, na mesma tarefa; cancela ao desmontar.
- `src/core/Design/hooks/useThemeSwitchFlag.ts` (novo) e `src/core/Design/components/DesignScope.tsx` — o escopo da prévia do painel muda num commit anterior ao da raiz e leva a própria marca, no mesmo commit das variáveis.
- `src/styles/_motion.css` — regra `transition: none !important` sob `:root[...]` e `.sarak-design-scope[...]`, na camada final (precedente do movimento reduzido; a variante escopada troca `:root` pela ilha). `css-important:check` verde.
- `PresetCard.tsx` — `useMemo` do tema resolvido, chaveado por `theme.design`, `theme.contraparte` e modo.
- `browser-tests/troca-de-tema.spec.ts` + `fixtures/troca-de-tema-entry.tsx` (novos) — orçamento e ordem, nos dois modos.
- Testes de unidade novos: `themeSwitchMark.test.ts`, `DesignInjector.themeSwitch.test.tsx`, `useThemeSwitchFlag.test.tsx`, `PresetCard.memo.test.tsx`.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Provider/utils/themeSwitchMark.ts` | criado | helpers da marca |
| `src/core/Provider/components/DesignInjector.tsx` | alterado | marca antes das variáveis |
| `src/core/Design/hooks/useThemeSwitchFlag.ts` | criado | flag derivada no render |
| `src/core/Design/components/DesignScope.tsx` | alterado | atributo da marca |
| `src/styles/_motion.css` | alterado | regra de troca |
| `src/features/DesignEngine/Canvas/components/PresetCard.tsx` | alterado | `useMemo` |
| `browser-tests/troca-de-tema.spec.ts`, `browser-tests/fixtures/troca-de-tema-entry.tsx` | criados | orçamento no navegador |
| 4 arquivos `__tests__` | criados | unidade |

**Verificações executadas**
- `npx vitest run` nos arquivos novos e nos vizinhos (DesignInjector, DesignScope, PresetCard) → verdes.
- Medição (build de produção do harness a partir de `src/`, CSS gerado fora de `dist/`, galeria aberta, 2.055 elementos, Chromium; a máquina estava com outros executores, então os números oscilam cerca de ±30%). Tempo = `TaskDuration`:

| Cenário | Antes | Depois |
|---|---|---|
| Tema, normal | 3.114 ms (estilo 1.857, 29 recálculos, 1.857 transições) | ~800 ms (estilo ~350, ~27 recálculos, 224 transições) |
| Tema, CPU 4× | 19.738 ms (estilo 11.030) | ~4.900 a 5.600 ms (estilo ~1.800 a 2.250) |
| Modo, normal | 3.533 ms | ~1.000 ms |
| Modo, CPU 4× | 18.541 ms | ~5.800 a 7.800 ms |
| Aplicar, normal | 1.572 ms | ~500 ms |
| Aplicar, CPU 4× | 13.046 ms | ~4.200 a 7.000 ms |

- Variante intermediária medida: duração de 0,01 ms em vez de `none` ficou pior (estilo 5.635 ms), porque a transição ainda é criada (4.899 `transitionrun`); por isso `transition: none`.
- Perfil: sobram 4 recálculos de árvore inteira de ~130 ms cada (prévia, raiz, e a retirada da marca, que invalida `:root[...] *`).
- `npx playwright test browser-tests/troca-de-tema.spec.ts` → 2 passed, 9 execuções seguidas; 221 a 227 transições e 25 a 29 recálculos; tetos `273` e `35` (maior medida + 20%).
- Mutação: com `isThemeSwitch(...)` trocado por `false &&` no `DesignInjector`, o spec ficou vermelho nos dois modos (a marca da raiz nunca aparece); restaurado.
- `npm run verify -- --tier=quick`: `tsc` OK; `audit:baseline` acusou `auditor_cleancode` 0→1 em `useThemeSwitchFlag.ts` (4 `useState/useEffect`), corrigido e `run_audit` limpo; `plan-index:check` (plan-143) e `guide:check` (kit `sarak-ui/`) falharam e não são desta plan.
- `npm run cromo-css-real:check` inteiro: 431 passed, 6 failed, 16 did not run — dois spec meus passaram quando `dist/sarak.css` tinha a regra (na bateria o `dist/` estava com o CSS de outro build); os outros: `previa-138.spec.ts` (arquivo de outra plan sumiu no meio da execução), `login-theme-application` (fundo do Sovereign esperado `#061011`, recebido `#08090a`; plan-143 mexe em `role-map`/`scale`/`contrast`), 3 quedas do worker (código 3221226091/1073807364) em specs alheios.

**Critérios de aceite**
- [ ] Tema em até 300 ms de CPU (1,5 s com CPU 4×) — NÃO atendido: ~800 ms e ~5 s medidos. Motivo: restam recálculos de árvore inteira e o JS do painel.
- [x] Sem transição durante a troca; hover anima depois — `troca-de-tema.spec.ts` (computado `none` na entrada da marca, valor do tema depois, `transitionrun` no hover).
- [x] Vale no consumidor e no Embarcado — mesmo spec, folha escopada.
- [x] Slider não aciona a marca — `DesignInjector.themeSwitch.test.tsx` (5 passos de 3 variáveis) e `themeSwitchMark.test.ts` (49 variáveis).
- [x] Spec de orçamento verde e vermelho sem o conserto — mutação acima.
- [x] `transicao-padrao-do-tema` verde sem alteração — passou na bateria completa.
- [ ] `cromo-css-real:check` verde inteiro — NÃO: 6 falhas listadas, nenhuma confirmada como minha; `npm run build` inteiro falhou uma vez em `public-types:check` (`DirtyToken`, de outra plan, depois corrigido por ela).

**Decisões e suposições**
- Passo 4 (`transition: all`) não foi feito: com a marca ligada o ganho na troca é nulo e a plan manda trocar só onde o ganho aparece. Passo 5 (variáveis da miniatura): A/B com variáveis filtradas deu 320/297 ms contra 256/297 ms de estilo (soma dos recálculos, 2 rodadas), dentro do ruído, não confirmado e não aplicado.
- Corte por contagem de variáveis (200), porque o injetor só vê o design resolvido, não de onde veio a mudança.
- A raiz é marcada num commit ~300 ms depois da prévia; entre os dois o que está fora da prévia ainda pode animar (observei 14 transições).
- A plan estava em `🔴` ao chegar; executei por pedido explícito do usuário.

**Achados fora do escopo (não corrigidos)**
- `DesignInjector.tsx` escreve `--mouse-x/--mouse-y` no `:root` a cada `mousemove`: cada movimento do ponteiro invalida a árvore inteira (cerca de 130 ms de recálculo medido) e entra em qualquer cronometragem de clique.
- `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts` (passo 9) foi negado pelo ambiente e não foi feito; `dist/` e os dois `buildInfo.ts` seguem modificados por builds.

**Pendências / riscos**
- Meta de 300 ms / 1,5 s não batida; proposta de continuação: eliminar o recálculo de retirada da marca e a escrita de `--mouse-x/y`, e reduzir o JS do painel.
- Reexecutar `cromo-css-real:check` com `dist/` exclusivo e com as plans 138/143 assentadas.

---

# 10. Veredito

## Veredito — 2026-11-01 — técnica conferida, meta não atingida, decisão do dono

Medido numa cópia limpa, `HEAD` + 138 + 142, sem a 143: `npm run build` verde, suíte completa 600 arquivos e 4.497 testes, bateria de navegador 453 de 453. As falhas da bateria relatadas no resumo vieram do `dist/` disputado, e não se repetem. Medição independente do revisor, com a rotina do §2, máquina livre, mesmo painel:

| Cenário | rc.4 | Agora |
|---|---|---|
| Tema, primeira troca | 3.467 ms | ~1.000 ms |
| Tema, troca seguinte | 2.290 ms | ~555 ms |
| Tema, CPU 4× | 35.264 ms | 3.894 ms |
| Aplicar | 819 ms | ~337 ms |
| Aplicar, CPU 4× | 15.678 ms | 2.089 ms |

Queda de 70% a 89%. A meta de 300 ms e 1,5 s **não** foi batida. Sobra: o recálculo ao retirar a marca, a escrita de `--mouse-x`/`--mouse-y` em `:root` a cada movimento do ponteiro e o JS do painel. O código entregue
é correto e não piora nada. O dono decide entre aceitar e abrir uma continuação. O passo 4 não feito e o passo 5 sem efeito medido estão aceitos: a plan mandava fazer só onde o ganho aparecesse.

## Veredito — 2026-11-01 — 🟢 Aprovado com a meta aberta

O dono aceitou o resultado. O que falta para a meta de 300 ms e 1,5 s foi para a `plan-144`.
