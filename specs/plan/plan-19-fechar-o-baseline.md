---
tipo: "plan"
titulo: "Fechar o baseline — matar o falso verde do E2E e zerar o que resta de R10"
dominio: "Sarak-Lib-UI-Core / Qualidade / Dívida"
status: "🔴 A executar"
prioridade: "Máxima"
tags: ["plan", "r10", "e2e", "baseline", "producao"]
relacionados: ["[[00-regras-e-invariantes]]", "[[15-divida-conhecida]]", "[[plan-15-adequacao-total]]", "[[03-superficie-publica]]"]
depende_de: "plan-15 · plan-18"
destino_sintese: "specs/specs/15-divida-conhecida.md · specs/specs/01-gates-e-baseline.md · specs/arquitetura/03-superficie-publica.md"
---

> 🎯 **Esta plan existe para produção.** Os três itens abaixo foram escolhidos por **dano ao consumidor**, não
> por posição em lista: um falso verde, um componente no endereço errado e um padrão que faltava.

# 1. Objetivo

**Matar o falso verde do E2E** e levar `composicaoatomica` de **3 para 1** — o último item depende de conserto
de gate e é da `plan-20`.

# 2. Contexto

## 2.1 O achado 17 é falso verde, e falso verde é pior que vermelho

`playwright.config.ts:7` declara `testDir: './e2e'`. **A pasta não existe.** Quem rodar `npx playwright test`
recebe **verde de zero teste** — confiança sem cobertura, a classe de defeito mais perigosa antes de produção.

**Medido pelo revisor em 2026-08-09, e o caso é mais simples do que a spec de dívida sugeria:**

| Fato | Medição |
|---|---|
| Algum script usa `playwright.config.ts`? | **Nenhum.** O arquivo é órfão |
| O que roda de fato | `playwright-ct.config.ts` (`testDir: './src'`, `testMatch: /.*\.spec\.tsx?$/`), pelo script `test-ct` |
| Os 4 arquivos em `src/**/__e2e__/` | são **component tests** (`@playwright/experimental-ct-react`), não E2E de navegador |

**Decisão do dono (2026-08-09): remover.** Não é "consertar o `testDir`" — é apagar um arquivo que ninguém
usa e que só produz engano.

## 2.2 As 2 ocorrências de R10 desta plan

Sobraram 3 da `plan-15`. **Duas são desta plan**; a terceira (`ChatInput`) exige estreitar a regra e vai para
a `plan-20`.

### `atomic/Atoms/SocialButton.tsx:56` — endereço errado, não violação

A R10 exclui `atomic/Buttons/` e `atomic/Inputs/` porque **um átomo não pode compor a si mesmo**. O
`SocialButton` é um átomo de botão que usa `<button>` cru — legítimo — mas mora em `atomic/Atoms/`, e a
fronteira da regra é **por pasta**.

**Decisão do dono: mover para `atomic/Buttons/`.** Conserta o caso **sem tocar na regra nem no gate**, e
corrige um endereço que já estava errado: um botão social é um botão.

Exposição medida: exportado por `atomic/Atoms/index.ts:1`, consumido por
`atomic/Templates/components/AuthSocialLogin.tsx:30`. **Dois pontos a ajustar**, mais os barris.

### `Layout/SarakAppChromeMobile.tsx:116` — falta um componente

É um `<button>` de tela cheia, sem ícone nem texto, que fecha o drawer ao clique fora. É um **scrim**, e
nenhum átomo atual serve.

**Decisão do dono: criar `SarakScrim`.** Não é conserto de R10 — é o componente que faltava, e a R10 só o
revelou. O padrão se repete pela base (medido):

| Onde | Forma hoje |
|---|---|
| `Layout/SarakAppChromeMobile.tsx:116` | `<button>` de tela cheia |
| `atomic/Inputs/Controls.tsx:124` | `motion.div fixed inset-0 z-40` com `onClick` |
| `atomic/Modals/SarakDrawer.tsx:103` | `div fixed inset-0 transition-opacity` |

Três implementações do mesmo conceito, nenhuma reaproveitável.

# 3. Escopo

## 3.1 Dentro

1. **Deletar `playwright.config.ts`.** Nada mais.
2. **Mover `SocialButton`** de `atomic/Atoms/` para `atomic/Buttons/`, com barris e import ajustados.
3. **Criar `SarakScrim`** em `atomic/Layouts/` e usá-lo em `SarakAppChromeMobile.tsx:116`.

## 3.2 Fora

- **`ChatInput.tsx:117`** — exige estreitar a R10, que é conserto de regra + gate. É a `plan-20`.
- **Migrar `Controls.tsx` e `SarakDrawer.tsx` para o `SarakScrim`.** Eles justificam o componente, não entram
  no escopo: são caracterização e risco visual que esta plan não comporta. Ficam **nomeados** como
  continuação.
- Qualquer alteração de gate. Nenhuma.
- A suíte CT (`npm run test-ct`) **continua fora de automação** — é a `plan-11`, não esta.

# 4. Referências obrigatórias

| Tipo | Onde | Para quê |
|---|---|---|
| Spec fixa | [[00-regras-e-invariantes]] → R10, R14 | a fronteira por pasta, e por que `atomic/Buttons/` é excluída |
| Spec fixa | [[03-superficie-publica]] | mover componente entre categorias mexe no barril público |
| Dívida | [[15-divida-conhecida]] §3.1 | o achado 17, que esta plan fecha |
| **Skill** | `code-adequacao` · `test-unitario` · `padrao-typescript` | mover componente é refactor com risco de import quebrado |

# 5. Instruções de execução

1. **Comece pelo `playwright.config.ts`.** É deleção de arquivo órfão — antes de deletar, **prove** que nada o
   referencia (`grep` em `package.json`, `.husky/`, `scripts/`, CI). Cole a prova.
2. **`SocialButton`:** mover, ajustar `atomic/Atoms/index.ts`, `atomic/Buttons/index.ts`, o import em
   `AuthSocialLogin.tsx` e qualquer teste. `barrel:check` e `deep-import:check` são a rede.
3. **`SarakScrim`:** nasce com teste próprio, e o teste cobre **o que o `<button>` de hoje faz** — clique
   fecha, `aria-label` presente, sem foco visível indevido. Caracterize `SarakAppChromeMobile` **antes**.
4. Um item por vez, suíte inteira verde entre eles.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-19-fechar-o-baseline.md.

Contexto obrigatório: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/00-regras-e-invariantes.md (R10 e R14),
specs/arquitetura/03-superficie-publica.md, e a §2 desta plan.
Skills: code-adequacao, test-unitario, padrao-typescript, padrao-escrita.

TRÊS ITENS, nesta ordem, suíte inteira verde entre cada um:

1. DELETAR playwright.config.ts.
   Antes de deletar, PROVE que é órfão: grep em package.json, .husky/, scripts/
   e qualquer CI. O revisor mediu e não achou referência — confirme e cole.
   O que roda de verdade é playwright-ct.config.ts (script `test-ct`); NÃO toque nele
   nem nos 4 arquivos em src/**/__e2e__/.

2. MOVER SocialButton de atomic/Atoms/ para atomic/Buttons/.
   Ajuste: atomic/Atoms/index.ts:1, atomic/Buttons/index.ts, o import em
   atomic/Templates/components/AuthSocialLogin.tsx:30, e os testes.
   Ele PARA de ser acusado por R10 porque atomic/Buttons/ está fora da regra —
   e isso é o conserto certo, não uma fuga: um botão social é um botão.
   Rede: npm run barrel:check e npm run deep-import:check.

3. CRIAR SarakScrim em atomic/Layouts/ e usá-lo em SarakAppChromeMobile.tsx:116.
   É o backdrop de tela cheia que fecha ao clique fora. Caracterize o
   comportamento atual ANTES (clique fecha, aria-label, teclado) e prove depois.
   O componente nasce com teste próprio e entra no barril público.

META: composicaoatomica 3 → 1. O item restante (ChatInput.tsx:117) é da plan-20 e
você NÃO o toca — se ele sumir do seu diff, algo saiu do escopo.

LINHAS VERMELHAS:
  · Você NÃO altera gate nenhum.
  · Você NÃO edita specs/specs/, specs/adr/, specs/arquitetura/ nem 00-indice.md.
  · Você NÃO migra Controls.tsx nem SarakDrawer.tsx para o SarakScrim — eles
    justificam o componente e ficam nomeados como continuação.

Os três espelhos: gates/baselines/ · sarak-dev/ (npm run dev-kit) · sarak-ui/
(npm run guide — só se a contagem de tokens mudar; aqui não deve).

VERIFICAÇÕES, com a saída colada:
  npm run audit           (ANTES e DEPOIS)
  npx vitest run          (INTEIRA)
  npm run barrel:check · npm run deep-import:check
  npm run gate-limits:check · npm run dev-kit:check
  node gates/scripts/release/check-audit-baseline.mjs --with-tsc
  git diff --stat

DECLARE se dist/ mudou e toda baseline que se moveu, inclusive coverage-floor.json.

Baseline e espelhos se regravam JUNTO. Não commite. Ao terminar, escreva o resumo
na própria plan e mova o status para 🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] `playwright.config.ts` **não existe**, e a prova de que era órfão está no resumo.
- [ ] `npx playwright test` sem argumento **não sai mais verde de zero teste** — ou falha por falta de config,
      que é a resposta honesta.
- [ ] `SocialButton` mora em `atomic/Buttons/`, o barril público **continua exportando o mesmo nome**, e
      `AuthSocialLogin` renderiza igual.
- [ ] `SarakScrim` existe, tem teste próprio, está no barril, e `SarakAppChromeMobile` o usa.
- [ ] O comportamento do drawer mobile está **caracterizado antes e provado depois**.
- [ ] `composicaoatomica` = **1**, e o que sobrou é exatamente `ChatInput.tsx:117`.
- [ ] `barrel:check` e `deep-import:check` verdes — mover componente é onde eles ganham o dia.
- [ ] `npx vitest run` verde, suíte inteira.
- [ ] Baseline regravado junto.

# 8. Como verificar

```bash
test ! -f playwright.config.ts && echo "órfão removido"
npm run audit                    # composicaoatomica = 1
npm run barrel:check
npm run deep-import:check
npx vitest run
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
```

# 9. Destino da síntese

`specs/specs/15-divida-conhecida.md` (achado 17 fecha) · `specs/specs/01-gates-e-baseline.md` (o baseline) ·
`specs/arquitetura/03-superficie-publica.md` (`SarakScrim` novo, `SocialButton` mudou de categoria).

# 10. Resumo da execução

*(a preencher pelo executor)*

# 11. Veredito

*(a preencher pelo revisor)*
