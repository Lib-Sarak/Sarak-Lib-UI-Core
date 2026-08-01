---
tipo: "plan"
titulo: "Triar a dívida conhecida — decidir o destino de cada achado aberto"
dominio: "Sarak-Lib-UI-Core / Qualidade / Dívida técnica"
status: "🔴 A executar"
prioridade: "Máxima"
tags: ["plan", "divida-tecnica", "triagem", "analise", "read-only"]
relacionados: ["[[15-divida-conhecida]]", "[[00-contexto]]", "[[01-gates-e-baseline]]"]
depende_de: "plan-01"
destino_sintese: "specs/15-divida-conhecida.md · 00-contexto.md"
---

> 🔒 **PLAN DE ANÁLISE. NADA É CORRIGIDO AQUI.** Nenhum arquivo de `src/`, `scripts/` ou `bin/` é editado.
> A entrega é uma **decisão por achado**, tomada com o dono. Executor que "aproveitar para consertar" tem a
> execução reprovada inteira, ainda que o conserto esteja certo.

# 1. Objetivo

Cada um dos 22 achados abertos tem um **destino decidido pelo dono** — corrigir, aceitar como característica,
ou investigar antes — e as plans seguintes passam a ter escopo real em vez de escopo herdado.

# 2. Contexto

`specs/15-divida-conhecida.md` registra 22 achados abertos, todos medidos no código. Eles foram roteados
para fases **enquanto eram descobertos**, um a um, sem que ninguém olhasse o conjunto e perguntasse *"isto
merece conserto?"*.

A premissa do dono é que **regra existe para ser aplicada**. A consequência honesta dessa premissa é que a
regra às vezes estava larga demais — e aí quem muda é a regra, não o código. Três achados já mostram os três
destinos possíveis:

| Achado | Destino que ele sugere |
|---|---|
| 8 — `localStorage.clear()` apaga a origem do consumidor | **corrigir** — é o único capaz de destruir dado de terceiro |
| 6 — `atomic/Tables/` sem componente | **aceitar** — já foi decidido; o hook é `structuralConsumer` de 2 tokens |
| 27 — `chromeSlots` conta 9 para 8 regiões | **avaliar** — é imprecisão de derivação; consertar pode custar mais que declarar |

Sem esta triagem, as plans 07–09 herdam 22 itens como se todos fossem defeito, e o escopo delas mente.

# 3. Escopo

## 3.1 Dentro
- **Leitura** de `src/`, `scripts/`, `bin/`, `.githooks/` — o que for preciso para medir cada achado
- `specs/specs/15-divida-conhecida.md` — acrescentar a coluna **Destino** e mover o que for aceito
- `00-contexto.md` §8 — receber o que for **aceito como característica**, com o motivo

## 3.2 Fora
- ⛔ **Qualquer edição em `src/`, `scripts/`, `bin/`, `dist/`, `.githooks/`.** Nem uma linha, nem "para provar".
- ⛔ Criar teste, gate, hook ou script.
- As specs fixas que os achados citam — elas mudam nas plans de conserto, não nesta.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/15-divida-conhecida.md` | a lista a triar |
| Spec fixa | `specs/00-regras-e-invariantes.md` | a regra que cada achado viola — ou não |
| Spec fixa | `specs/01-gates-e-baseline.md` | o baseline; qual gate acusa e qual não vê |
| Contexto | `00-contexto.md` §2, §8 | as regras inegociáveis e onde vai o que for aceito |

# 5. Instruções de execução

1. **Para cada achado aberto**, confirmar no código que ele **ainda existe** — achado de 3 dias atrás pode ter
   sido fechado de passagem. Achado que não se reproduz sai da lista, com a evidência.
2. **Medir a exposição real** — não estimar. Quem é atingido, com que frequência, e o que acontece de pior.
3. **Identificar a regra por trás**: qual das 17 regras o achado viola? Se **nenhuma**, isso é o dado mais
   importante da linha — significa que estamos cobrando algo que não está escrito.
4. **Propor um destino** por achado, com justificativa de uma linha:
   - **Corrigir** — a regra vale, o código está errado. Vai para a plan de conserto correspondente.
   - **Aceitar como característica** — o custo do conserto supera o dano. Sai da dívida e vira linha em
     `00-contexto` §8, **com o motivo escrito**. Aceito sem motivo é dívida escondida, não decisão.
   - **Investigar antes** — não há informação suficiente para decidir. Vai para a plan-06.
5. **⇒ PARE. Relatório em texto**: tabela `# · achado · regra violada · exposição medida · destino proposto ·
   por quê`, ordenada por exposição. **Aguarde a decisão do dono, item a item.**
6. Registrar as decisões: coluna **Destino** em `15-divida-conhecida.md`; o que foi aceito muda de arquivo.
7. Listar, ao fim, **quais plans mudam de escopo** por causa das decisões — sem editá-las (é do revisor).

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-03-triagem-divida-conhecida.md.

Contexto obrigatório antes de começar: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/15-divida-conhecida.md, specs/specs/00-regras-e-invariantes.md,
specs/specs/01-gates-e-baseline.md.

ESTA PLAN É READ-ONLY SOBRE O CÓDIGO. Você não corrige nada — nem um achado, nem "de
passagem". A entrega é análise. Pare no passo 5 e apresente a tabela ao usuário.
Não commite. Ao terminar, escreva o resumo na própria plan.
```

# 7. Critérios de aceite

- [ ] Os 22 achados abertos reconfirmados no código, com `arquivo:linha` atual.
- [ ] Exposição **medida** em cada um — nenhum "provavelmente".
- [ ] A regra violada nomeada, ou a declaração explícita de que **nenhuma regra cobre aquilo**.
- [ ] Destino proposto por achado, com justificativa.
- [ ] Decisão do dono registrada item a item.
- [ ] O que foi aceito saiu de `15-divida-conhecida` e entrou em `00-contexto` §8 **com o motivo**.
- [ ] ⛔ `git diff` **não contém** `src/`, `scripts/`, `bin/`, `dist/` nem `.githooks/`.
- [ ] Lista de quais plans mudam de escopo, entregue ao revisor.

# 8. Como verificar

- `git status --porcelain` → **só** `specs/`. Qualquer outro caminho reprova a execução inteira.
- `npm run audit` → baseline **idêntico** ao de antes (nada foi consertado, por definição)
- Para cada achado marcado "ainda existe": abrir o `arquivo:linha` citado e confirmar
- Para cada achado **aceito**: existe linha correspondente em `00-contexto` §8 com motivo
- Soma: abertos + aceitos + fechados = 31 (a numeração não perde item)

# 9. Destino da síntese

**Destino:** `specs/15-divida-conhecida.md` · `00-contexto.md`

A triagem **é** a síntese: a spec de dívida ganha a coluna de destino, e o que foi aceito migra para o
contexto. As plans de conserto são reescritas pelo revisor depois, com o escopo já decidido.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
