---
tipo: "plan"
titulo: "Fazer a troca de tema levar menos de meio segundo"
objetivo: "Fazer a troca de tema e de modo terminar em até 300 ms numa máquina normal e em até 1,5 s com a CPU quatro vezes mais lenta, sem transição durante a troca e sem recálculo de estilo repetido, com um teste de navegador que impeça a lentidão de voltar"
dominio: "Design Engine / Painel de customização"
status: "🔴 A executar"
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
- `src/features/DesignEngine/Canvas/components/PresetCard.tsx`, `Main/components/PaletteSwatch.tsx` e os escopos do painel, com testes.
- `browser-tests/` — um spec novo de orçamento de recálculo, com fixture.
- Snapshots alterados por estas mudanças.

## 3.2 Fora
- Redesenho do painel (plans 138 a 141).
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
6. **Render.** `useMemo` em `PresetCard` e `PaletteSwatch`, chaveado pelo tema e pelo modo.
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

---

# 10. Veredito
