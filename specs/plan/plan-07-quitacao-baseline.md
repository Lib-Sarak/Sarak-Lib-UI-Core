---
tipo: "plan"
titulo: "Quitar o baseline de auditoria — pagar a dívida que foi documentada e nunca agendada"
dominio: "Sarak-Lib-UI-Core / Qualidade / Gates"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "baseline", "gates", "divida-tecnica"]
relacionados: ["[[01-gates-e-baseline]]", "[[15-divida-conhecida]]", "[[11-testes-e-cobertura]]"]
depende_de: "plan-06"
destino_sintese: "specs/01-gates-e-baseline.md · specs/11-testes-e-cobertura.md · specs/10-seguranca-e-acessibilidade.md"
---

> ⚠️ **O escopo desta plan é PROVISÓRIO até a plan-03 e a plan-06.** A triagem decide o que vira conserto, e a
> auditoria de cobertura pode acrescentar vãos. O revisor reescreve esta seção antes de liberar para execução.

# 1. Objetivo

O `run_audit` fecha em zero — ou o que sobrar no baseline está lá **com o motivo escrito**, como decisão e não
como esquecimento.

# 2. Contexto

O `run_audit` não está em zero, e **nenhuma tarefa da campanha anterior consertou isso**: ela documentou a
dívida com precisão e não agendou pagamento.

**Baseline permanente deixa de ser dívida e vira norma** — e norma que ninguém decidiu adotar é a pior espécie.

Há duas naturezas aqui, e confundi-las é o erro a evitar:

- **Itens que o gate acusa** e ninguém consertou → conserta-se o **código**.
- **Lacunas de gate**, onde o gate **não acusa** → conserta-se o **gate**. Se a plan-06 já ampliou o gate, aqui
  se escreve o que faltava dentro do escopo novo.

# 3. Escopo

## 3.1 Dentro — itens que o gate JÁ acusa

- **Achado 1** — `--sx-*` vivo em `_utilities.css:80,89` **+** o escopo do `auditor_ghostvars`. ⚠️ As duas
  metades juntas: conserto de um lado que o outro não cobra volta na semana seguinte. E **ampliar escopo exige
  ampliar o registro** (o auditor não lê `useDesignVariables.ts`) — senão vira **acusação falsa**.
- `--sarak-button-radius` → o token real é `--sarak-btn-border-radius`. **Erro de grafia.**
- `--sarak-shell-brand-logo-size` → **não existe token nenhum**. É **Expansão** (criar nas 3 fontes), não
  renomeação. Confundir os dois é o que produz token fantasma.
- **`--token` → NÃO corrigir.** Falso positivo dentro de um JSDoc. Trocar a grafia do comentário baixaria o
  número sem consertar nada — é maquiagem, e a regra a proíbe por escrito. **Fica no baseline, com o motivo.**
- `SarakTypography.tsx:39` → fallback negativo; a convenção é `calc(var(--token, <positivo>) * -1)`.
- **`tsc`: os 4 erros de PRODUÇÃO** — `useStructuralStyles.ts:30,71,94` (`ResponsiveValue<number>` recusado por
  um helper que só aceita `string|number`) e `ThemeCustomizationTab.tsx:86` (união de tipo de toast). Os 10 de
  teste ficam para depois.
- **Achado 2** — `upgradeThemePayload(partialMode)`, parâmetro morto (`master-map.ts:148`).
- **Os 7 ids de token duplicados**, no schema **e** no roteamento de persistência: **4 em colunas diferentes**
  (ambiguidade real de roteamento) e **3 repetidos na mesma coluna** (redundância literal). São **dois**
  defeitos sob um sintoma. ⚠️ Consertar muda **qual definição vence** em `getDefaultDesignState()` — **exige
  caracterização antes** (skill `code-adequacao`).

## 3.2 Dentro — lacunas de gate

- **Achado 13** — `src/shared/` fora do `auditor_coverage`: ampliar o escopo **e escrever os testes que
  faltam**. Ampliar sem cobrir só troca verde por vermelho.
- **Achado 14** — criar o gate anti-acoplamento de auth, **ou registrar por escrito que ele não vai existir**.
  *(Uma spec já o declarou entregue uma vez, e ele nunca existiu — é a prova mais limpa de por que a campanha
  anterior aconteceu.)*
- **Achado 15** — medir cobertura em %. Ou se mede e se declara o piso, ou se remove o `@vitest/coverage-v8` e
  se para de prometer.
- **Achado 16** — auditar os **5 sinks** de `dangerouslySetInnerHTML` (`DesignScope:54`, `DesignInjector:173`,
  `SovereignThemeInjector:116`, `PreviewCanvas:181`, `MasterControlPanel:199`), um por um: é CSS gerado pela
  engine, ou conteúdo que atravessa fronteira? Onde for legítimo, **o motivo fica escrito ao lado**.
- **Achado 22** 🔴 — regenerar `design-token-ids.ts` **e registrar `generate-token-types.ts` num pipeline**.
  **As duas metades, ou apodrece de novo.**
- **Achado 23** — `sarak-ui/templates/` fora de todo gate de conteúdo.
- **Achados 24 e 25** — higiene de superfície do scaffold (`mainTsx.mjs:37-40`, `context.mjs:5-10`).

## 3.3 Fora
- ⛔ Baixar número de auditoria sem consertar a causa. **Maquiagem reprova a execução inteira.**
- ⛔ Rodar `npm run audit:baseline` **sozinho**. O baseline se regrava **junto do conserto que o justificou**,
  no mesmo commit — nunca como tarefa separada.
- Os 10 erros de `tsc` em arquivos de teste.
- Achados de comportamento (plan-08) e de contrato público (plan-09).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/01-gates-e-baseline.md` | o baseline exato e o `arquivo:linha` de cada item |
| Spec fixa | `specs/15-divida-conhecida.md` | os achados, com a triagem da plan-03 |
| Spec fixa | `specs/04-contrato-de-tokens-e-paridade.md` §2.2 | a duplicação dos 7 ids, já apurada |
| Skill | `code-adequacao` | caracterização **antes** de mexer nos 7 ids duplicados |
| Skill | `ui-refatorar-componente` | alterar token sem quebrar a paridade das 3 fontes |

# 5. Instruções de execução

1. Um item por vez, na ordem da §3.1 e depois da §3.2. **Cada item fecha com o baseline regravado no mesmo
   commit**, não ao final.
2. Antes dos **7 ids duplicados**: caracterizar `getDefaultDesignState()` — o teste tem de provar qual
   definição vence **hoje**, antes de a ordem mudar.
3. Ao ampliar qualquer escopo de gate, ampliar o **registro/allowlist** na mesma edição. Rodar o gate e
   confirmar **zero acusação falsa**.
4. `--sarak-shell-brand-logo-size` é **criação de token**: as 3 fontes, com a skill `ui-novo-componente`.
5. Achado 22 — regenerar **e** registrar o gerador. A execução que só regenerar está **incompleta**.
6. Achado 16 — os 5 sinks, um a um, com o veredito escrito **ao lado do código**.
7. Ao fim, `npm run audit` e comparar: cada item que saiu do baseline tem um conserto correspondente no diff.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-07-quitacao-baseline.md.

Contexto obrigatório antes de começar: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/01-gates-e-baseline.md, specs/specs/15-divida-conhecida.md,
specs/arquitetura/04-contrato-de-tokens-e-paridade.md.
Skills a aplicar: padrao-typescript, code-adequacao (antes dos 7 ids duplicados),
ui-refatorar-componente, ui-novo-componente, test-unitario.

NUNCA baixe um número de auditoria sem consertar a causa. O `--token` NÃO se corrige —
é falso positivo e fica no baseline com o motivo. Regrave o baseline junto do conserto
que o justificou, nunca sozinho.
Não commite. Ao terminar, escreva o resumo na própria plan.
```

# 7. Critérios de aceite

- [ ] Cada item fechado com o baseline regravado **no mesmo commit** que o conserto.
- [ ] `--token` **continua** no baseline, com o motivo escrito.
- [ ] `--sarak-shell-brand-logo-size` criado nas **3 fontes**; paridade segue 1:1:1.
- [ ] Os 7 ids duplicados: caracterização **antes**, e o teste prova que a definição vencedora não mudou.
- [ ] Achado 22 com **as duas metades** — regenerado **e** o gerador invocado por um pipeline.
- [ ] Achado 13 com escopo ampliado **e** os testes escritos (não só o escopo).
- [ ] Achado 14 com o gate criado **ou** a declaração escrita de que não existirá.
- [ ] Os 5 sinks auditados, com o motivo ao lado de cada um.
- [ ] Nenhum gate ampliado produz acusação falsa.
- [ ] Suíte verde; `npm run gates:full` verde.

# 8. Como verificar

- `npm run audit` → o baseline novo bate com `.githooks/audit-baseline.json`
- `git log -p .githooks/audit-baseline.json` → cada mudança acompanhada do conserto que a justifica
- `npx tsc --noEmit` → os 4 erros de produção sumiram
- `node scripts/generate-token-types.ts` (ou o script que o registrou) → sem diff, e o comando existe no pipeline
- `npm run audit` após ampliar cada gate → zero acusação falsa
- `npx vitest run` → verde

# 9. Destino da síntese

**Destino:** `specs/01-gates-e-baseline.md` (o baseline encolhe) · `specs/11-testes-e-cobertura.md` ·
`specs/10-seguranca-e-acessibilidade.md` (os 5 sinks) · `specs/15-divida-conhecida.md` (as linhas fechadas saem)

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
