---
tipo: "processo"
titulo: "Backlog — Achados Registrados, Não Agendados"
dominio: "Governança de Specs (SDD)"
status: "🟢 Vigente"
tags: ["processo", "backlog", "achados", "sdd"]
relacionados: ["[[00-indice]]", "[[00-prompt-revisor]]", "[[00-prompt-executor]]"]
---

# 0. O que é este arquivo

O lugar onde um achado **descansa**. Nem executado, nem esquecido.

Antes deste arquivo existir, um problema encontrado no meio do caminho tinha só dois destinos: virar
trabalho **agora** (uma plan nova, um ciclo inteiro) ou se perder. Como a doutrina proíbe perder, tudo
virava trabalho — e cada execução gerava as próximas, sem caso-base. Este arquivo é o caso-base.

**Um item aqui não é uma plan.** Não tem `NN`, não tem status, não entra em fila, ninguém o executa. É uma
linha dizendo *"isto existe e alguém olhou"*. Só vira trabalho quando **o usuário** manda — e aí passa pela
triagem normal ([[00-prompt-revisor]] §4) como qualquer outra demanda.

**Quem escreve:** o **revisor**, sempre. O executor **relata** achados no resumo dele (é o formato da
[[00-prompt-executor]] §5); quem transcreve para cá é o revisor, no veredito.
**Quem promove:** só o **usuário**. Nenhum agente decide sozinho que chegou a hora de um item.
**Quem remove:** quem promoveu (o item sai daqui quando vira plan ou prompt direto) — ou o revisor, ao
registrar um achado novo (§4), quando encontra um antigo que deixou de valer. O usuário pode podar a
qualquer momento.

---

# 1. A regra que este arquivo sustenta

> **Achado descoberto durante a execução da plan-N não vira trabalho antes da plan-N fechar.**

Sem exceção. Ele desce para cá, e o ciclo em andamento termina primeiro. Isso é o que impede o aninhamento:
uma execução nunca abre outra execução por dentro.

Três coisas alimentam este arquivo:

| Origem | Quem traz | Quando |
|---|---|---|
| Achado fora do escopo | executor, no resumo | o revisor transcreve no veredito |
| Divergência entre spec fixa e código | revisor, no ritual de entrada | ao encontrar |
| Ressalva relevante que não reprova a execução | revisor, no veredito | ao aprovar |

**Nada aqui é urgente por estar aqui.** Se um achado é grave a ponto de não poder esperar, ele não é backlog
— é uma demanda que o revisor leva ao usuário na hora, em texto livre, e que vira plan ou prompt direto pela
via normal.

---

# 2. A tabela

> **Como escrever:** uma linha por achado, e **uma linha só**. Se você precisa de um parágrafo, o item não é
> achado — é uma demanda; leve ao usuário.
>
> - **#** — sequencial simples. Reaproveitável: sai um, o número volta a ficar livre. Isto **não** é `plan-NN`.
> - **Achado** — o que há de errado, em uma frase, com `arquivo:linha` quando existir.
> - **Origem** — `plan-NN`, `via direta` ou `ritual`. Rastreia de onde veio, sem prender o item a nada.
> - **Registrado em** — data absoluta (`AAAA-MM-DD`).
> - **Peso** — `alto` · `médio` · `baixo`. É uma dica ao usuário, não uma fila: nada aqui é agendado.

| # | Achado | Origem | Registrado em | Peso |
|---|---|---|---|---|
| 32 | Vocabulário de forma sem token: 33 raios (`rounded-xl/lg/md/3xl`), 43 sombras (`shadow-sm…2xl`) e as molas do `framer-motion` em `src/components/` (mais no painel) não têm token que os nomeie — não é desobediência, é falta de vocabulário (ex.: raio de aba, de item de navegação, de popup; mola de movimento). Decidir se ganham token ou ficam como desenho fixo | re-auditoria de fechamento da `plan-115` | 2026-10-13 | médio |
| 1 | Prazos próprios na suíte (36 lugares, por exemplo `SarakQRCodeImpl.test.tsx:21-24`: gancho de 30 s, caso de 20 s) não são alcançados pelo `--testTimeout`/`--hookTimeout` do `coverage:release`; com a máquina carregada o gancho do QR code estourou no caminho da release | plan-179 | 2026-11-25 | médio |
| 2 | `SarakButton` aplica `getButtonStyles` depois do `style` da prop: a borda, a largura dela e as outras chaves que o token escreve ignoram o `style` do importador (medido no botão de idioma do cromo, que passou a `outline` por isso) | plan-176 | 2026-11-26 | médio |
| 3 | `SarakSearchCard` mostra "Visão Computacional", "Navegação Web" e "Modo Conversacional" fixos em português, no texto e no `aria-label`, em qualquer idioma | plan-177 | 2026-11-26 | baixo |
| 4 | A 820 px, o `dot-matrix-elegant` ainda mostra zero itens na barra do topo: o espaço da busca recolhida a 0 px continua somando dois vãos de 24 px | plan-177 | 2026-11-26 | baixo |
| 5 | `configIsSavedDesign.persistenceIntegration.test.tsx` (casos das linhas 79 e 85) estoura o prazo padrão de 5 s com a máquina carregada: cai no `HEAD` e, com a carga de plans em paralelo, cai de forma intermitente | plan-184 | 2026-11-26 | baixo |
| 64 | Impressão da `SarakDataTable`: quebra de página real e cabeçalho repetido por folha não foram medidos (a emulação de mídia não pagina); com `groupBy`, grupo recolhido sai recolhido | achado da `plan-152` | 2026-11-02 | baixo |
| 69 | Grupos do painel com uma ou duas opções à vista porque a diferença entre elas só aparece em animação ou em interação, ou tem contraste baixo: janela, rolagem, troca de página, movimento, sombra, direção da sombra, moldura e degradê. As outras opções estão em "Ver todas" (`except` em `registry.ts`). Um desenho estático mostraria a diferença, como a curva de easing no movimento | veredito da `plan-141` | 2026-11-03 | baixo |

---

# 3. Promover um item

Só o usuário dispara. Ao promover, o **revisor**:

1. Tria o item pela [[00-prompt-revisor]] §4 — plan se deixa verdade documentada, prompt direto se não.
2. Conduz a via escolhida como qualquer outra demanda.
3. **Remove a linha daqui**, na mesma ação. Item promovido não fica de lembrança: a partir daí quem responde
   por ele é o [[00-indice]] (se virou plan) ou a própria conversa (se virou prompt direto).

Promover **não** é obrigatório e não tem prazo. Um item pode ficar aqui indefinidamente sem que isso seja
dívida — é exatamente para isso que ele existe.

---

# 4. Regras de manutenção

- **Este arquivo não cresce sem limite, e o dreno tem gatilho.** Ele registra o que **ainda** é verdade.
  **Ao registrar um achado, o revisor relê os que já estão aqui** — é a única vez em que alguém abre o
  arquivo inteiro, e por isso é onde ele se drena. Achado corrigido de passagem por outra tarefa, código que
  deixou de existir, problema que a spec fixa passou a permitir: a linha **sai** na mesma ação, e o revisor
  diz isso na resposta. Regra de limpeza sem gatilho não roda — foi assim que o índice virou cemitério.
- **Não duplique.** Antes de registrar, procure — o mesmo achado visto em duas execuções é uma linha só.
- **Sem status, sem dono, sem prazo.** Se você sentiu falta de um desses campos, o item não é backlog: é
  plan. Promova ou deixe.
- **Nunca referencie um item daqui dentro do código.** Vale a mesma regra da plan: comentário não cita
  `backlog #3` (norma completa em `padrao-escrita`, `references/comentarios.md`).
- **Item que já está numa plan não fica aqui.** Um dos dois é a verdade — e é o [[00-indice]].
