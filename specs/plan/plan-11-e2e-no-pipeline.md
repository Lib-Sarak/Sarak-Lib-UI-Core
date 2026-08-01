---
tipo: "plan"
titulo: "E2E no pipeline — parar de sair verde sem executar nada"
dominio: "Sarak-Lib-UI-Core / Qualidade / Testes"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "e2e", "playwright", "ci", "acessibilidade"]
relacionados: ["[[11-testes-e-cobertura]]", "[[10-seguranca-e-acessibilidade]]", "[[15-divida-conhecida]]"]
depende_de: "plan-05"
destino_sintese: "specs/11-testes-e-cobertura.md · specs/10-seguranca-e-acessibilidade.md · specs/16-integracao-continua.md"
---

# 1. Objetivo

`playwright test` deixa de sair verde sem executar nada, e o não-vazamento do modo embarcado — hoje só
verificável à mão — passa a ser cobrado a cada PR.

# 2. Contexto

Playwright CT está instalado (`npm run test-ct`) e existem specs em `src/core/Provider/__e2e__/` e
`src/features/DesignEngine/__e2e__/`. **Nada disso roda em automação nenhuma**, e algumas exigem
`npm run build` antes.

E há um defeito que é pior que a ausência: `playwright.config.ts:7` aponta `testDir: './e2e'` e **a pasta não
existe**. Hoje `playwright test` **sai verde sem rodar nada** — o pior tipo de verde, porque é
**indistinguível de sucesso**.

A CI da plan-05 é o único lugar onde o `build` prévio não atrapalha, porque lá a árvore é descartável.

# 3. Escopo

## 3.1 Dentro
- **Achado 17 — corrigir o `testDir`. É a primeira linha desta plan**, antes de qualquer jornada nova.
  As specs reais vivem em `src/**/__e2e__/`.
- Levar os E2E para a CI da plan-05; definir **quais jornadas são bloqueantes** e quais são informativas.
- **Achado 18** — contraste **WCAG AA**: ou entra medição real (axe-core na CI, sobre o conjunto atômico), ou
  **a promessa de nível AA sai do texto**. A lib não pode prometer o que não mede — é a mesma classe de defeito
  do gate de auth que nunca existiu.
- **Achado 26** — o `install` real e o `check --notify` no `predev`, se a plan-05 não os tiver coberto.
- `specs/11-testes-e-cobertura.md`, `specs/10-seguranca-e-acessibilidade.md`, `specs/16-integracao-continua.md`.

## 3.2 Fora
- ⛔ Escrever jornada nova **antes** de corrigir o `testDir`. Enquanto ele apontar para o vazio, qualquer
  medida de sucesso é falsa.
- ⛔ Alterar componente para "passar no axe". Achou violação de contraste? **Vira achado**, não conserto de
  passagem — a decisão sobre token de cor é do dono.
- A infraestrutura da CI em si — é a plan-05, da qual esta depende.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/11-testes-e-cobertura.md` | o que já é coberto e por qual camada |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` | a promessa de a11y que precisa ser medida ou retirada |
| Spec fixa | `specs/16-integracao-continua.md` | criada pela plan-05; é onde os E2E passam a rodar |
| Código | `playwright.config.ts:7` · `playwright-ct.config.ts` | o `testDir` errado e a config de CT |
| Skill | `test-e2e` | o padrão de jornada ponta a ponta |

# 5. Instruções de execução

1. **Corrigir o `testDir`** para apontar às specs reais. Rodar e confirmar que o número de testes executados
   é **> 0** — antes disso, nada mais nesta plan tem significado.
2. Inventariar as jornadas existentes: quais rodam sem `build`, quais exigem.
3. Levar para a CI, separando **bloqueante** de **informativo**. Jornada instável entra como informativa e é
   declarada — nunca silenciada.
4. **Contraste WCAG AA** — decidir com o dono: medir com axe-core na CI, **ou** retirar a promessa de AA do
   texto das specs. Não há terceira opção honesta.
5. Se a plan-05 não cobriu o `install` real e o `check --notify`, cobrir aqui.
6. Garantir que o **não-vazamento do modo embarcado** passa a ser cobrado a cada PR.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-11-e2e-no-pipeline.md.

Contexto obrigatório antes de começar: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/11-testes-e-cobertura.md, specs/specs/10-seguranca-e-acessibilidade.md,
specs/specs/16-integracao-continua.md.
Skills a aplicar: test-e2e.

PRIMEIRO corrija o testDir e prove que o número de testes executados é > 0. Enquanto ele
apontar para uma pasta inexistente, todo verde é falso. Violação de contraste vira ACHADO,
não conserto de passagem.
Não commite. Ao terminar, escreva o resumo na própria plan.
```

# 7. Critérios de aceite

- [ ] `playwright test` executa **> 0** testes — provado pela saída.
- [ ] Os E2E rodam na CI; jornadas classificadas em bloqueantes e informativas, com o critério escrito.
- [ ] Contraste AA: **medido** na CI **ou** a promessa retirada do texto — decidido pelo dono, não presumido.
- [ ] O não-vazamento do modo embarcado é cobrado a cada PR.
- [ ] Nenhum componente alterado para "passar no axe"; violações viraram achados em `15-divida-conhecida.md`.
- [ ] `specs/11`, `specs/10` e `specs/16` atualizadas.
- [ ] Suíte unitária segue verde.

# 8. Como verificar

- `npx playwright test --list` → lista testes; **não** sai vazio
- Saída da CI → o passo de E2E reporta contagem > 0
- Se axe entrou: o relatório existe e é lido pelo pipeline
- Se a promessa saiu: `grep -n "AA" specs/specs/10-seguranca-e-acessibilidade.md` → sem promessa não medida
- `git diff --stat` → nenhum componente de `src/components/` alterado por causa de a11y
- `npx vitest run` → verde

# 9. Destino da síntese

**Destino:** `specs/11-testes-e-cobertura.md` · `specs/10-seguranca-e-acessibilidade.md` ·
`specs/16-integracao-continua.md` · `specs/15-divida-conhecida.md` (achados 17, 18 e 26 saem)

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
