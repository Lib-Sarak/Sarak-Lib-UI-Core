---
tipo: "plan"
titulo: "Autorar a contraparte dos temas de referência e dar uma porta de derivação ao consumidor"
objetivo: "Alternar entre claro e escuro deixa de degradar a paleta nos temas de referência e em qualquer tema derivado deles"
dominio: "Sarak-Lib-UI-Core / Design Engine / Temas"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "temas", "contraparte", "modo-claro-escuro"]
relacionados: ["[[specs/09-temas-e-presets]]", "[[arquitetura/01-forma-do-produto-e-modos-de-consumo]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/09-temas-e-presets.md"
---

# 1. Objetivo

Os dois temas de referência ganham contraparte autorada, e o consumidor passa a ter uma porta de derivação
que produz um tema completo **com a contraparte ajustada** — de modo que alternar claro↔escuro seja
reversível tanto na lib quanto em quem parte dela.

# 2. Contexto

O dono reportou: *"no sistema antigo a troca de claro para escuro é neutra e eficiente, atualmente nem
tanto"*. A causa é mecânica e tem duas metades.

**Metade 1 — a lib.** `grep` sobre `src/core/Design/presets/themes/`: **5 dos 23** temas têm `contraparte`
autorada, e são exatamente os 5 criados pela plan-25. `minimalist-airy` e `sarak-sovereign` — os dois de
`SARAK_REFERENCE_THEMES`, que [[09-temas-e-presets]] §4.1 manda clonar, em negrito — **não têm**. Sem ela,
`resolveThemeForMode` cai no fallback `syncThemeWithMode`, que a própria spec (§2.1) mede como saturante e
**não reversível**: *"escuro → claro → escuro devolve faixa de faixa, não o original"*. E desde a decisão D
(plan-24-1) o resultado convertido é **gravado** no design do sistema, então cada ida e volta afasta mais.

O `auditor_contraste` está verde porque os dois estão em `CONTRAPARTE_EXEMPTION_LIST`
(`gates/scripts/audit/verify_contrast.ts:288`), a lista de isenção que nasceu com os 18 legados e que a
plan-26 declarou **só poder encolher**. Esta plan a encolhe em dois.

**Metade 2 — o consumidor, e é aqui que a lib erra sozinha.** O ERP faz exatamente o que a spec manda:

```ts
design: { ...REF_LIGHT.design, primaryColor: ERP_BLUE, accentColor: ERP_BLUE, btnPrimaryBg: ERP_BLUE }
```

Copia `design` e **descarta `contraparte`** — porque a spec nomeia o campo `design` como ponto de partida e
o consumidor, naturalmente, copiou aquele. Autorar as contrapartes sem consertar isso deixa o ERP
degradando exatamente como hoje: a lib certa, o consumidor errado. Pela regra desta base — corrigir na lib,
nunca no consumidor — isso significa que a lib ainda está errada.

É a repetição literal da lição de [[09-temas-e-presets]] §4.3: *"a lib recomendava o caminho que
degradava"*. Sem a porta de derivação, ela recomendaria de novo.

**Sobre autorar:** [[09-temas-e-presets]] §2.1 mediu que a contraparte gerada diverge **93 a 98%** da
autorada, e que a derivação colapsa os matizes distintos. Gerar e aceitar não serve. O processo aprovado
pelo dono tem três passos, e o terceiro é dele: a máquina gera a semente, o executor corrige até o gate
fechar, e **o dono dá o veredito visual** antes de a plan ser aprovada.

Temas **novos** já nascem com contraparte por processo — a skill `ui-criar-tema` a exige e o gate a cobra.
O problema é só o legado, e dentro dele só os dois que todo mundo clona.

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/presets/themes/minimalist-airy.ts` — bloco `contraparte` autorado (modo escuro).
- `src/core/Design/presets/themes/sarak-sovereign.ts` — bloco `contraparte` autorado (modo claro).
- `gates/scripts/audit/verify_contrast.ts` — os dois ids saem de `CONTRAPARTE_EXEMPTION_LIST`.
- `src/core/Design/presets/themes/reference.ts` — a porta de derivação, junto de `SARAK_REFERENCE_THEMES`.
- `src/index.ts` — exportar a porta de derivação.
- `src/core/Design/presets/themes/__tests__/` — teste da porta: o tema devolvido é completo, a contraparte
  vem junto, e uma sobreposição de cor de marca aparece nos dois modos.
- `docs/migracoes.md` — entrada da porta nova, com o exemplo de troca para quem hoje espalha `.design`.

## 3.2 Fora
- Os outros 16 temas isentos — a lista encolhe em dois, não é esvaziada nesta plan.
- Os 5 temas que já têm contraparte.
- `resolveThemeForMode`, `syncThemeWithMode` e `color-engine.ts` — o mecanismo funciona; falta o dado.
- `SARAK_REFERENCE_THEMES` continua sendo o mesmo par de ids; trocar a referência mudaria a base de quem já
  integrou e foi decidido contra pela plan-25.
- Qualquer alteração no repositório do ERP — é consumidor, e o conserto é na lib.
- Qualquer refactor não listado em §5.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `specs/09-temas-e-presets.md` | §2.1 (por que a contraparte é autorada e não derivada), §4.1 (a regra de partir de uma referência), §4.3.1 (a decisão D e os cinco caminhos), §6.5 (o gate de contraste) |
| Spec fixa | `specs/01-gates-e-baseline.md` | antes de rodar qualquer gate; o baseline não é zero |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `ui-criar-tema` | é a skill dona deste trabalho — inclui o solucionador de contraste (`scripts/solve_theme_contrast.ts`) e a regra de registrar o relatório dele |
| Código | `src/core/Design/presets/themes/terracota-solar.ts:438-468` | contraparte autorada de referência: repare que o off-white guarda a temperatura do tema |
| Código | `src/core/Design/presets/themes/reference.ts` | onde a porta de derivação vai morar |
| Código | `gates/scripts/audit/verify_contrast.ts:284-325` | a lista de isenção e como ela é auditada |
| Código | `src/core/Design/presets/themes/color-engine.ts` | `resolveThemeForMode` e os três casos que ela decide |

# 5. Instruções de execução

1. Ler as referências da §4, com atenção ao exemplo do `terracota-solar`.
2. Gerar a semente da contraparte dos dois temas com o mecanismo existente. **Isto é ponto de partida, não
   resultado** — está medido que ele diverge 93 a 98% do que uma contraparte autorada traz.
3. Corrigir os valores até que os dois temas passem no `auditor_contraste` nas **duas** passadas, com **0
   reprovados**, preservando a identidade do tema — matiz, temperatura e caráter — em vez de convergir para
   uma paleta neutra. Rodar o solucionador da skill e guardar o relatório.
4. Remover os dois ids de `CONTRAPARTE_EXEMPTION_LIST`. **Pronto quando** o gate reprovaria se a
   contraparte fosse retirada.
5. Criar a porta de derivação em `reference.ts`: recebe o id de um tema de referência e um conjunto de
   sobreposições, devolve um tema **completo** — `design` e `contraparte` — com as sobreposições aplicadas
   de forma coerente nos dois modos. **Pronto quando** derivar com uma cor de marca produz um tema cuja
   troca de modo continua reversível.
6. Exportar a porta no barril e conferir `npm run barrel:check` e `npm run catalog:check`.
7. Escrever a entrada em `docs/migracoes.md`: quem hoje espalha `...REF.design` perde a contraparte, e o
   exemplo de como passar a usar a porta.
8. Rodar `npx vitest run`, `npm run audit` e `npm run themes:diversity`.
9. **Parar e entregar para o veredito visual do dono** — a plan não é aprovada sem ele. No resumo, indicar
   como ver os dois temas nos dois modos.

# 6. Critérios de aceite

- [ ] `minimalist-airy` e `sarak-sovereign` têm `contraparte` autorada, com os tokens de modo cobertos.
- [ ] Os dois saíram de `CONTRAPARTE_EXEMPTION_LIST`, e a lista só encolheu.
- [ ] `auditor_contraste` fecha 0 nas duas passadas para os dois temas.
- [ ] Ida e volta entre modos devolve o valor original, provado por teste chave a chave nos dois temas.
- [ ] A porta de derivação devolve tema completo com contraparte, e uma sobreposição de cor de marca
      aparece nos **dois** modos.
- [ ] A porta está no barril; `barrel:check` e `catalog:check` verdes.
- [ ] `docs/migracoes.md` explica a perda silenciosa de `contraparte` ao espalhar `.design` e mostra a troca.
- [ ] `npx vitest run` verde; `npm run audit` comparado ao baseline; `themes:diversity` sem regressão.
- [ ] **Veredito visual do dono registrado** antes da aprovação.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — a regra já existe e já tem gate (`auditor_contraste` exige contraparte fora da lista de
isenção). Esta plan **entra** na régua existente em vez de criar régua nova; criar uma segunda seria
duplicar cobrança sobre o mesmo invariante.

- `git diff --stat` → só os arquivos de §3.1.
- Leitura das duas contrapartes → os valores guardam a temperatura do tema, não convergem para cinza.
- `npm run audit` → `auditor_contraste` com 0 reprovados nas duas passadas, e a lista de isenção com dois
  ids a menos.
- `npx vitest run src/core/Design` → verde, incluindo o teste de ida e volta.
- `npm run barrel:check` · `npm run catalog:check` → verdes.
- `npm run themes:diversity` → sem regressão de banda.
- `npx vitest run` → verde.
- Confirmar que o veredito visual do dono está no resumo da execução.

# 8. Destino da síntese

**Destino:** `specs/09-temas-e-presets.md`

Pontos a atualizar:

- §2.1 — a contagem de temas com contraparte e o estado da lista de isenção passam a apontar a **fonte
  viva** (`npm run audit`), nunca um número em prosa.
- §4.1 — a regra de partir de uma referência ganha a porta de derivação como caminho recomendado. Texto
  pronto para transporte:

> Derivar um tema da referência é uma chamada, não uma cópia de campo: a porta devolve o tema **completo**,
> com `design` e `contraparte`, e aplica as sobreposições nos dois modos. Espalhar `...tema.design` copia
> só metade do tema — a contraparte fica para trás e a troca de modo passa a degradar, em silêncio.

- §5.1 — a concentração do catálogo não muda, mas o estado da contraparte sim.

---

# 9. Resumo da execução

---

# 10. Veredito

---

# 11. Síntese
