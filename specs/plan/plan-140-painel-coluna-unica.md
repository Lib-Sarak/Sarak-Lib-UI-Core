---
tipo: "plan"
titulo: "Unificar o painel numa coluna de seis decisões com a prévia sempre visível"
objetivo: "Fazer o painel ter uma coluna só com seis decisões, opções visuais e ajuste fino em níveis no lugar dos três modos e da galeria sobre a prévia, com um atalho que monta o tema a partir de nome, logo, cor e fonte, sem perder acesso a nenhum token"
dominio: "Painel de customização"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "painel", "ux", "navegacao"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[08-identidade-do-host-e-zero-marca]]", "[[plan-139-painel-previas-reais]]", "[[plan-141-enriquecer-presets-do-painel]]", "[[anexos/painel-design-prototipo]]"]
depende_de: "plan-139-painel-previas-reais"
retida_por: ""
destino_sintese: "specs/specs/06-painel-de-customizacao-e-preview.md + specs/specs/08-identidade-do-host-e-zero-marca.md"
---

# 1. Objetivo

Personalizar vira um caminho só: seis decisões na coluna, opções visuais dentro de cada uma, ajuste fino recolhido, prévia sempre visível.
Todo token segue acessível.

# 2. Contexto

Terceira de quatro plans. **O alvo é `specs/plan/anexos/painel-design-prototipo.html`:** o dono o aprovou em 2026-10-31. A tela de amostra e
as cores dele são ilustrativas; a navegação, a hierarquia e o rodapé são o contrato.

Hoje, medido no catálogo: 435 tokens; Impacto mostra 24 (`visualImpact`), Essencial 162 (`importance >= 80`), Completo todos. Há 7 pilares na
lateral e 6 abas na galeria, e a galeria abre sobre a prévia. Os modos dividem por quantidade, não por intenção.

**Decisões do dono:** coluna única; fim do seletor Impacto, Essencial e Completo; atalho "Usar minha marca", com a cor informada pelo usuário
(sem extrair do logo); as seis decisões do protótipo.

**Os três modos viram profundidade, com os dados de hoje:**

| Nível | Conteúdo | Dado |
|---|---|---|
| 1. Decisões | 6 linhas com o valor atual | `design-pillars.json` |
| 2. Opções | grupos visuais da plan-139 + tokens com `visualImpact` | presets e `visualImpact` |
| 3. Ajuste fino | recolhido: primeiro `importance >= 80`, depois "Mostrar todos" | catálogo |

**Mapa das decisões:**

| Decisão | Pilares | Grupos de opção | Tela canônica (§6.6) |
|---|---|---|---|
| Tema | — | temas | `dashboard` |
| Cores | `brand` | paletas, criar de uma cor | `dashboard` |
| Fontes | `typography` | pares de fontes | `typography` |
| Forma | `surfaces` | cards, atmosfera | `dashboard` |
| Componentes | `interaction`, `systems` | botões, campos | `caixas-texto` |
| Layout | `navigation` | composição da barra, bloco global | `dashboard` |

O pilar `advanced` fica no menu **Avançado**, junto da tabela de tokens. A folksonomia continua: token novo entra sozinho no nível 3
([[06-painel-de-customizacao-e-preview]] §2).

**A marca já tem porta:** `SarakBrandingState` (`companyName`, `logoBase64`), escrita pelo `useDesignDraft`. Sem porta nova, e a lib continua
sem impor identidade ([[08-identidade-do-host-e-zero-marca]]).

# 3. Escopo

## 3.1 Dentro
- `src/features/DesignEngine/Main/` — `ThemeCustomizationTab`, `ThemeSidebarContent`, `ThemeSidebarHeader`, `ThemeImpactList`,
  `ThemePillarsList`, `ThemeGlobalSettings`, `ThemeAdvancedMenu`, `hooks/usePreviewUIState.ts`, `hooks/useThemeCustomizationData.ts`, e os
  componentes novos das decisões e do atalho de marca, com testes.
- `src/features/DesignEngine/Canvas/` — `PresetsCatalog`, `PreviewCanvasLayout` e `PreviewToolbar`: a galeria sai de cima da prévia; modo e
  dispositivo ficam na barra da prévia.
- `src/features/DesignEngine/config/` e `utils/dynamic-categories.ts` — o mapa de decisões.
- `src/core/i18n/` — textos novos, nos seis idiomas.
- `browser-tests/` que abrem a galeria ou escolhem modo.
- `docs/migracoes.md` — subseção na seção da próxima versão: o painel mudou de navegação.
- Snapshots.

## 3.2 Fora
- Tokens, schema e catálogo: nenhum token muda.
- `PaletteCreator` por dentro, os cartões da plan-139, o Command Center e a tabela de tokens: mudam de lugar, não de conteúdo.
- Extrair cor do logo. Presets novos (plan-141).
- `SarakCustomizationPanel` como peça pública: continua o mesmo nome e as mesmas props.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Anexo | `specs/plan/anexos/painel-design-prototipo.html` | a navegação inteira |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` inteira | o que muda (§2.1, §2.3, §6.4, §6.6) e o que fica |
| Spec fixa | `specs/specs/08-identidade-do-host-e-zero-marca.md` §6 | branding |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` §6.1 | contêiner, nunca janela |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | teclado, foco, textos |
| Código | `gates/scripts/contrato/check-panel-contract.ts` | o que o gate do painel exige |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | sempre · CSS por token |

# 5. Instruções de execução

1. Fotografe o worktree. Liste, no resumo, cada ação do painel de hoje e onde ela fica depois.
2. **Teste de cobertura primeiro:** todo token que o modo Completo mostra hoje é alcançável numa decisão ou no Avançado. Ele tem de seguir verde
   até o fim.
3. **Coluna.** Cabeçalho (título, Avançado, busca), lista de decisões, rodapé da plan-138. Ao abrir uma decisão, a tela troca na mesma coluna,
   com voltar; Esc volta; o foco vai ao título ao entrar e à linha ao voltar. Cada linha mostra o valor atual e uma marca de alterada.
4. **Níveis.** Nível 2 com os grupos da plan-139. Nível 3 recolhido, com a contagem real, primeiro `importance >= 80` e depois "Mostrar todos".
5. **Fim dos modos.** Remova o seletor e `editMode`. A busca segue atravessando tudo e leva ao token, abrindo a decisão e o ajuste fino.
6. **Prévia sempre visível.** A galeria deixa de abrir sobre a prévia. Claro/Escuro, dispositivo e tela ficam na barra da prévia. Abrir uma decisão
   leva à tela canônica (§6.6: um gesto, sem laço).
7. **Usar minha marca.** Primeira entrada da coluna: nome, logo, cor principal e par de fontes, com a prévia reagindo. "Gerar" aplica ao rascunho
   `colorPalette` com `custom:analogous:<cor>`, as fontes e o branding. Logo com a validação de arquivo que o painel já usa. Nada é gravado até
   "Aplicar".
8. **Espaço estreito.** Em contêiner estreito, a coluna e a prévia empilham, por container query, com a prévia alcançável. Meça também no modo
   embarcado.
9. **Prévia para o dono:** `C:\tmp\sarak-previa-140\index.html`, com capturas de cada decisão, do atalho e do estreito, nos dois modos.
10. `docs/migracoes.md`. Depois, `npm run build` e `npm run cromo-css-real:check` inteiro, uma vez, com a linha final no resumo. Depois:
    `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`.
11. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] Teste de cobertura verde: nenhum token perdido.
- [ ] A prévia nunca fica coberta enquanto se escolhe uma opção — navegador.
- [ ] Nenhuma ação do painel de antes sumiu (lista do passo 1 conferida).
- [ ] Navegação só por teclado, do início ao "Aplicar", com foco correto ao entrar e voltar — teste.
- [ ] Busca abre a decisão certa com o token visível — teste.
- [ ] Marca: do formulário vazio à prévia com nome, logo, cor e fonte, nada gravado até "Aplicar" — teste.
- [ ] `panel-contract:check` verde, sem afrouxar.
- [ ] `npm run cromo-css-real:check` verde inteiro.
- [ ] Prévia gerada; a aprovação do dono é registrada pelo revisor no veredito.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo. O teste de cobertura do passo 2 fica na suíte.

- `npx vitest run src/features/DesignEngine src/core/Provider src/core/i18n gates/scripts` — uma vez.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` — uma vez.
- Mutação: esconder um token do mapa de decisões faz o teste de cobertura falhar.
- A prévia aberta e o painel real comparados ao protótipo; o veredito só fecha com a aprovação do dono.
- A bateria de navegador não se repete no revisor; o job `cromo-css-real` da CI a mede no push.

# 8. Destino da síntese

**Destino:** `specs/specs/06-painel-de-customizacao-e-preview.md` + `specs/specs/08-identidade-do-host-e-zero-marca.md`.

- 06 §2.1 passa a descrever os três níveis no lugar dos modos, e §2.3 e §6.6, a coluna e as decisões.
- 08 §6: o atalho de marca usa a mesma porta de branding, e a identidade continua nascendo ausente.

---

# 9. Resumo da execução

---

# 10. Veredito
