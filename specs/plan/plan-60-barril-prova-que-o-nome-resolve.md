---
tipo: "plan"
titulo: "Fazer o barril provar que o nome exportado resolve para o componente"
objetivo: "Fazer o gate do barril provar que cada nome público resolve para o componente, e não apenas que ele está registrado"
dominio: "Sarak-Lib-UI-Core / Superfície pública / Gates"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "barril", "superficie-publica", "gate", "exports"]
relacionados: ["[[arquitetura/03-superficie-publica]]", "[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/00-regras-e-invariantes.md · specs/01-gates-e-baseline.md"
---

# 1. Objetivo

`barrel:check` deixa de aceitar um nome **registrado** no barril como prova de que o consumidor alcança o
componente: ele passa a exigir que o nome **resolva** para o componente — e reprova quando um export
explícito sombreia o `export *` da categoria.

# 2. Contexto

## 2.1 O defeito que este gate não viu, medido

Um átomo entrou em `src/components/atomic/Navigation/`, foi exportado pelo barril da categoria
(`export * from './SarakNavItem'`), e `barrel:check` fechou **verde**. Mas `src/index.ts:56` já trazia um
`export type { … SarakNavItem }` vindo de `components/Layout/SarakAppChrome` — e, em ES/TS, **export
explícito sombreia `export *`**.

Medido pela API do compilador sobre `src/index.ts` (`getExportsOfModule`), em 2026-09-08:

- o nome `SarakNavItem` tem **uma única** entrada exportada;
- ela resolve para a interface de `components/Layout/chrome/navItem.ts:17`;
- ela **não é valor** — logo, `import { SarakNavItem }` devolve o **tipo**, e o componente é
  **inalcançável pelo barril público**.

Dois agravantes, ambos conferidos: `SarakNavItemProps` e `SarakNavItemOrientation` **são** exportados
normalmente (não colidem) — a base publica as props de um componente que não publica; e
`sarak-ui/catalog.json`, que é gerado, **anuncia o nome ao consumidor**.

## 2.2 Por que é o gate, e não um caso isolado

Este é **exatamente** o modo de falha que fez o `barrel:check` nascer. O cabeçalho dele registra que a
ausência do gate deixou `SarakLink` e os seis inputs básicos *"viverem só no Registry sem chegar ao
consumidor"*. A mesma classe de defeito voltou por um caminho que ele não cobre: ele compara **listas de
nomes** (componentes descobertos × nomes exportados) e não pergunta **para o quê** cada nome resolve.

**A régua da §5.4 se aplica limpa:** o invariante vale para **todo** componente público e é sobre a
**relação** entre o nome e o símbolo — nenhum teste de módulo enxerga isso. É regra de gate, e é **uma** só.

## 2.3 Precondição — JÁ CUMPRIDA: a colisão viva não existe mais

O componente foi renomeado para `SarakMenuItem` em **2026-09-08**, por tarefa direta, e o `src/` está
limpo: `SarakMenuItem` resolve para **valor**, `SarakNavItem` segue sendo só o **tipo** da prop `navItems`.

**Consequência para esta plan:** o repositório real **não tem mais o caso que falha**. O caso plantado em
**fixture** não é conveniência — é a única forma de provar que a regra morde. Molde:
`check-class-merge.test.mjs`.

O defeito histórico está descrito em `docs/migracoes.md` (entrada da correção de nomenclatura) e a
medição original está na §2.1 acima — **não** vá procurá-lo no `src/`, ele não está lá.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `gates/scripts/contrato/check-barrel-parity.mjs` — a verificação nova, o cabeçalho de **limites
  declarados (R18)** atualizado, e a função exportada para o teste.
- `gates/allowlists/barrelExclusions.mjs` — **só** se algum nome legítimo precisar de exceção declarada,
  com motivo escrito. Ampliar allowlist sem motivo é reprovação.
- `gates/scripts/contrato/__tests__/` — o teste do gate, com o caso plantado que **falha**.
- `package.json` — nada, salvo se a verificação exigir script próprio; o gate já tem o dele.

## 3.2 Fora (o que NÃO pode ser tocado)

- **`src/` inteiro.** Esta plan constrói a verificação; ela **não** renomeia nada nem conserta colisão.
  Achado vira linha no resumo.
- **A fronteira da R14** — o que é "componente consumidor-facing" não muda aqui. Só a **profundidade** da
  prova muda: de "o nome está lá" para "o nome resolve para o componente".
- `src/index.ts` — nem para reordenar exports. Se a ordem for parte da solução, isso é achado para o dono.
- `dist/`, `sarak-ui/`, `sarak-dev/`, `docs/component-catalog.*` — gerados ([[00-contexto]] §7).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contexto | `specs/00-contexto.md` | sempre — regras inegociáveis, o que é gerado, comandos |
| Spec fixa | `specs/00-regras-e-invariantes.md` | **R14** (barril completo, e o vão já declarado nela) e **R18** |
| Spec fixa | `specs/arquitetura/03-superficie-publica.md` | §2 (o barril é o contrato), §3 (como a superfície é derivada), §4 e §4.2 (o gate e o que ele não cobre) |
| Spec fixa | `specs/01-gates-e-baseline.md` | onde este gate roda e como se lê a saída dele |
| Spec fixa | `specs/11-testes-e-cobertura.md` | os gates-teste são categoria própria (§4) — é onde o teste deste gate se encaixa |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `ui-auditoria-modulo` | auditoria estrutural ao final |
| Código | `gates/scripts/contrato/check-barrel-parity.mjs` | ler inteiro — inclusive o cabeçalho que conta por que o gate existe |
| Código | `scripts/publicComponents.mjs` | a fonte da verdade dos nomes; já usa a API do TypeScript por AST |
| Código | `gates/scripts/contrato/check-class-merge.mjs` + `__tests__/check-class-merge.test.mjs` | **molde**: cabeçalho R18, função exportada, `main()`, e teste com caso plantado que reprova |
| Código | `gates/allowlists/barrelExclusions.mjs` | molde de allowlist com motivo por entrada |
| Código | `src/index.ts` | **ler**, nunca editar — é o alvo da verificação |

# 5. Instruções de execução

1. **Ler antes de editar** os arquivos de código da §4 e as specs fixas listadas. A medição da §2.1 já foi
   feita; não a repita.
2. **Escolher o mecanismo de resolução e justificar no resumo.** O `publicComponents.mjs` já usa a API do
   TypeScript; resolver os exports de `src/index.ts` pelo *type checker* (`getExportsOfModule` +
   `getAliasedSymbol`) é o caminho que a §2.1 usou e que distingue **valor** de **tipo**. Alternativa
   textual (ler as linhas de `export`) não distingue os dois — se você a escolher, explique como.
   *Pronto quando:* o resumo diz qual mecanismo, e por quê.
3. **Implementar a verificação:** para cada componente consumidor-facing, o nome correspondente exportado
   por `src/index.ts` **resolve para um valor**, e esse valor é o componente. Sombreamento por export
   explícito, colisão de nome e nome que resolve só para tipo passam a **reprovar**.
4. **Atualizar o cabeçalho de limites (R18)** do gate: o que a verificação nova **não** vê continua
   declarado, e o vão antigo que ela fechou sai da lista.
5. **Escrever o teste do gate**, no molde de `check-class-merge.test.mjs`: pelo menos um caso **plantado**
   em que um export explícito sombreia o `export *` e o gate **reprova**, e um caso conforme em que ele
   libera. Regra sem caso que falha não é regra ([[00-prompt-revisor]] §5.4).
6. **Rodar** `npm run barrel:check` sobre o repositório real e **relatar a saída no resumo**. O esperado
   é **verde** — a colisão foi consertada antes (§2.3). Se vier vermelha, é achado novo: relate e **não**
   conserte o `src/`, que está fora do escopo (§3.2).
7. **Rodar a suíte completa** (`npx vitest run`, inteira) e `npm run audit` — comparado ao baseline,
   **nunca** a zero.

# 6. Critérios de aceite

- [ ] O gate reprova um nome público que **não resolve para o componente** — sombreado, colidido, ou que
      resolve só para tipo.
- [ ] Existe teste com caso **plantado** provando a reprovação, e um caso conforme provando a liberação.
- [ ] O cabeçalho de **limites declarados (R18)** foi atualizado: o vão fechado saiu, o que resta está
      escrito.
- [ ] `npm run gate-limits:check` verde.
- [ ] **Nenhum arquivo de `src/` no diff.**
- [ ] A allowlist não cresceu — ou cresceu com motivo escrito por entrada, declarado no resumo.
- [ ] A saída de `npm run barrel:check` sobre o repositório real está **colada no resumo**, seja qual for.
- [ ] `npx vitest run` verde; `npm run audit` sem violação nova contra o baseline.

# 7. Como verificar (uso do revisor)

**Gate:** `barrel:check` **aprofundado** — nome público não basta estar registrado no barril; ele tem de
**resolver** para o componente. É **uma** regra de gate, e é sobre a relação nome↔símbolo, que nenhum teste
de módulo alcança ([[00-prompt-revisor]] §5.4).

- `git status` + `git diff --stat` → nenhum arquivo de `src/`. Qualquer um reprova.
- Ler o diff do gate inteiro, e o cabeçalho R18.
- Rodar o teste do gate e **ver o caso plantado falhar** com a verificação removida — a prova de que a
  regra morde.
- `npm run barrel:check` → comparar minha saída com a colada no resumo.
- `npm run gate-limits:check` · `npx vitest run` · `npm run audit` (contra o baseline).
- Confirmar que a allowlist não ganhou entrada sem motivo.

# 8. Destino da síntese

**Destino:** `specs/00-regras-e-invariantes.md` · `specs/01-gates-e-baseline.md`

- **`00-regras-e-invariantes.md` R14** — a regra não muda; muda **o que o gate dela prova**. O vão
  *"não vê subpasta de categoria"* continua; some (ou encolhe) o vão de profundidade, e o marcador da
  regra é reavaliado contra o escopo novo. **Não presuma que R14 vira ✅** — confira o escopo restante
  antes, que é a régua da §1.2 daquela spec.
- **`01-gates-e-baseline.md`** — a linha do `barrel:check` na tabela de gates passa a descrever a prova
  mais funda, e o bloco de limites correspondente acompanha.
- **Revisar `00-contexto`** na síntese, mesmo que nenhum destino o cite.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
