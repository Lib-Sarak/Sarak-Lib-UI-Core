---
tipo: "plan"
titulo: "Enriquecer os presets do painel com mais opções e novas categorias"
objetivo: "Fazer o painel oferecer mais presets distintos de cards, botões, campos, atmosfera e fontes, além de presets de cantos, densidade, sombra, ícones, movimento e navegação, todos com nome legível nos seis idiomas e sem token novo"
dominio: "Painel de customização / Presets"
status: "🔴 A executar"
prioridade: "Média"
tags: ["plan", "painel", "presets"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[09-temas-e-presets]]", "[[plan-140-painel-coluna-unica]]", "[[anexos/painel-design-prototipo]]"]
depende_de: "plan-140-painel-coluna-unica"
retida_por: ""
destino_sintese: "specs/specs/09-temas-e-presets.md + specs/specs/06-painel-de-customizacao-e-preview.md"
---

# 1. Objetivo

Cada decisão do painel oferece opções variadas e distintas entre si, que mostram a granularidade da lib sem exigir o ajuste fino.

# 2. Contexto

Quarta plan do redesenho. Vem por último de propósito: as prévias reais (139) mostram cada preset de verdade, e as decisões (140) dizem onde
cada categoria mora. É trabalho de curadoria, com revisão visual própria.

Hoje, em `src/core/Design/presets/components/`: 12 cards, 12 botões, 12 campos, 5 atmosferas e 1 preset por fonte (42 fontes). Nomes e
descrições são texto fixo, em inglês ou genéricos ("Preset de tipografia focado na família Sans-Serif").

`ComponentPreset` (`{ id, name, description, design }`) é parcial: o preset escreve só os tokens da sua área. Preset é dado, nunca código
([[09-temas-e-presets]] §3).

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/presets/components/` — presets novos e arquivos das categorias novas, com testes.
- `src/features/DesignEngine/` — o grupo visual de cada categoria nova, no molde da plan-139, e seu lugar na decisão.
- `src/core/i18n/` — nomes e descrições, nos seis idiomas.
- Regeneração do que `npm run` pedir, sem editar gerado à mão.

## 3.2 Fora
- Token novo: se um visual exigir token que não existe, **não faça**: liste no resumo.
- Tema embarcado e paleta (plan-136).
- CSS novo além do que o token já alcança.
- Imagem, vídeo ou fonte nova no pacote ([[09-temas-e-presets]] §5.1 e §5.3).
- Mudar `id` de preset publicado.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/09-temas-e-presets.md` §3, §5, §5.1, §5.2 | preset × tema, offline, diversidade |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` §6.4 | catálogos visuais |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` §3.6 | nomes pelo catálogo |
| Anexo | `specs/plan/anexos/painel-design-prototipo.html` | telas Fontes, Forma e Componentes |
| **Skill** | `ui-criar-preset` · `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | autoria do preset · sempre · token |

# 5. Instruções de execução

1. Fotografe o worktree. Liste, no resumo, cada preset de hoje com os tokens que ele escreve e os pares quase iguais.
2. **Mínimos, em presets visualmente distintos:**

   | Categoria | Hoje | Depois |
   |---|---|---|
   | Cards | 12 | ≥ 18 |
   | Botões | 12 | ≥ 18 |
   | Campos | 12 | ≥ 16 |
   | Atmosfera | 5 | ≥ 10 |
   | Pares de fontes (novo) | 0 | ≥ 10, por personalidade (Corporativa, Editorial, Técnica…) |
   | Cantos, densidade, sombra (novos) | 0 | ≥ 3 cada |
   | Ícones, movimento (novos) | 0 | ≥ 3 cada |
   | Navegação (novo) | 0 | ≥ 3 |

   Distinto: ao menos dois tokens com efeito visível diferem de todo preset da categoria. Se o token existente não der o mínimo, entregue o
   que der e diga por quê. Qualidade vale mais que número.
3. **Fontes.** A lista por família continua, depois dos pares. Par só com fontes de `THEME_FONTS`.
4. **Nomes.** Todo preset, novo e antigo, ganha nome e descrição pelo catálogo, nos seis idiomas, sem jargão. O `id` não muda.
5. **Legível.** Todo preset aplicado sobre os 19 temas, nos dois modos, mantém os pares de `PAIRS` passando. Teste que varre.
6. **Sem vazamento.** Preset parcial escreve só tokens da sua área, com a regra em teste por categoria.
7. **Prévia para o dono:** `C:\tmp\sarak-previa-141\index.html`, com cada categoria nos dois modos, marcando o que é novo.
8. Rode `plan-135-paletas-no-painel` e `cromo-css-real` pelo Playwright, depois de `npm run build`. Depois:
   `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`.
9. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] Mínimos do passo 2 atingidos, ou a falta justificada no resumo — teste de contagem por categoria.
- [ ] Distinção entre presets — teste.
- [ ] Pares de `PAIRS` passando com todo preset sobre os 19 temas × 2 modos — teste.
- [ ] Todo preset com nome nos seis idiomas — teste.
- [ ] Nenhum token novo; nenhum `id` publicado mudou.
- [ ] Prévia gerada; a aprovação do dono é registrada pelo revisor no veredito.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo.

- `npx vitest run src/core/Design src/features/DesignEngine src/core/i18n` — uma vez.
- `npm run boot:measure` — o boot não cresce: preset do painel fica fora do boot.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` — uma vez.
- A prévia aberta; o veredito só fecha com a aprovação do dono.

# 8. Destino da síntese

**Destino:** `specs/specs/09-temas-e-presets.md` + `specs/specs/06-painel-de-customizacao-e-preview.md`.

- 09 §5: as categorias de preset, com a contagem saindo do registro, nunca transcrita.
- 06 §6.4: onde cada categoria mora.

---

# 9. Resumo da execução

---

# 10. Veredito
