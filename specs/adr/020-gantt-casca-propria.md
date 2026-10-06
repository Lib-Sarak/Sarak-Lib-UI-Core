---
tipo: "adr"
titulo: "O Gantt da lib é casca própria, não componente de terceiro"
status: "🟢 Aceito"
tags: ["adr", "gestao-de-projetos", "gantt", "dependencias", "peso-de-bundle"]
relacionados: ["[[03-superficie-publica]]", "[[13-instalacao-e-atualizacao]]", "[[006-zero-marca-soberania-host]]"]
substitui: ""
substituido_por: ""
alternativas_consideradas:
  - opcao: "`@svar-ui/react-gantt` 2.7.3 (MIT), vestido com o tema da lib"
    custo: "+101,22 KB gzip só da biblioteca (teto do critério: 80 KB), e a edição gratuita não tem o marcador de hoje: marcadores, auto-agendamento, caminho crítico e exportação são da edição PRO, paga. A lib passaria a depender de um fornecedor cuja próxima função útil é paga"
  - opcao: "`frappe-gantt` 1.2.2 (MIT), com um invólucro React"
    custo: "+14,70 KB gzip e nenhuma superfície React: o invólucro (montar, atualizar, desmontar, ligar eventos e tema por CSS do fornecedor) seria código próprio de qualquer jeito, sem que o comportamento tenha sido medido"
---

# 1. Contexto e Problema

**Data da decisão: 2026-10-05 (avaliação medida; regra de decisão escrita antes de medir).**

A gestão de projetos que a lib vai servir (referência: o módulo de tarefas do SellersGO, que tem um Gantt de 166
linhas feito à mão) precisa de um **Gantt**: barras por data, dependências entre tarefas, linha do "hoje", escalas
dia/semana/mês, com o tema da lib e em celular. Antes de escrever, a decisão *"fazer ou adotar"* foi medida com
30 tarefas e 8 dependências, sob React 18 e 19 com `StrictMode`, pelo mesmo método de peso (esbuild, dois bundles,
gzip da diferença). A regra, escrita antes de medir: **o `@svar-ui/react-gantt` só vence se a edição gratuita
cobrir barras, dependências, arrastar e redimensionar, zoom e o marcador de hoje, com tema próprio em pelo menos 4
de 5 variáveis, até 80 KB gzip, e sem que a edição paga toque nesses cinco; senão, casca própria.**

| Candidato | Barras · dependências · arrastar · zoom | Hoje | Tema (5) | Gzip | Pago |
|---|---|---|---|---:|---|
| Casca própria (protótipo) | passou nos quatro | passou | 5/5 | **+3,10 KB** | nada |
| `@svar-ui/react-gantt` 2.7.3 | passou nos quatro | **falhou** na edição gratuita | 5/5 | **+101,22 KB** | marcadores, auto-agendamento, caminho crítico, exportação |
| `frappe-gantt` 1.2.2 | não medido (sem React) | — | — | +14,70 KB | — |

O toque em aparelho não foi medido para nenhum dos três.

# 2. Decisão

**O Gantt da lib é uma casca própria**, desenhada com os tokens do Design Engine, sem dependência de terceiro:
escala datas ↔ pixels, barras, setas de dependência em SVG e o marcador de hoje são código da lib. O que a
primeira versão entrega, e o que fica de fora, é contrato da superfície pública ([[03-superficie-publica]]),
não deste registro.

# 3. Consequências

- **Positivas:**
  - Nenhum peer novo para o consumidor e nenhum CSS de fornecedor brigando com o tema: o Gantt sai igual ao
    resto da lib, nos dois modos, e a marca continua do host ([[006-zero-marca-soberania-host]]).
  - O custo de peso é o menor medido (+3,10 KB no protótipo, contra +101,22 KB).
  - Nenhuma função depende de licença paga de terceiro.
- **Negativas (Trade-offs):**
  - A lib passa a **manter** o que um fornecedor manteria: cálculo de datas e escalas, arrastar e
    redimensionar barra, zoom, setas, acessibilidade por teclado e leitor de tela, e os testes de tudo isso.
  - Recursos avançados — auto-agendamento, caminho crítico, exportação, linha de base — **não vêm de graça**.
    Se um consumidor precisar deles, a conta muda: refazê-los à mão pode custar mais que a licença PRO.
  - O toque não foi medido em aparelho para a casca nem para as alternativas.
  - **Gatilho de reavaliação:** demanda real de auto-agendamento ou caminho crítico, ou um volume de tarefas
    que a casca não aguente sem virtualização. Aí esta decisão se reabre com um ADR novo, que a substitui.
