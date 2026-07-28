---
tipo: "adr"
titulo: "As três arquiteturas e por que sobraram duas"
status: "🟢 Aceito"
tags: ["adr", "arquitetura", "escopo", "virada"]
relacionados: ["[[002-remocao-motor-manifesto]]", "[[003-remocao-backend-proprio]]", "[[004-remocao-design-agent]]", "[[005-modelo-modulos-plugin-e-apps-separados]]"]
substitui: ""
substituido_por: ""
---

# 1. Contexto e Problema

**Data da decisão: 2026-07-22.**

Até julho de 2026 a Sarak-Lib-UI-Core carregava, **simultaneamente e sem que isso estivesse escrito em lugar nenhum**, três arquiteturas independentes dentro de `src/core/`:

| # | Arquitetura | Pastas | Quem usava |
| --- | --- | --- | --- |
| **#1** | **Módulos-plugin** — o host registra módulos de negócio e a lib resolve navegação e layout | `core/Discovery/`, `core/Shell/` | O `Sarak-MyService`, único consumidor real da época |
| **#2** | **Renderizador de páginas por manifesto** — a tela inteira descrita em JSON e interpretada em runtime | `core/Manifest/` | **Ninguém** |
| **#3** | **Componentes atômicos + Provider + Design Engine** | `components/atomic/`, `core/Provider/`, `core/Design/` | Todos os consumidores, sempre |

A descoberta veio da auditoria de 2026-07-22, e ela corrigiu uma **premissa falsa que vinha sendo usada como base de planejamento**: várias entradas de log afirmavam que o `Sarak-MyService` "rodava o modelo de componentes atômicos". Era falso — ele roda o **#1**, com `registerSarakModule`/`registerLocalComponent` sobre `SarakUIProvider`+`SarakShell`, e nunca importou `SarakButton`/`SarakCard` diretamente.

O problema de fundo era duplo:

1. **Três arquiteturas com um consumidor cada (ou nenhum) custam três manutenções.** O ferramental de qualidade (gates, catálogo, barril) estava dividido entre elas, e algumas peças do #3 tinham sido construídas *em cima* do Registry do #2 — acoplamento invisível.
2. **A tese vigente era do #2 e tinha acabado de falhar empiricamente.** O princípio declarado ("renderizador genérico, 100% via manifesto, zero React no consumidor") bateu em 4 paredes numa tela simples de proposta durante a primeira tentativa do Teste Real. O diagnóstico com o mantenedor concluiu que o motivo era estrutural, não de implementação.

O módulo não estava em produção. A decisão do mantenedor foi explícita: **construir do jeito certo e remover o que não é usado — não rebaixar a "opcional por via das dúvidas"**, porque manter caminho sem consumidor é exatamente o código morto que a regra proíbe.

# 2. Decisão

**Assumir #1 + #3 como o produto. Remover o #2.** No mesmo movimento, remover o backend próprio e o Design Agent — dois anexos que também não pertenciam a uma biblioteca de front.

Cada remoção tem ADR próprio, com o seu contexto, a sua prova e as suas consequências:

- O renderizador de páginas por manifesto (#2) → **[[002-remocao-motor-manifesto]]**
- O backend próprio (`backend/`, endpoints de tema/branding) → **[[003-remocao-backend-proprio]]**
- O Design Agent (agente LLM embarcado) → **[[004-remocao-design-agent]]**

O que este ADR fixa é apenas o **enquadramento**: quantas arquiteturas existiam, quais sobrevivem, e a regra de corte que decidiu isso.

**A regra de corte aplicada:** uma arquitetura só permanece se tiver consumidor real provado. O #1 tinha (`Sarak-MyService`); o #3 é a base de tudo e sustenta os dois modos de consumo; o #2 não tinha nenhum e já havia falhado no campo.

**A trava de sequência que a decisão impôs:** o #2 não seria removido por convicção, e sim por **prova**. A remoção ficou condicionada ao Teste Real aprovar o modelo sobrevivente num sistema de produção real — se o teste revelasse que a camada declarativa era necessária, a decisão seria reaberta. O teste foi aprovado em 2026-07-25 e liberou a remoção.

# 3. Consequências

- **Positivas:**
  - A pergunta "qual é o produto?" passa a ter uma resposta única e escrita, em vez de depender de quem responde. Todo agente e todo consumidor param de escolher entre três caminhos sem critério.
  - Uma superfície pública, um conjunto de gates, um catálogo. O ferramental de qualidade deixa de ser dividido entre arquiteturas concorrentes.
  - A decisão passa a ser **empírica, não estética**: o corte foi feito por ausência de consumidor e por falha medida em campo, e a remoção esperou uma prova positiva do que sobrou.
  - O acoplamento acidental entre as camadas ficou visível e teve de ser desfeito antes da deleção — ganho de higiene que não teria aparecido sem o corte.

- **Negativas (Trade-offs):**
  - **Perda de uma capacidade real, ainda que sem uso.** O #2 tinha sido validado para telas simples (nota 9,3 no Selo da Onda de 2026-07-21). Não era código quebrado — era código sem demanda. Se algum dia um consumidor precisar de autoria de tela por JSON, essa capacidade terá de ser reconstruída ou recuperada do histórico git.
  - **Trabalho de planejamento invalidado.** Um bloco de specs, skills e documentação escrito para o #2 e para o backend virou material histórico de uma vez só.
  - **Ficam DOIS modos de consumo, não um.** A auditoria de um segundo consumidor real mostrou que o #1 e o #3 servem topologias diferentes e legítimas — a simplificação parou em dois, não em um. Essa consequência foi formalizada em **[[005-modelo-modulos-plugin-e-apps-separados]]**.
  - **Nenhum código do #2 sobrevive como referência viva.** A recuperação, se necessária, é arqueologia no git — não uma pasta desativada à mão.
