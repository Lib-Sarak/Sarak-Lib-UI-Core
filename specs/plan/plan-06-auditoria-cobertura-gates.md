---
tipo: "plan"
titulo: "Auditoria de cobertura dos gates — procurar de propósito o que apareceu por acaso"
dominio: "Sarak-Lib-UI-Core / Qualidade / Gates"
status: "🔴 A executar"
prioridade: "Máxima"
tags: ["plan", "gates", "investigacao", "cobertura", "read-only"]
relacionados: ["[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]", "[[15-divida-conhecida]]"]
depende_de: "plan-03"
destino_sintese: "specs/00-regras-e-invariantes.md · specs/01-gates-e-baseline.md · specs/15-divida-conhecida.md"
---

> 🔒 **A METADE 1 É READ-ONLY E É O PRODUTO PRINCIPAL.** Esta é a única plan da fila que **começa sem lista de
> tarefas** — a lista é a entrega dela. Executor que pular para o conserto destrói o valor da plan.

# 1. Objetivo

As **29 regras verificáveis** têm o escopo do seu gate **mapeado com `arquivo:linha`**, todo vão está **declarado ou fechado**,
e nenhum vão novo pode nascer silencioso.

# 2. Contexto

**Quatro achados independentes têm a mesma forma:**

| Regra | Gate que a cobra | O que o gate NÃO vê | Exposição |
|---|---|---|---|
| Namespace `--sx-*` proibido | `auditor_ghostvars` | `src/styles/` — tratado como fonte emissora, nunca consumidora | **2 usos vivos** |
| Cobertura 1:1 | `auditor_coverage` | `src/shared/` — fora do escopo | **3 arquivos sem teste** |
| Barril completo | `barrel:check` | `components/engines/` | 3 categorias *(fechado)* |
| Paridade do dicionário | `auditor_paridade` | o **tipo gerado** não é uma das 3 fontes | **105 tokens de deriva** |

Quatro vezes o mesmo padrão: **o escopo do gate é menor que o escopo da regra.** Nenhum é gate quebrado —
todos passam, com convicção, dentro do próprio recorte. **O defeito é o recorte.**

**Quatro instâncias não são coincidência.** Os quatro apareceram **por acaso**, não por método. E o achado 30
provou que atenção humana não pega essa classe: o conserto de um ponteiro morto criou outro, na mesma entrega
em que a classe foi catalogada.

# 3. Escopo

## 3.1 Dentro
- **Metade 1 (read-only):** leitura de `.agents/skills/ui-auditoria-modulo/scripts/*`, `scripts/*`,
  `.githooks/*`, `src/**/__tests__/*` de gate, `package.json`
- **Metade 2 (só após aprovação):** os gates que o dono mandar ampliar, e as specs abaixo
- `specs/00-regras-e-invariantes.md` — R18 + a coluna "Cobrada por" onde a matriz corrigir
- `specs/01-gates-e-baseline.md` — a matriz vira seção permanente
- `specs/15-divida-conhecida.md` — os vãos novos entram numerados a partir de 32

## 3.2 Fora
- ⛔ **Qualquer conserto na metade 1.** Nem um. A metade 1 termina em relatório.
- ⛔ Consertar o **conteúdo** que vive dentro de um vão (isso é da plan-07) — aqui se mexe no **gate**.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/00-regras-e-invariantes.md` | as **32 regras** — 29 verificáveis, 3 de conduta (fechadas pela plan-13) |
| Spec fixa | `specs/01-gates-e-baseline.md` | o baseline e o que cada gate garante hoje |
| Spec fixa | `specs/15-divida-conhecida.md` §3.3 | os 4 casos já conhecidos, para não recontá-los |
| Código | `.agents/skills/ui-auditoria-modulo/scripts/` | os 8 auditores — ler o **código**, não o comentário |

# 5. Instruções de execução

## Metade 1 — INVESTIGAÇÃO (read-only)

1. Para **cada uma das 29 regras verificáveis** (as 3 de conduta ficam fora — não têm gate por decisão), preencher com `arquivo:linha`:

| Coluna | O que responder |
|---|---|
| **Regra** | o enunciado |
| **Gate** | qual script a cobra — ou **"nenhum"**, honestamente |
| **Escopo do gate** | o que ele **de fato** varre, **lido no código, não no comentário** |
| **Escopo da regra** | onde a regra **deveria** valer |
| **Δ (o vão)** | a diferença — e se é **declarada** ou **silenciosa** |
| **Exposição** | o que hoje vive dentro do vão — **medir, não estimar** |

2. **A distinção que organiza tudo:** limite **declarado** é honesto (o `auditor_hardcoded` tem "known
   limitations"; o `tagComparison` declara que só lê o MAJOR; o `check-release-tag` usa `caminho:tamanho` e é
   cego a mudança de mesmo tamanho). Vão **silencioso** é o gate mentindo por omissão. **Só o segundo é defeito.**

3. **Cobrir também os gates sem regra numerada:** `catalog:check`, `guide:check`, `dev-kit:check`,
   `package:check`, `audit:baseline`, os dois anéis de `pre-commit`/`pre-push`, e os gates-teste
   (`BarrelParity`, `ZeroBrand`, `tokenContractParity`, `shippedThemesConsoleClean`, `EmbeddedMode`,
   `scopeCss`). Mesma pergunta: **o que ele NÃO vê?**

4. **Seis pistas para começar** — são ponto de partida, **não a lista**:
   - **Artefatos gerados que nenhum gate cruza contra a fonte.** O `design-token-ids.ts` era um. E
     `src/core/Provider/manifest.ts`, `docs/component-catalog.*`, `sarak-ui/catalog.json`, `sarak-dev/state.json`?
   - **Geradores não registrados.** `generate-token-types.ts` não está em `package.json`, hook nem `.agents/`.
     Varra `scripts/` inteiro: quais outros produzem artefato versionado e **não são invocados por nada**?
   - **Diretórios de `src/` que nenhum auditor varre** — `styles/`, `shared/`, `effects/`, `constants/`, `types/`.
   - **Prosa dentro de bloco gerado** (achado 29) — o `dev-kit:check` verifica caminho, gate e comando, **não**
     referência de seção.
   - **Referência a seção `§N`** (achado 30) — varra `§` em todo `.ts`/`.mjs`/`.md` versionado e resolva cada
     um contra o heading real do alvo. **Detector barato, e não existe.**
   - **Ponteiros de onboarding** (achado 31) — que outros caminhos de entrada dependem de convenção em vez de
     ponteiro duro?
   - **Contagens declaradas que nenhum gate cruza contra a fonte.** "409 tokens", "81 componentes", "17
     regras", "8 auditores", "22 achados abertos", "1.2.0" — vivem em prosa de spec e envelhecem sozinhas.
     *(Duas specs escritas na mesma entrega, em 2026-08-01, já divergiam no número de achados.)* O
     `dev-kit:check` cruza **algumas**; quais ficam de fora?

5. **⇒ PARE. Relatório em texto: a matriz + os vãos ordenados por exposição medida. Aguarde aprovação.**

## Metade 2 — ROTEAMENTO (não necessariamente conserto)

6. Cada vão recebe **um** destino, e a decisão é do dono:
   - **Ampliar o gate** — a regra vale mesmo naquele escopo. ⚠️ **Ampliar escopo exige ampliar o registro
     junto**: o `auditor_ghostvars` não lê `useDesignVariables.ts`, e escopo maior com registro menor produz
     **acusação falsa** — pior que a lacuna.
   - **Declarar o limite** — ampliar custa mais do que vale. O limite entra **no código**, ao lado da implementação.
   - **Corrigir a regra** — o vão revela que a regra estava escrita larga demais.
7. Propor **R18** em `00-regras-e-invariantes.md`:

> **R18 — Todo gate declara o que NÃO vê.** Um gate sem limite declarado é lido como cobertura total, e é assim
> que uma regra passa anos sendo violada dentro do vão do próprio verificador. Ao criar ou ampliar um gate, o
> escopo e as exclusões ficam escritos **no código do gate** e refletidos na spec de gates. Ampliar escopo sem
> ampliar o registro correspondente é **regressão**, não melhoria.

8. Vãos que não forem fechados nesta plan entram em `15-divida-conhecida.md`, numerados a partir de **32**.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-06-auditoria-cobertura-gates.md.

Contexto obrigatório antes de começar: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/00-regras-e-invariantes.md, specs/specs/01-gates-e-baseline.md,
specs/specs/15-divida-conhecida.md.

A METADE 1 É READ-ONLY e é o produto principal: você monta a matriz de cobertura e PARA.
Não conserte nada antes da aprovação — nem um vão "óbvio". Leia o ESCOPO REAL de cada
gate no código, nunca no comentário dele.
Não commite. Ao terminar, escreva o resumo na própria plan.
```

# 7. Critérios de aceite

- [ ] As **29 regras verificáveis** com escopo de gate mapeado por `arquivo:linha`, lido no código.
- [ ] Os gates sem regra numerada cobertos pela mesma pergunta.
- [ ] Cada Δ classificado como **declarado** ou **silencioso**.
- [ ] Exposição **medida** em cada vão silencioso — nenhum "provavelmente".
- [ ] Relatório apresentado e aprovado **antes** de qualquer edição de gate.
- [ ] Todo vão **declarado** (limite escrito no código) ou **fechado** (gate ampliado + registro ampliado junto).
- [ ] **R18** escrita em `00-regras-e-invariantes.md`; a matriz vira seção permanente em `01-gates-e-baseline.md`.
- [ ] Nenhum gate ampliado sem o registro/allowlist correspondente ampliado — **acusação falsa reprova**.
- [ ] Vãos não fechados registrados em `15-divida-conhecida.md` a partir do nº 32.

# 8. Como verificar

- Metade 1: `git status --porcelain` → **vazio**. Qualquer arquivo alterado antes da aprovação reprova.
- Metade 2: para cada gate ampliado, rodar e confirmar que **não** produz acusação falsa
- `npm run audit` → o baseline muda **só** pelo que foi decidido, e `npm run audit:baseline` regrava junto
- `grep -n "R18" specs/specs/00-regras-e-invariantes.md` → existe
- Amostragem: 3 linhas da matriz reconferidas abrindo o script do gate

# 9. Destino da síntese

**Destino:** `specs/00-regras-e-invariantes.md` (R18 + coluna "Cobrada por") ·
`specs/01-gates-e-baseline.md` (a matriz) · `specs/15-divida-conhecida.md` (vãos abertos)

**Nenhuma spec nova.** A matriz não é documento à parte: ela pertence à spec de gates, senão vira mais um
artefato que ninguém atualiza.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
