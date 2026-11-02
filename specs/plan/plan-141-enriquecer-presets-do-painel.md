---
tipo: "plan"
titulo: "Fazer os presets do painel mostrarem a capacidade e a granularidade da lib"
objetivo: "Fazer os presets do painel cobrirem a maior parte dos tokens estéticos sem cor, com opções distintas de barras, forma, componentes, fontes, movimento e ícones, de seis a oito opções visíveis por grupo, nome legível nos seis idiomas e nenhum token novo"
dominio: "Painel de customização / Presets"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "painel", "presets"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[09-temas-e-presets]]", "[[plan-140-painel-coluna-unica]]", "[[plan-145-personalidades]]", "[[anexos/painel-design-prototipo]]"]
depende_de: "plan-140-painel-coluna-unica"
retida_por: ""
destino_sintese: "specs/specs/09-temas-e-presets.md + specs/specs/06-painel-de-customizacao-e-preview.md"
---

# 1. Objetivo

Quem abre o painel descobre, pelas opções, tudo o que a lib sabe fazer, sem precisar do ajuste fino. O preset é a vitrine da granularidade.

# 2. Contexto

Decisão do dono (2026-11-01): os presets devem elucidar a capacidade e a granularidade da lib. Vem depois da 139 (prévias reais) e da 140 (as seis decisões).

**Medido em 2026-11-01:** o schema tem 336 tokens estéticos, e os presets escrevem só **48** (14%). Hoje:

| Grupo | Presets | Tokens distintos |
|---|---|---|
| Cards | 12 | 21 |
| Texturas | 41 | 1 |
| Botões | 12 + 6 estilos | 15 |
| Campos | 12 | 9 |
| Mídia de atmosfera | 5 | 4 |
| Fontes | 42 | 2 |

**Sem preset nenhum:** barra lateral, topbar, 36 dos 56 de card, ícones, títulos, movimento, tabela, gráfico, vidro, scroll, sombra, modal, tooltip, switch, status, chat, matriz.

Há dois problemas opostos: áreas sem opção alguma e 41 texturas sem organização. **Variedade não pode virar excesso:** cada grupo mostra de 6 a 8 opções curadas e "Ver todas". Nomes e descrições hoje são texto fixo, em inglês ou genéricos.

**Cor é da paleta:** preset de estrutura não escreve cor. `ComponentPreset` (`{ id, name, description, design }`) é parcial e só escreve tokens da sua área. Preset é dado, nunca código ([[09-temas-e-presets]] §3).

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/presets/components/` — presets novos, arquivos das categorias novas, testes.
- `src/features/DesignEngine/` — o grupo visual de cada categoria, no molde dos grupos existentes, e seu lugar na decisão.
- `src/core/i18n/` — nomes e descrições, nos seis idiomas.
- Regeneração do que `npm run` pedir, sem editar gerado à mão.

## 3.2 Fora
- Token novo: se um visual exigir token que não existe, **não faça**: liste no resumo.
- Tema embarcado e paleta. Personalidades (plan-145).
- CSS novo além do que o token já alcança.
- Imagem, vídeo ou fonte nova no pacote ([[09-temas-e-presets]] §5.1 e §5.3).
- Mudar `id` de preset publicado.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/09-temas-e-presets.md` §3, §5, §5.1, §5.2 | preset × tema, offline, diversidade |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` §2, §6.4 | decisões e catálogos |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` §3.6 | nomes pelo catálogo |
| Spec fixa | `specs/arquitetura/02-design-engine.md` §10 | o que cada família de token faz |
| Anexo | `specs/plan/anexos/painel-design-prototipo.html` | telas Fontes, Forma e Componentes |
| **Skill** | `ui-criar-preset` · `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | autoria do preset · sempre · token |

# 5. Instruções de execução

1. Fotografe o worktree. Liste no resumo cada grupo de hoje, com os tokens que escreve, e os pares quase iguais.
2. **Mapa de cobertura primeiro:** um script mede quantos tokens estéticos sem cor algum preset escreve, por família. Rode antes e depois. Cada token que ficar de fora tem motivo: sem efeito visível isolado, ou só faz sentido no ajuste fino.
3. **Layout.**
   - Barra lateral (≥ 6): Limpa, Contornada, Sólida, Flutuante, Compacta… combinando `sidebarBorderStyle`, lado da borda, `sidebarActiveItemStyle` e densidade.
   - Topbar (≥ 5): Transparente, Sólida, Com separador, Vidro…
   - Largura do conteúdo: as 6 de `maxContentWidth`.
4. **Forma.**
   - Cards: ≥ 18, explorando os 36 tokens de card sem preset.
   - Cantos, densidade e sombra (`shadowIntensity`, `shadowColorMode`, `shadowProjectionBlur`): ≥ 4 cada. Direção da sombra: as 5 de `shadowOrientation`.
   - Borda: as 5 de `borderType`. Material: as 4 de `surfaceMaterial`.
   - Vidro: ≥ 4, com `glassBlur`, `glassOpacity`, `glassSpecularity` e `glassSaturation`.
   - Texturas: as 41 agrupadas em famílias (Técnicas, Orgânicas, Geométricas, Materiais). Atmosfera: mídias e os 4 de `bgGradientMode`.
5. **Componentes.**
   - Botões ≥ 18. Campos ≥ 16.
   - Tabela ≥ 5: Padrão, Listrada, Compacta, Sem linhas, Cabeçalho forte (`tableDensity`, `tableZebraStriping`, `tableBorderRadius`, `tableCellPadding`).
   - Gráfico ≥ 5: tipo mais `chartThickness`, `chartSmoothing`, `chartShowGrid`, `chartGridOpacity`.
   - Modal ≥ 3, tooltip ≥ 3, switch: as 4 de `switchStyleType`, scroll ≥ 3, selos e estados vazios ≥ 3 cada.
   - Por último, se o token render: chat, Kanban e matriz.
   - **Movimento** ≥ 4: Instantâneo, Ágil, Sereno, Expressivo (`motionDuration*`, `motionEase*`, `motionStaggerDelay`), mais as 5 de `pageTransitionType`.
   - **Ícones** ≥ 6: combinações curadas das 3 famílias e 6 pesos, com contorno.
6. **Fontes.** Pares ≥ 10, por personalidade, só com `THEME_FONTS`. Escala tipográfica ≥ 4: Compacta, Padrão, Editorial, Impacto, que mudam tamanho, peso e espaçamento dos títulos e do corpo juntos. As 42 fontes seguem, agrupadas por categoria.
7. **Curadoria.** Cada grupo mostra de 6 a 8 opções e "Ver todas". Distinto: ao menos dois tokens com efeito visível diferem de todo preset do grupo. Grupo com poucos tokens rende menos opções: entregue o que for distinto e diga por quê. **Qualidade vale mais que número.**
8. **Nomes.** Todo preset, novo e antigo, tem nome e descrição pelo catálogo, nos seis idiomas, sem jargão. O `id` não muda.
9. **Legível.** Todo preset aplicado sobre os 19 temas, nos dois modos, mantém os pares de `PAIRS` passando. Teste que varre.
10. **Sem vazamento.** Preset escreve só tokens da sua área e nenhuma cor. Regra em teste por grupo.
11. **Prévia para o dono:** `C:\tmp\sarak-previa-141\index.html`, com cada grupo nos dois modos, marcando o que é novo, e o mapa de cobertura antes e depois.
12. Depois de `npm run build`, rode os specs do painel e `troca-de-tema`. O orçamento não sobe. Depois: `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`.
13. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] Presets cobrem ≥ 60% dos tokens estéticos sem cor; o resto tem motivo no mapa — teste de cobertura.
- [ ] Mínimos dos passos 3 a 6 atingidos, ou a falta justificada — teste de contagem por grupo.
- [ ] Distinção entre presets — teste.
- [ ] De 6 a 8 opções visíveis por grupo com "Ver todas" — teste.
- [ ] Pares de `PAIRS` passando com todo preset sobre os 19 temas × 2 modos — teste.
- [ ] Nenhuma cor em preset de estrutura — teste.
- [ ] Todo preset com nome nos seis idiomas — teste.
- [ ] Nenhum token novo; nenhum `id` publicado mudou.
- [ ] Prévia gerada; a aprovação do dono é registrada pelo revisor no veredito.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo.

- `npx vitest run src/core/Design src/features/DesignEngine src/core/i18n` — uma vez.
- `npm run boot:measure` — o boot não cresce: preset do painel fica fora do boot.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` — uma vez.
- Medição independente da troca de tema: a rotina está em [[11-testes-e-cobertura]] §7.3 e no spec `troca-de-tema`.
- A prévia aberta; o veredito só fecha com a aprovação do dono.

# 8. Destino da síntese

**Destino:** `specs/specs/09-temas-e-presets.md` + `specs/specs/06-painel-de-customizacao-e-preview.md`.

- 09 §5: as categorias de preset e a regra de que preset de estrutura não escreve cor. Contagens saem do registro, nunca transcritas.
- 06 §6.4: onde cada categoria mora, e a curadoria de 6 a 8 opções.

---

# 9. Resumo da execução

---

# 10. Veredito
