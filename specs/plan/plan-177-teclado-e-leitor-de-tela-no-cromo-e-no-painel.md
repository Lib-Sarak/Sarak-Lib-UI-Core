---
tipo: "plan"
titulo: "Teclado e leitor de tela no cromo e no painel"
objetivo: "Fazer todo controle do cromo e do painel ter foco visível em ao menos 3:1 e nome acessível, tirar do Tab o que não age, dar à gaveta móvel semântica e foco de diálogo, fazer o idioma fechar com Esc e a barra do topo mostrar os itens que cabem sem transbordar"
dominio: "Cromo / Painel de customização / Acessibilidade"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "rc2", "acessibilidade", "teclado", "foco", "cromo", "painel"]
relacionados: ["[[10-seguranca-e-acessibilidade]]", "[[05-cromo-e-slots]]", "[[06-painel-de-customizacao-e-preview]]", "[[07-responsividade-e-multidispositivo]]"]
depende_de: ""
retida_por: ""
destino_sintese: "10-seguranca-e-acessibilidade"
---

# 1. Objetivo

Um usuário que só usa o teclado consegue:
- ver onde está o foco, em todo controle do cromo e do painel;
- ouvir o nome de cada controle no leitor de tela;
- escolher um tema sem passar por controles das miniaturas;
- usar a gaveta móvel como um diálogo.

Além disso, a barra do topo mostra os itens que cabem, sem transbordar.

# 2. Contexto

Defeitos medidos pela validação da 9.0.0-rc.1 (plan-173, lote 4, e plan-172), em navegador real.

**Foco e nomes**

| Id | Defeito |
|---|---|
| D17 | **Foco sem indicador ou abaixo de 3:1.** Medido por pixel, foco ligado × desligado. No painel, de 1.928 paradas de `Tab`, 400 não mudam nada na tela e 951 mudam abaixo de 3:1: cartões de opção de tema, forma, componentes e barras ficam em 1,26 a 1,34:1. No cromo: "Recolher navegação" não muda; Pedidos, Idioma, Preferências, Sair e "Ordenar por…" só trocam o fundo (1,7 a 1,8:1); os `switch` não mostram nada. Links do menu (16,5:1) e campos (6,1:1) passam. **Causa parcial já lida:** o anel global de `src/styles/_elements.css` vale só para `button:focus-visible`, a cor dele não tem contraste garantido, e utilitários `focus:outline-none` o removem sem trocar por outro (por exemplo, `src/features/DesignEngine/components/controls/HelpTooltip.tsx:14`) |
| D18 | **Miniaturas do painel focáveis.** Na decisão Tema, 109 das 221 primeiras paradas caem em links, campos e botões de dentro das miniaturas dos cartões (cerca de 9 por cartão). O ciclo não fecha em 221 paradas e o 1º cartão só aparece na parada 38. Em Barras, 80 de 245 |
| D19 | **114 de 1.407 controles do painel sem nome:** 70 botões "?" (`HelpTooltip`, sem `aria-label`), cerca de 16 deslizantes com rótulo visual não associado (Intensidade da Sombra, Tamanho do H1, Arredondamento do Botão, Raio da Borda do Card, Largura da Sidebar, Altura do Logo, Opacidade da atmosfera e da textura…), o campo do nome da paleta e controles das miniaturas. Cromo: 0 sem nome |

**Camadas e menus**

| Id | Defeito |
|---|---|
| D20 | O seletor de idioma não fecha com Esc, nem na lateral nem no topo. No topo, o botão não expõe `aria-expanded` nem `aria-haspopup` |
| D21 | **A gaveta móvel** (`SarakAppChromeMobile`, `#sarak-chrome-drawer`): o `Tab` fica preso no último item ("Idioma"), sem circular. Não há `role="dialog"`, `aria-modal` nem `aria-label`, o foco não entra ao abrir e o fundo não fica inerte. O Esc já fecha e devolve o foco |
| D12 | Na barra do topo, o grupo e o "Mais" não levam `aria-current` quando a rota ativa é de um filho |

**Barra do topo e painel**

| Id | Defeito |
|---|---|
| D14 | A 820 px, a barra do topo mostra **zero itens** em 11 temas, tudo no "Mais", com espaço sobrando |
| N11 | `nav.scrollWidth` 977 contra `clientWidth` 920, a 1440 px com os 8 itens visíveis. O invólucro oculto do "Mais" soma 57 px |
| B82 | Na decisão Layout do painel, os rótulos dos cartões de opção ("LIMPA", "CONTORNADA") saem brancos sobre o cartão claro e não se leem. Visto na prévia do lote 2 da `plan-158`, antes e depois daquele lote. Antes estava no backlog |
| D6 | O texto "Passe o mouse numa opção…" (`previewHint`, `PreviewToolbar.tsx`) fica com 4 a 284 px de largura, conforme o tema. Fica abaixo de 60 px em 12 dos 25 temas e também no padrão (10 px), uma palavra por linha |

# 3. Escopo

## 3.1 Dentro
- `src/styles/_elements.css`: anel de foco para todo elemento focável (não só `button`), com contraste de 3:1 contra o fundo onde
  pousa.
- Os componentes do cromo e do painel que removem o contorno sem trocar por outro (`focus:outline-none` e similares), começando pelo
  `HelpTooltip`.
- `src/features/DesignEngine/Canvas/`: as miniaturas de prévia dentro dos cartões de opção ficam fora do `Tab` e da árvore de
  acessibilidade, com `inert` no contêiner da miniatura. A prévia grande do painel não muda.
- `HelpTooltip` (nome traduzido, por exemplo "Ajuda: <rótulo>", nos seis idiomas), os deslizantes do painel (rótulo associado) e o
  campo do nome da paleta.
- `src/components/atomic/Navigation/SarakShellLanguageSelector.tsx` e os usos em `ChromeSidebarFooter.tsx` e `ChromeTopbarBody.tsx`.
- `src/components/Layout/SarakAppChromeMobile.tsx` e `src/components/Layout/chrome/ChromeMobileDrawer.tsx`: semântica de diálogo e
  foco preso com o `useFocusTrap` que já existe (`src/components/atomic/Modals/hooks/useFocusTrap.ts`).
- `src/components/atomic/Navigation/SarakShellNav.tsx`, `internal/ShellNavGroup.tsx`, `internal/ShellNavMore.tsx` e
  `internal/useHorizontalOverflow.ts`: D12, D14 e N11.
- `src/features/DesignEngine/Canvas/components/PreviewToolbar.tsx`: D6.
- Os cartões de opção do painel (`src/features/DesignEngine/Canvas/components/`): a cor do rótulo (B82).
- `src/core/i18n/`: os textos novos, nos seis idiomas.
- Testes de unidade dos componentes tocados e uma spec de navegador nova, `browser-tests/teclado-no-cromo-e-no-painel.spec.ts`.
- `browser-tests/barra-de-topo-estreita.spec.ts`: estender para D14 e N11.

## 3.2 Fora
- Cores de tema e contraste de texto. São da `plan-176`, que pode correr em paralelo. Esta plan não toca
  `src/core/Design/presets/themes/`.
- Provider, persistência e presets. São da `plan-178`.
- O "Mais" sobreposto que só acontece no hub: a causa não foi isolada na lib e o caso fica com o hub.
- Leitor de tela real: a medida é a árvore de acessibilidade.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contexto | `specs/00-contexto.md` | sempre |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` §a (foco e overlay) e §c (anel de foco) | a regra de overlay e o anel atual |
| Spec fixa | `specs/specs/05-cromo-e-slots.md` | gaveta, "Mais" e widgets do cromo |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` | decisões, cartões e prévia |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` | barra do topo em larguras médias |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `test-unitario` · `test-e2e` | testes de componente e spec de navegador |
| Código | `src/components/atomic/Modals/hooks/useFocusTrap.ts` | o foco preso que a gaveta deve reusar |
| Código | `browser-tests/barra-de-topo-estreita.spec.ts` | molde da medição do topo |

# 5. Instruções de execução

## Lote 1 — foco, nomes e miniaturas (D17, D18, D19)

1. **Medição primeiro.** Crie `browser-tests/teclado-no-cromo-e-no-painel.spec.ts`:
   - **percurso:** cromo a 1440 px e a 390 px, e as 8 decisões do painel a 1440 px, só com `Tab`;
   - **anel:** para cada parada, compare a captura da caixa do elemento (com folga de 4 px) com foco e sem foco. Reprove se nada mudar
     ou se a mudança ficar abaixo de 3:1 contra o pixel sem foco;
   - **nome:** reprove controle sem nome na árvore de acessibilidade;
   - **ciclo:** na decisão Tema, o ciclo de `Tab` fecha e o 1º cartão de tema chega em no máximo 5 paradas depois do título da
     decisão.

   Rode e registre as reprovações; devem reproduzir D17, D18 e D19.
2. **Corrija:**
   - anel global para todo focável;
   - fim dos `outline-none` sem substituto;
   - `inert` nas miniaturas;
   - nomes do `HelpTooltip`, dos deslizantes e do campo de paleta.
3. A spec do passo 1 passa **sem lista de exceções**.

## Lote 2 — camadas e menus (D20, D21, D12)

1. **Seletor de idioma:** o Esc fecha e devolve o foco ao botão. O botão do topo expõe `aria-haspopup` e `aria-expanded`.
2. **Gaveta móvel:**
   - `role="dialog"`, `aria-modal="true"` e nome;
   - ao abrir, o foco entra no 1º item;
   - o `Tab` circula dentro da gaveta, pelo `useFocusTrap`;
   - o fundo fica `inert`;
   - o Esc continua fechando e devolvendo o foco.
3. **Barra do topo:** o grupo e o "Mais" levam `aria-current` quando a rota ativa é de um filho deles.
4. Testes de unidade para os três, com o caso que falha antes da correção.

## Lote 3 — topo e texto de ajuda (D14, N11, D6)

1. **D14:** a 820 px, a barra do topo mostra os itens que cabem antes de mandar o resto ao "Mais". Estenda
   `barra-de-topo-estreita.spec.ts` para os 25 temas a 820 px: reprove quando o "Mais" estiver visível com espaço para o item seguinte.
2. **N11:** o invólucro oculto do "Mais" não soma largura. `nav.scrollWidth` fica igual a `clientWidth`, a 1440 e a 820 px.
3. **D6:** o texto de ajuda fica com ao menos 160 px de largura a 1440 px nos 25 temas. Se não couber ao lado, vai para a linha de
   baixo. Meça na spec do lote 1.
4. **B82:** os rótulos dos cartões de opção do painel ficam em ao menos 4,5:1 contra o fundo do próprio cartão, nos 25 temas e nos dois
   modos. Meça na spec do lote 1, em todas as decisões, não só em Layout.

## Verificação do executor (uma vez, no fim)

- `npx vitest run` com filtro nos testes dos arquivos tocados e nos dos componentes que os usam (procure por import);
- `npm run verify -- --tier=quick`;
- `npm run build`, depois as specs da plan sozinhas:
  `npx playwright test --config=browser-tests/playwright.config.ts teclado-no-cromo-e-no-painel barra-de-topo-estreita`.

**Não** rode a suíte completa nem a bateria `cromo-css-real:check` inteira. As duas rodam uma vez, no fechamento da campanha da rc.2.

# 6. Critérios de aceite

- [ ] A spec `teclado-no-cromo-e-no-painel` passa sem exceções: anel de ao menos 3:1 em toda parada, 0 controles sem nome, e o
      ciclo de Tema fecha com o 1º cartão em no máximo 5 paradas.
- [ ] Idioma, gaveta e `aria-current` têm teste de unidade que falhava antes, e passam.
- [ ] `barra-de-topo-estreita` cobre os 25 temas a 820 px e o `nav.scrollWidth`, e passa.
- [ ] Os rótulos dos cartões de opção do painel ficam em ao menos 4,5:1 nos 25 temas e nos dois modos (B82).
- [ ] Os textos novos existem nos seis idiomas.
- [ ] Os comandos da verificação do executor passam, e o resumo traz a saída final de cada um.
- [ ] `git diff --stat` mostra só caminhos da §3.1.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo. O invariante vira a spec de navegador `teclado-no-cromo-e-no-painel`, que entra na bateria do
`cromo-css-real:check`.

O revisor **não repete** os comandos do executor. Ele confere:
- `git diff --stat` contra a §3.1.
- **Mutação, em cópia fora do repositório:**
  - volte um `focus:outline-none` sem substituto → a spec de teclado reprova;
  - retire o `inert` das miniaturas → o critério do ciclo de Tema reprova;
  - retire o `useFocusTrap` da gaveta → o teste de unidade da gaveta reprova.
- Leitura dos textos novos nos seis idiomas, por amostra.

# 8. Destino da síntese

**Destino:** `10-seguranca-e-acessibilidade`. Texto para transporte:

- **Em §c (anel de foco), substituindo o escopo "botão e link":**

  > O anel vale para todo elemento focável do cromo e do painel e fica em ao menos 3:1 contra o fundo onde pousa. Nenhum componente
  > remove o contorno sem pôr outro. Miniaturas de prévia dentro de cartões são `inert`. Guarda `teclado-no-cromo-e-no-painel`.

- **Em §a (overlay), acrescentar a gaveta móvel do cromo à lista de camadas que prendem o foco:**

  > A gaveta tem `role="dialog"` e `aria-modal`, prende o `Tab`, torna o fundo inerte, fecha no Esc e devolve o foco.

---

# 9. Resumo da execução

---

# 10. Veredito
