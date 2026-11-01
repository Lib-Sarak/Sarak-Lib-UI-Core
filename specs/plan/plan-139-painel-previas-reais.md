---
tipo: "plan"
titulo: "Desenhar toda opção do painel com o componente real e mostrar o efeito antes de escolher"
objetivo: "Fazer cada opção da galeria do painel aparecer com o componente real e o rascunho atual, com miniaturas de tema legíveis nos dois modos e prévia do efeito na tela grande ao passar o mouse ou focar uma opção, sem gravar nada"
dominio: "Painel de customização"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "painel", "ux", "previa"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[plan-138-painel-ganhos-rapidos-fontes-paletas-e-acoes]]", "[[plan-140-painel-coluna-unica]]", "[[anexos/painel-design-prototipo]]"]
depende_de: "plan-144-custo-restante-da-tela"
retida_por: ""
destino_sintese: "specs/specs/06-painel-de-customizacao-e-preview.md"
---

# 1. Objetivo

Toda opção mostra o que será aplicado, com o componente real. Passar o mouse ou focar uma opção mostra o efeito na prévia grande, sem
gravar.

# 2. Contexto

Segunda de quatro plans do redesenho (referência visual: `specs/plan/anexos/painel-design-prototipo.html`). Hoje os catálogos ficam em
`Canvas/components/` (`PresetCard`, `CardsCatalog`, `ButtonsCatalog`, `InputsCatalog`, `AtmosphereCatalog`, `TypographyCatalog`). A
miniatura de tema usa barras cinza, um cartão dentro de outro, e o nome cobre a imagem; quase todos parecem iguais. Os presets de cartão
mostram barras no lugar de conteúdo.

**Regra desta plan:** a opção é desenhada com o componente real, com a opção aplicada por cima do rascunho, dentro de um `DesignScope`
([[06-painel-de-customizacao-e-preview]] §6.1). Nada de barra cinza.

**Orçamento:** componentes reais pesam mais que barras cinza. O spec de orçamento de recálculo (`browser-tests/troca-de-tema.spec.ts`) segue verde sem subir o teto, e
cada miniatura leva só as variáveis que usa. A espiada só funciona se compor um tema for quase instantâneo.

**Só começa com a `plan-144` aprovada.**

**Prepare para a plan-140:** cada grupo de opções sai como componente que não sabe onde está. A 140 os muda da galeria para a coluna sem
reescrevê-los.

# 3. Escopo

## 3.1 Dentro
- `src/features/DesignEngine/Canvas/components/` — os catálogos, os cartões e a miniatura de tema, com testes.
- `src/features/DesignEngine/Canvas/` e `Main/hooks/` — o estado de espiada e seu efeito em `PreviewCanvas`.
- `src/core/i18n/` — textos de amostra, por acréscimo, nos seis idiomas.
- Snapshots alterados por estas mudanças.

## 3.2 Fora
- A coluna única e o fim dos modos (plan-140).
- Presets novos e categorias novas (plan-141).
- `src/core/Design/presets/`: os dados dos presets não mudam aqui.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Anexo | `specs/plan/anexos/painel-design-prototipo.html` | telas Tema, Forma e Componentes; a espiada ao passar o mouse |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` §4, §4.1, §6.1, §6.2.1, §6.4 | rascunho, desempenho do rascunho, barreira de CSS, contêiner |
| Spec fixa | `specs/specs/09-temas-e-presets.md` §4.3.2 | o tema carrega sob demanda |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` §6.1 | contêiner, nunca janela |
| Código | `src/features/DesignEngine/Canvas/components/useCatalogThemes.ts` · `PresetCardPending.tsx` | a miniatura de tema que ainda não chegou |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | sempre · CSS por token |

# 5. Instruções de execução

1. Fotografe o worktree. Capture o antes das seis abas.
2. **Miniatura de tema.** Mini tela real dividida em duas metades, claro e escuro, com título, cartão, gráfico e botão. Nome fora da imagem.
   Sem cartão dentro de cartão. Tema pendente mantém o estado de carregamento atual.
3. **Cartões:** título, valor e botão reais. **Botões:** repouso, hover, foco e inativo lado a lado, com a classe e o estado reais, sem simular
   por cor escrita. **Campos:** repouso e foco. **Atmosfera:** um cartão por cima do fundo, porque é assim que ela se usa.
4. **Sem tema escuro fixo:** a amostra segue o modo do rascunho.
5. **Espiada.** Com o mouse sobre uma opção ou o foco nela, a prévia grande compõe a opção por cima do rascunho, sem chamar `updateDraft`.
   Ao sair, volta. O texto da barra da prévia diz que é só uma prévia. Na troca de tema, o tema precisa estar carregado; enquanto não chega,
   a prévia não muda. **Sem espiada em toque:** nele, o toque já escolhe. Espera curta antes de compor, para não piscar ao atravessar a lista
   (valor em constante nomeada, com teste).
6. **Desempenho.** Lista longa desenha só o que está visível. Meça antes e depois o tempo de abrir a aba Temas, e cole no resumo.
7. **Prévia para o dono:** `C:\tmp\sarak-previa-139\index.html`, com antes e depois de cada aba, nos dois modos.
8. Rode `plan-135-paletas-no-painel`, `plan-122-preview-mode`, `painel-segue-o-modo` e `cromo-css-real` pelo Playwright, depois de
   `npm run build`. Depois: `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`.
9. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] Nenhum catálogo desenha barra cinza no lugar de conteúdo; todo cartão usa o átomo real — teste por catálogo.
- [ ] Trocar o modo do rascunho muda as amostras — teste.
- [ ] Espiar não altera o rascunho, não conta como mudança e reverte ao sair; funciona por teclado — teste.
- [ ] Sem espiada em dispositivo de toque — teste.
- [ ] Os grupos de opções não dependem do contêiner da galeria (importáveis sozinhos) — teste.
- [ ] Prévia gerada; a aprovação do dono é registrada pelo revisor no veredito.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo.

- `npx vitest run src/features/DesignEngine src/core/Design` — uma vez.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` — uma vez.
- A prévia aberta; o caminho vai ao dono; o veredito só fecha com a aprovação dele.
- Sondagem no navegador: espiar um tema escuro sobre rascunho claro, sair e conferir o rascunho igual.

# 8. Destino da síntese

**Destino:** `specs/specs/06-painel-de-customizacao-e-preview.md` — §6.4: a opção é desenhada com o componente real sobre o rascunho; a
espiada compõe sem gravar e não existe em toque.

---

# 9. Resumo da execução

---

# 10. Veredito
