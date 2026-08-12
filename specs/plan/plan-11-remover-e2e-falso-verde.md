---
tipo: "plan"
titulo: "Remover o E2E que sai verde sem executar — a capacidade volta quando houver onde rodá-la"
dominio: "Sarak-Lib-UI-Core / Qualidade / Testes"
status: "🔴 A executar"
prioridade: "Média"
tags: ["plan", "testes", "e2e", "falso-verde", "divida"]
relacionados: ["[[11-testes-e-cobertura]]", "[[01-gates-e-baseline]]", "[[15-divida-conhecida]]"]
depende_de: "—"
objetivo: "Remover o aparato de E2E que produz verde falso, deixando a capacidade declarada como adiada"
destino_sintese: "specs/specs/11-testes-e-cobertura.md · specs/specs/15-divida-conhecida.md"
---

> 🎯 **Verde falso é pior que vermelho.** Vermelho manda alguém olhar; verde sem execução produz confiança
> sem lastro, e é **indistinguível de sucesso**.

# 1. Objetivo

**Remover o aparato de E2E**, que hoje existe sem rodar em automação nenhuma. A capacidade fica **declarada
como adiada** — não some do registro, some do repositório.

# 2. Contexto

## 2.1 A decisão do dono *(2026-08-11)*

> *"Remover os testes e2e — ficarão para etapa posterior."*

É a **segunda vez** que a decisão é tomada: em 2026-08-10, ao revisar as regras descumpridas na prática, o
dono já havia respondido *"E2E — Remova"*. A `plan-19` executou metade — deletou o `playwright.config.ts`,
que era **arquivo órfão** apontando `testDir: './e2e'` para uma pasta inexistente. **Esta plan fecha a outra
metade.**

## 2.2 O que existe hoje, medido

| Artefato | Estado |
|---|---|
| `playwright-ct.config.ts` | existe |
| `npm run test-ct` | existe, **não é invocado por nenhum pipeline** |
| `@playwright/test` · `@playwright/experimental-ct-react` | duas dependências de dev |
| `src/core/Provider/__e2e__/` | `EmbeddedNoLeak.spec.tsx` · `EmbeddedIsland.story.tsx` |
| `src/features/DesignEngine/__e2e__/` | `Boot.spec.tsx` · `RealtimeInjection.spec.tsx` |

**Nada disso roda.** Algumas specs ainda exigem `npm run build` antes, o que as torna inviáveis fora de uma
árvore descartável.

## 2.3 🔴 O que se PERDE, e precisa ficar escrito

Remover não é gratuito, e a spec fixa tem de registrar o custo em vez de fingir que não existe:

**`EmbeddedNoLeak.spec.tsx` é a única verificação do não-vazamento do modo embarcado.** A **R24** — o CSS da
lib não vaza no host — passa a depender de **conferência manual**. Isso **não** rebaixa a regra sozinho: quem
decide o marcador dela é a síntese, com a medição na mão.

> ⚠️ **Declare, não silencie.** A [[11-testes-e-cobertura]] precisa dizer, com todas as letras, que **não há
> teste de ponta a ponta nesta base** — hoje ela sugere o contrário pela mera presença dos arquivos.

## 2.4 Dois achados que esta plan carregava e que já não são dela

| Achado | Situação |
|---|---|
| **17** — o `testDir` para o vazio | ✅ **fechado** pela `plan-19` (o config era órfão e foi deletado) |
| **18** — medição de contraste WCAG AA | **núcleo respondido**: o `auditor_contraste` (R31) mede **36 pares em 23 temas, nos dois modos**. O que resta — medir contraste no **DOM renderizado** (axe-core sobre o conjunto atômico) — é capacidade **diferente e maior**, e é decisão do dono se vira achado próprio |
| **26** — automação de `install` de verdade | **não é E2E**: é ciclo de instalação/atualização do consumidor. **Migra para a órbita da [[plan-10-ciclo-atualizacao]]** |

# 3. Escopo

## 3.1 Dentro

1. **Remover** `playwright-ct.config.ts`, o script `test-ct` e as duas dependências de Playwright.
2. **Remover** os 4 arquivos de `__e2e__/` — as duas pastas ficam vazias e saem.
3. **Declarar a ausência** em [[11-testes-e-cobertura]]: não há E2E nesta base, e o não-vazamento do modo
   embarcado passa a ser conferência manual.
4. **Numerar o adiamento como achado** em [[15-divida-conhecida]] **§4** (implementação posterior) — não §3:
   pela §8 daquela spec, *"verificação que nunca existiu não é dívida"*.
5. Mover o **achado 26** para o roteamento da `plan-10`.

## 3.2 Fora

- ⛔ **Escrever jornada nova de E2E.** É o oposto desta plan.
- ⛔ Trocar o Playwright por outro runner "já que vamos mexer". Adiar é adiar.
- ⛔ Rebaixar o marcador da **R24** por conta própria — é a síntese, com medição, não o executor.
- ⛔ Mexer em componente para compensar a cobertura perdida.

# 4. Referências obrigatórias

| Tipo | Onde | Para quê |
|---|---|---|
| Spec fixa | [[11-testes-e-cobertura]] | onde a ausência é declarada |
| Spec fixa | [[15-divida-conhecida]] §4 · §8 | onde o adiamento é numerado, e por que na §4 |
| Spec fixa | [[00-regras-e-invariantes]] → **R24** | a regra que perde a verificação automática |
| **Skill** | `padrao-escrita` | |

# 5. Instruções de execução

1. **Meça antes de remover.** Liste o que cada spec cobria; é isso que a §2.3 exige registrar.
2. **Remova o aparato inteiro** — config, script, dependências e arquivos. Meia remoção deixa exatamente o
   verde falso que motivou a plan.
3. **A ausência é entrega**, não efeito colateral: sem a declaração na spec fixa, esta plan piorou a base.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute
specs/plan/plan-11-remover-e2e-falso-verde.md.

Contexto obrigatório: specs/00-contexto.md, specs/specs/11-testes-e-cobertura.md,
specs/specs/15-divida-conhecida.md (§4 e §8),
specs/specs/00-regras-e-invariantes.md (R24), e a §2/§3 desta plan.
Skills: padrao-escrita, test-unitario.

⚠️ ESTA PLAN REMOVE CAPACIDADE, e isso é o pedido do dono. O que ela NÃO pode
fazer é remover em silêncio: a ausência declarada É a entrega.

PASSO 1 — MEÇA O QUE SE PERDE, antes de apagar. Para cada uma das 4 specs de
  `__e2e__/`, escreva o que ela cobria. `EmbeddedNoLeak.spec.tsx` é a ÚNICA
  verificação do não-vazamento do modo embarcado (R24) — registre isso.

PASSO 2 — REMOVA O APARATO INTEIRO:
  · `playwright-ct.config.ts`
  · o script `test-ct` do package.json
  · `@playwright/test` e `@playwright/experimental-ct-react`
  · os 4 arquivos de `src/core/Provider/__e2e__/` e
    `src/features/DesignEngine/__e2e__/` (as pastas saem vazias)
  ⚠️ Meia remoção reproduz o verde falso. Ou tudo, ou nada.

PASSO 3 — DECLARE A AUSÊNCIA em specs/specs/11-testes-e-cobertura.md: NÃO HÁ
  teste de ponta a ponta nesta base, e o não-vazamento do modo embarcado passa a
  ser conferência manual. Hoje a mera presença dos arquivos sugere o contrário.

PASSO 4 — NUMERE O ADIAMENTO em specs/specs/15-divida-conhecida.md na §4
  (implementação posterior), NÃO na §3: pela §8 daquela spec, "verificação que
  nunca existiu não é dívida — é trabalho em fila".

LINHAS VERMELHAS:
  · Você NÃO escreve jornada nova de E2E.
  · Você NÃO troca o Playwright por outro runner.
  · Você NÃO rebaixa o marcador da R24 — é do revisor, na síntese.
  · Você NÃO mexe em componente para compensar cobertura perdida.

VERIFICAÇÕES, com a saída colada:
  npx vitest run          (INTEIRA — a suíte unitária não pode encolher)
  npm run audit
  node gates/scripts/release/check-audit-baseline.mjs --with-tsc
  npm run package:check   (as deps saíram do tarball?)
  git diff --stat

DECLARE se dist/ mudou e toda baseline que se moveu.

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] **O que cada spec cobria está escrito** — a medição do PASSO 1, antes da remoção.
- [ ] Config, script, **duas dependências** e os 4 arquivos removidos; as pastas `__e2e__/` não existem mais.
- [ ] [[11-testes-e-cobertura]] **declara a ausência** de E2E e o que passou a ser manual.
- [ ] O adiamento está numerado em [[15-divida-conhecida]] **§4**, não §3.
- [ ] `npx vitest run` **não encolheu** — nenhum teste unitário foi levado junto por engano.
- [ ] Baseline sem regressão.

# 8. Como verificar

```bash
npx vitest run
npm run audit
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
git diff --stat
```

# 9. Destino da síntese

[[11-testes-e-cobertura]] — a ausência declarada e o que virou manual · [[15-divida-conhecida]] §4 — o
adiamento numerado.

# 10. Resumo da execução

*(a preencher pelo executor)*

# 11. Veredito

*(a preencher pelo revisor)*
