---
tipo: "plan"
titulo: "Regular as cores das paletas para que combinem de verdade"
objetivo: "Fazer as cores de cada paleta pronta e das paletas criadas a partir de uma cor combinarem à vista do dono, regulando sementes, croma, luminosidade e intensidade dos fundos, sem mudar a regra de âncora nem a distribuição 60-30-10"
dominio: "Design Engine / Paletas"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "paletas", "cor", "curadoria"]
relacionados: ["[[09-temas-e-presets]]", "[[02-design-engine]]", "[[024-paleta-calculada-separada-do-tema]]"]
depende_de: "plan-136-cor-ancora-fundo-tingido-e-harmonia-visivel"
retida_por: ""
destino_sintese: "specs/specs/09-temas-e-presets.md"
---

# 1. Objetivo

As paletas ficam bonitas. A regra de distribuição já foi aprovada; aqui se regula a **cor**, até o dono aprovar na prévia.

# 2. Contexto

O dono aprovou a distribuição das cores em 2026-10-31, mas disse que as cores em si não combinaram: é regulagem, não funcionalidade. O motor continua:
âncora nos preenchimentos, deslocamento mínimo no texto, fundo tingido, 60-30-10.

**O que a revisão viu:**

- **A harmonia é só um ângulo.** Secundária e acento saem do ângulo do tipo, com croma proporcional à base. Ângulo certo não garante cor bonita:
  o matiz em OKLCH não tem o mesmo peso visual em toda a volta.
- **Fundos tingidos pela secundária pesam.** Em `rosa-synthwave` no claro, o cabeçalho de cartão, a tabela e o botão secundário saem verde-claros sobre
  fundo rosa.
- **O tema padrão mudou de identidade.** `ciano-violeta` (`sarak-sovereign`) perdeu o violeta e o magenta, porque a análoga anda ±30°. No escuro, título
  e subtítulo ficaram próximos.
- **Nomes que deixaram de ser verdade:** "Ciano e violeta" sem violeta; "Tinta e vinho" é `#857461`, um marrom acinzentado; "Rosa pastel" é `#ce475c`, um
  rosa forte.
- **Bases desbotadas.** Levar as bases para L 0,56–0,59 tirou vida de `rosa-synthwave` e `coral-cinetico`.

**O erro a não repetir:** regular às cegas e mostrar uma só opção. O dono escolhe vendo alternativas.

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/palette/presets.ts` — bases e sementes.
- `src/core/Design/palette/seeds.ts`, `scale.ts`, `role-map.ts` — fatores de croma, deslocamento de matiz por faixa e intensidade dos papéis tingidos, numa
  regra única para toda paleta, inclusive a criada a partir de uma cor.
- `src/core/i18n/catalogEntries.palette.ts` — nomes de preset, nos seis idiomas.
- `src/core/Design/palette/__tests__/` — os limites abaixo.
- `src/core/Design/presets/themes/catalog.generated.ts` por `npm run themes:catalog`; snapshots de cor; `docs/migracoes.md`, se precisar.

## 3.2 Fora
- A regra de âncora, a distribuição 60-30-10 e o tingido do corpo.
- Tokens novos e os `PAIRS`.
- Os ids dos 15 presets.
- Arquivos de tema, salvo trocar o preset ou retirar sobrescrita que a regulagem tornar desnecessária.
- O painel (plans 138 a 141).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| ADR + spec | `specs/adr/024-paleta-calculada-separada-do-tema.md` · `specs/specs/09-temas-e-presets.md` §4.3.4, §5 | o motor e o catálogo |
| Spec fixa | `specs/arquitetura/02-design-engine.md` §10.3 | papéis de cor |
| Código | `src/core/Design/palette/__tests__/anchor-and-shift.test.ts` | os limites que seguem valendo |
| Exemplo | `C:\tmp\sarak-previa-136\gen\` | gerador da prévia anterior, a reaproveitar |
| **Skill** | `ui-criar-tema` · `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | autoria · sempre · token |

# 5. Instruções de execução

1. Fotografe o worktree.
2. **Regra de harmonia.** Mantenha o tipo, mas permita a uma semente declarada sair do ângulo quando o resultado for melhor: a tolerância de ±15° passa a
   ±45° nas paletas de várias cores. Ela mira a beleza do preset, não a precisão do ângulo. O teste segue exigindo croma ≥ 60% da base.
3. **Intensidade dos fundos.** Os papéis tingidos pela secundária (`btnSecondaryBg`, `cardHeaderBg`, `tableHeaderBg`) ficam mais sutis, numa regra única.
4. **Três variantes.** Para cada preset, prepare até três opções numa tabela temporária fora do `src/`, e gere a **prévia comparativa** em
   `C:\tmp\sarak-previa-143\index.html`, sem servidor e sem gravar nada no registro ainda: preset × variante × 2 modos, com a mesma tela da plan-136. Inclua
   a criação a partir de uma cor, com as 6 bases.
5. **`ciano-violeta`:** uma das variantes devolve o violeta como secundária.
6. **Pare aqui e entregue a prévia ao revisor.** O dono escolhe a variante de cada preset; o revisor grava a escolha no veredito, e a execução retoma.
7. Grave as escolhas no registro. Nome de preset passa a dizer a cor que ele tem, nos seis idiomas.
8. **Trava de deslocamento** nos presets de base média: `primaryColor` e `cardTitleColor` ≤ 0,04; `titleColor` ≤ 0,06; `navItemActiveColor` ≤ 0,13. Até 5 presets
   vivos ficam fora, com o motivo no resumo.
9. `npm run themes:catalog`. Revise as sobrescritas dos temas: a que deixou de servir sai.
10. `npx tsx gates/scripts/audit/verify_contrast.ts` e `npm run themes:diversity`.
11. Depois de `npm run build`, rode `plan-123-color-hierarchy`, `plan-124-sidebar-contrast`, `plan-122-preview-mode`, `plan-135-paletas-no-painel` e
    `painel-segue-o-modo`. Depois: `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`.
12. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] Prévia comparativa entregue antes de gravar; escolha do dono registrada no veredito.
- [ ] Limites de deslocamento do passo 8 — teste.
- [ ] Os 15 ids seguem válidos; âncora igual à base; fundo tingido dentro das faixas — testes já existentes, sem afrouxar.
- [ ] Nenhum nome de preset descreve cor que ele não tem — conferência do dono na prévia final.
- [ ] `verify_contrast` com 0 reprovados, 19/19 com contraparte, `themes:diversity` sem piora.
- [ ] Prévia final aprovada pelo dono.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo.

- `npx vitest run src/core/Design src/core/Provider src/features/DesignEngine src/components/atomic gates/scripts` — uma vez.
- `npx tsx gates/scripts/audit/verify_contrast.ts` e `npm run themes:diversity` — uma vez cada.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` — uma vez.
- As duas prévias abertas; o veredito só fecha com a aprovação do dono.

# 8. Destino da síntese

**Destino:** `specs/specs/09-temas-e-presets.md` — §5: a semente de um preset pode sair do ângulo do tipo até o limite do registro, e a harmonia é aprovada à
vista. Os números saem do registro.

---

# 9. Resumo da execução

---

# 10. Veredito
