---
tipo: "adr"
titulo: "O arrastar e soltar do quadro kanban é o @dnd-kit, atrás de um adaptador único"
status: "🟢 Aceito"
tags: ["adr", "gestao-de-projetos", "kanban", "dependencias", "toque", "peso-de-bundle"]
relacionados: ["[[03-superficie-publica]]", "[[13-instalacao-e-atualizacao]]", "[[020-gantt-casca-propria]]", "[[03-versionamento-e-release]]"]
substitui: ""
substituido_por: ""
alternativas_consideradas:
  - opcao: "`@atlaskit/pragmatic-drag-and-drop` + `-auto-scroll` 3.2.1"
    custo: "+9,15 KB gzip, mais +0,65 KB do adaptador de teclado — o mais leve. O toque depende do arrastar NATIVO do navegador, que varia por navegador móvel: se ele falhar, o quadro fica inoperante no celular"
  - opcao: "`@hello-pangea/dnd`"
    custo: "+30,72 KB gzip, e reprovado no critério de rolagem de borda horizontal (0 px rolados em 5 de 5 tentativas) — fora antes do custo"
---

# 1. Contexto e Problema

**Data da decisão: 2026-10-05 (avaliação medida no lote 1 da plan do quadro; decisão do dono pelo risco).**

O `SarakKanban` arrastava pela API HTML5 nativa: não respondia a toque e soltava sempre no fim da coluna. Um
sistema de gestão de projetos precisa de reordenação pelo índice onde se soltou, de toque no celular e de teclado.
Três bibliotecas foram medidas com o mesmo método (mouse real, 800 × 900, 1,5 s na borda; peso pelo esbuild, gzip
da diferença, com toda a API que o quadro usa):

| Candidato | Rolagem de borda horizontal (5×) | Vertical (5×) | Gzip |
|---|---|---|---:|
| `@dnd-kit/core` + `@dnd-kit/sortable` | 366 px × 5 | 122 px × 5 | **+16,03 KB** |
| `@hello-pangea/dnd` | **0 × 5** | 122 × 5 | +30,72 KB |
| `@atlaskit/pragmatic-drag-and-drop` | 366 × 5 | 122 × 5 | **+9,80 KB** (com o adaptador de teclado) |

**O toque em aparelho não foi medido para nenhum dos três.** O toque simulado (eventos de ponteiro e de toque por
CDP) não reproduz a arbitragem real de rolagem do navegador, e o dono só consegue medir num sistema importador
atualizado, depois da release.

# 2. Decisão

**O quadro arrasta com `@dnd-kit/core` + `@dnd-kit/sortable`**, como **peers opcionais** — só quem renderiza um
`SarakKanban` precisa instalá-las. A escolha foi feita **sob incerteza, pelo risco**: o toque do dnd-kit vem de um
sensor próprio (atraso de 250 ms e tolerância de 5 px), que não depende do arrastar nativo do navegador; errar com
ele custa peso num chunk carregado sob demanda, e errar com o Pragmatic deixaria o quadro inoperante no celular.

**Toda a biblioteca fica atrás de um adaptador único**, `useKanbanDrag` (`DataDisplay/SarakKanban/useKanbanDrag.ts`):
é o único arquivo do código-fonte que a importa. Trocar de biblioteca mexe nele e em nenhum outro. O contrato que o
quadro entrega ao consumidor é da superfície pública ([[03-superficie-publica]]), não deste registro.

# 3. Consequências

- **Positivas:**
  - Toque, teclado e rolagem de borda com uma biblioteca que já roda num sistema de referência (SellersGO).
  - A biblioteca não entra no boot do consumidor: o quadro é carregado sob demanda, e o `dist/index.js` não a
    referencia.
  - A troca de biblioteca, se vier, é de um arquivo.
- **Negativas (Trade-offs):**
  - **Peer público:** o consumidor que usa o quadro instala duas libs a mais, e a versão delas passa a ser contrato
    (por isso o adaptador). A mudança sai como MAJOR na 8.0.0 ([[03-versionamento-e-release]] §3).
  - O dnd-kit não tem versão nova desde 2024-12; o adaptador contém o risco, não o elimina.
  - +6,23 KB gzip a mais que o Pragmatic, no chunk do quadro.
  - **Validação pendente:** o toque em aparelho (pressão longa, índice certo entre colunas, rolagem da página sem
    briga) e o arrasto por mouse e pelas setas do teclado num navegador real **ainda não foram medidos**. A medição
    acontece no primeiro sistema importador atualizado, pelo dono ([[00-backlog]], item 20).
- **Gatilho de reavaliação:** a medição em aparelho falhar, ou o toque nativo ser provado nos navegadores
  móveis-alvo e o peso do chunk do quadro passar a importar. Aí esta decisão se reabre com um ADR novo, que a
  substitui — e o Pragmatic DnD volta à mesa.
