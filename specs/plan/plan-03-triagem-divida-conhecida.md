---
tipo: "plan"
titulo: "Triar a dívida conhecida — decidir o destino de cada achado aberto"
dominio: "Sarak-Lib-UI-Core / Qualidade / Dívida técnica"
status: "🟠 Em revisão"
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

## Resumo da execução — 2026-08-01

**Resultado:** Concluído

**O que foi feito**

Triagem read-only dos achados abertos, decisão do dono colhida item a item, e registro das decisões nos dois
arquivos que a plan autoriza (§3.1). **Nenhum arquivo de `src/`, `scripts/`, `bin/`, `dist/` ou `.githooks/`
foi tocado** — `git status --porcelain` retorna só `specs/`.

- **Reconferência no código dos 23 achados** (não 22 — ver "Achados sobre a própria spec"). Cada um foi aberto
  no `arquivo:linha` citado e remedido. **2 não se reproduzem mais**; 21 continuam.
- `specs/specs/15-divida-conhecida.md` — reestruturada em 4 destinos, com colunas **Regra** e **Destino** novas
  em todas as tabelas de §3.
- `specs/00-contexto.md` §8 — recebeu os 3 itens aceitos como característica, cada um **com o motivo escrito**,
  mais a decisão de sequenciamento *regra → gate*.

**Os 2 achados que NÃO se reproduzem** (fechados com evidência):

- **30** — dizia que `verify_presets.ts:16` apontava para um `arquitetura/04 §9` inexistente. Medido: o alvo
  existe e é o certo — `specs/arquitetura/04-contrato-de-tokens-e-paridade.md:252` = `# 9. Anti-drift de tema e
  preset`, exatamente o assunto do script. A plan-01 criou o §9 ao reescrever a base.
- **31** — dizia que a ponte para `specs/` era SOFT. Medido: `CLAUDE.md:3` aponta **duro** para
  `specs/00-contexto.md`, os dois prompts e o `00-indice`. `.agents/index.md` segue com **0** referências a
  `specs/`, mas a ponte não passa mais por ele.

**A decisão do dono (2026-08-01), verbatim:**

> *"Tudo que é relacionado ao gate de verificação ainda não foi implementado (não é dívida é implementação
> posterior) devemos ter todas as regras formadas, para então criar a verificação para o gate. O restante estou
> de acordo."*

Aplicada como **critério de classificação**, não como caso a caso: dívida é código que viola regra **já
formada**; gate que nunca existiu é trabalho em fila. Isso partiu 4 achados ao meio — ver "Decisões e
suposições".

**Distribuição final dos 31 números**

| Destino | Qtd | Quais |
|---|---|---|
| §3 Abertos (dívida) | **14** | 8, 22, 1, 13, 29, 10, 11, 12, 9, 2, 3, 24, 25, 17 |
| §4 Implementação posterior (gate) | **5** | 14, 15, 18, 23, 26 · + as 4 metades de gate de 1, 13, 22, 29 |
| §5 Aceitos como característica | **2** | 16, 27 |
| §6 Fechados | **10** | 4, 5, 6, 7, 19, 20, 21, 28 + **30, 31** |
| | **31** | soma fechada |

**Arquivos alterados**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `specs/specs/15-divida-conhecida.md` | alterado | §1 ganhou o 4º "não é"; §2 corrigiu a contagem; §3 reduzida a 14 itens com colunas Regra/Destino; **§4 nova** (gates em fila); **§5 nova** (aceitos); §4→§6 (fechados) com 30 e 31; §7/§8 renumeradas, com 3 regras novas de manutenção |
| `specs/00-contexto.md` | alterado | §8: bullet de dívida atualizado (22→14 achados), bullet novo da decisão *regra→gate*, e bloco novo **"Aceito como característica"** com os 3 itens e seus motivos |
| `specs/plan/plan-03-triagem-divida-conhecida.md` | alterado | `status` 🔴→🟡→🟠 e este resumo |

**Verificações executadas**

- `git status --porcelain` → **3 arquivos, todos em `specs/`**. Zero ocorrências de `src/`, `scripts/`, `bin/`,
  `dist/`, `.githooks/`.
- `npm run audit` → **exit 1, 2 auditores vermelhos** — idêntico ao baseline de [[01-gates-e-baseline]] §3.
  Paridade **409/409/409** em 13 partições; presets **120 itens** (18 temas + 102), 0 órfã; arquitetura, clean
  code, typescript e coverage verdes. Nada foi consertado, por definição da plan.
- **Medições novas feitas na reconferência** (nenhuma copiada da spec anterior):
  - achado 22: **304 propriedades** contadas na `SarakDesignTokens` × **409** tokens reais = 105 de defasagem;
    `sarak-ui/catalog.json` → `designTokens.count = 304`.
  - achado 13: `src/shared/` tem **4** arquivos e **0** testes (a spec dizia 3).
  - achado 11: **1 de 3** caminhos lê o token — só `useDesignVariables.ts:58`.
  - achado 16: os **5** sinks abertos e lidos um a um; 2 são literais estáticos, 3 derivam de `design`
    pós-`validateDesign`. **0 vetores reais.**
  - achado 25: `SARAK_STARTER_MANIFEST` tem **1 ocorrência** em todo o código-fonte — o próprio comentário.
  - achado 26: **0** ocorrências de `child_process`/`execSync` nos testes de `bin/scaffold/`.
  - achado 18: **0** cálculos de razão de contraste em `src/`.
  - achado 9: `global.ts:21-33` oferece só `sidebar|topbar|dock` — `'glass'` é de fato descartado.

**Critérios de aceite**

- [x] Os achados abertos reconfirmados no código, com `arquivo:linha` atual — evidência: coluna *Onde* de §3 e
      §4, toda ela reaberta nesta execução.
- [x] Exposição **medida** em cada um — evidência: lista de medições acima; nenhum "provavelmente" ficou na spec.
- [x] A regra violada nomeada, ou a declaração explícita de que **nenhuma** cobre — evidência: coluna *Regra*.
      **12 dos 21 achados vivos não violam regra nenhuma das 17.**
- [x] Destino proposto por achado, com justificativa — evidência: coluna *Destino*.
- [x] Decisão do dono registrada item a item — evidência: relatório apresentado ao dono antes de qualquer
      edição; decisão transcrita verbatim acima e aplicada como critério.
- [x] O que foi aceito saiu de `15-divida-conhecida` e entrou em `00-contexto` §8 **com o motivo** — evidência:
      `00-contexto.md` §8, bloco "Aceito como característica" (3 itens).
- [x] ⛔ `git diff` **não contém** `src/`, `scripts/`, `bin/`, `dist/` nem `.githooks/`.
- [x] Lista de quais plans mudam de escopo — abaixo.
- [x] Soma: 14 + 5 + 2 + 10 = **31**. A numeração não perdeu item.

**Decisões e suposições**

1. **Onde os itens de gate foram parar.** O dono disse que não são dívida, mas `00-contexto` §5 proíbe apagar
   sem destino demonstrado. Interpretação conservadora adotada: **§4 nova dentro da própria spec de dívida**,
   declarada em voz alta como *não-dívida*, com o `arquivo:linha` preservado — e uma linha em `00-contexto` §8
   apontando para lá. A alternativa (mover os 9 itens para `00-contexto` §8) estouraria o alvo de ≤200 linhas
   daquela spec e duplicaria a medição. **Se o revisor preferir uma spec própria (`specs/16-gates-em-fila.md`),
   o conteúdo já está isolado numa seção e migra inteiro.**
2. **Achados partidos ao meio.** 1, 13, 22 e 29 têm metade de código que viola **regra já formada** (R7, R8,
   R17) e metade que é ampliação de gate. A metade de código **permaneceu** em §3 como dívida; só a de gate foi
   para §4. Tratá-los como 100% gate teria removido da dívida violações ativas de R7 e R8 — e a decisão do dono
   foi sobre *gates ausentes*, não sobre *regras violadas*.
3. **Achado 15 seguiu a primeira frase do dono, não a minha proposta.** Eu havia proposto "aceitar como
   característica"; como ele é literalmente uma verificação não implementada, foi para §4. A justificativa de
   R8 (1:1 > %) ficou escrita na linha, para quem for decidir depois.
4. **Achado 11 foi partido por natureza técnica, não por regra.** O `DeviceProvider` é JS e ficou como dívida;
   as classes `@min-[768px]` do Tailwind são build-time e **não aceitam `var()`** — essa metade foi aceita em
   `00-contexto` §8 com o motivo. Foi a recomendação apresentada ao dono e coberta pelo "o restante estou de
   acordo".
5. **Não toquei em nenhuma outra plan.** A lista abaixo é insumo para o revisor (passo 7 da plan), não edição.

**Plans que mudam de escopo** *(entregue ao revisor — nenhuma foi editada)*

| Plan | O que muda |
|---|---|
| **plan-06** — auditoria de cobertura dos gates | **Ganha peso e muda de natureza.** Deixa de ser "investigação de dívida" e passa a ser **o insumo obrigatório da fase de gates**: sem o mapa escopo-de-gate × escopo-de-regra, a §4 não pode ser executada. Herda **duas perguntas de regra** que a triagem levantou e não pode responder sozinha: *(a)* a lib promete WCAG AA em algum lugar? (achado 18) · *(b)* acoplamento de auth deve virar regra? (achado 14). E ganha uma terceira: **12 dos 21 achados vivos não violam regra nenhuma** — isso é candidato a regra nova, não a conserto |
| **plan-07** — quitação do baseline | **Escopo real fixado.** Os 2 vermelhos do baseline continuam (`SarakTypography.tsx:39` e os 3 ghostvars). Entra a **metade de código** do achado 1 (as 2 linhas de `--sx-*` em `_utilities.css:80,89`) e o achado 10 (`--sarak-focus-width` na regra global de foco). **Sai** qualquer ampliação de auditor — isso é §4 |
| **plan-08** — achados de comportamento | **Deixa de herdar 22 itens.** Escopo real: **8, 9, 10, 11 (só o `DeviceProvider`), 12, 17, 24, 25** + as metades de código de **13, 22, 29**. Nota de ordem: o achado 8 (`localStorage.clear()`) tem de ser corrigido **antes** de qualquer decisão sobre restaurar as abas do painel |
| **plan-09** — contrato público 2.0.0 | **Perde um item.** O **achado 27 SAI** do escopo (§3.1, 4º bullet, e §5 item 4): foi aceito como característica — o `doc` do próprio slot já avisa o consumidor que `topbarActions` é alias. Restam 3 quebras. **Candidato a entrar:** o **achado 2** (`partialMode` em `master-map.ts:148`) é mudança de assinatura pública e hoje não está em plan nenhuma — decisão do revisor |
| **plan-11** — E2E no pipeline | **Ganha escopo nomeado.** Achado 17 (`testDir: './e2e'` aponta para pasta inexistente — hoje o Playwright sai verde sem executar nada, que é literalmente o objetivo da plan) e achado 26 (nenhuma automação exercita um `install` real) |
| **plan-02** — adequar skills locais | **Perde um item.** O achado 30 fechou sozinho: o ponteiro de `verify_presets.ts:16` está vivo e correto |
| **plan-05** — integração contínua | Inalterada em escopo, mas **vira pré-requisito explícito** dos achados 26 e da plan-11 |
| **plan-04**, **plan-10** | Inalteradas |

**Achados sobre a própria spec de dívida (corrigidos nesta execução)**

- O cabeçalho declarava **"9 fechados · 22 abertos"**. Contado item a item: **8 fechados e 23 abertos**
  (8 + 23 = 31). **Os dois números estavam errados.** Corrigido em §2, com a nota do que era antes — o critério
  de verificação da própria plan (§8, "soma = 31") só fecha depois dessa correção.

**Achados fora do escopo (não corrigidos)**

- `src/styles/_utilities.css:54-58` — a regra global de foco chumba `outline: 2px solid` e `outline-offset: 2px`.
  Além de ser a causa do achado 10, é **hardcode que nenhum gate vê**: o `auditor_hardcoded` só coleta `.tsx`
  (R2.4, limitação 1). Sugestão: o mesmo conserto fecha os dois — mas a decisão de ampliar o auditor a `.css` é
  gate, e gate é §4.
- `src/components/atomic/Inputs/SarakUploader.tsx:47` e `src/components/atomic/UX/SarakContextMenu.tsx:9` —
  comentários JSDoc citando `--sx-*` como se fosse namespace válido, quando R7 o declara **PROIBIDO**. Não são
  consumo (não estão em `var()`), então nenhum gate acusa e não são dívida de comportamento — mas são prosa que
  ensina o namespace errado a quem ler o código. Sugestão: carona no conserto do achado 1.
- `sarak-ui/templates/componente-proprio.tsx` e `sarak-ui/templates/ui-kit/` **existem e não estão em
  `REQUIRED_PATHS`** de `check-package-contents.mjs`. Amplia o achado 23: o gate de presença cobre 3 dos 5
  itens do diretório. Registrado na linha do 23 em §4.

**Pendências / riscos**

- **Nenhum conserto foi feito** — é o que a plan manda. Os 14 achados de §3 seguem vivos no código.
- **Risco de leitura:** um agente que abra `15-divida-conhecida.md` e some §3 + §4 vai contar 19 "problemas".
  Mitigado com o bloqueio 🔒 no topo da §4 e o 4º "não é" da §1, mas a separação depende de ser lida.
- **A §4 não tem dono nem posição na fila.** Ela declara a ordem (*regras → gates*) e nomeia os itens, mas
  **nenhuma plan a executa hoje** — a plan-06 produz o insumo, não a implementação. Isso é decisão do revisor:
  ou a plan-06 cresce, ou nasce uma plan de construção de gates depois dela.

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
